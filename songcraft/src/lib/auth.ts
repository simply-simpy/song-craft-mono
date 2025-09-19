// songcraft/src/lib/auth.ts
import { useUser } from "@clerk/tanstack-react-start";

export const useAuth = () => {
  const { user, isLoaded } = useUser();

  // For development, mock a user if Clerk is not working
  const mockUser = {
    id: "user_31nfGdXgrOOiHNVWtJjf20VpuYm",
    emailAddresses: [{ emailAddress: "scott@scoti.co" }],
  };

  const getAuthHeaders = () => {
    const currentUser = user || mockUser;
    if (!currentUser) return {};

    return {
      "x-clerk-user-id": currentUser.id,
    };
  };

  return {
    user: user || mockUser,
    isLoaded: isLoaded || true, // Always loaded in dev mode
    getAuthHeaders,
  };
};
