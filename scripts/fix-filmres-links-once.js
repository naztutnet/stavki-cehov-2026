const fs=require('fs');
const files=['index.html','market-data.js','app.js','updates.js'];
let touched=[];
for(const file of files){
  if(!fs.existsSync(file)) continue;
  let s=fs.readFileSync(file,'utf8');
  const before=s;
  s=s.replace(/https:\/\/t\.me\/s\/filmres\?after=7421/g,'https://t.me/filmres/7441');
  s=s.replace(/https:\/\/t\.me\/s\/filmres\/(\d+)/g,'https://t.me/filmres/$1');
  if(s!==before){fs.writeFileSync(file,s);touched.push(file)}
}
let index=fs.readFileSync('index.html','utf8');
if(!index.includes('https://t.me/filmres/7441')) throw new Error('Direct StarDust permalink not found in index.html');
if(index.includes('t.me/s/filmres')) throw new Error('Legacy Filmres preview link remains in index.html');
const v='20260813-0314';
index=index.replace(/href="app\.css(?:\?v=[^"]*)?"/g,`href="app.css?v=${v}"`);
index=index.replace(/src="(updates|check-log|rates-data|sources-data|market-data|app)\.js(?:\?v=[^"]*)?"/g,(_,name)=>`src="${name}.js?v=${v}"`);
fs.writeFileSync('index.html',index);
if(!touched.includes('index.html')) touched.push('index.html');
console.log('Normalized Filmres links in:',touched.join(', '));
