import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Button } from "@hub/ui";

export const metadata: Metadata = {
  title: "MCP servers",
  description: "A filterable catalog of Model Context Protocol servers. Coming soon.",
  alternates: { canonical: "/mcp" },
};

export default function McpPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20 text-center">
      <Badge tone="sun" className="mb-4">Developer layer — coming soon</Badge>
      <h1 className="text-3xl font-bold">MCP server catalog</h1>
      <p className="mt-3 text-slate-400">
        A filterable catalog of Model Context Protocol (MCP) servers — connect AI agents to tools,
        data, and APIs. Landing with the developer layer.
      </p>
      <div className="mt-6"><Link href="/tools"><Button>Browse AI tools</Button></Link></div>
    </main>
  );
}
