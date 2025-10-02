# Account-Specific Information Analysis

## What Information is Account-Specific?

### **Account-Level Data (Business/Legal)**

- **Billing Information**: `billing_email`, payment methods, subscription plans
- **Contract Terms**: Licensing agreements, usage rights, payment terms
- **Team Management**: Who can access the account, role assignments
- **Settings & Policies**: Account-specific configurations, permissions
- **Financial Data**: Usage tracking, billing history, payment records
- **Compliance**: Data retention policies, audit requirements

### **Song-Level Data (Creative/Content)**

- **Song Content**: Title, lyrics, music, recordings, versions
- **Collaboration**: Authors, contributors, split percentages
- **Creative Metadata**: Genre, mood, tempo, key, tags
- **Version History**: Drafts, revisions, final versions
- **Session Data**: Recording sessions, takes, notes

## The Key Distinction

### **Account-Specific = Business Context**

- **Who pays for it**: Billing, subscriptions, usage limits
- **Who owns it legally**: Contracts, rights, licensing
- **Who manages it**: Team roles, permissions, access control
- **How it's governed**: Policies, compliance, audit trails

### **Song-Specific = Creative Content**

- **What it is**: The actual song content and metadata
- **Who created it**: Authors, contributors, collaborators
- **How it evolved**: Versions, revisions, session history
- **What it sounds like**: Recordings, takes, audio files

## Current System Analysis

### **Account Table Fields**

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

### **Song Table Fields**

```sql
SONG {
  id, account_id,                     -- Ownership context
  title, status,                      -- Creative content
  created_at, updated_at              -- System metadata
}
```

## What Should Be Unified vs Account-Specific

### **Unified Across Accounts (Song-Centric View)**

- **Song Content**: Title, lyrics, music, recordings
- **Creative Metadata**: Genre, mood, tempo, key, tags
- **Collaboration**: Authors, contributors, split percentages
- **Version History**: Drafts, revisions, final versions
- **Session Data**: Recording sessions, takes, notes

### **Account-Specific (Business Context)**

- **Billing**: Who pays for the song's storage/processing
- **Contracts**: Licensing terms, usage rights, payment terms
- **Access Control**: Who can view/edit the song
- **Compliance**: Data retention, audit requirements
- **Financial**: Usage tracking, billing history

## The Figma Model Applied

### **Figma's Approach**

- **Files**: Unified view across all teams
- **Team Context**: Shown as metadata (e.g., "Team: Design System")
- **Business Data**: Team-specific billing, permissions, contracts
- **Creative Data**: File content, versions, collaboration

### **SongCraft's Equivalent**

- **Songs**: Unified view across all accounts
- **Account Context**: Shown as metadata (e.g., "Account: Sony Music")
- **Business Data**: Account-specific billing, contracts, permissions
- **Creative Data**: Song content, versions, collaboration

## Implementation Strategy

### **Unified Song Interface**

```typescript
interface SongWithContext {
  // Song content (unified)
  id: string;
  title: string;
  lyrics: string;
  genre: string;
  authors: Author[];
  versions: Version[];

  // Account context (metadata)
  accountContext: {
    accountId: string;
    accountName: string;
    billingStatus: string;
    contractTerms: string;
    accessLevel: string;
  };
}
```

### **Account-Specific Data**

```typescript
interface AccountSpecificData {
  // Business context
  billing: {
    plan: string;
    usage: number;
    limits: number;
    billingEmail: string;
  };

  // Legal context
  contracts: {
    licensingTerms: string;
    usageRights: string;
    paymentTerms: string;
  };

  // Access context
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canInvite: boolean;
  };
}
```

## Benefits of This Approach

### **For Songwriters**

- **Unified view** of all their songs
- **Account context** available when needed
- **No artificial barriers** between songs
- **Natural workflow** focused on creation

### **For Account Managers**

- **Full business control** over account operations
- **Clear data separation** for legal compliance
- **Billing accuracy** for financial management
- **Team management** for client projects

### **For the System**

- **Maintains data integrity** through account structure
- **Enforces security** through RLS policies
- **Supports billing** through account tracking
- **Enables compliance** through audit trails

## The Bottom Line

**Account-specific information is primarily business/legal context** that songwriters don't need to think about during creative work:

- **Billing, contracts, permissions** → Account-specific
- **Song content, collaboration, versions** → Unified across accounts

**The solution**: Show songs in a unified view with account context as helpful metadata, while maintaining all the business/legal benefits of account separation behind the scenes.

This gives songwriters the unified experience they want while preserving all the business functionality that accounts provide for admins and managers.
