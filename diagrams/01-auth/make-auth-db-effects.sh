#!/usr/bin/env bash
# make-auth-db-effects.sh — creates DB-effects Markdown with real content for 01-auth

set -euo pipefail

write() {
  local file="$1"
  shift
  cat > "$file" <<'EOF'
EOF
  # now append the provided content (passed via stdin)
  cat >> "$file"
  echo "wrote: $file"
}

# A) SIGN-IN
cat > sign-in-db-effects.md <<'MD'
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

MD

# B) SIGN-UP (verify + bootstrap personal)
cat > signup-verify-db-effects.md <<'MD'
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

MD

# E) EXISTING-USER HITS /SIGNUP
cat > signup-existing-user-db-effects.md <<'MD'
# Existing User Hits /signup · DB Effects

## Scope
- Folder: `01-auth`
- Flow source: `signup-existing-user-flow.mermaid`

## Steps → DB Actions

| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| Detect existing email | none | Check via Clerk |
| Redirect to sign-in | `AUDIT_LOG.insert` → `signup_existing_user_redirected` | Keep UX friendly; offer reset |

## Entities Touched
- AUDIT_LOG

## Permissions
- N/A (public route).

## Audit Events
- `signup_existing_user_redirected`

## Notifications
- None.

## Error/Edge Handling
- If user is logged in already, go to last context (skip sign-up entirely).

MD

# B (plans branch) SIGN-UP WITH PLANS
cat > signup-with-plans-db-effects.md <<'MD'
# Sign-up With Plans (Free/Pro/Org) · DB Effects

## Scope
- Folder: `01-auth`
- Flow source: `signup-with-plans-flow.mermaid`

## Steps → DB Actions

| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| Plan selected | none | Store choice in session |
| Free → finalize | `ACCOUNT.update` plan=Free; `PLAN_SUBSCRIPTION.upsert` status=active, price=0; `AUDIT_LOG` `plan_set_free` | Idempotent |
| Pro → checkout | `CHECKOUT_SESSION.insert` (account_id, plan=Pro, status=pending) → on success webhook: `PAYMENT.insert` (succeeded), `ACCOUNT.update` plan=Pro, `PLAN_SUBSCRIPTION.upsert` active; `AUDIT_LOG` `checkout_started`, `plan_upgraded_to_pro`, `payment_recorded` | Webhook-safe |
| Org → org+acct pending then checkout | `ORG.insert` status=pending → `ACCOUNT.insert` status=pending (default) → `CHECKOUT_SESSION.insert`; on success: `ORG.update` active, `ACCOUNT.update` active, `SEAT_ALLOCATION.insert`, `PLAN_SUBSCRIPTION.upsert`; `AUDIT_LOG` `org_activated`, `seats_allocated` | Billing model dependent |

## Entities Touched
- ACCOUNT, ORG, PLAN_SUBSCRIPTION, CHECKOUT_SESSION, PAYMENT, SEAT_ALLOCATION, AUDIT_LOG

## Permissions
- New user or logged-in user upgrading.

## Audit Events
- `plan_set_free`, `checkout_started`, `plan_upgraded_to_pro`, `payment_recorded`, `org_activated`, `seats_allocated`

## Notifications
- Checkout emails (provider), plan-change confirmations (08-comm).

## Error/Edge Handling
- Webhook retries must be idempotent.
- If user already on Pro, skip to Billing.

MD

# C) CAN'T LOG IN
cat > cant-login-db-effects.md <<'MD'
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

MD

# D) ACCEPT INVITE
cat > accept-invite-db-effects.md <<'MD'
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

MD

# (Placeholder) PLATFORM INVITE CREATION
cat > platform-invite-db-effects.md <<'MD'
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

MD

echo "All DB-effects docs generated in $(pwd)"

