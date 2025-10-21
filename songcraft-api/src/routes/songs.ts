import {
	errorResponseSchema,
	shortIdSchema,
	songResponseSchema,
	songsListResponseSchema,
	uuidSchema,
	z,
} from "@songcraft/shared";
import type { FastifyInstance } from "fastify";

import { NotFoundError } from "../lib/errors";
import { requireAccountId, requireUser } from "../middleware/auth-prehandlers";
import { songSchema, versionsResponseSchema } from "../services/songs.service";
import {
	buildPaginationMeta,
	createPaginationSchema,
} from "./_utils/pagination";
import { withErrorHandling } from "./_utils/route-helpers";

const paginationSchema = createPaginationSchema({
	sortOptions: ["createdAt", "updatedAt", "title", "artist"] as const,
	defaultSort: "updatedAt",
}).extend({
	accountId: uuidSchema.optional(),
	ownerClerkId: z.string().optional(),
});

type PaginationQuery = z.infer<typeof paginationSchema>;

export default async function songRoutes(fastify: FastifyInstance) {
	fastify.get(
		"/songs",
		{
			schema: {
				querystring: paginationSchema,
				response: {
					200: songsListResponseSchema,
					400: errorResponseSchema,
					500: errorResponseSchema,
				},
			},
		},
		withErrorHandling(async (request, reply) => {
			const { page, limit, sort, order, ownerClerkId } =
				request.query as PaginationQuery;

			if (!request.container) {
				throw new Error("Container not available");
			}

			const result = await request.container.songsService.listSongs(
				{ ownerClerkId },
				{ page, limit, sort, order },
			);

			return reply.status(200).send(result);
		}),
	);

	fastify.get(
		"/songs/:id",
		{
			schema: {
				params: z.object({ id: uuidSchema }),
				response: {
					200: z.object({ song: songResponseSchema }),
					400: errorResponseSchema,
					404: errorResponseSchema,
					500: errorResponseSchema,
				},
			},
		},
		withErrorHandling(async (request, reply) => {
			const { id } = request.params as { id: string };

			if (!request.container) {
				throw new Error("Container not available");
			}

			const song = await request.container.songsService.findById(id);
			if (!song) {
				throw new NotFoundError("Song not found");
			}

			return reply.status(200).send({ song });
		}),
	);

	fastify.get(
		"/songs/short/:shortId",
		{
			schema: {
				params: z.object({ shortId: shortIdSchema }),
				response: {
					200: z.object({ song: songResponseSchema }),
					400: errorResponseSchema,
					404: errorResponseSchema,
					500: errorResponseSchema,
				},
			},
		},
		withErrorHandling(async (request, reply) => {
			const { shortId } = request.params as { shortId: string };

			if (!request.container) {
				throw new Error("Container not available");
			}

			const song = await request.container.songsService.findByShortId(shortId);
			if (!song) {
				throw new NotFoundError("Song not found");
			}

			return reply.status(200).send({ song });
		}),
	);

	fastify.get(
		"/songs/:id/versions",
		{
			schema: {
				params: z.object({ id: uuidSchema }),
				response: {
					200: versionsResponseSchema,
					400: errorResponseSchema,
					404: errorResponseSchema,
					500: errorResponseSchema,
				},
			},
		},
		withErrorHandling(async (request, reply) => {
			const { id } = request.params as { id: string };

			if (!request.container) {
				throw new Error("Container not available");
			}

			const versions = await request.container.songsService.getSongVersions(id);

			return reply.status(200).send({ versions });
		}),
	);

	fastify.post(
		"/songs",
		{
			preHandler: [requireUser, requireAccountId],
			schema: {
				headers: z.object({
					"x-account-id": uuidSchema.optional(),
				}),
				body: songSchema,
				response: {
					201: z.object({ song: songResponseSchema }),
					400: errorResponseSchema,
					401: errorResponseSchema,
					500: errorResponseSchema,
				},
			},
		},
		withErrorHandling(async (request, reply) => {
			const clerkId = (request.user?.clerkId as string) ?? "";
			const accountId = request.headers["x-account-id"] as string;

			const body = request.body as z.infer<typeof songSchema>;

			if (!request.container) {
				throw new Error("Container not available");
			}

			const song = await request.container.songsService.createSong(
				body,
				clerkId,
				accountId,
			);

			return reply.status(201).send({ song });
		}),
	);

	fastify.put(
		"/songs/:id",
		{
			preHandler: [requireUser],
			schema: {
				params: z.object({ id: uuidSchema }),
				body: songSchema.partial(),
				response: {
					200: z.object({ song: songResponseSchema }),
					400: errorResponseSchema,
					401: errorResponseSchema,
					403: errorResponseSchema,
					404: errorResponseSchema,
					500: errorResponseSchema,
				},
			},
		},
		withErrorHandling(async (request, reply) => {
			const { id } = request.params as { id: string };
			const clerkId = (request.user?.clerkId as string) ?? "";

			const body = request.body as Partial<z.infer<typeof songSchema>>;

			if (!request.container) {
				throw new Error("Container not available");
			}

			const song = await request.container.songsService.updateSong(
				id,
				body,
				clerkId,
			);

			return reply.status(200).send({ song });
		}),
	);

	fastify.delete(
		"/songs/:id",
		{
			preHandler: [requireUser],
			schema: {
				params: z.object({ id: uuidSchema }),
				response: {
					204: z.null(),
					401: errorResponseSchema,
					403: errorResponseSchema,
					404: errorResponseSchema,
					500: errorResponseSchema,
				},
			},
		},
		withErrorHandling(async (request, reply) => {
			const { id } = request.params as { id: string };
			const clerkId = (request.user?.clerkId as string) ?? "";

			if (!request.container) {
				throw new Error("Container not available");
			}

			await request.container.songsService.deleteSong(id, clerkId);

			return reply.status(204).send();
		}),
	);
}
