# Production Stage
FROM node:20-alpine AS base

# 1. Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable pnpm

# Copy root monorepo files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
# Copy all package.jsons
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# 2. Rebuild the source code
FROM base AS builder
WORKDIR /app
RUN corepack enable pnpm

# Copy dependencies and source
COPY --from=deps /app ./
COPY . .

# Build the Backend
RUN cd backend && pnpm build

# 3. Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 4000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodeuser

# Copy build output and necessary files
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/package.json ./backend/package.json
COPY --from=builder /app/node_modules ./node_modules
# We might need backend's node_modules if not hoisted
COPY --from=builder /app/backend/node_modules ./backend/node_modules

USER nodeuser

EXPOSE 4000

# Start command
CMD ["node", "backend/dist/src/index.js"]
