// Page « Comprendre » : le guide scientifique, sur le modèle de la page Comprendre de Psytest.
// Une seule page de lecture : l'essentiel en six idées, puis les huit chapitres (docs/01 à docs/08, rendus tels quels),
// chacun ouvert par son numéro et un encadré « À retenir » tiré de sa conclusion opérationnelle.
// Fils d'Ariane latéraux : chapitres à gauche, sous-parties du chapitre à droite. Classes .pre-* (home.css).

import { CHAPTERS, ESSENTIEL, SUMMARY_ACTIONS, SUMMARY_ERRORS } from './content.js';
import { escapeHtml, renderMarkdown, splitTitle, keyIdeaOf } from './markdown.js';

const cRail = () => [...CHAPTERS.map((c, i) => [`ch-${c.id}`, String(i + 1).padStart(2, '0'), c.short]), ['ch-garder', '', 'Dix actions à garder']];
const cFil = (listId) => `<ol class="fil" id="${listId}">${cRail().map(([id, n, label]) => `<li data-sec="${id}"><a href="#comprendre/${id.slice(3)}" data-anchor="${id}"><span class="num">${n}</span><span>${escapeHtml(label)}</span></a></li>`).join('')}</ol>`;

let cLast = '';
/** Met à jour les deux fils selon la position de lecture (appelé au défilement). */
export function comprendreSpy(root = document) {
  const secs = [...root.querySelectorAll('.pre-sec')];
  if (!secs.length) return;
  const line = window.innerHeight * 0.35;
  let cur = secs[0];
  for (const s of secs) { if (s.getBoundingClientRect().top <= line) cur = s; else break; }
  const idx = secs.indexOf(cur);
  root.querySelectorAll('#ch-fil li, #ch-fil-2 li').forEach((li) => {
    const i = secs.findIndex((s) => s.id === li.dataset.sec);
    li.className = i < idx ? 'past' : i === idx ? 'here' : '';
  });
  const subs = [...cur.querySelectorAll('[data-sub]')];
  let curSub = null;
  for (const s of subs) { if (s.getBoundingClientRect().top <= line) curSub = s; else break; }
  const box = root.querySelector('#ch-sub');
  if (box && (cur.id !== cLast || !box.children.length)) {
    cLast = cur.id;
    box.innerHTML = subs.map((s) => `<li data-for="${s.id}"><a href="#${s.id}" data-anchor="${s.id}"><span></span><span>${escapeHtml(s.dataset.sub)}</span></a></li>`).join('');
  }
  const si = subs.indexOf(curSub);
  root.querySelectorAll('#ch-sub li').forEach((li, i) => { li.className = i < si ? 'past' : i === si ? 'here' : ''; });
  const [, n, label] = cRail().find(([id]) => id === cur.id) || [];
  const k = root.querySelector('#ch-rh-k'), sub = root.querySelector('#ch-rh-s');
  if (k) k.textContent = n ? `${n} · ${label}` : label || '';
  if (sub) sub.textContent = curSub ? curSub.dataset.sub : '';
}
export const resetComprendreSpy = () => { cLast = ''; };

/**
 * @param {Record<string,string>} docs contenu Markdown des documents, par chemin (docs/…)
 * @param {(path: string) => string|null} resolveDoc adresse du site pour un document du dépôt
 */
export function comprendreHTML(docs, resolveDoc) {
  const chapters = CHAPTERS.map((c) => {
    const md = docs[c.doc] || '';
    const { title, body } = splitTitle(md);
    return { ...c, title: title || c.short, key: keyIdeaOf(md), html: renderMarkdown(body, { prefix: `ch-${c.id}-`, resolveDoc }, { shift: 1, subLevel: 2 }) };
  });
  const num = Object.fromEntries(CHAPTERS.map((c, i) => [c.id, i + 1]));
  return `<div class="layout pre-layout">
  <aside class="rail rail-left" aria-label="Chapitres de Comprendre"><p class="rail-title">Comprendre</p>${cFil('ch-fil')}</aside>
  <article class="pre bh-guide">
  <header class="pre-head">
    <p class="eyebrow">Comprendre</p>
    <h1>Ce que la science sait du bonheur, et ce qu’elle ne sait pas</h1>
    <p class="pre-central">Le bonheur durable n’est pas une émotion isolée. C’est une <b>organisation de vie</b> qui protège le corps, les relations, l’autonomie, la compétence et le sens. Ce guide rassemble les données <b>les plus robustes</b> (méta-analyses, essais randomisés, cohortes longitudinales) et sépare ce qui est <b>établi</b> de ce qui est plausible, discuté ou simplement populaire.</p>
    <section class="pre-ess" aria-label="L’essentiel en six idées">
      <p class="pre-label">Pas le temps de tout lire ? L’essentiel en six idées</p>
      <ol>${ESSENTIEL.map(([id, t], i) => `<li><span class="pre-ess-n">${String(i + 1).padStart(2, '0')}</span><p>${t}</p><a href="#comprendre/${id}" data-anchor="ch-${id}">Lire le chapitre ${num[id]}</a></li>`).join('')}</ol>
    </section>
  </header>
  <details class="runhead only-narrow" id="ch-runhead"><summary><span class="rh-k" id="ch-rh-k">Comprendre</span><span class="rh-s" id="ch-rh-s"></span></summary>${cFil('ch-fil-2')}</details>
  ${chapters.map((c, i) => `<section id="ch-${c.id}" class="pre-sec" aria-labelledby="ch-${c.id}-t">
    <p class="pre-num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</p>
    <p class="bh-group">${escapeHtml(c.group)}</p>
    <h2 id="ch-${c.id}-t">${escapeHtml(c.title)}</h2>
    ${c.key ? `<div class="pre-key"><p class="pre-label">À retenir</p>${renderMarkdown(c.key, { resolveDoc }, { subLevel: 0 })}</div>` : ''}
    <div class="prose">${c.html}</div>
    ${chapters[i + 1] ? `<p class="pre-next">Chapitre suivant : <a href="#comprendre/${chapters[i + 1].id}" data-anchor="ch-${chapters[i + 1].id}">${i + 2}. ${escapeHtml(chapters[i + 1].short)}</a></p>` : ''}
  </section>`).join('')}
  <section id="ch-garder" class="pre-sec pre-conv" aria-labelledby="ch-garder-t">
    <h2 id="ch-garder-t" data-sub="Dix actions rentables">Dix actions à garder après lecture</h2>
    <p class="pre-conv-lead">Les actions les plus rentables, d’après l’ensemble du guide.</p>
    <ol>${SUMMARY_ACTIONS.map((a) => `<li><span>${escapeHtml(a)}</span></li>`).join('')}</ol>
    <h3 id="ch-garder-erreurs" data-sub="Erreurs à éviter">Et six erreurs à éviter</h3>
    <ul class="bh-errors">${SUMMARY_ERRORS.map((e) => `<li>${escapeHtml(e)}</li>`).join('')}</ul>
    <div class="home-links">
      <a href="#questionnaire"><b>Le questionnaire</b><span>Repérer vos domaines prioritaires et repartir avec un plan pour la semaine.</span></a>
      <a href="#lire/synthese-detail"><b>Synthèse exécutive</b><span>Vingt enseignements, dix erreurs et dix actions, en deux pages.</span></a>
    </div>
  </section>
  <p class="muted small pre-foot">Ce guide relève de l’information scientifique générale et de l’aide à la décision. Il ne remplace pas une évaluation médicale, psychologique ou psychiatrique en cas de trouble mental, douleur chronique, insomnie sévère, idées suicidaires, addiction, traumatisme, violence relationnelle ou isolement majeur.</p>
  </article>
  <aside class="rail rail-right" aria-label="Dans ce chapitre"><p class="rail-title">Dans ce chapitre</p><ol class="fil" id="ch-sub"></ol></aside>
</div>`;
}
