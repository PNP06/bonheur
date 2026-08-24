#!/usr/bin/env python3
"""Build lightweight WebP variants from the print illustrations."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]


def build_edition(edition: str, max_size: int, quality: int) -> tuple[int, int]:
    data_path = ROOT / "Artheureux" / "data" / f"{edition}.json"
    data = json.loads(data_path.read_text(encoding="utf-8"))
    built = 0
    missing = 0

    for rule in data["rules"]:
        image = rule["image"]
        if image.get("status") != "ready":
            continue

        source = ROOT / "Artheureux" / image["print_path"]
        target = ROOT / "Artheureux" / image["web_path"]
        if not source.exists():
            print(f"MISSING {source}")
            missing += 1
            continue

        target.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(source) as opened:
            rendered = opened.convert("RGB")
            rendered.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            rendered.save(target, "WEBP", quality=quality, method=6)
        print(f"WROTE {target.relative_to(ROOT)} {rendered.width}x{rendered.height}")
        built += 1

    return built, missing


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--edition", choices=("adult", "youth", "all"), default="all")
    parser.add_argument("--max-size", type=int, default=960)
    parser.add_argument("--quality", type=int, default=82)
    args = parser.parse_args()

    editions = ("adult", "youth") if args.edition == "all" else (args.edition,)
    built = 0
    missing = 0
    for edition in editions:
        edition_built, edition_missing = build_edition(edition, args.max_size, args.quality)
        built += edition_built
        missing += edition_missing

    print(f"DONE built={built} missing={missing}")
    return 1 if missing else 0


if __name__ == "__main__":
    raise SystemExit(main())
