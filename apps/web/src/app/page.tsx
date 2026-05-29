import Link from "next/link";
import type { ToolSummary } from "@hub/types";
import {
  Button,
  Card,
  CardTitle,
  CardBody,
  Badge,
  VerifiedFreeBadge,
  FreshnessMeter,
  ToolCard,
} from "@hub/ui";

// P1 showcase data. Replaced by API-backed feeds in P3/P4.
const SAMPLE: ToolSummary[] = [
  {
    id: "1", slug: "whisper-arabic", name: "Whisper Arabic", tagline: "Transcribe Arabic meetings with dialect support.",
    pricingModel: "OPEN_SOURCE", freeTierReal: true, freshnessScore: 92,
    categories: ["Transcription"], tags: ["arabic", "speech"],
  },
  {
    id: "2", slug: "stackgen", name: "StackGen", tagline: "Describe a goal, get a wired multi-tool stack.",
    pricingModel: "FREEMIUM", freeTierReal: true, freshnessScore: 68,
    categories: ["Productivity"], tags: ["agents"],
  },
  {
    id: "3", slug: "pixelforge", name: "PixelForge", tagline: "Brand-consistent image generation at scale.",
    pricingModel: "SUBSCRIPTION", freeTierReal: false, freshnessScore: 34,
    categories: ["Image"], tags: ["design"],
  },
];

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <Badge tone="leaf" className="mb-5">Machine-verified · not scraped</Badge>
        <h1 className="text-balance text-4xl font-bold leading-tight md:text-6xl">
          Find the <span className="text-teal">right AI tool</span> — verified, not scraped.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
          Describe the job, get a working tool stack. Every listing checked for live status, real
          pricing, and genuine free tiers.
        </p>
        <form action="/search" className="mx-auto mt-8 flex max-w-2xl gap-2">
          <input
            name="q"
            placeholder="Transcribe Arabic meetings, then summarise to a report…"
            className="h-12 flex-1 rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal focus:outline-none"
          />
          <Button size="lg" type="submit">Build my stack</Button>
        </form>
      </section>

      {/* Verified feed */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Freshly verified</h2>
          <Link href="/tools" className="text-sm text-teal hover:underline">Browse all →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SAMPLE.map((t) => (
            <ToolCard key={t.id} tool={t} />
          ))}
        </div>
      </section>

      {/* Design-system showcase — proves @hub/ui renders (P1 acceptance). */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="mb-5 text-2xl font-semibold">Design system</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardTitle>Buttons</CardTitle>
            <CardBody>Brand-token variants.</CardBody>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </Card>
          <Card>
            <CardTitle>Badges</CardTitle>
            <CardBody>Status + taxonomy chips.</CardBody>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="teal">Teal</Badge>
              <Badge tone="sun">Sun</Badge>
              <Badge tone="amber">Amber</Badge>
              <Badge tone="leaf">Leaf</Badge>
              <VerifiedFreeBadge />
            </div>
          </Card>
          <Card>
            <CardTitle>Freshness</CardTitle>
            <CardBody>0–100 verification score.</CardBody>
            <div className="mt-4 space-y-3">
              <FreshnessMeter score={92} />
              <FreshnessMeter score={61} />
              <FreshnessMeter score={30} />
              <FreshnessMeter score={8} />
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
