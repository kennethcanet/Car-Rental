import { apiClient } from "@/shared/apiClient";

// TODO: POST /auth/register
// TODO: POST /auth/login
// TODO: POST /auth/refresh
// TODO: POST /auth/logout

export const authApi = {
  register: async (payload: { email: string; password: string; firstName: string; lastName: string }) => {
    const res = await apiClient.post("/auth/register", payload);
    return res.data;
  },
  login: async (payload: { email: string; password: string }) => {
    const res = await apiClient.post("/auth/login", payload);
    return res.data;
  },
  refresh: async (refreshToken: string) => {
    const res = await apiClient.post("/auth/refresh", { refreshToken });
    return res.data;
  },
  logout: async () => {
    const res = await apiClient.post("/auth/logout");
    return res.data;
  },
};
