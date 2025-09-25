import { and, count, desc, eq, like, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import { accounts, orgs, memberships, users } from "../schema";

// Database types
export type DbAccount = typeof accounts.$inferSelect;

// Repository input types
export interface CreateAccountData {
  name: string;
  description?: string;
  plan?: string;
  status?: string;
  billingEmail?: string;
  settings?: Record<string, unknown>;
  isDefault?: boolean;
  parentOrgId?: string;
  ownerUserId?: string;
}

export interface UpdateAccountData {
  name?: string;
  description?: string;
  plan?: string;
  status?: string;
  billingEmail?: string;
  settings?: Record<string, unknown>;
  isDefault?: boolean;
}

export interface AccountQueryOptions {
  search?: string;
  plan?: string;
  status?: string;
  orgId?: string;
}

export interface AccountPaginationOptions {
  limit: number;
  offset: number;
}

export interface AccountWithDetails {
  id: string;
  name: string;
  description?: string | null;
  plan: string;
  status: string;
  billingEmail?: string | null;
  isDefault: boolean;
  createdAt: Date;
  orgId?: string | null;
  orgName?: string | null;
  memberCount: number;
}

export interface AccountWithMembers {
  account: DbAccount & {
    orgId?: string | null;
    orgName?: string | null;
    orgBillingEmail?: string | null;
  };
  members: Array<{
    membershipId: string;
    role: string;
    userId: string;
    userEmail: string;
    userGlobalRole: string;
    joinedAt: Date;
  }>;
}

// Repository interface
export interface IAccountRepository {
  // Basic CRUD operations
  create(data: CreateAccountData): Promise<DbAccount>;
  findById(id: string): Promise<DbAccount | null>;
  update(id: string, data: UpdateAccountData): Promise<DbAccount | null>;
  delete(id: string): Promise<void>;
  
  // Query operations
  findMany(
    conditions: AccountQueryOptions,
    pagination: AccountPaginationOptions
  ): Promise<AccountWithDetails[]>;
  count(conditions: AccountQueryOptions): Promise<number>;
  
  // Complex queries
  findAccountWithMembers(accountId: string): Promise<AccountWithMembers | null>;
  
  // Statistics
  getTotalCount(): Promise<number>;
}

// Repository implementation
export class AccountRepository implements IAccountRepository {
  constructor(private db: NodePgDatabase<any>) {}

  /**
   * Builds SQL conditions from query options
   */
  private buildConditions(conditions: AccountQueryOptions): SQL[] {
    const sqlConditions: SQL[] = [];

    if (conditions.search) {
      sqlConditions.push(like(accounts.name, `%${conditions.search}%`));
    }

    if (conditions.plan) {
      sqlConditions.push(eq(accounts.plan, conditions.plan));
    }

    if (conditions.status) {
      sqlConditions.push(eq(accounts.status, conditions.status));
    }

    if (conditions.orgId) {
      sqlConditions.push(eq(accounts.parentOrgId, conditions.orgId));
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

  async create(data: CreateAccountData): Promise<DbAccount> {
    const [newAccount] = await this.db
      .insert(accounts)
      .values({
        name: data.name,
        description: data.description,
        plan: data.plan || "Free",
        status: data.status || "active",
        billingEmail: data.billingEmail,
        settings: data.settings || {},
        isDefault: data.isDefault ?? true,
        parentOrgId: data.parentOrgId,
        ownerUserId: data.ownerUserId,
      })
      .returning();

    return newAccount;
  }

  async findById(id: string): Promise<DbAccount | null> {
    const [account] = await this.db
      .select()
      .from(accounts)
      .where(eq(accounts.id, id))
      .limit(1);

    return account || null;
  }

  async update(id: string, data: UpdateAccountData): Promise<DbAccount | null> {
    const [updatedAccount] = await this.db
      .update(accounts)
      .set(data)
      .where(eq(accounts.id, id))
      .returning();

    return updatedAccount || null;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(accounts).where(eq(accounts.id, id));
  }

  async findMany(
    conditions: AccountQueryOptions,
    pagination: AccountPaginationOptions
  ): Promise<AccountWithDetails[]> {
    const sqlConditions = this.buildConditions(conditions);
    const mergedConditions = this.mergeConditions(sqlConditions);

    let query = this.db
      .select({
        id: accounts.id,
        name: accounts.name,
        description: accounts.description,
        plan: accounts.plan,
        status: accounts.status,
        billingEmail: accounts.billingEmail,
        isDefault: accounts.isDefault,
        createdAt: accounts.createdAt,
        orgId: orgs.id,
        orgName: orgs.name,
        memberCount: count(memberships.id),
      })
      .from(accounts)
      .leftJoin(orgs, eq(accounts.parentOrgId, orgs.id))
      .leftJoin(memberships, eq(accounts.id, memberships.accountId))
      .$dynamic();

    if (mergedConditions) {
      query = query.where(mergedConditions);
    }

    return await query
      .groupBy(
        accounts.id,
        accounts.name,
        accounts.description,
        accounts.plan,
        accounts.status,
        accounts.billingEmail,
        accounts.isDefault,
        accounts.createdAt,
        orgs.id,
        orgs.name
      )
      .orderBy(desc(accounts.createdAt))
      .limit(pagination.limit)
      .offset(pagination.offset);
  }

  async count(conditions: AccountQueryOptions): Promise<number> {
    const sqlConditions = this.buildConditions(conditions);
    const mergedConditions = this.mergeConditions(sqlConditions);

    let query = this.db
      .select({ count: count() })
      .from(accounts)
      .$dynamic();

    if (mergedConditions) {
      query = query.where(mergedConditions);
    }

    const [result] = await query;
    return result.count;
  }

  async findAccountWithMembers(accountId: string): Promise<AccountWithMembers | null> {
    // Get account with org info
    const [account] = await this.db
      .select({
        id: accounts.id,
        name: accounts.name,
        description: accounts.description,
        plan: accounts.plan,
        status: accounts.status,
        billingEmail: accounts.billingEmail,
        settings: accounts.settings,
        isDefault: accounts.isDefault,
        createdAt: accounts.createdAt,
        parentOrgId: accounts.parentOrgId,
        ownerUserId: accounts.ownerUserId,
        orgId: orgs.id,
        orgName: orgs.name,
        orgBillingEmail: orgs.billingEmail,
      })
      .from(accounts)
      .leftJoin(orgs, eq(accounts.parentOrgId, orgs.id))
      .where(eq(accounts.id, accountId))
      .limit(1);

    if (!account) return null;

    // Get account members
    const members = await this.db
      .select({
        membershipId: memberships.id,
        role: memberships.role,
        userId: users.id,
        userEmail: users.email,
        userGlobalRole: users.globalRole,
        joinedAt: memberships.createdAt,
      })
      .from(memberships)
      .innerJoin(users, eq(memberships.userId, users.id))
      .where(eq(memberships.accountId, accountId))
      .orderBy(desc(memberships.createdAt));

    return {
      account: {
        id: account.id,
        name: account.name,
        description: account.description,
        plan: account.plan,
        status: account.status,
        billingEmail: account.billingEmail,
        settings: account.settings,
        isDefault: account.isDefault,
        createdAt: account.createdAt,
        parentOrgId: account.parentOrgId,
        ownerUserId: account.ownerUserId,
        orgId: account.orgId ?? null,
        orgName: account.orgName ?? null,
        orgBillingEmail: account.orgBillingEmail ?? null,
      },
      members,
    };
  }

  async getTotalCount(): Promise<number> {
    const [result] = await this.db.select({ count: count() }).from(accounts);
    return result.count;
  }
}