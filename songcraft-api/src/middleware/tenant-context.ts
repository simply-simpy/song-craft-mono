import type { FastifyInstance, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { sql } from "drizzle-orm";

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
				if (request.pgClient) {
					await request.pgClient.query(
						"SELECT set_config('app.account_id', $1, true)",
						[accountId],
					);
				} else if (request.db) {
					// Fallback just in case
					await request.db.execute(
						sql`SELECT set_config('app.account_id', ${accountId}, true)`,
					);
				}
				request.tenantContext = { accountId };
			} catch (_error) {
				fastify.log.warn(
					`Failed to set tenant context for account ${accountId}`,
				);
			}
		}
	});
}

export default fp(tenantContextPlugin, {
	name: "tenant-context",
});
