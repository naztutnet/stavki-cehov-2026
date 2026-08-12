const fs=require('fs');
let css=fs.readFileSync('app.css','utf8');
const patch=`
/* secondary stats row fix */
.stats-secondary{grid-column:1/-1;display:flex;align-items:center;gap:22px;min-width:0;padding:8px 13px;border-top:1px solid var(--rule);background:#fff;color:var(--ink-3);font-size:8.5px;line-height:1.25}
.stats-secondary span{display:inline-flex;align-items:baseline;gap:4px;white-space:nowrap}
.stats-secondary b{color:var(--ink-2);font:700 10px var(--mono)}
@media(max-width:700px){.stats-secondary{display:grid;grid-template-columns:1fr 1fr;gap:5px 14px;padding:8px 12px}.stats-secondary span:last-child{grid-column:1/-1}}
@media(max-width:430px){.stats-secondary{grid-template-columns:1fr}.stats-secondary span:last-child{grid-column:auto}}
`;
css=css.replace(/\n\/\* secondary stats row fix \*\/[\s\S]*$/,'');
css+=patch;
fs.writeFileSync('app.css',css);
let index=fs.readFileSync('index.html','utf8');
const v='20260813-0250';
index=index.replace(/href="app\.css(?:\?v=[^"]*)?"/g,`href="app.css?v=${v}"`);
fs.writeFileSync('index.html',index);
console.log('Secondary stats row fixed');
