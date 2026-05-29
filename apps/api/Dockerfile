FROM node:20-alpine
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile && pnpm --filter @hub/api prisma generate && pnpm --filter @hub/api build
EXPOSE 4020
CMD ["node","apps/api/dist/main"]
