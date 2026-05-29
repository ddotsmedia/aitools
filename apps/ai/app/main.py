from fastapi import FastAPI
from pydantic import BaseModel

from app.services.enrich import enrich_tool
from app.services.recommend import recommend as recommend_stack

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


class RecommendRequest(BaseModel):
    goal: str


@app.post("/recommend")
def recommend(req: RecommendRequest):
    """Stack Builder: goal -> multi-tool stack from the catalog (Sonnet/heuristic)."""
    return recommend_stack(req.goal)
