import { apiClient } from "@/shared/apiClient";

// TODO: POST   /bookings         — create booking
// TODO: GET    /bookings         — list user's bookings
// TODO: GET    /bookings/:id     — booking detail
// TODO: POST   /bookings/:id/cancel  — cancel booking
// TODO: POST   /bookings/:id/confirm — confirm booking (admin)

export const bookingsApi = {
  create: async (payload: { vehicleId: string; pickupAt: string; returnAt: string }) => {
    const res = await apiClient.post("/bookings", payload);
    return res.data;
  },
  list: async () => {
    const res = await apiClient.get("/bookings");
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/bookings/${id}`);
    return res.data;
  },
  cancel: async (id: string) => {
    const res = await apiClient.post(`/bookings/${id}/cancel`);
    return res.data;
  },
};
