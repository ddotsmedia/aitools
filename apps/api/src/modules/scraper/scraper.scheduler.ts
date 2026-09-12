import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ScraperService } from "./scraper.service";

@Injectable()
export class ScraperScheduler {
  private readonly log = new Logger(ScraperScheduler.name);

  constructor(private readonly scraper: ScraperService) {}

  // Daily at 08:00 UTC
  @Cron(CronExpression.EVERY_DAY_AT_8AM, { timeZone: "UTC" })
  async dailyScrape() {
    this.log.log("Starting daily scrape...");
    try {
      const result = await this.scraper.scrapeAll();
      this.log.log(`Scrape completed: ${result.inserted} inserted, ${result.skipped} skipped`);
      if (result.errors.length > 0) {
        this.log.warn(`Scrape errors: ${result.errors.join("; ")}`);
      }
    } catch (err) {
      this.log.error(`Daily scrape failed: ${(err as Error).message}`, (err as Error).stack);
    }
  }
}
