import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardTitle, CardBody } from "@hub/ui";
import { COLLECTIONS } from "@/lib/collections";

export const metadata: Metadata = {
  title: "Collections",
  description: "Curated, editor-picked collections of verified AI tools — free, open-source, Arabic, developer, video, and more.",
  alternates: { canonical: "/collections" },
};

export default function CollectionsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Collections</h1>
      <p className="mt-1 text-slate-400">
        Curated sets of verified AI tools. Each stays current as tools are re-verified.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COLLECTIONS.map((c) => (
          <Link key={c.slug} href={`/collections/${c.slug}`}>
            <Card interactive className="h-full">
              <span className="text-3xl" aria-hidden="true">{c.emoji}</span>
              <CardTitle className="mt-2">{c.title}</CardTitle>
              <CardBody>{c.intro}</CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
