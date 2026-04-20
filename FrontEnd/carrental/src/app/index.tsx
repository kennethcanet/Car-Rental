import { Redirect } from "expo-router";

// Everyone lands on home. The home screen adjusts its UI based on auth state.
// Bookings/Profile tabs intercept unauthenticated taps and redirect to login.
export default function Index() {
  return <Redirect href="/(app)/home" />;
}
