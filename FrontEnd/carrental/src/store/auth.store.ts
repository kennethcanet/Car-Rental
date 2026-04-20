import { create } from "zustand";

interface AuthUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  setAuth: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  user: null,
  setAuth: (accessToken, refreshToken, user) =>
    set({ isAuthenticated: true, accessToken, refreshToken, user }),
  clearAuth: () =>
    set({ isAuthenticated: false, accessToken: null, refreshToken: null, user: null }),
}));
