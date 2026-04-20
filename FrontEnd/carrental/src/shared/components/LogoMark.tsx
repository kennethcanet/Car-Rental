import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/shared/theme";

interface Props {
  size?: "sm" | "md";
}

export function LogoMark({ size = "md" }: Props) {
  const iconSize = size === "sm" ? 40 : 56;
  const nameFontSize = size === "sm" ? 18 : 22;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.iconBox, { width: iconSize, height: iconSize }]}>
        <Text style={styles.iconText}>🚗</Text>
      </View>
      <Text style={[styles.name, { fontSize: nameFontSize }]}>DriveEasy</Text>
      <Text style={styles.tagline}>Rent. Drive. Arrive.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: "center", gap: 6 },
  iconBox: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 26 },
  name: { fontWeight: "500", color: colors.textPrimary },
  tagline: { fontSize: 13, color: colors.textSecondary },
});
