# Roles Context (Resolution & Effective Permissions) · DB Effects

## Scope
- Folder: `03-context`
- Flow source: `roles-context-flow.mermaid`
- Purpose: Determine a user's effective permissions from Org → Account → Song scopes.

## Resolution Order
1) **Org role** (e.g., Org Owner/Admin/Observer) — broadest scope  
2) **Account role** (Owner/Manager/Collaborator/Viewer) — within active account  
3) **Song ACL** (explicit song-scope grants) — highest specificity

> Effective permission = **max** privilege across applicable scopes for the active context.

## Steps → DB Actions
| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| On context set (org_id, account_id) | Read `ORG_ROLE` (user_id, org_id); read `MEMBERSHIP` (user_id, account_id); lazy-read `SONG_ACL` as needed | Cache in session |
| Build effective permissions | Compute union of capabilities; persist to `SESSION_CONTEXT.effective_perms` | Include CRUD for Song, Session, Split, Invite, Admin |
| Role change occurs | `MEMBERSHIP.update` or `ORG_ROLE.update` or `SONG_ACL.upsert/delete` → recompute | Emit `AUDIT_LOG` `role_changed` with before/after |
| Enforce at API | Middleware checks `SESSION_CONTEXT.effective_perms` or re-resolves if missing | DB fallback if cache stale |
| Surface in UI | none | Client reads a capabilities map, not raw roles |

## Entities Touched
- ORG_ROLE, MEMBERSHIP, SONG_ACL (reads on resolve; writes when roles change)
- AUDIT_LOG

## Permissions
- Resolution is system-internal; writes happen via Admin flows (06-admin).

## Audit Events
- `role_changed` (when any role/ACL mutates)

## Error/Edge Handling
- Conflicts (e.g., Viewer + Song ACL Edit): choose **broader** capability.
- Dangling ACLs (song deleted): cascade delete or background cleanup.
- Performance: add composite indexes (`SONG_ACL(user_id, song_id)`), (`MEMBERSHIP(user_id, account_id)`).

