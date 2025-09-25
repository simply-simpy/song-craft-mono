import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "./api";
import { useAuth } from "./auth";

interface AccountContext {
  id: string;
  currentAccountId: string;
  lastSwitchedAt: string;
  contextData: Record<string, unknown>;
  accountName: string;
  accountPlan: string;
  accountStatus: string;
}

interface AvailableAccount {
  id: string;
  name: string;
  plan: string;
  status: string;
  role: string;
}

interface UserContextResponse {
  success: boolean;
  data: {
    currentContext: AccountContext;
    availableAccounts: AvailableAccount[];
  };
}

interface SwitchContextRequest {
  accountId: string;
  reason?: string;
}

export const useAccountContext = (clerkId: string) => {
  const { getAuthHeaders, isLoaded } = useAuth();
  const queryClient = useQueryClient();

  console.log("useAccountContext called with:", {
    clerkId,
    isLoaded,
    enabled: isLoaded && !!clerkId,
  });

  // First, get the user's database ID from their Clerk ID
  const {
    data: userData,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery({
    queryKey: ["userByClerkId", clerkId],
    queryFn: async () => {
      console.log("useAccountContext: Fetching user with clerkId:", clerkId);
      const authHeaders = getAuthHeaders();
      console.log("useAccountContext: Auth headers:", authHeaders);
      const url = `${API_ENDPOINTS.admin.users()}?search=${clerkId}`;
      console.log("useAccountContext: Fetching URL:", url);

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(authHeaders["x-clerk-user-id"] && {
            "x-clerk-user-id": authHeaders["x-clerk-user-id"],
          }),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.status}`);
      }

      const result = await response.json();
      const user = result.data.users.find(
        (u: { clerkId: string }) => u.clerkId === clerkId
      );
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    },
    enabled: isLoaded && !!clerkId,
  });

  console.log("User query state:", {
    userData,
    isLoadingUser,
    userError,
    enabled: isLoaded && !!clerkId,
  });

  // Get user's current account context
  const {
    data: contextData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userContext", userData?.id],
    queryFn: async (): Promise<UserContextResponse> => {
      const authHeaders = getAuthHeaders();
      if (!userData?.id) {
        throw new Error("User ID not available");
      }
      const response = await fetch(
        API_ENDPOINTS.admin.userContext(userData.id),
        {
          headers: {
            "Content-Type": "application/json",
            ...(authHeaders["x-clerk-user-id"] && {
              "x-clerk-user-id": authHeaders["x-clerk-user-id"],
            }),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user context: ${response.status}`);
      }

      return response.json();
    },
    enabled: isLoaded && !!userData?.id,
  });

  // Switch account context
  const switchContextMutation = useMutation({
    mutationFn: async (request: SwitchContextRequest) => {
      if (!userData?.id) {
        throw new Error("User ID not available");
      }
      const authHeaders = getAuthHeaders();
      const response = await fetch(
        API_ENDPOINTS.admin.switchUserContext(userData.id),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeaders["x-clerk-user-id"] && {
              "x-clerk-user-id": authHeaders["x-clerk-user-id"],
            }),
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to switch context: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch context data
      queryClient.invalidateQueries({
        queryKey: ["userContext", userData?.id],
      });
    },
  });

  return {
    currentContext: contextData?.data?.currentContext,
    availableAccounts: contextData?.data?.availableAccounts || [],
    isLoading: isLoading || isLoadingUser,
    error: error || userError,
    switchContext: switchContextMutation.mutate,
    isSwitching: switchContextMutation.isPending,
    switchError: switchContextMutation.error,
  };
};
