from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class UserResponse(BaseModel):
    login: str
    name: Optional[str] = None
    avatar_url: str
    html_url: str
    public_repos: int = 0
    followers: int = 0


class RepoPermissions(BaseModel):
    admin: bool = False
    push: bool = False
    pull: bool = False


class RepoResponse(BaseModel):
    id: int
    full_name: str
    name: str
    owner_login: str
    owner_avatar_url: str
    description: Optional[str] = None
    private: bool = False
    open_issues_count: int = 0
    open_prs_count: int = 0
    language: Optional[str] = None
    stargazers_count: int = 0
    updated_at: datetime
    html_url: str
    permissions: RepoPermissions


class PRAuthor(BaseModel):
    login: str
    avatar_url: str
    html_url: str
    name: Optional[str] = None
    bio: Optional[str] = None
    public_repos: int = 0
    followers: int = 0


class PRStats(BaseModel):
    additions: int = 0
    deletions: int = 0
    changed_files: int = 0
    commits: int = 0
    comments: int = 0
    review_comments: int = 0
    requested_reviewers: List[str] = []
    labels: List[str] = []
    mergeable: Optional[bool] = None
    draft: bool = False
    created_at: datetime
    updated_at: datetime
    age_days: int = 0


class PRResponse(BaseModel):
    number: int
    title: str
    body: Optional[str] = None
    html_url: str
    head_branch: str
    base_branch: str
    repo: str
    author: PRAuthor
    stats: PRStats
    generated_bio: str
    compatibility_score: int = 50


class MergeRequest(BaseModel):
    repo: str
    merge_method: str = "squash"
    commit_title: Optional[str] = None
    commit_message: Optional[str] = None


class CloseRequest(BaseModel):
    repo: str


class MergeResponse(BaseModel):
    success: bool
    message: str
    sha: Optional[str] = None
    pr_number: int
    merged: bool


class CloseResponse(BaseModel):
    success: bool
    message: str
    pr_number: int
    state: str


class ErrorResponse(BaseModel):
    error: str
    detail: str
    status_code: int
