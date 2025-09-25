# Split Contest · DB Effects

## Scope
- Folder: `05-sessions-splits`
- Flow source: `split-contest-flow.mermaid`

## Steps → DB Actions
| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| File contest | `SONG_SPLIT_CONTEST.insert` (song_id, version, filed_by, reason, status=pending, created_at) → `AUDIT_LOG` `split_contested` | Visible to all writers |
| Notify resolver | `EMAIL_EVENT.insert` `split_contest_filed` (to Org Admin + managers) | Include context |
| Review & decision | `SONG_SPLIT_CONTEST.update` status=upheld/modified/rejected, decided_by, decided_at, notes → `AUDIT_LOG` `split_contest_decided` | If modified, proceed to change flow |
| If modified | Follow **Split Change** flow (new version, notify all) | Keep linkage to contest ID |
| Notify parties | `EMAIL_EVENT.insert` `split_contest_resolved` (all writers + managers) | Outcome and rationale |

## Entities Touched
- SONG_SPLIT_CONTEST, SONG_SPLIT_FINAL (if modified), EMAIL_EVENT, AUDIT_LOG

## Permissions
- File: Owner/Collaborator on the song; Resolve: Org Admin.

## Audit Events
- `split_contested`, `split_contest_decided`

## Notifications
- Filed → Org Admin; Resolved → all writers + managers.

## Error/Edge Handling
- One open contest per version; require reason text.
- Timebox SLA for decision (configurable).
