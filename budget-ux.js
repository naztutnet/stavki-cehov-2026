(() => {
  if (window.__KINORATES_BUDGET_UX__) return;
  window.__KINORATES_BUDGET_UX__ = true;

  const style = document.createElement("style");
  style.textContent = `
    .budget-header-control{display:none;align-items:center;justify-content:center;min-height:32px;padding:0 11px;border:0;border-radius:7px;color:#fff;background:var(--accent,#6d4aff);text-decoration:none;box-shadow:none;transition:background .18s ease,transform .18s ease}
    .budget-header-control.show{display:flex}.budget-header-control:hover{background:#5e46ca}.budget-header-control:active{transform:scale(.985)}
    .budget-header-control .budget-header-icon{display:none}
    .budget-header-control .budget-header-copy{display:flex;align-items:center;justify-content:center;gap:8px;min-width:0}.budget-header-control .budget-header-copy b{font-size:10px;font-weight:600;white-space:nowrap}.budget-header-control .budget-header-copy small{font-size:10px;font-weight:500;color:rgba(255,255,255,.84);white-space:nowrap}
    .budget-header-control.bump{animation:budgetHeaderBump .42s cubic-bezier(.16,1,.3,1)}
    @keyframes budgetHeaderBump{0%{transform:scale(.94)}55%{transform:scale(1.03)}100%{transform:scale(1)}}

    .budget-float{position:fixed;z-index:38;left:10px;right:10px;bottom:calc(10px + env(safe-area-inset-bottom,0px));display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:3px 10px;align-items:center;padding:10px 11px;border:1px solid rgba(92,70,202,.18);border-radius:13px;color:#27272d;background:rgba(255,255,255,.96);box-shadow:0 12px 38px rgba(40,32,78,.16);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);text-decoration:none;opacity:0;transform:translateY(12px) scale(.98);pointer-events:none;transition:opacity .2s ease,transform .28s cubic-bezier(.16,1,.3,1)}
    .budget-float.show{opacity:1;transform:none;pointer-events:auto}.budget-float span{font-size:10px;font-weight:560;color:#5e46ca}.budget-float span b{font:inherit}.budget-float strong{grid-row:2;font-size:16px;line-height:1.1;font-weight:600;letter-spacing:-.03em;color:#202124}.budget-float i{grid-column:3;grid-row:1/3;padding:8px 10px;border-radius:8px;background:#eeeaff;color:#5e46ca;font-size:10px;font-style:normal;font-weight:600;white-space:nowrap}.budget-float::after{content:"→";grid-column:2;grid-row:1/3;color:#8a78de;font-size:14px}

    #toast.budget-toast{position:fixed;z-index:60;display:flex;align-items:center;gap:12px;max-width:min(390px,calc(100vw - 24px));padding:10px 11px 10px 13px;border:1px solid #e1dafa;border-radius:12px;color:#27272d;background:rgba(255,255,255,.97);box-shadow:0 14px 40px rgba(38,30,70,.18);font-size:11px;line-height:1.3;opacity:0;pointer-events:none;transform:translateY(8px) scale(.98);transition:opacity .16s ease,transform .22s cubic-bezier(.16,1,.3,1);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
    #toast.budget-toast.show{opacity:1;pointer-events:auto;transform:none}#toast.budget-toast b{font-weight:580}#toast.budget-toast a{margin-left:auto;padding:6px 8px;border-radius:7px;color:#5e46ca;background:#eeeaff;font-size:10px;font-weight:600;white-space:nowrap;text-decoration:none}
    .row-add.budget-pulse{animation:budgetCheck .42s cubic-bezier(.16,1,.3,1)}
    @keyframes budgetCheck{0%{transform:scale(.82)}55%{transform:scale(1.15)}100%{transform:scale(1)}}

    @media(min-width:781px){.budget-float{display:none!important}#toast.budget-toast{left:var(--budget-toast-x,50%);top:var(--budget-toast-y,50%);right:auto;bottom:auto;transform:translate(-50%,10px) scale(.98)}#toast.budget-toast.show{transform:translate(-50%,0) scale(1)}}
    @media(max-width:780px){
      .budget-header-control{display:none!important}
      body.has-budget-float{padding-bottom:calc(68px + env(safe-area-inset-bottom,0px))}
      #toast.budget-toast{left:10px;right:10px;bottom:calc(66px + env(safe-area-inset-bottom,0px));max-width:none}
      .registry-intro{gap:16px!important;padding-top:8px!important;padding-bottom:18px!important}
      .source-strip{grid-template-columns:1fr 1fr!important}
      .source-strip .registry-stats{grid-column:1/-1!important;border-right:0!important;border-bottom:1px solid var(--line)!important}
      .source-strip>a{min-width:0;padding:13px 14px!important;border-top:0!important;border-bottom:0!important}
      .source-strip>a:nth-of-type(2){border-right:0!important}
      .source-strip>a:last-of-type{grid-column:1/-1!important;border-top:1px solid var(--line)!important;border-right:0!important}
      .registry-stats{grid-template-columns:repeat(3,minmax(0,1fr))!important}
      .registry-stats>div{display:block!important;min-width:0;padding:11px 10px!important;border-right:1px solid var(--line)!important;border-bottom:0!important}
      .registry-stats>div:last-child{border-right:0!important}
      .source-strip b,.registry-stats>div b{font-size:18px!important;font-weight:540!important}
      .registry-stats>div b{display:block;line-height:1.05}
      .registry-stats>div span{display:block;margin-top:4px!important;font-size:9px!important;line-height:1.2}
    }
    @media(max-width:520px){
      .source-strip{grid-template-columns:1fr 1fr!important}
      .source-strip .registry-stats{grid-column:1/-1!important}
      .source-strip>a:nth-of-type(1),.source-strip>a:nth-of-type(2){grid-column:auto!important}
      .source-strip>a:nth-of-type(1){border-right:1px solid var(--line)!important}
      .source-strip>a:nth-of-type(2){border-right:0!important}
      .source-strip>a:last-of-type{grid-column:1/-1!important}
      .source-strip span,.source-strip small{font-size:10px!important;line-height:1.25}
      .source-strip b,.registry-stats>div b{font-size:17px!important}
      .source-strip b{line-height:1.25}
      .registry-stats>div{grid-template-columns:none!important;gap:0!important;align-items:initial!important}
      .registry-stats>div span{font-size:8.5px!important}
      .budget-float{left:12px;right:12px;bottom:calc(8px + env(safe-area-inset-bottom,0px));grid-template-columns:auto minmax(0,1fr) auto;gap:8px;padding:9px 10px;border-radius:12px}
      .budget-float span{font-size:10px;white-space:nowrap}
      .budget-float strong{grid-column:auto;grid-row:auto;justify-self:end;font-size:13px;white-space:nowrap}
      .budget-float::after{display:none}
      .budget-float i{grid-column:auto;grid-row:auto;padding:7px 9px;font-size:9.5px}
    }
    @media(prefers-reduced-motion:reduce){.budget-header-control,.budget-float,#toast.budget-toast{transition:none}.row-add.budget-pulse,.budget-header-control.bump{animation:none}}
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

  function ensureHeaderControl() {
    const actions = document.querySelector(".top-actions");
    if (!actions) return null;
    let control = actions.querySelector("[data-budget-header]");
    if (!control) {
      control = document.createElement("a");
      control.href = "#projects";
      control.className = "budget-header-control";
      control.dataset.budgetHeader = "";
      control.setAttribute("aria-label", "Открыть рабочую смету");
      control.innerHTML = `<span class="budget-header-icon">▣</span><span class="budget-header-copy"><b data-header-count>Смета · 0</b><small data-header-total>0 ₽</small></span>`;
      actions.prepend(control);
    }
    return control;
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

  function updateBudgetControls({ bump = false } = {}) {
    const count = Array.isArray(budgetItems) ? budgetItems.length : 0;
    const totalText = typeof rub === "function" ? rub(grossTotal()) : `${grossTotal()} ₽`;
    const isBudget = location.hash === "#projects";

    const header = ensureHeaderControl();
    if (header) {
      header.querySelector("[data-header-count]").textContent = `Смета · ${count}`;
      header.querySelector("[data-header-total]").textContent = totalText;
      header.classList.toggle("show", count > 0);
      header.classList.toggle("active", isBudget);
      if (bump) {
        header.classList.remove("bump");
        void header.offsetWidth;
        header.classList.add("bump");
        setTimeout(() => header.classList.remove("bump"), 500);
      }
    }

    const bar = ensureFloat();
    bar.querySelector("[data-float-count]").textContent = `${count} поз.`;
    bar.querySelector("[data-float-total]").textContent = totalText;
    const mobile = matchMedia("(max-width: 780px)").matches;
    bar.classList.toggle("show", count > 0 && !isBudget && mobile);
    document.body.classList.toggle("has-budget-float", count > 0 && !isBudget && mobile);
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
        updateBudgetControls();
        return;
      }
      originalAddRate.call(this, id);
      requestAnimationFrame(() => {
        document.querySelectorAll(`[data-add-rate="${CSS.escape(String(id))}"]`).forEach((button) => button.classList.add("budget-pulse"));
        showBudgetToast(rate, false);
        updateBudgetControls({ bump: true });
      });
    };
  }

  const originalSaveBudget = window.saveBudget;
  if (typeof originalSaveBudget === "function") {
    window.saveBudget = function enhancedSaveBudget(...args) {
      const result = originalSaveBudget.apply(this, args);
      queueMicrotask(updateBudgetControls);
      return result;
    };
  }

  const observer = new MutationObserver(() => {
    if (!document.querySelector(".top-actions")) return;
    if (!document.querySelector("[data-budget-header]")) updateBudgetControls();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener("hashchange", () => requestAnimationFrame(updateBudgetControls));
  window.addEventListener("resize", updateBudgetControls, { passive: true });
  document.addEventListener("click", (event) => {
    if (event.target.closest?.("[data-budget-float], [data-budget-header], #toast a[href='#projects']")) setTimeout(updateBudgetControls, 0);
  });

  updateBudgetControls();
})();
