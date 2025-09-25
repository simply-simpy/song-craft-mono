# Sign-in · DB Effects

## Scope
- Folder: `01-auth`
- Flow: `sign-in` (email + password; Clerk)

## Steps → DB Actions

| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| User submits credentials | Verify via **Clerk** (no DB write) | Handle rate limiting & lockouts in auth provider |
| Success | `AUDIT_LOG.insert` → `user_signed_in` (user_id, ip, ua) | Normalize user agent/IP |
| Load context | Read `MEMBERSHIP` by user_id; if multiple accounts, build switcher; else set active `ACCOUNT` in session; `AUDIT_LOG.insert` → `context_rehydrated` | Persist `last_context` on session/user profile |

## Entities Touched
- AUDIT_LOG, MEMBERSHIP, ACCOUNT

## Permissions
- Anyone with valid credentials.

## Audit Events
- `user_signed_in`, `context_rehydrated`

## Notifications
- None.

## Error/Edge Handling
- Invalid credentials → show generic error.
- Locked account → surface auth-provider message.
- Rate limiting (per IP + per user) at auth layer.

