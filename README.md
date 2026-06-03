# Le Guide Opérationnel du Bonheur Humain

Ce dépôt contient un rapport scientifique, critique et opérationnel sur le bonheur humain, structuré en fichiers Markdown.

Objectif : conserver l'intégralité du rapport initial, ses sources, ses distinctions méthodologiques et ses conclusions pratiques, puis ajouter des supports d'analyse utilisables : tableaux de bord, infographies proposées, questionnaire d'auto-orientation et matrice d'actions.

## Site web

Le dépôt contient un site statique publié avec GitHub Pages :

<https://pnp06.github.io/bonheur/>

L'interface est organisée autour de trois usages :

1. **Lire la synthèse** : comprendre l'essentiel en quelques minutes.
2. **Explorer le guide complet** : lire le rapport détaillé par grands thèmes.
3. **Faire le questionnaire** : obtenir une auto-orientation opérationnelle avec scores, priorités, actions recommandées, copie/téléchargement de synthèse et stockage local dans le navigateur.

Pour lancer le site en local :

```bash
python -m http.server 8000
```

Puis ouvrir `http://localhost:8000`.

Le workflow GitHub Actions [`pages.yml`](.github/workflows/pages.yml) publie automatiquement le site sur GitHub Pages à chaque push sur `main`.

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
2. Passer le [`questionnaire opérationnel`](docs/questionnaire-operationnel.md).
3. Reporter les scores dans le [`tableau de bord`](docs/tableau-de-bord-risques-bonheur.md).
4. Choisir 1 à 3 actions dans la [`matrice actions`](docs/matrice-actions.md), en privilégiant sommeil, relations, activité physique, autonomie et réduction des expositions toxiques.
5. Utiliser le [`rapport complet`](docs/00-rapport-complet.md) comme version canonique.

## Avertissement

Ce contenu relève de l'information scientifique générale et de l'aide à la décision. Il ne remplace pas une évaluation médicale, psychologique ou psychiatrique en cas de trouble mental, douleur chronique, insomnie sévère, idées suicidaires, addiction, traumatisme, violence relationnelle ou isolement majeur.
