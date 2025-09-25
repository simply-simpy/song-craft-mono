# Repository Guidelines

## Project Structure & Module Organization
The root `package.json` manages three npm workspaces: `songcraft/` (TanStack React Start client), `songcraft-api/` (Fastify + Drizzle API), and `shared/` (cross-project types and utilities). Frontend entry code sits in `songcraft/src/app/`, feature routes in `src/routes/`, and reusable UI in `src/components/`. API handlers live in `songcraft-api/src/routes/` with database logic in `src/schema.ts` and helper utilities under `src/lib/`.

## Build, Test, and Development Commands
Use separate terminals for core services: `npm run dev:db` (Dockerized Postgres on 5433), `npm run dev:api` (API with live reload), and `npm run dev:frontend` (Vite dev server on 3000 with Clerk integration). Build targets through workspaces: `npm run build --workspace=songcraft`, `npm run build --workspace=songcraft-api`, and `npm run build --workspace=@songcraft/shared`. Trigger Mermaid diagram regeneration with `npm run build` at the repo root.

## Coding Style & Naming Conventions
TypeScript is required everywhere. Formatting and linting rely on Biome (`npm run format|lint --workspace=songcraft`), which enforces tab indentation, double quotes, and organized imports. React components and hooks use PascalCase and `use*` prefixes, while route folders stay lowercase with hyphens (`src/routes/sign-in/`). Keep domain logic near its route or API module, and export shared helpers from `shared/src/` as named functions.

## Testing Guidelines
Frontend tests run on Vitest with Testing Library shims: execute `npm run test --workspace=songcraft` or append `-- --watch` for TDD. Co-locate specs next to implementation using `*.test.ts` or `*.test.tsx`. The API currently lacks an automated suite; when adding endpoints, include integration tests under `songcraft-api/src/__tests__/` using Fastify inject + Vitest. Always run `npm run db:migrate --workspace=songcraft-api` against a disposable database before committing migration changes.

## Commit & Pull Request Guidelines
Commit subjects stay short and imperative (recent history shows `fix songs endpoint`, `add icons`). Keep one logical change per commit and explain context in the body when side effects exist. Pull requests should link an issue, summarize behavior changes, list the commands executed (tests, lint, migrations), and mention any environment updates. Add screenshots or API samples when UI or response contracts change, and loop in both frontend and API reviewers when needed.

## Environment & Configuration
Copy `env.txt` to `.env` for local secrets and never commit real credentials; production overrides live in `env.production` and `env.dev-linode`. Docker Compose definitions (`docker-compose.yml`, `.dev-linode`, `.prod`) must stay in sync when services change. Shared Postgres dumps live in `db_dumps/`; refresh them after meaningful migrations. Regenerate diagrams whenever schema or API surfaces shift.
