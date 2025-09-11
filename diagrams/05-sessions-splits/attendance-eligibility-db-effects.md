# Attendance & Eligibility · DB Effects

## Scope
- Folder: `05-sessions-splits`
- Flow source: `attendance-eligibility-flow.mermaid`

## Steps → DB Actions
| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| Check-in opens | `SONG_SESSION.update` status=live, started_at (server time) → `AUDIT_LOG` `session_started` | Triggered at start |
| Writer checks in | `SONG_SESSION_PARTICIPANT.upsert` (session_id, user_id, status=present, check_in_at) → `AUDIT_LOG` `participant_checked_in` | Late is allowed |
| Mark late (optional) | `SONG_SESSION_PARTICIPANT.update` status=late | Still eligible |
| Mark absent / no-show | `SONG_SESSION_PARTICIPANT.upsert` status=absent → `AUDIT_LOG` `participant_no_show` | Automated at end if no check-in |
| Session ends | `SONG_SESSION.update` ended_at, status=ended → `AUDIT_LOG` `session_ended` | Cutoff for eligibility |
| Build eligible list | Derived: participants where status in [present, late] | Used by split locking |

## Entities Touched
- SONG_SESSION, SONG_SESSION_PARTICIPANT, AUDIT_LOG

## Permissions
- Check-in: participant self; Owners/Admins can mark manual status.

## Audit Events
- `session_started`, `participant_checked_in`, `participant_no_show`, `session_ended`

## Notifications
- No-show email to writer + managers (handled in split locking or post-session job).

## Error/Edge Handling
- Multiple devices: keep latest check-in; maintain history in audit.
- Timezones: store UTC; display local.
