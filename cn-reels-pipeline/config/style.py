"""Brand/visual style — mirrors the Next.js engineering track tokens."""
from __future__ import annotations

# Matches --eng-* CSS variables in the Next.js app (globals.css).
BRAND = {
    "primary":       "#3b82f6",
    "primary_dark":  "#1d4ed8",
    "accent":        "#8b5cf6",
    "success":       "#10b981",
    "danger":        "#ef4444",
    "warning":       "#f59e0b",
    "bg":            "#0f172a",   # reels use darker bg for punch; inverse of web
    "surface":       "#1e293b",
    "text":          "#f8fafc",
    "text_muted":    "#94a3b8",
    "border":        "#334155",
}

FONT_FAMILY = "Outfit"             # place .ttf in assets/fonts/
FONT_WEIGHT_BOLD = 800
FONT_WEIGHT_MEDIUM = 500

TITLE_SIZE = 84       # px at 1080x1920
SUBTITLE_SIZE = 48
CAPTION_SIZE = 56     # hinglish burned-in subtitles

# Safe zones so captions don't collide with Instagram UI (username, like button, caption box)
SAFE_TOP = 280
SAFE_BOTTOM = 400
SAFE_LEFT = 60
SAFE_RIGHT = 60


HOOK_STYLE_THEMES = {
    "shock-statistic":    {"accent": BRAND["danger"],  "mood": "urgent"},
    "myth-buster":        {"accent": BRAND["warning"], "mood": "reveal"},
    "curiosity-breakdown":{"accent": BRAND["primary"], "mood": "explain"},
    "desi-analogy":       {"accent": BRAND["accent"],  "mood": "playful"},
    "comparison-battle":  {"accent": BRAND["warning"], "mood": "vs"},
    "interview-trap":     {"accent": BRAND["danger"],  "mood": "warning"},
    "conspiracy-style":   {"accent": BRAND["accent"],  "mood": "mystery"},
    "story-reveal":       {"accent": BRAND["primary"], "mood": "narrative"},
    "visual-metaphor":    {"accent": BRAND["success"], "mood": "illustrate"},
    "real-world-example": {"accent": BRAND["primary"], "mood": "relatable"},
    "quick-trick":        {"accent": BRAND["success"], "mood": "hack"},
    "cheat-sheet":        {"accent": BRAND["success"], "mood": "list"},
    "news-alert":         {"accent": BRAND["danger"],  "mood": "breaking"},
    "casual-hook":        {"accent": BRAND["primary"], "mood": "chill"},
    "funny-analogy":      {"accent": BRAND["accent"],  "mood": "humor"},
    "question-hook":      {"accent": BRAND["primary"], "mood": "curious"},
    "shock-reveal":       {"accent": BRAND["danger"],  "mood": "dramatic"},
    "mnemonic-hook":      {"accent": BRAND["warning"], "mood": "memorize"},
    "behind-the-scenes":  {"accent": BRAND["primary"], "mood": "reveal"},
    "warning-hook":       {"accent": BRAND["danger"],  "mood": "alert"},
    "future-prediction":  {"accent": BRAND["accent"],  "mood": "futuristic"},
    "trend-alert":        {"accent": BRAND["warning"], "mood": "trending"},
    "try-this-yourself":  {"accent": BRAND["success"], "mood": "actionable"},
    "quick-explainer":    {"accent": BRAND["primary"], "mood": "explain"},
}


def theme_for(hook_style: str) -> dict:
    return HOOK_STYLE_THEMES.get(hook_style, {"accent": BRAND["primary"], "mood": "explain"})
