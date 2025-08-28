# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a **Songcraft API** - a TypeScript-based REST API built with Fastify. The project is in early development stage with a minimal setup that includes:

- **Backend Framework**: Fastify v5.5.0 with TypeScript support
- **Schema Validation**: Zod v4.1.3 with `fastify-type-provider-zod` for type-safe API endpoints
- **Database ORM**: Drizzle ORM v0.44.5 configured for PostgreSQL
- **API Documentation**: OpenAPI/Swagger integration via `@fastify/swagger` and `@fastify/swagger-ui`
- **Environment**: Configured for development with PostgreSQL database

## Architecture

The project follows a simple, single-file architecture currently:

- **Entry Point**: `src/index.ts` - Contains the entire Fastify server setup, including:
  - Server initialization with TypeProvider for Zod
  - Swagger/OpenAPI documentation setup
  - Basic health check endpoint (`/health`)
  - Server startup logic with configurable port (default: 3000, env: 4500)

The architecture is set up to be expanded with:
- Route modules (currently consolidated in main file)
- Database schemas and migrations (Drizzle ORM ready)
- Additional middleware and plugins

## Development Commands

### Core Development
```bash
# Start development server with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production server (requires build first)
npm run start
```

### Database Setup
The project is configured to use PostgreSQL:
- **Database**: `songcraft` 
- **Connection**: `postgres://scott@localhost:5432/songcraft`
- **ORM**: Drizzle ORM (no migrations/schema files exist yet)

### API Documentation
- **Swagger UI**: Available at `http://localhost:4500/documentation` (or port 3000 in production)
- **Health Check**: `http://localhost:4500/health`

## Project Structure

```
src/
├── index.ts          # Main application entry point
├── (future)          # Routes, models, services will be added here

package.json          # Dependencies and scripts
tsconfig.json         # TypeScript configuration
.env                  # Environment variables (PORT, DATABASE_URL)
```

## Key Dependencies

- **fastify**: Web framework optimized for speed
- **fastify-type-provider-zod**: Type-safe request/response validation
- **zod**: Schema validation library
- **drizzle-orm**: Type-safe ORM for PostgreSQL
- **@fastify/swagger**: OpenAPI documentation
- **ts-node**: Direct TypeScript execution for development

## Environment Configuration

Required environment variables:
- `PORT`: Server port (default: 3000, currently set to 4500)
- `NODE_ENV`: Environment mode (currently: development)
- `DATABASE_URL`: PostgreSQL connection string

## Development Notes

- The project uses TypeScript with strict mode enabled
- Output directory: `dist/` (for compiled JavaScript)
- Source maps and declarations are generated during build
- The server is configured to listen on all interfaces (`0.0.0.0`) for containerization readiness
- Fastify logger is enabled for request/response logging

## Next Development Steps

Based on the current setup, typical next steps would involve:
1. Adding database schema definitions with Drizzle
2. Creating route modules for API endpoints  
3. Implementing authentication/authorization
4. Adding comprehensive error handling
5. Setting up testing framework
6. Adding linting and formatting tools
