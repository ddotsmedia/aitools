import * as React from "react";
import { cn } from "./cn";

type Tone = "neutral" | "teal" | "sun" | "amber" | "leaf";

const TONES: Record<Tone, string> = {
  neutral: "bg-white/8 text-slate-200 ring-white/15",
  teal: "bg-teal/15 text-teal ring-teal/30",
  sun: "bg-sun/15 text-sun ring-sun/30",
  amber: "bg-amber/15 text-amber ring-amber/30",
  leaf: "bg-leaf/15 text-leaf ring-leaf/30",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
