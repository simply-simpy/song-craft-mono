import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import rateLimit from "@fastify/rate-limit";

/**
 * Rate limiting plugin with different limits for different endpoint types
 */
async function rateLimitPlugin(fastify: FastifyInstance) {
  // Register the rate limit plugin
  await fastify.register(rateLimit, {
    // Global rate limit: 1000 requests per 15 minutes per IP
    max: 1000,
    timeWindow: "15 minutes",
    errorResponseBuilder: (request, context) => ({
      success: false,
      error: "Rate limit exceeded",
      code: "RATE_LIMIT_EXCEEDED",
      retryAfter: Math.round(context.ttl / 1000),
    }),
  });

  // Stricter limits for authentication endpoints
  await fastify.register(
    rateLimit,
    {
      max: 10, // 10 attempts per 15 minutes
      timeWindow: "15 minutes",
      skipOnError: true,
      errorResponseBuilder: (request, context) => ({
        success: false,
        error: "Too many authentication attempts",
        code: "AUTH_RATE_LIMIT_EXCEEDED",
        retryAfter: Math.round(context.ttl / 1000),
      }),
    },
    { prefix: "/auth" }
  );

  // Moderate limits for API endpoints
  await fastify.register(
    rateLimit,
    {
      max: 100, // 100 requests per 15 minutes
      timeWindow: "15 minutes",
      skipOnError: true,
      errorResponseBuilder: (request, context) => ({
        success: false,
        error: "API rate limit exceeded",
        code: "API_RATE_LIMIT_EXCEEDED",
        retryAfter: Math.round(context.ttl / 1000),
      }),
    },
    { prefix: "/api" }
  );

  // Very strict limits for admin endpoints
  await fastify.register(
    rateLimit,
    {
      max: 50, // 50 requests per 15 minutes
      timeWindow: "15 minutes",
      skipOnError: true,
      errorResponseBuilder: (request, context) => ({
        success: false,
        error: "Admin rate limit exceeded",
        code: "ADMIN_RATE_LIMIT_EXCEEDED",
        retryAfter: Math.round(context.ttl / 1000),
      }),
    },
    { prefix: "/admin" }
  );

  fastify.log.info("🛡️ Rate limiting plugin registered");
}

export default fp(rateLimitPlugin, {
  name: "rate-limit",
});
