const lazyScriptLoads=new Map();
function loadScriptOnce(src,integrity){
  if(lazyScriptLoads.has(src))return lazyScriptLoads.get(src);
  const promise=new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src=src;script.crossOrigin='anonymous';script.integrity=integrity;
    script.onload=()=>resolve();
    script.onerror=()=>{lazyScriptLoads.delete(src);reject(new Error(`Не удалось загрузить ${src}`))};
    document.head.appendChild(script);
  });
  lazyScriptLoads.set(src,promise);return promise;
}
async function ensureExcelJS(){
  if(window.ExcelJS)return;
  await loadScriptOnce('https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js','sha384-Pqp51FUN2/qzfxZxBCtF0stpc9ONI6MYZpVqmo8m20SoaQCzf+arZvACkLkirlPz');
  if(!window.ExcelJS)throw new Error('ExcelJS unavailable');
}
async function ensurePdfMake(){
  if(window.pdfMake&&window.pdfMake.vfs)return;
  await loadScriptOnce('https://cdn.jsdelivr.net/npm/pdfmake@0.2.20/build/pdfmake.min.js','sha384-G23ofMOEI98f9UnroUBjDi6Ll55Y5E6bOX4VAMJo0nIbuQRIxzn0g4athUOb58zs');
  await loadScriptOnce('https://cdn.jsdelivr.net/npm/pdfmake@0.2.20/build/vfs_fonts.js','sha384-pv+tpy6KGI5sKXJDf7oGPdvyVNKYXfAmDYpZ3r3PNP0d13PJQ6YMiiAEndd5sU15');
  if(!window.pdfMake)throw new Error('pdfMake unavailable');
}
// Аналитика загружается только после явного согласия посетителя.
const METRIKA_ID=111489870,CONSENT_KEY='kinorates_analytics_consent';
let metrikaStarted=false;
function startMetrika(){
  if(metrikaStarted)return;metrikaStarted=true;
  (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t);a=e.getElementsByTagName(t)[0];k.async=1;k.src=r;a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id='+METRIKA_ID,'ym');
  ym(METRIKA_ID,'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:'dataLayer',accurateTrackBounce:true,trackLinks:true});
}
const cookieBanner=document.getElementById('cookieBanner'),privacyDialog=document.getElementById('privacyDialog');
function consentValue(){try{return localStorage.getItem(CONSENT_KEY)}catch(e){return null}}
function saveConsent(value){const wasStarted=metrikaStarted;try{localStorage.setItem(CONSENT_KEY,value)}catch(e){}cookieBanner.hidden=true;if(value==='granted')startMetrika();else if(wasStarted)location.reload()}
if(consentValue()==='granted')startMetrika();else if(consentValue()!=='denied')cookieBanner.hidden=false;
document.getElementById('cookieAccept').addEventListener('click',()=>saveConsent('granted'));
document.getElementById('cookieReject').addEventListener('click',()=>saveConsent('denied'));
document.querySelectorAll('[data-open-privacy]').forEach(button=>button.addEventListener('click',()=>{if(typeof privacyDialog.showModal==='function')privacyDialog.showModal();else privacyDialog.setAttribute('open','')}));
document.getElementById('privacyClose').addEventListener('click',()=>privacyDialog.close());
privacyDialog.addEventListener('click',e=>{if(e.target===privacyDialog)privacyDialog.close()});
document.querySelector('footer [data-open-privacy]').addEventListener('click',()=>{cookieBanner.hidden=false});
const DATA = window.KINORATES_DATA;if(!Array.isArray(DATA))throw new Error('KinoRates data unavailable');
const SRC  = [{"name": "Технические специалисты операторской группы (свет, грип) — 2026", "date": "01.05.2026", "url": "https://kinoprofsoyuz.ru/pip/wp-content/uploads/2026/04/tehnicheskie-speczialisty-operatorskoj-gruppy-2026.pdf"}, {"name": "Директора, замы, администраторы съемочных групп — 2026", "date": "15.03.2026", "url": "https://kinoprofsoyuz.ru/pip/wp-content/uploads/2026/03/2026_direktora_zamy_administratory_semochnyh_grupp.pdf"}, {"name": "Гримерный департамент — 2026", "date": "08.03.2026", "url": "https://kinoprofsoyuz.ru/pip/wp-content/uploads/2026/03/grim-2026-draft-7.pdf"}, {"name": "Тарифы на постиж — 2026", "date": "08.03.2026", "url": "https://kinoprofsoyuz.ru/pip/wp-content/uploads/2026/03/postizh-prajs-2026-2.pdf"}, {"name": "Объединение художников-постановщиков — 2026", "date": "01.03.2026", "url": "https://kinoprofsoyuz.ru/pip/wp-content/uploads/2026/02/stavki_i_usloviya_raboty_hudpost_2026.pdf"}, {"name": "Объединение департамента костюма — 2026", "date": "01.02.2026", "url": "https://kinoprofsoyuz.ru/pip/wp-content/uploads/2026/02/pismo-departamenta-kostyuma-2026.pdf"}, {"name": "Гильдия кинодраматургов: ставки сценаристов (анонс МПК со ссылкой на публикацию)", "date": "29.01.2026", "url": "https://kinoprofsoyuz.ru/stavki-na-rekvizit-i-sczenarii/"}, {"name": "Реквизиторский департамент — 2026 (до 31.12.2026)", "date": "01.01.2026", "url": "https://kinoprofsoyuz.ru/pip/wp-content/uploads/2026/02/usloviya_raboty_rekvizitorskogo_departamenta_2026.pdf"}, {"name": "Ассоциация режиссеров монтажа — 2026", "date": "01.01.2026", "url": "https://kinoprofsoyuz.ru/pip/wp-content/uploads/2025/12/price_2026_for_print.pdf"}, {"name": "Звукорежиссеры и ассистенты звукорежиссеров — 2026", "date": "01.01.2026", "url": "https://kinoprofsoyuz.ru/pip/wp-content/uploads/2025/11/otkrytoe_pismo_2026_zvukovoj_departament_ot_15_10_25.pdf"}, {"name": "Объединение помощников режиссера — 2026", "date": "01.01.2026", "url": "https://kinoprofsoyuz.ru/pip/wp-content/uploads/2025/11/pomoshhnik_rezhissyora_—_stavki_i_usloviya_2026.pdf"}, {"name": "Объединение вторых режиссеров (1st AD) — 2026", "date": "01.01.2026", "url": "https://kinoprofsoyuz.ru/pip/wp-content/uploads/2025/10/stavki-1st-ad-2026-1.pdf"}, {"name": "Сообщество скрипт-супервайзеров", "date": "15.10.2025", "url": "https://kinoprofsoyuz.ru/pip/wp-content/uploads/2025/10/stavki_ss_15.10.2025_2026.pdf"}, {"name": "Объединение ассистентов режиссера по актерам", "date": "01.05.2025", "url": "https://kinoprofsoyuz.ru/pip/wp-content/uploads/2025/04/pismo_assistent_po_akteram_2025.pdf"}, {"name": "Объединение операторов и пилотов аэросъемочного цеха", "date": "01.04.2025", "url": "https://kinoprofsoyuz.ru/pip/wp-content/uploads/2025/03/apak-obrashhenie-k-prodyuseram-2025.pdf"}, {"name": "Операторы-камерамены шоу, подкастов, многокамерных съемок", "date": "01.03.2025", "url": "https://kinoprofsoyuz.ru/pip/wp-content/uploads/2024/12/operatory-kamerameny-shou-01.03.25.pdf"}, {"name": "Фокус-пуллеры России", "date": "01.01.2025", "url": "https://kinoprofsoyuz.ru/pip/wp-content/uploads/2025/02/stavki-fokus-pullerov-2025-3.pdf"}, {"name": "Объединение транспортного цеха Санкт-Петербурга", "date": "01.01.2025", "url": "https://kinoprofsoyuz.ru/pip/wp-content/uploads/2025/01/obedinenie_transportnogo_czeha_sankt_peterburga_2025g_.pdf"}, {"name": "Гильдия кастинг-директоров", "date": "01.12.2024", "url": "https://kinoprofsoyuz.ru/pip/wp-content/uploads/2024/12/polozhenie_o_minimalnyh_stavkah_gkd.pdf"}, {"name": "Механики камеры", "date": "01.04.2024", "url": "https://kinoprofsoyuz.ru/pip/wp-content/uploads/2024/06/pismo_s_usloviyami_po_mehanikam_01_03.pdf"}, {"name": "Гримерный департамент: реклама", "date": "01.04.2024", "url": "https://kinoprofsoyuz.ru/pip/wp-content/uploads/2024/03/grim-departament-03.24-reklama.pdf"}, {"name": "Вторые операторы и камермены", "date": "01.03.2024", "url": "https://kinoprofsoyuz.ru/pip/wp-content/uploads/2024/04/stavki_vtoryh_operatorov_i_kamermenov_2024.pdf"}, {"name": "Гильдия продюсеров и локейшен-менеджеров (срок истёк 31.01.2026)", "date": "01.01.2024", "url": "https://kinoprofsoyuz.ru/pip/wp-content/uploads/2024/07/gildiya-lokejshen-menedzherov-2024-2025.pdf"}, {"name": "Актерский цех", "date": "01.11.2023", "url": "https://kinoprofsoyuz.ru/pip/wp-content/uploads/2024/01/oficzialnye-tarify-akterskogo-czeha-01112023_.pdf"}, {"name": "Бригадиры АМС", "date": "01.11.2023", "url": "https://kinoprofsoyuz.ru/pip/wp-content/uploads/2023/10/oficzialnye-tarify-brigadirov-ams-01112023-1.pdf"}, {"name": "Независимая гильдия колористов — ставки 2022", "date": "01.01.2022", "url": "https://kinoprofsoyuz.ru/pip/wp-content/uploads/2022/02/czenovaya_politika_na_uslugi_czvetokorrekczii_icg_na_2022_god.pdf"}];
// Усреднённые проектные ставки CG/VFX в рекламе. Штатные зарплаты из источника
// намеренно не включены: они не относятся к расчёту производственной сметы.
const CG_RATES_2023=[
  ['Продюсер CG','Продюсирование проекта',[50000,100000,150000],'проект'],
  ['Арт-директор CG','Арт-дирекшен проекта',[70000,120000,180000],'проект'],
  ['CG / VFX супервайзер','Супервайзинг проекта',[60000,100000,150000],'проект'],
  ['Он-сет CG / VFX супервайзер','Супервайзинг одной смены',[20000,20000,30000],'смена'],
  ['Концепт-артист','Дизайн и концепт-арт',[15000,50000,90000],'проект'],
  ['3D-моделлер','3D-моделирование',[10000,50000,100000],'проект'],
  ['Художник по текстурам','Текстуринг 3D-модели',[20000,50000,90000],'проект'],
  ['Риггер','Риггинг 3D-модели',[30000,100000,180000],'проект'],
  ['LookDev / shading artist','Шейдинг и настройка 3D-модели',[30000,80000,150000],'проект'],
  ['Groom / fur artist','Шерсть и волосы 3D-модели',[50000,120000,180000],'проект'],
  ['FX / Houdini artist','Создание эффекта',[35000,90000,120000],'проект'],
  ['Previz artist','Превизуализация / аниматик',[25000,50000,90000],'проект'],
  ['Layout artist','Лейаут сцен',[20000,40000,50000],'проект'],
  ['Matchmove artist','Матчмув',[15000,40000,90000],'проект'],
  ['3D-аниматор','Анимация 3D-моделей',[50000,120000,180000],'проект'],
  ['Персонажный аниматор','Персонажная анимация',[90000,150000,180000],'проект'],
  ['Simulation artist','Симуляция объекта',[30000,70000,100000],'проект'],
  ['Crowd simulation artist','Симуляция толпы',[30000,60000,90000],'проект'],
  ['Lighting artist','Настройка света в 3D-сцене',[30000,70000,120000],'проект'],
  ['Render artist','Рендер 3D-сцены',[40000,80000,120000],'проект'],
  ['Compositing artist','Компоузинг',[30000,80000,120000],'проект'],
  ['Rotoscope artist','Ротоскопинг',[20000,50000,70000],'проект'],
  ['Cleanup artist','Клинап',[15000,40000,90000],'проект'],
  ['Motion designer','Моушен-дизайн',[35000,90000,150000],'проект'],
  ['Matte painter','Матпейнт',[15000,35000,70000],'проект'],
  ['Дизайнер титров','Титрование',[15000,35000,70000],'проект'],
  ['Технический монтажёр','Техническая сборка шотов',[15000,25000,50000],'проект']
];
const CG_LEVELS=[['min','минимальный ориентир'],['mid','средний ориентир'],['mid+','верхняя граница среднего ориентира']];
const CG_SOURCE_URL='https://docs.google.com/spreadsheets/d/19yQvJDvwUu8R21MHAa4OsdnOvP3tM93erzXfz2sscls/edit?usp=sharing';
CG_RATES_2023.forEach((row,rowIndex)=>row[2].forEach((amount,levelIndex)=>DATA.push({
  dept:'CG / VFX',prof:row[0],cond:`Реклама · ${row[1]} · ${CG_LEVELS[levelIndex][0]}`,
  content:'Реклама / CG',unit:row[3],amount,amount_text:amount.toLocaleString('ru-RU'),ot:'',
  extra:`Уровень ${CG_LEVELS[levelIndex][0]} — ${CG_LEVELS[levelIndex][1]}. Усреднённая ставка 2023 года; объём, сложность, количество шотов и итераций согласуются отдельно.`,
  region:'Россия',eff:'20.07.2023',src:'Сообщество «Точно продюсер» — усреднённые ставки исполнителей CG в рекламе',
  status:'archive',doc:CG_SOURCE_URL,id:1001+rowIndex*3+levelIndex
})));
SRC.push({name:'Усреднённые ставки исполнителей CG в рекламе — «Точно продюсер»',date:'20.07.2023',url:CG_SOURCE_URL});

// Исправления после сверки с оригинальным письмом ICG на 2022 год.
const COLOR_CORRECTION_FIXES={333:{amount:55000,amount_text:'55 000'},334:{amount:35000,amount_text:'35 000'},335:{amount:8000,amount_text:'8 000'},336:{amount:4500,amount_text:'4 500'},337:{amount:3500,amount_text:'3 500'},339:{amount:500000,amount_text:'500 000',unit:'проект'},340:{amount:45000,amount_text:'45 000',unit:'проект'}};
const SCREENWRITER_RATES='https://unikino.ru/%D0%B3%D0%B8%D0%BB%D1%8C%D0%B4%D0%B8%D1%8F-%D0%BA%D0%B8%D0%BD%D0%BE%D0%B4%D1%80%D0%B0%D0%BC%D0%B0%D1%82%D1%83%D1%80%D0%B3%D0%BE%D0%B2-%D1%81%D0%BE%D1%8E%D0%B7%D0%B0-%D0%BA%D0%B8%D0%BD%D0%B5%D0%BC-10/#more-97531';
const isScreenwriter=r=>r.dept==='Сценарно-редакторский департамент';
DATA.forEach(r=>{
  if(r.dept==='Актерский цех')r.dept='Актёры';
  if(COLOR_CORRECTION_FIXES[r.id])Object.assign(r,COLOR_CORRECTION_FIXES[r.id]);
  if(r.dept==='Цех цветокоррекции')r.dept='Цветокоррекция';
  if(r.dept==='Цветокоррекция'){
    r.doc='https://kinoprofsoyuz.ru/pip/wp-content/uploads/2022/02/czenovaya_politika_na_uslugi_czvetokorrekczii_icg_na_2022_god.pdf';
    r.extra=[r.extra,'Ставка из письма ICG 2022 года. Для актуального расчёта используйте калькулятор ICG: https://icguild.org/calculator'].filter(Boolean).join(' ');
  }
  if(isScreenwriter(r)){r.doc=SCREENWRITER_RATES;r.src='Гильдия кинодраматургов Союза кинематографистов России — рекомендуемые гонорары от 29.01.2026'}
});
const OPERATOR_POST_DOC='https://docs.yandex.ru/docs/view?url=ya-disk-public%3A%2F%2FiPcHRMy6DtI2V6N%2BuuhEI%2FBCf4mlP97lKDnEZijFQk%2FA2nfTgdJxr2K7l%2BAj4LoYq%2FJ6bpmRyOJonT3VoXnDag%3D%3D%3A%2F%D0%A3%D1%81%D0%BB%D0%BE%D0%B2%D0%B8%D1%8F%20%D0%BE%D0%BF%D0%B5%D1%80%D0%B0%D1%82%D0%BE%D1%80-%D0%BF%D0%BE%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D1%89%D0%B8%D0%BA_2024.pdf&name=%D0%A3%D1%81%D0%BB%D0%BE%D0%B2%D0%B8%D1%8F%20%D0%BE%D0%BF%D0%B5%D1%80%D0%B0%D1%82%D0%BE%D1%80-%D0%BF%D0%BE%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D1%89%D0%B8%D0%BA_2024.pdf';
const STEADICAM_DOC='https://docs.yandex.ru/docs/view?url=ya-disk-public%3A%2F%2FiPcHRMy6DtI2V6N%2BuuhEI%2FBCf4mlP97lKDnEZijFQk%2FA2nfTgdJxr2K7l%2BAj4LoYq%2FJ6bpmRyOJonT3VoXnDag%3D%3D%3A%2F%D0%A3%D1%81%D0%BB%D0%BE%D0%B2%D0%B8%D1%8F%20%D1%81%D1%82%D0%B5%D0%B4%D0%B8%D0%BA%D0%B0%D0%BC_2024.pdf&name=%D0%A3%D1%81%D0%BB%D0%BE%D0%B2%D0%B8%D1%8F%20%D1%81%D1%82%D0%B5%D0%B4%D0%B8%D0%BA%D0%B0%D0%BC_2024.pdf';
const SECOND_CAMERA_DOC='https://kinoprofsoyuz.ru/pip/wp-content/uploads/2024/04/stavki_vtoryh_operatorov_i_kamermenov_2024.pdf';
const SHOW_CAMERA_DOC='https://kinoprofsoyuz.ru/pip/wp-content/uploads/2024/12/operatory-kamerameny-shou-01.03.25.pdf';
const FOCUS_PULLER_DOC='https://kinoprofsoyuz.ru/pip/wp-content/uploads/2025/02/stavki-fokus-pullerov-2025-3.pdf';
DATA.forEach(r=>{
  if(r.dept!=='Операторский цех')return;
  if(r.prof==='Оператор-постановщик'){
    r.doc=OPERATOR_POST_DOC;r.status='expired';r.src='Коллективное письмо операторов-постановщиков — условия 2024–2026';
    r.extra=[r.extra,'Срок действия найденного письма закончился 01.03.2026. Более свежий документ не найден.'].filter(Boolean).join(' ');
  }
  if(r.prof==='Оператор стедикам'){
    r.doc=STEADICAM_DOC;r.status='expired';r.eff='01.01.2024';r.src='Коллективное письмо операторов стедикам — условия 2024–2025';
    r.extra=[r.extra,'Срок действия найденного письма закончился 31.12.2025. Более свежий документ не найден.'].filter(Boolean).join(' ');
  }
  if(r.prof==='Второй оператор'||r.prof==='Камерамэн'||r.prof==='Второй оператор, камерамэн, ассистент оператора по фокусу'){
    r.doc=SECOND_CAMERA_DOC;r.src='Коллективное письмо вторых операторов и камераменов — с 01.03.2024';
  }
  if(r.prof==='Оператор/камерамэн'&&r.cond.includes('шоу, подкаст')){
    r.doc=SHOW_CAMERA_DOC;r.eff='01.03.2025';r.status='verified2025';r.src='Коллективное письмо операторов-камераменов шоу, подкастов и многокамерных съёмок — с 01.03.2025';
  }
  if(r.prof==='Фокус-пуллер'){
    r.doc=FOCUS_PULLER_DOC;r.eff='01.01.2025';r.status='verified2025';r.src='Коллективное письмо фокус-пуллеров России — ставки 2025';
  }
});
SRC.push({name:'Операторы-постановщики — архивное письмо 2024–2026',date:'01.03.2024',url:OPERATOR_POST_DOC});
SRC.push({name:'Операторы стедикам — архивное письмо 2024–2025',date:'01.01.2024',url:STEADICAM_DOC});
const breakRateIndex=DATA.findIndex(r=>r.prof==='Ставка «разрыва» (все специальности)');if(breakRateIndex>=0)DATA.splice(breakRateIndex,1);
const writerSource=SRC.find(s=>s.name.includes('Гильдия кинодраматургов'));if(writerSource)writerSource.url=SCREENWRITER_RATES;
const LBL = {fresh2026:"письмо 2026 ✓", check:"сверить", newdoc:"есть письмо 2026", verified2025:"письмо 2025", archive:"данные 2023", expired:"срок истёк"};
const TIP = {
  fresh2026:"Цифра взята из цехового письма 2026 года и сверена 30.07.2026.",
  check:"Цифра из сводного реестра. Более свежего письма не найдено — уточните у цеха.",
  newdoc:"Цех выпустил письмо, вступившее в силу в 2026 году. Цифра здесь — из реестра февраля 2025, откройте письмо и сверьте.",
  verified2025:"Ставка подтверждена опубликованным коллективным письмом 2025 года. Более свежего письма не найдено.",
  archive:"Архивный рыночный ориентир 2023 года. Используйте только как отправную точку и уточняйте ставку у исполнителя.",
  expired:"Срок действия письма закончился. Ставка приведена как ориентир."
};
const SAFE_UNITS=['месяц','смена','полсмены','час','проект','аккорд','серия','минута','человек','единоразово'];
const esc=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const cleanText=(value,max=160)=>String(value??'').replace(/[\u0000-\u001F\u007F]/g,' ').trim().slice(0,max);
const clampNumber=(value,min,max,fallback)=>{const number=Number(value);return Number.isFinite(number)?Math.min(max,Math.max(min,number)):fallback};
const safeDate=value=>{const text=String(value||''),match=text.match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!match)return'';const [,y,m,d]=match.map(Number),date=new Date(Date.UTC(y,m-1,d));return date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===d?text:''};
function sanitizeCustomRecord(source){
  if(!source||typeof source!=='object')return null;
  const id=Number(source.id),unit=SAFE_UNITS.includes(source.unit)?source.unit:'проект',prof=cleanText(source.prof,120),dept=cleanText(source.dept,80);
  if(!Number.isSafeInteger(id)||id>=0||!prof||!dept)return null;
  const amount=clampNumber(source.amount,0,1e9,0);
  return {id,custom:true,dept,prof,cond:cleanText(source.cond,160)||'Пользовательская статья',content:'Своя статья',unit,amount,amount_text:String(amount),ot:'',extra:'Добавлено пользователем',region:'',eff:'',src:'Пользовательская статья',status:'check',doc:''};
}
const fmt = n => Math.round(n).toLocaleString('ru-RU') + ' ₽';
const state = {q:'', unit:'', content:'', dept:'', only26:false, sort:'dept', open:new Set()};
const est = new Map();
const STORAGE_KEY='stavki-cehov-budget-v2';
function saveEstimate(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify([...est.values()].slice(0,200).map(e=>({id:e.r.id,custom:!!e.r.custom,r:e.r.custom?sanitizeCustomRecord(e.r):undefined,start:safeDate(e.start),end:safeDate(e.end),rate:clampNumber(e.rate,0,1e9,0),qty:clampNumber(e.qty,0,1e5,1),people:clampNumber(e.people,0,1e5,1),tax:clampNumber(e.tax,0,.9999,.08)}))))}catch(_e){}
}
function restoreEstimate(){
  try{const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');if(!Array.isArray(parsed))return;parsed.slice(0,200).forEach(saved=>{if(!saved||typeof saved!=='object')return;const r=saved.custom?sanitizeCustomRecord(saved.r):DATA.find(x=>x.id===Number(saved.id));if(r){const legacyMonthly=saved.people==null&&r.unit==='месяц';est.set(r.id,{r,start:safeDate(saved.start),end:safeDate(saved.end),rate:clampNumber(saved.rate,0,1e9,r.amount||0),qty:r.unit==='месяц'?1:clampNumber(saved.qty,0,1e5,1),people:legacyMonthly?clampNumber(saved.qty,0,1e5,1):clampNumber(saved.people,0,1e5,1),tax:clampNumber(saved.tax,0,.9999,.08)})}})}catch(_e){}
}
restoreEstimate();

const depts = [...new Set(DATA.map(r=>r.dept))].sort((a,b)=>a.localeCompare(b,'ru'));
document.querySelector('.nav-head span').textContent=depts.length;
const units = SAFE_UNITS;
const conts = [...new Set(DATA.map(r=>r.content))].sort((a,b)=>a.localeCompare(b,'ru'));

// счётчики
const cnt = s => DATA.filter(r=>r.status===s).length;
document.getElementById('stats').innerHTML = `
  <div class="stat"><b>${DATA.length}</b><i>позиций в базе</i></div>
  <div class="stat"><b>${depts.length}</b><i>цехов и департаментов</i></div>
  <div class="stat ok"><b>${cnt('fresh2026')}</b><i>сверено по письмам 2026</i></div>
  <div class="stat"><b>${cnt('newdoc')}</b><i>ждут сверки с письмом 2026</i></div>
  <div class="stat bad"><b>${cnt('expired')}</b><i>по истёкшему письму</i></div>`;

// фильтры
const uSel = document.getElementById('unit'), cSel = document.getElementById('content');
units.filter(u=>DATA.some(r=>r.unit===u)).forEach(u=>uSel.insertAdjacentHTML('beforeend',`<option value="${u}">${u}</option>`));
conts.forEach(c=>cSel.insertAdjacentHTML('beforeend',`<option value="${c}">${c}</option>`));
const chips = document.getElementById('chips');
chips.innerHTML = `<button class="chip" data-d="" aria-pressed="true">Все цеха<span class="n">${DATA.length}</span></button>`+
  depts.map(d=>`<button class="chip" data-d="${d}" aria-pressed="false">${d}<span class="n">${DATA.filter(r=>r.dept===d).length}</span></button>`).join('');

function match(r){
  if(state.unit && r.unit!==state.unit) return false;
  if(state.content && r.content!==state.content) return false;
  if(state.dept && r.dept!==state.dept) return false;
  if(state.only26 && r.status!=='fresh2026') return false;
  if(state.q){
    const h=(r.dept+' '+r.prof+' '+r.cond+' '+r.unit+' '+r.amount_text+' '+r.ot+' '+r.extra).toLowerCase();
    if(!state.q.split(/\s+/).every(w=>h.includes(w))) return false;
  }
  return true;
}
const dnum = d => { const [a,b,c]=d.split('.'); return +(c+b+a); };
function sorted(rows){
  const o={'месяц':0,'проект':1,'аккорд':2,'серия':3,'смена':4,'полсмены':5,'час':6,'единоразово':7,'человек':8,'минута':9};
  if(state.sort==='hi') return rows.sort((a,b)=>(b.amount??-1)-(a.amount??-1));
  if(state.sort==='lo') return rows.sort((a,b)=>(a.amount??1e12)-(b.amount??1e12));
  if(state.sort==='date') return rows.sort((a,b)=>dnum(b.eff)-dnum(a.eff)||a.dept.localeCompare(b.dept,'ru'));
  return rows.sort((a,b)=>a.dept.localeCompare(b.dept,'ru')||(o[a.unit]??9)-(o[b.unit]??9)||(b.amount??0)-(a.amount??0));
}
function amountCell(r){
  if(r.amount==null) return `<td class="sum txt">${r.amount_text||'по договорённости'}</td>`;
  const per = r.unit==='месяц' ? 'в месяц' : r.unit==='смена' ? 'за смену' : 'за '+r.unit;
  const extra = r.amount_text.replace(/^[\d\s]+/,'').trim();
  return `<td class="sum">${fmt(r.amount)}<small>${per}${extra?' · '+extra:''}</small></td>`;
}
function render(){
  const rows = sorted(DATA.filter(match));
  document.getElementById('calculatorNote').hidden=!(rows.length&&rows.every(r=>r.dept==='Цветокоррекция'));
  document.getElementById('empty').hidden = rows.length>0;
  document.getElementById('resultCount').textContent = `${rows.length} ${rows.length===1?'позиция':'позиций'}`;
  document.getElementById('tb').innerHTML = rows.map(r=>{
    const selected = state.open.has(r.id);
    return `<tr class="r${selected?' selected':''}" data-id="${r.id}" tabindex="0" aria-selected="${selected}">
      <td class="dept">${r.dept}</td>
      <td class="prof" title="${esc(r.prof)}">${r.prof}</td>
      <td class="cond">${r.cond||'—'}</td>
      <td class="unit">${r.unit}</td>
      ${amountCell(r)}
      <td><span class="badge b-${r.status}" title="${TIP[r.status]}">${LBL[r.status]}</span></td>
      <td>${isScreenwriter(r)?`<a class="rate-source" href="${SCREENWRITER_RATES}" target="_blank" rel="noopener">Ставки ↗</a>`:est.has(r.id)?`<button class="addbtn is-added" data-remove="${r.id}" title="Убрать из сметы" aria-label="Убрать из сметы" aria-pressed="true">−</button>`:`<button class="addbtn" data-add="${r.id}" title="Добавить в смету" aria-label="Добавить в смету" aria-pressed="false">+</button>`}</td>
    </tr>`;
  }).join('');
}
function setInspectorTab(tab){
  document.querySelectorAll('[data-inspector-tab]').forEach(b=>{
    const active=b.dataset.inspectorTab===tab;
    b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));
  });
  document.getElementById('detailPane').hidden=tab!=='detail';
  document.getElementById('budgetPane').hidden=tab!=='budget';
}
function revealMobileDetail(){
  if(!window.matchMedia('(max-width:920px)').matches)return;
  const inspector=document.querySelector('.est'),controls=document.querySelector('.controls');
  const behavior=window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const controlsHeight=controls?.getBoundingClientRect().height||0;
    const top=window.scrollY+inspector.getBoundingClientRect().top-controlsHeight-10;
    window.scrollTo({top:Math.max(0,top),behavior});
  }));
}
function renderDetail(r){
  const pane=document.getElementById('detailPane');
  if(!r){pane.innerHTML='<div class="detail-empty">Выберите строку реестра, чтобы увидеть ставку, условия, переработки и первоисточник.</div>';return}
  const amount=r.amount?fmt(r.amount):(r.amount_text||'по договорённости');
  pane.innerHTML=`<div class="detail-card">
    <div class="kicker">${r.dept}</div><h4>${r.prof}</h4><div class="cond">${r.cond||'Условия не указаны'}</div>
    <div class="rate"><b>${amount}</b><span>${r.unit} · ${r.region}</span></div>
    <div class="detail-section"><b>Актуальность</b><p><span class="badge b-${r.status}">${LBL[r.status]}</span><br><br>${TIP[r.status]}</p></div>
    <div class="detail-section"><b>Переработка</b><p>${r.ot||'В письме не зафиксирована.'}</p></div>
    <div class="detail-section"><b>Условия и доплаты</b><p>${r.extra||'Дополнительные условия не указаны.'}</p></div>
    <div class="detail-section"><b>Источник</b><p>${r.src}<br>Действует с ${r.eff}${r.doc?`<br><a href="${r.doc}" target="_blank" rel="noopener">Открыть письмо цеха →</a>`:''}</p></div>
    ${r.dept==='Цветокоррекция'?`<div class="detail-section"><b>Точный расчёт</b><p>Письмо датировано 2022 годом. Актуальную стоимость с учётом хронометража, жанра, HDR и уровня специалиста можно рассчитать в <a href="https://icguild.org/calculator" target="_blank" rel="noopener">калькуляторе ICG →</a></p></div>`:''}
    ${isScreenwriter(r)?`<a class="detail-source" href="${SCREENWRITER_RATES}" target="_blank" rel="noopener">Открыть ставки сценаристов →</a>`:`<button class="detail-add${est.has(r.id)?' is-remove':''}" ${est.has(r.id)?`data-remove="${r.id}"`:`data-add="${r.id}"`}>${est.has(r.id)?'Убрать из сметы':'Добавить в смету'}</button>`}
  </div>`;
}
// смета
function newEstimate(r){
  return {r,start:'',end:'',rate:r.amount||0,qty:1,people:1,tax:.08};
}
const quantityLabels={'смена':'Смен','полсмены':'Полусмен','час':'Часов','серия':'Серий','минута':'Минут','проект':'Проектов','аккорд':'Аккордов','человек':'Человек','единоразово':'Количество','месяц':'Специалистов'};
const quantityLabel=unit=>quantityLabels[unit]||'Количество';
function parseDate(value){
  if(!value)return null;
  const [y,m,d]=value.split('-').map(Number);
  return new Date(Date.UTC(y,m-1,d));
}
function daysInMonth(date){return new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate()}
function monthDiff(start,end){
  let months=(end.getUTCFullYear()-start.getUTCFullYear())*12+end.getUTCMonth()-start.getUTCMonth();
  if(end.getUTCDate()<start.getUTCDate())months--;
  return Math.max(0,months);
}
function monthlyProrata(start,end,rate){
  if(!start||!end||end<start)return 0;
  const whole=monthDiff(start,end),startDay=start.getUTCDate(),endDay=end.getUTCDate();
  const first=(daysInMonth(start)-startDay+1)/daysInMonth(start)*rate;
  const last=endDay/daysInMonth(end)*rate;
  return startDay>endDay ? rate*whole+first+last : rate*(whole-1)+first+last;
}
function calcEstimate(e){
  const start=parseDate(e.start),end=parseDate(e.end);
  const elapsed=start&&end&&end>=start?(end-start)/86400000+1:0;
  const monthly=e.r.unit==='месяц';
  const quantity=monthly?1:(e.r.unit==='аккорд'?1:(e.qty||0));
  const people=e.people||0;
  const period=monthly?elapsed/30:quantity;
  const base=monthly?monthlyProrata(start,end,e.rate):(e.rate||0);
  const net=Math.max(0,base*quantity*people);
  const gross=e.tax<1?net/(1-e.tax):net;
  return {period,net,gross};
}
function renderEst(){
  const box=document.getElementById('estlines'), hint=document.getElementById('esthint');
  hint.hidden = est.size>0;
  let subtotal=0,total=0;
  box.innerHTML=[...est.values()].map(e=>{
    const calc=calcEstimate(e); subtotal+=calc.net; total+=calc.gross;
    const monthly=e.r.unit==='месяц';
    return `<div class="line calc-line"><div class="line-head"><div><div class="t">${esc(e.r.prof)}</div><div class="s">${esc(e.r.dept)}</div></div>
      <div><button class="x" data-del="${e.r.id}" title="Убрать" aria-label="Убрать из сметы">×</button><div class="v">${fmt(calc.gross)}</div></div></div>
      <div class="calc-grid">
        ${monthly?`<div class="calc-field"><label>Дата прикрепления</label><input type="date" value="${e.start}" data-field="start" data-id="${e.r.id}"></div><div class="calc-field"><label>Дата открепления</label><input type="date" value="${e.end}" data-field="end" data-id="${e.r.id}"></div>`:''}
        <div class="calc-field"><label>Ставка за ${esc(e.r.unit)}</label><input type="number" min="0" max="1000000000" step="100" value="${e.rate}" data-field="rate" data-id="${e.r.id}"></div>
        ${monthly?'':`<div class="calc-field"><label>${quantityLabel(e.r.unit)}</label><input type="number" min="0" max="100000" step="1" value="${e.qty}" data-field="qty" data-id="${e.r.id}"></div>`}
        <div class="calc-field"><label>Специалистов</label><input type="number" min="0" max="100000" step="1" value="${e.people}" data-field="people" data-id="${e.r.id}"></div>
        ${monthly?`<div class="calc-field"><label>Расчётный период</label><input readonly value="${calc.period.toLocaleString('ru-RU',{minimumFractionDigits:2,maximumFractionDigits:2})}"></div>`:''}
        <div class="calc-field"><label>Единица</label><input readonly value="${esc(e.r.unit)}"></div>
        <div class="calc-field wide"><label>Процент, %</label><input type="number" min="0" max="99.99" step="0.5" value="${Number((e.tax*100).toFixed(2))}" data-field="taxPercent" data-id="${e.r.id}"></div>
      </div>
      <div class="calc-result"><span>Сумма без налога</span><b>${fmt(calc.net)}</b><span>Сумма с налогом · ÷ ${(1-e.tax).toLocaleString('ru-RU',{maximumFractionDigits:2})}</span><b>${fmt(calc.gross)}</b></div></div>`;
  }).join('');
  document.getElementById('estsubtotal').textContent=fmt(subtotal);
  document.getElementById('esttotal').textContent=fmt(total);
  document.getElementById('estn').textContent=est.size+' '+(est.size%10===1&&est.size%100!==11?'позиция':'позиций');
  document.getElementById('openBuilder').textContent=`Открыть смету · ${est.size}`;
}
// события
document.getElementById('q').addEventListener('input',e=>{state.q=e.target.value.trim().toLowerCase();render()});
uSel.addEventListener('change',e=>{state.unit=e.target.value;render()});
cSel.addEventListener('change',e=>{state.content=e.target.value;render()});
document.getElementById('sort').addEventListener('change',e=>{state.sort=e.target.value;render()});
document.getElementById('only26').addEventListener('change',e=>{state.only26=e.target.checked;render()});
chips.addEventListener('click',e=>{
  const b=e.target.closest('.chip'); if(!b) return;
  state.dept=b.dataset.d;
  [...chips.querySelectorAll('.chip')].forEach(c=>c.setAttribute('aria-pressed',String(c===b)));
  render();
});
document.getElementById('tb').addEventListener('click',e=>{
  const add=e.target.closest('[data-add]'),remove=e.target.closest('[data-remove]');
  if(add||remove){const id=+(add?.dataset.add||remove?.dataset.remove),r=DATA.find(x=>x.id===id);
    if(remove)est.delete(id);else if(!est.has(r.id))est.set(r.id,newEstimate(r));
    renderEst();saveEstimate();render();return}
  const tr=e.target.closest('tr.r'); if(!tr) return;
  const id=+tr.dataset.id;state.open.clear();state.open.add(id);render();renderDetail(DATA.find(x=>x.id===id));setInspectorTab('detail');revealMobileDetail();
});
document.getElementById('tb').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest('tr.r')){e.preventDefault();e.target.closest('tr.r').click()}});
document.getElementById('detailPane').addEventListener('click',e=>{
  const add=e.target.closest('[data-add]'),remove=e.target.closest('[data-remove]');if(!add&&!remove)return;
  const id=+(add?.dataset.add||remove?.dataset.remove),r=DATA.find(x=>x.id===id);
  if(remove)est.delete(id);else if(!est.has(id))est.set(id,newEstimate(r));
  renderEst();saveEstimate();render();renderDetail(r);
});
document.getElementById('estlines').addEventListener('change',e=>{
  const f=e.target.closest('[data-field]'); if(!f) return;
  const row=est.get(+f.dataset.id); if(!row)return;
  if(f.dataset.field==='taxPercent')row.tax=clampNumber(f.value,0,99.99,0)/100;
  else if(f.dataset.field==='rate')row.rate=clampNumber(f.value,0,1e9,0);
  else if(f.dataset.field==='qty')row.qty=clampNumber(f.value,0,1e5,0);
  else if(f.dataset.field==='people')row.people=clampNumber(f.value,0,1e5,0);
  else row[f.dataset.field]=safeDate(f.value);
  renderEst();saveEstimate();renderBuilder();
});
document.getElementById('estlines').addEventListener('click',e=>{
  const d=e.target.closest('[data-del]'); if(!d) return; est.delete(+d.dataset.del); renderEst();saveEstimate();renderBuilder();render();
});
document.getElementById('clear').addEventListener('click',()=>{est.clear();renderEst();saveEstimate();renderBuilder();render()});
function budgetRows(){
  return [...est.values()].map((e,index)=>{
    const c=calcEstimate(e);
    return {index:index+1,dept:e.r.dept,prof:e.r.prof,cond:e.r.cond||'',start:e.start,end:e.end,unit:e.r.unit,rate:e.rate,qty:e.r.unit==='месяц'?1:(e.r.unit==='аккорд'?1:e.qty),people:e.people,period:c.period,tax:e.tax,net:c.net,gross:c.gross};
  });
}
const safeSheetText=value=>/^[=+\-@]/.test(String(value??'').trimStart())?`'${String(value??'')}`:String(value??'');
function exportName(ext){return `Предварительная_смета_${new Date().toISOString().slice(0,10)}.${ext}`}
function downloadBlob(blob,name){
  const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function setActionState(btn,text){const initial=btn.textContent;btn.textContent=text;btn.disabled=true;return()=>{btn.textContent=initial;btn.disabled=false}}
document.getElementById('xlsx').addEventListener('click',async()=>{
  const btn=document.getElementById('xlsx');
  if(!est.size){const done=setActionState(btn,'смета пуста');setTimeout(done,1400);return}
  const done=setActionState(btn,'создаю…');
  try{
    await ensureExcelJS();
    const rows=budgetRows(),workbook=new ExcelJS.Workbook(),sheet=workbook.addWorksheet('Смета');
    workbook.creator='KinoRates';workbook.title='KinoRates — Предварительная смета';workbook.subject='Предварительный расчёт ставок кинопроизводства';workbook.company='KinoRates';workbook.created=new Date();
    sheet.mergeCells('A1:N1');sheet.getCell('A1').value='KinoRates · Предварительная смета';
    sheet.getCell('A1').font={name:'Arial',size:16,bold:true,color:{argb:'FF181B18'}};sheet.getCell('A1').alignment={vertical:'middle'};sheet.getRow(1).height=30;
    sheet.mergeCells('A2:N2');sheet.getCell('A2').value='Ставки носят рекомендательный характер. Финальная ставка определяется сторонами по договорённости.';
    sheet.getCell('A2').font={name:'Arial',size:10,bold:true,color:{argb:'FFAD3C36'}};sheet.getRow(2).height=24;
    const headers=['№','Цех','Позиция','Условие','Прикрепление','Открепление','Ед.','Ставка','Объём','Специалистов','Период','Процент','Без налога','С налогом'];
    sheet.addRow(headers);
    rows.forEach(r=>sheet.addRow([r.index,safeSheetText(r.dept),safeSheetText(r.prof),safeSheetText(r.cond),r.start,r.end,safeSheetText(r.unit),r.rate,r.qty,r.people,r.period,r.tax,r.net,r.gross]));
    const net=rows.reduce((s,r)=>s+r.net,0),gross=rows.reduce((s,r)=>s+r.gross,0),totalRow=sheet.addRow(['','','ИТОГО','','','','','','','','','',net,gross]);
    sheet.columns=[6,24,28,34,14,14,12,15,10,12,11,11,16,16].map(width=>({width}));
    const header=sheet.getRow(3);header.height=25;header.eachCell(cell=>{cell.font={name:'Arial',size:10,bold:true,color:{argb:'FFFFFFFF'}};cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF252925'}};cell.alignment={vertical:'middle',wrapText:true}});
    sheet.eachRow((row,rowNumber)=>{if(rowNumber>3){row.alignment={vertical:'top',wrapText:true};row.font={name:'Arial',size:10};row.height=32}});
    ['H','M','N'].forEach(col=>{sheet.getColumn(col).numFmt='#,##0" ₽"'});sheet.getColumn('K').numFmt='0.00';sheet.getColumn('L').numFmt='0.00%';
    totalRow.font={name:'Arial',size:11,bold:true};totalRow.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFF1F3EF'}};
    sheet.views=[{state:'frozen',ySplit:3}];sheet.autoFilter={from:'A3',to:`N${Math.max(3,3+rows.length)}`};
    sheet.pageSetup={orientation:'landscape',fitToPage:true,fitToWidth:1,fitToHeight:0,paperSize:9};
    const buffer=await workbook.xlsx.writeBuffer();
    downloadBlob(new Blob([buffer],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),exportName('xlsx'));
    btn.textContent='готово ✓';setTimeout(done,1400);
  }catch(err){console.error(err);btn.textContent='ошибка';setTimeout(done,1800)}
});
document.getElementById('pdf').addEventListener('click',async()=>{
  const btn=document.getElementById('pdf');
  if(!est.size){const done=setActionState(btn,'смета пуста');setTimeout(done,1400);return}
  const done=setActionState(btn,'создаю…');
  try{
    await ensurePdfMake();
    const rows=budgetRows(),money=n=>Math.round(n).toLocaleString('ru-RU')+' ₽';
    const body=[['№','Цех / позиция','Даты','Ед.','Ставка','Объём / период','Спец.','%','Без налога','С налогом'].map(text=>({text,bold:true,color:'#ffffff'}))];
    rows.forEach(r=>body.push([String(r.index),`${r.dept}\n${r.prof}`,`${r.start||'—'} - ${r.end||'—'}`,r.unit,money(r.rate),`${r.qty} / ${r.period.toLocaleString('ru-RU',{maximumFractionDigits:2})}`,String(r.people),`${(r.tax*100).toLocaleString('ru-RU',{maximumFractionDigits:2})}%`,money(r.net),money(r.gross)]));
    const net=rows.reduce((s,r)=>s+r.net,0),gross=rows.reduce((s,r)=>s+r.gross,0);
    body.push(['','','','','','','', 'ИТОГО',money(net),money(gross)]);
    const doc={pageSize:'A4',pageOrientation:'landscape',pageMargins:[28,34,28,32],
      info:{title:'KinoRates — Предварительная смета',author:'KinoRates',subject:'Предварительный расчёт ставок кинопроизводства',creator:'KinoRates'},defaultStyle:{font:'Roboto',fontSize:7.5,color:'#181b18'},
      content:[{text:'KINORATES',fontSize:7.5,bold:true,color:'#2457f5',characterSpacing:1.2,margin:[0,0,0,3]},{text:'Предварительная смета',fontSize:17,bold:true,margin:[0,0,0,5]},
        {text:'Все ставки носят рекомендательный характер. Финальная ставка определяется продюсером и контрагентом по договорённости.',fontSize:8.5,bold:true,color:'#ad3c36',margin:[0,0,0,14]},
        {table:{headerRows:1,widths:[16,126,66,38,52,56,32,28,62,62],body},layout:{fillColor:(i)=>i===0?'#252925':i===body.length-1?'#f1f3ef':null,hLineColor:()=> '#dfe2dc',vLineColor:()=> '#dfe2dc',paddingLeft:()=>4,paddingRight:()=>4,paddingTop:()=>5,paddingBottom:()=>5},
          style:'budgetTable'}],
      styles:{budgetTable:{fontSize:7}},
      footer:(current,pageCount)=>({columns:[{text:'KinoRates',alignment:'left'},{text:`${current} / ${pageCount}`,alignment:'right'}],margin:[28,8,28,0],fontSize:7,color:'#818781'})};
    pdfMake.createPdf(doc).download(exportName('pdf'),()=>{btn.textContent='готово ✓';setTimeout(done,1400)});
  }catch(err){console.error(err);btn.textContent='ошибка';setTimeout(done,1800)}
});

// Полноэкранный конструктор: плотная сметная таблица и быстрый каталог.
const builder=document.getElementById('builder');
function renderQuickCatalog(query=''){
  const words=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const rows=DATA.filter(r=>!isScreenwriter(r)&&r.amount!=null&&words.every(w=>(r.dept+' '+r.prof+' '+r.cond+' '+r.content+' '+r.unit).toLowerCase().includes(w))).slice(0,80);
  document.getElementById('quickResults').innerHTML=rows.length?rows.map(r=>`<button class="quick-item" data-quick-add="${r.id}"><span><b>${r.prof}</b><small>${r.dept} · ${r.content} · ${r.unit}</small><small class="quick-condition">${r.cond||'Условие не указано'}</small></span><span>${Math.round(r.amount).toLocaleString('ru-RU')} ₽</span></button>`).join(''):'<div class="detail-empty">Ничего не найдено</div>';
}
function inputFor(e){
  if(e.r.unit==='месяц')return `<div class="input-stack two"><label>Прикрепление<input class="${e.start?'':'needs-input'}" type="date" value="${e.start}" data-builder-field="start" data-id="${e.r.id}" aria-invalid="${e.start?'false':'true'}"></label><label>Открепление<input class="${e.end?'':'needs-input'}" type="date" value="${e.end}" data-builder-field="end" data-id="${e.r.id}" aria-invalid="${e.end?'false':'true'}"></label></div>`;
  if(e.r.unit==='аккорд')return `<div class="input-stack"><label>Аккорд<span class="fixed-input">1</span></label></div>`;
  return `<div class="input-stack"><label>${quantityLabel(e.r.unit)}<input class="${e.qty>0?'':'needs-input'}" type="number" min="0" max="100000" step="1" value="${e.qty}" data-builder-field="qty" data-id="${e.r.id}" aria-invalid="${e.qty>0?'false':'true'}"></label></div>`;
}
function renderBuilder(){
  const values=[...est.values()];let net=0,gross=0;
  const rows=values.map((e,index)=>{const c=calcEstimate(e),scope=[e.r.content,e.r.cond].filter(Boolean).join(' · ');net+=c.net;gross+=c.gross;return `<div class="budget-row"><div>${index+1}</div><div class="position"><b>${esc(e.r.prof)}</b><small>${esc(e.r.dept)}</small>${scope?`<small class="position-scope">${esc(scope)}</small>`:''}</div><div class="unit">${esc(e.r.unit)}</div><div><div class="input-stack"><label>Ставка<input class="${e.rate>0?'':'needs-input'}" type="number" min="0" max="1000000000" step="100" value="${e.rate}" data-builder-field="rate" data-id="${e.r.id}" aria-label="Ставка" aria-invalid="${e.rate>0?'false':'true'}"></label></div></div><div>${inputFor(e)}</div><div><div class="input-stack"><label>Специалистов<input class="${e.people>0?'':'needs-input'}" type="number" min="0" max="100000" step="1" value="${e.people}" data-builder-field="people" data-id="${e.r.id}" aria-label="Специалистов" aria-invalid="${e.people>0?'false':'true'}"></label></div></div><div><div class="input-stack"><label>Процент<input type="number" min="0" max="99.99" step="0.5" value="${Number((e.tax*100).toFixed(2))}" data-builder-field="taxPercent" data-id="${e.r.id}" aria-label="Процент"></label></div></div><div class="money">${fmt(c.net)}</div><div class="money">${fmt(c.gross)}</div><div><button class="row-remove" data-builder-del="${e.r.id}" aria-label="Удалить">×</button></div></div>`}).join('');
  const addCustom='<div class="budget-add-row"><button data-builder-custom>+ Добавить свою статью</button></div>';
  document.getElementById('builderRows').innerHTML=values.length?`<div class="budget-table"><div class="budget-row head"><div>№</div><div>Цех / позиция</div><div>Ед.</div><div>Ставка, ₽</div><div>Параметр расчёта</div><div>Спец.</div><div>%</div><div>Без налога, ₽</div><div>С налогом, ₽</div><div></div></div>${rows}${addCustom}</div>`:`<div class="budget-empty"><div><b>Смета пока пуста</b><br>Найдите позицию в каталоге слева и добавьте её в расчёт.</div></div>${addCustom}`;
  document.getElementById('builderCount').textContent=values.length;
  document.getElementById('builderNet').textContent=fmt(net);
  document.getElementById('builderGross').textContent=fmt(gross);
}
function openBuilder(){renderBuilder();renderQuickCatalog();builder.hidden=false;document.body.style.overflow='hidden';document.getElementById('quickSearch').focus()}
function closeBuilder(){builder.hidden=true;document.body.style.overflow='';renderEst();render()}
document.getElementById('openBuilder').addEventListener('click',openBuilder);
document.getElementById('closeBuilder').addEventListener('click',closeBuilder);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!builder.hidden)closeBuilder()});
document.getElementById('quickSearch').addEventListener('input',e=>renderQuickCatalog(e.target.value));
document.getElementById('quickResults').addEventListener('click',e=>{const b=e.target.closest('[data-quick-add]');if(!b)return;const r=DATA.find(x=>x.id==b.dataset.quickAdd);if(!est.has(r.id))est.set(r.id,newEstimate(r));saveEstimate();renderBuilder();renderEst()});
document.getElementById('builderRows').addEventListener('change',e=>{const f=e.target.closest('[data-builder-field]');if(!f)return;const row=est.get(+f.dataset.id);if(!row)return;if(f.dataset.builderField==='taxPercent')row.tax=clampNumber(f.value,0,99.99,0)/100;else if(f.dataset.builderField==='rate')row.rate=clampNumber(f.value,0,1e9,0);else if(f.dataset.builderField==='qty')row.qty=clampNumber(f.value,0,1e5,0);else if(f.dataset.builderField==='people')row.people=clampNumber(f.value,0,1e5,0);else row[f.dataset.builderField]=safeDate(f.value);saveEstimate();renderBuilder();renderEst()});
document.getElementById('builderRows').addEventListener('click',e=>{const custom=e.target.closest('[data-builder-custom]');if(custom){openCustom();return}const b=e.target.closest('[data-builder-del]');if(!b)return;est.delete(+b.dataset.builderDel);saveEstimate();renderBuilder();renderEst()});
document.getElementById('builderClear').addEventListener('click',()=>{if(!est.size||confirm('Очистить все позиции сметы?')){est.clear();saveEstimate();renderBuilder();renderEst()}});
document.getElementById('builderXlsx').addEventListener('click',()=>document.getElementById('xlsx').click());
document.getElementById('builderPdf').addEventListener('click',()=>document.getElementById('pdf').click());

// Пользовательская статья расходов сохраняется и экспортируется как обычная позиция сметы.
const customDialog=document.getElementById('customDialog');
function openCustom(){if(typeof customDialog.showModal==='function')customDialog.showModal();else customDialog.setAttribute('open','')}
document.getElementById('customOpen').addEventListener('click',openCustom);
document.getElementById('customClose').addEventListener('click',()=>customDialog.close());
customDialog.addEventListener('click',e=>{if(e.target===customDialog)customDialog.close()});
document.getElementById('customForm').addEventListener('submit',e=>{
  e.preventDefault();
  let id=-Date.now();while(est.has(id))id--;
  const unit=SAFE_UNITS.includes(document.getElementById('customUnit').value)?document.getElementById('customUnit').value:'проект',rate=clampNumber(document.getElementById('customRate').value,0,1e9,0),qty=clampNumber(document.getElementById('customQty').value,1,1e5,1);
  const r=sanitizeCustomRecord({id,custom:true,dept:document.getElementById('customDept').value,prof:document.getElementById('customName').value,cond:document.getElementById('customCond').value,unit,amount:rate});if(!r)return;
  est.set(id,{r,start:'',end:'',rate,qty:unit==='аккорд'?1:qty,people:1,tax:.08});saveEstimate();renderEst();renderBuilder();customDialog.close();e.currentTarget.reset();document.getElementById('customRate').value=0;document.getElementById('customQty').value=1;
});

// Журнал обновлений: данные лежат отдельно в updates.js, чтобы их можно было дополнять автоматически.
const updatesDialog=document.getElementById('updatesDialog'),updates=[...(Array.isArray(window.KINORATES_UPDATES)?window.KINORATES_UPDATES:[]),...(Array.isArray(window.KINORATES_CHECKS)?window.KINORATES_CHECKS:[])].sort((a,b)=>String(b.date).localeCompare(String(a.date)));
const safeUpdateUrl=url=>{if(typeof url!=='string'||!url.trim())return'';try{const u=new URL(url);return u.protocol==='https:'?u.href:''}catch(e){return''}};
const updatesEscape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
document.getElementById('updatesCount').textContent=updates.length;
document.getElementById('updatesList').innerHTML=updates.length?updates.map(item=>{
  const type=item.type==='data'?'База ставок':item.type==='check'?'Проверка':'Сервис',url=safeUpdateUrl(item.url);
  return '<article class="update-item"><div class="update-meta"><time datetime="'+updatesEscape(item.date)+'">'+updatesEscape(item.dateLabel)+'</time><span class="update-type '+(item.type==='data'?'data':item.type==='check'?'check':'')+'">'+type+'</span></div><div class="update-content"><h3>'+updatesEscape(item.title)+'</h3><p>'+updatesEscape(item.text)+'</p>'+(url?'<a href="'+updatesEscape(url)+'" target="_blank" rel="noopener">Открыть источник →</a>':'')+'</div></article>'
}).join(''):'<p class="updates-empty">Записей об обновлениях пока нет.</p>';
document.getElementById('updatesOpen').addEventListener('click',()=>{if(typeof updatesDialog.showModal==='function')updatesDialog.showModal();else updatesDialog.setAttribute('open','')});
document.getElementById('updatesClose').addEventListener('click',()=>updatesDialog.close());
updatesDialog.addEventListener('click',e=>{if(e.target===updatesDialog)updatesDialog.close()});

// Обратная связь без внешнего хранилища: пользователь сам отправляет подготовленное письмо.
const feedbackDialog=document.getElementById('feedbackDialog'),feedbackCooldownKey='kinorates_feedback_last_sent';
let feedbackOpenedAt=0;
function openFeedback(){feedbackOpenedAt=Date.now();if(typeof feedbackDialog.showModal==='function')feedbackDialog.showModal();else feedbackDialog.setAttribute('open','')}
document.getElementById('feedbackOpen').addEventListener('click',openFeedback);
document.getElementById('builderFeedback').addEventListener('click',openFeedback);
document.getElementById('feedbackClose').addEventListener('click',()=>feedbackDialog.close());
feedbackDialog.addEventListener('click',e=>{if(e.target===feedbackDialog)feedbackDialog.close()});
document.getElementById('feedbackForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const form=e.currentTarget,button=form.querySelector('.feedback-submit'),status=document.getElementById('feedbackStatus');
  const type=document.getElementById('feedbackType').value,email=document.getElementById('feedbackEmail').value.trim(),message=document.getElementById('feedbackText').value.trim(),honeypot=document.getElementById('feedbackWebsite').value.trim();
  let lastSent=0;try{lastSent=Number(localStorage.getItem(feedbackCooldownKey)||0)}catch(_){}
  if(honeypot||Date.now()-feedbackOpenedAt<1500||Date.now()-lastSent<30000){status.className='feedback-status error';status.textContent='Не удалось отправить сообщение. Попробуйте ещё раз через минуту.';return}
  button.disabled=true;button.textContent='Отправляем…';status.className='feedback-status';status.textContent='';
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
  try{
    if(location.protocol==='file:')throw new Error('local-page');
    const response=await fetch('https://formsubmit.co/ajax/1b36541ff7e8949ab6f3d1b9124677d4',{method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({_subject:`Ставки цехов — ${type}`,type,email,message,page:location.origin+location.pathname,_honey:''})});
    const data=await response.json();
    if(!response.ok||data.success===false||data.success==='false')throw new Error(data.message||'Ошибка отправки');
    status.className='feedback-status ok';status.textContent='Сообщение отправлено. Спасибо!';try{localStorage.setItem(feedbackCooldownKey,String(Date.now()))}catch(_){}form.reset();button.textContent='Отправлено ✓';
    setTimeout(()=>{feedbackDialog.close();button.disabled=false;button.textContent='Отправить →';status.textContent=''},1800);
  }catch(error){
    console.warn('Отправка обратной связи не удалась.',error);
    status.className='feedback-status error';status.textContent='Не удалось отправить сообщение. Попробуйте ещё раз через минуту.';button.disabled=false;button.textContent='Отправить →';
  }finally{clearTimeout(timeout)}
});
// источники
document.getElementById('slist').innerHTML = SRC.map(s=>`<div class="sitem"><time>${s.date}</time>
  ${s.url?`<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>`:`<span class="no">${s.name}</span>`}</div>`).join('');
render();renderEst();setInspectorTab('detail');
