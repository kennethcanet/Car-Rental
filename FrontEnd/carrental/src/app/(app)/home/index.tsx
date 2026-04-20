import { AuthHome } from "@/features/home/components/AuthHome";
import { GuestHome } from "@/features/home/components/GuestHome";
import { useAuthStore } from "@/store/auth.store";

export default function HomeScreen() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    return <AuthHome firstName={user.firstName} lastName={user.lastName} />;
  }

  return <GuestHome />;
}
