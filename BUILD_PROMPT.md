# AI-TOOLS-HUB — Autonomous Build Prompt

Paste into Claude Code at repo root (C:\websites\AI-TOOLS-HUB).

---

Read CLAUDE.md first. Obey stack/conventions/routing/token rules. Work WITHOUT stopping unless
destructive or needs secret not provided. After each phase: typecheck→lint→build→commit
`feat(phaseN): <summary>`→continue next phase. Apply model-routing %. Read only what you edit.

## P1 — Foundation [Sonnet]
Install deps, wire Turbo, ESLint/Prettier, env loading. Build @hub/ui design system from brand
tokens: Button Card Badge VerifiedFreeBadge FreshnessMeter header/footer shell.
✅ pnpm dev runs web+api. pnpm build green. Design system renders on /.

## P2 — Catalog+Admin [Sonnet schema, Haiku enrich]
Prisma migrate. tools module CRUD+moderation (DRAFT→PENDING→PUBLISHED). Submit-tool endpoint+minimal
admin UI. AI-enrich pipeline in apps/ai /enrich: URL→draft tagline/desc/category/tags/pricing for
human approval (Haiku). Seed taxonomy (~20 top cats + cross tags) + ~50 sample tools.
✅ Submit→enrich→approve→publish tool. Appears via API.

## P3 — Discovery [Sonnet]
Meili index+sync on publish. Faceted browse: category/pricing/platform/language/free-tier-real/
has-API/open-source. Tool detail page (GEO-structured, JSON-LD). Compare engine (2-4 tools,
feature/price/rating table). Category+tag pages. Programmatic pages: "best X for Y" / "X vs Y" /
"free alternatives to X".
✅ Search/filter/compare/tool pages render server-side w/ valid structured data.

## P4 — AI Layer [Sonnet reason, Haiku embed]
apps/ai: embeddings→pgvector on publish. /search (NL query→ranked tools). /recommend Stack Builder
(goal→multi-tool stack+integration notes). Alternatives engine. Wire web hero to NL search.
✅ "transcribe Arabic meetings then summarize to report" returns sensible ranked stack.

## P5 — Trust/Verification [Haiku checks, Sonnet diffs]
apps/workers: BullMQ schedule→Playwright per tool (reachable/pricing-diff-hash/free-tier-reality/
screenshot). Write VerificationLog, update freshnessScore+lastVerifiedAt, emit ChangeEvent on change.
Surface freshness+verified-free badges in UI. Verified reviews+moderation. NEVER bypass logins/bot
protection or fabricate data.
✅ Stale/dead tools auto-flag. Freshness scores visible+updating.

## P6 — GEO/SEO [Sonnet]
Populate sitemap.ts from published slugs. robots/canonicals/OG/Twitter. Per-page JSON-LD complete.
Visible author+published/updated dates (E-E-A-T). TL;DR+FAQ+data tables on key pages. Generate
Bing+Google submission checklist (Bing first—ChatGPT search uses Bing index).
✅ Lighthouse SEO~100. Rich-results valid. Sitemap lists all published URLs.

## P7 — Accounts+Personalization [Sonnet]
Auth (email+OAuth, passwordless ok—user enters own creds). Saved tools, collections, "for your role"
feed, email/WhatsApp digest hooks.
✅ User saves tools, builds collection, subscribes to digest.

## P8 — Monetization [Sonnet]
Labeled sponsored/featured listings. Paid fast-track submission. Affiliate/deal links w/ verified
codes. Pro tier: advanced filters/usage-traffic intelligence/alerts/dataset API. Stripe/Telr.
✅ Sponsored slot renders (clearly labeled). Pro gate works. Checkout stub wired.

## P9 — Developer Layer [Sonnet]
API+MCP server catalog (filterable). Public read API for dataset (rate-limited, keyed).
✅ MCP/API catalog browsable. Dataset API returns paginated JSON.

## P10 — Launch+Growth [Sonnet/Opus editorial]
Editor's-pick curated collections (Opus). Trending/new/recently-updated feeds. Vendor onboarding.
Analytics events. Deploy via Docker on VPS behind Nginx (infra/nginx). SSL via Certbot.
✅ Prod compose builds. Site live behind HTTPS. Analytics firing.

## Done
All phases green typecheck/lint/build. Verification engine on schedule. Structured data valid.
NL stack builder returns useful results. Ports collision-free w/ existing VPS.
