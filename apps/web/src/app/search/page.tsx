import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
type SP = Record<string, string | string[] | undefined>;

// The hero + quick links post here; browse lives at /tools. Forward the query.
export default async function SearchRedirect({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const s = Array.isArray(v) ? v[0] : v;
    if (s) qs.set(k, s);
  }
  const q = qs.toString();
  redirect(`/tools${q ? `?${q}` : ""}`);
}
