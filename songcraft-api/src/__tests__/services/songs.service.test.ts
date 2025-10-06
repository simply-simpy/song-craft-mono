import { beforeEach, describe, expect, it, vi } from "vitest";
import { SongsService } from "../../services/songs.service";

// Mock the song repository
const mockSongRepository = {
	existsByShortId: vi.fn().mockResolvedValue(false),
	findById: vi.fn(),
	findByShortId: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
	findMany: vi.fn(),
	count: vi.fn(),
};

// Mock the database
vi.mock("../../db", () => ({
	db: {
		select: vi.fn(),
		insert: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		transaction: vi.fn(),
	},
}));

// Mock the schema
vi.mock("../../schema", () => ({
	songs: {
		id: "id",
		shortId: "shortId",
		ownerClerkId: "ownerClerkId",
		title: "title",
		artist: "artist",
		bpm: "bpm",
		key: "key",
		tags: "tags",
		lyrics: "lyrics",
		midiData: "midiData",
		collaborators: "collaborators",
		createdAt: "createdAt",
		updatedAt: "updatedAt",
	},
	lyricVersions: {
		songId: "songId",
	},
}));

// Mock the song repository
vi.mock("../../repositories/song.repository", () => ({
	SongRepository: vi.fn().mockImplementation(() => mockSongRepository),
}));

describe("SongsService", () => {
	let songsService: SongsService;

	beforeEach(() => {
		songsService = new SongsService(mockSongRepository);
		vi.clearAllMocks();
	});

	describe("serializeSong", () => {
		it("should serialize a song object correctly", () => {
			const mockSong = {
				id: "123e4567-e89b-12d3-a456-426614174000",
				shortId: "6f0bbde763f89734",
				ownerClerkId: "user_123",
				title: "Test Song",
				artist: "Test Artist",
				bpm: 120,
				key: "C",
				tags: ["rock", "pop"],
				lyrics: "Test lyrics",
				midiData: "test-midi-data",
				collaborators: ["user_456"],
				createdAt: new Date("2024-01-01T00:00:00Z"),
				updatedAt: new Date("2024-01-01T00:00:00Z"),
				accountId: null,
				projectId: null,
			};

			const result = songsService.serializeSong(mockSong);

			expect(result).toEqual({
				id: "123e4567-e89b-12d3-a456-426614174000",
				shortId: "6f0bbde763f89734",
				ownerClerkId: "user_123",
				title: "Test Song",
				artist: "Test Artist",
				bpm: 120,
				key: "C",
				tags: ["rock", "pop"],
				lyrics: "Test lyrics",
				midiData: "test-midi-data",
				collaborators: ["user_456"],
				createdAt: "2024-01-01T00:00:00.000Z",
				updatedAt: "2024-01-01T00:00:00.000Z",
				accountId: null,
				projectId: null,
			});
		});

		it("should handle null values correctly", () => {
			const mockSong = {
				id: "123e4567-e89b-12d3-a456-426614174000",
				shortId: "6f0bbde763f89734",
				ownerClerkId: "user_123",
				title: "Test Song",
				artist: null,
				bpm: null,
				key: null,
				tags: [],
				lyrics: null,
				midiData: null,
				collaborators: [],
				createdAt: new Date("2024-01-01T00:00:00Z"),
				updatedAt: new Date("2024-01-01T00:00:00Z"),
				accountId: null,
				projectId: null,
			};

			const result = songsService.serializeSong(mockSong);

			expect(result.artist).toBeNull();
			expect(result.bpm).toBeNull();
			expect(result.key).toBeNull();
			expect(result.lyrics).toBeNull();
			expect(result.midiData).toBeNull();
		});
	});

	describe("toStringArray", () => {
		it("should convert comma-separated string to array", () => {
			const result = songsService.toStringArray("item1,item2,item3");
			expect(result).toEqual(["item1,item2,item3"]);
		});

		it("should handle empty string", () => {
			const result = songsService.toStringArray("");
			expect(result).toEqual([]);
		});

		it("should handle null input", () => {
			const result = songsService.toStringArray(null);
			expect(result).toEqual([]);
		});

		it("should handle array input", () => {
			const result = songsService.toStringArray(["item1", "item2"]);
			expect(result).toEqual(["item1", "item2"]);
		});
	});

	describe("generateUniqueShortId", () => {
		it("should generate a 16-character hex string", async () => {
			const result = await songsService.generateUniqueShortId();
			expect(typeof result).toBe("string");
			expect(result).toMatch(/^[a-f0-9]{16}$/);
			expect(result).toHaveLength(16);
		});

		it("should generate different IDs on multiple calls", async () => {
			const id1 = await songsService.generateUniqueShortId();
			const id2 = await songsService.generateUniqueShortId();
			expect(id1).not.toBe(id2);
		});
	});
});
