#!/usr/bin/env python3
"""Extract the first PDF page containing each numbered rule heading."""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import pdfplumber


PATTERN = re.compile(r"R[ÈE]GLE\s+([0-9]{2})", re.IGNORECASE)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf")
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    found: dict[str, int] = {}
    with pdfplumber.open(args.pdf) as pdf:
        for page_number, page in enumerate(pdf.pages, start=1):
            text = page.extract_text() or ""
            for match in PATTERN.finditer(text):
                number = str(int(match.group(1)))
                found.setdefault(number, page_number)

    missing = [str(number) for number in range(1, 51) if str(number) not in found]
    if missing:
        raise SystemExit(f"missing rule headings: {', '.join(missing)}")

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(found, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"WROTE {output} rules={len(found)} first={found['1']} last={found['50']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
