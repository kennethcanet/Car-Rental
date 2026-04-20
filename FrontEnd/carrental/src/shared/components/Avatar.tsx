import { Pressable, StyleSheet, Text, type PressableProps } from "react-native";
import { colors, radius } from "@/shared/theme";

interface Props extends PressableProps {
  firstName: string;
  lastName: string;
  size?: number;
}

export function Avatar({ firstName, lastName, size = 40, onPress, ...rest }: Props) {
  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();

  return (
    <Pressable
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}
      onPress={onPress}
      {...rest}
    >
      <Text style={[styles.initials, { fontSize: size * 0.35 }]}>{initials}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: { color: "#fff", fontWeight: "500" },
});
