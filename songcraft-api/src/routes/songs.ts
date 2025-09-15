import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../db";
import { songs, lyricVersions } from "../schema";
import { eq } from "drizzle-orm";
// Note: Using custom hex ID generation instead of generateSongId from shared
// because database constraint expects 16-char lowercase hex format

export default async function songRoutes(fastify: FastifyInstance) {
  // Delete song by ID
  fastify.delete("/songs/:id", async (request) => {
    const { id } = request.params as { id: string };
    try {
      // Delete lyric versions first (FK)
      await db.delete(lyricVersions).where(eq(lyricVersions.songId, id));
      // Delete the song
      const result = await db.delete(songs).where(eq(songs.id, id));
      return { success: true };
    } catch (error) {
      console.error("Error deleting song:", error);
      return { success: false, error: "Failed to delete song" };
    }
  });
  // Get all songs
  fastify.get("/songs", async () => {
    try {
      const allSongs = await db.select().from(songs);
      return { success: true, data: allSongs };
    } catch (error) {
      console.error("Error fetching songs:", error);
      return { success: false, error: "Failed to fetch songs" };
    }
  });

  // Get song by ID
  fastify.get("/songs/:id", async (request) => {
    const { id } = request.params as { id: string };

    try {
      const song = await db
        .select()
        .from(songs)
        .where(eq(songs.id, id))
        .limit(1);

      if (song.length === 0) {
        return { success: false, error: "Song not found" };
      }

      return { success: true, data: song[0] };
    } catch (error) {
      console.error("Error fetching song:", error);
      return { success: false, error: "Failed to fetch song" };
    }
  });

  // Get lyrics for a song by ID
  fastify.get("/songs/:id/versions", async (request) => {
    const { id } = request.params as { id: string };

    try {
      // Verify song exists
      const song = await db
        .select()
        .from(songs)
        .where(eq(songs.id, id))
        .limit(1);

      if (song.length === 0) {
        return { success: false, error: "Song not found" };
      }

      // Get lyric versions using the UUID
      const versions = await db
        .select()
        .from(lyricVersions)
        .where(eq(lyricVersions.songId, id));

      return { success: true, data: versions };
    } catch (error) {
      console.error("Error fetching lyric versions:", error);
      return { success: false, error: "Failed to fetch lyric versions" };
    }
  });

  // Create new song
  fastify.post("/songs", async (request) => {
    console.log(
      "🎵 Creating new song with data:",
      JSON.stringify(request.body, null, 2)
    );

    const songSchema = z.object({
      ownerClerkId: z.string(),
      title: z.string(),
      artist: z.string().optional(),
      bpm: z.number().optional(),
      key: z.string().optional(),
      tags: z.array(z.string()).default([]),
      lyrics: z.string().optional(),
      midiData: z.string().optional(),
      collaborators: z.array(z.string()).default([]),
    });

    const result = songSchema.safeParse(request.body);
    if (!result.success) {
      console.log("❌ Validation failed:", result.error);
      return {
        success: false,
        error: "Invalid song data",
        details: result.error,
      };
    }

    try {
      // Generate a unique short ID
      let shortId: string;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        // Generate 16-character lowercase hexadecimal ID to match database constraint
        shortId = Array.from({ length: 16 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join("");
        attempts++;

        // Check if this short ID already exists
        const existing = await db
          .select({ shortId: songs.shortId })
          .from(songs)
          .where(eq(songs.shortId, shortId))
          .limit(1);

        if (existing.length === 0) {
          break; // Found a unique short ID
        }

        if (attempts >= maxAttempts) {
          throw new Error(
            "Failed to generate unique short ID after multiple attempts"
          );
        }
      } while (attempts < maxAttempts);

      // Prepare the song data
      const songData = {
        shortId,
        ownerClerkId: result.data.ownerClerkId,
        title: result.data.title,
        artist: result.data.artist,
        bpm: result.data.bpm,
        key: result.data.key,
        tags: result.data.tags,
        lyrics: result.data.lyrics,
        midiData: result.data.midiData,
        collaborators: result.data.collaborators,
        // For now, use a default account ID - in production this should be determined by user context
        accountId: "681e169e-5051-4f94-adfe-58685016de96", // Default account
      };

      console.log("📝 Prepared song data:", JSON.stringify(songData, null, 2));

      const newSong = await db.insert(songs).values(songData).returning();
      console.log("✅ Song created successfully:", newSong[0]);

      return { success: true, data: newSong[0] };
    } catch (error) {
      console.error("💥 Database error:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: "Failed to create song",
        details: errorMessage,
      };
    }
  });
}
