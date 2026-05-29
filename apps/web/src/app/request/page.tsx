"use client";
import { useEffect, useState } from "react";
import { Button, Badge, Card } from "@hub/ui";
import { API_BASE } from "@/lib/api";

interface Req { id: string; name: string; website: string; category: string; reason: string; votes: number }
const KEY = "toolRequests";
const VOTED = "toolRequestVotes";

function load(): Req[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function votedSet(): string[] {
  try { return JSON.parse(localStorage.getItem(VOTED) || "[]"); } catch { return []; }
}

export default function RequestPage() {
  const [cats, setCats] = useState<{ slug: string; name: string }[]>([]);
  const [reqs, setReqs] = useState<Req[]>([]);
  const [voted, setVoted] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", website: "", category: "", reason: "" });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/categories`).then((r) => r.json()).then((c) => setCats(c.map((x: { slug: string; name: string }) => ({ slug: x.slug, name: x.name })))).catch(() => {});
    setReqs(load());
    setVoted(votedSet());
  }, []);

  function persist(next: Req[]) { setReqs(next); localStorage.setItem(KEY, JSON.stringify(next)); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.website) return;
    const r: Req = { id: `${Date.now()}`, ...form, reason: form.reason.slice(0, 200), votes: 1 };
    persist([r, ...reqs]);
    setVoted([...voted, r.id]);
    localStorage.setItem(VOTED, JSON.stringify([...voted, r.id]));
    setForm({ name: "", website: "", category: "", reason: "" });
    setSent(true);
    fetch("/requests", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type: "request", ...r }) }).catch(() => {});
  }

  function upvote(id: string) {
    if (voted.includes(id)) return;
    persist(reqs.map((r) => (r.id === id ? { ...r, votes: r.votes + 1 } : r)));
    const v = [...voted, id];
    setVoted(v);
    localStorage.setItem(VOTED, JSON.stringify(v));
  }

  const sorted = [...reqs].sort((a, b) => b.votes - a.votes);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Badge tone="teal" className="mb-3">Community</Badge>
      <h1 className="font-display text-4xl font-extrabold text-slate-50">Request a Tool</h1>
      <p className="mt-2 text-slate-400">Missing a tool? Request it — the community upvotes what gets added next.</p>

      <Card className="mt-8">
        <form onSubmit={submit} className="space-y-3">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tool name" className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal focus:outline-none" />
          <input required type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://…" className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal focus:outline-none" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-slate-100 focus:border-teal focus:outline-none">
            <option value="">Select category…</option>
            {cats.map((c) => <option key={c.slug} value={c.name} className="bg-navy">{c.name}</option>)}
          </select>
          <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value.slice(0, 200) })} maxLength={200} rows={3} placeholder="Why should we add it? (max 200 chars)" className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal focus:outline-none" />
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-slate-500">{form.reason.length}/200</span>
            <Button type="submit">Submit request</Button>
          </div>
        </form>
        {sent && <p className="mt-2 text-sm text-leaf">✓ Request added. Thanks!</p>}
      </Card>

      <h2 className="mb-3 mt-10 text-xl font-semibold text-slate-100">Pending requests</h2>
      {sorted.length === 0 ? (
        <p className="text-slate-500">No requests yet — be the first.</p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((r) => (
            <li key={r.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <button
                onClick={() => upvote(r.id)}
                disabled={voted.includes(r.id)}
                className="flex flex-col items-center rounded-lg border border-white/10 px-2 py-1 text-teal disabled:opacity-40"
                aria-label="Upvote"
              >
                <span className="text-xs">▲</span>
                <span className="font-mono text-sm tabular-nums">{r.votes}</span>
              </button>
              <div className="min-w-0">
                <a href={r.website} target="_blank" rel="noreferrer" className="font-medium text-slate-100 hover:text-teal">{r.name}</a>
                {r.category && <span className="ml-2 text-xs text-slate-500">{r.category}</span>}
                {r.reason && <p className="truncate text-sm text-slate-400">{r.reason}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
