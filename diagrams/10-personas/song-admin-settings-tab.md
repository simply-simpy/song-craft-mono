# Song-Level Admin/Settings Tab: Inheritance and Overrides

## The Concept

**Each song should have an Admin/Settings tab** that shows:

- How song settings are inherited from the account
- Where settings are overridden at the song level
- Clear visibility into the inheritance hierarchy

## The Inheritance Model

### **Account-Level Settings (Default)**

- **Billing**: Who pays for this song's storage/processing
- **Contract Terms**: Default publishing deals and royalty rates
- **Territory Rights**: Default geographic distribution rights
- **Access Control**: Who can view/edit this song
- **Legal Rights**: Default rights structure for all authors

### **Song-Level Overrides**

- **Custom Rights**: Adjusted splits for specific authors
- **Special Terms**: Song-specific contract modifications
- **Custom Access**: Additional collaborators or restricted access
- **Territory Adjustments**: Different geographic rights for this song
- **Billing Overrides**: Special billing arrangements for this song

## UI Design: Song Admin/Settings Tab

### **Tab Structure**

```
Song: "Sunny Days"
├── General Info
├── Collaborators
├── Versions
├── Sessions
└── Admin/Settings ← New Tab
    ├── Account Inheritance
    ├── Song Overrides
    ├── Rights Management
    └── Access Control
```

### **Account Inheritance Section**

```
Account Inheritance (Sony Music Pop Division)
├── Billing: Sony Music pays for storage/processing
├── Contract: Standard publishing deal (50/50 split)
├── Territory: Worldwide distribution rights
├── Access: Pop Division team members only
└── Legal: All authors get equal rights by default
```

### **Song Overrides Section**

```
Song Overrides
├── Rights Adjustments:
│   ├── Riley: 40% (overridden from 33.33%)
│   ├── Writer A: 35% (overridden from 33.33%)
│   └── Writer B: 25% (overridden from 33.33%)
├── Special Terms:
│   ├── Territory: North America only (overridden from Worldwide)
│   └── Contract: Exclusive licensing (overridden from Standard)
└── Access Control:
    ├── Additional Collaborators: Producer X (not in Pop Division)
    └── Restricted Access: Writer B can only view, not edit
```

## Implementation Details

### **Database Schema**

```sql
-- Song settings table
CREATE TABLE song_settings (
  id UUID PRIMARY KEY,
  song_id UUID REFERENCES songs(id),
  account_id UUID REFERENCES accounts(id),

  -- Inheritance tracking
  inherits_from_account BOOLEAN DEFAULT true,

  -- Override fields
  billing_override JSONB,
  contract_override JSONB,
  territory_override JSONB,
  access_override JSONB,
  rights_override JSONB,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Rights overrides table
CREATE TABLE song_rights_overrides (
  id UUID PRIMARY KEY,
  song_id UUID REFERENCES songs(id),
  user_id UUID REFERENCES users(id),

  -- Override details
  split_percentage DECIMAL(5,2),
  territory_rights JSONB,
  contract_terms JSONB,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **API Endpoints**

```typescript
// Get song settings with inheritance
GET /songs/:id/settings
{
  "accountInheritance": {
    "accountId": "sony-pop-division",
    "accountName": "Sony Music Pop Division",
    "settings": {
      "billing": "Sony Music pays for storage/processing",
      "contract": "Standard publishing deal (50/50 split)",
      "territory": "Worldwide distribution rights",
      "access": "Pop Division team members only",
      "legal": "All authors get equal rights by default"
    }
  },
  "songOverrides": {
    "rightsAdjustments": [
      { "userId": "riley", "percentage": 40, "default": 33.33 },
      { "userId": "writer-a", "percentage": 35, "default": 33.33 },
      { "userId": "writer-b", "percentage": 25, "default": 33.33 }
    ],
    "specialTerms": {
      "territory": "North America only",
      "contract": "Exclusive licensing"
    },
    "accessControl": {
      "additionalCollaborators": ["producer-x"],
      "restrictedAccess": ["writer-b"]
    }
  }
}

// Update song settings
PUT /songs/:id/settings
{
  "rightsOverrides": [
    { "userId": "riley", "percentage": 40 },
    { "userId": "writer-a", "percentage": 35 },
    { "userId": "writer-b", "percentage": 25 }
  ],
  "territoryOverride": "North America only",
  "contractOverride": "Exclusive licensing"
}
```

## User Experience Benefits

### **1. Transparency**

- **Clear Inheritance**: Users can see exactly what settings come from the account
- **Override Visibility**: Users can see what's been customized for this song
- **Change Tracking**: Users can see when and why settings were changed

### **2. Flexibility**

- **Song-Specific Adjustments**: Customize settings per song when needed
- **Gradual Overrides**: Start with account defaults, override as needed
- **Collaborative Rights**: Adjust rights for specific collaborators

### **3. Administrative Control**

- **Account Management**: Publishers can see how their account settings are applied
- **Song Management**: Song-specific adjustments are clearly visible
- **Audit Trail**: Track changes and overrides over time

## Real-World Example

### **"Sunny Days" Song Settings**

```
Account Inheritance (Sony Music Pop Division):
├── Billing: Sony Music pays for storage/processing
├── Contract: Standard publishing deal (50/50 split)
├── Territory: Worldwide distribution rights
├── Access: Pop Division team members only
└── Legal: All authors get equal rights by default

Song Overrides:
├── Rights Adjustments:
│   ├── Riley: 40% (overridden from 33.33%)
│   ├── Writer A: 35% (overridden from 33.33%)
│   └── Writer B: 25% (overridden from 33.33%)
├── Special Terms:
│   ├── Territory: North America only (overridden from Worldwide)
│   └── Contract: Exclusive licensing (overridden from Standard)
└── Access Control:
    ├── Additional Collaborators: Producer X (not in Pop Division)
    └── Restricted Access: Writer B can only view, not edit
```

## Implementation Benefits

### **1. Clear Hierarchy**

- **Account Defaults**: Clear baseline settings from the account
- **Song Overrides**: Specific adjustments for this song
- **Inheritance Chain**: Clear understanding of where settings come from

### **2. Flexible Management**

- **Gradual Customization**: Start with defaults, customize as needed
- **Song-Specific Needs**: Handle special cases per song
- **Collaborative Adjustments**: Adjust rights for specific collaborators

### **3. Administrative Transparency**

- **Publisher Visibility**: Publishers can see how their settings are applied
- **Song Management**: Clear visibility into song-specific adjustments
- **Audit Trail**: Track changes and overrides over time

## Conclusion

**A song-level Admin/Settings tab** would provide perfect transparency and flexibility:

1. **Account Inheritance**: Clear visibility into what settings come from the account
2. **Song Overrides**: Clear visibility into what's been customized for this song
3. **Rights Management**: Easy adjustment of rights and splits per song
4. **Administrative Control**: Publishers can manage both account defaults and song-specific adjustments
5. **Audit Trail**: Track changes and overrides over time

This approach gives users the best of both worlds - the simplicity of account-level defaults with the flexibility of song-level customization when needed.
