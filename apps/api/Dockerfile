# ThinkTank API - Production Dockerfile
# Multi-stage build for optimized image size

# Base image with Node.js
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/
RUN npm ci --only=production

# Build the application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build --workspace=@thinktank/api

# Production image
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

# Copy built assets
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=deps /app/node_modules ./node_modules

USER hono

EXPOSE 3001

ENV PORT=3001

CMD ["node", "dist/index.js"]
