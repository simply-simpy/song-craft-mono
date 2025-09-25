import cors from "@fastify/cors";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

import { env } from "../config/env";

const parseCorsOrigins = (rawOrigin: string) => {
	if (rawOrigin.trim() === "*") {
		return true;
	}

	return rawOrigin
		.split(",")
		.map((origin) => origin.trim())
		.filter(Boolean);
};

const parseCorsMethods = (rawMethods: string) =>
	rawMethods
		.split(",")
		.map((method) => method.trim().toUpperCase())
		.filter(Boolean);

export const corsPlugin = fp(async (fastify: FastifyInstance) => {
	const origin = parseCorsOrigins(env.CORS_ORIGIN);
	const methods = parseCorsMethods(env.CORS_METHODS);

	await fastify.register(cors, {
		origin,
		methods,
		allowedHeaders: ["Content-Type", "Authorization", "x-clerk-user-id"],
		credentials: true,
	});
});

export type CorsPlugin = typeof corsPlugin;
