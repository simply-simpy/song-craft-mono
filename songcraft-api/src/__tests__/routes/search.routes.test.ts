import { beforeAll, afterAll, describe, expect, it, vi } from "vitest";
import { createTestServer } from "../helpers/createTestServer";
import searchRoutes from "../../routes/search";

describe("search routes", () => {
  const searchService = {
    searchAll: vi.fn(),
  };

  const server = createTestServer({ register: searchRoutes, container: { searchService } });

  beforeAll(async () => {
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  it("GET /search returns aggregated results", async () => {
    searchService.searchAll.mockResolvedValue({
      songs: [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          shortId: "6f0bbde763f89734",
          title: "S",
          artist: "A",
          createdAt: "2024-01-01T00:00:00.000Z",
        },
      ],
      projects: [
        {
          id: "123e4567-e89b-12d3-a456-426614174001",
          name: "P",
          description: null,
          createdAt: "2024-01-01T00:00:00.000Z",
        },
      ],
      users: [
        {
          id: "123e4567-e89b-12d3-a456-426614174002",
          email: "user@example.com",
          clerkId: "user_123",
          globalRole: "user",
        },
      ],
      accounts: [
        {
          id: "123e4567-e89b-12d3-a456-426614174003",
          name: "A",
          description: null,
          plan: "Free",
          status: "active",
        },
      ],
      totalResults: 3,
    });

    const res = await server.inject({
      method: "GET",
      url: "/search?q=test&limit=10",
      headers: {
        "x-clerk-user-id": "user_123",
        "x-account-id": "123e4567-e89b-12d3-a456-426614174000",
      },
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.totalResults).toBe(3);
    expect(json.songs).toHaveLength(1);
  });

  it("GET /search without x-account-id returns 400", async () => {
    const res = await server.inject({
      method: "GET",
      url: "/search?q=test",
      headers: {
        "x-clerk-user-id": "user_123",
      },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().code).toBe("MISSING_ACCOUNT_ID");
  });

  it("GET /search without x-clerk-user-id returns 401", async () => {
    const res = await server.inject({
      method: "GET",
      url: "/search?q=test",
      headers: {
        "x-account-id": "123e4567-e89b-12d3-a456-426614174000",
      },
    });

    expect(res.statusCode).toBe(401);
  });
});
