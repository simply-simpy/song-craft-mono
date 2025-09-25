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
