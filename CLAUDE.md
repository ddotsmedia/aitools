# AI-TOOLS-HUB

Verified AI-tools directory. Beat Toolify/Futurepedia on freshness+trust, AI-native discovery (task→stack), GEO (be source AI engines cite).

## Stack
pnpm+Turborepo monorepo.
- web: Next15 RSC TS Tailwind Framer — :3020
- api: NestJS Prisma — :4020
- ai: Python FastAPI (embed/search/stack/enrich) — :8020
- workers: BullMQ+Playwright verification
- packages: ui, types, config
- data: PG16+pgvector(:5442) Redis(:6382) Meili(:7720)

## Cmds
dev/build/typecheck/lint via `pnpm <cmd>`
db:push/db:migrate/db:studio for schema
up/down for docker infra

## Rules
- TS strict. Web=server components default. Client only when needed.
- Indexable pages MUST SSR/SSG. No client-only content on crawlable routes.
- Tool/compare/category pages: TL;DR first→claims→FAQ→data table→JSON-LD (SoftwareApplication, AggregateRating, FAQPage, BreadcrumbList, ItemList).
- Brand: navy=#0b1733 teal=#2a9aa4 sun=#f5b21a amber=#ef7e1a leaf=#3fae57
- Slugs: stable lowercase-kebab. Prices: USD. Arabic(ar)=first-class.
- freeTierReal+pricing=machine-verified, never assumed.

## Model routing (hard rule)
See apps/ai/app/services/router.py
- Haiku~70%: classify/tag/summarize/extract/enrich_field/dedupe
- Sonnet~25%: task→stack/compare/rerank/merge
- Opus~5%: editorial/hard-judgement ONLY
Default=Haiku. Escalate only when demonstrably needed.

## Token discipline
- Read only files changing. No full-repo dumps.
- Reuse @hub/types. No shape redefs.
- Batch edits. 1 commit/phase: feat(phaseN): ...
- No reformat untouched files. No unnecessary deps.

## Constraints
- Ports collision-free w/ existing VPS(3010 etc). Verify before deploy.
- Verification+freshness=THE product.
- No scrape behind logins/bypass bot protection/fabricate ratings.
- No credentials/payment entry anywhere.

Build order→BUILD_PROMPT.md
