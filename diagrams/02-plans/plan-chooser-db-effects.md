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
