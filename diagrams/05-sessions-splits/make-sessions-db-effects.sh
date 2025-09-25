#!/usr/bin/env bash
# make-sessions-db-effects.sh — generates DB-effects Markdown for Sessions & Splits flows

set -euo pipefail

# A) SESSION INVITE
cat > session-invite-db-effects.md <<'MD'
# Session Invite · DB Effects

## Scope
- Folder: `05-sessions-splits`
- Flow source: `session-invite-flow.mermaid`

## Steps → DB Actions
| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| Create session | `SONG_SESSION.insert` (song_id, start_at, end_at nullable, method zoom/meet/in_person, link, created_by) → `AUDIT_LOG` `session_created` | Transactional |
| Add invitees | `SONG_INVITE.insert` (session_id, inviter_id, invitee_email, role participant, status=invited, ics_uid, expires_at) (per invite) → `AUDIT_LOG` `invites_created` | Domain rules from Global Admin |
| Generate ICS + Zoom link | `EMAIL_EVENT.insert` `session_invite_sent` (per invite) | Store provider IDs |
| Accept/Decline | `SONG_INVITE.update` status=accepted/declined, invitee_user_id if known → `AUDIT_LOG` `invite_accepted`/`invite_declined` | Accept also pre-seats participant |
| Pre-seat participant | `SONG_SESSION_PARTICIPANT.upsert` (session_id, user_id, status=pending) | Created on accept; else on check-in |
| Reminder | `EMAIL_EVENT.insert` `session_reminder_sent` | Optional, scheduled job |

## Entities Touched
- SONG_SESSION, SONG_INVITE, SONG_SESSION_PARTICIPANT, EMAIL_EVENT, AUDIT_LOG

## Permissions
- Create: Org Owner/Admin, Account Manager, Account Owner.
- View: participants + owners.

## Audit Events
- `session_created`, `invites_created`, `session_invite_sent`, `invite_accepted`, `invite_declined`

## Notifications
- Invite + reminder emails with ICS and join link.

## Error/Edge Handling
- Duplicate invites (idempotent upsert by email+session).
- Expired/invalid invite token → reissue.
- Domain restriction enforcement at invite time.
MD

# B) ATTENDANCE & ELIGIBILITY
cat > attendance-eligibility-db-effects.md <<'MD'
# Attendance & Eligibility · DB Effects

## Scope
- Folder: `05-sessions-splits`
- Flow source: `attendance-eligibility-flow.mermaid`

## Steps → DB Actions
| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| Check-in opens | `SONG_SESSION.update` status=live, started_at (server time) → `AUDIT_LOG` `session_started` | Triggered at start |
| Writer checks in | `SONG_SESSION_PARTICIPANT.upsert` (session_id, user_id, status=present, check_in_at) → `AUDIT_LOG` `participant_checked_in` | Late is allowed |
| Mark late (optional) | `SONG_SESSION_PARTICIPANT.update` status=late | Still eligible |
| Mark absent / no-show | `SONG_SESSION_PARTICIPANT.upsert` status=absent → `AUDIT_LOG` `participant_no_show` | Automated at end if no check-in |
| Session ends | `SONG_SESSION.update` ended_at, status=ended → `AUDIT_LOG` `session_ended` | Cutoff for eligibility |
| Build eligible list | Derived: participants where status in [present, late] | Used by split locking |

## Entities Touched
- SONG_SESSION, SONG_SESSION_PARTICIPANT, AUDIT_LOG

## Permissions
- Check-in: participant self; Owners/Admins can mark manual status.

## Audit Events
- `session_started`, `participant_checked_in`, `participant_no_show`, `session_ended`

## Notifications
- No-show email to writer + managers (handled in split locking or post-session job).

## Error/Edge Handling
- Multiple devices: keep latest check-in; maintain history in audit.
- Timezones: store UTC; display local.
MD

# C) SPLIT CREATION & LOCKING (DEFAULT EVEN)
cat > split-creation-db-effects.md <<'MD'
# Split Creation & Locking (Default Even) · DB Effects

## Scope
- Folder: `05-sessions-splits`
- Flow source: `split-creation-flow.mermaid`

## Steps → DB Actions
| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| Generate default split | Compute even shares over eligible participants → `SONG_SPLIT_PROPOSAL.insert` (song_id, session_id, scheme=even, breakdown JSON, proposer_id, created_at) → `AUDIT_LOG` `split_proposed` | Deterministic rounding (see notes) |
| Owners review | No DB change unless edited to custom | UI only |
| Lock split | `SONG_SPLIT_FINAL.insert` (song_id, session_id, version n, breakdown JSON, effective_at) → `AUDIT_LOG` `split_locked` | Only Account Manager+ can finalize |
| Notify parties | `EMAIL_EVENT.insert` `split_locked_sent` (to all writers + managers) | Include PDF link |
| Generate split sheet PDF | Store artifact (S3/path) + hash → `AUDIT_LOG` `split_sheet_generated` | Include PRO/publisher metadata |

## Entities Touched
- SONG_SPLIT_PROPOSAL, SONG_SPLIT_FINAL, EMAIL_EVENT, AUDIT_LOG, (artifact store)

## Permissions
- Propose/Lock: Account Manager+ (Owners can view).

## Audit Events
- `split_proposed`, `split_locked`, `split_sheet_generated`

## Notifications
- Split locked email to all writers, Org Owner/Admin, Account Manager.

## Error/Edge Handling
- Shares must sum to 100.00 (tolerance ±0.01).
- No eligible participants → block finalization with clear error.

## Notes (Even Split Rounding)
- Compute base = floor(10000 / N)/100; distribute remainder pennies by check-in order for determinism.
MD

# D) SPLIT CHANGE (MANAGER+ ONLY)
cat > split-change-db-effects.md <<'MD'
# Split Change (Post-Lock; Manager+ Only) · DB Effects

## Scope
- Folder: `05-sessions-splits`
- Flow source: `split-change-flow.mermaid`

## Steps → DB Actions
| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| Open change form | Read current `SONG_SPLIT_FINAL` (latest version) | Show before state |
| Propose change | `SONG_SPLIT_CHANGE.insert` (song_id, from_version, to_breakdown JSON, reason, actor_id) → `AUDIT_LOG` `split_change_proposed` | Collect reason |
| Apply change | New `SONG_SPLIT_FINAL.insert` (version n+1) with `to_breakdown` → `AUDIT_LOG` `split_changed` (before/after) | Transactional |
| Notify all | `EMAIL_EVENT.insert` `split_changed_sent` (all writers + managers) | Include before/after, reason |
| Re-register (optional) | Queue downstream registration task | Async worker

## Entities Touched
- SONG_SPLIT_FINAL, SONG_SPLIT_CHANGE, EMAIL_EVENT, AUDIT_LOG

## Permissions
- Account Manager, Org Admin, Org Owner.

## Audit Events
- `split_change_proposed`, `split_changed`

## Notifications
- Mandatory to all writers + Org/Admin chain.

## Error/Edge Handling
- Enforce 100% total; reject if any writer missing.
- Record who initiated and why (non-empty reason).
MD

# E) SPLIT CONTEST (WRITER/OWNER CAN FILE; ORG ADMIN DECIDES)
cat > split-contest-db-effects.md <<'MD'
# Split Contest · DB Effects

## Scope
- Folder: `05-sessions-splits`
- Flow source: `split-contest-flow.mermaid`

## Steps → DB Actions
| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| File contest | `SONG_SPLIT_CONTEST.insert` (song_id, version, filed_by, reason, status=pending, created_at) → `AUDIT_LOG` `split_contested` | Visible to all writers |
| Notify resolver | `EMAIL_EVENT.insert` `split_contest_filed` (to Org Admin + managers) | Include context |
| Review & decision | `SONG_SPLIT_CONTEST.update` status=upheld/modified/rejected, decided_by, decided_at, notes → `AUDIT_LOG` `split_contest_decided` | If modified, proceed to change flow |
| If modified | Follow **Split Change** flow (new version, notify all) | Keep linkage to contest ID |
| Notify parties | `EMAIL_EVENT.insert` `split_contest_resolved` (all writers + managers) | Outcome and rationale |

## Entities Touched
- SONG_SPLIT_CONTEST, SONG_SPLIT_FINAL (if modified), EMAIL_EVENT, AUDIT_LOG

## Permissions
- File: Owner/Collaborator on the song; Resolve: Org Admin.

## Audit Events
- `split_contested`, `split_contest_decided`

## Notifications
- Filed → Org Admin; Resolved → all writers + managers.

## Error/Edge Handling
- One open contest per version; require reason text.
- Timebox SLA for decision (configurable).
MD

# F) SESSION LIFECYCLE (END-TO-END GLUE)
cat > session-lifecycle-db-effects.md <<'MD'
# Session Lifecycle (End-to-End) · DB Effects

## Scope
- Folder: `05-sessions-splits`
- Flow source: `session-lifecycle-flow.mermaid`

## Steps → DB Actions
| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| Create session & invites | See **Session Invite** DB effects | Reuse |
| Run session & attendance | See **Attendance & Eligibility** DB effects | Reuse |
| Lock split | See **Split Creation & Locking** DB effects | Reuse |
| Change split (if needed) | See **Split Change** DB effects | Reuse |
| Contest (optional) | See **Split Contest** DB effects | Reuse |
| Archive session | `SONG_SESSION.update` archived_at=true or status=archived → `AUDIT_LOG` `session_archived` | For history/compliance |

## Entities Touched
- SONG_SESSION (+ linked tables), AUDIT_LOG

## Permissions
- Create: Manager+ or Owner; Change: Manager+; Contest: writers.

## Audit Events
- `session_archived` (plus all reused events).

## Notifications
- As per reused flows (invites, locked, changed, contests).

## Error/Edge Handling
- Ensure archival does not delete data; keep all versions & audits.
MD

echo "All DB-effects docs generated in $(pwd)"

