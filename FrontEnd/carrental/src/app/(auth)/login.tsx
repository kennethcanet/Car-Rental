import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authApi } from "@/features/auth/api";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/shared/components/Button";
import { FormInput } from "@/shared/components/FormInput";
import { LogoMark } from "@/shared/components/LogoMark";
import { colors, radius, spacing } from "@/shared/theme";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.login(data);
      setAuth(res.accessToken, res.refreshToken, {
        userId: res.userId,
        email: res.email,
        firstName: res.firstName,
        lastName: res.lastName,
        roles: res.roles,
      });
      router.replace("/(app)/home");
    } catch {
      setError("root", { message: "Invalid email or password" });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <LogoMark />

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.subheading}>Sign in to your account</Text>

          <View style={styles.fields}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Email"
                  placeholder="you@example.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Password"
                  placeholder="••••••••"
                  secureTextEntry
                  passwordToggle
                  autoComplete="current-password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message}
                />
              )}
            />

            <Pressable
              style={styles.forgotWrap}
              onPress={() => router.push("/(auth)/forgot-password")}
            >
              <Text style={styles.forgot}>Forgot password?</Text>
            </Pressable>
          </View>

          {errors.root && (
            <Text style={styles.rootError}>{errors.root.message}</Text>
          )}

          <Button
            label="Sign in"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            style={styles.signInBtn}
          />

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social buttons */}
          <View style={styles.socialRow}>
            <Pressable style={styles.socialBtn}>
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialLabel}>Google</Text>
            </Pressable>
            <Pressable style={styles.socialBtn}>
              <Text style={styles.socialIcon}></Text>
              <Text style={styles.socialLabel}>Apple</Text>
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>No account yet? </Text>
          <Pressable onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.footerLink}>Sign up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.pageBg },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: 40,
    gap: spacing.lg,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.borderDefault,
    padding: spacing.panelPad,
  },

  heading: {
    fontSize: 18,
    fontWeight: "500",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subheading: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 20,
  },

  fields: { gap: 14 },

  forgotWrap: { alignSelf: "flex-end" },
  forgot: { fontSize: 12, color: colors.primary },

  rootError: {
    fontSize: 13,
    color: colors.danger,
    textAlign: "center",
    marginTop: 12,
  },

  signInBtn: { marginTop: 20 },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 20,
  },
  dividerLine: { flex: 1, height: 0.5, backgroundColor: colors.borderDefault },
  dividerText: { fontSize: 12, color: colors.textSecondary },

  socialRow: { flexDirection: "row", gap: 10 },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 11,
    backgroundColor: colors.pageBg,
    borderWidth: 0.5,
    borderColor: colors.borderEmphasis,
    borderRadius: radius.sm,
  },
  socialIcon: { fontSize: 15, fontWeight: "700", color: colors.textPrimary },
  socialLabel: { fontSize: 13, color: colors.textPrimary, fontWeight: "500" },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: { fontSize: 13, color: colors.textSecondary },
  footerLink: { fontSize: 13, color: colors.primary, fontWeight: "500" },
});
