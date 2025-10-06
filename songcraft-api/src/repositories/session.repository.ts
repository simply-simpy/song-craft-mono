import { asc, desc, eq, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import { projects, sessions, users } from "../schema";

// Database types
export type DbSession = typeof sessions.$inferSelect;

// Repository input types
export interface CreateSessionData {
	projectId: string;
	name: string;
	description?: string;
	sessionType: string;
	status?: string;
	scheduledStart?: Date;
	scheduledEnd?: Date;
	actualStart?: Date;
	actualEnd?: Date;
	createdBy: string;
}

export interface UpdateSessionData {
	name?: string;
	description?: string;
	sessionType?: string;
	status?: string;
	scheduledStart?: Date;
	scheduledEnd?: Date;
	actualStart?: Date;
	actualEnd?: Date;
	updatedAt?: Date;
}

export interface SessionPaginationOptions {
	limit: number;
	offset: number;
	sort: "createdAt" | "updatedAt" | "name" | "status" | "scheduledStart";
	order: "asc" | "desc";
}

export interface SessionWithDetails {
	id: string;
	projectId: string;
	name: string;
	description: string | null;
	sessionType: string;
	status: string;
	scheduledStart: Date | null;
	scheduledEnd: Date | null;
	actualStart: Date | null;
	actualEnd: Date | null;
	createdAt: Date;
	updatedAt: Date;
	createdBy: string;
	creatorName: string | null;
	projectName: string | null;
	accountName: string | null;
}

// Repository interface
export interface ISessionRepository {
	// Basic CRUD operations
	create(data: CreateSessionData): Promise<DbSession>;
	findById(id: string): Promise<DbSession | null>;
	findByIdWithDetails(id: string): Promise<SessionWithDetails | null>;
	update(id: string, data: UpdateSessionData): Promise<DbSession | null>;
	delete(id: string): Promise<void>;

	// Query operations
	findMany(pagination: SessionPaginationOptions): Promise<SessionWithDetails[]>;
	findByProject(projectId: string): Promise<SessionWithDetails[]>;
	count(): Promise<number>;
	countByProject(projectId: string): Promise<number>;

	// Cleanup operations
	deleteByProject(projectId: string): Promise<void>;
}

// Repository implementation
export class SessionRepository implements ISessionRepository {
	constructor(private db: NodePgDatabase<Record<string, unknown>>) {}

	// Selection for sessions with full details
	private readonly sessionSelection = {
		id: sessions.id,
		projectId: sessions.projectId,
		name: sessions.name,
		description: sessions.description,
		sessionType: sessions.sessionType,
		status: sessions.status,
		scheduledStart: sessions.scheduledStart,
		scheduledEnd: sessions.scheduledEnd,
		actualStart: sessions.actualStart,
		actualEnd: sessions.actualEnd,
		createdAt: sessions.createdAt,
		updatedAt: sessions.updatedAt,
		createdBy: sessions.createdBy,
		creatorName: users.email,
		projectName: projects.name,
		accountName: sql<string | null>`null`,
	} as const;

	// Order columns mapping
	private readonly orderColumns = {
		createdAt: sessions.createdAt,
		updatedAt: sessions.updatedAt,
		name: sessions.name,
		status: sessions.status,
		scheduledStart: sessions.scheduledStart,
	} as const;

	/**
	 * Builds ORDER BY clause from pagination options
	 */
	private buildOrderBy(
		sort: SessionPaginationOptions["sort"],
		order: "asc" | "desc",
	) {
		const column = this.orderColumns[sort];
		return order === "asc" ? asc(column) : desc(column);
	}

	/**
	 * Serializes a session row to the expected format
	 */
	private serializeSession(session: {
		id: string;
		projectId: string;
		name: string;
		description: string | null;
		sessionType: string;
		status: string;
		scheduledStart: Date | null;
		scheduledEnd: Date | null;
		actualStart: Date | null;
		actualEnd: Date | null;
		createdAt: Date;
		updatedAt: Date;
		createdBy: string;
		creatorName: string | null;
		projectName: string | null;
		accountName: string | null;
	}): SessionWithDetails {
		return {
			id: session.id,
			projectId: session.projectId,
			name: session.name,
			description: session.description ?? null,
			sessionType: session.sessionType,
			status: session.status,
			scheduledStart: session.scheduledStart,
			scheduledEnd: session.scheduledEnd,
			actualStart: session.actualStart,
			actualEnd: session.actualEnd,
			createdAt: session.createdAt,
			updatedAt: session.updatedAt,
			createdBy: session.createdBy,
			creatorName: session.creatorName ?? null,
			projectName: session.projectName ?? null,
			accountName: session.accountName ?? null,
		};
	}

	async create(data: CreateSessionData): Promise<DbSession> {
		const [newSession] = await this.db
			.insert(sessions)
			.values({
				projectId: data.projectId,
				name: data.name,
				description: data.description,
				sessionType: data.sessionType,
				status: data.status || "scheduled",
				scheduledStart: data.scheduledStart,
				scheduledEnd: data.scheduledEnd,
				actualStart: data.actualStart,
				actualEnd: data.actualEnd,
				createdBy: data.createdBy,
			})
			.returning();

		return newSession;
	}

	async findById(id: string): Promise<DbSession | null> {
		const [session] = await this.db
			.select()
			.from(sessions)
			.where(eq(sessions.id, id))
			.limit(1);

		return session || null;
	}

	async findByIdWithDetails(id: string): Promise<SessionWithDetails | null> {
		const [session] = await this.db
			.select(this.sessionSelection)
			.from(sessions)
			.leftJoin(users, eq(sessions.createdBy, users.id))
			.leftJoin(projects, eq(sessions.projectId, projects.id))
			.where(eq(sessions.id, id))
			.limit(1);

		return session ? this.serializeSession(session) : null;
	}

	async update(id: string, data: UpdateSessionData): Promise<DbSession | null> {
		const [updatedSession] = await this.db
			.update(sessions)
			.set({
				...data,
				updatedAt: data.updatedAt || new Date(),
			})
			.where(eq(sessions.id, id))
			.returning();

		return updatedSession || null;
	}

	async delete(id: string): Promise<void> {
		await this.db.delete(sessions).where(eq(sessions.id, id));
	}

	async findMany(
		pagination: SessionPaginationOptions,
	): Promise<SessionWithDetails[]> {
		const orderBy = this.buildOrderBy(pagination.sort, pagination.order);

		const sessionsList = await this.db
			.select(this.sessionSelection)
			.from(sessions)
			.leftJoin(users, eq(sessions.createdBy, users.id))
			.leftJoin(projects, eq(sessions.projectId, projects.id))
			.orderBy(orderBy)
			.limit(pagination.limit)
			.offset(pagination.offset);

		return sessionsList.map((session) => this.serializeSession(session));
	}

	async findByProject(projectId: string): Promise<SessionWithDetails[]> {
		const projectSessions = await this.db
			.select(this.sessionSelection)
			.from(sessions)
			.leftJoin(users, eq(sessions.createdBy, users.id))
			.leftJoin(projects, eq(sessions.projectId, projects.id))
			.where(eq(sessions.projectId, projectId))
			.orderBy(desc(sessions.scheduledStart));

		return projectSessions.map((session) => this.serializeSession(session));
	}

	async count(): Promise<number> {
		const [result] = await this.db
			.select({ count: sql<number>`count(*)` })
			.from(sessions);

		return Number(result?.count ?? 0);
	}

	async countByProject(projectId: string): Promise<number> {
		const [result] = await this.db
			.select({ count: sql<number>`count(*)` })
			.from(sessions)
			.where(eq(sessions.projectId, projectId));

		return Number(result?.count ?? 0);
	}

	async deleteByProject(projectId: string): Promise<void> {
		await this.db.delete(sessions).where(eq(sessions.projectId, projectId));
	}
}
