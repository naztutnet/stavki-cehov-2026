(() => {
  const sources = [
    ["ФПРК", "Фонд поддержки регионального кинематографа", "Конкурсы, региональное кино, документальные и игровые проекты, образовательные программы.", "https://fundregion.ru/"],
    ["ИРИ", "Институт развития интернета", "Конкурсная поддержка интернет-контента, включая сериалы, документальные и другие аудиовизуальные проекты.", "https://xn--h1aax.xn--p1ai/"],
    ["ПФКИ", "Президентский фонд культурных инициатив", "Грантовая поддержка проектов в сфере культуры и креативных индустрий, включая аудиовизуальные проекты.", "https://xn--e1ajjbczc.xn--h1adou.xn--p1ai/"]
  ];
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
  const apply = () => {
    if (location.hash.slice(1).split("/")[0] !== "industry" || document.querySelector("[data-industry-support-sources]")) return;
    const anchor = document.getElementById("industry-public");
    if (!anchor) return;
    const section = document.createElement("section");
    section.className = "industry-group";
    section.dataset.industryGroup = "";
    section.dataset.industrySupportSources = "";
    section.innerHTML = `<header><div><span>ФИНАНСИРОВАНИЕ И ПОДДЕРЖКА</span><h2>Фонды и конкурсные программы</h2></div><p>Ресурсы с конкурсами, грантами и программами поддержки производства.</p></header><div class="industry-list">${sources.map(([code, name, description, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener" data-industry-entry data-search="${esc(`${code} ${name} ${description}`.toLocaleLowerCase("ru-RU"))}"><i>${esc(code)}</i><span><b>${esc(name)}</b><span>${esc(description)}</span></span><em>Открыть ↗</em></a>`).join("")}</div>`;
    anchor.insertAdjacentElement("afterend", section);
    const counter = document.querySelector(".industry-intro ul li:nth-child(3) b");
    if (counter) counter.textContent = String(document.querySelectorAll(".industry-list [data-industry-entry]").length);
  };
  const root = document.getElementById("app");
  if (!root) return;
  apply();
  new MutationObserver(() => requestAnimationFrame(apply)).observe(root, { childList: true, subtree: true });
  window.addEventListener("hashchange", () => requestAnimationFrame(apply));
})();
