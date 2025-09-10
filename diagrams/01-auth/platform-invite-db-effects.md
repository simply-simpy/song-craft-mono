# Platform Invite Creation · DB Effects (Overview)

> Note: Actual invite creation flows typically live under **06-admin** (account/org invites) or **05-sessions-splits** (session invites). This doc captures the minimal DB effects for *creating* a platform invite.

## Steps → DB Actions

| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| Create invite | `INVITE.insert` (account_id, role, email, token, expires_at, created_by) | Domain policy check |
| Send email | `EMAIL_EVENT.insert` → `invite_sent` | Include magic link/Clerk handoff |
| Revoke invite | `INVITE.update` status=revoked; `AUDIT_LOG` `invite_revoked` | Idempotent |
| Resend | `EMAIL_EVENT.insert` → `invite_resent` | Track count |

## Entities Touched
- INVITE, EMAIL_EVENT, AUDIT_LOG

## Permissions
- Account Owner+, Org Admin.

## Audit Events
- `invite_created`, `invite_sent`, `invite_resent`, `invite_revoked`

## Notifications
- Invite email templates (08-comm).

## Error/Edge Handling
- Token uniqueness & expiry.
- Domain restriction enforcement.

