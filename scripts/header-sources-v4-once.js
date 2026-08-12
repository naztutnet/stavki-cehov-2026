const fs=require('fs');

let index=fs.readFileSync('index.html','utf8');

// Add concise note about the two principal database sources.
const warning='</p></div>\n  <nav class="header-resources"';
const note='</p><p class="source-note">Основные источники базы — справочник МПК и реестр «Точно продюсер».</p></div>\n  <nav class="header-resources"';
if(index.includes(warning)) index=index.replace(warning,note);
else if(!index.includes('class="source-note"')) throw new Error('Header source-note marker not found');

// Replace the resource shelf with a unified set, including Tochnop and internal guild letters.
const navStart=index.indexOf('  <nav class="header-resources"');
const navEnd=index.indexOf('  </nav>',navStart);
if(navStart<0||navEnd<0) throw new Error('header-resources not found');
const nav=`  <nav class="header-resources" aria-label="Полезные материалы KinoRates">
    <a class="resource-link" href="https://ktr.su/content/news/detail.php?ELEMENT_ID=57863" target="_blank" rel="noopener">
      <span class="resource-kicker">Регионы</span><strong>Как применять ставки</strong><small>КТР · 172 специалиста</small><i aria-hidden="true">→</i>
    </a>
    <a class="resource-link" href="https://kinoprofsoyuz.ru/stranicza-stavok-po-czeham/" target="_blank" rel="noopener">
      <span class="resource-kicker">Первоисточники</span><strong>МПК</strong><small>актуальные документы</small><i aria-hidden="true">→</i>
    </a>
    <a class="resource-link" href="https://docs.google.com/spreadsheets/d/1BCgusuck7uhHvDZ2d-nUVyjZHlzrf05286fwpahlwdE/edit" target="_blank" rel="noopener">
      <span class="resource-kicker">Реестр</span><strong>Точно продюсер</strong><small>обновлён · 07.02.2025</small><i aria-hidden="true">→</i>
    </a>
    <a class="resource-link" href="#sourceLetters">
      <span class="resource-kicker">Первоисточники</span><strong>Цеховые письма</strong><small>документы по цехам</small><i aria-hidden="true">→</i>
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
  </nav>`;
index=index.slice(0,navStart)+nav+index.slice(navEnd+'  </nav>'.length);

// Remove duplicated guild-letters shortcut from the filter row.
index=index.replace(/\n\s*<a class="header-letters" href="#sourceLetters">Цеховые письма<\/a>/,'');

// Cache bust assets.
const v='20260813-0256';
index=index.replace(/href="app\.css(?:\?v=[^"]*)?"/g,`href="app.css?v=${v}"`);
index=index.replace(/src="(updates|check-log|rates-data|sources-data|market-data|app)\.js(?:\?v=[^"]*)?"/g,(_,name)=>`src="${name}.js?v=${v}"`);
fs.writeFileSync('index.html',index);

let app=fs.readFileSync('app.js','utf8');
app=app.replace(/исторических ставок/g,'ставок по старым документам');
fs.writeFileSync('app.js',app);

let css=fs.readFileSync('app.css','utf8');
const patch=`
/* header source note + seven resource links */
.source-note{margin:7px 0 0;color:var(--ink-3);font-size:10px;line-height:1.4}
.header-resources{grid-template-columns:repeat(7,minmax(138px,176px));gap:8px}
@media(max-width:1320px){.header-resources{grid-template-columns:repeat(4,minmax(150px,190px))}}
@media(max-width:820px){.header-resources{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:430px){.header-resources{grid-template-columns:1fr}}
`;
css=css.replace(/\n\/\* header source note \+ seven resource links \*\/[\s\S]*$/,'');
css+=patch;
fs.writeFileSync('app.css',css);

console.log('Header source refinements applied');
