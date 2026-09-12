import type { Metadata } from "next";
import { Badge, Card } from "@hub/ui";
import { API_BASE } from "@/lib/api";

export const metadata: Metadata = { title: "Admin Dashboard", robots: { index: false } };
export const dynamic = "force-dynamic";

interface AnalyticsData {
  summary: {
    total: number;
    pending: number;
    published: number;
    rejected: number;
    pendingRatio: string;
  };
  pending: {
    weeklyNew: number;
    monthlyNew: number;
  };
  distribution: {
    bySource: Array<{ source: string; count: number }>;
    byPricing: Array<{ pricing: string; count: number }>;
  };
}

async function fetchAnalytics(): Promise<AnalyticsData | null> {
  try {
    const res = await fetch(`${API_BASE}/tools/admin/analytics`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const analytics = await fetchAnalytics();

  if (!analytics) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <Card>
          <p className="text-slate-400">Unable to load analytics data.</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card className="p-4">
          <p className="text-sm text-slate-400 mb-1">Total Tools</p>
          <p className="text-2xl font-bold text-slate-50">{analytics.summary.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-400 mb-1">Pending</p>
          <p className="text-2xl font-bold text-sun">{analytics.summary.pending}</p>
          <p className="text-xs text-slate-500 mt-1">{analytics.summary.pendingRatio}% ratio</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-400 mb-1">Published</p>
          <p className="text-2xl font-bold text-teal">{analytics.summary.published}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-400 mb-1">Rejected</p>
          <p className="text-2xl font-bold text-slate-500">{analytics.summary.rejected}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-400 mb-1">New This Week</p>
          <p className="text-2xl font-bold text-slate-50">{analytics.pending.weeklyNew}</p>
        </Card>
      </div>

      {/* Monthly Stats */}
      <Card className="p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-slate-50">Pending Queue Activity</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-400">New This Month</p>
            <p className="text-3xl font-bold text-slate-50 mt-1">{analytics.pending.monthlyNew}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Weekly Average</p>
            <p className="text-3xl font-bold text-slate-50 mt-1">
              {(analytics.pending.monthlyNew / 4).toFixed(0)}
            </p>
          </div>
        </div>
      </Card>

      {/* Distribution by Source */}
      <Card className="p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-slate-50">Pending by Source</h2>
        <div className="space-y-2">
          {analytics.distribution.bySource.map((item) => (
            <div key={item.source} className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{item.source}</span>
              <div className="flex items-center gap-2">
                <div className="h-2 bg-slate-700 rounded" style={{ width: Math.max(100, item.count * 10) }}></div>
                <span className="text-sm font-medium text-slate-50 w-8 text-right">{item.count}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Distribution by Pricing */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-slate-50">Pending by Pricing Model</h2>
        <div className="space-y-2">
          {analytics.distribution.byPricing.map((item) => (
            <div key={item.pricing} className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{item.pricing}</span>
              <div className="flex items-center gap-2">
                <div className="h-2 bg-slate-700 rounded" style={{ width: Math.max(100, item.count * 10) }}></div>
                <span className="text-sm font-medium text-slate-50 w-8 text-right">{item.count}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-8">
        <a href="/admin" className="text-teal hover:underline text-sm">
          ← Back to Moderation Queue
        </a>
      </div>
    </main>
  );
}
