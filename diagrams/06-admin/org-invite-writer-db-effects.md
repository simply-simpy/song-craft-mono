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
