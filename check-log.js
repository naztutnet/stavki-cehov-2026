window.KINORATES_CHECKS = [];
window.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector('script[data-budget-ux]')) return;
  const script = document.createElement("script");
  script.src = "budget-ux.js?v=20260822-2";
  script.dataset.budgetUx = "";
  document.body.appendChild(script);
});
