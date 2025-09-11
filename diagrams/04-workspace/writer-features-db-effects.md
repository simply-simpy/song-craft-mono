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

