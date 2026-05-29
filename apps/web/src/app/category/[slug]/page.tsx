import type { Metadata } from "next";
import Link from "next/link";
import { ToolCard, Button } from "@hub/ui";
import { api, docToSummary } from "@/lib/api";

export const dynamic = "force-dynamic";

async function categoryName(slug: string): Promise<string | null> {
  try {
    const cats = await api.categories();
    return cats.find((c) => c.slug === slug)?.name ?? null;
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
  const name = (await categoryName(slug)) ?? slug;
  return {
    title: `Best ${name} AI tools`,
    description: `Verified ${name} AI tools — compared for real pricing, free tiers, and freshness.`,
    alternates: { canonical: `/category/${slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = (await categoryName(slug)) ?? slug;
  const res = await api.search(`?category=${slug}&take=48`);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="mb-3 text-sm text-slate-500">
        <Link href="/tools" className="hover:text-teal">Tools</Link> / <span className="text-slate-300">{name}</span>
      </nav>
      <h1 className="text-3xl font-bold">Best {name} AI tools</h1>
      <p className="mt-1 text-slate-400">{res.total} verified {name.toLowerCase()} tool{res.total === 1 ? "" : "s"}.</p>

      {res.items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-slate-400">
          Nothing here yet. <Link href="/tools" className="text-teal hover:underline">Browse all tools</Link>.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {res.items.map((d) => (
            <ToolCard key={d.id} tool={docToSummary(d)} />
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link href="/tools"><Button variant="outline">All categories</Button></Link>
      </div>
    </main>
  );
}
