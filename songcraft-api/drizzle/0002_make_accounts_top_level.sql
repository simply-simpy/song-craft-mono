-- Migration: Make accounts top-level entity
-- This migration restructures the schema to make accounts the primary entity
-- instead of orgs, with accounts having an optional parentOrgId for billing

-- Step 1: Add new columns to accounts table
ALTER TABLE accounts ADD COLUMN parent_org_id uuid;
ALTER TABLE accounts ADD COLUMN description text;
ALTER TABLE accounts ADD COLUMN billing_email varchar(255);
ALTER TABLE accounts ADD COLUMN settings jsonb DEFAULT '{}' NOT NULL;

-- Step 2: Add billing fields to orgs table
ALTER TABLE orgs ADD COLUMN billing_email varchar(255);
ALTER TABLE orgs ADD COLUMN billing_address text;
ALTER TABLE orgs ADD COLUMN billing_phone varchar(50);

-- Step 3: Migrate existing data - set parent_org_id to current org_id
UPDATE accounts SET parent_org_id = org_id;

-- Step 4: Make org_id nullable (accounts can exist without an org)
ALTER TABLE accounts ALTER COLUMN org_id DROP NOT NULL;

-- Step 5: Add foreign key constraint for parent_org_id
ALTER TABLE accounts 
ADD CONSTRAINT accounts_parent_org_id_fkey 
FOREIGN KEY (parent_org_id) REFERENCES orgs(id);

-- Step 6: Add indexes for new fields
CREATE INDEX accounts_parent_org_idx ON accounts(parent_org_id);
CREATE INDEX accounts_billing_email_idx ON accounts(billing_email);
CREATE INDEX orgs_billing_email_idx ON orgs(billing_email);

-- Step 7: Update active index to use parent_org_id instead of org_id
DROP INDEX IF EXISTS accounts_active_idx;
CREATE INDEX accounts_active_idx ON accounts(parent_org_id) WHERE status = 'active';