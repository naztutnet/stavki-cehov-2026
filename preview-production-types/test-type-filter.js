const fs = require("fs");
const vm = require("vm");
const { FILTERS, classifyRate, countByType, normalizeFilterId } = require("./type-filter.js");

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(require.resolve("../rates-data.js"), "utf8"), context);
const rates = context.window.KINORATES_DATA;
const html = fs.readFileSync(require.resolve("./index.html"), "utf8");
const app = fs.readFileSync(require.resolve("./app.js"), "utf8");
const updatesContext = { window: {} };
vm.createContext(updatesContext);
vm.runInContext(fs.readFileSync(require.resolve("./site-updates.js"), "utf8"), updatesContext);
const siteUpdates = updatesContext.window.KINORATES_SITE_UPDATES;
const byId = (id) => rates.find((rate) => String(rate.id) === String(id));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const has = (id, type) => classifyRate(byId(id)).includes(type);

assert(rates.length === 449, `Expected the canonical 449 rates, got ${rates.length}`);
assert(JSON.stringify(FILTERS) === JSON.stringify([
  { id: "all", label: "Все" },
  { id: "cinema-series", label: "Кино и сериал" },
  { id: "commercial-media", label: "Реклама / клип / ТВ" },
]), "Unexpected production filter contract");
assert(has(6, "cinema-series"), "Generic cinema/series rate is missing");
assert(has(142, "cinema-series"), "Full-meter rate is missing from cinema/series");
assert(has(143, "cinema-series"), "Series rate is missing from cinema/series");
assert(has(147, "cinema-series") && has(147, "commercial-media"), "Explicit shared rate is incomplete");
assert(has(59, "cinema-series") && has(59, "commercial-media"), "Explicit all-production rate is incomplete");
assert(has(11, "commercial-media"), "Advertising/music-video rate is missing");
assert(has(1083, "commercial-media"), "TV rate is missing from advertising/media");
assert(has(1103, "cinema-series"), "Explicit full-meter content is misclassified");
assert(has(1088, "cinema-series"), "Explicit series content is misclassified");
assert(classifyRate(byId(1086)).length === 0, "Short meter must stay in All without an invented category");
assert(classifyRate(byId(1091)).length === 0, "Microdrama must stay in All without an invented category");
assert(normalizeFilterId("feature") === "cinema-series" && normalizeFilterId("series") === "cinema-series", "Legacy cinema URLs must converge");
assert(normalizeFilterId("advertising") === "commercial-media" && normalizeFilterId("clip-tv") === "commercial-media", "Legacy commercial URLs must converge");
assert(normalizeFilterId("unknown") === "all", "Unknown filters must fall back to All");
assert(html.includes('<meta name="robots" content="noindex, nofollow, noarchive">'), "Prototype must be noindex");
assert(html.includes('<script src="../rates-data.js?v='), "Prototype must load the canonical parent dataset");
assert(html.includes('<script src="site-updates.js?v='), "Prototype must load its update log");
assert(!html.includes('rel="canonical"'), "Prototype must not declare itself canonical");
assert(!/metrika|mc\.yandex|METRIKA_ID/i.test(html + app), "Prototype must not load analytics");
const localVersions = [...html.matchAll(/(?:app\.css|type-filter\.js|site-updates\.js|app\.js)\?v=([^"]+)/g)].map((match) => match[1]);
assert(localVersions.length === 4 && new Set(localVersions).size === 1, "Prototype asset versions must match");
assert(Array.isArray(siteUpdates) && siteUpdates.length === 19, "Review draft must contain all 19 confirmed update candidates");
assert(siteUpdates.every(({ date, dateLabel, type, title, text }) => date && dateLabel && type && title && text), "Every site update must be complete");
assert(siteUpdates.every((update, index) => !index || update.date <= siteUpdates[index - 1].date), "Site updates must be newest first");
for (const title of ["Рабочая смета с экспортом", "Рынок и аналитика стали точнее", "Сценарные ставки 2026", "Аэросъёмка АПАК 2025", "Запущен первый справочник ставок", "Создана единая схема данных", "Проведена большая сверка базы"]) {
  assert(siteUpdates.some((update) => update.title === title), `Confirmed update is missing: ${title}`);
}
assert(app.includes('?page=updates') && app.includes('Обновления KinoRates'), "Updates section must be reachable from the prototype navigation");
assert(app.includes('Расширенный черновик для отбора'), "Updates page must explain that the expanded list is a review draft");

for (const rate of rates.filter((rate) => classifyRate(rate).includes("commercial-media"))) {
  assert(/реклам|клип|музыкальн\w*\s+видео|(?:^|[^а-я])тв(?:[^а-я]|$)|телевид|шоу|подкаст|реалити/i.test(`${rate.content} ${rate.cond}`), `Commercial/media type was inferred for rate ${rate.id}`);
}

const counts = countByType(rates);
assert(JSON.stringify(counts) === JSON.stringify({ all: 449, "cinema-series": 204, "commercial-media": 156 }), `Unexpected counts: ${JSON.stringify(counts)}`);
console.log("Production type mapping OK:", counts);
