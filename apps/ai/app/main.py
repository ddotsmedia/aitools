from fastapi import FastAPI
from pydantic import BaseModel

from app.services.enrich import enrich_tool

# P4 adds: /embed /search /recommend (stack builder)
app = FastAPI(title="hub-ai")


@app.get("/health")
def health():
    return {"ok": True}


class EnrichRequest(BaseModel):
    name: str
    websiteUrl: str


@app.post("/enrich")
def enrich(req: EnrichRequest):
    """Draft catalog fields from a URL (Haiku). Human-approved before publish."""
    return enrich_tool(req.name, req.websiteUrl)
