const fs=require('fs');

let index=fs.readFileSync('index.html','utf8');
const navStart=index.indexOf('  <nav class="header-resources"');
const navEnd=index.indexOf('  </nav>',navStart);
if(navStart<0||navEnd<0) throw new Error('header-resources not found');

const nav=`  <nav class="header-resources" aria-label="Полезные материалы KinoRates">
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
    <a class="resource-link" href="https://ktr.su/content/news/detail.php?ELEMENT_ID=57863" target="_blank" rel="noopener">
      <span class="resource-kicker">Регионы</span><strong>Как применять ставки</strong><small>КТР · 172 специалиста</small><i aria-hidden="true">→</i>
    </a>
  </nav>`;
index=index.slice(0,navStart)+nav+index.slice(navEnd+'  </nav>'.length);

const v='20260813-0302';
index=index.replace(/href="app\.css(?:\?v=[^"]*)?"/g,`href="app.css?v=${v}"`);
index=index.replace(/src="(updates|check-log|rates-data|sources-data|market-data|app)\.js(?:\?v=[^"]*)?"/g,(_,name)=>`src="${name}.js?v=${v}"`);
fs.writeFileSync('index.html',index);

let css=fs.readFileSync('app.css','utf8');
const patch=`
/* resource shelf readable titles v5 */
.header-resources{grid-template-columns:repeat(7,minmax(168px,190px));justify-content:start;gap:8px}
.resource-link{min-height:80px;padding:11px 34px 11px 13px}
.resource-link strong{font-size:12.5px;line-height:1.22;white-space:normal;overflow:visible;text-overflow:clip}
.resource-link small{font-size:8.5px;line-height:1.3;white-space:normal;overflow:visible;text-overflow:clip}
@media(max-width:1380px){.header-resources{grid-template-columns:repeat(4,minmax(168px,200px))}}
@media(max-width:860px){.header-resources{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:430px){.header-resources{grid-template-columns:1fr}}
`;
css=css.replace(/\n\/\* resource shelf readable titles v5 \*\/[\s\S]*$/,'');
css+=patch;
fs.writeFileSync('app.css',css);
console.log('Header resources reordered and made readable');
