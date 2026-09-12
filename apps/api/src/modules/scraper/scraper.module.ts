import { Module } from "@nestjs/common";
import { ScraperService } from "./scraper.service";
import { ScraperController } from "./scraper.controller";
import { ScraperScheduler } from "./scraper.scheduler";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [ScraperService, ScraperScheduler],
  controllers: [ScraperController],
  exports: [ScraperService],
})
export class ScraperModule {}
