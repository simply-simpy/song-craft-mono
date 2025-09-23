import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../db";
import { users, orgs, accounts, memberships, userContext } from "../schema";
import { eq, like, desc, count, sql, or, and } from "drizzle-orm";
import { superUserManager, GlobalRole } from "../lib/super-user";

export default async function adminRoutes(fastify: FastifyInstance) {
  // General User APIs

  // Get current user's complete context
  fastify.get(
    "/me",
    {
      preHandler: fastify.requireSuperUser(GlobalRole.USER), // Any authenticated user
    },
    async (request) => {
      try {
        const clerkId = request.user?.clerkId;
        if (!clerkId) {
          return { success: false, error: "User not authenticated" };
        }

        // Get user details
        const user = await db
          .select({
            id: users.id,
            clerkId: users.clerkId,
            email: users.email,
            globalRole: users.globalRole,
            createdAt: users.createdAt,
            lastLoginAt: users.lastLoginAt,
          })
          .from(users)
          .where(eq(users.clerkId, clerkId))
          .limit(1);

        if (user.length === 0) {
          return { success: false, error: "User not found" };
        }

        // Get user's current context
        const context = await db
          .select({
            currentAccountId: userContext.currentAccountId,
            lastSwitchedAt: userContext.lastSwitchedAt,
            accountName: accounts.name,
            accountPlan: accounts.plan,
            accountStatus: accounts.status,
            orgId: orgs.id,
            orgName: orgs.name,
          })
          .from(userContext)
          .innerJoin(accounts, eq(userContext.currentAccountId, accounts.id))
          .innerJoin(orgs, eq(accounts.orgId, orgs.id))
          .where(eq(userContext.userId, user[0].id))
          .limit(1);

        // Get user's available accounts
        const availableAccounts = await db
          .select({
            id: accounts.id,
            name: accounts.name,
            plan: accounts.plan,
            status: accounts.status,
            role: memberships.role,
          })
          .from(memberships)
          .innerJoin(accounts, eq(memberships.accountId, accounts.id))
          .where(eq(memberships.userId, user[0].id))
          .orderBy(desc(memberships.createdAt));

        // Get user permissions based on global role
        const permissions = getUserPermissions(user[0].globalRole);

        return {
          success: true,
          data: {
            user: user[0],
            currentContext: context[0] || null,
            availableAccounts,
            permissions,
          },
        };
      } catch (error) {
        console.error("Error fetching user context:", error);
        return { success: false, error: "Failed to fetch user context" };
      }
    }
  );

  // User Management APIs

  // Get all users with pagination and filtering
  fastify.get(
    "/admin/users",
    {
      preHandler: fastify.requireSuperUser(GlobalRole.SUPPORT),
    },
    async (request) => {
      const querySchema = z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(20),
        search: z.string().optional(),
        role: z.enum(["user", "support", "admin", "super_admin"]).optional(),
      });

      const query = querySchema.parse(request.query);
      const offset = (query.page - 1) * query.limit;

      try {
        // Build where conditions
        const whereConditions = [];

        if (query.search) {
          whereConditions.push(
            or(
              like(users.email, `%${query.search}%`),
              like(users.clerkId, `%${query.search}%`)
            )
          );
        }

        if (query.role) {
          whereConditions.push(eq(users.globalRole, query.role));
        }

        // Build where clause for both queries
        const whereClause =
          whereConditions.length > 0 ? and(...whereConditions) : undefined;

        // Get users with pagination
        const userList = await db
          .select({
            id: users.id,
            clerkId: users.clerkId,
            email: users.email,
            globalRole: users.globalRole,
            createdAt: users.createdAt,
            lastLoginAt: users.lastLoginAt,
          })
          .from(users)
          .where(whereClause)
          .orderBy(desc(users.createdAt))
          .limit(query.limit)
          .offset(offset);

        // Get total count
        const [totalResult] = await db
          .select({ count: count() })
          .from(users)
          .where(whereClause);

        const totalCount = totalResult.count;
        const pageCount = Math.ceil(totalCount / query.limit);

        return {
          success: true,
          data: {
            users: userList,
            pagination: {
              page: query.page,
              limit: query.limit,
              total: totalCount,
              pages: pageCount,
            },
            // Add TanStack Table specific fields
            rowCount: totalCount,
            pageCount: pageCount,
          },
        };
      } catch (error) {
        console.error("Error fetching users:", error);
        return { success: false, error: "Failed to fetch users" };
      }
    }
  );

  // Get specific user details
  fastify.get(
    "/admin/users/:userId",
    {
      preHandler: fastify.requireSuperUser(GlobalRole.SUPPORT),
    },
    async (request) => {
      const { userId } = request.params as { userId: string };

      try {
        // Get user with memberships
        const user = await db
          .select({
            id: users.id,
            clerkId: users.clerkId,
            email: users.email,
            globalRole: users.globalRole,
            createdAt: users.createdAt,
            lastLoginAt: users.lastLoginAt,
          })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (user.length === 0) {
          return { success: false, error: "User not found" };
        }

        // Get user's memberships
        const userMemberships = await db
          .select({
            membershipId: memberships.id,
            role: memberships.role,
            accountId: accounts.id,
            accountName: accounts.name,
            orgId: orgs.id,
            orgName: orgs.name,
            plan: accounts.plan,
            joinedAt: memberships.createdAt,
          })
          .from(memberships)
          .innerJoin(accounts, eq(memberships.accountId, accounts.id))
          .innerJoin(orgs, eq(accounts.orgId, orgs.id))
          .where(eq(memberships.userId, userId))
          .orderBy(desc(memberships.createdAt));

        return {
          success: true,
          data: {
            user: user[0],
            memberships: userMemberships,
          },
        };
      } catch (error) {
        console.error("Error fetching user:", error);
        return { success: false, error: "Failed to fetch user" };
      }
    }
  );

  // Update user global role
  fastify.put(
    "/admin/users/:userId/role",
    {
      preHandler: fastify.requireSuperUser(GlobalRole.ADMIN),
    },
    async (request) => {
      const { userId } = request.params as { userId: string };
      const bodySchema = z.object({
        globalRole: z.enum(["user", "support", "admin", "super_admin"]),
        reason: z.string().min(1, "Reason is required"),
      });

      const body = bodySchema.parse(request.body);
      const changerClerkId = request.user?.clerkId;
      if (!changerClerkId) {
        return { success: false, error: "User not authenticated" };
      }

      try {
        // Get target user's clerk ID
        const targetUser = await db
          .select({ clerkId: users.clerkId, currentRole: users.globalRole })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (targetUser.length === 0) {
          return { success: false, error: "User not found" };
        }

        // Change role using super user manager
        await superUserManager.changeUserRole(
          targetUser[0].clerkId,
          body.globalRole as GlobalRole,
          changerClerkId,
          body.reason,
          request.ip
        );

        return { success: true, message: "User role updated successfully" };
      } catch (error) {
        console.error("Error updating user role:", error);
        const message =
          error instanceof Error ? error.message : "Failed to update user role";
        return { success: false, error: message };
      }
    }
  );

  // Account Management APIs

  // Get all accounts with pagination and filtering
  fastify.get(
    "/admin/accounts",
    {
      preHandler: fastify.requireSuperUser(GlobalRole.SUPPORT),
    },
    async (request) => {
      const querySchema = z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(20),
        search: z.string().optional(),
        plan: z.enum(["Free", "Pro", "Team", "Enterprise"]).optional(),
        status: z.enum(["active", "suspended", "cancelled"]).optional(),
        orgId: z.string().optional(),
      });

      const query = querySchema.parse(request.query);
      const offset = (query.page - 1) * query.limit;

      try {
        // Build where conditions
        const whereConditions = [];

        if (query.search) {
          whereConditions.push(like(accounts.name, `%${query.search}%`));
        }

        if (query.plan) {
          whereConditions.push(eq(accounts.plan, query.plan));
        }

        if (query.status) {
          whereConditions.push(eq(accounts.status, query.status));
        }

        if (query.orgId) {
          whereConditions.push(eq(accounts.parentOrgId, query.orgId));
        }

        // Build where clause for both queries
        const whereClause =
          whereConditions.length > 0 ? whereConditions[0] : undefined;

        // Get accounts with pagination
        const accountList = await db
          .select({
            id: accounts.id,
            name: accounts.name,
            description: accounts.description,
            plan: accounts.plan,
            status: accounts.status,
            billingEmail: accounts.billingEmail,
            isDefault: accounts.isDefault,
            createdAt: accounts.createdAt,
            orgId: orgs.id,
            orgName: orgs.name,
            memberCount: count(memberships.id),
          })
          .from(accounts)
          .leftJoin(orgs, eq(accounts.parentOrgId, orgs.id))
          .leftJoin(memberships, eq(accounts.id, memberships.accountId))
          .where(whereClause)
          .groupBy(
            accounts.id,
            accounts.name,
            accounts.description,
            accounts.plan,
            accounts.status,
            accounts.billingEmail,
            accounts.isDefault,
            accounts.createdAt,
            orgs.id,
            orgs.name
          )
          .orderBy(desc(accounts.createdAt))
          .limit(query.limit)
          .offset(offset);

        // Get total count
        const [totalResult] = await db
          .select({ count: count() })
          .from(accounts)
          .where(whereClause);

        const totalCount = totalResult.count;
        const pageCount = Math.ceil(totalCount / query.limit);

        return {
          success: true,
          data: {
            accounts: accountList,
            pagination: {
              page: query.page,
              limit: query.limit,
              total: totalCount,
              pages: pageCount,
            },
            // Add TanStack Table specific fields
            rowCount: totalCount,
            pageCount: pageCount,
          },
        };
      } catch (error) {
        console.error("Error fetching accounts:", error);
        return { success: false, error: "Failed to fetch accounts" };
      }
    }
  );

  // Get specific account details
  fastify.get(
    "/admin/accounts/:accountId",
    {
      preHandler: fastify.requireSuperUser(GlobalRole.SUPPORT),
    },
    async (request) => {
      const { accountId } = request.params as { accountId: string };

      try {
        // Get account with org info
        const account = await db
          .select({
            id: accounts.id,
            name: accounts.name,
            description: accounts.description,
            plan: accounts.plan,
            status: accounts.status,
            billingEmail: accounts.billingEmail,
            settings: accounts.settings,
            isDefault: accounts.isDefault,
            createdAt: accounts.createdAt,
            orgId: orgs.id,
            orgName: orgs.name,
            orgBillingEmail: orgs.billingEmail,
          })
          .from(accounts)
          .leftJoin(orgs, eq(accounts.parentOrgId, orgs.id))
          .where(eq(accounts.id, accountId))
          .limit(1);

        if (account.length === 0) {
          return { success: false, error: "Account not found" };
        }

        // Get account members
        const accountMembers = await db
          .select({
            membershipId: memberships.id,
            role: memberships.role,
            userId: users.id,
            userEmail: users.email,
            userGlobalRole: users.globalRole,
            joinedAt: memberships.createdAt,
          })
          .from(memberships)
          .innerJoin(users, eq(memberships.userId, users.id))
          .where(eq(memberships.accountId, accountId))
          .orderBy(desc(memberships.createdAt));

        return {
          success: true,
          data: {
            account: account[0],
            members: accountMembers,
          },
        };
      } catch (error) {
        console.error("Error fetching account:", error);
        return { success: false, error: "Failed to fetch account" };
      }
    }
  );

  // Organization Management APIs

  // Get all organizations
  fastify.get(
    "/admin/orgs",
    {
      preHandler: fastify.requireSuperUser(GlobalRole.SUPPORT),
    },
    async (request) => {
      const querySchema = z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(20),
      });

      const query = querySchema.parse(request.query);
      const offset = (query.page - 1) * query.limit;

      try {
        const orgList = await db
          .select({
            id: orgs.id,
            name: orgs.name,
            createdAt: orgs.createdAt,
            accountCount: count(accounts.id),
          })
          .from(orgs)
          .leftJoin(accounts, eq(orgs.id, accounts.orgId))
          .groupBy(orgs.id, orgs.name, orgs.createdAt)
          .orderBy(desc(orgs.createdAt))
          .limit(query.limit)
          .offset(offset);

        const [totalResult] = await db.select({ count: count() }).from(orgs);

        return {
          success: true,
          data: {
            orgs: orgList,
            pagination: {
              page: query.page,
              limit: query.limit,
              total: totalResult.count,
              pages: Math.ceil(totalResult.count / query.limit),
            },
          },
        };
      } catch (error) {
        console.error("Error fetching organizations:", error);
        return { success: false, error: "Failed to fetch organizations" };
      }
    }
  );

  // Get organization details with accounts and members
  fastify.get(
    "/admin/orgs/:orgId",
    {
      preHandler: fastify.requireSuperUser(GlobalRole.SUPPORT),
    },
    async (request) => {
      const { orgId } = request.params as { orgId: string };

      try {
        // Get organization
        const org = await db
          .select()
          .from(orgs)
          .where(eq(orgs.id, orgId))
          .limit(1);

        if (org.length === 0) {
          return { success: false, error: "Organization not found" };
        }

        // Get organization accounts
        const orgAccounts = await db
          .select({
            id: accounts.id,
            name: accounts.name,
            plan: accounts.plan,
            status: accounts.status,
            isDefault: accounts.isDefault,
            createdAt: accounts.createdAt,
            memberCount: count(memberships.id),
          })
          .from(accounts)
          .leftJoin(memberships, eq(accounts.id, memberships.accountId))
          .where(eq(accounts.orgId, orgId))
          .groupBy(
            accounts.id,
            accounts.name,
            accounts.plan,
            accounts.status,
            accounts.isDefault,
            accounts.createdAt
          )
          .orderBy(desc(accounts.createdAt));

        return {
          success: true,
          data: {
            org: org[0],
            accounts: orgAccounts,
          },
        };
      } catch (error) {
        console.error("Error fetching organization:", error);
        return { success: false, error: "Failed to fetch organization" };
      }
    }
  );

  // Account Context Management APIs

  // Get user's current account context
  fastify.get(
    "/admin/users/:userId/context",
    {
      preHandler: fastify.requireSuperUser(GlobalRole.SUPPORT),
    },
    async (request) => {
      const { userId } = request.params as { userId: string };

      try {
        // Get user's current context
        const context = await db
          .select({
            id: userContext.id,
            currentAccountId: userContext.currentAccountId,
            lastSwitchedAt: userContext.lastSwitchedAt,
            contextData: userContext.contextData,
            accountName: accounts.name,
            accountPlan: accounts.plan,
            accountStatus: accounts.status,
          })
          .from(userContext)
          .innerJoin(accounts, eq(userContext.currentAccountId, accounts.id))
          .where(eq(userContext.userId, userId))
          .limit(1);

        if (context.length === 0) {
          return { success: false, error: "User context not found" };
        }

        // Get user's available accounts
        const availableAccounts = await db
          .select({
            id: accounts.id,
            name: accounts.name,
            plan: accounts.plan,
            status: accounts.status,
            role: memberships.role,
          })
          .from(memberships)
          .innerJoin(accounts, eq(memberships.accountId, accounts.id))
          .where(eq(memberships.userId, userId))
          .orderBy(desc(memberships.createdAt));

        return {
          success: true,
          data: {
            currentContext: context[0],
            availableAccounts,
          },
        };
      } catch (error) {
        console.error("Error fetching user context:", error);
        return { success: false, error: "Failed to fetch user context" };
      }
    }
  );

  // Switch user's account context
  fastify.post(
    "/admin/users/:userId/context/switch",
    {
      preHandler: fastify.requireSuperUser(GlobalRole.SUPPORT),
    },
    async (request) => {
      const { userId } = request.params as { userId: string };
      const bodySchema = z.object({
        accountId: z.string().uuid("Invalid account ID"),
        reason: z.string().optional(),
      });

      const body = bodySchema.parse(request.body);

      try {
        // Verify user has access to the account
        const membership = await db
          .select()
          .from(memberships)
          .where(
            eq(memberships.userId, userId) &&
              eq(memberships.accountId, body.accountId)
          )
          .limit(1);

        if (membership.length === 0) {
          return {
            success: false,
            error: "User does not have access to this account",
          };
        }

        // Update or create user context
        const existingContext = await db
          .select()
          .from(userContext)
          .where(eq(userContext.userId, userId))
          .limit(1);

        if (existingContext.length > 0) {
          // Update existing context
          await db
            .update(userContext)
            .set({
              currentAccountId: body.accountId,
              lastSwitchedAt: new Date(),
              contextData: {
                ...(existingContext[0].contextData as Record<string, unknown>),
                lastSwitchReason: body.reason,
              },
            })
            .where(eq(userContext.userId, userId));
        } else {
          // Create new context
          await db.insert(userContext).values({
            userId,
            currentAccountId: body.accountId,
            contextData: {
              lastSwitchReason: body.reason,
            },
          });
        }

        return {
          success: true,
          message: "Account context switched successfully",
        };
      } catch (error) {
        console.error("Error switching account context:", error);
        return { success: false, error: "Failed to switch account context" };
      }
    }
  );

  // System Stats (Super Admin only)
  fastify.get(
    "/admin/stats",
    {
      preHandler: fastify.requireSuperUser(GlobalRole.SUPER_ADMIN),
    },
    async () => {
      try {
        // Get system-wide statistics
        const [userStats] = await db
          // TODO: Is using sql<number> safe?
          .select({
            totalUsers: count(),
            superAdmins: sql<number>`count(case when ${users.globalRole} = 'super_admin' then 1 end)`,
            admins: sql<number>`count(case when ${users.globalRole} = 'admin' then 1 end)`,
            support: sql<number>`count(case when ${users.globalRole} = 'support' then 1 end)`,
          })
          .from(users);

        const [orgStats] = await db.select({ totalOrgs: count() }).from(orgs);
        const [accountStats] = await db
          .select({ totalAccounts: count() })
          .from(accounts);

        return {
          success: true,
          data: {
            users: userStats,
            organizations: orgStats.totalOrgs,
            accounts: accountStats.totalAccounts,
            timestamp: new Date().toISOString(),
          },
        };
      } catch (error) {
        console.error("Error fetching system stats:", error);
        return { success: false, error: "Failed to fetch system stats" };
      }
    }
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
        "admin:system:manage"
      );
      break;
    case "admin":
      permissions.push(
        "admin:users:read",
        "admin:users:write",
        "admin:accounts:read",
        "admin:accounts:write",
        "admin:orgs:read",
        "admin:orgs:write"
      );
      break;
    case "support":
      permissions.push(
        "admin:users:read",
        "admin:accounts:read",
        "admin:orgs:read"
      );
      break;
    default:
      // Only base permissions
      break;
  }

  return permissions;
}
