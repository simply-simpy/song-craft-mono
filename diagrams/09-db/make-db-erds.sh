#!/usr/bin/env bash
# make-db-erds.sh — generates consolidated ERDs for 09-db
set -euo pipefail

# 1) CORE IDENTITY: users, orgs, accounts, membership
cat > core-identity-erd.mermaid <<'ERD'
erDiagram
  USER {
    uuid id PK
    string email UNIQUE
    string display_name
    jsonb last_context   // {org_id, account_id, ts}
    timestamp created_at
  }

  ORG {
    uuid id PK
    string name
    string type          // personal organization
    string status        // pending_activation active suspended
    timestamp created_at
  }

  ACCOUNT {
    uuid id PK
    uuid org_id FK
    string name
    string plan          // Free Pro
    string status        // pending_activation active suspended
    boolean is_default
    timestamp created_at
  }

  MEMBERSHIP {
    uuid id PK
    uuid user_id FK
    uuid account_id FK
    string role          // owner manager collaborator viewer
    timestamp created_at
    UNIQUE user_id account_id
  }

  ORG_ROLE {
    uuid id PK
    uuid user_id FK
    uuid org_id FK
    string role          // owner admin observer
    timestamp created_at
    UNIQUE user_id org_id
  }

  AUDIT_LOG {
    uuid id PK
    uuid actor_user_id
    string action
    uuid org_id
    uuid account_id
    uuid subject_id
    jsonb meta
    timestamp created_at
  }

  USER ||--o{ MEMBERSHIP : holds
  ACCOUNT ||--o{ MEMBERSHIP : includes
  USER ||--o{ ORG_ROLE : has
  ORG ||--o{ ACCOUNT : contains
  ORG ||--o{ ORG_ROLE : assigns
  USER ||--o{ AUDIT_LOG : acts
  ORG ||--o{ AUDIT_LOG : context
  ACCOUNT ||--o{ AUDIT_LOG : context
ERD

# 2) ACCESS CONTROL: ACLs and visibility
cat > access-control-erd.mermaid <<'ERD'
erDiagram
  USER {
    uuid id PK
    string email
  }

  SONG {
    uuid id PK
    uuid account_id FK
    string title
    string status       // draft active archived
    timestamp created_at
  }

  SONG_ACL {
    uuid id PK
    uuid song_id FK
    uuid user_id FK
    string role        // editor viewer
    jsonb caps         // fine grained capabilities
    timestamp created_at
    UNIQUE song_id user_id
  }

  MEMBERSHIP {
    uuid id PK
    uuid user_id FK
    uuid account_id FK
    string role        // owner manager collaborator viewer
    timestamp created_at
  }

  ORG_ROLE {
    uuid id PK
    uuid user_id FK
    uuid org_id FK
    string role        // owner admin observer
    timestamp created_at
  }

  USER ||--o{ SONG_ACL : can_access
  SONG ||--o{ SONG_ACL : grants
  USER ||--o{ MEMBERSHIP : belongs
  USER ||--o{ ORG_ROLE : org_scope
ERD

# 3) SONGS + COLLAB FEATURES: versions, comments, credits, assets
cat > songs-collab-erd.mermaid <<'ERD'
erDiagram
  SONG {
    uuid id PK
    uuid account_id FK
    string title
    string status         // draft active archived
    timestamp created_at
  }

  SONG_REVISION {
    uuid id PK
    uuid song_id FK
    uuid user_id FK
    boolean autosave
    uuid based_on_revision_id
    jsonb snapshot_or_delta
    string label
    timestamp created_at
  }

  SONG_CONTRIBUTION {
    uuid id PK
    uuid song_id FK
    uuid revision_id FK
    uuid user_id FK
    jsonb lines_changed
    jsonb meta
    timestamp created_at
  }

  SONG_COMMENT {
    uuid id PK
    uuid song_id FK
    uuid user_id FK
    uuid parent_id
    string text
    string status        // active edited deleted
    string anchor        // line reference
    timestamp created_at
    timestamp updated_at
  }

  SONG_NOTE {
    uuid id PK
    uuid song_id FK
    uuid user_id FK
    string text
    timestamp created_at
  }

  SONG_CREDIT {
    uuid id PK
    uuid song_id FK
    uuid user_id FK
    string role          // lyricist composer producer
    timestamp created_at
  }

  SONG_ASSET {
    uuid id PK
    uuid song_id FK
    uuid user_id FK
    string file_url
    string type          // audio pdf midi
    string hash
    timestamp created_at
  }

  USER {
    uuid id PK
    string email
  }

  USER ||--o{ SONG_REVISION : writes
  USER ||--o{ SONG_CONTRIBUTION : contributes
  USER ||--o{ SONG_COMMENT : comments
  USER ||--o{ SONG_NOTE : notes
  USER ||--o{ SONG_CREDIT : credited
  USER ||--o{ SONG_ASSET : uploads

  SONG ||--o{ SONG_REVISION : has
  SONG ||--o{ SONG_CONTRIBUTION : has
  SONG ||--o{ SONG_COMMENT : has
  SONG ||--o{ SONG_NOTE : has
  SONG ||--o{ SONG_CREDIT : has
  SONG ||--o{ SONG_ASSET : has
ERD

# 4) SESSIONS + SPLITS
cat > sessions-splits-erd.mermaid <<'ERD'
erDiagram
  SONG {
    uuid id PK
    uuid account_id FK
    string title
  }

  SONG_SESSION {
    uuid id PK
    uuid song_id FK
    timestamp start_at
    timestamp end_at
    string method        // zoom meet in_person
    string link
    string status        // scheduled live ended archived
    timestamp created_at
  }

  SONG_INVITE {
    uuid id PK
    uuid session_id FK
    uuid inviter_user_id FK
    string invitee_email
    uuid invitee_user_id
    string token
    string status        // invited accepted declined revoked
    string ics_uid
    timestamp expires_at
    timestamp created_at
  }

  SONG_SESSION_PARTICIPANT {
    uuid id PK
    uuid session_id FK
    uuid user_id FK
    string status       // pending present late absent
    timestamp check_in_at
    UNIQUE session_id user_id
  }

  SONG_SPLIT_PROPOSAL {
    uuid id PK
    uuid song_id FK
    uuid session_id FK
    uuid proposer_id FK
    string scheme       // even custom
    jsonb breakdown     // [{user_id, pct}]
    timestamp created_at
  }

  SONG_SPLIT_FINAL {
    uuid id PK
    uuid song_id FK
    uuid session_id FK
    int version
    jsonb breakdown     // final shares sum 100
    timestamp effective_at
  }

  SONG_SPLIT_CHANGE {
    uuid id PK
    uuid song_id FK
    int from_version
    jsonb to_breakdown
    uuid actor_id FK
    string reason
    timestamp created_at
  }

  SONG_SPLIT_CONTEST {
    uuid id PK
    uuid song_id FK
    int version
    uuid filed_by FK
    string reason
    string status       // pending upheld modified rejected
    uuid decided_by
    timestamp decided_at
    timestamp created_at
  }

  USER {
    uuid id PK
    string email
  }

  SONG ||--o{ SONG_SESSION : schedules
  SONG_SESSION ||--o{ SONG_INVITE : sends
  SONG_SESSION ||--o{ SONG_SESSION_PARTICIPANT : has
  USER ||--o{ SONG_SESSION_PARTICIPANT : attends
  USER ||--o{ SONG_INVITE : sends
  SONG ||--o{ SONG_SPLIT_PROPOSAL : proposes
  SONG ||--o{ SONG_SPLIT_FINAL : locks
  SONG ||--o{ SONG_SPLIT_CHANGE : changes
  USER ||--o{ SONG_SPLIT_CHANGE : acts
  SONG ||--o{ SONG_SPLIT_CONTEST : contests
  USER ||--o{ SONG_SPLIT_CONTEST : files
ERD

# 5) BILLING + SUBSCRIPTIONS
cat > billing-subscriptions-erd.mermaid <<'ERD'
erDiagram
  ACCOUNT {
    uuid id PK
    uuid org_id FK
    string plan        // Free Pro
    string status
  }

  ORG {
    uuid id PK
    string name
    string status
  }

  PLAN_SUBSCRIPTION {
    uuid id PK
    string scope_type   // org account
    uuid scope_id
    string plan         // Free Pro Org
    string status       // active canceled cancel_at_period_end
    timestamp current_period_end
    timestamp created_at
  }

  CHECKOUT_SESSION {
    uuid id PK
    string scope_type    // org account
    uuid scope_id
    string plan
    string provider_session_id UNIQUE
    string status        // pending succeeded failed canceled
    int amount
    string currency
    timestamp created_at
  }

  PAYMENT {
    uuid id PK
    string scope_type
    uuid scope_id
    string provider_charge_id UNIQUE
    int amount
    string currency
    string status        // succeeded failed refunded
    timestamp created_at
  }

  SEAT_ALLOCATION {
    uuid id PK
    uuid org_id FK
    int seats_total
    int seats_available
    timestamp updated_at
  }

  SEAT_ASSIGNMENT {
    uuid id PK
    uuid org_id FK
    uuid user_id FK
    string seat_type     // pro
    string status        // active revoked
    timestamp assigned_at
    UNIQUE org_id user_id seat_type status
  }

  ACCOUNT ||--o{ PLAN_SUBSCRIPTION : may_have
  ORG ||--o{ PLAN_SUBSCRIPTION : may_have
  ACCOUNT ||--o{ CHECKOUT_SESSION : starts
  ORG ||--o{ CHECKOUT_SESSION : starts
  ACCOUNT ||--o{ PAYMENT : records
  ORG ||--o{ PAYMENT : records
  ORG ||--o{ SEAT_ALLOCATION : manages
  ORG ||--o{ SEAT_ASSIGNMENT : assigns
  USER ||--o{ SEAT_ASSIGNMENT : receives
ERD

# 6) COMMS + NOTIFICATIONS
cat > comms-notifications-erd.mermaid <<'ERD'
erDiagram
  COMM_TEMPLATE {
    uuid id PK
    string key
    string channel      // email in_app sms
    string locale
    int version
    text subject_tmpl
    text body_tmpl
    timestamp updated_at
  }

  NOTIFICATION {
    uuid id PK
    uuid user_id
    uuid org_id
    uuid account_id
    string channel
    string template_key
    jsonb payload_json
    string status        // pending sent failed
    string priority
    string dedupe_key
    int attempts
    timestamp next_attempt_at
    string last_error
    timestamp created_at
  }

  EMAIL_EVENT {
    uuid id PK
    uuid notification_id FK
    string provider
    string message_id
    string type          // queued sent delivered opened clicked bounced complained
    jsonb meta_json
    timestamp ts
  }

  USER_NOTIFICATION_PREF {
    uuid id PK
    uuid user_id FK
    string channel
    string template_key
    boolean opt_in
    timestamp updated_at
  }

  ORG_NOTIFICATION_POLICY {
    uuid id PK
    uuid org_id FK
    string channel
    string template_key
    boolean is_enabled
    text cc_list
    text bcc_list
    jsonb silence_hours
    timestamp updated_at
  }

  AUDIT_LOG {
    uuid id PK
    uuid actor_user_id
    string action
    jsonb meta
    timestamp created_at
  }

  COMM_TEMPLATE ||--o{ NOTIFICATION : renders
  NOTIFICATION ||--o{ EMAIL_EVENT : emits
  USER ||--o{ USER_NOTIFICATION_PREF : sets
  ORG ||--o{ ORG_NOTIFICATION_POLICY : sets
  USER ||--o{ AUDIT_LOG : acts
ERD

echo "ERDs created:"
ls -1 *.mermaid

