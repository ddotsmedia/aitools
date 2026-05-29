import { Controller, Get } from "@nestjs/common";

@Controller()
export class HealthController {
  /** Container healthcheck + uptime probe. */
  @Get("health")
  health() {
    return { ok: true, service: "api", ts: new Date().toISOString() };
  }
}
