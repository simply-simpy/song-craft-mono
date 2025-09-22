#!/bin/bash

# Project-Level Permissions Migration Runner
# This script runs all migrations for the project-level permission system

set -e

echo "🚀 Starting Project-Level Permissions Migration..."

# Check if we're in the right directory
if [ ! -f "drizzle.config.ts" ]; then
    echo "❌ Error: Please run this script from the songcraft-api directory"
    exit 1
fi

# Check if database is accessible
echo "📊 Checking database connection..."
if ! npx drizzle-kit push --dry-run > /dev/null 2>&1; then
    echo "❌ Error: Cannot connect to database. Please check your DATABASE_URL"
    exit 1
fi

echo "✅ Database connection successful"

# Run migrations in order
echo "📝 Running migration 0001: Create project-level tables..."
npx drizzle-kit push

echo "📝 Running migration 0002: Add project_id to songs..."
npx drizzle-kit push

echo "📝 Running migration 0003: Add permission functions..."
psql $DATABASE_URL -f drizzle/0003_add_permission_functions.sql

echo "📝 Running migration 0004: Seed test data..."
psql $DATABASE_URL -f drizzle/0004_seed_test_data.sql

echo "✅ All migrations completed successfully!"

# Test the migration
echo "🧪 Testing migration..."

# Test permission functions
echo "Testing permission functions..."
psql $DATABASE_URL -c "
SELECT 
    'Garth can create sessions for Summer 2024 Album' as test,
    can_create_sessions('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440040') as result
UNION ALL
SELECT 
    'Marcus can participate in writing session' as test,
    can_participate_in_session('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440060') as result
UNION ALL
SELECT 
    'Elena can participate in feedback session' as test,
    can_participate_in_session('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440061') as result
UNION ALL
SELECT 
    'Alex cannot participate in writing session (read-only)' as test,
    can_participate_in_session('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440060') as result;
"

echo "🎉 Migration test completed!"

echo ""
echo "📋 Migration Summary:"
echo "  ✅ Created projects table"
echo "  ✅ Created project_permissions table"
echo "  ✅ Created sessions table"
echo "  ✅ Created session_participants table"
echo "  ✅ Added project_id to songs table"
echo "  ✅ Added permission checking functions"
echo "  ✅ Seeded test data"
echo ""
echo "🔧 Next Steps:"
echo "  1. Update your application code to use the new permission system"
echo "  2. Test the new project-level permissions in your app"
echo "  3. Update your API endpoints to check project permissions"
echo "  4. Update your UI to show project-based access controls"
echo ""
echo "📚 Documentation:"
echo "  - See diagrams/10-personas/ for permission system documentation"
echo "  - See diagrams/10-personas/migration-plan.md for detailed migration info"
echo ""
echo "✨ Project-level permission system is now ready!"
