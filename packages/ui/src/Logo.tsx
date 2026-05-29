import * as React from "react";
import { cn } from "./cn";

/** Ddotsmedia four-dot mark + wordmark. */
export function Logo({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-bold tracking-tight", className)} {...props}>
      <span className="grid grid-cols-2 gap-0.5" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-teal" />
        <span className="h-2 w-2 rounded-full bg-sun" />
        <span className="h-2 w-2 rounded-full bg-amber" />
        <span className="h-2 w-2 rounded-full bg-leaf" />
      </span>
      <span className="text-slate-50">
        AI&nbsp;Tools&nbsp;<span className="text-teal">Hub</span>
      </span>
    </span>
  );
}
