const progressBar = document.getElementById('readingProgress');

function updateReadingProgress() {
  if (!progressBar) return;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
}

function setActiveNavigation() {
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const links = Array.from(document.querySelectorAll('.top-nav a[href^="#"], .side-toc a[href^="#"]'));
  if (!sections.length || !links.length) return;

  let activeId = sections[0].id;
  const offset = 140;

  for (const section of sections) {
    const top = section.getBoundingClientRect().top + window.scrollY - offset;
    if (window.scrollY >= top) activeId = section.id;
  }

  links.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${activeId}`;
    link.toggleAttribute('aria-current', isActive);
  });
}

function enhanceCards() {
  const cards = document.querySelectorAll('.module-card, .tool-card');
  cards.forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--spot-x', `${x}%`);
      card.style.setProperty('--spot-y', `${y}%`);
    });
  });
}

window.addEventListener('scroll', () => {
  updateReadingProgress();
  setActiveNavigation();
}, { passive: true });

window.addEventListener('resize', updateReadingProgress, { passive: true });
window.addEventListener('DOMContentLoaded', () => {
  updateReadingProgress();
  setActiveNavigation();
  enhanceCards();
});
