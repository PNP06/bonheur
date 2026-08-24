#!/usr/bin/env python3
"""Build an editable-code, full-wrap KDP paperback cover PDF."""

from __future__ import annotations

import argparse
import json
import tempfile
from pathlib import Path

from PIL import Image
from reportlab.lib.colors import CMYKColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[2]
BLEED = 0.125
SPINE_PER_PAGE = 0.002347
TRIM = {"adult": (6.0, 9.0), "youth": (7.0, 10.0)}
DEFAULT_IMAGE = {
    "adult": ROOT / "Artheureux/assets/images/adult/print/rule-01.png",
    "youth": ROOT / "Artheureux/assets/images/youth/print/rule-01.png",
}
PALETTE = {
    "adult": {
        "background": CMYKColor(0.07, 0.00, 0.12, 0.03),
        "ink": CMYKColor(0.79, 0.47, 0.68, 0.55),
        "accent": CMYKColor(0.58, 0.30, 0.55, 0.20),
        "warm": CMYKColor(0.10, 0.43, 0.78, 0.07),
    },
    "youth": {
        "background": CMYKColor(0.05, 0.00, 0.13, 0.01),
        "ink": CMYKColor(0.79, 0.23, 0.36, 0.43),
        "accent": CMYKColor(0.75, 0.18, 0.36, 0.12),
        "warm": CMYKColor(0.00, 0.57, 0.55, 0.04),
    },
}


def register_fonts() -> None:
    fonts = Path(r"C:\Windows\Fonts")
    pdfmetrics.registerFont(TTFont("NotoSans", fonts / "NotoSans-Regular.ttf"))
    pdfmetrics.registerFont(TTFont("NotoSans-Bold", fonts / "NotoSans-Bold.ttf"))
    pdfmetrics.registerFont(TTFont("NotoSerif", fonts / "NotoSerif-Regular.ttf"))
    pdfmetrics.registerFont(TTFont("NotoSerif-Italic", fonts / "NotoSerif-Italic.ttf"))
    pdfmetrics.registerFont(TTFont("Georgia-Bold", fonts / "georgiab.ttf"))


def wrap_lines(text: str, font: str, size: float, width: float) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if current and pdfmetrics.stringWidth(candidate, font, size) > width:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines


def draw_wrapped(c: canvas.Canvas, text: str, x: float, y: float, width: float,
                 font: str, size: float, leading: float, color) -> float:
    c.setFillColor(color)
    c.setFont(font, size)
    for line in wrap_lines(text, font, size, width):
        c.drawString(x, y, line)
        y -= leading
    return y


def make_cmyk_image(source: Path, work_dir: Path) -> Path:
    target = work_dir / "cover-image-cmyk.jpg"
    with Image.open(source) as opened:
        opened.convert("CMYK").save(target, "JPEG", quality=95, subsampling=0, dpi=(300, 300))
    return target


def build_cover(edition: str, page_count: int, image_path: Path, output: Path) -> None:
    register_fonts()
    copy = json.loads((ROOT / "Artheureux/cover-copy.json").read_text(encoding="utf-8"))[edition]
    colors = PALETTE[edition]
    trim_width, trim_height = TRIM[edition]
    spine_width = page_count * SPINE_PER_PAGE
    cover_width = BLEED + trim_width + spine_width + trim_width + BLEED
    cover_height = BLEED + trim_height + BLEED
    points = 72.0

    output.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(
        str(output),
        pagesize=(cover_width * points, cover_height * points),
        pageCompression=1,
        initialFontName="NotoSans",
        initialFontSize=12,
        initialLeading=14.4,
    )
    c.setTitle(copy["title"])
    c.setAuthor("David DEVESA")
    c.setSubject(f"Couverture complète KDP {edition}, {page_count} pages")

    full_w = cover_width * points
    full_h = cover_height * points
    back_x = BLEED * points
    spine_x = (BLEED + trim_width) * points
    front_x = (BLEED + trim_width + spine_width) * points
    trim_y = BLEED * points
    trim_w_pt = trim_width * points
    trim_h_pt = trim_height * points
    safe = 0.32 * points

    c.setFillColor(colors["background"])
    c.rect(0, 0, full_w, full_h, fill=1, stroke=0)
    c.setFillColor(colors["accent"])
    c.rect(0, full_h - 0.42 * points, full_w, 0.42 * points, fill=1, stroke=0)
    c.setFillColor(colors["warm"])
    c.rect(0, 0, full_w, 0.24 * points, fill=1, stroke=0)

    # Front cover
    center_x = front_x + trim_w_pt / 2
    title_y = trim_y + trim_h_pt - 0.72 * points
    c.setFillColor(colors["ink"])
    c.setFont("NotoSans-Bold", 24 if edition == "adult" else 27)
    c.drawCentredString(center_x, title_y, copy["title"])
    c.setFont("NotoSerif-Italic", 11.5 if edition == "adult" else 13)
    subtitle_lines = wrap_lines(copy["subtitle"], "NotoSerif-Italic", 11.5 if edition == "adult" else 13, trim_w_pt - 1.1 * points)
    subtitle_y = title_y - 0.38 * points
    for line in subtitle_lines:
        c.drawCentredString(center_x, subtitle_y, line)
        subtitle_y -= 0.21 * points

    image_width = 4.0 if edition == "adult" else 4.1
    image_size = image_width * points
    image_y = trim_y + (2.20 if edition == "adult" else 2.72) * points
    with tempfile.TemporaryDirectory(prefix="artheureux-cover-") as temporary:
        cmyk_image = make_cmyk_image(image_path, Path(temporary))
        c.drawImage(ImageReader(cmyk_image), center_x - image_size / 2, image_y,
                    width=image_size, height=image_size, preserveAspectRatio=True, mask=None)

    c.setFillColor(colors["accent"])
    c.setFont("NotoSans-Bold", 8.5)
    c.drawCentredString(center_x, image_y - 0.28 * points, copy["edition_label"])
    c.setFillColor(colors["ink"])
    c.setFont("NotoSerif-Italic", 9.2 if edition == "adult" else 9.8)
    front_lines = wrap_lines(copy["front_line"], "NotoSerif-Italic", 9.2 if edition == "adult" else 9.8,
                             trim_w_pt - 1.0 * points)
    front_y = image_y - 0.58 * points
    for line in front_lines:
        c.drawCentredString(center_x, front_y, line)
        front_y -= 0.18 * points
    c.setFont("Georgia-Bold", 14)
    c.drawCentredString(center_x, trim_y + 0.58 * points, "David DEVESA")

    # Back cover
    text_x = back_x + safe
    text_width = trim_w_pt - 2 * safe
    y = trim_y + trim_h_pt - 0.60 * points
    y = draw_wrapped(c, copy["back_heading"], text_x, y, text_width,
                     "NotoSans-Bold", 13 if edition == "adult" else 15, 16, colors["ink"])
    y -= 9
    for paragraph in copy["back_paragraphs"]:
        y = draw_wrapped(c, paragraph, text_x, y, text_width,
                         "NotoSerif", 9.2 if edition == "adult" else 10.2,
                         12.2 if edition == "adult" else 13.5, colors["ink"])
        y -= 9
    c.setFillColor(colors["accent"])
    c.setFont("NotoSans-Bold", 9.2)
    c.drawString(text_x, y, "Dans chaque règle :")
    y -= 15
    for point in copy["back_points"]:
        c.setFillColor(colors["warm"])
        c.circle(text_x + 3, y + 3, 2.2, fill=1, stroke=0)
        y = draw_wrapped(c, point, text_x + 13, y, text_width - 13,
                         "NotoSans", 8.8 if edition == "adult" else 9.6,
                         11.5 if edition == "adult" else 12.5, colors["ink"])
        y -= 4

    note_width = text_width - 0.15 * points
    note_y = max(y - 8, trim_y + 1.85 * points)
    note_font = "NotoSerif" if edition == "adult" else "NotoSans-Bold"
    note_size = 8.2 if edition == "adult" else 9.1
    note_leading = 11.0 if edition == "adult" else 12.0
    draw_wrapped(c, copy["back_note"], text_x, note_y, note_width,
                 note_font, note_size, note_leading, colors["ink"])

    # Keep a quiet, light barcode area. KDP may place its barcode here.
    barcode_w = 2.0 * points
    barcode_h = 1.2 * points
    c.setFillColor(colors["background"])
    c.rect(back_x + trim_w_pt - safe - barcode_w, trim_y + safe,
           barcode_w, barcode_h, fill=1, stroke=0)

    # Spine text is permitted above 79 pages; retain the official safety gap.
    if page_count > 79 and spine_width > 0.20:
        c.saveState()
        c.translate(spine_x + spine_width * points / 2, full_h / 2)
        c.rotate(90)
        spine_font = min(10.5, max(7.0, (spine_width - 0.125) * 72 * 0.72))
        c.setFillColor(colors["ink"])
        c.setFont("NotoSans-Bold", spine_font)
        c.drawCentredString(0, -spine_font / 3, f"L’ART D’ÊTRE HEUREUX · DAVID DEVESA")
        c.restoreState()

    c.showPage()
    c.save()
    print(
        f"WROTE {output} pages={page_count} spine={spine_width:.4f}in "
        f"size={cover_width:.4f}x{cover_height:.4f}in"
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--edition", choices=sorted(TRIM), required=True)
    parser.add_argument("--page-count", type=int, required=True)
    parser.add_argument("--image")
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    if args.page_count < 24:
        raise ValueError("KDP paperbacks require at least 24 pages")
    if args.page_count % 2:
        raise ValueError("Use the normalized even interior page count")
    image_path = Path(args.image) if args.image else DEFAULT_IMAGE[args.edition]
    if not image_path.is_absolute():
        image_path = ROOT / image_path
    if not image_path.exists():
        raise FileNotFoundError(image_path)
    build_cover(args.edition, args.page_count, image_path, Path(args.output))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
