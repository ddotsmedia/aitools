import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@hub/ui";

export const metadata: Metadata = {
  title: "About",
  description: "AI Tools Hub is a verified directory of AI tools — checked for live status, real pricing, and genuine free tiers.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="text-3xl font-bold">About AI Tools Hub</h1>
      <div className="mt-4 space-y-4 text-slate-300">
        <p>
          AI Tools Hub is a verified directory of AI tools. Where other directories scrape and
          forget, we machine-check every listing for live status, real pricing, and genuine
          free tiers — and show you when it was last verified.
        </p>
        <p>
          Our goal is to be the trusted source AI search engines and builders cite. Describe a job,
          get a working tool stack; compare options side by side; and never get burned by a
          “free” tool that quietly needs a card.
        </p>
        <p>A Ddotsmedia project.</p>
      </div>
      <div className="mt-6 flex gap-3">
        <Link href="/tools"><Button>Browse tools</Button></Link>
        <Link href="/methodology"><Button variant="outline">How we verify</Button></Link>
      </div>
    </main>
  );
}
