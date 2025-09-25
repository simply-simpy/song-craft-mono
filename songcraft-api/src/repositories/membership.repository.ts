import { and, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import { memberships, userContext } from "../schema";

// Database types
export type DbMembership = typeof memberships.$inferSelect;
export type DbUserContext = typeof userContext.$inferSelect;

// Repository input types
export interface CreateMembershipData {
	accountId: string;
	userId: string;
	role: string;
}

export interface UpdateMembershipData {
	role?: string;
}

export interface CreateUserContextData {
	userId: string;
	currentAccountId: string;
	contextData?: Record<string, unknown>;
}

export interface UpdateUserContextData {
	currentAccountId?: string;
	lastSwitchedAt?: Date;
	contextData?: Record<string, unknown>;
}

// Repository interfaces
export interface IMembershipRepository {
	// Basic CRUD operations
	create(data: CreateMembershipData): Promise<DbMembership>;
	findById(id: string): Promise<DbMembership | null>;
	findByUserAndAccount(
		userId: string,
		accountId: string,
	): Promise<DbMembership | null>;
	update(id: string, data: UpdateMembershipData): Promise<DbMembership | null>;
	delete(id: string): Promise<void>;

	// Query operations
	findByUserId(userId: string): Promise<DbMembership[]>;
	findByAccountId(accountId: string): Promise<DbMembership[]>;
}

export interface IUserContextRepository {
	// Basic CRUD operations
	create(data: CreateUserContextData): Promise<DbUserContext>;
	findByUserId(userId: string): Promise<DbUserContext | null>;
	update(
		userId: string,
		data: UpdateUserContextData,
	): Promise<DbUserContext | null>;
	upsert(userId: string, data: CreateUserContextData): Promise<DbUserContext>;
	delete(userId: string): Promise<void>;
}

// Membership Repository implementation
export class MembershipRepository implements IMembershipRepository {
	constructor(private db: NodePgDatabase<any>) {}

	async create(data: CreateMembershipData): Promise<DbMembership> {
		const [newMembership] = await this.db
			.insert(memberships)
			.values({
				accountId: data.accountId,
				userId: data.userId,
				role: data.role,
			})
			.returning();

		return newMembership;
	}

	async findById(id: string): Promise<DbMembership | null> {
		const [membership] = await this.db
			.select()
			.from(memberships)
			.where(eq(memberships.id, id))
			.limit(1);

		return membership || null;
	}

	async findByUserAndAccount(
		userId: string,
		accountId: string,
	): Promise<DbMembership | null> {
		const [membership] = await this.db
			.select()
			.from(memberships)
			.where(
				and(
					eq(memberships.userId, userId),
					eq(memberships.accountId, accountId),
				),
			)
			.limit(1);

		return membership || null;
	}

	async update(
		id: string,
		data: UpdateMembershipData,
	): Promise<DbMembership | null> {
		const [updatedMembership] = await this.db
			.update(memberships)
			.set(data)
			.where(eq(memberships.id, id))
			.returning();

		return updatedMembership || null;
	}

	async delete(id: string): Promise<void> {
		await this.db.delete(memberships).where(eq(memberships.id, id));
	}

	async findByUserId(userId: string): Promise<DbMembership[]> {
		return await this.db
			.select()
			.from(memberships)
			.where(eq(memberships.userId, userId));
	}

	async findByAccountId(accountId: string): Promise<DbMembership[]> {
		return await this.db
			.select()
			.from(memberships)
			.where(eq(memberships.accountId, accountId));
	}
}

// UserContext Repository implementation
export class UserContextRepository implements IUserContextRepository {
	constructor(private db: NodePgDatabase<any>) {}

	async create(data: CreateUserContextData): Promise<DbUserContext> {
		const [newContext] = await this.db
			.insert(userContext)
			.values({
				userId: data.userId,
				currentAccountId: data.currentAccountId,
				contextData: data.contextData || {},
			})
			.returning();

		return newContext;
	}

	async findByUserId(userId: string): Promise<DbUserContext | null> {
		const [context] = await this.db
			.select()
			.from(userContext)
			.where(eq(userContext.userId, userId))
			.limit(1);

		return context || null;
	}

	async update(
		userId: string,
		data: UpdateUserContextData,
	): Promise<DbUserContext | null> {
		const [updatedContext] = await this.db
			.update(userContext)
			.set({
				currentAccountId: data.currentAccountId,
				lastSwitchedAt: data.lastSwitchedAt || new Date(),
				contextData: data.contextData,
			})
			.where(eq(userContext.userId, userId))
			.returning();

		return updatedContext || null;
	}

	async upsert(
		userId: string,
		data: CreateUserContextData,
	): Promise<DbUserContext> {
		const existing = await this.findByUserId(userId);

		if (existing) {
			const updated = await this.update(userId, {
				currentAccountId: data.currentAccountId,
				contextData: data.contextData,
			});
			return updated!;
		} else {
			return await this.create(data);
		}
	}

	async delete(userId: string): Promise<void> {
		await this.db.delete(userContext).where(eq(userContext.userId, userId));
	}
}
