import type { Metadata } from "next";
// GEO-structured: TL;DR→claims→FAQ→data table. JSON-LD: SoftwareApplication+Review+FAQPage.
async function getTool(_slug: string) {
  // P2/P3: fetch from @hub/api. null→notFound()
  return null as any;
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug, description: "AI tool overview, pricing, alternatives." };
}
export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = await getTool(slug);
  const ld = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool?.name ?? slug,
    applicationCategory: "AIApplication",
  };
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      {/* P3: TL;DR, pricing table, verified-free badge, alternatives, FAQ */}
    </main>
  );
}
