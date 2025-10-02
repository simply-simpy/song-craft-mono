import type { FastifyInstance, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { sql } from "drizzle-orm";

import { db } from "../db";

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
      // Set the tenant context in the database session
      try {
        // Set the app.account_id config directly
        await db.execute(
          sql`SELECT set_config('app.account_id', ${accountId}, false)`
        );
        request.tenantContext = { accountId };
      } catch (error) {
        fastify.log.warn(
          `Failed to set tenant context for account ${accountId}`
        );
      }
    }
  });
}

export default fp(tenantContextPlugin, {
  name: "tenant-context",
});
