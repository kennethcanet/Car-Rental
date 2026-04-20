/**
 * Web fallback for MapLocationPicker.
 * react-native-maps is native-only and cannot run on web.
 * This stub replaces the map with a searchable list of preset locations.
 */
import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { PickedLocation } from "@/shared/types";
import { colors, radius } from "@/shared/theme";

const PRESET_LOCATIONS: { label: string; latitude: number; longitude: number }[] = [
  { label: "NAIA Terminal 3, Pasay",       latitude: 14.5086, longitude: 121.0197 },
  { label: "BGC, Taguig",                  latitude: 14.5469, longitude: 121.0509 },
  { label: "Makati CBD, Makati",           latitude: 14.5547, longitude: 121.0244 },
  { label: "Ortigas Center, Pasig",        latitude: 14.5873, longitude: 121.0615 },
  { label: "SM Mall of Asia, Pasay",       latitude: 14.5354, longitude: 120.9822 },
  { label: "Quezon City Hall, QC",         latitude: 14.6509, longitude: 121.0493 },
  { label: "Clark Airport, Pampanga",      latitude: 15.1860, longitude: 120.5600 },
  { label: "Robinsons Galleria, Pasig",    latitude: 14.5869, longitude: 121.0565 },
];

interface Props {
  visible: boolean;
  title: string;
  initialLocation?: PickedLocation | null;
  onConfirm: (location: PickedLocation) => void;
  onClose: () => void;
}

export function MapLocationPicker({ visible, title, initialLocation, onConfirm, onClose }: Props) {
  const [query, setQuery] = useState("");

  const filtered = PRESET_LOCATIONS.filter((l) =>
    l.label.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelect = (loc: (typeof PRESET_LOCATIONS)[number]) => {
    onConfirm({ latitude: loc.latitude, longitude: loc.longitude, address: loc.label });
    setQuery("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={s.sheet} onPress={() => {}}>
          <View style={s.handle} />
          <Text style={s.title}>{title}</Text>

          <View style={s.searchRow}>
            <Text style={s.searchIcon}>🔍</Text>
            <TextInput
              style={s.input}
              placeholder="Search location…"
              placeholderTextColor={colors.textTertiary}
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
          </View>

          <View style={s.note}>
            <Text style={s.noteText}>📌 Map picker available on iOS & Android</Text>
          </View>

          {filtered.map((loc) => {
            const active = initialLocation?.address === loc.label;
            return (
              <Pressable
                key={loc.label}
                style={[s.option, active && s.optionActive]}
                onPress={() => handleSelect(loc)}
              >
                <Text style={s.optionIcon}>📍</Text>
                <Text style={[s.optionText, active && s.optionTextActive]} numberOfLines={1}>
                  {loc.label}
                </Text>
                {active && <Text style={s.check}>✓</Text>}
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    gap: 4,
    maxHeight: "80%",
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: colors.borderDefault,
    alignSelf: "center", marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: "500", color: colors.textPrimary, marginBottom: 10 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.pageBg,
    borderWidth: 0.5,
    borderColor: colors.borderEmphasis,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  searchIcon: { fontSize: 14 },
  input: { flex: 1, paddingVertical: 10, fontSize: 14, color: colors.textPrimary },
  note: {
    backgroundColor: colors.primaryBg,
    borderRadius: radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  noteText: { fontSize: 12, color: colors.primary },
  option: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 12, paddingHorizontal: 4,
    borderBottomWidth: 0.5, borderBottomColor: colors.borderDefault,
  },
  optionActive: {
    backgroundColor: colors.primaryBg,
    marginHorizontal: -4, paddingHorizontal: 8,
    borderRadius: radius.sm,
  },
  optionIcon: { fontSize: 14 },
  optionText: { flex: 1, fontSize: 14, color: colors.textPrimary },
  optionTextActive: { color: colors.primary, fontWeight: "500" },
  check: { fontSize: 14, color: colors.primary, fontWeight: "700" },
});
