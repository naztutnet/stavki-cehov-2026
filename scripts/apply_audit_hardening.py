#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERSION = "20260813-1026"
CHECKOUT_SHA = "11d5960a326750d5838078e36cf38b85af677262"

def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")

def write(path: str, text: str) -> None:
    p = ROOT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text, encoding="utf-8")

def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected exactly one match, found {count}")
    return text.replace(old, new, 1)

def replace_between(text: str, start: str, end: str, replacement: str, label: str) -> str:
    i = text.find(start)
    if i < 0:
        raise RuntimeError(f"{label}: start marker not found")
    j = text.find(end, i)
    if j < 0:
        raise RuntimeError(f"{label}: end marker not found")
    return text[:i] + replacement + text[j:]

# app.js
app = read("app.js")
app = replace_once(
    app,
    "const safeDate=value=>{const text=String(value||''),match=text.match(/^(\\d{4})-(\\d{2})-(\\d{2})$/);if(!match)return'';const [,y,m,d]=match.map(Number),date=new Date(Date.UTC(y,m-1,d));return date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===d?text:''};",
    "const safeDate=value=>{const text=String(value||''),match=text.match(/^(\\d{4})-(\\d{2})-(\\d{2})$/);if(!match)return'';const [,y,m,d]=match.map(Number),date=new Date(Date.UTC(y,m-1,d));return date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===d?text:''};\nconst safeExternalUrl=value=>{if(typeof value!=='string'||!value.trim())return'';try{const url=new URL(value);return url.protocol==='https:'?url.href:''}catch(_e){return''}};",
    "add safeExternalUrl",
)
app = replace_once(
    app,
    'return `<td class="sum">${fmt(r.amount)}<small>${per}${extra?\' · \'+extra:\'\'}</small></td>`;',
    'return `<td class="sum">${fmt(r.amount)}<small>${esc(per)}${extra?\' · \'+esc(extra):\'\'}</small></td>`;',
    "escape amountCell metadata",
)

new_render = r'''function render(){
  const rows = sorted(DATA.filter(match));
  document.getElementById('calculatorNote').hidden=!(rows.length&&rows.every(r=>r.dept==='Цветокоррекция'));
  document.getElementById('empty').hidden = rows.length>0;
  document.getElementById('resultCount').textContent = `${rows.length} ${rows.length===1?'позиция':'позиций'}`;
  document.getElementById('tb').innerHTML = rows.map(r=>{
    const selected = state.open.has(r.id);
    return `<tr class="r${selected?' selected':''}" data-id="${r.id}" tabindex="0" aria-selected="${selected}">
      <td class="dept">${esc(r.dept)}</td>
      <td class="prof" title="${esc(r.prof)}">${esc(r.prof)}</td>
      <td class="cond">${esc(r.cond||'—')}</td>
      <td class="unit">${esc(r.unit)}</td>
      ${amountCell(r)}
      <td><span class="badge b-${r.status}" title="${esc(TIP[r.status])}">${esc(LBL[r.status])}</span></td>
      <td>${est.has(r.id)?`<button class="addbtn is-added" data-remove="${r.id}" title="Убрать из сметы" aria-label="Убрать из сметы" aria-pressed="true">−</button>`:`<button class="addbtn" data-add="${r.id}" title="Добавить в смету" aria-label="Добавить в смету" aria-pressed="false">+</button>`}</td>
    </tr>`;
  }).join('');
}
'''
app = replace_between(app, "function render(){", "function setInspectorTab", new_render, "replace render")

new_detail = r'''function renderDetail(r){
  const pane=document.getElementById('detailPane');
  if(!r){pane.innerHTML='<div class="detail-empty">Выберите строку реестра, чтобы увидеть ставку, условия, переработки и первоисточник.</div>';return}
  const amountText=String(r.amount_text||'');
  const amount=amountText&&(/[–—+%]|бесплатно|договорённости/i.test(amountText))?amountText:(r.amount?fmt(r.amount):(amountText||'по договорённости'));
  const meta=sourceMeta(r),docUrl=safeExternalUrl(r.doc);
  pane.innerHTML=`<div class="detail-card">
    <div class="kicker">${esc(r.dept)}</div><h4>${esc(r.prof)}</h4><div class="cond">${esc(r.cond||'Условия не указаны')}</div>
    <div class="rate"><b>${esc(amount)}</b><span>${esc(r.unit)} · ${esc(r.region)}</span></div>
    <div class="detail-section"><b>Источник и подтверждение</b><p><span class="badge b-${r.status}">${esc(LBL[r.status])}</span><br><br><b>Тип:</b> ${esc(meta.kind)}<br><b>Год данных:</b> ${esc(meta.year)}<br><b>Подтверждение:</b> ${esc(meta.confirmation)}</p></div>
    <div class="detail-section"><b>Переработка</b><p>${esc(r.ot||'В письме не зафиксирована.')}</p></div>
    <div class="detail-section"><b>Условия и доплаты</b><p>${esc(r.extra||'Дополнительные условия не указаны.')}</p></div>
    <div class="detail-section"><b>Источник</b><p>${esc(r.src)}<br>${esc(meta.periodLine)}${docUrl?`<br><a href="${esc(docUrl)}" target="_blank" rel="noopener">Открыть источник →</a>`:''}</p></div>
    ${marketEvidenceHtml(r)}
    ${r.dept==='Цветокоррекция'?`<div class="detail-section"><b>Точный расчёт</b><p>Письмо датировано 2022 годом. Актуальную стоимость с учётом хронометража, жанра, HDR и уровня специалиста можно рассчитать в <a href="https://icguild.org/calculator" target="_blank" rel="noopener">калькуляторе ICG →</a></p></div>`:''}
    ${isScreenwriter(r)?`<a class="detail-source" href="${SCREENWRITER_RATES}" target="_blank" rel="noopener">Открыть ставки сценаристов →</a>`:''}
    <button class="detail-add${est.has(r.id)?' is-remove':''}" ${est.has(r.id)?`data-remove="${r.id}"`:`data-add="${r.id}"`}>${est.has(r.id)?'Убрать из сметы':'Добавить в смету'}</button>
  </div>`;
}
'''
app = replace_between(app, "function renderDetail(r){", "// смета", new_detail, "replace renderDetail")

app = replace_once(
    app,
    "const STORAGE_KEY='kinorates-budget-v3',LEGACY_STORAGE_KEYS=['stavki-cehov-budget-v2'];",
    "const STORAGE_KEY='kinorates-budget-v3',LEGACY_STORAGE_KEYS=['stavki-cehov-budget-v2'],MAX_STORED_ESTIMATE_BYTES=1_000_000;",
    "storage size constant",
)
new_save = r'''function saveEstimate(){
  try{
    const payload=JSON.stringify([...est.values()].slice(0,200).map(e=>({id:e.r.id,custom:!!e.r.custom,r:e.r.custom?sanitizeCustomRecord(e.r):undefined,start:safeDate(e.start),end:safeDate(e.end),rate:clampNumber(e.rate,0,1e9,0),qty:clampNumber(e.qty,0,1e5,1),people:clampNumber(e.people,0,1e5,1),tax:clampNumber(e.tax,0,.9999,.08)})));
    if(payload.length>MAX_STORED_ESTIMATE_BYTES)throw new Error('estimate-too-large');
    localStorage.setItem(STORAGE_KEY,payload);
  }catch(error){console.warn('Не удалось сохранить локальную смету.',error)}
}
'''
app = replace_between(app, "function saveEstimate(){", "function restoreEstimate(){", new_save, "replace saveEstimate")

app = replace_once(app, "const period=monthly?elapsed/30:quantity;", "const period=monthly?monthlyProrata(start,end,1):quantity;", "align displayed period")
app = replace_once(
    app,
    "const safeSheetText=value=>/^[=+\\-@]/.test(String(value??'').trimStart())?`'${String(value??'')}`:String(value??'');",
    "function safeSheetText(value){const text=String(value??'').replace(/[\\r\\n\\t]+/g,' ');const trimmed=text.trimStart();return /^[=+\\-@]/.test(trimmed)?`'${trimmed}`:text}",
    "strengthen spreadsheet text",
)
app = replace_once(app, '<a href="${esc(item.url)}" target="_blank" rel="noopener">', '<a href="${esc(safeExternalUrl(item.url))}" target="_blank" rel="noopener">', "market source url hardening")
app = replace_once(app, "// Обратная связь без внешнего хранилища: пользователь сам отправляет подготовленное письмо.", "// Обратная связь отправляется через FormSubmit; состав передаваемых данных описан в privacy notice.", "feedback comment")

old_slist = '''document.getElementById('slist').innerHTML = SRC.map(s=>`<div class="sitem"><time>${s.date}</time>
  ${s.url?`<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>`:`<span class="no">${s.name}</span>`}</div>`).join('');'''
new_slist = '''document.getElementById('slist').innerHTML = SRC.map(s=>{
  const url=safeExternalUrl(s.url);
  return `<div class="sitem"><time>${esc(s.date)}</time>
  ${url?`<a href="${esc(url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`:`<span class="no">${esc(s.name)}</span>`}</div>`;
}).join('');'''
app = replace_once(app, old_slist, new_slist, "source list escaping")
write("app.js", app)

# market-data.js contract
market = read("market-data.js")
market = replace_once(
    market,
    "/* KinoRates market/research layer. These records never replace or verify canonical rates. */",
    "/* KinoRates market/research layer. Market records never replace or verify canonical rates. The metadata overlay at the end may only adjust src/doc/eff/extra or append source metadata; CI verifies that no rate amount/status/unit/identity changes at runtime. */",
    "market overlay contract",
)
write("market-data.js", market)

# bounded source monitor
monitor_py = read("scripts/check_sources.py")
monitor_py = replace_once(monitor_py, 'CHECK_LOG = ROOT / "check-log.js"\n', 'CHECK_LOG = ROOT / "check-log.js"\nMAX_DOWNLOAD_BYTES = 10 * 1024 * 1024\n', "monitor max bytes")
monitor_py = replace_once(
    monitor_py,
    '''    with urllib.request.urlopen(request, timeout=45) as response:
        payload = response.read()
''',
    '''    with urllib.request.urlopen(request, timeout=45) as response:
        content_length = response.headers.get("Content-Length")
        if content_length and int(content_length) > MAX_DOWNLOAD_BYTES:
            raise ValueError(f"response too large: {content_length} bytes")
        payload = response.read(MAX_DOWNLOAD_BYTES + 1)
        if len(payload) > MAX_DOWNLOAD_BYTES:
            raise ValueError(f"response exceeds {MAX_DOWNLOAD_BYTES} bytes")
''',
    "bounded source download",
)
write("scripts/check_sources.py", monitor_py)

# cache/version and a11y
index = read("index.html")
for old in ("20260813-0342", "20260813-0445"):
    index = index.replace(old, VERSION)
index = replace_once(index, '<span id="resultCount">449 позиций</span>', '<span id="resultCount" aria-live="polite">449 позиций</span>', "result live region")
write("index.html", index)

# sitemap
write("sitemap.xml", read("sitemap.xml").replace("<lastmod>2026-08-11</lastmod>", "<lastmod>2026-08-13</lastmod>"))

# updates
updates = read("updates.js")
entry = '''window.KINORATES_UPDATES = [
  {
    date: '2026-08-13',
    dateLabel: '13 августа 2026',
    type: 'service',
    title: 'Усилены техническая защита и автоматические проверки',
    text: 'Разделены права CI и мониторинга, добавлены тесты расчётов и защитных функций, ограничен размер загрузки источников и усилено безопасное отображение данных.'
  },'''
updates = replace_once(updates, "window.KINORATES_UPDATES = [", entry, "prepend update")
write("updates.js", updates)

validate_data = r'''const fs=require('fs'),vm=require('vm');
const context={window:{}};vm.createContext(context);
vm.runInContext(fs.readFileSync('rates-data.js','utf8'),context,{filename:'rates-data.js'});
vm.runInContext(fs.readFileSync('sources-data.js','utf8'),context,{filename:'sources-data.js'});
const beforeData=JSON.parse(JSON.stringify(context.window.KINORATES_DATA));
const beforeSources=JSON.parse(JSON.stringify(context.window.KINORATES_SOURCES));
vm.runInContext(fs.readFileSync('market-data.js','utf8'),context,{filename:'market-data.js'});
const data=context.window.KINORATES_DATA,sources=context.window.KINORATES_SOURCES,market=context.window.KINORATES_MARKET_DATA;
const fail=message=>{throw new Error(message)};
if(!Array.isArray(data)||data.length===0)fail('Canonical data is missing or empty');
const ids=data.map(row=>row&&row.id);
if(ids.some(id=>!Number.isSafeInteger(id))||new Set(ids).size!==ids.length)fail('Missing or duplicate rate IDs');
const expectedKeys=['amount','amount_text','cond','content','dept','doc','eff','extra','id','ot','prof','region','src','status','unit'];
const allowedStatuses=new Set(['fresh2026','official2026','market2025','no_public_rate','check','newdoc','verified2025','verified2024','verified2023','archive','expired']);
const verifiedStatuses=new Set(['fresh2026','official2026','verified2025','verified2024','verified2023']);
for(const row of data){
  if(!row||typeof row!=='object')fail('Invalid canonical row');
  const keys=Object.keys(row).sort();
  if(keys.length!==expectedKeys.length||keys.some((key,index)=>key!==expectedKeys[index]))fail(`Schema mismatch id=${row.id}`);
  if(!row.dept||!row.prof||!row.unit||!row.status)fail(`Missing required field id=${row.id}`);
  if(!allowedStatuses.has(row.status))fail(`Unknown status id=${row.id}: ${row.status}`);
  if(verifiedStatuses.has(row.status)&&!row.doc)fail(`Verified rate missing source id=${row.id}`);
  if(row.doc&&!/^https:\/\//i.test(row.doc))fail(`Non-HTTPS document URL id=${row.id}`);
}
if(data.some(row=>['check','newdoc'].includes(row.status)))fail('Canonical data contains unfinished check/newdoc status');
for(const row of data.filter(row=>row.status==='no_public_rate'))if(row.amount!==null||!row.doc)fail(`no_public_rate invariant failed id=${row.id}`);
if(!Array.isArray(sources)||sources.length===0)fail('Source registry missing');
for(const source of sources){
  if(!source||typeof source!=='object'||!source.name||!source.date)fail('Invalid source registry row');
  if(source.url&&!/^https:\/\//i.test(source.url))fail(`Non-HTTPS source URL: ${source.url}`);
}
if(!Array.isArray(market)||market.length===0)fail('Market layer missing');
if(new Set(market.map(item=>item.id)).size!==market.length)fail('Duplicate market IDs');
for(const item of market){
  if(!item||!item.id||!item.year||!item.period||!item.kind||!item.title||!item.text||!item.source||!item.url||!item.match)fail(`Invalid market record: ${item&&item.id}`);
  if(!/^https:\/\//i.test(item.url))fail(`Non-HTTPS market URL: ${item.url}`);
}
if(beforeData.length!==data.length)fail('Runtime overlay changed canonical row count');
const allowedRuntimeFields=new Set(['src','doc','eff','extra']);
for(let i=0;i<data.length;i++){
  if(beforeData[i].id!==data[i].id)fail(`Runtime overlay changed row identity at index ${i}`);
  for(const key of expectedKeys){
    if(JSON.stringify(beforeData[i][key])!==JSON.stringify(data[i][key])&&!allowedRuntimeFields.has(key))fail(`Runtime overlay illegally changed ${key} for id=${data[i].id}`);
  }
}
if(sources.length<beforeSources.length)fail('Runtime overlay removed sources');
for(let i=0;i<beforeSources.length;i++)if(JSON.stringify(beforeSources[i])!==JSON.stringify(sources[i]))fail(`Runtime overlay modified existing source index=${i}`);
console.log(`Runtime validation OK: ${data.length} rates, ${sources.length} sources, ${market.length} market records`);
'''
write("scripts/validate_data.js", validate_data)

test_core = r'''const fs=require('fs'),vm=require('vm');
const app=fs.readFileSync('app.js','utf8');
const fail=message=>{throw new Error(message)};
const assert=(condition,message)=>{if(!condition)fail(message)};
const approx=(actual,expected,tolerance=0.02)=>assert(Math.abs(actual-expected)<=tolerance,`Expected ${expected}, got ${actual}`);
const start=app.indexOf('function parseDate'),end=app.indexOf('// события',start);
if(start<0||end<0)fail('Could not extract calculation block');
const context={};vm.createContext(context);
vm.runInContext(app.slice(start,end)+'\nthis.__api={parseDate,monthlyProrata,calcEstimate};',context);
const {parseDate,monthlyProrata,calcEstimate}=context.__api;
approx(monthlyProrata(parseDate('2026-01-01'),parseDate('2026-12-31'),100000),1200000);
approx(monthlyProrata(parseDate('2026-01-01'),parseDate('2026-02-28'),100000),200000);
approx(monthlyProrata(parseDate('2026-01-31'),parseDate('2026-02-28'),100000),103225.80645);
approx(monthlyProrata(parseDate('2024-02-01'),parseDate('2024-02-29'),100000),100000);
const fullJan=calcEstimate({r:{unit:'месяц'},start:'2026-01-01',end:'2026-01-31',rate:100000,qty:1,people:1,tax:0});
approx(fullJan.period,1);approx(fullJan.net,100000);approx(fullJan.gross,100000);
const taxed=calcEstimate({r:{unit:'месяц'},start:'2026-01-01',end:'2026-01-31',rate:100000,qty:1,people:1,tax:.08});
approx(taxed.gross,108695.65217);
const safeLine=app.match(/^function safeSheetText\(value\).*$/m);
if(!safeLine)fail('safeSheetText not found');
vm.runInContext(safeLine[0]+';this.__safeSheetText=safeSheetText;',context);
const safeSheetText=context.__safeSheetText;
assert(safeSheetText('normal')==='normal','Normal spreadsheet text changed');
for(const payload of ['=HYPERLINK("https://example.com")',' +CMD()','\t=SUM(1,1)','\n@SUM(1,1)'])assert(safeSheetText(payload).startsWith("'"),`Spreadsheet payload not neutralized: ${JSON.stringify(payload)}`);
const helperStart=app.indexOf("const SAFE_UNITS="),helperEnd=app.indexOf("const fmt =",helperStart);
if(helperStart<0||helperEnd<0)fail('Security helper block not found');
vm.runInContext(app.slice(helperStart,helperEnd)+'\nthis.__sec={esc,safeExternalUrl,sanitizeCustomRecord};',context);
const {esc,safeExternalUrl,sanitizeCustomRecord}=context.__sec;
assert(safeExternalUrl('javascript:alert(1)')==='','javascript URL accepted');
assert(safeExternalUrl('http://example.com')==='','HTTP URL accepted');
assert(safeExternalUrl('https://example.com/').startsWith('https://'),'HTTPS URL rejected');
const custom=sanitizeCustomRecord({id:-1,dept:'Test',prof:'<img src=x onerror=alert(1)>',unit:'проект',amount:100});
assert(custom&&esc(custom.prof).includes('&lt;img'),'Custom record escaping regression');
console.log('Core logic/security tests OK');
'''
write("scripts/test_core.js", test_core)

validate_static = r'''#!/usr/bin/env python3
import re, struct
from pathlib import Path
root=Path(__file__).resolve().parents[1]
index=(root/'index.html').read_text(encoding='utf-8')
app=(root/'app.js').read_text(encoding='utf-8')
css=(root/'app.css').read_text(encoding='utf-8')
def fail(msg): raise SystemExit(msg)
static_ids=set(re.findall(r'\bid=["\']([^"\']+)["\']',index))
dom_refs=set(re.findall(r'getElementById\(["\']([^"\']+)["\']\)',app))
missing=sorted(dom_refs-static_ids)
if missing: fail(f'app.js references missing IDs: {missing}')
depth=0;quote=None;comment=False;i=0
while i<len(css):
    pair=css[i:i+2]
    if comment:
        if pair=='*/': comment=False;i+=2;continue
        i+=1;continue
    if not quote and pair=='/*': comment=True;i+=2;continue
    ch=css[i]
    if quote:
        if ch=='\\': i+=2;continue
        if ch==quote: quote=None
    else:
        if ch in "'\"": quote=ch
        elif ch=='{': depth+=1
        elif ch=='}':
            depth-=1
            if depth<0: fail('Extra closing brace in app.css')
    i+=1
if comment or quote or depth: fail('Unclosed construct in app.css')
og=(root/'og-image.png').read_bytes()
if og[:8]!=b'\x89PNG\r\n\x1a\n' or og[12:16]!=b'IHDR': fail('og-image.png is not valid PNG')
w,h=struct.unpack('>II',og[16:24])
mw=re.search(r'<meta property="og:image:width" content="(\d+)">',index);mh=re.search(r'<meta property="og:image:height" content="(\d+)">',index)
if not mw or not mh or (w,h)!=(int(mw.group(1)),int(mh.group(1))): fail('OG image dimensions mismatch')
assets={'app.css':r'<link rel="stylesheet" href="app\.css\?v=([^"]+)">','updates.js':r'<script src="updates\.js\?v=([^"]+)"></script>','check-log.js':r'<script src="check-log\.js\?v=([^"]+)"></script>','rates-data.js':r'<script src="rates-data\.js\?v=([^"]+)"></script>','sources-data.js':r'<script src="sources-data\.js\?v=([^"]+)"></script>','market-data.js':r'<script src="market-data\.js\?v=([^"]+)"></script>','app.js':r'<script src="app\.js\?v=([^"]+)"></script>'}
versions={};positions={}
for name,pattern in assets.items():
    m=re.search(pattern,index)
    if not m: fail(f'Missing versioned asset {name}')
    versions[name]=m.group(1);positions[name]=m.start()
if len(set(versions.values()))!=1: fail(f'Asset versions differ: {versions}')
if not positions['updates.js']<positions['check-log.js']<positions['rates-data.js']<positions['sources-data.js']<positions['market-data.js']<positions['app.js']: fail('Script load order is invalid')
if '<style>' in index: fail('Inline CSS unexpectedly returned to index.html')
for token in ('FilmRate','FILMRATE_CHECKS','filmrate.ru'):
    for path in ('app.js','index.html','rates-data.js','sources-data.js','market-data.js'):
        if token in (root/path).read_text(encoding='utf-8'): fail(f'Legacy token {token} found in {path}')
if '<lastmod>2026-08-13</lastmod>' not in (root/'sitemap.xml').read_text(encoding='utf-8'): fail('sitemap lastmod was not refreshed')
print(f'Static validation OK: {len(dom_refs)} DOM refs, OG {w}x{h}, asset version {next(iter(versions.values()))}')
'''
write("scripts/validate_static.py", validate_static)

monitor_workflow = f'''name: Мониторинг писем и ставок

on:
  workflow_dispatch:
    inputs:
      publish_check:
        description: "Добавить запись о проверке в журнал обновлений"
        type: boolean
        default: false
  schedule:
    - cron: "17 8 * * *"
      timezone: "Europe/Moscow"
    - cron: "0 10 1 * *"
      timezone: "Europe/Moscow"

permissions:
  contents: write
  issues: write

concurrency:
  group: kinorates-source-monitor
  cancel-in-progress: false

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@{CHECKOUT_SHA}

      - name: Проверить первоисточники
        id: monitor
        env:
          PUBLISH_CHECK: ${{{{ github.event.schedule == '0 10 1 * *' || inputs.publish_check }}}}
        run: python3 scripts/check_sources.py

      - name: Сохранить новые контрольные значения
        if: steps.monitor.outputs.changed == 'true' || steps.monitor.outputs.log_updated == 'true' || steps.monitor.outputs.state_updated == 'true'
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add data/source-state.json check-log.js
          git commit -m "Update KinoRates source check"
          git push

      - name: Создать уведомление для проверки
        if: steps.monitor.outputs.changed == 'true'
        env:
          GH_TOKEN: ${{{{ github.token }}}}
        run: |
          gh label create source-update --color B1443D --description "Изменение первоисточника" --force
          gh issue create \\
            --title "Найдены обновления писем или ставок — $(date -u +%d.%m.%Y)" \\
            --body-file source-change-report.md \\
            --label source-update
'''
write(".github/workflows/check-rate-sources.yml", monitor_workflow)

validate_workflow = f'''name: Валидация KinoRates

on:
  push:
  pull_request:

permissions:
  contents: read

concurrency:
  group: kinorates-validate-${{{{ github.ref }}}}
  cancel-in-progress: true

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@{CHECKOUT_SHA}

      - name: Проверить синтаксис
        run: |
          node --check app.js
          node --check rates-data.js
          node --check sources-data.js
          node --check market-data.js
          node --check updates.js
          node --check check-log.js
          node --check scripts/validate_data.js
          node --check scripts/test_core.js
          python3 -m py_compile scripts/check_sources.py scripts/validate_static.py

      - name: Проверить данные и runtime-overlay
        run: node scripts/validate_data.js

      - name: Проверить расчёты и защитные функции
        run: node scripts/test_core.js

      - name: Проверить HTML, CSS, OG и cache-version
        run: python3 scripts/validate_static.py
'''
write(".github/workflows/validate.yml", validate_workflow)

audit = read("SECURITY_AUDIT.md")
note = '''## Повторная независимая проверка и hardening — 13 августа 2026

После сравнения нескольких независимых аудитов подтверждены и закрыты/контролируются следующие пункты:

- validation CI отделён от write-enabled мониторинга; validation работает с `contents: read`;
- `actions/checkout` закреплён полным commit SHA;
- монитор внешних источников ограничивает размер ответа 10 МБ;
- удалены хрупкие CI-инварианты `data.length === 449` и `no_public_rate.length === 6`;
- runtime metadata-overlay проверяется CI: он не может менять сумму, статус, единицу, профессию или состав канонической базы;
- расчётный период месячной ставки теперь использует ту же календарную пропорцию, что и сумма;
- добавлены unit-тесты `monthlyProrata`, налогового расчёта, Excel formula protection и URL/HTML safety;
- версия CSS и JS синхронизируется и проверяется автоматически;
- отображение DATA/SRC дополнительно экранировано, внешние динамические URL принимаются только по HTTPS.

При этом ранее реализованные SRI для ExcelJS/pdfMake, Excel formula neutralization, consent-before-Metrika и localStorage sanitization сохранены.'''
if note.splitlines()[0] not in audit:
    audit = audit.rstrip() + "\n\n" + note + "\n"
write("SECURITY_AUDIT.md", audit)

for transient in (ROOT/"scripts"/"apply_audit_hardening.py", ROOT/".github"/"workflows"/"apply-audit-hardening-once.yml"):
    if transient.exists():
        transient.unlink()

print("KinoRates audit hardening patch applied.")
