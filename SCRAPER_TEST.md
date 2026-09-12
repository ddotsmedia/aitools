# Daily AI Tools Scraper — Test Instructions

## Setup
1. Start infrastructure: `pnpm up`
2. Apply schema: `cd apps/api && npx prisma db push`
3. Start API: `pnpm --filter @hub/api dev`
4. In another terminal, start web: `pnpm --filter @hub/web dev`

## Manual Test
### Trigger scraper manually:
```bash
curl -X POST http://localhost:4020/scraper/run
```

Expected response:
```json
{
  "inserted": 15,
  "skipped": 8,
  "errors": []
}
```

### View pending tools (all sources):
```bash
curl "http://localhost:4020/tools?status=PENDING&take=50"
```

### View scraped tools only (filter by source):
```bash
curl "http://localhost:4020/tools?status=PENDING&source=PRODUCT_HUNT&take=20"
curl "http://localhost:4020/tools?status=PENDING&source=GITHUB_TRENDING&take=20"
curl "http://localhost:4020/tools?status=PENDING&source=HACKERNEWS&take=20"
```

## Admin UI Test
1. Open http://localhost:3020/admin
2. Observe tools from various sources with badges (PH, GitHub, HN, User)
3. Click "AI enrich" → "Approve" to test enrichment + categorization workflow

## Cron Job Test
- Runs daily at **08:00 UTC**
- To verify: Check API logs at scheduled time
- Alternative: Set `CRON_TZ=UTC` and manually trigger via POST /scraper/run

## Database Schema
- New fields on Tool model:
  - `source: ToolSource` (enum: USER_SUBMITTED, PRODUCT_HUNT, GITHUB_TRENDING, HACKERNEWS)
  - `scrapedMetadata: Json?` (stores API IDs, stars, etc.)

## Environment Variables
```bash
# Optional: API keys for higher rate limits
PRODUCT_HUNT_API_TOKEN=xxx
GITHUB_TOKEN=xxx
```

## Notes
- Dedup: URL exact match + name similarity (80% threshold)
- All scraped tools land in PENDING status for admin review
- Stack Builder auto-categorizes on approval
- Verification worker can enhance fields further (pricing, features)
