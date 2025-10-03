import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { GlobalRole, superUserManager } from "../lib/super-user";
import { withErrorHandling } from "./_utils/route-helpers";

export default async function adminRoutes(fastify: FastifyInstance) {
	// User Management APIs

	// Get all users with pagination and filtering
	fastify.get(
		"/users",
		{
			preHandler: fastify.requireSuperUser(GlobalRole.SUPPORT),
			schema: {
				querystring: z.object({
					page: z.coerce.number().min(1).default(1),
					limit: z.coerce.number().min(1).max(100).default(20),
					search: z.string().optional(),
					role: z.enum(["user", "support", "admin", "super_admin"]).optional(),
				}),
			},
		},
		withErrorHandling(async (request) => {
			const query = request.query as {
				page: number;
				limit: number;
				search?: string;
				role?: string;
			};

			return await request.container!.adminService.listUsers(query);
		}),
	);

	// Get specific user details
	fastify.get(
		"/users/:userId",
		{
			preHandler: fastify.requireSuperUser(GlobalRole.SUPPORT),
			schema: {
				params: z.object({ userId: z.string().uuid() }),
			},
		},
		withErrorHandling(async (request) => {
			const { userId } = request.params as { userId: string };

			const result = await request.container!.adminService.getUser(userId);
			if (!result) {
				return { success: false, error: "User not found" };
			}

			return result;
		}),
	);

	// Update user global role
	fastify.put(
		"/users/:userId/role",
		{
			preHandler: fastify.requireSuperUser(GlobalRole.ADMIN),
			schema: {
				params: z.object({ userId: z.string().uuid() }),
				body: z.object({
					globalRole: z.enum(["user", "support", "admin", "super_admin"]),
					reason: z.string().min(1, "Reason is required"),
				}),
			},
		},
		withErrorHandling(async (request) => {
			const { userId } = request.params as { userId: string };
			const body = request.body as {
				globalRole: string;
				reason: string;
			};
			const changerClerkId = request.user?.clerkId;

			if (!changerClerkId) {
				return { success: false, error: "User not authenticated" };
			}

			// Get target user's clerk ID first
			const targetUser = await request.container!.userRepository.findById(userId);
			if (!targetUser) {
				return { success: false, error: "User not found" };
			}

			// Use super user manager for role changes with audit trail
			await superUserManager.changeUserRole(
				targetUser.clerkId,
				body.globalRole as GlobalRole,
				changerClerkId,
				body.reason,
				request.ip,
			);

			return { success: true, message: "User role updated successfully" };
		}),
	);

	// Account Management APIs

	// Get all accounts with pagination and filtering
	fastify.get(
		"/accounts",
		{
			preHandler: fastify.requireSuperUser(GlobalRole.SUPPORT),
			schema: {
				querystring: z.object({
					page: z.coerce.number().min(1).default(1),
					limit: z.coerce.number().min(1).max(100).default(20),
					search: z.string().optional(),
					plan: z.enum(["Free", "Pro", "Team", "Enterprise"]).optional(),
					status: z.enum(["active", "suspended", "cancelled"]).optional(),
					orgId: z.string().optional(),
				}),
			},
		},
		withErrorHandling(async (request) => {
			const query = request.query as {
				page: number;
				limit: number;
				search?: string;
				plan?: string;
				status?: string;
				orgId?: string;
			};

			return await request.container!.adminService.listAccounts(query);
		}),
	);

	// Get specific account details
	fastify.get(
		"/accounts/:accountId",
		{
			preHandler: fastify.requireSuperUser(GlobalRole.SUPPORT),
			schema: {
				params: z.object({ accountId: z.string().uuid() }),
			},
		},
		withErrorHandling(async (request) => {
			const { accountId } = request.params as { accountId: string };

			const result = await request.container!.adminService.getAccount(accountId);
			if (!result) {
				return { success: false, error: "Account not found" };
			}

			return result;
		}),
	);

	// Organization Management APIs

	// Get all organizations
	fastify.get(
		"/orgs",
		{
			preHandler: fastify.requireSuperUser(GlobalRole.SUPPORT),
			schema: {
				querystring: z.object({
					page: z.coerce.number().min(1).default(1),
					limit: z.coerce.number().min(1).max(100).default(20),
				}),
			},
		},
		withErrorHandling(async (request) => {
			const query = request.query as { page: number; limit: number };
			return await request.container!.adminService.listOrgs(query);
		}),
	);

	// Get organization details with accounts and members
	fastify.get(
		"/orgs/:orgId",
		{
			preHandler: fastify.requireSuperUser(GlobalRole.SUPPORT),
			schema: {
				params: z.object({ orgId: z.string().uuid() }),
			},
		},
		withErrorHandling(async (request) => {
			const { orgId } = request.params as { orgId: string };

			const result = await request.container!.adminService.getOrg(orgId);
			if (!result) {
				return { success: false, error: "Organization not found" };
			}

			return result;
		}),
	);

	// Account Context Management APIs

	// Get user's current account context
	fastify.get(
		"/users/:userId/context",
		{
			preHandler: fastify.requireSuperUser(GlobalRole.SUPPORT),
			schema: {
				params: z.object({ userId: z.string().uuid() }),
			},
		},
		withErrorHandling(async (request) => {
			const { userId } = request.params as { userId: string };

			const result = await request.container!.adminService.getUserContext(userId);
			if (!result) {
				return { success: false, error: "User context not found" };
			}

			return result;
		}),
	);

	// Switch user's account context
	fastify.post(
		"/users/:userId/context/switch",
		{
			preHandler: fastify.requireSuperUser(GlobalRole.SUPPORT),
			schema: {
				params: z.object({ userId: z.string().uuid() }),
				body: z.object({
					accountId: z.string().uuid("Invalid account ID"),
					reason: z.string().optional(),
				}),
			},
		},
		withErrorHandling(async (request) => {
			const { userId } = request.params as { userId: string };
			const body = request.body as {
				accountId: string;
				reason?: string;
			};

			return await request.container!.adminService.switchUserContext({
				userId,
				accountId: body.accountId,
				reason: body.reason,
			});
		}),
	);

	// System Stats (Super Admin only)
	fastify.get(
		"/stats",
		{
			preHandler: fastify.requireSuperUser(GlobalRole.SUPER_ADMIN),
		},
withErrorHandling(async (request) => {
			return await request.container!.adminService.getSystemStats();
		}),
	);
}
