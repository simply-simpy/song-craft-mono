#!/usr/bin/env ts-node

/**
 * Bootstrap Super User Script
 *
 * Usage:
 *   npm run bootstrap-superuser -- admin@company.com
 *   DATABASE_URL="..." npx ts-node scripts/bootstrap-superuser.ts admin@company.com
 */

import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users } from "../src/schema";
import { eq } from "drizzle-orm";
import { Environment } from "../src/lib/environment";
import { GlobalRole } from "../src/lib/super-user";

// Load environment variables
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function bootstrapSuperUser(email: string) {
  const environment = Environment.getDatabaseType();

  console.log(`🚀 Bootstrapping super user for ${environment}`);
  console.log(`📧 Email: ${email}`);

  try {
    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length === 0) {
      console.log("❌ User not found. Please ensure the user exists first.");
      console.log("   You can create a user by signing up through the app.");
      process.exit(1);
    }

    const user = existingUser[0];
    console.log(`👤 Found user: ${user.email} (${user.clerkId})`);

    if (user.globalRole === GlobalRole.SUPER_ADMIN) {
      console.log("✅ User is already a super admin!");
      process.exit(0);
    }

    // Promote to super admin
    await db
      .update(users)
      .set({ globalRole: GlobalRole.SUPER_ADMIN })
      .where(eq(users.id, user.id));

    console.log(`✅ Successfully promoted ${email} to super admin!`);
    console.log(`   Previous role: ${user.globalRole}`);
    console.log(`   New role: ${GlobalRole.SUPER_ADMIN}`);

    // If we're in a Neon environment, also update Clerk
    if (environment !== "local-postgres" && Environment.isClerkEnabled()) {
      try {
        const { clerkClient } = await import("@clerk/backend");
        await clerkClient.users.updateUserMetadata(user.clerkId, {
          privateMetadata: {
            globalRole: GlobalRole.SUPER_ADMIN,
            promotedAt: new Date().toISOString(),
            promotedBy: "bootstrap-script",
          },
        });
        console.log("✅ Also updated Clerk metadata");
      } catch (error) {
        console.warn("⚠️  Failed to update Clerk metadata:", error);
        console.log(
          "   Database has been updated, but you may need to sync Clerk manually"
        );
      }
    }
  } catch (error) {
    console.error("❌ Error bootstrapping super user:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log("❌ Please provide an email address");
  console.log("Usage: npm run bootstrap-superuser -- admin@company.com");
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.log("❌ Please provide a valid email address");
  process.exit(1);
}

// Run the bootstrap
bootstrapSuperUser(email).catch(console.error);
