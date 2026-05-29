import { PrismaClient, PricingModel, ToolStatus } from "@prisma/client";

const prisma = new PrismaClient();
const P = PricingModel;

function slugify(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const CATEGORIES = [
  "Writing", "Image", "Audio", "Video", "Code", "Productivity", "Data & Analytics",
  "AI Agents", "Search", "Transcription", "Translation", "Chatbots", "Marketing",
  "Design", "Research", "Customer Support", "Security", "Education", "Healthcare",
  "Developer Tools",
];

const TAGS = [
  "arabic", "open-source", "api", "enterprise", "no-code", "realtime", "multimodal",
  "self-hosted", "voice", "summarization", "rag", "agents", "image-gen", "tts", "stt",
  "coding", "seo", "analytics", "translation", "chatbot", "llm", "video", "music", "models",
];

type Seed = {
  name: string;
  url: string;
  cat: string;
  pricing: PricingModel;
  free: boolean; // freeTierReal — genuine no-card free tier (seed estimate, re-verified in P5)
  api: boolean;
  oss: boolean;
  ar?: boolean; // first-class Arabic support
  tags: string[];
  tagline: string;
  desc: string;
};

// Real, well-known AI tools. freeTierReal reflects a known card-free tier at seed time;
// the P5 verification engine re-checks and corrects these.
const TOOLS: Seed[] = [
  { name: "ChatGPT", url: "https://chatgpt.com", cat: "Chatbots", pricing: P.FREEMIUM, free: true, api: true, oss: false, ar: true, tags: ["chatbot", "llm", "assistant"], tagline: "Conversational AI assistant from OpenAI.", desc: "ChatGPT is OpenAI's conversational assistant for writing, coding, analysis, and Q&A, with a free tier and paid Plus/Team plans." },
  { name: "Claude", url: "https://claude.ai", cat: "Chatbots", pricing: P.FREEMIUM, free: true, api: true, oss: false, ar: true, tags: ["chatbot", "llm", "assistant"], tagline: "Helpful, harmless AI assistant by Anthropic.", desc: "Claude is Anthropic's assistant known for long-context reasoning, writing, and coding, available free and via Pro and API." },
  { name: "Google Gemini", url: "https://gemini.google.com", cat: "Chatbots", pricing: P.FREEMIUM, free: true, api: true, oss: false, ar: true, tags: ["chatbot", "multimodal", "llm"], tagline: "Google's multimodal AI assistant.", desc: "Gemini is Google's multimodal assistant integrated across Workspace, with free access and paid Advanced tiers." },
  { name: "Perplexity AI", url: "https://www.perplexity.ai", cat: "Search", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["search", "rag", "research"], tagline: "Answer engine with cited web sources.", desc: "Perplexity is an AI answer engine that searches the web and returns sourced, citation-backed answers." },
  { name: "Midjourney", url: "https://www.midjourney.com", cat: "Image", pricing: P.SUBSCRIPTION, free: false, api: false, oss: false, tags: ["image-gen", "design"], tagline: "High-end AI image generation.", desc: "Midjourney generates striking, stylized images from text prompts via Discord and the web; subscription only." },
  { name: "DALL·E 3", url: "https://openai.com/dall-e-3", cat: "Image", pricing: P.USAGE_BASED, free: false, api: true, oss: false, tags: ["image-gen", "api"], tagline: "OpenAI's text-to-image model.", desc: "DALL·E 3 generates images from natural language, available in ChatGPT and via the OpenAI API." },
  { name: "Stable Diffusion", url: "https://stability.ai", cat: "Image", pricing: P.OPEN_SOURCE, free: true, api: true, oss: true, tags: ["image-gen", "open-source", "self-hosted"], tagline: "Open-source text-to-image model.", desc: "Stable Diffusion is an open-weights image model you can run locally or via API; the basis of countless tools." },
  { name: "Leonardo AI", url: "https://leonardo.ai", cat: "Image", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["image-gen", "design"], tagline: "Image generation for game and product art.", desc: "Leonardo AI offers fine-tuned image models and tools aimed at game, product, and concept art, with a free daily tier." },
  { name: "ElevenLabs", url: "https://elevenlabs.io", cat: "Audio", pricing: P.FREEMIUM, free: true, api: true, oss: false, ar: true, tags: ["tts", "voice", "api"], tagline: "Realistic AI voice synthesis & cloning.", desc: "ElevenLabs produces lifelike text-to-speech and voice cloning in many languages, with a free tier and API." },
  { name: "Suno", url: "https://suno.com", cat: "Audio", pricing: P.FREEMIUM, free: true, api: false, oss: false, tags: ["music"], tagline: "Generate full songs from a prompt.", desc: "Suno creates complete songs — vocals and instrumentation — from text prompts, with free daily credits." },
  { name: "Runway", url: "https://runwayml.com", cat: "Video", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["video", "multimodal"], tagline: "AI video generation and editing suite.", desc: "Runway offers text-to-video, video-to-video, and editing tools (Gen-3) with a limited free tier and paid plans." },
  { name: "Synthesia", url: "https://www.synthesia.io", cat: "Video", pricing: P.SUBSCRIPTION, free: false, api: true, oss: false, tags: ["video", "enterprise"], tagline: "AI avatar videos from text.", desc: "Synthesia turns scripts into studio-quality avatar presenter videos in 140+ languages; subscription based." },
  { name: "HeyGen", url: "https://www.heygen.com", cat: "Video", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["video", "avatar"], tagline: "AI spokesperson and avatar videos.", desc: "HeyGen generates talking-avatar and translation videos from text, with a small free tier." },
  { name: "Pika", url: "https://pika.art", cat: "Video", pricing: P.FREEMIUM, free: true, api: false, oss: false, tags: ["video"], tagline: "Idea-to-video generation.", desc: "Pika turns text and images into short AI videos, with free credits to start." },
  { name: "GitHub Copilot", url: "https://github.com/features/copilot", cat: "Code", pricing: P.SUBSCRIPTION, free: false, api: false, oss: false, tags: ["coding", "copilot"], tagline: "AI pair programmer in your editor.", desc: "GitHub Copilot suggests code and whole functions inside your IDE; free for verified students/OSS, otherwise paid." },
  { name: "Cursor", url: "https://www.cursor.com", cat: "Code", pricing: P.FREEMIUM, free: true, api: false, oss: false, tags: ["coding", "editor"], tagline: "The AI-first code editor.", desc: "Cursor is a VS Code-based editor with deep AI: codebase chat, edits, and agents, with a free tier." },
  { name: "Replit", url: "https://replit.com", cat: "Code", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["coding", "no-code"], tagline: "Browser IDE with AI agent.", desc: "Replit is a collaborative online IDE with an AI agent that builds and deploys apps; free tier available." },
  { name: "Codeium", url: "https://codeium.com", cat: "Code", pricing: P.FREEMIUM, free: true, api: false, oss: false, tags: ["coding", "copilot"], tagline: "Free AI code completion & chat.", desc: "Codeium (and Windsurf editor) offers free AI autocomplete and chat across 70+ languages and many IDEs." },
  { name: "Tabnine", url: "https://www.tabnine.com", cat: "Code", pricing: P.FREEMIUM, free: true, api: false, oss: false, tags: ["coding", "enterprise"], tagline: "Privacy-first AI code assistant.", desc: "Tabnine provides AI code completion with on-prem/self-hosted options for enterprises; free basic tier." },
  { name: "Notion AI", url: "https://www.notion.so/product/ai", cat: "Productivity", pricing: P.SUBSCRIPTION, free: false, api: false, oss: false, tags: ["summarization", "no-code"], tagline: "AI inside your Notion workspace.", desc: "Notion AI writes, summarizes, and answers questions over your workspace docs; paid add-on." },
  { name: "Jasper", url: "https://www.jasper.ai", cat: "Writing", pricing: P.SUBSCRIPTION, free: false, api: true, oss: false, tags: ["seo", "marketing", "enterprise"], tagline: "AI copywriting for marketing teams.", desc: "Jasper generates on-brand marketing copy and campaigns for teams; subscription with a free trial." },
  { name: "Copy.ai", url: "https://www.copy.ai", cat: "Writing", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["marketing", "seo"], tagline: "AI copywriter and GTM workflows.", desc: "Copy.ai writes marketing copy and automates go-to-market workflows, with a free plan." },
  { name: "Grammarly", url: "https://www.grammarly.com", cat: "Writing", pricing: P.FREEMIUM, free: true, api: false, oss: false, tags: ["summarization"], tagline: "AI writing and grammar assistant.", desc: "Grammarly checks grammar, tone, and clarity and now drafts/rewrites with generative AI; robust free tier." },
  { name: "DeepL", url: "https://www.deepl.com", cat: "Translation", pricing: P.FREEMIUM, free: true, api: true, oss: false, ar: true, tags: ["translation", "api"], tagline: "High-accuracy machine translation.", desc: "DeepL delivers nuanced translations across 30+ languages with a free tier and developer API." },
  { name: "Otter.ai", url: "https://otter.ai", cat: "Transcription", pricing: P.FREEMIUM, free: true, api: false, oss: false, tags: ["stt", "summarization"], tagline: "AI meeting notes and transcription.", desc: "Otter records, transcribes, and summarizes meetings in real time, with a free monthly minute allowance." },
  { name: "Fireflies.ai", url: "https://fireflies.ai", cat: "Transcription", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["stt", "agents"], tagline: "Meeting recorder and notetaker bot.", desc: "Fireflies joins calls to transcribe, summarize, and search conversations; free plan available." },
  { name: "OpenAI Whisper", url: "https://github.com/openai/whisper", cat: "Transcription", pricing: P.OPEN_SOURCE, free: true, api: true, oss: true, ar: true, tags: ["stt", "open-source", "arabic"], tagline: "Open-source multilingual speech-to-text.", desc: "Whisper is OpenAI's open-source ASR model with strong multilingual (incl. Arabic) transcription; run locally or via API." },
  { name: "AssemblyAI", url: "https://www.assemblyai.com", cat: "Transcription", pricing: P.USAGE_BASED, free: true, api: true, oss: false, tags: ["stt", "api"], tagline: "Speech-to-text API for developers.", desc: "AssemblyAI offers accurate transcription and audio intelligence APIs, with free starter credits." },
  { name: "Hugging Face", url: "https://huggingface.co", cat: "Developer Tools", pricing: P.FREEMIUM, free: true, api: true, oss: true, tags: ["models", "open-source", "api"], tagline: "The hub for open ML models.", desc: "Hugging Face hosts hundreds of thousands of open models, datasets, and demos, with free accounts and paid compute." },
  { name: "Replicate", url: "https://replicate.com", cat: "Developer Tools", pricing: P.USAGE_BASED, free: true, api: true, oss: false, tags: ["models", "api"], tagline: "Run open models via one API.", desc: "Replicate lets you run and fine-tune open-source models through a simple API, pay-per-use with starter credits." },
  { name: "LangChain", url: "https://www.langchain.com", cat: "Developer Tools", pricing: P.OPEN_SOURCE, free: true, api: true, oss: true, tags: ["rag", "agents", "open-source"], tagline: "Framework for LLM apps.", desc: "LangChain is an open-source framework for building RAG and agent applications, with paid LangSmith tooling." },
  { name: "LlamaIndex", url: "https://www.llamaindex.ai", cat: "Developer Tools", pricing: P.OPEN_SOURCE, free: true, api: true, oss: true, tags: ["rag", "open-source"], tagline: "Data framework for LLM apps.", desc: "LlamaIndex connects your data to LLMs for retrieval-augmented generation; open source with managed cloud." },
  { name: "Pinecone", url: "https://www.pinecone.io", cat: "Data & Analytics", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["rag", "api"], tagline: "Managed vector database.", desc: "Pinecone is a managed vector database for semantic search and RAG at scale, with a free starter tier." },
  { name: "Weaviate", url: "https://weaviate.io", cat: "Data & Analytics", pricing: P.OPEN_SOURCE, free: true, api: true, oss: true, tags: ["rag", "open-source", "self-hosted"], tagline: "Open-source vector database.", desc: "Weaviate is an open-source vector database with hybrid search and modules; self-host free or use the cloud." },
  { name: "Ollama", url: "https://ollama.com", cat: "Developer Tools", pricing: P.OPEN_SOURCE, free: true, api: true, oss: true, tags: ["llm", "self-hosted", "open-source"], tagline: "Run LLMs locally.", desc: "Ollama makes it easy to download and run open LLMs (Llama, Mistral, etc.) locally with a simple API." },
  { name: "Mistral AI", url: "https://mistral.ai", cat: "Chatbots", pricing: P.FREEMIUM, free: true, api: true, oss: true, tags: ["llm", "open-source", "api"], tagline: "Open and efficient frontier models.", desc: "Mistral builds open-weight and commercial LLMs plus Le Chat assistant, available free and via API." },
  { name: "Cohere", url: "https://cohere.com", cat: "Developer Tools", pricing: P.USAGE_BASED, free: true, api: true, oss: false, tags: ["llm", "rag", "api"], tagline: "Enterprise LLM and RAG platform.", desc: "Cohere offers Command, Embed, and Rerank models for enterprise search and RAG, with a free trial key." },
  { name: "Gamma", url: "https://gamma.app", cat: "Productivity", pricing: P.FREEMIUM, free: true, api: false, oss: false, tags: ["no-code"], tagline: "AI presentations and docs.", desc: "Gamma generates polished decks, docs, and webpages from a prompt; free credits to start." },
  { name: "Descript", url: "https://www.descript.com", cat: "Video", pricing: P.FREEMIUM, free: true, api: false, oss: false, tags: ["video", "voice"], tagline: "Edit audio/video like a doc.", desc: "Descript transcribes then lets you edit media by editing text, plus AI voices and overdub; free tier available." },
  { name: "Krisp", url: "https://krisp.ai", cat: "Audio", pricing: P.FREEMIUM, free: true, api: false, oss: false, tags: ["voice", "realtime"], tagline: "AI noise cancellation for calls.", desc: "Krisp removes background noise and voices on calls in real time and adds meeting notes; free daily minutes." },
  { name: "Murf AI", url: "https://murf.ai", cat: "Audio", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["tts", "voice"], tagline: "Studio-quality AI voiceovers.", desc: "Murf creates natural AI voiceovers in many languages and accents for video and e-learning; free trial tier." },
  { name: "You.com", url: "https://you.com", cat: "Search", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["search", "chatbot"], tagline: "AI search and assistant.", desc: "You.com is an AI search engine and assistant with multiple modes and a free tier." },
  { name: "Phind", url: "https://www.phind.com", cat: "Search", pricing: P.FREEMIUM, free: true, api: false, oss: false, tags: ["search", "coding"], tagline: "AI answer engine for developers.", desc: "Phind is a developer-focused answer engine that searches and explains technical topics; generous free tier." },
  { name: "Poe", url: "https://poe.com", cat: "Chatbots", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["chatbot", "llm"], tagline: "Many AI bots in one app.", desc: "Poe by Quora gives access to many models (GPT, Claude, etc.) and custom bots in one place; free tier." },
  { name: "Character.AI", url: "https://character.ai", cat: "Chatbots", pricing: P.FREEMIUM, free: true, api: false, oss: false, tags: ["chatbot"], tagline: "Chat with AI characters.", desc: "Character.AI lets you create and chat with AI personas; free to use with an optional subscription." },
  { name: "Stability AI", url: "https://stability.ai", cat: "Image", pricing: P.FREEMIUM, free: false, api: true, oss: true, tags: ["image-gen", "open-source", "api"], tagline: "Open generative media models.", desc: "Stability AI develops open image, video, and audio models (Stable Diffusion family) with API access." },
  { name: "Writesonic", url: "https://writesonic.com", cat: "Writing", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["seo", "marketing"], tagline: "AI writing and SEO content.", desc: "Writesonic generates SEO articles, ads, and chat answers; free trial credits then paid." },
  { name: "Tome", url: "https://tome.app", cat: "Productivity", pricing: P.FREEMIUM, free: true, api: false, oss: false, tags: ["no-code"], tagline: "AI storytelling and decks.", desc: "Tome builds narrative presentations and pages with AI; free tier available." },
  { name: "DeepAI", url: "https://deepai.org", cat: "Image", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["image-gen", "api"], tagline: "Simple AI image tools and API.", desc: "DeepAI offers image generation and other AI utilities through a web app and developer API; free tier." },
  { name: "ideogram", url: "https://ideogram.ai", cat: "Image", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["image-gen", "design"], tagline: "Text-in-image generation.", desc: "Ideogram excels at images with legible text and typography; free daily generations." },
  { name: "Eleven Reader", url: "https://elevenreader.io", cat: "Audio", pricing: P.FREEMIUM, free: true, api: false, oss: false, tags: ["tts", "voice"], tagline: "Read anything aloud with AI voices.", desc: "ElevenReader narrates documents, articles, and ebooks with natural AI voices; free app." },
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function domain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

async function main() {
  console.log("Seeding categories…");
  for (const name of CATEGORIES) {
    const slug = slugify(name);
    await prisma.category.upsert({ where: { slug }, update: { name }, create: { slug, name } });
  }

  console.log("Seeding tags…");
  for (const name of TAGS) {
    const slug = slugify(name);
    await prisma.tag.upsert({ where: { slug }, update: { name }, create: { slug, name } });
  }

  console.log(`Seeding ${TOOLS.length} real tools…`);
  for (const t of TOOLS) {
    const slug = slugify(t.name);
    const seed = hash(t.name);
    const freshness = 55 + (seed % 46); // 55–100 (real, active tools)
    const popularity = 200 + (seed % 800);
    const d = domain(t.url);
    await prisma.tool.upsert({
      where: { slug },
      update: {
        name: t.name,
        tagline: t.tagline,
        description: t.desc,
        websiteUrl: t.url,
        logoUrl: d ? `https://logo.clearbit.com/${d}` : null,
        pricingModel: t.pricing,
        freeTierReal: t.free,
        hasApi: t.api,
        isOpenSource: t.oss,
        status: ToolStatus.PUBLISHED,
        categories: {
          set: [],
          connectOrCreate: [{ where: { slug: slugify(t.cat) }, create: { slug: slugify(t.cat), name: t.cat } }],
        },
        tags: {
          set: [],
          connectOrCreate: t.tags.map((tag) => ({ where: { slug: slugify(tag) }, create: { slug: slugify(tag), name: tag } })),
        },
      },
      create: {
        slug,
        name: t.name,
        tagline: t.tagline,
        description: t.desc,
        websiteUrl: t.url,
        logoUrl: d ? `https://logo.clearbit.com/${d}` : null,
        status: ToolStatus.PUBLISHED,
        pricingModel: t.pricing,
        freeTierReal: t.free,
        hasApi: t.api,
        isOpenSource: t.oss,
        platforms: ["web", ...(t.api ? ["api"] : [])],
        languages: t.ar ? ["en", "ar"] : ["en"],
        regions: ["GLOBAL"],
        freshnessScore: freshness,
        popularity,
        lastVerifiedAt: new Date(),
        categories: {
          connectOrCreate: [{ where: { slug: slugify(t.cat) }, create: { slug: slugify(t.cat), name: t.cat } }],
        },
        tags: {
          connectOrCreate: t.tags.map((tag) => ({ where: { slug: slugify(tag) }, create: { slug: slugify(tag), name: tag } })),
        },
      },
    });
  }

  // Remove legacy placeholder/demo tools (fake example.com URLs from the old seed + test submits).
  const purged = await prisma.tool.deleteMany({ where: { websiteUrl: { contains: "example.com" } } });
  if (purged.count) console.log(`Purged ${purged.count} placeholder tools`);

  const counts = {
    categories: await prisma.category.count(),
    tags: await prisma.tag.count(),
    tools: await prisma.tool.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
