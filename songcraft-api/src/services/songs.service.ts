import crypto from "node:crypto";
import { z } from "@songcraft/shared";

import { AppError, ForbiddenError, NotFoundError } from "../lib/errors";
import type {
	CreateSongData,
	DbSong,
	ISongRepository,
	SongPaginationOptions as RepositorySongPaginationOptions,
	SongQueryOptions as RepositorySongQueryOptions,
	UpdateSongData,
} from "../repositories/song.repository";
import type { IUserRepository } from "../repositories/user.repository";
import type { IMembershipRepository } from "../repositories/membership.repository";

// Types and Schemas

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
	// Remove accountId and projectId - these are now handled via associations
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
	// Remove accountId - songs are now filtered via associations in RLS policies
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

export class SongsService {
	constructor(
		private songRepository: ISongRepository,
		private userRepository: IUserRepository,
		private membershipRepository: IMembershipRepository,
	) {}
	/**
	 * Converts various input types to a clean string array
	 * Handles arrays, JSON strings, objects, and single strings
	 */
	private toStringArray(value: unknown): string[] {
		if (Array.isArray(value)) {
			return value
				.map((item) =>
					typeof item === "string" ? item : item != null ? String(item) : null,
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
									: null,
						)
						.filter((item): item is string => item !== null && item.length > 0);
				}
			} catch (_error) {
				// Ignore parse failures and fall back to raw string value
			}
			return [value];
		}

		if (value && typeof value === "object") {
			return Object.values(value)
				.map((item) =>
					typeof item === "string" ? item : item != null ? String(item) : null,
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
			// Remove accountId and projectId - these are now handled via associations
			tags: this.toStringArray(song.tags),
			collaborators: this.toStringArray(song.collaborators),
			createdAt: song.createdAt.toISOString(),
			updatedAt: song.updatedAt.toISOString(),
		};
	}

	/**
	 * Generates a unique short ID for songs with collision detection
	 */
	private async generateUniqueShortId(): Promise<string> {
		const maxAttempts = 5;

		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			const shortId = crypto.randomBytes(8).toString("hex").toLowerCase();

			const exists = await this.songRepository.existsByShortId(shortId);
			if (!exists) {
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
		accountId?: string,
	): Promise<Song> {
		// Validate account access if accountId is provided
		if (accountId) {
			const user = await this.userRepository.findByClerkId(ownerClerkId);
			if (!user) {
				throw new ForbiddenError("User not found");
			}
			const membership = await this.membershipRepository.findByUserAndAccount(
				user.id,
				accountId,
			);
			if (!membership) {
				throw new ForbiddenError("User does not have access to this account");
			}
		}

		const shortId = await this.generateUniqueShortId();

		const createData: CreateSongData = {
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
			// Remove accountId - songs are now created without direct account reference
		};

		const newSong = await this.songRepository.create(createData);

		// Create song-account association if accountId is provided
		if (accountId) {
			await this.songRepository.createSongAccountAssociation(
				newSong.id,
				accountId,
			);
		}

		return this.serializeSong(newSong);
	}

	/**
	 * Finds a song by its UUID
	 */
	async findById(id: string): Promise<Song | null> {
		const song = await this.songRepository.findById(id);
		return song ? this.serializeSong(song) : null;
	}

	/**
	 * Finds a song by its short ID
	 */
	async findByShortId(shortId: string): Promise<Song | null> {
		const song = await this.songRepository.findByShortId(shortId);
		return song ? this.serializeSong(song) : null;
	}

	/**
	 * Lists songs with pagination and filtering
	 */
	async listSongs(
		conditions: SongQueryConditions,
		options: SongPaginationOptions,
	): Promise<SongListResult> {
		const queryOptions: RepositorySongQueryOptions = {
			// Remove accountId - songs are now filtered via RLS policies using associations
			ownerClerkId: conditions.ownerClerkId,
		};

		const paginationOptions: RepositorySongPaginationOptions = {
			limit: options.limit,
			offset: (options.page - 1) * options.limit,
			sort: options.sort,
			order: options.order,
		};

		const [total, dbSongs] = await Promise.all([
			this.songRepository.count(queryOptions),
			this.songRepository.findMany(queryOptions, paginationOptions),
		]);

		return {
			songs: dbSongs.map((song) => this.serializeSong(song)),
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
		clerkId: string,
	): Promise<Song> {
		await this.assertSongOwner(id, clerkId);

		const updateData: UpdateSongData = {
			...input,
			updatedAt: new Date(),
		};

		const updatedSong = await this.songRepository.update(id, updateData);

		if (!updatedSong) {
			throw new NotFoundError("Song not found");
		}

		return this.serializeSong(updatedSong);
	}

	/**
	 * Deletes a song and its versions (with ownership validation)
	 */
	async deleteSong(id: string, clerkId: string): Promise<void> {
		await this.assertSongOwner(id, clerkId);
		await this.songRepository.deleteWithVersions(id);
	}

	/**
	 * Gets all versions for a song
	 */
	async getSongVersions(id: string): Promise<unknown[]> {
		// First verify the song exists
		const song = await this.songRepository.findById(id);
		if (!song) {
			throw new NotFoundError("Song not found");
		}

		const versions = await this.songRepository.findSongVersions(id);
		return versions;
	}
}

// Service factory function for dependency injection
export const createSongsService = (
	songRepository: ISongRepository,
	userRepository: IUserRepository,
	membershipRepository: IMembershipRepository,
): SongsService => {
	return new SongsService(songRepository, userRepository, membershipRepository);
};
