# Project-Level Permission Matrix

## **New Permission Structure**

### **Account Level** (Workspace Management)

- **Account Owner**: Full control over the account
- **Account Manager**: Can manage projects and invite users
- **Account Member**: Basic account access (no special permissions)

### **Project Level** (Song/Content Management)

- **Read**: View songs, download exports, view project info
- **Read + Notes**: All Read permissions + add comments/notes
- **Read + Write**: All Read + Notes + edit songs, record takes
- **Full Access**: All Read + Write + create sessions, manage project

### **Session Level** (Collaboration Management)

- **Session Creator**: Can create and manage sessions
- **Session Participant**: Can accept invites and participate
- **Session Observer**: Can view session but not participate

---

## **Permission Matrix**

| Action                  | Account Owner | Account Manager | Read | Read + Notes | Read + Write | Full Access |
| ----------------------- | ------------- | --------------- | ---- | ------------ | ------------ | ----------- |
| **Account Management**  |
| Create/Delete Projects  | ✅            | ✅              | ❌   | ❌           | ❌           | ❌          |
| Invite Users to Account | ✅            | ✅              | ❌   | ❌           | ❌           | ❌          |
| Manage Account Settings | ✅            | ❌              | ❌   | ❌           | ❌           | ❌          |
| **Project Management**  |
| View Project            | ✅            | ✅              | ✅   | ✅           | ✅           | ✅          |
| Edit Project Settings   | ✅            | ✅              | ❌   | ❌           | ❌           | ✅          |
| Create Sessions         | ✅            | ✅              | ❌   | ❌           | ❌           | ✅          |
| **Song Management**     |
| View Songs              | ✅            | ✅              | ✅   | ✅           | ✅           | ✅          |
| Edit Songs              | ✅            | ✅              | ❌   | ❌           | ✅           | ✅          |
| Create Songs            | ✅            | ✅              | ❌   | ❌           | ❌           | ✅          |
| Delete Songs            | ✅            | ✅              | ❌   | ❌           | ❌           | ✅          |
| **Collaboration**       |
| Add Comments/Notes      | ✅            | ✅              | ❌   | ✅           | ✅           | ✅          |
| Record Takes            | ✅            | ✅              | ❌   | ❌           | ✅           | ✅          |
| Accept Session Invites  | ✅            | ✅              | ❌   | ❌           | ❌           | ✅          |
| **Session Management**  |
| Create Sessions         | ✅            | ✅              | ❌   | ❌           | ❌           | ✅          |
| Manage Sessions         | ✅            | ✅              | ❌   | ❌           | ❌           | ✅          |
| Participate in Sessions | ✅            | ✅              | ❌   | ❌           | ❌           | ✅          |

---

## **Invitation Flow Examples**

### **1. Account-Level Invitation**

```
Garth (Owner) → Invites Marcus to Account
Result: Marcus becomes Account Member
Default: No project access (must be granted per project)
```

### **2. Project-Level Invitation**

```
Garth (Owner) → Invites Marcus to "Summer 2024 Album" Project
Options: Read, Read + Notes, Read + Write, Full Access
Result: Marcus gets specified access to that project only
```

### **3. Session-Level Invitation**

```
Garth (Owner) → Creates "Writing Session" for "Summer 2024 Album"
Requirement: Marcus must have project access to accept
Result: Marcus can participate in session if he has project access
```

---

## **Benefits of This Structure**

### **1. Granular Control**

- Account owners can give different access levels per project
- Users only see what they have access to
- Clear permission boundaries

### **2. Security**

- No accidental access to sensitive projects
- Explicit permission grants required
- Easy to audit and manage

### **3. Flexibility**

- Mix and match permission levels per project
- Easy to change access levels
- Supports different collaboration patterns

### **4. User Experience**

- Clear understanding of what access they have
- No confusion about permissions
- Intuitive invitation process

---

## **Real-World Scenarios**

### **Scenario 1: Garth's Personal Account**

- **Garth**: Account Owner (Full Access to all projects)
- **Marcus**: Read + Write on "Summer 2024 Album"
- **Elena**: Read + Notes on "Summer 2024 Album" (for feedback)
- **Alex**: Read on "Summer 2024 Album" (learning)

### **Scenario 2: Publishing Company Account**

- **Sarah**: Account Manager (can create projects, invite users)
- **Artist A**: Full Access on "Artist A's Album" project
- **Artist B**: Full Access on "Artist B's EP" project
- **Producer**: Read + Write on multiple projects
- **A&R**: Read + Notes on all projects (for review)

### **Scenario 3: Collaboration Project**

- **Garth**: Account Owner, Full Access
- **Marcus**: Read + Write (can edit songs)
- **Elena**: Read + Notes (can provide feedback)
- **Session**: All three can participate in writing sessions
