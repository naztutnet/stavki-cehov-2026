const fs = require("fs");
const vm = require("vm");
const { classifyRate, countByType } = require("./type-filter.js");

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(require.resolve("../rates-data.js"), "utf8"), context);
const rates = context.window.KINORATES_DATA;
const html = fs.readFileSync(require.resolve("./index.html"), "utf8");
const app = fs.readFileSync(require.resolve("./app.js"), "utf8");
const byId = (id) => rates.find((rate) => String(rate.id) === String(id));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const has = (id, type) => classifyRate(byId(id)).includes(type);

assert(rates.length === 449, `Expected the canonical 449 rates, got ${rates.length}`);
assert(has(6, "feature") && has(6, "series"), "Generic cinema/series rate must be shared");
assert(has(142, "feature") && !has(142, "series"), "Full-meter condition leaked into series");
assert(!has(143, "feature") && has(143, "series"), "Series condition leaked into full meter");
assert(has(147, "feature") && has(147, "series") && has(147, "advertising"), "Explicit three-type condition is incomplete");
assert(has(59, "feature") && has(59, "series") && has(59, "advertising") && has(59, "clip-tv"), "Explicit all-production rate is incomplete");
assert(has(11, "advertising") && has(11, "clip-tv"), "Advertising/music-video rate must be shared");
assert(has(1083, "clip-tv") && !has(1083, "advertising"), "TV rate must not be inferred as advertising");
assert(has(1103, "feature") && !has(1103, "series"), "Explicit full-meter content is misclassified");
assert(has(1088, "series") && !has(1088, "feature"), "Explicit series content is misclassified");
assert(classifyRate(byId(1086)).length === 0, "Short meter must stay in All without an invented category");
assert(classifyRate(byId(1091)).length === 0, "Microdrama must stay in All without an invented category");
assert(html.includes('<meta name="robots" content="noindex, nofollow, noarchive">'), "Prototype must be noindex");
assert(html.includes('<script src="../rates-data.js?v='), "Prototype must load the canonical parent dataset");
assert(!html.includes('rel="canonical"'), "Prototype must not declare itself canonical");
assert(!/metrika|mc\.yandex|METRIKA_ID/i.test(html + app), "Prototype must not load analytics");
const localVersions = [...html.matchAll(/(?:app\.css|type-filter\.js|app\.js)\?v=([^"]+)/g)].map((match) => match[1]);
assert(localVersions.length === 3 && new Set(localVersions).size === 1, "Prototype asset versions must match");

for (const rate of rates.filter((rate) => classifyRate(rate).includes("advertising"))) {
  assert(/реклам/i.test(`${rate.content} ${rate.cond}`), `Advertising was inferred for rate ${rate.id}`);
}

console.log("Production type mapping OK:", countByType(rates));
