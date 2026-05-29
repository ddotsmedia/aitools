"use client";
import * as React from "react";
import { cn } from "./cn";

const MAX = 4;
interface Ctx { selected: string[]; toggle: (slug: string) => void; clear: () => void; has: (s: string) => boolean; full: boolean }
const CompareCtx = React.createContext<Ctx | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = React.useState<string[]>([]);
  const toggle = React.useCallback((slug: string) => {
    setSelected((cur) => (cur.includes(slug) ? cur.filter((s) => s !== slug) : cur.length >= MAX ? cur : [...cur, slug]));
  }, []);
  const clear = React.useCallback(() => setSelected([]), []);
  const value: Ctx = {
    selected,
    toggle,
    clear,
    has: (s) => selected.includes(s),
    full: selected.length >= MAX,
  };
  return <CompareCtx.Provider value={value}>{children}</CompareCtx.Provider>;
}

function useCompare(): Ctx | null {
  return React.useContext(CompareCtx);
}

export function CompareCheckbox({ slug, className }: { slug: string; className?: string }) {
  const ctx = useCompare();
  if (!ctx) return null;
  const checked = ctx.has(slug);
  const disabled = !checked && ctx.full;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={checked ? "Remove from compare" : "Add to compare"}
      title={disabled ? "Max 4" : "Compare"}
      disabled={disabled}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); ctx.toggle(slug); }}
      className={cn(
        "absolute right-2 top-2 z-10 flex items-center gap-1 rounded-lg border px-1.5 py-0.5 text-[11px] font-medium backdrop-blur transition-all",
        checked ? "border-teal/60 bg-teal/20 text-teal opacity-100" : "border-white/15 bg-navy/70 text-slate-400 opacity-0 hover:text-slate-100 group-hover:opacity-100",
        disabled && "cursor-not-allowed opacity-40",
        className,
      )}
    >
      <span className={cn("grid h-3.5 w-3.5 place-items-center rounded border", checked ? "border-teal bg-teal text-navy" : "border-white/30")}>
        {checked ? "✓" : ""}
      </span>
      Compare
    </button>
  );
}

export function CompareBar() {
  const ctx = useCompare();
  if (!ctx || ctx.selected.length < 2) return null;
  const href = `/compare?tools=${ctx.selected.join(",")}`;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4">
      <div className="flex w-full max-w-2xl items-center gap-3 rounded-2xl border border-white/15 bg-navy/95 px-4 py-3 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <span className="text-sm text-slate-200">
          <span className="font-mono font-semibold text-teal">{ctx.selected.length}</span> tools selected
        </span>
        <button onClick={ctx.clear} className="text-xs text-slate-500 hover:text-slate-300">Clear</button>
        <a
          href={href}
          className="ml-auto rounded-xl bg-teal px-4 py-1.5 text-sm font-semibold text-navy transition-colors hover:bg-teal/90"
        >
          Compare now →
        </a>
      </div>
    </div>
  );
}
