import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Card, CardTitle, CardBody, Button, VerifiedFreeBadge, FreshnessMeter, ToolCard } from "@hub/ui";
import { api, docToSummary, type ApiTool } from "@/lib/api";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3020";

const PRICING_LABEL: Record<string, string> = {
  FREE: "Free",
  FREEMIUM: "Freemium",
  PAID: "Paid",
  SUBSCRIPTION: "Subscription",
  USAGE_BASED: "Usage-based",
  OPEN_SOURCE: "Open source",
  CONTACT: "Contact sales",
};

async function load(slug: string): Promise<ApiTool | null> {
  try {
    return await api.getTool(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = await load(slug);
  if (!tool) return { title: "Tool not found" };
  return {
    title: `${tool.name} — review, pricing & alternatives`,
    description: tool.tagline || `${tool.name}: verified status, real pricing, alternatives.`,
    alternates: { canonical: `/tools/${tool.slug}` },
    openGraph: { title: tool.name, description: tool.tagline, type: "website" },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = await load(slug);
  if (!tool) notFound();

  const ratings = tool.reviews?.map((r) => r.rating) ?? [];
  const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

  // Alternatives: same primary category, excluding this tool.
  const cat = tool.categories[0]?.slug;
  const alt = cat ? await api.search(`?category=${cat}&take=7`) : null;
  const alternatives = (alt?.items ?? []).filter((d) => d.slug !== tool.slug).slice(0, 6);

  const faqs = [
    {
      q: `Is ${tool.name} free?`,
      a: tool.freeTierReal
        ? `${tool.name} has a machine-verified free tier (no card required).`
        : `${tool.name} is ${PRICING_LABEL[tool.pricingModel]?.toLowerCase()}. Its free tier is not verified card-free.`,
    },
    {
      q: `Does ${tool.name} have an API?`,
      a: tool.hasApi ? `Yes, ${tool.name} offers an API.` : `${tool.name} does not advertise a public API.`,
    },
    {
      q: `What are alternatives to ${tool.name}?`,
      a: alternatives.length
        ? `Alternatives include ${alternatives.slice(0, 3).map((t) => t.name).join(", ")}.`
        : `Browse the ${tool.categories[0]?.name ?? "catalog"} category for alternatives.`,
    },
  ];

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: tool.name,
        description: tool.description || tool.tagline,
        applicationCategory: tool.categories[0]?.name ?? "AIApplication",
        operatingSystem: tool.platforms.join(", ") || "Web",
        url: `${SITE}/tools/${tool.slug}`,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD", category: tool.pricingModel },
        ...(avg
          ? { aggregateRating: { "@type": "AggregateRating", ratingValue: avg.toFixed(1), reviewCount: ratings.length } }
          : {}),
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Tools", item: `${SITE}/tools` },
          { "@type": "ListItem", position: 2, name: tool.name, item: `${SITE}/tools/${tool.slug}` },
        ],
      },
    ],
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-slate-500">
        <Link href="/tools" className="hover:text-teal">Tools</Link>
        {tool.categories[0] && (
          <>
            {" / "}
            <Link href={`/category/${tool.categories[0].slug}`} className="hover:text-teal">
              {tool.categories[0].name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-slate-300">{tool.name}</span>
      </nav>

      {/* Header */}
      <header className="flex flex-wrap items-start gap-4">
        {tool.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tool.logoUrl} alt="" className="h-16 w-16 rounded-xl object-cover" />
        ) : (
          <span className="grid h-16 w-16 place-items-center rounded-xl bg-teal/15 text-xl font-bold text-teal">
            {tool.name.slice(0, 2).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold">{tool.name}</h1>
          <p className="mt-1 text-lg text-slate-300">{tool.tagline}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone="teal">{PRICING_LABEL[tool.pricingModel]}</Badge>
            {tool.freeTierReal && <VerifiedFreeBadge lastVerifiedAt={tool.lastVerifiedAt} />}
            {tool.hasApi && <Badge tone="sun">API</Badge>}
            {tool.isOpenSource && <Badge tone="leaf">Open source</Badge>}
          </div>
        </div>
        <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer nofollow">
          <Button>Visit site ↗</Button>
        </a>
      </header>

      {/* Trust row */}
      <div className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <FreshnessMeter score={tool.freshnessScore} lastVerifiedAt={tool.lastVerifiedAt} />
        {avg != null && (
          <span className="text-sm text-slate-300">★ {avg.toFixed(1)} ({ratings.length})</span>
        )}
        <span className="text-sm text-slate-500">
          Platforms: {tool.platforms.join(", ") || "—"} · Languages: {tool.languages.join(", ") || "—"}
        </span>
      </div>

      {/* TL;DR */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">TL;DR</h2>
        <p className="mt-2 text-slate-300">{tool.description || tool.tagline}</p>
      </section>

      {/* Pricing */}
      {tool.pricingTiers && tool.pricingTiers.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-xl font-semibold">Pricing</h2>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left text-slate-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Plan</th>
                  <th className="px-4 py-2 font-medium">Price</th>
                  <th className="px-4 py-2 font-medium">Includes</th>
                </tr>
              </thead>
              <tbody>
                {tool.pricingTiers.map((t) => (
                  <tr key={t.id} className="border-t border-white/5">
                    <td className="px-4 py-2 font-medium text-slate-200">{t.name}</td>
                    <td className="px-4 py-2 text-slate-300">
                      {t.priceUsd != null ? `$${t.priceUsd}${t.period ? `/${t.period}` : ""}` : "—"}
                    </td>
                    <td className="px-4 py-2 text-slate-400">{t.features.join(", ") || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tags */}
      {tool.tags.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 text-xl font-semibold">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {tool.tags.map((t) => (
              <Link key={t.slug} href={`/tools?tag=${t.slug}`}>
                <Badge tone="neutral">{t.name}</Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="mt-8">
        <h2 className="mb-3 text-xl font-semibold">FAQ</h2>
        <div className="space-y-3">
          {faqs.map((f) => (
            <Card key={f.q}>
              <CardTitle>{f.q}</CardTitle>
              <CardBody>{f.a}</CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <section className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Alternatives</h2>
            <Link href={`/compare?tools=${[tool.slug, ...alternatives.slice(0, 2).map((a) => a.slug)].join(",")}`} className="text-sm text-teal hover:underline">
              Compare →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {alternatives.map((d) => (
              <ToolCard key={d.id} tool={docToSummary(d)} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
