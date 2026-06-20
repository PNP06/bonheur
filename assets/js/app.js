const App = (() => {
  const app = document.getElementById('app');
  const progressBar = document.getElementById('readingProgress');
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');
  const contentCache = new Map();
  const allDocsById = new Map(ALL_DOCS.map((doc) => [doc.id, doc]));
  const pathToDoc = new Map(ALL_DOCS.map((doc) => [MarkdownRenderer.normalizeDocPath(doc.path), doc]));
  const utilityGroupLabel = 'Outils complémentaires';
  let currentHeadings = [];
  let activeGuideFilter = '';

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
              <p class="section-label">Comment le contenu est utilisé</p>
              <h2>Chaque bloc a un rôle précis</h2>
              <p>Le site ne présente pas seulement un long rapport. Il transforme les contenus en parcours distincts : comprendre vite, approfondir, s’auto-orienter, suivre des indicateurs et vérifier les preuves.</p>
            </div>
          </div>
          ${Ui.contentUsageGrid(CONTENT_USAGE)}
        </section>

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
    const filterGroups = [...groups, utilityGroupLabel];

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

        <section class="content-usage-panel">
          <div>
            <p class="section-label">Carte des contenus</p>
            <h2>Du rapport aux outils pratiques</h2>
            <p>Les contenus sont reliés entre eux : le rapport explique, la synthèse résume, le questionnaire oriente, le tableau de bord suit, la matrice aide à choisir et les références vérifient.</p>
          </div>
          ${Ui.contentUsageGrid(CONTENT_USAGE)}
        </section>

        <div class="guide-toolbar">
          <div class="search-field">
            <label for="guideSearch">Rechercher dans le guide</label>
            <input id="guideSearch" type="search" placeholder="Sommeil, argent, dopamine, relations...">
          </div>
        </div>

        <div class="guide-filter-tabs" aria-label="Filtrer les parties du guide">
          <button type="button" data-guide-filter="" aria-pressed="${activeGuideFilter === ''}">Tout</button>
          ${filterGroups.map((group) => `
            <button type="button" data-guide-filter="${MarkdownRenderer.escapeHtml(group)}" aria-pressed="${activeGuideFilter === group}">
              ${MarkdownRenderer.escapeHtml(group)}
            </button>
          `).join('')}
        </div>

        <div class="guide-groups" id="guideGroups">
          ${groups.map((group) => `
            <section class="guide-group" data-guide-group>
              <h2>${MarkdownRenderer.escapeHtml(group)}</h2>
              <div class="guide-grid">
                ${GUIDE_DOCS.filter((doc) => doc.group === group).map((doc) => Ui.guideCard(doc)).join('')}
              </div>
            </section>
          `).join('')}
          <section class="guide-group" data-guide-group>
            <h2>Outils complémentaires</h2>
            <div class="guide-grid">
              ${UTILITY_DOCS.map((doc) => Ui.guideCard(doc, { group: utilityGroupLabel })).join('')}
            </div>
          </section>
        </div>
      </section>
    `;

    const input = document.getElementById('guideSearch');
    input.addEventListener('input', () => filterGuide(input.value));
    bindGuideFilters(input);
    prepareGuideSearchIndex(input);
  }

  function getReaderSequence(doc) {
    if (GUIDE_DOCS.some((item) => item.id === doc.id)) {
      return GUIDE_DOCS;
    }

    if (UTILITY_DOCS.some((item) => item.id === doc.id)) {
      return UTILITY_DOCS;
    }

    return [];
  }

  function renderReaderNav(doc, placement) {
    const sequence = getReaderSequence(doc);
    const index = sequence.findIndex((item) => item.id === doc.id);
    if (index === -1) return '';

    const previous = sequence[index - 1];
    const next = sequence[index + 1];

    return Ui.readerStepNav({ previous, next, placement });
  }

  function readerGroupLabel(doc) {
    if (doc.group) return doc.group;
    if (UTILITY_DOCS.some((item) => item.id === doc.id)) return utilityGroupLabel;
    return 'Synthèse';
  }

  function getReportModules() {
    return GUIDE_DOCS.map((doc, index) => ({
      ...doc,
      order: String(index + 1).padStart(2, '0'),
      href: Ui.docHref(doc)
    }));
  }

  function renderReportModuleCard(module) {
    return `
      <article class="report-module-card">
        <div class="report-module-number">${MarkdownRenderer.escapeHtml(module.order)}</div>
        <div>
          <span>${MarkdownRenderer.escapeHtml(readerGroupLabel(module))}</span>
          <h3>${MarkdownRenderer.escapeHtml(module.title)}</h3>
          <p>${MarkdownRenderer.escapeHtml(module.description)}</p>
          <a class="button button-secondary" href="${MarkdownRenderer.escapeHtml(module.href)}">Lire cette partie</a>
        </div>
      </article>
    `;
  }

  function renderReportToolCard(item) {
    return `
      <a class="report-tool-card" href="${MarkdownRenderer.escapeHtml(item.href)}">
        <span>${MarkdownRenderer.escapeHtml(item.kicker)}</span>
        <strong>${MarkdownRenderer.escapeHtml(item.title)}</strong>
        <p>${MarkdownRenderer.escapeHtml(item.description)}</p>
      </a>
    `;
  }

  function renderReportHub(anchor = '') {
    const modules = getReportModules();
    const tools = [
      {
        kicker: 'S’orienter',
        title: 'Questionnaire interactif',
        description: 'Transformer le rapport en priorités personnelles, points à maintenir et actions à tester.',
        href: '#/questionnaire'
      },
      {
        kicker: 'Piloter',
        title: 'Tableau de bord',
        description: 'Suivre les signaux hebdomadaires : sommeil, relations, activité, stress, finances.',
        href: '#/tableau-de-bord'
      },
      {
        kicker: 'Décider',
        title: 'Matrice d’actions',
        description: 'Comparer les actions par preuve, effort, délai et limites pratiques.',
        href: '#/lire/matrice-actions'
      },
      {
        kicker: 'Vérifier',
        title: 'Sources et preuves',
        description: 'Retrouver les références scientifiques et le classement des niveaux de preuve.',
        href: '#/sources'
      }
    ];
    const navItems = [
      { id: 'rapport-parcours', label: 'Parcours conseillé' },
      { id: 'rapport-parties', label: 'Les 9 parties' },
      { id: 'rapport-outils', label: 'Outils pratiques' },
      { id: 'rapport-preuves', label: 'Niveaux de preuve' }
    ];

    currentHeadings = navItems.map((item) => ({ ...item, text: item.label, level: 2 }));
    setPageTitle('Rapport complet');

    app.innerHTML = `
      <section class="page report-page">
        <div class="report-layout">
          <main class="report-main">
            <header class="report-hero">
              ${Ui.breadcrumb([
                { label: 'Guide complet', href: '#/guide' },
                { label: 'Outils complémentaires' },
                { label: 'Rapport complet' }
              ])}
              <p class="eyebrow">Rapport complet</p>
              <h1>Lire le rapport sans se perdre</h1>
              <p class="lead">Le rapport complet est organisé comme une documentation : neuf parties de fond, des outils pratiques et des sources. Choisissez un parcours, puis avancez partie par partie.</p>
              <div class="reader-actions">
                <a class="button button-primary" href="#/lire/definir">Commencer la lecture</a>
                <a class="button button-secondary" href="#/synthese">Lire la synthèse d’abord</a>
                <a class="button button-quiet" href="#/questionnaire">Faire le questionnaire</a>
              </div>
            </header>

            <details class="report-jump">
              <summary>Aller à une section</summary>
              <nav>
                ${navItems.map((item) => `<a href="#/lire/rapport-complet/${item.id}" data-heading="${item.id}">${MarkdownRenderer.escapeHtml(item.label)}</a>`).join('')}
              </nav>
            </details>

            <section class="report-section" id="rapport-parcours">
              <p class="section-label">Parcours conseillé</p>
              <h2>Trois manières d’utiliser le rapport</h2>
              <div class="report-mode-grid">
                <a href="#/synthese" class="report-mode-card">
                  <span>01</span>
                  <strong>Comprendre vite</strong>
                  <p>Commencez par la synthèse, puis ouvrez seulement les parties qui nécessitent une vérification.</p>
                </a>
                <a href="#/lire/definir" class="report-mode-card">
                  <span>02</span>
                  <strong>Lire dans l’ordre</strong>
                  <p>Suivez les neuf parties comme un livre : définitions, science, déterminants, biais, action.</p>
                </a>
                <a href="#/questionnaire" class="report-mode-card">
                  <span>03</span>
                  <strong>Passer à l’action</strong>
                  <p>Utilisez le questionnaire, puis revenez aux parties qui expliquent vos priorités.</p>
                </a>
              </div>
            </section>

            <section class="report-section" id="rapport-parties">
              <div class="section-head">
                <div>
                  <p class="section-label">Les 9 parties</p>
                  <h2>Structure du rapport</h2>
                  <p>Chaque carte ouvre une partie autonome. Le lecteur garde ensuite un plan visible et des liens précédent/suivant.</p>
                </div>
              </div>
              <div class="report-module-list">
                ${modules.map(renderReportModuleCard).join('')}
              </div>
            </section>

            <section class="report-section" id="rapport-outils">
              <p class="section-label">Outils pratiques</p>
              <h2>Ce qui transforme le rapport en décisions</h2>
              <div class="report-tool-grid">
                ${tools.map(renderReportToolCard).join('')}
              </div>
            </section>

            <section class="report-section" id="rapport-preuves">
              <p class="section-label">Niveaux de preuve</p>
              <h2>Lire le fond avec le bon niveau de confiance</h2>
              <div class="evidence-grid">
                <article><strong>A</strong><p>Méta-analyses d’essais randomisés, revues systématiques solides, forte convergence.</p></article>
                <article><strong>B</strong><p>Méta-analyses observationnelles, cohortes longitudinales, mécanismes plausibles.</p></article>
                <article><strong>C</strong><p>Associations robustes mais causalité incertaine ou forte dépendance au contexte.</p></article>
                <article><strong>D</strong><p>Hypothèses mécanistiques, données préliminaires ou interprétations spéculatives.</p></article>
              </div>
            </section>
          </main>

          <aside class="report-rail">
            <strong>Navigation du rapport</strong>
            <nav>
              ${navItems.map((item) => `<a href="#/lire/rapport-complet/${item.id}" data-heading="${item.id}">${MarkdownRenderer.escapeHtml(item.label)}</a>`).join('')}
            </nav>
            <div class="report-rail-actions">
              <a class="button button-primary" href="#/lire/definir">Commencer</a>
              <a class="button button-secondary" href="#/guide">Guide complet</a>
            </div>
          </aside>
        </div>
      </section>
    `;

    scrollToAnchor(anchor);
  }

  function filterGuide(query) {
    const normalized = query.trim().toLowerCase();
    document.querySelectorAll('[data-guide-card]').forEach((card) => {
      const matchesSearch = !normalized || card.dataset.search.includes(normalized);
      const matchesTopic = !activeGuideFilter || card.dataset.guideTopic === activeGuideFilter;
      card.hidden = !matchesSearch || !matchesTopic;
    });
    document.querySelectorAll('[data-guide-group]').forEach((group) => {
      group.hidden = ![...group.querySelectorAll('[data-guide-card]')].some((card) => !card.hidden);
    });
  }

  function bindGuideFilters(input) {
    document.querySelectorAll('[data-guide-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        activeGuideFilter = button.dataset.guideFilter || '';
        document.querySelectorAll('[data-guide-filter]').forEach((item) => {
          item.setAttribute('aria-pressed', String((item.dataset.guideFilter || '') === activeGuideFilter));
        });
        filterGuide(input.value);
      });
    });
  }

  async function prepareGuideSearchIndex(input) {
    await Promise.all([...GUIDE_DOCS, ...UTILITY_DOCS].map(async (doc) => {
      try {
        const markdown = await loadDocument(doc);
        const card = document.querySelector(`[href="${Ui.docHref(doc)}"]`);
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
              ${Ui.breadcrumb([
                { label: 'Guide complet', href: '#/guide' },
                { label: readerGroupLabel(doc) },
                { label: doc.title }
              ])}
              <p class="reader-kicker">Guide détaillé</p>
              <h1>${MarkdownRenderer.escapeHtml(doc.title)}</h1>
              <p class="lead">${MarkdownRenderer.escapeHtml(doc.description)}</p>
              <div class="reader-actions">
                <a class="button button-secondary" href="#/guide">Retour au guide complet</a>
                <a class="button button-primary" href="#/questionnaire">Faire le questionnaire</a>
              </div>
              ${renderReaderNav(doc, 'top')}
            </header>
            <section class="reader-toc reader-toc-inline" aria-label="Plan de cette partie">
              <strong>Plan de cette partie</strong>
              <nav id="readerTocInline"></nav>
            </section>
            <div class="load-state" id="readerStatus">Chargement...</div>
            <div class="prose" id="readerContent"></div>
            ${renderReaderNav(doc, 'bottom')}
          </article>
          <aside class="reader-toc reader-toc-side">
            <strong>Plan de cette partie</strong>
            <nav id="readerTocSide"></nav>
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
      renderReaderTocs(doc.id);
      await renderMermaid();
      scrollToAnchor(anchor);
    } catch (error) {
      document.getElementById('readerStatus').outerHTML = '<div class="error-box">Le contenu n’a pas pu être chargé. Réessayez dans quelques instants.</div>';
    }
  }

  function renderReaderTocs(docId) {
    const tocs = [...document.querySelectorAll('#readerTocInline, #readerTocSide')];
    const headings = currentHeadings.filter((heading) => heading.level >= 2 && heading.level <= 3);
    const html = headings.length
      ? headings.map((heading) => `<a href="#/lire/${docId}/${heading.id}" data-heading="${heading.id}" data-level="${heading.level}">${MarkdownRenderer.escapeHtml(heading.text)}</a>`).join('')
      : '<span class="empty-state">Aucun sous-titre.</span>';
    tocs.forEach((toc) => {
      toc.innerHTML = html;
    });
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
        target.focus({ preventScroll: true });
        const previousScrollBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo({ left: 0, top: finalTop, behavior: 'auto' });
        document.documentElement.scrollTop = finalTop;
        document.body.scrollTop = finalTop;
        window.setTimeout(() => {
          document.documentElement.style.scrollBehavior = previousScrollBehavior;
        }, 0);
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

  function renderReadableHome() {
    setPageTitle('');
    app.innerHTML = `
      <section class="page home-page">
        <div class="hero hero-compact">
          <div>
            <p class="eyebrow">Guide pratique</p>
            <h1>Choisir quoi améliorer maintenant.</h1>
            <p class="lead">Un questionnaire, une synthèse courte, puis le rapport complet si vous voulez vérifier le fond.</p>
          </div>
        </div>

        <div class="action-grid priority-flow" aria-label="Entrées principales">
          <a class="entry-card is-primary" href="#/questionnaire">
            <span class="entry-number">1</span>
            <h2>Questionnaire</h2>
            <p>Repérer vos priorités et obtenir un plan 7 jours.</p>
            <span class="button button-primary">Commencer</span>
          </a>
          <a class="entry-card" href="#/synthese">
            <span class="entry-number">2</span>
            <h2>Synthèse</h2>
            <p>Comprendre les leviers majeurs sans tout lire.</p>
            <span class="button button-secondary">Lire</span>
          </a>
          <a class="entry-card" href="#/guide">
            <span class="entry-number">3</span>
            <h2>Guide complet</h2>
            <p>Vérifier les preuves, les limites et les détails.</p>
            <span class="button button-secondary">Approfondir</span>
          </a>
        </div>

        <section class="section-block compact-section">
          <div class="section-head">
            <div>
              <p class="section-label">Repères</p>
              <h2>Leviers prioritaires</h2>
            </div>
            <a class="button button-quiet" href="#/lire/variables">Voir les variables</a>
          </div>
          <ul class="pill-list">
            ${HOME_PRIORITIES.slice(0, 7).map((item) => `<li>${MarkdownRenderer.escapeHtml(item)}</li>`).join('')}
          </ul>
        </section>
      </section>
    `;
  }

  function renderReadableSynthesis() {
    setPageTitle('Synthèse');
    app.innerHTML = `
      <section class="page synthesis-page">
        <div class="hero hero-compact">
          <div>
            <p class="eyebrow">Comprendre vite</p>
            <h1>La synthèse utile.</h1>
            <p class="lead">Le bonheur durable dépend surtout de protections concrètes : corps, liens, autonomie, compétence, sens et sécurité.</p>
          </div>
        </div>

        <section class="section-block synthesis-actions">
          <div class="section-head">
            <div>
              <p class="section-label">Priorité</p>
              <h2>Actions à tester</h2>
            </div>
            <a class="button button-primary" href="#/questionnaire">Faire le questionnaire</a>
          </div>
          <ol class="compact-list action-list">
            ${SUMMARY_ACTIONS.slice(0, 5).map((item) => `<li>${MarkdownRenderer.escapeHtml(item)}</li>`).join('')}
          </ol>
        </section>

        <section class="section-block two-col">
          <article class="info-card">
            <p class="section-label">Idées clés</p>
            <h2>À retenir</h2>
            <ul class="compact-list">
              ${SUMMARY_INSIGHTS.slice(0, 3).map((item) => `<li>${MarkdownRenderer.escapeHtml(item)}</li>`).join('')}
            </ul>
          </article>
          <article class="info-card">
            <p class="section-label">Pièges</p>
            <h2>À éviter</h2>
            <ul class="compact-list">
              ${SUMMARY_ERRORS.slice(0, 4).map((item) => `<li>${MarkdownRenderer.escapeHtml(item)}</li>`).join('')}
            </ul>
          </article>
        </section>

        <section class="section-block compact-section">
          <div class="section-head">
            <div>
              <p class="section-label">Fond complet</p>
              <h2>Vérifier les preuves</h2>
            </div>
            <a class="button button-secondary" href="#/lire/synthese-detail">Lire la synthèse détaillée</a>
          </div>
        </section>
      </section>
    `;
  }

  function renderReadableGuide() {
    setPageTitle('Guide complet');
    const groups = [...new Set(GUIDE_DOCS.map((doc) => doc.group))];
    const filterGroups = [...groups, utilityGroupLabel];

    app.innerHTML = `
      <section class="page guide-page">
        <div class="hero hero-compact">
          <div>
            <p class="eyebrow">Lire le fond</p>
            <h1>Guide complet.</h1>
            <p class="lead">Ouvrez seulement la partie dont vous avez besoin.</p>
          </div>
        </div>

        <div class="guide-toolbar">
          <div class="search-field">
            <label for="guideSearch">Rechercher</label>
            <input id="guideSearch" type="search" placeholder="Sommeil, argent, relations...">
          </div>
        </div>

        <div class="guide-filter-tabs" aria-label="Filtrer les parties du guide">
          <button type="button" data-guide-filter="" aria-pressed="${activeGuideFilter === ''}">Tout</button>
          ${filterGroups.map((group) => `
            <button type="button" data-guide-filter="${MarkdownRenderer.escapeHtml(group)}" aria-pressed="${activeGuideFilter === group}">
              ${MarkdownRenderer.escapeHtml(group)}
            </button>
          `).join('')}
        </div>

        <div class="guide-groups" id="guideGroups">
          ${groups.map((group) => `
            <section class="guide-group" data-guide-group>
              <h2>${MarkdownRenderer.escapeHtml(group)}</h2>
              <div class="guide-grid">
                ${GUIDE_DOCS.filter((doc) => doc.group === group).map((doc) => Ui.guideCard(doc)).join('')}
              </div>
            </section>
          `).join('')}
          <section class="guide-group" data-guide-group>
            <h2>Outils</h2>
            <div class="guide-grid">
              ${UTILITY_DOCS.map((doc) => Ui.guideCard(doc, { group: utilityGroupLabel })).join('')}
            </div>
          </section>
        </div>
      </section>
    `;

    const input = document.getElementById('guideSearch');
    input.addEventListener('input', () => filterGuide(input.value));
    bindGuideFilters(input);
    prepareGuideSearchIndex(input);
  }

  function renderReadableReportHub(anchor = '') {
    const modules = getReportModules();
    const tools = [
      { kicker: 'Action', title: 'Questionnaire', description: 'Priorités et plan 7 jours.', href: '#/questionnaire' },
      { kicker: 'Suivi', title: 'Tableau de bord', description: 'Signaux hebdomadaires.', href: '#/tableau-de-bord' },
      { kicker: 'Choix', title: 'Matrice actions', description: 'Effort, preuve, délai.', href: '#/lire/matrice-actions' },
      { kicker: 'Preuves', title: 'Sources', description: 'Références et limites.', href: '#/sources' }
    ];
    const navItems = [
      { id: 'rapport-parcours', label: 'Parcours' },
      { id: 'rapport-parties', label: 'Parties' },
      { id: 'rapport-outils', label: 'Outils' },
      { id: 'rapport-preuves', label: 'Preuves' }
    ];

    currentHeadings = navItems.map((item) => ({ ...item, text: item.label, level: 2 }));
    setPageTitle('Rapport complet');

    app.innerHTML = `
      <section class="page report-page">
        <div class="report-layout">
          <main class="report-main">
            <header class="report-hero">
              ${Ui.breadcrumb([
                { label: 'Guide complet', href: '#/guide' },
                { label: 'Rapport complet' }
              ])}
              <p class="eyebrow">Rapport complet</p>
              <h1>Lire sans se perdre.</h1>
              <p class="lead">Neuf parties de fond, puis des outils pour décider.</p>
              <div class="reader-actions">
                <a class="button button-primary" href="#/lire/definir">Commencer</a>
                <a class="button button-secondary" href="#/questionnaire">Questionnaire</a>
              </div>
            </header>

            <details class="report-jump">
              <summary>Aller à une section</summary>
              <nav>
                ${navItems.map((item) => `<a href="#/lire/rapport-complet/${item.id}" data-heading="${item.id}">${MarkdownRenderer.escapeHtml(item.label)}</a>`).join('')}
              </nav>
            </details>

            <section class="report-section" id="rapport-parcours">
              <p class="section-label">Parcours</p>
              <h2>Choisir une entrée</h2>
              <div class="report-mode-grid">
                <a href="#/questionnaire" class="report-mode-card"><span>01</span><strong>Agir</strong><p>Questionnaire et plan court.</p></a>
                <a href="#/synthese" class="report-mode-card"><span>02</span><strong>Comprendre</strong><p>Synthèse avant lecture longue.</p></a>
                <a href="#/lire/definir" class="report-mode-card"><span>03</span><strong>Lire</strong><p>Rapport dans l’ordre.</p></a>
              </div>
            </section>

            <section class="report-section" id="rapport-parties">
              <p class="section-label">Parties</p>
              <h2>Structure</h2>
              <div class="report-module-list">
                ${modules.map((module) => `
                  <a class="report-module-card" href="${MarkdownRenderer.escapeHtml(module.href)}">
                    <div class="report-module-number">${MarkdownRenderer.escapeHtml(module.order)}</div>
                    <div>
                      <span>${MarkdownRenderer.escapeHtml(readerGroupLabel(module))}</span>
                      <h3>${MarkdownRenderer.escapeHtml(module.title)}</h3>
                      <p>${MarkdownRenderer.escapeHtml(module.description)}</p>
                    </div>
                  </a>
                `).join('')}
              </div>
            </section>

            <section class="report-section" id="rapport-outils">
              <p class="section-label">Outils</p>
              <h2>Passer à l’action</h2>
              <div class="report-tool-grid">
                ${tools.map(renderReportToolCard).join('')}
              </div>
            </section>

            <section class="report-section" id="rapport-preuves">
              <p class="section-label">Preuves</p>
              <h2>Niveau de confiance</h2>
              <div class="evidence-grid">
                <article><strong>A</strong><p>Revues solides, forte convergence.</p></article>
                <article><strong>B</strong><p>Cohortes, mécanismes plausibles.</p></article>
                <article><strong>C</strong><p>Associations robustes, causalité incertaine.</p></article>
                <article><strong>D</strong><p>Données préliminaires ou spéculatives.</p></article>
              </div>
            </section>
          </main>

          <aside class="report-rail">
            <strong>Navigation</strong>
            <nav>
              ${navItems.map((item) => `<a href="#/lire/rapport-complet/${item.id}" data-heading="${item.id}">${MarkdownRenderer.escapeHtml(item.label)}</a>`).join('')}
            </nav>
            <div class="report-rail-actions">
              <a class="button button-primary" href="#/lire/definir">Commencer</a>
              <a class="button button-secondary" href="#/guide">Guide</a>
            </div>
          </aside>
        </div>
      </section>
    `;

    scrollToAnchor(anchor);
  }

  async function renderRoute() {
    const current = route();
    updateActiveNav(current.page);
    closeNav();
    copyFocusReset();

    if (current.page === 'synthese') renderReadableSynthesis();
    else if (current.page === 'guide') renderReadableGuide();
    else if (current.page === 'questionnaire') {
      setPageTitle('Questionnaire');
      QuestionnaireApp.render(app);
    } else if (current.page === 'tableau-de-bord') await renderReader('tableau-de-bord', current.anchor);
    else if (current.page === 'sources') await renderReader('references', current.anchor);
    else if (current.page === 'lire' && current.docId === 'rapport-complet') renderReadableReportHub(current.anchor);
    else if (current.page === 'lire') await renderReader(current.docId, current.anchor);
    else renderReadableHome();

    if (!current.anchor && current.page !== 'lire') {
      const resetScroll = () => document.getElementById('top')?.scrollIntoView({ block: 'start' });
      window.setTimeout(resetScroll, 0);
      window.setTimeout(resetScroll, 80);
      window.setTimeout(resetScroll, 350);
    }

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
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    bind();
    renderRoute();
  }

  return { init };
})();

App.init();
