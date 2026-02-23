import { create } from "zustand";
import { getMe, logout as apiLogout, User } from "../api/auth";
import { clearAuthToken } from "../api/client";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  fetchUser: async () => {
    try {
      const user = await getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await apiLogout();
    } catch {
      // Ignore errors
    }
    clearAuthToken();
    set({ user: null, isAuthenticated: false });
  },
}));
