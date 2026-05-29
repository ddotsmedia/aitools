import * as React from "react";
import type { ToolSummary } from "@hub/types";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { VerifiedFreeBadge } from "./VerifiedFreeBadge";
import { FreshnessMeter } from "./FreshnessMeter";

const PRICING_LABEL: Record<ToolSummary["pricingModel"], string> = {
  FREE: "Free",
  FREEMIUM: "Freemium",
  PAID: "Paid",
  SUBSCRIPTION: "Subscription",
  USAGE_BASED: "Usage-based",
  OPEN_SOURCE: "Open source",
  CONTACT: "Contact sales",
};

export interface ToolCardProps {
  tool: ToolSummary;
  href?: string;
}

export function ToolCard({ tool, href = `/tools/${tool.slug}` }: ToolCardProps) {
  return (
    <Card interactive className="flex flex-col gap-3">
      <a href={href} className="flex items-start gap-3">
        {tool.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tool.logoUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
        ) : (
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal/15 text-sm font-bold text-teal">
            {tool.name.slice(0, 2).toUpperCase()}
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate font-semibold text-slate-50">{tool.name}</span>
          <span className="line-clamp-2 text-sm text-slate-400">{tool.tagline}</span>
        </span>
      </a>

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone="teal">{PRICING_LABEL[tool.pricingModel]}</Badge>
        {tool.freeTierReal && <VerifiedFreeBadge />}
        {tool.categories.slice(0, 1).map((c) => (
          <Badge key={c}>{c}</Badge>
        ))}
      </div>

      <FreshnessMeter score={tool.freshnessScore} className="mt-auto" />
    </Card>
  );
}
