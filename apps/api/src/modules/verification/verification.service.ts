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

  /** Recent verification change events (price/status/free-tier/content), newest first. */
  recentChanges(limit = 60) {
    return this.prisma.changeEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: Math.min(Math.max(limit, 1), 200),
      include: { tool: { select: { slug: true, name: true, logoUrl: true } } },
    });
  }

  // Twice a day.
  @Cron(CronExpression.EVERY_12_HOURS)
  async scheduled() {
    await this.runAll().catch((e) => this.log.error(`Verification run failed: ${e.message}`));
  }

  async runAll(limit = 10000): Promise<{ checked: number; reachable: number; changed: number }> {
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
    const p = await this.probe(url);

    const prev = await this.prisma.verificationLog.findFirst({
      where: { toolId: id },
      orderBy: { createdAt: "desc" },
      select: { reachable: true, pricingHash: true },
    });
    const prevTool = await this.prisma.tool.findUnique({
      where: { id },
      select: { freeTierReal: true },
    });

    let changed = false;
    const events: { kind: string; summary: string }[] = [];
    if (prev) {
      if (prev.reachable !== p.reachable) {
        changed = true;
        events.push({ kind: "status", summary: p.reachable ? "Tool came back online" : "Tool became unreachable" });
      }
      if (p.reachable && p.pricingHash && prev.pricingHash && prev.pricingHash !== p.pricingHash) {
        changed = true;
        events.push({ kind: "pricing", summary: "Pricing/plans page changed" });
      }
    }
    // Free-tier verification: only flip when we could actually read a page
    // (never assume). Emit an event when the verified state changes.
    if (p.freeTier !== null && prevTool && prevTool.freeTierReal !== p.freeTier) {
      changed = true;
      events.push({
        kind: "free_tier",
        summary: p.freeTier ? "Verified a genuine free tier" : "Free tier no longer detected",
      });
    }

    const freshnessScore = p.reachable ? 100 : Math.max(10, 40);

    await this.prisma.$transaction([
      this.prisma.verificationLog.create({
        data: { toolId: id, reachable: p.reachable, pricingHash: p.pricingHash, notes: p.notes },
      }),
      this.prisma.tool.update({
        where: { id },
        data: {
          freshnessScore,
          lastVerifiedAt: new Date(),
          ...(p.freeTier !== null ? { freeTierReal: p.freeTier } : {}),
        },
      }),
      ...events.map((e) =>
        this.prisma.changeEvent.create({ data: { toolId: id, kind: e.kind, summary: e.summary } }),
      ),
    ]);

    await this.search.indexOne(id);
    return { reachable: p.reachable, changed };
  }

  private async fetchText(url: string): Promise<{ status: number; text: string | null }> {
    try {
      const res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: { "user-agent": "AIToolsHubBot/1.0 (+verification)" },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      const blocked = res.status === 403 || res.status === 429;
      if (blocked || res.status >= 400) return { status: res.status, text: null };
      try {
        return { status: res.status, text: (await res.text()).replace(/\s+/g, " ").slice(0, 40_000) };
      } catch {
        return { status: res.status, text: null };
      }
    } catch {
      return { status: 0, text: null };
    }
  }

  /**
   * Live status + real pricing tracking + machine-detected free tier.
   * Fetches the homepage and the pricing/plans page; hashes the pricing page to
   * detect changes; scans text for a genuine free-tier signal. Never bypasses
   * bot protection — a plain GET only.
   */
  private async probe(url: string): Promise<{
    reachable: boolean;
    pricingHash: string | null;
    freeTier: boolean | null;
    notes: string;
  }> {
    const home = await this.fetchText(url);
    // Network/DNS failure on the homepage = unreachable.
    if (home.status === 0) return { reachable: false, pricingHash: null, freeTier: null, notes: "fetch failed" };

    let origin = "";
    try {
      origin = new URL(url).origin;
    } catch {
      /* keep empty */
    }
    // Best-effort pricing page.
    let pricing = { status: 0, text: null as string | null };
    if (origin) {
      pricing = await this.fetchText(`${origin}/pricing`);
      if (pricing.status >= 400 || pricing.status === 0) pricing = await this.fetchText(`${origin}/plans`);
    }

    const combined = `${home.text ?? ""} ${pricing.text ?? ""}`.toLowerCase();
    const hashBasis = pricing.text ?? home.text;
    const pricingHash = hashBasis ? createHash("sha256").update(hashBasis).digest("hex").slice(0, 32) : null;

    // free-tier signal — require "free" with a plan/no-card qualifier to limit false positives.
    let freeTier: boolean | null = null;
    if (home.text || pricing.text) {
      freeTier =
        /\bfree (plan|tier|forever|version|account)\b/.test(combined) ||
        /\b(start|get started|sign up|try) (it )?(for )?free\b/.test(combined) ||
        /\bno credit card\b/.test(combined) ||
        /\$0(\.00)?\b/.test(combined) ||
        /\bfree to (use|start|try)\b/.test(combined);
    }

    const note = home.status === 403 || home.status === 429 ? `HTTP ${home.status} (bot-protected)` : `HTTP ${home.status}`;
    return { reachable: true, pricingHash, freeTier, notes: note };
  }
}
