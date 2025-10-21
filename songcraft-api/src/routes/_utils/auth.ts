import type { FastifyRequest } from "fastify";

import { getClerkUserId } from "../../lib/auth";
import { UnauthorizedError } from "../../lib/errors";

const normalizeString = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return null;
};

/**
 * @deprecated Use getClerkUserId from lib/auth.ts instead
 * This function is kept for backward compatibility but should not be used for new code
 */
export const getClerkUserIdLegacy = (
  request: FastifyRequest
): string | null => {
  const headerId = normalizeString(request.headers["x-clerk-user-id"]);
  if (headerId) {
    return headerId;
  }

  const query = request.query as Record<string, unknown> | undefined;
  const queryId = normalizeString(query?.clerk_id);
  if (queryId) {
    return queryId;
  }

  return null;
};

/**
 * @deprecated Use getClerkUserId from lib/auth.ts instead
 * This function is kept for backward compatibility but should not be used for new code
 */
export const requireClerkUser = (request: FastifyRequest): string => {
  const clerkId = getClerkUserIdLegacy(request);
  if (!clerkId) {
    throw new UnauthorizedError();
  }
  return clerkId;
};

/**
 * Modern auth function that validates JWT tokens
 * Use this for new code instead of requireClerkUser
 */
export const requireAuthenticatedUser = async (
  request: FastifyRequest
): Promise<string> => {
  return await getClerkUserId(request);
};
