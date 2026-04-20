import { forwardRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";
import { colors, radius } from "@/shared/theme";

interface Props extends TextInputProps {
  label: string;
  error?: string;
  /** Show show/hide password toggle. Only meaningful when secureTextEntry is true. */
  passwordToggle?: boolean;
}

export const FormInput = forwardRef<TextInput, Props>(
  ({ label, error, passwordToggle, secureTextEntry, style, ...rest }, ref) => {
    const [hidden, setHidden] = useState(secureTextEntry ?? false);

    return (
      <View>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
        <View style={[styles.row, error && styles.inputError]}>
          <TextInput
            ref={ref}
            style={[styles.input, style]}
            secureTextEntry={passwordToggle ? hidden : secureTextEntry}
            placeholderTextColor={colors.textTertiary}
            {...rest}
          />
          {passwordToggle && (
            <Pressable onPress={() => setHidden((h) => !h)} style={styles.toggle}>
              <Text style={styles.toggleText}>{hidden ? "Show" : "Hide"}</Text>
            </Pressable>
          )}
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  },
);

FormInput.displayName = "FormInput";

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textSecondary,
    letterSpacing: 0.6,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.pageBg,
    borderWidth: 0.5,
    borderColor: colors.borderEmphasis,
    borderRadius: radius.sm,
  },
  inputError: { borderColor: colors.danger },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  toggle: { paddingHorizontal: 12 },
  toggleText: { fontSize: 12, color: colors.primary, fontWeight: "500" },
  error: { fontSize: 12, color: colors.danger, marginTop: 4 },
});
