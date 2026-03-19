FROM node:24-slim AS base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app
RUN corepack enable pnpm
COPY pnpm-lock.yaml ./
RUN pnpm fetch
COPY package.json ./
RUN pnpm install --frozen-lockfile --offline

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm run build

# Stage 3: Production server
FROM gcr.io/distroless/nodejs24-debian13:nonroot AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
USER nonroot
EXPOSE 3000
CMD ["node", "server.js"]