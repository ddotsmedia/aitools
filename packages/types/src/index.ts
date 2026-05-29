export type PricingModel = "FREE"|"FREEMIUM"|"PAID"|"SUBSCRIPTION"|"USAGE_BASED"|"OPEN_SOURCE"|"CONTACT";
export interface ToolSummary {
  id: string; slug: string; name: string; tagline: string;
  pricingModel: PricingModel; freeTierReal: boolean; freshnessScore: number;
  categories: string[]; tags: string[]; logoUrl?: string;
}
