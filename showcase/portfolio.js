document.querySelectorAll('[data-case]').forEach((card) => {
  card.addEventListener('click', () => {
    window.sessionStorage.setItem('optimind:last-case', card.dataset.case);
  });
});
