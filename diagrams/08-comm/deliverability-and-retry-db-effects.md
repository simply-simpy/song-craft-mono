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
