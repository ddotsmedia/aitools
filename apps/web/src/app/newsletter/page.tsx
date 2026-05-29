"use client";
import { useState } from "react";
import { Button, Badge, Card, CardBody } from "@hub/ui";

export default function NewsletterPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: "subscribe", email }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-20">
      <Badge tone="sun" className="mb-4">Newsletter</Badge>
      <h1 className="font-display text-4xl font-extrabold text-slate-50">Weekly AI Tools Digest</h1>
      <p className="mt-3 text-slate-400">New tools, price changes, and verification updates — every Tuesday.</p>

      {status === "done" ? (
        <div className="mt-8 rounded-2xl border border-leaf/30 bg-leaf/10 px-5 py-6 text-leaf">
          ✓ You&apos;re in. Check your inbox Tuesday.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="h-12 flex-1 rounded-xl border border-white/15 bg-white/5 px-4 font-mono text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal focus:outline-none"
          />
          <Button type="submit" size="lg" disabled={status === "loading"}>
            {status === "loading" ? "Subscribing…" : "Subscribe"}
          </Button>
        </form>
      )}
      {status === "error" && <p className="mt-2 text-sm text-amber">Something went wrong — try again.</p>}

      <div className="mt-8 grid gap-3">
        {[
          ["🆕", "New tools first", "The freshest verified AI tools, before they trend."],
          ["💰", "Price & plan changes", "Know when a tool's pricing or free tier changes."],
          ["✅", "Verification updates", "What went offline, came back, or got re-checked."],
        ].map(([icon, t, b]) => (
          <Card key={t}>
            <p className="font-semibold text-slate-100"><span className="mr-2">{icon}</span>{t}</p>
            <CardBody>{b}</CardBody>
          </Card>
        ))}
      </div>
    </main>
  );
}
