import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  NotFoundException,
} from "@nestjs/common";
import { ToolsService } from "./tools.service";
import { EnrichmentService } from "../enrichment/enrichment.service";
import { SubmitToolDto, UpdateToolDto, ListToolsQuery } from "./dto";

@Controller("tools")
export class ToolsController {
  constructor(
    private readonly tools: ToolsService,
    private readonly enrichment: EnrichmentService,
  ) {}

  /** Public tool submission → PENDING. */
  @Post()
  submit(@Body() dto: SubmitToolDto) {
    return this.tools.submit(dto);
  }

  @Get()
  list(@Query() query: ListToolsQuery) {
    return this.tools.list(query);
  }

  @Get(":slug")
  getBySlug(@Param("slug") slug: string) {
    return this.tools.getBySlug(slug);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateToolDto) {
    return this.tools.update(id, dto);
  }

  /** Run AI enrichment, persist draft fields for human approval (stays PENDING). */
  @Post(":id/enrich")
  async enrich(@Param("id") id: string) {
    const tool = await this.tools.getById(id);
    if (!tool) throw new NotFoundException(`Tool ${id} not found`);
    const draft = await this.enrichment.enrich({ name: tool.name, websiteUrl: tool.websiteUrl });
    const updated = await this.tools.update(id, draft);
    return { draft, tool: updated };
  }

  @Post(":id/approve")
  approve(@Param("id") id: string) {
    return this.tools.approve(id);
  }

  @Post(":id/reject")
  reject(@Param("id") id: string) {
    return this.tools.reject(id);
  }
}
