# AI-TOOLS-HUB
Verified AI-native tools directory. pnpm+Turborepo monorepo.

## Start
1. cp .env.example .env — fill secrets (root+apps/web+apps/ai)
2. pnpm install
3. pnpm up (PG+pgvector/Redis/Meili)
4. pnpm db:push
5. pnpm dev → web:3020 api:4020 ai:8020

## Build
Open Claude Code at repo root. Follow BUILD_PROMPT.md. Conventions in CLAUDE.md.
Apps: web(Next15) api(NestJS+Prisma) ai(FastAPI) workers(verification).
