// Contenus et page générée : chaque document cité existe, le Markdown est échappé, la page s'assemble sans erreur.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { Script } from 'node:vm';
import { CHAPTERS, ANNEXES, ESSENTIEL } from '../app/content.js';
import { renderMarkdown, keyIdeaOf, splitTitle } from '../app/markdown.js';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const cfg = JSON.parse(read('app/data/questionnaire.json'));

test('questionnaire : 12 domaines de 5 questions, identifiants uniques, un seul facultatif', () => {
  assert.equal(cfg.domains.length, 12);
  assert.ok(cfg.domains.every((d) => d.questions.length === 5 && d.primaryActions.length >= 2 && d.maintain && d.focus));
  assert.equal(new Set(cfg.domains.map((d) => d.id)).size, 12);
  assert.deepEqual(cfg.domains.filter((d) => d.optional).map((d) => d.id), ['couple']);
  assert.deepEqual(cfg.scale.map((s) => s.code), [0, 1, 2, 3, 4]);
});

test('chaque chapitre et document complémentaire existe, avec un titre et un « À retenir »', () => {
  for (const c of [...CHAPTERS, ...ANNEXES]) assert.ok(existsSync(new URL(c.doc, root)), c.doc);
  for (const c of CHAPTERS) {
    const md = read(c.doc);
    assert.ok(splitTitle(md).title, `titre de ${c.doc}`);
    assert.ok(keyIdeaOf(md).length > 40, `À retenir de ${c.doc}`);
  }
  for (const [id] of ESSENTIEL) assert.ok(CHAPTERS.some((c) => c.id === id), id);
});

test('le Markdown est échappé et les liens internes sont réécrits', () => {
  const html = renderMarkdown('## Titre\n\nTexte <script>x</script> [voir](03-determinants-majeurs.md) et [ici](#titre).', {
    prefix: 'p-', resolveDoc: (p) => (p === 'docs/03-determinants-majeurs.md' ? '#comprendre/determinants' : null),
  });
  assert.ok(!html.includes('<script>'));
  assert.match(html, /<h2 id="p-titre" data-sub="Titre">/);
  assert.match(html, /href="#comprendre\/determinants"/);
  assert.match(html, /data-anchor="p-titre"/);
});

test('scripts/bundle.py produit une page dont le script se compile', () => {
  execFileSync('python3', ['scripts/bundle.py'], { cwd: root });
  const page = read('site/index.html');
  const scripts = [...page.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1);
  assert.doesNotThrow(() => new Script(scripts[0][1]));
  assert.match(page, /Content-Security-Policy" content="default-src 'none'; script-src 'sha256-/);
  for (const id of ['bonheur-config', 'bonheur-docs', 'bonheur-art']) assert.match(page, new RegExp(`id="${id}"`));
  assert.ok(existsSync(new URL('site/art/adult/rule-01.webp', root)));
  assert.ok(existsSync(new URL('site/downloads/artheureux-adulte.pdf', root)));
});
