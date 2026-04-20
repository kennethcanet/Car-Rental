import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { FilterChips } from "@/features/home/components/FilterChips";
import { LocationPill } from "@/features/home/components/LocationPill";
import { SearchBar } from "@/features/home/components/SearchBar";
import { MOCK_VEHICLES, type HomeCategory } from "@/features/home/mockData";
import { VehicleCard } from "@/features/vehicles/components/VehicleCard";
import { Avatar } from "@/shared/components/Avatar";
import { colors, radius, spacing } from "@/shared/theme";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// ─── Active Booking Banner ────────────────────────────────────────────────────

interface ActiveBooking {
  vehicleName: string;
  plateNumber: string;
  returnsAt: string; // e.g. "Apr 27 · 9:00 AM"
}

function ActiveBookingBanner({ booking, onView }: { booking: ActiveBooking; onView: () => void }) {
  return (
    <View style={styles.bookingBanner}>
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.bookingRow}>
        <View style={styles.bookingLeft}>
          <Text style={styles.bookingEyebrow}>ACTIVE BOOKING</Text>
          <Text style={styles.bookingVehicle}>
            {booking.vehicleName} · {booking.plateNumber}
          </Text>
          <Text style={styles.bookingReturn}>Returns {booking.returnsAt}</Text>
        </View>
        <Pressable style={styles.viewBtn} onPress={onView}>
          <Text style={styles.viewBtnText}>View</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── No Active Booking Banner ─────────────────────────────────────────────────

function ReadyBanner({ onBrowse }: { onBrowse: () => void }) {
  return (
    <View style={styles.readyBanner}>
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <Text style={styles.readyTitle}>Ready for your next trip?</Text>
      <Text style={styles.readySub}>
        Browse available vehicles near you and book in minutes.
      </Text>
      <Pressable style={styles.browsePrimary} onPress={onBrowse}>
        <Text style={styles.browsePrimaryText}>Browse vehicles</Text>
      </Pressable>
    </View>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  firstName: string;
  lastName: string;
  /** Pass null when the user has no active booking. */
  activeBooking?: ActiveBooking | null;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function AuthHome({ firstName, lastName, activeBooking = MOCK_ACTIVE_BOOKING }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<HomeCategory>("All");

  const filtered = MOCK_VEHICLES.filter((v) => category === "All" || v.type === category);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {getGreeting()}, {firstName} 👋
          </Text>
          <Avatar
            firstName={firstName}
            lastName={lastName}
            onPress={() => router.push("/(app)/profile")}
          />
        </View>

        <LocationPill onPress={() => router.push("/(app)/locations")} />
        <SearchBar value={search} onChangeText={setSearch} />

        {/* Banner — active booking or promotional */}
        {activeBooking ? (
          <ActiveBookingBanner
            booking={activeBooking}
            onView={() => router.push("/(app)/bookings")}
          />
        ) : (
          <ReadyBanner onBrowse={() => router.push("/(app)/catalog")} />
        )}

        <FilterChips active={category} onSelect={setCategory} />

        <Text style={styles.sectionLabel}>Available near you</Text>

        {/* All vehicles visible — no lock overlay */}
        <View style={styles.list}>
          {filtered.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} onPress={() => {}} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Mock active booking (replace with real API data) ────────────────────────

const MOCK_ACTIVE_BOOKING: ActiveBooking = {
  vehicleName: "Toyota Vios",
  plateNumber: "ABC 1234",
  returnsAt: "Apr 27 · 9:00 AM",
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.pageBg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingTop: 16, paddingBottom: 32, gap: 14 },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  greeting: { fontSize: 17, fontWeight: "500", color: colors.textPrimary, flex: 1, marginRight: 12 },

  // Active booking banner
  bookingBanner: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: 16,
    paddingHorizontal: 18,
    overflow: "hidden",
  },
  bookingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bookingLeft: { gap: 3, flex: 1, marginRight: 12 },
  bookingEyebrow: {
    fontSize: 11,
    color: colors.primaryLighter,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "500",
  },
  bookingVehicle: { fontSize: 15, fontWeight: "500", color: "#fff" },
  bookingReturn: { fontSize: 12, color: colors.primaryLighter },
  viewBtn: {
    backgroundColor: "#fff",
    borderRadius: radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexShrink: 0,
  },
  viewBtnText: { fontSize: 12, fontWeight: "500", color: colors.primary },

  // Decorative circles (shared between banners)
  circle1: {
    position: "absolute", width: 120, height: 120, borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.07)", top: -30, right: -20,
  },
  circle2: {
    position: "absolute", width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.05)", bottom: -20, right: 60,
  },

  // Ready banner (no active booking)
  readyBanner: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: 18,
    overflow: "hidden",
    gap: 6,
  },
  readyTitle: { fontSize: 16, fontWeight: "500", color: "#fff" },
  readySub: { fontSize: 12, color: colors.primaryLighter, lineHeight: 18 },
  browsePrimary: {
    backgroundColor: "#fff",
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  browsePrimaryText: { fontSize: 13, fontWeight: "500", color: colors.primary },

  sectionLabel: {
    fontSize: 12, fontWeight: "500", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 0.6,
  },

  list: { gap: 10 },
});
