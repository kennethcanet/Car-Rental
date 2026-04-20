import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/shared/theme";

export type VehicleStatus = "available" | "booked";
export type VehicleCategory = "Sedan" | "SUV" | "Van" | "Pickup" | "MPV";

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleCategory;
  seats: number;
  transmission: "Automatic" | "Manual";
  pricePerDay: number;
  features: string[];
  status: VehicleStatus;
}

interface ScheduleInfo {
  pickupLocation: string;
  dropoffLocations: string[];
  availableDates: string; // pre-formatted, e.g. "Apr 21 – May 30"
}

interface Props {
  vehicle: Vehicle;
  schedule?: ScheduleInfo;
  onPress?: () => void;
}

// ─── Thumbnail ────────────────────────────────────────────────────────────────

const THUMB_COLORS: Record<VehicleCategory, { bg: string; car: string }> = {
  Sedan:  { bg: "#E6F1FB", car: "#185FA5" },
  MPV:    { bg: "#E6F1FB", car: "#185FA5" },
  SUV:    { bg: "#F1EFE8", car: "#5F5E5A" },
  Van:    { bg: "#FAECE7", car: "#D85A30" },
  Pickup: { bg: "#F1EFE8", car: "#888780" },
};

function Thumbnail({ type }: { type: VehicleCategory }) {
  const { bg } = THUMB_COLORS[type] ?? THUMB_COLORS.Sedan;
  const emoji =
    type === "Van" ? "🚐" :
    type === "Pickup" ? "🛻" :
    type === "SUV" ? "🚙" : "🚗";
  return (
    <View style={[styles.thumb, { backgroundColor: bg }]}>
      <Text style={styles.thumbEmoji}>{emoji}</Text>
    </View>
  );
}

// ─── Badges ───────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: VehicleStatus }) {
  const ok = status === "available";
  return (
    <View style={[styles.badge, { backgroundColor: ok ? colors.successBg : colors.dangerBg }]}>
      <Text style={[styles.badgeText, { color: ok ? colors.success : colors.danger }]}>
        {ok ? "Available" : "Booked"}
      </Text>
    </View>
  );
}

function FeatureBadge({ label }: { label: string }) {
  return (
    <View style={styles.featureBadge}>
      <Text style={styles.featureText}>{label}</Text>
    </View>
  );
}

// ─── Schedule footer ──────────────────────────────────────────────────────────

function ScheduleFooter({ schedule }: { schedule: ScheduleInfo }) {
  const dropoffPreview = schedule.dropoffLocations.slice(0, 2).join(" · ");
  const hasMore = schedule.dropoffLocations.length > 2;

  return (
    <View style={styles.scheduleFooter}>
      <View style={styles.scheduleRow}>
        <Text style={styles.scheduleIcon}>📍</Text>
        <Text style={styles.scheduleLabel} numberOfLines={1}>
          {schedule.pickupLocation}
        </Text>
      </View>
      <View style={styles.scheduleRow}>
        <Text style={styles.scheduleIcon}>🏁</Text>
        <Text style={styles.scheduleLabel} numberOfLines={1}>
          {dropoffPreview}{hasMore ? " +more" : ""}
        </Text>
      </View>
      <View style={styles.scheduleRow}>
        <Text style={styles.scheduleIcon}>📅</Text>
        <Text style={styles.scheduleLabel}>{schedule.availableDates}</Text>
      </View>
    </View>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function VehicleCard({ vehicle, schedule, onPress }: Props) {
  const price = `₱${vehicle.pricePerDay.toLocaleString()}/day`;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {/* Top row: thumbnail + main info */}
      <View style={styles.topRow}>
        <Thumbnail type={vehicle.type} />
        <View style={styles.content}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{vehicle.name}</Text>
            <Text style={styles.price}>{price}</Text>
          </View>
          <Text style={styles.subtitle}>
            {vehicle.type} · {vehicle.seats} seats · {vehicle.transmission}
          </Text>
          <View style={styles.badges}>
            {vehicle.features.slice(0, 2).map((f) => (
              <FeatureBadge key={f} label={f} />
            ))}
            <StatusBadge status={vehicle.status} />
          </View>
        </View>
      </View>

      {/* Schedule footer (optional) */}
      {schedule && (
        <>
          <View style={styles.divider} />
          <ScheduleFooter schedule={schedule} />
        </>
      )}
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.borderDefault,
    borderRadius: radius.md,
    padding: spacing.cardPad,
    gap: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  thumb: {
    width: 80,
    height: 56,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  thumbEmoji: { fontSize: 28 },
  content: { flex: 1, gap: 4 },
  nameRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 15, fontWeight: "500", color: colors.textPrimary, flex: 1, marginRight: 8 },
  price: { fontSize: 15, fontWeight: "500", color: colors.primary, flexShrink: 0 },
  subtitle: { fontSize: 12, color: colors.textSecondary },
  badges: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginTop: 2 },
  badge: { borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11 },
  featureBadge: {
    backgroundColor: colors.primaryBg,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  featureText: { fontSize: 11, color: colors.primary },

  // Schedule
  divider: { height: 0.5, backgroundColor: colors.borderDefault },
  scheduleFooter: { gap: 4 },
  scheduleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  scheduleIcon: { fontSize: 11, width: 16 },
  scheduleLabel: { fontSize: 12, color: colors.textSecondary, flex: 1 },
});
