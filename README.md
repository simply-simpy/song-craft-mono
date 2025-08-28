# Songcraft Monorepo

A full-stack music collaboration platform built with modern web technologies.

## 🏗️ Project Structure

```
songcraft-mono/
├── songcraft/           # React frontend application
├── songcraft-api/       # Fastify API backend
├── shared/              # Shared utilities, types, and configurations
└── package.json         # Root workspace configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

1. **Install root dependencies:**

   ```bash
   npm install
   ```

2. **Install workspace dependencies:**
   ```bash
   npm run install:workspaces
   ```

### Development

**Start both frontend and backend in development mode:**

```bash
npm run dev
```

**Start individual services:**

```bash
# Frontend only
npm run dev:songcraft

# API only
npm run dev:api
```

### Building

**Build all packages:**

```bash
npm run build
```

**Build individual packages:**

```bash
npm run build:songcraft
npm run build:api
```

### Production

**Start all services:**

```bash
npm run start
```

## 📦 Workspace Packages

### `songcraft` - Frontend Application

- **Tech Stack:** React 19, TanStack Router, Tailwind CSS, Vite
- **Port:** 3000
- **Features:** Music collaboration interface, real-time editing, MIDI support

### `songcraft-api` - Backend API

- **Tech Stack:** Fastify, Drizzle ORM, PostgreSQL, Zod validation
- **Features:** RESTful API, database management, authentication

### `@songcraft/shared` - Shared Utilities

- **Tech Stack:** TypeScript, Zod schemas
- **Features:** Common types, validation schemas, utility functions

## 🛠️ Available Scripts

| Script            | Description                                         |
| ----------------- | --------------------------------------------------- |
| `dev`             | Start both frontend and backend in development mode |
| `dev:songcraft`   | Start only the frontend                             |
| `dev:api`         | Start only the API                                  |
| `build`           | Build all packages                                  |
| `build:songcraft` | Build only the frontend                             |
| `build:api`       | Build only the API                                  |
| `start`           | Start all services in production mode               |
| `test`            | Run tests across all packages                       |
| `lint`            | Run linting across all packages                     |
| `format`          | Format code across all packages                     |
| `clean`           | Clean all build artifacts                           |
| `install:all`     | Install dependencies for all packages               |

## 🔧 Development Workflow

1. **Adding new packages:** Update the `workspaces` array in root `package.json`
2. **Shared code:** Place common utilities in the `shared/` package
3. **Cross-package imports:** Use `@songcraft/shared` for shared code
4. **Dependencies:** Add workspace dependencies with `"workspace:*"`

## 📁 File Organization

- **Root level:** Workspace configuration, shared tooling
- **Package level:** Individual application code and dependencies
- **Shared level:** Common types, utilities, and configurations

## 🚨 Troubleshooting

### Common Issues

1. **Workspace dependencies not found:**

   ```bash
   npm run install:workspaces
   ```

2. **TypeScript path resolution issues:**
   - Ensure `tsconfig.base.json` is properly configured
   - Check that package `tsconfig.json` files extend the base config

3. **Build failures:**
   ```bash
   npm run clean
   npm run install:all
   npm run build
   ```

## 🤝 Contributing

1. Follow the monorepo structure
2. Use shared types and utilities when possible
3. Update this README when adding new packages or scripts
4. Ensure all packages build successfully before committing

## 📄 License

[Add your license information here]
