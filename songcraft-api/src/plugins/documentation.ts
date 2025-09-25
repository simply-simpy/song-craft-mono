import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

import { env } from "../config/env";

const getServerUrl = () => {
	if (env.HOST && env.HOST !== "0.0.0.0") {
		return `http://${env.HOST}:${env.PORT}`;
	}

	return `http://localhost:${env.PORT}`;
};

export const documentationPlugin = fp(async (fastify: FastifyInstance) => {
	if (!env.ENABLE_API_DOCS) {
		return;
	}

	await fastify.register(swagger, {
		openapi: {
			info: {
				title: "Songcraft API",
				description: "API for Songcraft application",
				version: "1.0.0",
			},
			servers: [
				{
					url: getServerUrl(),
					description:
						env.NODE_ENV === "production" ? "Production" : "Development",
				},
			],
		},
	});

	await fastify.register(swaggerUi, {
		routePrefix: "/documentation",
		staticCSP: true,
		transformStaticCSP: (header) => header,
	});
});

export type DocumentationPlugin = typeof documentationPlugin;
