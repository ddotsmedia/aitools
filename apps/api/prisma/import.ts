/**
 * Bulk-import tools from a JSON file into the catalog.
 *
 *   pnpm --filter @hub/api db:import path/to/tools.json
 *
 * JSON shape: an array of objects:
 *   {
 *     "name": "Tool Name",            // required
 *     "url": "https://tool.com",      // required
 *     "category": "Writing",          // required (created if new)
 *     "pricing": "FREEMIUM",          // optional enum, default FREEMIUM
 *     "free": false,                  // optional verified free tier
 *     "api": false, "oss": false,     // optional
 *     "tags": ["seo","marketing"],    // optional
 *     "tagline": "...", "desc": "...",// optional
 *     "languages": ["en","ar"]        // optional
 *   }
 *
 * Idempotent: upserts by slug. Logos default to the Google favicon service.
 * Tools land PUBLISHED; the verification engine re-checks them on its schedule.
 */
import { readFileSync } from "node:fs";
import { PrismaClient, PricingModel, ToolStatus } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function domain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
function pricing(v: unknown): PricingModel {
  const s = String(v ?? "").toUpperCase();
  return (Object.values(PricingModel) as string[]).includes(s) ? (s as PricingModel) : PricingModel.FREEMIUM;
}

interface Row {
  name: string;
  url: string;
  category: string;
  pricing?: string;
  free?: boolean;
  api?: boolean;
  oss?: boolean;
  tags?: string[];
  tagline?: string;
  desc?: string;
  languages?: string[];
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: pnpm --filter @hub/api db:import <file.json>");
    process.exit(1);
  }
  const rows = JSON.parse(readFileSync(file, "utf8")) as Row[];
  if (!Array.isArray(rows)) throw new Error("JSON root must be an array");

  let ok = 0;
  let skipped = 0;
  for (const r of rows) {
    if (!r.name || !r.url || !r.category) {
      skipped++;
      continue;
    }
    const slug = slugify(r.name);
    const d = domain(r.url);
    const data = {
      name: r.name,
      tagline: r.tagline ?? `${r.name} — ${r.category.toLowerCase()} AI tool`,
      description: r.desc ?? `${r.name} is a ${r.category.toLowerCase()} AI tool.`,
      websiteUrl: r.url,
      logoUrl: d ? `https://www.google.com/s2/favicons?domain=${d}&sz=128` : null,
      pricingModel: pricing(r.pricing),
      freeTierReal: r.free ?? false,
      hasApi: r.api ?? false,
      isOpenSource: r.oss ?? false,
      status: ToolStatus.PUBLISHED,
      categories: {
        set: [],
        connectOrCreate: [{ where: { slug: slugify(r.category) }, create: { slug: slugify(r.category), name: r.category } }],
      },
      tags: {
        set: [],
        connectOrCreate: (r.tags ?? []).map((t) => ({ where: { slug: slugify(t) }, create: { slug: slugify(t), name: t } })),
      },
    };
    await prisma.tool.upsert({
      where: { slug },
      update: data,
      create: {
        ...data,
        slug,
        platforms: ["web", ...(r.api ? ["api"] : [])],
        languages: r.languages ?? ["en"],
        regions: ["GLOBAL"],
        freshnessScore: 60,
        popularity: 100,
        lastVerifiedAt: new Date(),
        categories: { connectOrCreate: data.categories.connectOrCreate },
        tags: { connectOrCreate: data.tags.connectOrCreate },
      },
    });
    ok++;
  }
  const total = await prisma.tool.count();
  console.log(`Imported/updated ${ok}, skipped ${skipped}. Catalog now ${total} tools.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
