# Settings Management System Design

## Settings Hierarchy

**Settings flow from global to specific, with inheritance and overrides:**

```
Org Settings (Global)
├── Account Settings (Inherit from Org, can override)
│   ├── Project Settings (Inherit from Account, can override)
│   │   ├── Song Settings (Inherit from Project, can override)
│   │   └── Session Settings (Inherit from Song, can override)
│   └── User Settings (Inherit from Account, can override)
└── User Settings (Inherit from Org, can override)
```

## Settings Categories

### **1. Org UI Settings (Global)**

- **Theme**: Light/Dark mode, color schemes
- **Language**: Interface language
- **Default Views**: Default interface type (project-centric, account-centric)
- **Global Permissions**: System-wide permission defaults
- **Branding**: Logo, colors, custom CSS
- **Integration Settings**: Third-party integrations
- **Security Policies**: Password requirements, 2FA settings

### **2. Account Settings (Client-Specific)**

- **Billing Settings**: Payment methods, billing cycles
- **Contract Defaults**: Default publishing deals, royalty rates
- **Territory Rights**: Default geographic distribution
- **Access Control**: Account-level permissions
- **Custom Fields**: Account-specific metadata
- **Notification Settings**: Account-specific notifications
- **Branding Overrides**: Account-specific branding

### **3. User UI Settings (Personal)**

- **Personal Preferences**: Theme, language, timezone
- **Dashboard Layout**: Custom dashboard configuration
- **Notification Preferences**: Personal notification settings
- **Keyboard Shortcuts**: Custom shortcuts
- **Workspace Preferences**: Personal workspace settings
- **Privacy Settings**: Personal privacy controls

### **4. Project Settings (Project-Specific)**

- **Project Metadata**: Name, description, timeline
- **Collaboration Settings**: Who can join, invite permissions
- **Rights Defaults**: Default rights for project songs
- **Territory Settings**: Project-specific territory rights
- **Contract Terms**: Project-specific contract modifications
- **Notification Settings**: Project-specific notifications

### **5. Song Settings (Song-Specific)**

- **Song Metadata**: Title, genre, mood, tempo
- **Rights Management**: Author splits, territory rights
- **Contract Overrides**: Song-specific contract terms
- **Access Control**: Song-specific permissions
- **Version Control**: Versioning settings
- **Export Settings**: Export formats and options

### **6. Session Settings (Session-Specific)**

- **Session Configuration**: Recording settings, audio quality
- **Collaboration Tools**: Real-time collaboration settings
- **Recording Settings**: Audio/video recording preferences
- **Session Permissions**: Who can join, participate
- **Session Metadata**: Session notes, objectives

## UI Design for Settings Management

### **1. Settings Navigation**

#### **Main Settings Menu**

```
Settings
├── Personal Settings (User)
├── Account Settings
│   ├── Sony Music Pop Division
│   ├── Universal Music R&B
│   └── Personal Account
├── Project Settings
│   ├── Summer Hits 2024
│   ├── R&B Collaboration
│   └── Personal Album
├── Song Settings
│   ├── Sunny Days
│   ├── Beach Vibes
│   └── Summer Nights
└── Session Settings
    ├── Recording Session 1
    ├── Collaboration Session 2
    └── Mixing Session 3
```

#### **Context-Aware Settings Access**

```typescript
interface SettingsContext {
  level: "org" | "account" | "user" | "project" | "song" | "session";
  entityId: string;
  entityName: string;
  inheritedFrom?: string;
  overrides: SettingOverride[];
}

function getSettingsContext(currentEntity: Entity): SettingsContext {
  return {
    level: currentEntity.type,
    entityId: currentEntity.id,
    entityName: currentEntity.name,
    inheritedFrom: currentEntity.parent?.name,
    overrides: currentEntity.settingOverrides,
  };
}
```

### **2. Settings Inheritance Display**

#### **Settings with Inheritance Indicators**

```
Song Settings: "Sunny Days"
├── Inherited from Project "Summer Hits 2024"
│   ├── Rights Default: Equal splits (inherited)
│   ├── Territory: Worldwide (inherited)
│   └── Contract: Standard publishing (inherited)
├── Overridden Settings
│   ├── Rights: Riley 40%, Writer A 35%, Writer B 25% (overridden)
│   └── Territory: North America only (overridden)
└── Song-Specific Settings
    ├── Genre: Pop (song-specific)
    ├── Mood: Upbeat (song-specific)
    └── Tempo: 120 BPM (song-specific)
```

#### **Inheritance Visualization**

```typescript
interface SettingItem {
  key: string;
  value: any;
  source: 'inherited' | 'overridden' | 'specific';
  inheritedFrom?: string;
  originalValue?: any;
}

function SettingItem({ setting }: { setting: SettingItem }) {
  return (
    <div className="setting-item">
      <label>{setting.key}</label>
      <div className="setting-value">
        <input value={setting.value} />
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

### **3. Settings Management Interface**

#### **Settings Tabs**

```
Settings: "Sunny Days" Song
├── General
│   ├── Title, Genre, Mood, Tempo
│   └── Song-specific settings
├── Rights & Contracts
│   ├── Author splits (overridden)
│   ├── Territory rights (overridden)
│   └── Contract terms (overridden)
├── Access Control
│   ├── Who can view/edit
│   ├── Collaboration permissions
│   └── Export permissions
├── Inheritance
│   ├── Inherited from Project
│   ├── Inherited from Account
│   └── Override history
└── Advanced
    ├── Version control
    ├── Export settings
    └── Integration settings
```

#### **Settings Form with Inheritance**

```typescript
function SettingsForm({ entity, settings }: { entity: Entity; settings: Setting[] }) {
  const [overrides, setOverrides] = useState<SettingOverride[]>([]);

  const handleSettingChange = (key: string, value: any) => {
    // Check if this overrides an inherited setting
    const inheritedSetting = settings.find(s => s.key === key && s.source === 'inherited');

    if (inheritedSetting) {
      // Create override
      setOverrides(prev => [...prev, {
        key,
        value,
        originalValue: inheritedSetting.value,
        inheritedFrom: inheritedSetting.inheritedFrom
      }]);
    } else {
      // Update specific setting
      updateSetting(key, value);
    }
  };

  return (
    <form>
      {settings.map(setting => (
        <SettingItem
          key={setting.key}
          setting={setting}
          onChange={(value) => handleSettingChange(setting.key, value)}
        />
      ))}
    </form>
  );
}
```

### **4. Settings Inheritance Logic**

#### **Settings Resolution**

```typescript
interface SettingsResolver {
  resolveSettings(entity: Entity): Setting[];
  getInheritedSettings(entity: Entity): Setting[];
  getOverriddenSettings(entity: Entity): SettingOverride[];
  getSpecificSettings(entity: Entity): Setting[];
}

class SettingsResolver {
  resolveSettings(entity: Entity): Setting[] {
    const inherited = this.getInheritedSettings(entity);
    const overridden = this.getOverriddenSettings(entity);
    const specific = this.getSpecificSettings(entity);

    // Merge settings with overrides taking precedence
    return this.mergeSettings(inherited, overridden, specific);
  }

  getInheritedSettings(entity: Entity): Setting[] {
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

### **5. Settings Persistence**

#### **Database Schema**

```sql
-- Settings tables
CREATE TABLE org_settings (
  id UUID PRIMARY KEY,
  org_id UUID REFERENCES orgs(id),
  setting_key VARCHAR(255) NOT NULL,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(org_id, setting_key)
);

CREATE TABLE account_settings (
  id UUID PRIMARY KEY,
  account_id UUID REFERENCES accounts(id),
  setting_key VARCHAR(255) NOT NULL,
  setting_value JSONB NOT NULL,
  inherited_from VARCHAR(50), -- 'org', 'parent_account'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(account_id, setting_key)
);

CREATE TABLE project_settings (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  setting_key VARCHAR(255) NOT NULL,
  setting_value JSONB NOT NULL,
  inherited_from VARCHAR(50), -- 'account', 'parent_project'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, setting_key)
);

CREATE TABLE song_settings (
  id UUID PRIMARY KEY,
  song_id UUID REFERENCES songs(id),
  setting_key VARCHAR(255) NOT NULL,
  setting_value JSONB NOT NULL,
  inherited_from VARCHAR(50), -- 'project', 'account'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(song_id, setting_key)
);

CREATE TABLE user_settings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  setting_key VARCHAR(255) NOT NULL,
  setting_value JSONB NOT NULL,
  scope VARCHAR(50), -- 'global', 'account', 'project'
  scope_id UUID, -- ID of the scoped entity
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, setting_key, scope, scope_id)
);
```

## Implementation Benefits

### **1. Flexible Inheritance**

- **Default Values**: Settings inherit from parent entities
- **Selective Overrides**: Override specific settings when needed
- **Clear Lineage**: Always know where settings come from

### **2. Context-Aware Settings**

- **Entity-Specific**: Settings appropriate to each entity type
- **Role-Based Access**: Different users see different settings
- **Scope Management**: Settings scoped to appropriate entities

### **3. User Experience**

- **Consistent Interface**: Same settings interface across all entities
- **Clear Inheritance**: Visual indicators show inheritance and overrides
- **Easy Management**: Simple to manage settings at any level

## Conclusion

**Settings management** requires:

1. **Hierarchical Inheritance**: Settings flow from global to specific
2. **Selective Overrides**: Ability to override inherited settings
3. **Context-Aware UI**: Settings appropriate to each entity type
4. **Clear Visualization**: Show inheritance and override relationships
5. **Flexible Persistence**: Store settings at appropriate levels

This approach provides a comprehensive settings management system that handles all levels of settings while maintaining clarity about inheritance and overrides.
