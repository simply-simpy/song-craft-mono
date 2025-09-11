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

