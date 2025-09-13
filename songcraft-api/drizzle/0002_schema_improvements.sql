-- Schema Improvements Migration
-- This migration adds indexes, constraints, and improves data integrity

-- Step 1: Add missing indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS "users_clerk_id_idx" ON "users" USING btree ("clerk_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "songs_owner_clerk_id_idx" ON "songs" USING btree ("owner_clerk_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "songs_updated_at_idx" ON "songs" USING btree ("updated_at" DESC NULLS LAST);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "songs_account_created_desc_idx" ON "songs" USING btree ("account_id","created_at" DESC NULLS LAST);

-- Step 2: Add indexes for existing tables
CREATE INDEX CONCURRENTLY IF NOT EXISTS "accounts_org_idx" ON "accounts" USING btree ("org_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "memberships_account_idx" ON "memberships" USING btree ("account_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "memberships_user_idx" ON "memberships" USING btree ("user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "memberships_user_role_idx" ON "memberships" USING btree ("user_id","role");

-- Step 3: Add lyric_versions improvements
-- First add the column as nullable, then update it, then make it NOT NULL
ALTER TABLE "lyric_versions" ADD COLUMN IF NOT EXISTS "account_id" uuid;

-- Update lyric_versions to inherit account_id from their songs (this should already be handled by the trigger)
UPDATE "lyric_versions" 
SET "account_id" = (
  SELECT s."account_id" 
  FROM "songs" s 
  WHERE s."id" = "lyric_versions"."song_id"
) 
WHERE "account_id" IS NULL;

-- Now make it NOT NULL and add indexes
ALTER TABLE "lyric_versions" ALTER COLUMN "account_id" SET NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS "lyric_versions_account_idx" ON "lyric_versions" USING btree ("account_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "lyric_versions_song_created_idx" ON "lyric_versions" USING btree ("song_id","created_at" DESC NULLS LAST);

-- Step 4: Handle email requirement more carefully
-- Update any NULL emails with a placeholder (you may want to handle this differently)
UPDATE "users" SET "email" = 'placeholder@example.com' WHERE "email" IS NULL;
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;

-- Step 5: Ensure account_id is NOT NULL in songs (it should already be populated)
-- First check if there are any NULL values and handle them
UPDATE "songs" SET "account_id" = (
  SELECT a."id" FROM "accounts" a 
  JOIN "orgs" o ON o."id" = a."org_id" 
  LIMIT 1
) WHERE "account_id" IS NULL;

ALTER TABLE "songs" ALTER COLUMN "account_id" SET NOT NULL;

-- Step 6: Add data validation constraints
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'accounts_plan_check') THEN
        ALTER TABLE "accounts" ADD CONSTRAINT "accounts_plan_check" 
          CHECK (plan IN ('Free', 'Pro', 'Team', 'Enterprise'));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'accounts_status_check') THEN
        ALTER TABLE "accounts" ADD CONSTRAINT "accounts_status_check" 
          CHECK (status IN ('active', 'suspended', 'cancelled'));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'memberships_role_check') THEN
        ALTER TABLE "memberships" ADD CONSTRAINT "memberships_role_check" 
          CHECK (role IN ('owner', 'admin', 'member', 'viewer'));
    END IF;
END $$;

-- Step 7: Add partial index for active accounts
CREATE INDEX CONCURRENTLY IF NOT EXISTS "accounts_active_idx" ON "accounts" USING btree ("org_id") WHERE status = 'active';

-- Step 8: Add unique constraint for users.clerk_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_clerk_id_unique') THEN
        ALTER TABLE "users" ADD CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id");
    END IF;
END $$;

-- Step 9: Add foreign key constraint for lyric_versions.account_id
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lyric_versions_account_fk') THEN
        ALTER TABLE "lyric_versions" ADD CONSTRAINT "lyric_versions_account_fk" 
          FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT;
    END IF;
END $$;
