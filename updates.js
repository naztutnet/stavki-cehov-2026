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

function setupResponsiveInspector(){
  const inspector=document.querySelector('.est');
  const table=document.getElementById('tb');
  if(!inspector||!table)return;

  const mq=window.matchMedia('(max-width:1999px)');
  let lastTrigger=null;

  const backdrop=document.createElement('button');
  backdrop.type='button';
  backdrop.className='inspector-backdrop';
  backdrop.setAttribute('aria-label','Закрыть карточку позиции');
  document.body.appendChild(backdrop);

  const close=document.createElement('button');
  close.type='button';
  close.className='inspector-drawer-close';
  close.setAttribute('aria-label','Закрыть карточку позиции');
  close.textContent='×';
  inspector.prepend(close);

  function openDrawer(trigger){
    if(!mq.matches)return;
    lastTrigger=trigger||lastTrigger;
    document.body.classList.add('inspector-drawer-open');
    inspector.setAttribute('aria-modal','true');
    requestAnimationFrame(()=>close.focus({preventScroll:true}));
  }

  function closeDrawer(restoreFocus=true){
    if(!document.body.classList.contains('inspector-drawer-open'))return;
    document.body.classList.remove('inspector-drawer-open');
    inspector.removeAttribute('aria-modal');
    if(restoreFocus&&lastTrigger&&document.contains(lastTrigger))lastTrigger.focus({preventScroll:true});
  }

  table.addEventListener('click',event=>{
    if(event.target.closest('[data-add],[data-remove],a,button'))return;
    const row=event.target.closest('tr.r');
    if(row)openDrawer(row);
  });
  backdrop.addEventListener('click',()=>closeDrawer());
  close.addEventListener('click',()=>closeDrawer());
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&mq.matches)closeDrawer();
  });
  const handleMq=()=>{if(!mq.matches)closeDrawer(false)};
  if(typeof mq.addEventListener==='function')mq.addEventListener('change',handleMq);else mq.addListener(handleMq);

  window.KinoRatesInspectorDrawer={open:openDrawer,close:closeDrawer};
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

function bootKinoRatesEnhancements(){
  syncKinoRatesVisibleCounters();
  setupResponsiveInspector();
  /* app.js определяет старую прокрутку к инспектору для <=920px. После загрузки
     заменяем её открытием drawer, чтобы страница не прыгала под панелью. */
  window.revealMobileDetail=function(){
    if(window.matchMedia('(max-width:1999px)').matches){
      const selected=document.querySelector('#tb tr.r.selected');
      window.KinoRatesInspectorDrawer?.open(selected||null);
    }
  };
}

if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',bootKinoRatesEnhancements,{once:true});
else queueMicrotask(bootKinoRatesEnhancements);
