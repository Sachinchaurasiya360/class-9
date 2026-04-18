"""Generate a 45-second Hinglish reel script for a given day.

Flow:
  1. Pick a script template based on `hook_style`.
  2. Fill in topic-specific beats (hook, body, payoff, CTA).
  3. Optionally polish via OpenAI if OPENAI_API_KEY is set.

Output: `scripts/day_NN.md` — frontmatter + clean narration text.

The narration text (no markdown) is what gets fed to Inworld TTS.
"""
from __future__ import annotations

import os
import re
import textwrap
from pathlib import Path

from config import settings
from pipeline.load_titles import Reel, get_day


# ---- 45-second budget ----
# Hinglish narration ~ 2.3 words/sec → ~100-110 words total for 45s.
# Leave ~3s of tail for the CTA card, so target ~95 words of VO.

HOOK_TEMPLATES = {
    "shock-statistic":     "Ruk! {shock_claim}. Yakeen nahi hoga, par sach hai.",
    "myth-buster":         "Tereko laga {myth}? Galat! Sach ye hai —",
    "curiosity-breakdown": "Kya tune kabhi socha {question}? Aaj 45 second me full breakdown.",
    "desi-analogy":        "Ye concept samajhna hai? Bas {analogy} yaad rakh.",
    "comparison-battle":   "{thing_a} vs {thing_b} — asli fark kya hai? Dekh.",
    "interview-trap":      "Interviewer ye sawal pooche to 90% freshers fas jaate hain —",
    "conspiracy-style":    "Companies tereko ye nahi batati, par main bata raha hu —",
    "story-reveal":        "Ek second, ye real story sun —",
    "question-hook":       "{question}? Chal samajhte hain 45 second me.",
    "future-prediction":   "2027 tak {prediction}. Par kyun? Ye raha reason —",
    "warning-hook":        "Sawdhan! {warning}. Aaj iska fix bhi dikhaunga.",
    "try-this-yourself":   "Ruk, phone niche rakh. Ye try karke dekh abhi —",
}

BODY_SCAFFOLD = """
{hook_line}

[2s] {setup}

[10s] {core_concept}

[20s] {visual_beat}

[30s] {payoff}

[40s] {cta_line}
"""


def _slugify(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def _cta_line(cta: str, day: int) -> str:
    cta_text = cta.replace("Day X", f"Day {day + 1}").replace("Day 2", f"Day {day + 1}")
    return f"{cta_text}. Milte hain kal!"


def _base_script(reel: Reel) -> str:
    """Template-only script (no LLM). Always runs; LLM polish is optional."""
    hook_tmpl = HOOK_TEMPLATES.get(reel.hook_style, HOOK_TEMPLATES["curiosity-breakdown"])

    placeholders = {
        "shock_claim": reel.title,
        "myth": reel.title.split("—")[0].strip(),
        "question": reel.title.rstrip("?"),
        "analogy": "ghar ka postman",
        "thing_a": "Option A",
        "thing_b": "Option B",
        "prediction": reel.title,
        "warning": reel.title,
    }
    hook_line = hook_tmpl.format_map(_SafeDict(placeholders))

    body = BODY_SCAFFOLD.format(
        hook_line=hook_line,
        setup=f"Aaj ka topic: {reel.title}.",
        core_concept="[CORE CONCEPT PLACEHOLDER — describe the 'what' in 2 Hinglish lines]",
        visual_beat="[VISUAL BEAT PLACEHOLDER — describe the animation happening on screen]",
        payoff="[PAYOFF PLACEHOLDER — the 'aha' moment, 1-2 lines]",
        cta_line=_cta_line(reel.cta, reel.day_number),
    )
    return textwrap.dedent(body).strip()


class _SafeDict(dict):
    def __missing__(self, key):
        return "{" + key + "}"


# ------------------------------------------------------------------
# Optional LLM polish
# ------------------------------------------------------------------
def _polish_with_llm(reel: Reel, draft: str) -> str:
    if not settings.OPENAI_API_KEY:
        return draft
    try:
        from openai import OpenAI
    except ImportError:
        return draft

    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    prompt = f"""
Rewrite this draft into a clean 45-second Hinglish reel script for Instagram/YouTube Shorts.

Context:
- Day {reel.day_number} of a 50-day CN series
- Title: {reel.title}
- Topic category: {reel.topic_category}
- Hook style: {reel.hook_style}
- CTA: {reel.cta}

Rules:
- Total word count: 95-110 words (Hinglish, natural — not pure English, not pure Hindi).
- Hook in the FIRST 3 seconds (first sentence must grab attention).
- Explain ONE concept clearly with a real-world or desi analogy.
- End with the CTA: "{reel.cta}".
- Output ONLY the narration text (no stage directions, no markdown, no timestamps).
- Use short sentences (max 12 words each).
- Punchy tone, viral, like Internshala/InternHack CS reels.

Draft:
{draft}
""".strip()

    resp = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.8,
    )
    return resp.choices[0].message.content.strip()


# ------------------------------------------------------------------
# Public API
# ------------------------------------------------------------------
def generate(day: int, force: bool = False) -> Path:
    settings.ensure_dirs()
    reel = get_day(day)
    out_path = settings.SCRIPTS_DIR / f"day_{day:02d}.md"

    if out_path.exists() and not force:
        return out_path

    draft = _base_script(reel)
    narration = _polish_with_llm(reel, draft)

    frontmatter = (
        "---\n"
        f"day: {reel.day_number}\n"
        f"title: {reel.title!r}\n"
        f"topic_category: {reel.topic_category}\n"
        f"hook_style: {reel.hook_style}\n"
        f"cta: {reel.cta!r}\n"
        f"slug: {_slugify(reel.title)[:60]}\n"
        "---\n\n"
    )

    out_path.write_text(frontmatter + narration + "\n", encoding="utf-8")
    return out_path


def load_narration(day: int) -> str:
    """Return just the narration body (for TTS), stripping frontmatter."""
    path = settings.SCRIPTS_DIR / f"day_{day:02d}.md"
    text = path.read_text(encoding="utf-8")
    parts = text.split("---", 2)
    body = parts[2] if len(parts) >= 3 else text
    # Strip stage directions like [2s], [PAYOFF PLACEHOLDER]
    body = re.sub(r"\[[^\]]*\]", "", body)
    return body.strip()
