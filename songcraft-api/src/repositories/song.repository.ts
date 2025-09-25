import { and, asc, desc, eq, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import { lyricVersions, songs } from "../schema";

// Database types
export type DbSong = typeof songs.$inferSelect;
export type DbLyricVersion = typeof lyricVersions.$inferSelect;

// Repository input types
export interface CreateSongData {
  shortId: string;
  ownerClerkId: string;
  title: string;
  artist?: string;
  bpm?: number;
  key?: string;
  tags?: string[];
  lyrics?: string;
  midiData?: string;
  collaborators?: string[];
  accountId?: string | null;
  projectId?: string;
}

export interface UpdateSongData {
  title?: string;
  artist?: string;
  bpm?: number;
  key?: string;
  tags?: string[];
  lyrics?: string;
  midiData?: string;
  collaborators?: string[];
  updatedAt?: Date;
}

export interface SongQueryOptions {
  accountId?: string;
  ownerClerkId?: string;
  projectId?: string;
}

export interface SongPaginationOptions {
  limit: number;
  offset: number;
  sort: "createdAt" | "updatedAt" | "title" | "artist";
  order: "asc" | "desc";
}

// Repository interface
export interface ISongRepository {
  // Basic CRUD operations
  create(data: CreateSongData): Promise<DbSong>;
  findById(id: string): Promise<DbSong | null>;
  findByShortId(shortId: string): Promise<DbSong | null>;
  update(id: string, data: UpdateSongData): Promise<DbSong | null>;
  delete(id: string): Promise<void>;
  
  // Query operations
  findMany(
    conditions: SongQueryOptions,
    pagination: SongPaginationOptions
  ): Promise<DbSong[]>;
  count(conditions: SongQueryOptions): Promise<number>;
  
  // Utility operations
  existsByShortId(shortId: string): Promise<boolean>;
  
  // Related data operations
  findSongVersions(songId: string): Promise<DbLyricVersion[]>;
  deleteWithVersions(songId: string): Promise<void>;
}

// Repository implementation
export class SongRepository implements ISongRepository {
  constructor(private db: NodePgDatabase<any>) {}

  // Order columns mapping
  private readonly orderColumns = {
    createdAt: songs.createdAt,
    updatedAt: songs.updatedAt,
    title: songs.title,
    artist: songs.artist,
  } as const;

  /**
   * Builds SQL conditions from query options
   */
  private buildConditions(conditions: SongQueryOptions): SQL[] {
    const sqlConditions: SQL[] = [];

    if (conditions.accountId) {
      sqlConditions.push(eq(songs.accountId, conditions.accountId));
    }

    if (conditions.ownerClerkId) {
      sqlConditions.push(eq(songs.ownerClerkId, conditions.ownerClerkId));
    }

    if (conditions.projectId) {
      sqlConditions.push(eq(songs.projectId, conditions.projectId));
    }

    return sqlConditions;
  }

  /**
   * Builds ORDER BY clause from pagination options
   */
  private buildOrderBy(sort: SongPaginationOptions["sort"], order: "asc" | "desc") {
    const column = this.orderColumns[sort];
    return order === "asc" ? asc(column) : desc(column);
  }

  /**
   * Merges multiple SQL conditions
   */
  private mergeConditions(conditions: SQL[]): SQL | undefined {
    if (conditions.length === 0) return undefined;
    if (conditions.length === 1) return conditions[0];
    return and(...conditions);
  }

  async create(data: CreateSongData): Promise<DbSong> {
    const [newSong] = await this.db
      .insert(songs)
      .values({
        shortId: data.shortId,
        ownerClerkId: data.ownerClerkId,
        title: data.title,
        artist: data.artist,
        bpm: data.bpm,
        key: data.key,
        tags: data.tags || [],
        lyrics: data.lyrics,
        midiData: data.midiData,
        collaborators: data.collaborators || [],
        accountId: data.accountId,
        projectId: data.projectId,
      })
      .returning();

    return newSong;
  }

  async findById(id: string): Promise<DbSong | null> {
    const [song] = await this.db
      .select()
      .from(songs)
      .where(eq(songs.id, id))
      .limit(1);

    return song || null;
  }

  async findByShortId(shortId: string): Promise<DbSong | null> {
    const [song] = await this.db
      .select()
      .from(songs)
      .where(eq(songs.shortId, shortId))
      .limit(1);

    return song || null;
  }

  async update(id: string, data: UpdateSongData): Promise<DbSong | null> {
    const [updatedSong] = await this.db
      .update(songs)
      .set({
        ...data,
        updatedAt: data.updatedAt || new Date(),
      })
      .where(eq(songs.id, id))
      .returning();

    return updatedSong || null;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(songs).where(eq(songs.id, id));
  }

  async findMany(
    conditions: SongQueryOptions,
    pagination: SongPaginationOptions
  ): Promise<DbSong[]> {
    const sqlConditions = this.buildConditions(conditions);
    const orderBy = this.buildOrderBy(pagination.sort, pagination.order);

    let query = this.db.select().from(songs).$dynamic();

    const mergedConditions = this.mergeConditions(sqlConditions);
    if (mergedConditions) {
      query = query.where(mergedConditions);
    }

    return await query
      .orderBy(orderBy)
      .limit(pagination.limit)
      .offset(pagination.offset);
  }

  async count(conditions: SongQueryOptions): Promise<number> {
    const sqlConditions = this.buildConditions(conditions);

    let query = this.db
      .select({ count: sql<number>`count(*)` })
      .from(songs)
      .$dynamic();

    const mergedConditions = this.mergeConditions(sqlConditions);
    if (mergedConditions) {
      query = query.where(mergedConditions);
    }

    const [result] = await query;
    return Number(result?.count ?? 0);
  }

  async existsByShortId(shortId: string): Promise<boolean> {
    const [result] = await this.db
      .select({ id: songs.id })
      .from(songs)
      .where(eq(songs.shortId, shortId))
      .limit(1);

    return !!result;
  }

  async findSongVersions(songId: string): Promise<DbLyricVersion[]> {
    return await this.db
      .select()
      .from(lyricVersions)
      .where(eq(lyricVersions.songId, songId))
      .orderBy(desc(lyricVersions.createdAt));
  }

  async deleteWithVersions(songId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(lyricVersions).where(eq(lyricVersions.songId, songId));
      await tx.delete(songs).where(eq(songs.id, songId));
    });
  }
}