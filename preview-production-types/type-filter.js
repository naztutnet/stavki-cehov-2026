(function initProductionTypeFilter(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.KINORATES_TYPE_FILTER = api;
})(typeof globalThis !== "undefined" ? globalThis : window, () => {
  const FILTERS = [
    { id: "all", label: "Все" },
    { id: "feature", label: "Полный метр" },
    { id: "series", label: "Сериал" },
    { id: "advertising", label: "Реклама" },
    { id: "clip-tv", label: "Клип / ТВ" },
  ];

  const normalize = (value) => String(value ?? "")
    .toLocaleLowerCase("ru-RU")
    .replaceAll("ё", "е")
    .replace(/\s+/g, " ")
    .trim();

  const hasFullMeterSignal = (value) => /(полный\s+метр|полнометраж|полные\s+метры|фильм|(?:не)?прокатн\w*\s+кино)/i.test(value);
  const hasSeriesSignal = (value) => /(сериал|многосерийн|\bсери(?:я|и|й|ю|е)\b|эпизод|пилот)/i.test(value);
  const hasCombinedScreenSignal = (value) => /(?:кино|фильм\w*)\s*[\/]\s*сериал/i.test(value);
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
    const conditionIsShared = hasCombinedScreenSignal(condition) || (conditionIsFull && conditionIsSeries);
    const conditionIsShortOnly = hasShortMeterSignal(condition) && !conditionIsFull && !conditionIsSeries;

    if (fullContent) types.push("feature");
    if (seriesContent) types.push("series");

    if (sharedScreenContent) {
      if (conditionIsShared || (!conditionIsFull && !conditionIsSeries && !conditionIsShortOnly)) {
        types.push("feature", "series");
      } else if (conditionIsFull) {
        types.push("feature");
      } else if (conditionIsSeries) {
        types.push("series");
      }
    } else if (!fullContent && !seriesContent) {
      if (conditionIsFull) types.push("feature");
      if (conditionIsSeries) types.push("series");
    }

    if (hasAdvertisingSignal(searchable)) types.push("advertising");
    if (hasClipTvSignal(searchable)) types.push("clip-tv");

    return [...new Set(types)];
  }

  function matchesType(rate, filterId) {
    return filterId === "all" || classifyRate(rate).includes(filterId);
  }

  function countByType(rates) {
    return Object.fromEntries(FILTERS.map(({ id }) => [id, rates.filter((rate) => matchesType(rate, id)).length]));
  }

  return { FILTERS, classifyRate, matchesType, countByType };
});
