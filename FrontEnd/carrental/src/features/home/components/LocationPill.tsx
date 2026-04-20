import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius } from "@/shared/theme";

interface Props {
  location?: string;
  onPress?: () => void;
}

export function LocationPill({ location = "Manila, Philippines", onPress }: Props) {
  return (
    <Pressable style={styles.pill} onPress={onPress}>
      <Text style={styles.pin}>📍</Text>
      <Text style={styles.text}>{location}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.borderEmphasis,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  pin: { fontSize: 13 },
  text: { fontSize: 13, color: colors.textPrimary },
  chevron: { fontSize: 16, color: colors.textSecondary },
});
