import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Prisma, ToolStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { MeiliService, type ToolDoc } from "./meili.service";

const WITH_TAXO = {
  categories: { select: { slug: true, name: true } },
  tags: { select: { slug: true, name: true } },
} satisfies Prisma.ToolInclude;

type ToolWithTaxo = Prisma.ToolGetPayload<{ include: typeof WITH_TAXO }>;

export interface SearchParams {
  q?: string;
  category?: string;
  pricing?: string;
  platform?: string;
  language?: string;
  tag?: string;
  freeTierReal?: boolean;
  hasApi?: boolean;
  isOpenSource?: boolean;
  sort?: "popularity" | "freshness";
  take?: number;
  skip?: number;
}

const FACETS = [
  "pricingModel",
  "categories",
  "tags",
  "freeTierReal",
  "hasApi",
  "isOpenSource",
  "platforms",
  "languages",
];

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly log = new Logger(SearchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly meili: MeiliService,
  ) {}

  async onModuleInit() {
    // Best-effort: prepare index + sync published tools on boot.
    const ok = await this.meili.ensureIndex();
    if (ok) {
      const n = await this.reindexAll();
      this.log.log(`Meili index ready — ${n} tools synced`);
    }
  }

  static toDoc(t: ToolWithTaxo): ToolDoc {
    return {
      id: t.id,
      slug: t.slug,
      name: t.name,
      tagline: t.tagline,
      description: t.description,
      pricingModel: t.pricingModel,
      freeTierReal: t.freeTierReal,
      hasApi: t.hasApi,
      isOpenSource: t.isOpenSource,
      platforms: t.platforms,
      languages: t.languages,
      categories: t.categories.map((c) => c.slug),
      categoryNames: t.categories.map((c) => c.name),
      tags: t.tags.map((tag) => tag.slug),
      freshnessScore: t.freshnessScore,
      popularity: t.popularity,
      logoUrl: t.logoUrl,
    };
  }

  /** Index every PUBLISHED tool. Called on boot and after moderation changes. */
  async reindexAll(): Promise<number> {
    const tools = await this.prisma.tool.findMany({
      where: { status: ToolStatus.PUBLISHED },
      include: WITH_TAXO,
    });
    await this.meili.clear(); // drop stale docs (e.g. purged/unpublished tools)
    await this.meili.upsert(tools.map(SearchService.toDoc));
    return tools.length;
  }

  async indexOne(id: string) {
    const t = await this.prisma.tool.findUnique({ where: { id }, include: WITH_TAXO });
    if (!t) return;
    if (t.status === ToolStatus.PUBLISHED) await this.meili.upsert([SearchService.toDoc(t)]);
    else await this.meili.remove(id);
  }

  removeFromIndex(id: string) {
    return this.meili.remove(id);
  }

  /** Side-by-side data for 2–4 tools (preserves requested order). */
  async compare(slugs: string[]) {
    const wanted = slugs.slice(0, 4);
    const tools = await this.prisma.tool.findMany({
      where: { slug: { in: wanted }, status: ToolStatus.PUBLISHED },
      include: { ...WITH_TAXO, pricingTiers: true, reviews: { select: { rating: true } } },
    });
    const bySlug = new Map(tools.map((t) => [t.slug, t]));
    return wanted
      .map((s) => bySlug.get(s))
      .filter((t): t is NonNullable<typeof t> => Boolean(t))
      .map((t) => {
        const ratings = t.reviews.map((r) => r.rating);
        const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
        const { reviews, ...rest } = t;
        return { ...rest, rating: avg, reviewCount: ratings.length };
      });
  }

  private filters(p: SearchParams): string[] {
    const f: string[] = [];
    if (p.category) f.push(`categories = "${p.category}"`);
    if (p.tag) f.push(`tags = "${p.tag}"`);
    if (p.pricing) f.push(`pricingModel = "${p.pricing}"`);
    if (p.platform) f.push(`platforms = "${p.platform}"`);
    if (p.language) f.push(`languages = "${p.language}"`);
    if (p.freeTierReal) f.push(`freeTierReal = true`);
    if (p.hasApi) f.push(`hasApi = true`);
    if (p.isOpenSource) f.push(`isOpenSource = true`);
    return f;
  }

  async search(p: SearchParams) {
    const take = Math.min(Math.max(p.take ?? 24, 1), 60);
    const skip = Math.max(p.skip ?? 0, 0);
    const sort = p.sort === "freshness" ? ["freshnessScore:desc"] : ["popularity:desc"];

    if (this.meili.isReady()) {
      try {
        const res = await this.meili.search({
          q: p.q,
          filters: this.filters(p),
          facets: FACETS,
          sort,
          limit: take,
          offset: skip,
        });
        return {
          items: res.hits as unknown as ToolDoc[],
          total: res.estimatedTotalHits ?? res.hits.length,
          facets: res.facetDistribution ?? {},
          engine: "meili" as const,
        };
      } catch (err) {
        this.log.warn(`Meili search failed, DB fallback: ${(err as Error).message}`);
      }
    }
    return this.dbFallback(p, take, skip);
  }

  /** DB-backed search/browse when Meili is unavailable. No facet counts. */
  private async dbFallback(p: SearchParams, take: number, skip: number) {
    const where: Prisma.ToolWhereInput = {
      status: ToolStatus.PUBLISHED,
      ...(p.q
        ? {
            OR: [
              { name: { contains: p.q, mode: "insensitive" } },
              { tagline: { contains: p.q, mode: "insensitive" } },
              { description: { contains: p.q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(p.category ? { categories: { some: { slug: p.category } } } : {}),
      ...(p.tag ? { tags: { some: { slug: p.tag } } } : {}),
      ...(p.pricing ? { pricingModel: p.pricing as Prisma.ToolWhereInput["pricingModel"] } : {}),
      ...(p.platform ? { platforms: { has: p.platform } } : {}),
      ...(p.language ? { languages: { has: p.language } } : {}),
      ...(p.freeTierReal ? { freeTierReal: true } : {}),
      ...(p.hasApi ? { hasApi: true } : {}),
      ...(p.isOpenSource ? { isOpenSource: true } : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.tool.findMany({
        where,
        include: WITH_TAXO,
        orderBy: p.sort === "freshness" ? { freshnessScore: "desc" } : { popularity: "desc" },
        take,
        skip,
      }),
      this.prisma.tool.count({ where }),
    ]);
    return {
      items: rows.map(SearchService.toDoc),
      total,
      facets: {} as Record<string, Record<string, number>>,
      engine: "db" as const,
    };
  }
}
