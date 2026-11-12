// Page d'accueil, sur le modèle de l'accueil Psytest : une promesse sur fond sapin avec une scène animée
// (exemple fictif de Camille : tout semble à revoir, le questionnaire donne un relief, le plan garde trois choses),
// le parcours Comprendre → questionnaire → plan, le cadre honnête, puis L'Art d'être heureux.
// Classes .hv-* (home.css, reprises de Psytest) et .bh-* (bonheur.css). Animation lancée par homeAnim().

const HV_EXAMPLE = [
  ['Sommeil', 1.2], ['Relations', 3.6], ['Activité physique', 2.0], ['Santé', 2.8], ['Autonomie', 3.0], ['Compétence', 3.4],
  ['Sens', 3.8], ['Finances', 2.6], ['Numérique', 1.6], ['Travail', 2.2], ['Environnement', 3.2],
];
const HV_PLAN = [
  ['Sommeil', 'Fixer pendant 7 jours une heure de réveil stable, à 30 minutes près.'],
  ['Sommeil', 'Sortir à la lumière naturelle dans l’heure qui suit le réveil, même 10 minutes.'],
  ['Numérique', 'Désactiver les notifications non essentielles pendant 7 jours.'],
  ['Activité physique', 'Marcher 10 à 20 minutes dehors sur 4 jours cette semaine.'],
];
// Les trois priorités du plan : les trois domaines les plus bas (comme le calcule engine.js).
const HV_PRIO = [...HV_EXAMPLE].sort((a, b) => a[1] - b[1]).slice(0, 3).map(([n]) => n);
const hvLvl = (s) => (s <= 1.4 ? 3 : s <= 2.4 ? 2 : s <= 3.4 ? 1 : 0);

/** Vignettes du parcours : avant → après, en barres (même langage visuel que le rapport). */
function bhMini(kind) {
  const vals = [1.2, 3.6, 2.0, 3.0, 1.6, 3.2];
  const bar = (v, i, x0, mode) => {
    const h = mode === 'flat' ? 30 : 8 + v * 13;
    const fill = mode === 'flat' ? 'var(--hv-gray)' : `var(--hv-l${hvLvl(v)})`;
    const op = mode === 'plan' && v > 2.1 ? 0.28 : 1;
    return `<rect x="${x0 + i * 16}" y="${68 - h}" width="10" height="${h}" rx="3" fill="${fill}" opacity="${op}"/>`;
  };
  const group = (mode, x0) => vals.map((v, i) => bar(v, i, x0, mode)).join('');
  const [a, b] = kind === 'comprendre' ? ['flat', 'flat'] : kind === 'test' ? ['flat', 'score'] : ['score', 'plan'];
  const extra = kind === 'comprendre' ? '<path class="hv-mini-arrow" d="M30,18 h40 M30,26 h52 M30,34 h34" opacity=".55"/>' : '';
  return `<svg class="hv-mini" viewBox="0 0 250 80" role="img" aria-hidden="true">${kind === 'comprendre' ? extra : group(a, 8)}<path class="hv-mini-arrow" d="M117,40 h14 m-5,-5 l5,5 l-5,5"/>${group(b, 140)}</svg>`;
}

const HV_STEPS = [
  { tag: 'Étape 1', title: 'Comprendre', kind: 'comprendre', time: '8 chapitres · lecture libre', href: '#comprendre', more: 'Lire Comprendre',
    items: ['Ce que « bonheur » veut dire en science', 'Ce que la neuroscience permet vraiment de dire', 'Les déterminants, classés par niveau de preuve', 'Les illusions qui faussent nos choix', 'Ce que les philosophes avaient compris', 'Un système de pilotage et un plan d’action'] },
  { tag: 'Étape 2', title: 'Le questionnaire', kind: 'test', time: '12 domaines · 60 questions · 10 à 15 min', href: '#questionnaire', more: 'Voir comment se passe le questionnaire',
    items: ['Sommeil, relations, activité, santé', 'Autonomie, compétence, sens', 'Finances, numérique, travail', 'Couple (facultatif) et environnement', 'Une échelle de 0 (défavorable) à 4 (solide)'] },
  { tag: 'À la fin', title: 'Votre plan', kind: 'plan', time: 'à réévaluer dans 2 à 4 semaines', out: true,
    items: ['Vos priorités probables (trois au plus)', 'Les actions à tester cette semaine', 'Ce qui vous protège déjà, à maintenir', 'Vos scores par domaine, à imprimer ou garder'] },
];

function hvScene() {
  return `<figure class="hv-scene bh-scene" aria-label="Exemple fictif : Camille">
    <div class="hv-scene-top">
      <span class="hv-who">Exemple fictif : Camille, 41 ans</span>
      <button class="hv-replay" type="button" id="hv-replay">Rejouer</button>
    </div>
    <div class="hv-acts" id="hv-acts">
      <button type="button" data-act="0">Avant</button>
      <button type="button" data-act="1">Le questionnaire</button>
      <button type="button" data-act="2">Le plan</button>
    </div>
    <div class="bh-board" id="bh-board" data-act="0">
      <ol class="bh-bars" aria-label="Scores fictifs de Camille par domaine">
        ${HV_EXAMPLE.map(([name, s], i) => `<li class="lv-${hvLvl(s)}${HV_PRIO.includes(name) ? ' prio' : ''}" style="--s:${(s / 4).toFixed(3)};--i:${i}"><span class="bh-bar-name">${name}</span><span class="bh-bar"><i></i></span><span class="bh-bar-val">${s.toFixed(1).replace('.', ',')}</span></li>`).join('')}
      </ol>
      <ol class="bh-plan" aria-label="Plan de Camille pour la semaine">
        ${HV_PLAN.map(([d, a], i) => `<li style="--i:${i}"><b>${d}</b>${a}</li>`).join('')}
      </ol>
    </div>
    <figcaption class="hv-caption" id="hv-caption" aria-live="polite"></figcaption>
  </figure>`;
}

/**
 * @param {{started: boolean, notice: string|null, chapters: number}} ctx notice : HTML déjà échappé
 */
export function homeHTML(ctx) {
  return `<div class="hv">
  <section class="hv-hero">
    <div class="hv-hero-text">
      <p class="hv-eyebrow">Bonheur · Guide opérationnel, fondé sur la recherche</p>
      <h1>Le bonheur ne se poursuit pas. <em>Il se construit, domaine par domaine.</em></h1>
      <p class="hv-lead">Ce que la science sait aujourd’hui du bonheur, rendu lisible : les leviers robustes, les illusions qui égarent, ce que disaient les philosophes. Puis un questionnaire qui repère vos priorités et vous laisse avec trois actions à tester cette semaine.</p>
      <div class="hv-ctas">
        <a class="btn anis" href="#comprendre">Commencer par comprendre</a>
        <a class="btn hv-ghost" href="#questionnaire">${ctx.started ? 'Continuer le questionnaire' : 'Faire le questionnaire'}</a>
      </div>
      <p class="hv-small">Gratuit, sans compte. Vos réponses restent sur votre appareil. <button class="hv-linkbtn" id="resume" type="button">Reprendre grâce à mon fichier</button></p>
      ${ctx.notice ? `<div class="note">${ctx.notice}</div>` : ''}
    </div>
    ${hvScene()}
  </section>

  <section class="hv-section" aria-labelledby="hv-path">
    <div class="hv-head">
      <h2 id="hv-path">Un parcours en deux temps</h2>
      <p>Comprendre d’abord, pour savoir ce qui compte vraiment et avec quel niveau de preuve. S’orienter ensuite, pour choisir quoi changer maintenant au lieu de tout vouloir changer.</p>
    </div>
    <div class="hv-steps">
      ${HV_STEPS.map((s, i) => `${i ? '<span class="hv-arrow" aria-hidden="true">→</span>' : ''}<div class="hv-step${s.out ? ' hv-out' : ''}">
        ${bhMini(s.kind)}<span class="hv-num">${s.tag}</span><h3>${s.title}</h3><span class="hv-time">${s.time}</span>
        <ul>${s.items.map((t) => `<li>${t}</li>`).join('')}</ul>
        ${s.href ? `<a class="hv-more" href="${s.href}">${s.more} →</a>` : ''}
      </div>`).join('')}
    </div>
    <p class="hv-pace">Ce n’est pas une note sur votre vie : c’est une façon de choisir. Le questionnaire garde vos réponses dans ce navigateur ; vous pouvez aussi télécharger un fichier pour reprendre ailleurs.</p>
  </section>

  <section class="hv-section bh-art-teaser" aria-labelledby="hv-art">
    <div class="hv-head">
      <h2 id="hv-art">L’Art d’être heureux, en 50 règles</h2>
      <p>Une adaptation pratique et originale de la pensée de Schopenhauer. Partez de ce que vous traversez (une décision, du stress, de la solitude) et lisez les quelques règles qui s’y rapportent.</p>
    </div>
    <div class="home-links">
      <a href="#art/adulte"><b>Édition adulte</b><span>Pour une lecture personnelle et approfondie.</span></a>
      <a href="#art/jeunesse"><b>Édition 10–15 ans</b><span>Pour réfléchir au collège, en famille ou seul.</span></a>
    </div>
  </section>

  <section class="hv-section hv-frame" aria-labelledby="hv-not">
    <div class="hv-head"><h2 id="hv-not">Ce que ce guide n’est pas</h2></div>
    <div class="hv-grid4">
      <div><b>Pas un diagnostic</b>Le questionnaire aide à prioriser des actions. Il ne remplace pas une évaluation médicale ou psychologique.</div>
      <div><b>Pas une recette</b>Les actions sont des essais d’une semaine, à garder ou à ajuster après réévaluation.</div>
      <div><b>Rien n’est envoyé</b>Tout se calcule sur votre appareil. Pas de compte, pas de cookie, pas de serveur.</div>
      <div><b>En cas de détresse</b>Appelez le <a class="tel" href="tel:3114">3114</a>, 24 h/24, gratuitement.</div>
    </div>
    <p class="hv-small-muted">Les niveaux de preuve, le calcul des scores et les sources sont dans <a href="#methode">Méthode et sources</a>.</p>
  </section>

  <section class="hv-section hv-end" aria-labelledby="hv-ready">
    <h2 id="hv-ready">Par où commencer ?</h2>
    <p>Si vous découvrez le sujet, commencez par comprendre. Si vous voulez savoir quoi faire cette semaine, le questionnaire vous attend.</p>
    <div class="hv-ctas hv-ctas-center">
      <a class="btn primary" href="#comprendre">Commencer par comprendre</a>
      <a class="btn" href="#questionnaire">${ctx.started ? 'Continuer le questionnaire' : 'Faire le questionnaire'}</a>
      <button class="btn ghost" id="resume-bottom">Reprendre grâce à mon fichier</button>
    </div>
  </section>
</div>`;
}

// ---------- Animation : l'exemple de Camille ----------
let hvTimers = [];

/** Lance la scène de l'accueil (à appeler après chaque rendu de la page d'accueil). */
export function homeAnim() {
  hvTimers.forEach(clearTimeout); hvTimers = [];
  const board = document.getElementById('bh-board');
  if (!board) return;
  const cap = document.getElementById('hv-caption');
  const chips = [...document.querySelectorAll('#hv-acts button')];
  const CAPS = [
    'Camille se sent « fatiguée de tout ». <strong>Tout semble à revoir en même temps</strong>, et rien ne dit par où commencer.',
    'Le questionnaire passe en revue <strong>douze domaines</strong>. Certains sont solides, d’autres sont dans le rouge : <strong>le relief apparaît</strong>.',
    'Son plan ne garde que <strong>trois priorités et quatre actions</strong> pour la semaine. Ce qui va bien est à maintenir, pas à optimiser.',
  ];
  const show = (a) => {
    board.dataset.act = String(a);
    cap.innerHTML = CAPS[a];
    chips.forEach((c) => { const k = +c.dataset.act; c.classList.toggle('on', k === a); c.classList.toggle('done', k < a); c.setAttribute('aria-pressed', String(k === a)); });
  };
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const play = (from = 0) => {
    hvTimers.forEach(clearTimeout); hvTimers = [];
    show(from);
    if (reduce) return;
    const T = [0, 3500, 9000];
    for (let a = from + 1; a < T.length; a++) hvTimers.push(setTimeout(() => board.isConnected && show(a), T[a] - T[from]));
  };
  document.getElementById('hv-replay').addEventListener('click', () => play(0));
  chips.forEach((c) => c.addEventListener('click', () => play(+c.dataset.act)));
  if (reduce) show(2); else play(0);
}
