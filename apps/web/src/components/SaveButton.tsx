"use client";
import { useEffect, useState } from "react";
import { Button } from "@hub/ui";

const KEY = "savedTools";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function SaveButton({ slug, className }: { slug: string; className?: string }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => setSaved(read().includes(slug)), [slug]);

  function toggle() {
    const cur = read();
    const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug];
    localStorage.setItem(KEY, JSON.stringify(next));
    setSaved(next.includes(slug));
  }

  return (
    <Button variant={saved ? "secondary" : "outline"} onClick={toggle} className={className}>
      {saved ? "★ Saved" : "☆ Save"}
    </Button>
  );
}
