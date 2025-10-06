import type { Song } from "./songs.service";
import type { ProjectWithFullDetails } from "./project.service";
import type { DbUser } from "../repositories/user.repository";
import type { AccountWithDetails } from "../repositories/account.repository";
import type { SongsService } from "./songs.service";
import type { ProjectService } from "./project.service";
import type { AdminService } from "./admin.service";

export interface SearchResult {
  songs: Song[];
  projects: ProjectWithFullDetails[];
  users: DbUser[];
  accounts: AccountWithDetails[];
  totalResults: number;
}

export interface SearchOptions {
  query: string;
  limit?: number;
  types?: string[];
  clerkId?: string;
  accountId?: string;
}

export class SearchService {
  constructor(
    private songsService: SongsService,
    private projectService: ProjectService,
    private adminService: AdminService
  ) {}

  async searchAll(options: SearchOptions): Promise<SearchResult> {
    const {
      query,
      limit = 10,
      types = ["songs", "projects", "users", "accounts"],
      clerkId,
      accountId,
    } = options;

    if (!query.trim()) {
      return {
        songs: [],
        projects: [],
        users: [],
        accounts: [],
        totalResults: 0,
      };
    }

    const searchPromises = [];

    // Search songs
    if (types.includes("songs")) {
      searchPromises.push(
        this.searchSongs(query, Math.ceil(limit / 4), clerkId, accountId)
      );
    } else {
      searchPromises.push(Promise.resolve([]));
    }

    // Search projects
    if (types.includes("projects")) {
      searchPromises.push(this.searchProjects(query, Math.ceil(limit / 4)));
    } else {
      searchPromises.push(Promise.resolve([]));
    }

    // Search users
    if (types.includes("users")) {
      searchPromises.push(this.searchUsers(query, Math.ceil(limit / 4)));
    } else {
      searchPromises.push(Promise.resolve([]));
    }

    // Search accounts
    if (types.includes("accounts")) {
      searchPromises.push(this.searchAccounts(query, Math.ceil(limit / 4)));
    } else {
      searchPromises.push(Promise.resolve([]));
    }

    const [songs, projects, users, accounts] = (await Promise.all(
      searchPromises
    )) as [Song[], ProjectWithFullDetails[], DbUser[], AccountWithDetails[]];

    const totalResults =
      songs.length + projects.length + users.length + accounts.length;

    return {
      songs,
      projects,
      users,
      accounts,
      totalResults,
    };
  }

  private async searchSongs(query: string, limit: number): Promise<Song[]> {
    try {
      const result = await this.songsService.listSongs(
        {}, // Empty conditions - RLS policies handle account filtering
        { page: 1, limit, sort: "updatedAt", order: "desc" }
      );

      // Filter results client-side for now (can be optimized with DB-level search later)
      return result.songs.filter(
        (song: Song) =>
          song.title.toLowerCase().includes(query.toLowerCase()) ||
          song.artist?.toLowerCase().includes(query.toLowerCase()) ||
          song.shortId.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error("Error searching songs:", error);
      return [];
    }
  }

  private async searchProjects(
    query: string,
    limit: number
  ): Promise<ProjectWithFullDetails[]> {
    try {
      const result = await this.projectService.listProjects({
        page: 1,
        limit,
        sort: "updatedAt",
        order: "desc",
      });

      // Filter results client-side for now (can be optimized with DB-level search later)
      return result.projects.filter(
        (project) =>
          project.name.toLowerCase().includes(query.toLowerCase()) ||
          project.description?.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error("Error searching projects:", error);
      return [];
    }
  }

  private async searchUsers(query: string, limit: number): Promise<DbUser[]> {
    try {
      const result = await this.adminService.listUsers({
        page: 1,
        limit,
        search: query,
      });

      return result.data.users ?? [];
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  }

  private async searchAccounts(
    query: string,
    limit: number
  ): Promise<AccountWithDetails[]> {
    try {
      const result = await this.adminService.listAccounts({
        page: 1,
        limit,
        search: query,
      });

      return result.data?.accounts ?? [];
    } catch (error) {
      console.error("Error searching accounts:", error);
      return [];
    }
  }
}

export const createSearchService = (
  songsService: SongsService,
  projectService: ProjectService,
  adminService: AdminService
): SearchService => {
  return new SearchService(songsService, projectService, adminService);
};
