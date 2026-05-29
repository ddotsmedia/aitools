import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, PricingModel, ToolStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { SearchService } from "../search/search.service";
import { slugify } from "../../common/slug";
import { SubmitToolDto, UpdateToolDto, ListToolsQuery } from "./dto";

const TOOL_INCLUDE = {
  categories: { select: { slug: true, name: true } },
  tags: { select: { slug: true, name: true } },
  pricingTiers: true,
} satisfies Prisma.ToolInclude;

@Injectable()
export class ToolsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly search: SearchService,
  ) {}

  /** Public submission → lands in PENDING for enrichment + moderation. */
  async submit(dto: SubmitToolDto) {
    const slug = await this.uniqueSlug(slugify(dto.name));
    return this.prisma.tool.create({
      data: {
        slug,
        name: dto.name,
        websiteUrl: dto.websiteUrl,
        tagline: dto.tagline ?? "",
        description: "",
        pricingModel: dto.pricingModel ?? PricingModel.FREEMIUM,
        status: ToolStatus.PENDING,
      },
      include: TOOL_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateToolDto) {
    await this.mustExist(id);
    const { categories, tags, ...rest } = dto;
    const tool = await this.prisma.tool.update({
      where: { id },
      data: {
        ...rest,
        ...(categories ? { categories: { set: [], connectOrCreate: categories.map(connectCategory) } } : {}),
        ...(tags ? { tags: { set: [], connectOrCreate: tags.map(connectTag) } } : {}),
      },
      include: TOOL_INCLUDE,
    });
    await this.search.indexOne(id); // refresh index for published tools
    return tool;
  }

  /** Moderation transitions. Sync the search index on every change. */
  async approve(id: string) {
    await this.mustExist(id);
    const tool = await this.prisma.tool.update({
      where: { id },
      data: { status: ToolStatus.PUBLISHED },
      include: TOOL_INCLUDE,
    });
    await this.search.indexOne(id); // now searchable
    return tool;
  }

  async reject(id: string) {
    await this.mustExist(id);
    const tool = await this.prisma.tool.update({
      where: { id },
      data: { status: ToolStatus.REJECTED },
      include: TOOL_INCLUDE,
    });
    await this.search.removeFromIndex(id);
    return tool;
  }

  async list(query: ListToolsQuery) {
    const where: Prisma.ToolWhereInput = {
      status: (query.status as ToolStatus) ?? ToolStatus.PUBLISHED,
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: "insensitive" } },
              { tagline: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(query.category ? { categories: { some: { slug: query.category } } } : {}),
      ...(query.pricing ? { pricingModel: query.pricing as PricingModel } : {}),
      ...(query.freeTierReal !== undefined ? { freeTierReal: query.freeTierReal } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.tool.findMany({
        where,
        include: TOOL_INCLUDE,
        orderBy: [{ popularity: "desc" }, { freshnessScore: "desc" }],
        take: query.take ?? 24,
        skip: query.skip ?? 0,
      }),
      this.prisma.tool.count({ where }),
    ]);
    return { items, total };
  }

  async getBySlug(slug: string) {
    const tool = await this.prisma.tool.findUnique({
      where: { slug },
      include: { ...TOOL_INCLUDE, reviews: true },
    });
    if (!tool) throw new NotFoundException(`Tool ${slug} not found`);
    return tool;
  }

  getById(id: string) {
    return this.prisma.tool.findUnique({ where: { id }, include: TOOL_INCLUDE });
  }

  private async mustExist(id: string) {
    const exists = await this.prisma.tool.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException(`Tool ${id} not found`);
  }

  private async uniqueSlug(base: string): Promise<string> {
    const root = base || "tool";
    let candidate = root;
    let n = 1;
    // eslint-disable-next-line no-constant-condition
    while (await this.prisma.tool.findUnique({ where: { slug: candidate }, select: { id: true } })) {
      n += 1;
      candidate = `${root}-${n}`;
    }
    return candidate;
  }
}

function connectCategory(name: string) {
  const slug = slugify(name);
  return { where: { slug }, create: { slug, name } };
}
function connectTag(name: string) {
  const slug = slugify(name);
  return { where: { slug }, create: { slug, name } };
}
