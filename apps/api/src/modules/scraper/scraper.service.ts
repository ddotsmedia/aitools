import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ToolSource, PricingModel } from "@prisma/client";
import { slugify } from "../../common/slug";

interface ScrapedTool {
  name: string;
  url: string;
  description: string;
  source: ToolSource;
  metadata: Record<string, unknown>;
}

@Injectable()
export class ScraperService {
  private readonly log = new Logger(ScraperService.name);

  constructor(private readonly prisma: PrismaService) {}

  async scrapeAll(): Promise<{ inserted: number; skipped: number; errors: string[] }> {
    const errors: string[] = [];
    let inserted = 0;
    let skipped = 0;

    try {
      const phTools = await this.scrapeProductHunt().catch((e) => {
        errors.push(`ProductHunt: ${(e as Error).message}`);
        return [];
      });
      const { added, duped } = await this.insertTools(phTools);
      inserted += added;
      skipped += duped;

      const ghTools = await this.scrapeGitHubTrending().catch((e) => {
        errors.push(`GitHub: ${(e as Error).message}`);
        return [];
      });
      const { added: ghAdded, duped: ghDuped } = await this.insertTools(ghTools);
      inserted += ghAdded;
      skipped += ghDuped;

      const hnTools = await this.scrapeHackerNews().catch((e) => {
        errors.push(`HackerNews: ${(e as Error).message}`);
        return [];
      });
      const { added: hnAdded, duped: hnDuped } = await this.insertTools(hnTools);
      inserted += hnAdded;
      skipped += hnDuped;

      this.log.log(
        `Scrape complete: ${inserted} inserted, ${skipped} skipped${errors.length ? `, ${errors.length} errors` : ""}`,
      );
      return { inserted, skipped, errors };
    } catch (err) {
      this.log.error(`Scrape failed: ${(err as Error).message}`);
      throw err;
    }
  }

  private async scrapeProductHunt(): Promise<ScrapedTool[]> {
    // Product Hunt requires auth token, fallback to no results if unavailable
    const token = process.env.PRODUCT_HUNT_API_TOKEN;
    if (!token) {
      this.log.warn("PRODUCT_HUNT_API_TOKEN not set");
      return [];
    }

    try {
      const res = await fetch("https://api.producthunt.com/v2/posts", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = (await res.json()) as {
        data: Array<{
          id: string;
          name: string;
          url: string;
          tagline: string;
          description?: string;
        }>;
      };

      return data.data.slice(0, 20).map((p) => ({
        name: p.name,
        url: p.url,
        description: p.tagline || p.description || `${p.name} on Product Hunt`,
        source: ToolSource.PRODUCT_HUNT,
        metadata: { productHuntId: p.id, tagline: p.tagline },
      }));
    } catch (err) {
      this.log.warn(`ProductHunt scrape failed: ${(err as Error).message}`);
      return [];
    }
  }

  private async scrapeGitHubTrending(): Promise<ScrapedTool[]> {
    try {
      const res = await fetch("https://api.github.com/search/repositories?q=topic:ai+language:javascript&sort=stars&order=desc&per_page=20", {
        headers: process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {},
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = (await res.json()) as {
        items: Array<{
          id: number;
          name: string;
          html_url: string;
          description: string | null;
          stargazers_count: number;
        }>;
      };

      return data.items
        .filter((r) => r.description) // only tools with description
        .slice(0, 15)
        .map((r) => ({
          name: r.name,
          url: r.html_url,
          description: r.description || `GitHub repository: ${r.name}`,
          source: ToolSource.GITHUB_TRENDING,
          metadata: { repoId: r.id, stars: r.stargazers_count },
        }));
    } catch (err) {
      this.log.warn(`GitHub scrape failed: ${(err as Error).message}`);
      return [];
    }
  }

  private async scrapeHackerNews(): Promise<ScrapedTool[]> {
    try {
      const res = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json", {
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const storyIds = (await res.json()) as number[];

      const stories = await Promise.all(
        storyIds
          .slice(0, 50)
          .map((id) =>
            fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
              signal: AbortSignal.timeout(5_000),
            }).then((r) => (r.ok ? r.json() : null)),
          ),
      );

      return stories
        .filter(
          (s): s is { id: number; title: string; url?: string; text?: string } =>
            s && (s.url?.toLowerCase().includes("ai") || s.title?.toLowerCase().includes("ai tool")),
        )
        .slice(0, 10)
        .map((s) => ({
          name: s.title,
          url: s.url || `https://news.ycombinator.com/item?id=${s.id}`,
          description: s.text ? s.text.slice(0, 200) : `HackerNews discussion about ${s.title}`,
          source: ToolSource.HACKERNEWS,
          metadata: { hnId: s.id },
        }));
    } catch (err) {
      this.log.warn(`HackerNews scrape failed: ${(err as Error).message}`);
      return [];
    }
  }

  private async insertTools(tools: ScrapedTool[]): Promise<{ added: number; duped: number }> {
    let added = 0;
    let duped = 0;

    for (const tool of tools) {
      try {
        // Check for duplicate by URL
        const existing = await this.prisma.tool.findFirst({
          where: { websiteUrl: tool.url },
          select: { id: true },
        });
        if (existing) {
          duped += 1;
          continue;
        }

        // Check for duplicate by name similarity (simple string match)
        const nameSimilar = await this.prisma.tool.findFirst({
          where: { name: { equals: tool.name, mode: "insensitive" } },
          select: { id: true },
        });
        if (nameSimilar) {
          duped += 1;
          continue;
        }

        // Insert new tool in PENDING status for admin approval
        const slug = await this.uniqueSlug(slugify(tool.name));
        await this.prisma.tool.create({
          data: {
            slug,
            name: tool.name,
            websiteUrl: tool.url,
            tagline: "", // will be enriched
            description: tool.description,
            pricingModel: PricingModel.FREEMIUM, // default, will be corrected via enrichment
            source: tool.source,
            scrapedMetadata: tool.metadata as never,
          },
        });
        added += 1;
      } catch (err) {
        this.log.warn(`Failed to insert tool "${tool.name}": ${(err as Error).message}`);
      }
    }

    return { added, duped };
  }

  private async uniqueSlug(base: string): Promise<string> {
    const root = base || "tool";
    let candidate = root;
    let n = 1;
    while (await this.prisma.tool.findUnique({ where: { slug: candidate }, select: { id: true } })) {
      n += 1;
      candidate = `${root}-${n}`;
    }
    return candidate;
  }
}
