#!/usr/bin/env bash
# make-workspace-db-effects.sh — generates DB-effects Markdown for 04-workspace flows

set -euo pipefail

# 1) SONG VERSIONING & CONTRIBUTIONS
cat > song-versioning-and-contributions-db-effects.md <<'MD'
# Song Versioning & Contributions · DB Effects

## Scope
- Folder: `04-workspace`
- Flow source: `song-versioning-and-contributions-flow.mermaid`
- Purpose: manage song autosaves, explicit versions, and track contributions per writer.

## Steps → DB Actions
| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| User types (autosave) | `SONG_REVISION.insert` (song_id, user_id, delta, autosave=true, created_at) | Autosave interval (default 5min) |
| Explicit save | `SONG_REVISION.insert` (song_id, user_id, full_snapshot, autosave=false, created_at, label optional) → `AUDIT_LOG` `song_version_saved` | User-triggered “save version” |
| Contributions tracking | `SONG_CONTRIBUTION.insert` (song_id, revision_id, user_id, lines_changed, metadata) | Attributed lines for split context |
| Load history | Read `SONG_REVISION` chain by song_id | Client reconstructs |
| Revert to version | `SONG_REVISION.insert` (song_id, user_id, based_on=old_revision_id, snapshot) → `AUDIT_LOG` `song_version_reverted` | New revision, not destructive |
| Diff view | Read `SONG_REVISION` + `SONG_CONTRIBUTION` | No new writes |
| Delete song (soft) | `SONG.update` status=archived → `AUDIT_LOG` `song_archived` | Keep revisions & audit |

## Entities Touched
- SONG, SONG_REVISION, SONG_CONTRIBUTION, AUDIT_LOG

## Permissions
- Owner/Collaborator can edit and autosave.
- Viewer can view history only.

## Audit Events
- `song_version_saved`, `song_version_reverted`, `song_archived`

## Notifications
- Optional: email/version label change summary to collaborators.

## Error/Edge Handling
- Autosave conflicts → merge strategy (client wins + delta).
- Version bloat → background cleanup of old autosaves (policy).
MD

# 2) WRITER FEATURES
cat > writer-features-db-effects.md <<'MD'
# Writer Features · DB Effects

## Scope
- Folder: `04-workspace`
- Flow source: `writer-features-notes.md` (conceptual features)
- Purpose: support collaborative writing (comments, notes, credits) inside the workspace.

## Steps → DB Actions
| Feature | DB Action(s) | Notes |
|---|---|---|
| Inline comments | `SONG_COMMENT.insert` (song_id, user_id, text, anchor line_ref, created_at) → `AUDIT_LOG` `comment_added` | Threading via parent_id |
| Edit/delete comment | `SONG_COMMENT.update` text/status → `AUDIT_LOG` `comment_edited` / `comment_deleted` | Soft delete recommended |
| Global song notes | `SONG_NOTE.insert` (song_id, user_id, text, created_at) | Separate from inline comments |
| Credit writers | `SONG_CREDIT.insert`_

