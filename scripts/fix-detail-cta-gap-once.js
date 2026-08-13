const fs=require('fs');
let css=fs.readFileSync('app.css','utf8');
const marker='/* detail CTA spacing v7 */';
const patch=`\n${marker}\n.detail-card .detail-source + .detail-add{margin-top:8px}\n`;
css=css.replace(/\n\/\* detail CTA spacing v7 \*\/[\s\S]*$/,'');
css+=patch;
fs.writeFileSync('app.css',css);

let index=fs.readFileSync('index.html','utf8');
const v='20260813-0325';
index=index.replace(/href="app\.css(?:\?v=[^"]*)?"/g,`href="app.css?v=${v}"`);
index=index.replace(/src="(updates|check-log|rates-data|sources-data|market-data|app)\.js(?:\?v=[^"]*)?"/g,(_,name)=>`src="${name}.js?v=${v}"`);
fs.writeFileSync('index.html',index);
console.log('Detail CTA gap added');
