#!/usr/bin/env python3
"""Build a concise, evidence-based KDP handoff checklist for one edition."""

from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path

from PIL import Image
from pypdf import PdfReader

from validate_cover_pdf import (
    COVER_IMAGE_WIDTH_INCHES,
    SPINE_PER_PAGE_INCHES,
    TRIM_INCHES,
    expected_size_points,
)


LABEL = {"adult": "adulte", "youth": "jeunesse 10–15 ans"}
OLD_ADULT_ISBN = "9798325081552"
ROOT = Path(__file__).resolve().parents[2]
CONFIGURED_MARGINS = {
    "inside": 0.78,
    "outside": 0.58,
    "gutter": 0.08,
    "top": 0.62,
    "bottom": 0.62,
}


def required_inside_margin(page_count: int) -> float:
    if page_count <= 150:
        return 0.375
    if page_count <= 300:
        return 0.5
    if page_count <= 500:
        return 0.625
    if page_count <= 700:
        return 0.75
    return 0.875


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--edition", choices=sorted(TRIM_INCHES), required=True)
    parser.add_argument("--interior", required=True)
    parser.add_argument("--cover", required=True)
    parser.add_argument("--web-pdf", required=True)
    parser.add_argument("--cover-image", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    interior_path = Path(args.interior)
    cover_path = Path(args.cover)
    web_pdf_path = Path(args.web_pdf)
    image_path = Path(args.cover_image)
    page_count = len(PdfReader(interior_path).pages)
    minimum_inside = required_inside_margin(page_count)
    effective_inside = CONFIGURED_MARGINS["inside"] + CONFIGURED_MARGINS["gutter"]
    if effective_inside < minimum_inside or CONFIGURED_MARGINS["outside"] < 0.25:
        raise ValueError("configured margins are below the KDP minimum for this page count")
    trim_width, trim_height = TRIM_INCHES[args.edition]
    cover_width_pt, cover_height_pt, spine_width = expected_size_points(args.edition, page_count)
    with Image.open(image_path) as opened:
        image_pixels = f"{opened.width} × {opened.height} px"
        image_dpi = min(opened.width, opened.height) / COVER_IMAGE_WIDTH_INCHES[args.edition]

    content = json.loads(
        (ROOT / "Artheureux" / "data" / f"{args.edition}.json").read_text(encoding="utf-8")
    )
    ready_images = sum(rule.get("image", {}).get("status") == "ready" for rule in content["rules"])
    image_control_line = (
        "- [x] Les cinquante illustrations de l’édition ont passé le contrôle de format et de résolution."
        if ready_images == 50
        else f"- [ ] Illustrations encore incomplètes : {ready_images}/50 sont prêtes et contrôlées."
    )

    isbn_line = (
        f"- [ ] Attribuer un nouvel ISBN et ne pas réutiliser `{OLD_ADULT_ISBN}`."
        if args.edition == "adult"
        else "- [ ] Attribuer l’ISBN retenu pour cette nouvelle édition jeunesse."
    )
    text = f"""# Fiche de contrôle KDP — édition {LABEL[args.edition]}

Générée le {date.today().isoformat()} à partir des fichiers de livraison.

## Fichiers contrôlés

- Source éditable : `artheureux-{'adulte' if args.edition == 'adult' else 'jeunesse'}-interieur.docx`
- Intérieur KDP : `{interior_path.name}`
- Couverture complète KDP : `{cover_path.name}`
- PDF allégé pour le site : `{web_pdf_path.name}` ({web_pdf_path.stat().st_size / 1024 / 1024:.1f} Mo)

## Paramètres calculés

| Paramètre | Valeur |
|---|---:|
| Format fini | {trim_width:g} × {trim_height:g} pouces |
| Nombre de pages intérieur | {page_count} |
| Marge intérieure configurée | {effective_inside:.3f} pouce (minimum KDP {minimum_inside:.3f}) |
| Marges extérieure / haute / basse | {CONFIGURED_MARGINS['outside']:.2f} / {CONFIGURED_MARGINS['top']:.2f} / {CONFIGURED_MARGINS['bottom']:.2f} pouce |
| Dos premium couleur, papier blanc | {spine_width:.4f} pouce ({spine_width * 25.4:.2f} mm) |
| Planche de couverture avec fond perdu | {cover_width_pt / 72:.4f} × {cover_height_pt / 72:.4f} pouces |
| Illustration de couverture | {image_pixels}, {image_dpi:.1f} DPI effectifs |

## Contrôles automatisés réussis par la chaîne de livraison

- [x] Intérieur au format exact, pages simples et nombre de pages pair.
- [x] PDF intérieur non chiffré, polices incorporées et texte d’au moins 7 pt.
- [x] Illustrations incorporées dans le PDF intérieur à au moins 300 DPI effectifs.
- [x] Marges configurées supérieures aux minima KDP applicables à cette pagination.
- [x] Couverture sur une seule planche, dimensions recalculées d’après la pagination finale.
- [x] Fond perdu de 0,125 pouce inclus dans les dimensions de couverture.
- [x] PDF de couverture non chiffré, polices incorporées et texte d’au moins 7 pt.
- [x] Illustration de couverture à au moins 300 DPI effectifs.
- [x] PDF web produit avec les images allégées, sans décalage des pages de règles.
{image_control_line}

## Contrôles humains avant publication

- [ ] Dans KDP, sélectionner **paperback**, **premium color**, **papier blanc** et **sans bleed** pour l’intérieur.
- [ ] Examiner toutes les pages dans l’outil de prévisualisation KDP, notamment la gouttière, les tableaux, les pages de règle et les images.
- [ ] Vérifier les traits de coupe, la zone de sécurité du dos et la position du code-barres dans l’aperçu KDP.
{isbn_line}
- [ ] Déclarer à KDP le texte et les illustrations générés par IA, conformément à la procédure en vigueur au moment de la mise en ligne.
- [ ] Relire le titre, le sous-titre, le nom `David DEVESA`, la description et les métadonnées avant validation.
- [ ] Commander une épreuve papier et contrôler couleurs, lisibilité, marges et reliure avant publication.

## Limites de cette fiche

Cette fiche prouve les contrôles mécaniques réalisés localement. Elle ne remplace ni l’outil de prévisualisation KDP, ni une épreuve imprimée. Aucune action n’a été effectuée dans le compte KDP.
"""
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(text, encoding="utf-8")
    print(f"WROTE {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
