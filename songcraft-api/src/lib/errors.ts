export type ErrorOptions = {
	statusCode?: number;
	code?: string;
	details?: unknown;
};

export class AppError extends Error {
	public readonly statusCode: number;
	public readonly code?: string;
	public readonly details?: unknown;

	constructor(message: string, options: ErrorOptions = {}) {
		super(message);
		this.name = "AppError";
		this.statusCode = options.statusCode ?? 500;
		this.code = options.code;
		this.details = options.details;
	}
}

export class NotFoundError extends AppError {
	constructor(message = "Resource not found", options: ErrorOptions = {}) {
		super(message, {
			statusCode: 404,
			...options,
			code: options.code ?? "NOT_FOUND",
		});
		this.name = "NotFoundError";
	}
}

export class UnauthorizedError extends AppError {
	constructor(message = "Authentication required", options: ErrorOptions = {}) {
		super(message, {
			statusCode: 401,
			...options,
			code: options.code ?? "UNAUTHORIZED",
		});
		this.name = "UnauthorizedError";
	}
}

export class ForbiddenError extends AppError {
	constructor(
		message = "Insufficient permissions",
		options: ErrorOptions = {},
	) {
		super(message, {
			statusCode: 403,
			...options,
			code: options.code ?? "FORBIDDEN",
		});
		this.name = "ForbiddenError";
	}
}

export class ValidationError extends AppError {
	constructor(message = "Validation failed", options: ErrorOptions = {}) {
		super(message, {
			statusCode: 400,
			...options,
			code: options.code ?? "VALIDATION_ERROR",
		});
		this.name = "ValidationError";
	}
}
