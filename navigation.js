// KinoRates navigation: semantic browser history, deep-linkable estimate and back-to-top.
(() => {
  const builder=document.getElementById('builder');
  const openBuilder=document.getElementById('openBuilder');
  const closeBuilder=document.getElementById('closeBuilder');
  const main=document.querySelector('main.registry');
  if(main){if(!main.id)main.id='mainContent';const skip=document.createElement('a');skip.className='skip-link';skip.href='#mainContent';skip.textContent='К содержанию';document.body.prepend(skip)}
  const top=document.createElement('button');top.type='button';top.className='back-to-top';top.setAttribute('aria-label','Наверх');top.textContent='↑';document.body.appendChild(top);
  const syncTop=()=>top.classList.toggle('is-visible',scrollY>Math.max(700,innerHeight));addEventListener('scroll',syncTop,{passive:true});syncTop();top.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
  const urlFor=view=>{const u=new URL(location.href);view==='estimate'?u.searchParams.set('view','estimate'):u.searchParams.delete('view');return u.pathname+u.search+u.hash};
  const isOpen=()=>builder&&!builder.hidden;
  const apply=view=>{if(!builder)return;const want=view==='estimate';if(want&&!isOpen())openBuilder?.click();if(!want&&isOpen())closeBuilder?.click()};
  let fromHistory=false;
  openBuilder?.addEventListener('click',()=>{if(fromHistory||history.state?.kinoratesView==='estimate')return;history.replaceState({...history.state,kinoratesView:'registry',scrollY},'',urlFor('registry'));history.pushState({kinoratesView:'estimate',scrollY},'',urlFor('estimate'))});
  closeBuilder?.addEventListener('click',()=>{if(fromHistory)return;if(history.state?.kinoratesView==='estimate')history.back();else history.replaceState({kinoratesView:'registry',scrollY},'',urlFor('registry'))});
  addEventListener('popstate',e=>{const view=e.state?.kinoratesView||(new URL(location.href).searchParams.get('view')==='estimate'?'estimate':'registry');fromHistory=true;apply(view);fromHistory=false;if(view==='registry'&&Number.isFinite(e.state?.scrollY))requestAnimationFrame(()=>scrollTo(0,e.state.scrollY))});
  const initial=new URL(location.href).searchParams.get('view')==='estimate'?'estimate':'registry';history.replaceState({...history.state,kinoratesView:initial,scrollY},'',location.href);if(initial==='estimate')requestAnimationFrame(()=>{fromHistory=true;apply('estimate');fromHistory=false});
})();
