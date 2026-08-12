const fs=require('fs');

let index=fs.readFileSync('index.html','utf8');
const start=index.indexOf('  <p class="lede">');
const stats=index.indexOf('  <div class="stats" id="stats"></div>',start);
if(start<0||stats<0) throw new Error('Header guide markers not found');
const block=`  <nav class="header-resources" aria-label="Полезные материалы KinoRates">
    <a class="resource-link" href="https://ktr.su/content/news/detail.php?ELEMENT_ID=57863" target="_blank" rel="noopener">
      <span class="resource-kicker">Регионы</span><strong>Как применять ставки</strong><small>КТР · 172 специалиста</small><i aria-hidden="true">→</i>
    </a>
    <a class="resource-link" href="https://kinoprofsoyuz.ru/stranicza-stavok-po-czeham/" target="_blank" rel="noopener">
      <span class="resource-kicker">Первоисточники</span><strong>МПК</strong><small>актуальные письма</small><i aria-hidden="true">→</i>
    </a>
    <a class="resource-link" href="https://t.me/s/filmres?after=7421" target="_blank" rel="noopener">
      <span class="resource-kicker">Рынок · 2025</span><strong>StarDust</strong><small>гонорары и рынок</small><i aria-hidden="true">→</i>
    </a>
    <a class="resource-link" href="https://www.kinopoisk.ru/media/article/4009452/" target="_blank" rel="noopener">
      <span class="resource-kicker">Исследование · 2024</span><strong>Кинопоиск × МШК</strong><small>данные 2023–2024</small><i aria-hidden="true">→</i>
    </a>
    <a class="resource-link" href="https://www.kommersant.ru/doc/8553189" target="_blank" rel="noopener">
      <span class="resource-kicker">Динамика рынка</span><strong>ИРИ</strong><small>2026 · данные 2025</small><i aria-hidden="true">→</i>
    </a>
  </nav>\n`;
index=index.slice(0,start)+block+index.slice(stats);
const v='20260813-0247';
index=index.replace(/href="app\.css(?:\?v=[^"]*)?"/g,`href="app.css?v=${v}"`);
index=index.replace(/src="(updates|check-log|rates-data|sources-data|market-data|app)\.js(?:\?v=[^"]*)?"/g,(_,name)=>`src="${name}.js?v=${v}"`);
fs.writeFileSync('index.html',index);

let css=fs.readFileSync('app.css','utf8');
const v3=`/* first screen compact resources v3 */
header{grid-template-columns:1fr;gap:14px;align-items:start;padding:18px 28px 16px}
header .eyebrow,.title-block,.header-resources,.stats{grid-column:1}
.title-block{max-width:640px}
.lede,.header-guides{display:none!important}
.header-resources{display:grid;grid-template-columns:repeat(5,minmax(148px,190px));justify-content:start;gap:8px;margin-top:2px}
.resource-link{position:relative;display:grid;align-content:center;gap:3px;min-width:0;min-height:70px;padding:11px 34px 11px 12px;border:1px solid var(--rule);border-radius:9px;background:#fff;color:var(--ink);text-decoration:none}
.resource-link:hover{border-color:var(--blue);background:var(--blue-soft)}
.resource-kicker{font:700 8px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--blue);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.resource-link strong{font-size:12.5px;line-height:1.25;letter-spacing:-.015em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.resource-link small{color:var(--ink-3);font-size:8.5px;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.resource-link i{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-style:normal;color:var(--blue);font-size:17px;line-height:1}
.stats{grid-template-columns:repeat(4,minmax(0,1fr));margin:0}
@media(max-width:1050px){.header-resources{grid-template-columns:repeat(3,minmax(160px,200px))}}
@media(max-width:700px){header{padding:18px 16px;gap:12px}.header-resources{grid-template-columns:1fr 1fr}.resource-link{min-height:68px}.stats{grid-template-columns:1fr 1fr}}
@media(max-width:430px){.header-resources{grid-template-columns:1fr}}
`;
if(/\/\* first screen layout v2 \*\/[\s\S]*$/.test(css)) css=css.replace(/\/\* first screen layout v2 \*\/[\s\S]*$/,v3);
else if(/\/\* first screen compact resources v3 \*\/[\s\S]*$/.test(css)) css=css.replace(/\/\* first screen compact resources v3 \*\/[\s\S]*$/,v3);
else css+='\n\n'+v3;
fs.writeFileSync('app.css',css);
console.log('Compact resource strip v3 applied');
