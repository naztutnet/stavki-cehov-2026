window.KINORATES_CHECKS = [];

(function bootPreviewV2(){
  document.documentElement.dataset.kinoratesPreview='v2';

  const robots=document.querySelector('meta[name="robots"]');
  if(robots)robots.setAttribute('content','noindex, nofollow, noarchive');
  else{
    const meta=document.createElement('meta');
    meta.name='robots';
    meta.content='noindex, nofollow, noarchive';
    document.head.appendChild(meta);
  }
  document.title='KinoRates — Preview v2 · вариант C';

  /* Preview traffic must not pollute the production Yandex Metrica counter. */
  const nativeInsertBefore=Node.prototype.insertBefore;
  Node.prototype.insertBefore=function(newNode,referenceNode){
    const src=newNode&&newNode.src?String(newNode.src):'';
    if(src.includes('mc.yandex.ru/metrika/'))return newNode;
    return nativeInsertBefore.call(this,newNode,referenceNode);
  };

  function decorate(){
    document.body.classList.add('preview-v2');
    const header=document.querySelector('header');
    if(header&&!header.querySelector('.preview-v2-note')){
      const note=document.createElement('div');
      note.className='preview-v2-note';
      note.innerHTML='<span>Preview v2 · вариант C · тестовый интерфейс</span><a href="/">Открыть текущую версию KinoRates ↗</a>';
      header.prepend(note);
    }
    const eyebrow=document.querySelector('.eyebrow');
    if(eyebrow)eyebrow.textContent='KinoRates · дизайн-прототип C · данные из текущей базы';
    const home=document.querySelector('.home-title');
    if(home){home.href='/preview-v2/';home.setAttribute('aria-label','KinoRates Preview v2 — на начало страницы')}
    const banner=document.getElementById('cookieBanner');
    if(banner)banner.hidden=true;
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',decorate,{once:true});
  else decorate();
})();
