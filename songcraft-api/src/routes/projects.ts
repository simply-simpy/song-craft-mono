import type { FastifyInstance } from "fastify";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { z } from "zod";

import { db } from "../db";
import {
  accounts,
  projectPermissions,
  projects,
  sessions,
  users,
} from "../schema";
import {
  AppError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../lib/errors";
import { GlobalRole } from "../lib/super-user";
import { requireClerkUser } from "./_utils/auth";
import {
  buildPaginationMeta,
  createPaginationSchema,
  getOffset,
  orderDirectionSchema,
} from "./_utils/pagination";
import { withErrorHandling } from "./_utils/route-helpers";

const uuidSchema = z.string().uuid();
const permissionLevelSchema = z.enum([
  "read",
  "read_notes",
  "read_write",
  "full_access",
]);

type PermissionLevel = z.infer<typeof permissionLevelSchema>;

const writablePermissions: PermissionLevel[] = ["read_write", "full_access"];
const fullAccessOnly: PermissionLevel[] = ["full_access"];

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

const projectSelection = {
  id: projects.id,
  accountId: projects.accountId,
  name: projects.name,
  description: projects.description,
  status: projects.status,
  createdAt: projects.createdAt,
  updatedAt: projects.updatedAt,
  createdBy: projects.createdBy,
  creatorName: users.email,
  accountName: accounts.name,
} as const;

const projectOrderColumns = {
  createdAt: projects.createdAt,
  updatedAt: projects.updatedAt,
  name: projects.name,
  status: projects.status,
} as const;

type ProjectOrderKey = keyof typeof projectOrderColumns;

type OrderDirection = z.infer<typeof orderDirectionSchema>;

const sessionSelection = {
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
  accountName: accounts.name,
} as const;

const sessionOrderColumns = {
  createdAt: sessions.createdAt,
  updatedAt: sessions.updatedAt,
  name: sessions.name,
  status: sessions.status,
  scheduledStart: sessions.scheduledStart,
} as const;

type SessionOrderKey = keyof typeof sessionOrderColumns;

const projectPermissionsSelection = {
  userId: projectPermissions.userId,
  permissionLevel: projectPermissions.permissionLevel,
  grantedAt: projectPermissions.grantedAt,
  expiresAt: projectPermissions.expiresAt,
  userEmail: users.email,
} as const;

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
    })
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

const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.any().optional(),
});

const buildProjectOrderBy = (sort: ProjectOrderKey, order: OrderDirection) => {
  const column = projectOrderColumns[sort];
  return order === "asc" ? asc(column) : desc(column);
};

const buildSessionOrderBy = (sort: SessionOrderKey, order: OrderDirection) => {
  const column = sessionOrderColumns[sort];
  return order === "asc" ? asc(column) : desc(column);
};

const mergeConditions = (conditions: SQL[]) =>
  conditions.length === 1 ? conditions[0] : and(...conditions);

const countProjects = async (conditions: SQL[]) => {
  let query = db
    .select({ count: sql<number>`count(*)` })
    .from(projects)
    .$dynamic();

  if (conditions.length > 0) {
    query = query.where(mergeConditions(conditions));
  }

  const [result] = await query;
  return Number(result?.count ?? 0);
};

const fetchProjects = async (
  conditions: SQL[],
  orderBy: ReturnType<typeof buildProjectOrderBy>,
  limit: number,
  offset: number
) => {
  let query = db
    .select(projectSelection)
    .from(projects)
    .leftJoin(users, eq(projects.createdBy, users.id))
    .leftJoin(accounts, eq(projects.accountId, accounts.id))
    .$dynamic();

  if (conditions.length > 0) {
    query = query.where(mergeConditions(conditions));
  }

  return query.orderBy(orderBy).limit(limit).offset(offset);
};

const fetchProject = async (id: string) => {
  const [project] = await db
    .select(projectSelection)
    .from(projects)
    .leftJoin(users, eq(projects.createdBy, users.id))
    .leftJoin(accounts, eq(projects.accountId, accounts.id))
    .where(eq(projects.id, id))
    .limit(1);

  return project ?? null;
};

const getProjectPermissions = async (projectId: string) =>
  db
    .select(projectPermissionsSelection)
    .from(projectPermissions)
    .leftJoin(users, eq(projectPermissions.userId, users.id))
    .where(eq(projectPermissions.projectId, projectId));

const getProjectPermissionForUser = async (projectId: string, userId: string) => {
  const [permission] = await db
    .select(projectPermissionsSelection)
    .from(projectPermissions)
    .leftJoin(users, eq(projectPermissions.userId, users.id))
    .where(
      and(
        eq(projectPermissions.projectId, projectId),
        eq(projectPermissions.userId, userId)
      )
    )
    .limit(1);

  return permission ?? null;
};

const getSessionsCount = async (projectId: string) => {
  const [result] = await db
    .select({ sessionsCount: sql<number>`count(*)` })
    .from(sessions)
    .where(eq(sessions.projectId, projectId));

  return Number(result?.sessionsCount ?? 0);
};

const buildProjectDetails = async (projectId: string) => {
  const project = await fetchProject(projectId);

  if (!project) {
    return null;
  }

  const [permissions, sessionsCount] = await Promise.all([
    getProjectPermissions(projectId),
    getSessionsCount(projectId),
  ]);

  return {
    ...project,
    permissions,
    sessionsCount,
  };
};

const findUserIdByClerkId = async (clerkId: string) => {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  return user?.id ?? null;
};

const requireUserIdByClerkId = async (clerkId: string) => {
  const userId = await findUserIdByClerkId(clerkId);
  if (!userId) {
    throw new UnauthorizedError("User not found");
  }
  return userId;
};

const requireProjectPermission = async (
  projectId: string,
  userId: string,
  allowedLevels: PermissionLevel[]
) => {
  const [permission] = await db
    .select({ level: projectPermissions.permissionLevel })
    .from(projectPermissions)
    .where(
      and(
        eq(projectPermissions.projectId, projectId),
        eq(projectPermissions.userId, userId)
      )
    )
    .limit(1);

  if (!permission || !allowedLevels.includes(permission.level as PermissionLevel)) {
    throw new ForbiddenError();
  }
};

export default async function projectRoutes(fastify: FastifyInstance) {
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
      const { page, limit, sort, order, accountId, createdBy } =
        request.query as ProjectPaginationQuery;

      const conditions: SQL[] = [];
      if (accountId) {
        conditions.push(eq(projects.accountId, accountId));
      }
      if (createdBy) {
        conditions.push(eq(projects.createdBy, createdBy));
      }

      const offset = getOffset({ page, limit });
      const orderBy = buildProjectOrderBy(sort, order);
      const total = await countProjects(conditions);
      const projectRows = await fetchProjects(conditions, orderBy, limit, offset);

      const projectsWithDetails = await Promise.all(
        projectRows.map(async (project) => ({
          ...project,
          permissions: await getProjectPermissions(project.id),
          sessionsCount: await getSessionsCount(project.id),
        }))
      );

      return reply.status(200).send({
        projects: projectsWithDetails,
        pagination: buildPaginationMeta({ page, limit, total }),
      });
    })
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

      const project = await buildProjectDetails(id);
      if (!project) {
        throw new NotFoundError("Project not found");
      }

      return reply.status(200).send({ project });
    })
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
      const clerkId = requireClerkUser(request);
      const userId = await requireUserIdByClerkId(clerkId);
      const body = request.body as z.infer<typeof createProjectSchema>;

      const createdProject = await db.transaction(async (tx) => {
        const [project] = await tx
          .insert(projects)
          .values({
            accountId: body.accountId,
            name: body.name,
            description: body.description,
            status: body.status,
            createdBy: userId,
          })
          .returning();

        if (!project) {
          throw new AppError("Failed to create project record");
        }

        await tx.insert(projectPermissions).values({
          projectId: project.id,
          userId,
          permissionLevel: "full_access",
          grantedBy: userId,
        });

        return project.id;
      });

      const projectWithDetails = await buildProjectDetails(createdProject);
      if (!projectWithDetails) {
        throw new AppError("Project created but details could not be loaded");
      }

      return reply.status(201).send({ project: projectWithDetails });
    })
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
      const clerkId = requireClerkUser(request);
      const userId = await requireUserIdByClerkId(clerkId);

      await requireProjectPermission(id, userId, writablePermissions);

      const body = request.body as z.infer<typeof updateProjectSchema>;
      const [updatedProject] = await db
        .update(projects)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, id))
        .returning({ id: projects.id });

      if (!updatedProject) {
        throw new NotFoundError("Project not found");
      }

      const projectWithDetails = await buildProjectDetails(updatedProject.id);
      if (!projectWithDetails) {
        throw new AppError("Updated project could not be loaded");
      }

      return reply.status(200).send({ project: projectWithDetails });
    })
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
      const clerkId = requireClerkUser(request);
      const userId = await requireUserIdByClerkId(clerkId);

      await requireProjectPermission(id, userId, fullAccessOnly);

      const project = await fetchProject(id);
      if (!project) {
        throw new NotFoundError("Project not found");
      }

      await db.transaction(async (tx) => {
        await tx
          .delete(projectPermissions)
          .where(eq(projectPermissions.projectId, id));
        await tx.delete(sessions).where(eq(sessions.projectId, id));
        await tx.delete(projects).where(eq(projects.id, id));
      });

      return reply.status(204).send();
    })
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
      const clerkId = requireClerkUser(request);
      const userId = await requireUserIdByClerkId(clerkId);

      await requireProjectPermission(id, userId, fullAccessOnly);

      const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

      await db
        .insert(projectPermissions)
        .values({
          projectId: id,
          userId: body.userId,
          permissionLevel: body.permissionLevel,
          grantedBy: userId,
          expiresAt,
        })
        .onConflictDoUpdate({
          target: [projectPermissions.projectId, projectPermissions.userId],
          set: {
            permissionLevel: body.permissionLevel,
            grantedBy: userId,
            expiresAt,
          },
        });

      const permission = await getProjectPermissionForUser(id, body.userId);

      if (!permission) {
        throw new AppError("Failed to load updated permission");
      }

      return reply.status(200).send({ permission });
    })
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
      const clerkId = requireClerkUser(request);
      const requestingUserId = await requireUserIdByClerkId(clerkId);

      await requireProjectPermission(id, requestingUserId, fullAccessOnly);

      await db
        .delete(projectPermissions)
        .where(
          and(
            eq(projectPermissions.projectId, id),
            eq(projectPermissions.userId, userId)
          )
        );

      return reply.status(204).send();
    })
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
      const { page, limit, sort, order } =
        request.query as SessionsPaginationQuery;

      const offset = getOffset({ page, limit });
      const orderBy = buildSessionOrderBy(sort, order);

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(sessions);
      const total = Number(count ?? 0);

      const sessionsList = await db
        .select(sessionSelection)
        .from(sessions)
        .leftJoin(users, eq(sessions.createdBy, users.id))
        .leftJoin(projects, eq(sessions.projectId, projects.id))
        .leftJoin(accounts, eq(projects.accountId, accounts.id))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      return reply.status(200).send({
        data: sessionsList,
        pagination: buildPaginationMeta({ page, limit, total }),
      });
    })
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

      const project = await fetchProject(id);
      if (!project) {
        throw new NotFoundError("Project not found");
      }

      const projectSessions = await db
        .select(sessionSelection)
        .from(sessions)
        .leftJoin(users, eq(sessions.createdBy, users.id))
        .leftJoin(projects, eq(sessions.projectId, projects.id))
        .leftJoin(accounts, eq(projects.accountId, accounts.id))
        .where(eq(sessions.projectId, id))
        .orderBy(desc(sessions.scheduledStart));

      return reply.status(200).send({ data: projectSessions });
    })
  );
}
