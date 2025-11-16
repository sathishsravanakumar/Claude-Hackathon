# utils/tts_engine_edge.py
import asyncio
import hashlib
from pathlib import Path
import edge_tts

AUDIO_DIR = Path("audio")
AUDIO_DIR.mkdir(exist_ok=True)

def _cache_key(persona_id: str, voice: str, text: str, rate: str, volume: str) -> str:
    raw = f"{persona_id}|{voice}|{rate}|{volume}|{text}"
    return hashlib.sha1(raw.encode("utf-8")).hexdigest()

def _norm_pct(val, default="+0%"):
    """Normalize +0%, -10%, etc."""
    if val is None:
        return default
    s = str(val).strip()
    if not s.endswith("%"):
        if s.lstrip("+-").isdigit():
            s = f"{s}%"
        else:
            s = default
    if not s.startswith(("+", "-")):
        s = "+" + s
    return s

async def _synth_async(text: str, voice: str, out_path: Path, rate: str, volume: str):
    communicate = edge_tts.Communicate(text=text, voice=voice, rate=rate, volume=volume)
    await communicate.save(str(out_path))

def synth_voice(persona_id: str, voice: str, text: str, rate: str = "+0%", volume: str = "+0%") -> str:
    """
    Generate full speech for the provided text and return the .mp3 path.
    Guarantees complete synthesis (no cut audio) and caches results.
    """
    rate = _norm_pct(rate)
    volume = _norm_pct(volume)
    key = _cache_key(persona_id, voice, text, rate, volume)
    out_path = AUDIO_DIR / f"{persona_id}_{key}.mp3"
    if out_path.exists():
        return str(out_path)

    # --- Persistent event loop ensures full completion ---
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            coro = _synth_async(text, voice, out_path, rate, volume)
            asyncio.ensure_future(coro)
            loop.run_until_complete(coro)
        else:
            loop.run_until_complete(_synth_async(text, voice, out_path, rate, volume))
    except RuntimeError:
        # Fallback if no loop
        asyncio.run(_synth_async(text, voice, out_path, rate, volume))
    return str(out_path)

def list_voices() -> list:
    async def _list():
        return await edge_tts.list_voices()
    return asyncio.run(_list())

async def generate_audio_edge(text: str, voice: str, rate: str = "+0%", volume: str = "+0%") -> bytes:
    """
    Generate audio and return as bytes for API responses.
    Compatible with FastAPI async endpoints.
    """
    import io
    communicate = edge_tts.Communicate(text=text, voice=voice, rate=rate, volume=volume)
    audio_bytes = io.BytesIO()

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_bytes.write(chunk["data"])

    return audio_bytes.getvalue()
