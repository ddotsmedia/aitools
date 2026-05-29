import { Controller, Get, Query } from "@nestjs/common";
import { VerificationService } from "./verification.service";

@Controller()
export class ChangesController {
  constructor(private readonly verification: VerificationService) {}

  /** Public feed of recent verification changes across the catalog. */
  @Get("changes")
  changes(@Query("take") take?: string) {
    return this.verification.recentChanges(take ? Number(take) : 60);
  }
}
