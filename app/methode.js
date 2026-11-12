// Page « Méthode et sources » : principes, niveaux de preuve, calcul du questionnaire, documents complémentaires.
// Sur le modèle de la page « Méthode et limites » de Psytest (classes .methode, .home-*).

import { ANNEXES, EVIDENCE } from './content.js';
import { escapeHtml } from './markdown.js';

const fr = (x) => String(x).replace('.', ',');

export function methodeHTML(cfg) {
  const t = cfg.thresholds;
  return `<div class="home methode">
  <section class="home-hero home-hero-page">
    <p class="eyebrow">Méthode et sources</p>
    <h1>D’où vient ce guide, et comment le lire</h1>
    <p class="lead">Un rapport scientifique, critique et opérationnel sur le bonheur humain : ses sources, ses distinctions méthodologiques et ses conclusions pratiques sont conservées intégralement, puis transformées en outils.</p>
    <nav class="methode-toc" aria-label="Sur cette page"><a href="#m-principes" data-anchor="m-principes">Principes</a> · <a href="#m-preuves" data-anchor="m-preuves">Niveaux de preuve</a> · <a href="#m-calcul" data-anchor="m-calcul">Calcul du questionnaire</a> · <a href="#m-docs" data-anchor="m-docs">Documents</a> · <a href="#m-limites" data-anchor="m-limites">Limites</a></nav>
  </section>

  <section class="home-section" id="m-principes" aria-labelledby="m-principes-t">
    <h2 id="m-principes-t">Principes méthodologiques</h2>
    <ul class="list">
      <li>Priorité aux méta-analyses, revues systématiques, essais randomisés et cohortes longitudinales.</li>
      <li>Séparation explicite entre faits établis, hypothèses plausibles, controverses et mythes populaires.</li>
      <li>Causalité indiquée seulement lorsqu’elle est raisonnablement appuyée par le design des études.</li>
      <li>Orientation vers l’action sans langage motivationnel ni injonction morale.</li>
      <li>Conservation des sources et des limites de preuve.</li>
    </ul>
  </section>

  <section class="home-section" id="m-preuves" aria-labelledby="m-preuves-t">
    <h2 id="m-preuves-t">Niveaux de preuve</h2>
    <p class="home-intro">Les tableaux du guide indiquent le niveau de preuve de chaque affirmation, de A à D.</p>
    <ol class="home-axes bh-evidence">
      ${EVIDENCE.map(([k, txt]) => `<li><span class="home-num" data-evidence="${k}" aria-hidden="true">${k}</span><div><h3>Niveau ${k}</h3><p>${escapeHtml(txt)}</p></div></li>`).join('')}
    </ol>
  </section>

  <section class="home-section" id="m-calcul" aria-labelledby="m-calcul-t">
    <h2 id="m-calcul-t">Calcul du questionnaire</h2>
    <dl class="kv">
      <div><dt>Échelle</dt><dd>${cfg.scale.map((s) => `${s.code} = ${escapeHtml(s.label)}`).join(' · ')}</dd></div>
      <div><dt>Score d’un domaine</dt><dd>Moyenne des réponses données dans le domaine (${cfg.domains[0].questions.length} questions par domaine). Un domaine incomplet a un score <i>provisoire</i>.</dd></div>
      <div><dt>Zones</dt><dd>≤ ${fr(t.red)} priorité rouge · ≤ ${fr(t.orange)} zone orange · ≤ ${fr(t.ok)} acceptable · au-delà protecteur.</dd></div>
      <div><dt>Priorités probables</dt><dd>Trois domaines au plus, avec au moins ${t.minAnswers} réponses et un score ≤ ${fr(t.priorityMax)} ; les domaines complets passent devant, puis du plus bas au plus haut.</dd></div>
      <div><dt>Plan 7 jours</dt><dd>Deux actions pour un domaine rouge, une pour les autres priorités, cinq actions au plus. Sans priorité, les deux domaines les plus bas sous ${fr(t.protectorMin)}.</dd></div>
      <div><dt>À maintenir, à consolider</dt><dd>Domaines complets à ${fr(t.protectorMin)} ou plus (protecteurs), et entre ${fr(t.consolidateMin)} et ${fr(t.protectorMin)} (à consolider, trois au plus).</dd></div>
      <div class="wide"><dt>Domaine facultatif</dt><dd>« ${escapeHtml(cfg.domains.find((d) => d.optional)?.title || '')} » peut être ignoré : il n’entre alors dans aucun calcul.</dd></div>
    </dl>
    <p class="muted small">Ces seuils sont des repères pratiques pour choisir quoi tester. Ils ne viennent pas d’une validation statistique du questionnaire.</p>
  </section>

  <section class="home-section" id="m-docs" aria-labelledby="m-docs-t">
    <h2 id="m-docs-t">Documents complémentaires</h2>
    <p class="home-intro">Les outils et versions longues du rapport, à lire sur le site.</p>
    <div class="home-links bh-annexes">
      ${ANNEXES.map((a) => `<a href="#lire/${a.id}"><b>${escapeHtml(a.title)}</b><span>${escapeHtml(a.description)}</span></a>`).join('')}
    </div>
  </section>

  <section class="home-section" id="m-limites" aria-labelledby="m-limites-t">
    <h2 id="m-limites-t">Limites</h2>
    <p>Ce contenu relève de l’information scientifique générale et de l’aide à la décision. Il ne remplace pas une évaluation médicale, psychologique ou psychiatrique en cas de trouble mental, douleur chronique, insomnie sévère, idées suicidaires, addiction, traumatisme, violence relationnelle ou isolement majeur. En cas de détresse, appelez le <a class="tel" href="tel:3114">3114</a>, 24 h/24.</p>
    <p class="muted small">Version du questionnaire ${escapeHtml(cfg.version)}.</p>
  </section>
</div>`;
}
