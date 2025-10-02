# What Does an Account Delineate?

## The Core Question

**What boundaries does an account create in the SongCraft system?**

## Account Delineates Business/Legal/Contractual Boundaries

### **1. Business Entity Boundaries**

- **Client Organization**: Label, publisher, school, production company
- **Business Identity**: Separate legal entities with different contracts
- **Client Confidentiality**: Work for Client A stays separate from Client B
- **Brand Separation**: Different brands, labels, or business units

### **2. Contractual Boundaries**

- **Publishing Deals**: Different publishing agreements per account
- **Licensing Terms**: Exclusive vs. non-exclusive rights
- **Territory Rights**: Geographic distribution rights and restrictions
- **Royalty Rates**: Different payment terms and rates per account
- **Employment Contracts**: Different employment terms and conditions

### **3. Financial Boundaries**

- **Billing Separation**: Separate invoicing for different clients
- **Payment Terms**: Different payment schedules and methods
- **Usage Tracking**: Track costs and usage per client
- **Tax Reporting**: Separate financial records for accounting
- **Revenue Attribution**: Track income by client/account

### **4. Access Control Boundaries**

- **Team Membership**: Who can access this account
- **Permission Levels**: Different roles and permissions per account
- **Data Isolation**: Prevent cross-client data leaks
- **Security**: Client data stays private and secure
- **Audit Trails**: Track who did what in which context

## What Accounts Do NOT Delineate

### **Creative Content**

- **Songs**: Can be moved between accounts
- **Collaborations**: Authors can work across accounts
- **Creative Process**: Songwriting process is account-agnostic
- **Artistic Vision**: Creative direction isn't account-specific

### **User Identity**

- **User Profile**: Same user across all accounts
- **Personal Preferences**: User settings are global
- **Authentication**: Single login for all accounts
- **User Skills**: Musical abilities aren't account-specific

## Current System Implementation

### **Account Table Structure**

```sql
ACCOUNT {
  id, org_id, parent_org_id, owner_user_id,
  name, description,                    -- Business identity
  plan, status,                        -- Business operations
  billing_email,                      -- Financial
  settings,                           -- Business policies
  is_default, created_at              -- System management
}
```

### **What This Creates**

- **Data Isolation**: Songs in Account A can't be seen by Account B users
- **Billing Separation**: Each account has its own billing and usage tracking
- **Permission Boundaries**: Different access levels per account
- **Contract Context**: Each account represents a different business relationship

## Real-World Examples

### **Multi-Client Freelancer**

```
Riley (Freelance Songwriter):
├── Sony Music Account
│   ├── Contract: Exclusive publishing deal
│   ├── Territory: North America only
│   ├── Royalty: 50% to Riley, 50% to Sony
│   └── Songs: Pop songs for Sony artists
├── Universal Music Account
│   ├── Contract: Non-exclusive licensing
│   ├── Territory: Worldwide
│   ├── Royalty: 70% to Riley, 30% to Universal
│   └── Songs: R&B songs for Universal artists
└── Personal Account
    ├── Contract: Self-published
    ├── Territory: Worldwide
    ├── Royalty: 100% to Riley
    └── Songs: Personal projects
```

### **Label with Multiple Artists**

```
Sony Music (Organization):
├── Artist A Account
│   ├── Contract: Exclusive recording contract
│   ├── Territory: Worldwide
│   ├── Royalty: 15% to artist, 85% to label
│   └── Songs: Artist A's catalog
├── Artist B Account
│   ├── Contract: Different terms
│   ├── Territory: North America only
│   ├── Royalty: 20% to artist, 80% to label
│   └── Songs: Artist B's catalog
└── Production Account
    ├── Contract: Production services
    ├── Territory: Worldwide
    ├── Royalty: 50% to producer, 50% to label
    └── Songs: Production work
```

## The Key Insight

**Accounts delineate business relationships, not creative relationships.**

### **Business Relationships (Account-Specific)**

- **Who pays**: Billing and financial responsibility
- **Who owns**: Legal ownership and rights
- **Who manages**: Team and permission management
- **What terms**: Contractual and legal terms

### **Creative Relationships (Cross-Account)**

- **Who creates**: Authors and collaborators
- **What they create**: Songs and creative content
- **How they create**: Creative process and collaboration
- **When they create**: Timeline and milestones

## Implementation Implications

### **For Songwriters**

- **Unified View**: See all songs across accounts
- **Account Context**: Show business context as metadata
- **Natural Workflow**: Focus on creative work, not account management
- **Contextual Switching**: Only switch when business context matters

### **For Account Managers**

- **Account-Centric**: Manage business operations per account
- **Financial Control**: Track billing and usage per account
- **Team Management**: Manage permissions and access per account
- **Contract Management**: Handle legal and contractual terms per account

## Conclusion

**An account delineates business, legal, and contractual boundaries** - not creative boundaries. It creates:

- **Business separation** between different clients/organizations
- **Financial isolation** for billing and payment tracking
- **Legal boundaries** for contracts and rights management
- **Access control** for team and permission management

**The solution**: Show songs in a unified view with account context as helpful metadata, while maintaining all the business/legal benefits of account separation behind the scenes.

This gives songwriters the unified creative experience they want while preserving all the business functionality that accounts provide for admins and managers.
