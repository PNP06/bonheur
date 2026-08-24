#!/usr/bin/env python3
"""Validate the theme and current-feeling navigation map."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path


RULE_ID = re.compile(r"^rule-(0[1-9]|[1-4][0-9]|50)$")


def main() -> int:
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("Artheureux/data/reader-paths.json")
    data = json.loads(path.read_text(encoding="utf-8"))
    errors: list[str] = []
    themes = data.get("themes", [])
    categories = data.get("categories", [])
    if len(themes) != 7:
        errors.append(f"expected 7 themes, got {len(themes)}")
    ids: list[str] = []
    entry_count = 0
    for category in categories:
        if not category.get("id") or not category.get("label"):
            errors.append("category without id or label")
        entries = category.get("entries", [])
        entry_count += len(entries)
        for entry in entries:
            ids.append(entry.get("id", ""))
            rule_ids = entry.get("rule_ids", [])
            if not entry.get("label") or not 3 <= len(rule_ids) <= 8:
                errors.append(f"invalid entry {entry.get('id')}")
            if not all(isinstance(item, str) and RULE_ID.fullmatch(item) for item in rule_ids):
                errors.append(f"invalid rule id in {entry.get('id')}")
            if len(rule_ids) != len(set(rule_ids)):
                errors.append(f"duplicate rule id in {entry.get('id')}")
    if entry_count != 30:
        errors.append(f"expected 30 reader paths, got {entry_count}")
    if len(ids) != len(set(ids)):
        errors.append("reader path ids must be unique")
    if errors:
        print("FAIL", path)
        for error in errors:
            print(f"- {error}")
        return 1
    print(f"PASS {path} themes={len(themes)} categories={len(categories)} entries={entry_count}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
