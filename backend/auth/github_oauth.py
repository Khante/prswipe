import secrets
from typing import Optional
from urllib.parse import urlencode

import httpx

from config import settings


class GitHubOAuth:
    def __init__(self):
        self.client_id = settings.GITHUB_CLIENT_ID
        self.client_secret = settings.GITHUB_CLIENT_SECRET
        self.callback_url = settings.GITHUB_CALLBACK_URL
        self.api_base_url = settings.GITHUB_API_BASE_URL
        self.oauth_base_url = "https://github.com"
        self.scope = "repo"

    def get_authorization_url(self, state: str) -> str:
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.callback_url,
            "scope": self.scope,
            "state": state,
            "prompt": "consent",  # Force re-authorization after logout
        }
        return f"{self.oauth_base_url}/login/oauth/authorize?{urlencode(params)}"

    async def exchange_code_for_token(self, code: str) -> Optional[str]:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.oauth_base_url}/login/oauth/access_token",
                json={
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "code": code,
                },
                headers={"Accept": "application/json"},
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("access_token")
            print(f"Token exchange failed: {response.status_code} {response.text}")
            return None

    @staticmethod
    def generate_state() -> str:
        return secrets.token_urlsafe(32)


github_oauth = GitHubOAuth()
