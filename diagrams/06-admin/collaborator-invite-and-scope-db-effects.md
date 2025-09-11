# Collaborator Invite & Scope · DB Effects

## Scope
- Folder: `06-admin`
- Flow source: `collaborator-invite-and-scope-flow.mermaid`

## Steps → DB Actions
| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| Choose scope | Select Account-wide or Song-specific | Song-scoped membership stored in ACL table |
| Create invite | `INVITE.insert` (account_id, role=collaborator, email, token, expires_at, scope={account|song_id}) → `AUDIT_LOG` `invite_created` | Scope captured |
| Accept | If account-scope: `MEMBERSHIP.upsert`; if song-scope: `SONG_ACL.upsert` (song_id, user_id, role) | Transactional |
| Configure capabilities | `SONG_ACL` rules: edit, comment, split_view | Defaults from Global Admin |
| Revoke | `INVITE.update` status=revoked; if accepted & song-scope: `SONG_ACL.delete` | Keep audit trail |

## Entities Touched
- INVITE, MEMBERSHIP, SONG_ACL, AUDIT_LOG

## Permissions
- Account Owner, Account Manager, Org Admin/Owner.

## Audit Events
- `invite_created`, `membership_created_from_invite` (account scope), `song_acl_granted`, `song_acl_revoked`

## Notifications
- Invite + acceptance confirmations.

## Error/Edge Handling
- Duplicate ACL upserts should be idempotent.
- Domain policies still apply for invites.
