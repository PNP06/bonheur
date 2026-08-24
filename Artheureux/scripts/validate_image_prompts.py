#!/usr/bin/env python3
"""Validate the production prompt manifests against the canonical rules."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
REQUIRED_FIELDS = {
    "order",
    "title",
    "visual_concept",
    "scene",
    "prompt",
    "negative_constraints",
}
EXPECTED_ORDERS = [3, 4, *range(7, 51)]
DIVERSITY_LIMITS = {
    "adult": (
        ("table/bureau/établi", ("table", "bureau", "établi"), 14),
    ),
    "youth": (
        (
            "sport",
            ("basket", "football", "handball", "natation", "vélo", "gymnase", "entraînement", "entraîneur", "entraîneuse", "coach", "sportif"),
            8,
        ),
        ("sac", ("sac",), 8),
        ("téléphone/écran", ("téléphone", "smartphone", "tablette", "écran", "ordinateur"), 8),
    ),
}


def validate_edition(edition: str) -> list[str]:
    errors: list[str] = []
    canonical = json.loads(
        (ROOT / "Artheureux" / "data" / f"{edition}.json").read_text(encoding="utf-8")
    )
    titles = {rule["order"]: rule["title"] for rule in canonical["rules"]}
    prompts: list[dict] = []

    for path in sorted((ROOT / "Artheureux" / "image-prompts").glob(f"{edition}-*.json")):
        prompts.extend(json.loads(path.read_text(encoding="utf-8")))

    orders = [item.get("order") for item in prompts]
    if orders != EXPECTED_ORDERS:
        errors.append(f"{edition}: expected replacement 03-04 and orders 07-50, got {orders}")

    seen_scenes: set[str] = set()
    seen_prompts: set[str] = set()
    for item in prompts:
        order = item.get("order")
        missing = REQUIRED_FIELDS - item.keys()
        if missing:
            errors.append(f"{edition} rule {order}: missing {sorted(missing)}")
            continue
        if item["title"] != titles.get(order):
            errors.append(
                f"{edition} rule {order}: title mismatch {item['title']!r} != {titles.get(order)!r}"
            )
        for field in ("visual_concept", "scene", "prompt"):
            if not isinstance(item[field], str) or not item[field].strip():
                errors.append(f"{edition} rule {order}: empty {field}")
        if not isinstance(item["negative_constraints"], list) or not item["negative_constraints"]:
            errors.append(f"{edition} rule {order}: negative_constraints must be a non-empty list")
        if item["scene"] in seen_scenes:
            errors.append(f"{edition} rule {order}: duplicated scene")
        if item["prompt"] in seen_prompts:
            errors.append(f"{edition} rule {order}: duplicated prompt")
        seen_scenes.add(item["scene"])
        seen_prompts.add(item["prompt"])

    for label, keywords, maximum in DIVERSITY_LIMITS[edition]:
        matching = [
            item.get("order")
            for item in prompts
            if any(keyword in item.get("scene", "").casefold() for keyword in keywords)
        ]
        if len(matching) > maximum:
            errors.append(
                f"{edition}: visual cluster {label!r} appears in {len(matching)} scenes "
                f"(max {maximum}), rules {matching}"
            )

    print(f"CHECK {edition} prompts={len(prompts)}")
    return errors


def main() -> int:
    errors = validate_edition("adult") + validate_edition("youth")
    if errors:
        for error in errors:
            print(f"ERROR {error}")
        return 1
    print("PASS image prompt manifests")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
