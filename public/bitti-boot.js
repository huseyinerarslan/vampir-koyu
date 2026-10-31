(()=>{
  const KEY='bitti-session';
  const TS='bitti-session-saved-at';
  const MAX_AGE=12*60*60*1000;
  const nativeSet=Storage.prototype.setItem;
  const nativeGet=Storage.prototype.getItem;

  function readLocal(){
    try{
      const raw=nativeGet.call(localStorage,KEY);if(!raw)return null;
      const at=Number(nativeGet.call(localStorage,TS)||0);
      if(at&&Date.now()-at>MAX_AGE){localStorage.removeItem(KEY);localStorage.removeItem(TS);return null;}
      return JSON.parse(raw);
    }catch{return null;}
  }

  try{
    const current=nativeGet.call(sessionStorage,KEY);
    const saved=readLocal();
    if(!current&&saved)nativeSet.call(sessionStorage,KEY,JSON.stringify(saved));
  }catch{}

  Storage.prototype.setItem=function(k,v){
    nativeSet.call(this,k,v);
    if(this===sessionStorage&&k===KEY){
      try{nativeSet.call(localStorage,KEY,v);nativeSet.call(localStorage,TS,String(Date.now()));}catch{}
    }
  };

  const nativeFetch=window.fetch.bind(window);
  window.fetch=(input,init={})=>{
    try{
      const url=typeof input==='string'?input:input?.url||'';
      if(url.includes('/api/join')&&String(init.method||'GET').toUpperCase()==='POST'&&init.body){
        const body=JSON.parse(init.body);
        const saved=readLocal();
        if(saved?.code&&saved?.token&&body?.code&&String(saved.code).toUpperCase()===String(body.code).toUpperCase()){
          body.resumeToken=saved.token;
          init={...init,body:JSON.stringify(body)};
        }
      }
    }catch{}
    return nativeFetch(input,init);
  };

  document.addEventListener('DOMContentLoaded',()=>{
    const badge=document.createElement('div');
    badge.id='floatingRoundBadge';
    badge.setAttribute('aria-live','polite');
    badge.style.cssText='position:fixed;right:12px;top:72px;z-index:45;display:none;align-items:center;gap:6px;padding:9px 12px;border-radius:14px;background:rgba(20,22,38,.94);border:1px solid rgba(255,255,255,.12);box-shadow:0 10px 32px rgba(0,0,0,.28);backdrop-filter:blur(10px);font:900 12px/1 system-ui,-apple-system,Segoe UI,sans-serif;letter-spacing:.06em;color:#f7f7fb;pointer-events:none';
    badge.innerHTML='<span style="color:#8cf14f">TUR</span> <span id="floatingRoundText">1/5</span>';
    document.body.appendChild(badge);

    const refresh=()=>{
      const active=document.querySelector('.screen.active')?.id||'';
      const visible=['screen-game','screen-review','screen-score'].includes(active);
      const now=(document.querySelector('#roundNow')?.textContent||'1').trim();
      const total=(document.querySelector('#roundTotal')?.textContent||document.querySelector('#lobbyRounds')?.textContent||'5').trim();
      const text=document.querySelector('#floatingRoundText');if(text)text.textContent=`${now}/${total}`;
      badge.style.display=visible?'flex':'none';
    };
    refresh();setInterval(refresh,300);

    const finishHome=document.querySelector('#finishHomeBtn');
    if(finishHome)finishHome.addEventListener('click',()=>{try{localStorage.removeItem(KEY);localStorage.removeItem(TS);}catch{}},{capture:true});
  });
})();
