# Figma's Multi-Tenant Model: Lessons for SongCraft

## Figma's Structure (Similar to SongCraft)

### **Teams** (Similar to Accounts)

- **Purpose**: Business/legal separation
- **Billing**: Separate billing per team
- **Permissions**: Team-level access control
- **Collaboration**: Team members can work together

### **Projects** (Similar to Projects)

- **Purpose**: Creative organization
- **Content**: Files/designs grouped by project
- **Access**: Project-level permissions
- **Workflow**: Natural creative grouping

### **Files** (Similar to Songs)

- **Purpose**: Individual creative work
- **Ownership**: Belongs to a project/team
- **Collaboration**: Multiple people can work on files
- **Versioning**: Track changes over time

## How Figma Solved the UX Challenge

### **1. Unified File View**

- **All files visible** in one interface
- **Team context** shown as metadata
- **Project grouping** for organization
- **Team switching** only when needed

### **2. Smart Defaults**

- **Recent files** shown first
- **Team context** remembered from last session
- **Project context** maintained during work
- **Automatic team switching** for shared files

### **3. Contextual Team Switching**

- **File sharing** automatically switches team context
- **Collaboration** maintains team context
- **Admin tasks** require explicit team switching
- **Billing** shows team-specific information

### **4. Role-Based Interface**

- **Designers**: See unified file view
- **Team Admins**: See team management interface
- **Billing Users**: See team billing interface
- **Hybrid Users**: Can switch between interfaces

## Figma's Key UX Principles

### **1. Content-First Design**

- **Files are primary** - not teams
- **Teams are context** - not barriers
- **Projects are organization** - not containers
- **Collaboration is natural** - not restricted

### **2. Progressive Disclosure**

- **Team context** shown when relevant
- **Admin features** hidden from creators
- **Billing information** available on demand
- **Permission details** shown when needed

### **3. Smart Context Switching**

- **Automatic switching** for shared content
- **Manual switching** for admin tasks
- **Context persistence** during work sessions
- **Clear indicators** when context changes

### **4. Unified Search**

- **Search across all files** regardless of team
- **Team context** shown in search results
- **Automatic team switching** when opening files
- **Filter by team** when needed

## Lessons for SongCraft

### **1. Unified Song View**

- **All songs visible** in one interface
- **Account context** shown as metadata
- **Project grouping** for organization
- **Account switching** only when needed

### **2. Smart Defaults**

- **Recent songs** shown first
- **Account context** remembered from last session
- **Project context** maintained during work
- **Automatic account switching** for shared songs

### **3. Contextual Account Switching**

- **Song sharing** automatically switches account context
- **Collaboration** maintains account context
- **Admin tasks** require explicit account switching
- **Billing** shows account-specific information

### **4. Role-Based Interface**

- **Songwriters**: See unified song view
- **Account Admins**: See account management interface
- **Billing Users**: See account billing interface
- **Hybrid Users**: Can switch between interfaces

## Figma's Implementation Details

### **Backend Architecture**

- **Multi-tenant database** with team isolation
- **RLS policies** enforce team boundaries
- **Billing tracking** per team
- **Audit trails** for all operations

### **Frontend Architecture**

- **Team context** managed globally
- **File-centric** primary interface
- **Team switching** handled transparently
- **Role-based** feature visibility

### **API Design**

- **Team context** required for all operations
- **Cross-team queries** for unified views
- **Team-specific endpoints** for admin tasks
- **Context switching** handled automatically

## Key Differences from Current SongCraft

### **Current SongCraft**

- **Account-centric** interface
- **Manual account switching** required
- **Account-scoped** search and views
- **Admin complexity** exposed to creators

### **Figma-Inspired SongCraft**

- **Song-centric** interface
- **Automatic context switching** when needed
- **Unified search** across all songs
- **Admin complexity** hidden from creators

## Implementation Strategy

### **Phase 1: Unified Song View**

- **Show all songs** in one list
- **Account context** as metadata
- **Project grouping** for organization
- **Account switching** only when needed

### **Phase 2: Smart Context Switching**

- **Automatic switching** for shared songs
- **Context persistence** during work
- **Clear indicators** when context changes
- **Manual switching** for admin tasks

### **Phase 3: Role-Based Interface**

- **Songwriter interface** focused on creation
- **Admin interface** focused on management
- **Hybrid interface** for users who need both
- **Progressive disclosure** of complexity

## Benefits of Figma's Approach

### **For Creators**

- **Unified workflow** focused on content
- **Easy access** to all their work
- **Natural collaboration** without barriers
- **Contextual information** when needed

### **For Admins**

- **Full team control** for business operations
- **Clear data separation** for legal compliance
- **Billing accuracy** for financial management
- **Team management** for client projects

### **For the System**

- **Maintains data integrity** through team structure
- **Enforces security** through RLS policies
- **Supports billing** through team tracking
- **Enables compliance** through audit trails

## Conclusion

**Figma proves that multi-tenant systems can have great UX** by:

1. **Making content primary** - not organizational structure
2. **Hiding complexity** from creators while maintaining it for admins
3. **Enabling smart context switching** that feels natural
4. **Providing role-appropriate interfaces** for different user types

**SongCraft can learn from Figma's success** by implementing similar UX patterns:

- Unified song view with account context as metadata
- Smart account switching that happens automatically
- Role-based interfaces that hide complexity from creators
- Progressive disclosure of admin features when needed

The key insight: **Multi-tenant systems don't have to be complex for end users** - they can provide the business/legal benefits while maintaining a simple, content-focused experience for creators.
