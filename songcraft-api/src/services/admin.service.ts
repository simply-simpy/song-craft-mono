import type { IUserRepository } from "../repositories/user.repository";
import type { IAccountRepository } from "../repositories/account.repository";
import type { IOrganizationRepository } from "../repositories/organization.repository";
import type {
  IMembershipRepository,
  IUserContextRepository,
} from "../repositories/membership.repository";

export class AdminService {
  constructor(
    private users: IUserRepository,
    private accounts: IAccountRepository,
    private orgs: IOrganizationRepository,
    private memberships: IMembershipRepository,
    private userContext: IUserContextRepository
  ) {}

  // Me: full user context for authenticated user (by clerkId)
  async getMe(clerkId: string) {
    const result = await this.users.findUserWithContext(clerkId);
    if (!result) return null;

    return {
      success: true,
      data: {
        user: result.user,
        currentContext: result.currentContext || null,
        availableAccounts: result.availableAccounts,
      },
    } as const;
  }

  // Users list with pagination and filtering
  async listUsers(params: {
    page: number;
    limit: number;
    search?: string;
    role?: string;
  }) {
    const offset = (params.page - 1) * params.limit;

    const [total, users] = await Promise.all([
      this.users.count({ search: params.search, role: params.role }),
      this.users.findMany(
        { search: params.search, role: params.role },
        { limit: params.limit, offset }
      ),
    ]);

    return {
      success: true,
      data: {
        users,
        pagination: {
          page: params.page,
          limit: params.limit,
          total,
          pages: Math.ceil(total / params.limit),
        },
        rowCount: total,
        pageCount: Math.ceil(total / params.limit),
      },
    } as const;
  }

  // Single user with memberships
  async getUser(userId: string) {
    const result = await this.users.findUserWithMemberships(userId);
    if (!result) return null;

    return {
      success: true,
      data: {
        user: result.user,
        memberships: result.memberships,
      },
    } as const;
  }

  // Update user role
  async updateUserRole(params: {
    targetClerkId: string;
    newRole: string;
    changerClerkId: string;
    reason?: string;
    ip?: string;
  }) {
    // We could add audit logging or call an external manager here.
    const updated = await this.users.updateRole(params.targetClerkId, params.newRole);
    if (!updated) return { success: false, error: "User not found" } as const;
    return { success: true, message: "User role updated successfully" } as const;
  }

  // Accounts list with pagination and filtering
  async listAccounts(params: {
    page: number;
    limit: number;
    search?: string;
    plan?: string;
    status?: string;
    orgId?: string;
  }) {
    const offset = (params.page - 1) * params.limit;

    const [total, accounts] = await Promise.all([
      this.accounts.count({
        search: params.search,
        plan: params.plan,
        status: params.status,
        orgId: params.orgId,
      }),
      this.accounts.findMany(
        {
          search: params.search,
          plan: params.plan,
          status: params.status,
          orgId: params.orgId,
        },
        { limit: params.limit, offset }
      ),
    ]);

    return {
      success: true,
      data: {
        accounts,
        pagination: {
          page: params.page,
          limit: params.limit,
          total,
          pages: Math.ceil(total / params.limit),
        },
        rowCount: total,
        pageCount: Math.ceil(total / params.limit),
      },
    } as const;
  }

  // Single account with members
  async getAccount(accountId: string) {
    const result = await this.accounts.findAccountWithMembers(accountId);
    if (!result) return null;

    return {
      success: true,
      data: {
        account: result.account,
        members: result.members,
      },
    } as const;
  }

  // Orgs list with pagination
  async listOrgs(params: { page: number; limit: number }) {
    const offset = (params.page - 1) * params.limit;
    const [total, orgs] = await Promise.all([
      this.orgs.count(),
      this.orgs.findMany({ limit: params.limit, offset }),
    ]);

    return {
      success: true,
      data: {
        orgs,
        pagination: {
          page: params.page,
          limit: params.limit,
          total,
          pages: Math.ceil(total / params.limit),
        },
      },
    } as const;
  }

  // Single org with accounts
  async getOrg(orgId: string) {
    const result = await this.orgs.findOrgWithAccounts(orgId);
    if (!result) return null;

    return {
      success: true,
      data: {
        org: result.org,
        accounts: result.accounts,
      },
    } as const;
  }

  // Read user context
  async getUserContext(userId: string) {
    const context = await this.userContext.findByUserId(userId);
    if (!context) return null;
    return { success: true, data: { currentContext: context } } as const;
  }

  // Switch account context
  async switchUserContext(params: {
    userId: string;
    accountId: string;
    reason?: string;
  }) {
    const membership = await this.memberships.findByUserAndAccount(
      params.userId,
      params.accountId
    );
    if (!membership) {
      return {
        success: false,
        error: "User does not have access to this account",
      } as const;
    }

    const existing = await this.userContext.findByUserId(params.userId);
    const contextData = {
      ...(existing?.contextData as Record<string, unknown> | undefined),
      lastSwitchReason: params.reason,
    };

    const updated = await this.userContext.upsert(params.userId, {
      userId: params.userId,
      currentAccountId: params.accountId,
      contextData,
    });

    return {
      success: true,
      message: "Account context switched successfully",
      data: { context: updated },
    } as const;
  }

  // System stats
  async getSystemStats() {
    const roleStats = await this.users.getRoleStats();
    const totalOrgs = await this.orgs.count();
    const totalAccounts = await this.accounts.getTotalCount();

    return {
      success: true,
      data: {
        users: roleStats,
        organizations: totalOrgs,
        accounts: totalAccounts,
        timestamp: new Date().toISOString(),
      },
    } as const;
  }
}
