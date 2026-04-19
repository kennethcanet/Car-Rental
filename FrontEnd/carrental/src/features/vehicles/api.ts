import { apiClient } from "@/shared/apiClient";

// TODO: GET  /vehicles          — paginated list with filters (location, date range, price)
// TODO: GET  /vehicles/:id      — single vehicle detail
// TODO: GET  /vehicles/featured — homepage featured vehicles

export const vehiclesApi = {
  list: async (params?: Record<string, unknown>) => {
    const res = await apiClient.get("/vehicles", { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/vehicles/${id}`);
    return res.data;
  },
  featured: async () => {
    const res = await apiClient.get("/vehicles/featured");
    return res.data;
  },
};
