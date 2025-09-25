# Database Migration Plan: Project-Level Permissions

## **Current State Analysis**

### **Existing Schema Issues:**

1. **No Project Table**: Current schema has `Project` but it's not detailed
2. **Account-Level Permissions Only**: `MEMBERSHIP` table only has account-level roles
3. **Song-Level ACL**: `SONG_ACL` exists but is song-specific, not project-level
4. **Missing Project Permissions**: No way to grant project-level access

### **Current Tables:**

- `USER` - User identity
- `ACCOUNT` - Workspace container
- `MEMBERSHIP` - User → Account relationship (owner/manager/collaborator/viewer)
- `SONG_ACL` - User → Song permissions (editor/viewer)
- `PROJECT` - Referenced but not detailed

---

## **Migration Strategy**

### **Phase 1: Add Project-Level Tables**

#### **1. Create PROJECT table**

```sql
CREATE TABLE project (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES account(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active', -- active, archived, deleted
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES user(id)
);

CREATE INDEX idx_project_account_id ON project(account_id);
CREATE INDEX idx_project_status ON project(status);
```

#### **2. Create PROJECT_PERMISSION table**

```sql
CREATE TABLE project_permission (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    permission_level VARCHAR(50) NOT NULL, -- read, read_notes, read_write, full_access
    granted_by UUID NOT NULL REFERENCES user(id),
    granted_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NULL, -- optional expiration
    UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_permission_project_id ON project_permission(project_id);
CREATE INDEX idx_project_permission_user_id ON project_permission(user_id);
CREATE INDEX idx_project_permission_level ON project_permission(permission_level);
```

#### **3. Create SESSION table**

```sql
CREATE TABLE session (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    session_type VARCHAR(50) NOT NULL, -- writing, recording, feedback, review
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, active, completed, cancelled
    scheduled_start TIMESTAMP,
    scheduled_end TIMESTAMP,
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    created_by UUID NOT NULL REFERENCES user(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_session_project_id ON session(project_id);
CREATE INDEX idx_session_status ON session(status);
CREATE INDEX idx_session_scheduled_start ON session(scheduled_start);
```

#### **4. Create SESSION_PARTICIPANT table**

```sql
CREATE TABLE session_participant (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES session(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'invited', -- invited, accepted, declined, no_show
    invited_at TIMESTAMP DEFAULT NOW(),
    responded_at TIMESTAMP NULL,
    UNIQUE(session_id, user_id)
);

CREATE INDEX idx_session_participant_session_id ON session_participant(session_id);
CREATE INDEX idx_session_participant_user_id ON session_participant(user_id);
CREATE INDEX idx_session_participant_status ON session_participant(status);
```

---

### **Phase 2: Update Existing Tables**

#### **1. Add Project Reference to Songs**

```sql
-- Add project_id to existing song table
ALTER TABLE song ADD COLUMN project_id UUID REFERENCES project(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX idx_song_project_id ON song(project_id);

-- Update existing songs to have a default project
-- This will be done in the data migration phase
```

#### **2. Update MEMBERSHIP table**

```sql
-- Add new account-level roles
ALTER TABLE membership ADD COLUMN can_invite_users BOOLEAN DEFAULT FALSE;
ALTER TABLE membership ADD COLUMN can_manage_projects BOOLEAN DEFAULT FALSE;

-- Update existing memberships based on current roles
UPDATE membership SET can_invite_users = TRUE, can_manage_projects = TRUE WHERE role = 'owner';
UPDATE membership SET can_invite_users = TRUE, can_manage_projects = TRUE WHERE role = 'manager';
UPDATE membership SET can_invite_users = FALSE, can_manage_projects = FALSE WHERE role = 'collaborator';
UPDATE membership SET can_invite_users = FALSE, can_manage_projects = FALSE WHERE role = 'viewer';
```

---

### **Phase 3: Data Migration**

#### **1. Create Default Projects**

```sql
-- Create a default project for each account
INSERT INTO project (id, account_id, name, description, created_by)
SELECT
    gen_random_uuid(),
    a.id,
    'Default Project',
    'Default project for existing songs',
    m.user_id
FROM account a
JOIN membership m ON a.id = m.account_id
WHERE m.role = 'owner'
LIMIT 1;
```

#### **2. Migrate Existing Songs**

```sql
-- Assign existing songs to default projects
UPDATE song
SET project_id = (
    SELECT p.id
    FROM project p
    WHERE p.account_id = song.account_id
    AND p.name = 'Default Project'
    LIMIT 1
)
WHERE project_id IS NULL;
```

#### **3. Migrate Existing SONG_ACL to PROJECT_PERMISSION**

```sql
-- Convert song-level permissions to project-level permissions
INSERT INTO project_permission (project_id, user_id, permission_level, granted_by)
SELECT DISTINCT
    s.project_id,
    sa.user_id,
    CASE
        WHEN sa.role = 'editor' THEN 'read_write'
        WHEN sa.role = 'viewer' THEN 'read'
        ELSE 'read'
    END,
    m.user_id -- account owner as granter
FROM song_acl sa
JOIN song s ON sa.song_id = s.id
JOIN membership m ON s.account_id = m.account_id
WHERE m.role = 'owner'
AND s.project_id IS NOT NULL;
```

---

### **Phase 4: Update Application Logic**

#### **1. Permission Checking Functions**

```sql
-- Function to check if user has project permission
CREATE OR REPLACE FUNCTION has_project_permission(
    p_user_id UUID,
    p_project_id UUID,
    p_required_level VARCHAR(50)
) RETURNS BOOLEAN AS $$
DECLARE
    user_level VARCHAR(50);
    account_role VARCHAR(50);
BEGIN
    -- Check project-specific permission
    SELECT permission_level INTO user_level
    FROM project_permission
    WHERE user_id = p_user_id AND project_id = p_project_id;

    -- If no project permission, check account-level permission
    IF user_level IS NULL THEN
        SELECT m.role INTO account_role
        FROM membership m
        JOIN project p ON m.account_id = p.account_id
        WHERE m.user_id = p_user_id AND p.id = p_project_id;

        -- Account owners and managers get full access
        IF account_role IN ('owner', 'manager') THEN
            RETURN TRUE;
        END IF;

        RETURN FALSE;
    END IF;

    -- Check permission level hierarchy
    RETURN CASE p_required_level
        WHEN 'read' THEN user_level IN ('read', 'read_notes', 'read_write', 'full_access')
        WHEN 'read_notes' THEN user_level IN ('read_notes', 'read_write', 'full_access')
        WHEN 'read_write' THEN user_level IN ('read_write', 'full_access')
        WHEN 'full_access' THEN user_level = 'full_access'
        ELSE FALSE
    END;
END;
$$ LANGUAGE plpgsql;
```

#### **2. Session Permission Function**

```sql
-- Function to check if user can participate in session
CREATE OR REPLACE FUNCTION can_participate_in_session(
    p_user_id UUID,
    p_session_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    project_id UUID;
BEGIN
    -- Get project for session
    SELECT s.project_id INTO project_id
    FROM session s
    WHERE s.id = p_session_id;

    -- Check if user has at least read_notes permission on project
    RETURN has_project_permission(p_user_id, project_id, 'read_notes');
END;
$$ LANGUAGE plpgsql;
```

---

### **Phase 5: Cleanup and Optimization**

#### **1. Remove Deprecated Tables**

```sql
-- After migration is complete and tested
-- DROP TABLE song_acl; -- Keep for now, mark as deprecated
```

#### **2. Add Constraints and Triggers**

```sql
-- Add check constraints
ALTER TABLE project_permission
ADD CONSTRAINT check_permission_level
CHECK (permission_level IN ('read', 'read_notes', 'read_write', 'full_access'));

ALTER TABLE session
ADD CONSTRAINT check_session_type
CHECK (session_type IN ('writing', 'recording', 'feedback', 'review'));

ALTER TABLE session_participant
ADD CONSTRAINT check_participant_status
CHECK (status IN ('invited', 'accepted', 'declined', 'no_show'));

-- Add update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_updated_at
    BEFORE UPDATE ON project
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_updated_at
    BEFORE UPDATE ON session
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## **Migration Execution Plan**

### **Pre-Migration Checklist:**

- [ ] Backup current database
- [ ] Test migration on staging environment
- [ ] Prepare rollback plan
- [ ] Notify users of maintenance window

### **Migration Steps:**

1. **Phase 1**: Create new tables (5 minutes)
2. **Phase 2**: Update existing tables (2 minutes)
3. **Phase 3**: Migrate data (10-30 minutes depending on data size)
4. **Phase 4**: Deploy application updates
5. **Phase 5**: Cleanup and optimization (5 minutes)

### **Post-Migration Validation:**

- [ ] Verify all existing songs have project assignments
- [ ] Test permission checking functions
- [ ] Verify session creation and participation
- [ ] Test invitation flows
- [ ] Monitor application performance

### **Rollback Plan:**

- [ ] Restore database from backup
- [ ] Revert application code
- [ ] Verify system functionality

---

## **Estimated Timeline:**

- **Development**: 2-3 days
- **Testing**: 1-2 days
- **Migration**: 1-2 hours
- **Total**: 1 week

This migration will enable the granular project-level permission system we designed, making the platform much more secure and flexible for collaboration.
