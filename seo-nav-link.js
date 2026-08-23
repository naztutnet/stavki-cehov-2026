(() => {
  const params = new URL(location.href).searchParams;
  const requestedQuery = params.get("q")?.trim() || "";
  const requestedDept = params.get("dept")?.trim() || "";
  let queryApplied = !requestedQuery;
  let deptApplied = !requestedDept;

  const addMaterialsLink = () => {
    const nav = document.querySelector("#sidebar nav");
    if (nav && !nav.querySelector("[data-seo-materials]")) {
      const link = document.createElement("a");
      link.href = "/stavki-kinotsekhov/";
      link.dataset.seoMaterials = "";
      link.innerHTML = "<i>▤</i><span>Материалы</span>";
      nav.appendChild(link);
    }

    const sourceStrip = document.querySelector(".registry-page .source-strip");
    if (!sourceStrip || document.querySelector("[data-home-materials]")) return;

    const section = document.createElement("section");
    section.className = "home-materials";
    section.dataset.homeMaterials = "";
    section.innerHTML = `
      <header>
        <div><span>Материалы KinoRates</span><h2>Ставки, цеха и смета</h2></div>
        <a href="/stavki-kinotsekhov/">Все материалы →</a>
      </header>
      <div class="home-materials-grid">
        <a href="/stavki-kinotsekhov/"><small>Справочник</small><b>Все ставки киноцехов</b><span>Как читать ставки, статусы и источники.</span><em>Открыть →</em></a>
        <a href="/smeta-filma/"><small>Бюджет</small><b>Смета фильма</b><span>Как собрать предварительный расчёт проекта.</span><em>Открыть →</em></a>
        <a href="/operatorskiy-tsekh/"><small>Цех</small><b>Операторский</b><span>Ставки и условия операторской группы.</span><em>Открыть →</em></a>
        <a href="/rezhisserskiy-tsekh/"><small>Цех</small><b>Режиссёрский</b><span>Ставки режиссёрской группы и условия.</span><em>Открыть →</em></a>
        <a href="/hudozhestvennyy-tsekh/"><small>Цех</small><b>Художественный</b><span>Ориентиры художественно-постановочного блока.</span><em>Открыть →</em></a>
      </div>`;
    sourceStrip.insertAdjacentElement("afterend", section);
  };

  const applyDeepLink = () => {
    if (!deptApplied) {
      const button = [...document.querySelectorAll("[data-dept]")].find((item) => item.dataset.dept === requestedDept);
      if (button) {
        deptApplied = true;
        if (!button.classList.contains("active")) {
          button.click();
          return;
        }
      }
    }

    if (!queryApplied) {
      const input = document.getElementById("rateSearch");
      if (input) {
        queryApplied = true;
        input.value = requestedQuery;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
  };

  const sync = () => {
    addMaterialsLink();
    applyDeepLink();
  };

  const root = document.getElementById("app");
  if (!root) return;
  sync();
  new MutationObserver(sync).observe(root, { childList: true, subtree: true });
})();
