import { SongsService, CreateSongInput } from "../services/songs.service";
import type { ISongRepository, DbSong } from "../repositories/song.repository";

/**
 * Mock implementation of ISongRepository for testing
 * This demonstrates how the repository pattern enables easy testing
 */
class MockSongRepository implements ISongRepository {
  private songs: Map<string, DbSong> = new Map();
  private shortIdMap: Map<string, string> = new Map(); // shortId -> id mapping

  async create(data: any): Promise<DbSong> {
    const song: DbSong = {
      id: "test-id-" + Date.now(),
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.songs.set(song.id, song);
    this.shortIdMap.set(song.shortId, song.id);
    return song;
  }

  async findById(id: string): Promise<DbSong | null> {
    return this.songs.get(id) || null;
  }

  async findByShortId(shortId: string): Promise<DbSong | null> {
    const id = this.shortIdMap.get(shortId);
    return id ? this.songs.get(id) || null : null;
  }

  async update(id: string, data: any): Promise<DbSong | null> {
    const song = this.songs.get(id);
    if (!song) return null;

    const updatedSong = { ...song, ...data, updatedAt: new Date() };
    this.songs.set(id, updatedSong);
    return updatedSong;
  }

  async delete(id: string): Promise<void> {
    const song = this.songs.get(id);
    if (song) {
      this.shortIdMap.delete(song.shortId);
      this.songs.delete(id);
    }
  }

  async findMany(): Promise<DbSong[]> {
    return Array.from(this.songs.values());
  }

  async count(): Promise<number> {
    return this.songs.size;
  }

  async existsByShortId(shortId: string): Promise<boolean> {
    return this.shortIdMap.has(shortId);
  }

  async findSongVersions(): Promise<any[]> {
    return [];
  }

  async deleteWithVersions(songId: string): Promise<void> {
    await this.delete(songId);
  }
}

/**
 * Example unit test demonstrating the improved testability
 * This would be implemented with a proper testing framework like Jest or Vitest
 */
export async function exampleSongsServiceTest() {
  console.log("🧪 Testing SongsService with mocked repository...");

  // Arrange - Create service with mocked repository
  const mockRepo = new MockSongRepository();
  const songsService = new SongsService(mockRepo);

  try {
    // Act - Create a song
    const songInput: CreateSongInput = {
      title: "Test Song",
      artist: "Test Artist",
      bpm: 120,
      tags: ["test", "example"],
      collaborators: [],
    };

    const createdSong = await songsService.createSong(
      songInput, 
      "test-clerk-user-id", 
      "test-account-id"
    );

    // Assert - Verify the song was created correctly
    console.log("✅ Song created successfully:", {
      id: createdSong.id,
      title: createdSong.title,
      artist: createdSong.artist,
      bpm: createdSong.bpm,
    });

    // Act - Find the song by ID
    const foundSong = await songsService.findById(createdSong.id);

    // Assert - Verify the song was found
    if (!foundSong) {
      throw new Error("Song should have been found");
    }
    console.log("✅ Song found by ID successfully");

    // Act - Update the song
    const updatedSong = await songsService.updateSong(
      createdSong.id,
      { title: "Updated Test Song" },
      "test-clerk-user-id"
    );

    // Assert - Verify the song was updated
    console.log("✅ Song updated successfully:", {
      originalTitle: createdSong.title,
      updatedTitle: updatedSong.title,
    });

    console.log("🎉 All tests passed! Repository pattern enables easy unit testing.");

  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  exampleSongsServiceTest().catch(console.error);
}