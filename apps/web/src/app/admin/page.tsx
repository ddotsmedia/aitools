import type { Metadata } from "next";
import { Badge, Card } from "@hub/ui";
import { API_BASE, type ToolList } from "@/lib/api";
import { AdminActions } from "@/components/AdminActions";

export const metadata: Metadata = { title: "Moderation", robots: { index: false } };
export const dynamic = "force-dynamic";

async function pending(): Promise<ToolList> {
  const res = await fetch(`${API_BASE}/tools?status=PENDING&take=100`, { cache: "no-store" });
  if (!res.ok) return { items: [], total: 0 };
  return res.json();
}

export default async function AdminPage() {
  const { items, total } = await pending();
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Moderation queue</h1>
        <Badge tone="sun">{total} pending</Badge>
      </div>
      <p className="mb-6 text-sm text-slate-500">
        P7 will gate this behind admin auth. Enrich drafts fields, then approve to publish.
      </p>

      {items.length === 0 ? (
        <Card>
          <p className="text-slate-400">Queue empty. Submit a tool at /submit to see it here.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <Card key={t.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-50">{t.name}</span>
                  <Badge tone="neutral">{t.pricingModel}</Badge>
                  {t.categories.map((c) => (
                    <Badge key={c.slug} tone="teal">{c.name}</Badge>
                  ))}
                </div>
                <p className="mt-1 truncate text-sm text-slate-400">
                  {t.tagline || <span className="italic text-slate-600">no tagline — run enrich</span>}
                </p>
                <a href={t.websiteUrl} className="text-xs text-teal hover:underline" rel="noreferrer">
                  {t.websiteUrl}
                </a>
              </div>
              <AdminActions id={t.id} />
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
