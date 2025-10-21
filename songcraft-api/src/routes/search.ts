import { errorResponseSchema, uuidSchema, z } from "@songcraft/shared";
import type { FastifyInstance } from "fastify";
import { requireAccountId, requireUser } from "../middleware/auth-prehandlers";
import { withErrorHandling } from "./_utils/route-helpers";

const searchQuerySchema = z.object({
	q: z.string().min(1, "Search query is required"),
	limit: z.coerce.number().min(1).max(50).default(10),
	types: z
		.string()
		.optional()
		.transform((val) =>
			val
				? val.split(",").map((t) => t.trim())
				: ["songs", "projects", "users", "accounts"],
		),
});

const searchResultSchema = z.object({
	songs: z.array(
		z.object({
			id: z.string().uuid(),
			shortId: z.string(),
			title: z.string(),
			artist: z.string().nullable(),
			createdAt: z.string(),
		}),
	),
	projects: z.array(
		z.object({
			id: z.string().uuid(),
			name: z.string(),
			description: z.string().nullable(),
			createdAt: z.string(),
		}),
	),
	users: z.array(
		z.object({
			id: z.string().uuid(),
			email: z.string(),
			clerkId: z.string(),
			globalRole: z.string(),
		}),
	),
	accounts: z.array(
		z.object({
			id: z.string().uuid(),
			name: z.string(),
			description: z.string().nullable(),
			plan: z.string(),
			status: z.string(),
		}),
	),
	totalResults: z.number(),
});

export default async function searchRoutes(fastify: FastifyInstance) {
	fastify.get(
		"/search",
		{
			preHandler: [requireUser, requireAccountId],
			schema: {
				headers: z.object({
					"x-account-id": uuidSchema.optional(),
				}),
				querystring: searchQuerySchema,
				response: {
					200: searchResultSchema,
					400: errorResponseSchema,
					401: errorResponseSchema,
					500: errorResponseSchema,
				},
			},
		},
		withErrorHandling(async (request, reply) => {
			if (!request.container) {
				throw new Error("Container not available");
			}

			const clerkId = request.user?.clerkId as string;
			const accountId = request.headers["x-account-id"] as string;
			const { q, limit, types } = request.query as z.infer<
				typeof searchQuerySchema
			>;

			const result = await request.container.searchService.searchAll({
				query: q,
				limit,
				types,
				clerkId,
				accountId,
			});

			return reply.status(200).send(result);
		}),
	);
}
