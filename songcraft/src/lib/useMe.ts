import { z } from "@songcraft/shared";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "./api";
import { useAuth } from "./auth";
import { useAuthedApi } from "./useAuthedApi";

const meResponseSchema = z.object({
	success: z.boolean(),
	data: z.object({
		user: z.object({
			id: z.string(),
			clerkId: z.string(),
			email: z.string(),
			globalRole: z.string(),
			createdAt: z.string(),
			lastLoginAt: z.string().optional(),
		}),
		currentContext: z
			.object({
				currentAccountId: z.string(),
				lastSwitchedAt: z.string(),
				accountName: z.string(),
				accountPlan: z.string(),
				accountStatus: z.string(),
				orgId: z.string(),
				orgName: z.string(),
			})
			.nullable(),
		availableAccounts: z.array(
			z.object({
				id: z.string(),
				name: z.string(),
				plan: z.string(),
				status: z.string(),
				role: z.string(),
			}),
		),
		permissions: z.array(z.string()),
	}),
});
export type MeResponse = z.infer<typeof meResponseSchema>;

export function useMe() {
	const authedApi = useAuthedApi();
	const { isLoaded } = useAuth();

	return useQuery<MeResponse>({
		queryKey: ["me"],
		enabled: isLoaded,
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: 1,
		queryFn: () =>
			authedApi({
				endpoint: API_ENDPOINTS.me(),
				schema: meResponseSchema,
			}),
	});
}
