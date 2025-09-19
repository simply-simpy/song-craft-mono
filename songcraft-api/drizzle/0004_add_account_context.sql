-- Migration: Add account context tracking
-- This migration adds currentAccountId to users table and creates userContext table
-- for tracking which account a user is currently operating under

-- Step 1: Add currentAccountId to users table
ALTER TABLE users ADD COLUMN current_account_id uuid;

-- Step 2: Create user_context table
CREATE TABLE user_context (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  last_switched_at timestamp with time zone DEFAULT now() NOT NULL,
  context_data jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Step 3: Create indexes for user_context table
CREATE INDEX user_context_user_id_idx ON user_context USING btree (user_id);
CREATE INDEX user_context_current_account_idx ON user_context USING btree (current_account_id);
CREATE INDEX user_context_user_account_idx ON user_context USING btree (user_id, current_account_id);

-- Step 4: Initialize current_account_id for existing users
-- Set current_account_id to primary_account_id if it exists
UPDATE users 
SET current_account_id = primary_account_id 
WHERE primary_account_id IS NOT NULL;

-- Step 5: For users without primary_account_id, set to first account they belong to
UPDATE users 
SET current_account_id = (
  SELECT account_id 
  FROM memberships 
  WHERE memberships.user_id = users.id 
  ORDER BY created_at ASC 
  LIMIT 1
)
WHERE current_account_id IS NULL 
AND EXISTS (
  SELECT 1 FROM memberships WHERE memberships.user_id = users.id
);

-- Step 6: Create initial user_context records for users with current_account_id
INSERT INTO user_context (user_id, current_account_id, context_data)
SELECT 
  id as user_id,
  current_account_id,
  '{"initialized": true}'::jsonb as context_data
FROM users 
WHERE current_account_id IS NOT NULL;

-- Step 7: Add foreign key constraint for current_account_id
ALTER TABLE users ADD CONSTRAINT users_current_account_id_fkey 
FOREIGN KEY (current_account_id) REFERENCES accounts(id) ON DELETE SET NULL;

-- Step 8: Create index for current_account_id
CREATE INDEX users_current_account_id_idx ON users USING btree (current_account_id);
