from typing import Optional

from fastapi import Request, Response
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

from config import settings


class SessionManager:
    def __init__(self):
        self.serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
        self.cookie_name = "pr_swipe_session"
        self.max_age = 7 * 24 * 60 * 60  # 7 days

    def create_session(self, response: Response, data: dict) -> None:
        token = self.serializer.dumps(data)
        print(f"[SESSION] Creating session with token: {token[:50]}...")
        response.set_cookie(
            key=self.cookie_name,
            value=token,
            max_age=self.max_age,
            httponly=False,
            samesite=None,  # Allow cookies in cross-origin
            secure=False,
            path="/",
        )
        print(f"[SESSION] Cookie set: {self.cookie_name}")

    def get_session(self, request: Request) -> Optional[dict]:
        token = request.cookies.get(self.cookie_name)
        if not token:
            return None
        try:
            data = self.serializer.loads(token, max_age=self.max_age)
            return data
        except (BadSignature, SignatureExpired):
            return None

    def clear_session(self, response: Response) -> None:
        response.delete_cookie(
            key=self.cookie_name,
            path="/",
            samesite="lax",
            secure=False,
        )


session_manager = SessionManager()


def get_current_user(request: Request) -> dict:
    session_data = session_manager.get_session(request)
    if not session_data or "github_token" not in session_data:
        raise Exception("Not authenticated")
    return session_data


def require_auth(request: Request) -> dict:
    session_data = session_manager.get_session(request)
    if not session_data or "github_token" not in session_data:
        from fastapi import HTTPException

        raise HTTPException(status_code=401, detail="Not authenticated")
    return session_data
