import Link from "next/link";
import { Button, Badge, VerifiedFreeBadge } from "@hub/ui";
import { api } from "@/lib/api";
import { Hero } from "@/components/Hero";
import { ToolOfTheDay } from "@/components/ToolOfTheDay";

export const revalidate = 120;

const EMOJI: Record<string, string> = {
  writing: "✍️", image: "🖼️", audio: "🎙️", video: "🎬", code: "💻",
  productivity: "⚡", "data-analytics": "📊", "ai-agents": "🤖", search: "🔍",
  transcription: "🗣️", translation: "🌐", chatbots: "💬", marketing: "📣",
  design: "🎨", research: "🔬", "customer-support": "🎧", security: "🔒",
  education: "🎓", healthcare: "🩺", "developer-tools": "🛠️",
  "website-builders": "🌐", "app-builders": "📱", seo: "📈", "social-media": "📲",
  "logo-design": "✏️", "ui-ux-design": "🎯", "resume-career": "📄",
  "e-commerce": "🛒", legal: "⚖️", cybersecurity: "🛡️", "3d-game-dev": "🎮",
  "sales-crm": "💼", "hr-recruitment": "👥", "finance-accounting": "💰", travel: "✈️",
};

export default async function Home() {
  const [totals, cats] = await Promise.all([
    api.search("?take=1").catch(() => ({ total: 0 })),
    api.categories().catch(() => []),
  ]);
  const categories = cats
    .filter((c) => c._count.tools > 0)
    .sort((a, b) => b._count.tools - a._count.tools);

  return (
    <main>
      {/* ── Hero (premium, animated) ──────────────────────────────────────── */}
      <Hero total={totals.total || 0} categories={categories.length} />

      {/* ── Tool of the Day ───────────────────────────────────────────────── */}
      <ToolOfTheDay />

      {/* ── All categories ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-100">Browse by category</h2>
            <p className="mt-1 text-sm text-slate-500">{categories.length} categories · {totals.total} verified tools</p>
          </div>
          <Link href="/tools" className="text-sm text-teal hover:underline transition-colors">All tools →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="group flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 px-4 py-3 transition-all hover:border-teal/30 hover:bg-teal/8"
            >
              <span className="text-2xl" aria-hidden="true">{EMOJI[c.slug] ?? "🧩"}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-slate-200 group-hover:text-teal">{c.name}</span>
                <span className="text-xs text-slate-500">{c._count.tools} tools</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Trust / verification callout ──────────────────────────────────── */}
      <section className="border-t border-white/8 bg-white/3">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <Badge tone="teal" className="mb-4">How it works</Badge>
              <h2 className="text-2xl font-bold leading-snug text-slate-50 sm:text-3xl">
                Every tool is <span className="text-teal">machine-verified</span>, not just scraped.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                Our verification engine checks live status, tracks real pricing pages, and tests
                free-tier claims — so you can trust what you see. See it in the{" "}
                <Link href="/changes" className="text-teal hover:underline">live change feed</Link>.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/methodology"><Button variant="outline" size="sm">Read the methodology →</Button></Link>
                <Link href="/submit"><Button variant="ghost" size="sm">Submit a tool</Button></Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "🟢", title: "Live status check", body: "We ping every tool URL and flag anything that's down." },
                { icon: "💰", title: "Real pricing", body: "Pricing pages are tracked; changes are logged." },
                { icon: "✅", title: "Free-tier testing", body: "Free-tier claims are machine-verified, not assumed." },
                { icon: "📅", title: "Freshness score", body: "Every listing shows when it was last verified — 0 to 100." },
              ].map(({ icon, title, body }) => (
                <div key={title} className="rounded-xl border border-white/8 bg-white/4 p-4">
                  <span className="text-xl" aria-hidden="true">{icon}</span>
                  <p className="mt-2 text-sm font-semibold text-slate-200">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h2 className="text-2xl font-bold text-slate-50 sm:text-3xl">Ready to find your stack?</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-slate-400">
          Describe what you&apos;re trying to build — our AI recommends a complete, verified tool stack.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href="/stack"><Button size="lg">Try Stack Builder</Button></Link>
          <Link href="/tools"><Button variant="outline" size="lg">Browse all tools</Button></Link>
        </div>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-600">
          <VerifiedFreeBadge />
          <span>Free to use · No account needed</span>
        </p>
      </section>
    </main>
  );
}
