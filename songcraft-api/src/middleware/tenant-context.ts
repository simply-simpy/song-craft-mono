import type { FastifyInstance, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { sql, eq } from "drizzle-orm";
import { getClerkUserId } from "../lib/auth";
import { ForbiddenError } from "../lib/errors";
import { db } from "../db";
import { users } from "../schema";

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

        // Get user from database to check account membership
        const user = await db
          .select()
          .from(users)
          .where(eq(users.clerkId, clerkId))
          .limit(1);

        if (user.length === 0) {
          throw new ForbiddenError("User not found");
        }

        const userAccountIds = user[0].accountIds || [];
        if (!userAccountIds.includes(accountId)) {
          fastify.log.warn(
            `User ${clerkId} attempted to access account ${accountId} without permission`
          );
          throw new ForbiddenError("Access denied to this account");
        }

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
          `Failed to set tenant context for account ${accountId}:`,
          error
        );
        // Don't fail the request for other errors, just log them
      }
    }
  });
}

export default fp(tenantContextPlugin, {
  name: "tenant-context",
});
