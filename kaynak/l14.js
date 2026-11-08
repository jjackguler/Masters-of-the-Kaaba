/* ===================== l14: the full-version unlock, first-time service tutorial, season mastery goals =====================
   Sales model: chapters 1-2 are free; chapters 3-7 and "Hacılara Hizmet" open with ONE non-consumable purchase.
   No ads, no subscriptions, no consumables, bereket is never sold for real money.
   Only the app package (STORE_BUILD) is gated; the web build stays complete. */
const FREE_CH=2,PROD_ID='kabe_full_unlock';
const IAP={ready:false,price:'',busy:false,err:''};
function isFull(){return !STORE_BUILD||!!D.full;}
function grantFull(src){if(D.full)return;D.full=true;ssave();toast(L2('Tam sürüm açıldı. Teşekkürler!','Full version unlocked. Thank you!'),4);sfx.build();hap('heavy');
  if(!KS.hidden&&document.getElementById('kpw-buy')){closeSheet();if(KM.hidden&&KT.hidden&&state!=='play')showMap();else if(!KM.hidden)showMap();}}
{const cp0=cleanProfile;cleanProfile=function(s){const o=cp0(s);o.full=!!(s&&s.full===true);return o;};D.full=D.full===true;}
/* store glue: cordova-plugin-purchase v13 (global CdvPurchase). Nothing here runs on the web. */
function iapInit(){const C=window.CdvPurchase;if(!STORE_BUILD||!C||IAP.ready)return;
  try{const {store,ProductType,Platform}=C;
    store.register([{id:PROD_ID,type:ProductType.NON_CONSUMABLE,platform:Platform.GOOGLE_PLAY},{id:PROD_ID,type:ProductType.NON_CONSUMABLE,platform:Platform.APPLE_APPSTORE}]);
    store.when().productUpdated(p=>{if(p.id!==PROD_ID)return;const o=p.getOffer&&p.getOffer();IAP.price=(o&&o.pricingPhases&&o.pricingPhases[0]&&o.pricingPhases[0].price)||'';if(p.owned)grantFull('owned');refreshPaywall();})
      .approved(t=>t.verify()).verified(r=>r.finish())
      .finished(t=>{if((t.products||[]).some(p=>p.id===PROD_ID)){IAP.busy=false;grantFull('purchase');}});
    store.error(e=>{IAP.busy=false;IAP.err=(e&&e.message)||'';refreshPaywall();});
    store.initialize([Platform.GOOGLE_PLAY,Platform.APPLE_APPSTORE]).then(()=>{IAP.ready=true;const p=store.get(PROD_ID);if(p&&p.owned)grantFull('owned');refreshPaywall();});
  }catch(e){IAP.err=String(e&&e.message||e);}}
document.addEventListener('deviceready',iapInit,false);setTimeout(iapInit,1500);
function iapBuy(){const C=window.CdvPurchase;if(!C||!IAP.ready){IAP.err=L2('Mağazaya bağlanılamadı. İnternetini kontrol edip tekrar dene.','Could not reach the store. Check your connection and try again.');refreshPaywall();return;}
  const p=C.store.get(PROD_ID),o=p&&p.getOffer();if(!o){IAP.err=L2('Ürün şu an alınamıyor.','The product is not available right now.');refreshPaywall();return;}
  IAP.busy=true;IAP.err='';refreshPaywall();o.order().then(r=>{if(r&&r.isError){IAP.busy=false;IAP.err=r.message||'';refreshPaywall();}});}
function iapRestore(){const C=window.CdvPurchase;if(!C||!IAP.ready){IAP.err=L2('Mağazaya bağlanılamadı.','Could not reach the store.');refreshPaywall();return;}
  IAP.busy=true;refreshPaywall();C.store.restorePurchases().then(()=>{IAP.busy=false;const p=C.store.get(PROD_ID);if(p&&p.owned)grantFull('restore');else{IAP.err=L2('Bu hesapta önceki bir satın alma bulunamadı.','No earlier purchase was found on this account.');refreshPaywall();}});}
function paywall(from){state=state==='play'?'ui':state;
  if(DEMO_BUILD){sheet(`<span class="ic">🕋</span><p class="eb">${L2('Ücretsiz deneme','Free demo')}</p><h2>${L2('Hikâyenin devamı','The rest of the story')}</h2>
    <p>${L2('Bu web sürümünde ilk iki bölüm ücretsiz. Oyunun tamamı App Store ve Google Play\'e geliyor:','This web demo has the first two chapters. The full game is coming to the App Store and Google Play:')}</p>
    <div class="task"><span>🧱</span><span>${L2('5 bölüm daha: taşçılar, Kanlı Yemin, gemi, yükselen duvarlar, çatı ve kapı','5 more chapters: the stonecutters, the oath, the ship, the rising walls, the roof and the door')}</span></div>
    <div class="task"><span>🫖</span><span>${L2('Hacılara Hizmet: hikâyeden sonra sınırsız hac mevsimleri','Serving the Pilgrims: endless seasons after the story')}</span></div>
    <p style="text-align:center;font:700 14px var(--f-ui);margin:10px 0 14px">${L2('Tek seferlik · reklam yok · abonelik yok','One-time · no ads · no subscription')}</p>
    <div class="kbtns"><button class="kbtn" id="kpw-x" data-back>${L2('Haritaya dön','Back to the map')}</button></div>`,c=>{
    c.querySelector('#kpw-x').onclick=()=>{closeSheet();if(KM.hidden&&KT.hidden)showMap();};});return;}
  sheet(`<span class="ic">🕋</span><p class="eb">${L2('Tam sürüm','Full version')}</p><h2>${L2('Hikâyenin devamı','The rest of the story')}</h2>
    <p>${L2('İlk iki bölüm ücretsiz. Tek seferlik satın almayla şunlar açılır:','The first two chapters are free. One purchase opens:')}</p>
    <div class="task"><span>🧱</span><span>${L2('5 bölüm daha: taşçılar, Kanlı Yemin, gemi, yükselen duvarlar, çatı ve kapı','5 more chapters: the stonecutters, the oath, the ship, the rising walls, the roof and the door')}</span></div>
    <div class="task"><span>🫖</span><span>${L2('Hacılara Hizmet: hikâyeden sonra sınırsız hac mevsimleri','Serving the Pilgrims: endless seasons after the story')}</span></div>
    <p style="text-align:center;font:700 14px var(--f-ui);margin:10px 0 0">${L2('Tek seferlik · reklam yok · abonelik yok','One-time · no ads · no subscription')}</p>
    <p id="kpw-msg" role="status" style="text-align:center;font:600 13px var(--f-ui);color:#8a3a2c;min-height:18px;margin:6px 0 0"></p>
    <div class="kbtns"><button class="kbtn alt" id="kpw-x" data-back>${L2('Geri','Back')}</button><button class="kbtn" id="kpw-buy"></button></div>
    <p style="text-align:center;margin:10px 0 0"><button id="kpw-restore" style="background:none;border:0;font:700 14px var(--f-ui);color:#1f6f78;min-height:44px;text-decoration:underline">${L2('Satın alımları geri yükle','Restore purchases')}</button></p>`,c=>{
    c.querySelector('#kpw-x').onclick=()=>{closeSheet();if(KM.hidden&&KT.hidden)showMap();};
    c.querySelector('#kpw-buy').onclick=iapBuy;c.querySelector('#kpw-restore').onclick=iapRestore;refreshPaywall();});}
function refreshPaywall(){const b=document.getElementById('kpw-buy');if(!b)return;const m=document.getElementById('kpw-msg');
  b.disabled=IAP.busy;b.textContent=IAP.busy?L2('Bekleniyor…','Please wait…'):(L2('Satın al','Buy')+(IAP.price?' · '+IAP.price:''));
  if(m)m.textContent=IAP.err||(!window.CdvPurchase?L2('Satın alma yalnızca uygulama mağazası sürümünde çalışır.','Purchases work only in the store version of the app.'):'');}
/* gates: the story card, a direct start, a resume, the service layer */
{const ss0=showStory;showStory=function(n){if(n>FREE_CH&&!isFull()){paywall('story');return;}ss0(n);};}
{const sc0=startChapter;startChapter=function(n){if((n>FREE_CH||n===MCH)&&!isFull()){paywall('start');return;}sc0(n);};}
{const sm0=startMeta;startMeta=function(){if(!isFull()){paywall('meta');return;}sm0();};}
{const sm1=showMap;showMap=function(){sm1();if(isFull())return;const nodes=document.querySelectorAll('#km-path .knode');nodes.forEach((b,i)=>{const n=b.id==='km-meta'?MCH:i+1;if(n<=FREE_CH)return;b.classList.add('paid');
    if(!b.querySelector('.kpaid')){const t=document.createElement('span');t.className='kpaid';t.textContent=L2('🔒 Tam sürüm','🔒 Full version');b.appendChild(t);}});};}
{const st=document.createElement('style');st.textContent=`.knode .kpaid{display:block;font:800 11px var(--f-ui,system-ui);color:#7a4a10;background:#f6e3b4;border-radius:999px;padding:2px 8px;margin-top:4px}`;document.head.appendChild(st);}
/* chapter 1 story card: the full intro is one tap away */
{const ss1=showStory;showStory=function(n){ss1(n);if(n!==1)return;const k=$('#kcard .kbtns');if(!k||$('#ks-full'))return;
  const b=document.createElement('p');b.style.cssText='text-align:center;margin:8px 0 0';b.innerHTML=`<button id="ks-full" style="background:none;border:0;font:700 14px var(--f-ui);color:#1f6f78;min-height:44px;text-decoration:underline">▶ ${L2('Girişi uzun izle (20 sn)','Watch the full intro (20 s)')}</button>`;
  k.parentNode.insertBefore(b,k.nextSibling);b.querySelector('button').onclick=()=>{FULL_INTRO=true;closeSheet();startChapter(1);};};}
/* ---------- first visit to the service layer: four steps ---------- */
let mtut=0,mtutCash=0;
function metaTutStart(){if(D.meta.tut)return;mtut=1;TIP.hidden=false;TIP.textContent=L2('1/4 · Zemzem\'den su al: mavi daireye git','1/4 · Get water at Zamzam: walk to the blue circle');spawnPilgrim();}
function metaTutStep(){if(!mtut)return;TIP.hidden=state!=='play';if(state!=='play')return;
  if(mtut===1&&stack.includes('water')){mtut=2;TIP.textContent=L2('2/4 · Suyu Su ikramı standına bırak','2/4 · Take the water to the water stand');}
  else if(mtut===2&&STD.w.z.count>0){mtut=3;TIP.textContent=L2('3/4 · Sıradaki hacıya ikram ediliyor, bekle','3/4 · The first pilgrim in line is being served, wait');if(!STD.w.q.length)spawnPilgrim();}
  else if(mtut===3&&STD.w.cash>0){mtut=4;mtutCash=STD.w.cash;TIP.textContent=L2('4/4 · Tezgâhtaki bereketi topla: standa geri dön','4/4 · Collect the bereket on the counter: go back to the stand');}
  else if(mtut===4&&STD.w.cash===0){mtut=0;TIP.textContent=L2('Harika! Stantları dolu tut, hacıları bekletme 🫖','Great! Keep the stands stocked and the pilgrims moving 🫖');D.meta.tut=1;ssave();setTimeout(()=>{if(!mtut)TIP.hidden=true;},3500);}}
{const cm0=cleanMeta;cleanMeta=function(m){const o=cm0(m);o.tut=m&&m.tut?1:0;const n=(v,lo,hi)=>{v=Number(v);return isFinite(v)?Math.min(hi,Math.max(lo,v)):0;};o.sd=Math.round(n(m&&m.sd,0,1e6));o.stime=n(m&&m.stime,0,1e7);return o;};D.meta=cleanMeta(D.meta);}
{const s0=startMeta;startMeta=function(){s0();if(R.ch===MCH&&isFull()){if(KS.hidden)metaTutStart();else{const iv=setInterval(()=>{if(R.ch!==MCH){clearInterval(iv);return;}if(KS.hidden&&state==='play'){clearInterval(iv);metaTutStart();}},300);}}};}
{const lm0=leaveMeta;leaveMeta=function(){lm0();if(mtut){mtut=0;TIP.hidden=true;}};}
/* ---------- season mastery goals: not just a bigger number ---------- */
function mastery(){const s=D.meta.season,k=(s-1)%3,tg=seasonTarget(s);
  if(k===1&&standOpen('d'))return {id:'dates',txt:L2(`Ustalık: en az ${Math.round(tg*.4)} hurma ikramı`,`Mastery: serve at least ${Math.round(tg*.4)} dates`),ok:()=>D.meta.sd>=Math.round(tg*.4)};
  if(k===2)return {id:'time',txt:L2(`Ustalık: mevsimi ${Math.ceil(tg*12/60)} dakikada bitir`,`Mastery: finish within ${Math.ceil(tg*12/60)} min`),ok:()=>D.meta.stime<=tg*12};
  return {id:'nomiss',txt:L2('Ustalık: kimse beklerken küsüp gitmesin','Mastery: nobody leaves upset'),ok:()=>D.meta.ms===0};}
{const sv0=serve;serve=function(s){if(s.k==='d')D.meta.sd=(D.meta.sd||0)+1;sv0(s);};}
{const ns0=nextSeason;nextSeason=function(){const was=D.meta.between;ns0();if(was){D.meta.sd=0;D.meta.stime=0;ssave();}};}
{const ms0=metaStep;metaStep=function(dt,playing){ms0(dt,playing);if(dt>0&&!D.meta.between)D.meta.stime=(D.meta.stime||0)+dt;metaTutStep();};}
{const sd0=seasonDone;seasonDone=function(){if(D.meta.between)return;const m=mastery(),won=m.ok();if(won){const b=20*D.meta.season;award(b);}D.meta.lastMastery={txt:m.txt,won};sd0();
  setTimeout(()=>{const card=$('#kcard');if(!card||!card.querySelector('#km-next'))return;const learn=card.querySelector('.learn');
    const p=document.createElement('div');p.className='task';p.innerHTML=`<span>${won?'⭐':'☆'}</span><span>${m.txt}: <b>${won?L2('başardın! Hediye iki katı','done! Gift doubled'):L2('bu sefer olmadı','not this time')}</b></span>`;learn.parentNode.insertBefore(p,learn);
    const nu=MUPG.find(u=>!MU(u.id)&&(!u.need||MU(u.need)));if(nu){const q=document.createElement('div');q.className='task';q.innerHTML=`<span>${nu.icon}</span><span>${L2('Sıradaki yükseltme: ','Next upgrade: ')}<b>${nu.label}</b> · ${nu.desc} (🪙 ${nu.cost})</span>`;learn.parentNode.insertBefore(q,learn);}},760);};}
{const uh0=updateHud;updateHud=function(dt){uh0(dt);if(SITE.on&&R.ch===MCH&&!mtut&&!D.meta.between){const cur=qSub.textContent;if(!/hacı bekliyor|pilgrims waiting/.test(cur))setT(qSub,mastery().txt);}};}
/* the season sheet's buttons call the wrapped versions */
Object.assign(window.__site,{isFull,grantFull,paywall,IAP,mastery,mtut:()=>mtut,startChapter,showStory,startMeta,showMap,FREE_CH,STORE_BUILD});
})();
