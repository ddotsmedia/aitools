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
  let s = String(v ?? "").toUpperCase().replace(/[\s-]+/g, "_");
  if (s === "OSS") s = "OPEN_SOURCE";
  return (Object.values(PricingModel) as string[]).includes(s) ? (s as PricingModel) : PricingModel.FREEMIUM;
}

// Accepts both the compact schema (url/free/api/oss/desc) and the verbose one
// (website/has_free_tier/has_api/is_open_source/description/slug).
interface Row {
  name: string;
  slug?: string;
  url?: string;
  website?: string;
  category: string;
  pricing?: string;
  free?: boolean;
  has_free_tier?: boolean;
  api?: boolean;
  has_api?: boolean;
  oss?: boolean;
  is_open_source?: boolean;
  tags?: string[];
  tagline?: string;
  desc?: string;
  description?: string;
  languages?: string[];
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: pnpm --filter @hub/api db:import <file.json>");
    process.exit(1);
  }
  const raw = JSON.parse(readFileSync(file, "utf8")) as Row[] | { tools: Row[] };
  const rows: Row[] = Array.isArray(raw) ? raw : (raw.tools ?? []);
  if (!Array.isArray(rows)) throw new Error("JSON must be an array or { tools: [] }");

  let ok = 0;
  let skipped = 0;
  for (const r of rows) {
    const url = r.url ?? r.website;
    if (!r.name || !url || !r.category) {
      skipped++;
      continue;
    }
    const slug = slugify(r.slug ?? r.name);
    const d = domain(url);
    const api = r.api ?? r.has_api ?? false;
    const oss = r.oss ?? r.is_open_source ?? false;
    const data = {
      name: r.name,
      tagline: r.tagline ?? r.description ?? `${r.name} — ${r.category} tool`,
      description: r.desc ?? r.description ?? `${r.name} is a ${r.category} tool.`,
      websiteUrl: url,
      logoUrl: d ? `https://www.google.com/s2/favicons?domain=${d}&sz=128` : null,
      pricingModel: pricing(r.pricing),
      // freeTierReal is EARNED by the verification engine (machine-detected),
      // never asserted from import data. Imports start unverified.
      hasApi: api,
      isOpenSource: oss,
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
        platforms: ["web", ...(api ? ["api"] : [])],
        languages: r.languages ?? ["en"],
        regions: ["GLOBAL"],
        // Unverified until the verification engine runs a real check.
        freshnessScore: 0,
        popularity: 100,
        lastVerifiedAt: null,
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
