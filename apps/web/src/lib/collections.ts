// Editor-curated collections. Each is backed by a search query, so they stay
// fresh automatically as the catalog + verification scores change.
export interface Collection {
  slug: string;
  title: string;
  intro: string;
  emoji: string;
  query: string; // querystring passed to /search
}

export const COLLECTIONS: Collection[] = [
  {
    slug: "best-free-ai-tools",
    title: "Best free AI tools",
    intro: "Genuinely free AI tools with a verified, card-free tier — ranked by popularity.",
    emoji: "🆓",
    query: "?free=true&sort=popularity",
  },
  {
    slug: "open-source-ai",
    title: "Open-source AI tools",
    intro: "Self-hostable, open-source AI you can run and own — models, agents, and infra.",
    emoji: "🔓",
    query: "?oss=true&sort=popularity",
  },
  {
    slug: "arabic-ai-tools",
    title: "Arabic-first AI tools",
    intro: "AI tools with first-class Arabic support — chat, translation, and transcription.",
    emoji: "🌍",
    query: "?language=ar&sort=popularity",
  },
  {
    slug: "ai-for-developers",
    title: "AI for developers",
    intro: "Coding assistants, agents, and developer infrastructure to ship faster.",
    emoji: "🛠️",
    query: "?category=developer-tools&sort=popularity",
  },
  {
    slug: "ai-for-video",
    title: "AI for video creators",
    intro: "Generate, edit, and dub video with AI — from script to final cut.",
    emoji: "🎬",
    query: "?category=video&sort=popularity",
  },
  {
    slug: "ai-agents-automation",
    title: "AI agents & automation",
    intro: "Autonomous agents and no-code automation to put AI to work.",
    emoji: "🤖",
    query: "?category=ai-agents&sort=popularity",
  },
  {
    slug: "ai-coding-assistants",
    title: "AI coding assistants",
    intro: "Pair-programmers and AI code editors that understand your codebase.",
    emoji: "💻",
    query: "?category=code&sort=popularity",
  },
  {
    slug: "ai-image-generators",
    title: "AI image generators",
    intro: "Text-to-image and design tools, from open models to studio suites.",
    emoji: "🖼️",
    query: "?category=image&sort=popularity",
  },
];

export function getCollection(slug: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}
