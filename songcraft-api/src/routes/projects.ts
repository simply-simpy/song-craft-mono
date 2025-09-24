import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../db";
import {
  projects,
  projectPermissions,
  sessions,
  users,
  accounts,
} from "../schema";
import { eq, and, desc, asc, sql, count } from "drizzle-orm";
import crypto from "node:crypto";
import { GlobalRole } from "../lib/super-user";

// Input validation schemas
const uuidSchema = z.string().uuid();
const permissionLevelSchema = z.enum([
  "read",
  "read_notes",
  "read_write",
  "full_access",
]);

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

const paginationSchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .refine((n) => n > 0)
    .default(1),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .refine((n) => n > 0 && n <= 100)
    .default(20),
  sort: z
    .enum(["createdAt", "updatedAt", "name", "status"])
    .default("updatedAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  accountId: uuidSchema.optional(),
  createdBy: uuidSchema.optional(),
});

// Response schemas
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

const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.any().optional(),
});

export default async function projectRoutes(fastify: FastifyInstance) {
  // Get all projects with pagination and filtering
  fastify.get(
    "/projects",
    {
      preHandler: fastify.requireSuperUser(GlobalRole.SUPPORT),
      schema: {
        querystring: paginationSchema,
        response: {
          200: projectsListResponseSchema,
          400: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const queryResult = paginationSchema.safeParse(request.query);
      if (!queryResult.success) {
        return reply.code(400).send({ error: "Invalid query parameters" });
      }
      const { page, limit, sort, order, accountId, createdBy } =
        queryResult.data;

      try {
        const offset = (page - 1) * limit;

        // Build base query
        let baseQuery = db.select().from(projects).$dynamic();
        let countQuery = db
          .select({ count: sql<number>`count(*)` })
          .from(projects)
          .$dynamic();

        // Apply filters
        const conditions = [];
        if (accountId) conditions.push(eq(projects.accountId, accountId));
        if (createdBy) conditions.push(eq(projects.createdBy, createdBy));

        if (conditions.length > 0) {
          const whereClause =
            conditions.length === 1 ? conditions[0] : and(...conditions);
          baseQuery = baseQuery.where(whereClause);
          countQuery = countQuery.where(whereClause);
        }

        // Get total count
        const [{ count }] = await countQuery;
        const totalPages = Math.ceil(count / limit);

        // Get projects with related data
        const orderBy =
          order === "asc" ? asc(projects[sort]) : desc(projects[sort]);
        const projectsList = await db
          .select({
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
          })
          .from(projects)
          .leftJoin(users, eq(projects.createdBy, users.id))
          .leftJoin(accounts, eq(projects.accountId, accounts.id))
          .where(
            conditions.length > 0
              ? conditions.length === 1
                ? conditions[0]
                : and(...conditions)
              : undefined
          )
          .orderBy(orderBy)
          .limit(limit)
          .offset(offset);

        // Get permissions and sessions count for each project
        const projectsWithDetails = await Promise.all(
          projectsList.map(async (project) => {
            // Get project permissions
            const permissions = await db
              .select({
                userId: projectPermissions.userId,
                permissionLevel: projectPermissions.permissionLevel,
                grantedAt: projectPermissions.grantedAt,
                expiresAt: projectPermissions.expiresAt,
                userEmail: users.email,
              })
              .from(projectPermissions)
              .leftJoin(users, eq(projectPermissions.userId, users.id))
              .where(eq(projectPermissions.projectId, project.id));

            // Get sessions count
            const [{ sessionsCount }] = await db
              .select({ sessionsCount: sql<number>`count(*)` })
              .from(sessions)
              .where(eq(sessions.projectId, project.id));

            return {
              ...project,
              permissions,
              sessionsCount: sessionsCount || 0,
            };
          })
        );

        return reply.code(200).send({
          projects: projectsWithDetails,
          pagination: {
            page,
            limit,
            total: count,
            pages: totalPages,
          },
        });
      } catch (error) {
        fastify.log.error({ error }, "Error fetching projects");
        return reply.code(500).send({
          error: "Failed to fetch projects",
        });
      }
    }
  );

  // Get project by ID with details
  fastify.get(
    "/projects/:id",
    {
      preHandler: fastify.requireSuperUser(GlobalRole.SUPPORT),
      schema: {
        params: z.object({ id: uuidSchema }),
        response: {
          200: z.object({ project: projectResponseSchema }),
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      try {
        // Get project with related data
        const project = await db
          .select({
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
          })
          .from(projects)
          .leftJoin(users, eq(projects.createdBy, users.id))
          .leftJoin(accounts, eq(projects.accountId, accounts.id))
          .where(eq(projects.id, id))
          .limit(1);

        if (project.length === 0) {
          return reply.code(404).send({ error: "Project not found" });
        }

        // Get project permissions
        const permissions = await db
          .select({
            userId: projectPermissions.userId,
            permissionLevel: projectPermissions.permissionLevel,
            grantedAt: projectPermissions.grantedAt,
            expiresAt: projectPermissions.expiresAt,
            userEmail: users.email,
          })
          .from(projectPermissions)
          .leftJoin(users, eq(projectPermissions.userId, users.id))
          .where(eq(projectPermissions.projectId, id));

        // Get sessions count
        const [{ sessionsCount }] = await db
          .select({ sessionsCount: sql<number>`count(*)` })
          .from(sessions)
          .where(eq(sessions.projectId, id));

        const projectData = {
          ...project[0],
          permissions,
          sessionsCount: sessionsCount || 0,
        };

        return reply.code(200).send({ project: projectData });
      } catch (error) {
        fastify.log.error({ error }, "Error fetching project");
        return reply.code(500).send({
          error: "Failed to fetch project",
        });
      }
    }
  );

  // Create new project
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
    async (request, reply) => {
      const clerkId = request.headers["x-clerk-user-id"] as string;

      if (!clerkId) {
        return reply.code(401).send({ error: "Authentication required" });
      }

      try {
        const body = createProjectSchema.parse(request.body);

        // Get user ID from clerk ID
        const user = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.clerkId, clerkId))
          .limit(1);

        if (user.length === 0) {
          return reply.code(401).send({ error: "User not found" });
        }

        const newProject = await db.transaction(async (tx) => {
          // Create the project
          const project = await tx
            .insert(projects)
            .values({
              accountId: body.accountId,
              name: body.name,
              description: body.description,
              status: body.status,
              createdBy: user[0].id,
            })
            .returning();

          // Give creator full access
          await tx.insert(projectPermissions).values({
            projectId: project[0].id,
            userId: user[0].id,
            permissionLevel: "full_access",
            grantedBy: user[0].id,
          });

          return project[0];
        });

        // Get the full project data with relationships
        const projectWithDetails = await db
          .select({
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
          })
          .from(projects)
          .leftJoin(users, eq(projects.createdBy, users.id))
          .leftJoin(accounts, eq(projects.accountId, accounts.id))
          .where(eq(projects.id, newProject.id))
          .limit(1);

        return reply.code(201).send({ project: projectWithDetails[0] });
      } catch (error) {
        fastify.log.error({ error }, "Error creating project");
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            error: "Invalid input data",
            details: error.issues,
          });
        }
        return reply.code(500).send({
          error: "Failed to create project",
        });
      }
    }
  );

  // Update project
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
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const clerkId = request.headers["x-clerk-user-id"] as string;

      if (!clerkId) {
        return reply.code(401).send({ error: "Authentication required" });
      }

      try {
        const body = updateProjectSchema.parse(request.body);

        // Get user ID from clerk ID
        const user = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.clerkId, clerkId))
          .limit(1);

        if (user.length === 0) {
          return reply.code(401).send({ error: "User not found" });
        }

        // Check user permission for this project
        const permission = await db
          .select({ permissionLevel: projectPermissions.permissionLevel })
          .from(projectPermissions)
          .where(
            and(
              eq(projectPermissions.projectId, id),
              eq(projectPermissions.userId, user[0].id)
            )
          )
          .limit(1);

        if (
          permission.length === 0 ||
          !["read_write", "full_access"].includes(permission[0].permissionLevel)
        ) {
          return reply.code(403).send({ error: "Insufficient permissions" });
        }

        const updatedProject = await db
          .update(projects)
          .set({
            ...body,
            updatedAt: new Date(),
          })
          .where(eq(projects.id, id))
          .returning();

        if (updatedProject.length === 0) {
          return reply.code(404).send({ error: "Project not found" });
        }

        // Get updated project with relationships
        const projectWithDetails = await db
          .select({
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
          })
          .from(projects)
          .leftJoin(users, eq(projects.createdBy, users.id))
          .leftJoin(accounts, eq(projects.accountId, accounts.id))
          .where(eq(projects.id, id))
          .limit(1);

        return reply.code(200).send({ project: projectWithDetails[0] });
      } catch (error) {
        fastify.log.error({ error }, "Error updating project");
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            error: "Invalid input data",
            details: error.issues,
          });
        }
        return reply.code(500).send({
          error: "Failed to update project",
        });
      }
    }
  );

  // Delete project
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
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const clerkId = request.headers["x-clerk-user-id"] as string;

      if (!clerkId) {
        return reply.code(401).send({ error: "Authentication required" });
      }

      try {
        // Get user ID from clerk ID
        const user = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.clerkId, clerkId))
          .limit(1);

        if (user.length === 0) {
          return reply.code(401).send({ error: "User not found" });
        }

        // Check if user has full access to this project
        const permission = await db
          .select({ permissionLevel: projectPermissions.permissionLevel })
          .from(projectPermissions)
          .where(
            and(
              eq(projectPermissions.projectId, id),
              eq(projectPermissions.userId, user[0].id)
            )
          )
          .limit(1);

        if (
          permission.length === 0 ||
          permission[0].permissionLevel !== "full_access"
        ) {
          return reply.code(403).send({ error: "Insufficient permissions" });
        }

        // Use transaction to ensure atomicity
        await db.transaction(async (tx) => {
          // Delete project permissions first (FK constraint)
          await tx
            .delete(projectPermissions)
            .where(eq(projectPermissions.projectId, id));

          // Delete sessions (FK constraint)
          await tx.delete(sessions).where(eq(sessions.projectId, id));

          // Delete the project
          await tx.delete(projects).where(eq(projects.id, id));
        });

        return reply.code(204).send();
      } catch (error) {
        fastify.log.error({ error }, "Error deleting project");
        return reply.code(500).send({
          error: "Failed to delete project",
        });
      }
    }
  );

  // Add user permission to project
  fastify.post("/projects/:id/permissions", async (request) => {
    const { id } = request.params as { id: string };

    try {
      const body = addPermissionSchema.parse(request.body);
      const clerkId = request.headers["x-clerk-user-id"] as string;

      if (!clerkId) {
        return { success: false, error: "User not authenticated" };
      }

      // Get user ID from clerk ID
      const user = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.clerkId, clerkId))
        .limit(1);

      if (user.length === 0) {
        return { success: false, error: "User not found" };
      }

      // Check if user has permission to grant permissions
      const permission = await db
        .select({ permissionLevel: projectPermissions.permissionLevel })
        .from(projectPermissions)
        .where(
          and(
            eq(projectPermissions.projectId, id),
            eq(projectPermissions.userId, user[0].id)
          )
        )
        .limit(1);

      if (
        permission.length === 0 ||
        permission[0].permissionLevel !== "full_access"
      ) {
        return { success: false, error: "Insufficient permissions" };
      }

      // Add or update permission
      const newPermission = await db
        .insert(projectPermissions)
        .values({
          projectId: id,
          userId: body.userId,
          permissionLevel: body.permissionLevel,
          grantedBy: user[0].id,
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        })
        .onConflictDoUpdate({
          target: [projectPermissions.projectId, projectPermissions.userId],
          set: {
            permissionLevel: body.permissionLevel,
            grantedBy: user[0].id,
            expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
          },
        })
        .returning();

      return { success: true, data: newPermission[0] };
    } catch (error) {
      console.error("Error adding project permission:", error);
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: "Invalid input data",
          details: error.issues,
        };
      }
      return { success: false, error: "Failed to add project permission" };
    }
  });

  // Remove user permission from project
  fastify.delete("/projects/:id/permissions/:userId", async (request) => {
    const { id, userId } = request.params as { id: string; userId: string };

    try {
      const clerkId = request.headers["x-clerk-user-id"] as string;

      if (!clerkId) {
        return { success: false, error: "User not authenticated" };
      }

      // Get user ID from clerk ID
      const user = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.clerkId, clerkId))
        .limit(1);

      if (user.length === 0) {
        return { success: false, error: "User not found" };
      }

      // Check if user has permission to remove permissions
      const permission = await db
        .select({ permissionLevel: projectPermissions.permissionLevel })
        .from(projectPermissions)
        .where(
          and(
            eq(projectPermissions.projectId, id),
            eq(projectPermissions.userId, user[0].id)
          )
        )
        .limit(1);

      if (
        permission.length === 0 ||
        permission[0].permissionLevel !== "full_access"
      ) {
        return { success: false, error: "Insufficient permissions" };
      }

      // Remove permission
      await db
        .delete(projectPermissions)
        .where(
          and(
            eq(projectPermissions.projectId, id),
            eq(projectPermissions.userId, userId)
          )
        );

      return { success: true };
    } catch (error) {
      console.error("Error removing project permission:", error);
      return { success: false, error: "Failed to remove project permission" };
    }
  });

  // Get project sessions
  fastify.get("/projects/:id/sessions", async (request) => {
    const { id } = request.params as { id: string };

    try {
      const projectSessions = await db
        .select({
          id: sessions.id,
          name: sessions.name,
          description: sessions.description,
          sessionType: sessions.sessionType,
          status: sessions.status,
          scheduledStart: sessions.scheduledStart,
          scheduledEnd: sessions.scheduledEnd,
          actualStart: sessions.actualStart,
          actualEnd: sessions.actualEnd,
          createdAt: sessions.createdAt,
          createdBy: sessions.createdBy,
          creatorName: users.email,
        })
        .from(sessions)
        .leftJoin(users, eq(sessions.createdBy, users.id))
        .where(eq(sessions.projectId, id))
        .orderBy(desc(sessions.scheduledStart));

      return { success: true, data: projectSessions };
    } catch (error) {
      console.error("Error fetching project sessions:", error);
      return { success: false, error: "Failed to fetch project sessions" };
    }
  });
}
