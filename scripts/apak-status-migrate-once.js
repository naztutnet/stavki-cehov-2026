const fs=require('fs'),vm=require('vm');

function replaceOnce(text,oldValue,newValue,label){
  if(!text.includes(oldValue))throw new Error(`${label} not found`);
  return text.replace(oldValue,newValue);
}

// 1) Canonical rates: replace 10 legacy aerial rows with 9 rows from the APAC 2025 letter.
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('rates-data.js','utf8'),ctx,{filename:'rates-data.js'});
const data=ctx.window.KINORATES_DATA;
const oldAerial=data.filter(r=>r.dept==='Аэросъёмка');
if(oldAerial.length!==10)throw new Error(`Expected 10 legacy aerial rows, got ${oldAerial.length}`);
const first=data.findIndex(r=>r.dept==='Аэросъёмка');
const doc='https://kinoprofsoyuz.ru/pip/wp-content/uploads/2025/03/apak-obrashhenie-k-prodyuseram-2025.pdf';
const common={
  dept:'Аэросъёмка',content:'Кино / сериал / реклама / клип / ТВ',unit:'смена',
  ot:'Каждый первый и последующие часы переработки — 15% от стоимости рабочей смены. До 15 минут включительно не считается переработкой; от 16 минут считается как полный час.',
  extra:'Минимальная ставка. Смена — 8 часов, не включая 1 час обеденного перерыва. Погрузка/разгрузка техники не оплачивается. Выезд коптервагена за пределы МКАД/КАД/города проживания — 50 ₽/км. Дополнительные проценты могут применяться при повышенных рисках, но конкретные размеры надбавок в письме не установлены. Отмена более чем за 24 часа — без оплаты; менее чем за 24 часа — 50% смены; при отмене после своевременного прибытия аэросъёмочного цеха на площадку — 100%. Тревел-день, день перемещения и день простоя в командировке — 50% смены.',
  region:'Москва / Россия',eff:'01.04.2025',src:'НКО АПАК — минимальные ставки и обязательные условия труда, с 01.04.2025',status:'verified2025',doc
};
const specs=[
  ['Оператор с коптером DJI Mavic 3 Cine / Mavic 3 Pro / Mavic 3 Pro Cine','Классический дрон · смена 8 часов',60000],
  ['Пилот и оператор с коптером DJI Inspire 2, камерой X5S с лицензиями ProRes/CinemaDNG','Классический дрон · смена 8 часов',80000],
  ['Пилот и оператор с коптером DJI Inspire 2, камерой X7 с лицензиями ProRes/CinemaDNG','Классический дрон · смена 8 часов',90000],
  ['Пилот и оператор с коптером DJI Inspire 3, камерой X9 с лицензиями ProRes/CinemaDNG','Классический дрон · смена 8 часов',140000],
  ['Пилот и оператор с тяжёлым гекса-/октокоптером и кинокамерой RED / ARRI / Sony','Классический дрон · смена 8 часов',200000],
  ['Пилот с FPV-коптером и камерой класса GoPro','FPV · смена 8 часов',60000],
  ['Пилот с FPV-коптером и камерой класса BlackMagic','FPV · смена 8 часов',120000],
  ['Пилот с FPV-коптером и камерой класса RED Komodo / Sony FX6','FPV · смена 8 часов',160000],
  ['Пилот с коптером FPV Gimbal','FPV · смена 8 часов',200000]
];
const fresh=specs.map(([prof,cond,amount],i)=>({...common,prof,cond,amount,amount_text:amount.toLocaleString('ru-RU').replace(/\u00a0/g,' '),id:59+i}));
const next=[...data.slice(0,first),...fresh,...data.slice(first+oldAerial.length)];
if(next.length!==449)throw new Error(`Expected 449 rows, got ${next.length}`);
if(next.filter(r=>r.dept==='Аэросъёмка').length!==9)throw new Error('Aerial replacement failed');
if(next.filter(r=>['check','newdoc'].includes(r.status)).length!==6)throw new Error('Expected 6 unresolved rows');
if(next.filter(r=>['fresh2026','official2026','verified2025','verified2024','verified2023'].includes(r.status)).length!==294)throw new Error('Expected 294 verified rows');
const K=['dept','prof','cond','content','unit','amount','amount_text','ot','extra','region','eff','src','status','doc','id'];
const D=K.map(()=>[]),maps=K.map(()=>new Map());
const R=next.map(row=>K.map((key,i)=>{const value=row[key]??(key==='amount'?null:'');const token=JSON.stringify(value);let idx=maps[i].get(token);if(idx===undefined){idx=D[i].length;maps[i].set(token,idx);D[i].push(value)}return idx}));
fs.writeFileSync('rates-data.js',`/* Canonical KinoRates dataset: ${next.length} runtime-ready records. */\nwindow.KINORATES_DATA=(()=>{const K=${JSON.stringify(K)},D=${JSON.stringify(D)},R=${JSON.stringify(R)};return R.map(a=>Object.fromEntries(K.map((k,i)=>[k,D[i][a[i]]])));})();\n`);

// 2) Human-readable status semantics and source metadata.
let app=fs.readFileSync('app.js','utf8');
app=app.replace(/const LBL = \{[^\n]+\};/,`const LBL = {fresh2026:"письмо 2026 ✓", official2026:"рекомендации 2026 ✓", market2025:"рынок 2025", check:"источник не найден", newdoc:"цифра не сверена", verified2025:"письмо 2025 ✓", verified2024:"письмо 2024 ✓", verified2023:"письмо 2023 ✓", archive:"данные 2023", expired:"архивный документ"};`);
const tipStart=app.indexOf('const TIP = {'),safeStart=app.indexOf('const SAFE_UNITS',tipStart);
if(tipStart<0||safeStart<0)throw new Error('TIP block not found');
const metaBlock=`const TIP = {
  fresh2026:"Конкретная ставка подтверждена опубликованным цеховым письмом 2026 года.",
  official2026:"Конкретная ставка подтверждена официальной публикацией профессионального объединения 2026 года.",
  market2025:"Рыночный ориентир 2025 года. Это не обязательный тариф и не цеховое письмо.",
  check:"Первичный источник, однозначно подтверждающий эту конкретную ставку, пока не найден.",
  newdoc:"Первичный документ найден, но конкретная цифра в нём ещё не подтверждена.",
  verified2025:"Конкретная ставка подтверждена опубликованным документом 2025 года. Более свежий соответствующий документ пока не найден.",
  verified2024:"Конкретная ставка подтверждена опубликованным документом 2024 года. Более свежий соответствующий документ пока не найден.",
  verified2023:"Конкретная ставка подтверждена опубликованным документом 2023 года. Более свежий соответствующий документ пока не найден.",
  archive:"Архивный рыночный ориентир. Не используйте его как подтверждённую текущую ставку.",
  expired:"Документ относится к прошлому периоду. Актуальность этой ставки на 2026 год не подтверждена."
};
const SOURCE_KIND={fresh2026:'Цеховое письмо',official2026:'Официальные рекомендации',market2025:'Рыночное исследование / ориентир',check:'Источник требует проверки',newdoc:'Первичный документ',verified2025:'Профессиональный первоисточник',verified2024:'Профессиональный первоисточник',verified2023:'Профессиональный первоисточник',archive:'Архивный рыночный ориентир',expired:'Исторический документ'};
const CONFIRMATION={fresh2026:'Цифра подтверждена ✓',official2026:'Цифра подтверждена ✓',market2025:'Рыночный ориентир — не официальный минимум',check:'Первичный источник цифры не найден',newdoc:'Документ найден, конкретная цифра не сверена',verified2025:'Цифра подтверждена ✓',verified2024:'Цифра подтверждена ✓',verified2023:'Цифра подтверждена ✓',archive:'Текущая актуальность не подтверждена',expired:'Текущая актуальность не подтверждена'};
function sourceYear(r){const text=[r.eff,r.src].filter(Boolean).join(' '),m=text.match(/20\\d{2}/);return r.status==='market2025'?'2025':r.status==='archive'?'2023':(m?m[0]:'не указан')}
function sourceMeta(r){return {kind:SOURCE_KIND[r.status]||'Источник',year:sourceYear(r),confirmation:CONFIRMATION[r.status]||TIP[r.status],periodLine:r.eff?\`Дата / период источника: \${r.eff}\`:'Дата / период источника не указаны'}}
function sourceRangeText(r){const t=String(r.amount_text||'').trim();return /\\d[\\d\\s]*\\s*[–—-]\\s*\\d/.test(t)?t:''}
function rateRangeHint(r){const t=sourceRangeText(r);return t?\`<small class="rate-range-note">Рекомендация источника: \${esc(t)}\${/₽/.test(t)?'':' ₽'}</small>\`:''}
`;
app=app.slice(0,tipStart)+metaBlock+app.slice(safeStart);
app=replaceOnce(app,"  const sourcePeriod=r.status==='market2025'?'Рыночный ориентир: 2025':(r.eff?`Действует с ${r.eff}`:'Дата не указана');","  const meta=sourceMeta(r);",'sourcePeriod');
app=replaceOnce(app,'    <div class="detail-section"><b>Актуальность</b><p><span class="badge b-${r.status}">${LBL[r.status]}</span><br><br>${TIP[r.status]}</p></div>','    <div class="detail-section"><b>Источник и подтверждение</b><p><span class="badge b-${r.status}">${LBL[r.status]}</span><br><br><b>Тип:</b> ${meta.kind}<br><b>Год данных:</b> ${meta.year}<br><b>Подтверждение:</b> ${meta.confirmation}</p></div>','detail status');
app=replaceOnce(app,'    <div class="detail-section"><b>Источник</b><p>${r.src}<br>${sourcePeriod}${r.doc?`<br><a href="${r.doc}" target="_blank" rel="noopener">Открыть источник →</a>`:\'\'}</p></div>','    <div class="detail-section"><b>Источник</b><p>${r.src}<br>${meta.periodLine}${r.doc?`<br><a href="${r.doc}" target="_blank" rel="noopener">Открыть источник →</a>`:\'\'}</p></div>','detail source');
app=replaceOnce(app,'<div class="calc-field"><label>Ставка за ${esc(e.r.unit)}</label><input type="number" min="0" max="1000000000" step="100" value="${e.rate}" data-field="rate" data-id="${e.r.id}"></div>','<div class="calc-field"><label>Ставка за ${esc(e.r.unit)}</label><input type="number" min="0" max="1000000000" step="100" value="${e.rate}" data-field="rate" data-id="${e.r.id}">${rateRangeHint(e.r)}</div>','sidebar range');
app=replaceOnce(app,'<div><div class="input-stack"><label>Ставка<input class="${e.rate>0?\'\':\'needs-input\'}" type="number" min="0" max="1000000000" step="100" value="${e.rate}" data-builder-field="rate" data-id="${e.r.id}" aria-label="Ставка" aria-invalid="${e.rate>0?\'false\':\'true\'}"></label></div></div>','<div><div class="input-stack"><label>Ставка<input class="${e.rate>0?\'\':\'needs-input\'}" type="number" min="0" max="1000000000" step="100" value="${e.rate}" data-builder-field="rate" data-id="${e.r.id}" aria-label="Ставка" aria-invalid="${e.rate>0?\'false\':\'true\'}"></label>${rateRangeHint(e.r)}</div></div>','builder range');
fs.writeFileSync('app.js',app);

// 3) Research cards: make dates/data periods explicit.
let index=fs.readFileSync('index.html','utf8');
index=index.replace('<small>Первоисточники</small><b>МПК и профессиональные объединения</b><span>Коллективные письма и рекомендации цехов</span>','<small>Первоисточники · актуальные</small><b>МПК и профессиональные объединения</b><span>Коллективные письма и рекомендации цехов</span>');
index=index.replace('<small>Рыночный ориентир</small><b>Новости кинопроизводства × StarDust</b><span>Гонорары сценаристов, режиссёров и операторов</span>','<small>Рыночный ориентир · 2025</small><b>Новости кинопроизводства × StarDust</b><span>Данные по проектам в производстве в 2024–2025 годах</span>');
index=index.replace('<small>Исследование</small><b>Кинопоиск × Московская школа кино</b><span>Доходы и гонорары десяти кинопрофессий</span>','<small>Исследование · 2024</small><b>Кинопоиск × Московская школа кино</b><span>Опубликовано 20.05.2024 · данные собирались в 2023–2024 годах</span>');
index=index.replace('<small>Динамика рынка</small><b>Данные ИРИ о стоимости специалистов</b><span>Как менялись расходы на ключевые профессии</span>','<small>Динамика рынка · 2026</small><b>Данные ИРИ о стоимости специалистов</b><span>Публикация 02.04.2026 · сравнение заявок 2025 года с 2024</span>');
fs.writeFileSync('index.html',index);

let css=fs.readFileSync('app.css','utf8');
if(!css.includes('/* source range hint */'))css+='\n\n/* source range hint */\n.rate-range-note{display:block;margin-top:5px;color:var(--ink-3);font-size:8px;line-height:1.35;font-weight:500}\n';
fs.writeFileSync('app.css',css);

let updates=fs.readFileSync('updates.js','utf8');
if(!updates.includes('Сверены ставки аэросъёмки АПАК 2025')){
  const entry=`  {\n    date: "2026-08-13",\n    dateLabel: "13 августа 2026",\n    type: "data",\n    title: "Сверены ставки аэросъёмки АПАК 2025",\n    text: "Ставки классических и FPV-дронов сверены по оригинальному письму АПАК. Уточнены модели оборудования, минимальные ставки, переработки и условия работы; неподтверждённые старые категории заменены актуальной сеткой из 9 позиций."\n  },\n`;
  updates=updates.replace('window.KINORATES_UPDATES = [\n','window.KINORATES_UPDATES = [\n'+entry);
}
fs.writeFileSync('updates.js',updates);

console.log('APAC/status migration ready:',{total:next.length,aerial:fresh.length,verified:294,unresolved:6});
