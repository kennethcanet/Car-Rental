# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Stack

- **Backend:** .NET 10 (FastEndpoints, EF Core Code-First, SQL Server)
- **Frontend:** React Native via Expo (bare workflow)
- **Background jobs:** Hangfire
- **Storage:** S3 or Cloudinary (store keys, never full URLs)
- **Notifications:** Firebase FCM
- **Payments:** `IPaymentGateway` interface with Stripe / PayMongo adapters

---

## Monorepo Layout

```
CarRental/
├── BackEnd/    # .NET 10 solution
└── FrontEnd/   # Expo React Native app
```

### Backend — solution structure

Solution file: `BackEnd/API/API.slnx`

```
API.slnx
└── src/
    └── CarRental.Api/          # Single project — features, domain, persistence
└── tests/
    ├── CarRental.Api.Tests/
    └── CarRental.Integration.Tests/
```

### Vertical slice layout (API)

Every feature is self-contained. No shared service layer — each slice owns its behaviour end-to-end.

```
Features/Bookings/
├── Create/
│   └── CreateBookingEndpoint.cs    # Request, Validator, and Endpoint inlined
├── GetById/
│   └── GetBookingByIdEndpoint.cs
├── List/
│   └── ListBookingsEndpoint.cs
├── Cancel/
│   └── CancelBookingEndpoint.cs
└── BookingMapper.cs
```

### Frontend — folder structure

Mirrors the API's vertical slice layout for a consistent mental model.

```
src/
├── features/           # auth | vehicles | bookings | payments
│   └── <feature>/
│       ├── screens/
│       ├── components/
│       ├── hooks/
│       └── api.ts      # typed fetch functions for this feature
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   └── apiClient.ts    # Axios instance with JWT interceptors + 401 refresh
├── navigation/
│   └── RootNavigator.tsx
└── store/
    └── auth.store.ts   # Zustand — auth state only, not server data
```

**Navigation groups:**
- `(auth)/` — Login, Register, Forgot Password
- `(app)/` — authenticated tab layout: Browse · My Rentals · Profile

---

## Key Architectural Rules

- **Booking overlap prevention:** enforce via a serializable transaction + application-level overlap query on `vehicle_id` and `(pickup_at, return_at)`. Use `IsolationLevel.Serializable` to prevent concurrent double-bookings.
- **Image storage:** store S3/Cloudinary keys only, never full URLs. Resolve at read time.
- **Timezones:** always store `datetime2` (UTC) in the DB; format for display with `dayjs/timezone`.
- **Soft deletes:** all core entities use a `deleted_at` column — never hard-delete vehicles, bookings, or users.
- **Payment gateway:** implement `IPaymentGateway` interface first so Stripe / PayMongo can be swapped without touching feature slices.
- **Server state vs UI state:** React Query owns all server/API data. Zustand is for auth state and UI preferences only.

---

## Build Commands

Run all commands from `BackEnd/API/` (solution root).

### Backend

```bash
dotnet build
dotnet test
dotnet run --project src/CarRental.Api

# Migrations
dotnet ef migrations add <Name> \
  --project src/CarRental.Api \
  --startup-project src/CarRental.Api \
  --output-dir Persistence/Migrations

dotnet ef database update \
  --project src/CarRental.Api \
  --startup-project src/CarRental.Api
```

### Frontend (expected)

```bash
npx expo start
npx expo start --android
npx expo start --ios
```

---

## Project Layout (CarRental.Api)

```
CarRental.Api/
├── Domain/
│   ├── Entities/           # AppUser, AppRole, Location, Vehicle, Booking, etc.
│   └── Enums/              # VehicleCategory, BookingStatus
├── Persistence/
│   ├── AppDbContext.cs
│   ├── AppDbContextFactory.cs
│   ├── Configurations/     # IEntityTypeConfiguration per entity
│   └── Migrations/
├── Features/               # Vertical slices (Auth, Locations, Vehicles, Bookings)
└── Program.cs
```

## EF Commands

```bash
# Add a new migration
dotnet ef migrations add <Name> --project src/CarRental.Api --startup-project src/CarRental.Api --output-dir Persistence/Migrations

# Apply migrations to the database
dotnet ef database update --project src/CarRental.Api --startup-project src/CarRental.Api
```

---

## Core Frontend Dependencies

| Package | Purpose |
|---|---|
| `expo-router` | File-based navigation |
| `@tanstack/react-query` | Server state and caching |
| `react-hook-form` + `zod` | Forms + runtime validation |
| `zustand` | Auth state only |
| `axios` | HTTP client with JWT interceptors |
| `expo-secure-store` | JWT/refresh token storage |
| `expo-notifications` | Push notification registration |
| `expo-camera` | License and inspection photo capture |
| `react-native-maps` | Location picker |
| `dayjs` + `dayjs/timezone` | Timezone-safe date formatting |

---

## Build Phases

| Phase | Scope |
|---|---|
| 1 — MVP | Auth (JWT + refresh), vehicle catalog, basic booking, location management |
| 2 — Payments & Notifications | Stripe/PayMongo, FCM push, email, KYC/license verification |
| 3 — Rental Lifecycle | Inspections, digital contract/e-sign, pickup/return flow, add-ons, reviews |
| 4 — Admin & Analytics | Admin dashboard, pricing engine, fleet maintenance, revenue reports |



## Naming Conventions
Table naming should be pascal case e.g UserRoles,UserClaims,UserLogins,RoleClaims,UserTokens

