import random
from typing import List
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query, Request, Depends

from auth.session import require_auth
from github.client import GitHubClient
from models.schemas import (
    PRResponse,
    PRAuthor,
    PRStats,
    MergeRequest,
    CloseRequest,
    MergeResponse,
    CloseResponse,
)
from models.bio import generate_pr_bio, compute_compatibility_score
from config import settings

router = APIRouter(prefix="/api/prs", tags=["prs"])


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


@router.get("", response_model=List[PRResponse])
async def list_prs(
    request: Request,
    repo: str = Query(..., description="Repository in format owner/repo"),
    client: GitHubClient = Depends(get_github_client),
):
    if "/" not in repo:
        raise HTTPException(
            status_code=400, detail="Invalid repo format. Use owner/repo"
        )

    owner, repo_name = repo.split("/", 1)

    try:
        repo_data = await client.get_repo(owner, repo_name)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Repository not found: {str(e)}")

    permissions = repo_data.get("permissions", {})
    if not permissions.get("push", False) and not permissions.get("admin", False):
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to merge PRs in this repository.",
        )

    prs_data = await client.list_open_prs_with_details(owner, repo_name)

    if not prs_data:
        return []

    author_logins = list(
        set(pr.get("user", {}).get("login", "") for pr in prs_data if pr.get("user"))
    )
    author_details = {}
    for login in author_logins:
        try:
            user_data = await client.get_user(login)
            author_details[login] = user_data
        except Exception:
            author_details[login] = {
                "login": login,
                "avatar_url": "",
                "html_url": "",
                "name": None,
                "bio": None,
                "public_repos": 0,
                "followers": 0,
            }

    prs = []
    for pr in prs_data:
        author_login = pr.get("user", {}).get("login", "")
        author_info = author_details.get(author_login, {})

        files_data = await client.get_pull_request_files(owner, repo_name, pr["number"])
        additions = sum(f.get("additions", 0) for f in files_data)
        deletions = sum(f.get("deletions", 0) for f in files_data)
        changed_files = len(files_data)

        commits_data = await client.get_pull_request_commits(
            owner, repo_name, pr["number"]
        )
        commits = len(commits_data)

        reviews_data = await client.get_pull_request_reviews(
            owner, repo_name, pr["number"]
        )
        review_comments = len(reviews_data)

        comments_data = await client.get_pull_request_comments(
            owner, repo_name, pr["number"]
        )
        comments = len(comments_data) if isinstance(comments_data, list) else 0

        requested_reviewers = [
            r.get("login", "") for r in pr.get("requested_reviewers", [])
        ]
        labels = [l.get("name", "").lower() for l in pr.get("labels", [])]

        created_at = datetime.fromisoformat(pr["created_at"].replace("Z", "+00:00"))
        updated_at = datetime.fromisoformat(pr["updated_at"].replace("Z", "+00:00"))
        age_days = (datetime.now(timezone.utc) - created_at).days

        generated_bio = generate_pr_bio(
            additions=additions,
            deletions=deletions,
            changed_files=changed_files,
            commits=commits,
            age_days=age_days,
            draft=pr.get("draft", False),
            labels=labels,
            requested_reviewers=requested_reviewers,
        )

        compatibility_score = compute_compatibility_score(
            mergeable=pr.get("mergeable", False),
            age_days=age_days,
            draft=pr.get("draft", False),
            commits=commits,
            changed_files=changed_files,
            comments=comments + review_comments,
        )

        prs.append(
            PRResponse(
                number=pr["number"],
                title=pr["title"],
                body=pr.get("body"),
                html_url=pr["html_url"],
                head_branch=pr.get("head", {}).get("ref", ""),
                base_branch=pr.get("base", {}).get("ref", ""),
                repo=repo,
                author=PRAuthor(
                    login=author_login,
                    avatar_url=author_info.get("avatar_url", ""),
                    html_url=author_info.get("html_url", ""),
                    name=author_info.get("name"),
                    bio=author_info.get("bio"),
                    public_repos=author_info.get("public_repos", 0),
                    followers=author_info.get("followers", 0),
                ),
                stats=PRStats(
                    additions=additions,
                    deletions=deletions,
                    changed_files=changed_files,
                    commits=commits,
                    comments=comments,
                    review_comments=review_comments,
                    requested_reviewers=requested_reviewers,
                    labels=labels,
                    mergeable=pr.get("mergeable"),
                    draft=pr.get("draft", False),
                    created_at=created_at,
                    updated_at=updated_at,
                    age_days=age_days,
                ),
                generated_bio=generated_bio,
                compatibility_score=compatibility_score,
            )
        )

    return prs


@router.get("/all", response_model=List[PRResponse])
async def get_all_prs(
    request: Request,
    client: GitHubClient = Depends(get_github_client),
):
    repos_data = await client.list_repos(per_page=100)

    print(f"[DEBUG] Total repos fetched: {len(repos_data)}")

    # Debug: print first repo's permissions structure
    if repos_data:
        first_repo = repos_data[0]
        print(f"[DEBUG] First repo: {first_repo.get('full_name')}")
        print(f"[DEBUG] Permissions: {first_repo.get('permissions')}")

    push_repos = [
        (repo["owner"]["login"], repo["name"])
        for repo in repos_data
        if repo.get("permissions", {}).get("push", False)
        or repo.get("permissions", {}).get("admin", False)
    ]

    print(f"[DEBUG] Repos with push/admin: {len(push_repos)}")
    print(f"[DEBUG] Push repos: {push_repos[:5]}")  # Print first 5

    all_prs = []
    for owner, repo_name in push_repos:
        try:
            prs = await client.list_open_prs_with_details(owner, repo_name)
            print(f"[DEBUG] Repo {owner}/{repo_name}: {len(prs)} open PRs")
            for pr in prs:
                pr["_repo"] = f"{owner}/{repo_name}"
            all_prs.extend(prs)
        except Exception as e:
            print(f"[DEBUG] Error fetching PRs from {owner}/{repo_name}: {e}")
            continue

    print(f"[DEBUG] Total PRs found: {len(all_prs)}")

    if not all_prs:
        print("[DEBUG] No PRs found, returning empty list")
        return []

    random.shuffle(all_prs)

    author_logins = list(
        set(pr.get("user", {}).get("login", "") for pr in all_prs if pr.get("user"))
    )
    print(f"[DEBUG] Author logins to fetch: {author_logins}")

    author_details = {}
    for login in author_logins:
        try:
            user_data = await client.get_user(login)
            author_details[login] = user_data
        except Exception as e:
            print(f"[DEBUG] Error fetching user {login}: {e}")
            author_details[login] = {
                "login": login,
                "avatar_url": "",
                "html_url": "",
                "name": None,
                "bio": None,
                "public_repos": 0,
                "followers": 0,
            }

    print(f"[DEBUG] Author details fetched: {len(author_details)}")

    pr_responses = []
    for pr in all_prs:
        repo_full = pr.get("_repo", "")
        if "/" not in repo_full:
            continue
        owner, repo_name = repo_full.split("/", 1)

        author_login = pr.get("user", {}).get("login", "")
        author_info = author_details.get(author_login, {})

        files_data = await client.get_pull_request_files(owner, repo_name, pr["number"])
        additions = sum(f.get("additions", 0) for f in files_data)
        deletions = sum(f.get("deletions", 0) for f in files_data)
        changed_files = len(files_data)

        commits_data = await client.get_pull_request_commits(
            owner, repo_name, pr["number"]
        )
        commits = len(commits_data)

        reviews_data = await client.get_pull_request_reviews(
            owner, repo_name, pr["number"]
        )
        review_comments = len(reviews_data)

        comments_data = await client.get_pull_request_comments(
            owner, repo_name, pr["number"]
        )
        comments = len(comments_data) if isinstance(comments_data, list) else 0

        requested_reviewers = [
            r.get("login", "") for r in pr.get("requested_reviewers", [])
        ]
        labels = [l.get("name", "").lower() for l in pr.get("labels", [])]

        created_at = datetime.fromisoformat(pr["created_at"].replace("Z", "+00:00"))
        updated_at = datetime.fromisoformat(pr["updated_at"].replace("Z", "+00:00"))
        age_days = (datetime.now(timezone.utc) - created_at).days

        generated_bio = generate_pr_bio(
            additions=additions,
            deletions=deletions,
            changed_files=changed_files,
            commits=commits,
            age_days=age_days,
            draft=pr.get("draft", False),
            labels=labels,
            requested_reviewers=requested_reviewers,
        )

        compatibility_score = compute_compatibility_score(
            mergeable=pr.get("mergeable", False),
            age_days=age_days,
            draft=pr.get("draft", False),
            commits=commits,
            changed_files=changed_files,
            comments=comments + review_comments,
        )

        pr_responses.append(
            PRResponse(
                number=pr["number"],
                title=pr["title"],
                body=pr.get("body"),
                html_url=pr["html_url"],
                head_branch=pr.get("head", {}).get("ref", ""),
                base_branch=pr.get("base", {}).get("ref", ""),
                repo=repo_full,
                author=PRAuthor(
                    login=author_login,
                    avatar_url=author_info.get("avatar_url", ""),
                    html_url=author_info.get("html_url", ""),
                    name=author_info.get("name"),
                    bio=author_info.get("bio"),
                    public_repos=author_info.get("public_repos", 0),
                    followers=author_info.get("followers", 0),
                ),
                stats=PRStats(
                    additions=additions,
                    deletions=deletions,
                    changed_files=changed_files,
                    commits=commits,
                    comments=comments,
                    review_comments=review_comments,
                    requested_reviewers=requested_reviewers,
                    labels=labels,
                    mergeable=pr.get("mergeable"),
                    draft=pr.get("draft", False),
                    created_at=created_at,
                    updated_at=updated_at,
                    age_days=age_days,
                ),
                generated_bio=generated_bio,
                compatibility_score=compatibility_score,
            )
        )

    print(f"[DEBUG] Returning {len(pr_responses)} PR responses")
    return pr_responses


@router.post("/{pr_number}/merge", response_model=MergeResponse)
async def merge_pr(
    pr_number: int,
    request: Request,
    body: MergeRequest,
    client: GitHubClient = Depends(get_github_client),
):
    if "/" not in body.repo:
        raise HTTPException(
            status_code=400, detail="Invalid repo format. Use owner/repo"
        )

    owner, repo_name = body.repo.split("/", 1)

    try:
        repo_data = await client.get_repo(owner, repo_name)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Repository not found: {str(e)}")

    permissions = repo_data.get("permissions", {})
    if not permissions.get("push", False) and not permissions.get("admin", False):
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to merge PRs in this repository.",
        )

    pr_data = await client.get_pull_request(owner, repo_name, pr_number)

    if pr_data.get("merged", False):
        return MergeResponse(
            success=False,
            message="This PR has already been merged.",
            pr_number=pr_number,
            merged=True,
        )

    if pr_data.get("state") == "closed":
        return MergeResponse(
            success=False,
            message="This PR is closed and cannot be merged.",
            pr_number=pr_number,
            merged=False,
        )

    if pr_data.get("draft", False):
        return MergeResponse(
            success=False,
            message="Cannot merge a draft PR. Please mark it as ready for review.",
            pr_number=pr_number,
            merged=False,
        )

    if not pr_data.get("mergeable", True):
        return MergeResponse(
            success=False,
            message="This PR has merge conflicts. Please resolve them first.",
            pr_number=pr_number,
            merged=False,
        )

    try:
        merge_method = body.merge_method or settings.DEFAULT_MERGE_METHOD
        result = await client.merge_pull_request(
            owner,
            repo_name,
            pr_number,
            merge_method=merge_method,
            commit_title=body.commit_title,
            commit_message=body.commit_message,
        )
        await client.create_issue_comment(owner, repo_name, pr_number, "LGTM")
        return MergeResponse(
            success=True,
            message="PR merged successfully!",
            sha=result.get("sha"),
            pr_number=pr_number,
            merged=True,
        )
    except Exception as e:
        return MergeResponse(
            success=False,
            message=f"Failed to merge PR: {str(e)}",
            pr_number=pr_number,
            merged=False,
        )


@router.post("/{pr_number}/close", response_model=CloseResponse)
async def close_pr(
    pr_number: int,
    request: Request,
    body: CloseRequest,
    client: GitHubClient = Depends(get_github_client),
):
    if "/" not in body.repo:
        raise HTTPException(
            status_code=400, detail="Invalid repo format. Use owner/repo"
        )

    owner, repo_name = body.repo.split("/", 1)

    try:
        repo_data = await client.get_repo(owner, repo_name)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Repository not found: {str(e)}")

    permissions = repo_data.get("permissions", {})
    if not permissions.get("push", False) and not permissions.get("admin", False):
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to close PRs in this repository.",
        )

    pr_data = await client.get_pull_request(owner, repo_name, pr_number)

    if pr_data.get("state") == "closed":
        return CloseResponse(
            success=True,
            message="This PR is already closed.",
            pr_number=pr_number,
            state="closed",
        )

    await client.close_pull_request(owner, repo_name, pr_number)
    await client.create_issue_comment(
        owner, repo_name, pr_number, "Too much AI use. Closing."
    )

    return CloseResponse(
        success=True,
        message="PR closed successfully!",
        pr_number=pr_number,
        state="closed",
    )


@router.get("/{pr_number}/details")
async def get_pr_details(
    pr_number: int,
    request: Request,
    repo: str = Query(..., description="Repository in format owner/repo"),
    client: GitHubClient = Depends(get_github_client),
):
    if "/" not in repo:
        raise HTTPException(
            status_code=400, detail="Invalid repo format. Use owner/repo"
        )

    owner, repo_name = repo.split("/", 1)

    pr_data = await client.get_pull_request(owner, repo_name, pr_number)
    return pr_data
