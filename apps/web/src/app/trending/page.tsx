import type { Metadata } from "next";
import Link from "next/link";
import { Badge, ToolCard } from "@hub/ui";
import { api, docToSummary, type ToolDoc, type ChangeFeedItem } from "@/lib/api";

export const metadata: Metadata = {
  title: "Trending AI Tools this week",
  description: "Trending AI Tools this week — milestonm.ae. Rising fast, most popular, new, and recent price changes.",
  alternates: { canonical: "/trending" },
};
export const revalidate = 120;

function Grid({ items }: { items: ToolDoc[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.slice(0, 9).map((d) => <ToolCard key={d.id} tool={docToSummary(d)} />)}
    </div>
  );
}

export default async function TrendingPage() {
  const [rising, popular, fresh, changes] = await Promise.all([
    api.searchSafe("?sort=freshness&take=9"),
    api.searchSafe("?sort=popularity&take=10"),
    api.searchSafe("?sort=new&take=9"),
    api.changes().catch(() => [] as ChangeFeedItem[]),
  ]);
  const priceChanges = changes.filter((c) => c.kind === "pricing").slice(0, 12);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <Badge tone="leaf" className="mb-3">Updated continuously</Badge>
      <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Trending AI tools this week</h1>
      <p className="mt-2 text-slate-400">What&apos;s moving in the verified catalog right now.</p>

      <section className="mt-10">
        <h2 className="mb-1 text-xl font-semibold text-slate-100">🚀 Rising fast</h2>
        <p className="mb-5 text-sm text-slate-500">Freshest verification scores this week.</p>
        <Grid items={rising.items} />
      </section>

      <section className="mt-12">
        <h2 className="mb-1 text-xl font-semibold text-slate-100">🔖 Most saved this week</h2>
        <p className="mb-5 text-sm text-slate-500">Top tools by popularity.</p>
        <Grid items={popular.items} />
      </section>

      <section className="mt-12">
        <h2 className="mb-1 text-xl font-semibold text-slate-100">🆕 New this week</h2>
        <p className="mb-5 text-sm text-slate-500">Latest verified tools added to the directory.</p>
        <Grid items={fresh.items} />
      </section>

      <section className="mt-12">
        <h2 className="mb-1 text-xl font-semibold text-slate-100">💰 Price changes</h2>
        <p className="mb-5 text-sm text-slate-500">Tools whose pricing page changed recently.</p>
        {priceChanges.length === 0 ? (
          <p className="text-slate-500">No pricing changes detected yet. See the <Link href="/changes" className="text-teal hover:underline">full change feed</Link>.</p>
        ) : (
          <ul className="space-y-2">
            {priceChanges.map((c) => (
              <li key={c.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                {c.tool.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.tool.logoUrl} alt="" className="h-6 w-6 rounded" />
                )}
                <Link href={`/tools/${c.tool.slug}`} className="font-medium text-slate-100 hover:text-teal">{c.tool.name}</Link>
                <span className="text-sm text-slate-400">{c.summary}</span>
                <Badge tone="sun" className="ml-auto">Pricing</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
