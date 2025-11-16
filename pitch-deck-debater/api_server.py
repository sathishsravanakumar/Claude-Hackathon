"""
FastAPI wrapper around the existing pitch-deck-debater logic so a Next.js frontend
can call it over HTTP. This keeps the same flows as the Streamlit UI:
- List personas
- Upload PPTX to parse slides and compute a summary
- Analyze a selected slide with selected personas (individual + collaborative + synthesis)

Run locally:
  uvicorn api_server:app --reload --port 8000

The Next.js app is configured to proxy /api/python/* to http://localhost:8000/*.
"""
from typing import List, Dict, Any
import io
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agents.personas import (
    get_persona,
    get_all_personas,
    get_personas_by_category,
)
from agents.debate_engine import DebateEngine
from utils.deck_parser import parse_deck, get_deck_summary, classify_deck_type
from utils.tts_engine_edge import generate_audio_edge


app = FastAPI(title="Pitch Deck Debater API", version="1.0.0")

# If you prefer to allow direct browser calls without Next.js rewrites,
# enable CORS as needed. With Next.js rewrites, this isn’t strictly required.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> Dict[str, Any]:
    return {"status": "ok"}


@app.get("/personas")
def personas() -> Dict[str, Any]:
    ids = get_all_personas()
    by_category = get_personas_by_category()

    items: List[Dict[str, Any]] = []
    for pid in ids:
        p = get_persona(pid)
        if not p:
            continue
        items.append({
            "id": pid,
            "name": p["name"],
            "role": p["role"],
            "emoji": p.get("emoji", ""),
            "color": p.get("color", "#999999"),
        })

    return {"personas": items, "by_category": by_category}


class UploadResponse(BaseModel):
    slides: List[Dict[str, Any]]
    summary: Dict[str, Any]
    deck_type: str


@app.post("/upload", response_model=UploadResponse)
async def upload(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pptx"):
        raise HTTPException(status_code=400, detail="Only .pptx files are supported")
    try:
        data = await file.read()
        slides = parse_deck(io.BytesIO(data))
        summary = get_deck_summary(slides)
        deck_type = classify_deck_type(slides)
        return UploadResponse(slides=slides, summary=summary, deck_type=deck_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class AnalyzeRequest(BaseModel):
    slide_index: int
    personas: List[str]
    slides: List[Dict[str, Any]]
    deck_type: str = "AI/ML Platform"


@app.post("/analyze")
def analyze(req: AnalyzeRequest) -> Dict[str, Any]:
    """
    Analyze a single slide with selected personas. The caller must POST JSON like:
      {
        "slide_index": 0,
        "personas": ["ai_architect", "data_science_lead"],
        "slides": [...same structure returned from /upload...],
        "deck_type": "AI/ML Platform"
      }
    """
    if not isinstance(req.slides, list) or not req.slides:
        raise HTTPException(status_code=400, detail="Missing or invalid slides in payload")
    if req.slide_index < 0 or req.slide_index >= len(req.slides):
        raise HTTPException(status_code=400, detail="slide_index out of range")
    if not req.personas:
        raise HTTPException(status_code=400, detail="No personas selected")

    slide = req.slides[req.slide_index]

    try:
        engine = DebateEngine()

        # Phase 1: Individual critiques
        debate_round = engine.create_debate_round(slide, req.personas, 1)

        # Phase 2: Collaborative debate
        collab = engine.collaborative_debate_round(debate_round, req.deck_type)

        # Phase 3: Synthesis
        synthesis = engine.synthesize_feedback(debate_round, req.deck_type)

        cache_stats = engine.get_cache_efficiency()

        return {
            "debate_round": debate_round,
            "collaborative_debate": collab,
            "synthesis": synthesis,
            "cache_stats": cache_stats,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class TTSRequest(BaseModel):
    text: str
    persona_id: str


@app.post("/tts")
async def text_to_speech(req: TTSRequest):
    """
    Generate audio for a given text using Edge TTS with persona-specific voice
    """
    try:
        persona = get_persona(req.persona_id)
        if not persona:
            raise HTTPException(status_code=404, detail="Persona not found")

        voice = persona.get("voice", "en-US-ChristopherNeural")
        audio_bytes = await generate_audio_edge(req.text, voice)

        from fastapi.responses import Response
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={"Content-Disposition": f"inline; filename=audio.mp3"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

