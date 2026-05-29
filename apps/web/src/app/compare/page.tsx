import type { Metadata } from "next";
import Link from "next/link";
import { Badge, VerifiedFreeBadge, Button } from "@hub/ui";
import { api, type CompareTool } from "@/lib/api";

export const dynamic = "force-dynamic";
type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const PRICING_LABEL: Record<string, string> = {
  FREE: "Free", FREEMIUM: "Freemium", PAID: "Paid", SUBSCRIPTION: "Subscription",
  USAGE_BASED: "Usage-based", OPEN_SOURCE: "Open source", CONTACT: "Contact",
};

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
  const sp = await searchParams;
  const slugs = (str(sp.tools) ?? "").split(",").filter(Boolean);
  const title = slugs.length ? `Compare ${slugs.join(" vs ")}` : "Compare AI tools";
  return { title, description: "Side-by-side comparison of AI tools — pricing, free tier, API, ratings." };
}

function yes(b: boolean) {
  return b ? <span className="text-leaf">✓</span> : <span className="text-slate-600">—</span>;
}

export default async function ComparePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const slugs = (str(sp.tools) ?? "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 4);
  const tools: CompareTool[] = slugs.length >= 1 ? await api.compare(slugs) : [];

  if (tools.length < 2) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-3xl font-bold">Compare AI tools</h1>
        <p className="mt-3 text-slate-400">
          Pick 2–4 tools to compare side by side. Add them from any tool page, or start by browsing.
        </p>
        <div className="mt-6">
          <Link href="/tools"><Button>Browse tools</Button></Link>
        </div>
      </main>
    );
  }

  const rows: { label: string; render: (t: CompareTool) => React.ReactNode }[] = [
    { label: "Pricing", render: (t) => PRICING_LABEL[t.pricingModel] ?? t.pricingModel },
    { label: "Verified free tier", render: (t) => (t.freeTierReal ? <VerifiedFreeBadge /> : yes(false)) },
    { label: "API", render: (t) => yes(t.hasApi) },
    { label: "Open source", render: (t) => yes(t.isOpenSource) },
    { label: "Rating", render: (t) => (t.rating != null ? `★ ${t.rating.toFixed(1)} (${t.reviewCount})` : "—") },
    { label: "Freshness", render: (t) => `${t.freshnessScore}/100` },
    { label: "Platforms", render: (t) => t.platforms.join(", ") || "—" },
    { label: "Languages", render: (t) => t.languages.join(", ") || "—" },
    { label: "Categories", render: (t) => t.categories.map((c) => c.name).join(", ") || "—" },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">{tools.map((t) => t.name).join(" vs ")}</h1>
      <p className="mt-1 text-slate-400">Side-by-side comparison of {tools.length} verified tools.</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="bg-white/5">
              <th className="px-4 py-3 text-left font-medium text-slate-400">&nbsp;</th>
              {tools.map((t) => (
                <th key={t.id} className="px-4 py-3 text-left">
                  <Link href={`/tools/${t.slug}`} className="font-semibold text-slate-50 hover:text-teal">
                    {t.name}
                  </Link>
                  <p className="mt-0.5 text-xs font-normal text-slate-500 line-clamp-2">{t.tagline}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-white/5">
                <td className="px-4 py-3 font-medium text-slate-400">{row.label}</td>
                {tools.map((t) => (
                  <td key={t.id} className="px-4 py-3 text-slate-200">{row.render(t)}</td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-white/5">
              <td className="px-4 py-3 font-medium text-slate-400">Visit</td>
              {tools.map((t) => (
                <td key={t.id} className="px-4 py-3">
                  <a href={t.websiteUrl} target="_blank" rel="noopener noreferrer nofollow">
                    <Badge tone="teal">Open ↗</Badge>
                  </a>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <Link href="/tools" className="text-sm text-teal hover:underline">← Browse more tools</Link>
      </div>
    </main>
  );
}
