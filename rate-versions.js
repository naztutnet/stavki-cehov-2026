/* Each document edition has a stable ID. Add a new ID for a new edition;
   never rewrite saved budget snapshots when the catalog changes. */
(function (root) {
  const checkedAt = "2026-10-09";
  const primaryId = "light-2026-05-mpk";
  const alternativeId = "light-2026-05-chat";
  const primaryUrl = "https://kinoprofsoyuz.ru/pip/wp-content/uploads/2026/04/tehnicheskie-speczialisty-operatorskoj-gruppy-2026.pdf";
  const alternativeUrl = "https://drive.google.com/file/d/1V16Tsw3QN7XETSVZZT46FGq74uwbFy1J/view";
  // ID: primary amount / first overtime tier / alternative amount / tier.
  const values = {
    288: [24000, 4800, 22000, 4400],
    289: [18600, 3800, 17000, 3500],
    290: [16800, 3800, 15400, 3500],
    291: [16800, 3800, 15400, 3500],
    292: [16800, 0, 15400, 0],
    293: [14400, 3200, 13200, 2900]
  };
  const money = n => new Intl.NumberFormat("ru-RU").format(n);
  const overtime = n => n ? `1–8 час переработки: ${money(n)} ₽/ч · 9–14 час: ${money(n * 2)} ₽/ч · после 14-го часа: ${money(n * 4)} ₽/ч` : "";
  const primaryExtra = "Разрыв 5 000 ₽/ч. Погрузка/разгрузка до 4 ч — 50% ставки; представитель при ПРР сторонними силами — 16 800 ₽ за погрузку + разгрузку. Грип: ПРР 32 000 ₽, транспорт отдельно. 7-й день подряд и далее — двойной тариф. Такси при старте до 6:30, финале после 23:30 или смене свыше 20 ч. Переработка округляется: 1–30 минут — полчаса, 31–60 — час. Трансфер до 10 ч включительно — 50% смены, более 10 ч — 100%. Простой в экспедиции с третьего дня подряд — 50% смены. Отдых после трансфера и перед выездом — не менее 10 ч, недостающие часы по ставке разрыва.";
  const alternativeExtra = "Разрыв 5 000 ₽/ч. Представитель техгруппы на ПРР — 15 400 ₽ за погрузку + разгрузку (50% + 50%). Грип: ПРР 32 000 ₽, транспорт отдельно. Ночная смена, округление, трансфер и отмена в этой копии отдельно не описаны: согласуйте их с бригадой. Статус письма и его соотношение с публикацией МПК не подтверждены.";
  function versionsFor(rate) {
    const v = values[rate?.id];
    if (!v) return [];
    const representative = Number(rate.id) === 292;
    return [
      { id: primaryId, label: "Публикация МПК", kind: "primary", status: "Основная в справочнике", effectiveDate: "2026-05-01", checkedAt,
        provenance: "Документ на сайте МПК проверен 09.10.2026. Это подтверждает содержание публикации, но не единые условия всех бригад.",
        amount: v[0], ot: overtime(v[1]), doc: primaryUrl, src: "МПК — письмо с действием с 01.05.2026",
        cond: representative ? "погрузка + разгрузка сторонними силами" : "смена 10 часов (день) / 9 часов (ночь), включая обед",
        extra: representative ? "16 800 ₽ за погрузку и разгрузку вместе: по 50% за каждую часть. Сохраняется цена из публикации МПК." : primaryExtra },
      { id: alternativeId, label: "Письмо из чата «Продюсер»", kind: "alternative", status: "Требует подтверждения", effectiveDate: "2026-05-01", observedAt: "2026-08-18", checkedAt,
        provenance: "Копия опубликована в чате 18.08.2026. В документе есть список подписантов. Не установлено, какая редакция заменяет другую и для каких бригад она действует.",
        contextUrl: "https://t.me/c/1080779966/35930", amount: v[2], ot: overtime(v[3]), doc: alternativeUrl, src: "Альтернативное письмо из чата «Продюсер», 18.08.2026",
        cond: representative ? "погрузка + разгрузка, по 50% за каждую часть" : "смена 10 часов; ночные условия в этой копии не указаны",
        extra: representative ? "15 400 ₽ за погрузку и разгрузку вместе: по 50% за каждую часть. Статус альтернативной версии требует подтверждения." : alternativeExtra }
    ];
  }
  function resolve(rate, versionId) {
    const versions = versionsFor(rate);
    if (!versions.length) return rate;
    const version = versions.find(v => v.id === versionId) || versions[0];
    return { ...rate, amount: version.amount, amount_text: money(version.amount), ot: version.ot, extra: version.extra, cond: version.cond,
      doc: version.doc, src: version.src, eff: "01.05.2026", versionId: version.id, version };
  }
  function snapshot(rate) {
    if (!rate.version) return null;
    return JSON.parse(JSON.stringify({ schemaVersion: 1, versionId: rate.version.id, label: rate.version.label, kind: rate.version.kind,
      status: rate.version.status, effectiveDate: rate.version.effectiveDate, checkedAt: rate.version.checkedAt,
      observedAt: rate.version.observedAt || null, amount: rate.amount, unit: rate.unit, cond: rate.cond, ot: rate.ot, extra: rate.extra,
      src: rate.src, doc: rate.doc, content: rate.content, capturedAt: new Date().toISOString() }));
  }
  function matches(item, rate) {
    return String(item.id) === String(rate.id) && (item.rateSnapshot?.versionId || "") === (rate.versionId || "");
  }
  function note(item) {
    const s = item.rateSnapshot;
    if (!s) return "";
    const changed = +item.rate !== +s.amount ? `; цена изменена вручную (в документе ${money(s.amount)} ₽)` : "";
    return `Версия: ${s.label}; ${s.status}; действует с ${s.effectiveDate}; проверено ${s.checkedAt}${changed}`;
  }
  root.KINORATES_VERSIONS = { versionsFor, resolve, snapshot, matches, note };
  if (typeof module !== "undefined") module.exports = root.KINORATES_VERSIONS;
})(typeof window === "undefined" ? globalThis : window);
