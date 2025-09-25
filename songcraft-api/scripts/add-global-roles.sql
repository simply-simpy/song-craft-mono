-- Migration: Add global_role column to users table
-- Run this against your local database to add super user support

BEGIN;

-- Add the global_role column
ALTER TABLE users 
ADD COLUMN global_role VARCHAR(50) DEFAULT 'user' NOT NULL;

-- Add constraint for valid roles
ALTER TABLE users 
ADD CONSTRAINT users_global_role_check 
CHECK (global_role IN ('user', 'support', 'admin', 'super_admin'));

-- Create index for non-default roles (for performance)
CREATE INDEX users_global_role_idx ON users(global_role) 
WHERE global_role != 'user';

-- Update any existing users to have 'user' role (already default, but explicit)
UPDATE users SET global_role = 'user' WHERE global_role IS NULL;

COMMIT;

-- Verify the migration
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN global_role = 'user' THEN 1 END) as regular_users,
  COUNT(CASE WHEN global_role = 'support' THEN 1 END) as support_users,
  COUNT(CASE WHEN global_role = 'admin' THEN 1 END) as admin_users,
  COUNT(CASE WHEN global_role = 'super_admin' THEN 1 END) as super_admin_users
FROM users;
