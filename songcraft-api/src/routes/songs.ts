import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { container } from "../container";
import {
  songResponseSchema,
  songSchema,
  songsListResponseSchema,
  versionsResponseSchema,
} from "../services/songs.service";
import { requireAuthenticatedUser } from "./_utils/auth";
import {
  buildPaginationMeta,
  createPaginationSchema,
} from "./_utils/pagination";
import { withErrorHandling } from "./_utils/route-helpers";

const uuidSchema = z.string().uuid();
const shortIdSchema = z
  .string()
  .length(16)
  .regex(/^[a-f0-9]{16}$/);

const paginationSchema = createPaginationSchema({
  sortOptions: ["createdAt", "updatedAt", "title", "artist"] as const,
  defaultSort: "updatedAt",
}).extend({
  accountId: z.string().uuid().optional(),
  ownerClerkId: z.string().optional(),
});

type PaginationQuery = z.infer<typeof paginationSchema>;

const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.any().optional(),
});

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
      const { page, limit, sort, order, accountId, ownerClerkId } =
        request.query as PaginationQuery;

      const result = await container.songsService.listSongs(
        { ownerClerkId }, // Remove accountId - RLS policies handle account filtering
        { page, limit, sort, order }
      );

      return reply.status(200).send(result);
    })
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

      const song = await container.songsService.findById(id);
      if (!song) {
        throw new Error("Song not found");
      }

      return reply.status(200).send({ song });
    })
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

      const song = await container.songsService.findByShortId(shortId);
      if (!song) {
        throw new Error("Song not found");
      }

      return reply.status(200).send({ song });
    })
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

      const versions = await container.songsService.getSongVersions(id);

      return reply.status(200).send({ versions });
    })
  );

  fastify.post(
    "/songs",
    {
      schema: {
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
      const clerkId = await requireAuthenticatedUser(request);
      const accountId = request.headers["x-account-id"] as string;

      if (!accountId) {
        return reply.status(400).send({
          error: "Account ID is required",
          code: "MISSING_ACCOUNT_ID",
        });
      }

      const body = request.body as z.infer<typeof songSchema>;

      const song = await container.songsService.createSong(
        body,
        clerkId,
        accountId
      );

      return reply.status(201).send({ song });
    })
  );

  fastify.put(
    "/songs/:id",
    {
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
      const clerkId = await requireAuthenticatedUser(request);
      const accountId =
        (request.headers["x-account-id"] as string | undefined) ?? null;

      const body = request.body as Partial<z.infer<typeof songSchema>>;

      const song = await container.songsService.updateSong(id, body, clerkId);

      return reply.status(200).send({ song });
    })
  );

  fastify.delete(
    "/songs/:id",
    {
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
      const clerkId = await requireAuthenticatedUser(request);

      await container.songsService.deleteSong(id, clerkId);

      return reply.status(204).send();
    })
  );
}
