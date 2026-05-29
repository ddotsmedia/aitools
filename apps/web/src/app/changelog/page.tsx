import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog",
  description: "What's new on AI Tools Hub.",
  alternates: { canonical: "/changelog" },
};

const ENTRIES = [
  { v: "Discovery", items: ["Full-text + faceted search", "Tool detail pages with structured data", "Side-by-side compare", "Category & alternatives pages"] },
  { v: "Catalog", items: ["Tool submission + moderation queue", "AI-assisted enrichment", "~95 real AI tools seeded with verified links"] },
  { v: "Foundation", items: ["Design system", "Verified-free + freshness badges", "Monorepo + automated deploy"] },
];

export default function ChangelogPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="text-3xl font-bold">Changelog</h1>
      <p className="mt-2 text-slate-400">Shipping in the open.</p>
      <div className="mt-8 space-y-8">
        {ENTRIES.map((e) => (
          <div key={e.v}>
            <h2 className="text-lg font-semibold text-teal">{e.v}</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
              {e.items.map((i) => <li key={i}>{i}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}
