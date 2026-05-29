"use client";
import { useState } from "react";
import { Button, Card, CardTitle, CardBody, Badge } from "@hub/ui";
import { API_BASE } from "@/lib/api";

export default function SubmitPage() {
  const [name, setName] = useState("");
  const [websiteUrl, setUrl] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    setMsg("");
    try {
      const res = await fetch(`${API_BASE}/tools`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, websiteUrl }),
      });
      if (!res.ok) throw new Error((await res.json())?.message ?? `Error ${res.status}`);
      const tool = await res.json();
      setState("done");
      setMsg(`Submitted "${tool.name}". It’s pending AI enrichment and human review.`);
      setName("");
      setUrl("");
    } catch (err) {
      setState("error");
      setMsg(String((err as Error).message));
    }
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <Badge tone="teal" className="mb-4">Submit a tool</Badge>
      <h1 className="text-3xl font-bold">Add an AI tool</h1>
      <p className="mt-2 text-slate-400">
        We’ll auto-draft a listing from the URL, then a human reviews it before publishing.
        Nothing goes live unverified.
      </p>

      <Card className="mt-8">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Tool name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Whisper Arabic"
              className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Website URL</label>
            <input
              required
              type="url"
              value={websiteUrl}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal focus:outline-none"
            />
          </div>
          <Button type="submit" disabled={state === "saving"} className="w-full">
            {state === "saving" ? "Submitting…" : "Submit for review"}
          </Button>
        </form>
        {msg && (
          <CardBody className={state === "error" ? "text-amber" : "text-leaf"}>{msg}</CardBody>
        )}
      </Card>

      <Card className="mt-4">
        <CardTitle>What happens next</CardTitle>
        <CardBody>
          1. AI drafts tagline, description, category, pricing. 2. A moderator verifies and
          approves. 3. The verification engine begins live-checking status &amp; pricing.
        </CardBody>
      </Card>
    </main>
  );
}
