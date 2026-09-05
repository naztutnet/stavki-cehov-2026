(() => {
  if (window.__KINORATES_MOBILE_RATE_LABELS__) return;
  window.__KINORATES_MOBILE_RATE_LABELS__ = true;

  const style = document.createElement('style');
  style.textContent = `
    .kr-mobile-rate-meta-short{display:none}
    @media(max-width:620px){
      .registry-layout td:nth-child(2) .kr-mobile-rate-meta{display:none!important}
      .kr-mobile-rate-meta-short{display:block;margin-top:4px;max-width:100%;overflow:hidden;color:#8b8b93;font-size:11px;font-weight:400;line-height:1.25;white-space:nowrap;text-overflow:ellipsis}
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

    if (hasTv) groups.push(groups.length ? 'ТВ' : 'ТВ');
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
    if (/высок\w*\s+сегмент/.test(condition)) return 'высокий сегмент';
    if (/средн\w*\s+сегмент/.test(condition)) return 'средний сегмент';
    if (/начальн\w*\s+сегмент/.test(condition)) return 'начальный сегмент';
    if (/постоянн\w*\s+занятост/.test(condition)) return 'занятость';
    if (/аренд/.test(text)) return 'аренда';
    if (/\bпроект\b/.test(condition)) return 'проект';
    return '';
  }

  function fallbackLabel(rate) {
    const source = String(rate?.cond || rate?.content || '').trim();
    if (!source) return '';
    const first = source.split(/[,;·]/)[0].trim();
    return first.length <= 34 ? first : `${first.slice(0, 31).trim()}…`;
  }

  function mobileRateLabel(rate) {
    if (!rate) return '';
    const production = productionLabel(rate);
    const scope = scopeLabel(rate);
    if (production && scope) return `${production} · ${scope}`;
    return production || scope || fallbackLabel(rate);
  }

  function decorateRows() {
    const rates = window.KINORATES_DATA || [];
    if (!rates.length) return;
    const byId = new Map(rates.map((rate) => [String(rate.id), rate]));

    document.querySelectorAll('.registry-layout tr[data-rate-id]').forEach((row) => {
      const cell = row.querySelector('td:nth-child(2)');
      if (!cell) return;
      const rate = byId.get(String(row.dataset.rateId));
      const label = mobileRateLabel(rate);
      let meta = cell.querySelector('.kr-mobile-rate-meta-short');

      if (!label) {
        meta?.remove();
        return;
      }
      if (!meta) {
        meta = document.createElement('span');
        meta.className = 'kr-mobile-rate-meta-short';
        cell.appendChild(meta);
      }
      if (meta.textContent !== label) meta.textContent = label;
      meta.title = String(rate?.cond || rate?.content || label).trim();
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
