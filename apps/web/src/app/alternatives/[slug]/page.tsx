import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Button, ToolCard } from "@hub/ui";
import { api, docToSummary, type ApiTool } from "@/lib/api";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3020";
export const dynamic = "force-dynamic";

async function load(slug: string): Promise<ApiTool | null> {
  try {
    return await api.getTool(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = await load(slug);
  if (!tool) return { title: "Alternatives" };
  return {
    title: `Best ${tool.name} alternatives`,
    description: `Top verified alternatives to ${tool.name} — compared on pricing, free tier, API, and freshness.`,
    alternates: { canonical: `/alternatives/${tool.slug}` },
  };
}

export default async function AlternativesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = await load(slug);
  if (!tool) notFound();

  const cat = tool.categories[0]?.slug;
  const res = cat ? await api.searchSafe(`?category=${cat}&take=24`) : { items: [] };
  const alts = res.items.filter((d) => d.slug !== tool.slug).slice(0, 12);

  const ld = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Alternatives to ${tool.name}`,
    itemListElement: alts.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE}/tools/${a.slug}`,
      name: a.name,
    })),
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <nav className="mb-3 text-sm text-slate-500">
        <Link href={`/tools/${tool.slug}`} className="hover:text-teal">{tool.name}</Link> /{" "}
        <span className="text-slate-300">Alternatives</span>
      </nav>
      <Badge tone="teal" className="mb-3">{tool.categories[0]?.name ?? "AI tools"}</Badge>
      <h1 className="text-3xl font-bold">Best {tool.name} alternatives</h1>
      <p className="mt-2 max-w-2xl text-slate-400">
        {alts.length} verified alternatives to {tool.name}, machine-checked for live status, real
        pricing, and genuine free tiers.
      </p>
      <div className="mt-4 flex gap-3">
        <Link href={`/tools/${tool.slug}`}><Button variant="outline" size="sm">← {tool.name}</Button></Link>
        {alts[0] && (
          <Link href={`/compare?tools=${tool.slug},${alts[0].slug}`}>
            <Button size="sm">Compare {tool.name} vs {alts[0].name}</Button>
          </Link>
        )}
      </div>

      {alts.length === 0 ? (
        <p className="mt-10 text-slate-400">No alternatives indexed yet. <Link href="/tools" className="text-teal hover:underline">Browse all tools</Link>.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {alts.map((d) => (
            <ToolCard key={d.id} tool={docToSummary(d)} />
          ))}
        </div>
      )}
    </main>
  );
}
