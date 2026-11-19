// Page « Comprendre » : le guide scientifique, conduit comme une formation (sur le modèle de la chrysalide de Papillon).
// Une page à la fois : l'entrée (#comprendre), un chapitre par page (#comprendre/<chapitre>, docs/01 à docs/08 rendus
// tels quels), puis « Pour finir » (#comprendre/garder : dix actions, six erreurs, test final).
// Chaque chapitre : objectifs, idée de départ, « À retenir », le texte, l'exercice « À vous de jouer », ce que ça ne change
// pas, le lien vers le questionnaire, puis « précédent / suivant ». Les accompagnements sont dans app/formation.js.
// Fils d'Ariane latéraux : les pages à gauche, les sous-parties de la page à droite. Classes .pre-* (home.css, bonheur.css).

import { CHAPTERS, ESSENTIEL, SUMMARY_ACTIONS, SUMMARY_ERRORS } from './content.js';
import { escapeHtml, renderMarkdown, splitTitle, keyIdeaOf } from './markdown.js';
import { OBJECTIF_GENERAL, TEMPS, objectifsHTML, arriveHTML, afterHTML, exerciceHTML, quizHTML } from './formation.js';

/** Minutes de lecture d'un chapitre (environ 200 mots par minute, exercice compris). */
export function readingMinutes(md) {
  const words = (md || '').replace(/https?:\/\/\S+/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.round(words / 200) + 2);
}

/** Les pages de Comprendre, dans l'ordre : [clé, adresse, numéro, libellé]. */
const cPages = () => [['intro', '#comprendre', '', 'Introduction'], ...CHAPTERS.map((c, i) => [c.id, `#comprendre/${c.id}`, String(i + 1).padStart(2, '0'), c.short]), ['garder', '#comprendre/garder', '', 'Pour finir']];
export const comprendrePageOf = (sub) => (cPages().some(([k]) => k === sub) ? sub : 'intro');

const cFil = (listId, cur) => {
  const P = cPages(), ci = P.findIndex(([k]) => k === cur);
  return `<ol class="fil" id="${listId}">${P.map(([k, href, n, label], i) => `<li class="${i < ci ? 'past' : i === ci ? 'here' : ''}"><a href="${href}"${i === ci ? ' aria-current="page"' : ''}><span class="num">${n}</span><span>${escapeHtml(label)}</span></a></li>`).join('')}</ol>`;
};

function pager(cur) {
  const P = cPages(), i = P.findIndex(([k]) => k === cur);
  const prev = P[i - 1], next = P[i + 1];
  const lab = ([, , n, t]) => `${n ? `${Number(n)} · ` : ''}${escapeHtml(t)}`;
  const prevK = prev ? (prev[0] === 'intro' ? 'Retour à' : 'Chapitre précédent') : '';
  const nextK = !next ? '' : cur === 'intro' ? 'Commencer la lecture' : next[0] === 'garder' ? 'Pour finir' : 'Chapitre suivant';
  return `<nav class="pre-pager" aria-label="Changer de page">
    ${prev ? `<a class="pre-pager-prev" href="${prev[1]}"><span>← ${prevK}</span><b>${lab(prev)}</b></a>` : '<span></span>'}
    ${next ? `<a class="pre-pager-next" href="${next[1]}"><span>${nextK} →</span><b>${lab(next)}</b></a>` : ''}
  </nav>`;
}

let cLast = '';
/** Met à jour le fil de droite selon la position de lecture (appelé au défilement). */
export function comprendreSpy(root = document) {
  const page = root.querySelector('.pre-sec');
  if (!page) return;
  const line = window.innerHeight * 0.35;
  const subs = [...page.querySelectorAll('[data-sub]')];
  let curSub = null;
  for (const s of subs) { if (s.getBoundingClientRect().top <= line) curSub = s; else break; }
  const box = root.querySelector('#ch-sub');
  if (box && (page.id !== cLast || !box.children.length)) {
    cLast = page.id;
    box.innerHTML = subs.map((s) => `<li data-for="${s.id}"><a href="#${s.id}" data-anchor="${s.id}"><span></span><span>${escapeHtml(s.dataset.sub)}</span></a></li>`).join('');
    box.dataset.fresh = '1';
  }
  const si = subs.indexOf(curSub);
  root.querySelectorAll('#ch-sub li').forEach((li, i) => { li.className = i < si ? 'past' : i === si ? 'here' : ''; });
  const sub = root.querySelector('#ch-rh-s');
  if (sub) sub.textContent = curSub ? curSub.dataset.sub : '';
}
export const resetComprendreSpy = () => { cLast = ''; };

function introHTML(docs) {
  const mins = CHAPTERS.map((c) => readingMinutes(docs[c.doc]));
  const total = mins.reduce((a, b) => a + b, 0);
  const groups = [];
  CHAPTERS.forEach((c, i) => {
    if (TEMPS[c.id] || !groups.length) groups.push({ temps: TEMPS[c.id] || '', items: [] });
    groups[groups.length - 1].items.push([c, i]);
  });
  const num = Object.fromEntries(CHAPTERS.map((c, i) => [c.id, i + 1]));
  return `<section id="ch-intro" class="pre-sec pre-entree" aria-labelledby="ch-intro-t">
    <header class="pre-head">
      <p class="eyebrow">Comprendre</p>
      <h1 id="ch-intro-t">Ce que la science sait du bonheur, et ce qu’elle ne sait pas</h1>
      <p class="pre-central">Le bonheur durable n’est pas une émotion isolée. C’est une <b>organisation de vie</b> qui protège le corps, les relations, l’autonomie, la compétence et le sens. Ce guide rassemble les données <b>les plus solides</b> (méta-analyses, essais randomisés, cohortes longitudinales) et sépare ce qui est <b>établi</b> de ce qui est plausible, discuté ou simplement populaire.</p>
    </header>
    <p class="pre-objectif"><span class="pre-label">L’objectif</span>${escapeHtml(OBJECTIF_GENERAL)}</p>
    <h2 id="ch-intro-parcours" data-sub="Le parcours">Le parcours, en quatre temps</h2>
    <ol class="bh-temps">${groups.map((g) => `<li><p class="bh-temps-k">${escapeHtml(g.temps)}</p><ul>${g.items.map(([c, i]) => `<li><a href="#comprendre/${c.id}"><span class="num">${String(i + 1).padStart(2, '0')}</span><span>${escapeHtml(c.short)}</span><span class="muted">${mins[i]} min</span></a></li>`).join('')}</ul></li>`).join('')}</ol>
    <ul class="pre-contrat">
      <li><b>Huit chapitres</b>, un par page, de ${Math.min(...mins)} à ${Math.max(...mins)} minutes chacun (environ ${Math.round(total / 5) * 5} minutes en tout). Chacun commence par <b>ce que vous saurez faire</b> et finit par un <b>exercice</b> avec l’explication tout de suite.</li>
      <li><b>À votre rythme.</b> Chaque chapitre a sa propre adresse : vous pouvez vous arrêter et revenir, ou lire dans le désordre.</li>
      <li><b>Des sources à chaque chapitre</b>, et un <b>niveau de preuve</b> (A à D) pour distinguer le solide du discuté.</li>
      <li>À la fin, <b>dix actions à garder</b> et un <b>test final</b> pour vérifier ce que vous avez retenu. Rien n’est noté ni enregistré.</li>
    </ul>
    <section class="pre-ess" aria-labelledby="ch-intro-ess">
      <h2 id="ch-intro-ess" data-sub="L’essentiel en six idées">Pas le temps de tout lire ? L’essentiel en six idées</h2>
      <ol>${ESSENTIEL.map(([id, t], i) => `<li><span class="pre-ess-n">${String(i + 1).padStart(2, '0')}</span><p>${t}</p><a href="#comprendre/${id}">Lire le chapitre ${num[id]}</a></li>`).join('')}</ol>
    </section>
  </section>`;
}

function chapterHTML(docs, resolveDoc, domains, id) {
  const i = CHAPTERS.findIndex((c) => c.id === id);
  const c = CHAPTERS[i];
  const md = docs[c.doc] || '';
  const { title, body } = splitTitle(md);
  const key = keyIdeaOf(md);
  const html = renderMarkdown(body, { prefix: `ch-${c.id}-`, resolveDoc }, { shift: 1, subLevel: 2 });
  const n = CHAPTERS.length;
  return `<section id="ch-${c.id}" class="pre-sec" aria-labelledby="ch-${c.id}-t">
    ${TEMPS[c.id] ? `<p class="pre-temps">${escapeHtml(TEMPS[c.id])}</p>` : ''}
    <p class="pre-num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</p>
    <div class="pre-prog"><span>Chapitre ${i + 1} sur ${n} · environ ${readingMinutes(md)} minutes</span><i aria-hidden="true"><b style="width:${Math.round(((i + 1) / n) * 100)}%"></b></i></div>
    <h1 id="ch-${c.id}-t" class="pre-h">${escapeHtml(title || c.short)}</h1>
    ${objectifsHTML(c.id)}
    ${arriveHTML(c.id)}
    ${key ? `<div class="pre-key"><p class="pre-label">À retenir</p>${renderMarkdown(key, { resolveDoc }, { subLevel: 0 })}</div>` : ''}
    <div class="prose">${html}</div>
    ${exerciceHTML(c.id)}
    ${afterHTML(c.id, domains)}
  </section>`;
}

function garderHTML() {
  return `<section id="ch-garder" class="pre-sec" aria-labelledby="ch-garder-t">
    <p class="eyebrow">Pour finir</p>
    <h1 id="ch-garder-t" class="pre-h">Ce qu’il faut garder</h1>
    <div class="pre-conv">
      <h2 id="ch-garder-actions" data-sub="Dix actions rentables">Dix actions à garder après lecture</h2>
      <p class="pre-conv-lead">Les actions les plus rentables, d’après l’ensemble du guide. Une à trois suffisent pour commencer.</p>
      <ol>${SUMMARY_ACTIONS.map((a) => `<li><span>${escapeHtml(a)}</span></li>`).join('')}</ol>
      <h3 id="ch-garder-erreurs" data-sub="Six erreurs à éviter">Et six erreurs à éviter</h3>
      <ul class="bh-errors">${SUMMARY_ERRORS.map((e) => `<li>${escapeHtml(e)}</li>`).join('')}</ul>
    </div>
    ${quizHTML()}
    <div class="home-links">
      <a href="#questionnaire"><b>Le questionnaire</b><span>Repérer vos domaines prioritaires et repartir avec un plan pour la semaine.</span></a>
      <a href="#lire/synthese-detail"><b>Synthèse exécutive</b><span>Vingt enseignements, dix erreurs et dix actions, en deux pages.</span></a>
    </div>
  </section>`;
}

/**
 * @param {Record<string,string>} docs contenu Markdown des documents, par chemin (docs/…)
 * @param {(path: string) => string|null} resolveDoc adresse du site pour un document du dépôt
 * @param {string} sub page demandée : 'intro', un identifiant de chapitre, ou 'garder'
 * @param {Array<{id:string,title:string}>} domains domaines du questionnaire (liens « Dans le questionnaire »)
 */
export function comprendreHTML(docs, resolveDoc, sub = 'intro', domains = []) {
  const cur = comprendrePageOf(sub);
  const P = cPages(), label = P.find(([k]) => k === cur);
  const body = cur === 'intro' ? introHTML(docs) : cur === 'garder' ? garderHTML() : chapterHTML(docs, resolveDoc, domains, cur);
  return `<div class="layout pre-layout">
  <aside class="rail rail-left" aria-label="Pages de Comprendre"><p class="rail-title">Comprendre</p>${cFil('ch-fil', cur)}</aside>
  <article class="pre bh-guide" data-page="${cur}">
  <details class="runhead only-narrow" id="ch-runhead"><summary><span class="rh-k" id="ch-rh-k">${label[2] ? `${label[2]} · ` : ''}${escapeHtml(label[3])}</span><span class="rh-s" id="ch-rh-s"></span></summary>${cFil('ch-fil-2', cur)}</details>
  ${body}
  ${pager(cur)}
  <p class="muted small pre-foot">Ce guide relève de l’information scientifique générale et de l’aide à la décision. Il ne remplace pas une évaluation médicale, psychologique ou psychiatrique en cas de trouble mental, douleur chronique, insomnie sévère, idées suicidaires, addiction, traumatisme, violence relationnelle ou isolement majeur.</p>
  </article>
  <aside class="rail rail-right" aria-label="Dans cette page"><p class="rail-title">Dans cette page</p><ol class="fil" id="ch-sub"></ol></aside>
</div>`;
}
