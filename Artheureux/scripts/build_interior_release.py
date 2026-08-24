#!/usr/bin/env python3
"""Build a stable, paginated and mechanically validated interior release."""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import subprocess
import sys
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[2]
SCRIPTS = ROOT / "Artheureux" / "scripts"
LABEL = {"adult": "adulte", "youth": "jeunesse"}
DEFAULT_COVER_IMAGE = {
    "adult": ROOT / "Artheureux/assets/images/adult/print/rule-01.png",
    "youth": ROOT / "Artheureux/assets/images/youth/print/rule-01.png",
}


def run(*args: object) -> None:
    command = [str(value) for value in args]
    print("RUN", " ".join(command))
    subprocess.run(command, cwd=ROOT, check=True)


def find_soffice() -> str:
    detected = shutil.which("soffice")
    if detected:
        return detected
    candidates = (
        Path(r"C:\Program Files\LibreOffice\program\soffice.exe"),
        Path(r"C:\Program Files (x86)\LibreOffice\program\soffice.exe"),
    )
    for candidate in candidates:
        if candidate.exists():
            return str(candidate)
    raise FileNotFoundError("LibreOffice soffice was not found")


def load_map(path: Path) -> dict[str, int]:
    return {str(key): int(value) for key, value in json.loads(path.read_text(encoding="utf-8")).items()}


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def publish_web_downloads(releases: dict[str, Path]) -> dict[str, Path]:
    manifest_path = ROOT / "Artheureux" / "data" / "downloads.json"
    downloads = ROOT / "downloads"
    downloads.mkdir(parents=True, exist_ok=True)
    staged: list[tuple[str, Path, Path]] = []
    try:
        for edition, source in releases.items():
            target = downloads / f"artheureux-{LABEL[edition]}.pdf"
            temporary = target.with_suffix(".pdf.tmp")
            shutil.copy2(source, temporary)
            staged.append((edition, temporary, target))
        for _, temporary, target in staged:
            temporary.replace(target)
    finally:
        for _, temporary, _ in staged:
            temporary.unlink(missing_ok=True)

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    published: dict[str, Path] = {}
    for edition, _, target in staged:
        manifest[edition] = {
            "available": True,
            "path": f"downloads/{target.name}",
            "bytes": target.stat().st_size,
            "sha256": file_sha256(target),
        }
        published[edition] = target
    temporary = manifest_path.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(manifest_path)
    return published


def build_edition(edition: str, output_root: Path, strict_images: bool) -> Path:
    python = sys.executable
    soffice = find_soffice()
    work = ROOT / "tmp" / f"release-{edition}"
    work.mkdir(parents=True, exist_ok=True)
    output_root.mkdir(parents=True, exist_ok=True)

    image_validation = [python, SCRIPTS / "validate_image_assets.py", "--edition", edition]
    if strict_images:
        image_validation.append("--strict")
    run(*image_validation)
    run(python, SCRIPTS / "validate_content.py")
    run(python, SCRIPTS / "validate_reader_paths.py")
    run(python, SCRIPTS / "validate_download_manifest.py")
    run(python, SCRIPTS / "validate_image_prompts.py")
    run(python, SCRIPTS / "build_web_images.py", "--edition", edition)

    previous_map: dict[str, int] | None = None
    stable_docx: Path | None = None
    stable_pdf: Path | None = None
    stable_map_path: Path | None = None
    content = json.loads((ROOT / "Artheureux" / "data" / f"{edition}.json").read_text(encoding="utf-8"))
    ready_image_count = sum(rule.get("image", {}).get("status") == "ready" for rule in content["rules"])

    for pass_number in range(1, 5):
        pass_dir = work / f"pass-{pass_number}"
        pass_dir.mkdir(parents=True, exist_ok=True)
        docx = pass_dir / f"artheureux-{LABEL[edition]}-interieur.docx"
        build_command: list[object] = [
            python,
            SCRIPTS / "build_interior_docx.py",
            "--edition",
            edition,
            "--output",
            docx,
        ]
        if stable_map_path:
            build_command.extend(("--page-map", stable_map_path))
        run(*build_command)

        run(soffice, "--headless", "--convert-to", "pdf", "--outdir", pass_dir, docx)
        raw_pdf = pass_dir / f"{docx.stem}.pdf"
        if not raw_pdf.exists():
            raise FileNotFoundError(f"LibreOffice did not create {raw_pdf}")

        page_map_path = pass_dir / "rule-pages.json"
        run(python, SCRIPTS / "extract_rule_pages.py", raw_pdf, "--output", page_map_path)
        current_map = load_map(page_map_path)
        if previous_map is not None and current_map == previous_map:
            stable_docx = docx
            stable_pdf = raw_pdf
            stable_map_path = page_map_path
            print(f"STABLE pagination pass={pass_number}")
            break
        previous_map = current_map
        stable_map_path = page_map_path

    if stable_docx is None or stable_pdf is None or stable_map_path is None:
        raise RuntimeError("Pagination did not stabilize after four passes")

    final_docx = output_root / f"artheureux-{LABEL[edition]}-interieur.docx"
    final_pdf = output_root / f"artheureux-{LABEL[edition]}-interieur-kdp.pdf"
    final_map = output_root / f"artheureux-{LABEL[edition]}-pages.json"
    shutil.copy2(stable_docx, final_docx)
    shutil.copy2(stable_map_path, final_map)

    run(
        python,
        SCRIPTS / "normalize_pdf_trim.py",
        "--edition",
        edition,
        "--input",
        stable_pdf,
        "--output",
        final_pdf,
        "--ensure-even",
    )
    run(
        python,
        SCRIPTS / "validate_kdp_pdf.py",
        "--edition",
        edition,
        "--require-even",
        "--minimum-image-dpi",
        300,
        "--expected-rule-images",
        ready_image_count,
        final_pdf,
    )

    normalized_map = work / "normalized-rule-pages.json"
    run(python, SCRIPTS / "extract_rule_pages.py", final_pdf, "--output", normalized_map)
    if load_map(normalized_map) != load_map(final_map):
        raise RuntimeError("Rule pages changed during PDF normalization")

    web_dir = work / "web"
    web_dir.mkdir(parents=True, exist_ok=True)
    web_docx = web_dir / f"artheureux-{LABEL[edition]}-web.docx"
    run(
        python,
        SCRIPTS / "build_interior_docx.py",
        "--edition",
        edition,
        "--output",
        web_docx,
        "--page-map",
        final_map,
        "--image-profile",
        "web",
    )
    run(soffice, "--headless", "--convert-to", "pdf", "--outdir", web_dir, web_docx)
    raw_web_pdf = web_dir / f"{web_docx.stem}.pdf"
    if not raw_web_pdf.exists():
        raise FileNotFoundError(f"LibreOffice did not create {raw_web_pdf}")
    final_web_pdf = output_root / f"artheureux-{LABEL[edition]}-web.pdf"
    run(
        python,
        SCRIPTS / "normalize_pdf_trim.py",
        "--edition",
        edition,
        "--input",
        raw_web_pdf,
        "--output",
        final_web_pdf,
        "--ensure-even",
    )
    run(
        python,
        SCRIPTS / "validate_kdp_pdf.py",
        "--edition",
        edition,
        "--require-even",
        final_web_pdf,
    )
    web_map = web_dir / "web-rule-pages.json"
    run(python, SCRIPTS / "extract_rule_pages.py", final_web_pdf, "--output", web_map)
    if load_map(web_map) != load_map(final_map):
        raise RuntimeError("Rule pages changed in the optimized web PDF")
    if final_web_pdf.stat().st_size >= final_pdf.stat().st_size:
        raise RuntimeError("Optimized web PDF is not smaller than the KDP interior")
    if final_web_pdf.stat().st_size > 95 * 1024 * 1024:
        raise RuntimeError("Optimized web PDF exceeds the 95 MiB publication limit")

    page_count = len(PdfReader(final_pdf).pages)
    cover_image = DEFAULT_COVER_IMAGE[edition]
    final_cover = output_root / f"artheureux-{LABEL[edition]}-couverture-kdp.pdf"
    checklist = output_root / f"artheureux-{LABEL[edition]}-fiche-controle.md"
    run(
        python,
        SCRIPTS / "build_cover_pdf.py",
        "--edition",
        edition,
        "--page-count",
        page_count,
        "--image",
        cover_image,
        "--output",
        final_cover,
    )
    run(
        python,
        SCRIPTS / "validate_cover_pdf.py",
        "--edition",
        edition,
        "--page-count",
        page_count,
        "--image",
        cover_image,
        final_cover,
    )
    run(
        python,
        SCRIPTS / "build_release_checklist.py",
        "--edition",
        edition,
        "--interior",
        final_pdf,
        "--cover",
        final_cover,
        "--web-pdf",
        final_web_pdf,
        "--cover-image",
        cover_image,
        "--output",
        checklist,
    )

    print(
        f"RELEASE {edition} docx={final_docx} pdf={final_pdf} web_pdf={final_web_pdf} pages={final_map} "
        f"cover={final_cover} checklist={checklist}"
    )
    return final_web_pdf


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--edition", choices=("adult", "youth", "both"), default="both")
    parser.add_argument("--output-dir", default="Artheureux/releases")
    parser.add_argument(
        "--allow-incomplete-images",
        action="store_true",
        help="Preview only: allow missing illustrations instead of enforcing all 50.",
    )
    parser.add_argument(
        "--publish-web",
        action="store_true",
        help="Copy each validated interior PDF to /downloads for the public site.",
    )
    args = parser.parse_args()

    if args.publish_web and args.allow_incomplete_images:
        parser.error("--publish-web cannot be combined with --allow-incomplete-images")

    editions = ("adult", "youth") if args.edition == "both" else (args.edition,)
    output_root = ROOT / args.output_dir
    web_releases: dict[str, Path] = {}
    for edition in editions:
        web_releases[edition] = build_edition(
            edition,
            output_root / edition,
            not args.allow_incomplete_images,
        )
    if args.publish_web:
        for edition, path in publish_web_downloads(web_releases).items():
            print(f"PUBLISHED web PDF {path} bytes={path.stat().st_size} edition={edition}")
        run(sys.executable, SCRIPTS / "validate_download_manifest.py")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
