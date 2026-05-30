#!/usr/bin/env python3
"""Parse curated GitHub AI-tool markdown lists into import JSON.
Dedups vs existing slugs (sitemap), cleans affiliate URLs, maps categories.
"""
import re, json, sys
from urllib.parse import urlparse

import os
DAT = os.path.join(os.path.dirname(__file__), ".dat")
EXISTING = set()
with open(os.path.join(DAT, "existing_slugs.txt")) as f:
    for line in f:
        s = line.strip()
        if s:
            EXISTING.add(s)

# section keyword -> our category slug
CATMAP = [
    ("agent", "ai-agents"), ("autonomous", "ai-agents"),
    ("coding assist", "code"), ("agentic coding", "code"), ("code", "code"), ("developer", "developer-tools"), ("sql", "developer-tools"), ("database", "developer-tools"),
    ("art", "image"), ("illustration", "image"), ("image editing", "image"), ("image to image", "image"), ("upscaler", "image"), ("headshot", "image"), ("avatar", "image"), ("background remover", "image"), ("logo", "logo-design"), ("image", "image"),
    ("song", "audio"), ("music", "audio"), ("audio", "audio"), ("voice", "audio"), ("podcast", "audio"), ("speech", "audio"), ("vocal", "audio"),
    ("video", "video"), ("animation", "video"), ("3d", "3d-game-dev"), ("gaming", "3d-game-dev"), ("game", "3d-game-dev"),
    ("seo", "seo"), ("content generation", "writing"), ("ad creative", "marketing"), ("email marketing", "marketing"), ("marketing", "marketing"), ("social", "social-media"),
    ("email assistant", "productivity"), ("email", "productivity"),
    ("cover letter", "resume-career"), ("resume", "resume-career"), ("homework", "education"), ("essay", "education"), ("learning", "education"), ("education", "education"), ("tutor", "education"), ("study", "education"),
    ("crm", "sales-crm"), ("customer data", "sales-crm"), ("sales", "sales-crm"),
    ("customer support", "customer-support"), ("support", "customer-support"), ("chat bot", "chatbots"), ("chatbot", "chatbots"), ("chat", "chatbots"), ("phone", "chatbots"),
    ("data analysis", "data-analytics"), ("analytics", "data-analytics"), ("spreadsheet", "productivity"),
    ("ecommerce", "e-commerce"), ("e-commerce", "e-commerce"), ("shop", "e-commerce"),
    ("healthcare", "healthcare"), ("health", "healthcare"), ("fitness", "healthcare"),
    ("accounting", "finance-accounting"), ("finance", "finance-accounting"), ("legal", "legal"), ("law", "legal"),
    ("fashion", "image"), ("architecture", "design"), ("interior", "design"), ("design", "design"),
    ("book", "writing"), ("novel", "writing"), ("writer", "writing"), ("writing", "writing"), ("text", "writing"), ("paraphras", "writing"), ("summar", "writing"),
    ("search", "search"), ("research", "research"), ("paper", "research"), ("translat", "translation"), ("transcri", "transcription"),
    ("presentation", "presentation"), ("slide", "presentation"),
    ("website", "website-builders"), ("app builder", "app-builders"), ("no-code", "app-builders"), ("low-code", "app-builders"),
    ("hr", "hr-recruitment"), ("recruit", "hr-recruitment"), ("hiring", "hr-recruitment"),
    ("security", "cybersecurity"), ("travel", "travel"),
    ("productivity", "productivity"), ("meeting", "transcription"), ("note", "productivity"), ("automation", "ai-agents"), ("workflow", "ai-agents"),
]

# sections to skip entirely (NSFW / non-tool / junk)
SKIP_SECTION = re.compile(r"(tarot|divination|dating|pickup|beauty rating|face & beauty|nsfw|gift idea|index|latest addition|editor|learning resource|contents|table of contents|hand-picked|other ai tools|misc)", re.I)

# names that are directories/lists not tools
SKIP_NAME = re.compile(r"(awesome|theres an ai|there's an ai|ai for developers|altern|futurepedia|toolify|aitools|directory|newsletter|^list of|find the best)", re.I)

AFFILIATE_SUB = {"get", "try", "go", "app", "affiliate", "link", "links", "partner",
                 "ref", "refer", "join", "start", "my", "use", "buy", "shop", "track",
                 "click", "out", "promo", "deal", "signup", "sign-up", "free-trial", "trial"}

def slugify(name):
    s = name.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")

def clean_domain(url):
    try:
        p = urlparse(url if "://" in url else "https://" + url)
    except Exception:
        return None
    host = (p.netloc or "").lower()
    if not host or "." not in host:
        return None
    host = host.split("@")[-1].split(":")[0]
    parts = host.split(".")
    # strip leading www / affiliate subdomain
    while len(parts) > 2 and parts[0] in (AFFILIATE_SUB | {"www"}):
        parts = parts[1:]
    if parts and parts[0] == "www":
        parts = parts[1:]
    # skip github/social/redirect hosts (not a product homepage)
    bad = ("github.com", "youtube.com", "twitter.com", "x.com", "reddit.com",
           "medium.com", "notion.so", "discord", "facebook.com", "linkedin.com",
           "thataicollection.com", "altern.ai", "theresanai", "producthunt.com",
           "apps.apple.com", "play.google.com", "chrome.google.com", "huggingface.co")
    h = ".".join(parts)
    if any(b in h for b in bad):
        return None
    return h

def map_cat(section):
    s = section.lower()
    for kw, cat in CATMAP:
        if kw in s:
            return cat
    return None

LINK = re.compile(r"^\s*[-*]\s*\[([^\]]+)\]\((https?://[^)]+)\)\s*[-–—:]*\s*(.*)$")

def parse(path):
    out = []
    section = ""
    with open(path, encoding="utf-8") as f:
        for line in f:
            h = re.match(r"^(#{2,4})\s+(.*)$", line)
            if h:
                section = h.group(2).strip()
                continue
            m = LINK.match(line)
            if not m:
                continue
            if SKIP_SECTION.search(section):
                continue
            name = m.group(1).strip()
            url = m.group(2).strip()
            desc = re.sub(r"\s+", " ", m.group(3)).strip()
            if SKIP_NAME.search(name):
                continue
            if len(name) < 2 or len(name) > 40:
                continue
            dom = clean_domain(url)
            if not dom:
                continue
            cat = map_cat(section)
            if not cat:
                continue
            slug = slugify(name)
            if not slug or slug in EXISTING:
                continue
            # trim desc to <=12 words
            words = desc.split()
            if words:
                desc = " ".join(words[:12])
            else:
                desc = f"{name} — AI tool."
            out.append({
                "name": name, "slug": slug, "website": f"https://{dom}",
                "description": desc, "category": cat, "pricing": "Freemium",
                "has_free_tier": True, "has_api": False, "is_open_source": False,
                "source": "GitHub awesome list",
            })
    return out

seen = set(EXISTING)
rows = []
for p in sys.argv[1:]:
    for r in parse(p):
        if r["slug"] in seen:
            continue
        # also dedup by domain
        seen.add(r["slug"])
        rows.append(r)

# dedup by domain too
bydom = {}
final = []
for r in rows:
    d = r["website"]
    if d in bydom:
        continue
    bydom[d] = 1
    final.append(r)

print(f"parsed candidates: {len(final)}", file=sys.stderr)
# category distribution
from collections import Counter
c = Counter(r["category"] for r in final)
print("by category:", dict(c.most_common()), file=sys.stderr)
json.dump(final, open(os.path.join(DAT, "candidates.json"), "w"), indent=1)
