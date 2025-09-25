# Existing User Hits /signup · DB Effects

## Scope
- Folder: `01-auth`
- Flow source: `signup-existing-user-flow.mermaid`

## Steps → DB Actions

| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| Detect existing email | none | Check via Clerk |
| Redirect to sign-in | `AUDIT_LOG.insert` → `signup_existing_user_redirected` | Keep UX friendly; offer reset |

## Entities Touched
- AUDIT_LOG

## Permissions
- N/A (public route).

## Audit Events
- `signup_existing_user_redirected`

## Notifications
- None.

## Error/Edge Handling
- If user is logged in already, go to last context (skip sign-up entirely).

