import type { Metadata } from "next";
import { Badge, Card } from "@hub/ui";
import { API_BASE, type ToolList } from "@/lib/api";
import { AdminPageClient } from "@/components/AdminPageClient";

export const metadata: Metadata = { title: "Moderation", robots: { index: false } };
export const dynamic = "force-dynamic";

async function pending(params: URLSearchParams): Promise<ToolList> {
  const res = await fetch(`${API_BASE}/tools?status=PENDING&take=100&${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) return { items: [], total: 0 };
  return res.json();
}

function getSourceBadge(source?: string) {
  const colors: Record<string, "sun" | "teal" | "neutral"> = {
    PRODUCT_HUNT: "sun",
    GITHUB_TRENDING: "neutral",
    HACKERNEWS: "neutral",
  };
  const label: Record<string, string> = {
    PRODUCT_HUNT: "PH",
    GITHUB_TRENDING: "GitHub",
    HACKERNEWS: "HN",
    USER_SUBMITTED: "User",
  };
  return <Badge tone={colors[source || "USER_SUBMITTED"] || "neutral"}>{label[source || "USER_SUBMITTED"]}</Badge>;
}

interface AdminPageProps {
  searchParams?: Promise<Record<string, string | string[]>>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = searchParams ? await searchParams : {};
  const urlParams = new URLSearchParams();

  if (params.q) urlParams.set("q", params.q as string);
  if (params.source) urlParams.set("source", params.source as string);
  if (params.dateFrom) urlParams.set("dateFrom", params.dateFrom as string);
  if (params.dateTo) urlParams.set("dateTo", params.dateTo as string);
  if (params.sort) urlParams.set("sort", params.sort as string);

  const { items, total } = await pending(urlParams);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 pb-24">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Moderation queue</h1>
          <div className="flex gap-4 items-center mt-2">
            <a href="/admin/dashboard" className="text-sm text-teal hover:underline">
              View Dashboard
            </a>
            <span className="text-sm text-slate-400">{total} pending</span>
          </div>
        </div>
        <Badge tone="sun">{total} total</Badge>
      </div>
      <p className="mb-6 text-sm text-slate-500">
        Scraped tools appear daily. Use filters to find tools, edit details, enrich with AI, then bulk approve or reject.
      </p>

      <AdminPageClient items={items} total={total} getSourceBadge={getSourceBadge} />
    </main>
  );
}
