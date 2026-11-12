// Rapport du questionnaire (« Votre plan ») : même mise en page que le rapport Psytest (pages de rapport,
// tuiles, encadré sapin, ouvertures numérotées), imprimable en PDF. Calculs dans engine.js.

import { summaries, priorities, protectors, consolidations, actionPlan, progress, statusText } from './engine.js';
import { escapeHtml } from './markdown.js';
import { answerLabel } from './resume.js';

const rLvl = (d) => `lvl-${d.status.lvl}`;
const rPill = (d) => `<span class="pill ${rLvl(d)}">${escapeHtml(d.status.label)}</span>`;
const rScore = (d) => (d.score === null ? '—' : d.score.toFixed(1).replace('.', ','));

/** Sections du rapport, pour les fils d'Ariane : [id, libellé long, libellé court]. */
export const REPORT_SECTIONS = [
  ['resume', 'Résumé', 'Résumé'],
  ['plan', 'À faire cette semaine', 'Plan'],
  ['priorites', 'Priorités probables', 'Priorités'],
  ['maintenir', 'À maintenir', 'Maintenir'],
  ['scores', 'Scores par domaine', 'Scores'],
  ['reponses', 'Vos réponses', 'Annexe'],
];

/**
 * @param {object} cfg configuration du questionnaire
 * @param {{answers: object, skipped: object}} state réponses
 * @param {{date: string, who: string}} meta
 */
export function reportHTML(cfg, state, meta) {
  const all = summaries(cfg, state), prio = priorities(cfg, state), prot = protectors(cfg, state), cons = consolidations(cfg, state);
  const plan = actionPlan(cfg, state), p = progress(cfg, state);
  const metaRow = (label, val) => `<div><dt>${label}</dt><dd>${val ? escapeHtml(val) : '<span class="blank">—</span>'}</dd></div>`;
  const need = `Répondez à au moins ${cfg.thresholds.minAnswers} questions dans un domaine pour faire apparaître des priorités.`;

  return `<div class="report">
  <section class="rep-page" id="resume" data-label="Résumé">
    <p class="eyebrow">Résumé</p>
    <h1 class="rep-title">Votre plan</h1>
    <p class="rep-intro">Ce plan transforme vos réponses en priorités et en actions à tester. Il s’appuie sur les déterminants du bonheur documentés par la recherche, mais il ne constitue ni un diagnostic ni une évaluation clinique.</p>
    <dl class="rep-meta">${metaRow('Date', meta.date)}${metaRow('Prénom ou initiales', meta.who)}${metaRow('Réponses', `${p.answered} sur ${p.total} · ${p.covered}/${cfg.domains.length} domaines parcourus`)}${metaRow('Version du questionnaire', cfg.version)}</dl>
    <h2 class="section-title" id="r-prio" data-sub="Vos priorités">Vos priorités probables</h2>
    ${prio.length ? `<div class="tiles">${prio.map((d, i) => `<a class="tile ${rLvl(d)}" href="#prio-${d.id}" data-anchor="prio-${d.id}"><span class="tile-num">${i + 1}</span><div class="tile-head"><b>${escapeHtml(d.title)}</b>${rPill(d)}</div><p>${escapeHtml(statusText(d))}</p></a>`).join('')}</div>` : `<p class="muted">${need}</p>`}
    <div class="conclusion" id="r-semaine" data-sub="Cette semaine"><h2>À faire cette semaine</h2>
      ${plan.length ? `<ul>${plan.map(({ domain, action }) => `<li><b>${escapeHtml(domain.title)} :</b> ${escapeHtml(action)}</li>`).join('')}</ul>` : `<p>${need}</p>`}
      <p class="muted small">Une à trois actions suffisent. Réévaluez dans 2 à 4 semaines.</p>
    </div>
  </section>

  <section class="rep-page" id="plan" data-label="À faire cette semaine">
    <div class="opener"><span class="opener-num" aria-hidden="true">7</span><p class="opener-k">Plan sur 7 jours</p><h2>À faire cette semaine</h2></div>
    ${plan.length ? `<ol class="bh-actions">${plan.map(({ domain, action }, i) => `<li id="act-${i + 1}" data-sub="${escapeHtml(domain.title)}"><span class="bh-actions-n">${i + 1}</span><div><b>${escapeHtml(domain.title)}</b><p>${escapeHtml(action)}</p></div></li>`).join('')}</ol>` : `<p>${need}</p>`}
    <p class="muted small">Les actions viennent du plan d’action du guide. Deux actions pour un domaine en priorité rouge, une pour les autres priorités.</p>
  </section>

  <section class="rep-page" id="priorites" data-label="Priorités probables">
    <p class="eyebrow">Priorités</p>
    <h2>Priorités probables</h2>
    ${prio.length ? prio.map((d) => `<div class="domain" id="prio-${d.id}" data-sub="${escapeHtml(d.title)}">
      <div class="domain-head"><h3>${escapeHtml(d.title)}</h3>${rPill(d)}</div>
      <p>${escapeHtml(d.focus)}</p>
      <p class="muted small">${escapeHtml(statusText(d))}</p>
      <ul class="list">${(d.primaryActions || [d.actions]).map((a) => `<li>${escapeHtml(a)}</li>`).join('')}</ul>
      <p class="muted small"><b>Autres pistes :</b> ${escapeHtml(d.actions)}</p>
    </div>`).join('') : `<p>${need}</p>`}
  </section>

  <section class="rep-page" id="maintenir" data-label="À maintenir">
    <p class="eyebrow">Points forts</p>
    <h2>À maintenir</h2>
    ${prot.length || cons.length ? `${prot.map((d) => `<div class="domain" id="maint-${d.id}" data-sub="${escapeHtml(d.title)}"><div class="domain-head"><h3>${escapeHtml(d.title)}</h3>${rPill(d)}</div><p>${escapeHtml(d.maintain)}</p></div>`).join('')}
      ${cons.map((d) => `<div class="domain" id="cons-${d.id}" data-sub="${escapeHtml(d.title)} (à consolider)"><div class="domain-head"><h3>${escapeHtml(d.title)}</h3><span class="pill lvl-1">à consolider</span></div><p>${escapeHtml(d.maintain)}</p></div>`).join('')}`
      : '<p class="muted">Les domaines à maintenir apparaissent dès qu’un domaine complet atteint un score protecteur.</p>'}
  </section>

  <section class="rep-page" id="scores" data-label="Scores par domaine">
    <p class="eyebrow">Vue d’ensemble</p>
    <h2>Scores par domaine</h2>
    <div class="table-wrap"><table class="rep-table bh-scores"><thead><tr><th>Domaine</th><th>Score</th><th>Zone</th><th>Réponses</th></tr></thead><tbody>
    ${all.map((d) => `<tr class="${rLvl(d)}"><td>${escapeHtml(d.title)}</td><td class="num"><span class="bh-score"><i style="--s:${d.score === null ? 0 : (d.score / 4).toFixed(3)}"></i></span>${rScore(d)}</td><td>${rPill(d)}</td><td class="num">${d.skipped ? 'ignoré' : `${d.answered}/${d.total}`}</td></tr>`).join('')}
    </tbody></table></div>
  </section>

  <section class="rep-page" id="reponses" data-label="Vos réponses">
    <p class="eyebrow">Annexe</p>
    <h2>Vos réponses</h2>
    ${cfg.domains.map((d) => `<h3 id="rep-${d.id}" data-sub="${escapeHtml(d.title)}">${escapeHtml(d.title)}</h3>
      ${state.skipped[d.id] ? '<p class="muted">Domaine ignoré.</p>' : `<table class="annex"><tbody>${d.questions.map((q, i) => `<tr><td class="num">${i + 1}</td><td>${escapeHtml(q)}</td><td><b>${escapeHtml(answerLabel(cfg, state.answers[d.id]?.[i]))}</b></td></tr>`).join('')}</tbody></table>`}`).join('')}
    <p class="muted small">Lecture prudente : cette synthèse sert à orienter l’action. Elle ne constitue pas un diagnostic médical. Si le fonctionnement quotidien se détériore, parlez-en à un professionnel. En cas de détresse : 3114, 24 h/24.</p>
  </section>
  <footer class="site">Guide opérationnel du bonheur · bonheur.ddlab.fr · un projet DD Lab</footer>
</div>`;
}
