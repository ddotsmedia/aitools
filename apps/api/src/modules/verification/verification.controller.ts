import { Controller, Get, Post } from "@nestjs/common";
import { VerificationService } from "./verification.service";

@Controller("verify")
export class VerificationController {
  constructor(private readonly verification: VerificationService) {}

  @Get("status")
  status() {
    return this.verification.status();
  }

  /** Admin/maintenance: run a verification pass now (P7 will gate this). */
  @Post("run")
  run() {
    // Fire and forget — returns immediately, run continues in the background.
    void this.verification.runAll();
    return { started: true };
  }
}
