import crypto from "node:crypto";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { z } from "zod";

import { db } from "../db";
import { lyricVersions, songs } from "../schema";
import { AppError, ForbiddenError, NotFoundError } from "../lib/errors";

// Types and Schemas

type DbSong = typeof songs.$inferSelect;

export const songSchema = z.object({
  title: z.string().min(1).max(200),
  artist: z.string().max(200).optional(),
  bpm: z.number().int().min(1).max(500).optional(),
  key: z.string().max(12).optional(),
  tags: z.array(z.string()).max(20).default([]),
  lyrics: z.string().optional(),
  midiData: z.string().optional(),
  collaborators: z.array(z.string()).default([]),
});

export const songResponseSchema = z.object({
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

export const songsListResponseSchema = z.object({
  songs: z.array(songResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
  }),
});

export const versionsResponseSchema = z.object({
  versions: z.array(z.any()),
});

export type Song = z.infer<typeof songResponseSchema>;
export type CreateSongInput = z.infer<typeof songSchema>;
export type UpdateSongInput = Partial<CreateSongInput>;

export interface SongQueryConditions {
  accountId?: string;
  ownerClerkId?: string;
}

export interface SongPaginationOptions {
  page: number;
  limit: number;
  sort: "createdAt" | "updatedAt" | "title" | "artist";
  order: "asc" | "desc";
}

export interface SongListResult {
  songs: Song[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Order columns mapping
const songOrderColumns = {
  createdAt: songs.createdAt,
  updatedAt: songs.updatedAt,
  title: songs.title,
  artist: songs.artist,
} as const;

type SongOrderColumnKey = keyof typeof songOrderColumns;

export class SongsService {
  /**
   * Converts various input types to a clean string array
   * Handles arrays, JSON strings, objects, and single strings
   */
  private toStringArray(value: unknown): string[] {
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
              typeof item === "string"
                ? item
                : item != null
                  ? String(item)
                  : null
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
  }

  /**
   * Serializes a database song record to API response format
   */
  private serializeSong(song: DbSong): Song {
    return {
      ...song,
      artist: song.artist ?? null,
      bpm: song.bpm ?? null,
      key: song.key ?? null,
      lyrics: song.lyrics ?? null,
      midiData: song.midiData ?? null,
      accountId: song.accountId ?? null,
      projectId: song.projectId ?? null,
      tags: this.toStringArray(song.tags),
      collaborators: this.toStringArray(song.collaborators),
      createdAt: song.createdAt.toISOString(),
      updatedAt: song.updatedAt.toISOString(),
    };
  }

  /**
   * Builds order by clause for song queries
   */
  private buildOrderBy(sort: SongOrderColumnKey, order: "asc" | "desc") {
    const column = songOrderColumns[sort];
    return order === "asc" ? asc(column) : desc(column);
  }

  /**
   * Builds query conditions for filtering songs
   */
  private buildQueryConditions(conditions: SongQueryConditions): SQL[] {
    const sqlConditions: SQL[] = [];

    if (conditions.accountId) {
      sqlConditions.push(eq(songs.accountId, conditions.accountId));
    }

    if (conditions.ownerClerkId) {
      sqlConditions.push(eq(songs.ownerClerkId, conditions.ownerClerkId));
    }

    return sqlConditions;
  }

  /**
   * Merges multiple SQL conditions into a single condition
   */
  private mergeConditions(conditions: SQL[]): SQL | undefined {
    if (conditions.length === 0) return undefined;
    if (conditions.length === 1) return conditions[0];
    return and(...conditions);
  }

  /**
   * Counts total songs matching the given conditions
   */
  private async countSongs(conditions: SQL[]): Promise<number> {
    let query = db
      .select({ count: sql<number>`count(*)` })
      .from(songs)
      .$dynamic();

    const mergedConditions = this.mergeConditions(conditions);
    if (mergedConditions) {
      query = query.where(mergedConditions);
    }

    const [result] = await query;
    return Number(result?.count ?? 0);
  }

  /**
   * Fetches songs with pagination and sorting
   */
  private async fetchSongs(
    conditions: SQL[],
    orderBy: ReturnType<typeof this.buildOrderBy>,
    limit: number,
    offset: number
  ): Promise<Song[]> {
    let baseQuery = db.select().from(songs).$dynamic();

    const mergedConditions = this.mergeConditions(conditions);
    if (mergedConditions) {
      baseQuery = baseQuery.where(mergedConditions);
    }

    const rows = await baseQuery.orderBy(orderBy).limit(limit).offset(offset);
    return rows.map((song: DbSong) => this.serializeSong(song));
  }

  /**
   * Generates a unique short ID for songs with collision detection
   */
  private async generateUniqueShortId(): Promise<string> {
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
  }

  /**
   * Validates that a user owns a song
   */
  private async assertSongOwner(id: string, clerkId: string): Promise<Song> {
    const song = await this.findById(id);
    if (!song) {
      throw new NotFoundError("Song not found");
    }

    if (song.ownerClerkId !== clerkId) {
      throw new ForbiddenError();
    }

    return song;
  }

  // Public CRUD Methods

  /**
   * Creates a new song
   */
  async createSong(
    input: CreateSongInput,
    ownerClerkId: string,
    accountId?: string
  ): Promise<Song> {
    const shortId = await this.generateUniqueShortId();

    const newSong = await db
      .insert(songs)
      .values({
        shortId,
        ownerClerkId,
        title: input.title,
        artist: input.artist,
        bpm: input.bpm,
        key: input.key,
        tags: input.tags,
        lyrics: input.lyrics,
        midiData: input.midiData,
        collaborators: input.collaborators,
        accountId: accountId ?? null,
      })
      .returning();

    return this.serializeSong(newSong[0]);
  }

  /**
   * Finds a song by its UUID
   */
  async findById(id: string): Promise<Song | null> {
    const [song] = await db
      .select()
      .from(songs)
      .where(eq(songs.id, id))
      .limit(1);
    return song ? this.serializeSong(song) : null;
  }

  /**
   * Finds a song by its short ID
   */
  async findByShortId(shortId: string): Promise<Song | null> {
    const [song] = await db
      .select()
      .from(songs)
      .where(eq(songs.shortId, shortId))
      .limit(1);
    return song ? this.serializeSong(song) : null;
  }

  /**
   * Lists songs with pagination and filtering
   */
  async listSongs(
    conditions: SongQueryConditions,
    options: SongPaginationOptions
  ): Promise<SongListResult> {
    const sqlConditions = this.buildQueryConditions(conditions);
    const orderBy = this.buildOrderBy(options.sort, options.order);
    const offset = (options.page - 1) * options.limit;

    const [total, songsList] = await Promise.all([
      this.countSongs(sqlConditions),
      this.fetchSongs(sqlConditions, orderBy, options.limit, offset),
    ]);

    return {
      songs: songsList,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit),
      },
    };
  }

  /**
   * Updates a song (with ownership validation)
   */
  async updateSong(
    id: string,
    input: UpdateSongInput,
    clerkId: string
  ): Promise<Song> {
    await this.assertSongOwner(id, clerkId);

    const updatedSong = await db
      .update(songs)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(songs.id, id))
      .returning();

    if (updatedSong.length === 0) {
      throw new NotFoundError("Song not found");
    }

    return this.serializeSong(updatedSong[0]);
  }

  /**
   * Deletes a song and its versions (with ownership validation)
   */
  async deleteSong(id: string, clerkId: string): Promise<void> {
    await this.assertSongOwner(id, clerkId);

    await db.transaction(async (tx) => {
      await tx.delete(lyricVersions).where(eq(lyricVersions.songId, id));
      await tx.delete(songs).where(eq(songs.id, id));
    });
  }

  /**
   * Gets all versions for a song
   */
  async getSongVersions(id: string): Promise<unknown[]> {
    // First verify the song exists
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

    return versions;
  }
}

// Export a singleton instance
export const songsService = new SongsService();
