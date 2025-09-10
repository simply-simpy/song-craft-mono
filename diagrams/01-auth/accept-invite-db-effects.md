# Accept Platform Invite · DB Effects

## Scope
- Folder: `01-auth`
- Flow source: `accept-invite-flow.mermaid`

## Steps → DB Actions

| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| Open invite link | `INVITE.lookup` by token; `AUDIT_LOG` `invite_opened` | Validate status & expiry |
| Create/attach user | If needed, create `USER` via Clerk; else link existing user | Trust provider id |
| Accept invite | `MEMBERSHIP.upsert` (user_id, account_id, role); `INVITE.update` `accepted_at`; `AUDIT_LOG` `membership_created_from_invite` | Transactional |
| Session link (optional) | If invite is tied to a session: `SONG_SESSION_PARTICIPANT.upsert` status=pending | Pre-seat user |
| Route to workspace | Open target song/account; `AUDIT_LOG` `invite_landing_opened` | Persist context |

## Entities Touched
- INVITE, USER, MEMBERSHIP, SONG_SESSION_PARTICIPANT, AUDIT_LOG

## Permissions
- Anyone with valid invite link; org/account rules may restrict domain.

## Audit Events
- `invite_opened`, `membership_created_from_invite`, `invite_landing_opened`

## Notifications
- Confirmation email to inviter/invitee (08-comm templates).

## Error/Edge Handling
- Expired/used invite → graceful error; allow requester to reissue.
- Cross-org guardrails: role must be permitted by inviter’s scope.

