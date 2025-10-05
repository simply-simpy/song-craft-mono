# Account Switching Personas - Open Questions Analysis

## **Core Questions About Account Functionality**

The open questions reveal some fundamental design decisions about how accounts relate to projects, users, and business logic. Let me analyze each:

---

## **1. Jamie - Multi-Artist Manager Questions**

### **Questions:**

- Does Jamie have a list of all of the artists she manages under users, and then the account switches when she picks one? Or a different way?
- If she switches accounts, does this mean she is in all of those accounts as well?

### **Analysis & Recommendations:**

**Current System Understanding:**

- Jamie would be a **member** of multiple accounts (one per artist)
- Each artist has their own account with their own projects
- Jamie switches between accounts to work on different artists

**Proposed Account Structure:**

```
Jamie's Memberships:
├── Artist A Account (Universal Music) - Role: Manager
├── Artist B Account (Sony Music) - Role: Manager
├── Artist C Account (Independent) - Role: Manager
└── Jamie's Personal Account - Role: Owner
```

**Benefits of This Approach:**

- **Clear Separation**: Each artist's work stays isolated
- **Proper Attribution**: Royalties tracked per artist account
- **Client Trust**: Artists only see their own work
- **Manager Efficiency**: Jamie can switch contexts quickly

**Alternative Consideration:**

- **Single Account with Projects**: All artists in one account, separated by projects
- **Problem**: Mixing different labels/publishing deals in one account
- **Problem**: Artists could potentially see each other's work

---

## **2. Riley - Freelance Songwriter Questions**

### **Questions:**

- Accounts also have projects. Just because someone is in an account doesn't mean they can see every project. Does this impact Riley?
- Should we better define the function of accounts?

### **Analysis & Recommendations:**

**Account vs. Project Hierarchy:**

```
Account Level (Business Context):
├── Client Confidentiality
├── Contract Terms
├── Royalty Rates
├── User Access Control
└── Projects (Creative Work)

Project Level (Creative Context):
├── Song Development
├── Collaborators
├── Sessions
└── Versions
```

**Riley's Workflow Impact:**

- **Account Switch**: Changes business context (client, contract, rates)
- **Project Access**: Within account, Riley only sees projects they're invited to
- **Granular Control**: Client can invite Riley to specific projects only

**Refined Account Definition:**

- **Accounts** = Business/Legal/Contractual boundaries
- **Projects** = Creative work boundaries within accounts
- **Sessions** = Collaborative work sessions within projects

---

## **3. Casey - Music School Administrator Questions**

### **Questions:**

- Why does Casey need separate accounts? What benefit is it for them?
- After an account switch does Casey only see the users in that account? This makes sense, but does that mean there should be an all users view as well?
- I'm not sure how well the app would work in an academic setting, but we should discuss further as how to make this work. Because there are lots of songwriting school programs out there.

### **Analysis & Recommendations:**

**Academic Account Structure:**

```
Music School Accounts:
├── Student Projects Account
│   ├── Student A Projects
│   ├── Student B Projects
│   └── Student C Projects
├── Faculty Research Account
│   ├── Professor X Research
│   ├── Professor Y Research
│   └── Collaborative Research
├── Jazz Department Account
│   ├── Jazz Curriculum Projects
│   ├── Student Jazz Projects
│   └── Faculty Jazz Projects
└── School Administration Account
    ├── Policy Documents
    ├── Assessment Criteria
    └── Administrative Projects
```

**Benefits for Casey:**

- **FERPA Compliance**: Student work properly isolated
- **Academic Integrity**: Faculty research separate from student work
- **Department Organization**: Different curricula and standards
- **Administrative Clarity**: Policy work separate from academic work

**User Visibility:**

- **Within Account**: Casey sees users relevant to that account context
- **Cross-Account View**: Super admin view to see all users across accounts
- **Role-Based Access**: Different views based on Casey's role in each account

**Academic Market Potential:**

- **Songwriting Programs**: Berklee, Belmont, NYU, etc.
- **Music Education**: K-12 music programs
- **Community Music Schools**: Local music education
- **Online Music Education**: Remote songwriting courses

---

## **4. Morgan - Record Label A&R Questions**

### **Questions:**

- Does Morgan have a way to see all of her artists? Or only by account?

### **Analysis & Recommendations:**

**Morgan's Cross-Account Visibility:**

```
Morgan's Dashboard Views:
├── All Artists View (Cross-Account)
│   ├── Artist A (Pop Division)
│   ├── Artist B (Hip-Hop Division)
│   ├── Artist C (International)
│   └── Artist D (Scouting)
├── Division-Specific Views
│   ├── Pop Division Account
│   ├── Hip-Hop Division Account
│   └── International Account
└── Scouting View
    ├── Unsigned Artists
    ├── Demo Reviews
    └── Potential Signings
```

**Proposed Solution:**

- **Account-Level Work**: Detailed work within specific accounts
- **Cross-Account Dashboard**: High-level view of all artists
- **Role-Based Access**: Morgan sees all artists due to her A&R role
- **Account Switching**: For detailed work and collaboration

---

## **5. Taylor - Music Publisher Questions**

### **Questions:**

- Are we saying that contract terms and territories are assigned on the account level?
- Are we saying different publishing agreements are on the account level?
- So if one artist (songwriter) is working on 20 songs with different publishers -- that could be an issue, right?
- Then an artist (songwriter) would need to switch accounts for every song.
- 20 different publishers would prob never happen -- but still, it seems having the flexibility would be useful.

### **Analysis & Recommendations:**

**Publishing Account Structure:**

```
Publishing Account Levels:
├── Account Level (Publishing Deal)
│   ├── Contract Terms
│   ├── Territory Rights
│   ├── Royalty Rates
│   ├── Publishing Agreement
│   └── Projects (Songs under this deal)
└── Project Level (Individual Songs)
    ├── Song Development
    ├── Collaborators
    ├── Sessions
    └── Versions
```

**Multi-Publisher Scenario:**

```
Songwriter's Account Structure:
├── Publisher A Account (Pop Songs)
│   ├── Song 1 Project
│   ├── Song 2 Project
│   └── Song 3 Project
├── Publisher B Account (Country Songs)
│   ├── Song 4 Project
│   ├── Song 5 Project
│   └── Song 6 Project
└── Publisher C Account (Sync Songs)
    ├── Song 7 Project
    ├── Song 8 Project
    └── Song 9 Project
```

**Flexibility Solutions:**

- **Account per Publisher**: Each publishing deal gets its own account
- **Project-Level Contracts**: Alternative approach with contract metadata
- **Hybrid Approach**: Account for major deals, project-level for minor deals
- **Contract Templates**: Reusable contract terms across accounts

---

## **Refined Account Definition**

Based on these questions, here's a clearer definition of accounts:

### **Accounts = Business/Legal/Contractual Boundaries**

**Account-Level Attributes:**

- **Business Entity**: Label, publisher, school, client
- **Contract Terms**: Publishing deals, licensing agreements
- **Territory Rights**: Geographic distribution rights
- **Royalty Rates**: Payment terms and rates
- **User Access Control**: Who can access this account
- **Billing/Payment**: Financial tracking and invoicing

### **Projects = Creative Work Boundaries**

**Project-Level Attributes:**

- **Creative Work**: Songs, albums, compositions
- **Collaborators**: Specific people working on this project
- **Sessions**: Collaborative work sessions
- **Versions**: Song versions and iterations
- **Timeline**: Project deadlines and milestones

### **Sessions = Collaborative Work Sessions**

**Session-Level Attributes:**

- **Real-time Collaboration**: Live songwriting sessions
- **Participants**: Who's in the session
- **Recording**: Session recordings and notes
- **Contributions**: Individual contributions to the song

---

## **Recommended Account/Project Hierarchy**

```
Organization (Billing Entity)
├── Account 1 (Business Context)
│   ├── Contract Terms
│   ├── Territory Rights
│   ├── Royalty Rates
│   ├── Users (Members)
│   └── Projects (Creative Work)
│       ├── Project A
│       │   ├── Songs
│       │   ├── Sessions
│       │   └── Collaborators
│       └── Project B
│           ├── Songs
│           ├── Sessions
│           └── Collaborators
└── Account 2 (Different Business Context)
    ├── Different Contract Terms
    ├── Different Territory Rights
    ├── Different Royalty Rates
    ├── Different Users
    └── Different Projects
```

---

## **Implementation Recommendations**

### **1. Account Switching Benefits**

- **Business Context**: Contract terms, royalty rates, territory rights
- **User Isolation**: Proper access control and privacy
- **Financial Tracking**: Accurate billing and payment tracking
- **Legal Compliance**: Proper contract and rights management

### **2. Project-Level Flexibility**

- **Creative Freedom**: Projects can span multiple accounts if needed
- **Collaboration**: Invite collaborators to specific projects
- **Granular Control**: Fine-grained access control within accounts

### **3. Cross-Account Views**

- **Dashboard Views**: High-level overview across accounts
- **Role-Based Access**: Different views based on user roles
- **Administrative Tools**: Super admin views for management

### **4. Academic Market Features**

- **FERPA Compliance**: Student privacy protection
- **Curriculum Management**: Department-specific organization
- **Assessment Tools**: Academic evaluation and grading
- **Institutional Billing**: School-wide account management

This analysis suggests that accounts serve as **business/legal boundaries** while projects serve as **creative work boundaries**, providing both the separation needed for business purposes and the flexibility needed for creative collaboration.
