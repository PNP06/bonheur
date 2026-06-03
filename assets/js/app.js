const App = (() => {
  const app = document.getElementById('app');
  const progressBar = document.getElementById('readingProgress');
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');
  const contentCache = new Map();
  const allDocsById = new Map(ALL_DOCS.map((doc) => [doc.id, doc]));
  const pathToDoc = new Map(ALL_DOCS.map((doc) => [MarkdownRenderer.normalizeDocPath(doc.path), doc]));
  let currentHeadings = [];

  function route() {
    const hash = decodeURIComponent(window.location.hash || '#/accueil');
    const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    return {
      page: parts[0] || 'accueil',
      docId: parts[1] || '',
      anchor: parts.slice(2).join('/') || ''
    };
  }

  function setPageTitle(title) {
    document.title = title ? `${title} · Le Guide Opérationnel du Bonheur Humain` : 'Le Guide Opérationnel du Bonheur Humain';
  }

  function updateActiveNav(page) {
    document.querySelectorAll('[data-nav]').forEach((link) => {
      const active = link.dataset.nav === page || (page === 'lire' && link.dataset.nav === 'guide');
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function closeNav() {
    primaryNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  function updateReadingProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }

  async function loadDocument(doc) {
    if (contentCache.has(doc.id)) return contentCache.get(doc.id);
    const response = await fetch(doc.path);
    if (!response.ok) throw new Error(`Contenu indisponible`);
    const text = await response.text();
    contentCache.set(doc.id, text);
    return text;
  }

  function renderHome() {
    setPageTitle('');
    app.innerHTML = `
      <section class="page">
        <div class="hero">
          <div>
            <p class="eyebrow">Guide scientifique et pratique</p>
            <h1>Construire une vie plus solide, pas poursuivre une émotion.</h1>
            <p class="lead">Ce guide rassemble les données les plus robustes sur le bonheur humain et les transforme en décisions lisibles : comprendre vite, lire le fond, ou choisir quoi faire maintenant.</p>
          </div>
          <aside class="hero-panel">
            <strong>Idée centrale</strong>
            <p>Le bonheur durable se pilote comme une architecture de facteurs protecteurs : relations, sommeil, santé, activité, autonomie, compétence, sens et sécurité.</p>
          </aside>
        </div>

        <div class="action-grid" aria-label="Entrées principales">
          <a class="entry-card" href="#/synthese">
            <span class="entry-number">1</span>
            <h2>Lire la synthèse</h2>
            <p>Comprendre l’essentiel en 5 à 10 minutes : idées clés, priorités d’action, erreurs fréquentes et déterminants majeurs.</p>
            <span class="button button-primary">Comprendre vite</span>
          </a>
          <a class="entry-card" href="#/guide">
            <span class="entry-number">2</span>
            <h2>Explorer le guide complet</h2>
            <p>Lire le rapport détaillé par thèmes clairs : définitions, neuroscience, déterminants, illusions, philosophie, plan d’action et sources.</p>
            <span class="button button-secondary">Lire le fond</span>
          </a>
          <a class="entry-card" href="#/questionnaire">
            <span class="entry-number">3</span>
            <h2>Faire le questionnaire</h2>
            <p>Obtenir une auto-orientation prudente : domaines prioritaires, facteurs protecteurs et premières actions à tester.</p>
            <span class="button button-secondary">Savoir quoi faire</span>
          </a>
        </div>

        <section class="section-block">
          <div class="section-head">
            <div>
              <p class="section-label">Ce qui compte vraiment</p>
              <h2>Les leviers les plus robustes</h2>
            </div>
            <a class="button button-quiet" href="#/lire/variables">Lire les 10 variables</a>
          </div>
          <ul class="pill-list">
            ${HOME_PRIORITIES.map((item) => `<li>${MarkdownRenderer.escapeHtml(item)}</li>`).join('')}
          </ul>
        </section>
      </section>
    `;
  }

  function renderSynthesis() {
    setPageTitle('Synthèse');
    app.innerHTML = `
      <section class="page">
        <div class="hero">
          <div>
            <p class="eyebrow">Comprendre vite</p>
            <h1>La synthèse en quelques minutes</h1>
            <p class="lead">Le bonheur durable n’est pas une émotion isolée. C’est une organisation de vie qui protège le corps, les relations, l’autonomie, la compétence et le sens.</p>
          </div>
          <aside class="hero-panel">
            <strong>Priorité pratique</strong>
            <p>Corriger d’abord les domaines rouges : insomnie, isolement, dette, surcharge, douleur, conflit chronique ou usage numérique subi.</p>
          </aside>
        </div>

        <section class="section-block">
          <div class="section-head">
            <div>
              <p class="section-label">Idées clés</p>
              <h2>Ce qu’il faut retenir</h2>
            </div>
            <a class="button button-secondary" href="#/lire/synthese-detail">Lire la synthèse détaillée</a>
          </div>
          <div class="card-grid">
            ${SUMMARY_INSIGHTS.map((item) => `<article class="summary-card"><p>${MarkdownRenderer.escapeHtml(item)}</p></article>`).join('')}
          </div>
        </section>

        <section class="section-block two-col">
          <article class="info-card">
            <p class="section-label">Priorités d’action</p>
            <h2>Les actions les plus rentables</h2>
            <ol class="compact-list">
              ${SUMMARY_ACTIONS.map((item) => `<li>${MarkdownRenderer.escapeHtml(item)}</li>`).join('')}
            </ol>
          </article>
          <article class="info-card">
            <p class="section-label">Pièges fréquents</p>
            <h2>Les erreurs à éviter</h2>
            <ul class="compact-list">
              ${SUMMARY_ERRORS.map((item) => `<li>${MarkdownRenderer.escapeHtml(item)}</li>`).join('')}
            </ul>
          </article>
        </section>

        <section class="section-block">
          <div class="section-head">
            <div>
              <p class="section-label">Étape suivante</p>
              <h2>Choisir une action sans vous disperser</h2>
              <p>Le questionnaire sert à transformer cette synthèse en orientation personnelle : 1 à 3 domaines prioritaires, pas une liste infinie de bonnes intentions.</p>
            </div>
            <a class="button button-primary" href="#/questionnaire">Faire le questionnaire</a>
          </div>
        </section>
      </section>
    `;
  }

  function renderGuide() {
    setPageTitle('Guide complet');
    const groups = [...new Set(GUIDE_DOCS.map((doc) => doc.group))];

    app.innerHTML = `
      <section class="page">
        <div class="hero">
          <div>
            <p class="eyebrow">Lire le fond</p>
            <h1>Guide complet par grands thèmes</h1>
            <p class="lead">Chaque partie est autonome. Les titres ci-dessous évitent le jargon et indiquent clairement ce que vous allez apprendre.</p>
          </div>
          <aside class="hero-panel">
            <strong>Besoin d’une réponse rapide ?</strong>
            <p>Commencez par la synthèse, puis revenez ici pour vérifier le niveau de preuve et les limites.</p>
          </aside>
        </div>

        <div class="guide-toolbar">
          <div class="search-field">
            <label for="guideSearch">Rechercher dans le guide</label>
            <input id="guideSearch" type="search" placeholder="Sommeil, argent, dopamine, relations...">
          </div>
        </div>

        <div class="guide-groups" id="guideGroups">
          ${groups.map((group) => `
            <section class="guide-group" data-guide-group>
              <h2>${MarkdownRenderer.escapeHtml(group)}</h2>
              <div class="guide-grid">
                ${GUIDE_DOCS.filter((doc) => doc.group === group).map(renderGuideCard).join('')}
              </div>
            </section>
          `).join('')}
          <section class="guide-group" data-guide-group>
            <h2>Outils complémentaires</h2>
            <div class="guide-grid">
              ${UTILITY_DOCS.map(renderGuideCard).join('')}
            </div>
          </section>
        </div>
      </section>
    `;

    const input = document.getElementById('guideSearch');
    input.addEventListener('input', () => filterGuide(input.value));
    prepareGuideSearchIndex(input);
  }

  function renderGuideCard(doc) {
    const href = doc.route || `#/lire/${doc.id}`;
    return `
      <a class="guide-card" href="${href}" data-guide-card data-search="${MarkdownRenderer.escapeHtml(`${doc.title} ${doc.description}`.toLowerCase())}">
        <p class="card-label">${MarkdownRenderer.escapeHtml(doc.order)}</p>
        <h3>${MarkdownRenderer.escapeHtml(doc.title)}</h3>
        <p>${MarkdownRenderer.escapeHtml(doc.description)}</p>
        <span class="button button-secondary">Lire</span>
      </a>
    `;
  }

  function filterGuide(query) {
    const normalized = query.trim().toLowerCase();
    document.querySelectorAll('[data-guide-card]').forEach((card) => {
      card.hidden = normalized && !card.dataset.search.includes(normalized);
    });
    document.querySelectorAll('[data-guide-group]').forEach((group) => {
      group.hidden = ![...group.querySelectorAll('[data-guide-card]')].some((card) => !card.hidden);
    });
  }

  async function prepareGuideSearchIndex(input) {
    await Promise.all([...GUIDE_DOCS, ...UTILITY_DOCS].map(async (doc) => {
      try {
        const markdown = await loadDocument(doc);
        const card = document.querySelector(`[href="${doc.route || `#/lire/${doc.id}`}"]`);
        if (card) {
          card.dataset.search = `${doc.title} ${doc.description} ${MarkdownRenderer.stripMarkdown(markdown)}`.toLowerCase();
        }
      } catch (error) {
        // The visible guide remains usable even if a search entry cannot be enriched.
      }
    }));

    if (input.value) {
      filterGuide(input.value);
    }
  }

  async function renderReader(docId, anchor = '') {
    const doc = allDocsById.get(docId) || allDocsById.get('synthese-detail');
    setPageTitle(doc.title);
    app.innerHTML = `
      <section class="page">
        <div class="reader-layout">
          <article class="reader-card">
            <header class="reader-header">
              <p class="reader-kicker">Guide détaillé</p>
              <h1>${MarkdownRenderer.escapeHtml(doc.title)}</h1>
              <p class="lead">${MarkdownRenderer.escapeHtml(doc.description)}</p>
              <div class="reader-actions">
                <a class="button button-secondary" href="#/guide">Retour au guide complet</a>
                <a class="button button-primary" href="#/questionnaire">Faire le questionnaire</a>
              </div>
            </header>
            <div class="load-state" id="readerStatus">Chargement...</div>
            <div class="prose" id="readerContent"></div>
          </article>
          <aside class="reader-toc">
            <strong>Dans cette partie</strong>
            <nav id="readerToc"></nav>
          </aside>
        </div>
      </section>
    `;

    try {
      const markdown = await loadDocument(doc);
      currentHeadings = MarkdownRenderer.extractHeadings(markdown);
      const context = { docId: doc.id, pathToDoc };
      document.getElementById('readerContent').innerHTML = MarkdownRenderer.render(markdown, context);
      document.getElementById('readerStatus').hidden = true;
      renderReaderToc(doc.id);
      await renderMermaid();
      scrollToAnchor(anchor);
    } catch (error) {
      document.getElementById('readerStatus').outerHTML = '<div class="error-box">Le contenu n’a pas pu être chargé. Réessayez dans quelques instants.</div>';
    }
  }

  function renderReaderToc(docId) {
    const toc = document.getElementById('readerToc');
    const headings = currentHeadings.filter((heading) => heading.level >= 2 && heading.level <= 3);
    toc.innerHTML = headings.length
      ? headings.map((heading) => `<a href="#/lire/${docId}/${heading.id}" data-heading="${heading.id}" data-level="${heading.level}">${MarkdownRenderer.escapeHtml(heading.text)}</a>`).join('')
      : '<span class="empty-state">Aucun sous-titre.</span>';
  }

  function scrollToAnchor(anchor) {
    if (!anchor) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const forceScroll = () => {
      const target = document.getElementById(anchor);
      if (target) {
        const top = window.scrollY + target.getBoundingClientRect().top - 92;
        const finalTop = Math.max(0, top);
        if (!target.hasAttribute('tabindex')) {
          target.setAttribute('tabindex', '-1');
        }
        target.focus({ preventScroll: false });
        window.scrollTo(0, finalTop);
        document.documentElement.scrollTop = finalTop;
        document.body.scrollTop = finalTop;
        updateActiveHeading();
        return true;
      }
      return false;
    };

    const attemptScroll = (attempt = 0) => {
      if (forceScroll()) return;
      if (attempt < 8) {
        window.setTimeout(() => attemptScroll(attempt + 1), 50);
      }
    };

    window.setTimeout(attemptScroll, 50);
    [150, 350, 700, 1100].forEach((delay) => window.setTimeout(forceScroll, delay));
  }

  async function renderMermaid() {
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
            primaryColor: '#dcebe4',
            primaryTextColor: '#101512',
            primaryBorderColor: '#236b57',
            lineColor: '#285f83',
            secondaryColor: '#eef3ed',
            tertiaryColor: '#ffffff',
            fontFamily: 'Inter, sans-serif'
          }
        });
      }
      await window.mermaid.run({ nodes: blocks });
    } catch (error) {
      blocks.forEach((block) => {
        block.classList.add('visual-fallback');
        block.textContent = 'Visualisation indisponible pour le moment.';
      });
    }
  }

  function updateActiveHeading() {
    const links = [...document.querySelectorAll('[data-heading]')];
    if (!links.length) return;

    let active = '';
    for (const heading of currentHeadings) {
      const node = document.getElementById(heading.id);
      if (node && node.getBoundingClientRect().top <= 116) active = heading.id;
    }

    links.forEach((link) => {
      if (link.dataset.heading === active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  async function renderRoute() {
    const current = route();
    updateActiveNav(current.page);
    closeNav();
    copyFocusReset();

    if (current.page === 'synthese') renderSynthesis();
    else if (current.page === 'guide') renderGuide();
    else if (current.page === 'questionnaire') {
      setPageTitle('Questionnaire');
      QuestionnaireApp.render(app);
    } else if (current.page === 'tableau-de-bord') await renderReader('tableau-de-bord', current.anchor);
    else if (current.page === 'sources') await renderReader('references', current.anchor);
    else if (current.page === 'lire') await renderReader(current.docId, current.anchor);
    else renderHome();

    updateReadingProgress();
  }

  function copyFocusReset() {
    app.setAttribute('tabindex', '-1');
    app.focus({ preventScroll: true });
  }

  function bind() {
    navToggle.addEventListener('click', () => {
      const open = primaryNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });

    app.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="#/lire/"]');
      if (!link) return;

      const current = route();
      const parts = decodeURIComponent(link.getAttribute('href')).replace(/^#\/?/, '').split('/').filter(Boolean);
      const targetDoc = parts[1];
      const targetAnchor = parts.slice(2).join('/');
      if (current.page === 'lire' && current.docId === targetDoc && targetAnchor) {
        event.preventDefault();
        window.history.pushState(null, '', link.getAttribute('href'));
        scrollToAnchor(targetAnchor);
      }
    });

    window.addEventListener('hashchange', renderRoute);
    window.addEventListener('popstate', renderRoute);
    window.addEventListener('scroll', () => {
      updateReadingProgress();
      updateActiveHeading();
    }, { passive: true });
    window.addEventListener('resize', updateReadingProgress, { passive: true });
  }

  function init() {
    bind();
    renderRoute();
  }

  return { init };
})();

App.init();
