// Contenus éditoriaux du site (hors questionnaire, qui est dans data/questionnaire.json).
// Le fond du guide reste dans docs/*.md : scripts/bundle.py l'intègre dans la page, rien n'est réécrit ici.

/** Chapitres de la page Comprendre, dans l'ordre de lecture (docs/01 à docs/08). */
export const CHAPTERS = [
  { id: 'definir', doc: 'docs/01-definir-le-bonheur.md', short: 'Définir le bonheur', group: 'Comprendre' },
  { id: 'neuroscience', doc: 'docs/02-neuroscience.md', short: 'Neurosciences', group: 'Comprendre' },
  { id: 'determinants', doc: 'docs/03-determinants-majeurs.md', short: 'Déterminants', group: 'Leviers majeurs' },
  { id: 'illusions', doc: 'docs/04-illusions-humaines.md', short: 'Illusions et biais', group: 'Leviers majeurs' },
  { id: 'philosophies', doc: 'docs/05-philosophies.md', short: 'Philosophies', group: 'Perspectives' },
  { id: 'systeme', doc: 'docs/06-systeme-exploitation.md', short: 'Système de pilotage', group: 'Passer à l’action' },
  { id: 'plan-action', doc: 'docs/07-plan-action.md', short: 'Plan d’action', group: 'Passer à l’action' },
  { id: 'variables', doc: 'docs/08-dix-variables.md', short: 'Les 10 variables', group: 'Passer à l’action' },
];

/** Documents complémentaires, lus un par un sur la page « Lire » (#lire/<id>). */
export const ANNEXES = [
  { id: 'synthese-detail', doc: 'docs/09-synthese-executive.md', title: 'Synthèse exécutive', kicker: 'Comprendre vite', description: 'Synthèse en deux pages, 20 enseignements, 10 erreurs et 10 actions rentables.' },
  { id: 'tableau-de-bord', doc: 'docs/tableau-de-bord-risques-bonheur.md', title: 'Tableau de bord', kicker: 'Suivre', description: 'Indicateurs hebdomadaires, seuils d’alerte et actions correctives.' },
  { id: 'matrice-actions', doc: 'docs/matrice-actions.md', title: 'Matrice d’actions', kicker: 'Choisir', description: 'Actions classées par bénéfice, preuve, difficulté, délai et limites.' },
  { id: 'infographies', doc: 'docs/infographies-et-visualisations.md', title: 'Visualisations', kicker: 'Voir', description: 'Diagrammes et cartes conceptuelles du guide.' },
  { id: 'questionnaire-texte', doc: 'docs/questionnaire-operationnel.md', title: 'Questionnaire, version texte', kicker: 'S’orienter', description: 'Le questionnaire pratique et sa logique, au format document.' },
  { id: 'references', doc: 'docs/references-top-50.md', title: 'Sources et niveaux de preuve', kicker: 'Vérifier', description: 'Bibliographie commentée, top 50 des références et classement des preuves.' },
  { id: 'rapport-complet', doc: 'docs/00-rapport-complet.md', title: 'Rapport complet', kicker: 'Tout lire', description: 'Version consolidée du rapport en un seul document.' },
  { id: 'index-du-guide', doc: 'docs/00-index-du-guide.md', title: 'Sommaire et mode d’emploi', kicker: 'S’y retrouver', description: 'Sommaire général, méthode et chemin de lecture.' },
];

/** L'essentiel en six idées (haut de la page Comprendre) : chaque idée mène à son chapitre. */
export const ESSENTIEL = [
  ['definir', 'Le bonheur n’est pas une <b>euphorie permanente</b> : il combine satisfaction de vie, affects, fonctionnement, relations, santé et sens.'],
  ['determinants', 'Les leviers les plus robustes sont <b>peu spectaculaires</b> : sommeil, relations, activité physique, santé, autonomie, compétence et sécurité matérielle.'],
  ['determinants', 'L’argent compte fortement quand il <b>réduit la précarité</b> ; au-delà de la sécurité, ses rendements deviennent plus faibles et hétérogènes.'],
  ['illusions', 'La réussite professionnelle n’aide que si son <b>coût sur le sommeil, la santé, les relations et l’autonomie</b> reste soutenable.'],
  ['neuroscience', 'La dopamine <b>n’est pas la molécule du bonheur</b> : la neuroscience soutient surtout des actions concrètes sur le corps, le stress et l’environnement.'],
  ['systeme', 'Une stratégie rationnelle consiste à <b>corriger les domaines rouges</b> avant d’optimiser les domaines déjà acceptables.'],
];

export const HOME_PRIORITIES = [
  'Relations proches fiables',
  'Sommeil et rythmes circadiens',
  'Santé physique et mentale suivie',
  'Activité physique régulière',
  'Autonomie réelle',
  'Compétence et progression',
  'Sens et contribution',
  'Sécurité financière suffisante',
  'Régulation émotionnelle',
  'Environnement attentionnel peu toxique',
];

export const SUMMARY_ERRORS = [
  'Sacrifier sommeil et santé pour statut ou revenu.',
  'Confondre plaisir immédiat et satisfaction durable.',
  'Remplacer les relations réelles par une présence numérique.',
  'Chercher une solution neurochimique simple.',
  'Croire que mariage, enfants ou succès garantissent le bonheur.',
  'Traiter la solitude, la dette ou l’insomnie comme des détails.',
];

export const SUMMARY_ACTIONS = [
  'Stabiliser l’heure de réveil.',
  'Marcher dehors presque tous les jours.',
  'Maintenir activement quelques relations proches.',
  'Faire 150 minutes d’activité physique modérée par semaine.',
  'Réduire les notifications et la comparaison sociale.',
  'Planifier chaque semaine un loisir actif ou social.',
  'Clarifier un budget de sécurité et réduire les dettes coûteuses.',
  'Travailler autonomie et compétence dans le travail.',
  'Avoir une pratique brève de gratitude ou de prosocialité.',
  'Surveiller les signaux précoces : isolement, irritabilité, fatigue, évitement.',
];

/** Niveaux de preuve utilisés dans tout le guide. */
export const EVIDENCE = [
  ['A', 'Méta-analyses d’essais randomisés, revues systématiques solides, forte convergence.'],
  ['B', 'Méta-analyses observationnelles, cohortes longitudinales, mécanismes plausibles.'],
  ['C', 'Associations robustes mais causalité incertaine ou forte dépendance au contexte.'],
  ['D', 'Hypothèses mécanistiques, données préliminaires ou interprétations spéculatives.'],
];
