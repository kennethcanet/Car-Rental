import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors, radius } from "@/shared/theme";

type Variant = "primary" | "secondary" | "ghost";

interface Props extends PressableProps {
  label: string;
  variant?: Variant;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, variant = "primary", loading = false, style, disabled, onPress, ...rest }: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={[styles.base, styles[variant], isDisabled && styles.disabled, style]}
      disabled={isDisabled}
      onPress={onPress}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : colors.primary} />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: { opacity: 0.55 },

  // Variants
  primary: { backgroundColor: colors.primary },
  secondary: {
    backgroundColor: colors.pageBg,
    borderWidth: 0.5,
    borderColor: colors.borderEmphasis,
  },
  ghost: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.3)",
  },

  // Labels
  label: { fontSize: 14, fontWeight: "500" },
  primaryLabel: { color: "#fff" },
  secondaryLabel: { color: colors.textPrimary },
  ghostLabel: { color: "#fff" },
});
