import {
	AppError,
	ForbiddenError,
	NotFoundError,
	UnauthorizedError,
} from "../lib/errors";
import type {
	CreateProjectPermissionData,
	IProjectPermissionsRepository,
	PermissionLevel,
} from "../repositories/project-permissions.repository";
import type {
	CreateProjectData,
	IProjectRepository,
	ProjectPaginationOptions,
	ProjectQueryOptions,
	UpdateProjectData,
} from "../repositories/project.repository";
import type {
	ISessionRepository,
	SessionPaginationOptions,
} from "../repositories/session.repository";
import type { IUserRepository } from "../repositories/user.repository";

// Service types
export interface ProjectWithFullDetails {
	id: string;
	accountId: string;
	name: string;
	description: string | null;
	status: string;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	creatorName: string | null;
	accountName: string | null;
	permissions: Array<{
		userId: string;
		permissionLevel: PermissionLevel;
		grantedAt: string;
		expiresAt: string | null;
		userEmail: string | null;
	}>;
	sessionsCount: number;
}

export interface ProjectListParams {
	page: number;
	limit: number;
	sort: "createdAt" | "updatedAt" | "name" | "status";
	order: "asc" | "desc";
	accountId?: string;
	createdBy?: string;
}

export interface CreateProjectParams {
	accountId: string;
	name: string;
	description?: string;
	status?: string;
	creatorClerkId: string;
}

export interface UpdateProjectParams {
	id: string;
	name?: string;
	description?: string;
	status?: string;
	editorClerkId: string;
}

export interface AddPermissionParams {
	projectId: string;
	userId: string;
	permissionLevel: PermissionLevel;
	expiresAt?: string;
	granterClerkId: string;
}

export interface SessionListParams {
	page: number;
	limit: number;
	sort: "createdAt" | "updatedAt" | "name" | "status" | "scheduledStart";
	order: "asc" | "desc";
}

// Permission level constants
const WRITABLE_PERMISSIONS: PermissionLevel[] = ["read_write", "full_access"];
const FULL_ACCESS_ONLY: PermissionLevel[] = ["full_access"];

export class ProjectService {
	constructor(
		private projects: IProjectRepository,
		private permissions: IProjectPermissionsRepository,
		private sessions: ISessionRepository,
		private users: IUserRepository,
	) {}

	/**
	 * Helper to find user ID by Clerk ID
	 */
	private async findUserIdByClerkId(clerkId: string): Promise<string | null> {
		const user = await this.users.findByClerkId(clerkId);
		return user?.id || null;
	}

	/**
	 * Helper to require user ID by Clerk ID
	 */
	private async requireUserIdByClerkId(clerkId: string): Promise<string> {
		const userId = await this.findUserIdByClerkId(clerkId);
		if (!userId) {
			throw new UnauthorizedError("User not found");
		}
		return userId;
	}

	/**
	 * Helper to require project permission
	 */
	private async requireProjectPermission(
		projectId: string,
		userId: string,
		allowedLevels: PermissionLevel[],
	): Promise<void> {
		const hasPermission = await this.permissions.hasPermission(
			projectId,
			userId,
			allowedLevels,
		);

		if (!hasPermission) {
			throw new ForbiddenError();
		}
	}

	/**
	 * Helper to build project with full details
	 */
	private async buildProjectWithDetails(
		projectId: string,
	): Promise<ProjectWithFullDetails | null> {
		const project = await this.projects.findByIdWithDetails(projectId);
		if (!project) return null;

		const [projectPermissions, sessionsCount] = await Promise.all([
			this.permissions.findByProject(projectId),
			this.projects.getSessionsCount(projectId),
		]);

		return {
			id: project.id,
			accountId: project.accountId,
			name: project.name,
			description: project.description,
			status: project.status,
			createdAt: project.createdAt.toISOString(),
			updatedAt: project.updatedAt.toISOString(),
			createdBy: project.createdBy,
			creatorName: project.creatorName,
			accountName: project.accountName,
			permissions: projectPermissions.map((perm) => ({
				userId: perm.userId,
				permissionLevel: perm.permissionLevel,
				grantedAt: perm.grantedAt.toISOString(),
				expiresAt: perm.expiresAt ? perm.expiresAt.toISOString() : null,
				userEmail: perm.userEmail,
			})),
			sessionsCount,
		};
	}

	/**
	 * List projects with pagination and filtering
	 */
	async listProjects(params: ProjectListParams) {
		const conditions: ProjectQueryOptions = {
			accountId: params.accountId,
			createdBy: params.createdBy,
		};

		const pagination: ProjectPaginationOptions = {
			limit: params.limit,
			offset: (params.page - 1) * params.limit,
			sort: params.sort,
			order: params.order,
		};

		const [total, projectRows] = await Promise.all([
			this.projects.count(conditions),
			this.projects.findMany(conditions, pagination),
		]);

		// Add permissions and sessions count to each project
		const projectsWithDetails = await Promise.all(
			projectRows.map(async (project) => {
				const [projectPermissions, sessionsCount] = await Promise.all([
					this.permissions.findByProject(project.id),
					this.projects.getSessionsCount(project.id),
				]);

				return {
					id: project.id,
					accountId: project.accountId,
					name: project.name,
					description: project.description,
					status: project.status,
					createdAt: project.createdAt.toISOString(),
					updatedAt: project.updatedAt.toISOString(),
					createdBy: project.createdBy,
					creatorName: project.creatorName,
					accountName: project.accountName,
					permissions: projectPermissions.map((perm) => ({
						userId: perm.userId,
						permissionLevel: perm.permissionLevel,
						grantedAt: perm.grantedAt.toISOString(),
						expiresAt: perm.expiresAt ? perm.expiresAt.toISOString() : null,
						userEmail: perm.userEmail,
					})),
					sessionsCount,
				};
			}),
		);

		return {
			projects: projectsWithDetails,
			pagination: {
				page: params.page,
				limit: params.limit,
				total,
				pages: Math.ceil(total / params.limit),
			},
		};
	}

	/**
	 * Get project by ID with full details
	 */
	async getProject(id: string): Promise<ProjectWithFullDetails | null> {
		return await this.buildProjectWithDetails(id);
	}

	/**
	 * Create a new project
	 */
	async createProject(
		params: CreateProjectParams,
	): Promise<ProjectWithFullDetails> {
		const userId = await this.requireUserIdByClerkId(params.creatorClerkId);

		const createData: CreateProjectData = {
			accountId: params.accountId,
			name: params.name,
			description: params.description,
			status: params.status || "active",
			createdBy: userId,
		};

		// Create project and grant creator full access in a transaction-like manner
		const project = await this.projects.create(createData);

		// Grant the creator full access to the project
		await this.permissions.create({
			projectId: project.id,
			userId,
			permissionLevel: "full_access",
			grantedBy: userId,
		});

		const projectWithDetails = await this.buildProjectWithDetails(project.id);
		if (!projectWithDetails) {
			throw new AppError("Project created but details could not be loaded");
		}

		return projectWithDetails;
	}

	/**
	 * Update a project
	 */
	async updateProject(
		params: UpdateProjectParams,
	): Promise<ProjectWithFullDetails> {
		const userId = await this.requireUserIdByClerkId(params.editorClerkId);
		await this.requireProjectPermission(
			params.id,
			userId,
			WRITABLE_PERMISSIONS,
		);

		const updateData: UpdateProjectData = {
			name: params.name,
			description: params.description,
			status: params.status,
			updatedAt: new Date(),
		};

		const updatedProject = await this.projects.update(params.id, updateData);
		if (!updatedProject) {
			throw new NotFoundError("Project not found");
		}

		const projectWithDetails = await this.buildProjectWithDetails(
			updatedProject.id,
		);
		if (!projectWithDetails) {
			throw new AppError("Updated project could not be loaded");
		}

		return projectWithDetails;
	}

	/**
	 * Delete a project
	 */
	async deleteProject(id: string, deleterClerkId: string): Promise<void> {
		const userId = await this.requireUserIdByClerkId(deleterClerkId);
		await this.requireProjectPermission(id, userId, FULL_ACCESS_ONLY);

		// Verify project exists before deletion
		const project = await this.projects.findById(id);
		if (!project) {
			throw new NotFoundError("Project not found");
		}

		// Delete project permissions first, then sessions, then project
		await this.permissions.deleteByProject(id);
		await this.projects.deleteWithRelatedData(id);
	}

	/**
	 * Add permission to a project
	 */
	async addProjectPermission(params: AddPermissionParams) {
		const granterId = await this.requireUserIdByClerkId(params.granterClerkId);
		await this.requireProjectPermission(
			params.projectId,
			granterId,
			FULL_ACCESS_ONLY,
		);

		const expiresAt = params.expiresAt ? new Date(params.expiresAt) : null;

		const permissionData: CreateProjectPermissionData = {
			projectId: params.projectId,
			userId: params.userId,
			permissionLevel: params.permissionLevel,
			grantedBy: granterId,
			expiresAt,
		};

		await this.permissions.upsert(permissionData);

		const permission = await this.permissions.findByProjectAndUserWithDetails(
			params.projectId,
			params.userId,
		);

		if (!permission) {
			throw new AppError("Failed to load updated permission");
		}

		return {
			userId: permission.userId,
			permissionLevel: permission.permissionLevel,
			grantedAt: permission.grantedAt.toISOString(),
			expiresAt: permission.expiresAt
				? permission.expiresAt.toISOString()
				: null,
		};
	}

	/**
	 * Remove permission from a project
	 */
	async removeProjectPermission(
		projectId: string,
		userId: string,
		removerClerkId: string,
	): Promise<void> {
		const removerId = await this.requireUserIdByClerkId(removerClerkId);
		await this.requireProjectPermission(projectId, removerId, FULL_ACCESS_ONLY);

		await this.permissions.delete(projectId, userId);
	}

	/**
	 * List sessions with pagination
	 */
	async listSessions(params: SessionListParams) {
		const pagination: SessionPaginationOptions = {
			limit: params.limit,
			offset: (params.page - 1) * params.limit,
			sort: params.sort,
			order: params.order,
		};

		const [total, sessionsList] = await Promise.all([
			this.sessions.count(),
			this.sessions.findMany(pagination),
		]);

		return {
			data: sessionsList.map((session) => ({
				id: session.id,
				projectId: session.projectId,
				name: session.name,
				description: session.description,
				sessionType: session.sessionType,
				status: session.status,
				scheduledStart: session.scheduledStart
					? session.scheduledStart.toISOString()
					: null,
				scheduledEnd: session.scheduledEnd
					? session.scheduledEnd.toISOString()
					: null,
				actualStart: session.actualStart
					? session.actualStart.toISOString()
					: null,
				actualEnd: session.actualEnd ? session.actualEnd.toISOString() : null,
				createdAt: session.createdAt.toISOString(),
				updatedAt: session.updatedAt.toISOString(),
				createdBy: session.createdBy,
				creatorName: session.creatorName,
				projectName: session.projectName,
				accountName: session.accountName,
			})),
			pagination: {
				page: params.page,
				limit: params.limit,
				total,
				pages: Math.ceil(total / params.limit),
			},
		};
	}

	/**
	 * Get project sessions
	 */
	async getProjectSessions(projectId: string) {
		// Verify project exists
		const project = await this.projects.findById(projectId);
		if (!project) {
			throw new NotFoundError("Project not found");
		}

		const projectSessions = await this.sessions.findByProject(projectId);

		return {
			data: projectSessions.map((session) => ({
				id: session.id,
				projectId: session.projectId,
				name: session.name,
				description: session.description,
				sessionType: session.sessionType,
				status: session.status,
				scheduledStart: session.scheduledStart
					? session.scheduledStart.toISOString()
					: null,
				scheduledEnd: session.scheduledEnd
					? session.scheduledEnd.toISOString()
					: null,
				actualStart: session.actualStart
					? session.actualStart.toISOString()
					: null,
				actualEnd: session.actualEnd ? session.actualEnd.toISOString() : null,
				createdAt: session.createdAt.toISOString(),
				updatedAt: session.updatedAt.toISOString(),
				createdBy: session.createdBy,
				creatorName: session.creatorName,
				projectName: session.projectName,
				accountName: session.accountName,
			})),
		};
	}
}
