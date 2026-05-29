import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@hub/ui";
import { api } from "@/lib/api";

export const metadata: Metadata = {
  title: "All categories",
  description: "Browse verified AI tools by category — writing, image, code, audio, agents, and more.",
  alternates: { canonical: "/categories" },
};
export const revalidate = 300;

const EMOJI: Record<string, string> = {
  writing: "✍️", image: "🖼️", audio: "🎙️", video: "🎬", code: "💻",
  productivity: "⚡", "data-analytics": "📊", "ai-agents": "🤖", search: "🔍",
  transcription: "🗣️", translation: "🌐", chatbots: "💬", marketing: "📣",
  design: "🎨", research: "🔬", "customer-support": "🎧", security: "🔒",
  education: "🎓", healthcare: "🩺", "developer-tools": "🛠️",
};

export default async function CategoriesPage() {
  const cats = (await api.categories().catch(() => []))
    .filter((c) => c._count.tools > 0)
    .sort((a, b) => b._count.tools - a._count.tools);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Browse by category</h1>
      <p className="mt-1 text-slate-400">{cats.length} categories of verified AI tools.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cats.map((c) => (
          <Link key={c.slug} href={`/category/${c.slug}`}>
            <Card interactive className="h-full">
              <div className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">{EMOJI[c.slug] ?? "🧩"}</span>
                <div>
                  <p className="font-semibold text-slate-50">{c.name}</p>
                  <p className="text-xs text-slate-500">{c._count.tools} tools</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
