// Interface du site Bonheur, organisée comme Psytest : pages de lecture (accueil, Comprendre, Le questionnaire,
// L'Art d'être heureux, Méthode et sources, documents complémentaires), questionnaire par parties et rapport.
// Rien n'est envoyé : les réponses restent dans ce navigateur (localStorage) ou dans un fichier de reprise.
import { emptyState, normalizeState, summaries, progress, domainScore, classify } from './engine.js';
import { serialize, parse } from './resume.js';
import { reportHTML, REPORT_SECTIONS } from './report.js';
import { methodeHTML } from './methode.js';
import { homeHTML, homeAnim } from './home.js';
import { comprendreHTML, comprendreSpy, resetComprendreSpy } from './comprendre.js';
import { presentationHTML } from './presentation.js';
import { artHTML, artBind } from './art.js';
import { CHAPTERS, ANNEXES } from './content.js';
import { escapeHtml, renderMarkdown, splitTitle } from './markdown.js';
import { textSummary } from './engine.js';

const $ = (sel, root = document) => root.querySelector(sel);
const esc = escapeHtml;
const STORAGE_KEY = 'bonheur-questionnaire-v3'; // même clé que l'ancien site : les réponses déjà saisies sont conservées

let cfg, DOCS = {}, ART = null;
const state = { view: 'home', screen: 0, sub: [], q: null, notice: null, meta: { date: new Date().toLocaleDateString('fr-FR'), who: '' } };

function readJSON(id) {
  const el = document.getElementById(id);
  return el ? JSON.parse(el.textContent) : null;
}

// ---------- Réponses : gardées dans ce navigateur ----------
function loadAnswers() {
  try { const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)); return raw ? normalizeState(cfg, raw) : emptyState(cfg); } catch { return emptyState(cfg); }
}
function saveAnswers() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.q)); } catch { /* stockage indisponible : le fichier de reprise reste possible */ }
}
const started = () => progress(cfg, state.q).answered > 0;

// ---------- Icônes (style Lucide, comme Psytest et ddlab.fr) ----------
const ICONS = {
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  pause: '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  left: '<path d="M15 6l-6 6 6 6"/>',
  right: '<path d="M9 6l6 6-6 6"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 16V5M7 9l5-5 5 5M5 20h14"/>',
  print: '<path d="M7 9V4h10v5M7 17H5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2"/><rect x="7" y="14" width="10" height="6" rx="1"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  compass: '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/>',
  trending: '<path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  phone: '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
  briefcase: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
};
const icon = (name) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
// Pictogramme et teinte de chaque domaine (teintes DD Lab : sapin, orange, anis, crème)
const DOMAIN_LOOK = {
  sommeil: ['moon', 'sapin'], relations: ['users', 'orange'], activite: ['zap', 'anis'], sante: ['heart', 'creme'],
  autonomie: ['compass', 'sapin'], competence: ['trending', 'orange'], sens: ['target', 'anis'], finances: ['wallet', 'creme'],
  numerique: ['phone', 'sapin'], travail: ['briefcase', 'orange'], couple: ['link', 'anis'], environnement: ['sun', 'creme'],
};
const look = (d) => DOMAIN_LOOK[d.id] || ['target', 'sapin'];

// ---------- Pages et adresses ----------
// Pages de lecture du menu : [vue, ancre, libellé long, libellé court]
const PAGES = [
  ['home', '#', 'Accueil', 'Accueil'],
  ['comprendre', '#comprendre', 'Comprendre', 'Comprendre'],
  ['questionnaire', '#questionnaire', 'Le questionnaire', 'Questionnaire'],
  ['art', '#art/adulte', 'L’Art d’être heureux', 'L’Art'],
  ['methode', '#methode', 'Méthode et sources', 'Méthode'],
];
const navOf = (view) => (view === 'lire' ? 'methode' : view);

const chapterOfDoc = new Map(CHAPTERS.map((c) => [c.doc, c.id]));
const annexOfDoc = new Map(ANNEXES.map((a) => [a.doc, a.id]));
/** Adresse du site pour un document du dépôt (liens entre documents Markdown). */
function resolveDoc(path) {
  if (chapterOfDoc.has(path)) return `#comprendre/${chapterOfDoc.get(path)}`;
  if (annexOfDoc.has(path)) return `#lire/${annexOfDoc.get(path)}`;
  return null;
}

/** Anciennes adresses (#/synthese, #/lire/…, #/art-heureux/…) vers les nouvelles. */
function legacy(hash) {
  const m = hash.match(/^#\/(.*)$/);
  if (!m) return null;
  const [page, id = '', ...rest] = decodeURIComponent(m[1]).split('/').filter(Boolean);
  if (!page || page === 'accueil') return '#';
  if (page === 'synthese' || page === 'guide') return '#comprendre';
  if (page === 'questionnaire') return '#questionnaire';
  if (page === 'tableau-de-bord') return '#lire/tableau-de-bord';
  if (page === 'sources') return '#lire/references';
  if (page === 'art-heureux') return `#art/${[id || 'adulte', ...rest].join('/')}`;
  if (page === 'lire') {
    if (CHAPTERS.some((c) => c.id === id)) return `#comprendre/${id}`;
    if (id === 'synthese-detail' || ANNEXES.some((a) => a.id === id)) return `#lire/${id}`;
    return '#comprendre';
  }
  return '#';
}

function route() {
  const old = legacy(location.hash);
  if (old !== null) history.replaceState(null, '', old === '#' ? location.pathname : old);
  const [page = '', ...sub] = decodeURIComponent(location.hash.replace(/^#/, '')).split('/').filter(Boolean);
  state.sub = sub;
  if (page === 'comprendre') state.view = 'comprendre';
  else if (page === 'questionnaire' && sub[0] && /^\d+$/.test(sub[0])) { state.view = 'screen'; state.screen = Math.min(Math.max(+sub[0] - 1, 0), cfg.domains.length - 1); }
  else if (page === 'questionnaire') state.view = 'questionnaire';
  else if (page === 'plan') state.view = 'end';
  else if (page === 'art' && ART) state.view = 'art';
  else if (page === 'methode') state.view = 'methode';
  else if (page === 'lire' && ANNEXES.some((a) => a.id === sub[0])) state.view = 'lire';
  else state.view = 'home';
}

/** Change de page par l'adresse (le bouton Retour du navigateur fonctionne). */
const goHash = (h) => { if (location.hash === h) { route(); render(); window.scrollTo(0, 0); } else location.hash = h; };
const goScreen = (i) => goHash(`#questionnaire/${i + 1}`);

// ---------- En-tête et pied de page ----------
function progressBar() {
  const segs = summaries(cfg, state.q).map((d) => {
    const p = d.skipped ? 100 : Math.round((100 * d.answered) / d.total);
    return `<i style="--w:${d.total};--p:${p}%" class="${state.view === 'screen' && d.index === state.screen ? 'current' : ''}"></i>`;
  }).join('');
  const pr = progress(cfg, state.q);
  const pct = Math.round((100 * pr.done) / pr.total);
  return `<div class="progress" role="progressbar" aria-label="Progression du questionnaire" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-valuetext="${pr.done} réponses sur ${pr.total}">${segs}</div>`;
}

function siteNav() {
  const cur = navOf(state.view);
  return `<nav class="site-nav" aria-label="Pages du site">${PAGES.map(([v, hash, long, short]) =>
    `<a href="${hash}"${cur === v ? ' aria-current="page"' : ''}>${long !== short ? `<span class="lbl-long">${long}</span><span class="lbl-short">${short}</span>` : long}</a>`).join('')}</nav>`;
}

function header(title, sub = '') {
  const reading = !['screen', 'end'].includes(state.view);
  return `<header class="top"><div class="top-row">
      <a class="brand" href="https://ddlab.fr" aria-label="DD Lab, accueil"><i>DD</i><span>Bonheur</span></a>
      ${reading ? siteNav() : `<div class="top-title"><b>${esc(title)}</b>${sub ? `<span>${sub}</span>` : ''}</div>`}
      ${state.view === 'screen' ? `<button class="btn small" id="pause">${icon('pause')}<span>Pause<span class="lbl-long"> et sauvegarde</span></span></button>` : ''}
      ${state.view === 'end' ? `<a class="btn small" href="#">${icon('left')}<span>Accueil</span></a>` : ''}
    </div>
    ${state.view === 'screen' ? progressBar() : '<div class="top-pad"></div>'}
  </header>`;
}

function siteFooter() {
  return `<footer class="site"><span>Information générale, pas diagnostic. Un projet DD Lab.</span><span><a href="#comprendre">Comprendre</a> · <a href="#questionnaire">Le questionnaire</a> · <a href="#art/adulte">L’Art d’être heureux</a> · <a href="#methode">Méthode et sources</a> · Version du questionnaire ${esc(cfg.version)}</span></footer>`;
}

const startLabel = () => (started() ? 'Continuer le questionnaire' : 'Commencer le questionnaire');
/** Première partie à faire : la première incomplète (ou la première). */
const firstOpen = () => Math.max(summaries(cfg, state.q).findIndex((d) => !d.complete && !d.skipped), 0);

// ---------- Vues de lecture ----------
function homeView() {
  return `${header('Bonheur')}${homeHTML({ started: started(), notice: state.notice })}${siteFooter()}`;
}
function comprendreView() {
  return `${header('Comprendre')}${comprendreHTML(DOCS, resolveDoc)}
  <div class="actions" style="margin-top:8px"><a class="btn primary" href="#questionnaire/${firstOpen() + 1}">${startLabel()}</a><a class="btn" href="#questionnaire">Découvrir le questionnaire</a></div>
  ${siteFooter()}`;
}
function questionnaireView() {
  return `${header('Le questionnaire')}${presentationHTML(cfg, { started: started() })}
  ${state.notice ? `<div class="note">${state.notice}</div>` : ''}
  <div class="actions home-cta" style="margin-top:8px"><a class="btn primary" href="#questionnaire/${firstOpen() + 1}">${startLabel()}</a>${started() ? '<a class="btn" href="#plan">Voir mon plan</a>' : ''}<button class="btn" id="resume">Reprendre grâce à mon fichier</button></div>
  ${siteFooter()}`;
}
function methodeView() {
  return `${header('Méthode et sources')}${methodeHTML(cfg)}${siteFooter()}`;
}
function artView() {
  return `${header('L’Art d’être heureux')}${artHTML(ART, state.sub)}${siteFooter()}`;
}

/** Documents complémentaires : un document par page, sommaire à gauche, sous-parties à droite. */
function lireView() {
  const a = ANNEXES.find((x) => x.id === state.sub[0]);
  const { title, body } = splitTitle(DOCS[a.doc] || '');
  const html = renderMarkdown(body, { prefix: 'doc-', resolveDoc }, { shift: 0, subLevel: 2 });
  const fil = (id) => `<ol class="fil" id="${id}">${ANNEXES.map((x) => `<li class="${x.id === a.id ? 'here' : ''}"><a href="#lire/${x.id}"><span class="num"></span><span>${esc(x.title)}</span></a></li>`).join('')}</ol>`;
  return `${header(a.title)}
  <div class="layout pre-layout">
    <aside class="rail rail-left" aria-label="Documents complémentaires"><p class="rail-title">Documents</p>${fil('doc-fil')}</aside>
    <article class="pre bh-guide">
      <header class="pre-head">
        <p class="eyebrow">${esc(a.kicker)}</p>
        <h1>${esc(title || a.title)}</h1>
        <p class="pre-central">${esc(a.description)}</p>
      </header>
      <details class="runhead only-narrow" id="doc-runhead"><summary><span class="rh-k">Documents</span><span class="rh-s">${esc(a.title)}</span></summary>${fil('doc-fil-2')}</details>
      <section class="pre-sec" id="doc"><div class="prose">${html}</div></section>
      <div class="actions" style="margin-top:24px"><a class="btn" href="#methode">${icon('left')}Méthode et sources</a><a class="btn primary" href="#questionnaire">Le questionnaire</a></div>
    </article>
    <aside class="rail rail-right" aria-label="Dans ce document"><p class="rail-title">Dans ce document</p><ol class="fil" id="doc-sub">${
      [...html.matchAll(/<h2 id="([^"]+)" data-sub="([^"]*)"/g)].map(([, id, t]) => `<li data-for="${id}"><a href="#${id}" data-anchor="${id}"><span></span><span>${t}</span></a></li>`).join('')}</ol></aside>
  </div>
  ${siteFooter()}`;
}

// ---------- Questionnaire ----------
function questionHTML(d, i) {
  const v = state.q.answers[d.id]?.[i];
  const name = `q-${d.id}-${i}`;
  const gauge = (code) => `<span class="gauge g5" aria-hidden="true">${[0, 1, 2, 3, 4].map((k) => `<i class="${k <= code ? 'on' : ''}"></i>`).join('')}</span>`;
  const choices = cfg.scale.map((s) => `<label class="choice"><input type="radio" name="${name}" id="${name}-${s.code}" value="${s.code}" data-d="${d.id}" data-i="${i}" ${v === s.code ? 'checked' : ''}><span class="opt"><b class="opt-n">${s.code}</b> ${esc(s.label)}${gauge(s.code)}</span></label>`).join('');
  return `<li class="q ${Number.isInteger(v) ? 'answered' : 'unanswered'}" id="item-${d.id}-${i}">
    <div class="q-head"><span class="q-num" aria-hidden="true">${i + 1}</span><div class="q-body">
      <p class="q-text" id="${name}-label"><span class="sr-only">Question ${i + 1} : </span>${esc(d.questions[i])}</p>
    </div></div>
    <fieldset class="choices c5" role="radiogroup" aria-labelledby="${name}-label">${choices}</fieldset>
  </li>`;
}

function navStatus(st) {
  if (st.skipped) return `<span class="done">${icon('check')} Domaine ignoré</span>`;
  const left = st.total - st.answered;
  return left
    ? `<span>${left} question${left > 1 ? 's' : ''} sans réponse dans cette partie</span><button class="btn link" id="first-missing">Aller à la première</button>`
    : `<span class="done">${icon('check')} Partie complète · ${st.score.toFixed(1).replace('.', ',')}/4, ${classify(cfg, st.score).label}</span>`;
}

function partsFil() {
  return `<ol class="fil">${summaries(cfg, state.q).map((d) => {
    const p = d.skipped ? 100 : Math.round((100 * d.answered) / d.total);
    const full = d.complete || d.skipped;
    const cls = [d.index === state.screen ? 'here' : full ? 'past' : '', full ? 'complete' : ''].join(' ');
    return `<li class="${cls}"><button data-go="${d.index}" style="--p:${p}%" ${d.index === state.screen ? 'aria-current="step"' : ''}><span class="num">${d.index + 1}</span><span>${esc(d.title)}</span><span class="cnt">${d.skipped ? '—' : `${d.answered}/${d.total}`}</span></button></li>`;
  }).join('')}</ol>`;
}
function questionsFil(d) {
  return `<ol class="fil qfil">${d.questions.map((_, i) => `<li data-q="${i}" class="${Number.isInteger(state.q.answers[d.id]?.[i]) ? 'past' : ''}"><a href="#item-${d.id}-${i}" data-anchor="item-${d.id}-${i}" aria-label="Question ${i + 1}">${i + 1}</a></li>`).join('')}</ol>`;
}

function screenView() {
  const d = cfg.domains[state.screen];
  const st = domainScore(state.q, d);
  const pr = progress(cfg, state.q);
  const last = state.screen === cfg.domains.length - 1;
  const [ic, tint] = look(d);
  const n = cfg.domains.length;
  return `${header(d.title, `Partie ${state.screen + 1}/${n} · <span id="top-count">${pr.done}</span>/${pr.total}<span class="lbl-long"> réponses</span>`)}
  <div class="layout">
    <aside class="rail rail-left" aria-label="Domaines du questionnaire"><p class="rail-title">Les ${n} domaines</p><div id="parts-fil">${partsFil()}</div></aside>
    <div class="content">
      <section class="screen-head">
        <span class="ti t-${tint}">${icon(ic)}</span>
        <div><p class="k">Partie ${state.screen + 1} sur ${n}${d.optional ? ' · facultative' : ''}</p><h2>${esc(d.title)}</h2></div>
        <span class="n" id="block-count">${st.skipped ? '—' : `${st.answered}<small>/${st.total}</small>`}</span>
      </section>
      <p class="period">${icon('clock')}<span>${esc(d.focus)} ${esc(cfg.period)}</span></p>
      ${state.notice ? `<div class="note warn">${state.notice}</div>` : ''}
      ${d.optional ? `<label class="nsp bh-skip"><input type="checkbox" id="skip" ${state.q.skipped[d.id] ? 'checked' : ''}><span>Ce domaine ne me concerne pas en ce moment : l’ignorer dans le plan</span></label>` : ''}
      ${state.q.skipped[d.id] ? '<div class="note"><p>Domaine ignoré : il n’entre pas dans le calcul. Décochez la case pour y répondre.</p></div>' : `<ol class="qlist">${d.questions.map((_, i) => questionHTML(d, i)).join('')}</ol>`}
      <div class="bh-help">
        <div><b>Si ce domaine ressort bas</b><p>${esc(d.primaryActions?.[0] || d.actions)}</p></div>
        <div><b>Si ce domaine est solide</b><p>${esc(d.maintain)}</p></div>
      </div>
      <nav class="nav" aria-label="Navigation entre les parties">
        <div class="nav-status" id="left" aria-live="polite">${navStatus(st)}</div>
        <div class="nav-buttons">
          <button class="btn" id="prev">${icon('left')}${state.screen === 0 ? 'Présentation' : 'Précédente'}</button>
          <button class="btn primary" id="next">${last ? 'Voir mon plan' : 'Partie suivante'}${icon('right')}</button>
        </div>
      </nav>
      <details class="parts only-narrow"><summary>Tous les domaines</summary><div id="parts-fil-2">${partsFil()}</div></details>
    </div>
    <aside class="rail rail-right" aria-label="Questions de cette partie"><p class="rail-title">Dans cette partie</p><div id="q-fil">${questionsFil(d)}</div></aside>
  </div>`;
}

// ---------- Rapport ----------
const reportFil = (id) => `<ol class="fil" id="${id}">${REPORT_SECTIONS.map(([sid, label]) => `<li data-sec="${sid}"><a href="#${sid}" data-anchor="${sid}"><span class="num"></span><span>${esc(label)}</span></a></li>`).join('')}</ol>`;

function endView() {
  const pr = progress(cfg, state.q);
  const complete = pr.done === pr.total;
  return `${header('Votre plan', `${pr.answered} réponses sur ${pr.total}`)}
  <div class="layout">
    <aside class="rail rail-left" aria-label="Sommaire du plan"><p class="rail-title">Sommaire</p>${reportFil('rep-fil')}</aside>
    <div class="content">
      <section class="toolbar">
        <div style="display:grid;gap:8px">
          <p class="eyebrow">Votre plan</p>
          <h2>${complete ? 'Votre plan est prêt' : 'Votre plan, à compléter'}</h2>
          <p class="sub">${pr.answered} réponses sur ${pr.total}. ${complete ? 'Gardez-le, testez une à trois actions pendant 7 jours, puis réévaluez dans 2 à 4 semaines.' : 'Les résultats sont provisoires : vous pouvez revenir compléter les domaines à tout moment, le plan se met à jour.'}</p>
        </div>
        <div class="meta-form">
          <label for="meta-who">Prénom ou initiales (facultatif)<input id="meta-who" value="${esc(state.meta.who)}" autocomplete="off"></label>
        </div>
        <div class="actions">
          <button class="btn anis" id="print">${icon('print')}Enregistrer en PDF</button>
          <button class="btn" id="copy-sum">${icon('copy')}Copier la synthèse</button>
          <button class="btn" id="dl-sum">${icon('download')}Synthèse (.txt)</button>
          <button class="btn" id="pause2">${icon('download')}Mes réponses (fichier de reprise)</button>
          <button class="btn ghost" id="back">${icon('left')}Revenir aux questions</button>
        </div>
        <p class="privacy" id="sum-status" aria-live="polite">${icon('lock')}<span>Rien ne quitte votre navigateur. Pour le PDF : dans la fenêtre d’impression, choisissez « Enregistrer au format PDF ».</span></p>
        <p class="bh-reset"><button class="hv-linkbtn" id="reset" type="button">Effacer mes réponses de ce navigateur</button></p>
      </section>
      <details class="runhead only-narrow" id="runhead"><summary><span class="rh-k" id="rh-k">Résumé</span><span class="rh-s" id="rh-s"></span></summary>${reportFil('rep-fil-2')}</details>
      <div id="report">${reportHTML(cfg, state.q, state.meta)}</div>
    </div>
    <aside class="rail rail-right" aria-label="Sur cette section"><p class="rail-title">Sur cette section</p><ol class="fil" id="sub-fil"></ol></aside>
  </div>`;
}

// ---------- Rendu ----------
function render() {
  const app = $('#app');
  app.className = ['home', 'comprendre', 'screen', 'end', 'lire'].includes(state.view) ? 'wide' : '';
  lastSec = '';
  resetComprendreSpy();
  const views = { home: homeView, comprendre: comprendreView, questionnaire: questionnaireView, methode: methodeView, art: artView, lire: lireView, screen: screenView, end: endView };
  app.innerHTML = (views[state.view] || homeView)();
  document.title = { home: 'Bonheur · Guide opérationnel', comprendre: 'Comprendre · Bonheur', questionnaire: 'Le questionnaire · Bonheur', methode: 'Méthode et sources · Bonheur', art: 'L’Art d’être heureux · Bonheur', lire: `${ANNEXES.find((a) => a.id === state.sub[0])?.title || 'Lire'} · Bonheur`, screen: `${cfg.domains[state.screen].title} · Questionnaire`, end: 'Votre plan · Bonheur' }[state.view];
  bind();
  // Menu défilant sur téléphone : la page en cours reste visible.
  const nav = document.querySelector('.site-nav'), curLink = nav?.querySelector('[aria-current]');
  if (nav && curLink && nav.scrollWidth > nav.clientWidth) nav.scrollLeft = curLink.offsetLeft - nav.offsetLeft - 40;
  if (state.view === 'home') homeAnim();
  if (state.view === 'art') artBind(ART, state.sub, () => { const y = window.scrollY; render(); window.scrollTo(0, y); });
  if (document.querySelector('.mermaid')) renderMermaid();
  spy();
}

/** Diagrammes Mermaid (page Visualisations) : bibliothèque chargée seulement si besoin. */
async function renderMermaid() {
  const blocks = [...document.querySelectorAll('.mermaid')];
  try {
    if (!window.mermaid) {
      const mod = await import('https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.esm.min.mjs');
      window.mermaid = mod.default;
      window.mermaid.initialize({ startOnLoad: false, theme: 'base', securityLevel: 'strict', themeVariables: { primaryColor: '#e6efe9', primaryTextColor: '#0f2f2a', primaryBorderColor: '#123a33', lineColor: '#e8794f', secondaryColor: '#f6efe2', tertiaryColor: '#fffdf8', fontFamily: 'Inter, sans-serif' } });
    }
    await window.mermaid.run({ nodes: blocks });
  } catch {
    blocks.forEach((b) => b.classList.add('mermaid-fallback'));
  }
}

// ---------- Fils d'Ariane : suivre la lecture ----------
let spyFrame = 0;
let lastSec = '';
function spy() {
  cancelAnimationFrame(spyFrame);
  spyFrame = requestAnimationFrame(() => {
    const line = window.innerHeight * 0.35;
    if (state.view === 'comprendre') comprendreSpy();
    else if (state.view === 'screen') {
      let cur = null;
      for (const li of document.querySelectorAll('.q')) { if (li.getBoundingClientRect().top <= line) cur = li; else break; }
      cur = cur || document.querySelector('.q');
      document.querySelectorAll('.q.here').forEach((li) => li !== cur && li.classList.remove('here'));
      cur?.classList.add('here');
      const i = cur?.id.split('-').pop();
      document.querySelectorAll('#q-fil li').forEach((li) => li.classList.toggle('here', li.dataset.q === i));
    } else if (state.view === 'lire') {
      const subs = [...document.querySelectorAll('#doc [data-sub]')];
      let cur = null;
      for (const s of subs) { if (s.getBoundingClientRect().top <= line) cur = s; else break; }
      const ci = subs.indexOf(cur);
      document.querySelectorAll('#doc-sub li').forEach((li, k) => { li.className = k < ci ? 'past' : k === ci ? 'here' : ''; });
    } else if (state.view === 'end') {
      const secs = [...document.querySelectorAll('#report .rep-page')];
      let cur = secs[0];
      for (const s of secs) { if (s.getBoundingClientRect().top <= line) cur = s; else break; }
      if (!cur) return;
      const idx = secs.indexOf(cur);
      for (const fil of ['#rep-fil', '#rep-fil-2']) document.querySelectorAll(`${fil} li`).forEach((li, k) => { li.className = k < idx ? 'past' : k === idx ? 'here' : ''; });
      const subs = [...cur.querySelectorAll('[data-sub]')];
      let curSub = null;
      for (const s of subs) { if (s.getBoundingClientRect().top <= line) curSub = s; else break; }
      if (cur.id !== lastSec) {
        lastSec = cur.id;
        $('#sub-fil').innerHTML = subs.length
          ? subs.map((s) => `<li data-for="${s.id}"><a href="#${s.id}" data-anchor="${s.id}"><span></span><span>${esc(s.dataset.sub)}</span></a></li>`).join('')
          : `<li class="here"><a href="#${cur.id}" data-anchor="${cur.id}"><span></span><span>${esc(cur.dataset.label || '')}</span></a></li>`;
        $('#sub-fil').querySelectorAll('[data-anchor]').forEach(bindAnchor);
      }
      const si = subs.indexOf(curSub);
      document.querySelectorAll('#sub-fil li[data-for]').forEach((li, k) => { li.className = k < si ? 'past' : k === si ? 'here' : ''; });
      if ($('#rh-k')) { $('#rh-k').textContent = cur.dataset.label || ''; $('#rh-s').textContent = curSub ? curSub.dataset.sub : ''; }
    }
  });
}
window.addEventListener('scroll', spy, { passive: true });
window.addEventListener('resize', spy);

// ---------- Interactions ----------
const smooth = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');
/** Sommaires internes : défiler sans changer de page. */
function bindAnchor(a) {
  a.addEventListener('click', (e) => {
    const el = document.getElementById(a.dataset.anchor);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: smooth() });
    a.closest('details')?.removeAttribute('open');
  });
}

function refreshChrome() {
  const d = cfg.domains[state.screen];
  const top = document.querySelector('.top .progress');
  if (top) top.outerHTML = progressBar();
  const c = $('#top-count'); if (c) c.textContent = progress(cfg, state.q).done;
  const st = domainScore(state.q, d);
  const l = $('#left'); if (l) { l.innerHTML = navStatus(st); $('#first-missing')?.addEventListener('click', focusFirstMissing); }
  const bc = $('#block-count'); if (bc) bc.innerHTML = `${st.answered}<small>/${st.total}</small>`;
  for (const id of ['#parts-fil', '#parts-fil-2']) { const el = $(id); if (el) { el.innerHTML = partsFil(); el.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => goScreen(Number(b.dataset.go)))); } }
  document.querySelectorAll('#q-fil li').forEach((li) => li.classList.toggle('past', Number.isInteger(state.q.answers[d.id]?.[+li.dataset.q])));
}

function focusFirstMissing() {
  const li = document.querySelector('.q.unanswered');
  if (!li) return;
  li.scrollIntoView({ behavior: smooth(), block: 'center' });
  li.querySelector('input')?.focus({ preventScroll: true });
}

function setAnswer(id, i, v, { advance = false } = {}) {
  state.q.answers[id][i] = v;
  state.q.skipped[id] = false;
  saveAnswers();
  const li = document.getElementById(`item-${id}-${i}`);
  if (li) { li.classList.add('answered'); li.classList.remove('unanswered'); }
  refreshChrome();
  if (advance) {
    const items = [...document.querySelectorAll('.q')];
    const next = items.slice(items.indexOf(li) + 1).find((x) => x.classList.contains('unanswered'));
    if (next && next.getBoundingClientRect().top > window.innerHeight * 0.55) setTimeout(() => next.scrollIntoView({ behavior: smooth(), block: 'center' }), 180);
  }
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}
function download(text, name) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
const stamp = () => { const d = new Date(), p = (x) => String(x).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; };
const setStatus = (msg) => { const s = $('#sum-status'); if (s) s.innerHTML = `${icon('check')}<span>${esc(msg)}</span>`; };

function bind() {
  document.querySelectorAll('[data-anchor]').forEach(bindAnchor);
  $('#resume')?.addEventListener('click', openResume);
  $('#resume-bottom')?.addEventListener('click', openResume);
  $('#pause')?.addEventListener('click', openPause);
  $('#pause2')?.addEventListener('click', openPause);
  $('#back')?.addEventListener('click', () => goScreen(firstOpen()));
  $('#print')?.addEventListener('click', () => window.print());
  $('#meta-who')?.addEventListener('input', (e) => { state.meta.who = e.target.value; $('#report').innerHTML = reportHTML(cfg, state.q, state.meta); lastSec = ''; document.querySelectorAll('#report [data-anchor]').forEach(bindAnchor); spy(); });
  $('#copy-sum')?.addEventListener('click', async () => setStatus(await copyText(textSummary(cfg, state.q)) ? 'Synthèse copiée.' : 'Copie indisponible : utilisez le téléchargement.'));
  $('#dl-sum')?.addEventListener('click', () => { download(textSummary(cfg, state.q), `synthese-bonheur-${stamp()}.txt`); setStatus('Synthèse téléchargée.'); });
  $('#reset')?.addEventListener('click', () => {
    if (!confirm('Effacer toutes vos réponses de ce navigateur ?')) return;
    state.q = emptyState(cfg); saveAnswers(); goHash('#questionnaire');
  });
  $('#prev')?.addEventListener('click', () => (state.screen === 0 ? goHash('#questionnaire') : goScreen(state.screen - 1)));
  $('#next')?.addEventListener('click', () => (state.screen === cfg.domains.length - 1 ? goHash('#plan') : goScreen(state.screen + 1)));
  document.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => goScreen(Number(b.dataset.go))));
  $('#skip')?.addEventListener('change', (e) => { state.q.skipped[cfg.domains[state.screen].id] = e.target.checked; saveAnswers(); const y = window.scrollY; render(); window.scrollTo(0, y); });
  // Un clic ou un toucher fait avancer ; la navigation au clavier (flèches) ne déplace pas l'écran.
  let pointer = false;
  document.querySelectorAll('.choices').forEach((g) => g.addEventListener('pointerdown', () => { pointer = true; }));
  document.querySelectorAll('.choices input').forEach((inp) => inp.addEventListener('change', () => {
    setAnswer(inp.dataset.d, Number(inp.dataset.i), Number(inp.value), { advance: pointer });
    pointer = false;
  }));
  $('#first-missing')?.addEventListener('click', focusFirstMissing);
}

// ---------- Pause et reprise par fichier ----------
function dialog(html) {
  const d = document.createElement('dialog');
  d.innerHTML = `<div class="stack">${html}</div>`;
  document.body.append(d);
  d.addEventListener('close', () => d.remove());
  d.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => d.close()));
  d.showModal();
  return d;
}

function openPause() {
  const text = serialize(cfg, state.q, state.screen);
  const pr = progress(cfg, state.q);
  const d = dialog(`<p class="eyebrow">${pr.answered} réponses sur ${pr.total}</p><h2>Faire une pause</h2>
    <p>Vos réponses restent gardées <b>dans ce navigateur</b> : vous pouvez fermer l’onglet et revenir plus tard. Pour reprendre sur un autre appareil ou garder une trace, <b>téléchargez vos réponses</b>.</p>
    <div class="actions"><button class="btn primary" id="dl">${icon('download')}Télécharger mes réponses</button><button class="btn ghost" data-close>Continuer à répondre</button></div>
    <p id="dl-done" class="privacy" hidden>${icon('check')}<span>Fichier téléchargé.</span></p>
    <details><summary>Le téléchargement ne marche pas ?</summary><p style="margin-block:8px">Copiez ce texte et collez-le dans un fichier ou une note :</p>
      <textarea id="pause-text" readonly>${esc(text)}</textarea><div class="actions"><button class="btn small" id="copy">Copier le texte</button><span id="copied" class="muted small"></span></div></details>`);
  $('#dl', d).addEventListener('click', () => { download(text, `bonheur-reponses-${stamp()}.txt`); $('#dl-done', d).hidden = false; });
  $('#copy', d).addEventListener('click', async () => {
    const ta = $('#pause-text', d);
    if (await copyText(ta.value)) $('#copied', d).textContent = 'Copié.';
    else { ta.focus(); ta.select(); $('#copied', d).textContent = 'Texte sélectionné : copiez-le avec Ctrl+C ou un appui long.'; }
  });
}

function openResume() {
  const d = dialog(`<h2>Reprendre avec mon fichier</h2>
    <p>Le fichier téléchargé lors de votre pause est lu dans cet onglet, sans être envoyé nulle part. Il remplace les réponses gardées dans ce navigateur.</p>
    <label class="dropzone" id="drop">${icon('upload')}<b>Choisir mon fichier</b><span class="muted small">ou le glisser ici (bonheur-reponses-….txt)</span><input type="file" id="resume-file" accept=".txt,text/plain"></label>
    <p id="resume-error" class="error" role="alert"></p>
    <details><summary>Ou coller le texte du fichier</summary><textarea id="resume-text" placeholder="Collez ici le contenu du fichier"></textarea>
      <div class="actions"><button class="btn small" id="resume-paste">Reprendre avec ce texte</button></div></details>
    <div class="actions"><button class="btn ghost" data-close>Annuler</button></div>`);
  const load = (text) => {
    try {
      const r = parse(cfg, text);
      state.q = r.state; saveAnswers();
      state.notice = r.warnings.length ? esc(r.warnings.join(' ')) : null;
      d.close();
      goScreen(r.screen);
    } catch (e) { $('#resume-error', d).textContent = e.message; }
  };
  $('#resume-file', d).addEventListener('change', async (e) => { const f = e.target.files[0]; if (f) load(await f.text()); });
  $('#resume-paste', d).addEventListener('click', () => load($('#resume-text', d).value));
  const drop = $('#drop', d);
  drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('over'));
  drop.addEventListener('drop', async (e) => { e.preventDefault(); drop.classList.remove('over'); const f = e.dataTransfer.files[0]; if (f) load(await f.text()); });
}

// ---------- Démarrage ----------
function onRoute() {
  route();
  render();
  // Lien direct vers un chapitre ou une sous-partie : #comprendre/<chapitre>, #lire/<doc>/<ancre>
  const target = state.view === 'comprendre' && state.sub[0] ? `ch-${state.sub[0]}` : state.view === 'lire' && state.sub[1] ? `doc-${state.sub[1]}` : '';
  const el = target && document.getElementById(target);
  if (el) requestAnimationFrame(() => el.scrollIntoView()); else window.scrollTo(0, 0);
  state.notice = null; // un avertissement de reprise ne s'affiche qu'une fois
}

try {
  cfg = readJSON('bonheur-config');
  DOCS = readJSON('bonheur-docs') || {};
  ART = readJSON('bonheur-art');
  if (!cfg) throw new Error('configuration absente');
  state.q = loadAnswers();
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.addEventListener('hashchange', onRoute);
  onRoute();
} catch (e) {
  $('#app').innerHTML = `<p class="note alert" style="margin-top:32px">Le site n’a pas pu se charger (${esc(e.message)}). Rechargez la page.</p>`;
}
