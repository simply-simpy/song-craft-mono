#!/usr/bin/env bash
# make-admin-db-effects.sh — generates DB-effects Markdown for Admin flows

set -euo pipefail

# 1) ORG INVITE WRITER
cat > org-invite-writer-db-effects.md <<'MD'
# Org Invite Writer · DB Effects

## Scope
- Folder: `06-admin`
- Flow source: `org-invite-writer-flow.mermaid`

## Steps → DB Actions
| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| Open invite form | Read `INVITE_POLICY` (domain rules, expiry) | Enforce policy in UI |
| Create invite | `INVITE.insert` (scope: account_id, role, invitee_email, token, expires_at, created_by) → `AUDIT_LOG` `invite_created` | Unique token; soft-duplicate check |
| Send email | `EMAIL_EVENT.insert` `invite_sent` (provider ids) | ICS only if tied to session (else plain) |
| Accept | `MEMBERSHIP.upsert` (user_id, account_id, role) → `INVITE.update` accepted_at → `AUDIT_LOG` `membership_created_from_invite` | Transactional |
| Revoke / Resend | `INVITE.update` status=revoked / new token; `EMAIL_EVENT.insert` `invite_resent` | Keep resend count |
| Optional: Seat check | Validate `SEAT_ALLOCATION` before finalizing | Block if no seats, prompt purchase |

## Entities Touched
- INVITE, MEMBERSHIP, INVITE_POLICY, EMAIL_EVENT, SEAT_ALLOCATION, AUDIT_LOG

## Permissions
- Org Owner/Admin, Account Manager (within their account).

## Audit Events
- `invite_created`, `invite_sent`, `invite_resent`, `invite_revoked`, `membership_created_from_invite`

## Notifications
- Invite email to invitee; confirmation to inviter (optional).

## Error/Edge Handling
- Domain restriction mismatch → reject before insert.
- Idempotent upsert on MEMBERSHIP (user_id+account_id unique).
MD

# 2) ACCOUNT OWNER PROMOTION
cat > account-owner-promotion-db-effects.md <<'MD'
# Account Owner Promotion · DB Effects

## Scope
- Folder: `06-admin`
- Flow source: `account-owner-promotion-flow.mermaid`

## Steps → DB Actions
| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| Open member record | Read `MEMBERSHIP` (current role) | Show effective permissions |
| Promote to Owner | `MEMBERSHIP.update` role=owner → `AUDIT_LOG` `role_changed` (before/after, actor, reason) | Enforce max owners? (policy) |
| Demote from Owner | `MEMBERSHIP.update` role=collaborator or viewer → `AUDIT_LOG` `role_changed` | Guard on sole-owner demotion |
| Notify | `EMAIL_EVENT.insert` `role_change_notified` (to member + managers) | Include before/after, actor |

## Entities Touched
- MEMBERSHIP, EMAIL_EVENT, AUDIT_LOG

## Permissions
- Org Owner/Admin; Account Manager (if policy allows).

## Audit Events
- `role_changed`

## Notifications
- To affected member, CC managers/owners.

## Error/Edge Handling
- Prevent demoting the **last** Owner (require transfer or additional owner first).
- Log actor + reason (non-empty).
MD

# 3) COLLABORATOR INVITE & SCOPE
cat > collaborator-invite-and-scope-db-effects.md <<'MD'
# Collaborator Invite & Scope · DB Effects

## Scope
- Folder: `06-admin`
- Flow source: `collaborator-invite-and-scope-flow.mermaid`

## Steps → DB Actions
| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| Choose scope | Select Account-wide or Song-specific | Song-scoped membership stored in ACL table |
| Create invite | `INVITE.insert` (account_id, role=collaborator, email, token, expires_at, scope={account|song_id}) → `AUDIT_LOG` `invite_created` | Scope captured |
| Accept | If account-scope: `MEMBERSHIP.upsert`; if song-scope: `SONG_ACL.upsert` (song_id, user_id, role) | Transactional |
| Configure capabilities | `SONG_ACL` rules: edit, comment, split_view | Defaults from Global Admin |
| Revoke | `INVITE.update` status=revoked; if accepted & song-scope: `SONG_ACL.delete` | Keep audit trail |

## Entities Touched
- INVITE, MEMBERSHIP, SONG_ACL, AUDIT_LOG

## Permissions
- Account Owner, Account Manager, Org Admin/Owner.

## Audit Events
- `invite_created`, `membership_created_from_invite` (account scope), `song_acl_granted`, `song_acl_revoked`

## Notifications
- Invite + acceptance confirmations.

## Error/Edge Handling
- Duplicate ACL upserts should be idempotent.
- Domain policies still apply for invites.
MD

# 4) ORG-WIDE OBSERVER VIEWS
cat > org-wide-observer-views-db-effects.md <<'MD'
# Org-wide Observer Views · DB Effects

## Scope
- Folder: `06-admin`
- Flow source: `org-wide-observer-views-flow.mermaid`

## Steps → DB Actions
| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| Grant observer | `ORG_ROLE.upsert` (user_id, org_id, role=observer) → `AUDIT_LOG` `org_role_assigned` | Read-only policy |
| Build views | Materialized/reporting views reading across `ACCOUNT`, `SONG`, `SPLIT`, `SESSION` | Consider nightly refresh |
| Access audit | Observer access to `AUDIT_LOG` via filtered view | Redact PII per policy |
| Revoke observer | `ORG_ROLE.delete` or update role → `AUDIT_LOG` `org_role_revoked` | Keep history |

## Entities Touched
- ORG_ROLE, REPORTING_VIEWS (db-level), AUDIT_LOG

## Permissions
- Org Owner/Admin can assign/remove observers.

## Audit Events
- `org_role_assigned`, `org_role_revoked`

## Notifications
- Optional: notify observer of access granted/removed.

## Error/Edge Handling
- Ensure observer cannot escalate to write actions (enforce at API & DB).
- Views should filter by org_id.
MD

# 5) SONG VISIBILITY BY ROLE
cat > song-visibility-by-role-db-effects.md <<'MD'
# Song Visibility by Role · DB Effects

## Scope
- Folder: `06-admin`
- Flow source: `song-visibility-by-role-flow.mermaid`

## Visibility Rules → DB/ACL Model
| Role | Access | DB Source |
|---|---|---|
| Org Owner/Admin | All songs in org | Join across `ACCOUNT`→`SONG` where org_id |
| Account Owner | All songs in account | `SONG.account_id = ACCOUNT.id` |
| Collaborator (account-scope) | All songs in account (edit/write enabled per policy) | `MEMBERSHIP.role = collaborator` + account scope |
| Collaborator (song-scope) | Only songs explicitly granted | `SONG_ACL` rows for user_id |
| Viewer | Read-only; comment if allowed | `MEMBERSHIP.role = viewer` or `SONG_ACL` |
| Observer (org-wide) | Read-only across org | `ORG_ROLE.role = observer` via reporting views |

## Enforcement Points
- **API layer**: middleware resolves effective scope (org → account → song).
- **DB layer**: use views/row-level filters (where supported) + `SONG_ACL`.

## Audit Hooks
- On read access escalation (e.g., role change) → `AUDIT_LOG` `role_changed`.
- On ACL grant/revoke → `song_acl_granted` / `song_acl_revoked`.

## Notifications
- Optional: notify when user is granted song-scope access.

## Error/Edge Handling
- Conflict resolution if user has both account-scope and song-scope (prefer broader).
- Avoid orphaned `SONG_ACL` (cascade delete when song removed).
MD

echo "All DB-effects docs generated in $(pwd)"

