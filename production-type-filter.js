(function initProductionTypeFilter(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.KINORATES_TYPE_FILTER = api;
})(typeof globalThis !== "undefined" ? globalThis : window, () => {
  const FILTERS = [
    { id: "all", label: "Все" },
    { id: "cinema-series", label: "Кино и сериал" },
    { id: "commercial-media", label: "Реклама / клип / ТВ" },
  ];
  const FILTER_ALIASES = {
    feature: "cinema-series",
    series: "cinema-series",
    advertising: "commercial-media",
    "clip-tv": "commercial-media",
  };

  const normalize = (value) => String(value ?? "")
    .toLocaleLowerCase("ru-RU")
    .replaceAll("ё", "е")
    .replace(/\s+/g, " ")
    .trim();

  const hasFullMeterSignal = (value) => /(полный\s+метр|полнометраж|полные\s+метры|фильм|(?:не)?прокатн\w*\s+кино)/i.test(value);
  const hasSeriesSignal = (value) => /(сериал|многосерийн|\bсери(?:я|и|й|ю|е)\b|эпизод|пилот)/i.test(value);
  const hasShortMeterSignal = (value) => /(коротк\w*\s+метр|короткометраж|(?:^|\s)к-м(?:\s|$))/i.test(value);
  const hasAdvertisingSignal = (value) => /реклам/i.test(value);
  const hasClipTvSignal = (value) => /(клип|музыкальн\w*\s+видео|(?:^|[^а-я])тв(?:[^а-я]|$)|телевид|интернет-шоу|шоу|подкаст|реалити)/i.test(value);

  function classifyRate(rate) {
    const content = normalize(rate?.content);
    const condition = normalize(rate?.cond);
    const searchable = `${content} ${condition}`;
    const types = [];

    const fullContent = /^полный метр$/.test(content);
    const seriesContent = /^сериал$/.test(content);
    const sharedScreenContent = content.includes("кино") && content.includes("сериал");
    const conditionIsFull = hasFullMeterSignal(condition);
    const conditionIsSeries = hasSeriesSignal(condition);
    const conditionIsShortOnly = hasShortMeterSignal(condition) && !conditionIsFull && !conditionIsSeries;

    const hasCinemaSeriesType = conditionIsFull
      || conditionIsSeries
      || ((fullContent || seriesContent || sharedScreenContent) && !conditionIsShortOnly);
    if (hasCinemaSeriesType) types.push("cinema-series");

    if (hasAdvertisingSignal(searchable) || hasClipTvSignal(searchable)) types.push("commercial-media");

    return [...new Set(types)];
  }

  function normalizeFilterId(filterId) {
    const resolved = FILTER_ALIASES[filterId] || filterId;
    return FILTERS.some(({ id }) => id === resolved) ? resolved : "all";
  }

  function matchesType(rate, filterId) {
    const normalizedFilterId = normalizeFilterId(filterId);
    return normalizedFilterId === "all" || classifyRate(rate).includes(normalizedFilterId);
  }

  function countByType(rates) {
    return Object.fromEntries(FILTERS.map(({ id }) => [id, rates.filter((rate) => matchesType(rate, id)).length]));
  }

  function contributionState(rates, query, filterId) {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return { kind: "none", profession: "", allRows: [], selectedRows: [] };
    const allRows = rates.filter((rate) => normalize(rate?.prof) === normalizedQuery);
    const selectedRows = allRows.filter((rate) => matchesType(rate, filterId));
    const profession = allRows[0]?.prof || String(query ?? "").trim();
    const kind = selectedRows.length ? "has-rate" : allRows.length ? "missing-rate" : "missing-profession";
    return { kind, profession, allRows, selectedRows };
  }

  return { FILTERS, classifyRate, matchesType, countByType, normalizeFilterId, contributionState };
});
