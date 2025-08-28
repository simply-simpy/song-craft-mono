import { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../db";
import { songs, lyricVersions } from "../schema";
import { eq } from "drizzle-orm";

export default async function songRoutes(fastify: FastifyInstance) {
  // Get all songs
  fastify.get("/songs", async () => {
    try {
      const allSongs = await db.select().from(songs);
      return { success: true, data: allSongs };
    } catch (error) {
      return { success: false, error: "Failed to fetch songs" };
    }
  });

  // Get song by ID
  fastify.get("/songs/:id", async (request) => {
    const { id } = request.params as { id: string };
    try {
      const song = await db.select().from(songs).where(eq(songs.id, id));
      if (song.length === 0) {
        return { success: false, error: "Song not found" };
      }
      return { success: true, data: song[0] };
    } catch (error) {
      return { success: false, error: "Failed to fetch song" };
    }
  });

  // Create new song
  fastify.post("/songs", async (request) => {
    const songSchema = z.object({
      ownerClerkId: z.string(),
      title: z.string(),
      bpm: z.number().optional(),
      key: z.string().optional(),
      tags: z.array(z.string()).default([]),
    });

    const result = songSchema.safeParse(request.body);
    if (!result.success) {
      return { success: false, error: "Invalid song data" };
    }

    try {
      const newSong = await db.insert(songs).values(result.data).returning();
      return { success: true, data: newSong[0] };
    } catch (error) {
      return { success: false, error: "Failed to create song" };
    }
  });

  // Get lyrics for a song
  fastify.get("/songs/:id/lyrics", async (request) => {
    const { id } = request.params as { id: string };
    try {
      const lyrics = await db
        .select()
        .from(lyricVersions)
        .where(eq(lyricVersions.songId, id));
      return { success: true, data: lyrics };
    } catch (error) {
      return { success: false, error: "Failed to fetch lyrics" };
    }
  });
}
