#!/usr/bin/env python3
"""Validate public PDF availability without probing missing URLs in the browser."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
EXPECTED = {
    "adult": "downloads/artheureux-adulte.pdf",
    "youth": "downloads/artheureux-jeunesse.pdf",
}
MAX_PUBLIC_PDF_BYTES = 95 * 1024 * 1024


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> int:
    manifest_path = ROOT / "Artheureux" / "data" / "downloads.json"
    data = json.loads(manifest_path.read_text(encoding="utf-8"))
    errors: list[str] = []
    for edition, expected_path in EXPECTED.items():
        entry = data.get(edition)
        if not isinstance(entry, dict):
            errors.append(f"{edition}: entry is missing")
            continue
        if entry.get("path") != expected_path:
            errors.append(f"{edition}: path must be {expected_path}")
        if not isinstance(entry.get("available"), bool):
            errors.append(f"{edition}: available must be a boolean")
            continue
        pdf = ROOT / expected_path
        if entry["available"]:
            if not pdf.is_file():
                errors.append(f"{edition}: manifest is available but {expected_path} is missing")
                continue
            if entry.get("bytes") != pdf.stat().st_size:
                errors.append(f"{edition}: byte count does not match the PDF")
            if pdf.stat().st_size > MAX_PUBLIC_PDF_BYTES:
                errors.append(f"{edition}: public PDF exceeds 95 MiB")
            if entry.get("sha256") != sha256(pdf):
                errors.append(f"{edition}: SHA-256 does not match the PDF")
        elif pdf.exists():
            errors.append(f"{edition}: PDF exists but manifest is not available")

    if errors:
        for error in errors:
            print(f"ERROR {error}")
        return 1
    print("PASS download manifest")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
