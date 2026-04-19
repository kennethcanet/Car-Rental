import axios from "axios";

const BASE_URL = "https://YOUR_API_URL_HERE/api"; // TODO: replace with real URL / env var

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// TODO: JWT request interceptor — attach Authorization header from auth store
// apiClient.interceptors.request.use((config) => {
//   const token = useAuthStore.getState().accessToken;
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// TODO: 401 response interceptor — attempt token refresh, then clearAuth on failure
// apiClient.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     if (error.response?.status === 401) {
//       // refresh logic here
//       useAuthStore.getState().clearAuth();
//     }
//     return Promise.reject(error);
//   },
// );
