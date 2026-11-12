// Moteur du questionnaire d'auto-orientation : scores par domaine, classement et plan d'action.
// Fonctions pures, sans accès au navigateur (testées par tests/engine.test.mjs).
// Échelle : 0 très défavorable → 4 solide. Score d'un domaine = moyenne des réponses données.

/** État vide : { answers: { domaine: [null × 5] }, skipped: { domaine: false } } */
export function emptyState(cfg) {
  return {
    answers: Object.fromEntries(cfg.domains.map((d) => [d.id, Array(d.questions.length).fill(null)])),
    skipped: Object.fromEntries(cfg.domains.map((d) => [d.id, false])),
  };
}

/** Remet un état lu (fichier, navigateur) au format attendu, en ignorant les valeurs invalides. */
export function normalizeState(cfg, raw) {
  const out = emptyState(cfg);
  for (const d of cfg.domains) {
    const vals = Array.isArray(raw?.answers?.[d.id]) ? raw.answers[d.id] : [];
    out.answers[d.id] = d.questions.map((_, i) => (Number.isInteger(vals[i]) && vals[i] >= 0 && vals[i] <= 4 ? vals[i] : null));
    out.skipped[d.id] = Boolean(d.optional && raw?.skipped?.[d.id]);
  }
  return out;
}

export function domainScore(state, d) {
  if (state.skipped[d.id]) return { skipped: true, answered: 0, total: d.questions.length, complete: false, score: null };
  const vals = (state.answers[d.id] || []).filter(Number.isInteger);
  return {
    skipped: false,
    answered: vals.length,
    total: d.questions.length,
    complete: vals.length === d.questions.length,
    score: vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null,
  };
}

/** Zone d'un score : rouge, orange, acceptable, protecteur. lvl sert aux couleurs (3 = le plus chaud). */
export function classify(cfg, score) {
  const t = cfg.thresholds;
  if (score === null) return { key: 'empty', label: 'à compléter', lvl: 'na' };
  if (score <= t.red) return { key: 'red', label: 'priorité rouge', lvl: 3 };
  if (score <= t.orange) return { key: 'orange', label: 'zone orange', lvl: 2 };
  if (score <= t.ok) return { key: 'ok', label: 'acceptable', lvl: 1 };
  return { key: 'green', label: 'protecteur', lvl: 0 };
}

export function summaries(cfg, state) {
  return cfg.domains.map((d, index) => {
    const s = domainScore(state, d);
    const status = s.skipped ? { key: 'skipped', label: 'ignoré', lvl: 'na' } : classify(cfg, s.score);
    return { ...d, index, ...s, status };
  });
}

export function progress(cfg, state) {
  const all = summaries(cfg, state);
  const total = all.reduce((n, d) => n + d.total, 0);
  const done = all.reduce((n, d) => n + (d.skipped ? d.total : d.answered), 0);
  return { done, total, answered: all.reduce((n, d) => n + d.answered, 0), covered: all.filter((d) => d.complete || d.skipped).length };
}

const completed = (cfg, state) => summaries(cfg, state).filter((d) => !d.skipped && d.complete && d.score !== null);

/** Domaines assez renseignés pour orienter : complets d'abord, puis du plus bas au plus haut. */
export function guidanceCandidates(cfg, state) {
  return summaries(cfg, state)
    .filter((d) => !d.skipped && d.score !== null && d.answered >= cfg.thresholds.minAnswers)
    .sort((a, b) => (a.complete !== b.complete ? (a.complete ? -1 : 1) : a.score - b.score));
}

export function priorities(cfg, state) {
  return guidanceCandidates(cfg, state).filter((d) => d.score <= cfg.thresholds.priorityMax).slice(0, 3);
}

export function protectors(cfg, state) {
  return completed(cfg, state).filter((d) => d.score >= cfg.thresholds.protectorMin).sort((a, b) => b.score - a.score);
}

export function consolidations(cfg, state) {
  return completed(cfg, state)
    .filter((d) => d.score >= cfg.thresholds.consolidateMin && d.score < cfg.thresholds.protectorMin)
    .sort((a, b) => a.score - b.score).slice(0, 3);
}

/** Plan 7 jours : deux actions pour un domaine rouge, une sinon ; cinq au plus. */
export function actionPlan(cfg, state) {
  const prio = priorities(cfg, state);
  const source = prio.length ? prio : guidanceCandidates(cfg, state).filter((d) => d.score < cfg.thresholds.protectorMin).slice(0, 2);
  return source.flatMap((d) => (d.primaryActions || [d.actions]).slice(0, d.score <= cfg.thresholds.red ? 2 : 1).map((action) => ({ domain: d, action }))).slice(0, 5);
}

export function statusText(d) {
  if (d.skipped) return 'non pris en compte';
  if (d.score === null) return `${d.answered}/${d.total} réponses`;
  return `${d.score.toFixed(1).replace('.', ',')}/4 · ${d.status.label}${d.complete ? '' : ' provisoire'}`;
}

/** Synthèse texte courte (copier / télécharger). */
export function textSummary(cfg, state) {
  const prio = priorities(cfg, state), plan = actionPlan(cfg, state), prot = protectors(cfg, state), cons = consolidations(cfg, state);
  return [
    'Synthèse personnelle du questionnaire - Guide opérationnel du bonheur',
    '',
    'Priorités probables :',
    ...(prio.length ? prio.map((d, i) => `${i + 1}. ${d.title} - ${statusText(d)}`) : [`Aucune priorité calculée : complétez au moins ${cfg.thresholds.minAnswers} réponses dans un domaine.`]),
    '',
    'Actions à essayer cette semaine :',
    ...(plan.length ? plan.map(({ domain, action }) => `- ${domain.title} : ${action}`) : ['Complétez davantage le questionnaire pour obtenir un plan d’action.']),
    '',
    'À maintenir :',
    ...(prot.length ? prot.map((d) => `- ${d.title} - ${d.score.toFixed(1).replace('.', ',')}/4 : ${d.maintain}`) : ['Aucun domaine protecteur complet pour le moment.']),
    '',
    'À consolider :',
    ...(cons.length ? cons.map((d) => `- ${d.title} - ${d.score.toFixed(1).replace('.', ',')}/4 : ${d.maintain}`) : ['Aucun domaine en consolidation pour le moment.']),
    '',
    'Lecture prudente : cette synthèse sert à orienter l’action. Elle ne constitue pas un diagnostic médical.',
    'Réévaluation recommandée : dans 2 à 4 semaines.',
  ].join('\n');
}
