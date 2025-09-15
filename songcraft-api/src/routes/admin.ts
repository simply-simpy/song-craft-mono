import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../db";
import { users, orgs, accounts, memberships } from "../schema";
import { eq, like, desc, count } from "drizzle-orm";
import { superUserManager, GlobalRole } from "../lib/super-user";

export default async function adminRoutes(fastify: FastifyInstance) {
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
          whereConditions.push(like(users.email, `%${query.search}%`));
        }

        if (query.role) {
          whereConditions.push(eq(users.globalRole, query.role));
        }

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
          .where(whereConditions.length > 0 ? whereConditions[0] : undefined)
          .orderBy(desc(users.createdAt))
          .limit(query.limit)
          .offset(offset);

        // Get total count
        const [totalResult] = await db
          .select({ count: count() })
          .from(users)
          .where(whereConditions.length > 0 ? whereConditions[0] : undefined);

        return {
          success: true,
          data: {
            users: userList,
            pagination: {
              page: query.page,
              limit: query.limit,
              total: totalResult.count,
              pages: Math.ceil(totalResult.count / query.limit),
            },
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
            status: orgs.status,
            createdAt: orgs.createdAt,
            accountCount: count(accounts.id),
          })
          .from(orgs)
          .leftJoin(accounts, eq(orgs.id, accounts.orgId))
          .groupBy(orgs.id, orgs.name, orgs.status, orgs.createdAt)
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
          .select({
            totalUsers: count(),
            superAdmins: count(users.globalRole).where(
              eq(users.globalRole, "super_admin")
            ),
            admins: count(users.globalRole).where(
              eq(users.globalRole, "admin")
            ),
            support: count(users.globalRole).where(
              eq(users.globalRole, "support")
            ),
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
