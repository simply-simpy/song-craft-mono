import crypto from "node:crypto";

import type { FastifyInstance } from "fastify";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { z } from "zod";

import { db } from "../db";
import { lyricVersions, songs } from "../schema";
import { AppError, ForbiddenError, NotFoundError } from "../lib/errors";
import { requireClerkUser } from "./_utils/auth";
import {
  buildPaginationMeta,
  createPaginationSchema,
  getOffset,
} from "./_utils/pagination";
import type { orderDirectionSchema } from "./_utils/pagination";
import { withErrorHandling } from "./_utils/route-helpers";

const uuidSchema = z.string().uuid();
const shortIdSchema = z
  .string()
  .length(16)
  .regex(/^[a-f0-9]{16}$/);

type DbSong = typeof songs.$inferSelect;

const songSchema = z.object({
  title: z.string().min(1).max(200),
  artist: z.string().max(200).optional(),
  bpm: z.number().int().min(1).max(500).optional(),
  key: z.string().max(12).optional(),
  tags: z.array(z.string()).max(20).default([]),
  lyrics: z.string().optional(),
  midiData: z.string().optional(),
  collaborators: z.array(z.string()).default([]),
});

const paginationSchema = createPaginationSchema({
  sortOptions: ["createdAt", "updatedAt", "title", "artist"] as const,
  defaultSort: "updatedAt",
}).extend({
  accountId: z.string().uuid().optional(),
  ownerClerkId: z.string().optional(),
});

const songResponseSchema = z.object({
  id: z.string().uuid(),
  shortId: z.string().length(16),
  ownerClerkId: z.string(),
  title: z.string(),
  artist: z.string().nullable(),
  bpm: z.number().nullable(),
  key: z.string().nullable(),
  tags: z.array(z.string()),
  lyrics: z.string().nullable(),
  midiData: z.string().nullable(),
  collaborators: z.array(z.string()),
  accountId: z.string().uuid().nullable(),
  projectId: z.string().uuid().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const songsListResponseSchema = z.object({
  songs: z.array(songResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
  }),
});

const versionsResponseSchema = z.object({
  versions: z.array(z.any()),
});

const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.any().optional(),
});

const songOrderColumns = {
  createdAt: songs.createdAt,
  updatedAt: songs.updatedAt,
  title: songs.title,
  artist: songs.artist,
} as const;

type SongOrderColumnKey = keyof typeof songOrderColumns;

type PaginationQuery = z.infer<typeof paginationSchema>;

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === "string" ? item : item != null ? String(item) : null
      )
      .filter((item): item is string => item !== null && item.length > 0);
  }

  if (typeof value === "string" && value.trim().length > 0) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) =>
            typeof item === "string" ? item : item != null ? String(item) : null
          )
          .filter((item): item is string => item !== null && item.length > 0);
      }
    } catch (error) {
      // Ignore parse failures and fall back to raw string value
    }
    return [value];
  }

  if (value && typeof value === "object") {
    return Object.values(value)
      .map((item) =>
        typeof item === "string" ? item : item != null ? String(item) : null
      )
      .filter((item): item is string => item !== null && item.length > 0);
  }

  return [];
};

const serializeSong = (song: DbSong) => ({
  ...song,
  artist: song.artist ?? null,
  bpm: song.bpm ?? null,
  key: song.key ?? null,
  lyrics: song.lyrics ?? null,
  midiData: song.midiData ?? null,
  accountId: song.accountId ?? null,
  projectId: song.projectId ?? null,
  tags: toStringArray(song.tags),
  collaborators: toStringArray(song.collaborators),
  createdAt: song.createdAt.toISOString(),
  updatedAt: song.updatedAt.toISOString(),
});

const buildOrderBy = (
  sort: SongOrderColumnKey,
  order: z.infer<typeof orderDirectionSchema>
) => {
  const column = songOrderColumns[sort];
  return order === "asc" ? asc(column) : desc(column);
};

const countSongs = async (conditions: SQL[]) => {
  let query = db
    .select({ count: sql<number>`count(*)` })
    .from(songs)
    .$dynamic();

  if (conditions.length > 0) {
    query = query.where(
      conditions.length === 1 ? conditions[0] : and(...conditions)
    );
  }

  const [result] = await query;
  return Number(result?.count ?? 0);
};

const fetchSongs = async (
  conditions: SQL[],
  orderBy: ReturnType<typeof buildOrderBy>,
  limit: number,
  offset: number
) => {
  let baseQuery = db.select().from(songs).$dynamic();

  if (conditions.length > 0) {
    baseQuery = baseQuery.where(
      conditions.length === 1 ? conditions[0] : and(...conditions)
    );
  }

  const rows = await baseQuery.orderBy(orderBy).limit(limit).offset(offset);
  return rows.map(serializeSong);
};

const generateUniqueShortId = async () => {
  const maxAttempts = 5;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const shortId = crypto.randomBytes(8).toString("hex").toLowerCase();

    const existing = await db
      .select({ id: songs.id })
      .from(songs)
      .where(eq(songs.shortId, shortId))
      .limit(1);

    if (existing.length === 0) {
      return shortId;
    }
  }

  throw new AppError("Failed to generate unique song ID", {
    statusCode: 500,
    code: "SHORT_ID_GENERATION_FAILED",
  });
};

const findSongById = async (id: string) => {
  const [song] = await db.select().from(songs).where(eq(songs.id, id)).limit(1);
  return song ? serializeSong(song) : null;
};

const findSongByShortId = async (shortId: string) => {
  const [song] = await db
    .select()
    .from(songs)
    .where(eq(songs.shortId, shortId))
    .limit(1);
  return song ? serializeSong(song) : null;
};

const assertSongOwner = async (id: string, clerkId: string) => {
  const song = await findSongById(id);
  if (!song) {
    throw new NotFoundError("Song not found");
  }

  if (song.ownerClerkId !== clerkId) {
    throw new ForbiddenError();
  }

  return song;
};

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

      const conditions: SQL[] = [];
      if (accountId) {
        conditions.push(eq(songs.accountId, accountId));
      }
      if (ownerClerkId) {
        conditions.push(eq(songs.ownerClerkId, ownerClerkId));
      }

      const offset = getOffset({ page, limit });
      const orderBy = buildOrderBy(sort, order);

      const total = await countSongs(conditions);

      const songsList = await fetchSongs(conditions, orderBy, limit, offset);

      return reply.status(200).send({
        songs: songsList,
        pagination: buildPaginationMeta({ page, limit, total }),
      });
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

      const song = await findSongById(id);
      if (!song) {
        throw new NotFoundError("Song not found");
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

      const song = await findSongByShortId(shortId);
      if (!song) {
        throw new NotFoundError("Song not found");
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

      const song = await db
        .select({
          id: songs.id,
          ownerClerkId: songs.ownerClerkId,
          accountId: songs.accountId,
        })
        .from(songs)
        .where(eq(songs.id, id))
        .limit(1);

      if (song.length === 0) {
        throw new NotFoundError("Song not found");
      }

      const versions = await db
        .select()
        .from(lyricVersions)
        .where(eq(lyricVersions.songId, id))
        .orderBy(desc(lyricVersions.createdAt));

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
      const clerkId = requireClerkUser(request);
      const accountId =
        (request.headers["x-account-id"] as string | undefined) ?? null;

      const body = request.body as z.infer<typeof songSchema>;
      const shortId = await generateUniqueShortId();

      const newSong = await db
        .insert(songs)
        .values({
          shortId,
          ownerClerkId: clerkId,
          title: body.title,
          artist: body.artist,
          bpm: body.bpm,
          key: body.key,
          tags: body.tags,
          lyrics: body.lyrics,
          midiData: body.midiData,
          collaborators: body.collaborators,
          accountId,
        })
        .returning();

      const song = serializeSong(newSong[0]);

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
      const clerkId = requireClerkUser(request);

      await assertSongOwner(id, clerkId);

      const body = request.body as Partial<z.infer<typeof songSchema>>;

      const updatedSong = await db
        .update(songs)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(eq(songs.id, id))
        .returning();

      if (updatedSong.length === 0) {
        throw new NotFoundError("Song not found");
      }

      return reply.status(200).send({ song: serializeSong(updatedSong[0]) });
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
      const clerkId = requireClerkUser(request);

      await assertSongOwner(id, clerkId);

      await db.transaction(async (tx) => {
        await tx.delete(lyricVersions).where(eq(lyricVersions.songId, id));
        await tx.delete(songs).where(eq(songs.id, id));
      });

      return reply.status(204).send();
    })
  );
}
