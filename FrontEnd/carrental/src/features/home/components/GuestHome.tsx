import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  MOCK_VEHICLES,
  filterVehicles,
  formatDate,
  formatDateRange,
  type HomeCategory,
  type SearchCriteria,
} from "@/features/home/mockData";
import { FilterChips } from "@/features/home/components/FilterChips";
import { VehicleCard } from "@/features/vehicles/components/VehicleCard";
import { MapLocationPicker } from "@/shared/components/MapLocationPicker";
import type { PickedLocation } from "@/shared/types";
import { colors, radius, spacing } from "@/shared/theme";

// ─── Calendar modal ───────────────────────────────────────────────────────────

const LONG_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKDAYS    = ["S","M","T","W","T","F","S"];

function CalendarModal({
  visible,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selected: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date(selected);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const prevMonth = () =>
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const nextMonth = () =>
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  const firstDow = viewMonth.getDay();
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) =>
      new Date(viewMonth.getFullYear(), viewMonth.getMonth(), i + 1),
    ),
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={cal.overlay} onPress={onClose}>
        <Pressable style={cal.sheet} onPress={() => {}}>
          <View style={cal.handle} />
          <Text style={cal.title}>Select date</Text>

          <View style={cal.monthNav}>
            <Pressable style={cal.navBtn} onPress={prevMonth}>
              <Text style={cal.navArrow}>‹</Text>
            </Pressable>
            <Text style={cal.monthLabel}>
              {LONG_MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </Text>
            <Pressable style={cal.navBtn} onPress={nextMonth}>
              <Text style={cal.navArrow}>›</Text>
            </Pressable>
          </View>

          <View style={cal.weekRow}>
            {WEEKDAYS.map((d, i) => (
              <Text key={i} style={cal.weekLabel}>{d}</Text>
            ))}
          </View>

          <View style={cal.grid}>
            {cells.map((day, i) => {
              if (!day) return <View key={`e${i}`} style={cal.cell} />;
              const isPast = day < today;
              const isSelected = selected.toDateString() === day.toDateString();
              const isToday = today.toDateString() === day.toDateString();
              return (
                <Pressable
                  key={i}
                  style={[cal.cell, isSelected && cal.cellSelected, isPast && cal.cellPast]}
                  onPress={() => { if (!isPast) { onSelect(day); onClose(); } }}
                  disabled={isPast}
                >
                  {isToday && !isSelected && <View style={cal.todayDot} />}
                  <Text style={[
                    cal.dayText,
                    isSelected && cal.daySelected,
                    isPast && cal.dayPast,
                    isToday && !isSelected && cal.dayToday,
                  ]}>
                    {day.getDate()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Search panel ─────────────────────────────────────────────────────────────

interface SearchPanelProps {
  origin: PickedLocation | null;
  destination: PickedLocation | null;
  date: Date;
  onOriginPress: () => void;
  onDestinationPress: () => void;
  onDatePress: () => void;
  onSwap: () => void;
  onSearch: () => void;
}

function SearchPanel({
  origin, destination, date,
  onOriginPress, onDestinationPress, onDatePress, onSwap, onSearch,
}: SearchPanelProps) {
  return (
    <View style={panel.card}>
      {/* From */}
      <View style={panel.fieldWrap}>
        <Text style={panel.fieldLabel}>FROM</Text>
        <Pressable style={panel.field} onPress={onOriginPress}>
          <Text style={panel.fieldIcon}>📍</Text>
          <Text
            style={[panel.fieldValue, !origin && panel.placeholder]}
            numberOfLines={1}
          >
            {origin?.address ?? "Pin pickup location on map"}
          </Text>
          <Text style={panel.mapHint}>🗺</Text>
        </Pressable>
      </View>

      {/* Swap */}
      <Pressable style={panel.swapBtn} onPress={onSwap}>
        <Text style={panel.swapIcon}>⇅</Text>
      </Pressable>

      {/* To */}
      <View style={panel.fieldWrap}>
        <Text style={panel.fieldLabel}>TO</Text>
        <Pressable style={panel.field} onPress={onDestinationPress}>
          <Text style={panel.fieldIcon}>🏁</Text>
          <Text
            style={[panel.fieldValue, !destination && panel.placeholder]}
            numberOfLines={1}
          >
            {destination?.address ?? "Pin destination on map"}
          </Text>
          <Text style={panel.mapHint}>🗺</Text>
        </Pressable>
      </View>

      <View style={panel.divider} />

      {/* Date */}
      <View style={panel.fieldWrap}>
        <Text style={panel.fieldLabel}>DATE</Text>
        <Pressable style={panel.field} onPress={onDatePress}>
          <Text style={panel.fieldIcon}>📅</Text>
          <Text style={panel.fieldValue}>{formatDate(date)}</Text>
          <Text style={panel.mapHint}>›</Text>
        </Pressable>
      </View>

      <Pressable style={panel.searchBtn} onPress={onSearch}>
        <Text style={panel.searchBtnText}>Find vehicles</Text>
      </Pressable>
    </View>
  );
}

// ─── Results summary ──────────────────────────────────────────────────────────

function ResultsSummary({
  count,
  criteria,
  onClear,
}: {
  count: number;
  criteria: SearchCriteria;
  onClear: () => void;
}) {
  const parts: string[] = [];
  if (criteria.date) parts.push(formatDate(criteria.date));
  if (criteria.origin) parts.push(criteria.origin.address.split(",")[0]);
  if (criteria.destination) parts.push(criteria.destination.address.split(",")[0]);

  return (
    <View style={rs.row}>
      <View style={rs.chip}>
        <Text style={rs.count}>{count}</Text>
        <Text style={rs.label}> vehicle{count !== 1 ? "s" : ""} found</Text>
        {parts.length > 0 && (
          <Text style={rs.label} numberOfLines={1}> · {parts.join(" · ")}</Text>
        )}
      </View>
      <Pressable onPress={onClear}>
        <Text style={rs.clear}>Clear ✕</Text>
      </Pressable>
    </View>
  );
}

// ─── Locked overlay ───────────────────────────────────────────────────────────

function LockedOverlay({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={locked.overlay} onPress={onPress}>
      <View style={locked.badge}>
        <Text style={locked.icon}>🔒</Text>
      </View>
      <Text style={locked.text}>Sign up to see more ↗</Text>
    </Pressable>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <View style={empty.wrap}>
      <Text style={empty.icon}>🚗</Text>
      <Text style={empty.title}>No vehicles found</Text>
      <Text style={empty.sub}>Try a different date or category.</Text>
    </View>
  );
}

// ─── Guest CTA card ───────────────────────────────────────────────────────────

function GuestCtaCard({ onRegister, onSignIn }: { onRegister: () => void; onSignIn: () => void }) {
  return (
    <View style={cta.card}>
      <View style={cta.circle1} />
      <View style={cta.circle2} />
      <Text style={cta.title}>Book your first ride</Text>
      <Text style={cta.sub}>
        Create a free account to book vehicles, track your rentals, and enjoy exclusive deals.
      </Text>
      <View style={cta.actions}>
        <Pressable style={cta.primary} onPress={onRegister}>
          <Text style={cta.primaryText}>Create account</Text>
        </Pressable>
        <Pressable style={cta.ghost} onPress={onSignIn}>
          <Text style={cta.ghostText}>Sign in</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function GuestHome() {
  const router = useRouter();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [origin, setOrigin] = useState<PickedLocation | null>(null);
  const [destination, setDestination] = useState<PickedLocation | null>(null);
  const [date, setDate] = useState<Date>(today);
  const [category, setCategory] = useState<HomeCategory>("All");
  const [hasSearched, setHasSearched] = useState(false);
  const [appliedCriteria, setAppliedCriteria] = useState<SearchCriteria | null>(null);

  const [showOriginMap, setShowOriginMap] = useState(false);
  const [showDestMap, setShowDestMap] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const displayedVehicles = filterVehicles(MOCK_VEHICLES, {
    origin: appliedCriteria?.origin ?? null,
    destination: appliedCriteria?.destination ?? null,
    date: appliedCriteria?.date ?? null,
    category,
  });

  const handleSearch = () => {
    const criteria: SearchCriteria = { origin, destination, date, category };
    setAppliedCriteria(criteria);
    setHasSearched(true);
  };

  const handleClear = () => {
    setAppliedCriteria(null);
    setHasSearched(false);
    setOrigin(null);
    setDestination(null);
    setDate(today);
    setCategory("All");
  };

  const handleSwap = () => {
    const tmp = origin;
    setOrigin(destination);
    setDestination(tmp);
  };

  const goToLogin = () => router.push("/(auth)/login");
  const goToRegister = () => router.push("/(auth)/register");

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.greeting}>Welcome to DriveEasy 🚗</Text>
          <Pressable style={s.signInPill} onPress={goToLogin}>
            <Text style={s.signInPillText}>Sign in</Text>
          </Pressable>
        </View>

        {/* Search panel */}
        <SearchPanel
          origin={origin}
          destination={destination}
          date={date}
          onOriginPress={() => setShowOriginMap(true)}
          onDestinationPress={() => setShowDestMap(true)}
          onDatePress={() => setShowCalendar(true)}
          onSwap={handleSwap}
          onSearch={handleSearch}
        />

        {/* Category chips */}
        <FilterChips active={category} onSelect={setCategory} />

        {/* Section label / results summary */}
        {hasSearched && appliedCriteria ? (
          <ResultsSummary
            count={displayedVehicles.length}
            criteria={appliedCriteria}
            onClear={handleClear}
          />
        ) : (
          <Text style={s.sectionLabel}>All available vehicles</Text>
        )}

        {/* Vehicle list */}
        {displayedVehicles.length === 0 ? (
          <EmptyState />
        ) : (
          <View style={s.list}>
            {displayedVehicles.map((vehicle, index) => {
              const locked = index >= 2;
              return (
                <View key={vehicle.id} style={locked ? s.lockedWrap : undefined}>
                  <View style={locked ? s.lockedCard : undefined}>
                    <VehicleCard
                      vehicle={vehicle}
                      schedule={{
                        pickupLocation: vehicle.pickupLocation,
                        dropoffLocations: vehicle.dropoffLocations,
                        availableDates: formatDateRange(vehicle.availableFrom, vehicle.availableTo),
                      }}
                      onPress={locked ? undefined : () => {}}
                    />
                  </View>
                  {locked && <LockedOverlay onPress={goToRegister} />}
                </View>
              );
            })}
          </View>
        )}

        {/* Guest CTA */}
        <GuestCtaCard onRegister={goToRegister} onSignIn={goToLogin} />
      </ScrollView>

      {/* Map pickers — rendered outside ScrollView so they can go full-screen */}
      <MapLocationPicker
        visible={showOriginMap}
        title="Select pickup location"
        initialLocation={origin}
        onConfirm={setOrigin}
        onClose={() => setShowOriginMap(false)}
      />
      <MapLocationPicker
        visible={showDestMap}
        title="Select destination"
        initialLocation={destination}
        onConfirm={setDestination}
        onClose={() => setShowDestMap(false)}
      />
      <CalendarModal
        visible={showCalendar}
        selected={date}
        onSelect={setDate}
        onClose={() => setShowCalendar(false)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.pageBg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingTop: 16, paddingBottom: 40, gap: 14 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  greeting: { fontSize: 17, fontWeight: "500", color: colors.textPrimary, flex: 1, marginRight: 8 },
  signInPill: {
    backgroundColor: colors.primary, borderRadius: radius.pill,
    paddingVertical: 8, paddingHorizontal: 16, flexShrink: 0,
  },
  signInPillText: { fontSize: 13, fontWeight: "500", color: "#fff" },
  sectionLabel: {
    fontSize: 12, fontWeight: "500", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 0.6,
  },
  list: { gap: 12 },
  lockedWrap: { position: "relative" },
  lockedCard: { opacity: 0.35 },
});

const panel = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 0.5, borderColor: colors.borderDefault,
    padding: 16, gap: 10,
  },
  fieldWrap: { gap: 4 },
  fieldLabel: {
    fontSize: 11, fontWeight: "500", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 0.5,
  },
  field: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: colors.pageBg, borderWidth: 0.5,
    borderColor: colors.borderEmphasis, borderRadius: radius.sm,
    paddingHorizontal: 12, paddingVertical: 11,
  },
  fieldIcon: { fontSize: 14 },
  fieldValue: { flex: 1, fontSize: 14, color: colors.textPrimary },
  placeholder: { color: colors.textTertiary },
  mapHint: { fontSize: 16, color: colors.textSecondary },
  swapBtn: {
    alignSelf: "flex-end", backgroundColor: colors.primaryBg,
    borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 6,
  },
  swapIcon: { fontSize: 16, color: colors.primary },
  divider: { height: 0.5, backgroundColor: colors.borderDefault },
  searchBtn: {
    backgroundColor: colors.primary, borderRadius: radius.sm,
    paddingVertical: 13, alignItems: "center", marginTop: 2,
  },
  searchBtnText: { fontSize: 14, fontWeight: "500", color: "#fff" },
});

const cal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 40, gap: 4,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: colors.borderDefault,
    alignSelf: "center", marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: "500", color: colors.textPrimary, marginBottom: 8 },
  monthNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  navBtn: { padding: 8 },
  navArrow: { fontSize: 22, color: colors.primary, fontWeight: "500" },
  monthLabel: { fontSize: 15, fontWeight: "500", color: colors.textPrimary },
  weekRow: { flexDirection: "row", marginBottom: 6 },
  weekLabel: { width: "14.28%", textAlign: "center", fontSize: 12, fontWeight: "500", color: colors.textSecondary },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "14.28%", aspectRatio: 1, alignItems: "center", justifyContent: "center", position: "relative" },
  cellSelected: { backgroundColor: colors.primary, borderRadius: radius.pill },
  cellPast: { opacity: 0.35 },
  todayDot: { position: "absolute", bottom: 4, width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary },
  dayText: { fontSize: 14, color: colors.textPrimary },
  daySelected: { color: "#fff", fontWeight: "600" },
  dayPast: { color: colors.textTertiary },
  dayToday: { color: colors.primary, fontWeight: "600" },
});

const rs = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  chip: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 },
  count: { fontSize: 13, fontWeight: "600", color: colors.primary },
  label: { fontSize: 13, color: colors.textSecondary },
  clear: { fontSize: 13, color: colors.danger },
});

const locked = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(24,95,165,0.12)",
    borderRadius: radius.md, alignItems: "center", justifyContent: "center", gap: 8,
  },
  badge: { backgroundColor: colors.primary, borderRadius: radius.pill, padding: 10 },
  icon: { fontSize: 16 },
  text: { fontSize: 13, fontWeight: "500", color: colors.primary },
});

const empty = StyleSheet.create({
  wrap: { alignItems: "center", paddingVertical: 32, gap: 8 },
  icon: { fontSize: 40 },
  title: { fontSize: 15, fontWeight: "500", color: colors.textPrimary },
  sub: { fontSize: 13, color: colors.textSecondary, textAlign: "center" },
});

const cta = StyleSheet.create({
  card: { backgroundColor: colors.primary, borderRadius: radius.md, padding: 18, overflow: "hidden", gap: 6 },
  circle1: { position: "absolute", width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.07)", top: -30, right: -20 },
  circle2: { position: "absolute", width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.05)", bottom: -20, right: 60 },
  title: { fontSize: 16, fontWeight: "500", color: "#fff" },
  sub: { fontSize: 12, color: colors.primaryLighter, lineHeight: 18 },
  actions: { flexDirection: "row", gap: 10, marginTop: 10 },
  primary: { backgroundColor: "#fff", borderRadius: radius.sm, paddingVertical: 10, paddingHorizontal: 16 },
  primaryText: { fontSize: 13, fontWeight: "500", color: colors.primary },
  ghost: { backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 0.5, borderColor: "rgba(255,255,255,0.3)", borderRadius: radius.sm, paddingVertical: 10, paddingHorizontal: 16 },
  ghostText: { fontSize: 13, color: "#fff" },
});
