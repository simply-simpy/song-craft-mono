#!/bin/bash

echo "🔧 Applying Missing Constraints..."
echo "This will add the constraints that failed in the previous migration."

# Set database URL for development
export DATABASE_URL="postgresql://songcraft:songcraft_dev_password@localhost:5433/songcraft_dev"

echo "🚀 Adding constraints..."

# Add the constraints using proper PostgreSQL syntax
psql $DATABASE_URL << 'EOF'
-- Add data validation constraints
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'accounts_plan_check') THEN
        ALTER TABLE "accounts" ADD CONSTRAINT "accounts_plan_check" 
          CHECK (plan IN ('Free', 'Pro', 'Team', 'Enterprise'));
        RAISE NOTICE 'Added accounts_plan_check constraint';
    ELSE
        RAISE NOTICE 'accounts_plan_check constraint already exists';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'accounts_status_check') THEN
        ALTER TABLE "accounts" ADD CONSTRAINT "accounts_status_check" 
          CHECK (status IN ('active', 'suspended', 'cancelled'));
        RAISE NOTICE 'Added accounts_status_check constraint';
    ELSE
        RAISE NOTICE 'accounts_status_check constraint already exists';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'memberships_role_check') THEN
        ALTER TABLE "memberships" ADD CONSTRAINT "memberships_role_check" 
          CHECK (role IN ('owner', 'admin', 'member', 'viewer'));
        RAISE NOTICE 'Added memberships_role_check constraint';
    ELSE
        RAISE NOTICE 'memberships_role_check constraint already exists';
    END IF;
END $$;

-- Add unique constraint for users.clerk_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_clerk_id_unique') THEN
        ALTER TABLE "users" ADD CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id");
        RAISE NOTICE 'Added users_clerk_id_unique constraint';
    ELSE
        RAISE NOTICE 'users_clerk_id_unique constraint already exists';
    END IF;
END $$;

-- Add foreign key constraint for lyric_versions.account_id
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lyric_versions_account_fk') THEN
        ALTER TABLE "lyric_versions" ADD CONSTRAINT "lyric_versions_account_fk" 
          FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT;
        RAISE NOTICE 'Added lyric_versions_account_fk constraint';
    ELSE
        RAISE NOTICE 'lyric_versions_account_fk constraint already exists';
    END IF;
END $$;
EOF

if [ $? -eq 0 ]; then
    echo "✅ Constraints applied successfully!"
    echo ""
    echo "🛡️  Active constraints:"
    echo "   - accounts_plan_check: Validates plan values"
    echo "   - accounts_status_check: Validates status values" 
    echo "   - memberships_role_check: Validates role values"
    echo "   - users_clerk_id_unique: Ensures unique clerk_id"
    echo "   - lyric_versions_account_fk: Links lyric_versions to accounts"
else
    echo "❌ Failed to apply constraints. Check the error messages above."
    exit 1
fi
