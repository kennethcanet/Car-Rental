import { apiClient } from "@/shared/apiClient";

// TODO: POST /payments/initiate  — initiate payment for a booking
// TODO: GET  /payments/:id       — payment status
// TODO: POST /payments/:id/retry — retry failed payment

export const paymentsApi = {
  initiate: async (payload: { bookingId: string; gateway: "stripe" | "paymongo" }) => {
    const res = await apiClient.post("/payments/initiate", payload);
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/payments/${id}`);
    return res.data;
  },
  retry: async (id: string) => {
    const res = await apiClient.post(`/payments/${id}/retry`);
    return res.data;
  },
};
