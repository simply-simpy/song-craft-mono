import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../db";
import { songs, lyricVersions } from "../schema";
import { eq, desc, sql, and, asc } from "drizzle-orm";
import crypto from "node:crypto";

// Input validation schemas
const uuidSchema = z.string().uuid();
const songIdSchema = z
  .string()
  .length(16)
  .regex(/^[a-f0-9]{16}$/);

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

const paginationSchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .refine((n) => n > 0)
    .default(1),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .refine((n) => n > 0 && n <= 100)
    .default(20),
  sort: z
    .enum(["createdAt", "updatedAt", "title", "artist"])
    .default("updatedAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  accountId: z.string().uuid().optional(),
  ownerClerkId: z.string().optional(),
});

// Response schemas
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

const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.any().optional(),
});

export default async function songRoutes(fastify: FastifyInstance) {
  // Get all songs with pagination and filtering
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
    async (request, reply) => {
      const queryResult = paginationSchema.safeParse(request.query);
      if (!queryResult.success) {
        return reply.code(400).send({ error: "Invalid query parameters" });
      }
      const { page, limit, sort, order, accountId, ownerClerkId } =
        queryResult.data;

      try {
        const offset = (page - 1) * limit;

        // Build base query
        let baseQuery = db.select().from(songs).$dynamic();
        let countQuery = db
          .select({ count: sql<number>`count(*)` })
          .from(songs)
          .$dynamic();

        // Apply filters
        const conditions = [];
        if (accountId) conditions.push(eq(songs.accountId, accountId));
        if (ownerClerkId) conditions.push(eq(songs.ownerClerkId, ownerClerkId));

        if (conditions.length > 0) {
          const whereClause =
            conditions.length === 1 ? conditions[0] : and(...conditions);
          baseQuery = baseQuery.where(whereClause);
          countQuery = countQuery.where(whereClause);
        }

        // Get total count
        const [{ count }] = await countQuery;
        const totalPages = Math.ceil(count / limit);

        // Get songs with sorting
        const orderBy = order === "asc" ? asc(songs[sort]) : desc(songs[sort]);
        const songsList = await baseQuery
          .orderBy(orderBy)
          .limit(limit)
          .offset(offset);

        return reply.code(200).send({
          songs: songsList,
          pagination: {
            page,
            limit,
            total: count,
            pages: totalPages,
          },
        });
      } catch (error) {
        fastify.log.error({ error }, "Error fetching songs");
        return reply.code(500).send({
          error: "Failed to fetch songs",
        });
      }
    }
  );

  // Get song by ID (UUID primary key)
  fastify.get(
    "/songs/:id",
    {
      schema: {
        params: z.object({ id: uuidSchema }),
        response: {
          200: z.object({ song: songResponseSchema }),
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      try {
        const song = await db
          .select()
          .from(songs)
          .where(eq(songs.id, id))
          .limit(1);

        if (song.length === 0) {
          return reply.code(404).send({ error: "Song not found" });
        }

        return reply.code(200).send({ song: song[0] });
      } catch (error) {
        fastify.log.error({ error }, "Error fetching song");
        return reply.code(500).send({
          error: "Failed to fetch song",
        });
      }
    }
  );

  // Get song by shortId (16-char hex)
  fastify.get(
    "/songs/short/:shortId",
    {
      schema: {
        params: z.object({ shortId: songIdSchema }),
        response: {
          200: z.object({ song: songResponseSchema }),
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { shortId } = request.params as { shortId: string };

      try {
        const song = await db
          .select()
          .from(songs)
          .where(eq(songs.shortId, shortId))
          .limit(1);

        if (song.length === 0) {
          return reply.code(404).send({ error: "Song not found" });
        }

        return reply.code(200).send({ song: song[0] });
      } catch (error) {
        fastify.log.error({ error }, "Error fetching song by shortId");
        return reply.code(500).send({
          error: "Failed to fetch song",
        });
      }
    }
  );

  // Get lyrics for a song by UUID
  fastify.get(
    "/songs/:id/versions",
    {
      schema: {
        params: z.object({ id: uuidSchema }),
        response: {
          200: z.object({ versions: z.array(z.any()) }),
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      try {
        // Verify song exists and get ownership info for authorization
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
          return reply.code(404).send({ error: "Song not found" });
        }

        // Get lyric versions
        const versions = await db
          .select()
          .from(lyricVersions)
          .where(eq(lyricVersions.songId, id))
          .orderBy(desc(lyricVersions.createdAt));

        return reply.code(200).send({ versions });
      } catch (error) {
        fastify.log.error({ error }, "Error fetching lyric versions");
        return reply.code(500).send({
          error: "Failed to fetch lyric versions",
        });
      }
    }
  );

  // Create new song
  fastify.post(
    "/songs",
    {
      schema: {
        body: songSchema,
        response: {
          201: z.object({ song: songResponseSchema }),
          400: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const clerkId = request.headers["x-clerk-user-id"] as string;

      if (!clerkId) {
        return reply.code(400).send({ error: "Authentication required" });
      }

      try {
        // Generate unique shortId using CSPRNG
        let shortId: string;
        let attempts = 0;
        const maxAttempts = 5;

        do {
          shortId = crypto.randomBytes(8).toString("hex").toLowerCase();
          attempts++;

          if (attempts >= maxAttempts) {
            return reply.code(500).send({
              error: "Failed to generate unique song ID",
            });
          }
        } while (
          await db
            .select()
            .from(songs)
            .where(eq(songs.shortId, shortId))
            .limit(1)
            .then((result) => result.length > 0)
        );

        // Get user's current account context (this would come from your auth system)
        // For now, we'll require it to be passed or use a default
        const accountId = request.headers["x-account-id"] as string;

        const body = songSchema.parse(request.body);

        const songData = {
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
          accountId: accountId || null, // Remove hard-coded value
        };

        const newSong = await db.insert(songs).values(songData).returning();

        return reply.code(201).send({ song: newSong[0] });
      } catch (error) {
        fastify.log.error({ error }, "Error creating song");
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            error: "Invalid song data",
            details: error.issues,
          });
        }
        return reply.code(500).send({
          error: "Failed to create song",
        });
      }
    }
  );

  // Update song
  fastify.put(
    "/songs/:id",
    {
      schema: {
        params: z.object({ id: uuidSchema }),
        body: songSchema.partial(),
        response: {
          200: z.object({ song: songResponseSchema }),
          400: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const clerkId = request.headers["x-clerk-user-id"] as string;

      if (!clerkId) {
        return reply.code(400).send({ error: "Authentication required" });
      }

      try {
        // Verify ownership
        const song = await db
          .select()
          .from(songs)
          .where(eq(songs.id, id))
          .limit(1);

        if (song.length === 0) {
          return reply.code(404).send({ error: "Song not found" });
        }

        if (song[0].ownerClerkId !== clerkId) {
          return reply.code(403).send({ error: "Insufficient permissions" });
        }

        const body = songSchema.partial().parse(request.body);

        const updatedSong = await db
          .update(songs)
          .set({
            ...body,
            updatedAt: new Date(),
          })
          .where(eq(songs.id, id))
          .returning();

        return reply.code(200).send({ song: updatedSong[0] });
      } catch (error) {
        fastify.log.error({ error }, "Error updating song");
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            error: "Invalid song data",
            details: error.issues,
          });
        }
        return reply.code(500).send({
          error: "Failed to update song",
        });
      }
    }
  );

  // Delete song by UUID
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
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const clerkId = request.headers["x-clerk-user-id"] as string;

      if (!clerkId) {
        return reply.code(401).send({ error: "Authentication required" });
      }

      try {
        // Verify ownership
        const song = await db
          .select()
          .from(songs)
          .where(eq(songs.id, id))
          .limit(1);

        if (song.length === 0) {
          return reply.code(404).send({ error: "Song not found" });
        }

        if (song[0].ownerClerkId !== clerkId) {
          return reply.code(403).send({ error: "Insufficient permissions" });
        }

        // Use transaction to ensure atomicity
        await db.transaction(async (tx) => {
          // Delete lyric versions first (FK constraint)
          await tx.delete(lyricVersions).where(eq(lyricVersions.songId, id));
          // Delete the song
          await tx.delete(songs).where(eq(songs.id, id));
        });

        return reply.code(204).send();
      } catch (error) {
        fastify.log.error({ error }, "Error deleting song");
        return reply.code(500).send({
          error: "Failed to delete song",
        });
      }
    }
  );
}
