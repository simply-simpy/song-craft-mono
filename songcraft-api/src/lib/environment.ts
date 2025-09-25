import { env } from "../config/env";

// Internal helpers to classify database host
const isLocalDatabase = (connectionString: string) =>
	connectionString.includes("localhost") ||
	connectionString.includes("127.0.0.1");

const isNeonDatabase = (connectionString: string) =>
	connectionString.includes("neon.tech");

// Environment detection and configuration utilities
export const Environment = {
	isLocal: () =>
		env.NODE_ENV === "development" && isLocalDatabase(env.DATABASE_URL),

	isNeonDev: () =>
		env.NODE_ENV === "development" && isNeonDatabase(env.DATABASE_URL),

	isNeonProd: () =>
		env.NODE_ENV === "production" && isNeonDatabase(env.DATABASE_URL),

	getDatabaseType: () => {
		if (Environment.isLocal()) return "local-postgres";
		if (Environment.isNeonDev()) return "neon-dev";
		if (Environment.isNeonProd()) return "neon-prod";
		return "unknown";
	},

	isClerkEnabled: () => Boolean(env.CLERK_SECRET_KEY),

	getConfig: () => ({
		environment: Environment.getDatabaseType(),
		clerkEnabled: Environment.isClerkEnabled(),
		databaseUrl: env.DATABASE_URL,
		nodeEnv: env.NODE_ENV,
	}),
} as const;

// Environment-specific configuration
export const EnvironmentConfig = {
	"local-postgres": {
		requiresClerk: false,
		allowDirectDbRoleChanges: true,
		enableRichLogging: true,
		autoSeedSuperUsers: true,
	},
	"neon-dev": {
		requiresClerk: true,
		allowDirectDbRoleChanges: false,
		enableRichLogging: true,
		autoSeedSuperUsers: false,
	},
	"neon-prod": {
		requiresClerk: true,
		allowDirectDbRoleChanges: false,
		enableRichLogging: false,
		autoSeedSuperUsers: false,
	},
} as const;
