"""Orchestrate the full pipeline for a single day."""
from __future__ import annotations

from pathlib import Path

from config import settings
from pipeline import script_generator, tts_inworld, subtitle_generator, scene_builder, compositor
from pipeline.load_titles import get_day


def build(day: int, force: bool = False) -> Path:
    """Run every stage for one day and return the final mp4 path."""
    reel = get_day(day)
    print(f"\n=== Day {day:02d} — {reel.title} ===")

    print("[1/5] Generating script...")
    script_path = script_generator.generate(day, force=force)
    print(f"      → {script_path}")

    print("[2/5] Generating Inworld voiceover...")
    voice_path = tts_inworld.generate_voice(day, force=force)
    print(f"      → {voice_path}")

    print("[3/5] Generating subtitles...")
    srt_path = subtitle_generator.generate_subtitles(day, force=force)
    print(f"      → {srt_path}")

    print("[4/5] Generating Manim scene file...")
    scene_path = scene_builder.generate_scene(day, force=force)
    print(f"      → {scene_path}")

    print("[5/5] Rendering + composing final MP4...")
    out = compositor.compose_final(day, force=force)
    print(f"      → {out}")

    return out


def build_all(force: bool = False) -> list[Path]:
    from pipeline.load_titles import all_days
    results = []
    for d in all_days():
        final = settings.OUTPUT_DIR / f"day_{d:02d}_final.mp4"
        if final.exists() and not force:
            print(f"Day {d:02d} already rendered — skip.")
            results.append(final)
            continue
        try:
            results.append(build(d, force=force))
        except Exception as e:
            print(f"!! Day {d:02d} failed: {e}")
    return results
