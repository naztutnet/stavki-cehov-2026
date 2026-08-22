(() => {
  if (window.__KINORATES_BUDGET_UX__) return;
  window.__KINORATES_BUDGET_UX__ = true;

  const style = document.createElement("style");
  style.textContent = `
    .budget-float{position:fixed;z-index:38;right:22px;bottom:22px;width:min(300px,calc(100vw - 32px));display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 14px;align-items:center;padding:13px 14px;border:1px solid rgba(92,70,202,.18);border-radius:14px;color:#27272d;background:rgba(255,255,255,.94);box-shadow:0 12px 38px rgba(40,32,78,.16);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);text-decoration:none;opacity:0;transform:translateY(12px) scale(.98);pointer-events:none;transition:opacity .2s ease,transform .28s cubic-bezier(.16,1,.3,1),box-shadow .2s ease}
    .budget-float.show{opacity:1;transform:none;pointer-events:auto}
    .budget-float:hover{box-shadow:0 16px 42px rgba(40,32,78,.21)}
    .budget-float span{font-size:11px;font-weight:560;color:#5e46ca}.budget-float span b{font:inherit}.budget-float strong{grid-row:2;font-size:18px;line-height:1.1;font-weight:600;letter-spacing:-.03em;color:#202124}.budget-float i{grid-column:2;grid-row:1/3;align-self:center;padding:7px 9px;border-radius:8px;background:#eeeaff;color:#5e46ca;font-size:10px;font-style:normal;font-weight:600;white-space:nowrap}
    #toast.budget-toast{position:fixed;z-index:60;display:flex;align-items:center;gap:12px;max-width:min(390px,calc(100vw - 24px));padding:10px 11px 10px 13px;border:1px solid #e1dafa;border-radius:12px;color:#27272d;background:rgba(255,255,255,.97);box-shadow:0 14px 40px rgba(38,30,70,.18);font-size:11px;line-height:1.3;opacity:0;pointer-events:none;transform:translateY(8px) scale(.98);transition:opacity .16s ease,transform .22s cubic-bezier(.16,1,.3,1);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
    #toast.budget-toast.show{opacity:1;pointer-events:auto;transform:none}
    #toast.budget-toast b{font-weight:580}#toast.budget-toast a{margin-left:auto;padding:6px 8px;border-radius:7px;color:#5e46ca;background:#eeeaff;font-size:10px;font-weight:600;white-space:nowrap;text-decoration:none}
    .row-add.budget-pulse{animation:budgetCheck .42s cubic-bezier(.16,1,.3,1)}
    @keyframes budgetCheck{0%{transform:scale(.82)}55%{transform:scale(1.15)}100%{transform:scale(1)}}
    @media(min-width:781px){#toast.budget-toast{left:var(--budget-toast-x,50%);top:var(--budget-toast-y,50%);right:auto;bottom:auto;transform:translate(-50%,10px) scale(.98)}#toast.budget-toast.show{transform:translate(-50%,0) scale(1)}}
    @media(max-width:780px){body.has-budget-float{padding-bottom:calc(78px + env(safe-area-inset-bottom,0px))}.budget-float{left:10px;right:10px;bottom:calc(10px + env(safe-area-inset-bottom,0px));width:auto;grid-template-columns:minmax(0,1fr) auto auto;gap:3px 10px;padding:10px 11px;border-radius:13px}.budget-float span{font-size:10px}.budget-float strong{grid-row:2;font-size:16px}.budget-float i{grid-column:3;grid-row:1/3;padding:8px 10px}.budget-float::after{content:"→";grid-column:2;grid-row:1/3;color:#8a78de;font-size:14px}.budget-float i{display:block}#toast.budget-toast{left:10px;right:10px;bottom:calc(76px + env(safe-area-inset-bottom,0px));max-width:none}}
    @media(prefers-reduced-motion:reduce){.budget-float,#toast.budget-toast{transition:none}.row-add.budget-pulse{animation:none}}
  `;
  document.head.appendChild(style);

  let lastPointer = { x: Math.max(160, innerWidth - 180), y: Math.max(90, innerHeight - 130) };
  document.addEventListener("pointerdown", (event) => {
    if (!event.target.closest?.("[data-add-rate]")) return;
    lastPointer = { x: event.clientX, y: event.clientY };
  }, true);

  function grossTotal() {
    try { return budgetItems.reduce((sum, item) => sum + itemGross(item), 0); }
    catch { return 0; }
  }

  function ensureFloat() {
    let bar = document.querySelector("[data-budget-float]");
    if (!bar) {
      bar = document.createElement("a");
      bar.href = "#projects";
      bar.className = "budget-float";
      bar.dataset.budgetFloat = "";
      bar.innerHTML = `<span>Смета · <b data-float-count>0 поз.</b></span><strong data-float-total>0 ₽</strong><i>Открыть</i>`;
      document.body.appendChild(bar);
    }
    return bar;
  }

  function updateFloat() {
    const bar = ensureFloat();
    const count = Array.isArray(budgetItems) ? budgetItems.length : 0;
    const isBudget = location.hash === "#projects";
    bar.querySelector("[data-float-count]").textContent = `${count} поз.`;
    bar.querySelector("[data-float-total]").textContent = typeof rub === "function" ? rub(grossTotal()) : `${grossTotal()} ₽`;
    bar.classList.toggle("show", count > 0 && !isBudget);
    document.body.classList.toggle("has-budget-float", count > 0 && !isBudget && matchMedia("(max-width: 780px)").matches);
  }

  function ensureToast() {
    let toast = document.querySelector("#toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      document.body.appendChild(toast);
    }
    toast.classList.add("budget-toast");
    return toast;
  }

  function showBudgetToast(rate, already = false) {
    const toast = ensureToast();
    const x = Math.min(innerWidth - 190, Math.max(190, lastPointer.x));
    const y = Math.min(innerHeight - 80, Math.max(70, lastPointer.y - 54));
    toast.style.setProperty("--budget-toast-x", `${x}px`);
    toast.style.setProperty("--budget-toast-y", `${y}px`);
    toast.innerHTML = `<b>${already ? "Уже в смете" : "Добавлено в смету"}</b><a href="#projects">Открыть смету</a>`;
    toast.classList.add("show");
    clearTimeout(showBudgetToast.timer);
    showBudgetToast.timer = setTimeout(() => toast.classList.remove("show"), 2800);
  }

  const originalAddRate = window.addRate;
  if (typeof originalAddRate === "function") {
    window.addRate = function enhancedAddRate(id) {
      const rate = R.find((item) => String(item.id) === String(id));
      if (!rate) return;
      const exists = budgetItems.some((item) => String(item.id) === String(rate.id));
      if (exists) {
        showBudgetToast(rate, true);
        updateFloat();
        return;
      }
      originalAddRate.call(this, id);
      requestAnimationFrame(() => {
        document.querySelectorAll(`[data-add-rate="${CSS.escape(String(id))}"]`).forEach((button) => button.classList.add("budget-pulse"));
        showBudgetToast(rate, false);
        updateFloat();
      });
    };
  }

  const originalSaveBudget = window.saveBudget;
  if (typeof originalSaveBudget === "function") {
    window.saveBudget = function enhancedSaveBudget(...args) {
      const result = originalSaveBudget.apply(this, args);
      queueMicrotask(updateFloat);
      return result;
    };
  }

  window.addEventListener("hashchange", () => requestAnimationFrame(updateFloat));
  window.addEventListener("resize", updateFloat, { passive: true });
  document.addEventListener("click", (event) => {
    if (event.target.closest?.("[data-budget-float], #toast a[href='#projects']")) setTimeout(updateFloat, 0);
  });

  updateFloat();
})();
