import { Module } from "@nestjs/common";
import { ToolsService } from "./tools.service";
import { ToolsController } from "./tools.controller";
import { EnrichmentModule } from "../enrichment/enrichment.module";

@Module({
  imports: [EnrichmentModule],
  controllers: [ToolsController],
  providers: [ToolsService],
  exports: [ToolsService],
})
export class ToolsModule {}
