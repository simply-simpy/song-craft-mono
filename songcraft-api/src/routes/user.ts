import type { FastifyInstance } from "fastify";
import { container } from "../container";
import { GlobalRole } from "../lib/super-user";
import { withErrorHandling } from "./_utils/route-helpers";
// me endpoint
export default async function userRoutes(fastify: FastifyInstance) {
	// Get current user's complete context
	fastify.get(
		"/me",
		{
			preHandler: fastify.requireSuperUser(GlobalRole.USER), // Any authenticated user
		},
		withErrorHandling(async (request) => {
			const clerkId = request.user?.clerkId;
			if (!clerkId) {
				return { success: false, error: "User not authenticated" };
			}

			const result = await container.adminService.getMe(clerkId);
			if (!result) {
				return { success: false, error: "User not found" };
			}

			// Get user permissions based on global role
			const permissions = getUserPermissions(result.data.user.globalRole);

			return {
				...result,
				data: {
					...result.data,
					permissions,
				},
			};
		}),
	);
}

// Helper function to get user permissions based on global role
function getUserPermissions(globalRole: string): string[] {
	const permissions: string[] = [];

	// Base permissions for all users
	permissions.push("user:profile:read");
	permissions.push("user:profile:update");

	// Role-based permissions
	switch (globalRole) {
		case "super_admin":
			permissions.push(
				"admin:users:read",
				"admin:users:write",
				"admin:accounts:read",
				"admin:accounts:write",
				"admin:orgs:read",
				"admin:orgs:write",
				"admin:stats:read",
				"admin:system:manage",
			);
			break;
		case "admin":
			permissions.push(
				"admin:users:read",
				"admin:users:write",
				"admin:accounts:read",
				"admin:accounts:write",
				"admin:orgs:read",
				"admin:orgs:write",
			);
			break;
		case "support":
			permissions.push(
				"admin:users:read",
				"admin:accounts:read",
				"admin:orgs:read",
			);
			break;
		default:
			// Only base permissions
			break;
	}

	return permissions;
}
