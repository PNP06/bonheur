"""Assemble le site en une page HTML autonome, comme Psytest (scripts/bundle.py de PNP06/Psytest).

Entrées :
  app/                 code et styles du site (modules ES), app/data/questionnaire.json
  docs/*.md            fond du guide, intégré tel quel dans la page
  Artheureux/data/     règles de L'Art d'être heureux ; images web et PDF copiés à côté de la page
Sorties (dossier site/, non versionné) :
  site/index.html      page complète : CSS, JS, polices et contenus intégrés, Content-Security-Policy
  site/_headers        en-têtes HTTP de sécurité (pour un hébergement Cloudflare ; ignoré par GitHub Pages)
  site/art/<édition>/rule-NN.webp, site/downloads/*.pdf, site/.nojekyll
Usage : python3 scripts/bundle.py
"""
import base64, hashlib, json, re, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP, SITE = ROOT / "app", ROOT / "site"
ART = ROOT / "Artheureux"

# Ordre de concaténation : chaque module avant ceux qui l'utilisent.
MODULES = ["markdown.js", "content.js", "engine.js", "resume.js", "report.js", "methode.js",
           "presentation.js", "comprendre.js", "art.js", "home.js", "main.js"]
STYLES = ["style.css", "home.css", "bonheur.css"]
# Seule ressource externe : la bibliothèque de diagrammes, chargée uniquement sur la page Visualisations.
MERMAID = "https://cdn.jsdelivr.net"

HEADERS = """/*
  Content-Security-Policy: {csp}; frame-ancestors 'none'
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Cache-Control: public, max-age=300
"""


def strip_module(src):
    src = re.sub(r"^import .*?;\s*$", "", src, flags=re.M)
    return re.sub(r"^export (const|function|async function|let)", r"\1", src, flags=re.M)


def as_json(obj):
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")


def main():
    js = "(() => {\n" + "\n".join(strip_module((APP / f).read_text(encoding="utf-8")) for f in MODULES) + "\n})();\n"
    css = "\n".join((APP / f).read_text(encoding="utf-8") for f in STYLES)
    # Polices embarquées (sous-ensembles woff2, licence OFL) : aucune requête vers un service de polices.
    css = re.sub(r"url\(fonts/([\w.-]+\.woff2)\)",
                 lambda m: "url(data:font/woff2;base64," + base64.b64encode((APP / "fonts" / m.group(1)).read_bytes()).decode() + ")", css)

    cfg = json.loads((APP / "data" / "questionnaire.json").read_text(encoding="utf-8"))
    docs = {f"docs/{p.name}": p.read_text(encoding="utf-8") for p in sorted((ROOT / "docs").glob("*.md"))}
    art = {k: json.loads((ART / "data" / f"{f}.json").read_text(encoding="utf-8"))
           for k, f in [("adult", "adult"), ("youth", "youth"), ("paths", "reader-paths"), ("downloads", "downloads")]}
    # Le site n'a besoin que des règles et des métadonnées d'affichage.
    for k in ("adult", "youth"):
        art[k] = {"rules": [{key: r.get(key) for key in ("id", "order", "title", "status", "summary", "example", "advice", "key_phrase", "questions", "themes", "image", "source")}
                            for r in art[k]["rules"]]}

    h = base64.b64encode(hashlib.sha256(js.encode("utf-8")).digest()).decode()
    csp = (f"default-src 'none'; script-src 'sha256-{h}' {MERMAID}; style-src 'unsafe-inline'; img-src 'self' data:; "
           "font-src data:; form-action 'none'; base-uri 'none'")
    head = (APP / "index.html").read_text(encoding="utf-8")
    head = re.sub(r'content="default-src[^"]*"', f'content="{csp}"', head)
    head = re.sub(r'(<link rel="stylesheet" href="[\w.]+\.css">\n?)+', f"<style>\n{css}</style>\n", head)
    body = (f'<script type="application/json" id="bonheur-config">{as_json(cfg)}</script>\n'
            f'<script type="application/json" id="bonheur-docs">{as_json(docs)}</script>\n'
            f'<script type="application/json" id="bonheur-art">{as_json(art)}</script>\n'
            f"<script>{js}</script>")
    full = head.replace('<script type="module" src="main.js"></script>', body)

    if SITE.exists():
        shutil.rmtree(SITE)
    SITE.mkdir()
    (SITE / "index.html").write_text(full, encoding="utf-8")
    (SITE / "_headers").write_text(HEADERS.format(csp=csp), encoding="utf-8")
    (SITE / ".nojekyll").write_text("", encoding="utf-8")
    (SITE / ".assetsignore").write_text(".nojekyll\n", encoding="utf-8")  # fichier propre à GitHub Pages, inutile sur le Worker

    # Images web des règles : uniquement les fichiers rule-NN.webp publiés.
    n_img = 0
    for ed in ("adult", "youth"):
        out = SITE / "art" / ed
        out.mkdir(parents=True)
        for img in sorted((ART / "assets" / "images" / ed / "web").glob("rule-[0-9][0-9].webp")):
            shutil.copy2(img, out / img.name)
            n_img += 1
    # PDF téléchargeables, tels que déclarés dans Artheureux/data/downloads.json.
    (SITE / "downloads").mkdir()
    for ed in ("adult", "youth"):
        d = art["downloads"].get(ed, {})
        if d.get("available"):
            shutil.copy2(ROOT / d["path"], SITE / "downloads" / Path(d["path"]).name)

    print(f"site/index.html : {len(full) // 1024} Ko ; {len(docs)} documents ; {n_img} images ; PDF : {len(list((SITE / 'downloads').iterdir()))}")


if __name__ == "__main__":
    main()
