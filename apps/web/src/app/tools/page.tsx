import type { Metadata } from "next";
import Link from "next/link";
import { Badge, ToolCard } from "@hub/ui";
import { api, docToSummary, type FacetDistribution } from "@/lib/api";

export const metadata: Metadata = {
  title: "Browse AI tools",
  description: "Filter verified AI tools by category, pricing, real free tier, API, and open source.",
  alternates: { canonical: "/tools" },
};
export const dynamic = "force-dynamic";

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const PRICING_LABEL: Record<string, string> = {
  FREE: "Free",
  FREEMIUM: "Freemium",
  PAID: "Paid",
  SUBSCRIPTION: "Subscription",
  USAGE_BASED: "Usage-based",
  OPEN_SOURCE: "Open source",
  CONTACT: "Contact",
};
const TAKE = 24;

/** Build a /tools href with one param toggled (removed if it already equals value). */
function toggle(sp: SP, key: string, value: string): string {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const s = str(v);
    if (s && k !== "page") next.set(k, s);
  }
  if (str(sp[key]) === value) next.delete(key);
  else next.set(key, value);
  const qs = next.toString();
  return `/tools${qs ? `?${qs}` : ""}`;
}

/** Build a /tools href with one param set to a value (resets paging). */
function setParam(sp: SP, key: string, value: string): string {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const s = str(v);
    if (s && k !== "page" && k !== key) next.set(k, s);
  }
  next.set(key, value);
  const qs = next.toString();
  return `/tools${qs ? `?${qs}` : ""}`;
}

function FacetGroup({
  title,
  sp,
  param,
  dist,
  labels,
}: {
  title: string;
  sp: SP;
  param: string;
  dist?: Record<string, number>;
  labels?: Record<string, string>;
}) {
  const entries = Object.entries(dist ?? {}).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return null;
  const active = str(sp[param]);
  return (
    <div className="mb-6">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</h3>
      <ul className="space-y-1">
        {entries.map(([value, count]) => (
          <li key={value}>
            <Link
              href={toggle(sp, param, value)}
              className={`flex items-center justify-between rounded-lg px-2 py-1 text-sm transition-colors ${
                active === value ? "bg-teal/15 text-teal" : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <span>{labels?.[value] ?? value}</span>
              <span className="text-xs text-slate-500">{count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function BrowsePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(str(sp.page) ?? "1") || 1);

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const s = str(v);
    if (s && k !== "page") qs.set(k, s);
  }
  qs.set("take", String(TAKE));
  qs.set("skip", String((page - 1) * TAKE));

  const res = await api.searchSafe(`?${qs.toString()}`);
  const facets: FacetDistribution = res.facets ?? {};
  const totalPages = Math.max(1, Math.ceil(res.total / TAKE));

  const boolToggles: { key: string; label: string; facetKey: string }[] = [
    { key: "free", label: "Verified free tier", facetKey: "freeTierReal" },
    { key: "api", label: "Has API", facetKey: "hasApi" },
    { key: "oss", label: "Open source", facetKey: "isOpenSource" },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Browse AI tools</h1>
          <p className="mt-1 text-slate-400">
            {res.total} verified tool{res.total === 1 ? "" : "s"}
            {str(sp.q) ? ` matching “${str(sp.q)}”` : ""}.
          </p>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <span className="text-slate-500">Sort:</span>
          {[
            { key: "popularity", label: "Popular" },
            { key: "new", label: "Newest" },
            { key: "freshness", label: "Freshest" },
          ].map((s) => {
            const active = (str(sp.sort) ?? "popularity") === s.key;
            return (
              <Link
                key={s.key}
                href={setParam(sp, "sort", s.key)}
                className={`rounded-lg px-2.5 py-1 transition-colors ${
                  active ? "bg-teal/15 text-teal" : "text-slate-400 hover:bg-white/5"
                }`}
              >
                {s.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        {/* Filters */}
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <form action="/tools" className="mb-6">
            <input
              name="q"
              defaultValue={str(sp.q) ?? ""}
              placeholder="Search…"
              className="h-10 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal focus:outline-none"
            />
          </form>

          <div className="mb-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Filters
            </h3>
            <ul className="space-y-1">
              {boolToggles.map((t) => {
                const on = str(sp[t.key]) === "true";
                const count = facets[t.facetKey]?.["true"];
                return (
                  <li key={t.key}>
                    <Link
                      href={toggle(sp, t.key, "true")}
                      className={`flex items-center justify-between rounded-lg px-2 py-1 text-sm transition-colors ${
                        on ? "bg-leaf/15 text-leaf" : "text-slate-300 hover:bg-white/5"
                      }`}
                    >
                      <span>{t.label}</span>
                      {count != null && <span className="text-xs text-slate-500">{count}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <FacetGroup title="Pricing" sp={sp} param="pricing" dist={facets.pricingModel} labels={PRICING_LABEL} />
          <FacetGroup title="Category" sp={sp} param="category" dist={facets.categories} />

          {Object.keys(sp).some((k) => str(sp[k]) && k !== "page") && (
            <Link href="/tools" className="text-sm text-teal hover:underline">
              Clear all filters
            </Link>
          )}
        </aside>

        {/* Results */}
        <section>
          {res.items.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-slate-400">
              No tools match these filters.{" "}
              <Link href="/tools" className="text-teal hover:underline">Reset</Link>.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {res.items.map((d) => (
                <ToolCard key={d.id} tool={docToSummary(d)} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={`/tools?${(() => { const q = new URLSearchParams(qs); q.set("page", String(page - 1)); q.delete("take"); q.delete("skip"); return q.toString(); })()}`}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-sm hover:border-teal/60"
                >
                  ← Prev
                </Link>
              )}
              <Badge tone="neutral">Page {page} / {totalPages}</Badge>
              {page < totalPages && (
                <Link
                  href={`/tools?${(() => { const q = new URLSearchParams(qs); q.set("page", String(page + 1)); q.delete("take"); q.delete("skip"); return q.toString(); })()}`}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-sm hover:border-teal/60"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
