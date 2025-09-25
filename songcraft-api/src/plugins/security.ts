import type { FastifyInstance, FastifyReply } from "fastify";
import fp from "fastify-plugin";

import { env } from "../config/env";

const applySecurityHeaders = (reply: FastifyReply) => {
	reply.header("X-Content-Type-Options", "nosniff");
	reply.header("X-Frame-Options", "SAMEORIGIN");
	reply.header("Cross-Origin-Opener-Policy", "same-origin");
	reply.header("Cross-Origin-Embedder-Policy", "require-corp");
	reply.header("Cross-Origin-Resource-Policy", "same-site");
	reply.header("Referrer-Policy", "no-referrer");

	if (env.NODE_ENV === "production") {
		reply.header(
			"Strict-Transport-Security",
			"max-age=31536000; includeSubDomains",
		);
	}
};

export const securityHeadersPlugin = fp(async (fastify: FastifyInstance) => {
	fastify.addHook("onSend", async (_request, reply, payload) => {
		applySecurityHeaders(reply);
		return payload;
	});
});

export type SecurityHeadersPlugin = typeof securityHeadersPlugin;
