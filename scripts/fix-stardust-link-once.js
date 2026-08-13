const fs=require('fs');
const files=['index.html','market-data.js','app.js','updates.js','sources-data.js'];
for(const file of files){
  if(!fs.existsSync(file)) continue;
  let s=fs.readFileSync(file,'utf8');
  s=s.replace(/https:\/\/t\.me\/s\/filmres\/7441/g,'https://t.me/filmres/7424');
  s=s.replace(/https:\/\/t\.me\/filmres\/7441/g,'https://t.me/filmres/7424');
  fs.writeFileSync(file,s);
}
let index=fs.readFileSync('index.html','utf8');
if(!index.includes('https://t.me/filmres/7424')) throw new Error('Correct StarDust link not found');
if(index.includes('filmres/7441')) throw new Error('Old 7441 link still present in index');
const v='20260813-0342';
index=index.replace(/href="app\.css(?:\?v=[^"]*)?"/g,`href="app.css?v=${v}"`);
index=index.replace(/src="(updates|check-log|rates-data|sources-data|market-data|app)\.js(?:\?v=[^"]*)?"/g,(_,name)=>`src="${name}.js?v=${v}"`);
fs.writeFileSync('index.html',index);
console.log('StarDust link fixed to 7424');
