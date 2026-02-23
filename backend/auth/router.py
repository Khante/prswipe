from fastapi import APIRouter, Request, Response, HTTPException
from starlette.responses import RedirectResponse
from itsdangerous import URLSafeTimedSerializer

from config import settings
from auth.session import session_manager, require_auth
from auth.github_oauth import github_oauth
from github.client import GitHubClient

router = APIRouter(prefix="/auth", tags=["auth"])

oauth_state_serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
OAUTH_STATE_COOKIE = "pr_swipe_oauth_state"
OAUTH_STATE_MAX_AGE = 10 * 60  # 10 minutes


@router.get("/login")
async def login(response: Response):
    state = github_oauth.generate_state()
    auth_url = github_oauth.get_authorization_url(state)
    print(f"[LOGIN] Setting cookie with state: {state}")
    print(f"[LOGIN] Auth URL: {auth_url}")
    response.set_cookie(
        key=OAUTH_STATE_COOKIE,
        value=state,
        max_age=OAUTH_STATE_MAX_AGE,
        httponly=False,
        samesite="lax",
        secure=False,
        path="/",
    )
    return RedirectResponse(url=auth_url, status_code=302)


@router.get("/callback")
async def callback(code: str, state: str, request: Request, response: Response):
    print(f"[CALLBACK] Received state: {state}")
    print(f"[CALLBACK] Cookies: {request.cookies}")

    token = await github_oauth.exchange_code_for_token(code)
    if not token:
        raise HTTPException(status_code=400, detail="Failed to exchange code for token")

    github_client = GitHubClient(token)
    user_info = await github_client.get_authenticated_user()

    session_data = {
        "github_token": token,
        "user": {
            "login": user_info.get("login"),
            "name": user_info.get("name"),
            "avatar_url": user_info.get("avatar_url"),
            "html_url": user_info.get("html_url"),
        },
    }

    from itsdangerous import URLSafeTimedSerializer

    session_token = URLSafeTimedSerializer(settings.SECRET_KEY).dumps(session_data)

    return RedirectResponse(
        url=f"{settings.FRONTEND_URL}/auth?token={session_token}", status_code=302
    )


@router.get("/me")
async def get_me(request: Request):
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:]
        from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

        try:
            session_data = URLSafeTimedSerializer(settings.SECRET_KEY).loads(
                token, max_age=7 * 24 * 60 * 60
            )
            return session_data.get("user")
        except (BadSignature, SignatureExpired):
            pass

    session = require_auth(request)
    return session.get("user")


@router.post("/logout")
async def logout(response: Response):
    session_manager.clear_session(response)
    return {"success": True}
