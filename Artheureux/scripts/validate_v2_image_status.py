#!/usr/bin/env python3
"""Validate the explicit V2 illustration production ledger."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
EXPECTED = set(range(1, 51))


def main() -> int:
    status_path = ROOT / "image-prompts" / "v2" / "production-status.json"
    status = json.loads(status_path.read_text(encoding="utf-8"))
    errors: list[str] = []

    for edition in ("adult", "youth"):
        accepted = status.get(edition, {}).get("accepted", [])
        pending = status.get(edition, {}).get("pending", [])
        if accepted != sorted(set(accepted)):
            errors.append(f"{edition}: accepted must be sorted and unique")
        if pending != sorted(set(pending)):
            errors.append(f"{edition}: pending must be sorted and unique")
        overlap = sorted(set(accepted) & set(pending))
        if overlap:
            errors.append(f"{edition}: accepted/pending overlap: {overlap}")
        covered = set(accepted) | set(pending)
        if covered != EXPECTED:
            missing = sorted(EXPECTED - covered)
            unexpected = sorted(covered - EXPECTED)
            errors.append(
                f"{edition}: ledger must cover rules 1-50; missing={missing}, unexpected={unexpected}"
            )
        print(f"CHECK {edition} V2 accepted={len(accepted)}/50 pending={len(pending)}")

    if errors:
        for error in errors:
            print(f"ERROR {error}")
        return 1
    print("PASS V2 image production status")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
