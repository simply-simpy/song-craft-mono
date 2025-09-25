# Can't Log In (Password Reset / Magic Link) · DB Effects

## Scope
- Folder: `01-auth`
- Flow source: `cant-login-flow.mermaid`

## Steps → DB Actions

| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| Request reset | `EMAIL_EVENT.insert` → `password_reset_sent` | Via auth provider |
| Use reset link | `AUDIT_LOG.insert` → `password_reset_success` | On provider callback |
| Request magic link | `EMAIL_EVENT.insert` → `magic_link_sent` | Optional alternative |
| Use magic link | `AUDIT_LOG.insert` → `magic_link_used` | Then treat as sign-in |
| Post-login context | `AUDIT_LOG.insert` → `context_rehydrated` | Same flow as sign-in |

## Entities Touched
- EMAIL_EVENT, AUDIT_LOG

## Permissions
- Public route (email must exist).

## Audit Events
- `password_reset_sent`, `password_reset_success`, `magic_link_sent`, `magic_link_used`, `context_rehydrated`

## Notifications
- Reset/magic-link emails (auth provider).

## Error/Edge Handling
- Expired/invalid token: show safe error, allow retry.
- Rate-limit requests per email/IP.

