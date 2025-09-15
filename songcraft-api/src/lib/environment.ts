// Environment detection and configuration utilities
export const Environment = {
  isLocal: () =>
    process.env.NODE_ENV === "development" &&
    (process.env.DATABASE_URL?.includes("localhost") ||
      process.env.DATABASE_URL?.includes("127.0.0.1")),

  isNeonDev: () =>
    process.env.NODE_ENV === "development" &&
    process.env.DATABASE_URL?.includes("neon.tech"),

  isNeonProd: () =>
    process.env.NODE_ENV === "production" &&
    process.env.DATABASE_URL?.includes("neon.tech"),

  getDatabaseType: () => {
    if (Environment.isLocal()) return "local-postgres";
    if (Environment.isNeonDev()) return "neon-dev";
    if (Environment.isNeonProd()) return "neon-prod";
    return "unknown";
  },

  isClerkEnabled: () => Boolean(process.env.CLERK_SECRET_KEY),

  getConfig: () => ({
    environment: Environment.getDatabaseType(),
    clerkEnabled: Environment.isClerkEnabled(),
    databaseUrl: process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
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
