"""Base Manim scene + primitive visual beats shared across all 50 reels.

Design goal: one abstract `ReelScene` + a handful of reusable primitives
(title card, diagram, packet flow, payoff card, cta card). Day-specific
scenes just declare a list of `VisualBeat` entries; beats run in order.

Every reel renders at 1080x1920 @ 30fps with the engineering-track brand.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from manim import (
    Scene, VGroup, Text, Rectangle, Circle, Arrow, RoundedRectangle,
    config, FadeIn, FadeOut, Write, Create, Transform, AnimationGroup,
    LEFT, RIGHT, UP, DOWN, ORIGIN, PI,
    rate_functions,
)

from config import settings
from config.style import BRAND, FONT_FAMILY, theme_for


# Manim global config — apply once at import.
config.pixel_width = settings.VIDEO_WIDTH
config.pixel_height = settings.VIDEO_HEIGHT
config.frame_rate = settings.VIDEO_FPS
config.background_color = BRAND["bg"]


@dataclass
class VisualBeat:
    kind: str
    duration: float
    props: dict[str, Any] = field(default_factory=dict)


class ReelScene(Scene):
    """Subclasses define `TITLE`, `HOOK_STYLE`, `CTA`, and `beats()`."""

    TITLE: str = ""
    HOOK_STYLE: str = "curiosity-breakdown"
    CTA: str = "Follow for more"

    # ---- Entry point ----
    def construct(self):
        self.theme = theme_for(self.HOOK_STYLE)
        for beat in self.beats():
            handler = getattr(self, f"_render_{beat.kind}", None)
            if handler is None:
                self._render_generic(beat)
            else:
                handler(beat)

    def beats(self) -> list[VisualBeat]:
        raise NotImplementedError

    # ------------------------------------------------------------------
    # Primitives — each consumes a VisualBeat and advances time by its
    # `duration`. Feel free to extend / override these per reel.
    # ------------------------------------------------------------------
    def _render_title_card(self, beat: VisualBeat):
        text = beat.props.get("text", self.TITLE)
        accent = self.theme["accent"]

        bar = Rectangle(width=6, height=0.2, fill_color=accent,
                        fill_opacity=1, stroke_opacity=0).to_edge(UP, buff=2)

        title = Text(text, font=FONT_FAMILY, weight="BOLD",
                     color=BRAND["text"]).scale(0.7)
        title.next_to(bar, DOWN, buff=0.8)

        self.play(FadeIn(bar, shift=DOWN, run_time=0.4))
        self.play(Write(title, run_time=1.2))
        self.wait(max(0.1, beat.duration - 1.6))
        self.play(FadeOut(VGroup(bar, title), run_time=0.4))

    def _render_diagram(self, beat: VisualBeat):
        nodes = beat.props.get("nodes", [])
        edges = beat.props.get("edges", [])
        label = beat.props.get("label", "")
        accent = self.theme["accent"]

        circles = []
        labels = []
        n = len(nodes)
        spacing = 3.0
        start_x = -spacing * (n - 1) / 2

        for i, name in enumerate(nodes):
            c = Circle(radius=0.7, color=accent, fill_color=BRAND["surface"],
                       fill_opacity=1).move_to([start_x + i * spacing, 0, 0])
            lbl = Text(name, font=FONT_FAMILY, weight="MEDIUM",
                       color=BRAND["text"]).scale(0.5).next_to(c, DOWN, buff=0.25)
            circles.append(c)
            labels.append(lbl)

        arrows = [Arrow(circles[a].get_right(), circles[b].get_left(),
                        color=accent, buff=0.15, stroke_width=5)
                  for a, b in edges]

        caption = Text(label, font=FONT_FAMILY, color=BRAND["text_muted"]) \
            .scale(0.5).to_edge(UP, buff=3)

        self.play(FadeIn(VGroup(*circles), lag_ratio=0.2, run_time=1.0))
        self.play(Write(VGroup(*labels), run_time=0.8))
        for a in arrows:
            self.play(Create(a, run_time=0.4))
        if label:
            self.play(FadeIn(caption, run_time=0.4))

        used = 1.0 + 0.8 + 0.4 * len(arrows) + (0.4 if label else 0)
        self.wait(max(0.1, beat.duration - used))
        self.play(FadeOut(VGroup(*circles, *labels, *arrows, caption), run_time=0.4))

    def _render_packet_flow(self, beat: VisualBeat):
        steps: list[str] = beat.props.get("steps", [])
        accent = self.theme["accent"]

        rails_y = 0
        start = [-6, rails_y, 0]
        end = [6, rails_y, 0]

        line = Arrow(start, end, color=BRAND["border"], stroke_width=3, buff=0)
        packet = RoundedRectangle(width=0.9, height=0.5, corner_radius=0.15,
                                  fill_color=accent, fill_opacity=1,
                                  stroke_opacity=0).move_to(start)

        self.play(Create(line, run_time=0.6))
        self.play(FadeIn(packet, run_time=0.3))

        per_step = max(0.5, (beat.duration - 1.5) / max(1, len(steps)))
        for i, step in enumerate(steps):
            target_x = start[0] + (i + 1) * (12 / max(1, len(steps)))
            label = Text(step, font=FONT_FAMILY, weight="BOLD",
                         color=BRAND["text"]).scale(0.55)
            label.next_to([target_x, rails_y, 0], UP, buff=0.8)
            self.play(
                packet.animate.move_to([target_x, rails_y, 0]),
                FadeIn(label, shift=UP),
                run_time=per_step,
                rate_func=rate_functions.ease_in_out_sine,
            )

        self.wait(0.3)
        self.play(FadeOut(VGroup(line, packet), run_time=0.4))

    def _render_payoff_card(self, beat: VisualBeat):
        text = beat.props.get("text", "Aha moment!")
        bullets = beat.props.get("bullets", [])
        accent = self.theme["accent"]

        title = Text(text, font=FONT_FAMILY, weight="BOLD",
                     color=accent).scale(0.8).to_edge(UP, buff=3)
        bullet_texts = VGroup(*[
            Text(f"• {b}", font=FONT_FAMILY, color=BRAND["text"]).scale(0.55)
            for b in bullets
        ]).arrange(DOWN, aligned_edge=LEFT, buff=0.4).next_to(title, DOWN, buff=1.0)

        self.play(FadeIn(title, run_time=0.6))
        self.play(Write(bullet_texts, run_time=1.4))
        self.wait(max(0.1, beat.duration - 2.0))
        self.play(FadeOut(VGroup(title, bullet_texts), run_time=0.4))

    def _render_cta_card(self, beat: VisualBeat):
        text = beat.props.get("text", self.CTA)
        accent = self.theme["accent"]

        box = RoundedRectangle(width=8, height=3, corner_radius=0.4,
                               fill_color=BRAND["surface"], fill_opacity=1,
                               color=accent, stroke_width=4)
        label = Text(text, font=FONT_FAMILY, weight="BOLD",
                     color=BRAND["text"]).scale(0.75)
        group = VGroup(box, label)

        self.play(FadeIn(group, scale=0.8, run_time=0.6))
        self.wait(max(0.1, beat.duration - 1.2))
        self.play(FadeOut(group, run_time=0.6))

    def _render_generic(self, beat: VisualBeat):
        # Unknown beat type — just hold brand-color frame for its duration.
        placeholder = Text(f"[{beat.kind}]", font=FONT_FAMILY,
                           color=BRAND["text_muted"]).scale(0.5)
        self.play(FadeIn(placeholder, run_time=0.3))
        self.wait(max(0.1, beat.duration - 0.6))
        self.play(FadeOut(placeholder, run_time=0.3))
