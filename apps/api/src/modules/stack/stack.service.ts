import { Injectable, Logger } from "@nestjs/common";

export interface StackItem {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  role: string;
  why: string;
}
export interface StackResult {
  goal: string;
  engine: string;
  stack: StackItem[];
  notes: string;
}

@Injectable()
export class StackService {
  private readonly log = new Logger(StackService.name);
  private readonly aiUrl = process.env.AI_SERVICE_URL ?? "http://localhost:8020";

  async recommend(goal: string): Promise<StackResult> {
    try {
      const res = await fetch(`${this.aiUrl}/recommend`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ goal }),
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) throw new Error(`AI ${res.status}`);
      return (await res.json()) as StackResult;
    } catch (err) {
      this.log.warn(`Stack Builder AI unavailable: ${(err as Error).message}`);
      return { goal, engine: "unavailable", stack: [], notes: "Stack Builder is warming up — try again in a moment." };
    }
  }
}
