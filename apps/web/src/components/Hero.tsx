"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@hub/ui";

const WORDS = ["job", "task", "problem", "workflow"];
const POPULAR = ["ChatGPT alternatives", "Free image AI", "Arabic voice tools", "Code assistants"];

function useCountUp(target: number, ms = 1200): number {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!target) return;
    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min((t - start) / ms, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return n;
}

function Counter({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const n = useCountUp(value);
  return (
    <div className="text-center">
      <div className="counter-glow font-mono text-2xl font-medium tabular-nums text-teal sm:text-3xl">
        {n.toLocaleString()}{suffix}
      </div>
      <div className="mt-1 font-mono text-[11px] uppercase tracking-widest text-slate-500">{label}</div>
    </div>
  );
}

export function Hero({ total, categories }: { total: number; categories: number }) {
  const [wi, setWi] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const id = setInterval(() => setWi((v) => (v + 1) % WORDS.length), 2200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section className="hero-grid relative overflow-hidden border-b border-white/5">
      <div className="relative mx-auto max-w-4xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-teal/20 bg-teal/5 px-3 py-1 font-mono text-xs text-teal">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal" />
          machine-verified · re-checked every 12h
        </span>

        {/* Headline with cycling word */}
        <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-50 sm:text-6xl md:text-7xl">
          Find the right AI tool
          <br />
          for every{" "}
          <span className="relative inline-block text-teal">
            <span key={wi} className="word-swap inline-block">{WORDS[wi]}</span>
            <span className="invisible" aria-hidden="true">workflow</span>
            <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-teal to-sun" />
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
          Describe what you need — get a verified, working tool stack. Every listing checked for
          live status, real pricing, and genuine free tiers.
        </p>

        {/* Command-palette search */}
        <form action="/stack" className="mx-auto mt-9 max-w-2xl">
          <div className="group flex items-center gap-3 rounded-2xl border border-white/12 bg-charcoal/80 px-4 py-3 shadow-2xl shadow-black/40 ring-1 ring-inset ring-white/5 transition focus-within:border-teal/50 focus-within:ring-teal/30">
            <svg width="18" height="18" viewBox="0 0 18 18" className="flex-shrink-0 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="8" cy="8" r="5.5" /><path d="m16 16-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              name="q"
              autoComplete="off"
              placeholder="Transcribe Arabic meetings, then summarise…"
              className="min-w-0 flex-1 bg-transparent font-mono text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
            <kbd className="hidden flex-shrink-0 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[11px] text-slate-400 sm:block">⌘K</kbd>
            <Button type="submit" size="sm" className="flex-shrink-0">Build →</Button>
          </div>
        </form>

        {/* Popular */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 font-mono text-xs">
          <span className="text-slate-600">popular:</span>
          {POPULAR.map((q) => (
            <a
              key={q}
              href={`/search?q=${encodeURIComponent(q)}`}
              className="rounded-full border border-white/8 px-2.5 py-1 text-slate-400 transition-colors hover:border-teal/40 hover:text-teal"
            >
              {q}
            </a>
          ))}
        </div>

        {/* Glowing counters */}
        <div className="mx-auto mt-12 flex max-w-lg items-center justify-center gap-8 sm:gap-14">
          <Counter value={total} label="verified tools" />
          <div className="h-10 w-px bg-white/10" />
          <Counter value={categories} label="categories" />
          <div className="h-10 w-px bg-white/10" />
          <div className="text-center">
            <div className="counter-glow font-mono text-2xl font-medium text-teal sm:text-3xl">12h</div>
            <div className="mt-1 font-mono text-[11px] uppercase tracking-widest text-slate-500">re-verified</div>
          </div>
        </div>
      </div>
    </section>
  );
}
