"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Badge } from "@hub/ui";
import { API_BASE, type ToolDoc } from "@/lib/api";

export interface PickerSeed {
  slug: string;
  name: string;
}

/** Search + add/remove tools, then jump to /compare?tools=... */
export function ComparePicker({ selected: initial }: { selected: PickerSeed[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<PickerSeed[]>(initial);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ToolDoc[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}&take=8`);
        const data = await res.json();
        setResults(data.items ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      }
    }, 250);
  }, [q]);

  const slugs = selected.map((s) => s.slug);

  function add(t: ToolDoc) {
    if (slugs.includes(t.slug) || selected.length >= 4) return;
    setSelected([...selected, { slug: t.slug, name: t.name }]);
    setQ("");
    setResults([]);
    setOpen(false);
  }
  function remove(slug: string) {
    setSelected(selected.filter((s) => s.slug !== slug));
  }
  function go() {
    if (selected.length >= 2) router.push(`/compare?tools=${slugs.join(",")}`);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {selected.length === 0 && <span className="text-sm text-slate-500">No tools selected yet.</span>}
        {selected.map((s) => (
          <span key={s.slug} className="inline-flex items-center gap-1 rounded-full bg-teal/15 px-3 py-1 text-sm text-teal">
            {s.name}
            <button onClick={() => remove(s.slug)} aria-label={`Remove ${s.name}`} className="ml-1 text-teal/70 hover:text-teal">×</button>
          </span>
        ))}
      </div>

      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => results.length && setOpen(true)}
            placeholder={selected.length >= 4 ? "Max 4 tools" : "Search a tool to add…"}
            disabled={selected.length >= 4}
            className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal focus:outline-none disabled:opacity-50"
          />
          {open && results.length > 0 && (
            <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-white/15 bg-navy/95 p-1 shadow-xl backdrop-blur">
              {results.map((t) => {
                const added = slugs.includes(t.slug);
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => add(t)}
                      disabled={added}
                      className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5 disabled:opacity-40"
                    >
                      <span className="min-w-0">
                        <span className="font-medium text-slate-100">{t.name}</span>
                        <span className="ml-2 text-xs text-slate-500">{t.categoryNames?.[0]}</span>
                      </span>
                      <span className="text-teal">{added ? "✓" : "+ Add"}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <Button onClick={go} disabled={selected.length < 2}>Compare {selected.length >= 2 ? `(${selected.length})` : ""}</Button>
      </div>
      {selected.length === 1 && <p className="mt-2 text-xs text-slate-500">Add at least one more tool to compare.</p>}
    </div>
  );
}
