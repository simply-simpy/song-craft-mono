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
