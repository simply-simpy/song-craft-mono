import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "./api";
import { useAuth } from "./auth";

export interface MeResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      clerkId: string;
      email: string;
      globalRole: string;
      createdAt: string;
      lastLoginAt?: string;
    };
    currentContext: {
      currentAccountId: string;
      lastSwitchedAt: string;
      accountName: string;
      accountPlan: string;
      accountStatus: string;
      orgId: string;
      orgName: string;
    } | null;
    availableAccounts: Array<{
      id: string;
      name: string;
      plan: string;
      status: string;
      role: string;
    }>;
    permissions: string[];
  };
}

export function useMe() {
  const { getAuthHeaders, isLoaded } = useAuth();

  return useQuery({
    queryKey: ["me"],
    queryFn: async (): Promise<MeResponse> => {
      const authHeaders = getAuthHeaders();

      const response = await fetch(API_ENDPOINTS.me(), {
        headers: {
          "Content-Type": "application/json",
          ...(authHeaders["x-clerk-user-id"] && {
            "x-clerk-user-id": authHeaders["x-clerk-user-id"],
          }),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user context: ${response.status}`);
      }

      return response.json();
    },
    enabled: isLoaded,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
