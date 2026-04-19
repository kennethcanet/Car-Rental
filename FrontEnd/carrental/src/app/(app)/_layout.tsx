import { Tabs } from "expo-router";

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#208AEF",
      }}
    >
      <Tabs.Screen name="browse/index" options={{ title: "Browse" }} />
      <Tabs.Screen name="my-rentals/index" options={{ title: "My Rentals" }} />
      <Tabs.Screen name="profile/index" options={{ title: "Profile" }} />
    </Tabs>
  );
}
