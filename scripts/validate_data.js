const fs=require('fs'),vm=require('vm');
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
