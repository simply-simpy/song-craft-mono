# Backend API Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy root package files first
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY songcraft/package*.json ./songcraft/
COPY songcraft-api/package*.json ./songcraft-api/

# Install all dependencies using workspace
RUN npm ci

# Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build shared package first
WORKDIR /app/shared
RUN npm run build

# Build backend
WORKDIR /app/songcraft-api
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/songcraft-api/dist ./dist
COPY --from=builder /app/songcraft-api/node_modules ./node_modules
COPY songcraft-api/package*.json ./

EXPOSE 4500

CMD ["npm", "start"]
