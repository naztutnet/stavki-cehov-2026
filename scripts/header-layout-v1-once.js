const fs=require('fs');

let index=fs.readFileSync('index.html','utf8');
const start=index.indexOf('  <p class="lede">');
const end=index.indexOf('\n</header>',start);
if(start<0||end<0)throw new Error('Header content markers not found');
const headerBlock=`  <p class="lede">Ставки киноцехов и департаментов — с указанием источника и уровня подтверждения. Актуальные рекомендации, рыночные ориентиры и исторические данные собраны в одной базе.</p>
  <div class="header-guides" aria-label="Методика и полезные материалы">
    <article class="guide-card guide-region">
      <div class="guide-head"><span>Регионы</span><h3>Как применять ставки в регионах</h3></div>
      <p>KinoRates не уменьшает ставки автоматически по региональному признаку. Исследование КТР показывает высокий запрос на одинаковую стоимость работы и обязательную оплату переработок.</p>
      <div class="guide-foot"><span><b>172</b> специалиста участвовали в исследовании</span><a href="https://ktr.su/content/news/detail.php?ELEMENT_ID=57863" target="_blank" rel="noopener">Исследование КТР →</a></div>
    </article>
    <article class="guide-card guide-research">
      <div class="guide-head"><span>Источники</span><h3>Источники и исследования</h3></div>
      <p>Первоисточники и рыночные исследования показаны отдельно. У каждого исследования указан год и период данных.</p>
      <nav class="guide-links" aria-label="Источники и исследования KinoRates">
        <a href="https://kinoprofsoyuz.ru/stranicza-stavok-po-czeham/" target="_blank" rel="noopener"><b>МПК</b><small>актуальные письма</small></a>
        <a href="https://t.me/s/filmres?after=7421" target="_blank" rel="noopener"><b>StarDust</b><small>рынок · 2025</small></a>
        <a href="https://www.kinopoisk.ru/media/article/4009452/" target="_blank" rel="noopener"><b>Кинопоиск × МШК</b><small>исследование · 2024</small></a>
        <a href="https://www.kommersant.ru/doc/8553189" target="_blank" rel="noopener"><b>ИРИ</b><small>2026 · данные 2025</small></a>
      </nav>
    </article>
  </div>
  <div class="stats" id="stats"></div>`;
index=index.slice(0,start)+headerBlock+index.slice(end);
fs.writeFileSync('index.html',index);

let app=fs.readFileSync('app.js','utf8');
const statsStart=app.indexOf("document.getElementById('stats').innerHTML = `");
const statsEnd=app.indexOf('`;\n\n// фильтры',statsStart);
if(statsStart<0||statsEnd<0)throw new Error('Stats block markers not found');
const statsCode=`document.getElementById('stats').innerHTML = \`
  <div class="stat"><b>\${depts.length}</b><i>цеха и департамента</i></div>
  <div class="stat"><b>\${DATA.length}</b><i>позиций в базе</i></div>
  <div class="stat ok"><b>\${verifiedCount}</b><i>подтверждены первоисточниками</i></div>
  <div class="stat"><b>\${unpublishedCount}</b><i>без публичной ставки</i></div>
  <div class="stats-secondary">
    <span><b>\${cnt('market2025')}</b> рыночных ориентиров</span>
    <span><b>\${cnt('expired')}</b> историческая ставка</span>
    <span><b>\${cnt('archive')}</b> архивный ориентир</span>
  </div>\``;
app=app.slice(0,statsStart)+statsCode+app.slice(statsEnd+1);
fs.writeFileSync('app.js',app);

let css=fs.readFileSync('app.css','utf8');
css=css.replace(/\/\* compact source methodology block \*\/[\s\S]*?(?=\/\* writer \+ market status expansion \*\/)/,'');
css=css.replace(/@media\(min-width:921px\)\{\.stats\{grid-template-columns:repeat\(7,minmax\(0,1fr\)\)\}\.stat\{min-width:0;padding:11px 10px\}\.stat b\{font-size:20px\}\.stat i\{font-size:7\.5px;line-height:1\.25\}\}\n?/,'');
if(!css.includes('/* first screen layout v1 */')){
  css += `\n\n/* first screen layout v1 */\nheader{grid-template-columns:minmax(300px,.82fr) minmax(250px,.68fr) minmax(420px,1.35fr);gap:22px 28px}\n.lede{max-width:48ch;font-size:11.5px;line-height:1.6}\n.header-guides{display:grid;grid-template-columns:1fr;gap:8px;align-self:stretch}\n.guide-card{display:grid;gap:7px;padding:11px 12px;border:1px solid var(--rule);border-radius:9px;background:#fff;min-width:0}\n.guide-head{display:grid;grid-template-columns:58px minmax(0,1fr);align-items:baseline;gap:8px}\n.guide-head>span{font:700 7.5px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--blue)}\n.guide-head h3{margin:0;font-size:11.5px;line-height:1.25;letter-spacing:-.015em}\n.guide-card>p{margin:0;color:var(--ink-2);font-size:8.8px;line-height:1.45}\n.guide-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:7px;border-top:1px solid var(--rule)}\n.guide-foot>span{color:var(--ink-3);font-size:7.8px;line-height:1.35}\n.guide-foot>span b{color:var(--ink);font:700 13px var(--mono);margin-right:3px}\n.guide-foot>a{color:var(--blue);font-size:8px;font-weight:700;text-decoration:none;white-space:nowrap}\n.guide-links{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));border-top:1px solid var(--rule);border-left:1px solid var(--rule);border-radius:6px;overflow:hidden}\n.guide-links a{display:grid;gap:1px;min-width:0;padding:6px 7px;border-right:1px solid var(--rule);border-bottom:1px solid var(--rule);color:var(--ink);text-decoration:none;background:#fff}\n.guide-links a:nth-child(2n){border-right:0}.guide-links a:nth-last-child(-n+2){border-bottom:0}\n.guide-links a:hover{background:var(--blue-soft)}\n.guide-links b{font-size:8.5px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.guide-links small{color:var(--ink-3);font-size:7px;line-height:1.25}\n.stats{grid-template-columns:repeat(4,minmax(0,1fr));margin-top:0}\n.stats .stat{padding:11px 13px}\n.stats .stat b{font-size:21px}.stats .stat i{font-size:7.5px;line-height:1.25}\n.stats-secondary{grid-column:1/-1;display:flex;align-items:center;gap:18px;padding:7px 12px;border-top:1px solid var(--rule);background:#fff;color:var(--ink-3);font-size:8px}\n.stats-secondary span{display:inline-flex;align-items:baseline;gap:4px;white-space:nowrap}\n.stats-secondary b{color:var(--ink-2);font:700 9px var(--mono)}\n@media(max-width:1180px){header{grid-template-columns:minmax(280px,.8fr) minmax(0,1.2fr)}header .lede{align-self:center}.header-guides{grid-column:1/-1;grid-template-columns:1fr 1fr}.stats{grid-column:1/-1}}\n@media(max-width:920px){header{grid-template-columns:1fr}.header-guides{grid-column:auto;grid-template-columns:1fr 1fr}.stats{grid-template-columns:1fr 1fr}.stats-secondary{flex-wrap:wrap;gap:6px 14px}}\n@media(max-width:680px){.header-guides{grid-template-columns:1fr}.guide-head{grid-template-columns:1fr;gap:2px}.guide-foot{align-items:flex-start;flex-direction:column}.guide-links{grid-template-columns:1fr}.guide-links a,.guide-links a:nth-child(2n){border-right:0;border-bottom:1px solid var(--rule)}.guide-links a:last-child{border-bottom:0}.stats-secondary{display:grid;grid-template-columns:1fr;gap:4px}.stats .stat{padding:10px}.stats .stat b{font-size:20px}}\n`;
}
fs.writeFileSync('app.css',css);

console.log('First screen layout v1 applied');