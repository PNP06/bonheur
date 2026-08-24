#!/usr/bin/env python3
"""Validate print and web image assets against the canonical rule metadata."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
PRINT_WIDTH = {"adult": 4.0, "youth": 4.1}
RULE_FILE = re.compile(r"rule-(\d{2})\.png$")


def validate_edition(edition: str, strict: bool) -> list[str]:
    errors: list[str] = []
    data = json.loads(
        (ROOT / "Artheureux" / "data" / f"{edition}.json").read_text(encoding="utf-8")
    )
    ready = 0

    for rule in data["rules"]:
        image = rule["image"]
        print_path = ROOT / "Artheureux" / image["print_path"]
        web_path = ROOT / "Artheureux" / image["web_path"]
        exists = print_path.exists()

        if image.get("status") == "ready":
            ready += 1
            if not exists:
                errors.append(f"{edition} rule {rule['order']:02d}: ready print image missing")
                continue
        elif exists:
            errors.append(f"{edition} rule {rule['order']:02d}: print image exists but status is not ready")
        elif strict:
            errors.append(f"{edition} rule {rule['order']:02d}: print image is not ready")
            continue
        else:
            continue

        try:
            with Image.open(print_path) as opened:
                width, height = opened.size
                if width != height:
                    errors.append(f"{edition} rule {rule['order']:02d}: print image is not square ({width}x{height})")
                effective_dpi = width / PRINT_WIDTH[edition]
                if effective_dpi < 300:
                    errors.append(
                        f"{edition} rule {rule['order']:02d}: {effective_dpi:.1f} effective DPI < 300"
                    )
                if opened.format != "PNG":
                    errors.append(f"{edition} rule {rule['order']:02d}: print image is {opened.format}, expected PNG")
        except Exception as exc:  # Pillow provides the useful corruption details.
            errors.append(f"{edition} rule {rule['order']:02d}: unreadable print image ({exc})")

        if not web_path.exists():
            errors.append(f"{edition} rule {rule['order']:02d}: web image missing")
        else:
            try:
                with Image.open(web_path) as opened:
                    if opened.format != "WEBP":
                        errors.append(f"{edition} rule {rule['order']:02d}: web image is {opened.format}")
                    if max(opened.size) > 960:
                        errors.append(f"{edition} rule {rule['order']:02d}: web image exceeds 960 px")
            except Exception as exc:
                errors.append(f"{edition} rule {rule['order']:02d}: unreadable web image ({exc})")

    print(f"CHECK {edition} ready={ready}/50 strict={strict}")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--edition", choices=("adult", "youth", "both"), default="both")
    parser.add_argument("--strict", action="store_true", help="Require all 50 images in the selected edition(s).")
    args = parser.parse_args()

    editions = ("adult", "youth") if args.edition == "both" else (args.edition,)
    errors = [error for edition in editions for error in validate_edition(edition, args.strict)]
    if errors:
        for error in errors:
            print(f"ERROR {error}")
        return 1
    print("PASS image assets")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
