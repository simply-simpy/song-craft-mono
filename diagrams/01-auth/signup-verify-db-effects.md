# Sign-up (Verify & Bootstrap) · DB Effects

## Scope
- Folder: `01-auth`
- Flow source: `signup-verify-flow.mermaid`

## Steps → DB Actions

| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| Clerk user created | `USER.insert` (id, email, created_at) | Store minimal profile; rest later |
| Send/verify email | `EMAIL_EVENT.insert` → `verify_email_sent`; on click: `AUDIT_LOG.insert` → `email_verified` | Use provider webhooks where possible |
| Bootstrap personal org/account | `ORG.insert` (type: personal) → `ACCOUNT.insert` (plan: Free, is_default: true) → `MEMBERSHIP.insert` (role: owner) → `AUDIT_LOG` (`org_created`, `account_created`, `membership_created`) | Single transaction; idempotent on retry |
| First-run route | If unfinished song exists: open; else `SONG.insert` (draft) → `AUDIT_LOG` `first_run` | Create blank draft and route editor |

## Entities Touched
- USER, ORG, ACCOUNT, MEMBERSHIP, SONG, EMAIL_EVENT, AUDIT_LOG

## Permissions
- New user only (email not already in Clerk).

## Audit Events
- `user_created`, `email_verified`, `org_created`, `account_created`, `membership_created`, `first_run`

## Notifications
- Verification email only (auth provider).

## Error/Edge Handling
- Idempotency: wrap org/account bootstrap in tx; ignore duplicates on webhook retries.
- Email already exists → redirect to sign-in (see “Existing-user hits /signup”).

