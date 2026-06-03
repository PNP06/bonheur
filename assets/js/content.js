const GUIDE_DOCS = [
  {
    id: 'definir',
    order: '01',
    group: 'Comprendre',
    title: 'Comprendre le bonheur',
    shortTitle: 'Définir le bonheur',
    description: 'Les distinctions indispensables : plaisir, satisfaction de vie, bien-être subjectif, eudémonie, sens et santé mentale.',
    path: 'docs/01-definir-le-bonheur.md'
  },
  {
    id: 'neuroscience',
    order: '02',
    group: 'Comprendre',
    title: 'Neurosciences et limites',
    shortTitle: 'Neuroscience',
    description: 'Ce que les données cérébrales permettent vraiment de dire, et pourquoi les slogans sur les neurotransmetteurs sont insuffisants.',
    path: 'docs/02-neuroscience.md'
  },
  {
    id: 'determinants',
    order: '03',
    group: 'Leviers majeurs',
    title: 'Déterminants majeurs',
    shortTitle: 'Déterminants',
    description: 'Relations, solitude, santé, sommeil, activité physique, argent, travail, personnalité, sens et usages numériques.',
    path: 'docs/03-determinants-majeurs.md'
  },
  {
    id: 'illusions',
    order: '04',
    group: 'Leviers majeurs',
    title: 'Illusions et biais',
    shortTitle: 'Illusions',
    description: 'Adaptation hédonique, comparaison sociale, FoMO, illusion du succès, illusion romantique et illusion de contrôle.',
    path: 'docs/04-illusions-humaines.md'
  },
  {
    id: 'philosophies',
    order: '05',
    group: 'Perspectives',
    title: 'Philosophies pratiques',
    shortTitle: 'Philosophies',
    description: 'Aristote, Épicure, stoïcisme, bouddhisme, Nietzsche, Schopenhauer et Frankl confrontés aux données modernes.',
    path: 'docs/05-philosophies.md'
  },
  {
    id: 'systeme',
    order: '06',
    group: 'Passer à l’action',
    title: 'Système de pilotage',
    shortTitle: 'Système de pilotage',
    description: 'Une lecture du bonheur comme gestion des risques : facteurs protecteurs, expositions négatives et boucles de rétroaction.',
    path: 'docs/06-systeme-exploitation.md'
  },
  {
    id: 'plan-action',
    order: '07',
    group: 'Passer à l’action',
    title: 'Plan d’action',
    shortTitle: 'Plan d’action',
    description: 'Actions à effet rapide, habitudes structurantes et optimisations avancées, avec délais, preuves et limites.',
    path: 'docs/07-plan-action.md'
  },
  {
    id: 'variables',
    order: '08',
    group: 'Passer à l’action',
    title: 'Variables à suivre',
    shortTitle: '10 variables',
    description: 'Les dix variables partiellement contrôlables qui comptent le plus sur plusieurs décennies.',
    path: 'docs/08-dix-variables.md'
  },
  {
    id: 'references',
    order: '50',
    group: 'Sources',
    title: 'Sources et niveaux de preuve',
    shortTitle: 'Sources',
    description: 'Bibliographie commentée, hiérarchie des preuves et références scientifiques principales.',
    path: 'docs/references-top-50.md'
  }
];

const UTILITY_DOCS = [
  {
    id: 'tableau-de-bord',
    order: 'T',
    title: 'Tableau de bord',
    description: 'Indicateurs hebdomadaires, seuils d’alerte et actions correctives.',
    path: 'docs/tableau-de-bord-risques-bonheur.md',
    route: '#/tableau-de-bord'
  },
  {
    id: 'matrice-actions',
    order: 'M',
    title: 'Matrice d’actions',
    description: 'Actions classées par bénéfice, preuve, difficulté, délai et limites.',
    path: 'docs/matrice-actions.md'
  },
  {
    id: 'rapport-complet',
    order: 'R',
    title: 'Rapport complet',
    description: 'Version consolidée du guide détaillé.',
    path: 'docs/00-rapport-complet.md'
  },
  {
    id: 'infographies',
    order: 'V',
    title: 'Visualisations',
    description: 'Diagrammes et cartes conceptuelles du guide.',
    path: 'docs/infographies-et-visualisations.md'
  }
];

const ALL_DOCS = [
  {
    id: 'synthese-detail',
    title: 'Synthèse détaillée',
    shortTitle: 'Synthèse détaillée',
    description: 'Version longue de la synthèse exécutive.',
    path: 'docs/09-synthese-executive.md'
  },
  ...GUIDE_DOCS,
  ...UTILITY_DOCS
];

const HOME_PRIORITIES = [
  'Relations proches fiables',
  'Sommeil et rythmes circadiens',
  'Santé physique et mentale suivie',
  'Activité physique régulière',
  'Autonomie réelle',
  'Compétence et progression',
  'Sens et contribution',
  'Sécurité financière suffisante',
  'Régulation émotionnelle',
  'Environnement attentionnel peu toxique'
];

const SUMMARY_INSIGHTS = [
  'Le bonheur n’est pas une euphorie permanente : il combine satisfaction de vie, affects, fonctionnement, relations, santé et sens.',
  'Les leviers les plus robustes sont peu spectaculaires : sommeil, relations, activité physique, santé, autonomie, compétence et sécurité matérielle.',
  'L’argent compte fortement quand il réduit la précarité ; au-delà de la sécurité, ses rendements deviennent plus faibles et hétérogènes.',
  'La réussite professionnelle n’aide que si son coût sur le sommeil, la santé, les relations et l’autonomie reste soutenable.',
  'La dopamine n’est pas la molécule du bonheur : la neuroscience soutient surtout des actions concrètes sur le corps, le stress et l’environnement.',
  'Une stratégie rationnelle consiste à corriger les domaines rouges avant d’optimiser les domaines déjà acceptables.'
];

const SUMMARY_ERRORS = [
  'Sacrifier sommeil et santé pour statut ou revenu.',
  'Confondre plaisir immédiat et satisfaction durable.',
  'Remplacer les relations réelles par une présence numérique.',
  'Chercher une solution neurochimique simple.',
  'Croire que mariage, enfants ou succès garantissent le bonheur.',
  'Traiter la solitude, la dette ou l’insomnie comme des détails.'
];

const SUMMARY_ACTIONS = [
  'Stabiliser l’heure de réveil.',
  'Marcher dehors presque tous les jours.',
  'Maintenir activement quelques relations proches.',
  'Faire 150 minutes d’activité physique modérée par semaine.',
  'Réduire les notifications et la comparaison sociale.',
  'Planifier chaque semaine un loisir actif ou social.',
  'Clarifier un budget de sécurité et réduire les dettes coûteuses.',
  'Travailler autonomie et compétence dans le travail.',
  'Avoir une pratique brève de gratitude ou de prosocialité.',
  'Surveiller les signaux précoces : isolement, irritabilité, fatigue, évitement.'
];

const SCALE_LABELS = [
  'très défavorable',
  'fragile',
  'moyen',
  'plutôt favorable',
  'solide'
];

const QUESTIONNAIRE_DOMAINS = [
  {
    id: 'sommeil',
    title: 'Sommeil et rythmes',
    actions: 'Heure de réveil stable, lumière matinale, marche courte, limitation des écrans tardifs, réduction de la caféine tardive, routine de coucher simple.',
    questions: [
      'Sur les 7 derniers jours, combien de nuits ont été suffisamment réparatrices ?',
      'Votre heure de réveil est-elle régulière ?',
      'Vous exposez-vous à la lumière naturelle le matin ou en début de journée ?',
      'Les écrans, notifications, caféine ou ruminations perturbent-ils rarement votre endormissement ?',
      'Votre niveau d’énergie le matin est-il suffisant pour démarrer la journée ?'
    ]
  },
  {
    id: 'relations',
    title: 'Relations proches',
    actions: 'Programmer un contact précis, reprendre un lien fiable, proposer une activité simple, privilégier qualité plutôt que quantité.',
    questions: [
      'Avez-vous au moins 2 à 3 personnes avec qui parler franchement ?',
      'Avez-vous eu au moins 2 contacts significatifs la semaine dernière ?',
      'Une personne fiable sait-elle concrètement ce que vous vivez actuellement ?',
      'Vos relations principales sont-elles globalement soutenantes plutôt que conflictuelles ?',
      'Faites-vous des gestes réguliers de maintien relationnel : message, appel, aide, invitation, écoute ?'
    ]
  },
  {
    id: 'activite',
    title: 'Activité physique et corps',
    actions: 'Marche courte quotidienne, activité choisie plutôt qu’imposée, progression graduelle, association avec lumière ou relation sociale.',
    questions: [
      'Avez-vous marché ou bougé au moins 20 minutes lors de 4 jours sur les 7 derniers jours ?',
      'Atteignez-vous approximativement 150 minutes d’activité physique modérée par semaine ?',
      'Faites-vous au moins 1 à 2 séances de renforcement, mobilité ou activité structurée par semaine ?',
      'Votre activité physique est-elle soutenable et adaptée à votre état physique ?',
      'Votre corps vous donne-t-il un sentiment minimal d’énergie, de mobilité ou de maîtrise ?'
    ]
  },
  {
    id: 'sante',
    title: 'Santé et récupération',
    actions: 'Traiter la cause corporelle ou psychique, réduire les expositions aggravantes, restaurer sommeil et activité douce, demander une aide compétente si le fonctionnement quotidien se détériore.',
    questions: [
      'Les douleurs, maladies ou difficultés persistantes sont-elles prises en charge de manière adéquate ?',
      'Votre niveau de fatigue est-il compatible avec vos obligations quotidiennes ?',
      'Votre stress reste-t-il dans une zone gérable la plupart du temps ?',
      'Vos comportements de compensation restent-ils compatibles avec sommeil, santé et relations ?',
      'Vous accordez-vous assez de récupération après les périodes de charge élevée ?'
    ]
  },
  {
    id: 'autonomie',
    title: 'Autonomie',
    actions: 'Identifier une contrainte modifiable, négocier une marge, supprimer une obligation non nécessaire, reconstruire un espace de décision hebdomadaire.',
    questions: [
      'Avez-vous une marge réelle de décision dans votre quotidien ?',
      'Votre emploi du temps contient-il des choix volontaires et pas seulement des obligations ?',
      'Pouvez-vous refuser certaines demandes sans conséquences disproportionnées ?',
      'Votre environnement professionnel ou familial respecte-t-il suffisamment vos limites ?',
      'Avez-vous au moins un domaine où vous pouvez décider, expérimenter et ajuster librement ?'
    ]
  },
  {
    id: 'competence',
    title: 'Compétence et progression',
    actions: 'Choisir une compétence précise, définir un micro-progrès, demander feedback, travailler en blocs courts, éviter perfectionnisme et objectifs irréalistes.',
    questions: [
      'Avez-vous appris ou amélioré quelque chose de concret cette semaine ?',
      'Avez-vous des objectifs de progression mesurables plutôt que vagues ?',
      'Recevez-vous du feedback utile ?',
      'Vos efforts produisent-ils parfois un sentiment de maîtrise ou de flow ?',
      'Votre exigence de compétence reste-t-elle compatible avec repos, santé et relations ?'
    ]
  },
  {
    id: 'sens',
    title: 'Sens, cohérence et contribution',
    actions: 'Clarifier les valeurs, identifier une contribution concrète, supprimer un engagement incohérent, relier une action quotidienne à une finalité réelle.',
    questions: [
      'Pouvez-vous expliquer pourquoi vos efforts actuels valent quelque chose pour vous ?',
      'Votre semaine contient-elle au moins une activité alignée avec vos valeurs ?',
      'Avez-vous un rôle, une contribution ou une responsabilité qui dépasse le plaisir immédiat ?',
      'Vos objectifs actuels sont-ils cohérents avec la vie que vous voulez construire ?',
      'Votre recherche de sens reste-t-elle compatible avec santé, sommeil et relations ?'
    ]
  },
  {
    id: 'finances',
    title: 'Sécurité financière',
    actions: 'Budget simple, priorisation des dettes coûteuses, épargne de sécurité, réduction des dépenses statutaires, recherche d’aide spécialisée si les contraintes dépassent les marges individuelles.',
    questions: [
      'Connaissez-vous vos charges fixes, dettes et marge mensuelle ?',
      'Votre logement, votre alimentation et vos soins sont-ils suffisamment sécurisés ?',
      'Disposez-vous d’une marge minimale pour imprévus ?',
      'Vos achats servent-ils surtout sécurité, santé, temps, relations ou compétence plutôt que comparaison et statut ?',
      'Votre situation financière vous donne-t-elle une marge de choix acceptable ?'
    ]
  },
  {
    id: 'numerique',
    title: 'Environnement numérique et attentionnel',
    actions: 'Notifications désactivées, plages sans téléphone, audit des comptes suivis, remplacement par contact direct, réduction des contenus de comparaison.',
    questions: [
      'Les notifications sont-elles limitées aux personnes et obligations utiles ?',
      'Votre usage des réseaux sociaux vous connecte-t-il davantage qu’il ne vous compare ?',
      'Avez-vous des plages quotidiennes sans smartphone ?',
      'Votre attention est-elle disponible pour lecture, travail profond, conversation ou repos ?',
      'Les informations consommées débouchent-elles sur des actions possibles plutôt que sur une inquiétude passive ?'
    ]
  },
  {
    id: 'travail',
    title: 'Travail, charge et récupération',
    actions: 'Clarifier les priorités, réduire les tâches à faible valeur, négocier autonomie, planifier récupération, documenter la charge réelle, étudier une transition progressive.',
    questions: [
      'Votre charge de travail est-elle compatible avec sommeil et santé ?',
      'Votre travail vous donne-t-il une marge d’autonomie suffisante ?',
      'Votre travail nourrit-il au moins partiellement compétence, utilité ou reconnaissance réaliste ?',
      'Vos temps de récupération sont-ils planifiés, pas seulement résiduels ?',
      'Si votre travail est difficile, avez-vous une stratégie réaliste de modification, négociation ou transition ?'
    ]
  },
  {
    id: 'couple',
    title: 'Couple, sexualité et intimité',
    optional: true,
    actions: 'Conversation structurée, réduction du conflit, clarification des attentes, aide relationnelle si appropriée, protection de l’autonomie et de la sécurité relationnelle.',
    questions: [
      'La relation est-elle globalement sûre, respectueuse et coopérative ?',
      'Les conflits sont-ils réparés plutôt qu’accumulés ?',
      'La sexualité ou l’intimité est-elle vécue comme une source de connexion plutôt que de pression ?',
      'Le couple protège-t-il sommeil, santé, autonomie et liens sociaux plutôt que de les dégrader ?',
      'Les responsabilités pratiques sont-elles suffisamment équilibrées ?'
    ]
  },
  {
    id: 'environnement',
    title: 'Environnement physique et loisirs',
    actions: 'Simplifier l’environnement, créer une zone de sommeil, rendre la marche facile, programmer un loisir actif, réduire bruit et interruptions.',
    questions: [
      'Votre environnement quotidien favorise-t-il sommeil, concentration et récupération ?',
      'Avez-vous accès à nature, lumière ou espace de marche au moins quelques fois par semaine ?',
      'Vos loisirs sont-ils majoritairement actifs, sociaux, créatifs ou absorbants ?',
      'Votre temps libre vous récupère-t-il réellement ?',
      'Votre environnement domestique réduit-il la friction pour les comportements utiles : dormir, bouger, cuisiner, lire, appeler ?'
    ]
  }
];
