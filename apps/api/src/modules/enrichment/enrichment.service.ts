import { Injectable, Logger } from "@nestjs/common";
import { PricingModel } from "@prisma/client";
import { UpdateToolDto } from "../tools/dto";

export interface EnrichInput {
  name: string;
  websiteUrl: string;
}

/**
 * Drafts catalog fields from a URL. Delegates to the FastAPI AI service
 * (apps/ai /enrich, Haiku). Falls back to a deterministic heuristic when the
 * AI service is unreachable so the submit→enrich→approve flow never blocks.
 * Output is a DRAFT for human approval — never auto-published.
 */
@Injectable()
export class EnrichmentService {
  private readonly log = new Logger(EnrichmentService.name);
  private readonly aiUrl = process.env.AI_SERVICE_URL ?? "http://localhost:8020";

  async enrich(input: EnrichInput): Promise<UpdateToolDto> {
    try {
      const res = await fetch(`${this.aiUrl}/enrich`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) throw new Error(`AI service ${res.status}`);
      const data = (await res.json()) as Partial<UpdateToolDto>;
      return this.normalize(data, input);
    } catch (err) {
      this.log.warn(`AI enrich failed (${(err as Error).message}); using heuristic fallback`);
      return this.heuristic(input);
    }
  }

  private normalize(data: Partial<UpdateToolDto>, input: EnrichInput): UpdateToolDto {
    const fallback = this.heuristic(input);
    return {
      tagline: data.tagline || fallback.tagline,
      description: data.description || fallback.description,
      pricingModel: (data.pricingModel as PricingModel) || fallback.pricingModel,
      freeTierReal: data.freeTierReal ?? false, // never assumed true — must be machine-verified (P5)
      hasApi: data.hasApi ?? fallback.hasApi,
      isOpenSource: data.isOpenSource ?? fallback.isOpenSource,
      platforms: data.platforms?.length ? data.platforms : fallback.platforms,
      languages: data.languages?.length ? data.languages : fallback.languages,
      categories: data.categories?.length ? data.categories : fallback.categories,
      tags: data.tags?.length ? data.tags : fallback.tags,
    };
  }

  private heuristic(input: EnrichInput): UpdateToolDto {
    return {
      tagline: `${input.name} — AI tool`,
      description: `${input.name} is an AI-powered tool. Pending verified description.`,
      pricingModel: PricingModel.FREEMIUM,
      freeTierReal: false,
      hasApi: false,
      isOpenSource: false,
      platforms: ["web"],
      languages: ["en"],
      categories: ["Uncategorized"],
      tags: [],
    };
  }
}
