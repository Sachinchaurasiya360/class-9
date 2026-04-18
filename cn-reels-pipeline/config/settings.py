"""Global settings loaded from environment + sensible defaults."""
from __future__ import annotations

import os
import shutil
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")


def _ensure_ffmpeg_on_path() -> None:
    """Manim/moviepy shell out to ffmpeg; make sure it's reachable."""
    if shutil.which("ffmpeg"):
        return
    candidates = [
        # winget default install location on Windows
        Path(os.environ.get("LOCALAPPDATA", ""))
        / "Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe",
        Path("C:/Program Files/Gyan.FFmpeg"),
    ]
    for base in candidates:
        if not base.exists():
            continue
        for exe in base.rglob("ffmpeg.exe"):
            os.environ["PATH"] = str(exe.parent) + os.pathsep + os.environ.get("PATH", "")
            return
    # Fallback to the binary bundled with imageio-ffmpeg (no ffprobe though).
    try:
        import imageio_ffmpeg
        exe = Path(imageio_ffmpeg.get_ffmpeg_exe())
        os.environ["PATH"] = str(exe.parent) + os.pathsep + os.environ.get("PATH", "")
    except Exception:
        pass


_ensure_ffmpeg_on_path()


# ---------- Paths ----------
TITLES_JSON = ROOT / "titles" / "cn_50_reels.json"
SCRIPTS_DIR = ROOT / "scripts"
VOICE_DIR = ROOT / "voice"
SUBTITLES_DIR = ROOT / "subtitles"
SCENES_DIR = ROOT / "scenes"
ASSETS_DIR = ROOT / "assets"
BGM_DIR = ASSETS_DIR / "bgm"
FONTS_DIR = ASSETS_DIR / "fonts"
LOGOS_DIR = ASSETS_DIR / "logos"
BRANDING_DIR = ROOT / "branding"
OUTPUT_DIR = ROOT / "output"
MEDIA_DIR = ROOT / "media"  # Manim writes here


# ---------- Inworld TTS ----------
INWORLD_API_KEY = os.getenv("INWORLD_API_KEY", "")
INWORLD_VOICE_ID = os.getenv("INWORLD_VOICE_ID", "")
INWORLD_BASE_URL = os.getenv("INWORLD_BASE_URL", "https://api.inworld.ai/tts/v1")
INWORLD_MODEL_ID = os.getenv("INWORLD_MODEL_ID", "inworld-tts-1.5-max")


# ---------- Optional script-polish LLM ----------
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")


# ---------- Video ----------
VIDEO_WIDTH = int(os.getenv("VIDEO_WIDTH", "1080"))
VIDEO_HEIGHT = int(os.getenv("VIDEO_HEIGHT", "1920"))
VIDEO_FPS = int(os.getenv("VIDEO_FPS", "30"))
TARGET_DURATION = float(os.getenv("TARGET_DURATION_SECONDS", "45"))


# ---------- BGM ----------
DEFAULT_BGM = BGM_DIR / "default_loop.mp3"
BGM_VOLUME = 0.15  # 0..1, relative to narration


def ensure_dirs() -> None:
    for d in (SCRIPTS_DIR, VOICE_DIR, SUBTITLES_DIR, SCENES_DIR,
              ASSETS_DIR, BGM_DIR, FONTS_DIR, LOGOS_DIR, BRANDING_DIR,
              OUTPUT_DIR, MEDIA_DIR):
        d.mkdir(parents=True, exist_ok=True)
