# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app
RUN corepack enable pnpm

# Copy root monorepo files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
# Copy package.json of all packages to allow pnpm to see the structure
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

# Install dependencies (all of them to be safe with workspace linking)
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build Vite app
RUN cd frontend && pnpm build:web

# Production Stage with Nginx
FROM nginx:stable-alpine AS runner

# Copy build output to nginx public folder
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
