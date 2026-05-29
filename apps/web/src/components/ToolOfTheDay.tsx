import Link from "next/link";
import { Badge, Button } from "@hub/ui";
import { api } from "@/lib/api";

const PRICING_LABEL: Record<string, string> = {
  FREE: "Free", FREEMIUM: "Freemium", PAID: "Paid", SUBSCRIPTION: "Subscription",
  USAGE_BASED: "Usage-based", OPEN_SOURCE: "Open source", CONTACT: "Contact",
};

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export async function ToolOfTheDay() {
  const slugs = await api.slugs().catch(() => [] as { slug: string }[]);
  if (!slugs.length) return null;
  const day = new Date().toISOString().slice(0, 10);
  const pick = slugs[hash(day) % slugs.length].slug;
  const tool = await api.getTool(pick).catch(() => null);
  if (!tool) return null;
  const cat = tool.categories[0];

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-5 flex items-center gap-2">
        <h2 className="text-xl font-semibold text-slate-100">Tool of the Day</h2>
        <Badge tone="sun">{day}</Badge>
      </div>
      <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:flex-row sm:items-center">
        <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-white/[0.06] shadow-lg shadow-black/30 ring-1 ring-inset ring-white/10">
          {tool.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tool.logoUrl} alt="" className="h-9 w-9 object-contain" />
          ) : (
            <span className="text-lg font-bold text-teal">{tool.name.slice(0, 2).toUpperCase()}</span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/tools/${tool.slug}`} className="text-2xl font-bold text-slate-50 hover:text-teal">{tool.name}</Link>
            {cat && <Link href={`/category/${cat.slug}`}><Badge tone="teal">{cat.name}</Badge></Link>}
            <Badge tone="neutral">{PRICING_LABEL[tool.pricingModel] ?? tool.pricingModel}</Badge>
          </div>
          <p className="mt-1 text-slate-300">{tool.tagline}</p>
          <p className="mt-2 text-sm text-slate-500">
            <span className="font-medium text-slate-400">Why today?</span> A fresh, verified pick to discover something new — our daily rotation surfaces a different tool every day.
          </p>
        </div>
        <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer nofollow" className="flex-shrink-0">
          <Button>Visit tool →</Button>
        </a>
      </div>
    </section>
  );
}
