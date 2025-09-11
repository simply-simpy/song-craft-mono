# Site Nav (Route Guards & Visibility) · DB Effects

## Scope
- Folder: `03-context`
- Flow source: `site-nav-flow.mermaid`
- Purpose: Guard routes and show/hide nav items based on active context and permissions.

## Steps → DB Actions
| Step (UX/Event) | DB Action(s) | Notes |
|---|---|---|
| Render global nav | none (uses `SESSION_CONTEXT.effective_perms`) | Do not hit DB on every render |
| Guard route → Workspace | Verify membership in active account OR `SONG_ACL` for that song | 403 with helpful CTA if blocked |
| Guard route → Song Admin | Require Owner or higher in active account | 403 |
| Guard route → Global Admin | Require Account Owner/Manager or Org Admin | 403 |
| Guard route → Org Admin | Require Org Owner/Admin | 403 |
| Context change via nav | (See Account Switcher) | Persist `last_context` |

## Entities Touched
- Primarily cached session context; conditional reads of `SONG_ACL` or `MEMBERSHIP` when opening deep links.

## Permissions
- Enforced centrally in API middleware + client route guards.

## Audit Events
- Optional: `route_forbidden` with attempted path & capability for security reviews.

## Error/Edge Handling
- Deep link to resource outside active account: offer “Switch to eligible account?” prompt (list accounts where user has access).
- Avoid N+1 reads: fetch membership & ACL on demand, cache for page lifetime.

