import { and, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import { projectPermissions, users } from "../schema";

// Database types
export type DbProjectPermission = typeof projectPermissions.$inferSelect;

// Permission levels type
export type PermissionLevel = "read" | "read_notes" | "read_write" | "full_access";

// Repository input types
export interface CreateProjectPermissionData {
  projectId: string;
  userId: string;
  permissionLevel: PermissionLevel;
  grantedBy: string;
  expiresAt?: Date | null;
}

export interface UpdateProjectPermissionData {
  permissionLevel?: PermissionLevel;
  grantedBy?: string;
  expiresAt?: Date | null;
}

export interface ProjectPermissionWithUser {
  userId: string;
  permissionLevel: PermissionLevel;
  grantedAt: Date;
  expiresAt: Date | null;
  userEmail: string | null;
}

// Repository interface
export interface IProjectPermissionsRepository {
  // Basic CRUD operations
  create(data: CreateProjectPermissionData): Promise<DbProjectPermission>;
  findByProjectAndUser(projectId: string, userId: string): Promise<DbProjectPermission | null>;
  findByProjectAndUserWithDetails(projectId: string, userId: string): Promise<ProjectPermissionWithUser | null>;
  update(projectId: string, userId: string, data: UpdateProjectPermissionData): Promise<DbProjectPermission | null>;
  delete(projectId: string, userId: string): Promise<void>;
  upsert(data: CreateProjectPermissionData): Promise<DbProjectPermission>;
  
  // Query operations
  findByProject(projectId: string): Promise<ProjectPermissionWithUser[]>;
  findByUser(userId: string): Promise<DbProjectPermission[]>;
  
  // Permission checking
  hasPermission(projectId: string, userId: string, allowedLevels: PermissionLevel[]): Promise<boolean>;
  getUserPermissionLevel(projectId: string, userId: string): Promise<PermissionLevel | null>;
  
  // Cleanup operations
  deleteByProject(projectId: string): Promise<void>;
}

// Repository implementation
export class ProjectPermissionsRepository implements IProjectPermissionsRepository {
  constructor(private db: NodePgDatabase<any>) {}

  // Selection for permissions with user details
  private readonly permissionSelection = {
    userId: projectPermissions.userId,
    permissionLevel: projectPermissions.permissionLevel,
    grantedAt: projectPermissions.grantedAt,
    expiresAt: projectPermissions.expiresAt,
    userEmail: users.email,
  } as const;

  /**
   * Serializes a permission row to the expected format
   */
  private serializePermission(permission: any): ProjectPermissionWithUser {
    return {
      userId: permission.userId,
      permissionLevel: permission.permissionLevel as PermissionLevel,
      grantedAt: permission.grantedAt,
      expiresAt: permission.expiresAt,
      userEmail: permission.userEmail ?? null,
    };
  }

  async create(data: CreateProjectPermissionData): Promise<DbProjectPermission> {
    const [newPermission] = await this.db
      .insert(projectPermissions)
      .values({
        projectId: data.projectId,
        userId: data.userId,
        permissionLevel: data.permissionLevel,
        grantedBy: data.grantedBy,
        expiresAt: data.expiresAt,
      })
      .returning();

    return newPermission;
  }

  async findByProjectAndUser(projectId: string, userId: string): Promise<DbProjectPermission | null> {
    const [permission] = await this.db
      .select()
      .from(projectPermissions)
      .where(
        and(
          eq(projectPermissions.projectId, projectId),
          eq(projectPermissions.userId, userId)
        )
      )
      .limit(1);

    return permission || null;
  }

  async findByProjectAndUserWithDetails(projectId: string, userId: string): Promise<ProjectPermissionWithUser | null> {
    const [permission] = await this.db
      .select(this.permissionSelection)
      .from(projectPermissions)
      .leftJoin(users, eq(projectPermissions.userId, users.id))
      .where(
        and(
          eq(projectPermissions.projectId, projectId),
          eq(projectPermissions.userId, userId)
        )
      )
      .limit(1);

    return permission ? this.serializePermission(permission) : null;
  }

  async update(projectId: string, userId: string, data: UpdateProjectPermissionData): Promise<DbProjectPermission | null> {
    const [updatedPermission] = await this.db
      .update(projectPermissions)
      .set(data)
      .where(
        and(
          eq(projectPermissions.projectId, projectId),
          eq(projectPermissions.userId, userId)
        )
      )
      .returning();

    return updatedPermission || null;
  }

  async delete(projectId: string, userId: string): Promise<void> {
    await this.db
      .delete(projectPermissions)
      .where(
        and(
          eq(projectPermissions.projectId, projectId),
          eq(projectPermissions.userId, userId)
        )
      );
  }

  async upsert(data: CreateProjectPermissionData): Promise<DbProjectPermission> {
    const [permission] = await this.db
      .insert(projectPermissions)
      .values({
        projectId: data.projectId,
        userId: data.userId,
        permissionLevel: data.permissionLevel,
        grantedBy: data.grantedBy,
        expiresAt: data.expiresAt,
      })
      .onConflictDoUpdate({
        target: [projectPermissions.projectId, projectPermissions.userId],
        set: {
          permissionLevel: data.permissionLevel,
          grantedBy: data.grantedBy,
          expiresAt: data.expiresAt,
        },
      })
      .returning();

    return permission;
  }

  async findByProject(projectId: string): Promise<ProjectPermissionWithUser[]> {
    const permissions = await this.db
      .select(this.permissionSelection)
      .from(projectPermissions)
      .leftJoin(users, eq(projectPermissions.userId, users.id))
      .where(eq(projectPermissions.projectId, projectId));

    return permissions.map((permission) => this.serializePermission(permission));
  }

  async findByUser(userId: string): Promise<DbProjectPermission[]> {
    return await this.db
      .select()
      .from(projectPermissions)
      .where(eq(projectPermissions.userId, userId));
  }

  async hasPermission(projectId: string, userId: string, allowedLevels: PermissionLevel[]): Promise<boolean> {
    const [permission] = await this.db
      .select({ level: projectPermissions.permissionLevel })
      .from(projectPermissions)
      .where(
        and(
          eq(projectPermissions.projectId, projectId),
          eq(projectPermissions.userId, userId)
        )
      )
      .limit(1);

    if (!permission) {
      return false;
    }

    return allowedLevels.includes(permission.level as PermissionLevel);
  }

  async getUserPermissionLevel(projectId: string, userId: string): Promise<PermissionLevel | null> {
    const [permission] = await this.db
      .select({ level: projectPermissions.permissionLevel })
      .from(projectPermissions)
      .where(
        and(
          eq(projectPermissions.projectId, projectId),
          eq(projectPermissions.userId, userId)
        )
      )
      .limit(1);

    return permission ? (permission.level as PermissionLevel) : null;
  }

  async deleteByProject(projectId: string): Promise<void> {
    await this.db
      .delete(projectPermissions)
      .where(eq(projectPermissions.projectId, projectId));
  }
}