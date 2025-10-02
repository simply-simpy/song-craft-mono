-- Update RLS Policies Script
-- This script updates Row Level Security policies to use association tables instead of direct foreign keys

-- ============================================================================
-- PHASE 1: Drop existing policies that depend on account_id columns
-- ============================================================================

-- Drop songs policies
DROP POLICY IF EXISTS songs_read ON songs;
DROP POLICY IF EXISTS songs_write ON songs;

-- Drop lyric_versions policies  
DROP POLICY IF EXISTS lyric_versions_read ON lyric_versions;
DROP POLICY IF EXISTS lyric_versions_write ON lyric_versions;

-- ============================================================================
-- PHASE 2: Create new policies using association tables
-- ============================================================================

-- Create new songs policies using song_account_links
CREATE POLICY songs_read ON songs
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM song_account_links sal
            WHERE sal.song_id = songs.id
            AND sal.account_id = app_current_account_id()
        )
    );

CREATE POLICY songs_write ON songs
    FOR ALL
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM song_account_links sal
            WHERE sal.song_id = songs.id
            AND sal.account_id = app_current_account_id()
        )
    );

-- Create new lyric_versions policies using song_account_links
CREATE POLICY lyric_versions_read ON lyric_versions
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM song_account_links sal
            WHERE sal.song_id = lyric_versions.song_id
            AND sal.account_id = app_current_account_id()
        )
    );

CREATE POLICY lyric_versions_write ON lyric_versions
    FOR ALL
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM song_account_links sal
            WHERE sal.song_id = lyric_versions.song_id
            AND sal.account_id = app_current_account_id()
        )
    );

-- ============================================================================
-- PHASE 3: Update projects policies to use project_account_associations
-- ============================================================================

-- Drop existing projects policies (if any)
DROP POLICY IF EXISTS projects_read ON projects;
DROP POLICY IF EXISTS projects_write ON projects;

-- Create new projects policies using project_account_associations
CREATE POLICY projects_read ON projects
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM project_account_associations paa
            WHERE paa.project_id = projects.id
            AND paa.account_id = app_current_account_id()
        )
    );

CREATE POLICY projects_write ON projects
    FOR ALL
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM project_account_associations paa
            WHERE paa.project_id = projects.id
            AND paa.account_id = app_current_account_id()
        )
    );

-- ============================================================================
-- PHASE 4: Update sessions policies to use project_account_associations
-- ============================================================================

-- Drop existing sessions policies (if any)
DROP POLICY IF EXISTS sessions_read ON sessions;
DROP POLICY IF EXISTS sessions_write ON sessions;

-- Create new sessions policies using project_account_associations
CREATE POLICY sessions_read ON sessions
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM project_account_associations paa
            WHERE paa.project_id = sessions.project_id
            AND paa.account_id = app_current_account_id()
        )
    );

CREATE POLICY sessions_write ON sessions
    FOR ALL
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM project_account_associations paa
            WHERE paa.project_id = sessions.project_id
            AND paa.account_id = app_current_account_id()
        )
    );

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify new policies were created
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd
FROM pg_policies 
WHERE tablename IN ('songs', 'lyric_versions', 'projects', 'sessions')
ORDER BY tablename, policyname;
