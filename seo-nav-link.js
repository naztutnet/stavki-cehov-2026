(() => {
  const addMaterialsLink = () => {
    const footer = document.querySelector("#sidebar footer");
    if (!footer || footer.querySelector("[data-seo-materials]")) return;
    const link = document.createElement("a");
    link.href = "/stavki-kinotsekhov/";
    link.textContent = "Материалы";
    link.dataset.seoMaterials = "";
    footer.insertBefore(link, footer.firstChild);
  };

  const root = document.getElementById("app");
  if (!root) return;
  addMaterialsLink();
  new MutationObserver(addMaterialsLink).observe(root, { childList: true, subtree: true });
})();
