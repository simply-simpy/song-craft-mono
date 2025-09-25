import { eq } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../db";
import { users } from "../schema";

/**
 * Middleware to ensure Clerk user exists in local database
 */
// TODO check if _reply is used
export async function syncClerkUser(
  request: FastifyRequest,
  _reply: FastifyReply
) {
  // Skip if no auth header
  const clerkId = request.headers["x-clerk-user-id"] as string;
  if (!clerkId) {
    return; // Let other auth middleware handle this
  }

  try {
    // Check if user exists in database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (existingUser.length === 0) {
      // User doesn't exist, create them
      console.log(`🔄 Creating user record for Clerk ID: ${clerkId}`);

      // For now, we'll create with minimal info
      // In production, you'd get email from Clerk API
      await db.insert(users).values({
        clerkId,
        email: `${clerkId}@temp.com`, // Placeholder - should get from Clerk
        globalRole: "user", // Default role
      });

      console.log(`✅ Created user record for: ${clerkId}`);
    }
  } catch (error) {
    console.error("Failed to sync Clerk user:", error);
    // Don't fail the request, just log the error
  }
}

/**
 * Enhanced version that fetches user data from Clerk
 */
export async function syncClerkUserWithDetails(clerkId: string) {
  try {
    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (existingUser.length === 0) {
      // Get user details from Clerk
      const { createClerkClient } = await import("@clerk/backend");
      const secretKey = process.env.CLERK_SECRET_KEY;
      if (!secretKey) {
        throw new Error("CLERK_SECRET_KEY environment variable is required");
      }
      const clerkClient = createClerkClient({ secretKey });
      const clerkUser = await clerkClient.users.getUser(clerkId);

      // Create user with real data
      await db.insert(users).values({
        clerkId,
        email:
          clerkUser.primaryEmailAddress?.emailAddress ||
          `${clerkId}@unknown.com`,
        globalRole: "user",
      });

      console.log(
        `✅ Created user: ${clerkUser.primaryEmailAddress?.emailAddress}`
      );
    }
  } catch (error) {
    console.error("Failed to sync user with Clerk details:", error);
    throw error;
  }
}
