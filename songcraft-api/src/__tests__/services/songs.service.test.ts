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
	createSongAccountAssociation: vi.fn(),
	createSongProjectAssociation: vi.fn(),
	getSongAccountAssociations: vi.fn(),
	getSongProjectAssociations: vi.fn(),
	findSongVersions: vi.fn(),
	deleteWithVersions: vi.fn(),
};

// Mock the user repository
const mockUserRepository = {
	findByClerkId: vi.fn(),
	findById: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	findMany: vi.fn(),
	count: vi.fn(),
	findUserWithContext: vi.fn(),
	findUserWithMemberships: vi.fn(),
	updateRole: vi.fn(),
	getRoleStats: vi.fn(),
};

// Mock the membership repository
const mockMembershipRepository = {
	findByUserAndAccount: vi.fn(),
	findById: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
	findByUserId: vi.fn(),
	findByAccountId: vi.fn(),
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
		songsService = new SongsService(
			mockSongRepository,
			mockUserRepository,
			mockMembershipRepository,
		);
		vi.clearAllMocks();
	});

	describe("createSong", () => {
		it("should create a song successfully", async () => {
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
			};

			mockSongRepository.create.mockResolvedValue(mockSong);

			const input = {
				title: "Test Song",
				artist: "Test Artist",
				bpm: 120,
				key: "C",
				tags: ["rock", "pop"],
				lyrics: "Test lyrics",
				midiData: "test-midi-data",
				collaborators: ["user_456"],
			};

			const result = await songsService.createSong(input, "user_123");

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
			});
			expect(mockSongRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					shortId: expect.any(String),
					ownerClerkId: "user_123",
					title: "Test Song",
					artist: "Test Artist",
					bpm: 120,
					key: "C",
					tags: ["rock", "pop"],
					lyrics: "Test lyrics",
					midiData: "test-midi-data",
					collaborators: ["user_456"],
				}),
			);
		});

		it("should handle null values correctly", async () => {
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
			};

			mockSongRepository.create.mockResolvedValue(mockSong);

			const input = {
				title: "Test Song",
				tags: [],
				collaborators: [],
			};

			const result = await songsService.createSong(input, "user_123");

			expect(result.artist).toBeNull();
			expect(result.bpm).toBeNull();
			expect(result.key).toBeNull();
			expect(result.lyrics).toBeNull();
			expect(result.midiData).toBeNull();
		});
	});

	describe("findById", () => {
		it("should find a song by ID", async () => {
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
			};

			mockSongRepository.findById.mockResolvedValue(mockSong);

			const result = await songsService.findById(
				"123e4567-e89b-12d3-a456-426614174000",
			);

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
			});
			expect(mockSongRepository.findById).toHaveBeenCalledWith(
				"123e4567-e89b-12d3-a456-426614174000",
			);
		});

		it("should return null when song not found", async () => {
			mockSongRepository.findById.mockResolvedValue(null);

			const result = await songsService.findById(
				"123e4567-e89b-12d3-a456-426614174000",
			);

			expect(result).toBeNull();
		});
	});

	describe("findByShortId", () => {
		it("should find a song by short ID", async () => {
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
			};

			mockSongRepository.findByShortId.mockResolvedValue(mockSong);

			const result = await songsService.findByShortId("6f0bbde763f89734");

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
			});
			expect(mockSongRepository.findByShortId).toHaveBeenCalledWith(
				"6f0bbde763f89734",
			);
		});
	});
});
