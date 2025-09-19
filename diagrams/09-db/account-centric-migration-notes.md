# Account-Centric Database Migration - ERD Updates

## Overview

Updated all ERD diagrams to reflect the new account-centric database structure where accounts are the top-level entity instead of organizations.

## Key Changes Made

### 1. Core Identity Structure Changes

**USER Table Updates:**

- Added `global_role` field for system-wide permissions
- Added `last_login_at` timestamp
- Removed `updated_at` (not implemented in actual schema)

**ORG Table Updates:**

- Removed `status` field (not in actual schema)
- Added `billing_email` for org-level billing
- Added `billing_address` for billing address
- Added `billing_phone` for billing contact
- Now focused on billing and management rather than primary entity

**ACCOUNT Table Updates:**

- Added `parent_org_id` as primary relationship to orgs (nullable)
- Kept `org_id` as legacy field (nullable) for backward compatibility
- Added `owner_user_id` for account ownership
- Added `description` for account description
- Added `billing_email` for account-level billing
- Added `settings` (jsonb) for flexible configuration
- Now the top-level entity for collaboration

### 2. Relationship Changes

**Primary Relationships:**

- `ORG ||--o{ ACCOUNT : "parent_org_id (primary)"` - New primary relationship
- `ORG ||--o{ ACCOUNT : "org_id (legacy)"` - Legacy relationship maintained

**Account-Centric Flow:**

- Users create accounts first
- Accounts can exist without an org (standalone)
- Accounts can optionally belong to an org for billing
- Users are invited to accounts, not orgs directly

### 3. Files Updated

1. **core-identity-erd.mermaid** - Core identity structure
2. **account-user-songs-erd.mermaid** - Main account/song relationships
3. **all-erds.mermaid** - Comprehensive overview
4. **billing-subscriptions-erd.mermaid** - Billing and subscription structure

### 4. Files Not Updated

The following files were not updated as they focus on specific domains that don't directly relate to the core identity structure changes:

- **songs-collab-erd.mermaid** - Song collaboration features
- **access-control-erd.mermaid** - Access control mechanisms
- **comms-notifications-erd.mermaid** - Communications and notifications
- **sessions-splits-erd.mermaid** - Song sessions and splits
- **schema-01-db.mermaid** - Conceptual schema (not implementation-specific)

## Benefits of New Structure

1. **Simpler User Onboarding**: Users create accounts first, then optionally join orgs
2. **Account Portability**: Easy to transfer accounts between orgs
3. **Flexible Billing**: Account-level and org-level billing options
4. **Better Collaboration**: Users work in accounts, not orgs
5. **Clearer Permissions**: Account-level roles are more intuitive

## Migration Notes

- All existing data preserved during migration
- `org_id` field kept for backward compatibility
- `parent_org_id` is now the primary relationship
- Accounts can exist without an org (standalone accounts)
- Billing can be handled at both account and org levels

## Implementation Status

- ✅ Database migration completed
- ✅ Schema.ts updated
- ✅ ERD diagrams updated
- 🔄 Admin UI updates (in progress)
- ⏳ API endpoint updates (pending)
- ⏳ Frontend component updates (pending)
