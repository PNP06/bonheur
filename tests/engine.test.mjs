import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { emptyState, normalizeState, classify, summaries, priorities, protectors, consolidations, actionPlan, progress, textSummary } from '../app/engine.js';

const cfg = JSON.parse(readFileSync(new URL('../app/data/questionnaire.json', import.meta.url), 'utf8'));
const fill = (state, id, v) => { state.answers[id] = state.answers[id].map(() => v); return state; };

test('les zones suivent les seuils de l’ancien site', () => {
  assert.equal(classify(cfg, 1.4).key, 'red');
  assert.equal(classify(cfg, 1.5).key, 'orange');
  assert.equal(classify(cfg, 2.4).key, 'orange');
  assert.equal(classify(cfg, 3.4).key, 'ok');
  assert.equal(classify(cfg, 3.5).key, 'green');
  assert.equal(classify(cfg, null).key, 'empty');
});

test('état vide : aucune priorité, aucun plan', () => {
  const s = emptyState(cfg);
  assert.deepEqual(priorities(cfg, s), []);
  assert.deepEqual(actionPlan(cfg, s), []);
  assert.equal(progress(cfg, s).done, 0);
  assert.equal(progress(cfg, s).total, 60);
});

test('priorités : trois au plus, du plus bas au plus haut, et deux actions pour un domaine rouge', () => {
  const s = emptyState(cfg);
  cfg.domains.forEach((d) => fill(s, d.id, 3));
  fill(s, 'sommeil', 1); fill(s, 'numerique', 2); fill(s, 'activite', 2); fill(s, 'travail', 2);
  const p = priorities(cfg, s).map((d) => d.id);
  assert.equal(p.length, 3);
  assert.equal(p[0], 'sommeil');
  const plan = actionPlan(cfg, s);
  assert.equal(plan.filter((a) => a.domain.id === 'sommeil').length, 2);
  assert.ok(plan.length <= 5);
});

test('un domaine incomplet passe après les domaines complets', () => {
  const s = emptyState(cfg);
  fill(s, 'relations', 2);
  s.answers.sommeil = [0, 0, 0, null, null];
  assert.deepEqual(priorities(cfg, s).map((d) => d.id), ['relations', 'sommeil']);
});

test('protecteurs et domaines à consolider', () => {
  const s = emptyState(cfg);
  fill(s, 'sens', 4); fill(s, 'relations', 3);
  assert.deepEqual(protectors(cfg, s).map((d) => d.id), ['sens']);
  assert.deepEqual(consolidations(cfg, s).map((d) => d.id), ['relations']);
});

test('le domaine facultatif ignoré n’entre dans aucun calcul', () => {
  const s = emptyState(cfg);
  fill(s, 'couple', 0);
  s.skipped.couple = true;
  assert.equal(summaries(cfg, s).find((d) => d.id === 'couple').score, null);
  assert.deepEqual(priorities(cfg, s), []);
  assert.equal(progress(cfg, s).done, 5);
});

test('normalizeState rejette les valeurs invalides et le saut d’un domaine obligatoire', () => {
  const s = normalizeState(cfg, { answers: { sommeil: [0, 4, 5, -1, 'x'] }, skipped: { sommeil: true, couple: true } });
  assert.deepEqual(s.answers.sommeil, [0, 4, null, null, null]);
  assert.equal(s.skipped.sommeil, false);
  assert.equal(s.skipped.couple, true);
});

test('la synthèse texte reprend priorités et avertissement', () => {
  const s = emptyState(cfg);
  fill(s, 'sommeil', 1);
  const t = textSummary(cfg, s);
  assert.match(t, /1\. Sommeil et rythmes - 1,0\/4 · priorité rouge/);
  assert.match(t, /ne constitue pas un diagnostic/);
});
