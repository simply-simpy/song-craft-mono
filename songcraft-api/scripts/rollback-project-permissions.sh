#!/bin/bash

# Project-Level Permissions Rollback Script
# This script rolls back the project-level permission system migrations

set -e

echo "🔄 Starting Project-Level Permissions Rollback..."

# Check if we're in the right directory
if [ ! -f "drizzle.config.ts" ]; then
    echo "❌ Error: Please run this script from the songcraft-api directory"
    exit 1
fi

# Confirm rollback
echo "⚠️  WARNING: This will remove all project-level permission data!"
echo "   - All projects will be deleted"
echo "   - All project permissions will be deleted"
echo "   - All sessions will be deleted"
echo "   - All session participants will be deleted"
echo "   - project_id column will be removed from songs"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Rollback cancelled"
    exit 0
fi

echo "🗑️  Dropping project-level permission system..."

# Drop triggers
echo "Dropping triggers..."
psql $DATABASE_URL -c "DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;"
psql $DATABASE_URL -c "DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;"

# Drop functions
echo "Dropping functions..."
psql $DATABASE_URL -c "DROP FUNCTION IF EXISTS update_updated_at_column();"
psql $DATABASE_URL -c "DROP FUNCTION IF EXISTS has_project_permission(UUID, UUID, VARCHAR);"
psql $DATABASE_URL -c "DROP FUNCTION IF EXISTS can_participate_in_session(UUID, UUID);"
psql $DATABASE_URL -c "DROP FUNCTION IF EXISTS get_user_project_permission(UUID, UUID);"
psql $DATABASE_URL -c "DROP FUNCTION IF EXISTS can_create_sessions(UUID, UUID);"
psql $DATABASE_URL -c "DROP FUNCTION IF EXISTS can_manage_project(UUID, UUID);"

# Drop tables (in reverse order due to foreign keys)
echo "Dropping tables..."
psql $DATABASE_URL -c "DROP TABLE IF EXISTS session_participants CASCADE;"
psql $DATABASE_URL -c "DROP TABLE IF EXISTS sessions CASCADE;"
psql $DATABASE_URL -c "DROP TABLE IF EXISTS project_permissions CASCADE;"
psql $DATABASE_URL -c "DROP TABLE IF EXISTS projects CASCADE;"

# Remove project_id column from songs
echo "Removing project_id column from songs..."
psql $DATABASE_URL -c "ALTER TABLE songs DROP COLUMN IF EXISTS project_id;"

# Drop any remaining indexes
echo "Cleaning up indexes..."
psql $DATABASE_URL -c "DROP INDEX IF EXISTS songs_project_id_idx;"

echo "✅ Rollback completed successfully!"

echo ""
echo "📋 Rollback Summary:"
echo "  ✅ Removed all project-level tables"
echo "  ✅ Removed project_id from songs"
echo "  ✅ Removed all permission functions"
echo "  ✅ Removed all triggers"
echo ""
echo "⚠️  Note: This rollback does not restore any data that was deleted."
echo "   If you need to restore data, use your database backup."
echo ""
echo "🔄 System has been rolled back to pre-project-permissions state"
