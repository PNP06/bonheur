const Ui = (() => {
  function escape(value) {
    return MarkdownRenderer.escapeHtml(value);
  }

  function docHref(doc) {
    return doc.route || `#/lire/${doc.id}`;
  }

  function compactText(value, limit = 96) {
    if (!value || value.length <= limit) {
      return value || '';
    }
    return `${value.slice(0, limit).trim()}...`;
  }

  function guideCard(doc, options = {}) {
    const group = options.group || doc.group || 'Outils complémentaires';
    const search = `${doc.title} ${doc.description}`.toLowerCase();
    const title = doc.shortTitle || doc.title;
    const description = compactText(doc.description);

    return `
      <a class="guide-card" href="${docHref(doc)}" data-guide-card data-guide-topic="${escape(group)}" data-search="${escape(search)}">
        <div class="guide-card-head">
          <p class="card-label">${escape(doc.order)}</p>
          <span class="guide-card-topic">${escape(group)}</span>
        </div>
        <h3>${escape(title)}</h3>
        <p>${escape(description)}</p>
      </a>
    `;
  }

  function breadcrumb(items) {
    return `
      <nav class="breadcrumb" aria-label="Fil d’Ariane">
        ${items.map((item, index) => {
          const current = index === items.length - 1;
          const label = escape(item.label);
          if (current || !item.href) {
            return `<span aria-current="${current ? 'page' : 'false'}">${label}</span>`;
          }
          return `<a href="${escape(item.href)}">${label}</a>`;
        }).join('')}
      </nav>
    `;
  }

  function readerStepNav({ previous, next, placement }) {
    if (!previous && !next) return '';

    return `
      <nav class="reader-step-nav reader-step-nav-${escape(placement)}" aria-label="Navigation entre les parties">
        ${previous ? `
          <a class="reader-step-link is-previous" href="${docHref(previous)}">
            <span>Partie précédente</span>
            <strong>${escape(previous.title)}</strong>
          </a>
        ` : '<span></span>'}
        ${next ? `
          <a class="reader-step-link is-next" href="${docHref(next)}">
            <span>Partie suivante</span>
            <strong>${escape(next.title)}</strong>
          </a>
        ` : '<span></span>'}
      </nav>
    `;
  }

  function contentUsageGrid(items) {
    return `
      <div class="content-usage-grid">
        ${items.map((item) => `
          <a class="content-usage-card" href="${escape(item.route)}">
            <span>${escape(item.role)}</span>
            <strong>${escape(item.title)}</strong>
            <p>${escape(item.description)}</p>
          </a>
        `).join('')}
      </div>
    `;
  }

  return {
    breadcrumb,
    contentUsageGrid,
    docHref,
    guideCard,
    readerStepNav
  };
})();
