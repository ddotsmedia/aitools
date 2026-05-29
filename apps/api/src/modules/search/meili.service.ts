import { Injectable, Logger } from "@nestjs/common";
import { MeiliSearch, type Index } from "meilisearch";

export interface ToolDoc {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  pricingModel: string;
  freeTierReal: boolean;
  hasApi: boolean;
  isOpenSource: boolean;
  platforms: string[];
  languages: string[];
  categories: string[]; // slugs
  categoryNames: string[];
  tags: string[]; // slugs
  freshnessScore: number;
  popularity: number;
  logoUrl?: string | null;
}

export const TOOLS_INDEX = "tools";

const FILTERABLE = [
  "pricingModel",
  "freeTierReal",
  "hasApi",
  "isOpenSource",
  "platforms",
  "languages",
  "categories",
  "tags",
];
const SORTABLE = ["popularity", "freshnessScore"];
const SEARCHABLE = ["name", "tagline", "description", "categoryNames", "tags"];

/**
 * Meilisearch wrapper. Degrades gracefully — if Meili is unreachable the API
 * keeps serving (search falls back to the DB in SearchService).
 */
@Injectable()
export class MeiliService {
  private readonly log = new Logger(MeiliService.name);
  private readonly client: MeiliSearch;
  private ready = false;

  constructor() {
    this.client = new MeiliSearch({
      host: process.env.MEILI_HOST ?? "http://localhost:7720",
      apiKey: process.env.MEILI_MASTER_KEY ?? "change_me",
    });
  }

  index(): Index {
    return this.client.index(TOOLS_INDEX);
  }

  async ensureIndex(): Promise<boolean> {
    try {
      await this.client.createIndex(TOOLS_INDEX, { primaryKey: "id" }).catch(() => undefined);
      const idx = this.index();
      await idx.updateSettings({
        filterableAttributes: FILTERABLE,
        sortableAttributes: SORTABLE,
        searchableAttributes: SEARCHABLE,
      });
      this.ready = true;
      return true;
    } catch (err) {
      this.log.warn(`Meili unavailable: ${(err as Error).message}`);
      this.ready = false;
      return false;
    }
  }

  isReady() {
    return this.ready;
  }

  async upsert(docs: ToolDoc[]): Promise<void> {
    if (!docs.length) return;
    try {
      await this.index().addDocuments(docs, { primaryKey: "id" });
    } catch (err) {
      this.log.warn(`Meili upsert failed: ${(err as Error).message}`);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.index().deleteDocument(id);
    } catch (err) {
      this.log.warn(`Meili delete failed: ${(err as Error).message}`);
    }
  }

  async search(params: {
    q?: string;
    filters?: string[];
    facets?: string[];
    sort?: string[];
    limit?: number;
    offset?: number;
  }) {
    return this.index().search(params.q ?? "", {
      filter: params.filters?.length ? params.filters : undefined,
      facets: params.facets,
      sort: params.sort,
      limit: params.limit ?? 24,
      offset: params.offset ?? 0,
    });
  }
}
