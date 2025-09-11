#!/usr/bin/env bash
# fix-validator-gaps.sh — create missing flow stubs and the one missing db-effects
set -euo pipefail

# 01-auth: sign-in flow stub
mkdir -p 01-auth
if [[ ! -f 01-auth/sign-in-flow.mermaid ]]; then
  cat > 01-auth/sign-in-flow.mermaid <<'MM'
flowchart TD
  A[User enters email + password] --> B[Clerk verifies credentials]
  B -->|Success| C[Set active context<br/>(account/org)]
  C --> D[Open Workspace / Switcher]
  B -->|Fail| E[Show generic error + reset option]
MM
  echo "wrote 01-auth/sign-in-flow.mermaid"
fi

# 04-workspace: writer-features flow stub
mkdir -p 04-workspace
if [[ ! -f 04-workspace/writer-features-flow.mermaid ]]; then
  cat > 04-workspace/writer-features-flow.mermaid <<'MM'
flowchart TD
  A[Open song workspace] --> B[Add inline comment / global note]
  A --> C[Attach reference asset]
  A --> D[Edit credits / roles]
  A --> E[View attribution (lines changed)]
  B --> F[Notify collaborators (optional)]
MM
  echo "wrote 04-workspace/writer-features-flow.mermaid"
fi

# 08-comm: deliverability-and-retry flow stub
mkdir -p 08-comm
if [[ ! -f 08-comm/deliverability-and-retry-flow.mermaid ]]; then
  cat > 08-comm/deliverability-and-retry-flow.mermaid <<'MM'
flowchart TD
  A[Producer enqueues NOTIFICATION] --> B[Worker renders template]
  B --> C[Send to ESP]
  C -->|Success| D[EMAIL_EVENT: queued/sent]
  C -->|Transient fail| E[Backoff + retry]
  C -->|Hard fail| F[DLQ + mark failed]
  G[ESP webhooks] --> H[EMAIL_EVENT: delivered/open/click/bounce]
  H --> I[Update NOTIFICATION status]
MM
  echo "wrote 08-comm/deliverability-and-retry-flow.mermaid"
fi

# 08-comm: ics-invites flow stub
if [[ ! -f 08-comm/ics-invites-flow.mermaid ]]; then
  cat > 08-comm/ics-invites-flow.mermaid <<'MM'
flowchart TD
  A[Create session + invite] --> B[Generate ICS (UID, DTSTART, etc.)]
  B --> C[Attach to email + send]
  C --> D[Recipient adds to calendar]
  E[Change/cancel session] --> F[Send ICS UPDATE/CANCEL with same UID]
MM
  echo "wrote 08-comm/ics-invites-flow.mermaid"
fi

# 08-comm: notification-preferences flow stub
if [[ ! -f 08-comm/notification-preferences-flow.mermaid ]]; then
  cat > 08-comm/notification-preferences-flow.mermaid <<'MM'
flowchart TD
  A[User opens notification settings] --> B[Toggle channel/template opt-in/out]
  B --> C[Save USER_NOTIFICATION_PREF]
  D[Org admin sets policy] --> E[Save ORG_NOTIFICATION_POLICY]
  C --> F[Delivery uses prefs + policy merge]
  E --> F
MM
  echo "wrote 08-comm/notification-preferences-flow.mermaid"
fi

# 99-overview: create the missing db-effects doc
mkdir -p 99-overview
if [[ ! -f 99-overview/full-site-overview-db-effects.md ]]; then
  cat > 99-overview/full-site-overview-db-effects.md <<'MD'
# Full-Site Overview · DB Effects

This overview summarizes **which domains are touched** by each major user journey.  
Use it as a reading guide; detailed actions live in per-folder `*-db-effects.md`.

## Auth (01-auth)
- USER, MEMBERSHIP, ACCOUNT, ORG, EMAIL_EVENT, AUDIT_LOG

## Plans/Billing (02-plans)
- PLAN_SUBSCRIPTION, CHECKOUT_SESSION, PAYMENT, SEAT_ALLOCATION/ASSIGNMENT, ACCOUNT, ORG, AUDIT_LOG

## Context (03-context)
- MEMBERSHIP/ORG_ROLE reads, USER.last_context write, AUDIT_LOG

## Workspace (04-workspace)
- SONG, SONG_REVISION, SONG_CONTRIBUTION, SONG_COMMENT/NOTE/CREDIT/ASSET, AUDIT_LOG

## Sessions & Splits (05-sessions-splits)
- SONG_SESSION, SONG_INVITE, SONG_SESSION_PARTICIPANT, SONG_SPLIT_* tables, EMAIL_EVENT, AUDIT_LOG

## Admin (06-admin)
- INVITE, MEMBERSHIP, SONG_ACL, ORG_ROLE, AUDIT_LOG, EMAIL_EVENT

## Comms (08-comm)
- NOTIFICATION, COMM_TEMPLATE, EMAIL_EVENT, USER_NOTIFICATION_PREF, ORG_NOTIFICATION_POLICY

## DB (09-db)
- ERDs and schema source of truth.

MD
  echo "wrote 99-overview/full-site-overview-db-effects.md"
fi

echo "Done. Now re-run: ./validate-flows.sh"

