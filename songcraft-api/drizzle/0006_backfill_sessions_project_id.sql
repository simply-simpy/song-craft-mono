-- Backfill sessions.project_id for existing NULLs
-- Strategy: choose the oldest project (by created_at) as a default for orphaned sessions.
-- This is safe for local/dev seeded data and idempotent.

DO $$
DECLARE
  chosen_project_id uuid;
  orphan_count integer;
BEGIN
  SELECT COUNT(*) INTO orphan_count FROM sessions WHERE project_id IS NULL;

  IF orphan_count > 0 THEN
    -- Pick the oldest project
    SELECT id INTO chosen_project_id FROM projects ORDER BY created_at ASC LIMIT 1;

    IF chosen_project_id IS NULL THEN
      RAISE NOTICE 'No projects found to backfill sessions.project_id. Skipping backfill.';
    ELSE
      UPDATE sessions
      SET project_id = chosen_project_id
      WHERE project_id IS NULL;
      RAISE NOTICE 'Backfilled % sessions with project_id=%', orphan_count, chosen_project_id;
    END IF;
  END IF;
END $$;

-- After backfill, enforce NOT NULL if there are no remaining NULLs
DO $$
DECLARE
  has_nulls boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM sessions WHERE project_id IS NULL) INTO has_nulls;
  IF has_nulls IS FALSE THEN
    ALTER TABLE "sessions" ALTER COLUMN "project_id" SET NOT NULL;
  ELSE
    RAISE NOTICE 'sessions.project_id still has NULL values; NOT NULL not enforced.';
  END IF;
END $$;