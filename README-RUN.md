# Run

## Quick Start (Recommended)

From the root directory `/Users/scott/Sites/songcraft-mono`:

```bash
# Start the docs
npm run dev

# Start the database
npm run dev:db

# Start the API (in a separate terminal)
npm run dev:api

# Start the frontend (in another separate terminal)
npm run dev:frontend
```

## Connect to DB

- DB: songcraft_dev
- DATABASE_URL="postgresql://songcraft:songcraft_dev_password@localhost:5433/songcraft_dev"

## Alternative: Manual Commands

### Start only the DB in Docker

cd /Users/scott/Sites/songcraft-mono
docker compose up -d db

### Start the API locally (Fastify on 4500)

cd /Users/scott/Sites/songcraft-mono
DATABASE_URL="postgresql://songcraft:songcraft_dev_password@localhost:5432/songcraft" npm run dev --workspace=songcraft-api

### Start the front-end locally (Vite on 3000)

cd /Users/scott/Sites/songcraft-mono
VITE_API_URL="http://localhost:4500" npm run dev --workspace=songcraft

## URLS

API URL: http://localhost:4500 (docs at /documentation; health at /health)
App URL: http://localhost:3000

## If you see module errors from @songcraft/shared, run once

cd /Users/scott/Sites/songcraft-mono/shared
npm i && npm run build

## Docker

docker compose -f docker-compose.prod.yml up -d

Dev (local containers): docker compose up -d
Dev (Linode): docker compose -f docker-compose.dev-linode.yml --env-file .env.dev-linode up -d --build
Prod: docker compose -f docker-compose.prod.yml up -d
