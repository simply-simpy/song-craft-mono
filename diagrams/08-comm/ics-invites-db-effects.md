# ICS Invites (Calendar Attachments) · DB Effects

## Scope
- Folder: `08-comm`
- Related flows: `05-sessions-splits/session-invite-flow.mermaid`
- Purpose: generate calendar invites (.ics) for songwriting sessions with accurate RSVP tracking.

## Entities
- `SONG_SESSION` (id, song_id, start_at, end_at, method, link)
- `SONG_INVITE` (id, session_id, invitee_email, ics_uid, status)
- `EMAIL_EVENT` (invite sent, updates)
- `AUDIT_LOG`

## Steps → DB Actions
| Step | DB Action(s) | Notes |
|---|---|---|
| Compose ICS | Generate RFC5545: UID= `SONG_INVITE.ics_uid`, DTSTAMP/DTSTART/DTEND (UTC), SUMMARY (song title + "Song Session"), DESCRIPTION (link), ORGANIZER, ATTENDEE | Store ICS bytes if needed |
| Send | Attach ICS to `session_invite` template; `EMAIL_EVENT.insert(type='session_invite_sent')` | Provider supports attachments |
| RSVP updates | If using email reply parsing or calendar webhook, map UID → `SONG_INVITE.update status=accepted/declined` → `AUDIT_LOG` | Optional; baseline is in-app accept |
| Change/cancel | Send ICS UPDATE/CANCEL with same UID/SEQUENCE | Keep calendars in sync |

## Error/Edge Handling
- Timezone display: store UTC; render local in email body.
- Ensure UID stability (don’t regenerate on resend).
