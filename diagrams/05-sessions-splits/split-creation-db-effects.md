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
