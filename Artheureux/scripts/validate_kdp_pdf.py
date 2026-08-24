#!/usr/bin/env python3
"""Check the mechanical KDP constraints of an Artheureux interior PDF."""

from __future__ import annotations

import argparse
from pathlib import Path

from pypdf import PdfReader
from pypdf.generic import ContentStream


TRIM_POINTS = {
    "adult": (432.0, 648.0),
    "youth": (504.0, 720.0),
}
IMAGE_PRINT_WIDTH_INCHES = {
    "adult": 4.0,
    "youth": 4.1,
}


def collect_fonts(page) -> list[tuple[str, object]]:
    resources = page.get("/Resources") or {}
    fonts = resources.get("/Font") or {}
    return [(str(name), reference.get_object()) for name, reference in fonts.items()]


def font_is_embedded(font: object) -> bool:
    descriptor = font.get("/FontDescriptor")
    if descriptor:
        descriptor = descriptor.get_object()
        return any(descriptor.get(key) is not None for key in ("/FontFile", "/FontFile2", "/FontFile3"))
    descendants = font.get("/DescendantFonts") or []
    return bool(descendants) and all(font_is_embedded(item.get_object()) for item in descendants)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--edition", choices=sorted(TRIM_POINTS), required=True)
    parser.add_argument("pdf")
    parser.add_argument("--require-even", action="store_true")
    parser.add_argument("--minimum-font-size", type=float, default=7.0)
    parser.add_argument("--minimum-image-dpi", type=float)
    parser.add_argument("--expected-rule-images", type=int)
    args = parser.parse_args()

    errors: list[str] = []
    path = Path(args.pdf)
    reader = PdfReader(path)
    target_width, target_height = TRIM_POINTS[args.edition]

    if reader.is_encrypted:
        errors.append("PDF is encrypted")
    if len(reader.pages) < 24:
        errors.append(f"page count {len(reader.pages)} is below KDP minimum 24")
    if args.require_even and len(reader.pages) % 2:
        errors.append(f"page count {len(reader.pages)} is not even")

    fonts: dict[str, object] = {}
    font_sizes: list[float] = []
    images: dict[object, object] = {}
    for index, page in enumerate(reader.pages, start=1):
        width = float(page.mediabox.width)
        height = float(page.mediabox.height)
        if abs(width - target_width) > 0.01 or abs(height - target_height) > 0.01:
            errors.append(f"page {index}: trim {width:.3f}x{height:.3f} pt")
        if int(page.get("/Rotate", 0)) % 360:
            errors.append(f"page {index}: rotation is {page.get('/Rotate')}")
        for resource_name, font in collect_fonts(page):
            fonts[str(font.get("/BaseFont") or resource_name)] = font
        resources = page.get("/Resources") or {}
        xobjects = resources.get("/XObject") or {}
        for resource_name, reference in xobjects.items():
            image = reference.get_object()
            if image.get("/Subtype") != "/Image":
                continue
            key = (
                getattr(reference, "idnum", None),
                getattr(reference, "generation", None),
            )
            if key == (None, None):
                key = (index, str(resource_name))
            images[key] = image
        try:
            operations = ContentStream(page.get_contents(), reader).operations
            font_sizes.extend(float(operands[1]) for operands, operator in operations if operator == b"Tf")
        except Exception as exc:
            errors.append(f"page {index}: cannot inspect text operators ({exc})")

    for name, font in sorted(fonts.items()):
        if not font_is_embedded(font):
            errors.append(f"font is not embedded: {name}")

    if font_sizes and min(font_sizes) + 1e-6 < args.minimum_font_size:
        errors.append(
            f"minimum text size {min(font_sizes):.2f} pt is below {args.minimum_font_size:.2f} pt"
        )
    if not font_sizes:
        errors.append("no text operators found")

    image_dpis = [
        min(float(image.get("/Width", 0)), float(image.get("/Height", 0)))
        / IMAGE_PRINT_WIDTH_INCHES[args.edition]
        for image in images.values()
    ]
    if args.expected_rule_images is not None and len(images) < args.expected_rule_images:
        errors.append(
            f"embedded rule images {len(images)} is below expected {args.expected_rule_images}"
        )
    if args.minimum_image_dpi is not None:
        if not image_dpis:
            errors.append("no embedded rule image found")
        elif min(image_dpis) + 1e-6 < args.minimum_image_dpi:
            errors.append(
                f"minimum embedded image resolution {min(image_dpis):.1f} dpi is below "
                f"{args.minimum_image_dpi:.1f} dpi"
            )

    print(
        f"CHECK {path} pages={len(reader.pages)} trim={target_width:.0f}x{target_height:.0f}pt "
        f"fonts={len(fonts)} min_font={min(font_sizes) if font_sizes else 0:.2f}pt "
        f"images={len(images)} min_image={min(image_dpis) if image_dpis else 0:.1f}dpi"
    )
    if errors:
        for error in errors:
            print(f"ERROR {error}")
        return 1
    print("PASS KDP interior PDF mechanics")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
