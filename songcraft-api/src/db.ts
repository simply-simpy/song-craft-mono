import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { env } from "./config/env";

// Database connection
const pool = new Pool({
	connectionString: env.DATABASE_URL,
	ssl: env.DATABASE_SSL
		? { rejectUnauthorized: env.DATABASE_SSL_REJECT_UNAUTHORIZED }
		: false,
});

export const db = drizzle(pool);
