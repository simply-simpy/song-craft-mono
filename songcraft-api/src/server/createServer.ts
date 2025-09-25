import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
	serializerCompiler,
	validatorCompiler,
} from "fastify-type-provider-zod";

import { env } from "../config/env";
import { superUserPlugin } from "../middleware/super-user";
import { corsPlugin } from "../plugins/cors";
import { documentationPlugin } from "../plugins/documentation";
import { securityHeadersPlugin } from "../plugins/security";
import adminRoutes from "../routes/admin";
import projectRoutes from "../routes/projects";
import songRoutes from "../routes/songs";
import userRoutes from "../routes/user";

export const createServer = (): FastifyInstance => {
	const server = Fastify({
		logger: { level: env.LOG_LEVEL },
		trustProxy: env.TRUST_PROXY,
	}).withTypeProvider<ZodTypeProvider>();

	server.setValidatorCompiler(validatorCompiler);
	server.setSerializerCompiler(serializerCompiler);

	server.register(securityHeadersPlugin);
	server.register(corsPlugin);
	server.register(documentationPlugin);

	server.register(superUserPlugin);

	server.register(songRoutes);
	server.register(userRoutes);
	server.register(adminRoutes, { prefix: "/admin" });
	server.register(projectRoutes);

	server.get("/health", async () => ({
		status: "ok",
		timestamp: new Date().toISOString(),
	}));

	return server;
};
