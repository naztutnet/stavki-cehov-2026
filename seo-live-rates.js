(() => {
  const rows = window.KINORATES_DATA || [];
  const rank = { fresh2026: 0, official2026: 1, verified2025: 2, verified2024: 3, verified2023: 4, market2025: 5, check: 6, newdoc: 7, archive: 8, expired: 9, no_public_rate: 10 };
  const normalize = (value) => String(value || "").toLocaleLowerCase("ru-RU").replaceAll("ё", "е").trim();
  const money = (value) => `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(+value || 0)} ₽`;
  const status = (value) => ({ fresh2026: "Письмо 2026", official2026: "Рекомендации 2026", verified2025: "Письмо 2025", verified2024: "Письмо 2024", verified2023: "Письмо 2023", market2025: "Рыночный ориентир", no_public_rate: "Без публичного тарифа" })[value] || "Справочная запись";
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);

  function bestForProfession(name, allowedDepts) {
    const target = normalize(name);
    return rows
      .filter((row) => (!allowedDepts.length || allowedDepts.includes(row.dept)) && normalize(row.prof) === target)
      .sort((a, b) => (rank[a.status] ?? 99) - (rank[b.status] ?? 99) || (+b.amount || 0) - (+a.amount || 0))[0];
  }

  document.querySelectorAll("[data-live-rates]").forEach((root) => {
    const professions = String(root.dataset.professions || "").split("|").map((x) => x.trim()).filter(Boolean);
    const depts = String(root.dataset.dept || "").split("|").map((x) => x.trim()).filter(Boolean);
    const limit = Math.max(1, Math.min(10, Number(root.dataset.limit || 6)));
    let picked = professions.map((name) => bestForProfession(name, depts)).filter(Boolean);

    if (!picked.length && depts.length) {
      const seen = new Set();
      picked = rows
        .filter((row) => depts.includes(row.dept))
        .sort((a, b) => (rank[a.status] ?? 99) - (rank[b.status] ?? 99) || (+b.amount || 0) - (+a.amount || 0))
        .filter((row) => {
          const key = normalize(row.prof);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
    }

    picked = picked.slice(0, limit);
    if (!picked.length) {
      root.innerHTML = '<p class="seo-live-empty">Подходящих записей пока нет. Откройте основной справочник KinoRates.</p>';
      return;
    }

    root.innerHTML = `<div class="table-wrap"><table><thead><tr><th>Цех</th><th>Профессия</th><th>Условие</th><th>Ед.</th><th>Ставка</th><th>Статус</th></tr></thead><tbody>${picked.map((row) => `<tr><td>${esc(row.dept)}</td><td><a class="live-rate-link" href="/?q=${encodeURIComponent(row.prof)}#home">${esc(row.prof)}</a></td><td>${esc(row.cond || "—")}</td><td>${esc(row.unit || "—")}</td><td><b>${row.amount ? money(row.amount) : "—"}</b></td><td><span class="status ${["fresh2026", "official2026"].includes(row.status) ? "current" : ["verified2025", "verified2024", "verified2023"].includes(row.status) ? "previous" : row.status === "market2025" ? "market" : "archive"}">${esc(status(row.status))}</span></td></tr>`).join("")}</tbody></table></div>`;
  });
})();
