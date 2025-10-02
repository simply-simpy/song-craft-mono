# Organization vs Account Hierarchy

## You're Absolutely Right!

**Sony Music and Universal Music would be organizations (orgs), not accounts.** Let me clarify the proper hierarchy and what each level delineates.

## The Correct Hierarchy

### **Organization Level (Top Level)**

- **Sony Music** (Organization)
- **Universal Music** (Organization)
- **Warner Music** (Organization)
- **Independent Publisher** (Organization)

### **Account Level (Under Organizations)**

- **Artist A Account** (under Sony Music)
- **Artist B Account** (under Sony Music)
- **Production Account** (under Sony Music)
- **Artist C Account** (under Universal Music)

## What Each Level Delineates

### **Organization Delineates: Corporate/Business Entity**

- **Legal Entity**: The actual company (Sony Music Entertainment)
- **Corporate Structure**: Parent company, subsidiaries, divisions
- **Master Contracts**: Corporate-level agreements and partnerships
- **Billing Entity**: Who actually pays the bills
- **Corporate Policies**: Company-wide rules and procedures
- **Brand Identity**: The public-facing brand name

### **Account Delineates: Project/Client/Team Boundaries**

- **Specific Projects**: Individual artists, albums, or projects
- **Contract Terms**: Specific deals within the organization
- **Team Composition**: Who works on this specific project
- **Creative Direction**: Project-specific creative decisions
- **Timeline**: Project deadlines and milestones
- **Budget**: Project-specific financial allocation

## Real-World Examples

### **Sony Music (Organization)**

```
Sony Music Entertainment (Org):
├── Billing: Corporate billing for all accounts
├── Master Contracts: Corporate-level agreements
├── Brand: "Sony Music" public identity
├── Policies: Company-wide rules and procedures
└── Accounts:
    ├── Taylor Swift Account
    │   ├── Contract: Specific recording deal
    │   ├── Team: Taylor's specific team
    │   ├── Budget: Album-specific budget
    │   └── Songs: Taylor's catalog
    ├── Ed Sheeran Account
    │   ├── Contract: Different recording deal
    │   ├── Team: Ed's specific team
    │   ├── Budget: Different budget terms
    │   └── Songs: Ed's catalog
    └── Production Services Account
        ├── Contract: Production service agreement
        ├── Team: Production team
        ├── Budget: Production budget
        └── Songs: Production work
```

### **Universal Music (Organization)**

```
Universal Music Group (Org):
├── Billing: Corporate billing for all accounts
├── Master Contracts: Corporate-level agreements
├── Brand: "Universal Music" public identity
├── Policies: Company-wide rules and procedures
└── Accounts:
    ├── Drake Account
    │   ├── Contract: Specific recording deal
    │   ├── Team: Drake's specific team
    │   ├── Budget: Album-specific budget
    │   └── Songs: Drake's catalog
    ├── Ariana Grande Account
    │   ├── Contract: Different recording deal
    │   ├── Team: Ariana's specific team
    │   ├── Budget: Different budget terms
    │   └── Songs: Ariana's catalog
    └── Publishing Account
        ├── Contract: Publishing agreement
        ├── Team: Publishing team
        ├── Budget: Publishing budget
        └── Songs: Published works
```

## The Multi-Client Freelancer Example (Corrected)

### **Riley (Freelance Songwriter)**

```
Riley's Memberships:
├── Sony Music (Org)
│   └── Pop Division Account
│       ├── Contract: Exclusive publishing deal
│       ├── Territory: North America only
│       ├── Royalty: 50% to Riley, 50% to Sony
│       └── Songs: Pop songs for Sony artists
├── Universal Music (Org)
│   └── R&B Division Account
│       ├── Contract: Non-exclusive licensing
│       ├── Territory: Worldwide
│       ├── Royalty: 70% to Riley, 30% to Universal
│       └── Songs: R&B songs for Universal artists
└── Personal Account (No Org)
    ├── Contract: Self-published
    ├── Territory: Worldwide
    ├── Royalty: 100% to Riley
    └── Songs: Personal projects
```

## Database Structure

### **Organization Table**

```sql
ORG {
  id, name,                           -- Corporate identity
  billing_email, billing_address,     -- Corporate billing
  billing_phone,                      -- Corporate contact
  created_at                          -- System metadata
}
```

### **Account Table**

```sql
ACCOUNT {
  id, parent_org_id,                  -- Belongs to organization
  owner_user_id,                      -- Account owner
  name, description,                  -- Project/team identity
  plan, status,                       -- Account operations
  billing_email,                      -- Account-specific billing
  settings,                           -- Account-specific policies
  is_default, created_at              -- System metadata
}
```

## What This Means for User Experience

### **Organization-Level Switching**

- **Corporate Context**: Switch between different companies
- **Master Contracts**: See corporate-level agreements
- **Billing Overview**: See billing across all accounts in org
- **Corporate Policies**: See company-wide rules

### **Account-Level Switching**

- **Project Context**: Switch between different projects/teams
- **Specific Contracts**: See project-specific deals
- **Team Management**: Manage project-specific teams
- **Creative Work**: Work on project-specific songs

## The Corrected Account Definition

### **Organization Delineates: Corporate/Business Entity Boundaries**

- **Legal Entity**: The actual company
- **Corporate Structure**: Parent company, subsidiaries
- **Master Contracts**: Corporate-level agreements
- **Billing Entity**: Who pays the bills
- **Corporate Policies**: Company-wide rules
- **Brand Identity**: Public-facing brand name

### **Account Delineates: Project/Client/Team Boundaries**

- **Specific Projects**: Individual artists, albums, projects
- **Contract Terms**: Specific deals within the organization
- **Team Composition**: Who works on this specific project
- **Creative Direction**: Project-specific decisions
- **Timeline**: Project deadlines and milestones
- **Budget**: Project-specific financial allocation

## Conclusion

**You're absolutely correct!** The hierarchy should be:

1. **Organization** (Sony Music, Universal Music) - Corporate entity
2. **Account** (Artist A, Artist B, Production) - Project/team within org
3. **Songs** - Creative content within accounts

This makes much more sense and aligns with how the music industry actually works. Organizations are the corporate entities, and accounts are the specific projects, artists, or teams within those organizations.
