"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Badge, Card, CardBody } from "@hub/ui";
import { API_BASE, type StackResult } from "@/lib/api";

const EXAMPLES = [
  "Transcribe Arabic meetings, then summarise to a report",
  "Generate a product video from a script with voiceover",
  "Build a RAG chatbot over my company docs",
  "Write SEO blog posts with images",
];

function StackBuilder() {
  const params = useSearchParams();
  const initial = params.get("goal") ?? params.get("q") ?? "";
  const [goal, setGoal] = useState(initial);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(initial ? "loading" : "idle");
  const [result, setResult] = useState<StackResult | null>(null);

  async function run(g: string) {
    if (g.trim().length < 3) return;
    setState("loading");
    try {
      const res = await fetch(`${API_BASE}/recommend`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ goal: g }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setResult(await res.json());
      setState("done");
    } catch {
      setState("error");
    }
  }

  // Auto-run once if arrived with ?goal= / ?q=
  useEffect(() => {
    if (initial) void run(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <Badge tone="sun" className="mb-3">Stack Builder</Badge>
      <h1 className="text-3xl font-bold">Describe a goal — get a tool stack</h1>
      <p className="mt-2 text-slate-400">
        Tell us what you&apos;re trying to do. We assemble a working stack from verified tools.
      </p>

      <form
        onSubmit={(e) => { e.preventDefault(); void run(goal); }}
        className="mt-6"
      >
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={3}
          placeholder="e.g. Transcribe Arabic meetings, then summarise to a report"
          className="w-full rounded-xl border border-white/15 bg-white/5 p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal focus:outline-none"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => { setGoal(ex); void run(ex); }}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400 hover:border-teal/40 hover:text-teal"
              >
                {ex.length > 38 ? ex.slice(0, 38) + "…" : ex}
              </button>
            ))}
          </div>
          <Button type="submit" disabled={state === "loading"}>
            {state === "loading" ? "Building…" : "Build stack"}
          </Button>
        </div>
      </form>

      {state === "error" && (
        <p className="mt-6 text-amber">Couldn&apos;t build a stack right now. Try again.</p>
      )}

      {state === "done" && result && (
        <section className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-xl font-semibold">Your stack</h2>
            {result.engine === "claude" && <Badge tone="teal">AI-picked</Badge>}
          </div>
          {result.stack.length === 0 ? (
            <p className="text-slate-400">No match found. Try rephrasing, or <Link href="/tools" className="text-teal hover:underline">browse tools</Link>.</p>
          ) : (
            <ol className="space-y-3">
              {result.stack.map((s, i) => (
                <li key={s.slug}>
                  <Card className="flex gap-4">
                    <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-teal/15 text-sm font-bold text-teal">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/tools/${s.slug}`} className="font-semibold text-slate-50 hover:text-teal">
                          {s.name}
                        </Link>
                        <Badge tone="neutral">{s.role}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">{s.why}</p>
                    </div>
                  </Card>
                </li>
              ))}
            </ol>
          )}
          {result.stack.length > 0 && (
            <>
              <Card className="mt-4"><CardBody>{result.notes}</CardBody></Card>
              <div className="mt-4 flex gap-3">
                <Link href={`/compare?tools=${result.stack.map((s) => s.slug).join(",")}`}>
                  <Button variant="outline" size="sm">Compare these</Button>
                </Link>
              </div>
            </>
          )}
        </section>
      )}
    </main>
  );
}

export default function StackPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-3xl px-6 py-14"><h1 className="text-3xl font-bold">Stack Builder</h1></main>}>
      <StackBuilder />
    </Suspense>
  );
}
