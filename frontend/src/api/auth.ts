import apiClient from "./client";

export interface User {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
}

export const getMe = async (): Promise<User> => {
  const response = await apiClient.get<User>("/auth/me");
  return response.data;
};

export const logout = async (): Promise<void> => {
  await apiClient.post("/auth/logout");
};
