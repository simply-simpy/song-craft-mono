import { errorResponseSchema, uuidSchema, z } from "@songcraft/shared";
import type { FastifyInstance, FastifyRequest } from "fastify";

import {
	AppError,
	ForbiddenError,
	NotFoundError,
	UnauthorizedError,
} from "../lib/errors";
import { GlobalRole } from "../lib/super-user";
import {
	buildPaginationMeta,
	createPaginationSchema,
	getOffset,
} from "./_utils/pagination";
import { withErrorHandling } from "./_utils/route-helpers";

const permissionLevelSchema = z.enum([
	"read",
	"read_notes",
	"read_write",
	"full_access",
]);

//type PermissionLevel = z.infer<typeof permissionLevelSchema>;

const createProjectSchema = z.object({
	accountId: uuidSchema,
	name: z.string().min(1).max(255),
	description: z.string().optional(),
	status: z.enum(["active", "archived", "deleted"]).default("active"),
});

const updateProjectSchema = z.object({
	name: z.string().min(1).max(255).optional(),
	description: z.string().optional(),
	status: z.enum(["active", "archived", "deleted"]).optional(),
});

const addPermissionSchema = z.object({
	userId: uuidSchema,
	permissionLevel: permissionLevelSchema,
	expiresAt: z.string().datetime().optional(),
});

const projectPaginationSchema = createPaginationSchema({
	sortOptions: ["createdAt", "updatedAt", "name", "status"] as const,
	defaultSort: "updatedAt",
}).extend({
	accountId: uuidSchema.optional(),
	createdBy: uuidSchema.optional(),
});

type ProjectPaginationQuery = z.infer<typeof projectPaginationSchema>;

const sessionsPaginationSchema = createPaginationSchema({
	sortOptions: [
		"createdAt",
		"updatedAt",
		"name",
		"status",
		"scheduledStart",
	] as const,
	defaultSort: "createdAt",
});

type SessionsPaginationQuery = z.infer<typeof sessionsPaginationSchema>;

const projectResponseSchema = z.object({
	id: uuidSchema,
	accountId: uuidSchema,
	name: z.string(),
	description: z.string().nullable(),
	status: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
	createdBy: uuidSchema,
	creatorName: z.string().nullable(),
	accountName: z.string().nullable(),
	permissions: z.array(
		z.object({
			userId: uuidSchema,
			permissionLevel: permissionLevelSchema,
			grantedAt: z.string(),
			expiresAt: z.string().nullable(),
			userEmail: z.string().nullable(),
		}),
	),
	sessionsCount: z.number(),
});

const projectsListResponseSchema = z.object({
	projects: z.array(projectResponseSchema),
	pagination: z.object({
		page: z.number(),
		limit: z.number(),
		total: z.number(),
		pages: z.number(),
	}),
});

const projectPermissionResponseSchema = z.object({
	userId: uuidSchema,
	permissionLevel: permissionLevelSchema,
	grantedAt: z.string(),
	expiresAt: z.string().nullable(),
});

const sessionResponseSchema = z.object({
	id: uuidSchema,
	projectId: uuidSchema,
	name: z.string(),
	description: z.string().nullable(),
	sessionType: z.string(),
	status: z.string(),
	scheduledStart: z.string().nullable(),
	scheduledEnd: z.string().nullable(),
	actualStart: z.string().nullable(),
	actualEnd: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
	createdBy: uuidSchema,
	creatorName: z.string().nullable(),
	projectName: z.string().nullable(),
	accountName: z.string().nullable(),
});

const sessionsListResponseSchema = z.object({
	data: z.array(sessionResponseSchema),
	pagination: z.object({
		page: z.number(),
		limit: z.number(),
		total: z.number(),
		pages: z.number(),
	}),
});

const projectSessionsResponseSchema = z.object({
	data: z.array(sessionResponseSchema),
});

export default async function projectRoutes(fastify: FastifyInstance) {
	const getProjectService = (req: FastifyRequest) => {
		if (!req.container) {
			throw new Error("Container not available");
		}
		return req.container.projectService;
	};

	fastify.get(
		"/projects",
		{
			preHandler: fastify.requireSuperUser(GlobalRole.SUPPORT),
			schema: {
				querystring: projectPaginationSchema,
				response: {
					200: projectsListResponseSchema,
					400: errorResponseSchema,
					500: errorResponseSchema,
				},
			},
		},
		withErrorHandling(async (request, reply) => {
			const query = request.query as ProjectPaginationQuery;
			const { page, limit } = query;

			const result = await getProjectService(request).listProjects(query);

			return reply.status(200).send({
				projects: result.projects,
				pagination: buildPaginationMeta({
					page,
					limit,
					total: result.pagination.total,
				}),
			});
		}),
	);

	fastify.get(
		"/projects/:id",
		{
			preHandler: fastify.requireSuperUser(GlobalRole.SUPPORT),
			schema: {
				params: z.object({ id: uuidSchema }),
				response: {
					200: z.object({ project: projectResponseSchema }),
					400: errorResponseSchema,
					404: errorResponseSchema,
					500: errorResponseSchema,
				},
			},
		},
		withErrorHandling(async (request, reply) => {
			const { id } = request.params as { id: string };

			const project = await getProjectService(request).getProject(id);
			if (!project) {
				throw new NotFoundError("Project not found");
			}

			return reply.status(200).send({ project });
		}),
	);

	fastify.post(
		"/projects",
		{
			preHandler: fastify.requireSuperUser(GlobalRole.SUPPORT),
			schema: {
				body: createProjectSchema,
				response: {
					201: z.object({ project: projectResponseSchema }),
					400: errorResponseSchema,
					401: errorResponseSchema,
					500: errorResponseSchema,
				},
			},
		},
		withErrorHandling(async (request, reply) => {
			const clerkId = request.user?.clerkId as string;
			const body = request.body as z.infer<typeof createProjectSchema>;

			const project = await getProjectService(request).createProject({
				accountId: body.accountId,
				name: body.name,
				description: body.description,
				status: body.status,
				creatorClerkId: clerkId,
			});

			return reply.status(201).send({ project });
		}),
	);

	fastify.put(
		"/projects/:id",
		{
			preHandler: fastify.requireSuperUser(GlobalRole.SUPPORT),
			schema: {
				params: z.object({ id: uuidSchema }),
				body: updateProjectSchema,
				response: {
					200: z.object({ project: projectResponseSchema }),
					400: errorResponseSchema,
					401: errorResponseSchema,
					403: errorResponseSchema,
					404: errorResponseSchema,
					500: errorResponseSchema,
				},
			},
		},
		withErrorHandling(async (request, reply) => {
			const { id } = request.params as { id: string };
			const clerkId = request.user?.clerkId as string;
			const body = request.body as z.infer<typeof updateProjectSchema>;

			const project = await getProjectService(request).updateProject({
				id,
				name: body.name,
				description: body.description,
				status: body.status,
				editorClerkId: clerkId,
			});

			return reply.status(200).send({ project });
		}),
	);

	fastify.delete(
		"/projects/:id",
		{
			preHandler: fastify.requireSuperUser(GlobalRole.SUPPORT),
			schema: {
				params: z.object({ id: uuidSchema }),
				response: {
					204: z.null(),
					401: errorResponseSchema,
					403: errorResponseSchema,
					404: errorResponseSchema,
					500: errorResponseSchema,
				},
			},
		},
		withErrorHandling(async (request, reply) => {
			const { id } = request.params as { id: string };
			const clerkId = request.user?.clerkId as string;

			await getProjectService(request).deleteProject(id, clerkId);

			return reply.status(204).send();
		}),
	);

	fastify.post(
		"/projects/:id/permissions",
		{
			preHandler: fastify.requireSuperUser(GlobalRole.SUPPORT),
			schema: {
				params: z.object({ id: uuidSchema }),
				body: addPermissionSchema,
				response: {
					200: z.object({ permission: projectPermissionResponseSchema }),
					400: errorResponseSchema,
					401: errorResponseSchema,
					403: errorResponseSchema,
					404: errorResponseSchema,
					500: errorResponseSchema,
				},
			},
		},
		withErrorHandling(async (request, reply) => {
			const { id } = request.params as { id: string };
			const body = request.body as z.infer<typeof addPermissionSchema>;
			const clerkId = request.user?.clerkId as string;

			const permission = await getProjectService(request).addProjectPermission({
				projectId: id,
				userId: body.userId,
				permissionLevel: body.permissionLevel,
				expiresAt: body.expiresAt,
				granterClerkId: clerkId,
			});

			return reply.status(200).send({ permission });
		}),
	);

	fastify.delete(
		"/projects/:id/permissions/:userId",
		{
			preHandler: fastify.requireSuperUser(GlobalRole.SUPPORT),
			schema: {
				params: z.object({ id: uuidSchema, userId: uuidSchema }),
				response: {
					204: z.null(),
					400: errorResponseSchema,
					401: errorResponseSchema,
					403: errorResponseSchema,
					500: errorResponseSchema,
				},
			},
		},
		withErrorHandling(async (request, reply) => {
			const { id, userId } = request.params as { id: string; userId: string };
			const clerkId = request.user?.clerkId as string;

			await getProjectService(request).removeProjectPermission(
				id,
				userId,
				clerkId,
			);

			return reply.status(204).send();
		}),
	);

	fastify.get(
		"/sessions",
		{
			preHandler: fastify.requireSuperUser(GlobalRole.SUPPORT),
			schema: {
				querystring: sessionsPaginationSchema,
				response: {
					200: sessionsListResponseSchema,
					400: errorResponseSchema,
					500: errorResponseSchema,
				},
			},
		},
		withErrorHandling(async (request, reply) => {
			const query = request.query as SessionsPaginationQuery;
			const { page, limit } = query;

			const result = await getProjectService(request).listSessions(query);

			return reply.status(200).send({
				data: result.data,
				pagination: buildPaginationMeta({
					page,
					limit,
					total: result.pagination.total,
				}),
			});
		}),
	);

	fastify.get(
		"/projects/:id/sessions",
		{
			preHandler: fastify.requireSuperUser(GlobalRole.SUPPORT),
			schema: {
				params: z.object({ id: uuidSchema }),
				response: {
					200: projectSessionsResponseSchema,
					400: errorResponseSchema,
					500: errorResponseSchema,
				},
			},
		},
		withErrorHandling(async (request, reply) => {
			const { id } = request.params as { id: string };

			const result = await getProjectService(request).getProjectSessions(id);

			return reply.status(200).send({
				data: result.data,
			});
		}),
	);
}
