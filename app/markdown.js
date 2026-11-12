// Rendu Markdown minimal pour les documents du guide (docs/*.md) : titres, paragraphes, listes,
// tableaux, citations, code et blocs Mermaid. Le texte est échappé avant toute mise en forme.
// Les liens vers d'autres documents du dépôt sont réécrits vers les pages du site (resolveDoc).

export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function stripMarkdown(value) {
  return String(value)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[#>*_`|~-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function createSlugger(prefix = '') {
  const seen = new Map();
  return (text) => {
    const base = stripMarkdown(text).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'section';
    const count = seen.get(base) || 0;
    seen.set(base, count + 1);
    return prefix + (count ? `${base}-${count + 1}` : base);
  };
}

export function normalizeDocPath(path) {
  let p = path.trim().replace(/^['"]|['"]$/g, '').replace(/^\.?\//, '').replace(/^\.\.\//, '');
  if (!p.startsWith('docs/') && p.endsWith('.md')) p = `docs/${p}`;
  return p;
}

/**
 * @typedef {{ prefix?: string, resolveDoc?: (path: string) => string|null }} MdContext
 * prefix : préfixe des ancres (plusieurs documents sur une même page) ;
 * resolveDoc : renvoie l'adresse du site pour un document du dépôt, ou null.
 */
function mdInline(raw, ctx) {
  const codes = [];
  let v = String(raw).replace(/`([^`]+)`/g, (_, code) => { codes.push(`<code>${escapeHtml(code)}</code>`); return `@@CODE${codes.length - 1}@@`; });
  v = escapeHtml(v);
  v = v.replace(/\[([^\]]+)]\(([^)]+)\)/g, (_, label, url) => {
    const u = url.trim().replace(/^(&quot;|&#39;)|(&quot;|&#39;)$/g, '');
    if (/^(https?:|mailto:)/i.test(u)) return `<a href="${u}" target="_blank" rel="noreferrer">${label}</a>`;
    if (u.startsWith('#')) return `<a href="${u}" data-anchor="${(ctx.prefix || '') + u.slice(1)}">${label}</a>`;
    const [path, frag] = u.split('#');
    const target = ctx.resolveDoc ? ctx.resolveDoc(normalizeDocPath(path)) : null;
    return target ? `<a href="${target}${frag ? `/${frag}` : ''}">${label}</a>` : `<span>${label}</span>`;
  });
  // URL nues (sources) : rendues cliquables.
  v = v.replace(/(^|[\s(])(https?:\/\/[^\s<)]+[^\s<).,;:])/g, '$1<a href="$2" target="_blank" rel="noreferrer">$2</a>');
  v = v.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  codes.forEach((html, i) => { v = v.replace(`@@CODE${i}@@`, html); });
  return v;
}

const isTableStart = (lines, i) => !!lines[i] && !!lines[i + 1] && lines[i].includes('|')
  && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[i + 1]);
const tableRow = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());

function mdTable(lines, ctx) {
  const head = tableRow(lines[0]);
  const body = lines.slice(2).map(tableRow);
  return `<div class="table-wrap"><table class="pre-table md-table"><thead><tr>${head.map((c) => `<th>${mdInline(c, ctx)}</th>`).join('')}</tr></thead><tbody>${
    body.map((row) => `<tr>${row.map((c, i) => {
      const clean = stripMarkdown(c);
      const ev = /^[A-D](?:-[A-D])?$/.test(clean) ? ` data-evidence="${clean[0]}"` : '';
      return `<td data-label="${escapeHtml(stripMarkdown(head[i] || ''))}"${ev}>${mdInline(c, ctx)}</td>`;
    }).join('')}</tr>`).join('')}</tbody></table></div>`;
}

const isBlockStart = (lines, i) => {
  const l = lines[i] || '';
  return /^#{1,6}\s+/.test(l) || /^```/.test(l) || /^(\s*-{3,}\s*|⸻\s*)$/.test(l) || /^>\s?/.test(l)
    || /^\s*[-*]\s+/.test(l) || /^\s*\d+\.\s+/.test(l) || isTableStart(lines, i);
};

/** Titres du document (niveaux 2 à 4), avec les mêmes ancres que renderMarkdown. */
export function extractHeadings(markdown, prefix = '') {
  const slug = createSlugger(prefix);
  return markdown.replace(/\r\n/g, '\n').split('\n').map((line) => {
    const m = line.match(/^(#{1,4})\s+(.+?)\s*#*$/);
    if (!m) return null;
    return { level: m[1].length, text: stripMarkdown(m[2]), id: slug(m[2]) };
  }).filter((h) => h && h.level >= 2);
}

/**
 * Convertit un document Markdown en HTML.
 * Options : shift (décale les niveaux de titre), subLevel (niveau des titres repris dans le fil de droite).
 */
export function renderMarkdown(markdown, ctx = {}, { shift = 0, subLevel = 2 } = {}) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  const slug = createSlugger(ctx.prefix || '');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const fence = line.match(/^```\s*([A-Za-z0-9_-]+)?\s*$/);
    if (fence) {
      const lang = (fence[1] || '').toLowerCase();
      const code = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]);
      i++;
      html.push(lang === 'mermaid' ? `<pre class="mermaid">${escapeHtml(code.join('\n'))}</pre>` : `<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }
    const h = line.match(/^(#{1,4})\s+(.+?)\s*#*$/);
    if (h) {
      const level = h[1].length, id = slug(h[2]);
      const out = Math.min(6, level + shift);
      const sub = level === subLevel ? ` data-sub="${escapeHtml(stripMarkdown(h[2]))}"` : '';
      html.push(`<h${out} id="${id}"${sub}>${mdInline(h[2], ctx)}</h${out}>`);
      i++;
      continue;
    }
    if (/^(\s*-{3,}\s*|⸻\s*)$/.test(line)) { html.push('<hr>'); i++; continue; }
    if (isTableStart(lines, i)) {
      const t = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) t.push(lines[i++]);
      html.push(mdTable(t, ctx));
      continue;
    }
    if (/^>\s?/.test(line)) {
      const q = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, ''));
      html.push(`<blockquote>${renderMarkdown(q.join('\n'), { ...ctx, prefix: `${ctx.prefix || ''}q${i}-` }, { shift, subLevel: 0 })}</blockquote>`);
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*]\s+/, ''));
      html.push(`<ul>${items.map((it) => `<li>${mdInline(it, ctx)}</li>`).join('')}</ul>`);
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+\.\s+/, ''));
      html.push(`<ol>${items.map((it) => `<li>${mdInline(it, ctx)}</li>`).join('')}</ol>`);
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines, i)) para.push(lines[i++].trim());
    html.push(`<p>${mdInline(para.join(' '), ctx)}</p>`);
  }
  return html.join('\n');
}

/** Sépare le titre de niveau 1 (« Partie 3 — Les déterminants… ») du reste du document. */
export function splitTitle(markdown) {
  const m = markdown.match(/^#\s+(.+?)\s*$/m);
  if (!m) return { title: '', body: markdown };
  const title = m[1].replace(/^Partie\s+\d+\s*[—–-]\s*/i, '').trim();
  return { title, body: markdown.replace(m[0], '').trim() };
}

/**
 * Premier paragraphe de la conclusion opérationnelle d'un chapitre (Markdown), pour l'encadré « À retenir ».
 * Si ce paragraphe annonce une liste (il finit par « : »), la liste qui suit est gardée avec lui.
 */
export function keyIdeaOf(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const start = lines.findIndex((l) => /^#{2,4}\s+.*(Conclusion|Implication|Synthèse) opérationnelle/i.test(l));
  if (start < 0) return '';
  const para = [], list = [];
  let i = start + 1;
  for (; i < lines.length; i++) {
    const l = lines[i];
    if (!l.trim()) { if (para.length) break; continue; }
    if (/^(#|\s*[-*]\s|\s*\d+\.\s|\||>)/.test(l)) { if (para.length) break; continue; }
    para.push(l.trim());
  }
  if (para.join(' ').endsWith(':')) {
    for (; i < lines.length; i++) {
      const l = lines[i];
      if (!l.trim()) { if (list.length) break; continue; }
      if (!/^\s*([-*]|\d+\.)\s/.test(l)) break;
      list.push(l);
    }
  }
  return [para.join(' '), list.join('\n')].filter(Boolean).join('\n\n');
}
