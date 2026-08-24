#!/usr/bin/env python3
"""Ingest one generated illustration into the canonical Artheureux assets."""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[2]
ARTHEUREUX_ROOT = ROOT / "Artheureux"
IMAGE_SIZE = 1254
WEB_SIZE = 960
WEB_QUALITY = 82


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Ingere une illustration et met a jour une regle Artheureux."
    )
    parser.add_argument("--edition", choices=("adult", "youth"), required=True)
    parser.add_argument("--rule", type=int, choices=range(1, 51), required=True)
    parser.add_argument("--input", required=True, help="Chemin local de l'image source")
    parser.add_argument("--alt", required=True, help="Texte alternatif sans saut de ligne")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Autorise le remplacement d'une image deja marquee ready",
    )
    return parser.parse_args()


def fail(message: str) -> int:
    print(f"ERROR {message}", file=sys.stderr)
    return 1


def canonical_path(value: str, label: str) -> Path:
    path = Path(value)
    if path.is_absolute():
        raise ValueError(f"{label} doit etre un chemin relatif au dossier Artheureux")
    resolved = (ARTHEUREUX_ROOT / path).resolve()
    try:
        resolved.relative_to(ARTHEUREUX_ROOT.resolve())
    except ValueError as exc:
        raise ValueError(f"{label} sort du dossier Artheureux") from exc
    return resolved


def atomic_save(image: Image.Image, target: Path, format_name: str, **options: Any) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    temporary: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="wb", prefix=f".{target.stem}-", suffix=target.suffix, dir=target.parent, delete=False
        ) as handle:
            temporary = Path(handle.name)
        image.save(temporary, format=format_name, **options)
        os.replace(temporary, target)
        temporary = None
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def prepare_images(source_path: Path) -> tuple[Image.Image, Image.Image]:
    with Image.open(source_path) as opened:
        oriented = ImageOps.exif_transpose(opened)
        width, height = oriented.size
        if min(width, height) < IMAGE_SIZE:
            raise ValueError(
                f"source trop petite ({width}x{height}); le plus petit cote doit etre >= {IMAGE_SIZE}px"
            )

        rgb = oriented.convert("RGB")
        side = min(rgb.size)
        left = (rgb.width - side) // 2
        top = (rgb.height - side) // 2
        square = rgb.crop((left, top, left + side, top + side))
        master = (
            square
            if square.size == (IMAGE_SIZE, IMAGE_SIZE)
            else square.resize((IMAGE_SIZE, IMAGE_SIZE), Image.Resampling.LANCZOS)
        )
        web = master.resize((WEB_SIZE, WEB_SIZE), Image.Resampling.LANCZOS)
        return master.copy(), web.copy()


def update_data(data_path: Path, rule_number: int, alt: str) -> tuple[Path, Path]:
    data = json.loads(data_path.read_text(encoding="utf-8"))
    matching = [rule for rule in data["rules"] if rule.get("order") == rule_number]
    if len(matching) != 1:
        raise ValueError(f"regle {rule_number} introuvable ou ambigue dans {data_path.name}")
    image = matching[0].get("image")
    if not isinstance(image, dict):
        raise ValueError(f"regle {rule_number}: bloc image absent")

    image["status"] = "ready"
    image["alt"] = alt

    temporary: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", newline="\n", dir=data_path.parent, prefix=f".{data_path.stem}-", suffix=".json", delete=False
        ) as handle:
            temporary = Path(handle.name)
            json.dump(data, handle, ensure_ascii=False, indent=2)
            handle.write("\n")
        os.replace(temporary, data_path)
        temporary = None
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)

    return canonical_path(str(image["print_path"]), "print_path"), canonical_path(
        str(image["web_path"]), "web_path"
    )


def run_validators(edition: str) -> int:
    commands = [
        [sys.executable, str(ARTHEUREUX_ROOT / "scripts" / "validate_image_assets.py"), "--edition", edition],
        [sys.executable, str(ARTHEUREUX_ROOT / "scripts" / "validate_content.py")],
    ]
    statuses: list[int] = []
    for command in commands:
        print(f"CHECK {' '.join(command[1:])}")
        completed = subprocess.run(command, cwd=ROOT, check=False)
        statuses.append(completed.returncode)
    return 1 if any(statuses) else 0


def main() -> int:
    args = parse_args()
    alt = args.alt.strip()
    if not alt:
        return fail("--alt doit etre non vide")
    if "\n" in args.alt or "\r" in args.alt:
        return fail("--alt ne doit contenir aucun saut de ligne")

    data_path = ARTHEUREUX_ROOT / "data" / f"{args.edition}.json"
    source_path = Path(args.input).expanduser()
    if not source_path.is_absolute():
        source_path = (Path.cwd() / source_path).resolve()
    if not source_path.is_file():
        return fail(f"image source introuvable: {source_path}")

    try:
        data = json.loads(data_path.read_text(encoding="utf-8"))
        matching = [rule for rule in data["rules"] if rule.get("order") == args.rule]
        if len(matching) != 1:
            raise ValueError(f"regle {args.rule} introuvable ou ambigue")
        image = matching[0].get("image")
        if not isinstance(image, dict):
            raise ValueError(f"regle {args.rule}: bloc image absent")
        if image.get("status") == "ready" and not args.force:
            raise ValueError(f"regle {args.rule:02d} deja ready; utiliser --force pour remplacer")
        print_path = canonical_path(str(image["print_path"]), "print_path")
        web_path = canonical_path(str(image["web_path"]), "web_path")

        master, web = prepare_images(source_path)
        atomic_save(master, print_path, "PNG", optimize=True)
        atomic_save(web, web_path, "WEBP", quality=WEB_QUALITY, method=6)
        master.close()
        web.close()
        update_data(data_path, args.rule, alt)
    except Exception as exc:
        return fail(f"ingestion interrompue: {exc}")

    print(f"READY {args.edition} rule-{args.rule:02d}")
    print(f"  print: {print_path.relative_to(ROOT)} ({IMAGE_SIZE}x{IMAGE_SIZE} PNG)")
    print(f"  web:   {web_path.relative_to(ROOT)} ({WEB_SIZE}x{WEB_SIZE} WebP, quality={WEB_QUALITY})")
    return run_validators(args.edition)


if __name__ == "__main__":
    raise SystemExit(main())
