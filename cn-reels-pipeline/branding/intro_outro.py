"""Reusable 1.5-second intro + 2-second outro Manim scenes.

Not auto-composited yet — wire into compositor.py when the brand
wordmark / sting is finalized. Kept here so day_NN_scene.py files
can opt-in via `self.play(intro_sting(self))`.
"""
from __future__ import annotations

from manim import (
    VGroup, Text, Rectangle, FadeIn, FadeOut, Write, Scene,
    UP, DOWN, ORIGIN,
)

from config.style import BRAND, FONT_FAMILY


def intro_sting(scene: Scene, brand_name: str = "CN Daily") -> None:
    bar = Rectangle(width=6, height=0.12, fill_color=BRAND["primary"],
                    fill_opacity=1, stroke_opacity=0).move_to(ORIGIN).shift(DOWN * 0.6)
    wordmark = Text(brand_name, font=FONT_FAMILY, weight="BOLD",
                    color=BRAND["text"]).scale(1.0)
    scene.play(Write(wordmark, run_time=0.7))
    scene.play(FadeIn(bar, shift=UP * 0.3, run_time=0.3))
    scene.wait(0.3)
    scene.play(FadeOut(VGroup(wordmark, bar), run_time=0.2))


def outro_sting(scene: Scene, handle: str = "@cn.daily") -> None:
    handle_text = Text(handle, font=FONT_FAMILY, weight="BOLD",
                       color=BRAND["primary"]).scale(0.9)
    tag = Text("Day-by-day Computer Networks", font=FONT_FAMILY,
               color=BRAND["text_muted"]).scale(0.45)
    group = VGroup(handle_text, tag).arrange(DOWN, buff=0.3)
    scene.play(FadeIn(group, run_time=0.5))
    scene.wait(1.2)
    scene.play(FadeOut(group, run_time=0.3))
