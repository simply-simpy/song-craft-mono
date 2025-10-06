import { count, desc, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import { accounts, memberships, orgs } from "../schema";

// Database types
export type DbOrg = typeof orgs.$inferSelect;

// Repository input types
export interface CreateOrgData {
	name: string;
	billingEmail?: string;
	billingAddress?: string;
	billingPhone?: string;
}

export interface UpdateOrgData {
	name?: string;
	billingEmail?: string;
	billingAddress?: string;
	billingPhone?: string;
}

export interface OrgPaginationOptions {
	limit: number;
	offset: number;
}

export interface OrgWithStats {
	id: string;
	name: string;
	createdAt: Date;
	accountCount: number;
}

export interface OrgWithAccounts {
	org: DbOrg;
	accounts: Array<{
		id: string;
		name: string;
		plan: string;
		status: string;
		isDefault: boolean;
		createdAt: Date;
		memberCount: number;
	}>;
}

// Repository interface
export interface IOrganizationRepository {
	// Basic CRUD operations
	create(data: CreateOrgData): Promise<DbOrg>;
	findById(id: string): Promise<DbOrg | null>;
	update(id: string, data: UpdateOrgData): Promise<DbOrg | null>;
	delete(id: string): Promise<void>;

	// Query operations
	findMany(pagination: OrgPaginationOptions): Promise<OrgWithStats[]>;
	count(): Promise<number>;

	// Complex queries
	findOrgWithAccounts(orgId: string): Promise<OrgWithAccounts | null>;
}

// Repository implementation
export class OrganizationRepository implements IOrganizationRepository {
	constructor(private db: NodePgDatabase<Record<string, unknown>>) {}

	async create(data: CreateOrgData): Promise<DbOrg> {
		const [newOrg] = await this.db
			.insert(orgs)
			.values({
				name: data.name,
				billingEmail: data.billingEmail,
				billingAddress: data.billingAddress,
				billingPhone: data.billingPhone,
			})
			.returning();

		return newOrg;
	}

	async findById(id: string): Promise<DbOrg | null> {
		const [org] = await this.db
			.select()
			.from(orgs)
			.where(eq(orgs.id, id))
			.limit(1);

		return org || null;
	}

	async update(id: string, data: UpdateOrgData): Promise<DbOrg | null> {
		const [updatedOrg] = await this.db
			.update(orgs)
			.set(data)
			.where(eq(orgs.id, id))
			.returning();

		return updatedOrg || null;
	}

	async delete(id: string): Promise<void> {
		await this.db.delete(orgs).where(eq(orgs.id, id));
	}

	async findMany(pagination: OrgPaginationOptions): Promise<OrgWithStats[]> {
		return await this.db
			.select({
				id: orgs.id,
				name: orgs.name,
				createdAt: orgs.createdAt,
				accountCount: count(accounts.id),
			})
			.from(orgs)
			.leftJoin(accounts, eq(orgs.id, accounts.orgId))
			.groupBy(orgs.id, orgs.name, orgs.createdAt)
			.orderBy(desc(orgs.createdAt))
			.limit(pagination.limit)
			.offset(pagination.offset);
	}

	async count(): Promise<number> {
		const [result] = await this.db.select({ count: count() }).from(orgs);
		return result.count;
	}

	async findOrgWithAccounts(orgId: string): Promise<OrgWithAccounts | null> {
		const org = await this.findById(orgId);
		if (!org) return null;

		// Get organization accounts with member counts
		const orgAccounts = await this.db
			.select({
				id: accounts.id,
				name: accounts.name,
				plan: accounts.plan,
				status: accounts.status,
				isDefault: accounts.isDefault,
				createdAt: accounts.createdAt,
				memberCount: count(memberships.id),
			})
			.from(accounts)
			.leftJoin(memberships, eq(accounts.id, memberships.accountId))
			.where(eq(accounts.orgId, orgId))
			.groupBy(
				accounts.id,
				accounts.name,
				accounts.plan,
				accounts.status,
				accounts.isDefault,
				accounts.createdAt,
			)
			.orderBy(desc(accounts.createdAt));

		return {
			org,
			accounts: orgAccounts,
		};
	}
}
