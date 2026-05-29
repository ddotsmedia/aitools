"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@hub/ui";
import { API_BASE } from "@/lib/api";

export function AdminActions({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function act(action: "enrich" | "approve" | "reject") {
    setBusy(action);
    try {
      await fetch(`${API_BASE}/tools/${id}/${action}`, { method: "POST" });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" disabled={!!busy} onClick={() => act("enrich")}>
        {busy === "enrich" ? "…" : "AI enrich"}
      </Button>
      <Button size="sm" variant="primary" disabled={!!busy} onClick={() => act("approve")}>
        {busy === "approve" ? "…" : "Approve"}
      </Button>
      <Button size="sm" variant="ghost" disabled={!!busy} onClick={() => act("reject")}>
        {busy === "reject" ? "…" : "Reject"}
      </Button>
    </div>
  );
}
