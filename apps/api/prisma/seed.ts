import { PrismaClient, PricingModel, ToolStatus } from "@prisma/client";

const prisma = new PrismaClient();

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
  "self-hosted", "gdpr", "voice", "summarization", "rag", "agents", "image-gen",
  "tts", "stt", "coding", "seo", "analytics", "translation",
];

type Seed = {
  name: string;
  cat: string;
  pricing: PricingModel;
  free: boolean; // freeTierReal — only true where genuinely card-free (seed assumption, re-verified in P5)
  api: boolean;
  oss: boolean;
  tags: string[];
};

const P = PricingModel;
const TOOLS: Seed[] = [
  { name: "Whisper Arabic", cat: "Transcription", pricing: P.OPEN_SOURCE, free: true, api: true, oss: true, tags: ["arabic", "stt", "open-source"] },
  { name: "StackGen", cat: "AI Agents", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["agents", "no-code"] },
  { name: "PixelForge", cat: "Image", pricing: P.SUBSCRIPTION, free: false, api: true, oss: false, tags: ["image-gen", "enterprise"] },
  { name: "ClarityDoc", cat: "Writing", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["summarization"] },
  { name: "VoiceLab", cat: "Audio", pricing: P.USAGE_BASED, free: true, api: true, oss: false, tags: ["tts", "voice"] },
  { name: "CodePilot", cat: "Code", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["coding", "developer"] },
  { name: "TranscribeMe", cat: "Transcription", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["stt", "realtime"] },
  { name: "LinguaBridge", cat: "Translation", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["translation", "arabic"] },
  { name: "DataSense", cat: "Data & Analytics", pricing: P.SUBSCRIPTION, free: false, api: true, oss: false, tags: ["analytics", "enterprise"] },
  { name: "SupportGenie", cat: "Customer Support", pricing: P.SUBSCRIPTION, free: false, api: true, oss: false, tags: ["agents", "enterprise"] },
  { name: "ReelMind", cat: "Video", pricing: P.SUBSCRIPTION, free: false, api: false, oss: false, tags: ["video"] },
  { name: "PromptBase Pro", cat: "Productivity", pricing: P.PAID, free: false, api: false, oss: false, tags: ["no-code"] },
  { name: "SearchPilot", cat: "Search", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["rag", "search"] },
  { name: "OpenChat", cat: "Chatbots", pricing: P.OPEN_SOURCE, free: true, api: true, oss: true, tags: ["open-source", "self-hosted"] },
  { name: "MarketMuse AI", cat: "Marketing", pricing: P.SUBSCRIPTION, free: false, api: true, oss: false, tags: ["seo", "marketing"] },
  { name: "DesignDroidAI", cat: "Design", pricing: P.FREEMIUM, free: true, api: false, oss: false, tags: ["design", "image-gen"] },
  { name: "ResearchRabbit", cat: "Research", pricing: P.FREE, free: true, api: false, oss: false, tags: ["research"] },
  { name: "SentinelAI", cat: "Security", pricing: P.SUBSCRIPTION, free: false, api: true, oss: false, tags: ["enterprise", "gdpr"] },
  { name: "TutorMind", cat: "Education", pricing: P.FREEMIUM, free: true, api: false, oss: false, tags: ["education"] },
  { name: "MedScribe", cat: "Healthcare", pricing: P.CONTACT, free: false, api: true, oss: false, tags: ["enterprise", "gdpr"] },
  { name: "DevForge", cat: "Developer Tools", pricing: P.FREEMIUM, free: true, api: true, oss: true, tags: ["coding", "open-source"] },
  { name: "InkWell AI", cat: "Writing", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["summarization", "seo"] },
  { name: "GenCanvas", cat: "Image", pricing: P.USAGE_BASED, free: true, api: true, oss: false, tags: ["image-gen", "multimodal"] },
  { name: "EchoNote", cat: "Transcription", pricing: P.FREEMIUM, free: true, api: false, oss: false, tags: ["stt", "summarization"] },
  { name: "AgentFlow", cat: "AI Agents", pricing: P.OPEN_SOURCE, free: true, api: true, oss: true, tags: ["agents", "open-source", "self-hosted"] },
  { name: "VividCut", cat: "Video", pricing: P.FREEMIUM, free: true, api: false, oss: false, tags: ["video"] },
  { name: "QueryWeaver", cat: "Data & Analytics", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["analytics", "rag"] },
  { name: "DubMaster", cat: "Audio", pricing: P.USAGE_BASED, free: false, api: true, oss: false, tags: ["tts", "translation"] },
  { name: "CodeReview Bot", cat: "Code", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["coding", "developer"] },
  { name: "PolyglotAI", cat: "Translation", pricing: P.USAGE_BASED, free: true, api: true, oss: false, tags: ["translation", "arabic", "multimodal"] },
  { name: "BriefBot", cat: "Productivity", pricing: P.FREEMIUM, free: true, api: false, oss: false, tags: ["summarization"] },
  { name: "HelpHub AI", cat: "Customer Support", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["agents", "rag"] },
  { name: "FraudGuard", cat: "Security", pricing: P.SUBSCRIPTION, free: false, api: true, oss: false, tags: ["enterprise", "analytics"] },
  { name: "Scholar AI", cat: "Research", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["research", "rag"] },
  { name: "ChatForge", cat: "Chatbots", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["agents", "no-code"] },
  { name: "AdGenius", cat: "Marketing", pricing: P.SUBSCRIPTION, free: false, api: true, oss: false, tags: ["marketing", "seo"] },
  { name: "MockupMage", cat: "Design", pricing: P.FREEMIUM, free: true, api: false, oss: false, tags: ["design"] },
  { name: "LearnLoop", cat: "Education", pricing: P.FREE, free: true, api: false, oss: false, tags: ["education"] },
  { name: "VitalsAI", cat: "Healthcare", pricing: P.CONTACT, free: false, api: true, oss: false, tags: ["enterprise", "gdpr"] },
  { name: "ShipFast SDK", cat: "Developer Tools", pricing: P.OPEN_SOURCE, free: true, api: true, oss: true, tags: ["open-source", "coding", "api"] },
  { name: "GhostWriter X", cat: "Writing", pricing: P.SUBSCRIPTION, free: false, api: true, oss: false, tags: ["seo", "enterprise"] },
  { name: "ArtStation AI", cat: "Image", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["image-gen", "design"] },
  { name: "PodPilot", cat: "Audio", pricing: P.FREEMIUM, free: true, api: false, oss: false, tags: ["tts", "summarization"] },
  { name: "RefactorAI", cat: "Code", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["coding"] },
  { name: "InsightStream", cat: "Data & Analytics", pricing: P.SUBSCRIPTION, free: false, api: true, oss: false, tags: ["analytics", "realtime"] },
  { name: "TaskSwarm", cat: "AI Agents", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["agents", "no-code"] },
  { name: "ClipCraft", cat: "Video", pricing: P.USAGE_BASED, free: true, api: true, oss: false, tags: ["video", "multimodal"] },
  { name: "FindIt AI", cat: "Search", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["search", "rag"] },
  { name: "SecurePrompt", cat: "Security", pricing: P.FREEMIUM, free: true, api: true, oss: true, tags: ["gdpr", "open-source", "self-hosted"] },
  { name: "FlowDesk", cat: "Productivity", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["no-code", "agents"] },
  { name: "ArabicGPT", cat: "Chatbots", pricing: P.FREEMIUM, free: true, api: true, oss: false, tags: ["arabic", "agents"] },
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
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

  console.log(`Seeding ${TOOLS.length} tools…`);
  for (const t of TOOLS) {
    const slug = slugify(t.name);
    const seed = hash(t.name);
    const freshness = 40 + (seed % 61); // 40–100
    const popularity = seed % 1000;
    await prisma.tool.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        name: t.name,
        tagline: `${t.name} — ${t.cat.toLowerCase()} powered by AI.`,
        description: `${t.name} is a ${t.cat.toLowerCase()} tool. Verified listing with machine-checked status and pricing.`,
        websiteUrl: `https://example.com/${slug}`,
        status: ToolStatus.PUBLISHED,
        pricingModel: t.pricing,
        freeTierReal: t.free,
        hasApi: t.api,
        isOpenSource: t.oss,
        platforms: ["web", ...(t.api ? ["api"] : [])],
        languages: t.tags.includes("arabic") ? ["en", "ar"] : ["en"],
        regions: ["GLOBAL"],
        freshnessScore: freshness,
        popularity,
        lastVerifiedAt: new Date(),
        categories: {
          connectOrCreate: [
            { where: { slug: slugify(t.cat) }, create: { slug: slugify(t.cat), name: t.cat } },
          ],
        },
        tags: {
          connectOrCreate: t.tags.map((tag) => ({
            where: { slug: slugify(tag) },
            create: { slug: slugify(tag), name: tag },
          })),
        },
      },
    });
  }

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
