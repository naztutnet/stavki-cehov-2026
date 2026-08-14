(() => {
  "use strict";
  const R = Array.isArray(window.KINORATES_DATA) ? window.KINORATES_DATA : [],
    S = Array.isArray(window.KINORATES_SOURCES) ? window.KINORATES_SOURCES : [],
    U = Array.isArray(window.KINORATES_UPDATES) ? window.KINORATES_UPDATES : [];
  const $ = (s) => document.querySelector(s),
    V = $("#view"),
  rub = (n) => new Intl.NumberFormat("ru-RU").format(Math.round(n)) + " ₽",
    esc = (x) =>
      String(x ?? "").replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[c],
      );
  let projects = load(),
    draft = {},
    step = 0,
    rateQuery = "";
  const sections = [
    "Административный цех",
    "Режиссерская группа",
    "Операторский цех",
    "Художественно-постановочный цех",
    "Звуковой цех",
    "Свет и грип",
    "Транспортный цех",
    "CG / VFX",
  ];
  const articles = [
    {
      id: "source",
      k: "Методология",
      t: "Как читать ставку и проверять первоисточник",
      d: "Статус, дата, единица расчёта и условия — четыре вещи, которые нужно проверить до переноса ставки в смету.",
    },
    {
      id: "overtime",
      k: "Смета",
      t: "Как учитывать переработки",
      d: "Почему длительность смены и правила переработки нельзя отделять от базовой ставки.",
    },
    {
      id: "estimate",
      k: "Практика",
      t: "Как собрать первую рабочую смету",
      d: "От параметров проекта и структуры цехов — к редактируемому бюджету с прозрачными допущениями.",
    },
  ];
  function load() {
    try {
      return JSON.parse(localStorage.getItem("kinorates-v4-projects")) || [];
    } catch {
      return [];
    }
  }
  function save() {
    localStorage.setItem("kinorates-v4-projects", JSON.stringify(projects));
    $("#projectCount").textContent = projects.length;
  }
  function head(k, t, p, a = "") {
    return `<header class="top"><div><p class="kicker">${k}</p><h1>${t}</h1>${p ? `<p>${p}</p>` : ""}</div>${a}</header>`;
  }
  function route() {
    const [r, id, tab] = location.hash.slice(1).split("/");
    document
      .querySelectorAll("#nav a,.side-foot a")
      .forEach((a) =>
        a.classList.toggle("active", a.dataset.route === (r || "home")),
      );
    closeMenu();
    (
      ({
        home,
        projects: projectsPage,
        rates,
        knowledge,
        resources,
        about,
        project: () => projectPage(id, tab),
        article: () => article(id),
      })[r || "home"] || home
    )();
    $("#main").focus({ preventScroll: true });
    scrollTo(0, 0);
  }
  function home() {
    const current = R.filter((r) =>
      ["fresh2026", "official2026"].includes(r.status),
    );
    V.innerHTML = `<section class="welcome"><div><p class="kicker">Рабочее место продюсера</p><h1>От параметров проекта — к понятной и защищаемой смете</h1><p>Создайте проект, соберите структуру расходов из реальных ставок и получите аналитику бюджета.</p></div><button class="primary" data-new>Создать проект →</button></section><label class="search"><span>⌕</span><input id="global" placeholder="Найти ставку, профессию, статью или источник…"></label><section class="start"><div><h2>Собрать новый проект</h2><p>5 коротких шагов: формат, производство, масштаб, постпродакшн и финансовые настройки.</p></div><button class="primary" data-new>Начать настройку</button></section><div class="steps"><div class="step-card"><b>01</b><strong>Опишите проект</strong><span>Формат, хронометраж и производственный план</span></div><div class="step-card"><b>02</b><strong>Получите шаблон</strong><span>Структура цехов без выдуманных сумм</span></div><div class="step-card"><b>03</b><strong>Уточните ставки</strong><span>Реальная база и значения пользователя</span></div><div class="step-card"><b>04</b><strong>Сформируйте аналитику</strong><span>Смена, этапы, цеха и риски источников</span></div></div><div class="stats"><div class="stat"><small>Ставок в базе</small><b>${R.length}</b></div><div class="stat"><small>Подтверждено в 2026</small><b>${current.length}</b></div><div class="stat"><small>Цехов</small><b>${new Set(R.map((r) => r.dept)).size}</b></div><div class="stat"><small>Источников</small><b>${S.length}</b></div></div><div class="grid dashboard"><section class="panel"><div class="panel-head"><h2>${projects.length ? "Последние проекты" : "Ваши проекты"}</h2><a href="#projects">Все →</a></div>${projects.length ? `<div class="list">${projects.slice(-4).reverse().map(projectRow).join("")}</div>` : `<div class="empty"><h2>Пока нет проектов</h2><p>Создайте первый проект и получите рабочий шаблон сметы.</p><button class="ghost" data-new>Создать проект</button></div>`}</section><section class="panel"><div class="panel-head"><h2>Последние изменения</h2><a href="#rates">Ставки →</a></div><div class="updates">${U.slice(
      0,
      4,
    )
      .map(
        (u) =>
          `<div class="update"><strong>${esc(u.title)}</strong><p>${esc(u.text)}</p></div>`,
      )
      .join(
        "",
      )}</div></section></div><section class="section"><div class="section-title"><h2>База знаний</h2><a href="#knowledge">Все материалы →</a></div><div class="cards">${articles.map(articleCard).join("")}</div></section><section class="section"><div class="section-title"><h2>Быстрые инструменты</h2></div><div class="tools"><a class="tool" href="#rates"><strong>Подобрать ставку</strong><span>По профессии, цеху, условию и статусу источника</span></a><a class="tool" href="#projects"><strong>Рассчитать стоимость смены</strong><span>На основании строк конкретного проекта</span></a><a class="tool" href="#resources"><strong>Открыть первоисточники</strong><span>Цеховые письма и отраслевые документы</span></a></div></section>`;
    bindNew();
    $("#global").addEventListener("input", (e) => {
      if (e.target.value.trim().length > 2) {
        rateQuery = e.target.value;
        location.hash = "rates";
      }
    });
  }
  function projectsPage() {
    V.innerHTML =
      head(
        "Рабочие объекты",
        "Проекты",
        "Параметры, смета, аналитика и источники каждого производства.",
        '<button class="primary" data-new>+ Новый проект</button>',
      ) +
      (projects.length
        ? `<div class="cards">${projects.map((p) => `<a class="card" href="#project/${p.id}/budget"><small>${esc(p.format)}</small><h2>${esc(p.name)}</h2><p>${p.duration} мин · ${p.shoots} смен · ${esc(p.location)}</p><footer>${rub(total(p))} →</footer></a>`).join("")}</div>`
        : `<div class="panel empty"><h2>Создайте первый проект</h2><p>Мастер подготовит разделы сметы из ваших параметров.</p><button class="primary" data-new>Начать</button></div>`);
    bindNew();
  }
  function projectRow(p) {
    return `<a class="row" href="#project/${p.id}/budget"><div><strong>${esc(p.name)}</strong><span>${esc(p.format)} · ${p.duration} мин · ${p.shoots} смен</span></div><em>${rub(total(p))}</em></a>`;
  }
  function total(p) {
    return (p.items || []).reduce(
      (s, x) => s + (+x.rate || 0) * (+x.qty || 1),
      0,
    );
  }
  function projectPage(id, tab = "budget") {
    const p = projects.find((x) => x.id === id);
    if (!p) {
      location.hash = "projects";
      return;
    }
    V.innerHTML = `<section class="project-head">${head("Проект", esc(p.name), `${esc(p.format)} · ${p.duration} мин · ${p.shoots} смен · ${esc(p.location)}`, '<button class="ghost" id="editParams">Параметры</button>')}<div class="project-meta"><span class="tag">${p.expedition === "yes" ? "С экспедицией" : "Без экспедиции"}</span><span class="tag">VFX: ${esc(p.vfx)}</span><span class="tag">${p.cameras} камеры</span><span class="tag">Резерв ${p.reserve}%</span></div><div class="tabs"><button data-tab="budget" class="${tab === "budget" ? "active" : ""}">Смета</button><button data-tab="analytics" class="${tab === "analytics" ? "active" : ""}">Аналитика</button><button data-tab="params" class="${tab === "params" ? "active" : ""}">Параметры</button><button data-tab="sources" class="${tab === "sources" ? "active" : ""}">Источники</button></div></section><div id="projectBody"></div>`;
    document
      .querySelectorAll("[data-tab]")
      .forEach(
        (b) =>
          (b.onclick = () =>
            (location.hash = `project/${p.id}/${b.dataset.tab}`)),
      );
    $("#editParams").onclick = () => (location.hash = `project/${p.id}/params`);
    (
      ({
        budget: () => budget(p),
        analytics: () => analytics(p),
        params: () => params(p),
        sources: () => projectSources(p),
      })[tab] || (() => budget(p))
    )();
  }
  function budget(p) {
    const grouped = sections
      .map((s) => [s, (p.items || []).filter((x) => x.dept === s)])
      .filter(([, x]) => x.length);
    $("#projectBody").innerHTML =
      `<div class="grid budget-layout"><div class="panel"><div class="rate-picker"><input id="pick" placeholder="Добавить профессию из базы ставок"><button class="ghost" id="addFirst">Найти</button></div>${grouped.length ? grouped.map(([s, items]) => `<section class="budget-section"><header><span>${esc(s)}</span><span>${rub(items.reduce((a, x) => a + x.rate * x.qty, 0))}</span></header>${items.map((x) => budgetRow(p, x)).join("")}</section>`).join("") : `<div class="empty"><h2>Шаблон готов</h2><p>Разделы определены параметрами проекта. Добавьте реальные ставки из базы.</p></div>`}</div><aside><div class="notice">Система не назначает нормативный состав группы. Количество и ставки остаются прозрачными допущениями пользователя.</div><div class="panel summary section"><h2>Предварительный итог</h2><div class="sumline"><span>Статей</span><b>${(p.items || []).length}</b></div><div class="sumline"><span>Съёмочных смен</span><b>${p.shoots}</b></div><div class="sumline"><span>Резерв</span><b>${p.reserve}%</b></div><div class="sumline total"><span>Итого</span><b>${rub(total(p) * (1 + p.reserve / 100))}</b></div><button class="primary" style="width:100%;margin-top:15px" id="toAnalytics">Сформировать аналитику</button></div></aside></div>`;
    $("#addFirst").onclick = () => {
      const q = $("#pick").value.toLowerCase(),
        r = R.find((x) => x.prof.toLowerCase().includes(q) && x.amount);
      if (!r)
        return alert("Введите название профессии из базы, например «оператор»");
      p.items ??= [];
      p.items.push({
        key: Date.now(),
        id: r.id,
        dept: r.dept,
        prof: r.prof,
        rate: r.amount,
        qty: 1,
        status: r.status,
        src: r.src,
      });
      save();
      budget(p);
    };
    document.querySelectorAll("[data-qty]").forEach(
      (i) =>
        (i.onchange = () => {
          p.items.find((x) => x.key == i.dataset.qty).qty = Math.max(
            1,
            +i.value || 1,
          );
          save();
          budget(p);
        }),
    );
    document.querySelectorAll("[data-rate]").forEach(
      (i) =>
        (i.onchange = () => {
          p.items.find((x) => x.key == i.dataset.rate).rate = Math.max(
            0,
            +i.value || 0,
          );
          save();
          budget(p);
        }),
    );
    document.querySelectorAll("[data-del]").forEach(
      (b) =>
        (b.onclick = () => {
          p.items = p.items.filter((x) => x.key != b.dataset.del);
          save();
          budget(p);
        }),
    );
    $("#toAnalytics").onclick = () =>
      (location.hash = `project/${p.id}/analytics`);
  }
  function budgetRow(p, x) {
    return `<div class="budget-row"><div><strong>${esc(x.prof)}</strong><small>${esc(x.src || "Значение пользователя")}</small></div><input data-qty="${x.key}" type="number" min="1" value="${x.qty}" title="Количество"><input data-rate="${x.key}" type="number" min="0" value="${x.rate}" title="Ставка"><em>${rub(x.rate * x.qty)}</em><button class="x" data-del="${x.key}">×</button></div>`;
  }
  function analytics(p) {
    const t = total(p),
      gross = t * (1 + p.reserve / 100),
      groups = Object.entries(
        (p.items || []).reduce(
          (a, x) => ((a[x.dept] = (a[x.dept] || 0) + x.rate * x.qty), a),
          {},
        ),
      ).sort((a, b) => b[1] - a[1]);
    $("#projectBody").innerHTML =
      `<div class="grid analytics"><div class="panel metric"><small>Бюджет с резервом</small><b>${rub(gross)}</b></div><div class="panel metric"><small>Стоимость смены</small><b>${p.shoots ? rub(gross / p.shoots) : "—"}</b></div><div class="panel metric"><small>Стоимость минуты</small><b>${p.duration ? rub(gross / p.duration) : "—"}</b></div><div class="panel metric"><small>Заполнено статей</small><b>${(p.items || []).length}</b></div></div><section class="panel section"><div class="panel-head"><h2>Структура по цехам</h2></div><div class="bars">${groups.length ? groups.map(([g, n]) => `<div class="bar"><span>${esc(g)}</span><div class="track"><div class="fill" style="width:${t ? (n / t) * 100 : 0}%"></div></div><b>${rub(n)}</b></div>`).join("") : '<div class="empty">Добавьте ставки, чтобы появилась аналитика.</div>'}</div></section><section class="section notice">Аналитика рассчитана только по заполненным строкам. Она не подтверждает полноту сметы и не заменяет производственный план.</section>`;
  }
  function params(p) {
    $("#projectBody").innerHTML =
      `<div class="panel section facts"><div class="fact"><span>Формат</span><b>${esc(p.format)}</b></div><div class="fact"><span>Хронометраж</span><b>${p.duration} мин</b></div><div class="fact"><span>Съёмочные смены</span><b>${p.shoots}</b></div><div class="fact"><span>Локация</span><b>${esc(p.location)}</b></div><div class="fact"><span>Экспедиция</span><b>${p.expedition === "yes" ? "Да" : "Нет"}</b></div><div class="fact"><span>Сложность VFX</span><b>${esc(p.vfx)}</b></div><div class="fact"><span>Резерв</span><b>${p.reserve}%</b></div></div>`;
  }
  function projectSources(p) {
    const ids = new Set((p.items || []).map((x) => x.id));
    const src = R.filter((r) => ids.has(r.id));
    $("#projectBody").innerHTML =
      `<div class="panel section list">${src.length ? src.map((r) => `<a class="row" href="${esc(r.doc)}" target="_blank" rel="noopener"><div><strong>${esc(r.prof)}</strong><span>${esc(r.src)}</span></div><em>↗</em></a>`).join("") : '<div class="empty">Источники появятся после добавления ставок.</div>'}</div>`;
  }
  function rates() {
    let q = rateQuery;
    rateQuery = "";
    V.innerHTML =
      head(
        "Справочная база",
        "Ставки",
        "Реальные записи KinoRates. Открывайте источник до переноса значения в рабочую смету.",
      ) +
      `<div class="filter"><input id="rq" value="${esc(q)}" placeholder="Профессия, цех или условие"><select id="rs"><option value="">Любой статус</option><option value="new">Подтверждено 2026</option><option value="old">Истёк или архив</option></select></div><div id="rt"></div>`;
    function draw() {
      const text = $("#rq").value.toLowerCase(),
        st = $("#rs").value,
        d = R.filter(
          (r) =>
            (!text ||
              `${r.prof} ${r.dept} ${r.cond}`.toLowerCase().includes(text)) &&
            (!st ||
              (st === "new"
                ? ["fresh2026", "official2026"].includes(r.status)
                : !["fresh2026", "official2026"].includes(r.status))),
        ).slice(0, 100);
      $("#rt").innerHTML =
        `<div class="table-wrap"><table><thead><tr><th>Профессия</th><th>Цех</th><th>Единица</th><th>Статус</th><th>Ставка</th></tr></thead><tbody>${d.map((r) => `<tr><td><b>${esc(r.prof)}</b><small>${esc(r.cond)}</small></td><td>${esc(r.dept)}</td><td>${esc(r.unit)}</td><td><span class="status ${["fresh2026", "official2026"].includes(r.status) ? "" : "old"}">${["fresh2026", "official2026"].includes(r.status) ? "2026" : "Проверить"}</span></td><td><b>${r.amount ? rub(r.amount) : "—"}</b></td></tr>`).join("")}</tbody></table></div>`;
    }
    $("#rq").oninput = draw;
    $("#rs").onchange = draw;
    draw();
  }
  function knowledge() {
    V.innerHTML =
      head(
        "Редакционный раздел",
        "База знаний",
        "Практические материалы связаны со ставками, источниками и инструментами портала.",
      ) + `<div class="cards">${articles.map(articleCard).join("")}</div>`;
  }
  function articleCard(a) {
    return `<a class="card" href="#article/${a.id}"><small>${a.k}</small><h3>${a.t}</h3><p>${a.d}</p><footer>Читать →</footer></a>`;
  }
  function article(id) {
    const a = articles.find((x) => x.id === id) || articles[0];
    V.innerHTML = `<article class="article">${head(a.k, a.t, a.d)}<div class="notice">Материал объясняет структуру данных KinoRates и не является юридической или финансовой рекомендацией.</div><h2>Начните с контекста</h2><p>Ставка имеет смысл только вместе с профессией, типом проекта, единицей расчёта, регионом, датой действия и условиями работы. Сравнение одной суммы без этих полей может привести к неверному выводу.</p><h2>Проверьте источник</h2><p>Откройте документ, сопоставьте дату и срок действия. Статус «срок истёк» означает, что значение можно использовать только как исторический ориентир, а не как актуальную рекомендацию.</p><h2>Зафиксируйте допущение в смете</h2><p>Если значение изменено вручную, оставьте комментарий. Так аналитика проекта остаётся объяснимой: видно, что пришло из базы, а что определено договорённостью.</p><p><a class="primary" href="#rates" style="display:inline-flex;align-items:center">Перейти к ставкам</a></p></article>`;
  }
  function resources() {
    V.innerHTML =
      head(
        "Навигация по отрасли",
        "Полезные ресурсы",
        "Первоисточники текущей базы и материалы для проверки ставок.",
      ) +
      `<div class="cards">${S.map((s) => `<a class="card" href="${esc(s.url)}" target="_blank" rel="noopener"><small>${esc(s.date)}</small><h3>${esc(s.name)}</h3><footer>Открыть источник ↗</footer></a>`).join("")}</div>`;
  }
  function about() {
    V.innerHTML =
      head(
        "KinoRates",
        "О проекте",
        "Почему существует база и как интерпретировать её данные.",
        '<button class="primary" data-feedback>Связаться</button>',
      ) +
      `<div class="grid about-grid"><section class="panel about-copy"><h2>Инструмент для прозрачной работы со ставками и сметой</h2><p>KinoRates объединяет публичные цеховые письма, рекомендации, рыночные исследования и пользовательские допущения в одном рабочем контексте.</p><p>Ставки носят рекомендательный характер. Финальная стоимость определяется договорённостью сторон, условиями проекта и актуальным первоисточником.</p></section><aside class="panel facts"><div class="fact"><span>Позиций</span><b>${R.length}</b></div><div class="fact"><span>Источников</span><b>${S.length}</b></div><div class="fact"><span>Цехов</span><b>${new Set(R.map((r) => r.dept)).size}</b></div><div class="fact"><span>Ревизия</span><b>13.08.2026</b></div></aside></div>`;
    bindFeedback();
  }
  const titles = [
    "Формат",
    "Производственный план",
    "Масштаб",
    "Постпродакшн",
    "Финансовые настройки",
  ];
  function openWizard() {
    draft = {
      name: "Новый проект",
      format: "Полный метр",
      duration: 90,
      shoots: 30,
      location: "Москва / Россия",
      expedition: "no",
      cameras: 1,
      vfx: "Без сложных задач",
      reserve: 10,
    };
    step = 0;
    drawStep();
    $("#wizard").showModal();
  }
  function drawStep() {
    $("#stepTitle").textContent = titles[step];
    $("#stepCount").textContent = `${step + 1} из 5`;
    $("#progress").style.width = `${(step + 1) * 20}%`;
    $("#wizardBack").disabled = step === 0;
    $("#wizardNext").textContent = step === 4 ? "Создать проект" : "Продолжить";
    const bodies = [
      `<div class="fields"><label>Название проекта<input data-d="name" value="${esc(draft.name)}"></label><label>Формат<select data-d="format">${["Полный метр", "Сериал", "Короткий метр", "Реклама", "Клип", "Пилот / шоу"].map((x) => `<option ${x === draft.format ? "selected" : ""}>${x}</option>`).join("")}</select></label><label>Предполагаемый хронометраж<input data-d="duration" type="number" min="1" value="${draft.duration}"></label><label>Количество серий<input data-d="episodes" type="number" min="1" value="${draft.episodes || 1}"></label></div>`,
      `<div class="fields"><label>Съёмочных смен<input data-d="shoots" type="number" min="1" value="${draft.shoots}"></label><label>Камер<select data-d="cameras"><option>1</option><option>2</option><option>3</option><option>4</option></select></label><label>Регион<input data-d="location" value="${esc(draft.location)}"></label><label>Экспедиция<select data-d="expedition"><option value="no">Без экспедиции</option><option value="yes">С экспедицией</option></select></label></div>`,
      `<div class="choice-grid">${["Компактная группа", "Стандартное производство", "Большой состав", "Несколько съёмочных групп"].map((x) => `<button type="button" class="choice ${draft.scale === x ? "selected" : ""}" data-choice="scale" data-value="${x}"><b>${x}</b><span>Параметр формирует структуру, но не назначает количество специалистов</span></button>`).join("")}</div>`,
      `<div class="choice-grid">${["Без сложных задач", "Базовый VFX", "Средняя сложность", "Высокая сложность"].map((x) => `<button type="button" class="choice ${draft.vfx === x ? "selected" : ""}" data-choice="vfx" data-value="${x}"><b>${x}</b><span>Добавляет соответствующий раздел в шаблон сметы</span></button>`).join("")}</div>`,
      `<div class="fields"><label>Резерв, %<input data-d="reserve" type="number" min="0" max="100" value="${draft.reserve}"></label><label>Налоги<select data-d="tax"><option>Показывать отдельно</option><option>Не учитывать в концепции</option></select></label></div><p class="modal-note">KinoRates создаст структуру проекта. Суммы появятся только после добавления реальных ставок или ручных значений.</p>`,
    ];
    $("#wizardBody").innerHTML = bodies[step];
    document
      .querySelectorAll("[data-d]")
      .forEach(
        (i) =>
          (i.onchange = () =>
            (draft[i.dataset.d] = i.type === "number" ? +i.value : i.value)),
      );
    document.querySelectorAll("[data-choice]").forEach(
      (b) =>
        (b.onclick = () => {
          draft[b.dataset.choice] = b.dataset.value;
          drawStep();
        }),
    );
  }
  function finish() {
    const p = { ...draft, id: String(Date.now()), items: [] };
    projects.push(p);
    save();
    $("#wizard").close();
    location.hash = `project/${p.id}/budget`;
  }
  function bindNew() {
    document
      .querySelectorAll("[data-new]")
      .forEach((b) => (b.onclick = openWizard));
  }
  function bindFeedback() {
    document
      .querySelectorAll("[data-feedback]")
      .forEach((b) => (b.onclick = () => $("#feedback").showModal()));
  }
  function closeMenu() {
    $("#side").classList.remove("open");
    $("#scrim").hidden = true;
  }
  $("#menu").onclick = () => {
    $("#side").classList.add("open");
    $("#scrim").hidden = false;
  };
  $("#scrim").onclick = closeMenu;
  $("#wizardNext").onclick = () => {
    document
      .querySelectorAll("[data-d]")
      .forEach(
        (i) => (draft[i.dataset.d] = i.type === "number" ? +i.value : i.value),
      );
    step === 4 ? finish() : (step++, drawStep());
  };
  $("#wizardBack").onclick = () => {
    if (step) {
      step--;
      drawStep();
    }
  };
  window.addEventListener("hashchange", route);
  bindFeedback();
  save();
  route();
})();
