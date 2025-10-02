# Songs ↔ Projects: Association Relationship (Not Parent-Child)

## The Corrected Understanding

**Songs and projects have an association relationship, not a parent-child relationship** - just like accounts and orgs.

## Association vs Parent-Child

### **Parent-Child Relationship (Wrong)**

```
Project (Parent)
├── Song A (Child)
├── Song B (Child)
└── Song C (Child)
```

**Problems:**

- Songs can only belong to one project
- Moving songs between projects is complex
- Songs can't exist independently of projects

### **Association Relationship (Correct)**

```
Song A ↔ Project 1 (Summer Hits)
Song A ↔ Project 2 (Taylor Swift Album)
Song B ↔ Project 1 (Summer Hits)
Song C ↔ Project 3 (R&B Collaboration)
```

**Benefits:**

- Songs can belong to multiple projects
- Projects can include multiple songs
- Songs can exist independently
- Easy to add/remove songs from projects

## Real-World Examples

### **Song: "Sunny Days"**

```
Song: "Sunny Days"
├── Associated Projects:
│   ├── "Summer Hits 2024" Project
│   ├── "Pop Compilation" Project
│   └── "Riley's Best Of" Project
├── Authors: Riley + Writer A + Writer B
├── Rights: 40% Riley, 35% Writer A, 25% Writer B
└── Account Context: Sony Music Pop Division
```

### **Project: "Summer Hits 2024"**

```
Project: "Summer Hits 2024"
├── Associated Songs:
│   ├── "Sunny Days"
│   ├── "Beach Vibes"
│   ├── "Summer Nights"
│   └── "Vacation Mode"
├── Collaborators: Riley + 5 other writers
├── Timeline: Summer 2024 release
└── Account Context: Sony Music Pop Division
```

## Database Design Implications

### **Association Tables**

```sql
-- Song-Project associations
CREATE TABLE song_project_associations (
  id UUID PRIMARY KEY,
  song_id UUID REFERENCES songs(id),
  project_id UUID REFERENCES projects(id),
  association_type VARCHAR(50), -- 'primary', 'secondary', 'compilation'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(song_id, project_id)
);

-- Song-Account associations (for billing/context)
CREATE TABLE song_account_associations (
  id UUID PRIMARY KEY,
  song_id UUID REFERENCES songs(id),
  account_id UUID REFERENCES accounts(id),
  association_type VARCHAR(50), -- 'billing', 'context', 'rights'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(song_id, account_id)
);
```

### **Song Table (Independent)**

```sql
CREATE TABLE songs (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  lyrics TEXT,
  music_data JSONB,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
  -- No project_id or account_id foreign keys
);
```

### **Project Table (Independent)**

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
  -- No account_id foreign key
);
```

## UI Implications

### **Song View**

```
Song: "Sunny Days"
├── General Info
├── Collaborators
├── Versions
├── Sessions
├── Associated Projects ← New Section
│   ├── "Summer Hits 2024" (Primary)
│   ├── "Pop Compilation" (Secondary)
│   └── "Riley's Best Of" (Compilation)
├── Account Context
│   ├── Sony Music Pop Division (Billing)
│   └── Universal Music R&B (Rights)
└── Admin/Settings
```

### **Project View**

```
Project: "Summer Hits 2024"
├── Overview
├── Associated Songs ← New Section
│   ├── "Sunny Days" (Primary)
│   ├── "Beach Vibes" (Primary)
│   ├── "Summer Nights" (Primary)
│   └── "Vacation Mode" (Primary)
├── Collaborators
├── Timeline
└── Account Context
```

## Benefits of Association Model

### **1. Flexibility**

- **Multi-Project Songs**: Songs can belong to multiple projects
- **Project Compilations**: Easy to create compilation projects
- **Cross-Project Collaboration**: Songs can span multiple projects

### **2. Independence**

- **Song Autonomy**: Songs can exist independently of projects
- **Project Autonomy**: Projects can exist independently of songs
- **Easy Management**: Add/remove songs from projects easily

### **3. Real-World Alignment**

- **Industry Practice**: Matches how music industry actually works
- **Compilation Albums**: Songs appear on multiple albums/projects
- **Cross-Project Work**: Writers work on songs that span multiple projects

## Implementation Examples

### **Adding Song to Project**

```typescript
// Add song to project
await addSongToProject({
  songId: "sunny-days-id",
  projectId: "summer-hits-2024-id",
  associationType: "primary",
});

// Song can now be associated with multiple projects
await addSongToProject({
  songId: "sunny-days-id",
  projectId: "pop-compilation-id",
  associationType: "secondary",
});
```

### **Querying Songs by Project**

```typescript
// Get all songs in a project
const projectSongs = await getSongsByProject("summer-hits-2024-id");

// Get all projects for a song
const songProjects = await getProjectsBySong("sunny-days-id");
```

### **Cross-Project Search**

```typescript
// Search songs across all projects
const allSongs = await searchSongs({
  query: "summer",
  includeProjects: true,
});

// Results show which projects each song belongs to
```

## The Key Insight

**Songs and projects are independent entities that can be associated with each other** - just like accounts and orgs. This provides:

1. **Maximum Flexibility**: Songs can belong to multiple projects
2. **Real-World Alignment**: Matches how music industry actually works
3. **Easy Management**: Simple to add/remove associations
4. **Independent Lifecycle**: Songs and projects can exist independently

This association model is much more flexible and realistic than a parent-child relationship, and it aligns perfectly with how the music industry actually operates.
