import os
import sys
from pathlib import Path
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Ensure we can import the existing Streamlit app modules
ROOT = Path(__file__).resolve().parent.parent
PY_BACKEND = ROOT / "pitch-deck-debater"
sys.path.append(str(PY_BACKEND))

from agents.personas import (
    get_persona,
    get_all_personas,
    get_personas_by_category,
    get_persona_image,
    get_persona_voice,
)
from agents.debate_engine import DebateEngine
from utils.deck_parser import parse_deck, get_deck_summary, classify_deck_type
from io import BytesIO
from dotenv import load_dotenv


# Load environment from the Python project .env if present
load_dotenv(dotenv_path=str(PY_BACKEND / ".env"))

app = FastAPI(title="Pitch Deck Debater API", version="1.0.0")

# Local dev CORS (Next.js on 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    slide: Dict[str, Any]
    personas: List[str]
    deck_context: Optional[str] = None


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.get("/personas")
def personas() -> Dict[str, Any]:
    ids = get_all_personas()
    data = []
    for pid in ids:
        p = get_persona(pid)
        if not p:
            continue
        data.append({
            "id": pid,
            "name": p.get("name"),
            "role": p.get("role"),
            "emoji": p.get("emoji"),
            "color": p.get("color"),
            "image": get_persona_image(pid),
            "voice": get_persona_voice(pid),
        })

    categories = get_personas_by_category()
    return {"personas": data, "categories": categories}


@app.post("/upload")
async def upload(file: UploadFile = File(...)) -> Dict[str, Any]:
    # Parse the incoming PPTX using existing helpers
    data = await file.read()
    slides = parse_deck(BytesIO(data))
    summary = get_deck_summary(slides)
    deck_type = classify_deck_type(slides)
    return {
        "deck_name": file.filename,
        "slides": slides,
        "summary": summary,
        "deck_type": deck_type,
    }


@app.post("/analyze")
def analyze(req: AnalyzeRequest) -> Dict[str, Any]:
    engine = DebateEngine()

    # Round 1: individual critiques
    debate_round = engine.create_debate_round(req.slide, req.personas, 1)

    # Round 2: collaborative debate
    collab = engine.collaborative_debate_round(debate_round, req.deck_context)

    # Round 3: synthesis
    synthesis = engine.synthesize_feedback(debate_round, req.deck_context)

    return {
        "debate_round": debate_round,
        "collaborative_debate": collab,
        "synthesis": synthesis,
        "cache_stats": engine.get_cache_efficiency(),
    }


if __name__ == "__main__":
    # For local testing: `python python-api/main.py`
    import uvicorn
    uvicorn.run("python-api.main:app", host="0.0.0.0", port=8000, reload=True)
