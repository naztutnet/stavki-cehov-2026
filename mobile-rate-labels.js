(() => {
  if (window.__KINORATES_MOBILE_RATE_LABELS__) return;
  window.__KINORATES_MOBILE_RATE_LABELS__ = true;

  const style = document.createElement('style');
  style.textContent = `
    .kr-mobile-rate-meta-short{display:none}
    @media(max-width:620px){
      .registry-layout td:nth-child(2) .kr-mobile-rate-meta{display:none!important}
      .kr-mobile-rate-meta-short{display:block;margin-top:5px;max-width:100%}
      .kr-mobile-rate-diff{display:block;color:#66666e;font-size:11px;font-weight:500;line-height:1.25;white-space:normal}
      .kr-mobile-rate-context{display:block;margin-top:1px;max-width:100%;overflow:hidden;color:#98989f;font-size:10px;font-weight:400;line-height:1.25;white-space:nowrap;text-overflow:ellipsis}
    }
  `;
  document.head.appendChild(style);

  const normalize = (value) => String(value ?? '')
    .toLocaleLowerCase('ru-RU')
    .replaceAll('ё', 'е')
    .replace(/\s+/g, ' ')
    .trim();

  function productionLabel(rate) {
    const text = normalize(`${rate?.content || ''} ${rate?.cond || ''}`);
    const hasCinema = /(полный\s+метр|полнометраж|полные\s+метры|фильм|кино|короткометраж|коротк\w*\s+метр|(?:^|\s)к-м(?:\s|$))/.test(text);
    const hasSeries = /(сериал|многосерийн|эпизод|пилот|\bсери(?:я|и|й|ю|е)\b)/.test(text);
    const hasAd = /реклам/.test(text);
    const hasClip = /(клип|музыкальн\w*\s+видео)/.test(text);
    const hasTv = /((?:^|\s)тв(?:\s|$)|телевид|интернет-шоу|подкаст|реалити)/.test(text);

    const groups = [];
    if (hasCinema && hasSeries) groups.push('Кино / сериал');
    else if (hasCinema) groups.push('Кино');
    else if (hasSeries) groups.push('Сериал');

    if (hasAd && hasClip) groups.push(groups.length ? 'реклама / клип' : 'Реклама / клип');
    else if (hasAd) groups.push(groups.length ? 'реклама' : 'Реклама');
    else if (hasClip) groups.push(groups.length ? 'клип' : 'Клип');

    if (hasTv) groups.push('ТВ');
    return groups.join(' / ');
  }

  function hoursLabel(text) {
    const match = text.match(/(?:^|\D)(\d{1,2})\s*(?:час(?:а|ов)?|ч)(?:\D|$)/);
    return match ? `${match[1]} ч` : '';
  }

  function scopeLabel(rate) {
    const condition = normalize(rate?.cond);
    const unit = normalize(rate?.unit);
    const text = `${condition} ${unit}`.trim();
    const hours = hoursLabel(text);
    const prepShift = /подготовительн\w*\s+смен/.test(condition);
    const mixedShiftPrep = /(съемочн\w*\s+смен[^,;/]*[\s/]+подготов|подготов[^,;/]*[\s/]+съемочн\w*\s+смен)/.test(condition);

    if (prepShift) return `подготовка${hours ? ` ${hours}` : ''}`;
    if (mixedShiftPrep) return 'смена / подготовка';
    if (/подготов|препродакшн/.test(condition)) return `подготовка${hours ? ` ${hours}` : ''}`;
    if (/смен/.test(text)) return `смена${hours ? ` ${hours}` : ''}`;
    if (/месяц|месячн/.test(text)) return 'месяц';
    if (/недел/.test(text)) return 'неделя';
    if (/\bдень\b|\bдня\b|дневн/.test(unit)) return `день${hours ? ` ${hours}` : ''}`;
    if (/\bчас\b|часов|часа/.test(unit)) return 'час';
    if (/проект/.test(unit)) return 'проект';
    if (/оклад/.test(condition)) return 'оклад';
    if (/постоянн\w*\s+занятост/.test(condition)) return 'занятость';
    if (/аренд/.test(text)) return 'аренда';
    if (/\bпроект\b/.test(condition)) return 'проект';
    return '';
  }

  function experienceYearsLabel(condition) {
    let match = condition.match(/(\d+)\s*[–—-]\s*(\d+)\s*лет/);
    if (match) return `${match[1]}–${match[2]} лет`;
    match = condition.match(/от\s+(\d+)\s*лет/);
    if (match) return `${match[1]}+ лет`;
    match = condition.match(/до\s+(\d+)\s*лет/);
    if (match) return `до ${match[1]} лет`;
    match = condition.match(/(\d+)\+\s*лет/);
    if (match) return `${match[1]}+ лет`;
    return '';
  }

  function projectCountLabel(condition) {
    let match = condition.match(/(\d+)\s*[–—-]\s*(\d+)\s*проект/);
    if (match) return `${match[1]}–${match[2]} проектов`;
    match = condition.match(/от\s+(\d+)\s+до\s+(\d+)\s*проект/);
    if (match) return `${match[1]}–${match[2]} проектов`;
    match = condition.match(/свыше\s+(\d+)\s*проект/);
    if (match) return `>${match[1]} проектов`;
    match = condition.match(/от\s+(\d+)\s*проект/);
    if (match) return `${match[1]}+ проектов`;
    match = condition.match(/до\s+(\d+)\s*проект/);
    if (match) return `до ${match[1]} проектов`;
    match = condition.match(/(\d+)\+\s*проект/);
    if (match) return `${match[1]}+ проектов`;
    return '';
  }

  function genreLabel(condition) {
    if (/историч|военн/.test(condition) && /(фантаст|фэнтези|сказк)/.test(condition)) return 'исторический / фантастика';
    if (/историч|военн/.test(condition)) return 'исторический / военный';
    if (/(фантаст|фэнтези|сказк)/.test(condition)) return 'фантастика / фэнтези';
    if (/современн/.test(condition)) return 'современный';
    return '';
  }

  function segmentLabel(condition) {
    if (/высок\w*\s+сегмент/.test(condition)) return 'высокий сегмент';
    if (/средн\w*\s+сегмент/.test(condition)) return 'средний сегмент';
    if (/начальн\w*\s+сегмент|низк\w*\s+сегмент/.test(condition)) return 'начальный / низкий сегмент';
    return '';
  }

  function qualifierLabel(rate) {
    const condition = normalize(rate?.cond);
    if (!condition) return '';

    let level = '';
    if (/начинающ\w*\s+специалист|минимальн\w*\s+опыт/.test(condition)) level = 'Начинающий';
    else if (/профессионал/.test(condition)) level = 'Профессионал';
    else if (/специалист/.test(condition)) level = 'Специалист';

    const years = experienceYearsLabel(condition);
    const projects = projectCountLabel(condition);
    const genre = genreLabel(condition);
    const segment = segmentLabel(condition);
    const parts = [level, years, projects, genre, segment].filter(Boolean);
    return [...new Set(parts)].join(' · ');
  }

  function contextLabel(rate) {
    const production = productionLabel(rate);
    const scope = scopeLabel(rate);
    if (production && scope) return `${production} · ${scope}`;
    return production || scope || '';
  }

  function conciseCondition(rate) {
    const source = String(rate?.cond || '').trim();
    if (!source) return '';
    const first = source.split(/[;·]/)[0].trim();
    return first.length <= 52 ? first : `${first.slice(0, 49).trim()}…`;
  }

  function decorateRows() {
    const rates = window.KINORATES_DATA || [];
    if (!rates.length) return;
    const byId = new Map(rates.map((rate) => [String(rate.id), rate]));
    const rows = [...document.querySelectorAll('.registry-layout tr[data-rate-id]')];

    const visibleRates = rows
      .map((row) => byId.get(String(row.dataset.rateId)))
      .filter(Boolean);
    const duplicateGroups = new Map();
    visibleRates.forEach((rate) => {
      const key = `${normalize(rate.prof)}|${normalize(contextLabel(rate))}`;
      const list = duplicateGroups.get(key) || [];
      list.push(rate);
      duplicateGroups.set(key, list);
    });

    rows.forEach((row) => {
      const cell = row.querySelector('td:nth-child(2)');
      if (!cell) return;
      const rate = byId.get(String(row.dataset.rateId));
      if (!rate) return;

      const context = contextLabel(rate);
      let diff = qualifierLabel(rate);
      const groupKey = `${normalize(rate.prof)}|${normalize(context)}`;
      const group = duplicateGroups.get(groupKey) || [];
      const hasDifferentConditions = new Set(group.map((item) => normalize(item.cond))).size > 1;
      if (!diff && group.length > 1 && hasDifferentConditions) diff = conciseCondition(rate);

      let meta = cell.querySelector('.kr-mobile-rate-meta-short');
      if (!diff && !context) {
        meta?.remove();
        return;
      }
      if (!meta) {
        meta = document.createElement('span');
        meta.className = 'kr-mobile-rate-meta-short';
        cell.appendChild(meta);
      }

      meta.replaceChildren();
      if (diff) {
        const diffEl = document.createElement('span');
        diffEl.className = 'kr-mobile-rate-diff';
        diffEl.textContent = diff;
        meta.appendChild(diffEl);
      }
      if (context) {
        const contextEl = document.createElement('span');
        contextEl.className = 'kr-mobile-rate-context';
        contextEl.textContent = context;
        meta.appendChild(contextEl);
      }
      meta.title = String(rate.cond || rate.content || context || diff).trim();
    });
  }

  let queued = false;
  function queueDecoration() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      decorateRows();
    });
  }

  const app = document.querySelector('#app');
  if (app) new MutationObserver(queueDecoration).observe(app, { childList: true, subtree: true });
  window.addEventListener('hashchange', queueDecoration);
  window.addEventListener('resize', queueDecoration, { passive: true });
  queueDecoration();
})();
