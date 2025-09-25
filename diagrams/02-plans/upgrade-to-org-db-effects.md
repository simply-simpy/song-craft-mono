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
