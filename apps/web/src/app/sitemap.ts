import type { MetadataRoute } from "next";
import { api } from "@/lib/api";
import { COLLECTIONS } from "@/lib/collections";

export const revalidate = 3600;

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://milestonm.ae";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, cats] = await Promise.all([
    api.slugs().catch(() => [] as { slug: string }[]),
    api.categories().catch(() => [] as { slug: string }[]),
  ]);

  const staticPages = [
    "", "/tools", "/collections", "/compare", "/categories", "/stack",
    "/developers", "/methodology", "/about", "/submit",
  ];

  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const p of staticPages) {
    entries.push({ url: `${SITE}${p}`, lastModified: now, changeFrequency: "daily", priority: p === "" ? 1 : 0.7 });
  }
  for (const c of cats) {
    entries.push({ url: `${SITE}/category/${c.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.6 });
  }
  for (const c of COLLECTIONS) {
    entries.push({ url: `${SITE}/collections/${c.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.6 });
  }
  for (const t of slugs) {
    entries.push({ url: `${SITE}/tools/${t.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.8 });
    entries.push({ url: `${SITE}/alternatives/${t.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.5 });
  }
  return entries;
}
