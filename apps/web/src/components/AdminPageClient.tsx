"use client";
import { useState, ReactNode } from "react";
import { Badge, Card } from "@hub/ui";
import type { ToolList, ApiTool } from "@/lib/api";
import { AdminActions } from "./AdminActions";
import { AdminFilters } from "./AdminFilters";
import { BulkActionsBar } from "./BulkActionsBar";
import { ToolEditModal } from "./ToolEditModal";

interface AdminPageClientProps {
  items: ApiTool[];
  total: number;
  getSourceBadge: (source?: string) => ReactNode;
}

export function AdminPageClient({ items, total, getSourceBadge }: AdminPageClientProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingTool, setEditingTool] = useState<ApiTool | null>(null);

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((t) => t.id)));
    }
  };

  const selectAllVisible = () => {
    setSelectedIds(new Set(items.map((t) => t.id)));
  };

  return (
    <>
      <AdminFilters />

      {items.length === 0 ? (
        <Card>
          <p className="text-slate-400">Queue empty.</p>
        </Card>
      ) : (
        <>
          <div className="mb-4 flex gap-2">
            <label className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 rounded border border-slate-800 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={selectedIds.size === items.length && items.length > 0}
                onChange={toggleSelectAll}
                className="rounded"
              />
              <span className="text-sm text-slate-300">All ({items.length})</span>
            </label>
            {selectedIds.size > 0 && selectedIds.size < items.length && (
              <button
                onClick={selectAllVisible}
                className="px-3 py-2 text-sm text-teal hover:underline"
              >
                Select All {items.length}
              </button>
            )}
          </div>

          <div className="space-y-3 mb-8">
            {items.map((t) => (
              <Card
                key={t.id}
                className={`flex gap-3 cursor-pointer transition ${
                  selectedIds.has(t.id) ? "bg-slate-800/50 border-teal" : ""
                }`}
              >
                <div className="flex items-center pt-1">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(t.id)}
                    onChange={() => toggleSelect(t.id)}
                    className="rounded"
                  />
                </div>
                <div className="min-w-0 flex-1" onClick={() => toggleSelect(t.id)}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-50">{t.name}</span>
                    {getSourceBadge((t as any).source)}
                    <Badge tone="neutral">{t.pricingModel}</Badge>
                    {t.categories.map((c) => (
                      <Badge key={c.slug} tone="teal">
                        {c.name}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-400">
                    {t.tagline || <span className="italic text-slate-600">no tagline — run enrich</span>}
                  </p>
                  <a
                    href={t.websiteUrl}
                    className="text-xs text-teal hover:underline"
                    rel="noreferrer"
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t.websiteUrl}
                  </a>
                </div>
                <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <AdminActions id={t.id} tool={t} onEdit={() => setEditingTool(t)} />
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <BulkActionsBar selectedIds={Array.from(selectedIds)} onClear={() => setSelectedIds(new Set())} />

      <ToolEditModal tool={editingTool} isOpen={!!editingTool} onClose={() => setEditingTool(null)} />
    </>
  );
}
