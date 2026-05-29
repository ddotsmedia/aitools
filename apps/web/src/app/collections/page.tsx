import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Button } from "@hub/ui";

export const metadata: Metadata = {
  title: "Collections",
  description: "Curated, editor-picked collections of verified AI tools. Coming soon.",
};

export default function CollectionsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20 text-center">
      <Badge tone="amber" className="mb-4">Coming soon</Badge>
      <h1 className="text-3xl font-bold">Collections</h1>
      <p className="mt-3 text-slate-400">
        Curated, editor-picked sets — “best free Arabic AI tools”, “open-source agent stacks”, and
        more. For now, explore everything in the catalog.
      </p>
      <div className="mt-6">
        <Link href="/tools"><Button>Browse all tools</Button></Link>
      </div>
    </main>
  );
}
