import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardTitle, CardBody, Button } from "@hub/ui";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with AI Tools Hub — submit a tool, report an issue, or partner with us.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="text-3xl font-bold">Contact</h1>
      <p className="mt-3 text-slate-400">We read everything. Pick what fits.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardTitle>Submit a tool</CardTitle>
          <CardBody>List your AI tool — we draft and verify it before publishing.</CardBody>
          <div className="mt-3"><Link href="/submit"><Button size="sm">Submit →</Button></Link></div>
        </Card>
        <Card>
          <CardTitle>Report an issue</CardTitle>
          <CardBody>Wrong pricing, dead link, or a tool that changed? Tell us and we re-verify.</CardBody>
          <div className="mt-3">
            <a href="mailto:hello@ddotsmedia.com"><Button size="sm" variant="outline">Email us</Button></a>
          </div>
        </Card>
      </div>
      <p className="mt-6 text-sm text-slate-500">General: hello@ddotsmedia.com</p>
    </main>
  );
}
