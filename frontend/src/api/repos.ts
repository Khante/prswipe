import apiClient from "./client";

export interface RepoPermissions {
  admin: boolean;
  push: boolean;
  pull: boolean;
}

export interface Repo {
  id: number;
  full_name: string;
  name: string;
  owner_login: string;
  owner_avatar_url: string;
  description: string | null;
  private: boolean;
  open_issues_count: number;
  open_prs_count: number;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
  html_url: string;
  permissions: RepoPermissions;
}

export const getRepos = async (
  page: number = 1,
  perPage: number = 30,
  sort: string = "full_name",
): Promise<Repo[]> => {
  const response = await apiClient.get<Repo[]>("/api/repos", {
    params: { page, per_page: perPage, sort },
  });
  return response.data;
};

export const searchRepos = async (query: string): Promise<Repo[]> => {
  const response = await apiClient.get<Repo[]>("/api/repos/search", {
    params: { q: query },
  });
  return response.data;
};
