import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, ToolCard } from "@hub/ui";
import { api, docToSummary, type ToolDoc } from "@/lib/api";
import useCases from "../../../../../../data/use-cases.json";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3020";
export const dynamic = "force-dynamic";

type UseCase = { slug: string; title: string; description: string; categories: string[] };
const get = (slug: string): UseCase | undefined => (useCases as UseCase[]).find((u) => u.slug === slug);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const uc = get(slug);
  if (!uc) return { title: "Use case" };
  return {
    title: `Best AI tools to ${uc.title.toLowerCase()} in 2026`,
    description: `${uc.description} The best verified AI tools to ${uc.title.toLowerCase()}, compared for 2026.`,
    alternates: { canonical: `/use-cases/${uc.slug}` },
  };
}

async function toolsFor(uc: UseCase): Promise<ToolDoc[]> {
  const results = await Promise.all(
    uc.categories.map((c) => api.searchSafe(`?category=${c}&take=24&sort=popularity`).then((r) => r.items)),
  );
  const seen = new Set<string>();
  const merged: ToolDoc[] = [];
  for (const d of results.flat()) {
    if (seen.has(d.slug)) continue;
    seen.add(d.slug);
    merged.push(d);
  }
  return merged.sort((a, b) => b.popularity - a.popularity).slice(0, 36);
}

export default async function UseCasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const uc = get(slug);
  if (!uc) notFound();
  const tools = await toolsFor(uc);

  const ld = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best AI tools to ${uc.title.toLowerCase()} in 2026`,
    numberOfItems: tools.length,
    itemListElement: tools.map((t, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE}/tools/${t.slug}`, name: t.name })),
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <nav className="mb-3 text-sm text-slate-500">
        <Link href="/use-cases" className="hover:text-teal">Use cases</Link> /{" "}
        <span className="text-slate-300">{uc.title}</span>
      </nav>
      <h1 className="text-3xl font-bold sm:text-4xl">Best AI tools to {uc.title.toLowerCase()} in 2026</h1>
      <p className="mt-2 max-w-2xl text-slate-400">{uc.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {uc.categories.map((c) => (
          <Link key={c} href={`/category/${c}`}><Badge tone="neutral">{c.replace(/-/g, " ")}</Badge></Link>
        ))}
      </div>

      {tools.length === 0 ? (
        <p className="mt-10 text-slate-400">No tools yet. <Link href="/tools" className="text-teal hover:underline">Browse all</Link>.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((d) => <ToolCard key={d.id} tool={docToSummary(d)} />)}
        </div>
      )}
    </main>
  );
}
