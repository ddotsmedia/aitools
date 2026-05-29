// Thin API client for the NestJS backend. Server components call this directly.
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
  freshnessScore: number;
  lastVerifiedAt?: string | null;
  categories: { slug: string; name: string }[];
  tags: { slug: string; name: string }[];
}

export interface ToolList {
  items: ApiTool[];
  total: number;
}

async function get<T>(path: string, revalidate = 30): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { next: { revalidate } });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  listTools: (qs = "") => get<ToolList>(`/tools${qs}`),
  getTool: (slug: string) => get<ApiTool>(`/tools/${slug}`, 60),
  categories: () => get<{ slug: string; name: string; _count: { tools: number } }[]>("/categories", 300),
  tags: () => get<{ slug: string; name: string; _count: { tools: number } }[]>("/tags", 300),
};
