import type { FastifyInstance, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { sql, eq, and } from "drizzle-orm";
import { getClerkUserId } from "../lib/auth";
import { ForbiddenError } from "../lib/errors";
import { db } from "../db";
import { users, memberships } from "../schema";

declare module "fastify" {
  interface FastifyRequest {
    tenantContext?: {
      accountId: string;
    };
  }
}

async function tenantContextPlugin(fastify: FastifyInstance) {
  // Add a preHandler hook to set tenant context
  fastify.addHook("preHandler", async (request: FastifyRequest) => {
    const accountId = request.headers["x-account-id"] as string;

    if (accountId) {
      try {
        // Validate that the authenticated user has access to this account
        const clerkId = await getClerkUserId(request);

        fastify.log.info(
          `Tenant context check: clerkId=${clerkId}, accountId=${accountId}`
        );

        // Get user from database to check account membership
        const user = await db
          .select()
          .from(users)
          .where(eq(users.clerkId, clerkId))
          .limit(1);

        if (user.length === 0) {
          fastify.log.warn(`User not found in database: clerkId=${clerkId}`);
          throw new ForbiddenError("User not found");
        }

        fastify.log.info(
          `User found: id=${user[0].id}, email=${user[0].email}`
        );

        // Check if user has membership in the requested account
        const membership = await db
          .select()
          .from(memberships)
          .where(
            and(
              eq(memberships.userId, user[0].id),
              eq(memberships.accountId, accountId)
            )
          )
          .limit(1);

        if (membership.length === 0) {
          // Log all user memberships for debugging
          const allMemberships = await db
            .select()
            .from(memberships)
            .where(eq(memberships.userId, user[0].id));

          fastify.log.warn(
            `User ${clerkId} (${user[0].email}) attempted to access account ${accountId} without permission. User has ${allMemberships.length} memberships: ${allMemberships.map((m) => m.accountId).join(", ")}`
          );
          throw new ForbiddenError("Access denied to this account");
        }

        fastify.log.info(
          `Membership found: user=${user[0].id}, account=${accountId}, role=${membership[0].role}`
        );

        // Set the tenant context in the database session
        if (request.pgClient) {
          await request.pgClient.query(
            "SELECT set_config('app.account_id', $1, true)",
            [accountId]
          );
        } else if (request.db) {
          // Fallback just in case
          await request.db.execute(
            sql`SELECT set_config('app.account_id', ${accountId}, true)`
          );
        }
        request.tenantContext = { accountId };
      } catch (error) {
        // If it's a ForbiddenError, re-throw it
        if (error instanceof ForbiddenError) {
          throw error;
        }

        fastify.log.warn(
          { err: error, accountId },
          `Failed to set tenant context for account ${accountId}`
        );
        // Don't fail the request for other errors, just log them
      }
    }
  });
}

export default fp(tenantContextPlugin, {
  name: "tenant-context",
});
