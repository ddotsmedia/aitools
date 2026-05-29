import { Controller, Get, Post, Query } from "@nestjs/common";
import { SearchService, type SearchParams } from "./search.service";

function bool(v: unknown): boolean | undefined {
  if (v === "true" || v === "1" || v === true) return true;
  return undefined;
}

@Controller()
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @Get("search")
  run(@Query() q: Record<string, string>) {
    const params: SearchParams = {
      q: q.q,
      category: q.category,
      tag: q.tag,
      pricing: q.pricing,
      platform: q.platform,
      language: q.language,
      freeTierReal: bool(q.freeTierReal ?? q.free),
      hasApi: bool(q.hasApi ?? q.api),
      isOpenSource: bool(q.isOpenSource ?? q.oss),
      sort: q.sort === "freshness" ? "freshness" : "popularity",
      take: q.take ? Number(q.take) : undefined,
      skip: q.skip ? Number(q.skip) : undefined,
    };
    return this.search.search(params);
  }

  @Get("compare")
  compare(@Query("tools") tools = "") {
    const slugs = tools.split(",").map((s) => s.trim()).filter(Boolean);
    return this.search.compare(slugs);
  }

  /** Admin/maintenance: rebuild the whole Meili index from the DB. */
  @Post("search/reindex")
  async reindex() {
    const indexed = await this.search.reindexAll();
    return { indexed };
  }
}
