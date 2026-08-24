(() => {
  const isIndustry = () => location.hash.slice(1).split("/")[0] === "industry";
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);

  const supportSources = [
    ["ФПРК", "Фонд поддержки регионального кинематографа", "Конкурсы, региональное кино, документальные и игровые проекты, образовательные программы.", "https://fundregion.ru/"],
    ["ИРИ", "Институт развития интернета", "Конкурсная поддержка интернет-контента, включая сериалы, документальные и другие аудиовизуальные проекты.", "https://xn--h1aax.xn--p1ai/"],
    ["ПФКИ", "Президентский фонд культурных инициатив", "Грантовая поддержка проектов в сфере культуры и креативных индустрий, включая аудиовизуальные проекты.", "https://xn--80aeeqaabljrdbg6a3ahhcl4ay9hsa.xn--p1ai/"]
  ];

  const unionGuilds = [
    ["Гильдия актёров", "https://unikino.ru/актеров-кино-россии/", "Официальная страница Союза кинематографистов"],
    ["Гильдия гримёров", "https://unikino.ru/гримеров/", "Официальная страница Союза кинематографистов"],
    ["Гильдия звукорежиссёров", "https://unikino.ru/звукорежиссёров/", "Официальная страница Союза кинематографистов"],
    ["Гильдия каскадёров", "https://unikino.ru/каскадеров-россии/", "Официальная страница Союза кинематографистов"],
    ["Гильдия киноведов и кинокритиков", "https://unikino.ru/киноведов-и-кинокритиков/", "Официальная страница Союза кинематографистов"],
    ["Гильдия кинодраматургов", "https://unikino.ru/список-гильдий/", "Официальный реестр Союза кинематографистов"],
    ["Гильдия кинооператоров", "https://unikino.ru/кинооператоров/", "Официальная страница Союза кинематографистов"],
    ["Гильдия кинотехников", "https://unikino.ru/кинотехников/", "Официальная страница Союза кинематографистов"],
    ["Гильдия композиторов", "https://unikino.ru/композиторов-кино/", "Официальная страница Союза кинематографистов"],
    ["Гильдия продюсеров и организаторов кинопроцесса", "https://orgcinema.ru/", "Официальный сайт гильдии"],
    ["Гильдия редакторов", "https://unikino.ru/редакторов/", "Официальная страница Союза кинематографистов"],
    ["Гильдия режиссёров", "https://unikino.ru/кинорежиссеров-россии/", "Официальная страница Союза кинематографистов"],
    ["Гильдия художников кино и телевидения", "https://unikino.ru/художников-кино-и-телевидения/", "Официальная страница Союза кинематографистов"]
  ];

  const unionBodies = [
    ["Комиссия анимационного кино", "https://unikino.ru/комиссия-анимационного-кино/", "Официальная страница Союза кинематографистов"],
    ["Комиссия «Кинопедагогика и медиаобразование»", "https://unikino.ru/кинопедагогика-и-медиаобразование/", "Официальная страница Союза кинематографистов"],
    ["Комиссия неигрового кино", "https://unikino.ru/список-гильдий/", "Официальный реестр Союза кинематографистов"],
    ["Творческая лаборатория духовно-нравственного и просветительского кино", "https://unikino.ru/tvorcheskaya-laboratoria-prosvet/", "Официальная страница Союза кинематографистов"],
    ["Ассоциация документального кино", "https://unikino.ru/список-гильдий/", "Официальный реестр Союза кинематографистов"],
    ["Ассоциация военного кино", "https://unikino.ru/список-гильдий/", "Официальный реестр Союза кинематографистов"]
  ];

  const craftCommunities = [
    ["Вторые режиссёры и 2nd AD", "https://kinoprofsoyuz.ru/novye-stavki-vtoryh-rezhisserov/", "МПК · профессиональная публикация"],
    ["Ассистенты по актёрам", "https://kinoprofsoyuz.ru/stavki-assistentov-po-akteram-2025/", "МПК · профессиональная публикация"],
    ["Кастинг-директора", "https://kinoprofsoyuz.ru/stavki-kasting-direktorov-2025/", "МПК · профессиональная публикация"],
    ["Сообщество скрипт-супервайзеров", "https://kinoprofsoyuz.ru/work-duties/", "МПК · сообщество и должностные материалы"],
    ["Ассистенты режиссёра", "https://kinoprofsoyuz.ru/directors/", "МПК · режиссёрский цех"],
    ["Локейшен-менеджеры и продюсеры локаций", "https://kinoprofsoyuz.ru/stavki-v-regionah/", "МПК · отраслевой список сообществ"],
    ["Художники по гриму и постижу", "https://kinoprofsoyuz.ru/stavki-v-regionah/", "МПК · отраслевой список сообществ"],
    ["Работники костюмерного цеха", "https://kinoprofsoyuz.ru/stavki-v-regionah/", "МПК · отраслевой список сообществ"],
    ["Художники по реквизиту", "https://kinoprofsoyuz.ru/stavki-v-regionah/", "МПК · отраслевой список сообществ"],
    ["Focus Pullers Russia", "https://kinoprofsoyuz.ru/stavki-v-regionah/", "МПК · отраслевой список сообществ"],
    ["Механики камеры", "https://kinoprofsoyuz.ru/stavki-v-regionah/", "МПК · отраслевой список сообществ"],
    ["Свет и grip", "https://kinoprofsoyuz.ru/stavki-v-regionah/", "МПК · отраслевой список сообществ"],
    ["Каскадёрские сообщества", "https://stunt-info.ru/", "Профессиональный ресурс каскадёров"],
    ["Режиссёры монтажа", "https://kinoprofsoyuz.ru/poisk-rezhissera-montazha-ot-arm/", "МПК · Ассоциация режиссёров монтажа"],
    ["Анимационное сообщество", "https://aakr.ru/", "Ассоциация анимационного кино России"],
    ["Независимая гильдия колористов", "https://kinoprofsoyuz.ru/stavki-v-regionah/", "МПК · отраслевой список сообществ"],
    ["Профессиональные сообщества звукорежиссёров", "https://rmu.org.ru/guild/gildija-zvukorezhisserov/", "Гильдия звукорежиссёров РМС"]
  ];

  const linkedGrid = (items) => items.map(([name, url, source]) => `
    <a href="${esc(url)}" target="_blank" rel="noopener" data-industry-entry data-search="${esc(`${name} ${source}`.toLocaleLowerCase("ru-RU"))}">
      <b>${esc(name)}</b><small>${esc(source)} ↗</small>
    </a>`).join("");

  const addSupportSources = () => {
    if (document.querySelector("[data-industry-support-sources]")) return;
    const anchor = document.getElementById("industry-public");
    if (!anchor) return;
    const section = document.createElement("section");
    section.className = "industry-group";
    section.dataset.industryGroup = "";
    section.dataset.industrySupportSources = "";
    section.innerHTML = `<header><div><span>ФИНАНСИРОВАНИЕ И ПОДДЕРЖКА</span><h2>Фонды и конкурсные программы</h2></div><p>Ресурсы с конкурсами, грантами и программами поддержки производства.</p></header><div class="industry-list">${supportSources.map(([code, name, description, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener" data-industry-entry data-search="${esc(`${code} ${name} ${description}`.toLocaleLowerCase("ru-RU"))}"><i>${esc(code)}</i><span><b>${esc(name)}</b><span>${esc(description)}</span></span><em>Открыть ↗</em></a>`).join("")}</div>`;
    anchor.insertAdjacentElement("afterend", section);
    const counter = document.querySelector(".industry-intro ul li:nth-child(3) b");
    if (counter) counter.textContent = String(document.querySelectorAll(".industry-list [data-industry-entry]").length);
  };

  const replaceRegistry = (section, eyebrow, title, description, items) => {
    if (!section || section.dataset.industryLinksEnhanced === "1") return;
    const header = section.querySelector("header");
    const grid = section.querySelector(".industry-pill-grid");
    if (!header || !grid) return;
    header.innerHTML = `<div><span>${esc(eyebrow)}</span><h2>${esc(title)}</h2></div><p>${esc(description)}</p>`;
    grid.innerHTML = linkedGrid(items);
    section.dataset.industryLinksEnhanced = "1";
  };

  const enhanceRegistries = () => {
    const union = document.getElementById("industry-union");
    replaceRegistry(
      union,
      "СОЮЗ КИНЕМАТОГРАФИСТОВ РОССИЙСКОЙ ФЕДЕРАЦИИ",
      "13 профессиональных гильдий",
      "Каждая карточка теперь ведёт на официальный сайт гильдии или на её страницу в Союзе кинематографистов. Если отдельной страницы нет, ссылка ведёт на официальный реестр Союза.",
      unionGuilds
    );

    const registries = [...document.querySelectorAll(".industry-registry")];
    const bodies = registries.find((section) => section !== union && /6 профильных объединений|КОМИССИИ И АССОЦИАЦИИ/i.test(section.textContent));
    replaceRegistry(
      bodies,
      "КОМИССИИ И АССОЦИАЦИИ · СОЮЗ КИНЕМАТОГРАФИСТОВ РОССИЙСКОЙ ФЕДЕРАЦИИ",
      "Комиссии и профильные ассоциации",
      "Прямые официальные страницы там, где они существуют; в остальных случаях — официальный реестр Союза кинематографистов.",
      unionBodies
    );

    const crafts = document.getElementById("industry-crafts");
    replaceRegistry(
      crafts,
      "ЦЕХОВЫЕ И ПРОФЕССИОНАЛЬНЫЕ СООБЩЕСТВА",
      "Сообщества и рабочие объединения",
      "Здесь больше нет некликабельных названий: каждая карточка ведёт на подтверждаемую публичную точку входа — страницу МПК, профессиональной ассоциации или официальный ресурс сообщества.",
      craftCommunities
    );
  };

  const expandAbbreviations = () => {
    const page = document.querySelector(".industry-page");
    if (!page || page.dataset.industryAbbreviationsExpanded === "1") return;
    const walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      node.nodeValue = node.nodeValue
        .replaceAll("СК РФ", "Союз кинематографистов Российской Федерации")
        .replaceAll("реестре Союза кинематографистов Российской Федерации", "реестре Союза кинематографистов Российской Федерации");
    });
    page.dataset.industryAbbreviationsExpanded = "1";
  };

  const configureOrganizationForm = (attempt = 0) => {
    const form = document.getElementById("feedbackForm");
    if (!form) {
      if (attempt < 8) setTimeout(() => configureOrganizationForm(attempt + 1), 30);
      return;
    }
    const select = form.querySelector('select[name="type"]');
    if (select) {
      let option = [...select.options].find((item) => item.value === "Новая организация");
      if (!option) {
        option = document.createElement("option");
        option.value = "Новая организация";
        option.textContent = "Новая организация";
        select.appendChild(option);
      }
      select.value = "Новая организация";
    }
    const dialog = form.closest("dialog");
    const heading = dialog?.querySelector("h2");
    const intro = dialog?.querySelector(":scope > p");
    const textarea = form.querySelector('textarea[name="message"]');
    if (heading) heading.textContent = "Предложить новую организацию";
    if (intro) intro.textContent = "Пришлите название профессионального объединения и его официальный сайт или публичную страницу — мы проверим источник перед добавлением.";
    if (textarea) textarea.placeholder = "Название организации, ссылка на официальный ресурс и коротко — чем она полезна киноиндустрии";
  };

  const openOrganizationForm = () => {
    const genericFeedback = document.querySelector("#sidebar [data-feedback]");
    if (genericFeedback) genericFeedback.click();
    else if (typeof window.openModal === "function") window.openModal("feedback", "Нашёл ошибку");
    configureOrganizationForm();
  };

  const enhanceProposal = () => {
    const page = document.querySelector(".industry-page");
    if (!page) return;
    const note = [...page.querySelectorAll(".industry-note")].find((item) => /Не нашли организацию/i.test(item.textContent));
    if (!note || note.querySelector("[data-industry-propose]")) return;
    const oldLink = note.querySelector('a[href^="mailto:"]');
    if (oldLink) oldLink.remove();
    const button = document.createElement("button");
    button.type = "button";
    button.className = "industry-propose";
    button.dataset.industryPropose = "";
    button.textContent = "Предложить организацию →";
    button.addEventListener("click", openOrganizationForm);
    note.appendChild(button);
  };

  let queued = false;
  const apply = () => {
    if (!isIndustry()) return;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      addSupportSources();
      enhanceRegistries();
      expandAbbreviations();
      enhanceProposal();
    });
  };

  const root = document.getElementById("app");
  if (!root) return;
  apply();
  new MutationObserver(apply).observe(root, { childList: true, subtree: true });
  window.addEventListener("hashchange", apply);
})();
