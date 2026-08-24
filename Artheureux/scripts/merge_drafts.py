#!/usr/bin/env python3
"""Merge reviewed editorial batches into one canonical edition JSON."""
from __future__ import annotations

import argparse
import glob
import json
from pathlib import Path


COPY_FIELDS = (
    "title", "summary", "example", "advice", "key_phrase", "questions",
    "themes", "needs", "source",
)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--canonical", required=True)
    parser.add_argument("--drafts", required=True)
    parser.add_argument("--edition", choices=("adult", "youth"), required=True)
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()

    canonical_path = Path(args.canonical)
    canonical = json.loads(canonical_path.read_text(encoding="utf-8"))
    if canonical.get("metadata", {}).get("edition") != args.edition:
        raise SystemExit("canonical edition mismatch")

    drafts: dict[str, dict] = {}
    paths = [Path(item) for item in sorted(glob.glob(args.drafts))]
    for path in paths:
        payload = json.loads(path.read_text(encoding="utf-8"))
        if payload.get("edition") != args.edition:
            raise SystemExit(f"{path}: draft edition mismatch")
        for rule in payload.get("rules", []):
            rule_id = rule.get("id")
            if rule_id in drafts:
                raise SystemExit(f"duplicate draft {rule_id}")
            drafts[rule_id] = rule

    expected = {f"rule-{number:02d}" for number in range(1, 51)}
    if set(drafts) != expected:
        missing = sorted(expected - set(drafts))
        extra = sorted(set(drafts) - expected)
        raise SystemExit(f"draft coverage mismatch missing={missing} extra={extra}")

    for canonical_rule in canonical["rules"]:
        draft = drafts[canonical_rule["id"]]
        if draft["order"] != canonical_rule["order"]:
            raise SystemExit(f"order mismatch for {canonical_rule['id']}")
        for field in COPY_FIELDS:
            canonical_rule[field] = draft[field]
        canonical_rule["status"] = "ready"
        canonical_rule["image"]["alt"] = draft["image_alt"]
        canonical_rule["image"]["status"] = "planned"
        canonical_rule["publication"]["status"] = "planned"

    canonical["metadata"]["content_version"] = "0.2.0"
    canonical["metadata"]["editorial_status"] = "ready-for-review"
    rendered = json.dumps(canonical, ensure_ascii=False, indent=2) + "\n"
    if args.write:
        canonical_path.write_text(rendered, encoding="utf-8")
        print(f"WROTE {canonical_path} from {len(paths)} batches")
    else:
        print(f"DRY_RUN {canonical_path} from {len(paths)} batches")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
