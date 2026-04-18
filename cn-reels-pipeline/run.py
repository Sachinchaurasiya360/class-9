"""CLI entry point.

Usage:
  python run.py build --day 1
  python run.py build --day 1 --force
  python run.py script --day 3
  python run.py voice --day 3
  python run.py subs --day 3
  python run.py scene --day 3
  python run.py build-all
  python run.py list
"""
from __future__ import annotations

import argparse
import sys

from pipeline import (
    script_generator,
    tts_inworld,
    subtitle_generator,
    scene_builder,
    compositor,
    run_day,
)
from pipeline.load_titles import all_days, get_day


def _cmd_list(_args):
    for d in all_days():
        r = get_day(d)
        print(f"  Day {d:02d} [{r.hook_style:<22}] {r.title}")


def main() -> int:
    parser = argparse.ArgumentParser(prog="cn-reels")
    sub = parser.add_subparsers(dest="cmd", required=True)

    for name in ("build", "script", "voice", "subs", "scene"):
        sp = sub.add_parser(name)
        sp.add_argument("--day", type=int, required=True)
        sp.add_argument("--force", action="store_true")

    sp_all = sub.add_parser("build-all")
    sp_all.add_argument("--force", action="store_true")

    sub.add_parser("list")

    args = parser.parse_args()

    if args.cmd == "list":
        _cmd_list(args)
        return 0
    if args.cmd == "script":
        path = script_generator.generate(args.day, force=args.force)
    elif args.cmd == "voice":
        path = tts_inworld.generate_voice(args.day, force=args.force)
    elif args.cmd == "subs":
        path = subtitle_generator.generate_subtitles(args.day, force=args.force)
    elif args.cmd == "scene":
        path = scene_builder.generate_scene(args.day, force=args.force)
    elif args.cmd == "build":
        path = run_day.build(args.day, force=args.force)
    elif args.cmd == "build-all":
        paths = run_day.build_all(force=args.force)
        print(f"\nDone. {len(paths)} reels built.")
        return 0
    else:
        parser.print_help()
        return 1

    print(f"\nOutput: {path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
