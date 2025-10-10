import type { FastifyInstance, FastifyRequest, RouteOptions } from "fastify";
import fp from "fastify-plugin";
import rateLimit from "@fastify/rate-limit";

type Context = {
  ttl: number;
};
type Request = FastifyRequest;
/**
 * Rate limiting plugin with sensible defaults and per-route grouping.
 *
 * Implementation notes:
 * - Register @fastify/rate-limit once with global: false so nothing is limited by default.
 * - Use onRoute to attach route-level rateLimit configs by URL prefix.
 * - Exclude pure OPTIONS (CORS preflight) and /health from rate limiting.
 */
async function rateLimitPlugin(fastify: FastifyInstance) {
  // Register the rate limit plugin (do not enable globally)
  await fastify.register(rateLimit, {
    global: false,
    skipOnError: true,
    continueExceeding: false,
    addHeaders: {
      // keep defaults but ensure Retry-After is exposed
      "x-ratelimit-limit": true,
      "x-ratelimit-remaining": true,
      "x-ratelimit-reset": true,
      "retry-after": true,
    },
  });

  const AUTH_LIMIT = { max: 10, timeWindow: "15 minutes" as const };
  const API_LIMIT = { max: 100, timeWindow: "15 minutes" as const };
  const ADMIN_LIMIT = { max: 50, timeWindow: "15 minutes" as const };

  function buildError(msg: string) {
    const fn = (request: Request, context: Context) => ({
      success: false,
      error: msg,
      code: msg.toUpperCase().replace(/[^A-Z0-9]+/g, "_") as
        | "AUTH_RATE_LIMIT_EXCEEDED"
        | "API_RATE_LIMIT_EXCEEDED"
        | "ADMIN_RATE_LIMIT_EXCEEDED"
        | "RATE_LIMIT_EXCEEDED",
      retryAfter: Math.round(context.ttl / 1000),
    });
    return fn;
  }

  // Attach group defaults to routes as they are registered
  fastify.addHook("onRoute", (routeOptions: RouteOptions) => {
    // Ensure we don't rate-limit CORS preflight handlers
    const methods = Array.isArray(routeOptions.method)
      ? routeOptions.method
      : [routeOptions.method];
    if (methods.length === 1 && methods[0] === "OPTIONS") {
      routeOptions.config = {
        ...(routeOptions.config || {}),
        rateLimit: false,
      };
      return;
    }

    const url = routeOptions.url || "";

    // Skip health and documentation endpoints
    if (url.startsWith("/health") || url.startsWith("/documentation")) {
      routeOptions.config = {
        ...(routeOptions.config || {}),
        rateLimit: false,
      };
      return;
    }

    // Decide the bucket by URL prefix
    if (url.startsWith("/auth")) {
      routeOptions.config = {
        ...(routeOptions.config || {}),
        rateLimit: {
          ...AUTH_LIMIT,
          errorResponseBuilder: buildError("Too many authentication attempts"),
        },
      };
      return;
    }

    if (url.startsWith("/admin")) {
      routeOptions.config = {
        ...(routeOptions.config || {}),
        rateLimit: {
          ...ADMIN_LIMIT,
          errorResponseBuilder: buildError("Admin rate limit exceeded"),
        },
      };
      return;
    }

    // Default API limit for everything else
    routeOptions.config = {
      ...(routeOptions.config || {}),
      rateLimit: {
        ...API_LIMIT,
        errorResponseBuilder: buildError("API rate limit exceeded"),
      },
    };
  });

  fastify.log.info("🛡️ Rate limiting plugin registered (per-route)");
}

export default fp(rateLimitPlugin, {
  name: "rate-limit",
});
