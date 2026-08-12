const fs=require('fs');

let index=fs.readFileSync('index.html','utf8');
const start=index.indexOf('  <p class="lede">');
const statsEnd=index.indexOf('  <div class="stats" id="stats"></div>',start);
if(start<0||statsEnd<0) throw new Error('Header markers not found');
const end=statsEnd+'  <div class="stats" id="stats"></div>'.length;
const block=`  <p class="lede">Ставки киноцехов и департаментов — с указанием источника и уровня подтверждения. Актуальные рекомендации, рыночные ориентиры и исторические данные собраны в одной базе.</p>
  <div class="header-guides" aria-label="Методика и полезные материалы">
    <a class="guide-card guide-region" href="https://ktr.su/content/news/detail.php?ELEMENT_ID=57863" target="_blank" rel="noopener">
      <span class="guide-kicker">Регионы</span>
      <strong>Как применять ставки в регионах</strong>
      <small>Исследование КТР · 172 специалиста</small>
      <i aria-hidden="true">→</i>
    </a>
    <div class="guide-card guide-research">
      <div class="guide-summary"><span class="guide-kicker">Источники</span><strong>Источники и исследования</strong><small>Год и период данных указаны у каждого материала</small></div>
      <nav class="guide-links" aria-label="Источники и исследования KinoRates">
        <a href="https://kinoprofsoyuz.ru/stranicza-stavok-po-czeham/" target="_blank" rel="noopener"><b>МПК</b><small>актуальные письма</small></a>
        <a href="https://t.me/s/filmres?after=7421" target="_blank" rel="noopener"><b>StarDust</b><small>рынок · 2025</small></a>
        <a href="https://www.kinopoisk.ru/media/article/4009452/" target="_blank" rel="noopener"><b>Кинопоиск × МШК</b><small>исследование · 2024</small></a>
        <a href="https://www.kommersant.ru/doc/8553189" target="_blank" rel="noopener"><b>ИРИ</b><small>2026 · данные 2025</small></a>
      </nav>
    </div>
  </div>
  <div class="stats" id="stats"></div>`;
index=index.slice(0,start)+block+index.slice(end);
const v='20260813-0240';
index=index.replace(/href="app\.css(?:\?v=[^"]*)?"/g,`href="app.css?v=${v}"`);
index=index.replace(/src="(updates|check-log|rates-data|sources-data|market-data|app)\.js(?:\?v=[^"]*)?"/g,(_,name)=>`src="${name}.js?v=${v}"`);
fs.writeFileSync('index.html',index);

let app=fs.readFileSync('app.js','utf8');
app=app.replace("<span><b>${cnt('market2025')}</b> рыночных ориентиров</span>\n    <span><b>${cnt('expired')}</b> историческая ставка</span>\n    <span><b>${cnt('archive')}</b> архивный ориентир</span>","<span><b>${cnt('market2025')}</b> рыночных ориентиров</span>\n    <span><b>${cnt('expired')}</b> исторических ставок</span>\n    <span><b>${cnt('archive')}</b> архивных ориентиров</span>");
fs.writeFileSync('app.js',app);

let css=fs.readFileSync('app.css','utf8');
const v2=`/* first screen layout v2 */
header{grid-template-columns:minmax(360px,1.05fr) minmax(320px,.95fr);gap:18px 46px;align-items:start;padding:18px 28px 16px}
header .eyebrow{grid-column:1/-1}
.title-block{grid-column:1;max-width:620px}
.lede{grid-column:2;max-width:52ch;align-self:end;margin:0 0 4px;font-size:11.5px;line-height:1.58}
.header-guides{grid-column:1/-1;display:grid;grid-template-columns:minmax(280px,.72fr) minmax(560px,1.28fr);gap:10px}
.guide-card{min-width:0;border:1px solid var(--rule);border-radius:9px;background:#fff;color:var(--ink);text-decoration:none}
.guide-kicker{font:700 7.5px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--blue)}
.guide-region{position:relative;display:grid;align-content:center;gap:3px;padding:12px 42px 12px 14px}
.guide-region strong{font-size:11.5px;line-height:1.25}.guide-region small{color:var(--ink-3);font-size:7.8px}.guide-region i{position:absolute;right:14px;top:50%;transform:translateY(-50%);font-style:normal;color:var(--blue);font-size:16px}.guide-region:hover{border-color:var(--blue);background:var(--blue-soft)}
.guide-research{display:grid;grid-template-columns:minmax(205px,.72fr) minmax(0,1.28fr);align-items:stretch;overflow:hidden}
.guide-summary{display:grid;align-content:center;gap:3px;padding:11px 13px;border-right:1px solid var(--rule)}
.guide-summary strong{font-size:11.5px;line-height:1.25}.guide-summary small{color:var(--ink-3);font-size:7.6px;line-height:1.3}
.guide-links{display:grid;grid-template-columns:repeat(4,minmax(0,1fr))}
.guide-links a{display:grid;align-content:center;gap:1px;min-width:0;padding:9px 10px;border-right:1px solid var(--rule);color:var(--ink);text-decoration:none;background:#fff}.guide-links a:last-child{border-right:0}.guide-links a:hover{background:var(--blue-soft)}
.guide-links b{font-size:8.5px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.guide-links small{color:var(--ink-3);font-size:6.9px;line-height:1.25}
.stats{grid-column:1/-1;grid-template-columns:repeat(4,minmax(0,1fr));margin:0}
.stats .stat{padding:10px 13px}.stats .stat b{font-size:21px}.stats .stat i{font-size:7.4px;line-height:1.25}
.stats-secondary{grid-column:1/-1;display:flex;align-items:center;gap:20px;padding:6px 12px;border-top:1px solid var(--rule);background:#fff;color:var(--ink-3);font-size:7.8px}.stats-secondary span{display:inline-flex;align-items:baseline;gap:4px;white-space:nowrap}.stats-secondary b{color:var(--ink-2);font:700 9px var(--mono)}
@media(max-width:1180px){header{grid-template-columns:1fr}.title-block,.lede,.header-guides,.stats{grid-column:1}.lede{max-width:68ch}.header-guides{grid-template-columns:1fr}.guide-research{grid-template-columns:220px minmax(0,1fr)}}
@media(max-width:760px){header{padding:18px 16px;gap:14px}.guide-research{grid-template-columns:1fr}.guide-summary{border-right:0;border-bottom:1px solid var(--rule)}.guide-links{grid-template-columns:1fr 1fr}.guide-links a:nth-child(2){border-right:0}.guide-links a:nth-child(-n+2){border-bottom:1px solid var(--rule)}.stats{grid-template-columns:1fr 1fr}.stats-secondary{display:grid;grid-template-columns:1fr;gap:3px}.header-actions{margin-bottom:0}}
`;
if(/\/\* first screen layout v1 \*\/[\s\S]*$/.test(css)) css=css.replace(/\/\* first screen layout v1 \*\/[\s\S]*$/,v2);
else if(/\/\* first screen layout v2 \*\/[\s\S]*$/.test(css)) css=css.replace(/\/\* first screen layout v2 \*\/[\s\S]*$/,v2);
else css+='\n\n'+v2;
fs.writeFileSync('app.css',css);
console.log('First screen layout v2 applied');
