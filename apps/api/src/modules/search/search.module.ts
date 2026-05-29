import { Module } from "@nestjs/common";
import { MeiliService } from "./meili.service";
import { SearchService } from "./search.service";
import { SearchController } from "./search.controller";

@Module({
  controllers: [SearchController],
  providers: [MeiliService, SearchService],
  exports: [SearchService, MeiliService],
})
export class SearchModule {}
