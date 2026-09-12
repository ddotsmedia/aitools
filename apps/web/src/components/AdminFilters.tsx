"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@hub/ui";

export interface AdminFiltersState {
  q?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
}

export function AdminFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [source, setSource] = useState(searchParams.get("source") ?? "");
  const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") ?? "");
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "created");

  function applyFilters() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (source) params.set("source", source);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (sort) params.set("sort", sort);
    router.push(`/admin?${params.toString()}`);
  }

  function clearFilters() {
    setQ("");
    setSource("");
    setDateFrom("");
    setDateTo("");
    setSort("created");
    router.push("/admin");
  }

  return (
    <div className="mb-6 space-y-4 p-4 bg-slate-900/50 rounded-lg border border-slate-800">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <input
          type="text"
          placeholder="Search by name…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-50 placeholder-slate-500"
        />

        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-50"
        >
          <option value="">All Sources</option>
          <option value="USER_SUBMITTED">User Submitted</option>
          <option value="PRODUCT_HUNT">Product Hunt</option>
          <option value="GITHUB_TRENDING">GitHub Trending</option>
          <option value="HACKERNEWS">Hacker News</option>
        </select>

        <input
          type="date"
          placeholder="From date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-50"
        />

        <input
          type="date"
          placeholder="To date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-50"
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-50"
        >
          <option value="created">Newest First</option>
          <option value="updated">Recently Updated</option>
          <option value="popularity">Most Popular</option>
          <option value="freshness">Freshness Score</option>
        </select>
      </div>

      <div className="flex gap-2 justify-end">
        <Button size="sm" variant="outline" onClick={clearFilters}>
          Clear
        </Button>
        <Button size="sm" variant="primary" onClick={applyFilters}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
