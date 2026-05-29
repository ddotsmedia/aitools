# ── Stage 1: deps ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json          ./apps/web/
COPY apps/api/package.json          ./apps/api/
COPY packages/ui/package.json       ./packages/ui/
COPY packages/types/package.json    ./packages/types/
RUN pnpm install --frozen-lockfile

# ── Stage 2: builder ──────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app
COPY . .
# Build shared packages first so @hub/ui and @hub/types resolve
RUN pnpm --filter @hub/types build 2>/dev/null || true
RUN pnpm --filter @hub/ui    build 2>/dev/null || true
RUN NEXT_OUTPUT=standalone pnpm --filter @hub/web   build

# ── Stage 3: runner (slim) ────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3020 HOSTNAME=0.0.0.0

# Next.js standalone output — minimal runtime bundle
COPY --from=builder /app/apps/web/.next/standalone   ./
COPY --from=builder /app/apps/web/.next/static        ./apps/web/.next/static
COPY --from=builder /app/apps/web/public              ./apps/web/public

EXPOSE 3020
CMD ["node", "apps/web/server.js"]
