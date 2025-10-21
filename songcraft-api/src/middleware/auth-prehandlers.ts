import { uuidSchema, z } from "@songcraft/shared";
import type { FastifyRequest } from "fastify";
import { ValidationError } from "../lib/errors";
import { GlobalRole } from "../lib/super-user";
import { requireClerkUser } from "../routes/_utils/auth";

// PreHandler: require an authenticated user; attach to request.user for downstream handlers
export async function requireUser(request: FastifyRequest): Promise<void> {
	const clerkId = requireClerkUser(request); // throws UnauthorizedError -> 401
	// Attach a minimal user context; role is not required for songs endpoints
	(request as any).user = { clerkId, globalRole: GlobalRole.USER };
}

// Zod header schema for docs; optional here so we can preserve a custom error code via preHandler
const accountHeaderSchema = z.object({
	"x-account-id": uuidSchema.optional(),
});

// PreHandler: require and validate x-account-id with a custom error code
export async function requireAccountId(request: FastifyRequest): Promise<void> {
	const parsed = accountHeaderSchema.safeParse(request.headers);
	const accountId = (request.headers["x-account-id"] as string) || undefined;

	// If zod parsing fails or header missing, throw our custom error
	if (!parsed.success || !accountId) {
		throw new ValidationError("Account ID is required", {
			code: "MISSING_ACCOUNT_ID",
		});
	}
}
