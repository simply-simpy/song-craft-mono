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
