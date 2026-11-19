// Pédagogie de Comprendre (app/formation.js) : chaque chapitre est accompagné, les exercices ne se devinent pas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHAPTERS } from '../app/content.js';
import { ACCOMP, EXERCICES, QUIZ, TEMPS, exerciceHTML, quizHTML } from '../app/formation.js';

const cfg = JSON.parse(readFileSync(new URL('../app/data/questionnaire.json', import.meta.url), 'utf8'));

test('chaque chapitre a ses objectifs, son idée de départ, son exercice et ses liens vers le questionnaire', () => {
  for (const c of CHAPTERS) {
    const a = ACCOMP[c.id];
    assert.ok(a, c.id);
    assert.ok(a.objectifs.length >= 2 && a.arrive && a.rassure && a.question, c.id);
    for (const d of a.domaines) assert.ok(cfg.domains.some((x) => x.id === d), `${c.id} → ${d}`);
    assert.ok(EXERCICES[c.id]?.sits.length >= 3, `exercice de ${c.id}`);
    assert.match(exerciceHTML(c.id), /data-sub="À vous de jouer"/);
  }
  assert.ok(Object.keys(TEMPS).every((id) => CHAPTERS.some((c) => c.id === id)));
  assert.equal(CHAPTERS[0].id in TEMPS, true);
});

test('les réponses sont bien formées et la bonne réponse ne se devine pas (longueur, place)', () => {
  const all = [...Object.values(EXERCICES).flatMap((e) => e.sits), ...QUIZ];
  let longest = 0;
  const place = new Map();
  for (const [q, answers, good, why] of all) {
    assert.ok(q && why && answers.length >= 3, q);
    assert.ok(Number.isInteger(good) && good >= 0 && good < answers.length, q);
    const max = Math.max(...answers.map((a) => a.length));
    if (answers[good].length === max && answers.filter((a) => a.length === max).length === 1) longest++;
    place.set(good, (place.get(good) || 0) + 1);
  }
  assert.ok(longest <= all.length / 3, `bonne réponse la plus longue dans ${longest} questions sur ${all.length}`);
  for (const [k, n] of place) assert.ok(n <= all.length * 0.45, `bonne réponse en ${'ABCD'[k]} dans ${n} questions sur ${all.length}`);
});

test('le test final s’affiche une question à la fois', () => {
  const html = quizHTML();
  assert.equal((html.match(/class="pre-quiz-item"/g) || []).length, QUIZ.length);
  assert.equal((html.match(/data-q="\d+" hidden/g) || []).length, QUIZ.length - 1);
});

test('questionnaire : une échelle en mots, des mots clés présents dans chaque question', () => {
  assert.deepEqual(cfg.scale.map((s) => s.label), ['Non, pas du tout', 'Plutôt non', 'En partie', 'Plutôt oui', 'Oui, tout à fait']);
  for (const d of cfg.domains) {
    assert.equal(d.keys.length, d.questions.length, d.id);
    d.keys.forEach((ks, i) => { for (const k of ks) assert.ok(d.questions[i].toLowerCase().includes(k.toLowerCase()), `${d.id} ${i + 1} : « ${k} »`); });
  }
});
