import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, ToolCard, Button } from "@hub/ui";
import { api, docToSummary } from "@/lib/api";
import { getCollection } from "@/lib/collections";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3020";
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getCollection(slug);
  if (!c) return { title: "Collection" };
  return { title: c.title, description: c.intro, alternates: { canonical: `/collections/${slug}` } };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCollection(slug);
  if (!c) notFound();

  const res = await api.searchSafe(`${c.query}&take=48`);

  const ld = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: c.title,
    description: c.intro,
    itemListElement: res.items.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE}/tools/${t.slug}`,
      name: t.name,
    })),
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <nav className="mb-3 text-sm text-slate-500">
        <Link href="/collections" className="hover:text-teal">Collections</Link> /{" "}
        <span className="text-slate-300">{c.title}</span>
      </nav>
      <div className="flex items-center gap-3">
        <span className="text-4xl" aria-hidden="true">{c.emoji}</span>
        <div>
          <h1 className="text-3xl font-bold">{c.title}</h1>
          <p className="mt-1 text-slate-400">{c.intro}</p>
        </div>
      </div>
      <Badge tone="neutral" className="mt-4">{res.total} tools</Badge>

      {res.items.length === 0 ? (
        <p className="mt-8 text-slate-400">Nothing here yet. <Link href="/tools" className="text-teal hover:underline">Browse all tools</Link>.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {res.items.map((d) => (
            <ToolCard key={d.id} tool={docToSummary(d)} />
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link href="/collections"><Button variant="outline">All collections</Button></Link>
      </div>
    </main>
  );
}
