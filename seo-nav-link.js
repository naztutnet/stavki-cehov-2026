(() => {
  const params = new URL(location.href).searchParams;
  const requestedQuery = params.get("q")?.trim() || "";
  const requestedDept = params.get("dept")?.trim() || "";
  let queryApplied = !requestedQuery;
  let deptApplied = !requestedDept;

  const industryGroups = [
    {
      id: "professional",
      eyebrow: "ПРОФЕССИОНАЛЬНЫЕ ОБЪЕДИНЕНИЯ",
      title: "Гильдии, профсоюзы и цеховые сообщества",
      text: "Организации, которые объединяют специалистов, публикуют документы, рекомендации, стандарты и профессиональные новости.",
      items: [
        ["МПК", "Межрегиональный профсоюз кинематографистов", "Защита трудовых прав киноработников, цеховые секции, документы и письма по ставкам.", "https://kinoprofsoyuz.ru/"],
        ["СК", "Союз кинематографистов Российской Федерации", "Официальный реестр профессиональных гильдий, комиссий, ассоциаций и региональных отделений.", "https://unikino.ru/список-гильдий/"],
        ["ОП", "Гильдия кинооператоров", "Профессиональное сообщество операторов кино; новости, конкурсы и материалы гильдии.", "https://kinoglaz.ru/"],
        ["РЖ", "Гильдия кинорежиссёров России", "Профессиональная гильдия режиссёров, документы, проекты и отраслевые новости.", "https://www.kinogildia.ru/"],
        ["КАС", "Гильдия каскадёров России", "Профессиональное объединение каскадёров; контакты, проекты и информация о профессии.", "https://stunt-info.ru/"],
        ["ОРГ", "Гильдия продюсеров и организаторов кинопроцесса СК РФ", "Сообщество продюсеров и организаторов производства при Союзе кинематографистов.", "https://orgcinema.ru/"],
        ["ПР", "Гильдия продюсеров России", "Профессиональное объединение продюсеров и отраслевые материалы.", "https://www.kinoproducer.ru/"],
        ["СЦ", "Гильдия сценаристов", "Права сценаристов, образование, консультации и публичные рекомендации по авторским гонорарам.", "https://cinemawriter.ru/"],
        ["ДОК", "Гильдия неигрового кино и телевидения", "Профессиональная организация документалистов: справочник, проекты, компании, фестивали и отраслевые новости.", "https://rgdoc.ru/"],
        ["АГ", "Гильдия актёрских агентов", "Профессиональные стандарты взаимодействия актёров, агентов и кинокомпаний; реестр агентов и агентств.", "https://gildiaaa.ru/"],
        ["АПАК", "Ассоциация профессиональной аэрокиносъёмки", "Сообщество пилотов и операторов БПЛА: безопасность, регулирование и профессиональные стандарты аэросъёмки.", "https://apac-aero.ru/"],
        ["ЗВ", "Гильдия звукорежиссёров Российского музыкального союза", "Смежное профессиональное объединение звукорежиссёров, полезное для записи, постпродакшна и аудиовизуального производства.", "https://rmu.org.ru/guild/gildija-zvukorezhisserov/"],
        ["АКТ", "Московская гильдия актёров театра и кино", "Профессиональное актёрское объединение и отраслевые контакты.", "https://mgatik.ru/"]
      ]
    },
    {
      id: "associations",
      eyebrow: "ИНДУСТРИАЛЬНЫЕ АССОЦИАЦИИ",
      title: "Продюсеры, анимация, телевидение и кинопоказ",
      text: "Объединения компаний и участников рынка, которые работают с производством, региональными съёмками, вещанием и прокатом.",
      items: [
        ["АПКиТ", "Ассоциация продюсеров кино и телевидения", "53 компании в составе; проекты АПКиТ, премия и «Кино России» — развитие съёмок в регионах.", "https://rusproducers.com/"],
        ["ААК", "Ассоциация анимационного кино России", "Профессиональное объединение организаций индустрии анимации; более 90 участников, реестр и отраслевые материалы.", "https://aakr.ru/"],
        ["НАТ", "Национальная ассоциация телерадиовещателей", "Экспертный и консультационный центр вещателей, включая онлайн-кинотеатры; исследования, мероприятия и NATEXPO.", "https://nat.ru/"],
        ["АВК", "Ассоциация владельцев кинотеатров", "Кинопоказ, исследования рынка, стандарты, правовые вопросы и профессиональные мероприятия.", "https://cinemaowner.ru/"]
      ]
    },
    {
      id: "public",
      eyebrow: "ГОСУДАРСТВЕННЫЕ ИНСТИТУЦИИ",
      title: "Поддержка, реестры и инфраструктура отрасли",
      text: "Официальные ресурсы для господдержки, прокатных данных, международного продвижения и архивной работы.",
      items: [
        ["МК", "Министерство культуры Российской Федерации", "Государственная политика и документы в сфере кинематографии, конкурсы и нормативная информация.", "https://culture.gov.ru/"],
        ["ФК", "Фонд кино", "Финансовая поддержка отечественного кинематографа, конкурсы, документы и отраслевая аналитика.", "https://fond-kino.ru/"],
        ["ЕАИС", "Единая автоматизированная информационная система кинопоказа", "Официальная система учёта сведений о кинопрокате и посещаемости, связанная с Фондом кино.", "https://ekinobilet.fond-kino.ru/"],
        ["РК", "РОСКИНО", "Национальный оператор по международному продвижению российского кино, сериалов и анимации.", "https://roskino.org/"],
        ["ГФФ", "Госфильмофонд России", "Государственный архив фильмов: фонды, каталоги, хранение, права и работа с кинонаследием.", "https://gosfilmofond.ru/"]
      ]
    },
    {
      id: "rights",
      eyebrow: "АВТОРСКИЕ И СМЕЖНЫЕ ПРАВА",
      title: "Правообладатели и лицензирование",
      text: "Ресурсы, которые полезны продюсеру при работе с музыкой, произведениями, вознаграждениями и правами на аудиовизуальный контент.",
      items: [
        ["РАО", "Российское Авторское Общество", "Коллективное управление авторскими правами, реестры произведений, документы и ставки авторского вознаграждения.", "https://rao.ru/"],
        ["РСП", "Российский Союз Правообладателей", "Защита прав авторов, исполнителей и правообладателей аудиовизуальных произведений.", "https://rp-union.ru/"],
        ["РП", "Роспатент", "Официальная информация по интеллектуальной собственности, регистрации и договорным отношениям.", "https://rospatent.gov.ru/"]
      ]
    },
    {
      id: "media",
      eyebrow: "ОТРАСЛЕВЫЕ МЕДИА И БАЗЫ",
      title: "Новости, аналитика, касса и справочники",
      text: "Не нормативные источники, а профессиональные медиа и базы — полезны для рыночного контекста и проверки отраслевых событий.",
      items: [
        ["ПС", "ПрофиСинема", "Портал для профессионалов кинобизнеса: аналитика, кассовые сборы, релизы, компании и услуги для кино.", "https://www.proficinema.com/"],
        ["БК", "Бюллетень кинопрокатчика", "Профессиональное издание о кинопрокате, бокс-офисе и аналитике российского рынка.", "https://www.kinometro.ru/"],
        ["КБ", "Кинобизнес сегодня", "Новости производства и проката, российская и международная касса, релизы и отраслевые интервью.", "https://kinobusiness.com/"],
        ["CP", "Cinemaplex", "Профессиональное издание о кинобизнесе, технологиях, производстве и кинопоказе.", "https://cinemaplex.ru/"]
      ]
    }
  ];

  const unionGuilds = [
    "Гильдия актёров",
    "Гильдия гримёров",
    "Гильдия звукорежиссёров",
    "Гильдия каскадёров",
    "Гильдия киноведов и кинокритиков",
    "Гильдия кинодраматургов",
    "Гильдия кинооператоров",
    "Гильдия кинотехников",
    "Гильдия композиторов",
    "Гильдия продюсеров и организаторов кинопроцесса",
    "Гильдия редакторов",
    "Гильдия режиссёров",
    "Гильдия художников кино и телевидения"
  ];

  const unionBodies = [
    "Комиссия анимационного кино",
    "Комиссия «Кинопедагогика и медиаобразование»",
    "Комиссия неигрового кино",
    "Творческая лаборатория духовно-нравственного и просветительского кино",
    "Ассоциация документального кино",
    "Ассоциация военного кино"
  ];

  const craftCommunities = [
    { code: "2Р", name: "Профессиональное сообщество вторых режиссёров", url: "https://kinoprofsoyuz.ru/directors/", entry: "Страница цеха на сайте МПК", source: "Публичные документы и ставки вторых режиссёров", logoStatus: "not-found" },
    { code: "АА", name: "Объединение ассистентов режиссёра по актёрам", url: "https://kinoprofsoyuz.ru/stavki-assistentov-po-akteram-2025/", entry: "Публикация на сайте МПК", source: "Актуальное письмо и описание профессионального объединения", logoStatus: "not-found" },
    { code: "ГКД", name: "Гильдия кастинг-директоров России", url: "https://guildcast.ru/", entry: "Официальный сайт", source: "Ассоциация «Гильдия кастинг-директоров»", logoStatus: "confirmed", logoSource: "https://static.tildacdn.com/tild3133-3466-4030-b038-636462363734/logo_ru.png" },
    { code: "SS", name: "Сообщество Script Supervisor", url: "https://kinoprofsoyuz.ru/continuity/", entry: "Отдельная страница на сайте МПК", source: "Цех скрипт-супервайзеров: документы и ставки", logoStatus: "not-found" },
    { code: "ПР", name: "Объединение помощников режиссёра", url: "https://kinoprofsoyuz.ru/stavki-2026-zvuk-i-pomoshhnik-rezhissera/", entry: "Публикация на сайте МПК", source: "Актуальные ставки и условия работы на 2026 год", logoStatus: "not-found" },
    { code: "ЛМ", name: "Гильдия продюсеров и локейшен-менеджеров подготовки кинообъектов", url: "https://guild-locations.ru/", entry: "Официальный сайт", source: "Самостоятельное профессиональное объединение", logoStatus: "confirmed", logoSource: "https://guild-locations.ru/bitrix/templates/guildlocations/images/logo.png" },
    { code: "ГР", name: "Гримёрный департамент", url: "https://kinoprofsoyuz.ru/make-up/", entry: "Страница цеха на сайте МПК", source: "Художники по гриму, гримёры и постижёры", logoStatus: "not-found" },
    { code: "КО", name: "Объединение департамента костюма", url: "https://kinoprofsoyuz.ru/costume/", entry: "Страница цеха на сайте МПК", source: "Документы и ставки костюмерного цеха", logoStatus: "not-found" },
    { code: "РК", name: "Объединение художников по реквизиту", url: "https://kinoprofsoyuz.ru/props/", entry: "Страница цеха на сайте МПК", source: "Документы и ставки реквизиторского департамента", logoStatus: "not-found" },
    { code: "FP", name: "Фокус-пуллеры России", url: "https://kinoprofsoyuz.ru/camera/", entry: "Страница цеха на сайте МПК", source: "Контакты объединения и актуальные документы", logoStatus: "not-found" },
    { code: "МК", name: "Механики камеры", url: "https://kinoprofsoyuz.ru/camera/", entry: "Страница цеха на сайте МПК", source: "Документы операторского цеха", logoStatus: "not-found" },
    { code: "СГ", name: "Технические специалисты операторской группы: свет и grip", url: "https://kinoprofsoyuz.ru/camera/", entry: "Страница цеха на сайте МПК", source: "Сообщество гаферов, осветители и grip", logoStatus: "not-found" },
    { code: "ПК", name: "Профессиональный союз каскадёров", url: "https://kaskadery.pro/", entry: "Официальный сайт", source: "Межрегиональная общественная организация", logoStatus: "confirmed", logoSource: "https://kaskadery.pro/wp-content/uploads/2017/02/logo.jpg" },
    { code: "АРМ", name: "Ассоциация режиссёров монтажа", url: "https://ruseditors.ru/", entry: "Официальный сайт", source: "Профессиональная ассоциация монтажного цеха", logoStatus: "confirmed", logoSource: "https://ruseditors.ru/images/svg/web_logo.svg" },
    { code: "ААК", name: "Ассоциация анимационного кино России", url: "https://aakr.ru/", entry: "Официальный сайт", source: "Профессиональное объединение организаций анимации", logoStatus: "confirmed", logoSource: "https://aakr.ru/wp-content/themes/aakr/i/logo_icon.png" },
    { code: "ЗВ", name: "Гильдия звукорежиссёров Российского музыкального союза", url: "https://rmu.org.ru/guild/gildija-zvukorezhisserov/", entry: "Официальная страница РМС", source: "Гильдия в составе Российского музыкального союза", logoStatus: "confirmed", logoSource: "https://rmu.org.ru/wp-content/uploads/2021/07/group-637.png" }
  ];

  const escHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
  const industryRoute = () => location.hash.slice(1).split("/")[0] === "industry";

  const ensureIndustryStyles = () => {
    if (document.querySelector("link[data-industry-sources-style]")) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/industry-sources.css?v=20260824-5";
    link.dataset.industrySourcesStyle = "";
    document.head.appendChild(link);
  };

  const addNavigationLinks = () => {
    const nav = document.querySelector("#sidebar nav");
    if (!nav) return;

    if (!nav.querySelector("[data-industry-sources]")) {
      const link = document.createElement("a");
      link.href = "#industry";
      link.dataset.industrySources = "";
      link.innerHTML = "<i>◎</i><span>Сообщества и организации</span>";
      const resources = nav.querySelector('a[href="#resources"]');
      if (resources) resources.insertAdjacentElement("afterend", link);
      else nav.appendChild(link);
    }

    if (!nav.querySelector("[data-seo-materials]")) {
      const link = document.createElement("a");
      link.href = "/stavki-kinotsekhov/";
      link.dataset.seoMaterials = "";
      link.innerHTML = "<i>▤</i><span>Материалы</span>";
      nav.appendChild(link);
    }
  };

  const addHomeMaterials = () => {
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
        <a href="/stavki-kinotsekhov/"><small>Справочник</small><b>Все ставки киноцехов</b><span>Подборки по цехам и быстрый вход в текущую базу.</span><em>Открыть →</em></a>
        <a href="/smeta-filma/"><small>Бюджет</small><b>Смета фильма</b><span>Как собрать предварительный расчёт проекта.</span><em>Открыть →</em></a>
        <a href="/operatorskiy-tsekh/"><small>Цех</small><b>Операторский</b><span>Ставки и условия операторской группы.</span><em>Открыть →</em></a>
        <a href="/rezhisserskiy-tsekh/"><small>Цех</small><b>Режиссёрский</b><span>Ставки режиссёрской группы и условия.</span><em>Открыть →</em></a>
        <a href="/hudozhestvennyy-tsekh/"><small>Цех</small><b>Художественный</b><span>Ориентиры художественно-постановочного блока.</span><em>Открыть →</em></a>
      </div>`;
    sourceStrip.insertAdjacentElement("afterend", section);
  };

  const industryListMarkup = (items) => items.map(([code, name, description, url]) => `<a href="${escHtml(url)}" target="_blank" rel="noopener" data-industry-entry data-search="${escHtml(`${code} ${name} ${description}`.toLocaleLowerCase("ru-RU"))}"><i>${escHtml(code)}</i><span><b>${escHtml(name)}</b><span>${escHtml(description)}</span></span><em>Открыть ↗</em></a>`).join("");

  const registryMarkup = (items, sourceLabel) => items.map((name) => `<span data-industry-entry data-search="${escHtml(name.toLocaleLowerCase("ru-RU"))}"><b>${escHtml(name)}</b><small>${escHtml(sourceLabel)}</small></span>`).join("");

  const craftCommunityMarkup = (items) => items.map((item) => {
    const search = `${item.code} ${item.name} ${item.entry} ${item.source}`.toLocaleLowerCase("ru-RU");
    const logo = item.logoSrc
      ? `<img src="${escHtml(item.logoSrc)}" alt="" loading="lazy" referrerpolicy="no-referrer">`
      : "";
    return `<a class="industry-community-card" href="${escHtml(item.url)}" target="_blank" rel="noopener" data-industry-entry data-logo-status="${escHtml(item.logoStatus)}" data-search="${escHtml(search)}"><span class="industry-community-logo" aria-hidden="true"><span>${escHtml(item.code)}</span>${logo}</span><span class="industry-community-copy"><b>${escHtml(item.name)}</b><small><span>${escHtml(item.entry)}</span>${escHtml(item.source)} ↗</small></span></a>`;
  }).join("");

  const industryPageMarkup = () => `
    <div class="industry-page">
      <section class="page-head"><div><span>ПРОФЕССИОНАЛЬНАЯ СРЕДА</span><h1>Сообщества и организации</h1><p>Проверяемые гильдии, профсоюзы, ассоциации, государственные ресурсы и профессиональные медиа российского кино. Каталог нужен для поиска первоисточников, контактов цехов, документов и отраслевого контекста.</p></div></section>
      <section class="industry-intro"><div><span>КАК УСТРОЕН КАТАЛОГ</span><h2>Не одна подборка ссылок, а карта отрасли</h2><p>Отдельный публичный сайт есть не у каждого цехового сообщества. Поэтому KinoRates разделяет прямые официальные ресурсы, официальный реестр Союза кинематографистов и сообщества, которые зафиксированы в материалах МПК, но работают через чаты или внутренние каналы.</p></div><ul><li><b>${unionGuilds.length}</b> гильдий в официальном реестре СК РФ</li><li><b>${unionBodies.length}</b> комиссий и ассоциаций СК РФ</li><li><b>${industryGroups.reduce((sum, group) => sum + group.items.length, 0)}</b> прямых публичных ресурсов в каталоге</li><li>Проверено и обновлено: <b>24 августа 2026</b></li></ul></section>
      <nav class="industry-jump" aria-label="Разделы отраслевых источников">${industryGroups.map((group) => `<a href="#industry-${group.id}">${escHtml(group.title)}</a>`).join("")}<a href="#industry-union">Все гильдии СК РФ</a><a href="#industry-crafts">Цеховые сообщества</a></nav>
      <label class="industry-filter"><span>⌕</span><input type="search" placeholder="Найти гильдию, ассоциацию, цех или ресурс…" data-industry-filter></label>
      ${industryGroups.map((group) => `<section class="industry-group" id="industry-${group.id}" data-industry-group><header><div><span>${escHtml(group.eyebrow)}</span><h2>${escHtml(group.title)}</h2></div><p>${escHtml(group.text)}</p></header><div class="industry-list">${industryListMarkup(group.items)}</div></section>`).join("")}
      <section class="industry-registry" id="industry-union" data-industry-group><header><div><span>ОФИЦИАЛЬНЫЙ РЕЕСТР СК РФ</span><h2>Профессиональные гильдии</h2></div><p>Даже если у гильдии нет отдельного публичного сайта, она не выпадает из каталога. Список сверяется с реестром Союза кинематографистов России.</p></header><div class="industry-pill-grid">${registryMarkup(unionGuilds, "Профессиональная гильдия")}</div></section>
      <section class="industry-registry" data-industry-group><header><div><span>КОМИССИИ И АССОЦИАЦИИ СК РФ</span><h2>Ещё 6 профильных объединений</h2></div><p>Анимация, неигровое кино, документалистика, военное кино и образовательные направления.</p></header><div class="industry-pill-grid">${registryMarkup(unionBodies, "СК РФ")}</div></section>
      <section class="industry-registry" id="industry-crafts" data-industry-group><header><div><span>ЦЕХОВЫЕ СООБЩЕСТВА</span><h2>Подтверждённые публичные точки входа</h2></div><p>Карточка ведёт либо на официальный сайт объединения, либо на конкретную страницу МПК, где опубликованы его контакты, документы или ставки. Страница МПК не означает, что сообщество входит в структуру профсоюза.</p></header><div class="industry-pill-grid industry-community-grid">${craftCommunityMarkup(craftCommunities)}</div></section>
      <aside class="industry-note"><div><b>Не нашли организацию?</b><p>Каталог специально ограничен проверяемыми отраслевыми ресурсами. Если у профессионального объединения есть действующий официальный сайт или публичная страница, которой здесь нет, её можно прислать на проверку.</p></div><a href="mailto:snegproduction@gmail.com?subject=KinoRates%20—%20отраслевой%20источник">Предложить источник →</a></aside>
    </div>`;

  const bindIndustryFilter = (view) => {
    const input = view.querySelector("[data-industry-filter]");
    if (!input) return;
    input.addEventListener("input", () => {
      const query = input.value.toLocaleLowerCase("ru-RU").replaceAll("ё", "е").trim();
      view.querySelectorAll("[data-industry-entry]").forEach((entry) => {
        const haystack = (entry.dataset.search || "").replaceAll("ё", "е");
        entry.classList.toggle("industry-hidden", Boolean(query) && !haystack.includes(query));
      });
      view.querySelectorAll("[data-industry-group]").forEach((group) => {
        const entries = [...group.querySelectorAll("[data-industry-entry]")];
        group.classList.toggle("industry-hidden", Boolean(query) && entries.length > 0 && entries.every((entry) => entry.classList.contains("industry-hidden")));
      });
    });
  };

  const renderIndustryPage = () => {
    if (!industryRoute()) return;
    const view = document.querySelector(".view");
    if (!view || view.dataset.industryRendered === "1") return;
    ensureIndustryStyles();
    view.dataset.industryRendered = "1";
    view.innerHTML = industryPageMarkup();
    view.classList.add("industry-view");
    view.querySelectorAll(".industry-community-logo img").forEach((image) => {
      image.addEventListener("error", () => image.remove(), { once: true });
    });

    const breadcrumb = document.querySelector(".breadcrumb");
    if (breadcrumb) breadcrumb.innerHTML = 'KinoRates <span>/</span> Сообщества и организации';
    const actions = document.querySelector(".top-actions");
    if (actions) actions.innerHTML = '<a class="quiet button-link" href="#resources">Цеховые письма</a>';

    document.querySelectorAll("#sidebar nav a").forEach((link) => link.classList.toggle("active", link.hasAttribute("data-industry-sources")));
    bindIndustryFilter(view);
  };

  const applyDeepLink = () => {
    if (industryRoute()) return;
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

  let syncQueued = false;
  const sync = () => {
    if (syncQueued) return;
    syncQueued = true;
    requestAnimationFrame(() => {
      syncQueued = false;
      addNavigationLinks();
      addHomeMaterials();
      renderIndustryPage();
      applyDeepLink();
    });
  };

  const root = document.getElementById("app");
  if (!root) return;
  ensureIndustryStyles();
  sync();
  new MutationObserver(sync).observe(root, { childList: true, subtree: true });
  window.addEventListener("hashchange", sync);
})();
