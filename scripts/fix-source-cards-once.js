const fs=require('fs');
let index=fs.readFileSync('index.html','utf8');

index=index.replace('Основные источники базы — справочник МПК и реестр «Точно продюсер».','Основные источники базы — справочник МПК, реестр «Точно продюсер» и цеховые письма.');
index=index.replace('<span class="resource-kicker">Первоисточники</span><strong>МПК</strong>','<span class="resource-kicker">Первоисточник</span><strong>МПК</strong>');
index=index.replace('<span class="resource-kicker">Реестр</span><strong>Точно продюсер</strong>','<span class="resource-kicker">Первоисточник</span><strong>Точно продюсер</strong>');
index=index.replace('<span class="resource-kicker">Первоисточники</span><strong>Цеховые письма</strong>','<span class="resource-kicker">Первоисточник</span><strong>Цеховые письма</strong>');
index=index.replace('href="https://t.me/filmres/7441"','href="https://t.me/s/filmres/7441"');
index=index.replace('<span class="resource-kicker">Рынок · 2025</span><strong>StarDust</strong><small>гонорары и рынок</small>','<span class="resource-kicker">Рынок · 2025</span><strong>StarDust × Новости кинопроизводства</strong><small>сводный пост со ставками</small>');

const v='20260813-0322';
index=index.replace(/href="app\.css(?:\?v=[^"]*)?"/g,`href="app.css?v=${v}"`);
index=index.replace(/src="(updates|check-log|rates-data|sources-data|market-data|app)\.js(?:\?v=[^"]*)?"/g,(_,name)=>`src="${name}.js?v=${v}"`);

if(!index.includes('https://t.me/s/filmres/7441')) throw new Error('StarDust web permalink missing');
if(!index.includes('Основные источники базы — справочник МПК, реестр «Точно продюсер» и цеховые письма.')) throw new Error('Source note missing');
if((index.match(/<span class="resource-kicker">Первоисточник<\/span>/g)||[]).length<3) throw new Error('Primary source labels not normalized');

fs.writeFileSync('index.html',index);
console.log('Source cards and StarDust destination fixed');
