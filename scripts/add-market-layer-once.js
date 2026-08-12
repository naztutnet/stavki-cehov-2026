const fs=require('fs');
function replaceOnce(text,oldValue,newValue,label){if(!text.includes(oldValue))throw new Error(`${label} not found`);return text.replace(oldValue,newValue)}
let app=fs.readFileSync('app.js','utf8');
app=replaceOnce(app,
"const SRC=Array.isArray(window.KINORATES_SOURCES)?window.KINORATES_SOURCES.map(s=>({...s})):[];",
"const SRC=Array.isArray(window.KINORATES_SOURCES)?window.KINORATES_SOURCES.map(s=>({...s})):[];\nconst MARKET=Array.isArray(window.KINORATES_MARKET_DATA)?window.KINORATES_MARKET_DATA.map(item=>({...item})):[];",
'market const');
const marker="function rateRangeHint(r){const t=sourceRangeText(r);return t?`<small class=\"rate-range-note\">Рекомендация источника: ${esc(t)}${/₽/.test(t)?'':' ₽'}</small>`:''}\n";
const helpers=marker+`function marketItemMatches(item,r){\n  const m=item&&item.match||{};\n  if(m.dept&&r.dept!==m.dept)return false;\n  if(Array.isArray(m.deptIncludes)&&!m.deptIncludes.some(x=>r.dept.includes(x)))return false;\n  if(Array.isArray(m.profIncludes)&&!m.profIncludes.some(x=>r.prof.includes(x)))return false;\n  return Boolean(m.dept||m.deptIncludes||m.profIncludes);\n}\nfunction marketEvidenceFor(r){return MARKET.filter(item=>marketItemMatches(item,r)).sort((a,b)=>(b.year||0)-(a.year||0)).slice(0,3)}\nfunction marketEvidenceHtml(r){\n  const items=marketEvidenceFor(r);if(!items.length)return '';\n  return \`<div class=\"detail-section market-evidence\"><b>Рыночные данные</b><p class=\"market-disclaimer\">Не заменяют официальную или рекомендованную ставку выше. Год и период исследования указаны отдельно.</p><div class=\"market-evidence-list\">\${items.map(item=>\`<article class=\"market-evidence-item\"><div class=\"market-evidence-meta\">\${esc(item.kind)} · \${esc(item.year)}</div><strong>\${esc(item.title)}</strong><p>\${esc(item.text)}</p><small>\${esc(item.period)}</small><a href=\"\${esc(item.url)}\" target=\"_blank\" rel=\"noopener\">\${esc(item.source)} →</a></article>\`).join('')}</div></div>\`;\n}\n`;
app=replaceOnce(app,marker,helpers,'rate hint marker');
app=replaceOnce(app,
'    <div class="detail-section"><b>Источник</b><p>${r.src}<br>${meta.periodLine}${r.doc?`<br><a href="${r.doc}" target="_blank" rel="noopener">Открыть источник →</a>`:\'\'}</p></div>\n',
'    <div class="detail-section"><b>Источник</b><p>${r.src}<br>${meta.periodLine}${r.doc?`<br><a href="${r.doc}" target="_blank" rel="noopener">Открыть источник →</a>`:\'\'}</p></div>\n    ${marketEvidenceHtml(r)}\n',
'render market layer');
fs.writeFileSync('app.js',app);

let index=fs.readFileSync('index.html','utf8');
index=replaceOnce(index,'<script src="sources-data.js"></script>\n<script src="app.js"></script>','<script src="sources-data.js"></script>\n<script src="market-data.js"></script>\n<script src="app.js"></script>','market script order');
fs.writeFileSync('index.html',index);

let css=fs.readFileSync('app.css','utf8');
if(!css.includes('/* market evidence in profession detail */'))css+=`\n\n/* market evidence in profession detail */\n.market-disclaimer{margin:5px 0 10px;color:var(--ink-3);font-size:8.5px;line-height:1.45}\n.market-evidence-list{display:grid;gap:7px;margin-top:7px}\n.market-evidence-item{padding:10px 11px;border:1px solid var(--rule);border-radius:8px;background:#fafbf9}\n.market-evidence-meta{margin-bottom:4px;font:700 7.5px var(--mono);letter-spacing:.07em;text-transform:uppercase;color:var(--blue)}\n.market-evidence-item strong{display:block;font-size:10px;line-height:1.3}\n.market-evidence-item p{margin:5px 0!important;font-size:9px!important;line-height:1.45!important;color:var(--ink-2)!important}\n.market-evidence-item small{display:block;margin-bottom:5px;color:var(--ink-3);font-size:7.5px;line-height:1.35}\n.market-evidence-item a{font-size:8.5px;font-weight:650;text-decoration:none}\n`;
fs.writeFileSync('app.css',css);

let updates=fs.readFileSync('updates.js','utf8');
if(!updates.includes('Добавлены рыночные данные по профессиям')){
 const entry=`  {\n    date: "2026-08-13",\n    dateLabel: "13 августа 2026",\n    type: "data",\n    title: "Добавлены рыночные данные по профессиям",\n    text: "В карточках профессий появился отдельный слой рыночных исследований. Он не меняет подтверждённую ставку и всегда показывает год и период данных: StarDust / Новости кинопроизводства, Кинопоиск × МШК и динамика ИРИ."\n  },\n`;
 updates=updates.replace('window.KINORATES_UPDATES = [\n','window.KINORATES_UPDATES = [\n'+entry);
}
fs.writeFileSync('updates.js',updates);
console.log('Market layer integrated');
