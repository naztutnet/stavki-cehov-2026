const fs = require("fs");
const vm = require("vm");
const { FILTERS, classifyRate, countByType, normalizeFilterId, contributionState } = require("../production-type-filter.js");

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const dataContext = { window: {} };
vm.createContext(dataContext);
vm.runInContext(fs.readFileSync(require.resolve("../rates-data.js"), "utf8"), dataContext);
vm.runInContext(fs.readFileSync(require.resolve("../site-updates-data.js"), "utf8"), dataContext);

const rates = dataContext.window.KINORATES_DATA;
const updates = dataContext.window.KINORATES_SITE_UPDATES;
const app = fs.readFileSync(require.resolve("../app.js"), "utf8");
const css = fs.readFileSync(require.resolve("../app.css"), "utf8");
const html = fs.readFileSync(require.resolve("../index.html"), "utf8");
const previewHtml = fs.readFileSync(require.resolve("../preview-production-types/index.html"), "utf8");
const previewApp = fs.readFileSync(require.resolve("../preview-production-types/app.js"), "utf8");
const previewV3Html = fs.readFileSync(require.resolve("../preview-v3/index.html"), "utf8");
const previewV4Html = fs.readFileSync(require.resolve("../preview-v4/index.html"), "utf8");

assert(rates.length === 449, `Expected 449 canonical rates, got ${rates.length}`);
assert(JSON.stringify(FILTERS) === JSON.stringify([
  { id: "all", label: "Все" },
  { id: "cinema-series", label: "Кино и сериал" },
  { id: "commercial-media", label: "Реклама / клип / ТВ" },
]), "Unexpected production filter contract");
assert(JSON.stringify(countByType(rates)) === JSON.stringify({ all: 449, "cinema-series": 205, "commercial-media": 156 }), "Unexpected production filter counts");
assert(classifyRate(rates.find(({ id }) => String(id) === "147")).length === 2, "Shared production rate lost one of its filters");
assert(normalizeFilterId("advertising") === "commercial-media", "Legacy advertising URL is not supported");
const productionDesignerInCinema = contributionState(rates, "Художник-постановщик", "cinema-series");
const productionDesignerInAds = contributionState(rates, "Художник-постановщик", "commercial-media");
const absentProfession = contributionState(rates, "Координатор интимных сцен", "commercial-media");
assert(productionDesignerInCinema.kind === "has-rate" && productionDesignerInCinema.selectedRows.length === 2, "Existing cinema profession is not resolved inside its production type");
assert(productionDesignerInAds.kind === "missing-rate" && productionDesignerInAds.allRows.length === 2 && productionDesignerInAds.selectedRows.length === 0, "Cross-format missing rate is not detected without inventing an advertising value");
assert(absentProfession.kind === "missing-profession" && absentProfession.allRows.length === 0, "Profession absent from the canonical dataset is not detected");
assert(contributionState(rates, "", "commercial-media").kind === "none", "Empty searches should not trigger a contribution prompt");

assert(Array.isArray(updates) && updates.length === 15, "Production update feed must contain the curated 15 entries");
assert(updates[0].title === "Добавлен раздел «Сообщества и организации»", "Latest production update is incorrect");
assert(!updates.some(({ title }) => title === "Проект получил имя KinoRates"), "Removed update returned to production data");

assert(app.includes("KINORATES_TYPE_FILTER"), "Production app does not consume the shared production filter");
assert(app.includes("data-production-type"), "Production filter controls are missing");
assert(app.includes("TYPE_FILTER.matchesType"), "Production rows are not filtered by the shared mapping");
assert(app.includes('updates: siteUpdates'), "Production updates route is missing");
assert(app.includes('["updates", "◷", "Обновления"]'), "Production updates navigation entry is missing");
assert(css.includes(".production-type-panel"), "Production filter styling is missing");
assert(css.includes(".site-update-feed"), "Production update-feed styling is missing");

for (const asset of ["production-type-filter.js", "site-updates-data.js"]) {
  assert(html.includes(`<script src="${asset}?v=`), `Production page does not load shared asset: ${asset}`);
  assert(previewHtml.includes(`<script src="../${asset}?v=`), `Preview does not share production asset: ${asset}`);
}
assert(!previewHtml.includes('src="type-filter.js') && !previewHtml.includes('src="site-updates.js'), "Preview still loads duplicate filter or update data");
assert(previewApp.includes("KINORATES_SITE_UPDATES"), "Preview lost the shared update feed");
assert(previewV3Html.includes('../site-updates-data.js?v=20260820-20') && previewV4Html.includes('../site-updates-data.js?v=20260820-20'), "Legacy previews lost their update data dependency");
assert(dataContext.window.KINORATES_UPDATES === updates, "Legacy update alias does not reference the canonical feed");

console.log("Production promotion checks OK: 449 rates, 3 filters, 15 updates");
