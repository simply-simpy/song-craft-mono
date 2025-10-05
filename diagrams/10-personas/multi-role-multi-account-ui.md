# Multi-Role, Multi-Account UI Design

## The Scenario

**User has different roles on different accounts:**

- **Pro Account**: Owner role (personal account)
- **Sony Music Account**: Collaborator role (client account)
- **Universal Music Account**: Manager role (client account)
- **Independent Label Account**: Viewer role (client account)

## Role Detection and Context Switching

### **User Role Matrix**

```
User: Riley
├── Personal Account (Pro)
│   ├── Role: Owner
│   ├── Permissions: Full control
│   └── Interface: Project-centric (creator view)
├── Sony Music Account
│   ├── Role: Collaborator
│   ├── Permissions: Edit songs, collaborate
│   └── Interface: Project-centric (collaborator view)
├── Universal Music Account
│   ├── Role: Manager
│   ├── Permissions: Manage projects, invite writers
│   └── Interface: Hybrid (manager view)
└── Independent Label Account
    ├── Role: Viewer
    ├── Permissions: Read-only access
    └── Interface: Project-centric (viewer view)
```

## UI Design Solutions

### **1. Context-Aware Interface**

#### **Primary Navigation with Role Indicators**

```
Navigation:
├── All Projects (unified view)
├── Recent Songs
├── Collaborations
└── Account Context Switcher
    ├── Personal Account (Owner) ← Current
    ├── Sony Music (Collaborator)
    ├── Universal Music (Manager)
    └── Independent Label (Viewer)
```

#### **Role-Based Interface Adaptation**

```typescript
interface UserContext {
  currentAccount: {
    id: string;
    name: string;
    role: "owner" | "collaborator" | "manager" | "viewer";
    permissions: string[];
  };
  availableAccounts: AccountContext[];
  interfaceType: "project-centric" | "account-centric" | "hybrid";
}

function getInterfaceForContext(context: UserContext): InterfaceType {
  switch (context.currentAccount.role) {
    case "owner":
    case "collaborator":
    case "viewer":
      return "project-centric";
    case "manager":
      return "hybrid";
    default:
      return "project-centric";
  }
}
```

### **2. Unified Project View with Role Context**

#### **Project List with Role Indicators**

```
All Projects (Unified View)
├── "Summer Hits 2024" (Sony Music - Collaborator)
│   ├── Songs: 4 songs
│   ├── Collaborators: Riley + 5 others
│   ├── Role: Can edit songs, collaborate
│   └── Account: Sony Music Pop Division
├── "R&B Collaboration" (Universal Music - Manager)
│   ├── Songs: 3 songs
│   ├── Collaborators: Riley + 3 others
│   ├── Role: Can manage project, invite writers
│   └── Account: Universal Music R&B Division
├── "Personal Album" (Personal Account - Owner)
│   ├── Songs: 8 songs
│   ├── Collaborators: Riley + 2 others
│   ├── Role: Full control
│   └── Account: Personal Account
└── "Indie Compilation" (Independent Label - Viewer)
    ├── Songs: 12 songs
    ├── Collaborators: Various artists
    ├── Role: Read-only access
    └── Account: Independent Label
```

#### **Role-Based Actions**

```typescript
function getAvailableActions(project: Project, userRole: string): Action[] {
  switch (userRole) {
    case "owner":
      return [
        "create_song",
        "edit_song",
        "delete_song",
        "manage_project",
        "invite_collaborators",
      ];
    case "manager":
      return [
        "create_song",
        "edit_song",
        "manage_project",
        "invite_collaborators",
      ];
    case "collaborator":
      return ["edit_song", "collaborate"];
    case "viewer":
      return ["view_song", "add_notes"];
    default:
      return ["view_song"];
  }
}
```

### **3. Account Context Switcher**

#### **Smart Context Switching**

```
Account Context Switcher
├── Current: Personal Account (Owner)
├── Available Accounts:
│   ├── Sony Music (Collaborator) - 3 active projects
│   ├── Universal Music (Manager) - 2 active projects
│   └── Independent Label (Viewer) - 1 project
└── Quick Actions:
    ├── Switch to Sony Music
    ├── Switch to Universal Music
    └── Switch to Independent Label
```

#### **Context Switching Logic**

```typescript
function switchAccountContext(newAccountId: string): void {
  const newContext = getUserContext(newAccountId);

  // Update interface based on new role
  const newInterface = getInterfaceForContext(newContext);

  // Update UI components
  updateInterface(newInterface);

  // Update project list with new role context
  updateProjectList(newContext);

  // Update available actions
  updateAvailableActions(newContext);
}
```

### **4. Role-Based Permissions in UI**

#### **Dynamic UI Elements**

```typescript
// Song view with role-based actions
function SongView({ song, userRole }: { song: Song; userRole: string }) {
  const availableActions = getAvailableActions(song, userRole);

  return (
    <div>
      <h1>{song.title}</h1>
      <div className="song-content">
        {/* Song content */}
      </div>
      <div className="song-actions">
        {availableActions.includes('edit_song') && (
          <button>Edit Song</button>
        )}
        {availableActions.includes('delete_song') && (
          <button>Delete Song</button>
        )}
        {availableActions.includes('manage_project') && (
          <button>Manage Project</button>
        )}
        {availableActions.includes('invite_collaborators') && (
          <button>Invite Collaborators</button>
        )}
      </div>
    </div>
  );
}
```

#### **Project Management with Role Context**

```typescript
// Project management with role-based features
function ProjectManagement({ project, userRole }: { project: Project; userRole: string }) {
  const canManage = ['owner', 'manager'].includes(userRole);
  const canEdit = ['owner', 'manager', 'collaborator'].includes(userRole);
  const canView = ['owner', 'manager', 'collaborator', 'viewer'].includes(userRole);

  return (
    <div>
      <h1>{project.name}</h1>
      {canManage && (
        <div className="management-tools">
          <button>Manage Project Settings</button>
          <button>Invite Collaborators</button>
          <button>Manage Billing</button>
        </div>
      )}
      {canEdit && (
        <div className="editing-tools">
          <button>Add Song to Project</button>
          <button>Edit Project Details</button>
        </div>
      )}
      {canView && (
        <div className="viewing-tools">
          <button>View Project Details</button>
          <button>Export Project</button>
        </div>
      )}
    </div>
  );
}
```

## Implementation Strategy

### **1. Context Management**

```typescript
interface UserContextState {
  currentAccount: AccountContext;
  availableAccounts: AccountContext[];
  currentRole: string;
  currentPermissions: string[];
  interfaceType: InterfaceType;
}

function useUserContext(): UserContextState {
  const [context, setContext] = useState<UserContextState>();

  const switchAccount = (accountId: string) => {
    const newContext = getUserContext(accountId);
    setContext(newContext);
  };

  return { ...context, switchAccount };
}
```

### **2. Role-Based Component Rendering**

```typescript
// Higher-order component for role-based rendering
function withRoleCheck<T extends object>(
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

// Usage
const ManageProjectButton = withRoleCheck(Button, ['owner', 'manager']);
const EditSongButton = withRoleCheck(Button, ['owner', 'manager', 'collaborator']);
```

### **3. Unified Search with Role Context**

```typescript
function SearchResults({ results, userRole }: { results: SearchResult[]; userRole: string }) {
  return (
    <div>
      {results.map(result => (
        <SearchResultItem
          key={result.id}
          result={result}
          userRole={userRole}
          availableActions={getAvailableActions(result, userRole)}
        />
      ))}
    </div>
  );
}
```

## User Experience Benefits

### **1. Seamless Role Switching**

- **One Interface**: Same interface adapts to different roles
- **Context Awareness**: UI changes based on current role
- **Smooth Transitions**: Easy switching between account contexts

### **2. Clear Role Indicators**

- **Visual Cues**: Clear indication of current role and permissions
- **Action Availability**: Only show actions user can perform
- **Permission Transparency**: User understands their current capabilities

### **3. Unified Experience**

- **Consistent Interface**: Same interface across all accounts
- **Role Adaptation**: Interface adapts to user's role in each account
- **Cross-Account Collaboration**: Easy to work across multiple accounts

## Conclusion

**Multi-role, multi-account UI design** requires:

1. **Context-Aware Interface**: Interface adapts based on current role
2. **Role-Based Permissions**: UI elements show/hide based on permissions
3. **Seamless Context Switching**: Easy switching between account contexts
4. **Unified Experience**: Consistent interface across all accounts
5. **Clear Role Indicators**: User always knows their current role and permissions

This approach provides a seamless experience for users who have different roles across multiple accounts, while maintaining the flexibility and power of the association-based model we've designed.
