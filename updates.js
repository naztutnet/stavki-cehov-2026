window.KINORATES_UPDATES = [
  {
    date: "2026-08-12",
    dateLabel: "12 августа 2026",
    type: "data",
    title: "Статистика базы стала прозрачнее",
    text: "Счётчики на главной теперь показывают долю позиций, подтверждённых письмами 2026 года, и отдельно — остальные источники и позиции, требующие проверки."
  },
  {
    date: "2026-08-11",
    dateLabel: "11 августа 2026",
    type: "service",
    title: "Защищённое соединение и управление аналитикой",
    text: "KinoRates переведён на HTTPS. Яндекс Метрика теперь запускается только после согласия посетителя."
  },
  {
    date: "2026-08-10",
    dateLabel: "10 августа 2026",
    type: "data",
    title: "Дополнены первоисточники операторского цеха",
    text: "К позициям операторского цеха прикреплены найденные письма и условия работы для дополнительной проверки.",
    url: "https://kinoprofsoyuz.ru/camera/"
  },
  {
    date: "2026-08-10",
    dateLabel: "10 августа 2026",
    type: "data",
    title: "Добавлены архивные ориентиры CG / VFX",
    text: "Добавлены проектные ставки 2023 года. Они обозначены как архивные ориентиры и требуют подтверждения актуальности."
  },
  {
    date: "2026-07-30",
    dateLabel: "30 июля 2026",
    type: "data",
    title: "Собрана первая версия базы KinoRates",
    text: "Объединены справочник МПК и реестр «Точно продюсер»: 420 позиций в 23 цехах и департаментах.",
    url: "https://kinoprofsoyuz.ru/stranicza-stavok-po-czeham/"
  }
];

// Обновляем смысловые счётчики после инициализации основной базы.
// Источник истины — статусы самих записей, поэтому цифры меняются автоматически вместе с rates-data.js.
document.addEventListener('DOMContentLoaded', () => {
  const data = Array.isArray(window.KINORATES_DATA) ? window.KINORATES_DATA : [];
  const stats = document.getElementById('stats');
  if (!data.length || !stats) return;

  const departments = new Set(data.map(row => row.dept).filter(Boolean));
  const confirmed2026 = data.filter(row => row.status === 'fresh2026').length;
  const pending2026 = data.filter(row => row.status === 'newdoc').length;
  const other = Math.max(0, data.length - confirmed2026);
  const confirmedShare = data.length ? (confirmed2026 / data.length * 100).toLocaleString('ru-RU', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }) : '0,0';

  stats.innerHTML = `
    <div class="stat"><b>${data.length}</b><i>всего позиций</i></div>
    <div class="stat"><b>${departments.size}</b><i>цеха и департамента</i></div>
    <div class="stat ok"><b>${confirmed2026}</b><i>подтверждено письмами 2026 · ${confirmedShare}% базы</i></div>
    <div class="stat"><b>${other}</b><i>остальные источники / требуют проверки · ${pending2026} ждут сверки 2026</i></div>
  `;

  const lede = document.querySelector('.lede');
  if (lede) {
    lede.textContent = 'Данные из двух источников объединены в единую базу: справочника МПК и реестра сообщества «Точно продюсер». Позиции, подтверждённые цеховыми письмами 2026 года, отмечены зелёным. Остальные записи сохраняют статус и источник, чтобы было видно, какие данные требуют дополнительной проверки.';
  }
});
