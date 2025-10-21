import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { GlobalRole, superUserManager } from "../lib/super-user";
import { getClerkUserId } from "../lib/auth";

// Extend FastifyRequest to include user info
declare module "fastify" {
  interface FastifyRequest {
    user?: {
      clerkId: string;
      globalRole: GlobalRole;
    };
  }
}

/**
 * Middleware to require super user authentication
 */
export function requireSuperUser(minRole: GlobalRole = GlobalRole.ADMIN) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Use proper JWT validation
      const clerkId = await getClerkUserId(request);

      // Check user role
      const userRole = await superUserManager.requireRole(clerkId, minRole);

      // Attach user info to request
      request.user = {
        clerkId,
        globalRole: userRole,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Access denied";
      return reply.status(401).send({
        success: false,
        error: message,
      });
    }
  };
}

/**
 * Middleware to require specific permission
 */
export function requirePermission(permission: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const clerkId = await getClerkUserId(request);

      const hasPermission = await superUserManager.hasPermission(
        clerkId,
        permission
      );
      if (!hasPermission) {
        return reply.status(403).send({
          success: false,
          error: `Permission required: ${permission}`,
        });
      }

      // Get user role for request context
      const userRole = await superUserManager.getUserRole(clerkId);
      request.user = {
        clerkId,
        globalRole: userRole,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Access denied";
      return reply.status(403).send({
        success: false,
        error: message,
      });
    }
  };
}

/**
 * Plugin to register super user middleware
 */
export const superUserPlugin = fp(
  async function superUserPlugin(fastify: FastifyInstance) {
    // Register middleware helpers
    fastify.decorate("requireSuperUser", requireSuperUser);
    fastify.decorate("requirePermission", requirePermission);

    // Bootstrap local super users on startup
    await superUserManager.bootstrapLocalSuperUsers();

    fastify.log.info("🔐 Super user plugin registered with JWT validation");
  },
  { name: "super-user-plugin" }
);

// Type augmentation for Fastify decorators
declare module "fastify" {
  interface FastifyInstance {
    requireSuperUser: typeof requireSuperUser;
    requirePermission: typeof requirePermission;
  }
}
