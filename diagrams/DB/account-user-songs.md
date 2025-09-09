# Core entities (single source of truth)

## Primary Entities

- user (sitewide identity)
- org (payer/label)
- account (bucket under an org) → account.org_id
- song (global, stable ID) → has one current working bucket: song.account_id (the home)
- song_version (many per song; final/working flags)

## Bridge Tables (many-to-many + permissions)

- membership: (user_id, account_id, role) — Owner/Collaborator/Viewer
- song_author: (song_id, user_id, role, split%) — any user can be co-author on any song
- song_access (optional): (song_id, account_id, permission) — share a song to another account without moving it
- tag/genre tables: song_tag, song_genre (lookup + bridges)

## Contributions & lineage

- line_contribution: (song_version_id, line_id, user_id) — who wrote which lines
- recording: (song_id or song_version_id, duration, user_id, …) — contributors on takes
- song_ownership_history: (song_id, from_account_id, to_account_id, method, effective_at) — audit transfer/sale/assignments

## Rights vs working bucket (to enable sales/moves)

- Keep working context simple: song.account_id = where the song currently lives
- Model legal/financial ownership separately so you can sell without losing history:
  - rights_holder: (song_id, holder_type {org|account}, holder_id, start_at, end_at, rights_type)
- This lets Publisher A sells 20 songs to Publisher B = batch insert of rights changes and optional move of song.account_id (to a Generic account in B)

## How this gives you flexibility

- Any song assigned to any author: via song_author (M:N). No special casing
- Any song in any org/account: either move the home account (song.account_id) or grant access via song_access if you want cross-account visibility without a move
- Multiple owners: make multiple membership records with role='Owner' in that account, and multiple song_author rows with role='owner' if you also want authorship flagged
- Publisher admin can see everything by org through joins on account.org_id

## Minimal columns (sample)

- song(id, account_id, title, status, created_at, updated_at)
- song_author(song_id, user_id, role, split_pct)
- song_access(song_id, account_id, permission) // view/edit
- song_ownership_history(song_id, from_account_id, to_account_id, method, effective_at)
- rights_holder(song_id, holder_type, holder_id, rights_type, start_at, end_at)

## Practical notes

- Transfers: do not mutate IDs; update song.account_id, write a history row, and (if needed) update rights_holder
- Queries: index (account_id) on song; composite indexes on the bridges:
  - song_author(song_id), song_author(user_id)
  - song_access(song_id), song_access(account_id)
- AuthZ: authorization checks are account-scoped (membership) + song_access (share) + role
