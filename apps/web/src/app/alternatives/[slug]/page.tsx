import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Button } from "@hub/ui";
import { api, type ApiTool, type ToolDoc } from "@/lib/api";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3020";
export const dynamic = "force-dynamic";

const PRICING_LABEL: Record<string, string> = {
  FREE: "Free", FREEMIUM: "Freemium", PAID: "Paid", SUBSCRIPTION: "Subscription",
  USAGE_BASED: "Usage-based", OPEN_SOURCE: "Open source", CONTACT: "Contact",
};

async function load(slug: string): Promise<ApiTool | null> {
  try {
    return await api.getTool(slug);
  } catch {
    return null;
  }
}

function keyDifference(alt: ToolDoc, tool: ApiTool): string {
  if (alt.isOpenSource && !tool.isOpenSource) return "Open source";
  if (alt.freeTierReal && !tool.freeTierReal) return "Verified free tier";
  if (alt.hasApi && !tool.hasApi) return "Offers an API";
  if (!alt.hasApi && tool.hasApi) return "No public API";
  if (alt.pricingModel !== tool.pricingModel) return `${PRICING_LABEL[alt.pricingModel] ?? alt.pricingModel} pricing`;
  return alt.tagline?.slice(0, 60) || "Similar capabilities";
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = await load(slug);
  if (!tool) return { title: "Alternatives" };
  const cat = tool.categories[0]?.slug;
  const alts = cat ? await api.searchSafe(`?category=${cat}&take=24`) : { items: [] };
  const count = alts.items.filter((d) => d.slug !== tool.slug).length;
  const catName = tool.categories[0]?.name ?? "AI";
  return {
    title: `Best alternatives to ${tool.name} (2026)`,
    description: `${count} verified ${catName} alternatives to ${tool.name}, compared on free tier, API, pricing, and freshness. Updated for 2026.`,
    alternates: { canonical: `/alternatives/${tool.slug}` },
  };
}

export default async function AlternativesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = await load(slug);
  if (!tool) notFound();

  const cat = tool.categories[0]?.slug;
  const res = cat ? await api.searchSafe(`?category=${cat}&take=24`) : { items: [] };
  const alts = res.items.filter((d) => d.slug !== tool.slug).slice(0, 15);
  const compareHref = `/compare?tools=${[tool.slug, ...alts.slice(0, 3).map((a) => a.slug)].join(",")}`;

  const ld = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best alternatives to ${tool.name} (2026)`,
    numberOfItems: alts.length,
    itemListElement: alts.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE}/tools/${a.slug}`,
      name: a.name,
    })),
  };

  const cell = (b: boolean) => (b ? <span className="text-leaf">✓</span> : <span className="text-slate-600">—</span>);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <nav className="mb-3 text-sm text-slate-500">
        <Link href={`/tools/${tool.slug}`} className="hover:text-teal">{tool.name}</Link> /{" "}
        <span className="text-slate-300">Alternatives</span>
      </nav>
      <Badge tone="teal" className="mb-3">{tool.categories[0]?.name ?? "AI tools"}</Badge>
      <h1 className="text-3xl font-bold sm:text-4xl">Best alternatives to {tool.name} (2026)</h1>
      <p className="mt-2 max-w-2xl text-slate-400">
        {alts.length} verified {(tool.categories[0]?.name ?? "AI").toLowerCase()} alternatives to {tool.name},
        machine-checked for live status, real pricing, and genuine free tiers.
      </p>
      {alts.length > 0 && (
        <div className="mt-4">
          <Link href={compareHref}><Button>Compare side by side →</Button></Link>
        </div>
      )}

      {alts.length === 0 ? (
        <p className="mt-10 text-slate-400">No alternatives indexed yet. <Link href="/tools" className="text-teal hover:underline">Browse all tools</Link>.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-white/5 text-left text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Tool</th>
                <th className="px-4 py-3 font-medium">Free tier</th>
                <th className="px-4 py-3 font-medium">API</th>
                <th className="px-4 py-3 font-medium">Freshness</th>
                <th className="px-4 py-3 font-medium">Key difference</th>
              </tr>
            </thead>
            <tbody>
              {alts.map((a) => (
                <tr key={a.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <Link href={`/tools/${a.slug}`} className="font-medium text-slate-100 hover:text-teal">{a.name}</Link>
                    <span className="ml-2 text-xs text-slate-500">{PRICING_LABEL[a.pricingModel] ?? a.pricingModel}</span>
                  </td>
                  <td className="px-4 py-3">{cell(a.freeTierReal)}</td>
                  <td className="px-4 py-3">{cell(a.hasApi)}</td>
                  <td className="px-4 py-3 font-mono tabular-nums text-slate-300">{a.freshnessScore}</td>
                  <td className="px-4 py-3 text-slate-400">{keyDifference(a, tool)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <Link href={`/tools/${tool.slug}`}><Button variant="outline" size="sm">← {tool.name}</Button></Link>
        {alts.length > 0 && <Link href={compareHref}><Button size="sm">Compare side by side →</Button></Link>}
      </div>
    </main>
  );
}
