"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@hub/ui";
import { API_BASE } from "@/lib/api";

interface BulkActionsBarProps {
  selectedIds: string[];
  onClear: () => void;
}

export function BulkActionsBar({ selectedIds, onClear }: BulkActionsBarProps) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function bulkAction(action: "approve" | "reject") {
    if (!selectedIds.length) return;
    setBusy(action);
    try {
      const endpoint = action === "approve" ? "bulk-approve" : "bulk-reject";
      const res = await fetch(`${API_BASE}/tools/${endpoint}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (res.ok) {
        onClear();
        router.refresh();
      }
    } finally {
      setBusy(null);
    }
  }

  if (!selectedIds.length) return null;

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 flex items-center justify-between">
      <p className="text-sm text-slate-400">
        {selectedIds.length} item{selectedIds.length !== 1 ? "s" : ""} selected
      </p>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          disabled={!!busy}
          onClick={onClear}
        >
          Deselect All
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={!!busy}
          onClick={() => bulkAction("reject")}
        >
          {busy === "reject" ? "…" : "Bulk Reject"}
        </Button>
        <Button
          size="sm"
          variant="primary"
          disabled={!!busy}
          onClick={() => bulkAction("approve")}
        >
          {busy === "approve" ? "…" : "Bulk Approve"}
        </Button>
      </div>
    </div>
  );
}
