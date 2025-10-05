# Next Technical Implementation Steps

## Current State Analysis

Based on our corrected understanding, we need to implement:

1. **Association-based relationships** (not parent-child)
2. **Project-centric interface** for songwriters
3. **Settings inheritance system**
4. **Role-based UI components**
5. **Context-aware navigation**

## Technical Implementation Priority

### **Phase 1: Core Data Model Changes**

#### **1. Database Schema Updates**

```sql
-- Remove parent-child relationships, add associations
-- Current: songs.account_id (parent-child)
-- New: song_account_associations (association)

-- Song-Project associations
CREATE TABLE song_project_associations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  association_type VARCHAR(50) DEFAULT 'primary', -- 'primary', 'secondary', 'compilation'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(song_id, project_id)
);

-- Song-Account associations (for billing/context)
CREATE TABLE song_account_associations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  association_type VARCHAR(50) DEFAULT 'billing', -- 'billing', 'context', 'rights'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(song_id, account_id)
);

-- Remove account_id from songs table
ALTER TABLE songs DROP COLUMN account_id;

-- Remove account_id from projects table
ALTER TABLE projects DROP COLUMN account_id;
```

#### **2. API Endpoint Updates**

```typescript
// New endpoints for associations
GET /songs/:id/associations
POST /songs/:id/associations
DELETE /songs/:id/associations/:associationId

GET /projects/:id/associations
POST /projects/:id/associations
DELETE /projects/:id/associations/:associationId

// Updated song endpoints
GET /songs?project_id=:id // Get songs by project
GET /songs?account_id=:id // Get songs by account
GET /songs?user_id=:id // Get all songs user has access to
```

### **Phase 2: Project-Centric Interface**

#### **1. Project-Centric Navigation Component**

```typescript
// src/components/navigation/ProjectCentricNavigation.tsx
interface ProjectCentricNavigationProps {
  userRole: string;
  currentAccount: AccountContext;
  availableAccounts: AccountContext[];
  onAccountSwitch: (accountId: string) => void;
}

export function ProjectCentricNavigation({
  userRole,
  currentAccount,
  availableAccounts,
  onAccountSwitch
}: ProjectCentricNavigationProps) {
  return (
    <nav className="project-centric-nav">
      <div className="nav-primary">
        <Link to="/projects">All Projects</Link>
        <Link to="/songs">Recent Songs</Link>
        <Link to="/collaborations">Collaborations</Link>
      </div>

      <div className="nav-context">
        <AccountContextSwitcher
          currentAccount={currentAccount}
          availableAccounts={availableAccounts}
          onSwitch={onAccountSwitch}
        />
      </div>
    </nav>
  );
}
```

#### **2. Unified Project List Component**

```typescript
// src/components/projects/UnifiedProjectList.tsx
interface UnifiedProjectListProps {
  projects: ProjectWithContext[];
  userRole: string;
  onProjectSelect: (project: Project) => void;
}

export function UnifiedProjectList({
  projects,
  userRole,
  onProjectSelect
}: UnifiedProjectListProps) {
  return (
    <div className="unified-project-list">
      {projects.map(project => (
        <ProjectCard
          key={project.id}
          project={project}
          userRole={userRole}
          onSelect={onProjectSelect}
        />
      ))}
    </div>
  );
}

interface ProjectCardProps {
  project: ProjectWithContext;
  userRole: string;
  onSelect: (project: Project) => void;
}

function ProjectCard({ project, userRole, onSelect }: ProjectCardProps) {
  const availableActions = getAvailableActions(project, userRole);

  return (
    <div className="project-card">
      <h3>{project.name}</h3>
      <div className="project-context">
        <span className="account-context">{project.accountName}</span>
        <span className="role-indicator">{userRole}</span>
      </div>
      <div className="project-stats">
        <span>{project.songCount} songs</span>
        <span>{project.collaboratorCount} collaborators</span>
      </div>
      <div className="project-actions">
        {availableActions.map(action => (
          <button key={action} onClick={() => handleAction(action, project)}>
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### **Phase 3: Settings Inheritance System**

#### **1. Settings Service**

```typescript
// src/services/settings.service.ts
interface SettingsService {
  getSettings(entity: Entity): Promise<Setting[]>;
  updateSetting(entity: Entity, key: string, value: any): Promise<void>;
  createOverride(entity: Entity, key: string, value: any): Promise<void>;
  removeOverride(entity: Entity, key: string): Promise<void>;
}

export class SettingsServiceImpl implements SettingsService {
  async getSettings(entity: Entity): Promise<Setting[]> {
    const inherited = await this.getInheritedSettings(entity);
    const overridden = await this.getOverriddenSettings(entity);
    const specific = await this.getSpecificSettings(entity);

    return this.mergeSettings(inherited, overridden, specific);
  }

  private async getInheritedSettings(entity: Entity): Promise<Setting[]> {
    switch (entity.type) {
      case "song":
        return this.getProjectSettings(entity.projectId);
      case "project":
        return this.getAccountSettings(entity.accountId);
      case "account":
        return this.getOrgSettings(entity.orgId);
      default:
        return [];
    }
  }
}
```

#### **2. Settings UI Components**

```typescript
// src/components/settings/SettingsForm.tsx
interface SettingsFormProps {
  entity: Entity;
  settings: Setting[];
  onSettingChange: (key: string, value: any) => void;
}

export function SettingsForm({ entity, settings, onSettingChange }: SettingsFormProps) {
  return (
    <div className="settings-form">
      <div className="settings-tabs">
        <button>General</button>
        <button>Rights & Contracts</button>
        <button>Access Control</button>
        <button>Inheritance</button>
        <button>Advanced</button>
      </div>

      <div className="settings-content">
        {settings.map(setting => (
          <SettingItem
            key={setting.key}
            setting={setting}
            onChange={(value) => onSettingChange(setting.key, value)}
          />
        ))}
      </div>
    </div>
  );
}

// src/components/settings/SettingItem.tsx
interface SettingItemProps {
  setting: Setting;
  onChange: (value: any) => void;
}

function SettingItem({ setting, onChange }: SettingItemProps) {
  return (
    <div className="setting-item">
      <label>{setting.key}</label>
      <div className="setting-value">
        <input
          value={setting.value}
          onChange={(e) => onChange(e.target.value)}
        />
        {setting.source === 'inherited' && (
          <span className="inheritance-indicator">
            Inherited from {setting.inheritedFrom}
          </span>
        )}
        {setting.source === 'overridden' && (
          <span className="override-indicator">
            Overridden from {setting.originalValue}
          </span>
        )}
      </div>
    </div>
  );
}
```

### **Phase 4: Role-Based UI Components**

#### **1. Role-Based Component Wrapper**

```typescript
// src/components/common/withRoleCheck.tsx
interface RoleCheckProps {
  requiredRoles: string[];
  userRole: string;
  children: React.ReactNode;
}

export function withRoleCheck<T extends object>(
  Component: React.ComponentType<T>,
  requiredRoles: string[]
) {
  return function RoleCheckedComponent(props: T & { userRole: string }) {
    const { userRole, ...rest } = props;

    if (!requiredRoles.includes(userRole)) {
      return null;
    }

    return <Component {...rest} />;
  };
}

// Usage examples
const ManageProjectButton = withRoleCheck(Button, ['owner', 'manager']);
const EditSongButton = withRoleCheck(Button, ['owner', 'manager', 'collaborator']);
const ViewSongButton = withRoleCheck(Button, ['owner', 'manager', 'collaborator', 'viewer']);
```

#### **2. Context-Aware Action Buttons**

```typescript
// src/components/common/ActionButton.tsx
interface ActionButtonProps {
  action: string;
  userRole: string;
  entity: Entity;
  onClick: () => void;
  children: React.ReactNode;
}

export function ActionButton({ action, userRole, entity, onClick, children }: ActionButtonProps) {
  const canPerform = canPerformAction(action, userRole, entity);

  if (!canPerform) {
    return null;
  }

  return (
    <button onClick={onClick} className={`action-button action-${action}`}>
      {children}
    </button>
  );
}

function canPerformAction(action: string, userRole: string, entity: Entity): boolean {
  const rolePermissions = {
    'owner': ['create', 'edit', 'delete', 'manage', 'invite'],
    'manager': ['create', 'edit', 'manage', 'invite'],
    'collaborator': ['edit', 'collaborate'],
    'viewer': ['view', 'add_notes']
  };

  return rolePermissions[userRole]?.includes(action) || false;
}
```

### **Phase 5: Context-Aware Navigation**

#### **1. User Context Hook**

```typescript
// src/hooks/useUserContext.ts
interface UserContextState {
  currentAccount: AccountContext;
  availableAccounts: AccountContext[];
  currentRole: string;
  currentPermissions: string[];
  interfaceType: InterfaceType;
}

export function useUserContext(): UserContextState & {
  switchAccount: (accountId: string) => void;
  getAvailableActions: (entity: Entity) => string[];
} {
  const [context, setContext] = useState<UserContextState>();

  const switchAccount = (accountId: string) => {
    const newContext = getUserContext(accountId);
    setContext(newContext);
  };

  const getAvailableActions = (entity: Entity): string[] => {
    return getAvailableActionsForRole(entity, context.currentRole);
  };

  return {
    ...context,
    switchAccount,
    getAvailableActions,
  };
}
```

#### **2. Context-Aware Layout**

```typescript
// src/components/layout/ContextAwareLayout.tsx
interface ContextAwareLayoutProps {
  children: React.ReactNode;
}

export function ContextAwareLayout({ children }: ContextAwareLayoutProps) {
  const { currentAccount, currentRole, interfaceType } = useUserContext();

  return (
    <div className={`layout layout-${interfaceType}`}>
      <header className="layout-header">
        <ContextAwareNavigation
          currentAccount={currentAccount}
          currentRole={currentRole}
          interfaceType={interfaceType}
        />
      </header>

      <main className="layout-main">
        {children}
      </main>

      <aside className="layout-sidebar">
        <ContextAwareSidebar
          currentAccount={currentAccount}
          currentRole={currentRole}
        />
      </aside>
    </div>
  );
}
```

## Implementation Order

### **Week 1: Database Schema Updates**

1. Create association tables
2. Remove parent-child foreign keys
3. Update existing data to use associations
4. Create migration scripts

### **Week 2: API Updates**

1. Update song/project endpoints
2. Create association endpoints
3. Update search functionality
4. Add settings endpoints

### **Week 3: Core UI Components**

1. Project-centric navigation
2. Unified project list
3. Role-based components
4. Context-aware layout

### **Week 4: Settings System**

1. Settings service implementation
2. Settings UI components
3. Inheritance visualization
4. Settings persistence

### **Week 5: Integration & Testing**

1. Integrate all components
2. Test role-based functionality
3. Test settings inheritance
4. Test cross-account projects

## Conclusion

**Next technical steps** in order:

1. **Database Schema Updates** - Implement association-based relationships
2. **API Updates** - Update endpoints for new data model
3. **Core UI Components** - Project-centric interface and role-based components
4. **Settings System** - Inheritance and override functionality
5. **Integration & Testing** - Bring everything together

This approach will give us a solid foundation for the corrected system architecture while maintaining backward compatibility during the transition.
