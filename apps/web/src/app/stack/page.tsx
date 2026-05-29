import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Button } from "@hub/ui";

export const metadata: Metadata = {
  title: "Stack Builder",
  description: "Describe a goal, get a wired multi-tool AI stack. Coming soon.",
};

export default function StackPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20 text-center">
      <Badge tone="sun" className="mb-4">Coming in the AI layer</Badge>
      <h1 className="text-3xl font-bold">Stack Builder</h1>
      <p className="mt-3 text-slate-400">
        Describe a job — e.g. “transcribe Arabic meetings, then summarise to a report” — and get a
        verified, wired multi-tool stack with integration notes. Landing here next.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/tools"><Button>Browse tools</Button></Link>
        <Link href="/compare"><Button variant="outline">Compare tools</Button></Link>
      </div>
    </main>
  );
}
