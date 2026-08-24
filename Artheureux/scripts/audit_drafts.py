#!/usr/bin/env python3
"""Audit editorial batches before merging them into the canonical books."""
from __future__ import annotations

import argparse
import collections
import glob
import json
import re
from pathlib import Path


CONTRACTS = {
    "adult": {"summary": (140, 210), "example": (90, 150), "total": (350, 500), "key": 18, "advice": (3, 4), "questions": (3, 3)},
    "youth": {"summary": (80, 130), "example": (70, 110), "total": (220, 320), "key": 14, "advice": (3, 3), "questions": (2, 3)},
}
REQUIRED = {
    "id", "order", "title", "summary", "example", "advice", "key_phrase",
    "questions", "source", "themes", "needs", "image_alt", "image_scene",
}
FORBIDDEN = (
    "tout arrive pour une raison",
    "il suffit de contrôler",
    "il suffit de controler",
    "vous serez heureux",
    "tu seras heureux",
)


def words(value: str) -> int:
    return len(value.split())


def total_words(rule: dict) -> int:
    fields = [rule["summary"], rule["example"], rule["key_phrase"]]
    fields.extend(rule["advice"])
    fields.extend(rule["questions"])
    return sum(words(item) for item in fields)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("pattern", help="Glob pattern for batch JSON files")
    parser.add_argument("--edition", choices=sorted(CONTRACTS), required=True)
    parser.add_argument("--expected-start", type=int)
    parser.add_argument("--expected-end", type=int)
    args = parser.parse_args()

    paths = [Path(item) for item in sorted(glob.glob(args.pattern))]
    if not paths:
        print("FAIL: no matching draft files")
        return 1

    rules: list[dict] = []
    errors: list[str] = []
    for path in paths:
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, UnicodeError, json.JSONDecodeError) as exc:
            errors.append(f"{path}: {exc}")
            continue
        if payload.get("edition") != args.edition:
            errors.append(f"{path}: wrong edition")
        rules.extend(payload.get("rules", []))

    contract = CONTRACTS[args.edition]
    for rule in rules:
        label = f"rule {rule.get('order', '?')}"
        missing = REQUIRED - set(rule)
        if missing:
            errors.append(f"{label}: missing {sorted(missing)}")
            continue
        for field in ("summary", "example"):
            count = words(rule[field])
            low, high = contract[field]
            if not low <= count <= high:
                errors.append(f"{label}: {field} has {count} words, expected {low}-{high}")
        if words(rule["key_phrase"]) > contract["key"]:
            errors.append(f"{label}: key phrase is too long")
        count = total_words(rule)
        low, high = contract["total"]
        if not low <= count <= high:
            errors.append(f"{label}: total has {count} words, expected {low}-{high}")
        for field in ("advice", "questions"):
            low, high = contract[field]
            if not low <= len(rule[field]) <= high:
                errors.append(f"{label}: {field} has {len(rule[field])} items, expected {low}-{high}")
        joined = " ".join(str(value) for value in rule.values()).casefold()
        for phrase in FORBIDDEN:
            if phrase in joined:
                errors.append(f"{label}: forbidden phrase {phrase!r}")

    orders = [rule.get("order") for rule in rules]
    if len(orders) != len(set(orders)):
        errors.append("duplicate rule orders")
    if args.expected_start is not None and args.expected_end is not None:
        expected = list(range(args.expected_start, args.expected_end + 1))
        if orders != expected:
            errors.append(f"orders are {orders}, expected {expected}")

    keys = [rule.get("key_phrase", "").casefold() for rule in rules]
    if len(keys) != len(set(keys)):
        errors.append("duplicate key phrases")
    starts = collections.Counter(
        " ".join(re.findall(r"[\wÀ-ÿ'-]+", rule.get("example", ""))[:4]).casefold()
        for rule in rules
    )
    repeated_starts = {start: count for start, count in starts.items() if count > 2}
    if repeated_starts:
        errors.append(f"repeated example openings: {repeated_starts}")

    for rule in rules:
        print(
            f"{rule['order']:02d} | {words(rule['summary']):3d} | "
            f"{words(rule['example']):3d} | {total_words(rule):3d} | {rule['title']}"
        )
    if errors:
        print("FAIL")
        for error in errors:
            print(f"- {error}")
        return 1
    print(f"PASS edition={args.edition} files={len(paths)} rules={len(rules)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
