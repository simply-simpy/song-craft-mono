# Session Invite · DB Effects

## Scope
- Folder: `05-sessions-splits`
- Flow source: `session-invite-flow.mermaid`

## Steps → DB Actions
| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| Create session | `SONG_SESSION.insert` (song_id, start_at, end_at nullable, method zoom/meet/in_person, link, created_by) → `AUDIT_LOG` `session_created` | Transactional |
| Add invitees | `SONG_INVITE.insert` (session_id, inviter_id, invitee_email, role participant, status=invited, ics_uid, expires_at) (per invite) → `AUDIT_LOG` `invites_created` | Domain rules from Global Admin |
| Generate ICS + Zoom link | `EMAIL_EVENT.insert` `session_invite_sent` (per invite) | Store provider IDs |
| Accept/Decline | `SONG_INVITE.update` status=accepted/declined, invitee_user_id if known → `AUDIT_LOG` `invite_accepted`/`invite_declined` | Accept also pre-seats participant |
| Pre-seat participant | `SONG_SESSION_PARTICIPANT.upsert` (session_id, user_id, status=pending) | Created on accept; else on check-in |
| Reminder | `EMAIL_EVENT.insert` `session_reminder_sent` | Optional, scheduled job |

## Entities Touched
- SONG_SESSION, SONG_INVITE, SONG_SESSION_PARTICIPANT, EMAIL_EVENT, AUDIT_LOG

## Permissions
- Create: Org Owner/Admin, Account Manager, Account Owner.
- View: participants + owners.

## Audit Events
- `session_created`, `invites_created`, `session_invite_sent`, `invite_accepted`, `invite_declined`

## Notifications
- Invite + reminder emails with ICS and join link.

## Error/Edge Handling
- Duplicate invites (idempotent upsert by email+session).
- Expired/invalid invite token → reissue.
- Domain restriction enforcement at invite time.
