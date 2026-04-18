"""Inworld TTS integration.

Inworld exposes a REST API for text-to-speech. This module wraps the
single-shot synthesis endpoint and writes an mp3 per day.

Set `INWORLD_API_KEY` and `INWORLD_VOICE_ID` in .env. If the base URL
or auth scheme for your Inworld account differs (Runtime vs Studio),
tweak `synthesize()` — everything else is stable.
"""
from __future__ import annotations

from pathlib import Path

import requests

from config import settings
from pipeline.script_generator import load_narration


def synthesize(text: str, voice_id: str | None = None) -> bytes:
    """Call Inworld TTS and return the raw audio bytes (mp3)."""
    api_key = settings.INWORLD_API_KEY
    if not api_key:
        raise RuntimeError("INWORLD_API_KEY not set in .env")

    vid = voice_id or settings.INWORLD_VOICE_ID
    if not vid:
        raise RuntimeError("INWORLD_VOICE_ID not set in .env")

    url = f"{settings.INWORLD_BASE_URL.rstrip('/')}/voice"
    headers = {
        "Authorization": f"Basic {api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    payload = {
        "text": text,
        "voiceId": vid,
        "modelId": settings.INWORLD_MODEL_ID,
        "audioConfig": {
            "audioEncoding": "MP3",
            "sampleRateHertz": 44100,
            "bitRate": 128000,
        },
        "temperature": 1.0,
    }

    resp = requests.post(url, json=payload, headers=headers, timeout=60)
    resp.raise_for_status()

    # Inworld may return raw audio OR a JSON wrapper — handle both.
    ctype = resp.headers.get("Content-Type", "")
    if "audio" in ctype:
        return resp.content

    data = resp.json()
    import base64
    b64 = data.get("audioContent") or data.get("audio") or data.get("audioBase64")
    if not b64:
        raise RuntimeError(f"Unexpected Inworld response shape: {data}")
    return base64.b64decode(b64)


def generate_voice(day: int, force: bool = False) -> Path:
    settings.ensure_dirs()
    out = settings.VOICE_DIR / f"day_{day:02d}.mp3"
    if out.exists() and not force:
        return out

    narration = load_narration(day)
    audio_bytes = synthesize(narration)
    out.write_bytes(audio_bytes)
    return out
