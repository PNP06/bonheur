// Fichier de pause / reprise du questionnaire : un texte lisible, avec un bloc technique à la fin.
// Les réponses sont aussi gardées dans ce navigateur (main.js) ; le fichier sert à changer d'appareil
// ou à garder une trace, comme sur Psytest.

import { normalizeState } from './engine.js';

const R_BEGIN = '-----DEBUT BLOC BONHEUR (ne pas modifier)-----';
const R_END = '-----FIN BLOC BONHEUR-----';

/** Empreinte courte des questions, pour savoir si le questionnaire a changé depuis la pause. */
export function fingerprint(cfg) {
  let h = 0x811c9dc5;
  const s = cfg.domains.map((d) => `${d.id}|${d.questions.join('|')}`).join('\n');
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}

export const answerLabel = (cfg, v) => (Number.isInteger(v) ? `${v} · ${cfg.scale[v].label}` : '(pas encore répondu)');

/** Contenu du fichier .txt. state = { answers, skipped }, screen = partie en cours. */
export function serialize(cfg, state, screen = 0, now = new Date()) {
  const lines = [
    'GUIDE OPÉRATIONNEL DU BONHEUR - Fichier de reprise du questionnaire',
    '',
    `Enregistré le : ${now.toLocaleString('fr-FR')}`,
    `Version du questionnaire : ${cfg.version}`,
    '',
    'Pour reprendre : ouvrez bonheur.ddlab.fr, page « Le questionnaire », puis « Reprendre grâce à mon fichier ».',
    '',
  ];
  let answered = 0;
  for (const d of cfg.domains) {
    lines.push(`== ${d.title}${state.skipped[d.id] ? ' (ignoré)' : ''} ==`);
    d.questions.forEach((q, i) => {
      const v = state.answers[d.id]?.[i];
      if (Number.isInteger(v)) answered++;
      lines.push(`${i + 1}. ${q}`, `   Réponse : ${answerLabel(cfg, v)}`);
    });
    lines.push('');
  }
  lines.splice(4, 0, `Réponses données : ${answered} sur ${cfg.domains.reduce((n, d) => n + d.questions.length, 0)}`);
  const codes = cfg.domains.map((d) => (state.skipped[d.id] ? 'x' : '') + d.questions.map((_, i) => {
    const v = state.answers[d.id]?.[i];
    return Number.isInteger(v) ? String(v) : '.';
  }).join('')).join('-');
  lines.push(R_BEGIN, `v=1;cfg=${cfg.version};fp=${fingerprint(cfg)};ecran=${screen}`, `r=${codes}`, R_END, '');
  return lines.join('\r\n');
}

/** Relit un fichier de reprise : { state, screen, warnings }, ou une erreur compréhensible. */
export function parse(cfg, text) {
  const start = text.indexOf(R_BEGIN), end = text.indexOf(R_END);
  if (start < 0 || end < start) throw new Error('Ce fichier ne ressemble pas à un fichier de reprise du questionnaire (bloc technique introuvable).');
  const block = text.slice(start + R_BEGIN.length, end).trim().split(/\r?\n/).map((l) => l.trim());
  const meta = Object.fromEntries((block.find((l) => l.startsWith('v=')) ?? '').split(';').map((kv) => kv.split('=')));
  const r = block.find((l) => l.startsWith('r='))?.slice(2) ?? '';
  if (meta.v !== '1') throw new Error('Format de fichier de reprise inconnu.');
  if (!/^[x0-4.-]*$/.test(r)) throw new Error('Le bloc de réponses a été modifié ou abîmé.');
  const parts = r.split('-');
  const warnings = [];
  if (meta.fp !== fingerprint(cfg) || parts.length !== cfg.domains.length) {
    warnings.push(`Les questions ont changé depuis votre pause (version ${meta.cfg} → ${cfg.version}). Vos réponses ont été reprises domaine par domaine : vérifiez-les.`);
  }
  const raw = { answers: {}, skipped: {} };
  cfg.domains.forEach((d, i) => {
    const p = parts[i] ?? '';
    raw.skipped[d.id] = p.startsWith('x');
    raw.answers[d.id] = [...p.replace(/^x/, '')].map((c) => (c === '.' ? null : Number(c)));
  });
  const screen = Math.min(Math.max(0, parseInt(meta.ecran, 10) || 0), cfg.domains.length - 1);
  return { state: normalizeState(cfg, raw), screen, warnings };
}
