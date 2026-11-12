// Page « Le questionnaire » : présentation avant de commencer, sur le modèle de la page « Le test » de Psytest.
// Le détail du calcul reste sur la page Méthode et sources. Classes .home-* (home.css).

import { escapeHtml } from './markdown.js';

/**
 * @param {object} cfg configuration du questionnaire (data/questionnaire.json)
 * @param {{started: boolean}} ctx
 */
export function presentationHTML(cfg, ctx) {
  const n = cfg.domains.reduce((s, d) => s + d.questions.length, 0);
  return `<div class="home">
  <section class="home-hero home-hero-page">
    <p class="eyebrow">Le questionnaire</p>
    <h1>Douze domaines, une échelle, un plan pour la semaine</h1>
    <p class="lead">Une auto-orientation opérationnelle : vous décrivez votre situation réelle des derniers jours ou semaines, le questionnaire fait ressortir vos priorités probables, ce qui vous protège déjà, et les premières actions à tester. Il ne pose pas de diagnostic.</p>
  </section>

  <section class="home-section" aria-labelledby="q-steps">
    <h2 id="q-steps">Comment ça se passe</h2>
    <ol class="home-facts">
      <li><h3>1. Vous répondez</h3><p>${n} questions réparties en ${cfg.domains.length} domaines, de 0 (très défavorable) à 4 (solide). Dix à quinze minutes, en une ou plusieurs fois, dans l’ordre que vous voulez.</p></li>
      <li><h3>2. Vous lisez votre plan</h3><p>Trois priorités au plus, les actions à tester cette semaine, les domaines protecteurs à maintenir et vos scores par domaine.</p></li>
      <li><h3>3. Vous réévaluez</h3><p>Une à trois actions pendant 7 jours, sans tout changer. Puis vous repassez le questionnaire dans 2 à 4 semaines pour voir ce qui a bougé.</p></li>
    </ol>
  </section>

  <section class="home-section" aria-labelledby="q-domains">
    <h2 id="q-domains">Les douze domaines, dans cet ordre</h2>
    <p class="home-intro">D’abord ce qui soutient tout le reste (sommeil, liens, corps, santé), puis les marges de choix et de sens, enfin le cadre matériel, numérique et quotidien.</p>
    <ol class="home-axes">
      ${cfg.domains.map((d, i) => `<li><span class="home-num" aria-hidden="true">${i + 1}</span><div><h3>${escapeHtml(d.title)}${d.optional ? ' <span class="muted small">(facultatif)</span>' : ''}</h3><p>${escapeHtml(d.focus)}</p></div></li>`).join('')}
    </ol>
  </section>

  <section class="home-section home-check" aria-labelledby="q-read">
    <div>
      <h2 id="q-read">Comment le plan est construit</h2>
      <p>Chaque domaine reçoit la moyenne de vos réponses, de 0 à 4. À ${String(cfg.thresholds.red).replace('.', ',')} ou moins, c’est une <b>priorité rouge</b> ; jusqu’à ${String(cfg.thresholds.orange).replace('.', ',')}, une <b>zone orange</b> ; jusqu’à ${String(cfg.thresholds.ok).replace('.', ',')}, c’est <b>acceptable</b> ; au-delà, le domaine est <b>protecteur</b>.</p>
      <p class="home-muted">Le plan commence par les domaines les plus bas, parce que corriger un état rouge rapporte plus que d’optimiser ce qui va déjà bien.</p>
    </div>
    <blockquote class="home-example">
      <p class="home-ex-label">Exemple</p>
      <p>Le sommeil ressort à 1,2 sur 4, le numérique à 1,6, l’activité physique à 2,0. Les relations et le sens sont solides.</p>
      <p class="home-ex-out">Le plan propose deux actions sur le sommeil, une sur les notifications et une marche courte. Relations et sens sont à maintenir.</p>
    </blockquote>
  </section>

  <section class="home-section" aria-labelledby="q-is">
    <h2 id="q-is">Ce que c’est, et ce que ce n’est pas</h2>
    <div class="home-split">
      <div class="home-yes">
        <h3>C’est</h3>
        <ul>
          <li>Une aide pour choisir une à trois actions, fondée sur les déterminants documentés par la recherche.</li>
          <li>Une photographie de vos protections et de vos fragilités du moment.</li>
          <li>Un point de départ à réévaluer dans 2 à 4 semaines.</li>
        </ul>
      </div>
      <div class="home-no">
        <h3>Ce n’est pas</h3>
        <ul>
          <li>Un diagnostic ni une évaluation clinique.</li>
          <li>Un test validé scientifiquement : les questions s’appuient sur les déterminants du guide, pas sur une échelle validée.</li>
          <li>Un service d’urgence. En cas de détresse, appelez le <b>3114</b>, 24 h/24.</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="home-section" aria-labelledby="q-src">
    <h2 id="q-src">D’où viennent les questions</h2>
    <p>Les domaines reprennent les déterminants du bonheur que le guide classe comme les plus robustes : relations, sommeil, santé, activité physique, autonomie, compétence, sens, sécurité financière, environnement attentionnel. Chaque domaine propose des actions concrètes issues du plan d’action du guide.</p>
    <div class="home-links">
      <a href="#comprendre"><b>Comprendre</b><span>Les huit chapitres du guide : définitions, neuroscience, déterminants, illusions, philosophies, pilotage, plan d’action, dix variables.</span></a>
      <a href="#methode"><b>Méthode et sources</b><span>Niveaux de preuve, calcul des scores, tableau de bord, matrice d’actions et références.</span></a>
    </div>
  </section>

  <section class="home-section" aria-labelledby="q-priv">
    <h2 id="q-priv">Vos réponses restent chez vous</h2>
    <p>Rien n’est envoyé : ni serveur, ni compte, ni cookie. Vos réponses sont gardées dans ce navigateur pour que vous puissiez revenir plus tard${ctx.started ? ' (vous avez déjà commencé)' : ''}. Pour changer d’appareil ou garder une trace, téléchargez un fichier avec vos réponses, puis importez-le.</p>
  </section>
</div>`;
}
