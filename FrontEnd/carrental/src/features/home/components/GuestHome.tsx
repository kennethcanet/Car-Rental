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
  type VehicleWithSchedule,
} from "@/features/home/mockData";
import { FilterChips } from "@/features/home/components/FilterChips";
import { VehicleCard } from "@/features/vehicles/components/VehicleCard";
import { MapLocationPicker } from "@/shared/components/MapLocationPicker";
import type { PickedLocation } from "@/shared/types";
import { colors, radius, spacing } from "@/shared/theme";

// ─── Booking type ─────────────────────────────────────────────────────────────

type BookingType = "self-drive" | "with-driver" | "passenger";

const BOOKING_TYPES: {
  value: BookingType;
  label: string;
  icon: string;
  sub: string;
  description: string;
  color: string;
}[] = [
  {
    value: "self-drive",
    label: "Self Drive",
    icon: "🚗",
    sub: "You drive",
    description: "Rent the vehicle and drive at your own pace.",
    color: colors.primary,
  },
  {
    value: "with-driver",
    label: "With Driver",
    icon: "👨‍✈️",
    sub: "We drive",
    description: "A professional driver is assigned to you.",
    color: "#6D5BD0",
  },
  {
    value: "passenger",
    label: "Passenger",
    icon: "💺",
    sub: "Book a seat",
    description: "Book a seat on a scheduled vehicle.",
    color: "#0D8050",
  },
];

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

// ─── Booking type selector ────────────────────────────────────────────────────

function BookingTypeSelector({
  value,
  onChange,
}: {
  value: BookingType;
  onChange: (t: BookingType) => void;
}) {
  return (
    <View style={bt.row}>
      {BOOKING_TYPES.map((t) => {
        const active = t.value === value;
        return (
          <Pressable
            key={t.value}
            style={[
              bt.item,
              active && { borderColor: t.color, backgroundColor: `${t.color}14` },
            ]}
            onPress={() => onChange(t.value)}
          >
            <Text style={bt.icon}>{t.icon}</Text>
            <Text style={[bt.label, active && { color: t.color }]}>{t.label}</Text>
            <Text style={[bt.sub, active && { color: t.color }]}>{t.sub}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Passenger stepper ───────────────────────────────────────────────────────

const MAX_PASSENGERS = 15;

function PassengerStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <View style={pax.wrap}>
      <Text style={panel.fieldLabel}>PASSENGERS</Text>
      <View style={pax.row}>
        <Pressable
          style={[pax.btn, value <= 1 && pax.btnDisabled]}
          onPress={() => onChange(Math.max(1, value - 1))}
          disabled={value <= 1}
          hitSlop={8}
        >
          <Text style={[pax.btnText, value <= 1 && pax.btnTextDisabled]}>−</Text>
        </Pressable>

        <View style={pax.countWrap}>
          <Text style={pax.icon}>👥</Text>
          <Text style={pax.count}>{value}</Text>
          <Text style={pax.unit}>pax</Text>
        </View>

        <Pressable
          style={[pax.btn, value >= MAX_PASSENGERS && pax.btnDisabled]}
          onPress={() => onChange(Math.min(MAX_PASSENGERS, value + 1))}
          disabled={value >= MAX_PASSENGERS}
          hitSlop={8}
        >
          <Text style={[pax.btnText, value >= MAX_PASSENGERS && pax.btnTextDisabled]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Search panel ─────────────────────────────────────────────────────────────

interface SearchPanelProps {
  bookingType: BookingType;
  origin: PickedLocation | null;
  destination: PickedLocation | null;
  date: Date;
  passengers: number;
  onBookingTypeChange: (t: BookingType) => void;
  onOriginPress: () => void;
  onDestinationPress: () => void;
  onDatePress: () => void;
  onPassengersChange: (n: number) => void;
  onSwap: () => void;
  onSearch: () => void;
}

function SearchPanel({
  bookingType, origin, destination, date, passengers,
  onBookingTypeChange, onOriginPress, onDestinationPress, onDatePress,
  onPassengersChange, onSwap, onSearch,
}: SearchPanelProps) {
  return (
    <View style={panel.card}>
      {/* Booking type */}
      <BookingTypeSelector value={bookingType} onChange={onBookingTypeChange} />

      <View style={panel.divider} />

      {/* From */}
      <View style={panel.fieldWrap}>
        <Text style={panel.fieldLabel}>FROM</Text>
        <Pressable style={panel.field} onPress={onOriginPress}>
          <Text style={panel.fieldIcon}>📍</Text>
          <Text style={[panel.fieldValue, !origin && panel.placeholder]} numberOfLines={1}>
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
          <Text style={[panel.fieldValue, !destination && panel.placeholder]} numberOfLines={1}>
            {destination?.address ?? "Pin destination on map"}
          </Text>
          <Text style={panel.mapHint}>🗺</Text>
        </Pressable>
      </View>

      <View style={panel.divider} />

      {/* Date + Passengers */}
      <View style={panel.row2}>
        <View style={panel.halfWrap}>
          <Text style={panel.fieldLabel}>DATE</Text>
          <Pressable style={panel.field} onPress={onDatePress}>
            <Text style={panel.fieldIcon}>📅</Text>
            <Text style={panel.fieldValue} numberOfLines={1}>{formatDate(date)}</Text>
            <Text style={panel.mapHint}>›</Text>
          </Pressable>
        </View>

        <PassengerStepper value={passengers} onChange={onPassengersChange} />
      </View>

      <Pressable style={panel.searchBtn} onPress={onSearch}>
        <Text style={panel.searchBtnText}>Find vehicles</Text>
      </Pressable>
    </View>
  );
}

// ─── Booking context strip ────────────────────────────────────────────────────

function BookingContextStrip({ bookingType }: { bookingType: BookingType }) {
  const t = BOOKING_TYPES.find((b) => b.value === bookingType)!;
  return (
    <View style={[ctx.wrap, { backgroundColor: `${t.color}0D`, borderColor: `${t.color}35` }]}>
      <Text style={ctx.icon}>{t.icon}</Text>
      <View style={ctx.textWrap}>
        <Text style={[ctx.label, { color: t.color }]}>{t.label}</Text>
        <Text style={ctx.desc}>{t.description}</Text>
      </View>
    </View>
  );
}

// ─── Vehicle group header ─────────────────────────────────────────────────────

function VehicleGroupHeader({ type, count }: { type: string; count: number }) {
  return (
    <View style={grp.header}>
      <View style={grp.pill}>
        <Text style={grp.pillText}>{type}</Text>
        <View style={grp.badge}>
          <Text style={grp.badgeText}>{count}</Text>
        </View>
      </View>
      <View style={grp.line} />
    </View>
  );
}

// ─── Results summary ──────────────────────────────────────────────────────────

function ResultsSummary({
  count,
  criteria,
  bookingType,
  onClear,
}: {
  count: number;
  criteria: SearchCriteria;
  bookingType: BookingType;
  onClear: () => void;
}) {
  const t = BOOKING_TYPES.find((b) => b.value === bookingType)!;
  const parts: string[] = [];
  if (criteria.date) parts.push(formatDate(criteria.date));
  if (criteria.origin) parts.push(criteria.origin.address.split(",")[0]);
  if (criteria.destination) parts.push(criteria.destination.address.split(",")[0]);
  if (criteria.passengers > 1) parts.push(`${criteria.passengers} pax`);

  return (
    <View style={rs.row}>
      <View style={rs.left}>
        <View style={[rs.typePill, { backgroundColor: `${t.color}14` }]}>
          <Text style={rs.typeIcon}>{t.icon}</Text>
          <Text style={[rs.typeLabel, { color: t.color }]}>{t.label}</Text>
        </View>
        <Text style={rs.count}>
          {count} vehicle{count !== 1 ? "s" : ""} found
        </Text>
        {parts.length > 0 && (
          <Text style={rs.sub} numberOfLines={1}>{parts.join(" · ")}</Text>
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
      <Text style={empty.sub}>Try a different date, category, or passenger count.</Text>
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function groupByType(
  vehicles: VehicleWithSchedule[],
): { type: string; vehicles: VehicleWithSchedule[] }[] {
  const map = new Map<string, VehicleWithSchedule[]>();
  vehicles.forEach((v) => {
    if (!map.has(v.type)) map.set(v.type, []);
    map.get(v.type)!.push(v);
  });
  return Array.from(map.entries()).map(([type, items]) => ({ type, vehicles: items }));
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function GuestHome() {
  const router = useRouter();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [bookingType, setBookingType] = useState<BookingType>("self-drive");
  const [origin, setOrigin] = useState<PickedLocation | null>(null);
  const [destination, setDestination] = useState<PickedLocation | null>(null);
  const [date, setDate] = useState<Date>(today);
  const [passengers, setPassengers] = useState(1);
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
    passengers: appliedCriteria?.passengers ?? 0,
  });

  const groups = groupByType(displayedVehicles);

  const handleSearch = () => {
    const criteria: SearchCriteria = { origin, destination, date, category, passengers };
    setAppliedCriteria(criteria);
    setHasSearched(true);
  };

  const handleClear = () => {
    setAppliedCriteria(null);
    setHasSearched(false);
    setOrigin(null);
    setDestination(null);
    setDate(today);
    setPassengers(1);
    setCategory("All");
  };

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const goToLogin = () => router.push("/(auth)/login");
  const goToRegister = () => router.push("/(auth)/register");

  // Tracks cumulative vehicle index across groups for lock threshold
  let globalIdx = 0;

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
          bookingType={bookingType}
          origin={origin}
          destination={destination}
          date={date}
          passengers={passengers}
          onBookingTypeChange={setBookingType}
          onOriginPress={() => setShowOriginMap(true)}
          onDestinationPress={() => setShowDestMap(true)}
          onDatePress={() => setShowCalendar(true)}
          onPassengersChange={setPassengers}
          onSwap={handleSwap}
          onSearch={handleSearch}
        />

        {/* Category chips */}
        <FilterChips active={category} onSelect={setCategory} />

        {/* Booking type context strip */}
        <BookingContextStrip bookingType={bookingType} />

        {/* Section label / results summary */}
        {hasSearched && appliedCriteria ? (
          <ResultsSummary
            count={displayedVehicles.length}
            criteria={appliedCriteria}
            bookingType={bookingType}
            onClear={handleClear}
          />
        ) : (
          <Text style={s.sectionLabel}>All available vehicles</Text>
        )}

        {/* Vehicle list — grouped by type */}
        {displayedVehicles.length === 0 ? (
          <EmptyState />
        ) : (
          <View style={s.groupsWrap}>
            {groups.map((group) => (
              <View key={group.type} style={s.group}>
                <VehicleGroupHeader type={group.type} count={group.vehicles.length} />
                <View style={s.list}>
                  {group.vehicles.map((vehicle) => {
                    const idx = globalIdx++;
                    const isLocked = idx >= 2;
                    return (
                      <View key={vehicle.id} style={isLocked ? s.lockedWrap : undefined}>
                        <View style={isLocked ? s.lockedCard : undefined}>
                          <VehicleCard
                            vehicle={vehicle}
                            schedule={{
                              pickupLocation: vehicle.pickupLocation,
                              dropoffLocations: vehicle.dropoffLocations,
                              availableDates: formatDateRange(
                                vehicle.availableFrom,
                                vehicle.availableTo,
                              ),
                            }}
                            onPress={isLocked ? undefined : () => {}}
                          />
                        </View>
                        {isLocked && <LockedOverlay onPress={goToRegister} />}
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Guest CTA */}
        <GuestCtaCard onRegister={goToRegister} onSignIn={goToLogin} />
      </ScrollView>

      {/* Map pickers — rendered outside ScrollView so they go full-screen */}
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
  groupsWrap: { gap: 20 },
  group: { gap: 10 },
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
  row2: { flexDirection: "row", gap: 10 },
  halfWrap: { flex: 1, gap: 4 },
  searchBtn: {
    backgroundColor: colors.primary, borderRadius: radius.sm,
    paddingVertical: 13, alignItems: "center", marginTop: 2,
  },
  searchBtnText: { fontSize: 14, fontWeight: "500", color: "#fff" },
});

const bt = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  item: {
    flex: 1, alignItems: "center", gap: 2,
    borderWidth: 1.5, borderColor: colors.borderDefault,
    borderRadius: radius.sm, paddingVertical: 10, paddingHorizontal: 4,
    backgroundColor: colors.pageBg,
  },
  icon: { fontSize: 20 },
  label: { fontSize: 12, fontWeight: "600", color: colors.textPrimary, textAlign: "center" },
  sub: { fontSize: 10, color: colors.textTertiary, textAlign: "center" },
});

const ctx = StyleSheet.create({
  wrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderWidth: 0.5, borderRadius: radius.sm,
    paddingVertical: 8, paddingHorizontal: 12,
  },
  icon: { fontSize: 18 },
  textWrap: { flex: 1, gap: 1 },
  label: { fontSize: 12, fontWeight: "600" },
  desc: { fontSize: 11, color: colors.textSecondary },
});

const grp = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  pill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: colors.surface, borderWidth: 0.5,
    borderColor: colors.borderEmphasis, borderRadius: radius.pill,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  pillText: { fontSize: 12, fontWeight: "600", color: colors.textPrimary },
  badge: {
    backgroundColor: colors.primary, borderRadius: radius.pill,
    minWidth: 18, alignItems: "center", paddingHorizontal: 5, paddingVertical: 1,
  },
  badgeText: { fontSize: 10, fontWeight: "600", color: "#fff" },
  line: { flex: 1, height: 0.5, backgroundColor: colors.borderDefault },
});

const pax = StyleSheet.create({
  wrap: { flex: 1, gap: 4 },
  row: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: colors.pageBg, borderWidth: 0.5,
    borderColor: colors.borderEmphasis, borderRadius: radius.sm,
    paddingHorizontal: 10, paddingVertical: 8,
  },
  btn: {
    width: 28, height: 28, borderRadius: radius.pill,
    backgroundColor: colors.primaryBg, alignItems: "center", justifyContent: "center",
  },
  btnDisabled: { backgroundColor: colors.borderDefault },
  btnText: { fontSize: 18, color: colors.primary, lineHeight: 22, fontWeight: "500" },
  btnTextDisabled: { color: colors.textTertiary },
  countWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  icon: { fontSize: 13 },
  count: { fontSize: 15, fontWeight: "600", color: colors.textPrimary },
  unit: { fontSize: 11, color: colors.textSecondary },
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
  row: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  left: { flex: 1, gap: 3, marginRight: 8 },
  typePill: {
    flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start",
    borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 2,
  },
  typeIcon: { fontSize: 12 },
  typeLabel: { fontSize: 11, fontWeight: "600" },
  count: { fontSize: 14, fontWeight: "600", color: colors.textPrimary },
  sub: { fontSize: 12, color: colors.textSecondary },
  clear: { fontSize: 13, color: colors.danger, marginTop: 2 },
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
