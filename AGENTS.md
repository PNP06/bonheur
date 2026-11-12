# Bonheur

Communiquer en français. Lire `README.md` avant de modifier le site.

## Structure à préserver

Le site suit la structure de Psytest (dépôt `PNP06/Psytest`), demandée par David le 12 novembre 2026 :
mêmes pages de lecture (accueil, Comprendre, page de présentation du questionnaire, Méthode), même questionnaire
par parties avec fils d'Ariane latéraux, même rapport imprimable, même charte DD Lab (`app/style.css` et
`app/home.css` sont repris de Psytest), même assemblage en une page par `scripts/bundle.py`.
Bonheur garde son propre contenu : le guide (`docs/*.md`), le questionnaire (`app/data/questionnaire.json`)
et L'Art d'être heureux (`Artheureux/`).

- Le fond du guide reste dans `docs/*.md` : ne pas le recopier dans le code. `app/content.js` ne fait que l'organiser.
- Toute modification du questionnaire (question, seuil, action) se fait dans `app/data/questionnaire.json` et se documente.
- Le questionnaire est une aide à l'orientation, pas un diagnostic ni une échelle validée : ne pas le présenter autrement.
- Les réponses ne quittent jamais le navigateur (stockage local et fichier de reprise). Ne pas ajouter de service externe ;
  la seule exception est Mermaid, chargé depuis jsDelivr uniquement sur la page Visualisations.
- Les noms de premier niveau des modules `app/*.js` doivent rester uniques : `scripts/bundle.py` les concatène dans une seule portée.

## Vérifier

```bash
npm test                      # moteur, fichier de reprise, contenus, génération de la page
python3 scripts/bundle.py     # génère site/
python3 -m http.server 8000 -d site
```

## Publication

Worker Cloudflare `bonheur` (Custom Domain bonheur.ddlab.fr), comme Psytest : Workers Builds relie ce dépôt au Worker
et lance `python3 -X utf8 scripts/bundle.py` puis `npx wrangler deploy` à chaque push sur `main` (voir `wrangler.jsonc`).
Le workflow `.github/workflows/pages.yml` lance aussi les tests et publie une copie sur GitHub Pages (ancienne adresse).
Lire les règles de `PNP06/ddlab/AGENTS.md` avant de toucher au domaine ou au Worker.

Ne jamais publier `Artheureux/original.pdf` ni les fichiers `.docx` de travail (le workflow le vérifie).
