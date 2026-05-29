FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile && pnpm --filter @hub/web build
EXPOSE 3020
CMD ["pnpm","--filter","@hub/web","start"]
