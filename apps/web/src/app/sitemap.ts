import type { MetadataRoute } from "next";
// P6: fetch published tool+category+compare slugs→emit URLs
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aitoolshub.example.com";
  return [{ url: SITE, changeFrequency: "daily", priority: 1 }];
}
