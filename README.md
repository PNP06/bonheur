# Bonheur, guide opérationnel
- Objectif : rendre accessible ce que la science sait aujourd’hui du bonheur, et aider chacun à choisir quoi changer maintenant (questionnaire d’auto-orientation, plan sur 7 jours, L’Art d’être heureux).
- Adresse : https://bonheur.ddlab.fr (public)
- Statut : En ligne
- Hébergement : Worker Cloudflare `bonheur` (déployé par Workers Builds à chaque push sur `main`) ; données : aucune (réponses dans le navigateur)
- Prochaine action : relire la refonte calquée sur Psytest (accueil, Comprendre, questionnaire par parties, plan imprimable).

Ce dépôt contient un rapport scientifique, critique et opérationnel sur le bonheur humain, structuré en fichiers Markdown.

Objectif : conserver l'intégralité du rapport initial, ses sources, ses distinctions méthodologiques et ses conclusions pratiques, puis ajouter des supports d'analyse utilisables : tableaux de bord, infographies proposées, questionnaire d'auto-orientation et matrice d'actions.

## Site web

Le site a la même structure que [Psytest](https://psytest.ddlab.fr) : même charte DD Lab, même navigation, même découpage du code.

| Page | Adresse | Contenu |
|---|---|---|
| Accueil | `#` | La promesse, une scène animée (exemple fictif), le parcours Comprendre → questionnaire → plan, ce que le guide n’est pas. |
| Comprendre | `#comprendre` | L’essentiel en six idées, puis les huit chapitres du guide (`docs/01` à `docs/08`) avec fils d’Ariane latéraux et encadrés « À retenir ». |
| Le questionnaire | `#questionnaire` | Présentation, puis une partie par domaine (`#questionnaire/1` à `/12`). |
| Votre plan | `#plan` | Priorités, plan 7 jours, points à maintenir, scores, réponses ; imprimable en PDF. |
| L’Art d’être heureux | `#art/adulte`, `#art/jeunesse` | Les 50 règles, par ressenti, thème ou au hasard. |
| Méthode et sources | `#methode` | Principes, niveaux de preuve, calcul du questionnaire, documents complémentaires (`#lire/<document>`). |

Les anciennes adresses (`#/synthese`, `#/guide`, `#/lire/…`, `#/art-heureux/…`, `#/tableau-de-bord`, `#/sources`) redirigent vers les nouvelles. Les réponses déjà enregistrées dans le navigateur sont conservées (même clé de stockage).

### Organisation du code (comme Psytest)

| Dossier ou fichier | Rôle |
|---|---|
| `app/index.html` | Squelette de la page |
| `app/main.js` | Navigation, questionnaire, pause et reprise, rapport, fils d’Ariane |
| `app/home.js`, `comprendre.js`, `presentation.js`, `methode.js`, `art.js` | Une page chacun |
| `app/engine.js` | Calcul des scores, priorités et plan (fonctions pures, testées) |
| `app/resume.js` | Fichier de reprise (.txt) |
| `app/report.js` | Rapport « Votre plan » |
| `app/markdown.js` | Rendu des documents `docs/*.md` |
| `app/content.js`, `app/data/questionnaire.json` | Textes du site et questionnaire |
| `app/style.css`, `app/home.css` | Charte et pages reprises de Psytest ; `app/bonheur.css` pour les compléments |
| `scripts/bundle.py` | Assemble `site/` : une page autonome (polices, contenus et code intégrés) + images et PDF |
| `tests/` | `npm test` (node --test) |

Construire et voir le site en local :

```bash
python3 scripts/bundle.py
python3 -m http.server 8000 -d site
```

Puis ouvrir `http://localhost:8000`. Le fond reste dans `docs/*.md` : modifier un document suffit, la page est régénérée.

En ligne : le Worker Cloudflare `bonheur` ([`wrangler.jsonc`](wrangler.jsonc), [`worker.js`](worker.js)) sert `site/` sous bonheur.ddlab.fr. Workers Builds lance `python3 -X utf8 scripts/bundle.py` puis `npx wrangler deploy` à chaque push sur `main`. Avec Wrangler authentifié sur le compte DD Lab : `python3 -X utf8 scripts/bundle.py && npx wrangler deploy`.

Le workflow GitHub Actions [`pages.yml`](.github/workflows/pages.yml) lance les tests et publie aussi une copie sur GitHub Pages (ancienne adresse pnp06.github.io/bonheur).

## Structure du dépôt

| Fichier | Contenu |
|---|---|
| [`docs/00-index-du-guide.md`](docs/00-index-du-guide.md) | Sommaire général, méthode, mode d'emploi et chemin de lecture. |
| [`docs/00-rapport-complet.md`](docs/00-rapport-complet.md) | Rapport consolidé complet en un seul fichier, pour éviter toute perte de contenu. |
| [`docs/01-definir-le-bonheur.md`](docs/01-definir-le-bonheur.md) | Définitions scientifiques : plaisir, satisfaction, bien-être subjectif, eudémonie, sens, qualité de vie, flourishing et santé mentale. |
| [`docs/02-neuroscience.md`](docs/02-neuroscience.md) | Neuroscience du bien-être : circuits, neurotransmetteurs, erreurs de vulgarisation et niveau de preuve. |
| [`docs/03-determinants-majeurs.md`](docs/03-determinants-majeurs.md) | Déterminants majeurs du bonheur, classement, mécanismes et tableau comparatif. |
| [`docs/04-illusions-humaines.md`](docs/04-illusions-humaines.md) | Adaptation hédonique, biais de projection, comparaison sociale, matérialisme, FoMO, illusion du succès, illusion romantique et illusion de contrôle. |
| [`docs/05-philosophies.md`](docs/05-philosophies.md) | Comparaison entre données scientifiques modernes et philosophies pratiques. |
| [`docs/06-systeme-exploitation.md`](docs/06-systeme-exploitation.md) | Modèle de pilotage du bonheur comparable à un tableau de bord de gestion des risques. |
| [`docs/07-plan-action.md`](docs/07-plan-action.md) | Plan d'action en trois niveaux : effet maximal/effort minimal, habitudes structurantes, optimisation avancée. |
| [`docs/08-dix-variables.md`](docs/08-dix-variables.md) | Les 10 variables à optimiser sur plusieurs décennies et leurs interactions. |
| [`docs/09-synthese-executive.md`](docs/09-synthese-executive.md) | Synthèse exécutive, 20 enseignements, 10 erreurs, 10 actions rentables. |
| [`docs/questionnaire-operationnel.md`](docs/questionnaire-operationnel.md) | Questionnaire pratique pour orienter les actions individuelles à partir des déterminants documentés. |
| [`docs/tableau-de-bord-risques-bonheur.md`](docs/tableau-de-bord-risques-bonheur.md) | Tableau de bord détaillé avec indicateurs, seuils et actions correctives. |
| [`docs/matrice-actions.md`](docs/matrice-actions.md) | Matrice opérationnelle des actions : bénéfices, preuve, difficulté, délai, risques et limites. |
| [`docs/infographies-et-visualisations.md`](docs/infographies-et-visualisations.md) | Propositions d'infographies et diagrammes Mermaid exploitables dans GitHub. |
| [`docs/references-top-50.md`](docs/references-top-50.md) | Bibliographie commentée, top 50 références scientifiques et classement des preuves. |

## Principes méthodologiques

- Priorité aux méta-analyses, revues systématiques, essais randomisés et cohortes longitudinales.
- Séparation explicite entre faits établis, hypothèses plausibles, controverses et mythes populaires.
- Causalité indiquée seulement lorsqu'elle est raisonnablement appuyée par le design des études.
- Orientation vers l'action sans langage motivationnel ni injonction morale.
- Conservation des sources et des limites de preuve.

## Usage recommandé

1. Lire d'abord la [`synthèse exécutive`](docs/09-synthese-executive.md).
2. Passer le questionnaire du site pour repérer 1 à 3 domaines prioritaires.
3. Appliquer une à trois actions concrètes pendant 7 jours, sans transformer le questionnaire en diagnostic.
4. Conserver les domaines protecteurs identifiés dans la synthèse.
5. Réévaluer dans 2 à 4 semaines, puis approfondir avec le [`tableau de bord`](docs/tableau-de-bord-risques-bonheur.md), la [`matrice actions`](docs/matrice-actions.md) ou le [`rapport complet`](docs/00-rapport-complet.md).

## Avertissement

Ce contenu relève de l'information scientifique générale et de l'aide à la décision. Il ne remplace pas une évaluation médicale, psychologique ou psychiatrique en cas de trouble mental, douleur chronique, insomnie sévère, idées suicidaires, addiction, traumatisme, violence relationnelle ou isolement majeur.
