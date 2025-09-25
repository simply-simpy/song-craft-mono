# Session Lifecycle (End-to-End) · DB Effects

## Scope
- Folder: `05-sessions-splits`
- Flow source: `session-lifecycle-flow.mermaid`

## Steps → DB Actions
| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| Create session & invites | See **Session Invite** DB effects | Reuse |
| Run session & attendance | See **Attendance & Eligibility** DB effects | Reuse |
| Lock split | See **Split Creation & Locking** DB effects | Reuse |
| Change split (if needed) | See **Split Change** DB effects | Reuse |
| Contest (optional) | See **Split Contest** DB effects | Reuse |
| Archive session | `SONG_SESSION.update` archived_at=true or status=archived → `AUDIT_LOG` `session_archived` | For history/compliance |

## Entities Touched
- SONG_SESSION (+ linked tables), AUDIT_LOG

## Permissions
- Create: Manager+ or Owner; Change: Manager+; Contest: writers.

## Audit Events
- `session_archived` (plus all reused events).

## Notifications
- As per reused flows (invites, locked, changed, contests).

## Error/Edge Handling
- Ensure archival does not delete data; keep all versions & audits.
