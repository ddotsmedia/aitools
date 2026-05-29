import * as React from "react";
import { cn } from "./cn";

/** 0-100 freshness score from the verification engine → labelled colour bar. */
export interface FreshnessMeterProps extends React.HTMLAttributes<HTMLDivElement> {
  score: number;
  lastVerifiedAt?: string | Date | null;
  showLabel?: boolean;
}

function tier(score: number): { label: string; bar: string; text: string } {
  if (score >= 80) return { label: "Fresh", bar: "bg-leaf", text: "text-leaf" };
  if (score >= 50) return { label: "Aging", bar: "bg-sun", text: "text-sun" };
  if (score >= 25) return { label: "Stale", bar: "bg-amber", text: "text-amber" };
  return { label: "Unverified", bar: "bg-red-500", text: "text-red-400" };
}

export function FreshnessMeter({
  score,
  lastVerifiedAt,
  showLabel = true,
  className,
  ...props
}: FreshnessMeterProps) {
  const pct = Math.max(0, Math.min(100, Math.round(score)));
  const t = tier(pct);
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <div
        className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10"
        role="meter"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Freshness score"
      >
        <div className={cn("h-full rounded-full transition-all", t.bar)} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && (
        <span className={cn("text-xs font-medium tabular-nums", t.text)}>
          {pct} · {t.label}
        </span>
      )}
      {lastVerifiedAt && (
        <span className="text-xs text-slate-500">
          {new Date(lastVerifiedAt).toISOString().slice(0, 10)}
        </span>
      )}
    </div>
  );
}
