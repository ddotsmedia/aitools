FROM node:20-alpine
# Prisma engines on Alpine need openssl + libc compat.
RUN apk add --no-cache openssl libc6-compat
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile \
 && pnpm --filter @hub/api exec prisma generate \
 && pnpm --filter @hub/api build
EXPOSE 4020
CMD ["node","apps/api/dist/main"]
