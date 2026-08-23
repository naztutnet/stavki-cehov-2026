(() => {
  function currentProductionType(button) {
    if (button?.dataset?.contributionType) return button.dataset.contributionType;
    try { return new URL(location.href).searchParams.get("type") || "all"; } catch (_) { return "all"; }
  }

  function openContribution(button) {
    const context = {
      kind: button?.dataset?.contributionKind || "rate",
      profession: button?.dataset?.contributionProfession || "",
      productionType: currentProductionType(button),
    };

    if (typeof window.openModal === "function") {
      window.openModal("contribution", "", context);
      return true;
    }

    if (typeof window.modal === "function") {
      const root = document.querySelector("#modalRoot");
      if (!root) return false;
      root.innerHTML = window.modal("contribution", "", context);
      const dialog = root.querySelector("dialog");
      root.querySelectorAll("[data-close]").forEach((close) => {
        close.addEventListener("click", () => {
          if (dialog?.open) dialog.close();
          root.innerHTML = "";
        });
      });
      if (dialog) {
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
      }
      if (typeof window.bindContributionForm === "function") window.bindContributionForm();
      return true;
    }

    return false;
  }

  document.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("[data-contribution]") : null;
    if (!button) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    openContribution(button);
  }, true);
})();
