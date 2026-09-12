"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@hub/ui";
import { API_BASE, type ApiTool } from "@/lib/api";

interface ToolEditModalProps {
  tool: ApiTool | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ToolEditModal({ tool, isOpen, onClose }: ToolEditModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tool) {
      setFormData({
        name: tool.name,
        tagline: tool.tagline,
        description: tool.description,
        logoUrl: tool.logoUrl || "",
        pricingModel: tool.pricingModel,
        freeTierReal: tool.freeTierReal,
        hasApi: tool.hasApi,
        isOpenSource: tool.isOpenSource,
        platforms: tool.platforms?.join(",") || "",
        languages: tool.languages?.join(",") || "",
        categories: tool.categories?.map((c) => c.name).join(",") || "",
        tags: tool.tags?.map((t) => t.name).join(",") || "",
      });
    }
  }, [tool]);

  async function handleSave() {
    if (!tool) return;
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        tagline: formData.tagline,
        description: formData.description,
        logoUrl: formData.logoUrl || undefined,
        pricingModel: formData.pricingModel,
        freeTierReal: formData.freeTierReal,
        hasApi: formData.hasApi,
        isOpenSource: formData.isOpenSource,
        platforms: formData.platforms ? formData.platforms.split(",").map((s: string) => s.trim()) : [],
        languages: formData.languages ? formData.languages.split(",").map((s: string) => s.trim()) : [],
        categories: formData.categories ? formData.categories.split(",").map((s: string) => s.trim()) : [],
        tags: formData.tags ? formData.tags.split(",").map((s: string) => s.trim()) : [],
      };
      const res = await fetch(`${API_BASE}/tools/${tool.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        router.refresh();
        onClose();
      }
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen || !tool) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-800">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-50">Edit Tool: {tool.name}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Pricing Model</label>
              <select
                value={formData.pricingModel || ""}
                onChange={(e) => setFormData({ ...formData, pricingModel: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-50"
              >
                <option value="FREE">Free</option>
                <option value="FREEMIUM">Freemium</option>
                <option value="PAID">Paid</option>
                <option value="SUBSCRIPTION">Subscription</option>
                <option value="USAGE_BASED">Usage Based</option>
                <option value="OPEN_SOURCE">Open Source</option>
                <option value="CONTACT">Contact</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Tagline</label>
            <input
              type="text"
              value={formData.tagline || ""}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-50 h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Logo URL</label>
            <input
              type="url"
              value={formData.logoUrl || ""}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-50"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.freeTierReal || false}
                onChange={(e) => setFormData({ ...formData, freeTierReal: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-slate-300">Free Tier (No Card)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.hasApi || false}
                onChange={(e) => setFormData({ ...formData, hasApi: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-slate-300">Has API</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isOpenSource || false}
                onChange={(e) => setFormData({ ...formData, isOpenSource: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-slate-300">Open Source</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Platforms (comma-separated)</label>
              <input
                type="text"
                value={formData.platforms || ""}
                onChange={(e) => setFormData({ ...formData, platforms: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-50 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Languages (comma-separated)</label>
              <input
                type="text"
                value={formData.languages || ""}
                onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-50 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Categories (comma-separated)</label>
              <input
                type="text"
                value={formData.categories || ""}
                onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-50 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags || ""}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-50 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-slate-900 border-t border-slate-800 px-6 py-4 flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
