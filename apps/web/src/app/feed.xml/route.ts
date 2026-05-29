import { api } from "@/lib/api";

export const revalidate = 600;

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://milestonm.ae";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET() {
  const res = await api.search("?sort=new&take=50").catch(() => ({ items: [] as { slug: string; name: string; tagline: string }[] }));
  const items = res.items
    .map(
      (t) => `    <item>
      <title>${esc(t.name)}</title>
      <link>${SITE}/tools/${t.slug}</link>
      <guid>${SITE}/tools/${t.slug}</guid>
      <description>${esc(t.tagline ?? "")}</description>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>AI Tools Hub — Newest verified tools</title>
    <link>${SITE}</link>
    <description>Latest verified AI tools added to the directory.</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
}
