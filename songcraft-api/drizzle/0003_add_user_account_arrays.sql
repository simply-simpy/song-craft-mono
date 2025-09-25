-- Migration: Add account arrays to users table
-- This migration adds accountIds array and primaryAccountId to users table
-- for faster access to user's accounts without requiring JOINs

-- Step 1: Add accountIds array to users table
ALTER TABLE users ADD COLUMN account_ids uuid[] DEFAULT '{}';

-- Step 2: Add primaryAccountId to users table
ALTER TABLE users ADD COLUMN primary_account_id uuid;

-- Step 3: Add foreign key constraint for primary_account_id
ALTER TABLE users 
ADD CONSTRAINT users_primary_account_id_fkey 
FOREIGN KEY (primary_account_id) REFERENCES accounts(id);

-- Step 4: Add indexes for new fields
CREATE INDEX users_account_ids_idx ON users USING GIN (account_ids);
CREATE INDEX users_primary_account_id_idx ON users(primary_account_id);

-- Step 5: Migrate existing data from memberships to account_ids array
-- This will populate the account_ids array with existing membership data
UPDATE users 
SET account_ids = (
  SELECT ARRAY_AGG(account_id) 
  FROM memberships 
  WHERE memberships.user_id = users.id
);

-- Step 6: Set primary account for users who have memberships
-- For now, we'll set the first account as primary (can be changed later)
UPDATE users 
SET primary_account_id = (
  SELECT account_id 
  FROM memberships 
  WHERE memberships.user_id = users.id 
  ORDER BY created_at ASC 
  LIMIT 1
)
WHERE primary_account_id IS NULL 
AND EXISTS (SELECT 1 FROM memberships WHERE memberships.user_id = users.id);

-- Step 7: Make account_ids NOT NULL after populating data
ALTER TABLE users ALTER COLUMN account_ids SET NOT NULL;
