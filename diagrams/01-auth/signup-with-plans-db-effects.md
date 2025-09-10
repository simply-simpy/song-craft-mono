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

