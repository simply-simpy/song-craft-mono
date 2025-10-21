import { ZodError } from "@songcraft/shared";
import type { FastifyReply, FastifyRequest } from "fastify";

import { AppError } from "../../lib/errors";

// Define proper types for Postgres errors
interface ErrorWithCodeAndMessage {
	code?: string | undefined;
	message?: string | undefined;
}

// Type guard for errors with code and message properties
const isErrorWithCodeAndMessage = (
	error: unknown,
): error is ErrorWithCodeAndMessage => {
	return (
		typeof error === "object" &&
		error !== null &&
		("code" in error || "message" in error)
	);
};

const toErrorStatus = (error: unknown) => {
	if (error instanceof AppError) {
		return {
			statusCode: error.statusCode,
			payload: {
				error: error.message,
				code: error.code,
				details: error.details,
			},
		} as const;
	}

	if (error instanceof ZodError) {
		return {
			statusCode: 400,
			payload: {
				error: "Validation failed",
				code: "VALIDATION_ERROR",
				details: error.flatten(),
			},
		} as const;
	}

	// Map common Postgres / RLS errors to nicer API errors using type guard
	let pgCode: string | undefined;
	let msg = "";

	if (isErrorWithCodeAndMessage(error)) {
		pgCode = error.code;
		msg = error.message?.toLowerCase() || "";
	}

	// app_current_account_id() raised because tenant context not set
	if (pgCode === "28000" || msg.includes("app.account_id is not set")) {
		return {
			statusCode: 400,
			payload: {
				error: "Tenant context missing. Include x-account-id header.",
				code: "TENANT_CONTEXT_MISSING",
			},
		} as const;
	}

	// Invalid UUID for account id
	if (
		msg.includes("invalid input syntax for type uuid") &&
		msg.includes("app.account_id")
	) {
		return {
			statusCode: 400,
			payload: {
				error: "Invalid account ID (must be a UUID).",
				code: "INVALID_ACCOUNT_ID",
			},
		} as const;
	}

	return {
		statusCode: 500,
		payload: {
			error: "Internal server error",
			code: "INTERNAL_SERVER_ERROR",
		},
	} as const;
};

const handleError = (
	request: FastifyRequest,
	reply: FastifyReply,
	error: unknown,
) => {
	const { statusCode, payload } = toErrorStatus(error);
	const routeInfo =
		(request as FastifyRequest & { routerPath?: string }).routerPath ??
		request.routeOptions?.url ??
		request.url;

	request.log.error({ err: error, route: routeInfo }, "Route handler failed");

	return reply.status(statusCode).send(payload);
};

export const withErrorHandling = <
	Request extends FastifyRequest = FastifyRequest,
	Reply extends FastifyReply = FastifyReply,
>(
	handler: (request: Request, reply: Reply) => Promise<unknown>,
) => {
	return async (request: Request, reply: Reply) => {
		try {
			return await handler(request, reply);
		} catch (error) {
			return handleError(request, reply, error);
		}
	};
};
