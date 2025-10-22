import Fastify from "fastify";
import type { FastifyInstance, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { GlobalRole } from "../../lib/super-user";

// Type definitions for better type safety
interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    clerkId: string;
    globalRole: GlobalRole;
  };
}

interface RequestWithContainer<TContainer = unknown> {
  container?: TContainer;
}

type AuthenticatedRequestWithContainer<TContainer = unknown> =
  AuthenticatedRequest & RequestWithContainer<TContainer>;

export type CreateServerOptions<TContainer = unknown> = {
  // The route register function (default export of a routes module)
  register: (fastify: FastifyInstance) => Promise<void> | void;
  // Optional object to assign to request.container for each request
  container?: TContainer;
  // If true, decorates a permissive requireSuperUser that injects request.user
  decorateSuperUser?: boolean;
  // User to inject when decorateSuperUser is enabled
  user?: { clerkId: string; globalRole?: GlobalRole };
};

export function createTestServer<TContainer = unknown>(
  opts: CreateServerOptions<TContainer>
): FastifyInstance {
  const server = Fastify({ logger: false }).withTypeProvider<ZodTypeProvider>();
  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  if (opts.decorateSuperUser) {
    server.decorate(
      "requireSuperUser",
      (minRole?: GlobalRole) => async (request: AuthenticatedRequest) => {
        request.user = {
          clerkId: opts.user?.clerkId ?? "user_123",
          globalRole: opts.user?.globalRole ?? GlobalRole.SUPER_ADMIN,
        };
      }
    );
  }

  if (opts.container) {
    server.addHook("preHandler", async (request) => {
      if (opts.container) {
        (
          request as FastifyRequest & { testContainer: TContainer }
        ).testContainer = opts.container;
      }
    });
  }

  server.register(opts.register);
  return server;
}
