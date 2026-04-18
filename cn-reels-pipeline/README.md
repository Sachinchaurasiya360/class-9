# CN Reels Pipeline

Automated video pipeline for the **50-day Computer Networks Reels series** (Instagram Reels / YouTube Shorts).

Each reel: **1080×1920 vertical, 45 seconds, Hinglish narration, hook-first, subtitled, branded**.

## Flow

```
titles/cn_50_reels.json
        │
        ▼
  [script_generator]   → scripts/day_NN.md
        │
        ▼
  [tts_inworld]        → voice/day_NN.mp3
        │
        ▼
  [subtitle_generator] → subtitles/day_NN.srt
        │
        ▼
  [scene_builder]      → scenes/day_NN_scene.py  (Manim)
        │
        ▼
  [compositor]         → output/day_NN_final.mp4  (MoviePy + FFmpeg)
```

## Setup

```bash
python -m venv .venv
.venv\Scripts\activate           # Windows
# source .venv/bin/activate      # Mac/Linux

pip install -r requirements.txt

copy .env.example .env           # then fill in INWORLD_API_KEY + INWORLD_VOICE_ID
```

You also need **FFmpeg** on PATH (Manim + MoviePy both rely on it).

## Usage

```bash
# End-to-end for one day
python run.py build --day 1

# Only regenerate the script
python run.py script --day 1

# Only regenerate TTS
python run.py voice --day 1

# Batch: build every reel that hasn't been rendered yet
python run.py build-all
```

## Folder Layout

| Folder        | Contents                                          |
|---------------|---------------------------------------------------|
| `titles/`     | Master 50-reel JSON (day, title, hook_style, cta) |
| `config/`     | Settings, brand style (colors, fonts)             |
| `scripts/`    | Generated 45-sec Hinglish scripts (`day_NN.md`)   |
| `voice/`      | Inworld TTS narration mp3s                        |
| `subtitles/`  | SRT subtitle files                                |
| `scenes/`     | Manim scene files per reel + shared base         |
| `assets/`     | BGM, fonts, logos, reusable icons/graphics        |
| `branding/`   | Intro/outro/lower-third Manim components          |
| `output/`     | Final rendered MP4s ready to upload              |
| `pipeline/`   | Orchestration Python modules                      |

## Customizing

- **Brand colors / font** — [config/style.py](config/style.py). Matches the engineering track of the Next.js app (`#3b82f6` primary, Outfit font).
- **Script template per hook style** — [pipeline/script_generator.py](pipeline/script_generator.py) has a template per hook (shock-statistic, myth-buster, desi-analogy, etc.).
- **Inworld voice** — set `INWORLD_VOICE_ID` in `.env`. Swap to any Hinglish voice.
- **Background music** — drop tracks into `assets/bgm/` and reference from `config/settings.py`.
