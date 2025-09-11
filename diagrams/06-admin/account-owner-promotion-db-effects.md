# Account Owner Promotion · DB Effects

## Scope
- Folder: `06-admin`
- Flow source: `account-owner-promotion-flow.mermaid`

## Steps → DB Actions
| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| Open member record | Read `MEMBERSHIP` (current role) | Show effective permissions |
| Promote to Owner | `MEMBERSHIP.update` role=owner → `AUDIT_LOG` `role_changed` (before/after, actor, reason) | Enforce max owners? (policy) |
| Demote from Owner | `MEMBERSHIP.update` role=collaborator or viewer → `AUDIT_LOG` `role_changed` | Guard on sole-owner demotion |
| Notify | `EMAIL_EVENT.insert` `role_change_notified` (to member + managers) | Include before/after, actor |

## Entities Touched
- MEMBERSHIP, EMAIL_EVENT, AUDIT_LOG

## Permissions
- Org Owner/Admin; Account Manager (if policy allows).

## Audit Events
- `role_changed`

## Notifications
- To affected member, CC managers/owners.

## Error/Edge Handling
- Prevent demoting the **last** Owner (require transfer or additional owner first).
- Log actor + reason (non-empty).
