import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const getAuthToken = (): string | null => {
  return localStorage.getItem("pr_swipe_token");
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem("pr_swipe_token", token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem("pr_swipe_token");
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthToken();
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export default apiClient;
