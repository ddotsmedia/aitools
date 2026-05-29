import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardTitle, CardBody } from "@hub/ui";
import useCases from "../../../../../data/use-cases.json";

export const metadata: Metadata = {
  title: "AI tools by use case",
  description: "Find the best AI tools for what you want to do — by use case, verified and compared.",
  alternates: { canonical: "/use-cases" },
};

export default function UseCasesIndex() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">What do you want to do?</h1>
      <p className="mt-1 text-slate-400">Pick a use case — we&apos;ll show the verified AI tools for it.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {useCases.map((u) => (
          <Link key={u.slug} href={`/use-cases/${u.slug}`}>
            <Card interactive className="h-full">
              <CardTitle>{u.title}</CardTitle>
              <CardBody>{u.description}</CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
