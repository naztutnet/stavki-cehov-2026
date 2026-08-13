window.KINORATES_UPDATES = [
  {
    date: "2026-08-13",
    dateLabel: "13 августа 2026",
    type: "data",
    title: "Сверены новые источники",
    text: "Добавлены ориентиры по стедикаму и локейшен-менеджерам. Уточнены источники по монтажу, звуку, свету и грипу."
  },
  {
    date: "2026-08-13",
    dateLabel: "13 августа 2026",
    type: "data",
    title: "Рыночные данные по профессиям",
    text: "В карточках появился отдельный слой рыночных исследований с годом и периодом. Подтверждённые ставки он не меняет."
  },
  {
    date: "2026-08-13",
    dateLabel: "13 августа 2026",
    type: "data",
    title: "Сценарные ставки 2026",
    text: "Добавлена официальная сетка гонораров Гильдии кинодраматургов по форматам и уровням авторов."
  },
  {
    date: "2026-08-13",
    dateLabel: "13 августа 2026",
    type: "data",
    title: "Аэросъёмка АПАК 2025",
    text: "Сверены ставки классических и FPV-дронов: оборудование, минимумы, переработки и условия работы."
  }
];

function applyMobileUpdatesLayout(){
  if(!window.matchMedia('(max-width: 600px)').matches)return;
  const list=document.querySelector('.updates-inline .updates-list');
  if(list)list.style.gridAutoColumns='minmax(280px, 92vw)';
  document.querySelectorAll('.updates-inline .update-item').forEach(item=>{
    item.style.minHeight='132px';
    item.style.padding='12px 13px 14px';
    const title=item.querySelector('.update-content h3');
    const text=item.querySelector('.update-content p');
    if(title){
      title.style.display='block';
      title.style.fontSize='13px';
      title.style.lineHeight='1.3';
      title.style.webkitLineClamp='unset';
      title.style.overflow='visible';
    }
    if(text){
      text.style.display='block';
      text.style.marginTop='6px';
      text.style.fontSize='10.5px';
      text.style.lineHeight='1.48';
      text.style.webkitLineClamp='unset';
      text.style.overflow='visible';
    }
  });
}

/*
 * Счётчики ниже намеренно считаются из фактически загруженных массивов.
 * Это убирает ручное дублирование цифр после очередного обновления базы.
 */
function syncKinoRatesVisibleCounters(){
  const data=Array.isArray(window.KINORATES_DATA)?window.KINORATES_DATA:[];
  const sources=Array.isArray(window.KINORATES_SOURCES)?window.KINORATES_SOURCES:[];
  const market=Array.isArray(window.KINORATES_MARKET_DATA)?window.KINORATES_MARKET_DATA:[];
  if(!data.length)return;

  const depts=new Set(data.map(r=>r.dept).filter(Boolean));
  const current2026=data.filter(r=>['fresh2026','official2026'].includes(r.status)).length;
  const marketRows=data.filter(r=>r.status==='market2025').length;

  const navCount=document.querySelector('.nav-head span');
  if(navCount)navCount.textContent=String(depts.size);

  const resultCount=document.getElementById('resultCount');
  if(resultCount&&!document.getElementById('q')?.value&&!document.getElementById('unit')?.value&&!document.getElementById('content')?.value&&!document.getElementById('only26')?.checked){
    resultCount.textContent=`${data.length} позиций`;
  }

  const secondary=document.querySelector('#stats .stats-secondary');
  if(secondary){
    const original=[...secondary.querySelectorAll('span')];
    if(original[0])original[0].innerHTML=`<b>${marketRows}</b> позиций с рыночным ориентиром`;
    secondary.querySelectorAll('[data-live-counter]').forEach(node=>node.remove());
    const live=[
      [current2026,'подтверждений по источникам 2026'],
      [market.length,'рыночных исследований и срезов'],
      [sources.length,'источников и документов']
    ];
    live.forEach(([value,label])=>{
      const span=document.createElement('span');span.dataset.liveCounter='';
      const b=document.createElement('b');b.textContent=String(value);
      span.append(b,document.createTextNode(` ${label}`));secondary.appendChild(span);
    });
  }

  const footer=document.querySelector('footer');
  if(footer&&footer.textContent.includes('Сведено 30 июля 2026 года')){
    const first=footer.firstChild;
    if(first&&first.nodeType===Node.TEXT_NODE)first.textContent=first.textContent.replace('Сведено 30 июля 2026 года','База ревизована 13 августа 2026 года');
  }
  requestAnimationFrame(applyMobileUpdatesLayout);
}

if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',syncKinoRatesVisibleCounters,{once:true});
else queueMicrotask(syncKinoRatesVisibleCounters);
