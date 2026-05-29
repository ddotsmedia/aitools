import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { createHash } from "node:crypto";
import { ToolStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { SearchService } from "../search/search.service";

const CONCURRENCY = 6;
const FETCH_TIMEOUT_MS = 12_000;

/**
 * P5 verification engine. On a schedule, checks each published tool for:
 *  - reachability (live status)
 *  - a content hash of the homepage (to detect material changes)
 * Then updates freshnessScore + lastVerifiedAt, writes a VerificationLog, and
 * emits a ChangeEvent when status or content changes. Reindexes to Meili.
 *
 * NEVER bypasses logins or bot protection — a plain GET only. No fabricated data.
 */
@Injectable()
export class VerificationService {
  private readonly log = new Logger(VerificationService.name);
  private running = false;
  private lastRunAt: Date | null = null;
  private lastSummary: { checked: number; reachable: number; changed: number } | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly search: SearchService,
  ) {}

  status() {
    return { running: this.running, lastRunAt: this.lastRunAt, lastSummary: this.lastSummary };
  }

  // Twice a day.
  @Cron(CronExpression.EVERY_12_HOURS)
  async scheduled() {
    await this.runAll().catch((e) => this.log.error(`Verification run failed: ${e.message}`));
  }

  async runAll(limit = 1000): Promise<{ checked: number; reachable: number; changed: number }> {
    if (this.running) return this.lastSummary ?? { checked: 0, reachable: 0, changed: 0 };
    this.running = true;
    const summary = { checked: 0, reachable: 0, changed: 0 };
    try {
      const tools = await this.prisma.tool.findMany({
        where: { status: ToolStatus.PUBLISHED },
        select: { id: true, websiteUrl: true, freshnessScore: true },
        take: limit,
      });
      for (let i = 0; i < tools.length; i += CONCURRENCY) {
        const batch = tools.slice(i, i + CONCURRENCY);
        const results = await Promise.all(batch.map((t) => this.verifyOne(t.id, t.websiteUrl)));
        for (const r of results) {
          summary.checked += 1;
          if (r.reachable) summary.reachable += 1;
          if (r.changed) summary.changed += 1;
        }
      }
      this.lastRunAt = new Date();
      this.lastSummary = summary;
      this.log.log(`Verified ${summary.checked} tools — ${summary.reachable} reachable, ${summary.changed} changed`);
      return summary;
    } finally {
      this.running = false;
    }
  }

  async verifyOne(id: string, url: string): Promise<{ reachable: boolean; changed: boolean }> {
    const { reachable, contentHash, notes } = await this.probe(url);

    const prev = await this.prisma.verificationLog.findFirst({
      where: { toolId: id },
      orderBy: { createdAt: "desc" },
      select: { reachable: true, pricingHash: true },
    });

    let changed = false;
    const events: { kind: string; summary: string }[] = [];
    if (prev) {
      if (prev.reachable !== reachable) {
        changed = true;
        events.push({ kind: "status", summary: reachable ? "Tool came back online" : "Tool became unreachable" });
      }
      if (reachable && contentHash && prev.pricingHash && prev.pricingHash !== contentHash) {
        changed = true;
        events.push({ kind: "content", summary: "Homepage content changed (possible pricing/feature update)" });
      }
    }

    // Freshness: reachable -> high & fresh; unreachable -> decay.
    const freshnessScore = reachable ? 100 : Math.max(10, 40);

    await this.prisma.$transaction([
      this.prisma.verificationLog.create({
        data: { toolId: id, reachable, pricingHash: contentHash, notes },
      }),
      this.prisma.tool.update({
        where: { id },
        data: { freshnessScore, lastVerifiedAt: new Date() },
      }),
      ...events.map((e) =>
        this.prisma.changeEvent.create({ data: { toolId: id, kind: e.kind, summary: e.summary } }),
      ),
    ]);

    await this.search.indexOne(id); // refresh freshness in search

    return { reachable, changed };
  }

  private async probe(url: string): Promise<{ reachable: boolean; contentHash: string | null; notes: string }> {
    try {
      const res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: { "user-agent": "AIToolsHubBot/1.0 (+verification)" },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      const reachable = res.status < 400;
      let contentHash: string | null = null;
      try {
        const text = await res.text();
        const normalized = text.replace(/\s+/g, " ").slice(0, 20_000);
        contentHash = createHash("sha256").update(normalized).digest("hex").slice(0, 32);
      } catch {
        /* body read failed — still record reachability */
      }
      return { reachable, contentHash, notes: `HTTP ${res.status}` };
    } catch (err) {
      return { reachable: false, contentHash: null, notes: (err as Error).name || "fetch failed" };
    }
  }
}
