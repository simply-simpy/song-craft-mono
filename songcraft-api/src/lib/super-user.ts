import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../schema";
import { Environment, EnvironmentConfig } from "./environment";

// Global role definitions
export enum GlobalRole {
	USER = "user",
	SUPPORT = "support",
	ADMIN = "admin",
	SUPER_ADMIN = "super_admin",
}

// Permission definitions
export const GLOBAL_PERMISSIONS = {
	[GlobalRole.USER]: [],
	[GlobalRole.SUPPORT]: [
		"view:all_users",
		"view:all_orgs",
		"view:support_tickets",
	],
	[GlobalRole.ADMIN]: [
		"view:all_users",
		"edit:all_users",
		"view:all_orgs",
		"edit:all_orgs",
		"view:system_stats",
		"manage:billing",
	],
	[GlobalRole.SUPER_ADMIN]: ["*"], // All permissions
} as const;

// Role hierarchy for permission checking
const ROLE_HIERARCHY = [
	GlobalRole.USER,
	GlobalRole.SUPPORT,
	GlobalRole.ADMIN,
	GlobalRole.SUPER_ADMIN,
];

export interface SuperUserAuditEvent {
	userId: string;
	oldRole?: GlobalRole;
	newRole: GlobalRole;
	changedBy: string;
	reason: string;
	ipAddress?: string;
	userAgent?: string;
	timestamp: Date;
}

export class EnvironmentAwareSuperUserManager {
	private environment = Environment.getDatabaseType();
	private config =
		EnvironmentConfig[this.environment as keyof typeof EnvironmentConfig];

	constructor() {
		console.log(`🔧 SuperUser Manager initialized for: ${this.environment}`);
	}

	/**
	 * Get user's current global role
	 */
	async getUserRole(clerkId: string): Promise<GlobalRole> {
		if (this.config.requiresClerk && Environment.isClerkEnabled()) {
			return this.getRoleFromClerk(clerkId);
		}
		return this.getRoleFromDatabase(clerkId);
	}

	/**
	 * Promote/demote user role
	 */
	async changeUserRole(
		targetClerkId: string,
		newRole: GlobalRole,
		changedByClerkId: string,
		reason: string,
		ipAddress?: string,
	): Promise<void> {
		// Verify permissions
		const changerRole = await this.getUserRole(changedByClerkId);
		if (!this.canChangeRole(changerRole, newRole)) {
			throw new Error(`Insufficient permissions to assign role: ${newRole}`);
		}

		// Get current role for audit
		const oldRole = await this.getUserRole(targetClerkId);

		if (this.environment === "local-postgres") {
			await this.changeRoleLocal(
				targetClerkId,
				newRole,
				oldRole,
				changedByClerkId,
				reason,
			);
		} else {
			await this.changeRoleRemote(
				targetClerkId,
				newRole,
				oldRole,
				changedByClerkId,
				reason,
			);
		}

		// Log the change
		if (this.config.enableRichLogging) {
			console.log(
				`✅ Role changed: ${targetClerkId} ${oldRole} → ${newRole} by ${changedByClerkId}`,
			);
		}
	}

	/**
	 * Check if user has specific permission
	 */
	async hasPermission(clerkId: string, permission: string): Promise<boolean> {
		const role = await this.getUserRole(clerkId);
		const permissions = GLOBAL_PERMISSIONS[role] as readonly string[];

		return permissions.includes("*") || permissions.includes(permission);
	}

	/**
	 * Require minimum role for operation
	 */
	async requireRole(clerkId: string, minRole: GlobalRole): Promise<GlobalRole> {
		const userRole = await this.getUserRole(clerkId);

		if (!this.hasMinimumRole(userRole, minRole)) {
			throw new Error(`Required role: ${minRole}, user has: ${userRole}`);
		}

		return userRole;
	}

	/**
	 * Bootstrap super users for local development
	 */
	async bootstrapLocalSuperUsers(): Promise<void> {
		if (!this.config.autoSeedSuperUsers) {
			return;
		}

		const localSuperUsers = ["dev@localhost.com", "admin@localhost.com"];

		console.log("🌱 Bootstrapping local super users...");

		for (const email of localSuperUsers) {
			try {
				// Check if user exists
				const existingUser = await db
					.select()
					.from(users)
					.where(eq(users.email, email))
					.limit(1);

				if (existingUser.length === 0) {
					// Create user
					await db.insert(users).values({
						clerkId: `local_${email.replace("@", "_").replace(".", "_")}`,
						email,
						globalRole: GlobalRole.SUPER_ADMIN,
					});
					console.log(`✅ Created local super user: ${email}`);
				} else if (existingUser[0].globalRole !== GlobalRole.SUPER_ADMIN) {
					// Promote existing user
					await db
						.update(users)
						.set({ globalRole: GlobalRole.SUPER_ADMIN })
						.where(eq(users.email, email));
					console.log(`✅ Promoted local user to super admin: ${email}`);
				}
			} catch (error) {
				console.error(`❌ Failed to bootstrap super user ${email}:`, error);
			}
		}
	}

	// Private methods

	private async getRoleFromClerk(clerkId: string): Promise<GlobalRole> {
		try {
			// Dynamic import for Clerk (only available in remote environments)
			const { createClerkClient } = await import("@clerk/backend");
			const clerkClient = createClerkClient({});
			const clerkUser = await clerkClient.users.getUser(clerkId);
			return (
				(clerkUser.privateMetadata?.globalRole as GlobalRole) || GlobalRole.USER
			);
		} catch (error) {
			console.error("Failed to get role from Clerk:", error);
			return GlobalRole.USER;
		}
	}

	private async getRoleFromDatabase(clerkId: string): Promise<GlobalRole> {
		try {
			const user = await db
				.select({ globalRole: users.globalRole })
				.from(users)
				.where(eq(users.clerkId, clerkId))
				.limit(1);

			return (user[0]?.globalRole as GlobalRole) || GlobalRole.USER;
		} catch (error) {
			console.error("Failed to get role from database:", error);
			return GlobalRole.USER;
		}
	}

	private async changeRoleLocal(
		clerkId: string,
		newRole: GlobalRole,
		oldRole: GlobalRole,
		changedBy: string,
		reason: string,
	): Promise<void> {
		// Update database directly
		await db
			.update(users)
			.set({ globalRole: newRole })
			.where(eq(users.clerkId, clerkId));

		// Optionally sync to Clerk if available
		if (Environment.isClerkEnabled()) {
			try {
				const { createClerkClient } = await import("@clerk/backend");
				const clerkClient = createClerkClient({});
				await clerkClient.users.updateUserMetadata(clerkId, {
					privateMetadata: { globalRole: newRole },
				});
			} catch (error) {
				console.warn("Failed to sync role to Clerk (local dev):", error);
			}
		}

		// Create audit record
		await this.createAuditRecord({
			userId: clerkId,
			oldRole,
			newRole,
			changedBy,
			reason,
			timestamp: new Date(),
		});
	}

	private async changeRoleRemote(
		clerkId: string,
		newRole: GlobalRole,
		oldRole: GlobalRole,
		changedBy: string,
		reason: string,
	): Promise<void> {
		// Update Clerk first (primary source of truth)
		const { createClerkClient } = await import("@clerk/backend");
		const clerkClient = createClerkClient({});
		await clerkClient.users.updateUserMetadata(clerkId, {
			privateMetadata: {
				globalRole: newRole,
				lastChanged: new Date().toISOString(),
				changedBy,
			},
		});

		// Create audit record in Neon
		await this.createAuditRecord({
			userId: clerkId,
			oldRole,
			newRole,
			changedBy,
			reason,
			timestamp: new Date(),
		});
	}

	private async createAuditRecord(event: SuperUserAuditEvent): Promise<void> {
		try {
			// For now, we'll create a simple audit log
			// Later we can expand this to a proper audit_logs table
			console.log("📝 Audit:", JSON.stringify(event, null, 2));

			// TODO: Insert into audit_logs table when it's created
		} catch (error) {
			console.error("Failed to create audit record:", error);
			// Don't fail the operation if audit logging fails
		}
	}

	private canChangeRole(
		changerRole: GlobalRole,
		targetRole: GlobalRole,
	): boolean {
		// Only super admins can promote to super admin
		if (
			targetRole === GlobalRole.SUPER_ADMIN &&
			changerRole !== GlobalRole.SUPER_ADMIN
		) {
			return false;
		}

		// Admins can manage support and below
		if (changerRole === GlobalRole.ADMIN) {
			return [GlobalRole.USER, GlobalRole.SUPPORT, GlobalRole.ADMIN].includes(
				targetRole,
			);
		}

		// Super admins can manage all roles
		return changerRole === GlobalRole.SUPER_ADMIN;
	}

	private hasMinimumRole(userRole: GlobalRole, minRole: GlobalRole): boolean {
		const userLevel = ROLE_HIERARCHY.indexOf(userRole);
		const minLevel = ROLE_HIERARCHY.indexOf(minRole);
		return userLevel >= minLevel;
	}
}

// Singleton instance
export const superUserManager = new EnvironmentAwareSuperUserManager();
