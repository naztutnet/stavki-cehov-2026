(() => {
  if (window.__KINORATES_BUDGET_OPEN_FIX__) return;
  window.__KINORATES_BUDGET_OPEN_FIX__ = true;

  function openBudget(event) {
    const trigger = event.target.closest?.('[data-budget-header], [data-budget-float], .budget-shortcut');
    if (!trigger) return;

    event.preventDefault();
    event.stopPropagation();

    if (location.hash === '#projects') {
      if (typeof window.render === 'function') window.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    location.hash = 'projects';
  }

  document.addEventListener('click', openBudget, true);
})();
