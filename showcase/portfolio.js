const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealTargets = document.querySelectorAll('.hero-copy, .hero-note, .section-head, .case, .manifesto > *');

document.documentElement.classList.add('motion-ready');

revealTargets.forEach((element, index) => {
  element.classList.add('motion-reveal');
  element.style.setProperty('--reveal-order', String(index % 4));
});

if (reduceMotion) {
  revealTargets.forEach((element) => element.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  revealTargets.forEach((element) => observer.observe(element));
}

document.querySelectorAll('[data-case]').forEach((card) => {
  card.addEventListener('click', () => {
    window.sessionStorage.setItem('optimind:last-case', card.dataset.case);
  });

  if (reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;

  card.addEventListener('pointermove', (event) => {
    const bounds = card.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    card.style.setProperty('--pointer-x', x.toFixed(3));
    card.style.setProperty('--pointer-y', y.toFixed(3));
  });

  card.addEventListener('pointerleave', () => {
    card.style.setProperty('--pointer-x', '0');
    card.style.setProperty('--pointer-y', '0');
  });
});
