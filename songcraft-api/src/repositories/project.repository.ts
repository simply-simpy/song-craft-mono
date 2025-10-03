import { and, asc, desc, eq, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import { accounts, projectAccountAssociations, projects, sessions, users } from "../schema";

// Database types
export type DbProject = typeof projects.$inferSelect;

// Repository input types
export interface CreateProjectData {
  name: string;
  description?: string;
  status?: string;
  createdBy: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: string;
  updatedAt?: Date;
}

export interface ProjectQueryOptions {
  accountId?: string;
  createdBy?: string;
  status?: string;
}

export interface ProjectPaginationOptions {
  limit: number;
  offset: number;
  sort: "createdAt" | "updatedAt" | "name" | "status";
  order: "asc" | "desc";
}

export interface ProjectWithDetails {
  id: string;
  accountId: string | null;
  name: string;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  creatorName: string | null;
  accountName: string | null;
}

// Repository interface
export interface IProjectRepository {
  // Basic CRUD operations
  create(data: CreateProjectData): Promise<DbProject>;
  findById(id: string): Promise<DbProject | null>;
  findByIdWithDetails(id: string): Promise<ProjectWithDetails | null>;
  update(id: string, data: UpdateProjectData): Promise<DbProject | null>;
  delete(id: string): Promise<void>;

  // Query operations
  findMany(
    conditions: ProjectQueryOptions,
    pagination: ProjectPaginationOptions
  ): Promise<ProjectWithDetails[]>;
  count(conditions: ProjectQueryOptions): Promise<number>;

  // Project-specific operations
  getSessionsCount(projectId: string): Promise<number>;
  deleteWithRelatedData(projectId: string): Promise<void>;
  createAccountAssociation(projectId: string, accountId: string, associationType?: string): Promise<void>;
}

// Repository implementation
export class ProjectRepository implements IProjectRepository {
  constructor(private db: NodePgDatabase<Record<string, unknown>>) {}

  // Selection objects for consistent queries
  private readonly projectSelection = {
    id: projects.id,
    name: projects.name,
    description: projects.description,
    status: projects.status,
    createdAt: projects.createdAt,
    updatedAt: projects.updatedAt,
    createdBy: projects.createdBy,
    creatorName: users.email,
    // derive account via association
    accountId: sql<string | null>`(
      select paa.account_id from project_account_associations paa
      where paa.project_id = ${projects.id}
      limit 1
    )`,
    accountName: sql<string | null>`(
      select a.name from project_account_associations paa
      join accounts a on a.id = paa.account_id
      where paa.project_id = ${projects.id}
      limit 1
    )`,
  } as const;

  // Order columns mapping
  private readonly orderColumns = {
    createdAt: projects.createdAt,
    updatedAt: projects.updatedAt,
    name: projects.name,
    status: projects.status,
  } as const;

  /**
   * Builds SQL conditions from query options
   */
  private buildConditions(conditions: ProjectQueryOptions): SQL[] {
    const sqlConditions: SQL[] = [];


    if (conditions.createdBy) {
      sqlConditions.push(eq(projects.createdBy, conditions.createdBy));
    }

    if (conditions.status) {
      sqlConditions.push(eq(projects.status, conditions.status));
    }

    return sqlConditions;
  }

  /**
   * Builds ORDER BY clause from pagination options
   */
  private buildOrderBy(
    sort: ProjectPaginationOptions["sort"],
    order: "asc" | "desc"
  ) {
    const column = this.orderColumns[sort];
    return order === "asc" ? asc(column) : desc(column);
  }

  /**
   * Merges multiple SQL conditions
   */
  private mergeConditions(conditions: SQL[]): SQL | undefined {
    if (conditions.length === 0) return undefined;
    if (conditions.length === 1) return conditions[0];
    return and(...conditions);
  }

  /**
   * Serializes a project row to the expected format
   */
  private serializeProject(project: {
    id: string;
    accountId: string | null;
    name: string;
    description: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    creatorName: string | null;
    accountName: string | null;
  }): ProjectWithDetails {
    return {
      id: project.id,
      accountId: project.accountId,
      name: project.name,
      description: project.description ?? null,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      createdBy: project.createdBy,
      creatorName: project.creatorName ?? null,
      accountName: project.accountName ?? null,
    };
  }

  async create(data: CreateProjectData): Promise<DbProject> {
    const [newProject] = await this.db
      .insert(projects)
      .values({
        name: data.name,
        description: data.description,
        status: data.status || "active",
        createdBy: data.createdBy,
      })
      .returning();

    return newProject;
  }

  async findById(id: string): Promise<DbProject | null> {
    const [project] = await this.db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    return project || null;
  }

  async findByIdWithDetails(id: string): Promise<ProjectWithDetails | null> {
    const [project] = await this.db
      .select(this.projectSelection)
      .from(projects)
      .leftJoin(users, eq(projects.createdBy, users.id))
      .where(eq(projects.id, id))
      .limit(1);

    return project ? this.serializeProject(project) : null;
  }

  async update(id: string, data: UpdateProjectData): Promise<DbProject | null> {
    const [updatedProject] = await this.db
      .update(projects)
      .set({
        ...data,
        updatedAt: data.updatedAt || new Date(),
      })
      .where(eq(projects.id, id))
      .returning();

    return updatedProject || null;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(projects).where(eq(projects.id, id));
  }

  async findMany(
    conditions: ProjectQueryOptions,
    pagination: ProjectPaginationOptions
  ): Promise<ProjectWithDetails[]> {
    const sqlConditions = this.buildConditions(conditions);
    const orderBy = this.buildOrderBy(pagination.sort, pagination.order);
    const mergedConditions = this.mergeConditions(sqlConditions);

    let query = this.db
      .select(this.projectSelection)
      .from(projects)
      .leftJoin(users, eq(projects.createdBy, users.id))
      .$dynamic();

    if (mergedConditions) {
      query = query.where(mergedConditions);
    }

    const rows = await query
      .orderBy(orderBy)
      .limit(pagination.limit)
      .offset(pagination.offset);

    return rows.map((row) => this.serializeProject(row));
  }

  async count(conditions: ProjectQueryOptions): Promise<number> {
    const sqlConditions = this.buildConditions(conditions);
    const mergedConditions = this.mergeConditions(sqlConditions);

    let query = this.db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .$dynamic();

    if (mergedConditions) {
      query = query.where(mergedConditions);
    }

    const [result] = await query;
    return Number(result?.count ?? 0);
  }

  async getSessionsCount(projectId: string): Promise<number> {
    const [result] = await this.db
      .select({ sessionsCount: sql<number>`count(*)` })
      .from(sessions)
      .where(eq(sessions.projectId, projectId));

    return Number(result?.sessionsCount ?? 0);
  }

  async deleteWithRelatedData(projectId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      // Delete related sessions first
      await tx.delete(sessions).where(eq(sessions.projectId, projectId));
      // Delete the project itself
      await tx.delete(projects).where(eq(projects.id, projectId));
    });
  }

  async createAccountAssociation(
    projectId: string,
    accountId: string,
    associationType: string = "primary"
  ): Promise<void> {
    await this.db
      .insert(projectAccountAssociations)
      .values({ projectId, accountId, associationType });
  }
}
