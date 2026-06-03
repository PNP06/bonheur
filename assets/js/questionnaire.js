const QuestionnaireApp = (() => {
  const STORAGE_KEY = 'bonheur-questionnaire-v2';
  let currentIndex = 0;
  let copyMessage = '';

  function emptyState() {
    return {
      answers: Object.fromEntries(QUESTIONNAIRE_DOMAINS.map((domain) => [domain.id, Array(domain.questions.length).fill(null)])),
      skipped: {}
    };
  }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return parsed ? { ...emptyState(), ...parsed } : emptyState();
    } catch (error) {
      return emptyState();
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function getDomainScore(state, domain) {
    if (state.skipped[domain.id]) {
      return { skipped: true, answered: 0, total: domain.questions.length, score: null };
    }

    const answers = state.answers[domain.id] || [];
    const answeredValues = answers.filter((value) => Number.isInteger(value));
    const score = answeredValues.length
      ? answeredValues.reduce((sum, value) => sum + value, 0) / answeredValues.length
      : null;

    return {
      skipped: false,
      answered: answeredValues.length,
      total: domain.questions.length,
      complete: answeredValues.length === domain.questions.length,
      score
    };
  }

  function classify(score) {
    if (score === null) {
      return { label: 'à compléter', className: 'status-empty', priority: 99 };
    }
    if (score <= 1.4) {
      return { label: 'priorité rouge', className: 'status-red', priority: 1 };
    }
    if (score <= 2.4) {
      return { label: 'zone orange', className: 'status-orange', priority: 2 };
    }
    if (score <= 3.4) {
      return { label: 'acceptable', className: 'status-ok', priority: 3 };
    }
    return { label: 'protecteur', className: 'status-green', priority: 4 };
  }

  function getSummaries(state) {
    return QUESTIONNAIRE_DOMAINS.map((domain, index) => {
      const scoreInfo = getDomainScore(state, domain);
      const status = scoreInfo.skipped
        ? { label: 'ignoré', className: 'status-empty', priority: 100 }
        : classify(scoreInfo.score);

      return {
        ...domain,
        index,
        ...scoreInfo,
        status
      };
    });
  }

  function getCompletedSummaries(state) {
    return getSummaries(state)
      .filter((domain) => !domain.skipped && domain.complete && domain.score !== null);
  }

  function getPriorities(state) {
    return getCompletedSummaries(state)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);
  }

  function buildTextSummary(state) {
    const completed = getCompletedSummaries(state);
    const priorities = getPriorities(state);
    const protectors = completed.filter((domain) => domain.score >= 3.5);
    const lines = [
      'Synthèse personnelle du questionnaire - Guide opérationnel du bonheur',
      '',
      'Priorités probables :',
      ...(priorities.length
        ? priorities.map((domain, index) => `${index + 1}. ${domain.title} - ${domain.score.toFixed(1)}/4 - ${domain.actions}`)
        : ['Aucune priorité calculée : complétez au moins un domaine.']),
      '',
      'Domaines protecteurs :',
      ...(protectors.length
        ? protectors.map((domain) => `- ${domain.title} - ${domain.score.toFixed(1)}/4`)
        : ['Aucun domaine protecteur complet pour le moment.']),
      '',
      'Réévaluation recommandée : dans 2 à 4 semaines.'
    ];

    return lines.join('\n');
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
      // Fall through to the selection-based fallback.
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    return copied;
  }

  function renderDomainNav(summaries) {
    return `
      <div class="domain-nav" aria-label="Domaines du questionnaire">
        ${summaries.map((domain) => `
          <button type="button" data-domain-index="${domain.index}" class="${domain.complete ? 'is-complete' : ''} ${domain.skipped ? 'is-skipped' : ''}" aria-current="${domain.index === currentIndex}">
            ${domain.index + 1}
          </button>
        `).join('')}
      </div>
    `;
  }

  function renderScale(state, domain, questionIndex) {
    const current = state.answers[domain.id]?.[questionIndex];
    return `
      <div class="scale" role="group" aria-label="Échelle de réponse">
        ${SCALE_LABELS.map((label, value) => `
          <button type="button" data-answer-domain="${domain.id}" data-answer-question="${questionIndex}" data-answer-value="${value}" aria-pressed="${current === value}">
            <strong>${value}</strong>
            <span>${MarkdownRenderer.escapeHtml(label)}</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  function renderCurrentDomain(state, summaries) {
    const domain = summaries[currentIndex] || summaries[0];
    const rawDomain = QUESTIONNAIRE_DOMAINS[currentIndex];
    const scoreLabel = domain.score === null ? `${domain.answered}/${domain.total} réponses` : `${domain.score.toFixed(1)}/4`;

    return `
      <section class="domain-body">
        <div class="domain-title-row">
          <div>
            <p class="questionnaire-step">Domaine ${currentIndex + 1}/${QUESTIONNAIRE_DOMAINS.length}</p>
            <h2>${MarkdownRenderer.escapeHtml(rawDomain.title)}</h2>
            <p class="lead">${rawDomain.optional ? 'Domaine optionnel : ignorez-le si la question n’est pas pertinente actuellement.' : 'Répondez selon votre situation des derniers jours ou semaines.'}</p>
          </div>
          <span class="status-badge ${domain.status.className}">${domain.status.label} · ${scoreLabel}</span>
        </div>

        ${rawDomain.optional ? `
          <label class="skip-row">
            <input type="checkbox" data-skip-domain="${rawDomain.id}" ${state.skipped[rawDomain.id] ? 'checked' : ''}>
            Ignorer ce domaine pour cette synthèse.
          </label>
        ` : ''}

        <div class="question-list">
          ${rawDomain.questions.map((question, questionIndex) => `
            <article class="question-card">
              <p>${questionIndex + 1}. ${MarkdownRenderer.escapeHtml(question)}</p>
              ${renderScale(state, rawDomain, questionIndex)}
            </article>
          `).join('')}
        </div>

        <div class="domain-actions">
          <strong>Actions si ce domaine ressort bas</strong>
          <p>${MarkdownRenderer.escapeHtml(rawDomain.actions)}</p>
        </div>
      </section>
    `;
  }

  function renderResults(state, summaries) {
    const priorities = getPriorities(state);
    const protectors = getCompletedSummaries(state).filter((domain) => domain.score >= 3.5);
    const completedCount = getCompletedSummaries(state).length;

    return `
      <aside class="questionnaire-results" aria-label="Synthèse du questionnaire">
        <p class="section-label">Synthèse</p>
        <h2>${completedCount}/${QUESTIONNAIRE_DOMAINS.length} domaines complétés</h2>
        <p>Les résultats donnent une orientation pratique, pas un diagnostic.</p>

        <div class="score-list">
          ${summaries.map((domain) => `
            <div class="score-item">
              <div>
                <strong>${MarkdownRenderer.escapeHtml(domain.title)}</strong>
                <span>${domain.skipped ? 'Non pris en compte' : `${domain.answered}/${domain.total} réponses`}</span>
              </div>
              <span class="score-value">${domain.score === null ? '—' : domain.score.toFixed(1)}</span>
            </div>
          `).join('')}
        </div>

        <section class="result-section">
          <h3>Vos priorités probables</h3>
          ${priorities.length ? `
            <ol>
              ${priorities.map((domain) => `<li><strong>${MarkdownRenderer.escapeHtml(domain.title)}</strong> · ${domain.score.toFixed(1)}/4<br>${MarkdownRenderer.escapeHtml(domain.actions)}</li>`).join('')}
            </ol>
          ` : '<p>Complétez au moins un domaine pour obtenir une priorité.</p>'}
        </section>

        <section class="result-section">
          <h3>Domaines protecteurs</h3>
          ${protectors.length ? `
            <ul>${protectors.map((domain) => `<li>${MarkdownRenderer.escapeHtml(domain.title)} · ${domain.score.toFixed(1)}/4</li>`).join('')}</ul>
          ` : '<p>Aucun domaine protecteur complet pour le moment.</p>'}
        </section>

        <section class="result-section">
          <h3>Premières actions recommandées</h3>
          <p>Choisissez une à trois actions maximum, puis réévaluez dans 2 à 4 semaines.</p>
          <div class="reader-actions">
            <button class="button button-primary" type="button" data-copy-summary>Copier ma synthèse</button>
            <button class="button button-secondary" type="button" data-download-summary>Télécharger ma synthèse</button>
            <button class="button button-quiet" type="button" data-reset-questionnaire>Réinitialiser</button>
          </div>
          <p class="copy-status" aria-live="polite">${MarkdownRenderer.escapeHtml(copyMessage)}</p>
        </section>
      </aside>
    `;
  }

  function render(container) {
    const state = loadState();
    const summaries = getSummaries(state);
    const answered = summaries.reduce((sum, domain) => sum + domain.answered, 0);
    const total = QUESTIONNAIRE_DOMAINS.reduce((sum, domain) => sum + domain.questions.length, 0);
    const progress = Math.round((answered / total) * 100);

    container.innerHTML = `
      <section class="page">
        <div class="hero">
          <div>
            <p class="eyebrow">Auto-orientation opérationnelle</p>
            <h1>Faire le questionnaire</h1>
            <p class="lead">Répondez domaine par domaine. L’objectif est de repérer les facteurs qui pèsent le plus aujourd’hui, puis de choisir peu d’actions, mesurables, à réévaluer dans 2 à 4 semaines.</p>
          </div>
          <aside class="hero-panel">
            <strong>Échelle de réponse</strong>
            <p>0 = très défavorable · 1 = fragile · 2 = moyen · 3 = plutôt favorable · 4 = solide / protecteur.</p>
          </aside>
        </div>

        <div class="questionnaire-layout">
          <div class="questionnaire-main">
            <div class="questionnaire-intro">
              <p class="questionnaire-step">Progression globale</p>
              <h2>${progress}% répondu</h2>
              <p>Les réponses sont conservées uniquement dans votre navigateur.</p>
              <div class="progress-track" aria-hidden="true"><span style="width: ${progress}%"></span></div>
            </div>
            ${renderDomainNav(summaries)}
            ${renderCurrentDomain(state, summaries)}
            <div class="questionnaire-controls">
              <button class="button button-secondary" type="button" data-prev-domain ${currentIndex === 0 ? 'disabled' : ''}>Précédent</button>
              <button class="button button-primary" type="button" data-next-domain ${currentIndex === QUESTIONNAIRE_DOMAINS.length - 1 ? 'disabled' : ''}>Domaine suivant</button>
            </div>
          </div>
          ${renderResults(state, summaries)}
        </div>
      </section>
    `;

    bind(container, state);
  }

  function bind(container, state) {
    container.querySelectorAll('[data-answer-domain]').forEach((button) => {
      button.addEventListener('click', () => {
        const domainId = button.dataset.answerDomain;
        const questionIndex = Number(button.dataset.answerQuestion);
        const value = Number(button.dataset.answerValue);
        state.answers[domainId][questionIndex] = value;
        state.skipped[domainId] = false;
        copyMessage = '';
        saveState(state);
        render(container);
      });
    });

    container.querySelectorAll('[data-domain-index]').forEach((button) => {
      button.addEventListener('click', () => {
        currentIndex = Number(button.dataset.domainIndex);
        copyMessage = '';
        render(container);
      });
    });

    container.querySelector('[data-prev-domain]')?.addEventListener('click', () => {
      currentIndex = Math.max(0, currentIndex - 1);
      copyMessage = '';
      render(container);
    });

    container.querySelector('[data-next-domain]')?.addEventListener('click', () => {
      currentIndex = Math.min(QUESTIONNAIRE_DOMAINS.length - 1, currentIndex + 1);
      copyMessage = '';
      render(container);
    });

    container.querySelector('[data-skip-domain]')?.addEventListener('change', (event) => {
      state.skipped[event.target.dataset.skipDomain] = event.target.checked;
      copyMessage = '';
      saveState(state);
      render(container);
    });

    container.querySelector('[data-reset-questionnaire]')?.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      currentIndex = 0;
      copyMessage = 'Réponses réinitialisées.';
      render(container);
    });

    container.querySelector('[data-copy-summary]')?.addEventListener('click', async () => {
      const text = buildTextSummary(state);
      try {
        copyMessage = await copyText(text) ? 'Synthèse copiée.' : 'Copie indisponible. Utilisez le téléchargement.';
      } catch (error) {
        copyMessage = 'Copie indisponible. Utilisez le téléchargement.';
      }
      render(container);
    });

    container.querySelector('[data-download-summary]')?.addEventListener('click', () => {
      const blob = new Blob([buildTextSummary(state)], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'synthese-questionnaire-bonheur.txt';
      link.click();
      URL.revokeObjectURL(url);
      copyMessage = 'Téléchargement préparé.';
      render(container);
    });
  }

  return { render, getSummaries, loadState, classify };
})();
