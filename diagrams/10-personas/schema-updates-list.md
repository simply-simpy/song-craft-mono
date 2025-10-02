# Schema Updates for Association-Based Model

## Current Schema Analysis

Based on the current schema, here are the key issues that need to be addressed:

### **Current Parent-Child Relationships (Need to Change)**

1. **Songs → Accounts**: `songs.account_id` (line 79)
2. **Songs → Projects**: `songs.project_id` (line 80)
3. **Projects → Accounts**: `projects.account_id` (line 276)
4. **Lyric Versions → Accounts**: `lyric_versions.account_id` (line 107)
5. **Sessions → Projects**: `sessions.project_id` (line 348)

### **Existing Association Tables (Good)**

1. **Song-Account Links**: `song_account_links` (line 244) - Already exists!
2. **Song Authors**: `song_authors` (line 257) - Already exists!
3. **Memberships**: `memberships` (line 180) - Already exists!

## Required Schema Updates

### **1. Remove Parent-Child Foreign Keys**

#### **Songs Table Updates**

```sql
-- Remove account_id and project_id from songs table
ALTER TABLE songs DROP COLUMN account_id;
ALTER TABLE songs DROP COLUMN project_id;

-- Remove related indexes
DROP INDEX IF EXISTS songs_account_created_desc_idx;
DROP INDEX IF EXISTS songs_project_id_idx;
```

#### **Projects Table Updates**

```sql
-- Remove account_id from projects table
ALTER TABLE projects DROP COLUMN account_id;

-- Remove related indexes
DROP INDEX IF EXISTS projects_account_id_idx;
```

#### **Lyric Versions Table Updates**

```sql
-- Remove account_id from lyric_versions table
ALTER TABLE lyric_versions DROP COLUMN account_id;

-- Remove related indexes
DROP INDEX IF EXISTS lyric_versions_account_idx;
```

### **2. Enhance Existing Association Tables**

#### **Song-Account Links (Already Exists - Enhance)**

```sql
-- Add association_type column to existing table
ALTER TABLE song_account_links
ADD COLUMN association_type VARCHAR(50) DEFAULT 'billing';

-- Add updated_at column
ALTER TABLE song_account_links
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add check constraint
ALTER TABLE song_account_links
ADD CONSTRAINT song_account_links_type_check
CHECK (association_type IN ('billing', 'context', 'rights', 'primary'));

-- Add index for association_type
CREATE INDEX song_account_links_type_idx ON song_account_links(association_type);
```

#### **Song Authors (Already Exists - Enhance)**

```sql
-- Add split_percentage column
ALTER TABLE song_authors
ADD COLUMN split_percentage DECIMAL(5,2);

-- Add territory_rights column
ALTER TABLE song_authors
ADD COLUMN territory_rights JSONB DEFAULT '{}';

-- Add updated_at column
ALTER TABLE song_authors
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add index for split_percentage
CREATE INDEX song_authors_split_idx ON song_authors(split_percentage);
```

### **3. Create New Association Tables**

#### **Song-Project Associations**

```sql
CREATE TABLE song_project_associations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  association_type VARCHAR(50) DEFAULT 'primary' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT song_project_associations_type_check
    CHECK (association_type IN ('primary', 'secondary', 'compilation', 'reference')),
  CONSTRAINT song_project_associations_unique
    UNIQUE (song_id, project_id)
);

-- Indexes
CREATE INDEX song_project_associations_song_idx ON song_project_associations(song_id);
CREATE INDEX song_project_associations_project_idx ON song_project_associations(project_id);
CREATE INDEX song_project_associations_type_idx ON song_project_associations(association_type);
```

#### **Project-Account Associations**

```sql
CREATE TABLE project_account_associations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  association_type VARCHAR(50) DEFAULT 'billing' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT project_account_associations_type_check
    CHECK (association_type IN ('billing', 'context', 'rights', 'primary')),
  CONSTRAINT project_account_associations_unique
    UNIQUE (project_id, account_id)
);

-- Indexes
CREATE INDEX project_account_associations_project_idx ON project_account_associations(project_id);
CREATE INDEX project_account_associations_account_idx ON project_account_associations(account_id);
CREATE INDEX project_account_associations_type_idx ON project_account_associations(association_type);
```

#### **Session-Song Associations**

```sql
CREATE TABLE session_song_associations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  association_type VARCHAR(50) DEFAULT 'primary' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT session_song_associations_type_check
    CHECK (association_type IN ('primary', 'secondary', 'reference')),
  CONSTRAINT session_song_associations_unique
    UNIQUE (session_id, song_id)
);

-- Indexes
CREATE INDEX session_song_associations_session_idx ON session_song_associations(session_id);
CREATE INDEX session_song_associations_song_idx ON session_song_associations(song_id);
CREATE INDEX session_song_associations_type_idx ON session_song_associations(association_type);
```

### **4. Create Settings Tables**

#### **Org Settings**

```sql
CREATE TABLE org_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  setting_key VARCHAR(255) NOT NULL,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  CONSTRAINT org_settings_unique UNIQUE (org_id, setting_key)
);

-- Indexes
CREATE INDEX org_settings_org_idx ON org_settings(org_id);
CREATE INDEX org_settings_key_idx ON org_settings(setting_key);
```

#### **Account Settings**

```sql
CREATE TABLE account_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  setting_key VARCHAR(255) NOT NULL,
  setting_value JSONB NOT NULL,
  inherited_from VARCHAR(50), -- 'org', 'parent_account'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  CONSTRAINT account_settings_unique UNIQUE (account_id, setting_key)
);

-- Indexes
CREATE INDEX account_settings_account_idx ON account_settings(account_id);
CREATE INDEX account_settings_key_idx ON account_settings(setting_key);
CREATE INDEX account_settings_inherited_idx ON account_settings(inherited_from);
```

#### **Project Settings**

```sql
CREATE TABLE project_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  setting_key VARCHAR(255) NOT NULL,
  setting_value JSONB NOT NULL,
  inherited_from VARCHAR(50), -- 'account', 'parent_project'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  CONSTRAINT project_settings_unique UNIQUE (project_id, setting_key)
);

-- Indexes
CREATE INDEX project_settings_project_idx ON project_settings(project_id);
CREATE INDEX project_settings_key_idx ON project_settings(setting_key);
CREATE INDEX project_settings_inherited_idx ON project_settings(inherited_from);
```

#### **Song Settings**

```sql
CREATE TABLE song_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  setting_key VARCHAR(255) NOT NULL,
  setting_value JSONB NOT NULL,
  inherited_from VARCHAR(50), -- 'project', 'account'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  CONSTRAINT song_settings_unique UNIQUE (song_id, setting_key)
);

-- Indexes
CREATE INDEX song_settings_song_idx ON song_settings(song_id);
CREATE INDEX song_settings_key_idx ON song_settings(setting_key);
CREATE INDEX song_settings_inherited_idx ON song_settings(inherited_from);
```

#### **User Settings**

```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  setting_key VARCHAR(255) NOT NULL,
  setting_value JSONB NOT NULL,
  scope VARCHAR(50), -- 'global', 'account', 'project'
  scope_id UUID, -- ID of the scoped entity
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  CONSTRAINT user_settings_unique UNIQUE (user_id, setting_key, scope, scope_id)
);

-- Indexes
CREATE INDEX user_settings_user_idx ON user_settings(user_id);
CREATE INDEX user_settings_key_idx ON user_settings(setting_key);
CREATE INDEX user_settings_scope_idx ON user_settings(scope, scope_id);
```

### **5. Update Existing Tables**

#### **Sessions Table Updates**

```sql
-- Remove project_id foreign key constraint
ALTER TABLE sessions DROP CONSTRAINT sessions_project_id_fkey;

-- Remove project_id column
ALTER TABLE sessions DROP COLUMN project_id;

-- Remove related indexes
DROP INDEX IF EXISTS sessions_project_id_idx;
```

## Migration Strategy

### **Phase 1: Create New Tables**

1. Create all new association tables
2. Create all settings tables
3. Add new columns to existing association tables

### **Phase 2: Data Migration**

1. Migrate existing data to association tables
2. Create associations for existing relationships
3. Set appropriate association types

### **Phase 3: Remove Old Columns**

1. Remove foreign key constraints
2. Remove old columns
3. Remove old indexes

### **Phase 4: Update Application Code**

1. Update repositories to use associations
2. Update services to use associations
3. Update API endpoints

## Summary of Changes

### **Tables to Modify**

- `songs` - Remove `account_id` and `project_id`
- `projects` - Remove `account_id`
- `lyric_versions` - Remove `account_id`
- `sessions` - Remove `project_id`
- `song_account_links` - Add `association_type` and `updated_at`
- `song_authors` - Add `split_percentage`, `territory_rights`, `updated_at`

### **Tables to Create**

- `song_project_associations`
- `project_account_associations`
- `session_song_associations`
- `org_settings`
- `account_settings`
- `project_settings`
- `song_settings`
- `user_settings`

### **Indexes to Remove**

- `songs_account_created_desc_idx`
- `songs_project_id_idx`
- `projects_account_id_idx`
- `lyric_versions_account_idx`
- `sessions_project_id_idx`

### **Indexes to Create**

- All indexes for new association tables
- All indexes for new settings tables
- Additional indexes for enhanced existing tables
