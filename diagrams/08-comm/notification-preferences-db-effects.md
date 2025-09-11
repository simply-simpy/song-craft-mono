# Notification Preferences & Policies · DB Effects

## Scope
- Folder: `08-comm`
- Purpose: allow users to opt in/out by channel/template; allow orgs to enforce policy (e.g., always CC admin on split changes).

## Entities
- `USER_NOTIFICATION_PREF` (user_id, channel, template_key?, opt_in, updated_at)
- `ORG_NOTIFICATION_POLICY` (org_id, channel, template_key?, is_enabled, cc_list, bcc_list, silence_hours json, updated_at)
- `AUDIT_LOG`

## Flows → DB Actions
| Flow | DB Action(s) | Notes |
|---|---|---|
| User changes prefs | `USER_NOTIFICATION_PREF.upsert` (unique: user_id+channel+template_key?) → `AUDIT_LOG` `notif_pref_changed` | Null template_key = all templates on channel |
| Admin sets org policy | `ORG_NOTIFICATION_POLICY.upsert` → `AUDIT_LOG` `org_notif_policy_changed` | May force enable critical templates |
| Resolve effective delivery | Merge: org policy (may override) + user pref | Policy wins for critical security/compliance |
| Quiet hours / digests | Policy adds `silence_hours`; worker batches to digest | Separate digest queue/table if needed |

## Permissions
- User can edit their prefs (except org-forced templates).
- Org Owner/Admin can edit org policy.

## Error/Edge Handling
- Validate CC/BCC address domains if restricted.
- Migrations: default everyone to opt-in for critical security (verify, reset, invite).
