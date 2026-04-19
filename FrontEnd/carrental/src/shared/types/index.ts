export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  imageKey: string; // S3/Cloudinary key — resolve to URL at read time
  pricePerDay: number;
  locationId: string;
}

export interface Booking {
  id: string;
  vehicleId: string;
  userId: string;
  pickupAt: string; // ISO 8601 UTC
  returnAt: string; // ISO 8601 UTC
  status: "pending" | "confirmed" | "cancelled" | "completed";
  totalAmount: number;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded";
  gatewayReference: string;
}
