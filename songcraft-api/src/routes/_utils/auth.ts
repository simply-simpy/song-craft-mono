import type { FastifyRequest } from "fastify";

import { UnauthorizedError } from "../../lib/errors";

const normalizeString = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return null;
};

export const getClerkUserId = (request: FastifyRequest): string | null => {
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

export const requireClerkUser = (request: FastifyRequest): string => {
  const clerkId = getClerkUserId(request);
  if (!clerkId) {
    throw new UnauthorizedError();
  }
  return clerkId;
};
