import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { type Region } from "react-native-maps";
import type { PickedLocation } from "@/shared/types";
import { colors, radius } from "@/shared/theme";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Default center: Metro Manila */
const METRO_MANILA: Region = {
  latitude: 14.5995,
  longitude: 120.9842,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// ─── Reverse geocoding via Nominatim (OpenStreetMap, free, no API key) ────────

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { "Accept-Language": "en-PH,en" } },
    );
    if (!res.ok) throw new Error("geocode failed");
    const data = await res.json();
    const a = data.address ?? {};
    const parts = [
      a.road ?? a.pedestrian ?? a.footway,
      a.suburb ?? a.neighbourhood ?? a.city_district,
      a.city ?? a.town ?? a.village ?? a.county,
    ].filter(Boolean);
    return parts.length ? parts.join(", ") : (data.display_name ?? `${lat.toFixed(5)}, ${lon.toFixed(5)}`);
  } catch {
    return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  }
}

// ─── Center pin ───────────────────────────────────────────────────────────────

function CenterPin({ loading }: { loading: boolean }) {
  return (
    <View style={pin.wrap} pointerEvents="none">
      {loading ? (
        <ActivityIndicator color={colors.primary} style={pin.spinner} />
      ) : (
        <View style={pin.head} />
      )}
      <View style={pin.stem} />
      <View style={pin.shadow} />
    </View>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  title: string;
  /** Pre-select a previously picked location when reopening. */
  initialLocation?: PickedLocation | null;
  onConfirm: (location: PickedLocation) => void;
  onClose: () => void;
}

export function MapLocationPicker({
  visible,
  title,
  initialLocation,
  onConfirm,
  onClose,
}: Props) {
  const initialRegion: Region = initialLocation
    ? {
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : METRO_MANILA;

  const [address, setAddress] = useState<string>(initialLocation?.address ?? "");
  const [geocoding, setGeocoding] = useState(false);
  const currentRegion = useRef<Region>(initialRegion);
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleRegionChange = useCallback(() => {
    // Clear any pending geocode while dragging
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    setGeocoding(true);
    setAddress("");
  }, []);

  const handleRegionChangeComplete = useCallback((region: Region) => {
    currentRegion.current = region;
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    // Debounce 600 ms so we don't spam while user is still panning
    geocodeTimer.current = setTimeout(async () => {
      const result = await reverseGeocode(region.latitude, region.longitude);
      setAddress(result);
      setGeocoding(false);
    }, 600);
  }, []);

  const handleConfirm = () => {
    onConfirm({
      latitude: currentRegion.current.latitude,
      longitude: currentRegion.current.longitude,
      address,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <SafeAreaView style={s.safe}>
        {/* Header */}
        <View style={s.header}>
          <Pressable style={s.backBtn} onPress={onClose} hitSlop={12}>
            <Text style={s.backIcon}>‹</Text>
          </Pressable>
          <Text style={s.title}>{title}</Text>
          <View style={s.backBtn} />
        </View>

        {/* Map */}
        <View style={s.mapWrap}>
          <MapView
            style={s.map}
            initialRegion={initialRegion}
            onRegionChange={handleRegionChange}
            onRegionChangeComplete={handleRegionChangeComplete}
            showsUserLocation
            showsMyLocationButton
            toolbarEnabled={false}
          />

          {/* Fixed center pin */}
          <View style={s.pinAnchor} pointerEvents="none">
            <CenterPin loading={geocoding} />
          </View>
        </View>

        {/* Bottom confirm panel */}
        <View style={s.panel}>
          <View style={s.addressRow}>
            <Text style={s.addressIcon}>📍</Text>
            <View style={s.addressTextWrap}>
              <Text style={s.addressLabel}>SELECTED LOCATION</Text>
              {geocoding || !address ? (
                <Text style={s.addressLoading}>Detecting location…</Text>
              ) : (
                <Text style={s.addressText} numberOfLines={2}>{address}</Text>
              )}
            </View>
          </View>

          <Pressable
            style={[s.confirmBtn, (geocoding || !address) && s.confirmDisabled]}
            onPress={handleConfirm}
            disabled={geocoding || !address}
          >
            <Text style={s.confirmText}>Confirm this location</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderDefault,
  },
  backBtn: { width: 36, alignItems: "center" },
  backIcon: { fontSize: 28, color: colors.primary, lineHeight: 32 },
  title: { fontSize: 16, fontWeight: "500", color: colors.textPrimary },

  mapWrap: { flex: 1, position: "relative" },
  map: { ...StyleSheet.absoluteFillObject },

  pinAnchor: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    // Offset upward so the pin tip sits on the target point
    marginTop: -36,
  },

  panel: {
    backgroundColor: colors.surface,
    borderTopWidth: 0.5,
    borderTopColor: colors.borderDefault,
    padding: 20,
    gap: 14,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: colors.pageBg,
    borderRadius: radius.sm,
    padding: 12,
  },
  addressIcon: { fontSize: 20, marginTop: 2 },
  addressTextWrap: { flex: 1, gap: 2 },
  addressLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  addressText: { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
  addressLoading: { fontSize: 14, color: colors.textTertiary },

  confirmBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmDisabled: { opacity: 0.5 },
  confirmText: { fontSize: 14, fontWeight: "500", color: "#fff" },
});

// Pin shape styles
const pin = StyleSheet.create({
  wrap: { alignItems: "center" },
  spinner: { marginBottom: 4 },
  head: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  stem: {
    width: 3,
    height: 14,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  shadow: {
    width: 10,
    height: 4,
    borderRadius: 5,
    backgroundColor: "rgba(0,0,0,0.15)",
    marginTop: 2,
  },
});
