#!/usr/bin/env bash
set -euo pipefail

# ========= Config =========
: "${LINODE_HOST:?export LINODE_HOST=<server_ip>}"
LINODE_USER="${LINODE_USER:-root}"

# Frontend (local)
PROJECT_ROOT="${PROJECT_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)}"
FRONTEND_DIR="${FRONTEND_DIR:-songcraft}"     # path to your frontend relative to PROJECT_ROOT
BUILD_ENV_VARS="${BUILD_ENV_VARS:-VITE_API_URL=/api}"  # build-time vars; use same-origin /api

# Server (remote)
SERVER_PATH="${SERVER_PATH:-/opt/tunecap-dev}"         # where docker-compose lives on the server
SERVER_PUBLIC="${SERVER_PUBLIC:-$SERVER_PATH/public}"   # bind-mounted in docker-compose as /usr/share/nginx/html

SSH_OPTS="${SSH_OPTS:--o StrictHostKeyChecking=accept-new}"

# Determine rsync verbosity/compat flags (macOS ships an older rsync without --info)
if rsync --info=help >/dev/null 2>&1; then
  RSYNC_INFO_FLAGS="--info=stats1,progress2"
else
  RSYNC_INFO_FLAGS="--progress --stats"
fi

# ========= Helpers =========
info()  { printf "\033[0;34m[INFO]\033[0m %s\n" "$*"; }
ok()    { printf "\033[0;32m[SUCCESS]\033[0m %s\n" "$*"; }
warn()  { printf "\033[1;33m[WARN]\033[0m %s\n" "$*"; }
fail()  { printf "\033[0;31m[ERROR]\033[0m %s\n" "$*"; exit 1; }

need() {
  command -v "$1" >/dev/null 2>&1 || fail "Required command not found: $1"
}

# ========= Checks =========
need ssh
need rsync
need npm

[ -d "$PROJECT_ROOT/$FRONTEND_DIR" ] || fail "Frontend dir not found: $PROJECT_ROOT/$FRONTEND_DIR"
[ -f "$PROJECT_ROOT/$FRONTEND_DIR/package.json" ] || fail "package.json not found in $FRONTEND_DIR"

# ========= Build frontend locally =========
info "Building frontend in $FRONTEND_DIR (at $PROJECT_ROOT/$FRONTEND_DIR)…"
pushd "$PROJECT_ROOT/$FRONTEND_DIR" >/dev/null

if [ -f package-lock.json ]; then
  info "Using npm ci"
  npm ci
else
  warn "package-lock.json not found; using npm install"
  npm install
fi

# Pass build-time env vars (e.g., VITE_API_URL=/api) to the build
info "Running build with: $BUILD_ENV_VARS npm run build"
eval "$BUILD_ENV_VARS npm run build"

[ -d ".output/public" ] || fail "Build output not found (.output/public). Check your build."
popd >/dev/null

# ========= Ensure remote directories exist =========
info "Ensuring remote path exists: $SERVER_PUBLIC"
ssh $SSH_OPTS "${LINODE_USER}@${LINODE_HOST}" "mkdir -p '$SERVER_PUBLIC'"

# ========= Sync built assets =========
info "Rsyncing .output/public/ to ${LINODE_USER}@${LINODE_HOST}:$SERVER_PUBLIC/"
rsync -az --delete $RSYNC_INFO_FLAGS \
  "$PROJECT_ROOT/$FRONTEND_DIR/.output/public/" \
  "${LINODE_USER}@${LINODE_HOST}":"$SERVER_PUBLIC/"

ok "Static assets uploaded"

# ========= Reload nginx in the container =========
info "Reloading nginx inside the container (or starting it if needed)…"
ssh $SSH_OPTS "${LINODE_USER}@${LINODE_HOST}" bash -s <<'EOSH'
set -euo pipefail
SERVER_PATH="${SERVER_PATH:-/opt/tunecap-dev}"

# Pick docker-compose or docker compose
if command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  COMPOSE="docker compose"
fi

cd "$SERVER_PATH"

# Try reload; if container isn't running, (re)create it
if ! $COMPOSE -f docker-compose.dev-linode.yml --env-file .env.dev-linode exec -T nginx nginx -t >/dev/null 2>&1; then
  $COMPOSE -f docker-compose.dev-linode.yml --env-file .env.dev-linode up -d nginx
else
  $COMPOSE -f docker-compose.dev-linode.yml --env-file .env.dev-linode exec -T nginx nginx -s reload || \
  $COMPOSE -f docker-compose.dev-linode.yml --env-file .env.dev-linode up -d nginx
fi
EOSH

ok "Nginx reloaded"

# ========= Verify =========
info "Verifying from server…"
ssh $SSH_OPTS "${LINODE_USER}@${LINODE_HOST}" '
  set -euo pipefail
  (curl -sS -I http://localhost/ || curl -sS -I http://localhost:8080/) | sed -n "1,5p" || true
  curl -sS http://localhost/health || curl -sS http://localhost:8080/health || true
' || true

ok "Deployment complete. Visit: http://$LINODE_HOST/"