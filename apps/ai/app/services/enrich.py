"""P2 enrichment: URL -> draft {tagline, description, categories, tags, pricing}.

Uses Haiku (model routing). Best-effort fetches the public homepage to ground the
draft. NEVER bypasses logins or bot protection, NEVER asserts a real free tier
(that is machine-verified in P5). Output is a DRAFT for human approval.
"""
from __future__ import annotations

import json
import os
import re
from typing import Any

import httpx

from .router import pick

PRICING_MODELS = [
    "FREE", "FREEMIUM", "PAID", "SUBSCRIPTION", "USAGE_BASED", "OPEN_SOURCE", "CONTACT",
]

# Core taxonomy the model must classify into (kept in sync with the seed).
CATEGORIES = [
    "Writing", "Image", "Audio", "Video", "Code", "Productivity", "Data & Analytics",
    "AI Agents", "Search", "Transcription", "Translation", "Chatbots", "Marketing",
    "Design", "Research", "Customer Support", "Security", "Education", "Healthcare",
    "Developer Tools",
]

SYSTEM = (
    "You classify AI tools for a verified directory. Return STRICT JSON only, no prose. "
    "Be factual; if unsure leave fields conservative. Never claim a free tier is real."
)


def _strip_html(html: str) -> str:
    text = re.sub(r"<script\b[^>]*>.*?</script>", " ", html, flags=re.I | re.S)
    text = re.sub(r"<style\b[^>]*>.*?</style>", " ", text, flags=re.I | re.S)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()[:3000]


def _fetch_context(url: str) -> str:
    try:
        with httpx.Client(timeout=8.0, follow_redirects=True, headers={"user-agent": "AIToolsHubBot/1.0"}) as c:
            r = c.get(url)
            if r.status_code == 200 and "text/html" in r.headers.get("content-type", ""):
                return _strip_html(r.text)
    except Exception:
        pass
    return ""


def _heuristic(name: str) -> dict[str, Any]:
    return {
        "tagline": f"{name} — AI tool",
        "description": f"{name} is an AI-powered tool. Pending verified description.",
        "pricingModel": "FREEMIUM",
        "freeTierReal": False,
        "hasApi": False,
        "isOpenSource": False,
        "platforms": ["web"],
        "languages": ["en"],
        "categories": ["Productivity"],
        "tags": [],
    }


def _coerce(data: dict[str, Any], name: str) -> dict[str, Any]:
    base = _heuristic(name)
    out = {**base, **{k: v for k, v in data.items() if v not in (None, "", [])}}
    if out["pricingModel"] not in PRICING_MODELS:
        out["pricingModel"] = "FREEMIUM"
    out["categories"] = [c for c in out.get("categories", []) if c in CATEGORIES] or ["Productivity"]
    out["freeTierReal"] = False  # always — verified later, never assumed
    out["tags"] = [str(t).lower()[:30] for t in out.get("tags", [])][:8]
    return out


def enrich_tool(name: str, website_url: str) -> dict[str, Any]:
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key or api_key.startswith("sk-ant-..."):
        # No real key configured — return heuristic so the pipeline still runs.
        return _heuristic(name)

    context = _fetch_context(website_url)
    prompt = (
        f"Tool name: {name}\nURL: {website_url}\n"
        f"Homepage text (may be empty): {context}\n\n"
        f"Allowed categories: {', '.join(CATEGORIES)}\n"
        f"Allowed pricingModel: {', '.join(PRICING_MODELS)}\n\n"
        "Return JSON with keys: tagline (<=90 chars), description (2-3 sentences), "
        "pricingModel, hasApi (bool), isOpenSource (bool), platforms (list of "
        "web/ios/android/mac/windows/api/mcp), languages (ISO codes), categories "
        "(1-2 from allowed), tags (3-6 short lowercase keywords)."
    )

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=api_key)
        msg = client.messages.create(
            model=pick("enrich_field"),
            max_tokens=600,
            system=SYSTEM,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = "".join(b.text for b in msg.content if getattr(b, "type", None) == "text")
        match = re.search(r"\{.*\}", raw, re.S)
        data = json.loads(match.group(0)) if match else {}
        return _coerce(data, name)
    except Exception:
        return _heuristic(name)
