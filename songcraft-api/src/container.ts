import { db } from "./db";
import { AccountRepository } from "./repositories/account.repository";
import {
  MembershipRepository,
  UserContextRepository,
} from "./repositories/membership.repository";
import { OrganizationRepository } from "./repositories/organization.repository";
import { ProjectPermissionsRepository } from "./repositories/project-permissions.repository";
import { ProjectRepository } from "./repositories/project.repository";
import { SessionRepository } from "./repositories/session.repository";
import { SongRepository } from "./repositories/song.repository";
import { UserRepository } from "./repositories/user.repository";
import { AdminService } from "./services/admin.service";
import { ProjectService } from "./services/project.service";
import {
  type SongsService,
  createSongsService,
} from "./services/songs.service";
import {
  type SearchService,
  createSearchService,
} from "./services/search.service";

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
  private _projectRepository?: ProjectRepository;
  private _projectPermissionsRepository?: ProjectPermissionsRepository;
  private _sessionRepository?: SessionRepository;
  private _songsService?: SongsService;
  private _adminService?: AdminService;
  private _projectService?: ProjectService;
  private _searchService?: SearchService;

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
      this._songsService = createSongsService(
        this.songRepository,
        this.userRepository,
        this.membershipRepository
      );
    }
    return this._songsService;
  }

  /**
   * Get or create ProjectRepository instance
   */
  get projectRepository(): ProjectRepository {
    if (!this._projectRepository) {
      this._projectRepository = new ProjectRepository(db);
    }
    return this._projectRepository;
  }

  /**
   * Get or create ProjectPermissionsRepository instance
   */
  get projectPermissionsRepository(): ProjectPermissionsRepository {
    if (!this._projectPermissionsRepository) {
      this._projectPermissionsRepository = new ProjectPermissionsRepository(db);
    }
    return this._projectPermissionsRepository;
  }

  /**
   * Get or create SessionRepository instance
   */
  get sessionRepository(): SessionRepository {
    if (!this._sessionRepository) {
      this._sessionRepository = new SessionRepository(db);
    }
    return this._sessionRepository;
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
   * Get or create ProjectService instance
   */
  get projectService(): ProjectService {
    if (!this._projectService) {
      this._projectService = new ProjectService(
        this.projectRepository,
        this.projectPermissionsRepository,
        this.sessionRepository,
        this.userRepository
      );
    }
    return this._projectService;
  }

  /**
   * Get or create SearchService instance
   */
  get searchService(): SearchService {
    if (!this._searchService) {
      this._searchService = createSearchService(
        this.songsService,
        this.projectService,
        this.adminService
      );
    }
    return this._searchService;
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
    this._projectRepository = undefined;
    this._projectPermissionsRepository = undefined;
    this._sessionRepository = undefined;
    this._songsService = undefined;
    this._adminService = undefined;
    this._projectService = undefined;
    this._searchService = undefined;
  }
}

// Export singleton container instance
export const container = new Container();
