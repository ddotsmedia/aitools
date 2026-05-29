from fastapi import FastAPI
# P4: /embed /search /recommend(stack builder) /enrich
app = FastAPI(title="hub-ai")
@app.get("/health")
def health(): return {"ok": True}
