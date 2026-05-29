import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardTitle, CardBody, Button } from "@hub/ui";

export const metadata: Metadata = {
  title: "Verification methodology",
  description: "How AI Tools Hub verifies live status, real pricing, and genuine free tiers.",
  alternates: { canonical: "/methodology" },
};

const STEPS = [
  { t: "Live status", b: "Every tool URL is pinged on a schedule; unreachable tools are flagged and their freshness score drops." },
  { t: "Real pricing", b: "Pricing is read from the tool's own pricing page and hashed — when it changes, we record a change event." },
  { t: "Free-tier reality", b: "A “verified free” badge is only shown when a genuine, card-free tier is confirmed — never assumed from marketing copy." },
  { t: "Freshness score", b: "A 0–100 score reflects how recently and successfully a tool was verified." },
];

export default function MethodologyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-3xl font-bold">How we verify</h1>
      <p className="mt-3 text-slate-400">
        AI Tools Hub is built on verification, not scraping. Listings are machine-checked so you can
        trust live status, pricing, and free-tier claims. The full verification engine ships in a
        later phase; here&apos;s what it checks.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {STEPS.map((s) => (
          <Card key={s.t}>
            <CardTitle>{s.t}</CardTitle>
            <CardBody>{s.b}</CardBody>
          </Card>
        ))}
      </div>
      <div className="mt-8">
        <Link href="/tools"><Button>Browse verified tools</Button></Link>
      </div>
    </main>
  );
}
