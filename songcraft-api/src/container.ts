import { db } from "./db";
import { SongRepository } from "./repositories/song.repository";
import { UserRepository } from "./repositories/user.repository";
import { AccountRepository } from "./repositories/account.repository";
import { OrganizationRepository } from "./repositories/organization.repository";
import {
  MembershipRepository,
  UserContextRepository,
} from "./repositories/membership.repository";
import { createSongsService, SongsService } from "./services/songs.service";
import { AdminService } from "./services/admin.service";

/**
 * Simple dependency injection container
 * Manages the creation and wiring of repositories and services
 */
export class Container {
  private _songRepository?: SongRepository;
  private _userRepository?: UserRepository;
  private _accountRepository?: AccountRepository;
  private _organizationRepository?: OrganizationRepository;
  private _membershipRepository?: MembershipRepository;
  private _userContextRepository?: UserContextRepository;
  private _songsService?: SongsService;
  private _adminService?: AdminService;

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
   * Get or create UserRepository instance
   */
  get userRepository(): UserRepository {
    if (!this._userRepository) {
      this._userRepository = new UserRepository(db);
    }
    return this._userRepository;
  }

  /**
   * Get or create AccountRepository instance
   */
  get accountRepository(): AccountRepository {
    if (!this._accountRepository) {
      this._accountRepository = new AccountRepository(db);
    }
    return this._accountRepository;
  }

  /**
   * Get or create OrganizationRepository instance
   */
  get organizationRepository(): OrganizationRepository {
    if (!this._organizationRepository) {
      this._organizationRepository = new OrganizationRepository(db);
    }
    return this._organizationRepository;
  }

  /**
   * Get or create MembershipRepository instance
   */
  get membershipRepository(): MembershipRepository {
    if (!this._membershipRepository) {
      this._membershipRepository = new MembershipRepository(db);
    }
    return this._membershipRepository;
  }

  /**
   * Get or create UserContextRepository instance
   */
  get userContextRepository(): UserContextRepository {
    if (!this._userContextRepository) {
      this._userContextRepository = new UserContextRepository(db);
    }
    return this._userContextRepository;
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
   * Get or create AdminService instance
   */
  get adminService(): AdminService {
    if (!this._adminService) {
      this._adminService = new AdminService(
        this.userRepository,
        this.accountRepository,
        this.organizationRepository,
        this.membershipRepository,
        this.userContextRepository
      );
    }
    return this._adminService;
  }

  /**
   * Reset container (useful for testing)
   */
  reset(): void {
    this._songRepository = undefined;
    this._userRepository = undefined;
    this._accountRepository = undefined;
    this._organizationRepository = undefined;
    this._membershipRepository = undefined;
    this._userContextRepository = undefined;
    this._songsService = undefined;
    this._adminService = undefined;
  }
}

// Export singleton container instance
export const container = new Container();