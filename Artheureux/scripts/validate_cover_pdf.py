#!/usr/bin/env python3
"""Check the mechanical KDP constraints of an Artheureux full-wrap cover PDF."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image
from pypdf import PdfReader
from pypdf.generic import ContentStream

from validate_kdp_pdf import collect_fonts, font_is_embedded


BLEED_INCHES = 0.125
SPINE_PER_PAGE_INCHES = 0.002347
TRIM_INCHES = {
    "adult": (6.0, 9.0),
    "youth": (7.0, 10.0),
}
COVER_IMAGE_WIDTH_INCHES = {
    "adult": 4.0,
    "youth": 4.1,
}


def expected_size_points(edition: str, page_count: int) -> tuple[float, float, float]:
    trim_width, trim_height = TRIM_INCHES[edition]
    spine_width = page_count * SPINE_PER_PAGE_INCHES
    width = 2 * trim_width + spine_width + 2 * BLEED_INCHES
    height = trim_height + 2 * BLEED_INCHES
    return width * 72.0, height * 72.0, spine_width


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--edition", choices=sorted(TRIM_INCHES), required=True)
    parser.add_argument("--page-count", type=int, required=True)
    parser.add_argument("--minimum-font-size", type=float, default=7.0)
    parser.add_argument("--image")
    parser.add_argument("pdf")
    args = parser.parse_args()

    errors: list[str] = []
    path = Path(args.pdf)
    reader = PdfReader(path)
    target_width, target_height, spine_width = expected_size_points(args.edition, args.page_count)

    if reader.is_encrypted:
        errors.append("PDF is encrypted")
    if len(reader.pages) != 1:
        errors.append(f"cover must contain one page, found {len(reader.pages)}")
    if args.page_count < 24:
        errors.append(f"interior page count {args.page_count} is below KDP minimum 24")
    if args.page_count % 2:
        errors.append(f"interior page count {args.page_count} is not even")

    fonts: dict[str, object] = {}
    font_sizes: list[float] = []
    image_xobjects = 0
    image_color_spaces: list[str] = []
    for index, page in enumerate(reader.pages, start=1):
        width = float(page.mediabox.width)
        height = float(page.mediabox.height)
        if abs(width - target_width) > 0.02 or abs(height - target_height) > 0.02:
            errors.append(
                f"page {index}: cover size {width:.3f}x{height:.3f} pt; "
                f"expected {target_width:.3f}x{target_height:.3f} pt"
            )
        if int(page.get("/Rotate", 0)) % 360:
            errors.append(f"page {index}: rotation is {page.get('/Rotate')}")
        for resource_name, font in collect_fonts(page):
            fonts[str(font.get("/BaseFont") or resource_name)] = font
        resources = page.get("/Resources") or {}
        xobjects = resources.get("/XObject") or {}
        for reference in xobjects.values():
            image = reference.get_object()
            if image.get("/Subtype") == "/Image":
                image_xobjects += 1
                image_color_spaces.append(str(image.get("/ColorSpace")))
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
    if image_xobjects < 1:
        errors.append("no embedded cover image found")
    for color_space in image_color_spaces:
        if color_space != "/DeviceCMYK":
            errors.append(f"cover image color space is {color_space}, expected /DeviceCMYK")

    image_dpi = 0.0
    if args.image:
        image_path = Path(args.image)
        with Image.open(image_path) as opened:
            image_dpi = min(opened.width, opened.height) / COVER_IMAGE_WIDTH_INCHES[args.edition]
        if image_dpi + 1e-6 < 300.0:
            errors.append(f"cover image effective resolution {image_dpi:.1f} dpi is below 300 dpi")

    print(
        f"CHECK {path} page_count={args.page_count} spine={spine_width:.4f}in "
        f"size={target_width:.3f}x{target_height:.3f}pt fonts={len(fonts)} "
        f"min_font={min(font_sizes) if font_sizes else 0:.2f}pt images={image_xobjects} "
        f"image_spaces={','.join(image_color_spaces) or 'none'}" +
        (f" cover_image={image_dpi:.1f}dpi" if args.image else "")
    )
    if errors:
        for error in errors:
            print(f"ERROR {error}")
        return 1
    print("PASS KDP cover PDF mechanics")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
