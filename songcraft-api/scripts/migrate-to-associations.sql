-- Data Migration Script: Parent-Child to Association Model
-- This script migrates existing parent-child relationships to association tables

-- ============================================================================
-- PHASE 1: Migrate existing song-account relationships to song_account_links
-- ============================================================================

-- Insert existing song-account relationships into song_account_links
INSERT INTO song_account_links (song_id, account_id, association_type, created_at, updated_at)
SELECT 
    s.id as song_id,
    s.account_id,
    'primary' as association_type,
    s.created_at,
    s.updated_at
FROM songs s
WHERE s.account_id IS NOT NULL
ON CONFLICT (song_id, account_id) DO NOTHING;

-- ============================================================================
-- PHASE 2: Migrate existing song-project relationships to song_project_associations
-- ============================================================================

-- Insert existing song-project relationships into song_project_associations
INSERT INTO song_project_associations (song_id, project_id, association_type, created_at, updated_at)
SELECT 
    s.id as song_id,
    s.project_id,
    'primary' as association_type,
    s.created_at,
    s.updated_at
FROM songs s
WHERE s.project_id IS NOT NULL
ON CONFLICT (song_id, project_id) DO NOTHING;

-- ============================================================================
-- PHASE 3: Migrate existing project-account relationships to project_account_associations
-- ============================================================================

-- Insert existing project-account relationships into project_account_associations
INSERT INTO project_account_associations (project_id, account_id, association_type, created_at, updated_at)
SELECT 
    p.id as project_id,
    p.account_id,
    'primary' as association_type,
    p.created_at,
    p.updated_at
FROM projects p
WHERE p.account_id IS NOT NULL
ON CONFLICT (project_id, account_id) DO NOTHING;

-- ============================================================================
-- PHASE 4: Migrate existing session-project relationships to session_song_associations
-- ============================================================================

-- Note: Sessions don't directly reference songs, so we'll need to create associations
-- based on the project relationship. This is a more complex migration that might
-- require manual review.

-- For now, we'll create a placeholder association for sessions that belong to projects
-- that have songs. This is a simplified approach - in practice, you might want to
-- create more specific associations.

INSERT INTO session_song_associations (session_id, song_id, association_type, created_at, updated_at)
SELECT DISTINCT
    s.id as session_id,
    sp.song_id,
    'reference' as association_type,
    s.created_at,
    s.updated_at
FROM sessions s
JOIN projects p ON s.project_id = p.id
JOIN song_project_associations sp ON p.id = sp.project_id
WHERE s.project_id IS NOT NULL
ON CONFLICT (session_id, song_id) DO NOTHING;

-- ============================================================================
-- PHASE 5: Migrate lyric_versions account relationships
-- ============================================================================

-- Note: lyric_versions also have account_id that needs to be migrated
-- We'll create associations between lyric_versions and accounts through songs

INSERT INTO song_account_links (song_id, account_id, association_type, created_at, updated_at)
SELECT DISTINCT
    lv.song_id,
    lv.account_id,
    'context' as association_type,
    lv.created_at,
    lv.updated_at
FROM lyric_versions lv
WHERE lv.account_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM song_account_links sal 
    WHERE sal.song_id = lv.song_id 
    AND sal.account_id = lv.account_id
  );

-- ============================================================================
-- PHASE 6: Create default settings for existing entities
-- ============================================================================

-- Create default org settings for existing orgs
INSERT INTO org_settings (org_id, setting_key, setting_value, created_at, updated_at)
SELECT 
    o.id as org_id,
    'default_theme',
    '"light"'::jsonb,
    o.created_at,
    o.created_at
FROM orgs o
ON CONFLICT (org_id, setting_key) DO NOTHING;

-- Create default account settings for existing accounts
INSERT INTO account_settings (account_id, setting_key, setting_value, inherited_from, created_at, updated_at)
SELECT 
    a.id as account_id,
    'default_theme',
    '"light"'::jsonb,
    'org',
    a.created_at,
    a.created_at
FROM accounts a
ON CONFLICT (account_id, setting_key) DO NOTHING;

-- Create default project settings for existing projects
INSERT INTO project_settings (project_id, setting_key, setting_value, inherited_from, created_at, updated_at)
SELECT 
    p.id as project_id,
    'default_theme',
    '"light"'::jsonb,
    'account',
    p.created_at,
    p.created_at
FROM projects p
ON CONFLICT (project_id, setting_key) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify song-account associations were created
SELECT 
    'song_account_links' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT song_id) as unique_songs,
    COUNT(DISTINCT account_id) as unique_accounts
FROM song_account_links;

-- Verify song-project associations were created
SELECT 
    'song_project_associations' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT song_id) as unique_songs,
    COUNT(DISTINCT project_id) as unique_projects
FROM song_project_associations;

-- Verify project-account associations were created
SELECT 
    'project_account_associations' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT project_id) as unique_projects,
    COUNT(DISTINCT account_id) as unique_accounts
FROM project_account_associations;

-- Verify session-song associations were created
SELECT 
    'session_song_associations' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(DISTINCT song_id) as unique_songs
FROM session_song_associations;

-- Check for any songs that still have account_id or project_id (should be 0 after migration)
SELECT 
    'songs_with_account_id' as check_name,
    COUNT(*) as count
FROM songs 
WHERE account_id IS NOT NULL;

SELECT 
    'songs_with_project_id' as check_name,
    COUNT(*) as count
FROM songs 
WHERE project_id IS NOT NULL;

SELECT 
    'projects_with_account_id' as check_name,
    COUNT(*) as count
FROM projects 
WHERE account_id IS NOT NULL;

SELECT 
    'sessions_with_project_id' as check_name,
    COUNT(*) as count
FROM sessions 
WHERE project_id IS NOT NULL;

SELECT 
    'lyric_versions_with_account_id' as check_name,
    COUNT(*) as count
FROM lyric_versions 
WHERE account_id IS NOT NULL;
