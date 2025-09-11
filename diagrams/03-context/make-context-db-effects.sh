#!/usr/bin/env bash
# make-context-db-effects.sh — generates DB-effects Markdown for 03-context flows

set -euo pipefail

# 1) ACCOUNT SWITCHER
cat > account-switcher-db-effects.md <<'MD'
# Account Switcher · DB Effects

## Scope
- Folder: `03-context`
- Flow source: `account-switcher-flow.mermaid`
- Purpose: Resolve and persist a user's active Org/Account context for routing, permissions, and defaults.

## Steps → DB Actions
| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| Load memberships on sign-in | Read `MEMBERSHIP` by `user_id` (join `ACCOUNT` → `ORG`) | Build switcher list (name, role, plan, org) |
| Auto-pick context (single) | `SESSION_CONTEXT.set` (org_id, account_id, role); `AUDIT_LOG.insert` → `context_rehydrated` | No UI if only one |
| Show switcher (multiple) | none (read-only) | Client renders list grouped by Org |
| User selects context | `USER.update` `last_context` (org_id, account_id, ts) → `AUDIT_LOG.insert` → `context_switched` | Also set session cookie |
| Route to destination | none | If unfinished song exists, workspace; else blank song |
| Persist across sessions | Read `USER.last_context` on next login; verify still valid; fallback to first membership | Guard against stale references |

## Entities Touched
- MEMBERSHIP, ACCOUNT, ORG (reads)
- USER (writes: `last_context`)
- AUDIT_LOG

## Permissions
- Any authenticated user; choices limited to memberships they hold.

## Audit Events
- `context_rehydrated`, `context_switched`

## Error/Edge Handling
- Stale `last_context` (account removed): pick first valid membership; log `context_rehydrated_fallback`.
- No memberships (should not happen post-signup personal bootstrap): create personal default or block with support path.
- Performance: index `MEMBERSHIP(user_id)`.

MD

# 2) ROLES CONTEXT (RESOLUTION & EFFECTIVE PERMISSIONS)
cat > roles-context-db-effects.md <<'MD'
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

MD

# 3) SITE NAV (ROUTE GUARDS & VISIBILITY)
cat > site-nav-db-effects.md <<'MD'
# Site Nav (Route Guards & Visibility) · DB Effects

## Scope
- Folder: `03-context`
- Flow source: `site-nav-flow.mermaid`
- Purpose: Guard routes and show/hide nav items based on active context and permissions.

## Steps → DB Actions
| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| Render global nav | none (uses `SESSION_CONTEXT.effective_perms`) | Do not hit DB on every render |
| Guard route → Workspace | Verify membership in active account OR `SONG_ACL` for that song | 403 with helpful CTA if blocked |
| Guard route → Song Admin | Require Owner or higher in active account | 403 |
| Guard route → Global Admin | Require Account Owner/Manager or Org Admin | 403 |
| Guard route → Org Admin | Require Org Owner/Admin | 403 |
| Context change via nav | (See Account Switcher) | Persist `last_context` |

## Entities Touched
- Primarily cached session context; conditional reads of `SONG_ACL` or `MEMBERSHIP` when opening deep links.

## Permissions
- Enforced centrally in API middleware + client route guards.

## Audit Events
- Optional: `route_forbidden` with attempted path & capability for security reviews.

## Error/Edge Handling
- Deep link to resource outside active account: offer “Switch to eligible account?” prompt (list accounts where user has access).
- Avoid N+1 reads: fetch membership & ACL on demand, cache for page lifetime.

MD

echo "All DB-effects docs generated in $(pwd)"

