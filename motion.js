/* Small, synchronous UI transitions. Data changes never wait for an animation. */
(() => {
  if (window.KINORATES_MOTION) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Map();
  const ease = 'cubic-bezier(.2,.7,.2,1)';
  let rendering = false;
  let lastRoute = location.hash || '#home';
  const enabled = () => !preference.matches && !document.hidden;
  const query = selector => document.querySelector(selector);
  function stop(group) {
    for (const [animation, entry] of [...running]) {
      if (!group || entry.group === group) { animation.cancel(); entry.finish(); }
    }
  }
  function animate(element, frames, duration = 220, group = 'view', done = () => {}) {
    if (!element || !enabled() || typeof element.animate !== 'function') { done(); return; }
    let animation;
    try { animation = element.animate(frames, { duration, easing: ease }); }
    catch { done(); return; }
    let finished = false;
    const finish = () => { if (finished) return; finished = true; running.delete(animation); done(); };
    running.set(animation, { group, finish });
    animation.finished.then(finish, finish);
  }
  function enter(element, group = 'view') {
    animate(element, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], 220, group);
  }
  function reveal(element, closing = false, done = () => {}) {
    const height = element.getBoundingClientRect().height;
    element.classList.add('kr-motion-reveal');
    animate(element, closing
      ? [{ height: `${height}px`, opacity: 1 }, { height: '0px', opacity: 0 }]
      : [{ height: '0px', opacity: 0 }, { height: `${height}px`, opacity: 1 }],
    closing ? 170 : 240, 'rates', () => { element.classList.remove('kr-motion-reveal'); done(); });
  }
  function decorativeClone(element) {
    const clone = element.cloneNode(true);
    clone.inert = true;
    clone.setAttribute('aria-hidden', 'true');
    clone.classList.add('kr-motion-leaving');
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    return clone;
  }
  function rateDetail() {
    const row = query('.rate-detail-row:not(.kr-motion-leaving)');
    return row ? { row, id: row.previousElementSibling?.dataset.rateId } : null;
  }
  const drawRates = window.drawRates;
  if (typeof drawRates === 'function') window.drawRates = function (...args) {
    if (rendering || !enabled()) return drawRates.apply(this, args);
    stop('rates');
    const previous = rateDetail();
    const result = drawRates.apply(this, args);
    const current = rateDetail();
    if (previous?.id !== current?.id) {
      // Retain only a decorative copy while closing; all real controls update immediately.
      if (previous) {
        const anchor = [...document.querySelectorAll('[data-rate-id]')].find(row => row.dataset.rateId === previous.id);
        if (anchor) {
          const copy = decorativeClone(previous.row);
          anchor.after(copy);
          reveal(copy.querySelector('.inline-detail'), true, () => copy.remove());
        }
      }
      if (current) reveal(current.row.querySelector('.inline-detail'));
    } else if (current) {
      // A version/price update should not collapse and reopen the whole card.
      animate(current.row.querySelector('.inline-detail'), [{ opacity: .75 }, { opacity: 1 }], 150, 'rates');
    } else {
      animate(query('#rateTable'), [{ opacity: .8 }, { opacity: 1 }], 140, 'rates');
    }
    return result;
  };
  function budgetPositions() {
    return new Map([...document.querySelectorAll('.budget-item[data-motion-key]')].map(node =>
      [node.dataset.motionKey, { node, rect: node.getBoundingClientRect() }]));
  }
  function visible(rect) { return rect.bottom > 0 && rect.top < innerHeight; }
  function animateBudget(before) {
    const after = budgetPositions();
    for (const [key, item] of after) {
      const old = before.get(key);
      if (!old) enter(item.node, 'budget');
      else if (visible(item.rect) && Math.abs(old.rect.top - item.rect.top) > 1) {
        animate(item.node, [{ transform: `translateY(${old.rect.top - item.rect.top}px)` }, { transform: 'none' }], 220, 'budget');
      }
    }
    for (const [key, item] of before) {
      if (after.has(key) || !visible(item.rect)) continue;
      const copy = decorativeClone(item.node);
      Object.assign(copy.style, { position: 'fixed', top: `${item.rect.top}px`, left: `${item.rect.left}px`, width: `${item.rect.width}px`, height: `${item.rect.height}px`, margin: '0', zIndex: '35', boxSizing: 'border-box' });
      document.body.appendChild(copy);
      animate(copy, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(-8px)' }], 150, 'budget', () => copy.remove());
    }
  }
  const render = window.render;
  if (typeof render === 'function') window.render = function (...args) {
    stop();
    const route = location.hash || '#home';
    const sameRoute = route === lastRoute;
    const before = enabled() && sameRoute && route === '#projects' ? budgetPositions() : null;
    rendering = true;
    let result;
    try { result = render.apply(this, args); }
    finally { rendering = false; }
    lastRoute = route;
    if (!enabled()) return result;
    if (!sameRoute) enter(query('.view'));
    else if (before) animateBudget(before);
    else animate(query('#rateTable'), [{ opacity: .8 }, { opacity: 1 }], 150);
    return result;
  };
  preference.addEventListener('change', () => { if (preference.matches) stop(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.KINORATES_MOTION = { stop };
  enter(query('.view'));
})();
