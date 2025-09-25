-- Rollback Schema Improvements Migration
-- This script undoes the changes from 0002_schema_improvements.sql

-- Step 1: Remove foreign key constraint
ALTER TABLE "lyric_versions" DROP CONSTRAINT IF EXISTS "lyric_versions_account_fk";

-- Step 2: Remove unique constraint
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_clerk_id_unique";

-- Step 3: Remove check constraints
ALTER TABLE "accounts" DROP CONSTRAINT IF EXISTS "accounts_plan_check";
ALTER TABLE "accounts" DROP CONSTRAINT IF EXISTS "accounts_status_check";
ALTER TABLE "memberships" DROP CONSTRAINT IF EXISTS "memberships_role_check";

-- Step 4: Remove indexes
DROP INDEX CONCURRENTLY IF EXISTS "users_clerk_id_idx";
DROP INDEX CONCURRENTLY IF EXISTS "songs_owner_clerk_id_idx";
DROP INDEX CONCURRENTLY IF EXISTS "songs_updated_at_idx";
DROP INDEX CONCURRENTLY IF EXISTS "songs_account_created_desc_idx";
DROP INDEX CONCURRENTLY IF EXISTS "accounts_org_idx";
DROP INDEX CONCURRENTLY IF EXISTS "accounts_active_idx";
DROP INDEX CONCURRENTLY IF EXISTS "memberships_account_idx";
DROP INDEX CONCURRENTLY IF EXISTS "memberships_user_idx";
DROP INDEX CONCURRENTLY IF EXISTS "memberships_user_role_idx";
DROP INDEX CONCURRENTLY IF EXISTS "lyric_versions_account_idx";
DROP INDEX CONCURRENTLY IF EXISTS "lyric_versions_song_created_idx";

-- Step 5: Make columns nullable again (if needed)
-- Note: Be careful with this - you may lose data integrity
-- ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;
-- ALTER TABLE "songs" ALTER COLUMN "account_id" DROP NOT NULL;
-- ALTER TABLE "lyric_versions" DROP COLUMN "account_id";

-- Uncomment the above lines only if you really need to rollback the column changes
-- WARNING: This may cause application errors if your code expects these fields to exist
