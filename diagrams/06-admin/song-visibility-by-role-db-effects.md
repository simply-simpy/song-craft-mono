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
