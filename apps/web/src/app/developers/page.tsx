import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardTitle, CardBody, Badge, Button } from "@hub/ui";

export const metadata: Metadata = {
  title: "Public API",
  description: "Query the AI Tools Hub dataset — search, tools, compare, and categories endpoints.",
  alternates: { canonical: "/developers" },
};

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4020";

const ENDPOINTS = [
  { m: "GET", p: "/search?q=&category=&pricing=&free=true", d: "Faceted search across published tools. Returns items, total, and facet counts." },
  { m: "GET", p: "/tools/:slug", d: "Full detail for one tool, including pricing tiers and tags." },
  { m: "GET", p: "/compare?tools=a,b,c", d: "Side-by-side data for 2–4 tools." },
  { m: "GET", p: "/categories", d: "All categories with tool counts." },
  { m: "GET", p: "/tags", d: "All tags with tool counts." },
];

export default function ApiPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <Badge tone="teal" className="mb-3">Developers</Badge>
      <h1 className="text-3xl font-bold">Public API</h1>
      <p className="mt-3 text-slate-400">
        The verified AI-tools dataset is queryable over a simple read API. JSON, no key required for
        these read endpoints (rate-limited keys & write access land with the developer layer).
      </p>
      <p className="mt-2 text-sm text-slate-500">Base URL: <code className="text-teal">{BASE}</code></p>

      <div className="mt-6 space-y-3">
        {ENDPOINTS.map((e) => (
          <Card key={e.p}>
            <div className="flex items-center gap-2">
              <Badge tone="leaf">{e.m}</Badge>
              <code className="text-sm text-slate-100">{e.p}</code>
            </div>
            <CardBody>{e.d}</CardBody>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardTitle>Example</CardTitle>
        <CardBody>
          <code className="block whitespace-pre-wrap text-xs text-slate-300">
            curl &quot;{BASE}/search?q=transcribe&amp;free=true&quot;
          </code>
        </CardBody>
      </Card>

      <div className="mt-6">
        <Link href="/tools"><Button variant="outline">Browse the catalog</Button></Link>
      </div>
    </main>
  );
}
