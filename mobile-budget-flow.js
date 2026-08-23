(() => {
  if (window.__KINORATES_MOBILE_BUDGET_FLOW__) return;
  window.__KINORATES_MOBILE_BUDGET_FLOW__ = true;

  const style = document.createElement('style');
  style.textContent = `
    .kr-back-to-top{position:fixed;z-index:36;right:14px;bottom:calc(14px + env(safe-area-inset-bottom,0px));display:grid;width:42px;height:42px;place-items:center;border:1px solid rgba(52,49,58,.12);border-radius:50%;background:rgba(255,255,255,.96);color:#5e46ca;box-shadow:0 8px 26px rgba(31,27,48,.14);font-size:18px;line-height:1;opacity:0;transform:translateY(8px) scale(.96);pointer-events:none;transition:opacity .18s ease,transform .22s ease,background .18s ease}
    .kr-back-to-top.show{opacity:1;transform:none;pointer-events:auto}.kr-back-to-top:active{transform:scale(.96)}
    body.has-budget-float .kr-back-to-top{bottom:calc(78px + env(safe-area-inset-bottom,0px))}
    .budget-item.kr-new-custom{animation:krNewBudgetItem .9s cubic-bezier(.16,1,.3,1)}
    @keyframes krNewBudgetItem{0%{box-shadow:0 0 0 0 rgba(109,74,255,0);border-color:var(--line)}35%{box-shadow:0 0 0 4px rgba(109,74,255,.10);border-color:#c9bfff}100%{box-shadow:none;border-color:var(--line)}}
    .registry-controls.kr-picker-focus{animation:krPickerFocus .9s cubic-bezier(.16,1,.3,1)}
    @keyframes krPickerFocus{0%{box-shadow:0 0 0 0 rgba(109,74,255,0)}35%{box-shadow:0 0 0 4px rgba(109,74,255,.10)}100%{box-shadow:none}}
    @media(min-width:781px){.kr-back-to-top{display:none!important}}
    @media(max-width:780px){.kr-back-to-top{display:grid}}
    @media(prefers-reduced-motion:reduce){.kr-back-to-top{transition:none}.budget-item.kr-new-custom,.registry-controls.kr-picker-focus{animation:none}}
  `;
  document.head.appendChild(style);

  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const smoothBehavior = () => prefersReducedMotion() ? 'auto' : 'smooth';

  function ensureBackToTop() {
    let button = document.querySelector('.kr-back-to-top');
    if (button) return button;
    button = document.createElement('button');
    button.type = 'button';
    button.className = 'kr-back-to-top';
    button.setAttribute('aria-label', 'Вернуться наверх');
    button.setAttribute('title', 'Наверх');
    button.textContent = '↑';
    button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: smoothBehavior() }));
    document.body.appendChild(button);
    return button;
  }

  function updateBackToTop() {
    const button = ensureBackToTop();
    const mobile = window.matchMedia('(max-width: 780px)').matches;
    button.classList.toggle('show', mobile && window.scrollY > 560);
  }

  function focusNewestCustomItem() {
    if (location.hash !== '#projects') return;
    const items = [...document.querySelectorAll('.budget-item')];
    const item = items.at(-1);
    if (!item) return;
    item.classList.add('kr-new-custom');
    item.scrollIntoView({ behavior: smoothBehavior(), block: 'center' });
    const input = item.querySelector('input[data-budget-field="prof"]');
    if (input) {
      setTimeout(() => {
        try { input.focus({ preventScroll: true }); } catch { input.focus(); }
        input.select?.();
      }, prefersReducedMotion() ? 0 : 360);
    }
    setTimeout(() => item.classList.remove('kr-new-custom'), 1200);
  }

  function openRatePicker() {
    const apply = () => {
      const controls = document.querySelector('.registry-controls');
      const input = document.querySelector('#rateSearch');
      if (!controls || !input) return false;
      controls.classList.add('kr-picker-focus');
      controls.scrollIntoView({ behavior: smoothBehavior(), block: 'center' });
      setTimeout(() => {
        try { input.focus({ preventScroll: true }); } catch { input.focus(); }
      }, prefersReducedMotion() ? 0 : 320);
      setTimeout(() => controls.classList.remove('kr-picker-focus'), 1200);
      return true;
    };

    if (location.hash === '#home' || !location.hash) {
      requestAnimationFrame(() => requestAnimationFrame(apply));
      return;
    }
    sessionStorage.setItem('kinorates-open-rate-picker', '1');
    location.hash = 'home';
  }

  function restoreRatePickerAfterRoute() {
    if (sessionStorage.getItem('kinorates-open-rate-picker') !== '1') return;
    sessionStorage.removeItem('kinorates-open-rate-picker');
    let tries = 0;
    const tryApply = () => {
      const controls = document.querySelector('.registry-controls');
      const input = document.querySelector('#rateSearch');
      if (controls && input) {
        controls.classList.add('kr-picker-focus');
        controls.scrollIntoView({ behavior: smoothBehavior(), block: 'center' });
        setTimeout(() => {
          try { input.focus({ preventScroll: true }); } catch { input.focus(); }
        }, prefersReducedMotion() ? 0 : 320);
        setTimeout(() => controls.classList.remove('kr-picker-focus'), 1200);
        return;
      }
      if (++tries < 8) setTimeout(tryApply, 50);
    };
    setTimeout(tryApply, 0);
  }

  document.addEventListener('click', (event) => {
    const custom = event.target.closest?.('[data-add-custom]');
    if (custom && location.hash === '#projects') {
      requestAnimationFrame(() => requestAnimationFrame(focusNewestCustomItem));
      return;
    }

    const addRate = event.target.closest?.('.budget-action-primary[href="#home"]');
    if (addRate && location.hash === '#projects') {
      event.preventDefault();
      openRatePicker();
    }
  });

  window.addEventListener('hashchange', () => {
    requestAnimationFrame(updateBackToTop);
    restoreRatePickerAfterRoute();
  });
  window.addEventListener('scroll', updateBackToTop, { passive: true });
  window.addEventListener('resize', updateBackToTop, { passive: true });

  ensureBackToTop();
  updateBackToTop();
  restoreRatePickerAfterRoute();
})();
