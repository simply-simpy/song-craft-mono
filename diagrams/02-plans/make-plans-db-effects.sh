#!/usr/bin/env bash
# make-plans-db-effects.sh — generates DB-effects Markdown for 02-plans flows

set -euo pipefail

# 1) PLAN CHOOSER
cat > plan-chooser-db-effects.md <<'MD'
# Plan Chooser · DB Effects

## Scope
- Folder: `02-plans`
- Flow source: `plan-chooser-flow.mermaid`
- Purpose: capture the user's plan intent (Free/Pro/Org) and route to the right checkout or finalize path.

## Steps → DB Actions
| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| Load plans | none | Static config (prices/features) from app config |
| Select plan (store intent) | Persist selection in session/local state | No DB yet |
| Free → finalize | `ACCOUNT.update` plan=Free (idempotent) → `PLAN_SUBSCRIPTION.upsert` (account_id, plan=Free, status=active, price=0) → `AUDIT_LOG` `plan_set_free` | If already Pro, skip |
| Pro → checkout route | (see **Upgrade to Pro**) |  |
| Org → checkout route | (see **Upgrade to Org**) |  |

## Entities Touched
- ACCOUNT, PLAN_SUBSCRIPTION, AUDIT_LOG

## Permissions
- Authenticated user picking plan for their active account (or creating a new org/account for Org).

## Audit Events
- `plan_set_free`

## Error/Edge Handling
- If user is already on Pro/Org, short-circuit to Billing page.
- Ensure active context is valid before changing plans.
MD

# 2) UPGRADE TO PRO
cat > upgrade-to-pro-db-effects.md <<'MD'
# Upgrade to Pro · DB Effects

## Scope
- Folder: `02-plans`
- Flow source: `upgrade-to-pro-flow.mermaid`
- Purpose: convert an Account from Free to Pro via checkout → webhook confirmation.

## Steps → DB Actions
| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| Start checkout | `CHECKOUT_SESSION.insert` (scope=account_id, plan=Pro, amount, currency, status=pending, provider_session_id) → `AUDIT_LOG` `checkout_started` | Include who initiated |
| Webhook: payment success | `PAYMENT.insert` (account_id, provider ids, amount, currency, status=succeeded) → `ACCOUNT.update` plan=Pro → `PLAN_SUBSCRIPTION.upsert` (account_id, plan=Pro, status=active, current_period_end) → `AUDIT_LOG` `payment_recorded`, `plan_upgraded_to_pro` | Idempotent by provider ids |
| Webhook: payment failed/canceled | `CHECKOUT_SESSION.update` status=failed/canceled → `AUDIT_LOG` `checkout_failed` | No plan change |
| Post-upgrade routing | none | Route to Billing or Workspace with success banner |

## Entities Touched
- CHECKOUT_SESSION, PAYMENT, ACCOUNT, PLAN_SUBSCRIPTION, AUDIT_LOG

## Permissions
- Account Owner/Manager; Org Admin if acting on behalf.

## Audit Events
- `checkout_started`, `payment_recorded`, `plan_upgraded_to_pro`, `checkout_failed`

## Notifications
- Provider receipts; optional in-app/email confirmation (08-comm).

## Error/Edge Handling
- Webhook retries must be safe (unique key on provider charge/session id).
- Block duplicate concurrent checkouts for same account.
MD

# 3) UPGRADE TO ORG
cat > upgrade-to-org-db-effects.md <<'MD'
# Upgrade to Org (Create Org + First Account + Seats) · DB Effects

## Scope
- Folder: `02-plans`
- Flow source: `upgrade-to-org-flow.mermaid`
- Purpose: create an Organization container, a default Account, and purchase seat bundle via checkout.

## Steps → DB Actions
| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| Pre-checkout bootstrap | `ORG.insert` (name, created_by, status=pending_activation) → `ACCOUNT.insert` (org_id, name="Default", plan=Pro, status=pending_activation, is_default=true) → `MEMBERSHIP.insert` (user_id, account_id, role=owner) → `CHECKOUT_SESSION.insert` (scope=org_id or account_id, plan=Org/Seats, status=pending) → `AUDIT_LOG` `org_setup_pending`, `checkout_started` | Single transaction for org+account+membership |
| Webhook: payment success | `PAYMENT.insert` (org scope), `ORG.update` status=active, `ACCOUNT.update` status=active, `SEAT_ALLOCATION.insert` (org_id, seats_purchased, seats_available), `PLAN_SUBSCRIPTION.upsert` (scope=org or account billing model), `AUDIT_LOG` `payment_recorded`, `org_activated`, `seats_allocated` | Idempotent |
| Webhook: payment fail/cancel | `CHECKOUT_SESSION.update` status=failed/canceled → `AUDIT_LOG` `checkout_failed` | Leave org/account pending or clean up (policy) |
| Seat assignment | `SEAT_ASSIGNMENT.upsert` as admins/managers add members | Often happens later in Admin flows |

## Entities Touched
- ORG, ACCOUNT, MEMBERSHIP, CHECKOUT_SESSION, PAYMENT, PLAN_SUBSCRIPTION, SEAT_ALLOCATION, SEAT_ASSIGNMENT, AUDIT_LOG

## Permissions
- User upgrading to Org (becomes Org Owner).

## Audit Events
- `org_setup_pending`, `checkout_started`, `payment_recorded`, `org_activated`, `seats_allocated`, `checkout_failed`

## Notifications
- Welcome/setup email to Org Owner; billing confirmations.

## Error/Edge Handling
- Ensure cleanup policy for abandoned pending orgs (cron).
- Enforce unique org names (optional) and tokenized bootstrap to avoid dupes.
MD

# 4) DOWNGRADE / CANCEL
cat > downgrade-cancel-db-effects.md <<'MD'
# Downgrade / Cancel · DB Effects

## Scope
- Folder: `02-plans`
- Flow source: `downgrade-cancel-flow.mermaid`
- Purpose: downgrade Pro → Free, or cancel Org/seat bundle while preserving data access rules.

## Steps → DB Actions
| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| Request downgrade | `PLAN_SUBSCRIPTION.update` status=cancel_at_period_end, cancel_at=ts → `AUDIT_LOG` `plan_cancel_requested` | Provider-side flag too |
| End of period job | On cancel date: `ACCOUNT.update` plan=Free; `PLAN_SUBSCRIPTION.update` status=canceled; `SEAT_ALLOCATION.update` (org) seats_available=0 | Graceful |
| Enforce Free limits | Background jobs mark over-quota resources as read-only (e.g., songs over cap, collaborators, share links) | Non-destructive |
| Acknowledge | `EMAIL_EVENT.insert` `plan_cancel_confirmed` | Notify owner/admins |

## Entities Touched
- PLAN_SUBSCRIPTION, ACCOUNT, SEAT_ALLOCATION (org), EMAIL_EVENT, AUDIT_LOG

## Permissions
- Account Owner/Manager (account scope); Org Owner/Admin (org scope).

## Audit Events
- `plan_cancel_requested`, provider-driven `plan_canceled` (optional)

## Notifications
- Cancel confirmation email; pre-expiry reminders (optional).

## Error/Edge Handling
- Prevent immediate destructive changes; rely on soft enforcement.
- Edge: re-upgrade before period end → clear cancel flag idempotently.
MD

# 5) SEAT ROUTING (WHO GETS PRO SEATS)
cat > seat-routing-db-effects.md <<'MD'
# Seat Routing (Pro Seats Assignment) · DB Effects

## Scope
- Folder: `02-plans`
- Flow source: `seat-routing-flow.mermaid`
- Purpose: determine how purchased seats map to members; block invites if out of seats.

## Steps → DB Actions
| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| Seats purchased | `SEAT_ALLOCATION.insert` or `update` (org_id, seats_total, seats_available) | From checkout webhook |
| Assign seat to member | `SEAT_ASSIGNMENT.upsert` (org_id, user_id, seat_type=pro, assigned_by, assigned_at) → `SEAT_ALLOCATION.update` seats_available-1 → `AUDIT_LOG` `seat_assigned` | Transactional |
| Revoke seat | `SEAT_ASSIGNMENT.delete` or status=revoked → `SEAT_ALLOCATION.update` seats_available+1 → `AUDIT_LOG` `seat_revoked` | Keep history |
| Invite guard | On creating invites: check `SEAT_ALLOCATION.seats_available` > 0; if not, block and prompt purchase | Applies to account/org invites |
| View seat usage | Reporting view across `SEAT_ASSIGNMENT` join `USER` | For admins/managers |

## Entities Touched
- SEAT_ALLOCATION, SEAT_ASSIGNMENT, AUDIT_LOG

## Permissions
- Org Owner/Admin manage seats; Account Manager may consume seats if policy allows.

## Audit Events
- `seat_assigned`, `seat_revoked`

## Notifications
- Optional: notify users when seat assigned/revoked.

## Error/Edge Handling
- Idempotent upsert by (org_id, user_id, seat_type).
- Enforce that a user only holds one active seat of a given type in an org.
MD

echo "All DB-effects docs generated in $(pwd)"

