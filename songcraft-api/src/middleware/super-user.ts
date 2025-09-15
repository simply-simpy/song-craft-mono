import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { superUserManager, GlobalRole } from "../lib/super-user";

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
export async function requireSuperUser(minRole: GlobalRole = GlobalRole.ADMIN) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // For now, we'll use a simple approach since Clerk auth is disabled in development
      // In production, this would extract the user ID from the Clerk JWT

      const clerkId = extractClerkIdFromRequest(request);
      if (!clerkId) {
        return reply.status(401).send({
          success: false,
          error: "Authentication required",
        });
      }

      // Check user role
      const userRole = await superUserManager.requireRole(clerkId, minRole);

      // Attach user info to request
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
 * Middleware to require specific permission
 */
export async function requirePermission(permission: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const clerkId = extractClerkIdFromRequest(request);
      if (!clerkId) {
        return reply.status(401).send({
          success: false,
          error: "Authentication required",
        });
      }

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
 * Extract Clerk ID from request
 * This is a simplified version - in production you'd validate the JWT
 */
function extractClerkIdFromRequest(request: FastifyRequest): string | null {
  // For local development, we can use a header or query param
  const clerkId =
    (request.headers["x-clerk-user-id"] as string) ||
    (request.query?.clerk_id as string);

  if (clerkId) {
    return clerkId;
  }

  // In production, you would:
  // 1. Extract JWT from Authorization header
  // 2. Verify JWT with Clerk
  // 3. Extract user ID from validated claims

  // For now, return null to trigger auth error
  return null;
}

/**
 * Plugin to register super user middleware
 */
export async function superUserPlugin(fastify: FastifyInstance) {
  // Register middleware helpers
  fastify.decorate("requireSuperUser", requireSuperUser);
  fastify.decorate("requirePermission", requirePermission);

  // Bootstrap local super users on startup
  await superUserManager.bootstrapLocalSuperUsers();

  console.log("🔐 Super user plugin registered");
}

// Type augmentation for Fastify decorators
declare module "fastify" {
  interface FastifyInstance {
    requireSuperUser: typeof requireSuperUser;
    requirePermission: typeof requirePermission;
  }
}
