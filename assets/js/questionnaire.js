const QuestionnaireApp = (() => {
  const STORAGE_KEY = 'bonheur-questionnaire-v3';
  const MIN_ANSWERS_FOR_GUIDANCE = 3;
  let currentIndex = 0;
  let copyMessage = '';

  function emptyState() {
    return {
      answers: Object.fromEntries(QUESTIONNAIRE_DOMAINS.map((domain) => [domain.id, Array(domain.questions.length).fill(null)])),
      skipped: {}
    };
  }

  function normalizeAnswers(state) {
    const fresh = emptyState();
    QUESTIONNAIRE_DOMAINS.forEach((domain) => {
      const values = Array.isArray(state.answers?.[domain.id]) ? state.answers[domain.id] : [];
      fresh.answers[domain.id] = domain.questions.map((_, index) => {
        const value = values[index];
        return Number.isInteger(value) && value >= 0 && value <= 4 ? value : null;
      });
      fresh.skipped[domain.id] = Boolean(state.skipped?.[domain.id]);
    });
    return fresh;
  }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return parsed ? normalizeAnswers(parsed) : emptyState();
    } catch (error) {
      return emptyState();
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeAnswers(state)));
  }

  function getDomainScore(state, domain) {
    if (state.skipped[domain.id]) {
      return { skipped: true, answered: 0, total: domain.questions.length, complete: false, score: null };
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

  function getGuidanceCandidates(state) {
    return getSummaries(state)
      .filter((domain) => !domain.skipped && domain.score !== null && domain.answered >= MIN_ANSWERS_FOR_GUIDANCE)
      .sort((a, b) => {
        if (a.complete !== b.complete) {
          return a.complete ? -1 : 1;
        }
        return a.score - b.score;
      });
  }

  function getPriorities(state) {
    return getGuidanceCandidates(state)
      .filter((domain) => domain.score <= 2.6)
      .slice(0, 3);
  }

  function getProtectors(state) {
    return getCompletedSummaries(state)
      .filter((domain) => domain.score >= 3.5)
      .sort((a, b) => b.score - a.score);
  }

  function getConsolidations(state) {
    return getCompletedSummaries(state)
      .filter((domain) => domain.score >= 2.5 && domain.score < 3.5)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);
  }

  function getActionPlan(state) {
    const priorities = getPriorities(state);
    const source = priorities.length
      ? priorities
      : getGuidanceCandidates(state).filter((domain) => domain.score < 3.5).slice(0, 2);

    return source.flatMap((domain) => {
      const actionCount = domain.score <= 1.4 ? 2 : 1;
      return (domain.primaryActions || [domain.actions])
        .slice(0, actionCount)
        .map((action) => ({ domain, action }));
    }).slice(0, 5);
  }

  function statusText(domain) {
    if (domain.skipped) {
      return 'non pris en compte';
    }
    if (domain.score === null) {
      return `${domain.answered}/${domain.total} réponses`;
    }
    const suffix = domain.complete ? '' : ' provisoire';
    return `${domain.score.toFixed(1)}/4 · ${domain.status.label}${suffix}`;
  }

  function shortStatusText(domain) {
    if (domain.skipped) {
      return 'ignoré';
    }
    if (domain.score === null) {
      return `${domain.answered}/${domain.total}`;
    }
    return `${domain.score.toFixed(1)}/4`;
  }

  function setCurrentDomainIndex(index) {
    currentIndex = Math.min(Math.max(0, index), QUESTIONNAIRE_DOMAINS.length - 1);
  }

  function buildTextSummary(state) {
    const priorities = getPriorities(state);
    const actionPlan = getActionPlan(state);
    const protectors = getProtectors(state);
    const consolidations = getConsolidations(state);
    const lines = [
      'Synthèse personnelle du questionnaire - Guide opérationnel du bonheur',
      '',
      'Priorités probables :',
      ...(priorities.length
        ? priorities.map((domain, index) => `${index + 1}. ${domain.title} - ${statusText(domain)}`)
        : ['Aucune priorité calculée : complétez au moins 3 réponses dans un domaine.']),
      '',
      'Actions à essayer cette semaine :',
      ...(actionPlan.length
        ? actionPlan.map(({ domain, action }) => `- ${domain.title} : ${action}`)
        : ['Complétez davantage le questionnaire pour obtenir un plan d’action.']),
      '',
      'À maintenir :',
      ...(protectors.length
        ? protectors.map((domain) => `- ${domain.title} - ${domain.score.toFixed(1)}/4 : ${domain.maintain}`)
        : ['Aucun domaine protecteur complet pour le moment.']),
      '',
      'À consolider :',
      ...(consolidations.length
        ? consolidations.map((domain) => `- ${domain.title} - ${domain.score.toFixed(1)}/4 : ${domain.maintain}`)
        : ['Aucun domaine en consolidation pour le moment.']),
      '',
      'Lecture prudente : cette synthèse sert à orienter l’action. Elle ne constitue pas un diagnostic médical.',
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
      <label class="domain-select-row">
        <span>Domaine</span>
        <select data-domain-select aria-label="Choisir un domaine du questionnaire">
          ${summaries.map((domain) => `
            <option value="${domain.index}" ${domain.index === currentIndex ? 'selected' : ''}>
              ${domain.index + 1}. ${MarkdownRenderer.escapeHtml(domain.title)} · ${MarkdownRenderer.escapeHtml(shortStatusText(domain))}
            </option>
          `).join('')}
        </select>
      </label>
      <div class="domain-nav" aria-label="Domaines du questionnaire">
        ${summaries.map((domain) => `
          <button
            type="button"
            data-domain-index="${domain.index}"
            class="${domain.complete ? 'is-complete' : ''} ${domain.skipped ? 'is-skipped' : ''}"
            aria-current="${domain.index === currentIndex}"
            title="${MarkdownRenderer.escapeHtml(domain.title)} · ${MarkdownRenderer.escapeHtml(statusText(domain))}"
          >
            ${domain.index + 1}
          </button>
        `).join('')}
      </div>
    `;
  }

  function renderScale(state, domain, questionIndex) {
    const current = state.answers[domain.id]?.[questionIndex];
    return `
      <div class="scale-wrap">
        <div class="scale" role="group" aria-label="Échelle de réponse pour la question ${questionIndex + 1}">
          ${SCALE_LABELS.map((label, value) => `
            <button
              type="button"
              data-answer-domain="${domain.id}"
              data-answer-question="${questionIndex}"
              data-answer-value="${value}"
              aria-label="${value} - ${MarkdownRenderer.escapeHtml(label)}"
              aria-pressed="${current === value}"
            >
              <strong>${value}</strong>
              <span>${MarkdownRenderer.escapeHtml(label)}</span>
            </button>
          `).join('')}
        </div>
        <div class="scale-hints" aria-hidden="true">
          <span>0 · défavorable</span>
          <span>4 · solide</span>
        </div>
      </div>
    `;
  }

  function renderCurrentDomain(state, summaries) {
    const domain = summaries[currentIndex] || summaries[0];
    const rawDomain = QUESTIONNAIRE_DOMAINS[currentIndex];
    const scoreLabel = statusText(domain);
    const domainProgress = Math.round((domain.answered / domain.total) * 100);

    return `
      <section class="domain-body">
        <div class="domain-title-row">
          <div>
            <p class="questionnaire-step">Domaine ${currentIndex + 1}/${QUESTIONNAIRE_DOMAINS.length}</p>
            <h2>${MarkdownRenderer.escapeHtml(rawDomain.title)}</h2>
            <p class="domain-focus">${MarkdownRenderer.escapeHtml(rawDomain.focus)}</p>
            <p class="lead">${rawDomain.optional ? 'Domaine optionnel : ignorez-le si la question n’est pas pertinente actuellement.' : 'Répondez selon votre situation réelle des derniers jours ou semaines.'}</p>
          </div>
          <span class="status-badge ${domain.status.className}" title="${MarkdownRenderer.escapeHtml(scoreLabel)}">${MarkdownRenderer.escapeHtml(shortStatusText(domain))}</span>
        </div>

        <div class="domain-meter" aria-label="${domain.answered}/${domain.total} réponses dans ce domaine">
          <span>${domain.answered}/${domain.total} réponses</span>
          <div class="progress-track" aria-hidden="true"><span style="width: ${domainProgress}%"></span></div>
        </div>

        ${rawDomain.optional ? `
          <label class="skip-row">
            <input type="checkbox" data-skip-domain="${rawDomain.id}" ${state.skipped[rawDomain.id] ? 'checked' : ''}>
            Ignorer ce domaine pour cette synthèse.
          </label>
        ` : ''}

        <div class="question-list">
          ${rawDomain.questions.map((question, questionIndex) => {
            const questionAnswered = Number.isInteger(state.answers[rawDomain.id]?.[questionIndex]);
            return `
              <article class="question-card ${questionAnswered ? 'is-answered' : ''}" data-question-card="${rawDomain.id}-${questionIndex}">
                <p><span>${questionIndex + 1}</span>${MarkdownRenderer.escapeHtml(question)}</p>
                ${renderScale(state, rawDomain, questionIndex)}
              </article>
            `;
          }).join('')}
        </div>

        <div class="domain-help-grid">
          <div class="domain-actions">
            <strong>Si ce domaine ressort bas</strong>
            <p>${MarkdownRenderer.escapeHtml(rawDomain.primaryActions?.[0] || rawDomain.actions)}</p>
          </div>
          <div class="domain-actions domain-actions-maintain">
            <strong>Si ce domaine est solide</strong>
            <p>${MarkdownRenderer.escapeHtml(rawDomain.maintain)}</p>
          </div>
        </div>
      </section>
    `;
  }

  function renderActionPlan(actionPlan) {
    if (!actionPlan.length) {
      return `
        <p>Répondez à au moins 3 questions dans un domaine pour obtenir des actions ciblées.</p>
      `;
    }

    return `
      <div class="action-plan">
        ${actionPlan.map(({ domain, action }, index) => `
          <article class="action-card">
            <span>${index + 1}</span>
            <div>
              <strong>${MarkdownRenderer.escapeHtml(domain.title)}</strong>
              <p>${MarkdownRenderer.escapeHtml(action)}</p>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }

  function renderPriorityCards(priorities) {
    if (!priorities.length) {
      return '<p>Complétez au moins 3 réponses dans un domaine pour faire apparaître des priorités probables.</p>';
    }

    return `
      <div class="priority-list">
        ${priorities.map((domain, index) => `
          <article class="priority-card">
            <span class="priority-rank">${index + 1}</span>
            <div>
              <strong>${MarkdownRenderer.escapeHtml(domain.title)}</strong>
              <p>${MarkdownRenderer.escapeHtml(statusText(domain))}</p>
              <ul>
                ${(domain.primaryActions || [domain.actions]).slice(0, 2).map((action) => `
                  <li>${MarkdownRenderer.escapeHtml(action)}</li>
                `).join('')}
              </ul>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }

  function renderMaintainCards(protectors, consolidations) {
    if (!protectors.length && !consolidations.length) {
      return '<p>Les domaines à maintenir apparaîtront dès qu’un domaine complet atteint un score protecteur.</p>';
    }

    return `
      <div class="maintain-list">
        ${protectors.map((domain) => `
          <article class="maintain-card">
            <strong>${MarkdownRenderer.escapeHtml(domain.title)} · ${domain.score.toFixed(1)}/4</strong>
            <p>${MarkdownRenderer.escapeHtml(domain.maintain)}</p>
          </article>
        `).join('')}
        ${consolidations.map((domain) => `
          <article class="maintain-card is-consolidation">
            <strong>${MarkdownRenderer.escapeHtml(domain.title)} · à consolider</strong>
            <p>${MarkdownRenderer.escapeHtml(domain.maintain)}</p>
          </article>
        `).join('')}
      </div>
    `;
  }

  function renderResults(state, summaries) {
    const priorities = getPriorities(state);
    const protectors = getProtectors(state);
    const consolidations = getConsolidations(state);
    const actionPlan = getActionPlan(state);
    const coveredCount = summaries.filter((domain) => domain.complete || domain.skipped).length;

    return `
      <aside class="questionnaire-results" id="questionnaire-results" aria-label="Synthèse du questionnaire">
        <p class="section-label">Résultats vivants</p>
        <h2>${coveredCount}/${QUESTIONNAIRE_DOMAINS.length} domaines parcourus</h2>
        <p>Orientation pratique uniquement : les scores aident à choisir quoi tester, ils ne remplacent pas une évaluation clinique.</p>

        <section class="result-section result-highlight">
          <p class="result-kicker">Plan 7 jours</p>
          <h3>À faire cette semaine</h3>
          ${renderActionPlan(actionPlan)}
        </section>

        <section class="result-section">
          <h3>Vos priorités probables</h3>
          ${renderPriorityCards(priorities)}
        </section>

        <section class="result-section">
          <h3>À maintenir</h3>
          ${renderMaintainCards(protectors, consolidations)}
        </section>

        <section class="result-section">
          <h3>Scores par domaine</h3>
          <div class="score-list is-compact">
            ${summaries.map((domain) => `
              <div class="score-item">
                <div>
                  <strong>${MarkdownRenderer.escapeHtml(domain.title)}</strong>
                  <span>${MarkdownRenderer.escapeHtml(statusText(domain))}</span>
                </div>
                <span class="score-value">${domain.score === null ? '—' : domain.score.toFixed(1)}</span>
              </div>
            `).join('')}
          </div>
        </section>

        <section class="result-section">
          <h3>Exporter</h3>
          <p>Gardez une trace courte, puis réévaluez dans 2 à 4 semaines.</p>
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

  function renderPreservingScroll(container) {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    render(container);
    window.scrollTo(scrollX, scrollY);
  }

  function render(container) {
    const state = loadState();
    const summaries = getSummaries(state);
    const answered = summaries.reduce((sum, domain) => sum + (domain.skipped ? domain.total : domain.answered), 0);
    const total = QUESTIONNAIRE_DOMAINS.reduce((sum, domain) => sum + domain.questions.length, 0);
    const progress = Math.round((answered / total) * 100);

    container.innerHTML = `
      <section class="page questionnaire-page">
        <div class="hero">
          <div>
            <p class="eyebrow">Auto-orientation opérationnelle</p>
            <h1>Faire le questionnaire</h1>
            <p class="lead">Répondez domaine par domaine. Le résultat met en avant vos priorités probables, les actions à tester cette semaine et les points forts à maintenir.</p>
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
              <p>Les réponses restent uniquement dans votre navigateur. Vous pouvez commencer par les domaines qui vous semblent les plus importants.</p>
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
        renderPreservingScroll(container);
      });
    });

    container.querySelectorAll('[data-domain-index]').forEach((button) => {
      button.addEventListener('click', () => {
        setCurrentDomainIndex(Number(button.dataset.domainIndex));
        copyMessage = '';
        renderPreservingScroll(container);
      });
    });

    container.querySelector('[data-domain-select]')?.addEventListener('change', (event) => {
      setCurrentDomainIndex(Number(event.target.value));
      copyMessage = '';
      renderPreservingScroll(container);
    });

    container.querySelector('[data-prev-domain]')?.addEventListener('click', () => {
      setCurrentDomainIndex(currentIndex - 1);
      copyMessage = '';
      renderPreservingScroll(container);
    });

    container.querySelector('[data-next-domain]')?.addEventListener('click', () => {
      setCurrentDomainIndex(currentIndex + 1);
      copyMessage = '';
      renderPreservingScroll(container);
    });

    container.querySelector('[data-skip-domain]')?.addEventListener('change', (event) => {
      state.skipped[event.target.dataset.skipDomain] = event.target.checked;
      copyMessage = '';
      saveState(state);
      renderPreservingScroll(container);
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
