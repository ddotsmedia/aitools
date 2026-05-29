"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, ToolCard } from "@hub/ui";
import type { ToolSummary } from "@hub/types";
import { API_BASE, type ApiTool } from "@/lib/api";

export default function SavedPage() {
  const [tools, setTools] = useState<ToolSummary[] | null>(null);

  useEffect(() => {
    let slugs: string[] = [];
    try {
      slugs = JSON.parse(localStorage.getItem("savedTools") || "[]");
    } catch {
      slugs = [];
    }
    if (slugs.length === 0) {
      setTools([]);
      return;
    }
    Promise.all(
      slugs.map((s) =>
        fetch(`${API_BASE}/tools/${s}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
      ),
    ).then((rows) => {
      const mapped = (rows.filter(Boolean) as ApiTool[]).map<ToolSummary>((t) => ({
        id: t.id,
        slug: t.slug,
        name: t.name,
        tagline: t.tagline,
        pricingModel: t.pricingModel as ToolSummary["pricingModel"],
        freeTierReal: t.freeTierReal,
        freshnessScore: t.freshnessScore,
        categories: t.categories.map((c) => c.name),
        tags: t.tags.map((x) => x.slug),
        logoUrl: t.logoUrl ?? undefined,
      }));
      setTools(mapped);
    });
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Saved tools</h1>
      <p className="mt-1 text-slate-400">Your shortlist, stored on this device.</p>

      {tools === null ? (
        <p className="mt-8 text-slate-500">Loading…</p>
      ) : tools.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-slate-400">
          Nothing saved yet. Tap <span className="text-slate-200">☆ Save</span> on any tool.
          <div className="mt-4"><Link href="/tools"><Button>Browse tools</Button></Link></div>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => (
            <ToolCard key={t.id} tool={t} />
          ))}
        </div>
      )}
    </main>
  );
}
