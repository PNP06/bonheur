const ArtHeureuxApp = (() => {
  const DATA_PATHS = {
    adult: 'Artheureux/data/adult.json',
    youth: 'Artheureux/data/youth.json',
    paths: 'Artheureux/data/reader-paths.json',
    downloads: 'Artheureux/data/downloads.json'
  };

  const EDITIONS = {
    adult: {
      route: 'adulte',
      label: 'Édition adulte',
      audience: 'Pour une lecture personnelle et approfondie',
      download: 'downloads/artheureux-adulte.pdf'
    },
    youth: {
      route: 'jeunesse',
      label: 'Édition 10–15 ans',
      audience: 'Pour réfléchir au collège, en famille ou seul',
      download: 'downloads/artheureux-jeunesse.pdf'
    }
  };

  let dataPromise;
  const randomRuleByEdition = new Map();

  function escape(value) {
    return MarkdownRenderer.escapeHtml(String(value ?? ''));
  }

  async function loadJson(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error('Contenu indisponible');
    return response.json();
  }

  function loadData() {
    if (!dataPromise) {
      dataPromise = Promise.all([
        loadJson(DATA_PATHS.adult),
        loadJson(DATA_PATHS.youth),
        loadJson(DATA_PATHS.paths),
        loadJson(DATA_PATHS.downloads)
      ]).then(([adult, youth, paths, downloads]) => ({
        adult,
        youth,
        paths,
        pdfAvailable: {
          adult: Boolean(downloads.adult?.available),
          youth: Boolean(downloads.youth?.available)
        }
      }));
    }
    return dataPromise;
  }

  function editionFromRoute(segment) {
    return segment === 'jeunesse' || segment === 'youth' ? 'youth' : 'adult';
  }

  function ruleNumberFromId(id) {
    return Number(String(id).replace('rule-', ''));
  }

  function ruleRoute(edition, rule) {
    return `#/art-heureux/${EDITIONS[edition].route}/regle/${rule.order}`;
  }

  function imagePath(rule) {
    if (rule.image?.status !== 'ready') return '';
    if (rule.image.web_path) return `Artheureux/${rule.image.web_path}`;
    return '';
  }

  function findEntry(paths, entryId) {
    for (const category of paths.categories) {
      const entry = category.entries.find((item) => item.id === entryId);
      if (entry) return { category, entry };
    }
    return null;
  }

  function chooseRandomRule(rules, edition, excludeId = '') {
    const pool = rules.filter((rule) => rule.id !== excludeId);
    const chosen = pool[Math.floor(Math.random() * pool.length)] || rules[0];
    randomRuleByEdition.set(edition, chosen.id);
    return chosen;
  }

  function currentRandomRule(rules, edition) {
    const id = randomRuleByEdition.get(edition);
    return rules.find((rule) => rule.id === id) || chooseRandomRule(rules, edition);
  }

  function renderEditionTabs(edition, anchor = '') {
    return `
      <nav class="art-edition-tabs" aria-label="Choisir une édition">
        ${Object.entries(EDITIONS).map(([id, item]) => `
          <a href="#/art-heureux/${item.route}${anchor ? `/${escape(anchor)}` : ''}" ${id === edition ? 'aria-current="page"' : ''}>
            <strong>${escape(item.label)}</strong>
            <span>${escape(item.audience)}</span>
          </a>
        `).join('')}
      </nav>
    `;
  }

  function renderFeelingSelect(paths, selectedId = '') {
    return `
      <label for="artFeelingSelect">Choisir ce qui correspond le mieux</label>
      <select id="artFeelingSelect">
        <option value="">Sélectionner un ressenti ou une situation…</option>
        ${paths.categories.map((category) => `
          <optgroup label="${escape(category.label)}">
            ${category.entries.map((entry) => `
              <option value="${escape(entry.id)}" ${entry.id === selectedId ? 'selected' : ''}>${escape(entry.label)}</option>
            `).join('')}
          </optgroup>
        `).join('')}
      </select>
    `;
  }

  function renderThemeLinks(paths, edition, selectedId = '') {
    return paths.themes.map((theme) => `
      <a class="art-theme-chip" href="#/art-heureux/${EDITIONS[edition].route}/theme/${escape(theme.id)}"
        ${theme.id === selectedId ? 'aria-current="true"' : ''}>${escape(theme.label)}</a>
    `).join('');
  }

  function renderCategoryLinks(paths, edition, selectedId = '') {
    return paths.categories.map((category) => `
      <a class="art-theme-chip" href="#/art-heureux/${EDITIONS[edition].route}/categorie/${escape(category.id)}"
        ${category.id === selectedId ? 'aria-current="true"' : ''}>${escape(category.label)}</a>
    `).join('');
  }

  function renderRuleCard(rule, edition, context = '') {
    const themes = (rule.themes || []).slice(0, 2);
    return `
      <article class="art-rule-card">
        <div class="art-rule-card-head">
          <span>Règle ${String(rule.order).padStart(2, '0')}</span>
          ${rule.status !== 'ready' ? '<small>En préparation</small>' : (context ? `<small>${escape(context)}</small>` : '')}
        </div>
        <h3>${escape(rule.title)}</h3>
        <p>${escape(rule.key_phrase)}</p>
        ${themes.length ? `<ul aria-label="Thèmes">${themes.map((theme) => `<li>${escape(theme)}</li>`).join('')}</ul>` : ''}
        <a class="art-card-link" href="${ruleRoute(edition, rule)}">Lire cette règle <span aria-hidden="true">→</span></a>
      </article>
    `;
  }

  function renderRandomCard(rule, edition) {
    return `
      <article class="art-random-card" id="artRandomCard">
        <div>
          <p class="section-label">Une règle au hasard</p>
          <span class="art-rule-number">${String(rule.order).padStart(2, '0')}</span>
          <h2>${escape(rule.title)}</h2>
          <p>${escape(rule.key_phrase)}</p>
        </div>
        <div class="art-random-actions">
          <a class="button button-primary" href="${ruleRoute(edition, rule)}">Lire la règle</a>
          <button class="button button-secondary" type="button" data-art-action="random">En tirer une autre</button>
        </div>
      </article>
    `;
  }

  function renderSelectionResults(rules, edition, paths, mode, selectedId) {
    if (!selectedId) return '';

    let title = '';
    let description = '';
    let supportNotice = false;
    let selectedRules = [];

    if (mode === 'ressenti') {
      const found = findEntry(paths, selectedId);
      if (!found) return '';
      title = found.entry.label;
      description = `Quelques règles à lire pour prendre du recul sur « ${found.entry.label.toLowerCase()} ».`;
      supportNotice = Boolean(found.entry.support_notice);
      selectedRules = found.entry.rule_ids
        .map((id) => rules.find((rule) => rule.id === id))
        .filter(Boolean);
    } else if (mode === 'categorie') {
      const category = paths.categories.find((item) => item.id === selectedId);
      if (!category) return '';
      title = category.label;
      description = `Toutes les règles associées aux situations du thème « ${category.label} ».`;
      supportNotice = category.entries.some((entry) => entry.support_notice);
      const ruleIds = [...new Set(category.entries.flatMap((entry) => entry.rule_ids))];
      selectedRules = ruleIds
        .map((id) => rules.find((rule) => rule.id === id))
        .filter(Boolean);
    } else if (mode === 'theme') {
      const theme = paths.themes.find((item) => item.id === selectedId);
      if (!theme) return '';
      title = theme.label;
      description = 'Les règles dont ce thème constitue l’un des fils directeurs.';
      selectedRules = rules.filter((rule) =>
        (rule.themes || []).some((item) => item === theme.rule_theme)
      );
    }

    return `
      <section class="art-results" aria-live="polite" aria-labelledby="artResultsTitle">
        <div class="section-head">
          <div>
            <p class="section-label">Parcours conseillé</p>
            <h2 id="artResultsTitle">${escape(title)}</h2>
            <p>${escape(description)}</p>
          </div>
          <span class="art-result-count">${selectedRules.length} règle${selectedRules.length > 1 ? 's' : ''}</span>
        </div>
        ${supportNotice ? `
          <p class="art-support-notice"><strong>Un appui, pas un diagnostic.</strong> Si ce que vous vivez devient intense, durable ou dangereux, parlez-en à une personne de confiance ou à un professionnel.</p>
        ` : ''}
        <div class="art-rule-grid">
          ${selectedRules.map((rule) => renderRuleCard(rule, edition, title)).join('')}
        </div>
      </section>
    `;
  }

  function renderRuleDetail(rule, rules, edition) {
    if (!rule) {
      return `
        <section class="art-empty-state">
          <h1>Règle introuvable</h1>
          <p>Cette règle n’existe pas dans l’édition choisie.</p>
          <a class="button button-primary" href="#/art-heureux/${EDITIONS[edition].route}">Voir les 50 règles</a>
        </section>
      `;
    }

    const previous = rules.find((item) => item.order === rule.order - 1);
    const next = rules.find((item) => item.order === rule.order + 1);
    const visual = imagePath(rule);

    return `
      <article class="art-rule-detail">
        <header class="art-rule-detail-head">
          <div>
            <p class="section-label">Règle ${String(rule.order).padStart(2, '0')} sur 50 · ${escape(EDITIONS[edition].label)}</p>
            <h1>${escape(rule.title)}</h1>
            ${rule.status !== 'ready' ? '<p class="art-draft-badge">Contenu en préparation</p>' : ''}
            ${(rule.themes || []).length ? `<ul class="art-detail-themes">${rule.themes.map((theme) => `<li>${escape(theme)}</li>`).join('')}</ul>` : ''}
          </div>
          ${visual ? `<img src="${escape(visual)}" alt="${escape(rule.image.alt)}">` : ''}
        </header>

        <section class="art-rule-block">
          <p class="art-block-label">Résumé de la règle</p>
          <p>${escape(rule.summary)}</p>
        </section>
        <section class="art-rule-block art-rule-example">
          <p class="art-block-label">Exemple pratique</p>
          <p>${escape(rule.example)}</p>
        </section>
        <section class="art-rule-block">
          <p class="art-block-label">Conseils d’application</p>
          <ol>${rule.advice.map((item) => `<li>${escape(item)}</li>`).join('')}</ol>
        </section>
        <blockquote class="art-key-phrase">
          <p>${escape(rule.key_phrase)}</p>
        </blockquote>
        <section class="art-rule-block">
          <p class="art-block-label">Questions à se poser</p>
          <ol>${rule.questions.map((item) => `<li>${escape(item)}</li>`).join('')}</ol>
        </section>

        <footer class="art-rule-source">
          <strong>Point de départ philosophique</strong>
          <p>${escape(rule.source?.work)} · ${escape(rule.source?.section)}</p>
          <small>Adaptation pratique originale ; la phrase clé n’est pas une citation de Schopenhauer.</small>
        </footer>

        <nav class="art-rule-pagination" aria-label="Navigation entre les règles">
          ${previous ? `<a href="${ruleRoute(edition, previous)}"><span>Règle précédente</span><strong>${escape(previous.title)}</strong></a>` : '<span></span>'}
          ${next ? `<a href="${ruleRoute(edition, next)}"><span>Règle suivante</span><strong>${escape(next.title)}</strong></a>` : '<span></span>'}
        </nav>
      </article>
    `;
  }

  function bind(container, data, edition, current) {
    const select = container.querySelector('#artFeelingSelect');
    select?.addEventListener('change', () => {
      if (!select.value) {
        window.location.hash = `#/art-heureux/${EDITIONS[edition].route}`;
        return;
      }
      window.location.hash = `#/art-heureux/${EDITIONS[edition].route}/ressenti/${select.value}`;
    });

    container.querySelectorAll('[data-art-action="random"]').forEach((button) => {
      button.addEventListener('click', () => {
        const rules = data[edition].rules;
        const previous = randomRuleByEdition.get(edition) || '';
        chooseRandomRule(rules, edition, previous);
        render(container, current);
      });
    });
  }

  async function render(container, current) {
    container.innerHTML = `
      <section class="page art-page art-loading" aria-live="polite">
        <p>Chargement des règles…</p>
      </section>
    `;

    try {
      const data = await loadData();
      const edition = editionFromRoute(current.docId);
      const editionData = data[edition];
      const rules = editionData.rules;
      const segments = String(current.anchor || '').split('/').filter(Boolean);
      const mode = segments[0] || '';
      const selectedId = segments[1] || '';
      const selectedFeeling = mode === 'ressenti' ? selectedId : '';
      const selectedCategory = mode === 'categorie' ? selectedId : '';
      const selectedTheme = mode === 'theme' ? selectedId : '';
      const selectedRule = mode === 'regle'
        ? rules.find((rule) => rule.order === Number(selectedId))
        : null;
      const editionAnchor = ['ressenti', 'categorie', 'theme', 'regle'].includes(mode) && selectedId
        ? `${mode}/${selectedId}`
        : '';
      const randomRule = currentRandomRule(rules, edition);

      container.innerHTML = `
        <section class="page art-page">
          <div class="art-topline">
            <a href="#/art-heureux/${EDITIONS[edition].route}" class="art-back-link">L’Art d’être heureux</a>
            ${data.pdfAvailable[edition]
              ? `<a class="button button-secondary art-download" href="${EDITIONS[edition].download}" download>Télécharger le PDF</a>`
              : '<span class="button button-secondary art-download is-disabled" aria-disabled="true">PDF en préparation</span>'}
          </div>

          ${renderEditionTabs(edition, editionAnchor)}

          ${mode === 'regle' ? renderRuleDetail(selectedRule, rules, edition) : `
            <header class="art-hero">
              <div>
                <p class="eyebrow">50 règles pour regarder sa vie autrement</p>
                <h1>L’Art d’être heureux</h1>
                <p class="lead">Une adaptation pratique et originale de la pensée de Schopenhauer : choisissez ce que vous traversez, explorez un thème ou laissez une règle vous surprendre.</p>
              </div>
              <aside>
                <span>Édition active</span>
                <strong>${escape(EDITIONS[edition].label)}</strong>
                <p>${escape(EDITIONS[edition].audience)}</p>
              </aside>
            </header>

            <section class="art-orientation" aria-labelledby="artOrientationTitle">
              <div class="section-head">
                <div>
                  <p class="section-label">Commencer par votre situation</p>
                  <h2 id="artOrientationTitle">Qu’est-ce qui vous préoccupe aujourd’hui&nbsp;?</h2>
                  <p>Choisissez un ressenti, un choix difficile ou un événement. Vous obtiendrez quelques règles à lire, pas une étiquette.</p>
                </div>
              </div>
              <div class="art-feeling-control">
                ${renderFeelingSelect(data.paths, selectedFeeling)}
              </div>
              <div class="art-theme-panel">
                <p><strong>Ou choisir un grand thème de vie</strong></p>
                <div class="art-theme-list">${renderCategoryLinks(data.paths, edition, selectedCategory)}</div>
              </div>
              <div class="art-theme-panel">
                <p><strong>Ou suivre un fil philosophique</strong></p>
                <div class="art-theme-list">${renderThemeLinks(data.paths, edition, selectedTheme)}</div>
              </div>
            </section>

            ${renderSelectionResults(rules, edition, data.paths, mode, selectedId)}
            ${renderRandomCard(randomRule, edition)}

            <section class="art-library" aria-labelledby="artLibraryTitle">
              <div class="section-head">
                <div>
                  <p class="section-label">La collection complète</p>
                  <h2 id="artLibraryTitle">Les 50 règles</h2>
                  <p>Chaque règle suit le même plan : idée, exemple, conseils, phrase clé et questions.</p>
                </div>
              </div>
              <div class="art-rule-grid">
                ${rules.map((rule) => renderRuleCard(rule, edition)).join('')}
              </div>
            </section>
          `}
        </section>
      `;

      bind(container, data, edition, current);
    } catch (error) {
      container.innerHTML = `
        <section class="page art-empty-state">
          <h1>Les règles ne sont pas disponibles</h1>
          <p>Le contenu n’a pas pu être chargé. Réessayez dans quelques instants.</p>
          <a class="button button-primary" href="#/accueil">Revenir à l’accueil</a>
        </section>
      `;
    }
  }

  return { render };
})();
