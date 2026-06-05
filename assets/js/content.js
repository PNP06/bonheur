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

const CONTENT_USAGE = [
  {
    title: 'Rapport scientifique',
    role: 'Le fond complet',
    description: 'Il nourrit les parties détaillées du guide : définitions, neuroscience, déterminants, illusions, philosophies, système de pilotage et plan d’action.',
    route: '#/guide'
  },
  {
    title: 'Synthèse exécutive',
    role: 'Comprendre vite',
    description: 'Elle transforme le rapport en idées clés, erreurs fréquentes et actions prioritaires lisibles en quelques minutes.',
    route: '#/synthese'
  },
  {
    title: 'Questionnaire opérationnel',
    role: 'S’orienter',
    description: 'Il devient le formulaire interactif qui calcule les domaines prioritaires, les points à maintenir et les premières actions à tester.',
    route: '#/questionnaire'
  },
  {
    title: 'Tableau de bord',
    role: 'Suivre les signaux',
    description: 'Il sert à suivre sommeil, relations, activité, stress, finances et autres indicateurs avec seuils d’alerte.',
    route: '#/tableau-de-bord'
  },
  {
    title: 'Matrice d’actions',
    role: 'Choisir quoi faire',
    description: 'Elle classe les actions par bénéfice attendu, preuve, difficulté, délai d’effet et limites pratiques.',
    route: '#/lire/matrice-actions'
  },
  {
    title: 'Références scientifiques',
    role: 'Vérifier les preuves',
    description: 'Elles documentent les sources, les niveaux de preuve et les limites du rapport.',
    route: '#/sources'
  }
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
    focus: 'Régularité, récupération et conditions qui protègent le sommeil.',
    actions: 'Heure de réveil stable, lumière matinale, marche courte, limitation des écrans tardifs, réduction de la caféine tardive, routine de coucher simple.',
    primaryActions: [
      'Fixer pendant 7 jours une heure de réveil stable, à 30 minutes près.',
      'Sortir à la lumière naturelle dans l’heure qui suit le réveil, même 10 minutes.',
      'Couper les notifications et les écrans les plus stimulants 45 minutes avant le coucher.'
    ],
    maintain: 'Conserver les mêmes repères de réveil, lumière du matin et routine du soir pendant les semaines chargées.',
    questions: [
      'Sur les 7 derniers jours, vos nuits vous ont-elles réellement permis de récupérer ?',
      'Votre heure de réveil est-elle restée stable, même les jours sans contrainte ?',
      'Avez-vous reçu de la lumière naturelle le matin ou en début de journée ?',
      'Votre fin de journée limite-t-elle ce qui retarde l’endormissement : écrans, notifications, caféine, alcool, ruminations ?',
      'Au réveil, avez-vous assez d’énergie pour démarrer sans lutter pendant une heure ?'
    ]
  },
  {
    id: 'relations',
    title: 'Relations proches',
    focus: 'Présence de liens fiables, réguliers et émotionnellement sûrs.',
    actions: 'Programmer un contact précis, reprendre un lien fiable, proposer une activité simple, privilégier qualité plutôt que quantité.',
    primaryActions: [
      'Programmer cette semaine un appel, repas ou marche avec une personne fiable.',
      'Envoyer un message concret à une personne que vous voulez garder proche.',
      'Demander ou proposer une aide simple plutôt que rester dans un échange superficiel.'
    ],
    maintain: 'Préserver la régularité des contacts et éviter de sacrifier les liens fiables lors des périodes de charge.',
    questions: [
      'Avez-vous au moins deux personnes avec qui parler franchement sans devoir jouer un rôle ?',
      'Cette semaine, avez-vous eu au moins deux échanges qui vous ont réellement relié à quelqu’un ?',
      'Une personne fiable sait-elle concrètement ce qui est important ou difficile pour vous en ce moment ?',
      'Vos liens principaux vous soutiennent-ils davantage qu’ils ne vous épuisent ou vous mettent en alerte ?',
      'Faites-vous activement vivre vos relations : message, appel, invitation, écoute, aide donnée ou reçue ?'
    ]
  },
  {
    id: 'activite',
    title: 'Activité physique et corps',
    focus: 'Mouvement soutenable, énergie corporelle et autonomie physique.',
    actions: 'Marche courte quotidienne, activité choisie plutôt qu’imposée, progression graduelle, association avec lumière ou relation sociale.',
    primaryActions: [
      'Marcher 10 à 20 minutes dehors sur 4 jours cette semaine.',
      'Choisir une activité suffisamment facile pour être répétée, pas une séance héroïque.',
      'Ajouter une courte séance de renforcement ou mobilité, adaptée à votre état physique.'
    ],
    maintain: 'Garder une dose minimale de mouvement même quand la motivation baisse : marche courte, mobilité ou trajet actif.',
    questions: [
      'Sur les 7 derniers jours, avez-vous bougé au moins 20 minutes lors de 4 journées ou plus ?',
      'Votre volume d’activité se rapproche-t-il de 150 minutes modérées par semaine ?',
      'Avez-vous fait au moins une séance de renforcement, mobilité ou activité structurée ?',
      'Votre manière de bouger est-elle réaliste, agréable ou au moins soutenable pour votre corps actuel ?',
      'Votre corps vous donne-t-il un minimum d’énergie, de mobilité ou de maîtrise dans la journée ?'
    ]
  },
  {
    id: 'sante',
    title: 'Santé et récupération',
    focus: 'Douleur, fatigue, stress, comportements de compensation et récupération.',
    actions: 'Traiter la cause corporelle ou psychique, réduire les expositions aggravantes, restaurer sommeil et activité douce, demander une aide compétente si le fonctionnement quotidien se détériore.',
    primaryActions: [
      'Identifier le symptôme ou la charge qui coûte le plus d’énergie et prendre un rendez-vous ou une mesure concrète.',
      'Bloquer deux créneaux courts de récupération non négociables cette semaine.',
      'Réduire une compensation qui dégrade sommeil, santé ou relations.'
    ],
    maintain: 'Conserver les soins, pauses et limites qui évitent que la fatigue ou la douleur ne redeviennent centrales.',
    questions: [
      'Les douleurs, symptômes ou difficultés persistantes sont-ils pris au sérieux et suivis de manière adaptée ?',
      'Votre fatigue vous laisse-t-elle assez de marge pour vos obligations ordinaires ?',
      'Votre stress reste-t-il le plus souvent dans une zone gérable, sans débordement durable ?',
      'Vos compensations restent-elles compatibles avec votre sommeil, votre santé et vos relations ?',
      'Après une période chargée, prévoyez-vous une vraie récupération plutôt que de simplement tenir ?'
    ]
  },
  {
    id: 'autonomie',
    title: 'Autonomie',
    focus: 'Marge de décision réelle, limites et choix volontaires.',
    actions: 'Identifier une contrainte modifiable, négocier une marge, supprimer une obligation non nécessaire, reconstruire un espace de décision hebdomadaire.',
    primaryActions: [
      'Choisir une contrainte modifiable et décider d’un petit ajustement concret.',
      'Négocier une marge de décision sur une tâche, un horaire ou une obligation.',
      'Bloquer un créneau hebdomadaire qui dépend vraiment de votre choix.'
    ],
    maintain: 'Protéger les marges de choix déjà acquises et éviter de les remplir automatiquement par de nouvelles obligations.',
    questions: [
      'Dans une semaine ordinaire, avez-vous une vraie marge de décision sur votre temps ou vos priorités ?',
      'Votre agenda contient-il des choix volontaires, pas seulement des réponses aux demandes des autres ?',
      'Pouvez-vous refuser ou renégocier certaines demandes sans coût disproportionné ?',
      'Vos limites sont-elles suffisamment respectées dans votre environnement professionnel, familial ou social ?',
      'Avez-vous au moins un domaine où vous pouvez essayer, ajuster et décider librement ?'
    ]
  },
  {
    id: 'competence',
    title: 'Compétence et progression',
    focus: 'Progrès visible, maîtrise, feedback et objectifs réalistes.',
    actions: 'Choisir une compétence précise, définir un micro-progrès, demander feedback, travailler en blocs courts, éviter perfectionnisme et objectifs irréalistes.',
    primaryActions: [
      'Définir un micro-progrès observable à réaliser dans les 7 prochains jours.',
      'Demander un feedback utile à une personne compétente.',
      'Travailler une compétence en deux blocs courts plutôt qu’attendre une grande session parfaite.'
    ],
    maintain: 'Garder des objectifs mesurables et éviter que l’exigence de progrès ne devienne perfectionnisme.',
    questions: [
      'Cette semaine, avez-vous amélioré quelque chose de concret, même petit ?',
      'Vos objectifs de progression sont-ils assez précis pour savoir si vous avancez ?',
      'Recevez-vous un feedback qui vous aide réellement à progresser ?',
      'Vos efforts vous donnent-ils parfois un sentiment de maîtrise, d’efficacité ou d’absorption ?',
      'Votre recherche de compétence reste-t-elle compatible avec repos, santé et relations ?'
    ]
  },
  {
    id: 'sens',
    title: 'Sens, cohérence et contribution',
    focus: 'Cohérence des efforts, valeurs, contribution et direction.',
    actions: 'Clarifier les valeurs, identifier une contribution concrète, supprimer un engagement incohérent, relier une action quotidienne à une finalité réelle.',
    primaryActions: [
      'Écrire une phrase claire : “Cette semaine vaut la peine si je contribue à…”.',
      'Planifier une action alignée avec une valeur importante, même petite.',
      'Supprimer ou réduire un engagement qui consomme de l’énergie sans cohérence avec vos priorités.'
    ],
    maintain: 'Garder le sens relié à des actions concrètes, sans transformer la contribution en sacrifice chronique.',
    questions: [
      'Pouvez-vous expliquer simplement pourquoi vos efforts actuels valent quelque chose pour vous ?',
      'Votre semaine contient-elle au moins une action alignée avec vos valeurs plutôt qu’avec l’inertie ?',
      'Avez-vous une contribution, un rôle ou une responsabilité qui dépasse le plaisir immédiat ?',
      'Vos objectifs actuels restent-ils cohérents avec la vie que vous voulez construire ?',
      'Votre recherche de sens protège-t-elle aussi votre santé, votre sommeil et vos relations ?'
    ]
  },
  {
    id: 'finances',
    title: 'Sécurité financière',
    focus: 'Sécurité matérielle, marge de choix et réduction du stress financier.',
    actions: 'Budget simple, priorisation des dettes coûteuses, épargne de sécurité, réduction des dépenses statutaires, recherche d’aide spécialisée si les contraintes dépassent les marges individuelles.',
    primaryActions: [
      'Lister charges fixes, dettes, revenus et marge réelle sur une seule page.',
      'Identifier une dépense de comparaison ou de statut à réduire cette semaine.',
      'Définir la prochaine étape sur une dette coûteuse ou une épargne de sécurité.'
    ],
    maintain: 'Conserver la clarté budgétaire et éviter que les achats de compensation ne grignotent la sécurité acquise.',
    questions: [
      'Connaissez-vous clairement vos charges fixes, dettes, revenus et marge mensuelle ?',
      'Votre logement, votre alimentation et vos soins de base sont-ils suffisamment sécurisés ?',
      'Avez-vous une marge minimale pour absorber un imprévu sans panique immédiate ?',
      'Vos dépenses servent-elles surtout sécurité, santé, temps, relations ou compétence plutôt que statut et comparaison ?',
      'Votre situation financière vous donne-t-elle une marge de choix acceptable ?'
    ]
  },
  {
    id: 'numerique',
    title: 'Environnement numérique et attentionnel',
    focus: 'Attention disponible, comparaison sociale, notifications et usages subis.',
    actions: 'Notifications désactivées, plages sans téléphone, audit des comptes suivis, remplacement par contact direct, réduction des contenus de comparaison.',
    primaryActions: [
      'Désactiver les notifications non essentielles pendant 7 jours.',
      'Créer une plage quotidienne sans téléphone, même courte.',
      'Retirer ou masquer trois sources de comparaison sociale inutile.'
    ],
    maintain: 'Maintenir des plages sans interruption et réauditer régulièrement les sources de comparaison.',
    questions: [
      'Vos notifications sont-elles limitées aux personnes et obligations réellement utiles ?',
      'Votre usage des réseaux sociaux vous relie-t-il plus qu’il ne vous compare ?',
      'Avez-vous chaque jour une plage sans téléphone ni interruption choisie ?',
      'Votre attention reste-t-elle disponible pour lire, travailler profondément, discuter ou vous reposer ?',
      'Les informations que vous consommez débouchent-elles sur des actions possibles plutôt que sur une inquiétude passive ?'
    ]
  },
  {
    id: 'travail',
    title: 'Travail, charge et récupération',
    focus: 'Charge soutenable, autonomie, reconnaissance réaliste et récupération.',
    actions: 'Clarifier les priorités, réduire les tâches à faible valeur, négocier autonomie, planifier récupération, documenter la charge réelle, étudier une transition progressive.',
    primaryActions: [
      'Clarifier les trois priorités réelles de la semaine et ce qui peut attendre.',
      'Documenter pendant 5 jours la charge réelle : horaires, interruptions, tâches toxiques.',
      'Négocier une petite marge d’autonomie ou supprimer une tâche à faible valeur.'
    ],
    maintain: 'Préserver les marges d’autonomie, les temps de récupération et les limites qui rendent le travail soutenable.',
    questions: [
      'Votre charge de travail reste-t-elle compatible avec votre sommeil et votre santé ?',
      'Avez-vous une marge d’autonomie suffisante sur vos priorités, méthodes ou horaires ?',
      'Votre travail nourrit-il au moins partiellement compétence, utilité ou reconnaissance réaliste ?',
      'Vos temps de récupération sont-ils planifiés plutôt que laissés aux restes de la semaine ?',
      'Si votre travail vous abîme, avez-vous une stratégie réaliste de modification, négociation ou transition ?'
    ]
  },
  {
    id: 'couple',
    title: 'Couple, sexualité et intimité',
    optional: true,
    focus: 'Sécurité relationnelle, coopération, intimité et équilibre des responsabilités.',
    actions: 'Conversation structurée, réduction du conflit, clarification des attentes, aide relationnelle si appropriée, protection de l’autonomie et de la sécurité relationnelle.',
    primaryActions: [
      'Prévoir une conversation courte et structurée sur un sujet précis, sans régler toute la relation.',
      'Nommer une attente concrète et une demande réalisable.',
      'Protéger une limite liée au sommeil, à la santé, à l’autonomie ou à la sécurité relationnelle.'
    ],
    maintain: 'Préserver les rituels de coopération, de réparation après conflit et de respect des limites.',
    questions: [
      'La relation est-elle globalement sûre, respectueuse et coopérative ?',
      'Après un conflit, arrivez-vous à réparer plutôt qu’à accumuler rancœur ou évitement ?',
      'L’intimité ou la sexualité est-elle plutôt une source de connexion qu’une pression ?',
      'La relation protège-t-elle sommeil, santé, autonomie et liens sociaux plutôt qu’elle ne les dégrade ?',
      'Les responsabilités pratiques sont-elles suffisamment visibles, discutées et équilibrées ?'
    ]
  },
  {
    id: 'environnement',
    title: 'Environnement physique et loisirs',
    focus: 'Friction quotidienne, lumière, espace, loisirs actifs et récupération réelle.',
    actions: 'Simplifier l’environnement, créer une zone de sommeil, rendre la marche facile, programmer un loisir actif, réduire bruit et interruptions.',
    primaryActions: [
      'Modifier un détail de l’environnement pour rendre sommeil, marche ou lecture plus facile.',
      'Programmer un loisir actif, social, créatif ou absorbant cette semaine.',
      'Réduire une source de bruit, désordre ou interruption qui fatigue inutilement.'
    ],
    maintain: 'Conserver les aménagements qui rendent les bons comportements faciles sans demander de motivation.',
    questions: [
      'Votre environnement quotidien facilite-t-il sommeil, concentration et récupération ?',
      'Avez-vous accès à la lumière, à la nature ou à un espace de marche plusieurs fois par semaine ?',
      'Vos loisirs sont-ils assez souvent actifs, sociaux, créatifs ou absorbants ?',
      'Votre temps libre vous récupère-t-il réellement plutôt que vous anesthésier ?',
      'Votre logement ou votre organisation réduit-il la friction pour dormir, bouger, cuisiner, lire ou appeler quelqu’un ?'
    ]
  }
];
