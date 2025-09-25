# Email Communications (Pipeline) · DB Effects

## Scope
- Folder: `08-comm`
- Flow source: `email-comm-flow.mermaid`
- Purpose: consistent pipeline to compose, enqueue, send, and track notifications (email; can extend to in-app, SMS).

## Key Entities
- `COMM_TEMPLATE` (id, key, channel, locale, version, subject_tmpl, body_tmpl, updated_by)
- `NOTIFICATION` (id, user_id?, org_id?, account_id?, channel, template_key, payload_json, status=pending/sent/failed, priority, dedupe_key, created_at)
- `EMAIL_EVENT` (id, notification_id, provider, message_id, type=queued/sent/delivered/opened/clicked/bounced/complained, ts, meta_json)
- `USER_NOTIFICATION_PREF` (user_id, channel, template_key?, opt_in bool, updated_at)
- `ORG_NOTIFICATION_POLICY` (org_id, channel, template_key?, is_enabled, cc_list, bcc_list, updated_at)
- `AUDIT_LOG`

## Steps → DB Actions
| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| 1. Trigger | Producer creates `NOTIFICATION.insert` (channel=email, template_key, payload, target user/org/account, priority, dedupe_key) | One row per recipient; batch allowed |
| 2. Preferences & policy check | Worker reads `USER_NOTIFICATION_PREF` + `ORG_NOTIFICATION_POLICY` to decide send/skip/CC/BCC | Cache for performance |
| 3. Render | Load `COMM_TEMPLATE` (by key+locale) and render with payload → produce subject/body | Versioned templates |
| 4. Enqueue to provider | Call ESP API; on success: `EMAIL_EVENT.insert(type='queued', message_id)`; update `NOTIFICATION.status='sent'` | Store provider ids |
| 5. Webhooks | On delivered/open/click/bounce/complaint: `EMAIL_EVENT.insert` with type; update `NOTIFICATION.status` if terminal | Idempotent by message_id+event type |
| 6. Auditing | `AUDIT_LOG.insert` with `notification_sent` (actor system, template_key, recipient) | System actor, not a human |

## Common Templates (keys)
- `session_invite`
- `session_reminder`
- `split_locked`
- `split_changed`
- `split_contest_filed`
- `split_contest_resolved`
- `plan_cancel_confirmed`
- `role_change_notified`

## Permissions
- System-only writers. Producers must pass an access check to emit (e.g., owner/manager actions).

## Error/Edge Handling
- Dedupe: if `dedupe_key` repeats within TTL, skip.
- Retry policy: exponential backoff (see Deliverability doc).
- Hard bounces: mark `USER_NOTIFICATION_PREF` email channel as disabled (auto); alert admin if org-wide.
