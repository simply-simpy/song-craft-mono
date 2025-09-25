#!/usr/bin/env bash
# usage:
#   ./make-db-effects.sh           # create missing md files
#   ./make-db-effects.sh --force   # overwrite existing md files

set -euo pipefail

FORCE=0
if [[ "${1:-}" == "--force" ]]; then
  FORCE=1
fi

shopt -s nullglob
flows=( *-flow.mermaid )

if (( ${#flows[@]} == 0 )); then
  echo "No *-flow.mermaid files found in $(pwd)"
  exit 0
fi

for f in "${flows[@]}"; do
  base="${f%-flow.mermaid}"
  md="${base}-db-effects.md"

  if (( FORCE == 0 )) && [[ -f "$md" ]]; then
    echo "skip: $md (exists)"
    continue
  fi

  # Derive a nice title from the filename
  title="$(echo "$base" | sed -E 's/-/ /g' | sed -E 's/\b([a-z])/\U\1/g')"
  now="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

  cat > "$md" <<EOF
# ${title} · DB Effects

> Source flow: \`${f}\`  
> Generated: ${now} (UTC)

## Scope
- Folder: \`01-auth\`
- Flow: \`${f}\`
- Outcome: enumerate DB writes/updates, permissions, and audit events for the flow.

---

## Steps → DB Actions

| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| 1.  |  |  |
| 2.  |  |  |
| 3.  |  |  |

> Tip: keep actions explicit (insert/update/upsert), include IDs written, and whether wrapped in a transaction.

---

## Entities Touched
- USER
- MEMBERSHIP
- ACCOUNT
- ORG
- EMAIL_EVENT
- AUDIT_LOG
- (add/remove as needed)

---

## Permissions
- Who can initiate: 
- Preconditions:
- Edge cases:

---

## Audit Events
Use these canonical names where possible (add more if needed):
- \`user_created\`
- \`user_signed_in\`
- \`email_verified\`
- \`invite_opened\`
- \`membership_created_from_invite\`
- \`magic_link_used\`
- \`password_reset_success\`
- \`context_rehydrated\`

---

## Notifications (Email/In-App)
- Template(s):
- Recipients:
- Trigger points:

---

## Error/Edge Handling
- Idempotency:
- Rate limiting:
- Invalid/expired tokens:
- Recovery paths:

---

## Open Questions / Assumptions
- 
- 

EOF

  echo "wrote: $md"
done
