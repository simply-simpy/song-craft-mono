# Project-Level Permissions Migration

This document describes the migration to implement project-level permissions in the SongScribe system.

## Overview

The project-level permission system introduces granular access control at the project level, allowing users to have different permission levels for different projects within the same account.

### Key Features

- **Projects**: Logical containers for songs and sessions within accounts
- **Project Permissions**: Granular access control (read, read_notes, read_write, full_access)
- **Sessions**: Collaborative writing/recording/feedback sessions tied to projects
- **Session Participants**: User participation tracking for sessions

## Migration Files

### 1. `0001_light_dreaming_celestial.sql`

Creates the core project-level permission tables:

- `projects` - Project management within accounts
- `project_permissions` - User permissions per project
- `sessions` - Collaborative sessions
- `session_participants` - Session participation tracking

### 2. `0002_goofy_steel_serpent.sql`

Adds project reference to songs:

- Adds `project_id` column to `songs` table
- Creates foreign key relationship to `projects`
- Adds index for performance

### 3. `0003_add_permission_functions.sql`

Adds PostgreSQL functions for permission checking:

- `has_project_permission()` - Check user permission level
- `can_participate_in_session()` - Check session participation rights
- `get_user_project_permission()` - Get effective permission level
- `can_create_sessions()` - Check session creation rights
- `can_manage_project()` - Check project management rights

### 4. `0004_seed_test_data.sql`

Seeds test data for development and testing:

- Sample organizations, users, and accounts
- Test projects with different permission levels
- Sample sessions and participants
- Test songs linked to projects

## Running the Migration

### Prerequisites

1. Ensure you have a database backup
2. Verify your `DATABASE_URL` environment variable is set
3. Ensure you're in the `songcraft-api` directory

### Quick Migration

```bash
# Run the complete migration
./scripts/run-project-permissions-migration.sh
```

### Manual Migration

```bash
# Step 1: Create tables
npx drizzle-kit push

# Step 2: Add permission functions
psql $DATABASE_URL -f drizzle/0003_add_permission_functions.sql

# Step 3: Seed test data (optional)
psql $DATABASE_URL -f drizzle/0004_seed_test_data.sql
```

### Rollback

If you need to rollback the migration:

```bash
# Run the rollback script
./scripts/rollback-project-permissions.sh
```

## Permission Levels

### Account Level

- **Owner**: Full control over account and all projects
- **Manager**: Can create projects and invite users
- **Member**: Basic account access

### Project Level

- **Read**: View songs, download exports, view project info
- **Read + Notes**: All Read permissions + add comments/notes
- **Read + Write**: All Read + Notes permissions + edit songs, create songs
- **Full Access**: All permissions + create sessions, manage project settings

### Session Level

- **Session Creator**: Can create and manage sessions
- **Session Participant**: Can accept invites and participate (requires at least read_notes permission on project)

## Database Schema

### Projects Table

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);
```

### Project Permissions Table

```sql
CREATE TABLE project_permissions (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id),
    user_id UUID NOT NULL REFERENCES users(id),
    permission_level VARCHAR(50) NOT NULL,
    granted_by UUID NOT NULL REFERENCES users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(project_id, user_id)
);
```

### Sessions Table

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    session_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled',
    scheduled_start TIMESTAMP WITH TIME ZONE,
    scheduled_end TIMESTAMP WITH TIME ZONE,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Usage Examples

### Check User Permission

```sql
-- Check if user can read a project
SELECT has_project_permission(
    'user-uuid',
    'project-uuid',
    'read'
);

-- Check if user can participate in session
SELECT can_participate_in_session(
    'user-uuid',
    'session-uuid'
);
```

### Get User's Effective Permission

```sql
-- Get user's permission level for a project
SELECT get_user_project_permission(
    'user-uuid',
    'project-uuid'
);
```

## Testing

The migration includes comprehensive test data that demonstrates:

1. **Garth's Personal Workspace** (Pro plan)
   - Summer 2024 Album project
   - Solo Work project
   - Different permission levels for different users

2. **Publishing Account** (Enterprise plan)
   - Artist A's Album project
   - Cross-account collaboration

3. **Alex's Learning Account** (Free plan)
   - Learning Projects
   - Basic functionality testing

## Post-Migration Tasks

1. **Update Application Code**
   - Implement project-level permission checks
   - Update API endpoints to use new permission system
   - Update UI to show project-based access controls

2. **Update RLS Policies**
   - Modify existing Row Level Security policies
   - Add project-level access controls

3. **Update Invitation System**
   - Modify invitation flows to support project-level invites
   - Update email templates for project invitations

4. **Update Session Management**
   - Implement session creation and management
   - Add session participation tracking

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Check if user has appropriate project permission
   - Verify account-level membership

2. **Session Participation Issues**
   - Ensure user has at least read_notes permission on project
   - Check session status and participant status

3. **Migration Failures**
   - Check database connection
   - Verify all prerequisites are met
   - Check for existing data conflicts

### Debug Queries

```sql
-- Check user's permissions for all projects
SELECT
    p.name as project_name,
    pp.permission_level,
    pp.granted_at
FROM projects p
LEFT JOIN project_permissions pp ON p.id = pp.project_id
WHERE pp.user_id = 'user-uuid';

-- Check session participants
SELECT
    s.name as session_name,
    sp.status,
    u.email
FROM sessions s
JOIN session_participants sp ON s.id = sp.session_id
JOIN users u ON sp.user_id = u.id
WHERE s.id = 'session-uuid';
```

## Support

For issues or questions about this migration:

1. Check the migration logs
2. Review the test data to understand expected behavior
3. Use the debug queries to troubleshoot permission issues
4. Refer to the project-level permissions documentation in `diagrams/10-personas/`

## Related Documentation

- [Migration Plan](diagrams/10-personas/migration-plan.md)
- [Permission Matrix](diagrams/10-personas/permission-matrix.md)
- [User Personas](diagrams/10-personas/personas.md)
- [Project-Level Permissions Diagram](diagrams/10-personas/project-level-permissions.mermaid)
