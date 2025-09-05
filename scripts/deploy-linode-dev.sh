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
info "Building TanStack Start frontend in $FRONTEND_DIR (at $PROJECT_ROOT/$FRONTEND_DIR)…"
pushd "$PROJECT_ROOT/$FRONTEND_DIR" >/dev/null

if [ -f package-lock.json ]; then
  info "Using npm ci"
  npm ci
else
  warn "package-lock.json not found; using npm install"
  npm install
fi

# Build TanStack Start app
info "Running TanStack Start build..."
npm run build:tanstack

[ -d ".output" ] || fail "Build output not found (.output). Check your build."
[ -d ".output/server" ] || fail "Server output not found (.output/server). Check your build."
[ -d ".output/public" ] || fail "Public output not found (.output/public). Check your build."
popd >/dev/null

# ========= Ensure remote directories exist =========
info "Ensuring remote path exists: $SERVER_PATH"
ssh $SSH_OPTS "${LINODE_USER}@${LINODE_HOST}" "mkdir -p '$SERVER_PATH'"

# ========= Copy deployment files to server =========
info "Copying deployment files to ${LINODE_USER}@${LINODE_HOST}:$SERVER_PATH/"
scp $SSH_OPTS docker-compose.dev-linode.yml "${LINODE_USER}@${LINODE_HOST}:$SERVER_PATH/"
scp $SSH_OPTS nginx.dev.conf "${LINODE_USER}@${LINODE_HOST}:$SERVER_PATH/"
scp $SSH_OPTS Dockerfile.ssr "${LINODE_USER}@${LINODE_HOST}:$SERVER_PATH/"

ok "Deployment files uploaded"

# ========= Start all services =========
info "Starting all TanStack Start services on the server…"
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

# Stop existing services
$COMPOSE -f docker-compose.dev-linode.yml --env-file .env.dev-linode down || true

# Start all services (db, backend, frontend, nginx, redis)
$COMPOSE -f docker-compose.dev-linode.yml --env-file .env.dev-linode up -d

# Wait for services to be healthy
info "Waiting for services to be healthy..."
sleep 30

# Check service status
$COMPOSE -f docker-compose.dev-linode.yml --env-file .env.dev-linode ps
EOSH

ok "All services started"

# ========= Verify =========
info "Verifying TanStack Start deployment…"
ssh $SSH_OPTS "${LINODE_USER}@${LINODE_HOST}" '
  set -euo pipefail
  echo "Checking frontend service (port 3000)..."
  curl -sS -I http://localhost:3000/ | sed -n "1,5p" || true
  
  echo "Checking nginx proxy (port 8080)..."
  curl -sS -I http://localhost:8080/ | sed -n "1,5p" || true
  
  echo "Checking backend API (port 4500)..."
  curl -sS -I http://localhost:4500/health | sed -n "1,5p" || true
' || true

ok "TanStack Start deployment complete!"
info "Your app should be accessible at:"
info "- Frontend (direct): http://$LINODE_HOST:3000"
info "- Nginx proxy: http://$LINODE_HOST:8080"
info "- Backend API: http://$LINODE_HOST:4500"