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

