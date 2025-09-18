// songcraft/src/lib/auth.ts
import { useUser } from "@clerk/tanstack-react-start";

export const useAuth = () => {
  const { user, isLoaded } = useUser();

  const getAuthHeaders = () => {
    if (!user) return {};

    return {
      "x-clerk-user-id": user.id,
    };
  };

  return {
    user,
    isLoaded,
    getAuthHeaders,
  };
};
