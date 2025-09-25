#!/usr/bin/env bash
# make-comm-db-effects.sh — generates DB-effects Markdown for 08-comm

set -euo pipefail

# 1) EMAIL COMM (PIPELINE)
cat > email-comm-db-effects.md <<'MD'
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
MD

# 2) NOTIFICATION PREFERENCES & POLICIES
cat > notification-preferences-db-effects.md <<'MD'
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
MD

# 3) DELIVERABILITY, QUEUES & RETRIES
cat > deliverability-and-retry-db-effects.md <<'MD'
# Deliverability, Queues & Retries · DB Effects

## Scope
- Folder: `08-comm`
- Purpose: robust async delivery with retries, backoff, and webhook reconciliation.

## Suggested Tables/Columns
- `NOTIFICATION` (status, priority, attempts, next_attempt_at, last_error)
- `EMAIL_EVENT` (provider, message_id, type, ts)
- `DELIVERY_DLQ` (notification_id, reason, payload_snapshot, created_at) — optional dead-letter queue

## Worker Loop (Pseudo)
1. Select pending notifications by priority and `next_attempt_at` <= now  
2. Render and attempt send  
3. On success → mark sent; write `EMAIL_EVENT(type='queued')`  
4. On transient failure → increment `attempts`, set `next_attempt_at` with backoff  
5. On hard failure (invalid address/bounce) → DLQ; mark NOTIFICATION failed

## Backoff Policy
- Attempts: 0,1,2,3,4… with delays e.g., 1m, 5m, 30m, 2h, 24h (cap).  
- Transient error codes (provider) → retry; permanent (bounce, suppression) → stop.

## Webhook Reconciliation
- Upsert `EMAIL_EVENT` by (message_id, type, ts).  
- If provider reports delivered/open/click → keep `NOTIFICATION.status='sent'`.  
- If bounce/complaint → mark `NOTIFICATION.status='failed'`; optionally disable email channel for that user.

## Audit
- `AUDIT_LOG` minimal entries; rely on `EMAIL_EVENT` for fine-grained telemetry.

## Metrics
- Sent, delivered, open rate, click rate, bounce rate per template/org/account.
MD

# 4) ICS INVITES (CALENDAR ATTACHMENTS)
cat > ics-invites-db-effects.md <<'MD'
# ICS Invites (Calendar Attachments) · DB Effects

## Scope
- Folder: `08-comm`
- Related flows: `05-sessions-splits/session-invite-flow.mermaid`
- Purpose: generate calendar invites (.ics) for songwriting sessions with accurate RSVP tracking.

## Entities
- `SONG_SESSION` (id, song_id, start_at, end_at, method, link)
- `SONG_INVITE` (id, session_id, invitee_email, ics_uid, status)
- `EMAIL_EVENT` (invite sent, updates)
- `AUDIT_LOG`

## Steps → DB Actions
| Step | DB Action(s) | Notes |
|---|---|---|
| Compose ICS | Generate RFC5545: UID= `SONG_INVITE.ics_uid`, DTSTAMP/DTSTART/DTEND (UTC), SUMMARY (song title + "Song Session"), DESCRIPTION (link), ORGANIZER, ATTENDEE | Store ICS bytes if needed |
| Send | Attach ICS to `session_invite` template; `EMAIL_EVENT.insert(type='session_invite_sent')` | Provider supports attachments |
| RSVP updates | If using email reply parsing or calendar webhook, map UID → `SONG_INVITE.update status=accepted/declined` → `AUDIT_LOG` | Optional; baseline is in-app accept |
| Change/cancel | Send ICS UPDATE/CANCEL with same UID/SEQUENCE | Keep calendars in sync |

## Error/Edge Handling
- Timezone display: store UTC; render local in email body.
- Ensure UID stability (don’t regenerate on resend).
MD

echo "All DB-effects docs generated in $(pwd)"

