// Page « L'Art d'être heureux » : 50 règles inspirées de Schopenhauer, en édition adulte et 10–15 ans.
// Données : Artheureux/data/*.json (intégrées par scripts/bundle.py) ; images : art/<édition>/rule-NN.webp ;
// PDF : downloads/. Adresses : #art/<adulte|jeunesse>[/ressenti|categorie|theme|regle/<id>].
// Mise en forme reprise de la page Comprendre (.pre-*) et des cartes de l'accueil (.home-*), compléments .art-* (bonheur.css).

import { escapeHtml } from './markdown.js';

export const EDITIONS = {
  adult: { route: 'adulte', label: 'Édition adulte', audience: 'Pour une lecture personnelle et approfondie', download: 'downloads/artheureux-adulte.pdf' },
  youth: { route: 'jeunesse', label: 'Édition 10–15 ans', audience: 'Pour réfléchir au collège, en famille ou seul', download: 'downloads/artheureux-jeunesse.pdf' },
};
const editionOf = (seg) => (seg === 'jeunesse' || seg === 'youth' ? 'youth' : 'adult');
const two = (n) => String(n).padStart(2, '0');
const ruleHref = (ed, rule) => `#art/${EDITIONS[ed].route}/regle/${rule.order}`;
const imageOf = (ed, rule) => (rule.image?.status === 'ready' && rule.image.web_path ? `art/${ed}/${rule.image.web_path.split('/').pop()}` : '');

const randomRule = new Map();
function pickRandom(rules, ed, exclude = '') {
  const pool = rules.filter((r) => r.id !== exclude);
  const chosen = pool[Math.floor(Math.random() * pool.length)] || rules[0];
  randomRule.set(ed, chosen.id);
  return chosen;
}
const currentRandom = (rules, ed) => rules.find((r) => r.id === randomRule.get(ed)) || pickRandom(rules, ed);

function findEntry(paths, id) {
  for (const category of paths.categories) {
    const entry = category.entries.find((e) => e.id === id);
    if (entry) return { category, entry };
  }
  return null;
}

function ruleCard(rule, ed, context = '') {
  return `<a class="art-card" href="${ruleHref(ed, rule)}">
    <span class="art-card-n">Règle ${two(rule.order)}${rule.status !== 'ready' ? ' · en préparation' : context ? ` · ${escapeHtml(context)}` : ''}</span>
    <b>${escapeHtml(rule.title)}</b>
    <span class="art-card-k">${escapeHtml(rule.key_phrase)}</span>
    ${(rule.themes || []).length ? `<span class="art-card-t">${rule.themes.slice(0, 2).map(escapeHtml).join(' · ')}</span>` : ''}
  </a>`;
}

function selection(rules, ed, paths, mode, id) {
  if (!id) return '';
  let title = '', description = '', support = false, list = [];
  if (mode === 'ressenti') {
    const f = findEntry(paths, id);
    if (!f) return '';
    title = f.entry.label;
    description = `Quelques règles à lire pour prendre du recul sur « ${f.entry.label.toLowerCase()} ».`;
    support = Boolean(f.entry.support_notice);
    list = f.entry.rule_ids.map((rid) => rules.find((r) => r.id === rid)).filter(Boolean);
  } else if (mode === 'categorie') {
    const c = paths.categories.find((x) => x.id === id);
    if (!c) return '';
    title = c.label;
    description = `Toutes les règles associées aux situations du thème « ${c.label} ».`;
    support = c.entries.some((e) => e.support_notice);
    list = [...new Set(c.entries.flatMap((e) => e.rule_ids))].map((rid) => rules.find((r) => r.id === rid)).filter(Boolean);
  } else if (mode === 'theme') {
    const t = paths.themes.find((x) => x.id === id);
    if (!t) return '';
    title = t.label;
    description = 'Les règles dont ce thème constitue l’un des fils directeurs.';
    list = rules.filter((r) => (r.themes || []).includes(t.rule_theme));
  } else return '';
  return `<section class="home-section art-results" id="art-results" aria-live="polite" aria-labelledby="art-results-t">
    <p class="eyebrow">Parcours conseillé · ${list.length} règle${list.length > 1 ? 's' : ''}</p>
    <h2 id="art-results-t">${escapeHtml(title)}</h2>
    <p class="home-intro">${escapeHtml(description)}</p>
    ${support ? '<div class="note"><p><b>Un appui, pas un diagnostic.</b> Si ce que vous vivez devient intense, durable ou dangereux, parlez-en à une personne de confiance ou à un professionnel. En cas de détresse : <a class="tel" href="tel:3114">3114</a>.</p></div>' : ''}
    <div class="art-grid">${list.map((r) => ruleCard(r, ed, title)).join('')}</div>
  </section>`;
}

function ruleDetail(rule, rules, ed) {
  if (!rule) return `<section class="home-section"><h1>Règle introuvable</h1><p>Cette règle n’existe pas dans l’édition choisie.</p><a class="btn primary" href="#art/${EDITIONS[ed].route}">Voir les 50 règles</a></section>`;
  const prev = rules.find((r) => r.order === rule.order - 1), next = rules.find((r) => r.order === rule.order + 1);
  const img = imageOf(ed, rule);
  return `<article class="pre art-rule">
    <header class="art-rule-head">
      <div>
        <p class="pre-num" aria-hidden="true">${two(rule.order)}</p>
        <p class="bh-group">Règle ${two(rule.order)} sur ${rules.length} · ${escapeHtml(EDITIONS[ed].label)}</p>
        <h1>${escapeHtml(rule.title)}</h1>
        ${rule.status !== 'ready' ? '<p class="note warn">Contenu en préparation</p>' : ''}
        ${(rule.themes || []).length ? `<p class="art-themes">${rule.themes.map((t) => `<span>${escapeHtml(t)}</span>`).join('')}</p>` : ''}
      </div>
      ${img ? `<img src="${img}" alt="${escapeHtml(rule.image.alt || '')}" width="960" height="960" loading="lazy" decoding="async">` : ''}
    </header>
    <div class="pre-key"><p class="pre-label">Phrase clé</p><p>${escapeHtml(rule.key_phrase)}</p></div>
    <h3>La règle</h3>
    <p>${escapeHtml(rule.summary)}</p>
    <div class="pre-example"><p class="pre-label">Exemple pratique</p><p>${escapeHtml(rule.example)}</p></div>
    <h3>Conseils d’application</h3>
    <ol class="list">${(rule.advice || []).map((a) => `<li>${escapeHtml(a)}</li>`).join('')}</ol>
    <h3>Questions à se poser</h3>
    <ol class="list">${(rule.questions || []).map((q) => `<li>${escapeHtml(q)}</li>`).join('')}</ol>
    <p class="muted small art-source"><b>Point de départ philosophique :</b> ${escapeHtml(rule.source?.work)} · ${escapeHtml(rule.source?.section)}. Adaptation pratique originale ; la phrase clé n’est pas une citation de Schopenhauer.</p>
    <nav class="art-pager" aria-label="Navigation entre les règles">
      ${prev ? `<a href="${ruleHref(ed, prev)}"><span>← Règle précédente</span><b>${escapeHtml(prev.title)}</b></a>` : '<span></span>'}
      ${next ? `<a href="${ruleHref(ed, next)}" class="art-next"><span>Règle suivante →</span><b>${escapeHtml(next.title)}</b></a>` : '<span></span>'}
    </nav>
  </article>`;
}

/**
 * @param {{adult: object, youth: object, paths: object, downloads: object}} data
 * @param {string[]} segs morceaux de l'adresse après #art/ (édition, mode, identifiant)
 */
export function artHTML(data, segs) {
  const ed = editionOf(segs[0]);
  const rules = data[ed].rules;
  const [mode = '', id = ''] = segs.slice(1);
  const pdf = Boolean(data.downloads?.[ed]?.available);
  const tail = ['ressenti', 'categorie', 'theme', 'regle'].includes(mode) && id ? `/${mode}/${id}` : '';
  const tabs = `<nav class="art-tabs" aria-label="Choisir une édition">${Object.entries(EDITIONS).map(([k, e]) => `<a href="#art/${e.route}${tail}"${k === ed ? ' aria-current="page"' : ''}><b>${escapeHtml(e.label)}</b><span>${escapeHtml(e.audience)}</span></a>`).join('')}</nav>`;
  const dl = pdf ? `<a class="btn" href="${EDITIONS[ed].download}" download>Télécharger le PDF</a>` : '<span class="btn" aria-disabled="true">PDF en préparation</span>';
  if (mode === 'regle') {
    return `<div class="art">
      <div class="art-top"><a class="hv-more" href="#art/${EDITIONS[ed].route}">← Les ${rules.length} règles</a>${dl}</div>
      ${tabs}
      ${ruleDetail(rules.find((r) => r.order === Number(id)), rules, ed)}
    </div>`;
  }
  const rnd = currentRandom(rules, ed);
  const feel = mode === 'ressenti' ? id : '';
  return `<div class="home art">
  <section class="home-hero home-hero-page">
    <p class="eyebrow">L’Art d’être heureux</p>
    <h1>50 règles pour regarder sa vie autrement</h1>
    <p class="lead">Une adaptation pratique et originale de la pensée de Schopenhauer : choisissez ce que vous traversez, explorez un thème ou laissez une règle vous surprendre.</p>
    <div class="actions">${dl}</div>
  </section>
  ${tabs}
  <section class="home-section" aria-labelledby="art-or">
    <h2 id="art-or">Qu’est-ce qui vous préoccupe aujourd’hui ?</h2>
    <p class="home-intro">Choisissez un ressenti, un choix difficile ou un événement. Vous obtiendrez quelques règles à lire, pas une étiquette.</p>
    <label class="art-select">Choisir ce qui correspond le mieux
      <select id="art-feeling"><option value="">Sélectionner un ressenti ou une situation…</option>
        ${data.paths.categories.map((c) => `<optgroup label="${escapeHtml(c.label)}">${c.entries.map((e) => `<option value="${escapeHtml(e.id)}"${e.id === feel ? ' selected' : ''}>${escapeHtml(e.label)}</option>`).join('')}</optgroup>`).join('')}
      </select>
    </label>
    <p class="art-label">Ou choisir un grand thème de vie</p>
    <p class="art-chips">${data.paths.categories.map((c) => `<a href="#art/${EDITIONS[ed].route}/categorie/${escapeHtml(c.id)}"${mode === 'categorie' && id === c.id ? ' aria-current="true"' : ''}>${escapeHtml(c.label)}</a>`).join('')}</p>
    <p class="art-label">Ou suivre un fil philosophique</p>
    <p class="art-chips">${data.paths.themes.map((t) => `<a href="#art/${EDITIONS[ed].route}/theme/${escapeHtml(t.id)}"${mode === 'theme' && id === t.id ? ' aria-current="true"' : ''}>${escapeHtml(t.label)}</a>`).join('')}</p>
  </section>
  ${selection(rules, ed, data.paths, mode, id)}
  <section class="home-section" aria-labelledby="art-rnd">
    <div class="art-random">
      <div><p class="pre-label">Une règle au hasard</p><span class="art-random-n">${two(rnd.order)}</span><h2 id="art-rnd">${escapeHtml(rnd.title)}</h2><p>${escapeHtml(rnd.key_phrase)}</p></div>
      <div class="actions"><a class="btn anis" href="${ruleHref(ed, rnd)}">Lire la règle</a><button class="btn" type="button" id="art-random">En tirer une autre</button></div>
    </div>
  </section>
  <section class="home-section" aria-labelledby="art-all">
    <h2 id="art-all">Les ${rules.length} règles</h2>
    <p class="home-intro">Chaque règle suit le même plan : idée, exemple, conseils, phrase clé et questions.</p>
    <div class="art-grid">${rules.map((r) => ruleCard(r, ed)).join('')}</div>
  </section>
</div>`;
}

/** Interactions de la page (après rendu). rerender : redessine la page en gardant l'adresse. */
export function artBind(data, segs, rerender) {
  const ed = editionOf(segs[0]);
  document.getElementById('art-feeling')?.addEventListener('change', (e) => {
    location.hash = e.target.value ? `#art/${EDITIONS[ed].route}/ressenti/${e.target.value}` : `#art/${EDITIONS[ed].route}`;
  });
  document.getElementById('art-random')?.addEventListener('click', () => { pickRandom(data[ed].rules, ed, randomRule.get(ed) || ''); rerender(); });
}
