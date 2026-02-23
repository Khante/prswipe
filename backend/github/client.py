import asyncio
from typing import Optional

import httpx

from config import settings


class GitHubClient:
    def __init__(self, token: str):
        self.token = token
        self.api_base_url = settings.GITHUB_API_BASE_URL
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }

    async def _request(self, method: str, endpoint: str, **kwargs) -> dict:
        url = f"{self.api_base_url}{endpoint}"
        async with httpx.AsyncClient() as client:
            response = await client.request(
                method=method,
                url=url,
                headers=self.headers,
                **kwargs,
            )
            if response.status_code == 204:
                return {}
            if response.status_code >= 400:
                error_data = response.json() if response.content else {}
                raise Exception(
                    error_data.get(
                        "message", f"GitHub API error: {response.status_code}"
                    )
                )
            return response.json()

    async def get_authenticated_user(self) -> dict:
        return await self._request("GET", "/user")

    async def get_user(self, username: str) -> dict:
        return await self._request("GET", f"/users/{username}")

    async def list_repos(
        self,
        page: int = 1,
        per_page: int = 30,
        sort: str = "updated",
        affiliation: str = "owner,collaborator,organization_member",
    ) -> list[dict]:
        repos = []
        params = {
            "page": page,
            "per_page": min(per_page, 100),
            "sort": sort,
            "affiliation": affiliation,
        }
        while True:
            data = await self._request("GET", "/user/repos", params=params)
            repos.extend(data)
            if len(data) < params["per_page"]:
                break
            params["page"] += 1
        return repos

    async def search_repos(self, query: str) -> list[dict]:
        data = await self._request("GET", "/user/repos", params={"per_page": 100})
        query_lower = query.lower()
        return [
            repo for repo in data if query_lower in repo.get("full_name", "").lower()
        ]

    async def get_repo(self, owner: str, repo: str) -> dict:
        return await self._request("GET", f"/repos/{owner}/{repo}")

    async def get_open_prs_count(self, owner: str, repo: str) -> int:
        data = await self._request(
            "GET",
            f"/repos/{owner}/{repo}/pulls",
            params={"state": "open", "per_page": 1},
        )
        return len(data)

    async def list_open_prs(self, owner: str, repo: str) -> list[dict]:
        prs = []
        params = {"state": "open", "per_page": 100}
        while True:
            data = await self._request(
                "GET", f"/repos/{owner}/{repo}/pulls", params=params
            )
            prs.extend(data)
            if len(data) < params["per_page"]:
                break
            params["page"] = params.get("page", 1) + 1
        return prs

    async def list_open_prs_with_details(self, owner: str, repo: str) -> list[dict]:
        """
        Fetches all open PRs with full details including the mergeable field.
        The bulk list endpoint does not return mergeable — it requires individual
        fetches per PR. Uses asyncio.gather for concurrency.
        """
        prs = await self.list_open_prs(owner, repo)
        if not prs:
            return []
        detailed_prs = await asyncio.gather(
            *[self.get_pull_request(owner, repo, pr["number"]) for pr in prs]
        )
        return list(detailed_prs)

    async def get_pull_request(self, owner: str, repo: str, pull_number: int) -> dict:
        pr = await self._request("GET", f"/repos/{owner}/{repo}/pulls/{pull_number}")
        if pr.get("mergeable") is False or pr.get("mergeable") is None:
            await asyncio.sleep(1)
            pr = await self._request(
                "GET", f"/repos/{owner}/{repo}/pulls/{pull_number}"
            )
        return pr

    async def get_pull_request_files(
        self, owner: str, repo: str, pull_number: int
    ) -> list[dict]:
        files = []
        params = {"per_page": 100}
        while True:
            data = await self._request(
                "GET",
                f"/repos/{owner}/{repo}/pulls/{pull_number}/files",
                params=params,
            )
            files.extend(data)
            if len(data) < params["per_page"]:
                break
            params["page"] = params.get("page", 1) + 1
        return files

    async def get_pull_request_commits(
        self, owner: str, repo: str, pull_number: int
    ) -> list[dict]:
        commits = []
        params = {"per_page": 100}
        while True:
            data = await self._request(
                "GET",
                f"/repos/{owner}/{repo}/pulls/{pull_number}/commits",
                params=params,
            )
            commits.extend(data)
            if len(data) < params["per_page"]:
                break
            params["page"] = params.get("page", 1) + 1
        return commits

    async def get_pull_request_comments(
        self, owner: str, repo: str, pull_number: int
    ) -> dict:
        comments = await self._request(
            "GET",
            f"/repos/{owner}/{repo}/pulls/{pull_number}/comments",
            params={"per_page": 1},
        )
        return comments

    async def get_pull_request_reviews(
        self, owner: str, repo: str, pull_number: int
    ) -> list[dict]:
        reviews = []
        params = {"per_page": 100}
        while True:
            data = await self._request(
                "GET",
                f"/repos/{owner}/{repo}/pulls/{pull_number}/reviews",
                params=params,
            )
            reviews.extend(data)
            if len(data) < params["per_page"]:
                break
            params["page"] = params.get("page", 1) + 1
        return reviews

    async def merge_pull_request(
        self,
        owner: str,
        repo: str,
        pull_number: int,
        merge_method: str = "squash",
        commit_title: Optional[str] = None,
        commit_message: Optional[str] = None,
    ) -> dict:
        body = {"merge_method": merge_method}
        if commit_title:
            body["commit_title"] = commit_title
        if commit_message:
            body["commit_message"] = commit_message
        return await self._request(
            "PUT",
            f"/repos/{owner}/{repo}/pulls/{pull_number}/merge",
            json=body,
        )

    async def close_pull_request(self, owner: str, repo: str, pull_number: int) -> dict:
        return await self._request(
            "PATCH",
            f"/repos/{owner}/{repo}/pulls/{pull_number}",
            json={"state": "closed"},
        )

    async def create_pull_request_review(
        self,
        owner: str,
        repo: str,
        pull_number: int,
        event: str = "APPROVE",
        body: Optional[str] = None,
    ) -> dict:
        review_body = {"event": event}
        if body:
            review_body["body"] = body
        return await self._request(
            "POST",
            f"/repos/{owner}/{repo}/pulls/{pull_number}/reviews",
            json=review_body,
        )

    async def create_issue_comment(
        self, owner: str, repo: str, pull_number: int, body: str
    ) -> dict:
        return await self._request(
            "POST",
            f"/repos/{owner}/{repo}/issues/{pull_number}/comments",
            json={"body": body},
        )

    async def get_rate_limit(self) -> dict:
        return await self._request("GET", "/rate_limit")
