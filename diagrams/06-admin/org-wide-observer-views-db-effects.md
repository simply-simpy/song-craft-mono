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
