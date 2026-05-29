"""Tiered model routing. Haiku~70% Sonnet~25% Opus~5%. Default=Haiku."""
HAIKU = "claude-haiku-4-5-20251001"
SONNET = "claude-sonnet-4-6"
OPUS = "claude-opus-4-8"

def pick(task: str) -> str:
    if task in {"classify","tag","summarize","extract","enrich_field","dedupe"}:
        return HAIKU
    if task in {"editorial","merge_conflict","deep_curation"}:
        return OPUS
    return SONNET
