import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import type { PoolClient } from "pg";

import { Container } from "../container";
import { pool } from "../db";

declare module "fastify" {
	interface FastifyRequest {
		db?: NodePgDatabase<Record<string, unknown>>;
		container?: Container;
		pgClient?: PoolClient;
		dbTxDone?: boolean;
	}
}

async function requestDbPlugin(fastify: FastifyInstance) {
	// Acquire a dedicated client and start a transaction per request
	fastify.addHook("preHandler", async (request) => {
		const client = await pool.connect();
		try {
			await client.query("BEGIN");
			request.pgClient = client;

			const requestDb = drizzle(client);
			request.db = requestDb;
			request.container = new Container(requestDb);
		} catch (err) {
			client.release();
			throw err;
		}
	});

	// Rollback on error
	fastify.addHook("onError", async (request) => {
		const client = request.pgClient;
		if (client && !request.dbTxDone) {
			try {
				await client.query("ROLLBACK");
			} finally {
				client.release();
				request.dbTxDone = true;
				request.pgClient = undefined;
			}
		}
	});

	// Commit on success and ensure release
	fastify.addHook("onResponse", async (request) => {
		const client = request.pgClient;
		if (client && !request.dbTxDone) {
			try {
				await client.query("COMMIT");
			} finally {
				client.release();
				request.dbTxDone = true;
				request.pgClient = undefined;
			}
		}
	});
}

export default fp(requestDbPlugin, { name: "request-db" });
