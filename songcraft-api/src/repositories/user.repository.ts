import { and, count, desc, eq, like, or, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import { accounts, memberships, userContext, users } from "../schema";

// Database types
export type DbUser = typeof users.$inferSelect;
export type DbUserContext = typeof userContext.$inferSelect;

// Repository input types
export interface CreateUserData {
  clerkId: string;
  email: string;
  globalRole?: string;
}

export interface UpdateUserData {
  email?: string;
  globalRole?: string;
  lastLoginAt?: Date;
}

export interface UserQueryOptions {
  search?: string;
  role?: string;
}

export interface UserPaginationOptions {
  limit: number;
  offset: number;
}

export interface UserWithContext {
  user: DbUser;
  currentContext?: {
    currentAccountId: string;
    lastSwitchedAt: Date;
    accountName: string;
    accountPlan: string;
    accountStatus: string;
    orgId?: string;
    orgName?: string;
  };
  availableAccounts: Array<{
    id: string;
    name: string;
    plan: string;
    status: string;
    role: string;
  }>;
}

export interface UserWithMemberships {
  user: DbUser;
  memberships: Array<{
    membershipId: string;
    role: string;
    accountId: string;
    accountName: string;
    orgId?: string | null;
    orgName?: string | null;
    plan: string;
    joinedAt: Date;
  }>;
}

// Repository interface
export interface IUserRepository {
  // Basic CRUD operations
  create(data: CreateUserData): Promise<DbUser>;
  findById(id: string): Promise<DbUser | null>;
  findByClerkId(clerkId: string): Promise<DbUser | null>;
  update(id: string, data: UpdateUserData): Promise<DbUser | null>;

  // Query operations
  findMany(
    conditions: UserQueryOptions,
    pagination: UserPaginationOptions
  ): Promise<DbUser[]>;
  count(conditions: UserQueryOptions): Promise<number>;

  // Complex queries
  findUserWithContext(clerkId: string): Promise<UserWithContext | null>;
  findUserWithMemberships(userId: string): Promise<UserWithMemberships | null>;

  // Role management
  updateRole(clerkId: string, role: string): Promise<DbUser | null>;

  // Statistics
  getRoleStats(): Promise<{
    totalUsers: number;
    superAdmins: number;
    admins: number;
    support: number;
  }>;
}

// Repository implementation
export class UserRepository implements IUserRepository {
  constructor(private db: NodePgDatabase<Record<string, unknown>>) {}

  /**
   * Builds SQL conditions from query options
   */
  private buildConditions(conditions: UserQueryOptions): SQL[] {
    const sqlConditions: SQL[] = [];

    if (conditions.search) {
      const searchCondition = or(
        like(users.email, `%${conditions.search}%`),
        like(users.clerkId, `%${conditions.search}%`)
      );
      if (searchCondition) {
        sqlConditions.push(searchCondition);
      }
    }

    if (conditions.role) {
      sqlConditions.push(eq(users.globalRole, conditions.role));
    }

    return sqlConditions;
  }

  /**
   * Merges multiple SQL conditions
   */
  private mergeConditions(conditions: SQL[]): SQL | undefined {
    if (conditions.length === 0) return undefined;
    if (conditions.length === 1) return conditions[0];
    return and(...conditions);
  }

  async create(data: CreateUserData): Promise<DbUser> {
    const [newUser] = await this.db
      .insert(users)
      .values({
        clerkId: data.clerkId,
        email: data.email,
        globalRole: data.globalRole || "user",
      })
      .returning();

    return newUser;
  }

  async findById(id: string): Promise<DbUser | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user || null;
  }

  async findByClerkId(clerkId: string): Promise<DbUser | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    return user || null;
  }

  async update(id: string, data: UpdateUserData): Promise<DbUser | null> {
    const [updatedUser] = await this.db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();

    return updatedUser || null;
  }

  async findMany(
    conditions: UserQueryOptions,
    pagination: UserPaginationOptions
  ): Promise<DbUser[]> {
    const sqlConditions = this.buildConditions(conditions);
    const mergedConditions = this.mergeConditions(sqlConditions);

    let query = this.db
      .select({
        id: users.id,
        clerkId: users.clerkId,
        email: users.email,
        globalRole: users.globalRole,
        accountIds: users.accountIds,
        primaryAccountId: users.primaryAccountId,
        currentAccountId: users.currentAccountId,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt,
      })
      .from(users)
      .$dynamic();

    if (mergedConditions) {
      query = query.where(mergedConditions);
    }

    return await query
      .orderBy(desc(users.createdAt))
      .limit(pagination.limit)
      .offset(pagination.offset);
  }

  async count(conditions: UserQueryOptions): Promise<number> {
    const sqlConditions = this.buildConditions(conditions);
    const mergedConditions = this.mergeConditions(sqlConditions);

    let query = this.db.select({ count: count() }).from(users).$dynamic();

    if (mergedConditions) {
      query = query.where(mergedConditions);
    }

    const [result] = await query;
    return result.count;
  }

  async findUserWithContext(clerkId: string): Promise<UserWithContext | null> {
    // Get user details
    const user = await this.findByClerkId(clerkId);
    if (!user) return null;

    // Get user's current context
    const context = await this.db
      .select({
        currentAccountId: userContext.currentAccountId,
        lastSwitchedAt: userContext.lastSwitchedAt,
        accountName: accounts.name,
        accountPlan: accounts.plan,
        accountStatus: accounts.status,
        orgId: sql<string | null>`${accounts.parentOrgId}`,
        orgName: sql<string | null>`orgs.name`,
      })
      .from(userContext)
      .innerJoin(accounts, eq(userContext.currentAccountId, accounts.id))
      .leftJoin(sql`orgs`, eq(accounts.parentOrgId, sql`orgs.id`))
      .where(eq(userContext.userId, user.id))
      .limit(1);

    // Get user's available accounts
    const availableAccounts = await this.db
      .select({
        id: accounts.id,
        name: accounts.name,
        plan: accounts.plan,
        status: accounts.status,
        role: memberships.role,
      })
      .from(memberships)
      .innerJoin(accounts, eq(memberships.accountId, accounts.id))
      .where(eq(memberships.userId, user.id))
      .orderBy(desc(memberships.createdAt));

    return {
      user,
      currentContext: context[0]
        ? {
            currentAccountId: context[0].currentAccountId,
            lastSwitchedAt: context[0].lastSwitchedAt,
            accountName: context[0].accountName,
            accountPlan: context[0].accountPlan,
            accountStatus: context[0].accountStatus,
            orgId: context[0].orgId as string | undefined,
            orgName: context[0].orgName as string | undefined,
          }
        : undefined,
      availableAccounts,
    };
  }

  async findUserWithMemberships(
    userId: string
  ): Promise<UserWithMemberships | null> {
    const user = await this.findById(userId);
    if (!user) return null;

    // Get user's memberships with account and org info
    const membershipResults = await this.db
      .select({
        membershipId: memberships.id,
        role: memberships.role,
        accountId: accounts.id,
        accountName: accounts.name,
        orgId: sql<string | null>`orgs.id`,
        orgName: sql<string | null>`orgs.name`,
        plan: accounts.plan,
        joinedAt: memberships.createdAt,
      })
      .from(memberships)
      .innerJoin(accounts, eq(memberships.accountId, accounts.id))
      .leftJoin(sql`orgs`, eq(accounts.parentOrgId, sql`orgs.id`))
      .where(eq(memberships.userId, userId))
      .orderBy(desc(memberships.createdAt));

    return {
      user,
      memberships: membershipResults,
    };
  }

  async updateRole(clerkId: string, role: string): Promise<DbUser | null> {
    const [updatedUser] = await this.db
      .update(users)
      .set({ globalRole: role })
      .where(eq(users.clerkId, clerkId))
      .returning();

    return updatedUser || null;
  }

  async getRoleStats(): Promise<{
    totalUsers: number;
    superAdmins: number;
    admins: number;
    support: number;
  }> {
    const [stats] = await this.db
      .select({
        totalUsers: count(),
        superAdmins: sql<number>`count(case when ${users.globalRole} = 'super_admin' then 1 end)`,
        admins: sql<number>`count(case when ${users.globalRole} = 'admin' then 1 end)`,
        support: sql<number>`count(case when ${users.globalRole} = 'support' then 1 end)`,
      })
      .from(users);

    return stats;
  }
}
