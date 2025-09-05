### Dev environment (dev.songscri.be)

This describes how we run the hosted dev stack on our Linode box at 198.74.55.52.

- Host: dev.songscri.be
- SSH: `ssh root@198.74.55.52`
- Stack: Docker Compose (`docker-compose.dev-linode.yml`)
- Services: Postgres (container), API (Fastify), SSR frontend (TanStack Start), Nginx (container on 8080)

### One-time setup on the server

1. Install Docker + Compose (if not already):

```bash
apt update && apt install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update && apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

2. Choose a working directory and clone/update the repo (example):

```bash
mkdir -p /opt/songscribe-dev
cd /opt/songscribe-dev
git clone https://github.com/<your-org>/songcraft-mono.git .   # or pull latest if already present
git pull
```

3. Create the env file from `env.dev-linode` and fill secrets:

```bash
cd /opt/songscribe-dev
cp env.dev-linode .env.dev-linode
vi .env.dev-linode  # set POSTGRES_PASSWORD, CLERK_SECRET_KEY, etc.
```

Notes:

- The dev stack uses its own Postgres container and sets `ALLOW_HTTP=true`.
- Frontend uses `VITE_API_URL=/api` and Nginx (container) proxies `/` → frontend and `/api/` → backend.

### Start/stop the dev stack

Start or rebuild:

```bash
cd /opt/songscribe-dev
docker compose -f docker-compose.dev-linode.yml --env-file .env.dev-linode up -d --build
```

Stop (keep volumes):

```bash
docker compose -f docker-compose.dev-linode.yml down
```

Reset DB (drops data) and recreate:

```bash
docker compose -f docker-compose.dev-linode.yml down -v
docker compose -f docker-compose.dev-linode.yml --env-file .env.dev-linode up -d db
```

### Verify health

List services:

```bash
docker compose -f docker-compose.dev-linode.yml ps
```

Check health endpoints (Nginx → backend):

```bash
curl -i http://127.0.0.1:8080/health
```

Check direct services:

```bash
curl -i http://127.0.0.1:8080            # SSR app
curl -i http://127.0.0.1:8080/api/health # API via Nginx
```

Database connection (from server):

```bash
psql postgresql://songcraft:${POSTGRES_PASSWORD}@127.0.0.1:5432/${POSTGRES_DB:-songcraft_dev} -c '\dt'
```

### Domain and Nginx/Cloudflare

- The dev Nginx container publishes port 8080 on the host (`8080:80`).
- Recommended: keep host port 80 free for a host-level Nginx or Cloudflare proxy.
  - If you already have host Nginx, proxy `server_name dev.songscri.be` → `http://127.0.0.1:8080`.
  - If you don’t use host Nginx and want direct access, you can temporarily reach `http://198.74.55.52:8080`.
- Cloudflare: point `dev.songscri.be` A record to `198.74.55.52`. For dev, you can run HTTP only (Flexible) since `ALLOW_HTTP=true`.

Example host-level Nginx (on the server, not in Docker):

```nginx
server {
    listen 80;
    server_name dev.songscri.be;
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Common operations

Tail logs:

```bash
docker compose -f docker-compose.dev-linode.yml logs -f nginx
docker compose -f docker-compose.dev-linode.yml logs -f frontend
docker compose -f docker-compose.dev-linode.yml logs -f backend
docker compose -f docker-compose.dev-linode.yml logs -f db
```

Update to latest code:

```bash
cd /opt/tunecap-dev
git pull
docker compose -f docker-compose.dev-linode.yml --env-file .env.dev-linode up -d --build
```

### Troubleshooting quick wins

- Cloudflare 521: ensure Nginx (container) is up and host-level proxy routes 80 → 8080, or map `8080:80` → `80:80` in compose if port 80 is free.
- CORS: dev uses `CORS_ORIGIN=*`; if you lock it down, include your dev domain(s).
- DB init: the dev DB is initialized by `songcraft-api/drizzle/0000_high_jack_flag.sql` (includes `CREATE EXTENSION IF NOT EXISTS pgcrypto;`). Recreate with `down -v` if needed.
- Health checks: `/health` (Nginx → backend), `/api/health` (explicit), and API docs at `/documentation` on the backend service (proxied via Nginx path if added).

# Run Dev
