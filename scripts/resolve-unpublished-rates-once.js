const fs=require('fs'),vm=require('vm');
const context={window:{}};vm.createContext(context);
vm.runInContext(fs.readFileSync('rates-data.js','utf8'),context,{filename:'rates-data.js'});
const data=context.window.KINORATES_DATA;
const ids=[148,149,150,151,152,153];
const targets=data.filter(r=>ids.includes(r.id));
if(targets.length!==6)throw new Error(`Expected 6 target rows, got ${targets.length}`);
const alreadyResolved=targets.every(r=>r.status==='no_public_rate');
if(!alreadyResolved){
  if(targets.some(r=>r.status!=='check'))throw new Error('Unexpected target status before migration');
  for(const r of targets){
    r.amount=null;
    r.amount_text='по договорённости';
    r.status='no_public_rate';
    r.ot='';
    r.eff='';
    if([148,149].includes(r.id)){
      r.src='Гильдия звукорежиссёров Российского музыкального союза — постпродакшн входит в профиль гильдии; публичная тарифная сетка для этих работ не опубликована. Проверено 13.08.2026.';
      r.doc='https://rmu.org.ru/guild/gildija-zvukorezhisserov/';
      r.extra='Профессия и направление подтверждены профильной гильдией. Публичной ставки для этой конкретной работы нет; стоимость определяется по договорённости. Рыночные ориентиры, если доступны, показываются отдельно.';
    }else{
      r.src='МПК — каскадёрско-пиротехнический департамент: постановщики трюков, каскадёры и пиротехники перечислены как профессии цеха, но письмо со ставками на странице не опубликовано. Проверено 13.08.2026.';
      r.doc='https://kinoprofsoyuz.ru/stunts/';
      r.extra='Профессия подтверждена официальной страницей цеха. Публичная тарифная ставка не опубликована; стоимость конкретной работы и трюка определяется по договорённости.';
    }
  }
  const K=['dept','prof','cond','content','unit','amount','amount_text','ot','extra','region','eff','src','status','doc','id'];
  const D=K.map(()=>[]),M=K.map(()=>new Map());
  const R=data.map(row=>K.map((k,i)=>{const v=row[k]??(k==='amount'?null:'');const key=JSON.stringify(v);let idx=M[i].get(key);if(idx===undefined){idx=D[i].length;M[i].set(key,idx);D[i].push(v)}return idx}));
  fs.writeFileSync('rates-data.js',`/* Canonical KinoRates dataset: ${data.length} runtime-ready records. */\nwindow.KINORATES_DATA=(()=>{const K=${JSON.stringify(K)},D=${JSON.stringify(D)},R=${JSON.stringify(R)};return R.map(a=>Object.fromEntries(K.map((k,i)=>[k,D[i][a[i]]])));})();\n`);
}
if(data.filter(r=>r.status==='no_public_rate').length!==6)throw new Error('Expected exactly 6 no_public_rate rows');
if(data.some(r=>['check','newdoc'].includes(r.status)))throw new Error('Canonical dataset still contains unresolved check/newdoc rows');
if(targets.some(r=>r.amount!==null||!r.doc))throw new Error('Unpublished-rate rows must not expose unsupported amounts and must link to a profile source');

let app=fs.readFileSync('app.js','utf8');
app=app.replace('market2025:"рынок 2025", check:"источник не найден", newdoc:"цифра не сверена", verified2025:', 'market2025:"рынок 2025", no_public_rate:"нет публичной ставки", check:"источник не найден", newdoc:"цифра не сверена", verified2025:');
app=app.replace('market2025:"Рыночный ориентир 2025 года. Это не обязательный тариф и не цеховое письмо.",\n  check:', 'market2025:"Рыночный ориентир 2025 года. Это не обязательный тариф и не цеховое письмо.",\n  no_public_rate:"Профессия подтверждена, но опубликованной публичной тарифной ставки для этой конкретной работы нет. Сумма определяется по договорённости; рыночные ориентиры показываются отдельно.",\n  check:');
app=app.replace("market2025:'Рыночное исследование / ориентир',check:", "market2025:'Рыночное исследование / ориентир',no_public_rate:'Профессия подтверждена · публичного тарифа нет',check:");
app=app.replace("market2025:'Рыночный ориентир — не официальный минимум',check:", "market2025:'Рыночный ориентир — не официальный минимум',no_public_rate:'Публичная ставка не опубликована',check:");
app=app.replace("function sourceYear(r){const text=[r.eff,r.src].filter(Boolean).join(' '),m=text.match(/20\\d{2}/);return r.status==='market2025'?'2025':r.status==='archive'?'2023':(m?m[0]:'не указан')}", "function sourceYear(r){const text=[r.eff,r.src].filter(Boolean).join(' '),m=text.match(/20\\d{2}/);return r.status==='market2025'?'2025':r.status==='archive'?'2023':r.status==='no_public_rate'?'проверено 13.08.2026':(m?m[0]:'не указан')}");
app=app.replace("function sourceMeta(r){return {kind:SOURCE_KIND[r.status]||'Источник',year:sourceYear(r),confirmation:CONFIRMATION[r.status]||TIP[r.status],periodLine:r.eff?`Дата / период источника: ${r.eff}`:'Дата / период источника не указаны'}}", "function sourceMeta(r){return {kind:SOURCE_KIND[r.status]||'Источник',year:sourceYear(r),confirmation:CONFIRMATION[r.status]||TIP[r.status],periodLine:r.status==='no_public_rate'?'Состояние открытых источников проверено 13.08.2026':(r.eff?`Дата / период источника: ${r.eff}`:'Дата / период источника не указаны')}}");
app=app.replace("const reviewCount=cnt('check')+cnt('newdoc');", "const unpublishedCount=cnt('no_public_rate');");
app=app.replace('<div class="stat"><b>${reviewCount}</b><i>требуют проверки</i></div>', '<div class="stat"><b>${unpublishedCount}</b><i>без публичной ставки</i></div>');
fs.writeFileSync('app.js',app);

let updates=fs.readFileSync('updates.js','utf8');
if(!updates.includes('Публичные ставки вместо «требует проверки»')){
  updates=updates.replace('const UPDATES = [', `const UPDATES = [\n  {date:'13.08.2026',title:'Публичные ставки вместо «требует проверки»',text:'Для 4 каскадёрских и 2 sound post позиций зафиксирован результат: профессии подтверждены, но публичные тарифы не опубликованы. Неподтверждённые суммы убраны; стоимость указана как «по договорённости», рыночные ориентиры показываются отдельно.'},`);
  fs.writeFileSync('updates.js',updates);
}

const ciPath='.github/workflows/check-rate-sources.yml';
let ci=fs.readFileSync(ciPath,'utf8');
ci=ci.replace("'market2025','check','newdoc','verified2025'", "'market2025','no_public_rate','check','newdoc','verified2025'");
if(!ci.includes("Canonical dataset must not contain unresolved check/newdoc statuses")){
  ci=ci.replace("          if(!Array.isArray(sources)||sources.length<29)", "          if(data.some(row=>['check','newdoc'].includes(row.status)))throw new Error('Canonical dataset must not contain unresolved check/newdoc statuses');\n          const noPublicRate=data.filter(row=>row.status==='no_public_rate');\n          if(noPublicRate.length!==6)throw new Error(`Expected exactly 6 rows without a public tariff, got ${noPublicRate.length}`);\n          if(noPublicRate.some(row=>row.amount!==null||!row.doc))throw new Error('Rows without a public tariff must have amount=null and a profile source link');\n          if(!Array.isArray(sources)||sources.length<29)");
}
fs.writeFileSync(ciPath,ci);
console.log('Resolved public-rate status and hardened CI');
