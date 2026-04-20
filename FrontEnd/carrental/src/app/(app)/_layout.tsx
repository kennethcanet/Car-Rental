import { colors, radius } from "@/shared/theme";
import { useAuthStore } from "@/store/auth.store";
import { Tabs, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

function LockDot() {
  return (
    <View style={styles.lockDot}>
      <Text style={styles.lockDotText}>🔒</Text>
    </View>
  );
}

function TabIcon({
  emoji,
  focused,
  locked,
}: {
  emoji: string;
  focused: boolean;
  locked?: boolean;
}) {
  return (
    <View style={styles.iconWrap}>
      <Text style={[styles.icon, focused && styles.iconActive]}>{emoji}</Text>
      {locked && <LockDot />}
    </View>
  );
}

function GatedTabButton({
  children,
  onPress,
  isAuthenticated,
  ...rest
}: React.ComponentProps<typeof Pressable> & { isAuthenticated: boolean }) {
  const router = useRouter();
  return (
    <Pressable
      {...rest}
      onPress={(e) => {
        if (!isAuthenticated) {
          router.push("/(auth)/login");
        } else {
          (onPress as (e: Parameters<typeof onPress>[0]) => void)?.(e);
        }
      }}
    >
      {children}
    </Pressable>
  );
}

export default function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: styles.label,
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="catalog/index"
        options={{
          title: "Catalog",
          tabBarIcon: ({ focused }) => <TabIcon emoji="🚗" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="bookings/index"
        options={{
          title: "Bookings",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📅" focused={focused} locked={!isAuthenticated} />
          ),
          tabBarButton: (props) => (
            <GatedTabButton
              {...(props as any)}
              isAuthenticated={isAuthenticated}
            />
          ),
        }}
      />
      {/* Hide remaining screens from the tab bar */}
      <Tabs.Screen name="locations/index" options={{ href: null }} />
      <Tabs.Screen name="profile/index" options={{ href: null }} />
      <Tabs.Screen name="browse/index" options={{ href: null }} />
      <Tabs.Screen name="my-rentals/index" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 0.5,
    borderTopColor: colors.borderDefault,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingTop: 8,
  },
  label: { fontSize: 10, fontWeight: "500" },
  iconWrap: { alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 20, opacity: 0.5 },
  iconActive: { opacity: 1 },
  lockDot: {
    position: "absolute",
    top: -4,
    right: -8,
    width: 14,
    height: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  lockDotText: { fontSize: 7 },
});
