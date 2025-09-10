# Roles and Account Types

## Account Types

### Free / Pro → Account

- **Purpose**: The working bucket where songs live, quotas apply, and splits are managed
- **Solo Songwriter**: Their personal "account" is invisible — just feels like their space
- **Pro Users**: Can invite collaborators and own songs here
- **Clear Name**: Account (writers already know "my account" means their workspace)

### Publisher / Multi-Account Container → Org

- **Purpose**: The umbrella that can contain multiple Accounts
- **Users**: Publishers, labels, production companies — but could also just be a single songwriter-as-org
- **Controls**: Billing, seat allocation, invite policies, and global reporting
- **Clear Name**: Organization (industry neutral; works for both publishers and indies)

### Site wide Users → User

- **Purpose**: One login = one User
- **Flexibility**: Can belong to multiple Accounts and Orgs
- **Context-Aware**: Their permissions shift depending on context (role in Account, role in Org)
- **Clear Name**: User (standard, unambiguous)

## Roles by Level

### Org Roles

#### Org Owner

- Creates the Org
- Full rights (billing, policies, account creation)

#### Org Admin

- Manages accounts
- Manages seats
- Handles compliance

#### Account Manager

- Scoped to one Account
- Doles out Pro seats
- Invites Owners

### Account Roles

#### Owner

- Can create/delete songs
- Can invite collaborators
- Can manage splits

#### Collaborator

- Can edit/write
- Cannot create/delete songs

#### Viewer

- Read-only access
- Can add comments/notes

### Song Context (inherits from Account)

#### Author

- Any writer credited on the split sheet
- May or may not be an Account Owner

#### Participant

- Invited to a session
- Status: accepted/declined/no-show

## Permission Matrix

### Account-Level Permissions

- **Create Songs**: Owner only
- **Edit Songs**: Owner, Collaborator
- **View Songs**: Owner, Collaborator, Viewer
- **Manage Splits**: Owner only
- **Invite Users**: Owner only
- **Delete Songs**: Owner only

### Org-Level Permissions

- **Create Accounts**: Org Owner, Org Admin
- **Manage Billing**: Org Owner only
- **Set Policies**: Org Owner, Org Admin
- **View All Accounts**: Org Owner, Org Admin
- **Manage Seats**: Org Owner, Org Admin, Account Manager

### Song-Level Permissions

- **Edit Content**: Author (if also Account Owner/Collaborator)
- **View Content**: Author, Account Owner, Collaborator, Viewer
- **Manage Splits**: Account Owner only
- **Session Participation**: Invited participants

## Key Design Principles

### Clear Naming

- **Account**: Writers understand "my account" means their workspace
- **Organization**: Industry neutral; works for both publishers and indies
- **User**: Standard, unambiguous term

### Context-Aware Permissions

- Users can have different roles in different contexts
- Permissions are inherited from the appropriate level
- Clear hierarchy: Org → Account → Song

### Flexibility

- Solo songwriters can use the system simply
- Publishers can manage multiple accounts and complex hierarchies
- Users can belong to multiple organizations

## Implementation Notes

### Database Design

- Users table: sitewide identity
- Organizations table: billing and policy container
- Accounts table: song workspace (belongs to org)
- Memberships table: user-account-role relationships
- Song_authors table: song-user-role relationships

### Permission Checks

- Always check user's role in the specific context
- Inherit permissions from higher levels when appropriate
- Maintain audit trail of permission changes

### UI Considerations

- Show appropriate options based on user's role
- Hide administrative functions from non-admin users
- Provide clear indication of current context and permissions
