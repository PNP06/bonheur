#!/usr/bin/env python3
"""Validate the canonical Artheureux content files with the standard library only."""
from __future__ import annotations
import json
import collections
import re
import sys
from pathlib import Path
from typing import Any

EXPECTED_IDS = [f"rule-{i:02d}" for i in range(1, 51)]
CONTRACTS = {
    "adult": {"summary": (140, 210), "example": (90, 150), "key_phrase": (1, 18), "total": (350, 500), "advice": (3, 4), "questions": (3, 3)},
    "youth": {"summary": (80, 130), "example": (70, 110), "key_phrase": (1, 14), "total": (220, 320), "advice": (3, 3), "questions": (2, 3)},
}

def words(value: str) -> int:
    return len(value.split())

def fail(errors: list[str], message: str) -> None:
    errors.append(message)

def load_utf8(path: Path, errors: list[str]) -> Any:
    try:
        raw = path.read_bytes()
        text = raw.decode("utf-8")
        return json.loads(text)
    except UnicodeDecodeError as exc:
        fail(errors, f"{path}: invalid UTF-8 ({exc})")
    except json.JSONDecodeError as exc:
        fail(errors, f"{path}: invalid JSON ({exc})")
    except OSError as exc:
        fail(errors, f"{path}: cannot read ({exc})")
    return None

def validate(path: Path) -> list[str]:
    errors: list[str] = []
    data = load_utf8(path, errors)
    if data is None:
        return errors
    if not isinstance(data, dict):
        return [f"{path}: top-level value must be an object"]
    metadata = data.get("metadata")
    rules = data.get("rules")
    if not isinstance(metadata, dict) or not isinstance(rules, list):
        return [f"{path}: metadata object and rules array are required"]
    edition = metadata.get("edition")
    if edition not in CONTRACTS:
        fail(errors, f"{path}: metadata.edition must be adult or youth")
        return errors
    if len(rules) != 50:
        fail(errors, f"{path}: expected exactly 50 rules, got {len(rules)}")
    ids = [r.get("id") for r in rules if isinstance(r, dict)]
    orders = [r.get("order") for r in rules if isinstance(r, dict)]
    if ids != EXPECTED_IDS:
        fail(errors, f"{path}: ids must be exactly rule-01..rule-50 in order")
    if orders != list(range(1, 51)):
        fail(errors, f"{path}: order must be exactly 1..50 in order")
    if len(ids) != len(set(ids)):
        fail(errors, f"{path}: rule ids must be unique")
    if len(orders) != len(set(orders)):
        fail(errors, f"{path}: rule orders must be unique")
    required = ["id","order","title","status","summary","example","advice","key_phrase","questions","themes","needs","image","source","publication"]
    if edition == "youth":
        required.append("parent_rule_id")
    for index, rule in enumerate(rules, 1):
        if not isinstance(rule, dict):
            fail(errors, f"{path}: rule {index} must be an object")
            continue
        missing = [key for key in required if key not in rule]
        if missing:
            fail(errors, f"{path}: rule {index} missing {', '.join(missing)}")
            continue
        if rule.get("status") not in {"planned", "ready", "published"}:
            fail(errors, f"{path}: rule {index} has invalid status")
        for field in ("advice", "questions", "themes", "needs"):
            if not isinstance(rule.get(field), list) or not all(isinstance(item, str) and item.strip() for item in rule[field]):
                fail(errors, f"{path}: rule {index}.{field} must be a non-empty string array")
        for block in ("image", "source", "publication"):
            if not isinstance(rule.get(block), dict):
                fail(errors, f"{path}: rule {index}.{block} must be an object")
        if edition == "youth" and rule.get("parent_rule_id") != rule.get("id"):
            fail(errors, f"{path}: rule {index}.parent_rule_id must match id")
        if rule.get("status") == "ready":
            contract = CONTRACTS[edition]
            for field in ("summary", "example", "key_phrase"):
                value = rule.get(field)
                if not isinstance(value, str):
                    fail(errors, f"{path}: rule {index}.{field} must be a string")
                else:
                    low, high = contract[field]
                    count = words(value)
                    if not low <= count <= high:
                        fail(errors, f"{path}: rule {index}.{field} has {count} words; expected {low}-{high}")
            total = sum(words(rule.get(field, "")) for field in ("summary", "example", "key_phrase")) + sum(words(item) for item in rule.get("advice", [])) + sum(words(item) for item in rule.get("questions", []))
            low, high = contract["total"]
            if not low <= total <= high:
                fail(errors, f"{path}: rule {index} total has {total} words; expected {low}-{high}")
            for field in ("advice", "questions"):
                low, high = contract[field]
                count = len(rule[field])
                if not low <= count <= high:
                    fail(errors, f"{path}: rule {index}.{field} has {count} items; expected {low}-{high}")

    semantic_values: dict[str, list[str]] = collections.defaultdict(list)
    example_starts: collections.Counter[str] = collections.Counter()
    for rule in rules:
        if not isinstance(rule, dict):
            continue
        for field in ("summary", "example", "key_phrase"):
            value = rule.get(field)
            if isinstance(value, str) and value.strip():
                semantic_values[value.casefold().strip()].append(f"rule {rule.get('order')}.{field}")
        for field in ("advice", "questions"):
            for item_index, value in enumerate(rule.get(field, []), start=1):
                if isinstance(value, str) and value.strip():
                    semantic_values[value.casefold().strip()].append(
                        f"rule {rule.get('order')}.{field}[{item_index}]"
                    )
        example = rule.get("example")
        if isinstance(example, str):
            opening = " ".join(re.findall(r"[\wÀ-ÿ’'-]+", example)[:4]).casefold()
            if opening:
                example_starts[opening] += 1

    for locations in semantic_values.values():
        if len(locations) > 1:
            fail(errors, f"{path}: exact semantic repetition at {', '.join(locations)}")
    for opening, count in example_starts.items():
        if count > 2:
            fail(errors, f"{path}: {count} examples start with {opening!r}")
    return errors


def cross_edition_repetitions(paths: list[Path]) -> list[str]:
    by_edition: dict[str, dict[str, list[str]]] = {}
    for path in paths:
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, UnicodeError, json.JSONDecodeError):
            continue
        edition = data.get("metadata", {}).get("edition")
        if edition not in CONTRACTS:
            continue
        values: dict[str, list[str]] = collections.defaultdict(list)
        for rule in data.get("rules", []):
            for field in ("summary", "example", "key_phrase"):
                value = rule.get(field)
                if isinstance(value, str):
                    values[value.casefold().strip()].append(f"rule {rule.get('order')}.{field}")
            for field in ("advice", "questions"):
                for item_index, value in enumerate(rule.get(field, []), start=1):
                    if isinstance(value, str):
                        values[value.casefold().strip()].append(
                            f"rule {rule.get('order')}.{field}[{item_index}]"
                        )
        by_edition[edition] = values

    if not {"adult", "youth"}.issubset(by_edition):
        return []
    errors: list[str] = []
    for value in sorted(by_edition["adult"].keys() & by_edition["youth"].keys()):
        if len(value.split()) < 5:
            continue
        errors.append(
            "adult/youth exact semantic repetition at "
            f"{', '.join(by_edition['adult'][value])} and {', '.join(by_edition['youth'][value])}"
        )
    return errors

def main(argv: list[str]) -> int:
    paths = [Path(arg) for arg in argv[1:]] or [Path("Artheureux/data/adult.json"), Path("Artheureux/data/youth.json")]
    errors: list[str] = []
    for path in paths:
        file_errors = validate(path)
        if file_errors:
            errors.extend(file_errors)
            print(f"FAIL {path}")
            for error in file_errors:
                print(f"  - {error}")
        else:
            print(f"PASS {path}")
    cross_errors = cross_edition_repetitions(paths)
    if cross_errors:
        errors.extend(cross_errors)
        print("FAIL cross-edition repetition")
        for error in cross_errors:
            print(f"  - {error}")
    return 1 if errors else 0

if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
