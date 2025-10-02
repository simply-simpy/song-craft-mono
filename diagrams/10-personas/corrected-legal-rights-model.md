# Corrected Model: Legal Rights, Projects, and Account Purpose

## You're Absolutely Right!

**Legal rights should be on the Project level, not Account level.** And accounts are primarily administrative tools for billing and client management.

## The Corrected Model

### **Projects = Legal Rights & Creative Work**

- **Legal Rights**: By default, all authors have equal rights to songs they contributed to
- **Creative Work**: Songs, albums, compositions
- **Collaborators**: Specific people working on this project
- **Sessions**: Collaborative work sessions
- **Timeline**: Project deadlines and milestones
- **Creative Direction**: Artistic vision and goals

### **Accounts = Administrative/Billing/Client Management**

- **Billing Entity**: Who pays for the work
- **Client Management**: Administrative services for publishers/labels
- **High-Level Organization**: Grouping projects for administrative purposes
- **Publisher Admin Tools**: Managing work and writers
- **Service Provider**: Account represents a client of admin services

## Real-World Example (Corrected)

### **"Summer Hits 2024" Project**

```
Project: Summer Hits 2024
├── Legal Rights: All authors have equal rights by default
├── Songs:
│   ├── "Sunny Days" (Riley + Writer A + Writer B)
│   │   ├── Default Rights: 33.33% each
│   │   └── Adjusted Rights: Riley 40%, Writer A 35%, Writer B 25%
│   └── "Beach Vibes" (Riley + Writer C)
│       ├── Default Rights: 50% each
│       └── Adjusted Rights: Riley 60%, Writer C 40%
├── Collaborators: Riley + 5 other writers
├── Timeline: Summer 2024 release
└── Creative Direction: Upbeat, radio-friendly pop songs
```

### **Sony Music Pop Division (Account)**

```
Account: Sony Music Pop Division
├── Purpose: Administrative client management
├── Billing: Sony Music pays for all work
├── Client Services: Publisher admin tools
├── Projects Managed:
│   ├── "Summer Hits 2024" Project
│   ├── "Taylor Swift Album" Project
│   └── "Pop Collaboration" Project
└── Writers Managed: Riley + 5 other writers
```

## The Key Insights

### **1. Legal Rights Belong to Projects**

- **Default Rights**: All authors get equal rights to songs they contributed to
- **Song-Level Adjustments**: Rights/splits can be adjusted per song when needed
- **Project Context**: Rights are negotiated within the project context
- **Collaborative Nature**: Rights reflect the collaborative nature of songwriting

### **2. Accounts Are Administrative Tools**

- **Client Management**: Accounts represent clients of admin services
- **Billing Organization**: Group projects for billing purposes
- **Publisher Admin**: Tools for publishers to manage work and writers
- **High-Level Organization**: Administrative grouping, not creative grouping

### **3. Projects Span Accounts**

- **Cross-Account Collaboration**: Writers from different accounts can work on same project
- **Flexible Team Composition**: Teams can include writers from different administrative contexts
- **Creative Freedom**: Projects aren't constrained by administrative boundaries

## How This Affects the Database Design

### **Project Table**

```sql
PROJECT {
  id, name, description,           -- Creative work identity
  legal_rights_default,            -- Default rights for all authors
  created_at, updated_at,          -- System metadata
  -- No account_id reference needed
}
```

### **Song Table**

```sql
SONG {
  id, project_id,                  -- Belongs to project
  title, lyrics, music,            -- Creative content
  rights_adjustments,             -- Song-level rights adjustments
  created_at, updated_at          -- System metadata
}
```

### **Account Table**

```sql
ACCOUNT {
  id, name, description,           -- Administrative identity
  billing_email, billing_address, -- Billing information
  client_type,                    -- Type of client (publisher, label, etc.)
  admin_services,                 -- Services provided to this client
  created_at                      -- System metadata
}
```

## The Benefits of This Approach

### **1. Legal Clarity**

- **Default Rights**: Clear default for all authors
- **Song-Level Adjustments**: Flexible rights management per song
- **Project Context**: Rights negotiated within project context
- **Collaborative Nature**: Reflects how songwriting actually works

### **2. Administrative Efficiency**

- **Client Management**: Clear client relationships
- **Billing Organization**: Easy billing and invoicing
- **Publisher Admin**: Tools for managing work and writers
- **Service Provider**: Clear service provider relationship

### **3. Creative Freedom**

- **Cross-Account Projects**: Writers can collaborate across administrative boundaries
- **Flexible Teams**: Teams can include writers from different clients
- **Project-Centric**: Creative work organized by projects, not administrative boundaries

## Implementation Implications

### **User Experience**

- **Project-Centric View**: Show projects as primary organization
- **Account Context**: Show account context as administrative metadata
- **Rights Management**: Default rights with song-level adjustments
- **Cross-Account Search**: Search across all projects regardless of account

### **Admin Interface**

- **Client Management**: Manage accounts as clients
- **Billing Tools**: Track usage and costs per account
- **Publisher Admin**: Tools for managing work and writers
- **Service Provider**: Clear service provider relationship

## Conclusion

**You're absolutely right!** The corrected model is:

1. **Projects** = Legal rights, creative work, collaborative teams
2. **Accounts** = Administrative tools for billing, client management, publisher admin
3. **Default Rights** = All authors get equal rights by default
4. **Song-Level Adjustments** = Rights can be adjusted per song when needed
5. **Cross-Account Projects** = Projects can span multiple administrative contexts
6. **Service Provider** = Accounts represent clients of admin services

This model much better reflects how the music industry actually works - projects are the creative and legal units, while accounts are administrative tools for managing clients and billing.
