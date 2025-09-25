import { db } from "./db";
import { SongRepository } from "./repositories/song.repository";
import { createSongsService, SongsService } from "./services/songs.service";

/**
 * Simple dependency injection container
 * Manages the creation and wiring of repositories and services
 */
export class Container {
  private _songRepository?: SongRepository;
  private _songsService?: SongsService;

  /**
   * Get or create SongRepository instance
   */
  get songRepository(): SongRepository {
    if (!this._songRepository) {
      this._songRepository = new SongRepository(db);
    }
    return this._songRepository;
  }

  /**
   * Get or create SongsService instance
   */
  get songsService(): SongsService {
    if (!this._songsService) {
      this._songsService = createSongsService(this.songRepository);
    }
    return this._songsService;
  }

  /**
   * Reset container (useful for testing)
   */
  reset(): void {
    this._songRepository = undefined;
    this._songsService = undefined;
  }
}

// Export singleton container instance
export const container = new Container();