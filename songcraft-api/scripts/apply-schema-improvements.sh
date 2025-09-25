#!/bin/bash

echo "🔧 Applying Schema Improvements Migration..."
echo "⚠️  This will modify your database structure and add constraints."
echo "📋 Changes include:"
echo "   - Adding critical performance indexes"
echo "   - Adding data validation constraints"
echo "   - Making email field required"
echo "   - Adding account_id to lyric_versions"
echo ""

read -p "Are you sure you want to proceed? (y/N): " confirm
if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
    echo "❌ Migration cancelled."
    exit 1
fi

echo "🚀 Starting migration..."

# Set database URL for development
export DATABASE_URL="postgresql://songcraft:songcraft_dev_password@localhost:5433/songcraft_dev"

# Apply the migration
psql $DATABASE_URL -f drizzle/0002_schema_improvements.sql

if [ $? -eq 0 ]; then
    echo "✅ Schema improvements applied successfully!"
    echo "🎯 Performance and data integrity have been enhanced."
    echo ""
    echo "📊 New indexes added:"
    echo "   - users_clerk_id_idx"
    echo "   - songs_owner_clerk_id_idx" 
    echo "   - songs_updated_at_idx"
    echo "   - lyric_versions_account_idx"
    echo "   - memberships indexes"
    echo ""
    echo "🛡️  New constraints added:"
    echo "   - Plan validation (Free, Pro, Team, Enterprise)"
    echo "   - Status validation (active, suspended, cancelled)"
    echo "   - Role validation (owner, admin, member, viewer)"
    echo ""
    echo "🔧 Data requirements:"
    echo "   - Email field is now required"
    echo "   - account_id is now required in songs and lyric_versions"
else
    echo "❌ Migration failed. Please check the error messages above."
    exit 1
fi
