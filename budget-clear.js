(() => {
  if (window.__KINORATES_BUDGET_CLEAR__) return;
  window.__KINORATES_BUDGET_CLEAR__ = true;

  const style = document.createElement("style");
  style.textContent = `
    .budget-action-clear{color:#8b4a4a!important;border-color:#eadada!important;background:#fff!important}
    .budget-action-clear:hover{color:#7a3838!important;border-color:#d9bcbc!important;background:#fff8f8!important}
    .budget-action-clear:disabled{opacity:.45;cursor:default}
    @media(max-width:780px){.budget-actions{display:flex!important;flex-wrap:wrap!important;gap:8px!important}.budget-action-clear{order:4;flex:1 1 100%;min-height:38px!important}}
  `;
  document.head.appendChild(style);

  function ensureClearButton() {
    const onBudgetPage = location.hash === "#projects";
    const actions = document.querySelector(".budget-actions");
    const existing = document.querySelector("[data-clear-budget]");

    if (!onBudgetPage || !actions || !Array.isArray(budgetItems) || !budgetItems.length) {
      existing?.remove();
      return;
    }
    if (existing) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiet budget-action-clear";
    button.dataset.clearBudget = "";
    button.textContent = "Очистить смету";
    button.setAttribute("aria-label", "Удалить все позиции из сметы");
    button.title = "Удалить все позиции и начать смету заново";
    actions.insertBefore(button, actions.lastElementChild || null);
  }

  function clearBudget() {
    if (!Array.isArray(budgetItems) || !budgetItems.length) return;
    const count = budgetItems.length;
    const ok = confirm(`Очистить смету полностью? Будут удалены все позиции (${count}). Это действие нельзя отменить.`);
    if (!ok) return;

    budgetItems.splice(0, budgetItems.length);
    if (typeof saveBudget === "function") saveBudget();
    else {
      try { localStorage.setItem("kinorates-budget-v4", "[]"); } catch {}
    }
    if (typeof render === "function") render();
    requestAnimationFrame(() => {
      ensureClearButton();
      document.dispatchEvent(new CustomEvent("kinorates:budget-cleared"));
    });
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-clear-budget]");
    if (!button) return;
    event.preventDefault();
    clearBudget();
  });

  const observer = new MutationObserver(() => ensureClearButton());
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("hashchange", () => requestAnimationFrame(ensureClearButton));
  ensureClearButton();
})();
