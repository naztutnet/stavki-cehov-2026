(() => {
  const addMaterialsLink = () => {
    const nav = document.querySelector("#sidebar nav");
    if (!nav || nav.querySelector("[data-seo-materials]")) return;

    const link = document.createElement("a");
    link.href = "/stavki-kinotsekhov/";
    link.dataset.seoMaterials = "";
    link.innerHTML = "<i>▤</i><span>Материалы</span>";
    nav.appendChild(link);
  };

  const root = document.getElementById("app");
  if (!root) return;
  addMaterialsLink();
  new MutationObserver(addMaterialsLink).observe(root, { childList: true, subtree: true });
})();
