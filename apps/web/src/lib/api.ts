// Thin API client for the NestJS backend. Server components call this directly.
import type { ToolSummary, PricingModel } from "@hub/types";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4020";

export interface ApiTool {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  logoUrl?: string | null;
  status: string;
  pricingModel: string;
  freeTierReal: boolean;
  hasApi: boolean;
  isOpenSource: boolean;
  platforms: string[];
  languages: string[];
  freshnessScore: number;
  lastVerifiedAt?: string | null;
  foundedYear?: number | null;
  categories: { slug: string; name: string }[];
  tags: { slug: string; name: string }[];
  pricingTiers?: { id: string; name: string; priceUsd?: number | null; period?: string | null; features: string[] }[];
  reviews?: { rating: number }[];
}

export interface ToolList {
  items: ApiTool[];
  total: number;
}

/** A document as stored in Meili (search/browse results). */
export interface ToolDoc {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  pricingModel: PricingModel;
  freeTierReal: boolean;
  hasApi: boolean;
  isOpenSource: boolean;
  platforms: string[];
  languages: string[];
  categories: string[];
  categoryNames: string[];
  tags: string[];
  freshnessScore: number;
  popularity: number;
  logoUrl?: string | null;
}

export type FacetDistribution = Record<string, Record<string, number>>;

export interface SearchResult {
  items: ToolDoc[];
  total: number;
  facets: FacetDistribution;
  engine: "meili" | "db";
}

export interface CompareTool extends ApiTool {
  rating: number | null;
  reviewCount: number;
}

async function get<T>(path: string, revalidate = 30): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { next: { revalidate } });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

/** Map a search document to the @hub/ui ToolCard shape. */
export function docToSummary(d: ToolDoc): ToolSummary {
  return {
    id: d.id,
    slug: d.slug,
    name: d.name,
    tagline: d.tagline,
    pricingModel: d.pricingModel,
    freeTierReal: d.freeTierReal,
    freshnessScore: d.freshnessScore,
    categories: d.categoryNames,
    tags: d.tags,
    logoUrl: d.logoUrl ?? undefined,
  };
}

export const api = {
  search: (qs = "") => get<SearchResult>(`/search${qs}`, 30),
  getTool: (slug: string) => get<ApiTool>(`/tools/${slug}`, 60),
  compare: (slugs: string[]) =>
    get<CompareTool[]>(`/compare?tools=${encodeURIComponent(slugs.join(","))}`, 60),
  categories: () =>
    get<{ slug: string; name: string; _count: { tools: number } }[]>("/categories", 300),
  tags: () => get<{ slug: string; name: string; _count: { tools: number } }[]>("/tags", 300),
};
