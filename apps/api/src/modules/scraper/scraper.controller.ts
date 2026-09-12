import { Controller, Post } from "@nestjs/common";
import { ScraperService } from "./scraper.service";

@Controller("scraper")
export class ScraperController {
  constructor(private readonly scraper: ScraperService) {}

  @Post("run")
  async run() {
    return this.scraper.scrapeAll();
  }
}
