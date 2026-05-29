"""P4 Stack Builder: goal -> ranked multi-tool stack + integration notes.

Uses Sonnet (model routing for task->stack) when a key is set; otherwise a
deterministic keyword-overlap heuristic over the live catalog. Either way it
only ever recommends tools that exist in the catalog.
"""
from __future__ import annotations

import json
import os
import re
from typing import Any

import httpx

from .router import pick

API_URL = os.getenv("API_URL", "http://localhost:4020")
STOP = set(
    "the a an and or to for of in on with my our we i need want help me then build using use "
    "into from at by is are be that this it tool tools ai app create make get".split()
)


def _catalog(limit: int = 300) -> list[dict[str, Any]]:
    try:
        with httpx.Client(timeout=8.0) as c:
            r = c.get(f"{API_URL}/search", params={"take": limit})
            if r.status_code == 200:
                return r.json().get("items", [])
    except Exception:
        pass
    return []


def _tokens(text: str) -> list[str]:
    return [w for w in re.findall(r"[a-z0-9]+", text.lower()) if w not in STOP and len(w) > 2]


def _heuristic(goal: str, items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    gtok = set(_tokens(goal))
    scored = []
    for t in items:
        hay = " ".join(
            [t.get("name", ""), t.get("tagline", ""), t.get("description", "")]
            + t.get("categoryNames", [])
            + t.get("tags", [])
        ).lower()
        htok = set(_tokens(hay))
        overlap = len(gtok & htok)
        score = overlap * 100 + t.get("freshnessScore", 0) + t.get("popularity", 0) / 100
        if overlap > 0:
            scored.append((score, t))
    scored.sort(key=lambda x: x[0], reverse=True)

    picked: list[dict[str, Any]] = []
    per_cat: dict[str, int] = {}
    for _, t in scored:
        cat = (t.get("categoryNames") or ["Other"])[0]
        if per_cat.get(cat, 0) >= 2:
            continue
        per_cat[cat] = per_cat.get(cat, 0) + 1
        picked.append(t)
        if len(picked) >= 5:
            break
    if not picked:
        picked = sorted(items, key=lambda t: t.get("freshnessScore", 0), reverse=True)[:3]

    return [
        {
            "slug": t["slug"],
            "name": t["name"],
            "tagline": t.get("tagline", ""),
            "category": (t.get("categoryNames") or [""])[0],
            "role": (t.get("categoryNames") or ["Tool"])[0],
            "why": t.get("tagline", "") or "Relevant to your goal.",
        }
        for t in picked
    ]


def _with_claude(goal: str, items: list[dict[str, Any]], api_key: str) -> list[dict[str, Any]] | None:
    compact = [
        {"slug": t["slug"], "name": t["name"], "cat": (t.get("categoryNames") or [""])[0], "tagline": t.get("tagline", "")}
        for t in items
    ]
    prompt = (
        f"User goal: {goal}\n\n"
        f"Catalog (JSON): {json.dumps(compact)[:12000]}\n\n"
        "Pick 3-5 tools from the catalog that together accomplish the goal as a stack. "
        "Use ONLY slugs from the catalog. Return STRICT JSON: "
        '{"stack":[{"slug":"...","role":"short role","why":"one sentence"}]}.'
    )
    try:
        import anthropic

        client = anthropic.Anthropic(api_key=api_key)
        msg = client.messages.create(
            model=pick("task_to_stack"),  # Sonnet
            max_tokens=800,
            system="You assemble verified AI tool stacks. JSON only. Never invent slugs.",
            messages=[{"role": "user", "content": prompt}],
        )
        raw = "".join(b.text for b in msg.content if getattr(b, "type", None) == "text")
        m = re.search(r"\{.*\}", raw, re.S)
        data = json.loads(m.group(0)) if m else {}
        by_slug = {t["slug"]: t for t in items}
        out = []
        for s in data.get("stack", []):
            t = by_slug.get(s.get("slug"))
            if not t:
                continue
            out.append({
                "slug": t["slug"],
                "name": t["name"],
                "tagline": t.get("tagline", ""),
                "category": (t.get("categoryNames") or [""])[0],
                "role": s.get("role") or (t.get("categoryNames") or ["Tool"])[0],
                "why": s.get("why") or t.get("tagline", ""),
            })
        return out or None
    except Exception:
        return None


def recommend(goal: str) -> dict[str, Any]:
    items = _catalog()
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    stack = None
    engine = "heuristic"
    if api_key and not api_key.startswith("sk-ant-..."):
        stack = _with_claude(goal, items, api_key)
        if stack:
            engine = "claude"
    if not stack:
        stack = _heuristic(goal, items)
    notes = (
        "Suggested stack based on your goal. Connect tools via their APIs or exports; "
        "start with the free tiers, then upgrade the pieces you rely on."
    )
    return {"goal": goal, "engine": engine, "stack": stack, "notes": notes}
