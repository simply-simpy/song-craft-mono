# SongCraft Role Names: Industry-Appropriate Terminology

## Current System Roles (From Documentation)

### **Organization Level**

- **Org Owner**: Creates the org, full rights (billing, policies, account creation)
- **Org Admin**: Manages accounts, manages seats, handles compliance
- **Account Manager**: Scoped to one account, doles out Pro seats, invites Owners

### **Account Level**

- **Owner**: Can create/delete songs, invite collaborators, manage splits
- **Collaborator**: Can edit/write, cannot create/delete songs
- **Viewer**: Read-only access, can add comments/notes

### **Global System Roles**

- **Super Admin**: Full system access
- **Admin**: User and account management
- **Support**: Read-only admin access

## Proposed Role Names for Figma-Inspired Interface

### **1. Songwriters: See Unified Song View**

**Role Name**: **Creator** or **Songwriter**

- **Primary Focus**: Song creation and collaboration
- **Interface**: Unified song view across all accounts
- **Permissions**: Create/edit songs, collaborate, view projects
- **Context**: Account context shown as metadata, not barriers

### **2. Account Admins: See Account Management Interface**

**Role Name**: **Account Manager** or **Studio Manager**

- **Primary Focus**: Account operations and team management
- **Interface**: Account-centric management interface
- **Permissions**: Manage account settings, invite users, handle billing
- **Context**: Account switching is primary navigation

### **3. Billing Users: See Account Billing Interface**

**Role Name**: **Finance Manager** or **Billing Admin**

- **Primary Focus**: Financial operations and billing
- **Interface**: Billing and financial reporting interface
- **Permissions**: View billing, manage payments, generate reports
- **Context**: Account-specific financial data

### **4. Hybrid Users: Can Switch Between Interfaces**

**Role Name**: **Producer** or **Creative Director**

- **Primary Focus**: Both creative and business operations
- **Interface**: Can switch between creator and admin interfaces
- **Permissions**: Full creative access + account management
- **Context**: Contextual switching based on current task

## Industry-Appropriate Role Names

### **Music Industry Context**

- **Creator/Songwriter**: Individual creators
- **Producer**: Creative + business hybrid role
- **Studio Manager**: Account/team management
- **Label Manager**: Organization-level management
- **Finance Manager**: Billing and financial operations

### **Business Context**

- **Account Owner**: Full account control
- **Account Manager**: Account operations
- **Billing Admin**: Financial operations
- **Support**: Customer service

## Role Hierarchy and Permissions

### **Creator/Songwriter**

```
Interface: Unified Song View
- See all songs across accounts
- Account context as metadata
- Project-based organization
- Account switching only when needed
```

### **Producer/Creative Director**

```
Interface: Hybrid (Can Switch)
- Creator interface for creative work
- Admin interface for business tasks
- Contextual switching based on task
- Full permissions in both contexts
```

### **Studio Manager/Account Manager**

```
Interface: Account Management
- Account-centric navigation
- Team and permission management
- Billing and contract oversight
- Account switching is primary workflow
```

### **Finance Manager/Billing Admin**

```
Interface: Billing Interface
- Account-specific financial data
- Billing and payment management
- Financial reporting
- Account switching for financial context
```

## Implementation Considerations

### **Role Detection**

- **User Profile**: Store primary role in user profile
- **Context Switching**: Allow role switching for hybrid users
- **Interface Selection**: Automatically show appropriate interface
- **Permission Enforcement**: Role-based access control

### **UI/UX Implications**

- **Creator Interface**: Song-centric, account context as metadata
- **Admin Interface**: Account-centric, full management tools
- **Billing Interface**: Financial data, payment management
- **Hybrid Interface**: Can switch between modes

### **Permission Matrix**

```
Role                | Song Access | Account Mgmt | Billing | Admin
--------------------|-------------|--------------|---------|-------
Creator/Songwriter  | ✅ All      | ❌ None      | ❌ None | ❌ None
Producer            | ✅ All      | ✅ Limited   | ❌ None | ❌ None
Studio Manager      | ✅ Account  | ✅ Full      | ✅ View | ❌ None
Finance Manager     | ✅ Account  | ❌ None      | ✅ Full | ❌ None
Org Admin           | ✅ All      | ✅ All       | ✅ All  | ✅ Limited
Super Admin         | ✅ All      | ✅ All       | ✅ All  | ✅ Full
```

## Recommended Role Names

### **Primary Roles**

1. **Creator** - Unified song view, account context as metadata
2. **Producer** - Hybrid interface, can switch between modes
3. **Account Admin** - Account management interface
4. **Billing Admin** - Billing interface

### **Secondary Roles**

1. **Account Owner** - Full account control
2. **Account Member** - Basic account access
3. **Org Admin** - Organization-level management
4. **Support** - Customer service

## Conclusion

**The role names should reflect the music industry context** while being clear about their primary function:

- **Creator/Songwriter**: Focus on creative work with unified song view
- **Producer**: Hybrid role that can switch between creative and business interfaces
- **Studio Manager**: Account-focused management interface
- **Finance Manager**: Billing and financial operations interface

This approach provides **role-appropriate complexity** - showing account complexity to users who need it (managers, finance) while hiding it from users who don't (creators, songwriters).
