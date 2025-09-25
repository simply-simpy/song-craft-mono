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
