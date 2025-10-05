-- Add missing project_id column to sessions table if it does not exist
ALTER TABLE "sessions"
  ADD COLUMN IF NOT EXISTS "project_id" uuid;

-- Add FK constraint if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'sessions'
      AND c.conname = 'sessions_project_id_projects_id_fk'
  ) THEN
    ALTER TABLE "sessions"
      ADD CONSTRAINT "sessions_project_id_projects_id_fk"
      FOREIGN KEY ("project_id")
      REFERENCES "public"."projects"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION;
  END IF;
END $$;

-- Create index on project_id for performance if missing
CREATE INDEX IF NOT EXISTS "sessions_project_id_idx"
  ON "sessions" USING btree ("project_id");

-- If there are no NULLs, enforce NOT NULL to match application schema
DO $$
DECLARE
  has_nulls boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM "sessions" WHERE "project_id" IS NULL) INTO has_nulls;
  IF has_nulls IS FALSE THEN
    ALTER TABLE "sessions" ALTER COLUMN "project_id" SET NOT NULL;
  ELSE
    RAISE NOTICE 'sessions.project_id has NULL rows; left as nullable. Backfill before enforcing NOT NULL.';
  END IF;
END $$;