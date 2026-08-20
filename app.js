const R = window.KINORATES_DATA || [];
const S = window.KINORATES_SOURCES || [];
const M = window.KINORATES_MARKET_DATA || [];
const TYPE_FILTER = window.KINORATES_TYPE_FILTER;
const SITE_UPDATES = window.KINORATES_SITE_UPDATES || [];
const $ = (selector) => document.querySelector(selector);
const rub = (n) => `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(+n || 0)} ₽`;
const dec2 = (n) => Math.round((+n || 0) * 100) / 100;
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
const normalizeSearch = (value) => String(value ?? "").toLocaleLowerCase("ru-RU").replaceAll("ё", "е").trim();
const appScriptUrl = document.currentScript?.src || location.href;
const pdfAssetBase = new URL(appScriptUrl.includes("/preview-v4/chat-prototype/") ? "../../vendor/" : "vendor/", appScriptUrl);
const statusLabel = (status, rate) => {
  if (["archive", "expired"].includes(status)) {
    const letterYear = String(rate?.src || "").match(/письм[^·]*(20\d{2})/i)?.[1];
    if (letterYear) return `Письмо ${letterYear}`;
  }
  return ({ fresh2026: "Письмо 2026", official2026: "Рекомендации 2026", verified2025: "Письмо 2025", verified2024: "Письмо 2024", verified2023: "Письмо 2023", market2025: "Рыночный ориентир", archive: "Архив", expired: "Архив", no_public_rate: "Без публичного тарифа", check: "Справочная запись", newdoc: "Первичный документ" })[status] || "Справочная запись";
};
const statusTone = (status) => {
  if (["fresh2026", "official2026"].includes(status)) return "current";
  if (["verified2025", "verified2024", "verified2023"].includes(status)) return "previous";
  if (status === "market2025") return "market";
  if (status === "no_public_rate") return "unpublished";
  return "archive";
};

const lazyScriptLoads = new Map();
let pdfFontsReady = Boolean(window.KINORATES_PDF_RUNTIME_READY && window.pdfMake?.createPdf);
function loadScriptOnce(src, integrity) {
  if (lazyScriptLoads.has(src)) return lazyScriptLoads.get(src);
  const promise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src; if (/^https?:/i.test(src) && new URL(src).origin !== location.origin) script.crossOrigin = "anonymous"; script.integrity = integrity;
    script.onload = resolve;
    script.onerror = () => { lazyScriptLoads.delete(src); reject(new Error(`Не удалось загрузить ${src}`)); };
    document.head.appendChild(script);
  });
  lazyScriptLoads.set(src, promise); return promise;
}
async function ensureExcelJS() {
  if (window.ExcelJS) return;
  await loadScriptOnce("https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js", "sha384-Pqp51FUN2/qzfxZxBCtF0stpc9ONI6MYZpVqmo8m20SoaQCzf+arZvACkLkirlPz");
  if (!window.ExcelJS) throw new Error("ExcelJS unavailable");
}
async function ensurePdfMake() {
  if (window.pdfMake?.createPdf && pdfFontsReady) return;
  await loadScriptOnce(new URL("pdfmake.min.js", pdfAssetBase).href, "sha384-G23ofMOEI98f9UnroUBjDi6Ll55Y5E6bOX4VAMJo0nIbuQRIxzn0g4athUOb58zs");
  await loadScriptOnce(new URL("vfs_fonts.js", pdfAssetBase).href, "sha384-pv+tpy6KGI5sKXJDf7oGPdvyVNKYXfAmDYpZ3r3PNP0d13PJQ6YMiiAEndd5sU15");
  if (!window.pdfMake?.createPdf) throw new Error("pdfMake unavailable");
  pdfFontsReady = true;
}

const sections = [
  ["knowledge", "▤", "Как читать ставки"], ["home", "≡", "Справочник ставок"],
  ["market", "⌁", "Рынок и аналитика"], ["resources", "↗", "Цеховые письма"], ["updates", "◷", "Обновления"],
];
const initialProductionType = new URL(location.href).searchParams.get("type");
let selectedDept = "";
let selectedRate = null;
let selectedProductionType = TYPE_FILTER?.normalizeFilterId(initialProductionType) || "all";
let rateQuery = "";
let selectedRateStatus = "";
const BUDGET_STORAGE_KEY = "kinorates-budget-v4";
const budgetItems = loadBudget();
const recentRates = [];
function migrateLegacyBudget(saved) {
  if (!Array.isArray(saved)) return [];
  return saved.map((entry) => {
    if (entry?.prof) return { periods: 1, extra: 0, tax: 0, start: "", end: "", comment: "", ...entry };
    const rate = R.find((row) => String(row.id) === String(entry?.id));
    if (!rate) return null;
    const qty = rate.unit === "месяц" ? (+entry.people || +entry.qty || 1) : ((+entry.qty || 1) * (+entry.people || 1));
    return { id: rate.id, prof: rate.prof, dept: rate.dept, unit: rate.unit, rate: +entry.rate || +rate.amount || 0, qty, periods: 1, extra: 0, tax: (+entry.tax || 0) * 100, start: entry.start || "", end: entry.end || "", comment: "Перенесено из прежней версии сметы" };
  }).filter(Boolean);
}
function loadBudget() {
  try {
    const current = localStorage.getItem(BUDGET_STORAGE_KEY), privateDraft = localStorage.getItem("kinorates-private-budget"), previousProduction = localStorage.getItem("kinorates-budget-v3");
    const saved = migrateLegacyBudget(JSON.parse(current || privateDraft || previousProduction || "[]"));
    saved.forEach((item) => {
      if (!usesAttachmentDates(item.unit)) { item.start = ""; item.end = ""; }
      else if (item.start && item.end) item.periods = periodsFromDates(item.start, item.end, item.unit, item.periods);
    });
    if (!current && saved.length) localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(saved));
    return saved;
  } catch { return []; }
}
function saveBudget() { try { localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgetItems)); } catch {} }

function sidebar(route) {
  const gross = budgetItems.reduce((sum, x) => sum + itemGross(x), 0);
  return `<aside class="sidebar" id="sidebar"><a class="brand" href="#home"><b>K</b><span>KinoRates<small>Обновлено 20 августа 2026</small></span></a><button class="new-button" data-focus-search>⌕ <span>Найти ставку</span></button><nav>${sections.map(([id, icon, label]) => `<a href="#${id}" class="${route === id ? "active" : ""}"><i>${icon}</i><span>${label}</span></a>`).join("")}</nav><a class="budget-shortcut ${route === "projects" ? "active" : ""}" href="#projects"><span>Рабочая смета</span><b data-budget-count>${budgetItems.length} поз.</b><strong data-budget-total>${rub(gross)}</strong></a><div class="history" id="recentRates">${recentMarkup()}</div><footer><a href="#about">О проекте</a><a href="#contacts">Контакты</a><button data-feedback>Обратная связь</button><button data-contribution data-contribution-kind="rate">Сообщить новую ставку</button><button data-privacy>Конфиденциальность и cookie</button></footer></aside>`;
}
function recentMarkup() {
  return `<details class="recent-menu"><summary>Недавно смотрели <span>${recentRates.length || ""}</span></summary><div class="recent-popover">${recentRates.length ? recentRates.map((r) => `<a href="#home" data-query="${esc(r.prof)}"><i>◌</i><span>${esc(r.prof)}</span></a>`).join("") : `<p>Открытые ставки появятся здесь</p>`}</div></details>`;
}
function rememberRate(rate) {
  if (!rate) return;
  const previous = recentRates.findIndex((r) => r.id === rate.id); if (previous >= 0) recentRates.splice(previous, 1);
  recentRates.unshift(rate); recentRates.splice(4);
  const history = $("#recentRates"); if (history) { history.innerHTML = recentMarkup(); bindQueryLinks(); }
}
function topbar(route) {
  const label = sections.find((x) => x[0] === route)?.[2] || ({ about: "О проекте", contacts: "Контакты", projects: "Рабочая смета", article: "Материал" })[route] || "KinoRates";
  const action = route === "contacts" ? "" : '<button class="quiet" data-contribution data-contribution-kind="rate">Поделиться ставкой</button>';
  return `<header class="topbar"><button class="menu" id="menu">☰</button><div class="breadcrumb">KinoRates <span>/</span> ${label}</div><div class="top-actions">${action}</div></header>`;
}
function attachmentFactor(start, end) {
  if (!start || !end) return null;
  const first = new Date(`${start}T12:00:00`), last = new Date(`${end}T12:00:00`);
  if (!Number.isFinite(first.getTime()) || !Number.isFinite(last.getTime()) || last < first) return null;
  const startDay = first.getDate(), endDay = last.getDate();
  const startMonthDays = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const endMonthDays = new Date(last.getFullYear(), last.getMonth() + 1, 0).getDate();
  let completeMonths = (last.getFullYear() - first.getFullYear()) * 12 + last.getMonth() - first.getMonth();
  if (endDay < startDay) completeMonths -= 1;
  const startPart = (startMonthDays - startDay + 1) / startMonthDays;
  const endPart = endDay / endMonthDays;
  return startDay > endDay ? completeMonths + startPart + endPart : completeMonths - 1 + startPart + endPart;
}
function usesAttachmentDates(unit) { return normalizeSearch(unit) === "месяц"; }
function itemNet(x) { const factor = usesAttachmentDates(x.unit) ? attachmentFactor(x.start, x.end) : null, periods = factor == null ? (+x.periods || 0) : factor; return (+x.rate || 0) * (+x.qty || 0) * periods + (+x.extra || 0); }
function itemGross(x) { const tax = Math.min(99.99, Math.max(0, +x.tax || 0)) / 100; return itemNet(x) / (1 - tax); }
function shortDate(value) { if (!value) return ""; const [year, month, day] = value.split("-"); return `${day}.${month}.${year}`; }
function budgetFormula(x) {
  const attached = usesAttachmentDates(x.unit) && attachmentFactor(x.start, x.end) != null;
  const base = attached ? `${shortDate(x.start)}–${shortDate(x.end)} · ${dec2(x.periods)} периода · расчёт по календарным долям месяцев` : `${rub(x.rate)} × ${dec2(x.qty)} × ${dec2(x.periods)}`;
  return `${base}${+x.extra ? ` + доплата ${rub(x.extra)}` : ""} = ${rub(itemNet(x))}${+x.tax ? `; ÷ (1 − ${dec2(x.tax)}%) = ${rub(itemGross(x))}` : "; без налога"}`;
}
function budgetProductionTypes(item) {
  if (item?.custom || !TYPE_FILTER?.classifyRate) return [];
  const sourceRate = R.find((rate) => String(rate.id) === String(item?.id));
  if (!sourceRate) return [];
  const typeIds = TYPE_FILTER.classifyRate(sourceRate);
  return TYPE_FILTER.FILTERS.filter(({ id }) => id !== "all" && typeIds.includes(id));
}
function budgetProductionLabel(item) { return budgetProductionTypes(item).map(({ label }) => label).join(" · "); }
function budgetProductionMarkup(item) {
  const types = budgetProductionTypes(item);
  return types.length ? `<div class="budget-production-types" aria-label="Формат производства">${types.map(({ id, label }) => `<span class="budget-production-type" data-type="${id}">${esc(label)}</span>`).join("")}</div>` : "";
}
function periodsFromDates(start, end, unit, fallback) {
  if (!start || !end) return fallback;
  const first = new Date(`${start}T12:00:00`), last = new Date(`${end}T12:00:00`);
  if (!Number.isFinite(first.getTime()) || !Number.isFinite(last.getTime()) || last < first) return fallback;
  return dec2((last - first) / 86400000 / 30);
}
function xml(value) { return String(value ?? "").replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char]); }
function downloadBlob(content, type, filename) { const blob = content instanceof Blob ? content : new Blob([content], { type }), url = URL.createObjectURL(blob), link = document.createElement("a"); link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000); }
function safeSheetText(value) { const text = String(value ?? "").replace(/[\r\n\t]+/g, " "), trimmed = text.trimStart(); return /^[=+\-@]/.test(trimmed) ? `'${trimmed}` : text; }
function exportName(ext) { return `KinoRates_Рабочая_смета_${new Date().toISOString().slice(0, 10)}.${ext}`; }
async function exportBudgetExcel() {
  if (!budgetItems.length) { alert("Сначала добавьте хотя бы одну позицию в смету."); return; }
  await ensureExcelJS();
  const workbook = new ExcelJS.Workbook(), sheet = workbook.addWorksheet("Рабочая смета");
  workbook.creator = "KinoRates"; workbook.title = "KinoRates — Рабочая смета"; workbook.company = "KinoRates"; workbook.created = new Date();
  sheet.mergeCells("A1:N1"); const title = sheet.getCell("A1"); title.value = "KinoRates · Рабочая смета"; title.font = { name: "Arial", size: 18, bold: true, color: { argb: "FFFFFFFF" } }; title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6D4AFF" } }; title.alignment = { vertical: "middle" }; sheet.getRow(1).height = 36;
  sheet.mergeCells("A2:N2"); const meta = sheet.getCell("A2"); meta.value = `Экспортировано ${new Date().toLocaleString("ru-RU")} · ${budgetItems.length} позиций`; meta.font = { name: "Arial", size: 9, color: { argb: "FF77777F" } }; meta.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F2F7" } }; sheet.getRow(2).height = 23;
  const headers = ["Статья", "Цех", "Формат", "Единица", "Ставка", "Количество", "Периоды", "Прикрепление", "Открепление", "Доплата", "Налог", "Без налога", "С налогом", "Заметка"];
  sheet.addRow([]); sheet.addRow(headers);
  budgetItems.forEach((x) => { const monthly = usesAttachmentDates(x.unit); sheet.addRow([safeSheetText(x.prof), safeSheetText(x.dept), safeSheetText(budgetProductionLabel(x)), safeSheetText(x.unit), +x.rate || 0, +x.qty || 0, (monthly ? attachmentFactor(x.start, x.end) : null) ?? (+x.periods || 0), monthly && x.start ? new Date(`${x.start}T12:00:00`) : "", monthly && x.end ? new Date(`${x.end}T12:00:00`) : "", +x.extra || 0, (+x.tax || 0) / 100, itemNet(x), itemGross(x), safeSheetText(x.comment)]); });
  const first = 5, last = 4 + budgetItems.length, totalRow = sheet.addRow(["", "", "", "", "", "", "", "", "", "", "ИТОГО", { formula: `SUM(L${first}:L${last})`, result: budgetItems.reduce((s, x) => s + itemNet(x), 0) }, { formula: `SUM(M${first}:M${last})`, result: budgetItems.reduce((s, x) => s + itemGross(x), 0) }, ""]);
  sheet.columns = [30, 20, 24, 13, 15, 11, 11, 14, 14, 15, 11, 17, 17, 32].map((width) => ({ width }));
  const header = sheet.getRow(4); header.height = 28; header.eachCell((cell) => { cell.font = { name: "Arial", size: 9, bold: true, color: { argb: "FF4C4855" } }; cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEDEAFB" } }; cell.alignment = { vertical: "middle", wrapText: true }; cell.border = { bottom: { style: "thin", color: { argb: "FFCBC5E6" } } }; });
  sheet.eachRow((row, n) => { if (n >= first) { row.height = 28; row.font = { name: "Arial", size: 10, bold: n === totalRow.number }; row.alignment = { vertical: "middle", wrapText: true }; row.eachCell((cell) => { cell.border = { bottom: { style: "thin", color: { argb: "FFE5E4E9" } } }; }); } });
  ["E", "J", "L", "M"].forEach((col) => { sheet.getColumn(col).numFmt = '#,##0.00 "₽"'; }); ["F", "G"].forEach((col) => { sheet.getColumn(col).numFmt = "0.00"; }); ["H", "I"].forEach((col) => { sheet.getColumn(col).numFmt = "dd.mm.yyyy"; }); sheet.getColumn("K").numFmt = "0.00%";
  totalRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F2F7" } }; sheet.views = [{ state: "frozen", ySplit: 4 }]; sheet.autoFilter = { from: "A4", to: `N${last}` }; sheet.pageSetup = { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 };
  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", exportName("xlsx"));
}
async function exportBudgetPdf() {
  if (!budgetItems.length) { alert("Сначала добавьте хотя бы одну позицию в смету."); return; }
  const button = $("[data-export-pdf]"), label = button?.textContent || "PDF";
  if (button) { button.disabled = true; button.textContent = "Готовим…"; }
  try {
    await ensurePdfMake();
    const money = (n) => `${new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(+n || 0)} ₽`;
    const body = [["Статья / цех", "Ставка", "Кол-во", "Период", "Прикрепление", "Открепление", "Доплата", "Налог", "Без налога", "С налогом"].map((text) => ({ text, bold: true, color: "#ffffff" }))];
    budgetItems.forEach((x) => { const monthly = usesAttachmentDates(x.unit), production = budgetProductionLabel(x); body.push([{ text: `${x.prof}\n${x.dept} · ${x.unit}${production ? `\nФормат: ${production}` : ""}` }, money(x.rate), dec2(x.qty), dec2((monthly ? attachmentFactor(x.start, x.end) : null) ?? x.periods), monthly ? shortDate(x.start) || "—" : "—", monthly ? shortDate(x.end) || "—" : "—", money(x.extra), `${dec2(x.tax)}%`, money(itemNet(x)), money(itemGross(x))]); });
    body.push([{ text: "ИТОГО", bold: true, colSpan: 8 }, {}, {}, {}, {}, {}, {}, {}, { text: money(budgetItems.reduce((s, x) => s + itemNet(x), 0)), bold: true }, { text: money(budgetItems.reduce((s, x) => s + itemGross(x), 0)), bold: true }]);
    const doc = { pageSize: "A4", pageOrientation: "landscape", pageMargins: [28, 32, 28, 32], info: { title: "KinoRates — Рабочая смета", author: "KinoRates", creator: "KinoRates" }, defaultStyle: { font: "Roboto", fontSize: 7.3, color: "#27262D" }, content: [{ text: "KINORATES", bold: true, fontSize: 8, color: "#6D4AFF", characterSpacing: 1.2, margin: [0, 0, 0, 4] }, { text: "Рабочая смета", bold: true, fontSize: 18, margin: [0, 0, 0, 4] }, { text: `${budgetItems.length} позиций · сформировано ${new Date().toLocaleString("ru-RU")}`, color: "#77777F", margin: [0, 0, 0, 13] }, { table: { headerRows: 1, widths: [116, 52, 31, 33, 52, 52, 50, 34, 59, 59], body }, layout: { fillColor: (i) => i === 0 ? "#6D4AFF" : i === body.length - 1 ? "#F3F2F7" : null, hLineColor: () => "#E5E4E9", vLineColor: () => "#E5E4E9", paddingLeft: () => 4, paddingRight: () => 4, paddingTop: () => 5, paddingBottom: () => 5 } }], footer: (current, count) => ({ columns: [{ text: "KinoRates · предварительный расчёт", alignment: "left" }, { text: `${current} / ${count}`, alignment: "right" }], margin: [28, 8, 28, 0], fontSize: 7, color: "#88858E" }) };
    const pdfBlob = await new Promise((resolve, reject) => {
      try { window.pdfMake.createPdf(doc).getBlob(resolve); } catch (error) { reject(error); }
    });
    downloadBlob(pdfBlob, "application/pdf", exportName("pdf"));
  } catch (error) {
    console.error("PDF export failed", error);
    alert("Не удалось сформировать PDF. Обновите страницу и попробуйте ещё раз.");
  } finally {
    if (button) { button.disabled = false; button.textContent = label; }
  }
}
function addCustomBudgetItem() { budgetItems.push({ id: `custom-${Date.now()}`, custom: true, prof: "Новая статья", dept: "Своя статья", unit: "единица", rate: 0, qty: 1, periods: 1, extra: 0, tax: 0, start: "", end: "", comment: "" }); saveBudget(); render(); }
const assistantBar = (placeholder = "Спросите о ставках, источниках или смете…") => `<div class="assistant-bar"><textarea rows="1" placeholder="${placeholder}"></textarea><div class="assistant-actions"><button>＋</button><span>Использует данные KinoRates</span><button class="send">↑</button></div></div>`;

const productionTypeDescriptions = {
  all: "Весь справочник без исключений и новых категорий.",
  "cinema-series": "Общие и специальные ставки для полного метра и сериалов — в одном режиме.",
  "commercial-media": "Реклама, клипы, музыкальное видео, ТВ и шоу — только когда этот тип прямо указан в данных. Киношные ставки не пересчитываются.",
};
function updateProductionTypeInUrl() {
  const url = new URL(location.href);
  if (selectedProductionType === "all") url.searchParams.delete("type");
  else url.searchParams.set("type", selectedProductionType);
  history.replaceState(history.state, "", `${url.pathname}${url.search}${url.hash}`);
}
function productionTypePanel() {
  const counts = TYPE_FILTER.countByType(R);
  const tabs = TYPE_FILTER.FILTERS.map(({ id, label }) => `<button type="button" role="tab" aria-selected="${selectedProductionType === id}" class="${selectedProductionType === id ? "active" : ""}" data-production-type="${id}"><span>${esc(label)}</span><b>${counts[id]}</b></button>`).join("");
  return `<section class="production-type-panel"><div class="production-type-tabs" role="tablist" aria-label="Тип производства">${tabs}</div><p>${esc(productionTypeDescriptions[selectedProductionType])}</p></section>`;
}

function home() {
  const current = R.filter((x) => ["fresh2026", "official2026"].includes(x.status)).length;
  const typedRates = R.filter((rate) => TYPE_FILTER.matchesType(rate, selectedProductionType));
  const depts = [...new Set(typedRates.map((x) => x.dept))].sort((a, b) => a.localeCompare(b, "ru"));
  return `<div class="registry-page"><section class="registry-intro"><div><span class="eyebrow">KINORATES · ОБНОВЛЕНО 20.08.2026</span><h1>Справочник ставок</h1><p>Рекомендованные ставки специалистов российского кино. Финальная стоимость определяется продюсером и контрагентом по договорённости.</p></div><button class="feedback-link" data-feedback>Нашли неточность? Напишите нам</button></section><div class="source-strip"><div class="registry-stats"><b>${R.length}</b><span>позиций</span><b>${current}</b><span>сверено в 2026</span></div><a href="https://docs.google.com/spreadsheets/d/19GyzCN-CKlAehf2u7-hJyL4lzIsNtIu06t0vjsYflt4/edit?gid=0#gid=0" target="_blank" rel="noopener"><span>Первоисточники</span><b>МПК</b><small>открыть таблицу ↗</small></a><a href="https://docs.google.com/spreadsheets/d/1BCgusuck7uhHvDZ2d-nUVyjZHlzrf05286fwpahlwdE/edit?gid=0#gid=0" target="_blank" rel="noopener"><span>Первоисточники</span><b>Точно продюсер</b><small>открыть таблицу ↗</small></a><a href="#resources"><span>Первоисточники</span><b>Цеховые письма</b><small>${S.length} документов →</small></a></div>${productionTypePanel()}<div class="registry-workspace"><aside class="dept-list"><header><h2>Цеха</h2><span>${depts.length}</span></header><button class="${selectedDept ? "" : "active"}" data-dept="">Все цеха <em>${typedRates.length}</em></button>${depts.map((d) => `<button class="${selectedDept === d ? "active" : ""}" data-dept="${esc(d)}">${esc(d)} <em>${typedRates.filter((x) => x.dept === d).length}</em></button>`).join("")}</aside><section class="registry-main"><div class="registry-controls"><div class="ai-search main-search"><span>⌕</span><input id="rateSearch" value="${esc(rateQuery)}" placeholder="Профессия, цех или условие — например «администратор» или «смена 12»"></div><select id="rateStatus" aria-label="Фильтр по статусу"><option value=""${selectedRateStatus ? "" : " selected"}>Все статусы</option><option value="new"${selectedRateStatus === "new" ? " selected" : ""}>Сверено в 2026</option><option value="old"${selectedRateStatus === "old" ? " selected" : ""}>Архив и ориентиры</option></select><button class="primary budget-open" data-new data-budget-indicator>Смета · ${budgetItems.length}</button></div><div class="registry-layout"><div><div class="suggested"><span>Быстрый поиск:</span><button>оператор-постановщик</button><button>гаффер</button><button>второй режиссёр</button><button>монтаж</button></div><div id="rateTable"></div></div></div></section></div><div class="toast" id="toast" role="status" aria-live="polite"></div></div>`;
}
function homeV2() {
  const current = R.filter((x) => ["fresh2026", "official2026"].includes(x.status)).length, historical = R.length - current;
  return home().replace(`<div class="registry-stats"><b>${R.length}</b><span>позиций</span><b>${current}</b><span>сверено в 2026</span></div>`, `<div class="registry-stats"><div><b>${R.length}</b><span>всего позиций</span></div><div><b>${current}</b><span>сверено в 2026</span></div><div><b>${historical}</b><span>архив и рынок</span></div></div>`);
}
function projects() {
  const net = budgetItems.reduce((sum, x) => sum + itemNet(x), 0), gross = budgetItems.reduce((sum, x) => sum + itemGross(x), 0);
  return pageHead("Предварительный расчёт", "Рабочая смета", "Расчёт строк по ставке, количеству, периоду, датам, доплатам и налогам. Данные сохраняются только в вашем браузере.", '<div class="budget-actions"><button class="quiet" data-add-custom>＋ Своя статья</button><button class="quiet" data-export-excel>Excel</button><button class="quiet" data-export-pdf>PDF</button><a class="primary button-link" href="#home">＋ Добавить ставку</a></div>') + `<datalist id="taxRates"><option value="6"><option value="7"><option value="8"><option value="9"><option value="10"></datalist><div class="budget-workspace"><section class="budget-sheet">${budgetItems.length ? `<div class="budget-table-head"><span>Позиция и расчёт</span><span>Сумма</span></div>${budgetItems.map((x, index) => `<article class="budget-item"><div class="budget-item-main"><div class="budget-position">${x.custom ? `<label>Название статьи<input value="${esc(x.prof)}" data-budget-field="prof" data-budget-index="${index}"></label>` : `<b>${esc(x.prof)}</b>`}<small>${esc(x.dept)} · ${esc(x.unit)}</small></div><label>Ставка<input type="number" min="0" step="0.01" value="${dec2(x.rate)}" data-budget-field="rate" data-budget-index="${index}"></label><label>Кол-во<input type="number" min="0" step="1" value="${dec2(x.qty)}" data-budget-field="qty" data-budget-index="${index}"></label><label>Периоды<input type="number" min="0" step="0.01" value="${dec2(x.periods)}" data-budget-field="periods" data-budget-index="${index}"></label><strong>${rub(itemGross(x))}</strong><button data-budget-delete="${index}" aria-label="Удалить позицию">×</button></div><div class="budget-item-meta"><label>Начало<input class="date-input" type="date" value="${esc(x.start)}" data-budget-field="start" data-budget-index="${index}"></label><label>Окончание<input class="date-input" type="date" value="${esc(x.end)}" data-budget-field="end" data-budget-index="${index}"></label><label>Доплата<input type="number" step="0.01" value="${dec2(x.extra)}" data-budget-field="extra" data-budget-index="${index}"></label><label>Налог, %<input type="number" list="taxRates" min="0" step="0.5" value="${dec2(x.tax)}" data-budget-field="tax" data-budget-index="${index}"></label><label class="budget-comment">Заметка<input value="${esc(x.comment)}" data-budget-field="comment" data-budget-index="${index}" placeholder="Например: особые условия расчёта"></label></div><div class="budget-formula">${rub(x.rate)} × ${dec2(x.qty)} × ${dec2(x.periods)}${+x.extra ? ` + ${rub(x.extra)}` : ""} = ${rub(itemNet(x))}${+x.tax ? `; налог ${dec2(x.tax)}% → ${rub(itemGross(x))}` : "; без налога"}</div><div class="budget-item-summary"><span>Без налога <b>${rub(itemNet(x))}</b></span><span>С налогом <b>${rub(itemGross(x))}</b></span></div></article>`).join("")}` : `<div class="budget-empty-state"><i>□</i><h2>Смета пока пуста</h2><p>Добавьте ставку из справочника или создайте собственную статью.</p><button class="primary" data-add-custom>＋ Добавить свою статью</button></div>`}</section><aside class="budget-total"><span>Позиций</span><b>${budgetItems.length}</b><div><span>Без налога</span><strong>${rub(net)}</strong></div><div><span>С налогом</span><strong>${rub(gross)}</strong></div><p>Расчёт не является офертой. Учитывайте условия и период первоисточника каждой ставки.</p></aside></div>`;
}
function budgetItemMarkup(x, index) {
  const title = x.custom ? `<label>Название статьи<input value="${esc(x.prof)}" data-budget-field="prof" data-budget-index="${index}"></label>` : `<b>${esc(x.prof)}</b>`;
  const taxPresets = [6, 7, 8, 9, 10], presetTax = taxPresets.includes(+x.tax);
  const attachmentEnabled = usesAttachmentDates(x.unit), attachmentDisabled = attachmentEnabled ? "" : "disabled";
  const attachmentFields = `<label class="budget-attachment${attachmentEnabled ? "" : " is-disabled"}">Дата прикрепления<input class="date-input" type="date" ${attachmentDisabled} value="${esc(x.start)}" data-budget-field="start" data-budget-index="${index}" title="${attachmentEnabled ? "Дата начала прикрепления" : "Доступно только для ставки за месяц"}"></label><label class="budget-attachment${attachmentEnabled ? "" : " is-disabled"}">Дата открепления<input class="date-input" type="date" ${attachmentDisabled} value="${esc(x.end)}" data-budget-field="end" data-budget-index="${index}" title="${attachmentEnabled ? "Дата окончания прикрепления" : "Доступно только для ставки за месяц"}"></label>`;
  const attachmentHint = attachmentEnabled ? "" : `<p class="budget-attachment-hint">Даты доступны только для ставки за месяц. Для смен, часов и других единиц расчёт идёт по количеству периодов.</p>`;
  return `<article class="budget-item">
    <div class="budget-item-main">
      <div class="budget-position">${title}<small>${esc(x.dept)} · ${esc(x.unit)}</small>${budgetProductionMarkup(x)}</div>
      <label>Ставка<input type="number" min="0" step="0.01" value="${dec2(x.rate)}" data-budget-field="rate" data-budget-index="${index}"></label>
      <label>Кол-во<input type="number" min="0" step="1" value="${dec2(x.qty)}" data-budget-field="qty" data-budget-index="${index}"></label>
      <label>Периоды<input type="number" min="0" step="0.01" value="${dec2(x.periods)}" data-budget-field="periods" data-budget-index="${index}"></label>
      <strong>${rub(itemGross(x))}</strong><button data-budget-delete="${index}" aria-label="Удалить позицию">×</button>
    </div>
    <div class="budget-item-meta">
      ${attachmentFields}
      <label>Доплата<input type="number" step="0.01" value="${dec2(x.extra)}" data-budget-field="extra" data-budget-index="${index}"></label>
      <label>Налог, %<div class="tax-control"><select data-tax-preset="${index}"><option value="" ${+x.tax === 0 ? "selected" : ""}>Без налога</option>${taxPresets.map((value) => `<option value="${value}" ${+x.tax === value ? "selected" : ""}>${value}%</option>`).join("")}<option value="manual" ${+x.tax !== 0 && !presetTax ? "selected" : ""}>Ввести вручную…</option></select><input class="tax-manual" type="number" min="0" max="99" step="0.01" value="${dec2(x.tax)}" data-budget-field="tax" data-budget-index="${index}" ${+x.tax === 0 || presetTax ? "hidden" : ""} placeholder="Процент"></div></label>
      ${attachmentHint}
      <label class="budget-comment">Заметка к позиции<input value="${esc(x.comment)}" data-budget-field="comment" data-budget-index="${index}" placeholder="Например: особые условия, дни или состав работ"></label>
    </div>
    <div class="budget-formula">${budgetFormula(x)}</div>
    <div class="budget-item-summary"><span>Без налога <b>${rub(itemNet(x))}</b></span><span>С налогом <b>${rub(itemGross(x))}</b></span></div>
  </article>`;
}
function projectsV2() {
  const net = budgetItems.reduce((sum, x) => sum + itemNet(x), 0), gross = budgetItems.reduce((sum, x) => sum + itemGross(x), 0);
  const actions = '<div class="budget-actions"><button class="quiet budget-action-custom" data-add-custom><span>+</span> Своя статья</button><button class="quiet budget-action-export" data-export-excel>Excel</button><button class="quiet budget-action-export" data-export-pdf>PDF</button><a class="primary button-link budget-action-primary" href="#home"><span>+</span> Добавить ставку</a></div>';
  const content = budgetItems.length ? `<div class="budget-table-head"><span>Позиция и расчёт</span><span>Сумма</span></div>${budgetItems.map(budgetItemMarkup).join("")}` : '<div class="budget-empty-state"><i>□</i><h2>Смета пока пуста</h2><p>Добавьте ставку из справочника или создайте собственную статью.</p><button class="primary" data-add-custom>＋ Добавить свою статью</button></div>';
  return pageHead("Предварительный расчёт", "Рабочая смета", "Для помесячных ставок прикрепление рассчитывается по календарным долям месяцев. Смены, дни, часы и аккорды считаются по количеству периодов.", actions) + `<div class="budget-workspace"><section class="budget-sheet">${content}</section><aside class="budget-total"><span>Позиций</span><b>${budgetItems.length}</b><div><span>Без налога</span><strong>${rub(net)}</strong></div><div><span>С налогом</span><strong>${rub(gross)}</strong></div><p>Налог рассчитывается делением на (1 − ставка налога), как в исходной таблице.</p></aside></div>`;
}
function rates() {
  return pageHead("Справочная база", "Ставки", "449 реальных записей KinoRates. Учитывайте условия и период источника до переноса значения в смету.", '<button class="quiet">Экспорт вида</button>') + `<div class="data-toolbar"><div class="ai-search"><span>⌕</span><input id="rateSearch" placeholder="Спросить или найти профессию, цех, условие…"></div><select id="rateStatus"><option value="">Все статусы</option><option value="new">Подтверждено 2026</option><option value="old">Архив и ориентиры</option></select></div><div class="suggested"><span>Попробуйте:</span><button>оператор-постановщик</button><button>гаффер</button><button>второй режиссёр</button><button>монтаж</button></div><div id="rateTable"></div>`;
}
let pageScrollFrame = 0;
function animatePageScrollTo(targetY, duration = 680) {
  const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const safeTargetY = Math.max(0, Math.min(targetY, maxY));
  const startY = window.scrollY, distance = safeTargetY - startY;
  cancelAnimationFrame(pageScrollFrame);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || Math.abs(distance) < 2) { window.scrollTo(0, safeTargetY); return; }
  const startedAt = performance.now();
  const step = (now) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = progress < .5 ? 4 * progress ** 3 : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    window.scrollTo(0, startY + distance * eased);
    if (progress < 1) pageScrollFrame = requestAnimationFrame(step);
  };
  pageScrollFrame = requestAnimationFrame(step);
}
function scrollOpenedRateIntoView(rateId, restoreScrollY = window.scrollY) {
  if (!window.matchMedia("(max-width: 780px)").matches) return;
  requestAnimationFrame(() => {
    window.scrollTo(0, restoreScrollY);
    requestAnimationFrame(() => {
    window.scrollTo(0, restoreScrollY);
    const row = [...document.querySelectorAll("[data-rate-id]")].find((item) => item.dataset.rateId === String(rateId));
    if (!row) return;
    const detail = row.nextElementSibling?.classList.contains("rate-detail-row") ? row.nextElementSibling : null;
    const detailStart = detail?.querySelector(".inline-detail-main") || detail || row;
    const stickyHeader = document.querySelector(".topbar")?.getBoundingClientRect().height || 54;
    const targetY = window.scrollY + detailStart.getBoundingClientRect().top - stickyHeader - 10;
    const distance = Math.abs(targetY - window.scrollY);
    animatePageScrollTo(targetY, Math.min(1200, Math.max(820, 620 + distance * .28)));
    });
  });
}
function drawRates() {
  rateQuery = $("#rateSearch")?.value ?? rateQuery; selectedRateStatus = $("#rateStatus")?.value ?? selectedRateStatus;
  const rawQuery = rateQuery.trim(), query = normalizeSearch(rawQuery), status = selectedRateStatus;
  const data = R.filter((r) => TYPE_FILTER.matchesType(r, selectedProductionType) && (!selectedDept || r.dept === selectedDept) && (!query || normalizeSearch(`${r.prof} ${r.dept} ${r.cond} ${r.content}`).includes(query)) && (!status || (status === "new" ? ["fresh2026", "official2026"].includes(r.status) : !["fresh2026", "official2026"].includes(r.status))));
  const contribution = TYPE_FILTER.contributionState(R, rawQuery, selectedProductionType);
  const productionLabel = TYPE_FILTER.FILTERS.find(({ id }) => id === selectedProductionType)?.label || "Все";
  const contributionMarkup = () => {
    if (!query || contribution.kind === "has-rate") return `<section class="rate-no-results"><b>С текущими фильтрами записей нет</b><p>Попробуйте убрать фильтр по цеху или статусу.</p></section>`;
    const missingRate = contribution.kind === "missing-rate";
    const title = missingRate ? contribution.profession : `Не нашли «${$("#rateSearch")?.value.trim() || contribution.profession}»?`;
    const description = missingRate
      ? `Профессия есть в KinoRates, но подтверждённой ставки для раздела «${productionLabel}» пока нет.`
      : "Если это профессия, которой ещё нет в справочнике, предложите её. Готовую ставку указывать необязательно.";
    const related = missingRate ? TYPE_FILTER.FILTERS.filter(({ id }) => !["all", selectedProductionType].includes(id)).map(({ id, label }) => {
      const count = contribution.allRows.filter((rate) => TYPE_FILTER.matchesType(rate, id)).length;
      return count ? `<span>${esc(label)} · ${count}</span>` : "";
    }).join("") : "";
    const kind = missingRate ? "rate" : "profession";
    return `<section class="rate-contribution"><div class="rate-contribution-copy"><i>${missingRate ? "↗" : "+"}</i><div><h3>${esc(title)}</h3><p>${esc(description)}</p>${related ? `<div class="rate-contribution-related">${related}<b>В выбранном разделе · нет данных</b></div>` : ""}</div></div><button class="primary" data-contribution data-contribution-kind="${kind}" data-contribution-profession="${esc(contribution.profession)}" data-contribution-type="${esc(selectedProductionType)}">${missingRate ? "Добавить ориентир" : "Предложить профессию"} →</button></section>`;
  };
  const detail = (r) => `<tr class="rate-detail-row"><td colspan="7"><div class="inline-detail"><div class="inline-detail-main"><span>${esc(r.dept)}</span><h3>${esc(r.prof)}</h3><p>${esc(r.cond || "Условия не указаны")}</p></div><div class="inline-detail-rate"><span>Рекомендованная ставка</span><b>${r.amount ? rub(r.amount) : "Не опубликована"}</b><small>${esc(r.unit)}</small><dl><div><dt>Статус</dt><dd>${esc(statusLabel(r.status, r))}</dd></div><div><dt>Регион</dt><dd>${esc(r.region || "Не указан")}</dd></div><div><dt>Период</dt><dd>${esc(r.eff || "Не указан")}</dd></div></dl></div><div class="inline-detail-notes">${r.ot ? `<section><b>Переработки</b><p>${esc(r.ot)}</p></section>` : ""}${r.extra ? `<section><b>Дополнительные условия</b><p>${esc(r.extra)}</p></section>` : ""}<div class="inline-detail-actions"><button class="primary" data-add-rate="${r.id}">${budgetItems.some((x) => x.id === r.id) ? "✓ Уже в смете" : "＋ Добавить в смету"}</button>${r.doc ? `<a href="${esc(r.doc)}" target="_blank" rel="noopener">Открыть первоисточник ↗</a>` : ""}</div></div></div></td></tr>`;
  $("#rateTable").innerHTML = `<div class="table-meta"><span>${data.length} позиций${selectedDept ? ` · ${esc(selectedDept)}` : ""}</span><span>${data.length ? "Нажмите на строку, чтобы раскрыть условия" : `Раздел: ${esc(productionLabel)}`}</span></div>${data.length ? `<div class="table-wrap"><table><thead><tr><th>Цех</th><th>Профессия</th><th>Условие</th><th>Ед.</th><th>Мин. ставка</th><th>Статус</th><th></th></tr></thead><tbody>${data.map((r) => `<tr data-rate-id="${r.id}" class="${selectedRate?.id === r.id ? "selected" : ""}"><td>${esc(r.dept)}</td><td><b>${esc(r.prof)}</b></td><td>${esc(r.cond)}</td><td>${esc(r.unit)}</td><td><b>${r.amount ? rub(r.amount) : "—"}</b></td><td><span class="status ${statusTone(r.status)}">${esc(statusLabel(r.status, r))}</span></td><td><button class="row-add ${budgetItems.some((x) => x.id === r.id) ? "added" : ""}" data-add-rate="${r.id}" aria-label="Добавить в смету">${budgetItems.some((x) => x.id === r.id) ? "✓" : "＋"}</button></td></tr>${selectedRate?.id === r.id ? detail(r) : ""}`).join("")}</tbody></table></div>` : contributionMarkup()}`;
  document.querySelectorAll("[data-rate-id]").forEach((row) => (row.onclick = () => { const rate = R.find((r) => String(r.id) === row.dataset.rateId); const restoreScrollY = window.scrollY; selectedRate = selectedRate?.id === rate?.id ? null : rate; const openedRateId = selectedRate?.id; if (selectedRate) rememberRate(selectedRate); drawRates(); if (openedRateId) scrollOpenedRateIntoView(openedRateId, restoreScrollY); }));
  document.querySelectorAll("[data-add-rate]").forEach((button) => (button.onclick = (event) => { event.stopPropagation(); addRate(button.dataset.addRate); }));
  bindContributionTriggers();
}
function addRate(id) {
  const rate = R.find((r) => String(r.id) === String(id)); if (!rate) return;
  const existing = budgetItems.find((x) => x.id === rate.id); if (existing) existing.qty += 1;
  else budgetItems.push({ id: rate.id, prof: rate.prof, dept: rate.dept, unit: rate.unit, rate: +rate.amount || 0, qty: 1, periods: 1, extra: 0, tax: 0, start: "", end: "", comment: "" });
  saveBudget();
  drawRates();
  document.querySelectorAll("[data-budget-indicator]").forEach((button) => (button.textContent = `Смета · ${budgetItems.length}`));
  const count = $("[data-budget-count]"), total = $("[data-budget-total]"); if (count) count.textContent = `${budgetItems.length} поз.`; if (total) total.textContent = rub(budgetItems.reduce((sum, x) => sum + itemGross(x), 0));
  const toast = $("#toast"); if (toast) { toast.textContent = `${rate.prof} добавлен в смету`; toast.classList.add("show"); clearTimeout(addRate.toastTimer); addRate.toastTimer = setTimeout(() => toast.classList.remove("show"), 2200); }
}
function knowledge() {
  const legend = [
    ["current", "Письмо 2026", "Ставка подтверждена опубликованным цеховым письмом 2026 года. Откройте строку, чтобы увидеть документ и условия, к которым относится сумма."],
    ["current", "Рекомендации 2026", "Ставка подтверждена официальной публикацией профессионального объединения 2026 года."],
    ["previous", "Письмо 2025 / 2024 / 2023", "Ставка подтверждена документом указанного года. Это проверенная историческая цифра, но более свежий соответствующий документ пока не найден."],
    ["market", "Рыночный ориентир", "Данные из исследования или рыночного среза. Это не обязательный тариф и не цеховое письмо — используйте цифру только как ориентир для сравнения."],
    ["archive", "Архив", "Архивная ставка или рыночный ориентир прошлых периодов. Текущая актуальность не подтверждена; переносить такую сумму в смету без дополнительного согласования не стоит."],
    ["unpublished", "Без публичного тарифа", "Профессия и источник подтверждены, но открытая тарифная ставка для этой работы не опубликована. Сумма определяется по договорённости."],
  ];
  return pageHead("Легенда справочника", "Как читать ставки", "Сначала выберите формат производства, затем сопоставьте сумму со статусом, условиями и первоисточником.") + `<section class="rate-reading-guide"><header><span>КАК НАЙТИ ПОДХОДЯЩУЮ СТАВКУ</span><h2>Три шага перед переносом в смету</h2></header><div class="rate-reading-steps"><article><i>01</i><h3>Выберите формат</h3><p>«Кино и сериал» и «Реклама / клип / ТВ» — разные выборки. В рекламном разделе показываются только ставки, которые прямо относятся к этому формату. Киношные значения в этот раздел не копируются и не пересчитываются.</p><nav><a href="?type=cinema-series#home">Кино и сериал →</a><a href="?type=commercial-media#home">Реклама / клип / ТВ →</a></nav></article><article><i>02</i><h3>Прочитайте всю запись</h3><p>Сопоставьте сумму со статусом, единицей расчёта, условиями, регионом и датой документа. Одинаковая цифра может относиться к разной работе.</p><span class="rate-reading-detail">Обозначения — ниже ↓</span></article><article><i>03</i><h3>Помогите дополнить данные</h3><p>Если для профессии нет подтверждённой ставки в нужном формате, предложите сумму или источник. Если самой профессии ещё нет, её можно предложить даже без готовой ставки.</p><div class="rate-reading-actions"><button class="primary" data-contribution data-contribution-kind="rate">Предложить ставку</button><button class="quiet" data-contribution data-contribution-kind="profession">Предложить профессию</button></div></article></div></section><section class="legend-intro" id="knowledge-statuses"><div><span>ЗАТЕМ ПОСМОТРИТЕ НА СТАТУС</span><h2>Одинаковые суммы могут означать разное</h2><p>Ставка читается вместе со статусом, годом документа, единицей расчёта и условиями. Сам по себе размер суммы ещё не говорит, подходит ли она вашему проекту.</p></div><ol><li><b>Статус</b><span>Тип и свежесть подтверждения</span></li><li><b>Единица</b><span>Смена, месяц, день или аккорд</span></li><li><b>Условия</b><span>Формат работы и ограничения</span></li><li><b>Первоисточник</b><span>Документ, на котором основана запись</span></li></ol></section><section class="legend-list"><header><div><span>ОБОЗНАЧЕНИЯ</span><h2>Что означает каждый статус</h2></div><p>Статус относится к конкретной записи и её сумме, а не ко всей профессии целиком.</p></header>${legend.map(([kind, title, text]) => `<article><span class="legend-mark ${kind}"></span><div><h3>${title}</h3><p>${text}</p></div></article>`).join("")}</section><aside class="legend-note"><div><b>Перед переносом в смету</b><p>Раскройте строку ставки и сопоставьте профессию, условия, единицу расчёта, регион и период действия документа.</p></div><a class="primary button-link" href="#home">Открыть справочник ставок →</a></aside>`;
}
function resources() {
  return pageHead("Профессиональные первоисточники", "Цеховые письма", "Документы объединений, гильдий и профессиональных сообществ, на которых основана справочная база.") + `<div class="resource-list">${S.map((s, i) => `<a href="${esc(s.url)}" target="_blank" rel="noopener"><i>${String(i + 1).padStart(2, "0")}</i><div><b>${esc(s.name)}</b><span>${esc(s.date)}</span></div><em>Открыть ↗</em></a>`).join("")}</div>`;
}
function market() {
  const sourceGroups = [...new Set(M.map((x) => x.source))];
  return pageHead("Дополнительный слой данных", "Рынок и аналитика", "Исследования и рыночные срезы дополняют цеховые письма и помогают увидеть контекст рынка.") + `<div class="market-meta"><span>${M.length} аналитических записей</span><span>${sourceGroups.length} групп источников</span><span>Годы и периоды указаны отдельно</span></div><div class="market-grid">${M.map((item) => `<article><div class="market-card-meta"><span>${esc(item.kind)}</span><b>${esc(item.year)}</b></div><h2>${esc(item.title)}</h2><p>${esc(item.text)}</p><small>${esc(item.period)}</small><a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.source)} ↗</a></article>`).join("")}</div>`;
}
function siteUpdates() {
  const entries = SITE_UPDATES.map((update) => `<article class="site-update-card"><div class="site-update-meta"><time datetime="${esc(update.date)}">${esc(update.dateLabel)}</time><span>${esc(update.type)}</span></div><div><h2>${esc(update.title)}</h2><p>${esc(update.text)}</p></div></article>`).join("");
  return pageHead("Журнал продукта", "Обновления KinoRates", "Основные изменения справочника, базы ставок и рабочих инструментов.") + `<section class="site-update-feed" aria-label="Лента обновлений">${entries}</section>`;
}
function contacts() {
  return pageHead("KinoRates", "Контакты", "Для предложений по сотрудничеству и совместных проектов.") + `<section class="contact-card"><div class="contact-copy"><span>СОТРУДНИЧЕСТВО</span><h2>Напишите, если хотите обсудить сотрудничество.</h2><p>Совместный проект, партнёрство или развитие KinoRates.</p></div><a class="contact-email" href="mailto:snegproduction@gmail.com"><span>Email</span><b>snegproduction@gmail.com</b><i>Написать ↗</i></a></section>`;
}
function about() {
  return pageHead("KinoRates", "О проекте", "Инструмент для прозрачной работы со ставками и производственной сметой.", '<div class="page-head-actions"><a class="primary button-link" href="#contacts">Контакты</a><button class="quiet" data-feedback data-feedback-topic="Хочу поделиться актуальной ставкой">Поделиться ставкой</button></div>') + `<div class="about-grid"><section><h2>Ставки и источники<br>в одном месте.</h2><p>KinoRates объединяет публичные цеховые письма, рекомендации, рыночные исследования и пользовательские допущения в одном рабочем контексте.</p><p>Справочник помогает найти данные, увидеть условия и первоисточник, а затем перенести выбранные позиции в прозрачную рабочую смету.</p></section><aside><div><span>Позиций</span><b>${R.length}</b></div><div><span>Источников</span><b>${S.length}</b></div><div><span>Цеха</span><b>${new Set(R.map((x) => x.dept)).size}</b></div><div><span>Ревизия</span><b>20.08.2026</b></div></aside></div>`;
}
function pageHead(kicker, title, description, action = "") { return `<section class="page-head"><div><span>${kicker}</span><h1>${title}</h1><p>${description}</p></div>${action}</section>`; }
function modal(type, feedbackTopic = "Нашёл ошибку", context = {}) {
  if (type === "project") return `<dialog class="modal"><button class="modal-close" data-close>×</button><span>НОВЫЙ ПРОЕКТ · 1 ИЗ 5</span><h2>Что вы производите?</h2><p>Ответ можно выбрать или написать обычными словами — помощник уточнит недостающие параметры.</p><div class="choice-grid"><button>Полный метр<small>80–150 минут</small></button><button>Сериал<small>Серии и блоки</small></button><button>Реклама<small>Ролик или кампания</small></button><button>Другое<small>Опишу самостоятельно</small></button></div>${assistantBar("Например: независимый полный метр, 90 минут…")}<footer><button class="quiet" data-close>Отмена</button><button class="primary">Продолжить →</button></footer></dialog>`;
  if (type === "contribution") {
    const kind = context.kind === "rate" ? "rate" : "profession", profession = esc(context.profession || ""), productionType = TYPE_FILTER.normalizeFilterId(context.productionType);
    const lockedProfession = kind === "rate" && Boolean(context.profession);
    const options = TYPE_FILTER.FILTERS.filter(({ id }) => id !== "all").map(({ id, label }) => `<option value="${id}"${productionType === id ? " selected" : ""}>${esc(label)}</option>`).join("");
    const title = kind === "profession" ? "Предложить профессию" : lockedProfession ? "Добавить недостающую ставку" : "Предложить ставку";
    const intro = kind === "profession" ? "Достаточно названия и формата. Если знаете ставку или источник — добавьте их тоже." : lockedProfession ? "Профессия и формат уже выбраны. Укажите сумму или источник, по которому её можно проверить." : "Укажите профессию, формат и сумму или источник, по которому её можно проверить.";
    return `<dialog class="modal feedback contribution-modal"><button class="modal-close" data-close>×</button><span>ДОПОЛНИТЬ KINORATES</span><h2>${title}</h2><p>${intro}</p><form id="contributionForm"><input class="feedback-honey" name="website" tabindex="-1" autocomplete="off"><input type="hidden" name="kind" value="${kind}"><div class="contribution-form-grid"><label class="wide">Профессия<input name="profession" value="${profession}" maxlength="160" required${lockedProfession ? " readonly" : ""}></label><label>Где применяется<select name="productionType" required><option value=""${productionType === "all" ? " selected" : ""} disabled>Выберите формат</option>${options}<option value="both">В обоих разделах</option></select></label><label>Единица<select name="unit"><option>за смену</option><option>за проект</option><option>за месяц</option><option>по договорённости</option></select></label><label>Ставка, ₽ — если известна<input name="rate" inputmode="numeric" placeholder="Например, 120 000" maxlength="40"></label><label>Контакт — необязательно<input name="email" type="email" autocomplete="email" placeholder="name@example.com"></label><label class="wide">Источник или короткий комментарий<textarea name="evidence" rows="3" maxlength="3000" placeholder="Ссылка, документ или откуда вы знаете эту цифру"></textarea></label></div><p class="feedback-status" id="contributionStatus" role="status" aria-live="polite"></p><small class="contribution-safety">Предложение не появится на сайте автоматически — сначала мы проверим формат и источник.</small><footer><button class="quiet" type="button" data-close>Закрыть</button><button class="primary" type="submit">Отправить на проверку</button></footer></form></dialog>`;
  }
  const topics = ["Нашёл ошибку", "Хочу поделиться актуальной ставкой", "Есть новое письмо цеха", "Другое предложение"];
  return `<dialog class="modal feedback"><button class="modal-close" data-close>×</button><span>KINORATES</span><h2>Помогите сделать справочник точнее</h2><p>Сообщите об ошибке или поделитесь актуальной ставкой и первоисточником.</p><form id="feedbackForm"><input class="feedback-honey" name="website" tabindex="-1" autocomplete="off"><label>Тема<select name="type">${topics.map((topic) => `<option${topic === feedbackTopic ? " selected" : ""}>${topic}</option>`).join("")}</select></label><label>Ваш email<input name="email" type="email" autocomplete="email" placeholder="name@example.com" required></label><label>Что нужно исправить или добавить<textarea name="message" rows="5" maxlength="5000" placeholder="Укажите цех, профессию, ставку и ссылку на первоисточник" required></textarea></label><p class="feedback-status" id="feedbackStatus" role="status" aria-live="polite"></p><footer><button class="quiet" type="button" data-close>Закрыть</button><button class="primary" type="submit">Отправить</button></footer></form></dialog>`;
}
function render() {
  const requestedRoute = location.hash.slice(1).split("/")[0] || "home";
  const route = requestedRoute === "rates" ? "home" : requestedRoute === "article" ? "knowledge" : requestedRoute;
  const pages = { home: homeV2, market, projects: projectsV2, knowledge, resources, updates: siteUpdates, about, contacts };
  $("#app").innerHTML = `<div class="shell">${sidebar(route)}<main>${topbar(route)}<div class="view">${(pages[route] || home)()}</div></main><button class="scrim" id="scrim"></button><div id="modalRoot"></div></div>`;
  bind(route);
}
function bindQueryLinks() {
  document.querySelectorAll("[data-query]").forEach((b) => (b.onclick = (event) => { event.preventDefault(); selectedDept = ""; rateQuery = b.dataset.query; const applyQuery = () => { const input = $("#rateSearch"); if (!input) return; input.value = rateQuery; drawRates(); input.focus(); }; if (location.hash === "#home") { render(); requestAnimationFrame(applyQuery); } else { location.hash = "home"; setTimeout(applyQuery, 0); } }));
}
function bind(route) {
  document.querySelectorAll("[data-go]").forEach((b) => (b.onclick = () => (location.hash = b.dataset.go)));
  document.querySelectorAll("[data-new]").forEach((b) => (b.onclick = () => (location.hash = "projects")));
  document.querySelectorAll("[data-feedback]").forEach((b) => (b.onclick = () => openModal("feedback", b.dataset.feedbackTopic)));
  bindContributionTriggers();
  document.querySelectorAll("[data-privacy]").forEach((b) => (b.onclick = openPrivacy));
  $("#menu").onclick = () => { $("#sidebar").classList.toggle("open"); $("#scrim").classList.toggle("show"); };
  $("#scrim").onclick = () => { $("#sidebar").classList.remove("open"); $("#scrim").classList.remove("show"); };
  bindQueryLinks();
  document.querySelectorAll("[data-focus-search]").forEach((b) => (b.onclick = () => { if (route === "home") return $("#rateSearch")?.focus(); location.hash = "home"; setTimeout(() => $("#rateSearch")?.focus(), 0); }));
  document.querySelectorAll("[data-production-type]").forEach((button) => (button.onclick = () => { rateQuery = $("#rateSearch")?.value ?? rateQuery; selectedRateStatus = $("#rateStatus")?.value ?? selectedRateStatus; selectedProductionType = TYPE_FILTER.normalizeFilterId(button.dataset.productionType); selectedDept = ""; selectedRate = null; updateProductionTypeInUrl(); render(); }));
  if (["home", "rates"].includes(route)) { drawRates(); $("#rateSearch").oninput = drawRates; $("#rateStatus").onchange = drawRates; document.querySelectorAll(".suggested button").forEach((b) => (b.onclick = () => { selectedDept = ""; rateQuery = b.textContent; $("#rateSearch").value = rateQuery; drawRates(); })); document.querySelectorAll("[data-dept]").forEach((b) => (b.onclick = () => { rateQuery = $("#rateSearch")?.value ?? rateQuery; selectedRateStatus = $("#rateStatus")?.value ?? selectedRateStatus; selectedDept = b.dataset.dept; render(); })); }
  if (route === "projects") { document.querySelectorAll("[data-budget-field]").forEach((input) => (input.onchange = () => { const item = budgetItems[+input.dataset.budgetIndex], field = input.dataset.budgetField, numeric = ["rate", "qty", "periods", "extra", "tax"].includes(field); item[field] = numeric ? dec2(input.value) : input.value; if (["start", "end"].includes(field) && usesAttachmentDates(item.unit) && item.start && item.end) item.periods = periodsFromDates(item.start, item.end, item.unit, item.periods); saveBudget(); render(); })); document.querySelectorAll("[data-tax-preset]").forEach((select) => (select.onchange = () => { const item = budgetItems[+select.dataset.taxPreset]; if (select.value === "manual") { const input = select.parentElement.querySelector(".tax-manual"); input.hidden = false; input.focus(); return; } item.tax = +select.value || 0; saveBudget(); render(); })); document.querySelectorAll(".date-input").forEach((input) => (input.onclick = () => { if (typeof input.showPicker === "function") input.showPicker(); })); document.querySelectorAll("[data-budget-delete]").forEach((button) => (button.onclick = () => { budgetItems.splice(+button.dataset.budgetDelete, 1); saveBudget(); render(); })); document.querySelectorAll("[data-add-custom]").forEach((button) => (button.onclick = addCustomBudgetItem)); const excel = $("[data-export-excel]"), pdf = $("[data-export-pdf]"); if (excel) excel.onclick = exportBudgetExcel; if (pdf) pdf.onclick = exportBudgetPdf; }
}
function bindContributionTriggers() { document.querySelectorAll("[data-contribution]").forEach((button) => (button.onclick = () => openModal("contribution", "", { kind: button.dataset.contributionKind, profession: button.dataset.contributionProfession, productionType: button.dataset.contributionType || selectedProductionType }))); }
function openModal(type, feedbackTopic, context) { const root = $("#modalRoot"); root.innerHTML = modal(type, feedbackTopic, context); const dialog = root.querySelector("dialog"); document.querySelectorAll("[data-close]").forEach((b) => (b.onclick = () => { if (dialog?.open) dialog.close(); root.innerHTML = ""; })); if (dialog) { if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", ""); } if (type === "feedback") bindFeedbackForm(); if (type === "contribution") bindContributionForm(); }
function openPrivacy() { const dialog = $("#privacyDialog"); if (!dialog) return; if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", ""); }
function bindFeedbackForm() {
  const form = $("#feedbackForm"), status = $("#feedbackStatus"); if (!form) return;
  form.onsubmit = async (event) => {
    event.preventDefault(); const data = new FormData(form), type = data.get("type"), email = String(data.get("email") || "").trim(), message = String(data.get("message") || "").trim();
    if (data.get("website")) return; const button = form.querySelector('[type="submit"]'); button.disabled = true; button.textContent = "Отправляем…"; status.textContent = "";
    try {
      const response = await fetch("https://formsubmit.co/ajax/1b36541ff7e8949ab6f3d1b9124677d4", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ _subject: `KinoRates — ${type}`, type, email, message, page: location.href, _honey: "" }) });
      const result = await response.json(); if (!response.ok || result.success === false || result.success === "false") throw new Error("send-failed"); status.textContent = "Сообщение отправлено. Спасибо!"; status.className = "feedback-status ok"; form.reset(); button.textContent = "Отправлено ✓";
    } catch {
      status.textContent = "Браузер заблокировал прямую отправку. Открываем почтовый клиент…"; status.className = "feedback-status error"; window.location.href = `mailto:snegproduction@gmail.com?subject=${encodeURIComponent(`KinoRates — ${type}`)}&body=${encodeURIComponent(`${message}\n\nОтветить: ${email}\nСтраница: ${location.href}`)}`; button.disabled = false; button.textContent = "Отправить";
    }
  };
}
function bindContributionForm() {
  const form = $("#contributionForm"), status = $("#contributionStatus"); if (!form) return;
  form.onsubmit = async (event) => {
    event.preventDefault(); const data = new FormData(form), kind = data.get("kind"), profession = String(data.get("profession") || "").trim(), productionType = String(data.get("productionType") || "").trim(), rate = String(data.get("rate") || "").trim(), unit = String(data.get("unit") || "").trim(), evidence = String(data.get("evidence") || "").trim(), email = String(data.get("email") || "").trim();
    if (data.get("website")) return; if (kind === "rate" && !rate && !evidence) { status.textContent = "Укажите ставку или источник / комментарий для проверки."; status.className = "feedback-status error"; return; }
    const label = kind === "rate" ? "Предложение ставки" : "Предложение профессии", message = [`Профессия: ${profession}`, `Формат: ${productionType}`, rate ? `Ставка: ${rate} ₽` : "Ставка: не указана", `Единица: ${unit}`, evidence ? `Источник / комментарий: ${evidence}` : "Источник / комментарий: не указан"].join("\n");
    const button = form.querySelector('[type="submit"]'); button.disabled = true; button.textContent = "Отправляем…"; status.textContent = "";
    try {
      const response = await fetch("https://formsubmit.co/ajax/1b36541ff7e8949ab6f3d1b9124677d4", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ _subject: `KinoRates — ${label}`, type: label, profession, productionType, rate, unit, evidence, email, message, page: location.href, _honey: "" }) });
      const result = await response.json(); if (!response.ok || result.success === false || result.success === "false") throw new Error("send-failed"); status.textContent = "Отправлено на проверку. Спасибо!"; status.className = "feedback-status ok"; button.textContent = "Отправлено ✓";
    } catch {
      status.textContent = "Браузер заблокировал прямую отправку. Открываем почтовый клиент…"; status.className = "feedback-status error"; window.location.href = `mailto:snegproduction@gmail.com?subject=${encodeURIComponent(`KinoRates — ${label}`)}&body=${encodeURIComponent(`${message}\n\nОтветить: ${email || "не указан"}\nСтраница: ${location.href}`)}`; button.disabled = false; button.textContent = "Отправить на проверку";
    }
  };
}
const METRIKA_ID = 111489870, CONSENT_KEY = "kinorates_analytics_consent";
let metrikaStarted = false;
function consentValue() { if (location.protocol === "file:") return null; try { return localStorage.getItem(CONSENT_KEY); } catch { return null; } }
function startMetrika() {
  if (metrikaStarted || location.protocol === "file:") return; metrikaStarted = true;
  (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t);a=e.getElementsByTagName(t)[0];k.async=1;k.src=r;a.parentNode.insertBefore(k,a)})(window,document,"script",`https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_ID}`,"ym");
  window.ym(METRIKA_ID, "init", { ssr: true, webvisor: true, clickmap: true, ecommerce: "dataLayer", accurateTrackBounce: true, trackLinks: true });
}
function saveConsent(value) { try { localStorage.setItem(CONSENT_KEY, value); } catch {} const banner = $("#cookieBanner"); if (banner) banner.hidden = true; if (value === "granted") startMetrika(); else if (metrikaStarted) location.reload(); }
function initPrivacyControls() {
  const banner = $("#cookieBanner"), privacy = $("#privacyDialog"), accept = $("#cookieAccept"), reject = $("#cookieReject"), close = $("#privacyClose");
  const consent = consentValue(); if (consent === "granted") startMetrika(); else if (banner && consent !== "denied") banner.hidden = false;
  if (accept) accept.onclick = () => saveConsent("granted"); if (reject) reject.onclick = () => saveConsent("denied"); if (close) close.onclick = () => privacy?.close();
  if (privacy) privacy.onclick = (event) => { if (event.target === privacy) privacy.close(); };
}
window.addEventListener("hashchange", () => { render(); animatePageScrollTo(0); if (metrikaStarted && window.ym) window.ym(METRIKA_ID, "hit", `${location.pathname}${location.hash}`, { title: document.title }); });
initPrivacyControls();
updateProductionTypeInUrl();
render();
