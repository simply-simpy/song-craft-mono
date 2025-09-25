# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a **Songcraft API** - a mature TypeScript-based REST API built with Fastify using clean architecture principles:

- **Backend Framework**: Fastify v5.5.0 with TypeScript support
- **Schema Validation**: Zod v4.1.3 with `fastify-type-provider-zod` for type-safe API endpoints
- **Database ORM**: Drizzle ORM v0.44.5 configured for PostgreSQL
- **API Documentation**: OpenAPI/Swagger integration via `@fastify/swagger` and `@fastify/swagger-ui`
- **Architecture**: Repository pattern with service layers for clean separation of concerns
- **Environment**: Configured for both development and production deployments

## Architecture

The project follows a **clean architecture** with repository pattern:

- **Entry Point**: `src/index.ts` - Server startup and configuration
- **Server Setup**: `src/server/createServer.ts` - Fastify instance creation with plugins
- **Routes**: `src/routes/` - HTTP route handlers organized by feature
  - `songs.ts` - Song management endpoints
  - `user.ts` - User profile endpoints (`/me`)
  - `admin.ts` - Admin management endpoints (prefixed with `/admin`)
  - `projects.ts` - Project management endpoints
- **Services**: `src/services/` - Business logic layer
  - `songs.service.ts` - Song business logic
  - `admin.service.ts` - Admin operations
  - `project.service.ts` - Project operations
- **Repositories**: `src/repositories/` - Data access layer
  - Repository pattern for all database operations
  - Type-safe interfaces for all data operations
- **Middleware**: `src/middleware/` - Authentication and authorization
- **Configuration**: `src/config/` - Environment and app configuration

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
├── index.ts                    # Application entry point
├── server/
│   └── createServer.ts         # Fastify server setup
├── config/
│   └── env.ts                  # Environment configuration
├── routes/                     # HTTP route handlers
│   ├── _utils/                 # Route utilities
│   ├── admin.ts               # Admin endpoints (/admin/*)
│   ├── user.ts                # User profile (/me)
│   ├── songs.ts               # Song management
│   └── projects.ts            # Project management
├── services/                   # Business logic layer
│   ├── admin.service.ts
│   ├── project.service.ts
│   └── songs.service.ts
├── repositories/               # Data access layer
│   ├── user.repository.ts
│   ├── account.repository.ts
│   ├── project.repository.ts
│   └── song.repository.ts
├── middleware/                 # Authentication & middleware
├── lib/                       # Shared utilities
├── plugins/                   # Fastify plugins
└── schema.ts                  # Database schema
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

## Architecture Features

**✅ Completed:**
- Database schema definitions with Drizzle ORM
- Route modules organized by feature
- Repository pattern for data access
- Service layer for business logic
- Authentication/authorization middleware
- Comprehensive error handling
- Type-safe API endpoints with Zod validation
- Dependency injection container
- Environment-based configuration

**🚀 Production Ready:**
- Clean architecture with separation of concerns
- No direct database queries in route handlers
- Consistent error handling across all endpoints
- Type-safe request/response validation
- OpenAPI/Swagger documentation
