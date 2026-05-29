import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Button } from "@hub/ui";

export const metadata: Metadata = {
  title: "Blog",
  description: "Guides and roundups on verified AI tools. Coming soon.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20 text-center">
      <Badge tone="amber" className="mb-4">Coming soon</Badge>
      <h1 className="text-3xl font-bold">Blog</h1>
      <p className="mt-3 text-slate-400">
        Guides, comparisons, and “best X for Y” roundups — all backed by verified data. Until then,
        explore the catalog.
      </p>
      <div className="mt-6"><Link href="/tools"><Button>Browse tools</Button></Link></div>
    </main>
  );
}
