#!/usr/bin/env python3
"""Normalize an interior PDF to the exact KDP trim and an even page count."""

from __future__ import annotations

import argparse
from pathlib import Path

from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject


TRIM_POINTS = {
    "adult": (432.0, 648.0),   # 6 x 9 in
    "youth": (504.0, 720.0),   # 7 x 10 in
}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--edition", choices=sorted(TRIM_POINTS), required=True)
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--ensure-even", action="store_true")
    args = parser.parse_args()

    target_width, target_height = TRIM_POINTS[args.edition]
    reader = PdfReader(args.input)
    writer = PdfWriter()

    for page in reader.pages:
        width = float(page.mediabox.width)
        height = float(page.mediabox.height)
        if abs(width - target_width) > 0.01 or abs(height - target_height) > 0.01:
            page.scale_to(target_width, target_height)
        exact_box = RectangleObject((0, 0, target_width, target_height))
        page.mediabox = exact_box
        page.cropbox = RectangleObject(exact_box)
        page.trimbox = RectangleObject(exact_box)
        page.bleedbox = RectangleObject(exact_box)
        page.artbox = RectangleObject(exact_box)
        writer.add_page(page)

    if args.ensure_even and len(writer.pages) % 2:
        writer.add_blank_page(width=target_width, height=target_height)

    if reader.metadata:
        metadata = {key: str(value) for key, value in reader.metadata.items() if value is not None}
        writer.add_metadata(metadata)

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("wb") as handle:
        writer.write(handle)

    print(
        f"WROTE {output} pages={len(writer.pages)} trim={target_width:.0f}x{target_height:.0f}pt"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
