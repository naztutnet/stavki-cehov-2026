const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const versions = require('../rate-versions.js');
const ctx = {window:{}};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('rates-data.js','utf8'),ctx);
const rates = ctx.window.KINORATES_DATA;
const original = JSON.stringify(rates);
for (const id of [288,289,290,291,292,293]) {
  const rate = rates.find(r=>r.id===id);
  const primary = versions.resolve(rate);
  const alternative = versions.resolve(rate,'light-2026-05-chat');
  assert.equal(primary.amount, rate.amount, 'Primary price must preserve current catalog');
  assert.ok(alternative.amount < primary.amount);
  assert.equal(alternative.version.status,'Письмо 2026');
  assert.equal(versions.resolve(rate,'missing-version').versionId,primary.versionId);
  const item = {id,rate:alternative.amount,rateSnapshot:versions.snapshot(alternative)};
  assert.ok(versions.matches(item,alternative));
  assert.ok(!versions.matches(item,primary));
  assert.ok(!versions.matches({id,rate:primary.amount},primary),'Do not relabel legacy budgets');
  const saved = JSON.stringify(item.rateSnapshot);
  alternative.amount = 1;
  alternative.version.amount = 1;
  assert.equal(JSON.stringify(item.rateSnapshot),saved,'Snapshot must be detached from catalog');
  assert.ok(versions.note({...item,rate:item.rate+1}).includes('изменена вручную'));
}
assert.equal(JSON.stringify(rates),original,'Version selection must not mutate canonical rates');
assert.equal(versions.snapshot(versions.resolve(rates.find(r=>r.id===287))),null);
assert.ok(versions.matches({id:287},rates.find(r=>r.id===287)));
const app = fs.readFileSync('app.js','utf8');
const budget = {id:288,prof:'Гаффер',unit:'смена',rate:22000,rateSnapshot:versions.snapshot(versions.resolve(rates.find(r=>r.id===288),'light-2026-05-chat'))};
const persisted = JSON.stringify([budget]);
const storage = new Map([['kinorates-budget-v4',persisted]]);
const context = {R:rates,localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},usesAttachmentDates:()=>false};
vm.createContext(context);
vm.runInContext('const BUDGET_STORAGE_KEY="kinorates-budget-v4";'+app.slice(app.indexOf('function migrateLegacyBudget'),app.indexOf('function sidebar'))+';this.loaded=loadBudget();const budgetItems=loaded;saveBudget();',context);
assert.deepEqual(JSON.parse(storage.get('kinorates-budget-v4'))[0].rateSnapshot,budget.rateSnapshot,'Reload must preserve source and terms');
console.log('Rate versions, legacy isolation, immutable snapshots and persistence OK');

// Run the real Excel exporter against a capturing workbook adapter.
const rows = new Map();
const row = n => {
  if (!rows.has(n)) rows.set(n,{number:n,values:[],eachCell(callback){this.values.forEach(()=>callback({}));}});
  return rows.get(n);
};
const sheet = {mergeCells(){},getCell(address){row(Number(address.match(/\d+/)[0]));return {};},getRow:row,getColumn:()=>({}),addRow(values){const r=row(Math.max(0,...rows.keys())+1);r.values=values;return r;},eachRow(callback){rows.forEach((r,n)=>callback(r,n));}};
let downloadName;
const exportItem={...budget,qty:2,periods:3,extra:100,tax:0,comment:'Проверка'};
const exportContext={budgetItems:[exportItem],ensureExcelJS:async()=>{},ExcelJS:{Workbook:class{addWorksheet(){return sheet;}xlsx={writeBuffer:async()=>new Uint8Array()};}},Date,Blob,usesAttachmentDates:()=>false,budgetProductionLabel:()=>'',budgetVersionText:versions.note,itemNet:x=>x.rate*x.qty*x.periods+x.extra,itemGross:x=>x.rate*x.qty*x.periods+x.extra,exportName:ext=>'budget.'+ext,downloadBlob:(_blob,_type,name)=>{downloadName=name;}};
vm.createContext(exportContext);
vm.runInContext(app.match(/^function safeSheetText.*$/m)[0]+app.slice(app.indexOf('async function exportBudgetExcel'),app.indexOf('async function exportBudgetPdf'))+';this.run=exportBudgetExcel;',exportContext);
exportContext.run().then(()=>{
  assert.equal(rows.get(5).values[4],22000);
  assert.equal(rows.get(5).values[11],132100);
  assert.ok(rows.get(5).values[13].includes('Письмо 2026'));
  assert.ok(rows.get(5).values[13].includes(budget.rateSnapshot.doc));
  assert.equal(downloadName,'budget.xlsx');
  console.log('Excel exporter preserves selected price, totals, version status and source');
}).catch(error=>{console.error(error);process.exitCode=1;});

const oldSnapshot={...budget.rateSnapshot,status:'Требует подтверждения',extra:'Разрыв 5 000 ₽/ч. Статус письма и его соотношение с публикацией МПК не подтверждены.'};
const oldSerialized=JSON.stringify(oldSnapshot);
assert.equal(versions.displaySnapshot(oldSnapshot).status,'Письмо 2026');
assert.equal(versions.displaySnapshot(oldSnapshot).extra,'Разрыв 5 000 ₽/ч.');
assert.equal(JSON.stringify(oldSnapshot),oldSerialized,'Editorial display changes must preserve stored snapshot');
assert.ok(!versions.note({...budget,rateSnapshot:oldSnapshot}).includes('Требует подтверждения'));
const cardContext={RATE_VERSIONS:versions,currentRateVersion:rate=>versions.resolve(rate),esc:value=>String(value??''),rub:value=>String(value),shortDate:value=>value,budgetHasRate:()=>false};
vm.createContext(cardContext);
vm.runInContext(app.slice(app.indexOf('function rateVersionsMarkup'),app.indexOf('function budgetItemMarkup'))+';this.markup=rateVersionsMarkup;',cardContext);
const cards=cardContext.markup(rates.find(rate=>rate.id===288));
const cardClasses=[...cards.matchAll(/class="(rate-version-option [^"]+)"/g)].map(match=>match[1].split(/\s+/));
assert.equal(cardClasses.length,2);
assert.ok(cardClasses.every(classes=>!classes.includes('primary')),'Rate cards must never inherit global primary button styles');
assert.ok(!cards.includes('Требует подтверждения'));
console.log('Version card styles and editorial labels OK');
