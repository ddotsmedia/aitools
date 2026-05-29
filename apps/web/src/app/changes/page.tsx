import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@hub/ui";
import { api, type ChangeFeedItem } from "@/lib/api";

export const metadata: Metadata = {
  title: "What changed — live verification feed",
  description: "Real-time log of verified changes across AI tools: status, pricing, and free-tier updates.",
  alternates: { canonical: "/changes" },
};
export const revalidate = 60;

const KIND: Record<string, { label: string; tone: "teal" | "sun" | "amber" | "leaf" | "neutral" }> = {
  status: { label: "Status", tone: "amber" },
  pricing: { label: "Pricing", tone: "sun" },
  free_tier: { label: "Free tier", tone: "leaf" },
  content: { label: "Updated", tone: "neutral" },
  version: { label: "Version", tone: "teal" },
  feature: { label: "Feature", tone: "teal" },
};

function ago(d: string): string {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default async function ChangesPage() {
  const items: ChangeFeedItem[] = await api.changes().catch(() => []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Badge tone="leaf" className="mb-3">Live verification</Badge>
      <h1 className="text-3xl font-bold">What changed</h1>
      <p className="mt-2 text-slate-400">
        Every change our verification engine detects — tools going up or down, pricing-page changes,
        and free tiers verified. This is the freshness other directories don&apos;t have.
      </p>

      {items.length === 0 ? (
        <p className="mt-10 text-slate-400">
          No changes logged yet — the engine runs every 12 hours. Check back soon.
        </p>
      ) : (
        <ol className="mt-8 space-y-2">
          {items.map((c) => {
            const k = KIND[c.kind] ?? { label: c.kind, tone: "neutral" as const };
            return (
              <li key={c.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                {c.tool.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.tool.logoUrl} alt="" className="h-7 w-7 flex-shrink-0 rounded" />
                ) : (
                  <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded bg-teal/15 text-xs font-bold text-teal">
                    {c.tool.name.slice(0, 1)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <Link href={`/tools/${c.tool.slug}`} className="font-medium text-slate-100 hover:text-teal">
                    {c.tool.name}
                  </Link>
                  <span className="text-slate-400"> — {c.summary}</span>
                </div>
                <Badge tone={k.tone}>{k.label}</Badge>
                <span className="hidden flex-shrink-0 text-xs text-slate-500 sm:block">{ago(c.createdAt)}</span>
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}
