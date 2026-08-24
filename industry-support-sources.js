(() => {
  const isIndustry = () => location.hash.slice(1).split("/")[0] === "industry";
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);

  const supportSources = [
    ["ФПРК", "Фонд поддержки регионального кинематографа", "Конкурсы, региональное кино, документальные и игровые проекты, образовательные программы.", "https://fundregion.ru/"],
    ["ИРИ", "Институт развития интернета", "Конкурсная поддержка интернет-контента, включая сериалы, документальные и другие аудиовизуальные проекты.", "https://xn--h1aax.xn--p1ai/"],
    ["ПФКИ", "Президентский фонд культурных инициатив", "Грантовая поддержка проектов в сфере культуры и креативных индустрий, включая аудиовизуальные проекты.", "https://xn--80aeeqaabljrdbg6a3ahhcl4ay9hsa.xn--p1ai/"]
  ];

  const unionGuilds = [
    ["Гильдия актёров", "https://unikino.ru/актеров-кино-россии/", "Профессиональная гильдия · Союз кинематографистов"],
    ["Гильдия гримёров", "https://unikino.ru/гримеров/", "Профессиональная гильдия · Союз кинематографистов"],
    ["Гильдия звукорежиссёров", "https://unikino.ru/звукорежиссёров/", "Профессиональная гильдия · Союз кинематографистов"],
    ["Гильдия каскадёров", "https://unikino.ru/каскадеров-россии/", "Профессиональная гильдия · Союз кинематографистов"],
    ["Гильдия киноведов и кинокритиков", "https://unikino.ru/киноведов-и-кинокритиков/", "Профессиональная гильдия · Союз кинематографистов"],
    ["Гильдия кинодраматургов", "https://unikino.ru/список-гильдий/", "Профессиональная гильдия · Союз кинематографистов"],
    ["Гильдия кинооператоров", "https://unikino.ru/кинооператоров/", "Профессиональная гильдия · Союз кинематографистов"],
    ["Гильдия кинотехников", "https://unikino.ru/кинотехников/", "Профессиональная гильдия · Союз кинематографистов"],
    ["Гильдия композиторов", "https://unikino.ru/композиторов-кино/", "Профессиональная гильдия · Союз кинематографистов"],
    ["Гильдия продюсеров и организаторов кинопроцесса", "https://orgcinema.ru/", "Профессиональная гильдия · официальный сайт"],
    ["Гильдия редакторов", "https://unikino.ru/редакторов/", "Профессиональная гильдия · Союз кинематографистов"],
    ["Гильдия режиссёров", "https://unikino.ru/кинорежиссеров-россии/", "Профессиональная гильдия · Союз кинематографистов"],
    ["Гильдия художников кино и телевидения", "https://unikino.ru/художников-кино-и-телевидения/", "Профессиональная гильдия · Союз кинематографистов"]
  ];

  const unionBodies = [
    ["Комиссия анимационного кино", "https://unikino.ru/комиссия-анимационного-кино/", "Официальная страница Союза кинематографистов"],
    ["Комиссия «Кинопедагогика и медиаобразование»", "https://unikino.ru/кинопедагогика-и-медиаобразование/", "Официальная страница Союза кинематографистов"],
    ["Комиссия неигрового кино", "https://unikino.ru/список-гильдий/", "Официальный реестр Союза кинематографистов"],
    ["Творческая лаборатория духовно-нравственного и просветительского кино", "https://unikino.ru/tvorcheskaya-laboratoria-prosvet/", "Официальная страница Союза кинематографистов"],
    ["Ассоциация документального кино", "https://unikino.ru/список-гильдий/", "Официальный реестр Союза кинематографистов"],
    ["Ассоциация военного кино", "https://unikino.ru/список-гильдий/", "Официальный реестр Союза кинематографистов"]
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
    section.innerHTML = `<header><div><span>ПОДДЕРЖКА</span><h2>Гранты и конкурсы</h2></div><p>Фонды и программы для проектов.</p></header><div class="industry-list">${supportSources.map(([code, name, description, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener" data-industry-entry data-search="${esc(`${code} ${name} ${description}`.toLocaleLowerCase("ru-RU"))}"><i>${esc(code)}</i><span><b>${esc(name)}</b><span>${esc(description)}</span></span><em>Открыть ↗</em></a>`).join("")}</div>`;
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
      "СОЮЗ КИНЕМАТОГРАФИСТОВ",
      "Профессиональные гильдии",
      "Официальные страницы гильдий и общий реестр Союза.",
      unionGuilds
    );

    const registries = [...document.querySelectorAll(".industry-registry")];
    const bodies = registries.find((section) => section !== union && /6 профильных объединений|КОМИССИИ И АССОЦИАЦИИ/i.test(section.textContent));
    replaceRegistry(
      bodies,
      "СОЮЗ КИНЕМАТОГРАФИСТОВ",
      "Комиссии и ассоциации",
      "Официальные страницы и общий реестр Союза.",
      unionBodies
    );

    const crafts = document.getElementById("industry-crafts");
    if (crafts) crafts.dataset.industryLinksEnhanced = "1";
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
      enhanceProposal();
    });
  };

  const root = document.getElementById("app");
  if (!root) return;
  apply();
  new MutationObserver(apply).observe(root, { childList: true, subtree: true });
  window.addEventListener("hashchange", apply);
})();
