"""Load and query the master titles JSON."""
from __future__ import annotations

import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from config import settings


@dataclass
class Reel:
    day_number: int
    title: str
    topic_category: str
    hook_style: str
    cta: str


@lru_cache(maxsize=1)
def load_all() -> list[Reel]:
    path: Path = settings.TITLES_JSON
    if not path.exists():
        raise FileNotFoundError(f"Titles JSON not found at {path}")
    data = json.loads(path.read_text(encoding="utf-8"))
    return [Reel(**row) for row in data]


def get_day(day: int) -> Reel:
    for r in load_all():
        if r.day_number == day:
            return r
    raise ValueError(f"No reel found for day {day}")


def all_days() -> list[int]:
    return [r.day_number for r in load_all()]
