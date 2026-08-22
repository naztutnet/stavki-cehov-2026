(() => {
  if (window.__KINORATES_BUDGET_HEADER_SYNC__) return;
  window.__KINORATES_BUDGET_HEADER_SYNC__ = true;

  function syncBudgetHeaderSize() {
    if (window.matchMedia("(max-width: 780px)").matches) return;
    const actions = document.querySelector(".top-actions");
    if (!actions) return;
    const control = actions.querySelector("[data-budget-header]");
    const reference = [...actions.querySelectorAll(".quiet")].find((el) => !el.closest("[data-budget-header]"));
    if (!control || !reference) return;

    const rect = reference.getBoundingClientRect();
    const cs = getComputedStyle(reference);
    control.style.width = `${Math.round(rect.width)}px`;
    control.style.minWidth = `${Math.round(rect.width)}px`;
    control.style.height = `${Math.round(rect.height)}px`;
    control.style.minHeight = `${Math.round(rect.height)}px`;
    control.style.padding = cs.padding;
    control.style.borderRadius = cs.borderRadius;
    control.style.fontSize = cs.fontSize;
    control.style.fontWeight = cs.fontWeight;
    control.style.lineHeight = cs.lineHeight;

    const title = control.querySelector("[data-header-count]");
    const total = control.querySelector("[data-header-total]");
    if (title) {
      title.style.fontSize = cs.fontSize;
      title.style.fontWeight = cs.fontWeight;
      title.style.lineHeight = cs.lineHeight;
    }
    if (total) {
      total.style.fontSize = cs.fontSize;
      total.style.fontWeight = cs.fontWeight;
      total.style.lineHeight = cs.lineHeight;
    }
  }

  const observer = new MutationObserver(() => requestAnimationFrame(syncBudgetHeaderSize));
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("resize", syncBudgetHeaderSize, { passive: true });
  window.addEventListener("hashchange", () => requestAnimationFrame(syncBudgetHeaderSize));
  setTimeout(syncBudgetHeaderSize, 0);
  setTimeout(syncBudgetHeaderSize, 300);
})();
