"""Generate a Manim scene file per reel.

Each scene imports from `scenes.base_scene` and `branding.intro_outro`.
We write a small Python file that subclasses `ReelScene` and describes
topic-specific visual beats as a list of `VisualBeat(...)` entries.

If a lesson-specific scene already exists (e.g. hand-tuned), we skip it.
Running Manim is left to `compositor.py` (or the CLI).
"""
from __future__ import annotations

import textwrap
from pathlib import Path

from config import settings
from pipeline.load_titles import get_day


SCENE_TEMPLATE = '''\
"""Auto-generated Manim scene for day {day}.

You can (and should!) hand-edit this file with richer animations once
the script+voice feels right. The pipeline will NOT regenerate this
file if it already exists.
"""
from manim import *
from scenes.base_scene import ReelScene, VisualBeat


class Day{day:02d}Scene(ReelScene):
    TITLE = {title!r}
    HOOK_STYLE = {hook_style!r}
    CTA = {cta!r}

    def beats(self):
        return [
            VisualBeat(
                kind="title_card",
                duration=3.0,
                props={{"text": self.TITLE, "mood": {mood!r}}},
            ),
            VisualBeat(
                kind="diagram",
                duration=12.0,
                # TODO: replace with a topic-specific diagram
                props={{"nodes": ["Client", "Router", "Server"],
                        "edges": [(0, 1), (1, 2)],
                        "label": "Concept overview"}},
            ),
            VisualBeat(
                kind="packet_flow",
                duration=12.0,
                props={{"steps": ["Request", "Route", "Response"]}},
            ),
            VisualBeat(
                kind="payoff_card",
                duration=12.0,
                props={{"text": "Aha moment!",
                        "bullets": ["Point 1", "Point 2", "Point 3"]}},
            ),
            VisualBeat(
                kind="cta_card",
                duration=6.0,
                props={{"text": self.CTA}},
            ),
        ]
'''


def generate_scene(day: int, force: bool = False) -> Path:
    settings.ensure_dirs()
    reel = get_day(day)

    out = settings.SCENES_DIR / f"day_{day:02d}_scene.py"
    if out.exists() and not force:
        return out

    from config.style import theme_for
    theme = theme_for(reel.hook_style)

    content = SCENE_TEMPLATE.format(
        day=reel.day_number,
        title=reel.title,
        hook_style=reel.hook_style,
        cta=reel.cta,
        mood=theme["mood"],
    )
    out.write_text(textwrap.dedent(content), encoding="utf-8")
    return out
