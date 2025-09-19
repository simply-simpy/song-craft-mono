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

export const useAccountContext = (userId: string) => {
  const { getAuthHeaders, isLoaded } = useAuth();
  const queryClient = useQueryClient();

  // Get user's current account context
  const {
    data: contextData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userContext", userId],
    queryFn: async (): Promise<UserContextResponse> => {
      const authHeaders = getAuthHeaders();
      const response = await fetch(API_ENDPOINTS.admin.userContext(userId), {
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
    enabled: isLoaded && !!userId,
  });

  // Switch account context
  const switchContextMutation = useMutation({
    mutationFn: async (request: SwitchContextRequest) => {
      const authHeaders = getAuthHeaders();
      const response = await fetch(
        API_ENDPOINTS.admin.switchUserContext(userId),
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
      queryClient.invalidateQueries({ queryKey: ["userContext", userId] });
    },
  });

  return {
    currentContext: contextData?.data?.currentContext,
    availableAccounts: contextData?.data?.availableAccounts || [],
    isLoading,
    error,
    switchContext: switchContextMutation.mutate,
    isSwitching: switchContextMutation.isPending,
    switchError: switchContextMutation.error,
  };
};
