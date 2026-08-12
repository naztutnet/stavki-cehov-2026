const fs=require('fs');
const p='index.html';
let s=fs.readFileSync(p,'utf8');
const v='20260813-0234';
s=s.replace(/href="app\.css(?:\?v=[^"]*)?"/g,`href="app.css?v=${v}"`);
s=s.replace(/src="(updates|check-log|rates-data|sources-data|market-data|app)\.js(?:\?v=[^"]*)?"/g,(_,name)=>`src="${name}.js?v=${v}"`);
if(!s.includes(`app.css?v=${v}`)||!s.includes(`app.js?v=${v}`)) throw new Error('cache bust markers not applied');
fs.writeFileSync(p,s);
console.log('Asset cache bust applied:',v);
