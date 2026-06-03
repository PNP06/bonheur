const DOCUMENTS = [
  {
    id: 'synthese',
    order: '09',
    group: 'Commencer',
    title: 'Synthèse exécutive',
    description: 'Le résumé opérationnel, les 20 enseignements, les 10 erreurs à éviter et les 10 actions les plus rentables.',
    path: 'docs/09-synthese-executive.md'
  },
  {
    id: 'index',
    order: '00',
    group: 'Commencer',
    title: 'Index du guide',
    description: 'Mode d’emploi du corpus, échelle de preuve et structure de lecture recommandée.',
    path: 'docs/00-index-du-guide.md'
  },
  {
    id: 'rapport-complet',
    order: '00',
    group: 'Commencer',
    title: 'Rapport complet',
    description: 'Version consolidée et canonique du guide.',
    path: 'docs/00-rapport-complet.md'
  },
  {
    id: 'definir',
    order: '01',
    group: 'Comprendre',
    title: 'Définir le bonheur',
    description: 'Plaisir, satisfaction de vie, bien-être subjectif, eudémonie, sens, flourishing et santé mentale.',
    path: 'docs/01-definir-le-bonheur.md'
  },
  {
    id: 'neuroscience',
    order: '02',
    group: 'Comprendre',
    title: 'Neuroscience',
    description: 'Ce que les circuits, neurotransmetteurs et données cérébrales permettent réellement de dire.',
    path: 'docs/02-neuroscience.md'
  },
  {
    id: 'determinants',
    order: '03',
    group: 'Comprendre',
    title: 'Déterminants majeurs',
    description: 'Relations, solitude, santé, sommeil, activité physique, argent, travail, personnalité et numérique.',
    path: 'docs/03-determinants-majeurs.md'
  },
  {
    id: 'illusions',
    order: '04',
    group: 'Comprendre',
    title: 'Illusions humaines',
    description: 'Adaptation hédonique, projection, comparaison sociale, FoMO, succès, romance et contrôle.',
    path: 'docs/04-illusions-humaines.md'
  },
  {
    id: 'philosophies',
    order: '05',
    group: 'Comprendre',
    title: 'Philosophies pratiques',
    description: 'Ce que les traditions philosophiques avaient compris et ce que les données modernes limitent.',
    path: 'docs/05-philosophies.md'
  },
  {
    id: 'systeme',
    order: '06',
    group: 'Agir',
    title: "Système d'exploitation",
    description: 'Un modèle de pilotage du bonheur comme gestion de risques et de facteurs protecteurs.',
    path: 'docs/06-systeme-exploitation.md'
  },
  {
    id: 'plan-action',
    order: '07',
    group: 'Agir',
    title: "Plan d'action",
    description: 'Actions en trois niveaux : effet maximal, habitudes structurantes et optimisation avancée.',
    path: 'docs/07-plan-action.md'
  },
  {
    id: 'variables',
    order: '08',
    group: 'Agir',
    title: 'Les 10 variables',
    description: 'Les variables les plus importantes et partiellement contrôlables sur plusieurs décennies.',
    path: 'docs/08-dix-variables.md'
  },
  {
    id: 'questionnaire',
    order: 'Q',
    group: 'Outils',
    title: 'Questionnaire opérationnel',
    description: 'Auto-orientation en 12 domaines pour choisir les premières actions.',
    path: 'docs/questionnaire-operationnel.md'
  },
  {
    id: 'tableau-de-bord',
    order: 'T',
    group: 'Outils',
    title: 'Tableau de bord',
    description: 'Indicateurs hebdomadaires, seuils vert/orange/rouge, audit mensuel et actions correctives.',
    path: 'docs/tableau-de-bord-risques-bonheur.md'
  },
  {
    id: 'matrice-actions',
    order: 'M',
    group: 'Outils',
    title: 'Matrice actions',
    description: 'Bénéfices, preuve, difficulté, délai, risques, limites et algorithme de sélection.',
    path: 'docs/matrice-actions.md'
  },
  {
    id: 'infographies',
    order: 'I',
    group: 'Outils',
    title: 'Infographies',
    description: 'Diagrammes Mermaid, matrices et supports visuels proposés.',
    path: 'docs/infographies-et-visualisations.md'
  },
  {
    id: 'references',
    order: '50',
    group: 'Sources',
    title: 'Références top 50',
    description: 'Bibliographie commentée et classement final des preuves.',
    path: 'docs/references-top-50.md'
  }
];

const state = {
  currentDoc: null,
  currentAnchor: '',
  cache: new Map(),
  headings: [],
  searchReady: false,
  searchIndex: []
};

const elements = {
  progress: document.getElementById('readingProgress'),
  docNav: document.getElementById('docNav'),
  sectionToc: document.getElementById('sectionToc'),
  content: document.getElementById('markdownContent'),
  status: document.getElementById('documentStatus'),
  documentKicker: document.getElementById('documentKicker'),
  documentTitle: document.getElementById('documentTitle'),
  documentDescription: document.getElementById('documentDescription'),
  sourceLink: document.getElementById('sourceLink'),
  searchInput: document.getElementById('searchInput'),
  searchResults: document.getElementById('searchResults'),
  menuButton: document.getElementById('menuButton'),
  sidebar: document.getElementById('siteSidebar'),
  backdrop: document.getElementById('sidebarBackdrop')
};

const docById = new Map(DOCUMENTS.map((doc) => [doc.id, doc]));
const docByPath = new Map(DOCUMENTS.map((doc) => [normalizePath(doc.path), doc]));

function normalizePath(path) {
  return path.replace(/^\.?\//, '');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripMarkdown(value) {
  return value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[#>*_`|~\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function createSlugger() {
  const seen = new Map();

  return (text) => {
    const base = stripMarkdown(text)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'section';

    const count = seen.get(base) || 0;
    seen.set(base, count + 1);
    return count ? `${base}-${count + 1}` : base;
  };
}

function parseRoute() {
  const hash = decodeURIComponent(window.location.hash || '#/synthese');
  if (!hash.startsWith('#/')) {
    return { docId: 'synthese', anchor: '' };
  }

  const parts = hash.slice(2).split('/').filter(Boolean);
  return {
    docId: parts[0] || 'synthese',
    anchor: parts.slice(1).join('/') || ''
  };
}

function buildRoute(docId, anchor = '') {
  return `#/${docId}${anchor ? `/${anchor}` : ''}`;
}

function renderNavigation() {
  const groups = [...new Set(DOCUMENTS.map((doc) => doc.group))];
  elements.docNav.innerHTML = groups.map((group) => {
    const links = DOCUMENTS
      .filter((doc) => doc.group === group)
      .map((doc) => `
        <a href="${buildRoute(doc.id)}" data-doc-id="${doc.id}">
          <span>${escapeHtml(doc.order)}</span>
          <strong>${escapeHtml(doc.title)}</strong>
        </a>
      `).join('');

    return `<div class="nav-section"><p class="nav-group">${escapeHtml(group)}</p>${links}</div>`;
  }).join('');
}

async function loadDocument(doc) {
  if (state.cache.has(doc.id)) {
    return state.cache.get(doc.id);
  }

  const response = await fetch(doc.path);
  if (!response.ok) {
    throw new Error(`Impossible de charger ${doc.path}`);
  }

  const text = await response.text();
  state.cache.set(doc.id, text);
  return text;
}

function extractHeadings(markdown) {
  const slug = createSlugger();
  return markdown
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => {
      const match = line.match(/^(#{2,4})\s+(.+?)\s*#*$/);
      if (!match) return null;

      return {
        level: match[1].length,
        text: stripMarkdown(match[2]),
        id: slug(match[2])
      };
    })
    .filter(Boolean);
}

function isTableStart(lines, index) {
  if (!lines[index] || !lines[index + 1]) return false;
  if (!lines[index].includes('|')) return false;
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[index + 1]);
}

function parseTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function renderTable(lines) {
  const header = parseTableRow(lines[0]);
  const body = lines.slice(2).map(parseTableRow);

  const headHtml = header
    .map((cell) => `<th>${renderInline(cell)}</th>`)
    .join('');

  const bodyHtml = body.map((row) => {
    const cells = row.map((cell) => {
      const clean = stripMarkdown(cell);
      const evidence = /^[A-D](?:-[A-D])?$/.test(clean) ? ` data-evidence="${clean}"` : '';
      return `<td${evidence}>${renderInline(cell)}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  return `<div class="table-wrap"><table><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`;
}

function resolveHref(url) {
  const cleaned = url.trim().replace(/^['"]|['"]$/g, '');

  if (/^(https?:|mailto:)/i.test(cleaned)) {
    return { href: cleaned, external: true };
  }

  if (cleaned.startsWith('#')) {
    return { href: buildRoute(state.currentDoc?.id || 'synthese', cleaned.slice(1)), external: false };
  }

  let normalized = normalizePath(cleaned);
  if (!normalized.startsWith('docs/') && normalized.endsWith('.md')) {
    normalized = `docs/${normalized}`;
  }

  const matchingDoc = docByPath.get(normalized);
  if (matchingDoc) {
    return { href: buildRoute(matchingDoc.id), external: false };
  }

  return { href: cleaned, external: false };
}

function renderInline(raw) {
  const codeTokens = [];
  let value = String(raw).replace(/`([^`]+)`/g, (_, code) => {
    const token = `@@CODE${codeTokens.length}@@`;
    codeTokens.push(`<code>${escapeHtml(code)}</code>`);
    return token;
  });

  value = escapeHtml(value);

  value = value.replace(/\[([^\]]+)]\(([^)]+)\)/g, (_, label, url) => {
    const link = resolveHref(url);
    const attrs = link.external ? ' target="_blank" rel="noreferrer"' : '';
    return `<a href="${escapeHtml(link.href)}"${attrs}>${label}</a>`;
  });

  value = value
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>');

  codeTokens.forEach((html, index) => {
    value = value.replace(`@@CODE${index}@@`, html);
  });

  return value;
}

function isBlockStart(lines, index) {
  const line = lines[index] || '';
  return (
    /^#{1,6}\s+/.test(line) ||
    /^```/.test(line) ||
    /^(\s*-{3,}\s*|⸻\s*)$/.test(line) ||
    /^>\s?/.test(line) ||
    /^\s*[-*]\s+/.test(line) ||
    /^\s*\d+\.\s+/.test(line) ||
    isTableStart(lines, index)
  );
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  const slug = createSlugger();
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = line.match(/^```\s*([A-Za-z0-9_-]+)?\s*$/);
    if (fence) {
      const language = (fence[1] || '').toLowerCase();
      const code = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;

      if (language === 'mermaid') {
        html.push(`<pre class="mermaid">${escapeHtml(code.join('\n'))}</pre>`);
      } else {
        html.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
      }
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+?)\s*#*$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2];
      const id = slug(text);
      html.push(`<h${level} id="${id}">${renderInline(text)}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^(\s*-{3,}\s*|⸻\s*)$/.test(line)) {
      html.push('<hr>');
      index += 1;
      continue;
    }

    if (isTableStart(lines, index)) {
      const tableLines = [];
      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
        tableLines.push(lines[index]);
        index += 1;
      }
      html.push(renderTable(tableLines));
      continue;
    }

    if (/^>\s?/.test(line)) {
      const blockquote = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        blockquote.push(lines[index].replace(/^>\s?/, ''));
        index += 1;
      }
      html.push(`<blockquote>${renderMarkdown(blockquote.join('\n'))}</blockquote>`);
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*]\s+/, ''));
        index += 1;
      }
      html.push(`<ul>${items.map((item) => `<li>${renderInline(item)}</li>`).join('')}</ul>`);
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+\.\s+/, ''));
        index += 1;
      }
      html.push(`<ol>${items.map((item) => `<li>${renderInline(item)}</li>`).join('')}</ol>`);
      continue;
    }

    const paragraph = [];
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines, index)) {
      paragraph.push(lines[index].trim());
      index += 1;
    }

    html.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
  }

  return html.join('\n');
}

function renderSectionToc() {
  const headings = state.headings.filter((heading) => heading.level >= 2 && heading.level <= 3);

  if (!headings.length) {
    elements.sectionToc.innerHTML = '<span class="toc-empty">Aucun sous-titre détecté.</span>';
    return;
  }

  elements.sectionToc.innerHTML = headings.map((heading) => `
    <a href="${buildRoute(state.currentDoc.id, heading.id)}" data-heading="${heading.id}" data-level="${heading.level}">
      ${escapeHtml(heading.text)}
    </a>
  `).join('');
}

function updateActiveNav() {
  document.querySelectorAll('[data-doc-id]').forEach((link) => {
    if (link.dataset.docId === state.currentDoc?.id) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function scrollToAnchor(anchor) {
  if (!anchor) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  requestAnimationFrame(() => {
    const target = document.getElementById(anchor);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

async function renderMermaidBlocks() {
  const blocks = [...document.querySelectorAll('.mermaid')];
  if (!blocks.length) return;

  try {
    if (!window.mermaid) {
      const module = await import('https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs');
      window.mermaid = module.default;
      window.mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        securityLevel: 'loose',
        themeVariables: {
          primaryColor: '#dceae4',
          primaryTextColor: '#111513',
          primaryBorderColor: '#1f6b55',
          lineColor: '#285f83',
          secondaryColor: '#eef4f1',
          tertiaryColor: '#ffffff',
          fontFamily: 'Inter, sans-serif'
        }
      });
    }

    await window.mermaid.run({ nodes: blocks });
  } catch (error) {
    blocks.forEach((block) => block.classList.add('mermaid-fallback'));
  }
}

async function handleRoute() {
  const route = parseRoute();
  const doc = docById.get(route.docId) || docById.get('synthese');
  state.currentDoc = doc;
  state.currentAnchor = route.anchor;

  elements.status.hidden = false;
  elements.status.textContent = 'Chargement du contenu...';
  elements.content.innerHTML = '';
  elements.documentKicker.textContent = `${doc.group} · ${doc.order}`;
  elements.documentTitle.textContent = doc.title;
  elements.documentDescription.textContent = doc.description;
  elements.sourceLink.href = doc.path;
  updateActiveNav();
  closeMenu();

  try {
    const markdown = await loadDocument(doc);
    state.headings = extractHeadings(markdown);
    elements.content.innerHTML = renderMarkdown(markdown);
    elements.status.hidden = true;
    renderSectionToc();
    await renderMermaidBlocks();
    scrollToAnchor(route.anchor);
    updateReadingProgress();
  } catch (error) {
    elements.status.hidden = true;
    elements.content.innerHTML = `
      <div class="error-box">
        <strong>Document indisponible.</strong>
        <p>Le site doit être servi par un serveur local ou par GitHub Pages pour charger les fichiers Markdown. Essayez par exemple <code>python -m http.server</code>.</p>
      </div>
    `;
    elements.sectionToc.innerHTML = '';
  }
}

function updateReadingProgress() {
  if (!elements.progress) return;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  elements.progress.style.width = `${Math.min(100, Math.max(0, progress))}%`;
}

function updateActiveHeading() {
  const headingLinks = [...document.querySelectorAll('[data-heading]')];
  if (!headingLinks.length) return;

  let active = '';
  for (const heading of state.headings) {
    const node = document.getElementById(heading.id);
    if (node && node.getBoundingClientRect().top <= 140) {
      active = heading.id;
    }
  }

  headingLinks.forEach((link) => {
    if (link.dataset.heading === active) {
      link.setAttribute('aria-current', 'true');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

async function buildSearchIndex() {
  const entries = await Promise.all(DOCUMENTS.map(async (doc) => {
    try {
      const markdown = await loadDocument(doc);
      return {
        doc,
        text: stripMarkdown(markdown),
        lower: `${doc.title} ${doc.description} ${stripMarkdown(markdown)}`.toLowerCase()
      };
    } catch (error) {
      return {
        doc,
        text: `${doc.title} ${doc.description}`,
        lower: `${doc.title} ${doc.description}`.toLowerCase()
      };
    }
  }));

  state.searchIndex = entries;
  state.searchReady = true;
}

function makeSnippet(text, query) {
  const lower = text.toLowerCase();
  const index = lower.indexOf(query.toLowerCase());
  const start = Math.max(0, index - 72);
  const end = Math.min(text.length, (index === -1 ? 160 : index + query.length + 112));
  const prefix = start > 0 ? '...' : '';
  const suffix = end < text.length ? '...' : '';
  return `${prefix}${text.slice(start, end)}${suffix}`;
}

function highlight(text, query) {
  const escaped = escapeHtml(text);
  if (!query) return escaped;
  return escaped.replace(new RegExp(`(${escapeRegExp(query)})`, 'ig'), '<mark>$1</mark>');
}

function renderSearchResults(query) {
  const normalized = query.trim().toLowerCase();

  if (normalized.length < 2) {
    elements.searchResults.hidden = true;
    elements.searchResults.innerHTML = '';
    return;
  }

  if (!state.searchReady) {
    elements.searchResults.hidden = false;
    elements.searchResults.innerHTML = '<span>Indexation du rapport...</span>';
    return;
  }

  const results = state.searchIndex
    .map((entry) => {
      const titleMatch = entry.doc.title.toLowerCase().includes(normalized) ? 6 : 0;
      const bodyIndex = entry.lower.indexOf(normalized);
      const score = titleMatch + (bodyIndex === -1 ? 0 : 4);
      return { ...entry, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  elements.searchResults.hidden = false;

  if (!results.length) {
    elements.searchResults.innerHTML = '<span>Aucun résultat direct.</span>';
    return;
  }

  elements.searchResults.innerHTML = results.map((entry) => {
    const snippet = makeSnippet(entry.text, normalized);
    return `
      <button type="button" data-search-doc="${entry.doc.id}">
        <strong>${highlight(entry.doc.title, normalized)}</strong>
        <span>${highlight(snippet, normalized)}</span>
      </button>
    `;
  }).join('');
}

function closeMenu() {
  elements.sidebar.classList.remove('is-open');
  elements.menuButton.setAttribute('aria-expanded', 'false');
  elements.backdrop.hidden = true;
}

function toggleMenu() {
  const isOpen = elements.sidebar.classList.toggle('is-open');
  elements.menuButton.setAttribute('aria-expanded', String(isOpen));
  elements.backdrop.hidden = !isOpen;
}

function bindEvents() {
  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('scroll', () => {
    updateReadingProgress();
    updateActiveHeading();
  }, { passive: true });
  window.addEventListener('resize', updateReadingProgress, { passive: true });

  elements.searchInput.addEventListener('input', (event) => {
    renderSearchResults(event.target.value);
  });

  elements.searchResults.addEventListener('click', (event) => {
    const button = event.target.closest('[data-search-doc]');
    if (!button) return;
    window.location.hash = buildRoute(button.dataset.searchDoc);
    elements.searchInput.value = '';
    elements.searchResults.hidden = true;
  });

  elements.menuButton.addEventListener('click', toggleMenu);
  elements.backdrop.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
      elements.searchResults.hidden = true;
    }
  });
}

renderNavigation();
bindEvents();
handleRoute();
buildSearchIndex();
