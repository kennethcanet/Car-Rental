import type { Vehicle, VehicleCategory } from "@/features/vehicles/components/VehicleCard";
import type { PickedLocation } from "@/shared/types";

export type HomeCategory = "All" | VehicleCategory;
export const HOME_CATEGORIES: HomeCategory[] = ["All", "Sedan", "SUV", "Van", "Pickup"];

// ─── Extended vehicle type with schedule ─────────────────────────────────────

export interface VehicleSchedule {
  /** Display label for the pickup point */
  pickupLocation: string;
  /** Display labels for valid drop-off points */
  dropoffLocations: string[];
  /** ISO date string e.g. "2026-04-21" */
  availableFrom: string;
  /** ISO date string e.g. "2026-05-30" */
  availableTo: string;
}

export type VehicleWithSchedule = Vehicle & VehicleSchedule;

// ─── Mock data ────────────────────────────────────────────────────────────────

export const MOCK_VEHICLES: VehicleWithSchedule[] = [
  {
    id: "1",
    name: "Toyota Vios",
    type: "Sedan",
    seats: 5,
    transmission: "Automatic",
    pricePerDay: 2500,
    features: ["AC", "GPS"],
    status: "available",
    pickupLocation: "NAIA Terminal 3, Pasay",
    dropoffLocations: ["BGC, Taguig", "Makati CBD, Makati", "Ortigas Center, Pasig"],
    availableFrom: "2026-04-21",
    availableTo: "2026-05-30",
  },
  {
    id: "2",
    name: "Honda CR-V",
    type: "SUV",
    seats: 7,
    transmission: "Automatic",
    pricePerDay: 3800,
    features: ["AC", "Dash Cam"],
    status: "available",
    pickupLocation: "BGC, Taguig",
    dropoffLocations: ["NAIA Terminal 3, Pasay", "Makati CBD, Makati", "SM Mall of Asia, Pasay"],
    availableFrom: "2026-04-21",
    availableTo: "2026-06-15",
  },
  {
    id: "3",
    name: "Toyota HiAce",
    type: "Van",
    seats: 12,
    transmission: "Manual",
    pricePerDay: 4500,
    features: ["AC"],
    status: "booked",
    pickupLocation: "Quezon City Hall, QC",
    dropoffLocations: ["Ortigas Center, Pasig", "BGC, Taguig"],
    availableFrom: "2026-05-01",
    availableTo: "2026-05-31",
  },
  {
    id: "4",
    name: "Mitsubishi Strada",
    type: "Pickup",
    seats: 5,
    transmission: "Manual",
    pricePerDay: 3200,
    features: ["AC", "4WD"],
    status: "available",
    pickupLocation: "Clark Airport, Pampanga",
    dropoffLocations: ["Quezon City Hall, QC", "Robinsons Galleria, Pasig"],
    availableFrom: "2026-04-25",
    availableTo: "2026-06-30",
  },
  {
    id: "5",
    name: "Toyota Innova",
    type: "MPV",
    seats: 8,
    transmission: "Automatic",
    pricePerDay: 3000,
    features: ["AC", "GPS", "USB"],
    status: "available",
    pickupLocation: "SM Mall of Asia, Pasay",
    dropoffLocations: ["NAIA Terminal 3, Pasay", "BGC, Taguig", "Makati CBD, Makati"],
    availableFrom: "2026-04-21",
    availableTo: "2026-05-20",
  },
  {
    id: "6",
    name: "Ford Ranger",
    type: "Pickup",
    seats: 5,
    transmission: "Automatic",
    pricePerDay: 3600,
    features: ["AC", "4WD", "Dash Cam"],
    status: "available",
    pickupLocation: "Robinsons Galleria, Pasig",
    dropoffLocations: ["Ortigas Center, Pasig", "BGC, Taguig", "Quezon City Hall, QC"],
    availableFrom: "2026-04-22",
    availableTo: "2026-06-10",
  },
];

// ─── Filter helpers ───────────────────────────────────────────────────────────

export interface SearchCriteria {
  /** Map-picked origin point. Location filtering is handled by the real API;
   *  mock data ignores coordinates and only filters by date + category. */
  origin: PickedLocation | null;
  destination: PickedLocation | null;
  date: Date | null;
  category: HomeCategory;
}

export function filterVehicles(
  vehicles: VehicleWithSchedule[],
  { date, category }: SearchCriteria,
): VehicleWithSchedule[] {
  return vehicles.filter((v) => {
    if (category !== "All" && v.type !== category) return false;
    if (date) {
      const d = date.getTime();
      const from = new Date(v.availableFrom).getTime();
      const to = new Date(v.availableTo).getTime();
      if (d < from || d > to) return false;
    }
    return true;
  });
}

// ─── Date formatting ──────────────────────────────────────────────────────────

const SHORT_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function formatDate(date: Date): string {
  return `${SHORT_MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function formatDateRange(from: string, to: string): string {
  const f = new Date(from);
  const t = new Date(to);
  const sameYear = f.getFullYear() === t.getFullYear();
  const fromStr = `${SHORT_MONTHS[f.getMonth()]} ${f.getDate()}`;
  const toStr = `${SHORT_MONTHS[t.getMonth()]} ${t.getDate()}${sameYear ? "" : `, ${t.getFullYear()}`}`;
  return `${fromStr} – ${toStr}`;
}
