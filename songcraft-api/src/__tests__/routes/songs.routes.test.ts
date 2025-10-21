import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import songsRoutes from "../../routes/songs";
import { createTestServer } from "../helpers/createTestServer";

const exampleSong = {
	id: "123e4567-e89b-12d3-a456-426614174000",
	shortId: "6f0bbde763f89734",
	ownerClerkId: "user_123",
	title: "Test Song",
	artist: "Test Artist",
	bpm: 120,
	key: "C",
	tags: ["rock"],
	lyrics: null as string | null,
	midiData: null as string | null,
	collaborators: [] as string[],
	createdAt: "2024-01-01T00:00:00.000Z",
	updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("songs routes", () => {
	const songsService = {
		listSongs: vi.fn(),
		findById: vi.fn(),
		findByShortId: vi.fn(),
		getSongVersions: vi.fn(),
		createSong: vi.fn(),
		updateSong: vi.fn(),
		deleteSong: vi.fn(),
	};

	const server = createTestServer({
		register: songsRoutes,
		container: { songsService },
	});

	beforeAll(async () => {
		await server.ready();
	});

	afterAll(async () => {
		await server.close();
	});

	it("GET /songs returns paginated list", async () => {
		songsService.listSongs.mockResolvedValue({
			songs: [exampleSong],
			pagination: { page: 1, limit: 20, total: 1, pages: 1 },
		});

		const res = await server.inject({
			method: "GET",
			url: "/songs?page=1&limit=20&sort=updatedAt&order=desc",
		});
		expect(res.statusCode).toBe(200);
		const json = res.json();
		expect(json.songs).toHaveLength(1);
		expect(json.pagination.total).toBe(1);
		expect(songsService.listSongs).toHaveBeenCalledWith(
			{ ownerClerkId: undefined },
			{ page: 1, limit: 20, sort: "updatedAt", order: "desc" },
		);
	});

	it("GET /songs/:id returns a song", async () => {
		songsService.findById.mockResolvedValue(exampleSong);

		const res = await server.inject({
			method: "GET",
			url: `/songs/${exampleSong.id}`,
		});
		expect(res.statusCode).toBe(200);
		expect(res.json().song.id).toBe(exampleSong.id);
	});

	it("GET /songs/:id returns 404 when missing", async () => {
		songsService.findById.mockResolvedValue(null);

		const res = await server.inject({
			method: "GET",
			url: "/songs/123e4567-e89b-12d3-a456-426614174001",
		});
		expect(res.statusCode).toBe(404);
		expect(res.json().code).toBe("NOT_FOUND");
	});

	it("GET /songs/short/:shortId returns a song", async () => {
		songsService.findByShortId.mockResolvedValue(exampleSong);

		const res = await server.inject({
			method: "GET",
			url: `/songs/short/${exampleSong.shortId}`,
		});
		expect(res.statusCode).toBe(200);
		expect(res.json().song.shortId).toBe(exampleSong.shortId);
	});

	it("GET /songs/short/:shortId returns 404 when missing", async () => {
		songsService.findByShortId.mockResolvedValue(null);

		const res = await server.inject({
			method: "GET",
			url: "/songs/short/6f0bbde763f89735",
		});
		expect(res.statusCode).toBe(404);
		expect(res.json().code).toBe("NOT_FOUND");
	});

	it("GET /songs/:id/versions returns versions array", async () => {
		songsService.getSongVersions.mockResolvedValue([
			{ id: "v1" },
			{ id: "v2" },
		]);

		const res = await server.inject({
			method: "GET",
			url: `/songs/${exampleSong.id}/versions`,
		});
		expect(res.statusCode).toBe(200);
		expect(res.json().versions).toHaveLength(2);
	});

	it("POST /songs creates a song when headers and body valid", async () => {
		songsService.createSong.mockResolvedValue({
			...exampleSong,
			title: "New Song",
		});

		const res = await server.inject({
			method: "POST",
			url: "/songs",
			headers: {
				"x-clerk-user-id": "user_123",
				"x-account-id": "123e4567-e89b-12d3-a456-426614174000",
			},
			payload: {
				title: "New Song",
				artist: "Artist",
				bpm: 100,
				key: "C",
				tags: ["tag1"],
				lyrics: "...",
				collaborators: [],
			},
		});

		expect(res.statusCode).toBe(201);
		expect(res.json().song.title).toBe("New Song");
		expect(songsService.createSong).toHaveBeenCalled();
	});

	it("POST /songs without x-account-id returns 400", async () => {
		const res = await server.inject({
			method: "POST",
			url: "/songs",
			headers: {
				"x-clerk-user-id": "user_123",
			},
			payload: { title: "New Song" },
		});

		expect(res.statusCode).toBe(400);
		expect(res.json().code).toBe("MISSING_ACCOUNT_ID");
	});

	it("PUT /songs/:id updates a song", async () => {
		songsService.updateSong.mockResolvedValue({
			...exampleSong,
			title: "Updated",
		});

		const res = await server.inject({
			method: "PUT",
			url: `/songs/${exampleSong.id}`,
			headers: { "x-clerk-user-id": "user_123" },
			payload: { title: "Updated" },
		});

		expect(res.statusCode).toBe(200);
		expect(res.json().song.title).toBe("Updated");
	});

	it("DELETE /songs/:id deletes a song", async () => {
		songsService.deleteSong.mockResolvedValue(undefined);

		const res = await server.inject({
			method: "DELETE",
			url: `/songs/${exampleSong.id}`,
			headers: { "x-clerk-user-id": "user_123" },
		});

		expect(res.statusCode).toBe(204);
	});
});
