import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { emptyState } from '../app/engine.js';
import { serialize, parse } from '../app/resume.js';

const cfg = JSON.parse(readFileSync(new URL('../app/data/questionnaire.json', import.meta.url), 'utf8'));

test('aller-retour du fichier de reprise, avec un domaine ignoré', () => {
  const s = emptyState(cfg);
  s.answers.sommeil = [0, 1, 2, 3, 4];
  s.answers.sens = [4, null, 2, null, 0];
  s.skipped.couple = true;
  const r = parse(cfg, serialize(cfg, s, 3));
  assert.deepEqual(r.state, s);
  assert.equal(r.screen, 3);
  assert.deepEqual(r.warnings, []);
});

test('le fichier est lisible par la personne', () => {
  const s = emptyState(cfg);
  s.answers.sommeil[0] = 4;
  const txt = serialize(cfg, s);
  assert.match(txt, /== Sommeil et rythmes ==/);
  assert.match(txt, /Réponse : 4 · solide/);
  assert.match(txt, /Réponses données : 1 sur 60/);
});

test('un fichier sans bloc ou abîmé est refusé avec un message clair', () => {
  assert.throws(() => parse(cfg, 'bonjour'), /bloc technique introuvable/);
  const txt = serialize(cfg, emptyState(cfg)).replace(/r=\.+/, 'r=abc');
  assert.throws(() => parse(cfg, txt), /modifié ou abîmé/);
});

test('un questionnaire modifié depuis la pause produit un avertissement', () => {
  const txt = serialize(cfg, emptyState(cfg));
  const changed = structuredClone(cfg);
  changed.domains[0].questions[0] += ' (reformulée)';
  assert.equal(parse(changed, txt).warnings.length, 1);
});
