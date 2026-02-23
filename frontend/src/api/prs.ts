import apiClient from "./client";

export interface PRAuthor {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
}

export interface PRStats {
  additions: number;
  deletions: number;
  changed_files: number;
  commits: number;
  comments: number;
  review_comments: number;
  requested_reviewers: string[];
  labels: string[];
  mergeable: boolean | null;
  draft: boolean;
  created_at: string;
  updated_at: string;
  age_days: number;
}

export interface PR {
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  head_branch: string;
  base_branch: string;
  repo: string;
  author: PRAuthor;
  stats: PRStats;
  generated_bio: string;
  compatibility_score: number;
}

export interface MergeRequest {
  repo: string;
  merge_method?: string;
  commit_title?: string;
  commit_message?: string;
}

export interface CloseRequest {
  repo: string;
}

export interface MergeResponse {
  success: boolean;
  message: string;
  sha: string | null;
  pr_number: number;
  merged: boolean;
}

export interface CloseResponse {
  success: boolean;
  message: string;
  pr_number: number;
  state: string;
}

export const getPRs = async (repo: string): Promise<PR[]> => {
  const response = await apiClient.get<PR[]>("/api/prs", {
    params: { repo },
  });
  return response.data;
};

export const getAllPRs = async (): Promise<PR[]> => {
  const response = await apiClient.get<PR[]>("/api/prs/all");
  return response.data;
};

export const mergePR = async (
  prNumber: number,
  data: MergeRequest,
): Promise<MergeResponse> => {
  const response = await apiClient.post<MergeResponse>(
    `/api/prs/${prNumber}/merge`,
    data,
  );
  return response.data;
};

export const closePR = async (
  prNumber: number,
  data: CloseRequest,
): Promise<CloseResponse> => {
  const response = await apiClient.post<CloseResponse>(
    `/api/prs/${prNumber}/close`,
    data,
  );
  return response.data;
};
