(() => {
  const TELEGRAM_URL = "https://t.me/naz_tut_net";
  const TELEGRAM_HANDLE = "@naz_tut_net";

  const telegramIcon = `
    <svg class="contact-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21.2 3.4 3.8 10.1c-1 .4-1 1-.2 1.3l4.5 1.4 1.7 5.3c.2.7.6.8 1.1.3l2.5-2.4 4.8 3.5c.7.4 1.3.2 1.5-.7L22 4.6c.2-1-.2-1.5-.8-1.2Z" fill="currentColor" stroke="none"></path>
      <path d="m8.2 12.7 9.6-6.1" fill="none" stroke="#fff" stroke-width="1.25" stroke-linecap="round"></path>
    </svg>`;

  function addTelegramContact() {
    const methods = document.querySelector(".contact-methods");
    if (!methods || methods.querySelector("[data-telegram-contact]")) return;

    const link = document.createElement("a");
    link.className = "contact-method";
    link.href = TELEGRAM_URL;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.dataset.telegramContact = "";
    link.setAttribute("aria-label", `Написать в Telegram ${TELEGRAM_HANDLE}`);
    link.innerHTML = `${telegramIcon}<span><small>Telegram</small><b>${TELEGRAM_HANDLE}</b></span><i>Написать</i>`;
    methods.appendChild(link);
  }

  addTelegramContact();
  const root = document.getElementById("app");
  if (root) new MutationObserver(addTelegramContact).observe(root, { childList: true, subtree: true });
})();
