import * as React from "react";
import type { ToolSummary } from "@hub/types";
import { cn } from "./cn";
import { VerifiedFreeBadge } from "./VerifiedFreeBadge";

const PRICING_LABEL: Record<ToolSummary["pricingModel"], string> = {
  FREE: "Free",
  FREEMIUM: "Freemium",
  PAID: "Paid",
  SUBSCRIPTION: "Subscription",
  USAGE_BASED: "Usage-based",
  OPEN_SOURCE: "Open source",
  CONTACT: "Contact sales",
};

const PALETTE = ["#2a9aa4", "#f5b21a", "#ef7e1a", "#3fae57", "#38bdf8", "#fb7185", "#22d3ee", "#a3e635", "#fbbf24", "#60a5fa"];
function accentFor(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function freshColor(score: number): string {
  if (score >= 80) return "#3fae57";
  if (score >= 50) return "#f5b21a";
  if (score >= 25) return "#ef7e1a";
  return "#ef4444";
}

function FreshnessArc({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(score)));
  const r = 15;
  const c = 2 * Math.PI * r;
  const color = freshColor(pct);
  return (
    <div className="relative grid h-10 w-10 flex-shrink-0 place-items-center" title={`Freshness ${pct}/100`}>
      <svg viewBox="0 0 36 36" className="h-10 w-10 -rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="3" />
        <circle
          cx="18" cy="18" r={r} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c}
        />
      </svg>
      <span className="absolute font-mono text-[10px] font-medium tabular-nums text-slate-300">{pct}</span>
    </div>
  );
}

export interface ToolCardProps {
  tool: ToolSummary;
  href?: string;
}

export function ToolCard({ tool, href = `/tools/${tool.slug}` }: ToolCardProps) {
  const cat = tool.categories[0] ?? "";
  const accent = accentFor(cat);
  return (
    <a
      href={href}
      data-slug={tool.slug}
      data-category={cat}
      className={cn(
        "tool-card group relative flex gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] py-4 pl-5 pr-4",
        "transition-all duration-200 hover:-translate-y-1",
      )}
      style={{ "--accent": accent } as React.CSSProperties}
    >
      {/* category accent bar */}
      <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: accent }} aria-hidden="true" />

      {/* favicon */}
      <span
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/[0.06] shadow-lg shadow-black/30 ring-1 ring-inset ring-white/10"
      >
        {tool.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tool.logoUrl} alt="" className="h-7 w-7 object-contain" />
        ) : (
          <span className="text-sm font-bold" style={{ color: accent }}>{tool.name.slice(0, 2).toUpperCase()}</span>
        )}
      </span>

      {/* content */}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-start justify-between gap-2">
          <span className="truncate font-semibold text-slate-50">{tool.name}</span>
          <FreshnessArc score={tool.freshnessScore} />
        </span>
        <span className="mt-0.5 line-clamp-2 text-sm text-slate-400">{tool.tagline}</span>
        <span className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-medium"
            style={{ background: `${accent}22`, color: accent }}
          >
            {PRICING_LABEL[tool.pricingModel]}
          </span>
          {tool.freeTierReal && <VerifiedFreeBadge />}
          {cat && (
            <span className="rounded-full bg-white/8 px-2 py-0.5 text-[11px] font-medium text-slate-300">{cat}</span>
          )}
        </span>
      </span>
    </a>
  );
}
