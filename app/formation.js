// Pédagogie de la page « Comprendre », sur le modèle de la chrysalide de Papillon (PNP06/Psytest, app/prerequis.js
// et app/exercices.js) : des objectifs par chapitre, l'idée reçue de départ, ce que le chapitre ne change pas,
// un exercice « À vous de jouer » avec l'explication tout de suite, une question « Et vous ? » reliée au questionnaire,
// puis un test final. Tout le fond vient des chapitres docs/01 à docs/08 : ces textes ne font que l'accompagner.
// Rien n'est noté ni enregistré : l'état des exercices ne vit que dans la page.

const escF = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const lettre = (j) => String.fromCharCode(65 + j);

/** Ce que la lecture complète doit permettre (affiché sur la page d'entrée). */
export const OBJECTIF_GENERAL = 'À la fin de Comprendre, vous saurez dire ce qui pèse vraiment sur le bonheur durable, repérer les illusions qui font faire de mauvais choix, et choisir par où commencer, sans chercher à tout changer à la fois.';

/** Les quatre temps de la lecture : un bandeau au premier chapitre de chaque temps. */
export const TEMPS = {
  definir: 'Premier temps · De quoi parle-t-on ?',
  determinants: 'Deuxième temps · Ce qui pèse vraiment',
  philosophies: 'Troisième temps · Ce que d’autres avaient vu',
  systeme: 'Quatrième temps · Passer à l’action',
};

/**
 * Accompagnement de chaque chapitre.
 * objectifs : ce que vous saurez faire ; arrive : l'idée de départ ; rassure : ce que le chapitre ne change pas ;
 * question : « Et vous ? » (dernier écran de l'exercice) ; domaines : parties du questionnaire liées au chapitre.
 */
export const ACCOMP = {
  definir: {
    objectifs: ['Distinguer plaisir, satisfaction de vie, bien-être et sens.', 'Expliquer pourquoi le bonheur se suit avec plusieurs indicateurs, et non avec une seule note.'],
    arrive: '« Être heureux, c’est se sentir bien. » C’est la définition la plus courante, et elle n’en couvre qu’une partie. Ce chapitre montre de quoi le bonheur est fait quand on le mesure sérieusement.',
    rassure: 'Les moments agréables comptent : <b>ils font partie du bien-être</b>. Ils ne suffisent simplement pas à le résumer.',
    question: 'En ce moment, qu’est-ce qui va plutôt bien : votre humeur, votre jugement sur votre vie, ou le sentiment d’avancer ? Les trois peuvent aller dans des directions différentes.',
    domaines: ['sens', 'relations'],
  },
  neuroscience: {
    objectifs: ['Dire ce que fait vraiment la dopamine : vouloir n’est pas aimer.', 'Expliquer pourquoi il n’existe ni centre ni molécule du bonheur.'],
    arrive: '« Le bonheur, c’est la dopamine. » Ou la sérotonine. L’idée d’une molécule à augmenter est séduisante, et elle est fausse. Ce chapitre montre ce que la neuroscience permet de dire, et ce qu’elle ne permet pas encore de dire.',
    rassure: 'Ce que vous faites change bien votre cerveau : <b>sommeil, exercice, apprentissage, thérapie</b> modifient les circuits. Mais lentement, par la répétition, et non par un raccourci chimique.',
    question: 'Quelle stimulation recherchez-vous souvent sans qu’elle vous laisse vraiment satisfait ensuite ?',
    domaines: ['numerique', 'sommeil'],
  },
  determinants: {
    objectifs: ['Classer les grands déterminants : ce qui pèse beaucoup, modérément, peu.', 'Dire jusqu’où l’argent compte, et pourquoi la qualité d’une relation compte plus que son statut.'],
    arrive: '« Avec plus d’argent, un meilleur poste ou quelqu’un dans ma vie, je serais heureux. » Ce chapitre classe les facteurs selon leur poids réel. Les plus importants sont rarement les plus spectaculaires.',
    rassure: 'Vous n’avez pas à tout améliorer en même temps. La personnalité et les circonstances pèsent, mais <b>sommeil, relations et activité physique</b> restent des leviers sur lesquels on a prise.',
    question: 'Parmi les déterminants de « très forte importance », lequel est le plus fragile chez vous en ce moment ?',
    domaines: ['relations', 'sante', 'finances'],
  },
  illusions: {
    objectifs: ['Reconnaître l’adaptation hédonique et le biais de projection dans ses propres choix.', 'Évaluer une décision sur une semaine ordinaire, et non sur son meilleur moment.'],
    arrive: '« Quand j’aurai cette maison, ce poste, cette personne, ce sera bon. » On imagine le futur à partir de ce qu’on ressent aujourd’hui. Ce chapitre décrit les erreurs de prédiction qui font faire de mauvais arbitrages.',
    rassure: 'Ces illusions sont <b>humaines</b> : tout le monde y est sujet. Les repérer ne demande pas de renoncer à ses projets, seulement de les évaluer autrement.',
    question: 'Pensez à une décision que vous envisagez. À quoi ressemblerait une semaine ordinaire, une fois la nouveauté passée ?',
    domaines: ['numerique', 'finances', 'travail'],
  },
  philosophies: {
    objectifs: ['Dire ce que les données actuelles confirment chez Aristote, Épicure, les stoïciens, le bouddhisme ou Frankl.', 'Repérer leurs limites : aucun auteur ne fournit seul un modèle suffisant.'],
    arrive: '« Les anciens avaient déjà tout compris. » Ou à l’inverse : « La philosophie, ce sont des opinions. » Ce chapitre confronte huit traditions aux données actuelles, sans en faire des scientifiques.',
    rassure: 'Une sagesse peut rester utile <b>même quand la science ne la confirme pas entièrement</b>. Le chapitre sépare ce qui est confirmé, ce qui est limité, et ce qu’on peut en faire.',
    question: 'Quelle idée d’un de ces auteurs vous parle le plus ? Et quelle limite le chapitre lui trouve-t-il ?',
    domaines: ['sens', 'autonomie'],
  },
  systeme: {
    objectifs: ['Lire son bien-être comme un tableau de bord : expositions, protections, signaux précoces.', 'Repérer une boucle qui dégrade plusieurs domaines à la fois, et l’endroit où la casser.'],
    arrive: '« Je vais tout changer d’un coup. » Ou : « Tant que rien de grave n’arrive, ça va. » Ce chapitre propose de piloter son bien-être comme on gère des risques : surveiller tôt, corriger le rouge d’abord.',
    rassure: 'Il ne s’agit pas de <b>maximiser chaque indicateur</b>. L’objectif est d’éviter les états rouges qui durent et de protéger ce qui tient déjà.',
    question: 'Quel signal apparaît chez vous quand les choses commencent à se dégrader : irritabilité, retrait, réveils nocturnes, procrastination ?',
    domaines: ['sante', 'travail'],
  },
  'plan-action': {
    objectifs: ['Choisir une à trois actions à fort effet et faible effort, plutôt qu’un programme complet.', 'Savoir quand arrêter ou revoir une action qui coûte plus qu’elle n’apporte.'],
    arrive: '« Cette fois, je m’y mets vraiment : sport tous les jours, méditation, moins d’écrans, nouveau régime. » Ce chapitre explique pourquoi le meilleur plan n’est pas le plus ambitieux, et dans quel ordre avancer.',
    rassure: 'Une action qui ne prend pas <b>n’est pas un échec personnel</b>. Les règles de prudence du chapitre disent justement quand la revoir.',
    question: 'Quelle action du niveau 1 pourriez-vous essayer dès cette semaine, à une dose qui reste facile ?',
    domaines: ['activite', 'sommeil', 'relations'],
  },
  variables: {
    objectifs: ['Nommer les dix variables qui comptent sur plusieurs décennies, et leur ordre.', 'Choisir la variable prioritaire selon son profil, en tenant compte de leurs interactions.'],
    arrive: '« Il faudrait que je règle tout. » Ce dernier chapitre ramène l’ensemble à dix variables, et montre qu’en améliorer une, bien choisie, en fait bouger plusieurs.',
    rassure: 'Le classement est une <b>moyenne</b>. La bonne variable pour vous dépend de votre situation : c’est ce que le questionnaire aide à repérer.',
    question: 'Si vous ne deviez améliorer qu’une variable ce mois-ci, laquelle casserait le plus de boucles négatives chez vous ?',
    domaines: ['relations', 'sommeil', 'autonomie'],
  },
};

// Exercices de fin de chapitre. Chaque situation : [texte, [réponses], index de la réponse la plus juste, explication].
// Comme dans Papillon (2.0.19), la bonne réponse n'est ni la plus longue ni toujours à la même place :
// tests/formation.test.mjs le vérifie.
export const EXERCICES = {
  definir: {
    titre: 'Trois façons d’aller bien',
    intro: 'Trois situations où « être heureux » ne veut pas dire la même chose. Que montre chacune ?',
    sits: [
      ['Inès vient de passer une soirée très drôle avec des amis. Le lendemain, elle se dit pourtant que sa vie ne ressemble pas du tout à ce qu’elle voulait. Que montre cette situation ?', ['Que sa soirée n’était pas vraiment agréable.', 'Que plaisir et satisfaction de vie sont distincts.', 'Qu’elle souffre probablement d’une forme de dépression.'], 1, 'Le plaisir est une expérience immédiate ; la satisfaction de vie est un jugement global sur sa vie. Les deux sont liés mais ne se remplacent pas : on peut avoir l’un sans l’autre.'],
      ['Marc n’a aucun trouble psychique. Mais depuis des mois, il a peu d’énergie, peu d’envies, et se sent loin de ses proches. Que permet de dire le modèle de Keyes ?', ['Il est en bonne santé mentale puisqu’il n’a pas de trouble.', 'Il manque surtout de volonté pour se remotiver.', 'Il peut « languir » sans avoir de trouble.'], 2, 'Keyes distingue la maladie mentale et la santé mentale positive. L’absence de trouble ne garantit pas un bon fonctionnement : faible énergie, faible sens, faible lien. Ce n’est pas un diagnostic, c’est une raison de regarder ce qui manque.'],
      ['Pour suivre son bien-être, Sophie se donne chaque soir une note d’humeur sur 10, et rien d’autre. Qu’est-ce qui lui échappe ?', ['Le sommeil, les relations, l’autonomie, le sens…', 'Rien d’important : l’humeur résume bien le reste.', 'Seulement les jours où elle oublie de noter.'], 0, 'Le bonheur mesuré scientifiquement a plusieurs dimensions. Le chapitre propose de suivre plusieurs indicateurs en parallèle : humeur, mais aussi satisfaction de vie, relations, sommeil, activité, autonomie, compétence, sens et stress matériel.'],
    ],
    fin: 'Plaisir, satisfaction, fonctionnement, sens : <b>des choses différentes</b>, qui peuvent aller dans des directions opposées. C’est pour cela que le questionnaire regarde douze domaines et non une seule note.',
  },
  neuroscience: {
    titre: 'Les raccourcis de Karim',
    intro: 'Karim lit beaucoup de vulgarisation sur le cerveau et en tire des conclusions pour sa vie. Où est l’erreur ?',
    sits: [
      ['Karim se dit : « Je passe des heures sur mon téléphone parce que ça me donne de la dopamine, donc ça me rend heureux. »', ['Juste : la dopamine est bien la molécule du plaisir.', 'Faux : vouloir quelque chose n’est pas l’aimer.', 'Juste, tant qu’il ne dépasse pas deux heures.'], 1, 'La dopamine sert surtout à apprendre, anticiper et vouloir. On peut fortement vouloir une stimulation sans qu’elle augmente la satisfaction : c’est la différence entre « wanting » et « liking ».'],
      ['Il a lu que la théorie « dépression = manque de sérotonine » a été remise en cause. Il en conclut que les antidépresseurs ne peuvent pas marcher.', ['Logique : sans manque à corriger, le traitement est inutile.', 'Il faut au contraire chercher à augmenter sa sérotonine.', 'La théorie simple est fragile, pas forcément le traitement.'], 2, 'La revue de Moncrieff et al. ne soutient pas la formule « dépression = manque de sérotonine ». Cela ne veut pas dire que les traitements sont inactifs : leur mécanisme ne se réduit pas à corriger un déficit simple. Un traitement se discute avec son médecin.'],
      ['Karim veut « reprogrammer son cerveau » en trois jours avec une méthode de méditation intensive.', ['Le cerveau change, mais lentement, par la répétition.', 'Impossible : le cerveau adulte ne change plus.', 'Possible, à condition que la méthode soit assez intensive.'], 0, 'La neuroplasticité est réelle, mais les changements stables demandent répétition, contexte et temps. Les études sur la méditation montrent des changements possibles, avec beaucoup de prudence sur la méthode.'],
    ],
    fin: 'Trois raccourcis : <b>la dopamine comme molécule du bonheur</b>, <b>la sérotonine comme simple manque</b>, <b>le cerveau qu’on reprogramme vite</b>. La neuroscience soutient plutôt une approche par le corps, le stress, les relations et l’environnement.',
  },
  determinants: {
    titre: 'Ce qui aiderait Camille',
    intro: 'Camille cherche ce qui l’aiderait le plus. Pour chaque idée, que dit le classement du chapitre ?',
    sits: [
      ['Camille a 300 contacts sur les réseaux, mais personne à qui parler franchement. Elle se dit bien entourée.', ['Oui : plus de contacts, c’est plus de soutien.', 'Non : quelques liens fiables comptent plus.', 'Oui, à condition qu’elle réponde aux messages.'], 1, 'Le nombre de contacts importe moins que quelques relations fiables, régulières et émotionnellement sûres. La solitude peut se cacher derrière des échanges numériques.'],
      ['Elle gagne correctement sa vie, sans dettes ni inquiétude pour le loyer. Elle pense qu’une forte augmentation changerait tout.', ['Probablement moins qu’elle ne l’imagine.', 'Oui : le bonheur suit toujours le revenu.', 'Non : l’argent ne compte jamais pour le bonheur.'], 0, 'L’argent réduit fortement le malheur tant qu’il réduit l’insécurité. Au-delà, le bien-être peut encore augmenter, mais plus faiblement, et l’argent pèse alors moins que les relations, la santé, le sommeil et un travail soutenable.'],
      ['Elle dort six heures par nuit, mal, depuis des mois, et veut commencer par un exercice de gratitude. Qu’est-ce qui est le mieux soutenu ?', ['La gratitude d’abord : elle est validée par des essais.', 'Peu importe l’ordre, tout se vaut à peu près.', 'Le sommeil : c’est l’un des leviers les plus solides.'], 2, 'Améliorer le sommeil améliore la santé mentale (méta-analyse de 65 essais randomisés). La gratitude a un effet moyen modeste : utile, mais elle ne compense pas une insomnie, une dette ou un conflit qui dure.'],
    ],
    fin: 'Les facteurs les plus lourds sont <b>peu spectaculaires</b> : relations fiables, sommeil, santé, activité physique, autonomie. L’argent compte surtout <b>jusqu’à la sécurité</b>, et la qualité d’un lien compte plus que leur nombre.',
  },
  illusions: {
    titre: 'Les décisions de Hugo',
    intro: 'Hugo prend plusieurs décisions. Quelle illusion est à l’œuvre ?',
    sits: [
      ['Hugo accepte un poste mieux payé, à 1 h 30 de trajet. « Avec ce salaire, je serai plus heureux. »', ['Le biais de projection et l’oubli du coût quotidien.', 'La comparaison sociale avec ses anciens collègues.', 'Aucune : un meilleur salaire rend forcément plus heureux.'], 0, 'L’effet du salaire s’atténue en partie avec le temps ; le trajet, lui, revient chaque jour. Le chapitre conseille de juger un choix par son effet sur les routines quotidiennes, pas par son attrait de départ.'],
      ['Chaque soir, il fait défiler les vacances de ses amis et trouve sa vie terne, alors qu’elle n’a pas changé.', ['L’adaptation hédonique.', 'L’illusion de contrôle.', 'La comparaison sociale.'], 2, 'Se comparer vers le haut transforme une situation correcte en insatisfaction. Contre-mesures : réduire l’exposition, revenir à des repères absolus, privilégier des relations qui ne sont pas une compétition.'],
      ['Un projet échoue malgré ses efforts. Hugo se le reproche : « J’aurais dû tout prévoir. »', ['L’illusion du succès.', 'L’illusion de contrôle.', 'Le biais de projection.'], 1, 'On surestime souvent son influence sur des événements en partie aléatoires. Distinguer ce qu’on contrôle, ce qu’on influence et ce qu’on subit évite de transformer l’incertitude en culpabilité.'],
    ],
    fin: 'Ces illusions ont un point commun : elles font <b>surestimer les changements visibles</b> et <b>sous-estimer ce qui revient chaque jour</b>. La bonne question : « À quoi ressemblera une semaine ordinaire ? »',
  },
  philosophies: {
    titre: 'Qui l’avait vu ?',
    intro: 'Trois intuitions anciennes, confrontées aux données actuelles.',
    sits: [
      ['Épicure conseillait de modérer ses désirs et de cultiver l’amitié. Qu’en disent les données actuelles ?', ['Cela concorde avec l’adaptation et l’amitié.', 'C’est contredit : mieux vaut viser toujours plus haut.', 'On ne sait rien : aucune étude ne porte là-dessus.'], 0, 'Les limites du matérialisme, l’adaptation hédonique et le poids des relations fiables vont dans le sens d’Épicure. Sa limite : éviter la douleur ne suffit pas à produire engagement et sens.'],
      ['Les stoïciens distinguent ce qui dépend de nous et ce qui n’en dépend pas. Quel risque le chapitre signale-t-il ?', ['Aucun : c’est confirmé sans réserve.', 'Que cela pousse à dépendre davantage des autres.', 'Que cela tourne à la suppression des émotions.'], 2, 'Cette distinction est proche de la régulation cognitive et de l’acceptation. Mais un contrôle émotionnel rigide peut devenir évitement ou suppression, et il ne remplace ni le corps, ni le sommeil, ni le lien.'],
      ['Pour Viktor Frankl, le sens aide à traverser la souffrance. Que garder de cette idée ?', ['Le sens ne joue aucun rôle mesurable sur le bien-être.', 'Le sens remplace les soins en cas de dépression.', 'Il soutient l’effort, sans annuler la douleur.'], 2, 'Les données sur le but et le sens soutiennent une protection partielle. Mais le sens n’annule ni la douleur, ni l’isolement, ni la précarité, ni un trouble mental : il ne remplace pas les conditions de base.'],
    ],
    fin: 'Chaque tradition apporte une pièce : <b>activité et relations</b> (Aristote), <b>sobriété des désirs</b> (Épicure), <b>contrôle et influence</b> (stoïciens), <b>attention</b> (bouddhisme), <b>sens</b> (Frankl). Aucune ne suffit seule.',
  },
  systeme: {
    titre: 'La boucle de Nadia',
    intro: 'Nadia traverse une période chargée. Comment la lire avec le modèle du chapitre ?',
    sits: [
      ['Nadia a depuis un an une petite dette qui ne bouge pas. Rien de dramatique, mais elle y pense souvent. Comment la classer ?', ['Négligeable : le montant est faible.', 'Une exposition chronique qui use.', 'Un indicateur retardé de son bonheur.'], 1, 'Risque = exposition × vulnérabilité × durée. Une exposition modérée mais permanente peut maintenir une vigilance élevée, et peser plus qu’un stress intense mais bref.'],
      ['Stress au travail, puis nuits plus courtes, puis irritabilité, puis moins de sport et moins de sorties. Par où commencer ?', ['Là où la boucle est la plus facile à casser.', 'Par sa satisfaction de vie, qui résume tout le reste.', 'Par tout à la fois, pour aller plus vite.'], 0, 'C’est la boucle négative du chapitre : stress, sommeil réduit, irritabilité, moins d’activité, retrait, moins de soutien, plus de stress. Une heure de réveil stable ou une marche peut lancer la boucle inverse.'],
      ['Son humeur est basse et ses nuits sont mauvaises. D’après le tableau des signaux, quel levier est probablement le plus rentable ?', ['Les finances.', 'Le sens.', 'Le sommeil.'], 2, 'Humeur basse et sommeil bas : le levier le plus rentable est probablement le sommeil. Stabiliser le rythme, réduire les excitants, et faire évaluer une insomnie si elle dure.'],
    ],
    fin: 'Trois réflexes : <b>une exposition petite mais chronique compte</b>, <b>casser une boucle vaut mieux que tout changer</b>, et <b>deux signaux ensemble désignent souvent le premier levier</b>.',
  },
  'plan-action': {
    titre: 'Le plan de Paul',
    intro: 'Paul veut changer de vie dès lundi. Que lui conseille le chapitre ?',
    sits: [
      ['Paul prévoit dix nouvelles habitudes dès la première semaine.', ['Bonne idée : plus d’actions, c’est plus d’effets.', 'Mieux vaut attendre d’être vraiment motivé pour commencer.', 'Une à trois actions, à effet large et faible coût.'], 2, 'Le chapitre retient les actions qui agissent sur plusieurs domaines, ont un niveau de preuve suffisant, coûtent peu et tiennent dans la durée. Semaine 1 : heure de réveil, marche, notifications, un contact, noter sommeil et humeur.'],
      ['Pour son sommeil, il hésite entre une heure de réveil fixe et un capteur de sommeil haut de gamme.', ['L’heure de réveil fixe, bien mieux soutenue.', 'Le capteur, qui mesure tout plus précisément.', 'Les deux se valent, c’est une question de goût.'], 0, 'Une heure de réveil régulière fait partie du niveau 1 (preuve A). L’optimisation avancée vient après, une fois les bases stables.'],
      ['Paul s’est mis à courir tous les matins à 6 h. Il dort moins et culpabilise dès qu’il rate une séance.', ['Il doit tenir : la discipline finit par payer.', 'Il faut revoir l’action : elle coûte trop.', 'Il devrait courir le soir en plus du matin.'], 1, 'Règles d’arrêt : une action est à revoir si elle dégrade durablement le sommeil, devient une obligation rigide ou produit plus de culpabilité que de changement observable.'],
    ],
    fin: 'Le meilleur plan <b>réduit vite une ou deux expositions rouges</b>, puis installe des habitudes protectrices <b>à un coût soutenable</b>. Le reste peut attendre.',
  },
  variables: {
    titre: 'Une seule variable',
    intro: 'D’après le tableau « Si une seule variable doit être améliorée », quelle priorité pour chaque personne ?',
    sits: [
      ['Romain rumine beaucoup et se dispute souvent avec ses proches.', ['La régulation émotionnelle.', 'La sécurité financière.', 'La compétence.'], 0, 'Rumination et conflits : la régulation émotionnelle diminue les boucles négatives. Elle conditionne aussi le couple, le travail et la santé mentale.'],
      ['Aïcha est fatiguée, irritable, et manque d’énergie toute la journée.', ['L’autonomie.', 'Le sens.', 'Le sommeil.'], 2, 'Fatigue, irritabilité, faible énergie : le sommeil a un effet transversal rapide. Il agit aussi sur les relations, par la régulation émotionnelle.'],
      ['Vincent a un bon salaire et des amis, mais se sent vide et sans direction.', ['L’activité physique.', 'Le sens et la contribution.', 'L’environnement attentionnel.'], 1, 'Vide subjectif : le sens organise les efforts et les rend supportables. À surveiller : sans récupération, le sens peut aussi servir à justifier le surmenage.'],
    ],
    fin: 'Les dix variables <b>forment un système</b>. Le meilleur choix est celui qui en améliore plusieurs à la fois ou <b>casse une boucle négative</b>. C’est ce que votre plan, à la fin du questionnaire, aide à faire.',
  },
};

// Test final : une question par idée forte, différente des exercices. On peut réessayer ; rien n'est enregistré.
// Chaque question : [texte, [réponses], index de la bonne réponse, explication, chapitre].
export const QUIZ = [
  ['Le bien-être subjectif, au sens de Diener, combine :', ['la satisfaction de vie et les affects, positifs et négatifs.', 'le plaisir, la richesse et la réussite professionnelle.', 'l’humeur du jour et l’absence de tout diagnostic.'], 0, 'Satisfaction de vie, affects positifs fréquents, affects négatifs limités : trois dimensions liées, mais qui ne se remplacent pas.', 'Chapitre 1'],
  ['Selon la théorie de l’autodétermination, quels sont les trois besoins psychologiques fondamentaux ?', ['Plaisir, sécurité, reconnaissance.', 'Autonomie, compétence, relation.', 'Argent, statut, liberté.'], 1, 'Autonomie, compétence et relation sont chacune associées au bien-être, dans de nombreux pays (27 pays et 48 550 personnes dans l’étude européenne citée).', 'Chapitre 1'],
  ['La dopamine est surtout liée au fait de :', ['vouloir et apprendre.', 'être satisfait de sa vie.', 'ressentir un plaisir intense.'], 0, 'La dopamine sert à anticiper, apprendre et vouloir. Le plaisir ressenti passe plutôt par d’autres systèmes, et la satisfaction de vie par bien plus qu’une molécule.', 'Chapitre 2'],
  ['Parmi ces leviers, lequel a l’effet le mieux démontré sur la santé mentale ?', ['Le revenu au-delà de la sécurité.', 'Le nombre d’amis en ligne.', 'Le sommeil.'], 2, 'Une méta-analyse de 65 essais randomisés montre qu’améliorer le sommeil améliore la santé mentale, dont la dépression, l’anxiété et le stress.', 'Chapitre 3'],
  ['Au-delà de la sécurité matérielle, que devient l’effet de l’argent sur le bien-être ?', ['Il disparaît complètement, sans exception.', 'Il reste aussi fort qu’en bas de l’échelle.', 'Il continue parfois, plus faiblement.'], 2, 'Les rendements diminuent sans toujours devenir nuls. L’argent est surtout un excellent réducteur de malheur jusqu’à la sécurité et l’autonomie matérielle.', 'Chapitre 3'],
  ['L’adaptation hédonique, c’est :', ['revenir en partie à son niveau habituel après un changement.', 'pouvoir s’habituer à tout, sans aucune limite ni exception.', 'le fait d’aimer chaque année davantage ce que l’on possède déjà.'], 0, 'L’adaptation est réelle mais ni totale ni uniforme : mariage, chômage, veuvage ou handicap ne suivent pas les mêmes courbes (Luhmann et al.).', 'Chapitre 4'],
  ['Avant une grande décision, quelle question protège le mieux du biais de projection ?', ['« Qu’est-ce que je ressens là, maintenant, en y pensant ? »', '« À quoi ressemblera une semaine ordinaire ? »', '« Qu’en penseront les autres, une fois que ce sera fait ? »'], 1, 'On prédit son futur à partir de son état présent. Imaginer une semaine ordinaire, interroger des personnes déjà dans la situation et faire des essais limités corrigent ce biais.', 'Chapitre 4'],
  ['Qu’est-ce que les données actuelles confirment chez plusieurs philosophes ?', ['Que l’accumulation de plaisirs fait une vie heureuse.', 'Que les relations fiables sont centrales.', 'Que la souffrance rend toujours plus fort.'], 1, 'L’amitié et les relations fiables, la méfiance envers l’escalade du désir et le rôle du sens reviennent chez plusieurs traditions, et les données vont dans leur sens.', 'Chapitre 5'],
  ['Dans le modèle de gestion des risques, un risque dépend :', ['de l’exposition, de la vulnérabilité et de la durée.', 'surtout de la chance.', 'de la gravité du dernier événement vécu, seulement.'], 0, 'Risque = exposition × vulnérabilité × durée. C’est pourquoi une petite exposition chronique peut peser plus qu’un choc bref.', 'Chapitre 6'],
  ['Une nouvelle habitude dégrade votre sommeil et vous fait culpabiliser. Que dit le plan d’action ?', ['Tenir bon : c’est le prix à payer pour changer.', 'La revoir : elle coûte plus qu’elle n’apporte.', 'En ajouter une autre pour compenser.'], 1, 'Une action se révise si elle dégrade durablement le sommeil, devient une obligation rigide ou produit plus de culpabilité que de changement observable.', 'Chapitre 7'],
  ['D’après le classement des dix variables, laquelle est la plus transversale ?', ['Les relations proches fiables.', 'La richesse au-delà de la sécurité.', 'Le statut social.'], 0, 'Les relations proches fiables arrivent en tête : soutien, santé, régulation émotionnelle, appartenance et sens.', 'Chapitre 8'],
  ['À quoi sert le questionnaire de ce site ?', ['À poser un diagnostic sur votre bonheur.', 'À repérer 1 à 3 domaines où agir d’abord.', 'À vous comparer à la moyenne de la population.'], 1, 'C’est une aide à l’orientation, ni un diagnostic ni une échelle validée. Il vous aide à choisir quoi tester pendant 7 jours.', 'Le questionnaire'],
];

/** Objectifs d'un chapitre. */
export const objectifsHTML = (id) => (ACCOMP[id] ? `<div class="pre-obj"><p class="pre-label">Ce que vous saurez faire</p><ul>${ACCOMP[id].objectifs.map((o) => `<li>${escF(o)}</li>`).join('')}</ul></div>` : '');
/** L'idée de départ. */
export const arriveHTML = (id) => (ACCOMP[id] ? `<div class="pre-arrive"><p class="pre-label">Vous arrivez peut-être avec</p><p>${escF(ACCOMP[id].arrive)}</p></div>` : '');
/** Ce que le chapitre ne change pas, et les parties du questionnaire qui en parlent. */
export function afterHTML(id, domains = []) {
  const a = ACCOMP[id];
  if (!a) return '';
  const links = a.domaines.map((d) => domains.find((x) => x.id === d)).filter(Boolean);
  return `<div class="pre-after">
    <div><p class="pre-label">Ce que ça ne change pas</p><p>${a.rassure}</p></div>
    ${links.length ? `<div><p class="pre-label">Dans le questionnaire</p><p>Ce chapitre éclaire ${links.map((d, i) => `${i ? (i === links.length - 1 ? ' et ' : ', ') : ''}la partie <a href="#questionnaire/${domains.indexOf(d) + 1}">${escF(d.title)}</a>`).join('')}.</p></div>` : ''}
  </div>`;
}

/** Bloc « À vous de jouer » d'un chapitre. La question du chapitre (« Et vous ? ») en est le dernier écran. */
export function exerciceHTML(id) {
  const ex = EXERCICES[id];
  if (!ex) return '';
  const question = ACCOMP[id]?.question;
  return `<section class="pre-exo" data-exo="${id}" aria-label="Exercice : ${escF(ex.titre)}">
      <h3 id="ch-${id}-exo" data-sub="À vous de jouer">À vous de jouer</h3>
      <p class="pre-exo-t"><b>${escF(ex.titre)}.</b> ${escF(ex.intro)}</p>
      <ol class="pre-exo-sits">${ex.sits.map((s, i) => `<li class="pre-exo-sit" data-sit="${i}">
        <p class="pre-exo-q"><span class="pre-label">Situation ${i + 1} sur ${ex.sits.length}</span>${escF(s[0])}</p>
        <div class="pre-exo-ans" role="group" aria-label="Réponses de la situation ${i + 1}">${s[1].map((a, j) => `<button type="button" data-ans="${j}" aria-pressed="false"><b>${lettre(j)}</b><span>${escF(a)}</span></button>`).join('')}</div>
        <p class="pre-exo-fb" aria-live="polite" hidden></p>
      </li>`).join('')}</ol>
      <div class="pre-exo-fin" hidden>
        <p><span class="pre-label">Ce qui a changé</span>${ex.fin}</p>
        ${question ? `<p><span class="pre-label">Et vous ?</span>${escF(question)}</p><p class="pre-after-note">Rien à écrire, rien n’est enregistré.</p>` : ''}
      </div>
      <p class="pre-exo-note">Choisissez une réponse : l’explication s’affiche tout de suite. Rien n’est noté ni enregistré.</p>
    </section>`;
}

/** Le test final, une question à la fois. */
export function quizHTML() {
  const n = QUIZ.length;
  return `<section class="pre-quiz" id="ch-quiz" data-quiz aria-labelledby="ch-quiz-t">
    <h2 id="ch-quiz-t" data-sub="Le test final">Le test final : qu’en avez-vous retenu ?</h2>
    <p class="pre-quiz-lead">${n} questions sur les idées fortes des huit chapitres. Si vous vous trompez, l’explication s’affiche et vous pouvez réessayer. <b>Rien n’est noté ni enregistré</b> : c’est pour vous.</p>
    <div class="pre-quiz-box">
      <div class="pre-quiz-top"><p class="pre-quiz-count" aria-live="polite"><b data-quiz-ok>0</b> sur ${n}</p><i class="pre-quiz-bar" aria-hidden="true"><b style="width:0%"></b></i></div>
      <div class="pre-quiz-qs">
        ${QUIZ.map((q, i) => `<div class="pre-quiz-item" data-q="${i}"${i ? ' hidden' : ''}>
          <p class="pre-quiz-q"><span class="pre-label">Question ${i + 1} sur ${n} · ${escF(q[4])}</span>${escF(q[0])}</p>
          <div class="pre-exo-ans" role="group" aria-label="Réponses de la question ${i + 1}">${q[1].map((a, j) => `<button type="button" data-qa="${j}"><b>${lettre(j)}</b><span>${escF(a)}</span></button>`).join('')}</div>
          <p class="pre-exo-fb" aria-live="polite" hidden></p>
          <button type="button" class="btn primary pre-quiz-next" hidden>${i + 1 < n ? 'Question suivante' : 'Voir mon résultat'}</button>
        </div>`).join('')}
        <div class="pre-quiz-end" hidden tabindex="-1">
          <p class="pre-label">Test terminé</p>
          <p><b>Vous avez parcouru l’essentiel du guide.</b> <span data-quiz-score></span></p>
          <p>Vous avez de quoi répondre au questionnaire, et de quoi lire votre plan comme une piste à tester, pas comme un verdict.</p>
          <div class="actions"><a class="btn primary" href="#questionnaire">Passer au questionnaire</a><button type="button" class="btn pre-quiz-again">Recommencer le test</button></div>
        </div>
      </div>
    </div>
  </section>`;
}

/** Branche les exercices et le test final présents dans `root` (rien n'est gardé après la visite). */
export function wireFormation(root = document) {
  root.querySelectorAll('.pre-exo').forEach((box) => {
    const ex = EXERCICES[box.dataset.exo];
    if (!ex || box.dataset.wired) return;
    box.dataset.wired = '1';
    const seen = new Set();
    box.querySelectorAll('.pre-exo-sit').forEach((li) => {
      const i = Number(li.dataset.sit);
      const [, , good, why] = ex.sits[i];
      li.querySelectorAll('button[data-ans]').forEach((b) => b.addEventListener('click', () => {
        const j = Number(b.dataset.ans);
        li.querySelectorAll('button[data-ans]').forEach((x) => {
          const k = Number(x.dataset.ans);
          x.classList.toggle('is-good', k === good);
          x.classList.toggle('is-bad', k === j && j !== good);
          x.setAttribute('aria-pressed', String(k === j));
        });
        const fb = li.querySelector('.pre-exo-fb');
        fb.innerHTML = `<b>${j === good ? 'Oui.' : `Pas tout à fait. La réponse la plus juste est ${lettre(good)}.`}</b> ${escF(why)}`;
        fb.hidden = false;
        seen.add(i);
        if (seen.size === ex.sits.length) box.querySelector('.pre-exo-fin').hidden = false;
      }));
    });
  });
  wireQuiz(root);
}

function wireQuiz(root) {
  const box = root.querySelector('[data-quiz]');
  if (!box || box.dataset.wired) return;
  box.dataset.wired = '1';
  const n = QUIZ.length;
  let ok = 0, first = 0;
  const count = box.querySelector('[data-quiz-ok]');
  const bar = box.querySelector('.pre-quiz-bar b');
  const items = [...box.querySelectorAll('.pre-quiz-item')];
  const end = box.querySelector('.pre-quiz-end');
  const tries = new Map();
  const progress = () => { count.textContent = ok; bar.style.width = `${Math.round((ok / n) * 100)}%`; };
  items.forEach((it) => {
    const i = Number(it.dataset.q);
    const [, , good, why] = QUIZ[i];
    const fb = it.querySelector('.pre-exo-fb');
    const next = it.querySelector('.pre-quiz-next');
    it.querySelectorAll('button[data-qa]').forEach((b) => b.addEventListener('click', () => {
      if (it.dataset.done) return;
      const j = Number(b.dataset.qa);
      tries.set(i, (tries.get(i) || 0) + 1);
      if (j === good) {
        it.dataset.done = '1';
        b.classList.add('is-good');
        it.querySelectorAll('button[data-qa]').forEach((x) => { x.disabled = true; });
        if (tries.get(i) === 1) first += 1;
        ok += 1;
        progress();
        fb.innerHTML = `<b>Oui.</b> ${escF(why)}`;
        next.hidden = false;
        next.focus({ preventScroll: true });
      } else {
        b.classList.add('is-bad');
        b.disabled = true;
        fb.innerHTML = `<b>Pas tout à fait.</b> ${escF(why)} Essayez une autre réponse.`;
      }
      fb.hidden = false;
    }));
    next.addEventListener('click', () => {
      it.hidden = true;
      if (i + 1 < n) { items[i + 1].hidden = false; items[i + 1].querySelector('button[data-qa]')?.focus({ preventScroll: true }); return; }
      box.querySelector('[data-quiz-score]').textContent = `${first} bonne${first > 1 ? 's' : ''} réponse${first > 1 ? 's' : ''} sur ${n} du premier coup.`;
      end.hidden = false;
      end.focus({ preventScroll: true });
    });
  });
  box.querySelector('.pre-quiz-again').addEventListener('click', () => {
    ok = 0; first = 0; tries.clear();
    items.forEach((it, k) => {
      delete it.dataset.done;
      it.hidden = k > 0;
      it.querySelectorAll('button[data-qa]').forEach((x) => { x.disabled = false; x.classList.remove('is-good', 'is-bad'); });
      it.querySelector('.pre-exo-fb').hidden = true;
      it.querySelector('.pre-quiz-next').hidden = true;
    });
    end.hidden = true;
    progress();
    items[0].querySelector('button[data-qa]')?.focus({ preventScroll: true });
  });
  progress();
}
