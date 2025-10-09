import { verifyToken } from "@clerk/backend";
import type { FastifyRequest } from "fastify";

import { env } from "../config/env";
import { UnauthorizedError } from "../lib/errors";

/**
 * Validates Clerk JWT token and extracts user information
 */
export async function validateClerkToken(request: FastifyRequest): Promise<{
  userId: string;
  sessionId: string;
}> {
  // Extract token from Authorization header
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing or invalid authorization header");
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  try {
    // Verify the JWT token using the backend helper
    const { payload } = await verifyToken(token, {
      // Prefer the secret key from env; verifyToken can also auto-read process.env
      secretKey: env.CLERK_SECRET_KEY,
    });

    // Extract user ID and session ID from verified payload
    const claims = payload as { sub?: string; sid?: string };
    const userId = claims.sub;
    const sessionId = claims.sid;

    if (!userId) {
      throw new UnauthorizedError("Invalid token: missing user ID");
    }

    if (!sessionId) {
      throw new UnauthorizedError("Invalid token: missing session ID");
    }

    return { userId, sessionId };
  } catch (error) {
    // Log the error for debugging (but don't expose details to client)
    // Note: In production, this should use structured logging
    console.error("JWT validation failed:", error);

    if (error instanceof Error) {
      // Check for specific Clerk errors
      if (error.message.includes("expired")) {
        throw new UnauthorizedError("Token has expired");
      }
      if (error.message.includes("invalid")) {
        throw new UnauthorizedError("Invalid token");
      }
    }

    throw new UnauthorizedError("Authentication failed");
  }
}

/**
 * Development fallback for when Clerk secret key is not available
 * This should only be used in development environments
 */
export function extractClerkIdFromHeaders(
  request: FastifyRequest
): string | null {
  // Only allow header-based auth in development
  if (env.NODE_ENV === "production") {
    return null;
  }

  const headerId = request.headers["x-clerk-user-id"] as string;
  if (headerId && headerId.trim().length > 0) {
    return headerId.trim();
  }

  return null;
}

/**
 * Gets Clerk user ID from request with proper validation
 * Uses JWT validation in production, header fallback in development
 */
export async function getClerkUserId(request: FastifyRequest): Promise<string> {
  // Try JWT validation first (production)
  if (env.CLERK_SECRET_KEY) {
    try {
      const { userId } = await validateClerkToken(request);
      return userId;
    } catch (error) {
      // If JWT validation fails and we're in development, try header fallback
      if (env.NODE_ENV === "development") {
        const headerId = extractClerkIdFromHeaders(request);
        if (headerId) {
          console.warn(
            "⚠️  Using header-based auth in development. JWT validation failed:",
            error
          );
          return headerId;
        }
      }
      throw error;
    }
  }

  // Fallback to header-based auth in development
  const headerId = extractClerkIdFromHeaders(request);
  if (!headerId) {
    throw new UnauthorizedError("Authentication required");
  }

  return headerId;
}

/**
 * Validates that a user has access to a specific account
 */
export async function validateAccountAccess(
  userId: string,
  accountId: string,
  userRepository: {
    findByClerkId: (id: string) => Promise<{ accountIds: string[] } | null>;
  }
): Promise<boolean> {
  try {
    const user = await userRepository.findByClerkId(userId);
    if (!user) {
      return false;
    }

    // Check if user has access to the requested account
    return user.accountIds.includes(accountId);
  } catch (error) {
    // Note: In production, this should use structured logging
    console.error("Account access validation failed:", error);
    return false;
  }
}
