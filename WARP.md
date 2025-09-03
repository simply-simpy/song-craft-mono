# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Overview

Songcraft is a JavaScript/TypeScript monorepo using npm workspaces:
- songcraft: React 19 app using TanStack Start (SSR), Vite, TanStack Router/Query, tRPC, ORPC, Tailwind v4 + daisyUI 5
- songcraft-api: Fastify REST API with Zod, Drizzle ORM, PostgreSQL, Swagger
- shared: Shared TypeScript types and utilities (e.g., short ID generation)

Key ports and URLs:
- Frontend: http://localhost:3000
- API: http://localhost:4500 (Swagger UI at /documentation; health at /health)
- In SSR, Songcraft exposes internal /api endpoints for ORPC (/api, /api/rpc) and tRPC (/api/trpc). RESTful endpoints like /songs are served by songcraft-api, so set VITE_API_URL to the API base URL during development/deployments.

## Commands

All commands are issued from the repo root unless noted. This repo uses npm workspaces; pass --workspace=<pkg> to scope to a package.

Setup
- Install root + workspaces: npm run install:all
- One-time setup helper: node scripts/setup.js

Development
- Start both frontend and API: npm run dev
- Start only frontend: npm run dev:songcraft
- Start only API: npm run dev:api

Build
- Build all packages: npm run build
- Build frontend only: npm run build:songcraft
- Build API only: npm run build:api

Run (local production)
- Start both services: npm run start
- Start frontend only: npm run start:songcraft
- Start API only: npm run start:api

Lint/Format
- Lint across workspaces: npm run lint
- Format across workspaces: npm run format
  - songcraft uses Biome (biome lint, biome format, biome check)

Tests
- Run tests across workspaces: npm run test
- Run tests in frontend only (Vitest): npm run test --workspace=songcraft
- Run a single test file (frontend): npm run test --workspace=songcraft -- src/path/to/file.test.ts
- Filter by test name (frontend): npm run test --workspace=songcraft -- -t "name pattern"

Database (songcraft-api)
- Ensure DATABASE_URL is set (e.g., export DATABASE_URL=postgres://USER:PASS@HOST:5432/DB)
- Generate Drizzle artifacts: npm run db:generate --workspace=songcraft-api
- Apply migrations: npm run db:migrate --workspace=songcraft-api
- Push schema: npm run db:push --workspace=songcraft-api
- Open Drizzle Studio: npm run db:studio --workspace=songcraft-api

Docker/Compose
- Local dev stack (frontend + backend + db): docker compose up -d
- Dev (Linode) stack: docker compose -f docker-compose.dev-linode.yml --env-file .env.dev-linode up -d --build
- Prod stack: docker compose -f docker-compose.prod.yml up -d
- Remote helpers:
  - Dev deployment helper: LINODE_HOST=<ip> ./scripts/deploy-linode-dev.sh
  - Server bootstrap (root on Linode): sudo ./scripts/setup-linode-server.sh
  - Prod packaging/deploy helper: LINODE_HOST=<ip> ./scripts/deploy-linode.sh

## Architecture Notes

Monorepo & TypeScript config
- Workspaces: songcraft, songcraft-api, shared/*
- tsconfig.base.json sets shared path aliases. Frontend consumes @songcraft/shared via ../shared/src; API consumes compiled ../shared/dist.

Shared package (@songcraft/shared)
- Provides common types (Song, User, Collaboration), Zod schemas, date utils, and short ID generation helpers:
  - generateShortId() -> 6-char alphanumeric
  - generateHumanReadableId(prefix)
  - generateSongId(), generateUserId(), generateCollaborationId()
  - Validation/parsing helpers for IDs
- Song IDs use a human-readable short id with a prefix (e.g., song-aB3x9K). Backend persists both UUID primary keys and shortId for friendly routing.

Backend (songcraft-api)
- Fastify + fastify-type-provider-zod for type-safe validation/serialization
- Drizzle ORM on PostgreSQL via node-postgres Pool (src/db.ts); DATABASE_URL required
- Routes (src/routes/songs.ts):
  - GET /songs — list songs
  - GET /songs/:shortId — fetch by shortId
  - GET /songs/:shortId/versions — lyric versions by song UUID
  - POST /songs — create song; generates unique shortId using @songcraft/shared
  - DELETE /songs/:shortId — delete song and associated lyric versions
- Schema (src/schema.ts): users, songs, lyric_versions tables; songs and lyric_versions include shortId columns; songs keep UUID primary key
- CORS is configurable via env:
  - CORS_ORIGIN: "*" or comma-separated origins (default http://localhost:3000)
  - CORS_METHODS: comma-separated methods (default GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS)
- Swagger UI at /documentation; server defaults to port 4500

Frontend (songcraft)
- TanStack Start SSR with TanStack Router and TanStack Query integration (src/router.tsx, src/integrations)
- Internal API routes handled by SSR:
  - ORPC OpenAPI/docs: /api (api.$.ts)
  - ORPC RPC: /api/rpc (api.rpc.$.ts)
  - tRPC: /api/trpc (api.trpc.$.tsx)
- External REST API calls to songcraft-api are centralized in src/lib/api.ts:
  - API base comes from env VITE_API_URL; if not set, falls back to /api (SSR). Because REST endpoints like /songs are served by the backend, set VITE_API_URL to the backend URL in dev/prod (e.g., http://localhost:4500).
- SSR uses .output for server bundle; songcraft start script runs node .output/server/index.mjs
- Styling uses Tailwind v4 and daisyUI 5

Environments
- Frontend env (src/env.ts via @t3-oss/env-core):
  - Client: VITE_API_URL (URL for songcraft-api), VITE_APP_TITLE
  - Server: SERVER_URL (optional)
- Backend env (songcraft-api/src/index.ts):
  - PORT (default 4500), DATABASE_URL (required), CORS_ORIGIN, CORS_METHODS, CLERK_SECRET_KEY (if applicable)
- Database (compose): Postgres 15, port 5432; dev/prod compose mount drizzle SQL init

## Useful URLs
- Frontend (dev): http://localhost:3000
- Backend API (dev): http://localhost:4500
  - Swagger: http://localhost:4500/documentation
  - Health: http://localhost:4500/health
- Dev Linode (example from shared/README):
  - Frontend direct: http://<host>:3000
  - Nginx proxy: http://<host>:8080
  - Backend API: http://<host>:4500

## Editor/Agent Rules (from Cursor rules)
- Sentry instrumentation (songcraft/.cursorrules): instrument server functions (e.g., createServerFn) with Sentry.startSpan from @sentry/tanstackstart-react when adding/adjusting server code.
- UI (songcraft/.cursor/rules/daisyui.mdc): Tailwind v4 + daisyUI 5. Prefer daisyUI component classes and Tailwind utilities over custom CSS. Install daisyUI as a plugin and manage themes via the provided plugin config patterns.

## Notes on songcraft-api/WARP.md
An existing WARP.md lives in songcraft-api/. Suggested improvements to keep it aligned with the codebase:
1) Default port is 4500 (not 3000). The server listens on host 0.0.0.0 and PORT defaults to 4500.
2) Document env-driven CORS (CORS_ORIGIN supports "*" or comma-separated origins; CORS_METHODS supported and defaulted).
3) Add database CLI usage based on package.json (db:generate, db:migrate, db:push, db:studio) and clarify DATABASE_URL is required.
4) Expand structure to mention src/db.ts, src/schema.ts, and src/routes/songs.ts, and that shortId is used for external IDs while UUID remains the primary key.
5) Cross-package dependency: clarify that @songcraft/shared is consumed via compiled dist in the API (tsconfig paths map to ../shared/dist).

