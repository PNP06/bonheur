#!/usr/bin/env python3
"""Build a readable QA contact sheet from the canonical Artheureux data."""

from __future__ import annotations

import argparse
import json
import os
import tempfile
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[2]
TOTAL_RULES = 50
COLUMNS = 5
THUMBNAIL_SIZE = 220
CELL_WIDTH = 250
CELL_HEIGHT = 292
MARGIN = 24
GAP = 12
HEADER_HEIGHT = 74
BACKGROUND = (238, 235, 229)
CELL_BACKGROUND = (250, 249, 246)
TEXT = (39, 39, 36)
MUTED = (92, 90, 84)
ACCENT = (111, 78, 55)


@dataclass(frozen=True)
class ReadyRule:
    number: int
    title: str
    path: Path


def load_ready_rules(
    edition: str, accepted_orders: set[int] | None = None
) -> tuple[list[ReadyRule], list[int]]:
    """Read the canonical edition JSON and return ready rules plus missing numbers."""
    data_path = ROOT / "Artheureux" / "data" / f"{edition}.json"
    data = json.loads(data_path.read_text(encoding="utf-8"))
    rules = data.get("rules", [])
    ready: list[ReadyRule] = []
    missing: list[int] = []

    for rule in rules:
        number = int(rule.get("order", len(ready) + 1))
        if accepted_orders is not None and number not in accepted_orders:
            continue
        image = rule.get("image", {})
        if image.get("status") != "ready":
            continue
        source = ROOT / "Artheureux" / image["print_path"]
        if source.is_file():
            ready.append(ReadyRule(number, str(rule.get("title", "")), source))
        else:
            missing.append(number)

    ready.sort(key=lambda item: item.number)
    return ready, missing


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = (
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
    )
    for candidate in candidates:
        if candidate.is_file():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def wrap_title(draw: ImageDraw.ImageDraw, title: str, title_font: ImageFont.ImageFont, width: int) -> list[str]:
    words = title.split()
    lines: list[str] = []
    for word in words:
        candidate = f"{lines[-1]} {word}" if lines else word
        if draw.textlength(candidate, font=title_font) <= width or not lines:
            if lines:
                lines[-1] = candidate
            else:
                lines.append(candidate)
        elif len(lines) == 1:
            lines.append(word)
        else:
            break
    if len(lines) == 2 and len(words) > 0:
        used_words = " ".join(lines).split()
        if len(used_words) < len(words):
            suffix = "…"
            second = lines[1]
            while second and draw.textlength(f"{second} {suffix}", font=title_font) > width:
                second = second.rsplit(" ", 1)[0] if " " in second else ""
            lines[1] = f"{second} {suffix}".strip()
    return lines[:2] or [""]


def render_thumbnail(source: Path) -> Image.Image:
    with Image.open(source) as opened:
        corrected = ImageOps.exif_transpose(opened).convert("RGB")
        return ImageOps.fit(
            corrected,
            (THUMBNAIL_SIZE, THUMBNAIL_SIZE),
            method=Image.Resampling.LANCZOS,
            centering=(0.5, 0.5),
        )


def build_sheet(edition: str, rules: list[ReadyRule], output: Path) -> None:
    rows = (len(rules) + COLUMNS - 1) // COLUMNS
    width = MARGIN * 2 + COLUMNS * CELL_WIDTH + (COLUMNS - 1) * GAP
    height = MARGIN * 2 + HEADER_HEIGHT + rows * CELL_HEIGHT + max(0, rows - 1) * GAP
    sheet = Image.new("RGB", (width, height), BACKGROUND)
    draw = ImageDraw.Draw(sheet)
    header_font = font(27, bold=True)
    meta_font = font(16)
    number_font = font(15, bold=True)
    title_font = font(16, bold=True)

    label = "Édition adulte" if edition == "adult" else "Édition jeunesse"
    draw.text((MARGIN, MARGIN), f"Artheureux — {label}", fill=TEXT, font=header_font)
    meta = f"Planche-contact QA · {len(rules)}/{TOTAL_RULES} images prêtes"
    draw.text((MARGIN, MARGIN + 38), meta, fill=MUTED, font=meta_font)

    for index, rule in enumerate(rules):
        row, column = divmod(index, COLUMNS)
        x = MARGIN + column * (CELL_WIDTH + GAP)
        y = MARGIN + HEADER_HEIGHT + row * (CELL_HEIGHT + GAP)
        draw.rounded_rectangle((x, y, x + CELL_WIDTH, y + CELL_HEIGHT), radius=8, fill=CELL_BACKGROUND)
        thumbnail = render_thumbnail(rule.path)
        sheet.paste(thumbnail, (x + (CELL_WIDTH - THUMBNAIL_SIZE) // 2, y + 10))
        number = f"Règle {rule.number:02d}"
        draw.text((x + 15, y + THUMBNAIL_SIZE + 17), number, fill=ACCENT, font=number_font)
        lines = wrap_title(draw, rule.title, title_font, CELL_WIDTH - 30)
        draw.multiline_text((x + 15, y + THUMBNAIL_SIZE + 39), "\n".join(lines), fill=TEXT, font=title_font, spacing=2)

    output.parent.mkdir(parents=True, exist_ok=True)
    temporary_name: str | None = None
    try:
        with tempfile.NamedTemporaryFile(prefix=f".{output.stem}-", suffix=".png", dir=output.parent, delete=False) as temporary:
            temporary_name = temporary.name
        sheet.save(temporary_name, "PNG")
        os.replace(temporary_name, output)
    finally:
        if temporary_name:
            temporary = Path(temporary_name)
            if temporary.exists():
                temporary.unlink()


def main() -> int:
    parser = argparse.ArgumentParser(description="Créer une planche-contact QA des images prêtes Artheureux.")
    parser.add_argument("--edition", choices=("adult", "youth"), required=True)
    parser.add_argument("--output", type=Path, required=True, help="Chemin de la planche PNG à produire.")
    parser.add_argument("--strict", action="store_true", help="Échoue si les 50 images ne sont pas prêtes.")
    parser.add_argument(
        "--v2-only",
        action="store_true",
        help="Inclut uniquement les images acceptées dans le registre de production V2.",
    )
    args = parser.parse_args()

    accepted_orders: set[int] | None = None
    if args.v2_only:
        status_path = ROOT / "Artheureux" / "image-prompts" / "v2" / "production-status.json"
        status = json.loads(status_path.read_text(encoding="utf-8"))
        accepted_orders = set(status[args.edition]["accepted"])

    ready, missing_files = load_ready_rules(args.edition, accepted_orders)
    ready_numbers = {rule.number for rule in ready}
    missing = sorted(set(range(1, TOTAL_RULES + 1)) - ready_numbers)
    if missing_files:
        missing = sorted(set(missing) | set(missing_files))
    if args.strict and len(ready) != TOTAL_RULES:
        print(f"ERREUR: {len(ready)}/{TOTAL_RULES} images prêtes; manquantes: {', '.join(f'{number:02d}' for number in missing)}")
        return 1

    build_sheet(args.edition, ready, args.output)
    print(f"WROTE {args.output} ({len(ready)}/{TOTAL_RULES} images prêtes)")
    if missing:
        print(f"MANQUANTES: {', '.join(f'règle {number:02d}' for number in missing)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
