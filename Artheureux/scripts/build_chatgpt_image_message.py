#!/usr/bin/env python3
"""Préparer les messages V2 à envoyer aux conversations ChatGPT d'illustration."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def load_rule(edition: str, order: int) -> dict:
    data_path = ROOT / "data" / f"{edition}.json"
    data = json.loads(data_path.read_text(encoding="utf-8"))
    for rule in data["rules"]:
        if rule["order"] == order:
            return rule
    raise SystemExit(f"Règle {order} introuvable dans {data_path}")


def framing(edition: str) -> str:
    path = ROOT / "image-prompts" / "v2" / f"{edition}-framing.txt"
    return path.read_text(encoding="utf-8").strip()


def rule_message(edition: str, order: int) -> str:
    rule = load_rule(edition, order)
    advice = "\n".join(f"- {item}" for item in rule["advice"])
    questions = "\n".join(f"- {item}" for item in rule["questions"])
    audience = "adulte" if edition == "adult" else "jeunesse 10-15 ans"
    diversity_guard = (
        " N'utilise pas de montage en panneaux, de bulles de pensée, de diptyque "
        "ni de personnage central entouré de petites scènes : cette construction "
        "vient d'être trop utilisée. Fais aussi varier nettement la silhouette, "
        "les vêtements et l'âge apparent des personnages récents."
        if edition == "youth"
        else " Évite de répéter une personne centrale entre deux mondes, un chemin "
        "vers l'horizon ou une terrasse méditerranéenne si l'une de ces constructions "
        "apparaît dans les images récentes."
    )
    return (
        f"Génère maintenant l'illustration {audience} de la règle {order}.\n\n"
        f"TITRE\n{rule['title']}\n\n"
        f"RÉSUMÉ\n{rule['summary']}\n\n"
        f"EXEMPLE PRATIQUE\n{rule['example']}\n\n"
        f"CONSEILS D'APPLICATION\n{advice}\n\n"
        f"PHRASE CLÉ\n{rule['key_phrase']}\n\n"
        f"QUESTIONS À SE POSER\n{questions}\n\n"
        "Choisis toi-même le crochet visuel, l'univers graphique et la palette "
        "qui rendront cette règle distincte des précédentes. Compare silencieusement "
        "les trois dernières images de la conversation et éloigne-toi nettement de "
        "leur technique, de leur époque visuelle, de leur composition et de leur "
        "palette. Respecte entièrement le cadrage artistique de cette conversation "
        "et génère directement une seule image carrée, lumineuse, sans texte, lettre, "
        "chiffre, pseudo-texte, logo ou filigrane, et sans commentaire."
        f"{diversity_guard}"
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--edition", choices=("adult", "youth"), required=True)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--framing", action="store_true")
    group.add_argument("--rule", type=int, choices=range(1, 51), metavar="1..50")
    args = parser.parse_args()

    text = framing(args.edition) if args.framing else rule_message(args.edition, args.rule)
    sys.stdout.reconfigure(encoding="utf-8")
    print(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
