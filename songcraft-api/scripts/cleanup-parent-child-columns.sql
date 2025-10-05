-- Cleanup Script: Remove Parent-Child Columns
-- This script removes the old parent-child foreign key columns after migration

-- ============================================================================
-- PHASE 1: Remove foreign key constraints first
-- ============================================================================

-- Remove foreign key constraints from songs table
ALTER TABLE songs DROP CONSTRAINT IF EXISTS songs_account_fk;
ALTER TABLE songs DROP CONSTRAINT IF EXISTS songs_project_fk;

-- Remove foreign key constraints from projects table  
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_account_fk;

-- Remove foreign key constraints from sessions table
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_project_fk;

-- Remove foreign key constraints from lyric_versions table
ALTER TABLE lyric_versions DROP CONSTRAINT IF EXISTS lyric_versions_account_fk;

-- ============================================================================
-- PHASE 2: Remove indexes that reference the columns we're dropping
-- ============================================================================

-- Remove indexes from songs table
DROP INDEX IF EXISTS songs_account_created_desc_idx;
DROP INDEX IF EXISTS songs_project_id_idx;

-- Remove indexes from projects table
DROP INDEX IF EXISTS projects_account_id_idx;

-- Remove indexes from sessions table
DROP INDEX IF EXISTS sessions_project_id_idx;

-- Remove indexes from lyric_versions table
DROP INDEX IF EXISTS lyric_versions_account_idx;

-- ============================================================================
-- PHASE 3: Remove the columns
-- ============================================================================

-- Remove columns from songs table
ALTER TABLE songs DROP COLUMN IF EXISTS account_id;
ALTER TABLE songs DROP COLUMN IF EXISTS project_id;

-- Remove columns from projects table
ALTER TABLE projects DROP COLUMN IF EXISTS account_id;

-- Remove columns from sessions table
ALTER TABLE sessions DROP COLUMN IF EXISTS project_id;

-- Remove columns from lyric_versions table
ALTER TABLE lyric_versions DROP COLUMN IF EXISTS account_id;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify columns were removed
SELECT 
    'songs' as table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'songs' 
  AND column_name IN ('account_id', 'project_id');

SELECT 
    'projects' as table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'projects' 
  AND column_name IN ('account_id');

SELECT 
    'sessions' as table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'sessions' 
  AND column_name IN ('project_id');

SELECT 
    'lyric_versions' as table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'lyric_versions' 
  AND column_name IN ('account_id');

-- Verify association tables still have data
SELECT 
    'song_account_links' as table_name,
    COUNT(*) as total_records
FROM song_account_links;

SELECT 
    'song_project_associations' as table_name,
    COUNT(*) as total_records
FROM song_project_associations;

SELECT 
    'project_account_associations' as table_name,
    COUNT(*) as total_records
FROM project_account_associations;

SELECT 
    'session_song_associations' as table_name,
    COUNT(*) as total_records
FROM session_song_associations;
