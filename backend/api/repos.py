from typing import List
from datetime import datetime

from fastapi import APIRouter, Query, Request, Depends

from auth.session import require_auth
from github.client import GitHubClient
from models.schemas import RepoResponse, RepoPermissions
from config import settings

router = APIRouter(prefix="/api/repos", tags=["repos"])


def get_github_client(request: Request) -> GitHubClient:
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:]
        from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

        try:
            session_data = URLSafeTimedSerializer(settings.SECRET_KEY).loads(
                token, max_age=7 * 24 * 60 * 60
            )
            return GitHubClient(session_data["github_token"])
        except (BadSignature, SignatureExpired):
            pass

    session = require_auth(request)
    return GitHubClient(session["github_token"])


@router.get("", response_model=List[RepoResponse])
async def list_repos(
    request: Request,
    page: int = Query(1, ge=1),
    per_page: int = Query(30, ge=1, le=100),
    sort: str = Query("full_name", pattern="^(full_name|created|updated|pushed)$"),
    affiliation: str = Query("owner,collaborator,organization_member"),
    client: GitHubClient = Depends(get_github_client),
):
    repos_data = await client.list_repos(
        page=page,
        per_page=per_page,
        sort=sort,
        affiliation=affiliation,
    )

    repos = []
    for repo in repos_data:
        permissions = repo.get("permissions", {})
        if not permissions.get("push", False) and not permissions.get("admin", False):
            continue

        open_prs_count = 0
        try:
            open_prs_count = await client.get_open_prs_count(
                repo["owner"]["login"],
                repo["name"],
            )
        except Exception:
            pass

        repos.append(
            RepoResponse(
                id=repo["id"],
                full_name=repo["full_name"],
                name=repo["name"],
                owner_login=repo["owner"]["login"],
                owner_avatar_url=repo["owner"]["avatar_url"],
                description=repo.get("description"),
                private=repo.get("private", False),
                open_issues_count=repo.get("open_issues_count", 0),
                open_prs_count=open_prs_count,
                language=repo.get("language"),
                stargazers_count=repo.get("stargazers_count", 0),
                updated_at=datetime.fromisoformat(
                    repo["updated_at"].replace("Z", "+00:00")
                ),
                html_url=repo["html_url"],
                permissions=RepoPermissions(
                    admin=permissions.get("admin", False),
                    push=permissions.get("push", False),
                    pull=permissions.get("pull", False),
                ),
            )
        )

    return repos


@router.get("/search", response_model=List[RepoResponse])
async def search_repos(
    request: Request,
    q: str = Query(..., min_length=1),
    client: GitHubClient = Depends(get_github_client),
):
    repos_data = await client.search_repos(q)

    repos = []
    for repo in repos_data:
        permissions = repo.get("permissions", {})
        if not permissions.get("push", False) and not permissions.get("admin", False):
            continue

        open_prs_count = 0
        try:
            open_prs_count = await client.get_open_prs_count(
                repo["owner"]["login"],
                repo["name"],
            )
        except Exception:
            pass

        repos.append(
            RepoResponse(
                id=repo["id"],
                full_name=repo["full_name"],
                name=repo["name"],
                owner_login=repo["owner"]["login"],
                owner_avatar_url=repo["owner"]["avatar_url"],
                description=repo.get("description"),
                private=repo.get("private", False),
                open_issues_count=repo.get("open_issues_count", 0),
                open_prs_count=open_prs_count,
                language=repo.get("language"),
                stargazers_count=repo.get("stargazers_count", 0),
                updated_at=datetime.fromisoformat(
                    repo["updated_at"].replace("Z", "+00:00")
                ),
                html_url=repo["html_url"],
                permissions=RepoPermissions(
                    admin=permissions.get("admin", False),
                    push=permissions.get("push", False),
                    pull=permissions.get("pull", False),
                ),
            )
        )

    return repos
