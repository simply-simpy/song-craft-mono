// load env before reading DATABASE_URL
import { config } from 'dotenv';
config({ path: '.env.local' }); // or '.env'

import type { Config } from 'drizzle-kit';

export default {
  schema: './src/server/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
} satisfies Config;
