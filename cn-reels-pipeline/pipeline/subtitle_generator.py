"""Generate burned-in-ready SRT subtitles from the narration mp3.

Strategy:
  1. Run faster-whisper / openai-whisper on the voiceover.
  2. Chunk into <=5-word / <=2-sec segments for reel-friendly pacing.
  3. Emit an SRT file.

If whisper isn't available we fall back to a naive time-split over the
raw script text (less accurate but keeps the pipeline unblocked).
"""
from __future__ import annotations

from pathlib import Path

from config import settings
from pipeline.script_generator import load_narration


def _format_ts(t: float) -> str:
    h = int(t // 3600)
    m = int((t % 3600) // 60)
    s = int(t % 60)
    ms = int((t - int(t)) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def _write_srt(segments: list[tuple[float, float, str]], path: Path) -> None:
    lines = []
    for i, (start, end, text) in enumerate(segments, 1):
        lines.append(str(i))
        lines.append(f"{_format_ts(start)} --> {_format_ts(end)}")
        lines.append(text.strip())
        lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


def _whisper_segments(audio: Path) -> list[tuple[float, float, str]]:
    import whisper  # openai-whisper
    model = whisper.load_model("base")
    result = model.transcribe(str(audio), language="hi", word_timestamps=True)

    segs: list[tuple[float, float, str]] = []
    for seg in result.get("segments", []):
        words = seg.get("words") or []
        if not words:
            segs.append((seg["start"], seg["end"], seg["text"].strip()))
            continue
        # group into chunks of ~5 words
        chunk: list[dict] = []
        for w in words:
            chunk.append(w)
            if len(chunk) >= 5:
                segs.append((chunk[0]["start"], chunk[-1]["end"],
                             " ".join(c["word"].strip() for c in chunk)))
                chunk = []
        if chunk:
            segs.append((chunk[0]["start"], chunk[-1]["end"],
                         " ".join(c["word"].strip() for c in chunk)))
    return segs


def _naive_segments(text: str, total_seconds: float) -> list[tuple[float, float, str]]:
    words = text.split()
    if not words:
        return []
    chunks = [" ".join(words[i:i + 5]) for i in range(0, len(words), 5)]
    per = total_seconds / len(chunks)
    return [(i * per, (i + 1) * per, c) for i, c in enumerate(chunks)]


def generate_subtitles(day: int, force: bool = False) -> Path:
    settings.ensure_dirs()
    out = settings.SUBTITLES_DIR / f"day_{day:02d}.srt"
    if out.exists() and not force:
        return out

    audio = settings.VOICE_DIR / f"day_{day:02d}.mp3"
    if not audio.exists():
        raise FileNotFoundError(f"Voice file missing for day {day}: {audio}")

    try:
        segs = _whisper_segments(audio)
    except Exception as e:
        print(f"  [subtitles] Whisper unavailable ({e}); using naive split.")
        narration = load_narration(day)
        # rough duration from mp3 via pydub
        try:
            from pydub import AudioSegment
            dur = len(AudioSegment.from_file(audio)) / 1000.0
        except Exception:
            dur = settings.TARGET_DURATION
        segs = _naive_segments(narration, dur)

    _write_srt(segs, out)
    return out
