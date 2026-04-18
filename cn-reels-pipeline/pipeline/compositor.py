"""Final composition: run Manim, mix narration + BGM + subtitles, export MP4."""
from __future__ import annotations

import subprocess
import sys
import textwrap
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

from config import settings


def _find_font(size: int) -> ImageFont.FreeTypeFont:
    """Pick a decent UI font without requiring ImageMagick."""
    candidates = []
    fonts_dir = settings.FONTS_DIR
    if fonts_dir.exists():
        candidates.extend(sorted(fonts_dir.glob("*.ttf")))
        candidates.extend(sorted(fonts_dir.glob("*.otf")))
    candidates.extend([
        Path("C:/Windows/Fonts/segoeuib.ttf"),   # Segoe UI Bold
        Path("C:/Windows/Fonts/arialbd.ttf"),    # Arial Bold
        Path("C:/Windows/Fonts/arial.ttf"),
        Path("/System/Library/Fonts/Helvetica.ttc"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
    ])
    for p in candidates:
        try:
            return ImageFont.truetype(str(p), size)
        except Exception:
            continue
    return ImageFont.load_default()


def _render_caption_image(text: str, max_width: int, font_size: int = 56) -> np.ndarray:
    """Render Hinglish caption to an RGBA numpy array (PIL, no ImageMagick)."""
    font = _find_font(font_size)

    # Word-wrap to fit max_width using a measuring pass.
    dummy = Image.new("RGBA", (10, 10))
    d = ImageDraw.Draw(dummy)
    words = text.split()
    lines: list[str] = []
    cur = ""
    for w in words:
        probe = (cur + " " + w).strip()
        width = d.textbbox((0, 0), probe, font=font)[2]
        if width <= max_width or not cur:
            cur = probe
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)

    line_heights = [d.textbbox((0, 0), ln or "A", font=font)[3] for ln in lines]
    pad_x, pad_y = 30, 20
    gap = 10
    box_w = max(d.textbbox((0, 0), ln, font=font)[2] for ln in lines) + pad_x * 2
    box_h = sum(line_heights) + gap * (len(lines) - 1) + pad_y * 2

    img = Image.new("RGBA", (box_w, box_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    # Semi-transparent bg so captions stay readable over any beat.
    draw.rounded_rectangle(
        [(0, 0), (box_w - 1, box_h - 1)],
        radius=18,
        fill=(0, 0, 0, 140),
    )

    y = pad_y
    for ln, lh in zip(lines, line_heights):
        tw = d.textbbox((0, 0), ln, font=font)[2]
        x = (box_w - tw) // 2
        # Stroke for readability.
        draw.text((x, y), ln, font=font, fill=(255, 255, 255, 255),
                  stroke_width=3, stroke_fill=(0, 0, 0, 255))
        y += lh + gap

    return np.array(img)


def render_manim(day: int) -> Path:
    """Invoke Manim CLI to render the generated scene."""
    scene_file = settings.SCENES_DIR / f"day_{day:02d}_scene.py"
    if not scene_file.exists():
        raise FileNotFoundError(scene_file)

    class_name = f"Day{day:02d}Scene"

    # Manim renders into media/videos/<scene_file_stem>/<quality>/<ClassName>.mp4
    # We force 1080x1920 via --resolution; -qm = medium quality, -qh = high.
    cmd = [
        sys.executable, "-m", "manim",
        str(scene_file),
        class_name,
        "-qh",
        "--resolution", f"{settings.VIDEO_WIDTH},{settings.VIDEO_HEIGHT}",
        "--fps", str(settings.VIDEO_FPS),
        "--media_dir", str(settings.MEDIA_DIR),
        "--disable_caching",
    ]
    subprocess.run(cmd, check=True)

    # Locate the rendered file.
    rendered_dir = settings.MEDIA_DIR / "videos" / scene_file.stem
    candidates = list(rendered_dir.rglob(f"{class_name}.mp4"))
    if not candidates:
        raise FileNotFoundError(f"Rendered Manim video not found under {rendered_dir}")
    # Pick the most recent one.
    return max(candidates, key=lambda p: p.stat().st_mtime)


def compose_final(day: int, force: bool = False) -> Path:
    """Combine Manim video + narration + BGM + burned-in subtitles."""
    from moviepy.editor import (
        VideoFileClip, AudioFileClip, CompositeAudioClip, CompositeVideoClip,
        ImageClip,
    )
    import pysrt

    settings.ensure_dirs()
    out = settings.OUTPUT_DIR / f"day_{day:02d}_final.mp4"
    if out.exists() and not force:
        return out

    video_path = render_manim(day)
    voice_path = settings.VOICE_DIR / f"day_{day:02d}.mp3"
    srt_path = settings.SUBTITLES_DIR / f"day_{day:02d}.srt"

    video = VideoFileClip(str(video_path))
    narration = AudioFileClip(str(voice_path))

    # Match video length to narration duration (video is usually close already).
    final_duration = min(narration.duration, video.duration)
    video = video.subclip(0, final_duration)
    narration = narration.subclip(0, final_duration)

    audio_tracks = [narration]
    if settings.DEFAULT_BGM.exists():
        bgm = (AudioFileClip(str(settings.DEFAULT_BGM))
               .volumex(settings.BGM_VOLUME)
               .subclip(0, final_duration))
        audio_tracks.append(bgm)
    video = video.set_audio(CompositeAudioClip(audio_tracks))

    # Burn subtitles — PIL-based so no ImageMagick needed.
    subtitle_clips = []
    if srt_path.exists():
        max_w = settings.VIDEO_WIDTH - 160
        subs = pysrt.open(str(srt_path), encoding="utf-8")
        for sub in subs:
            start = sub.start.ordinal / 1000.0
            end = max(start + 0.4, sub.end.ordinal / 1000.0)
            img_arr = _render_caption_image(sub.text, max_w)
            clip = (ImageClip(img_arr)
                    .set_duration(end - start)
                    .set_start(start)
                    .set_position(("center", settings.VIDEO_HEIGHT - 500)))
            subtitle_clips.append(clip)

    if subtitle_clips:
        video = CompositeVideoClip([video, *subtitle_clips])

    video.write_videofile(
        str(out),
        fps=settings.VIDEO_FPS,
        codec="libx264",
        audio_codec="aac",
        preset="medium",
        threads=4,
    )
    return out
