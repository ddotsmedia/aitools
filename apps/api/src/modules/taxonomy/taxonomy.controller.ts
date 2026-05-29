import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Controller()
export class TaxonomyController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("categories")
  async categories() {
    return this.prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { tools: true } } },
    });
  }

  @Get("tags")
  async tags() {
    return this.prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { tools: true } } },
    });
  }
}
