import * as React from "react";
import { cn } from "./cn";

/**
 * Signals a machine-verified genuine free tier (no card required).
 * Only render when freeTierReal === true — never assume.
 */
export interface VerifiedFreeBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  lastVerifiedAt?: string | Date | null;
}

export function VerifiedFreeBadge({ lastVerifiedAt, className, ...props }: VerifiedFreeBadgeProps) {
  const title = lastVerifiedAt
    ? `Free tier verified ${new Date(lastVerifiedAt).toISOString().slice(0, 10)}`
    : "Free tier machine-verified";
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-leaf/15 px-2.5 py-0.5 text-xs font-semibold text-leaf ring-1 ring-inset ring-leaf/40",
        className,
      )}
      {...props}
    >
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
        <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 0 1 1.4-1.4l3.3 3.3 6.8-6.8a1 1 0 0 1 1.4 0Z" />
      </svg>
      Verified Free
    </span>
  );
}
