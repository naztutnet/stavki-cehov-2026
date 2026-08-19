// One read-only KinoRates variant for testing production-type filtering on the canonical dataset.
const RATES = window.KINORATES_DATA || [];
const TYPE_FILTER = window.KINORATES_TYPE_FILTER;
const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
const normalizeSearch = (value) => String(value ?? "").toLocaleLowerCase("ru-RU").replaceAll("ё", "е").trim();
const rub = (value) => `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(+value || 0)} ₽`;
const validFilterIds = new Set((TYPE_FILTER?.FILTERS || []).map(({ id }) => id));
const initialType = new URLSearchParams(location.search).get("type");

let selectedType = validFilterIds.has(initialType) ? initialType : "all";
let selectedDept = "";
let expandedRateId = "";

const descriptions = {
  all: "Весь канонический набор без исключений и новых категорий.",
  feature: "Общие ставки «Кино / сериал» и записи, явно относящиеся к полному метру.",
  series: "Общие ставки «Кино / сериал» и записи, явно относящиеся к сериалам.",
  advertising: "Только записи с прямым указанием рекламы в content или cond. Пересчёта из киношных ставок нет.",
  "clip-tv": "Записи с прямым указанием клипа, музыкального видео, ТВ, шоу, подкаста или реалити.",
};

function statusMeta(rate) {
  if (["fresh2026", "official2026"].includes(rate.status)) return ["Письмо 2026", "current"];
  if (["verified2025", "verified2024", "verified2023"].includes(rate.status)) return [`Письмо ${String(rate.status).slice(-4)}`, "previous"];
  if (rate.status === "market2025") return ["Рыночный ориентир", "market"];
  if (rate.status === "no_public_rate") return ["Без публичного тарифа", "unpublished"];
  const letterYear = String(rate.src || "").match(/письм[^·]*(20\d{2})/i)?.[1];
  return [letterYear ? `Письмо ${letterYear}` : "Архив", "archive"];
}

function updateTypeInUrl() {
  const url = new URL(location.href);
  if (selectedType === "all") url.searchParams.delete("type");
  else url.searchParams.set("type", selectedType);
  history.replaceState(null, "", url);
}

function revealActiveType() {
  requestAnimationFrame(() => {
    const tabs = $(".type-tabs");
    const active = $(".type-tab.active");
    if (!tabs || !active || tabs.scrollWidth <= tabs.clientWidth) return;
    tabs.scrollLeft = Math.max(0, active.offsetLeft - (tabs.clientWidth - active.clientWidth) / 2);
  });
}

function baseTypeRates() {
  return RATES.filter((rate) => TYPE_FILTER.matchesType(rate, selectedType));
}

function queryValue() {
  return normalizeSearch($("#rateSearch")?.value || "");
}

function matchesQuery(rate, query) {
  return !query || normalizeSearch(`${rate.prof} ${rate.dept} ${rate.cond} ${rate.content}`).includes(query);
}

function filteredRates() {
  const query = queryValue();
  return baseTypeRates().filter((rate) => (!selectedDept || rate.dept === selectedDept) && matchesQuery(rate, query));
}

function typeButtons() {
  const counts = TYPE_FILTER.countByType(RATES);
  return TYPE_FILTER.FILTERS.map(({ id, label }) => `<button type="button" role="tab" aria-selected="${selectedType === id}" class="type-tab ${selectedType === id ? "active" : ""}" data-type="${id}"><span>${esc(label)}</span><b>${counts[id]}</b></button>`).join("");
}

function page() {
  return `<div class="shell">
    <aside class="sidebar">
      <a class="brand" href="../" aria-label="Открыть KinoRates"><i>K</i><span><b>KinoRates</b><small>СТАВКИ КИНОЦЕХОВ</small></span></a>
      <nav aria-label="Раздел прототипа"><span>ПРОТОТИП</span><a class="active" href="./">Фильтр производства</a><a href="../">Текущий KinoRates ↗</a></nav>
      <div class="prototype-note"><b>Скрытая версия</b><p>Страница не добавлена в навигацию и закрыта от индексации.</p></div>
    </aside>
    <main>
      <header class="topbar"><div><span>KinoRates</span><i>/</i><b>Фильтр производства</b></div><span class="prototype-badge">NOINDEX · ПРОТОТИП</span></header>
      <div class="view">
        <section class="intro"><div><span class="eyebrow">КАНОНИЧЕСКИЙ НАБОР · ${RATES.length} СТАВОК</span><h1>Ставки по типу производства</h1><p>Одна запись может относиться к нескольким режимам. Категории определяются только существующими полями <code>content</code> и <code>cond</code>.</p></div><div class="dataset-mark"><span>Источник данных</span><b>rates-data.js</b><small>без копии ставок</small></div></section>
        <section class="type-panel"><div class="type-tabs" role="tablist" aria-label="Тип производства">${typeButtons()}</div><p id="typeDescription">${esc(descriptions[selectedType])}</p></section>
        <section class="registry"><aside class="dept-list" id="deptList"></aside><div class="registry-main"><div class="controls"><label class="search"><span aria-hidden="true">⌕</span><input id="rateSearch" type="search" autocomplete="off" placeholder="Профессия, цех или условие"></label><button type="button" class="clear" id="clearFilters">Сбросить</button></div><div id="rateTable"></div></div></section>
      </div>
    </main>
  </div>`;
}

function renderDepartments() {
  const query = queryValue();
  const current = baseTypeRates().filter((rate) => matchesQuery(rate, query));
  const departments = [...new Set(RATES.map((rate) => rate.dept))].sort((a, b) => a.localeCompare(b, "ru"));
  const button = (dept, label, count) => `<button type="button" class="${selectedDept === dept ? "active" : ""}" data-dept="${esc(dept)}"><span>${esc(label)}</span><b>${count}</b></button>`;
  $("#deptList").innerHTML = `<header><h2>Цеха</h2><span>${departments.length}</span></header>${button("", "Все цеха", current.length)}${departments.map((dept) => button(dept, dept, current.filter((rate) => rate.dept === dept).length)).join("")}`;
  document.querySelectorAll("[data-dept]").forEach((control) => {
    control.onclick = () => { selectedDept = control.dataset.dept; expandedRateId = ""; renderResults(); };
  });
}

function mappingBadges(rate) {
  const labels = Object.fromEntries(TYPE_FILTER.FILTERS.map(({ id, label }) => [id, label]));
  return TYPE_FILTER.classifyRate(rate).map((id) => `<span>${esc(labels[id])}</span>`).join("") || "<em>Только «Все»</em>";
}

function detailRow(rate) {
  const [status, tone] = statusMeta(rate);
  const sourceLink = /^https:\/\//i.test(rate.doc || "") ? `<a href="${esc(rate.doc)}" target="_blank" rel="noopener">Открыть первоисточник ↗</a>` : "";
  return `<tr class="detail-row"><td colspan="6"><div class="detail"><div><span>Профессия</span><h3>${esc(rate.prof)}</h3><p>${esc(rate.cond || "Условия не указаны")}</p></div><dl><div><dt>Указано для</dt><dd>${esc(rate.content || "Не указано")}</dd></div><div><dt>Попадает в фильтры</dt><dd class="mapping">${mappingBadges(rate)}</dd></div><div><dt>Статус</dt><dd><span class="status ${tone}">${esc(status)}</span></dd></div></dl><footer>${sourceLink}</footer></div></td></tr>`;
}

function renderResults() {
  renderDepartments();
  const rates = filteredRates();
  const selectedLabel = TYPE_FILTER.FILTERS.find(({ id }) => id === selectedType)?.label;
  const rows = rates.map((rate) => {
    const [status, tone] = statusMeta(rate);
    const expanded = String(rate.id) === String(expandedRateId);
    return `<tr class="rate-row ${expanded ? "selected" : ""}"><td>${esc(rate.dept)}</td><td><button type="button" data-rate-id="${esc(rate.id)}" aria-expanded="${expanded}"><b>${esc(rate.prof)}</b><small>${esc(rate.content)}</small></button></td><td>${esc(rate.cond)}</td><td>${esc(rate.unit)}</td><td><b>${rate.amount ? rub(rate.amount) : "—"}</b></td><td><span class="status ${tone}">${esc(status)}</span></td></tr>${expanded ? detailRow(rate) : ""}`;
  }).join("");
  const empty = `<div class="empty"><b>Ничего не найдено</b><p>Измените запрос, цех или тип производства.</p></div>`;
  $("#rateTable").innerHTML = `<div class="table-meta" aria-live="polite"><span><b>${rates.length}</b> позиций · ${esc(selectedLabel)}${selectedDept ? ` · ${esc(selectedDept)}` : ""}</span><span>Нажмите на профессию, чтобы проверить mapping</span></div>${rates.length ? `<div class="table-wrap"><table><thead><tr><th>Цех</th><th>Профессия</th><th>Условие</th><th>Ед.</th><th>Мин. ставка</th><th>Статус</th></tr></thead><tbody>${rows}</tbody></table></div>` : empty}`;
  document.querySelectorAll("[data-rate-id]").forEach((control) => {
    control.onclick = () => { expandedRateId = String(expandedRateId) === control.dataset.rateId ? "" : control.dataset.rateId; renderResults(); };
  });
}

function bindPage() {
  document.querySelectorAll("[data-type]").forEach((control) => {
    control.onclick = () => {
      selectedType = control.dataset.type;
      selectedDept = "";
      expandedRateId = "";
      updateTypeInUrl();
      document.querySelectorAll("[data-type]").forEach((item) => {
        const active = item.dataset.type === selectedType;
        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", String(active));
      });
      $("#typeDescription").textContent = descriptions[selectedType];
      revealActiveType();
      renderResults();
    };
  });
  $("#rateSearch").oninput = () => { expandedRateId = ""; renderResults(); };
  $("#clearFilters").onclick = () => { selectedType = "all"; selectedDept = ""; expandedRateId = ""; $("#rateSearch").value = ""; updateTypeInUrl(); document.querySelectorAll('[data-type]').forEach((item) => { const active = item.dataset.type === "all"; item.classList.toggle("active", active); item.setAttribute("aria-selected", String(active)); }); $("#typeDescription").textContent = descriptions.all; renderResults(); };
}

if (RATES.length && TYPE_FILTER?.FILTERS?.length) {
  $("#app").innerHTML = page();
  bindPage();
  renderResults();
  revealActiveType();
} else {
  $("#app").innerHTML = '<div class="load-error"><b>Не удалось загрузить ставки</b><p>Обновите страницу.</p></div>';
}
