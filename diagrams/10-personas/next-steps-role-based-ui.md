# Next Steps: Role-Based UI Views

## Current State Analysis

Based on our corrected understanding, we need to:

1. **Define roles** based on the corrected account/project model
2. **Create different UI views** for each role
3. **Implement the inheritance/override system** for song settings

## Role Definition (Corrected)

### **Primary Roles**

#### **1. Songwriter/Creator**

- **Primary Focus**: Creative work and collaboration
- **Interface**: Project-centric view
- **Permissions**: Create/edit songs, collaborate on projects
- **Account Context**: Minimal - only see account as metadata

#### **2. Publisher Admin**

- **Primary Focus**: Managing work and writers for clients
- **Interface**: Account-centric view with project management
- **Permissions**: Manage account settings, oversee projects, handle billing
- **Account Context**: Full - manage multiple client accounts

#### **3. Producer/Creative Director**

- **Primary Focus**: Both creative and business operations
- **Interface**: Hybrid - can switch between project and account views
- **Permissions**: Creative work + account management
- **Account Context**: Contextual - switch based on current task

#### **4. Finance Manager**

- **Primary Focus**: Billing and financial operations
- **Interface**: Billing-centric view
- **Permissions**: View billing, manage payments, generate reports
- **Account Context**: Financial - account-specific billing data

## UI View Design

### **1. Songwriter/Creator Interface**

#### **Primary View: Project-Centric**

```
Navigation:
├── All Projects (unified view across accounts)
├── Recent Songs
├── Collaborations
└── Account Context (metadata only)

Project View:
├── Project: "Summer Hits 2024"
│   ├── Songs: All songs in project
│   ├── Collaborators: All project collaborators
│   ├── Sessions: Project sessions
│   └── Timeline: Project milestones
└── Account Context: "Sony Music Pop Division" (metadata)

Song View:
├── General Info
├── Collaborators
├── Versions
├── Sessions
└── Admin/Settings (inheritance + overrides)
```

#### **Key Features**

- **Unified Project View**: See all projects across accounts
- **Account Context as Metadata**: Show account info but don't make it primary
- **Project-Based Organization**: Natural creative grouping
- **Cross-Account Collaboration**: Work with writers from different accounts

### **2. Publisher Admin Interface**

#### **Primary View: Account-Centric**

```
Navigation:
├── Client Accounts
├── Projects Overview
├── Writers Management
├── Billing & Reports
└── Account Settings

Account View:
├── Account: "Sony Music Pop Division"
│   ├── Projects: All projects in this account
│   ├── Writers: All writers in this account
│   ├── Billing: Account billing and usage
│   └── Settings: Account-level defaults
└── Project Management: Oversee all projects

Project Management:
├── Project: "Summer Hits 2024"
│   ├── Overview: Project status and progress
│   ├── Writers: Manage project collaborators
│   ├── Songs: Oversee song development
│   └── Billing: Track project costs
```

#### **Key Features**

- **Account-Centric Navigation**: Manage client accounts
- **Project Oversight**: Monitor and manage projects
- **Writer Management**: Manage writers and collaborators
- **Billing Control**: Track usage and costs per account

### **3. Producer/Creative Director Interface**

#### **Primary View: Hybrid (Can Switch)**

```
Navigation:
├── Projects (creative work)
├── Accounts (business management)
├── Collaborations
└── Context Switcher

Project View (Creative Mode):
├── All Projects (unified view)
├── Recent Songs
├── Collaborations
└── Creative Tools

Account View (Business Mode):
├── Client Accounts
├── Project Management
├── Writer Management
└── Billing Overview
```

#### **Key Features**

- **Context Switching**: Switch between creative and business modes
- **Dual Interface**: Access both project and account views
- **Flexible Workflow**: Adapt interface to current task

### **4. Finance Manager Interface**

#### **Primary View: Billing-Centric**

```
Navigation:
├── Account Billing
├── Payment Management
├── Financial Reports
└── Usage Tracking

Billing View:
├── Account: "Sony Music Pop Division"
│   ├── Billing Summary: Current charges and usage
│   ├── Payment History: Past payments and invoices
│   ├── Usage Tracking: Storage, processing, collaboration costs
│   └── Financial Reports: Revenue and cost analysis
└── Cross-Account Overview: All client billing
```

#### **Key Features**

- **Billing Focus**: Primary focus on financial operations
- **Account-Specific Data**: Billing data per client account
- **Financial Reporting**: Generate reports and analytics
- **Payment Management**: Handle payments and invoicing

## Implementation Priority

### **Phase 1: Core Role Views**

1. **Songwriter Interface**: Project-centric view with account context as metadata
2. **Publisher Admin Interface**: Account-centric view with project management
3. **Role Detection**: Determine user's primary role and show appropriate interface

### **Phase 2: Advanced Features**

1. **Song Admin/Settings Tab**: Inheritance and override system
2. **Cross-Account Projects**: Projects that span multiple accounts
3. **Hybrid Interface**: For producers who need both views

### **Phase 3: Specialized Views**

1. **Finance Manager Interface**: Billing-centric view
2. **Advanced Role Management**: Custom roles and permissions
3. **Audit Trail**: Track changes and overrides

## Technical Implementation

### **Role Detection**

```typescript
interface UserRole {
  primaryRole:
    | "songwriter"
    | "publisher_admin"
    | "producer"
    | "finance_manager";
  secondaryRoles: string[];
  accountContext: AccountContext[];
  projectAccess: ProjectAccess[];
}

// Determine interface based on role
function getInterfaceForRole(role: UserRole): InterfaceType {
  switch (role.primaryRole) {
    case "songwriter":
      return "project-centric";
    case "publisher_admin":
      return "account-centric";
    case "producer":
      return "hybrid";
    case "finance_manager":
      return "billing-centric";
  }
}
```

### **View Components**

```typescript
// Project-centric view for songwriters
<ProjectCentricView>
  <ProjectList projects={allProjects} />
  <AccountContext account={currentAccount} />
  <SongAdminSettings song={selectedSong} />
</ProjectCentricView>

// Account-centric view for publishers
<AccountCentricView>
  <AccountList accounts={clientAccounts} />
  <ProjectManagement projects={accountProjects} />
  <WriterManagement writers={accountWriters} />
</AccountCentricView>
```

## Next Steps

### **Immediate Actions**

1. **Define role detection logic** - How do we determine a user's primary role?
2. **Create project-centric interface** - Primary view for songwriters
3. **Create account-centric interface** - Primary view for publisher admins
4. **Implement song admin/settings tab** - Inheritance and override system

### **Questions to Answer**

1. **Role Assignment**: How are roles assigned to users? By account membership?
2. **Interface Switching**: Can users switch between interfaces or is it role-locked?
3. **Permission Inheritance**: How do permissions flow from account to project to song?
4. **Cross-Account Projects**: How do we handle projects that span multiple accounts?

## Conclusion

**Yes, we need to define roles and create different UI views.** The key insight is that:

1. **Songwriters** need project-centric views with account context as metadata
2. **Publisher Admins** need account-centric views for managing clients and projects
3. **Producers** need hybrid views that can switch between creative and business modes
4. **Finance Managers** need billing-centric views for financial operations

The next step is to implement the project-centric interface for songwriters, as this aligns with our corrected understanding that projects are the primary creative and legal units, while accounts are administrative tools.
