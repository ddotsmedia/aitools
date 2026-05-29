import type { Metadata } from "next";
import Link from "next/link";
import { Badge, ToolCard } from "@hub/ui";
import type { ToolSummary } from "@hub/types";
import { api, docToSummary, type ApiTool, type ToolDoc } from "@/lib/api";

export const metadata: Metadata = {
  title: "AI Tools for the MENA Region",
  description: "Best AI Tools for UAE and MENA businesses 2026 — Arabic NLP, Arabic UI, Gulf-founded, and PDPL-compliant.",
  alternates: { canonical: "/mena" },
};
export const revalidate = 120;

const FEATURED = ["jais", "allam", "arabert", "camel-tools", "farasa"];

function mapTool(t: ApiTool): ToolSummary {
  return {
    id: t.id, slug: t.slug, name: t.name, tagline: t.tagline,
    pricingModel: t.pricingModel as ToolSummary["pricingModel"],
    freeTierReal: t.freeTierReal, freshnessScore: t.freshnessScore,
    categories: t.categories.map((c) => c.name), tags: t.tags.map((x) => x.slug),
    logoUrl: t.logoUrl ?? undefined,
  };
}

function Grid({ items }: { items: ToolDoc[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((d) => <ToolCard key={d.id} tool={docToSummary(d)} />)}
    </div>
  );
}

export default async function MenaPage() {
  const [arabic, arabicUi, founded, pdpl, featuredRaw] = await Promise.all([
    api.searchSafe("?category=arabic-nlp&take=24"),
    api.searchSafe("?tag=arabic-ui&take=24"),
    api.searchSafe("?tag=mena-founded&take=24"),
    api.searchSafe("?tag=pdpl-compliant&take=24"),
    Promise.all(FEATURED.map((s) => api.getTool(s).then(mapTool).catch(() => null))),
  ]);
  const featured = featuredRaw.filter(Boolean) as ToolSummary[];

  const Section = ({ title, sub, items }: { title: string; sub: string; items: ToolDoc[] }) =>
    items.length === 0 ? null : (
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
        <p className="mb-5 mt-1 text-sm text-slate-500">{sub}</p>
        <Grid items={items} />
      </section>
    );

  return (
    <main>
      <section className="hero-grid relative overflow-hidden border-b border-white/5">
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal/20 bg-teal/5 px-3 py-1 font-mono text-xs text-teal">🇦🇪 MENA</span>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-50 sm:text-6xl">AI Tools for the MENA Region</h1>
          <p className="mx-auto mt-5 max-w-xl text-slate-400">
            Verified AI for UAE, Saudi, and the wider Middle East — Arabic-first models, Gulf-founded
            startups, and privacy-compliant tools.
          </p>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="mb-5 flex items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-100">Gulf startup spotlight</h2>
            <Badge tone="sun">Featured</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((t) => <ToolCard key={t.id} tool={t} />)}
          </div>
        </section>
      )}

      <Section title="Arabic NLP" sub="Arabic-first language models and NLP toolkits." items={arabic.items} />
      <Section title="Arabic UI" sub="Tools with a first-class Arabic interface." items={arabicUi.items} />
      <Section title="MENA-founded" sub="Tools built by UAE, Saudi, and regional founders." items={founded.items} />
      <Section title="PDPL-compliant" sub="Tools aligned with regional data-protection law." items={pdpl.items} />

      <section className="mx-auto max-w-3xl px-4 pb-20 text-center sm:px-6">
        <Link href="/category/arabic-nlp" className="text-sm text-teal hover:underline">Browse all Arabic NLP tools →</Link>
      </section>
    </main>
  );
}
