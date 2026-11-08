/* ===================== l12: robustness + polish for the site game =====================
   input reset, audio lifecycle, Android back, WebGL loss, resumable runs,
   confirm-to-buy upgrades, inventory-first targeting, cached HUD, settings content,
   reduced motion, haptics, flying items. Runs inside the l9-l13 scope. */
const setT=(e,v)=>{if(e&&e.__v!==v){e.__v=v;e.textContent=v;}};
const setW=(e,v)=>{if(e&&e.__w!==v){e.__w=v;e.style.width=v;}};
/* ---------- reduced motion + vibration preferences ---------- */
function RM(){return reduce||!!D.rm;}
function applyRM(){document.body.classList.toggle('rm',RM());}
{const st=document.createElement('style');st.textContent=`
body.rm *,body.rm *::before,body.rm *::after{animation-duration:.001s!important;animation-iteration-count:1!important;transition-duration:.001s!important}
body.rm .ftx{animation:none!important}
@media (prefers-reduced-motion: reduce){.kcard,.knode.cur,#k-play{animation:none!important}}
#kpad{position:fixed;left:50%;bottom:calc(150px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:30;width:min(320px,calc(100vw - 32px));background:#fff8ea;border-radius:18px;box-shadow:0 8px 28px rgba(40,25,10,.35);padding:12px 14px;display:grid;grid-template-columns:44px 1fr auto;gap:4px 10px;align-items:center;font:600 14px/1.3 var(--f-ui,system-ui);color:#3a2a1c}
#kpad[hidden]{display:none}
#kpad .i{font-size:30px;grid-row:span 2;text-align:center}
#kpad b{font:800 16px var(--f-ui,system-ui)}
#kpad small{grid-column:2;color:#6a5a4c;font-weight:600}
#kpad button{grid-row:span 2;min-height:48px;min-width:84px;border:0;border-radius:999px;background:#d39a2c;color:#3a2408;font:800 16px var(--f-ui,system-ui);padding:0 14px}
#kpad button:disabled{background:#d8cfc0;color:#7a6a5a}
#kinfo{margin:12px 0 0;padding:12px 14px;background:#f3ead8;border-radius:12px;font:600 14px/1.45 var(--f-ui,system-ui);color:#3a2a1c;text-align:left}
#kinfo dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:6px 12px}#kinfo dt{font-weight:800}#kinfo dd{margin:0}
#kinfo p{margin:0 0 8px}
#kglost{position:fixed;inset:0;z-index:98;display:flex;align-items:center;justify-content:center;background:rgba(30,22,16,.92);color:#fff6e0;font:700 18px/1.5 var(--f-ui,system-ui);text-align:center;padding:24px}
#kglost[hidden]{display:none}
.knext{margin:12px 0 0;text-align:center;font:700 14px var(--f-ui,system-ui);color:#1f6f78}
`;document.head.appendChild(st);}
applyRM();
let hapT=0;
function hap(kind){if(D.novib)return;const now=performance.now();if(now-hapT<70)return;hapT=now;
  try{const H=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.Haptics;if(H){H.impact({style:kind==='heavy'?'MEDIUM':'LIGHT'});return;}}catch(_){}
  try{if(navigator.vibrate)navigator.vibrate(kind==='heavy'?28:12);}catch(_){}}
/* ---------- T15: one place that forgets every held input ---------- */
function resetInput(){for(const k in keys)keys[k]=false;jumpQ=false;actQ=false;tJumpHeld=false;
  joy.id=null;joy.x=joy.y=joy.mag=0;joyEl.hidden=true;knob.style.transform='';looks.clear();DP.f=0;DP.t=0;
  document.querySelectorAll('#dpad .on,#dpad [data-on]').forEach(b=>{b.classList.remove('on');b.removeAttribute('data-on');});}
addEventListener('blur',resetInput);
addEventListener('pagehide',resetInput);
cv.addEventListener('lostpointercapture',e=>endPtr(e));
{const sh0=sheet;sheet=function(h,f){resetInput();sh0(h,f);extendSheet();};}
{const an0=anime;anime=function(shots,done){resetInput();if(RM())shots=shots.map(s=>Object.assign({},s,{shake:0,speed:0,flash:null}));an0(shots,done);};}
/* ---------- T16: audio follows the app lifecycle ---------- */
function audioSuspend(){try{if(AU.ctx&&AU.ctx.state==='running')AU.ctx.suspend();}catch(_){}}
function audioResume(){try{if(AU.ctx&&AU.ctx.state!=='running'&&AU.ctx.state!=='closed')AU.ctx.resume();}catch(_){}}
['pointerdown','keydown','touchend'].forEach(ev=>addEventListener(ev,()=>{if(!document.hidden)audioResume();},{capture:true,passive:true}));
/* ---------- T06: resumable chapter runs ---------- */
const ITEMS_OK=new Set(['mud','rubble','raw','block','rawwood','beam','water','dates','flour','bread']);
function snapRun(){return {ch:R.ch,t:R.t,n:R.n,coins:R.coins,good:R.good,bank:Object.assign({},R.bank),water:R.water,thirstT:R.thirstT,thirsty:R.thirsty,maxAnger:R.maxAnger,
  course:R.course,inCourse:R.inCourse,bankTip:R.bankTip||0,stack:stack.slice(),zones:ZONES.map(z=>z.count|0),fam:families.map(f=>[f.z.count|0,f.happy?1:0]),
  fires:F4.map(f=>Math.round(f.anger*10)/10),px:+P.x.toFixed(2),pz:+P.z.toFixed(2),at:Date.now()};}
function canSnap(){return SITE.on&&R.ch>=1&&R.ch<=NCH&&!R.done&&!R.ended&&state==='play';}
let snapT=0;
function saveRun(){if(!canSnap())return false;D.run=snapRun();return ssave();}
function resumeRun(s){const n=s&&s.ch;if(!(n>=1&&n<=NCH)||n>D.unl){D.run=null;ssave();return false;}
  auInit();coinIcon();musicStart();cleanupChapter();KM.hidden=true;KT.hidden=true;titleEl.hidden=true;closeSheet();SITE.on=true;started=true;build();makeUpgradeWorkers();
  setupCh(n);afterIntro(n);const num=(v,d,lo,hi)=>{v=Number(v);return isFinite(v)?Math.min(hi,Math.max(lo,v)):d;};const c=CH[n];
  R.t=num(s.t,0,0,36000);R.n=Math.round(num(s.n,0,0,c.goal||999));R.coins=Math.round(num(s.coins,0,0,1e6));R.good=Math.round(num(s.good,0,0,1e5));
  R.water=num(s.water,0,0,60);R.thirstT=num(s.thirstT,0,0,600);R.thirsty=!!s.thirsty;R.maxAnger=num(s.maxAnger,0,0,100);R.bankTip=s.bankTip?1:0;
  if(c.c0!=null){R.course=Math.round(num(s.course,c.c0,c.c0,c.c1-1));R.inCourse=Math.round(num(s.inCourse,0,0,COURSES[R.course].n-1));}
  R.bank={};if(s.bank&&typeof s.bank==='object')for(const k of ['block','beam'])if(s.bank[k]>0)R.bank[k]=Math.round(num(s.bank[k],0,0,40));
  if(Array.isArray(s.zones))ZONES.forEach((z,i)=>{if(s.zones[i]!=null){z.count=Math.round(num(s.zones[i],0,0,z.max||99));}});
  if(Array.isArray(s.fam))families.forEach((f,i)=>{const v=s.fam[i];if(v){f.z.count=Math.round(num(v[0],0,0,8));f.happy=!!v[1];}});
  for(const z of ZONES)if(z.pileG)pileVis(z,z===Z.dump?(n===1?'mud':'rubble'):families.some(f=>f.z===z)?'mud':undefined);
  if(n===2){const sc=1-R.n/c.goal*.88;KP.old.scale.y=sc;KP.oldDoor.visible=sc>.6;}
  if(c.c0!=null)kaaba({wallH:wallAt(R.course,R.inCourse)});
  if(n===4&&Array.isArray(s.fires))F4.forEach((f,i)=>{f.anger=num(s.fires[i],20,0,99);});
  const cap=hooks.cap?hooks.cap():D.cap;stack=(Array.isArray(s.stack)?s.stack:[]).filter(t=>ITEMS_OK.has(t)).slice(0,cap);stackVis();
  if(isFinite(s.px)&&isFinite(s.pz))placeHero(s.px,s.pz);cam.yaw=Math.atan2(P.x,P.z);
  state='play';hud.style.opacity=1;dpadApply();R.done=false;R.ended=false;
  toast(L2('Kaldığın yerden devam ediyorsun','Picking up where you left off')+' · '+c.name,3.5);return true;}
{const sc0=startChapter;startChapter=function(n){closeSheet();if(D.run){D.run=null;ssave();}sc0(n);};}
{const ss0=showStory;showStory=function(n){const r=D.run;if(!r||r.ch!==n){ss0(n);return;}const c=CH[n];
  const tt=Math.round(r.t||0);sheet(`<span class="ic">${c.icon}</span><p class="eb">${L2('Bölüm','Chapter')} ${n} / ${NCH}</p><h2>${c.name}</h2><p>${L2('Bu bölümü yarıda bırakmıştın.','You left this chapter unfinished.')} <b>${Math.floor(tt/60)}:${String(tt%60).padStart(2,'0')}</b></p>
    <div class="kbtns"><button class="kbtn alt" id="kr-new">${L2('Baştan başla','Start over')}</button><button class="kbtn" id="kr-res">${L2('Devam et','Continue')}</button></div>`,c2=>{
    c2.querySelector('#kr-res').onclick=()=>{if(!resumeRun(r)){closeSheet();showMap();}};
    c2.querySelector('#kr-new').onclick=()=>{D.run=null;ssave();closeSheet();startChapter(n);};});};}
{const kp=$('#k-play');if(kp){const p0=kp.onclick;kp.onclick=e=>{if(D.run&&D.run.ch>=1&&D.run.ch<=D.unl){auInit();musicStart();showStory(D.run.ch);}else p0(e);};}}
function onHide(){resetInput();if(SITE.on&&state==='play'&&!R.done){unloadBonus();saveRun();}else if(runDirty)ssave();audioSuspend();
  if(SITE.on&&state==='play'&&!R.done&&KS.hidden){const b=$('#b-menu');if(b)b.click();}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)onHide();else audioResume();});
addEventListener('pagehide',onHide);
/* ---------- T10: upgrades are bought on purpose ---------- */
const PADSETS=[()=>PADS];
const UPG_DESC={cap1:L2('Bir seferde 2 yük daha taşırsın.','Carry 2 more loads at once.'),cap2:L2('Bir seferde 2 yük daha taşırsın.','Carry 2 more loads at once.'),
  cutter2:L2('İkinci taşçı: kesme taş iki kat hızlı çıkar.','A second cutter: cut stone comes twice as fast.'),porter1:L2('Ham taşı ocaktan taşçıya kendisi taşır.','Carries raw stone from the quarry to the cutter.'),
  porter2:L2('Gemi tahtasını marangoza kendisi taşır.','Carries ship timber to the carpenter.'),fast:L2('Sandaletlerle daha hızlı yürürsün.','You walk faster in sandals.')};
const PADUI={open:false,p:null};
const padEl=el(`<div id="kpad" hidden role="dialog" aria-live="polite"><span class="i"></span><b></b><button type="button"></button><small></small></div>`);document.body.appendChild(padEl);
function padRemain(p){return Math.max(0,p.u.cost-(p.paid||0));}
function buyPad(p){const rem=padRemain(p);if(D.coins<rem)return false;D.coins-=rem;p.paid=p.u.cost;
  if(p.buy)p.buy();else{const u=p.u;D.up[u.id]=true;delete D.up['p_'+u.id];if(u.apply)u.apply();makeUpgradeWorkers();scene.remove(p.mesh);const i=PADS.indexOf(p);if(i>=0)PADS.splice(i,1);syncPads();}
  sfx.build();hap('heavy');sparkle(p.u.x,1,p.u.z,30);ftext('✓ '+p.u.label,p.u.x,2,p.u.z,'#ffd75e');pop('r-wood');ssave();return true;}
function nearestPad(){let b=null,bd=1.9;for(const f of PADSETS)for(const p of f()){const d=Math.hypot(P.x-p.u.x,P.z-p.u.z);if(d<bd){bd=d;b=p;}}return b;}
function stepPadUI(){const p=SITE.on&&state==='play'&&KS.hidden&&!R.done?nearestPad():null;
  if(!p){if(!padEl.hidden)padEl.hidden=true;PADUI.p=null;return;}
  const rem=padRemain(p),ok=D.coins>=rem;
  if(PADUI.p!==p||padEl.__k!==ok+'|'+D.coins){PADUI.p=p;padEl.__k=ok+'|'+D.coins;
    setT(padEl.querySelector('.i'),p.u.icon);setT(padEl.querySelector('b'),p.u.label);
    setT(padEl.querySelector('small'),(p.u.desc||UPG_DESC[p.u.id]||'')+' '+(ok?'':L2(`(${rem-D.coins} bereket daha lazım)`,`(need ${rem-D.coins} more bereket)`)));
    const b=padEl.querySelector('button');b.disabled=!ok;setT(b,'🪙 '+rem);b.setAttribute('aria-label',L2('Satın al: ','Buy: ')+p.u.label+' '+rem);}
  if(padEl.hidden){padEl.hidden=false;tone(HIC[6],.06,.03);}}
padEl.querySelector('button').addEventListener('click',e=>{e.stopPropagation();const p=PADUI.p;if(p&&buyPad(p)){padEl.hidden=true;PADUI.p=null;}});
/* ---------- T08: the arrow follows what you are holding ---------- */
siteTarget=function(){if(state!=='play'||R.done)return null;const top=stack[stack.length-1],n=R.ch;
  if(n===1)return top==='mud'?ZT(Z.dump):ZT(nearestMud());
  if(n===2)return top==='rubble'?ZT(Z.dump):ZT(Z.rubble);
  if(n===4){if(top!=='water')return ZT(Z.well);let b=null;for(const f of F4)if(!b||f.anger>b.anger)b=f;return b?{x:b.x,z:b.z,n:b.name}:null;}
  if(top==='water'){if(!R.thirsty)return ZT(Z.well);let c=cutter[0];if(carp&&carp.g.visible&&Math.hypot(P.x-carp.x,P.z-carp.z)<Math.hypot(P.x-c.x,P.z-c.z))c=carp;return {x:c.x,z:c.z,n:L2('Ustalar','Craftsmen')};}
  if(top==='raw')return ZT(Z.cutIn);if(top==='rawwood')return ZT(Z.carIn);if(top==='block'||top==='beam')return ZT(Z.wall);
  if(R.thirsty)return ZT(Z.well);
  const c=COURSES[R.course];if(!c)return null;const need=c.t==='stone'?'block':'beam';if((R.bank[need]||0)>0)return ZT(Z.wall);
  if(c.t==='stone')return Z.cutOut.count>=2||(Z.cutOut.count>0&&Z.raw.count===0)?ZT(Z.cutOut):Z.cutIn.count>=Z.cutIn.max-2&&Z.cutOut.count>0?ZT(Z.cutOut):ZT(Z.raw);
  return Z.carOut.count>=2||(Z.carOut.count>0&&Z.rawWood.count===0)?ZT(Z.carOut):ZT(Z.rawWood);};
{const cb0=courseBeat;courseBeat=function(top,cap,take,give){
  if(top==='water'&&!R.thirsty&&inZ(Z.well)){while(stack[stack.length-1]==='water')stack.pop();sfx.pour();top=stack[stack.length-1];}
  cb0(top,cap,take,give);};}
/* ---------- T03-T05 extras ---------- */
{const cc0=cleanupChapter;cleanupChapter=function(){cc0();padEl.hidden=true;PADUI.p=null;flights.forEach(f=>{if(f.ghost)scene.remove(f.m);});flights.length=0;};}
/* ---------- result: say what opened ---------- */
{const sr0=showResult;showResult=function(n,s,first){sr0(n,s,first);const card=$('#kcard'),k=card&&card.querySelector('.kbtns');if(!k)return;
  const nx=n<NCH?CH[n+1]:null;const t=nx?L2('Sırada: ','Next: ')+nx.icon+' '+L2('Bölüm ','Chapter ')+(n+1)+' · '+nx.name:L2('Açıldı: 🫖 Hacılara Hizmet: hikâyeden sonra sınırsız mevsimler','Unlocked: 🫖 Serving the Pilgrims: endless seasons after the story');
  const d=document.createElement('p');d.className='knext';d.textContent=t;k.parentNode.insertBefore(d,k);};}
/* ---------- T17/T18: settings that do something ---------- */
const CTRL_HTML=()=>`<dl>${isTouch||DP.on?`<dt>${L2('Yürü','Walk')}</dt><dd>${DP.on?L2('Sol alttaki yön tuşları','The arrow pad, bottom left'):L2('Ekranın sol yarısında parmağını sürükle','Drag a finger on the left half of the screen')}</dd><dt>${L2('Kamera','Camera')}</dt><dd>${L2('Sağ yarıda sürükle','Drag on the right half')}</dd>`:`<dt>W A S D</dt><dd>${L2('Yürü (ok tuşları da olur)','Walk (arrow keys work too)')}</dd><dt>${L2('Fare','Mouse')}</dt><dd>${L2('Sürükle: kamerayı çevir · teker: yakınlaş','Drag: turn the camera · wheel: zoom')}</dd><dt>Esc</dt><dd>${L2('Duraklat','Pause')}</dd>`}
  <dt>${L2('Yükle / bırak','Load / drop')}</dt><dd>${L2('Renkli dairelerde dur; yük kendiliğinden alınır ya da bırakılır.','Stand in a coloured circle; loads are picked up or set down by themselves.')}</dd>
  <dt>${L2('Yükseltme','Upgrade')}</dt><dd>${L2('Altın daireye gel, kartta “Al”a dokun. Bereket kendiliğinden harcanmaz.','Step on a golden circle and tap “Buy” on the card. Bereket is never spent on its own.')}</dd>
  <dt>${L2('Ok','Arrow')}</dt><dd>${L2('Yerdeki sarı ok, elindekine göre sıradaki yeri gösterir.','The yellow ground arrow points to the next place for what you are holding.')}</dd></dl>`;
const ABOUT_HTML=()=>`<p><b>${NAME}</b> · ${L2('Mekke, M.S. 605','Mecca, 605 CE')}</p><p>${L2('Sel Kâbe\'nin duvarlarını yıkınca Kureyş onu helal kazançla yeniden yaptı. Sen isimsiz, kurgusal bir Mekkelisin.','When a flood broke the Kaaba\'s walls, Quraysh rebuilt it with lawfully earned wealth. You are a nameless, fictional Meccan.')}</p>
  <p>${L2('Efendimiz (s.a.v.) ve ashâbı hiçbir sahnede tasvir edilmez; yalnızca anlatılır.','The Prophet (peace be upon him) and his Companions are never depicted in any scene; they are only narrated.')}</p>
  <p>${L2('Kaynaklar: TDV İslâm Ansiklopedisi (Kâbe, Sikâye, Rifâde maddeleri), İbn Hişâm, es-Sîre. Oyundaki iş akışı, yükseltmeler ve sayılar oyun mekaniğidir.','Sources: TDV Encyclopedia of Islam (Kaaba, Siqaya, Rifada entries), Ibn Hisham, al-Sira. The work loop, upgrades and numbers are game mechanics.')}</p>
  <p style="margin:0">${L2('Açık kaynak: three.js r128 (MIT), Alegreya ve Alegreya Sans (SIL OFL 1.1).','Open source: three.js r128 (MIT), Alegreya and Alegreya Sans (SIL OFL 1.1).')}</p>`;
function extendSheet(){const g=document.getElementById('kset');if(!g||g.__x)return;g.__x=1;
  const mk=(id,txt,fn)=>{const b=document.createElement('button');b.id=id;b.textContent=txt();b.onclick=()=>{fn();b.textContent=txt();};g.appendChild(b);};
  mk('m-rm',()=>L2('Hareket: ','Motion: ')+(RM()?L2('Azaltılmış','Reduced'):L2('Normal','Normal')),()=>{D.rm=!D.rm;applyRM();ssave();});
  mk('m-vib',()=>L2('Titreşim: ','Vibration: ')+(D.novib?L2('Kapalı','Off'):L2('Açık','On')),()=>{D.novib=!D.novib;ssave();if(!D.novib)hap('heavy');});
  if(reduce)g.querySelector('#m-rm').disabled=true;}
function infoToggle(kind,e){const g=document.getElementById('kset');if(!g||!e.currentTarget.closest('#kset'))return;e.stopImmediatePropagation();e.preventDefault();
  let box=document.getElementById('kinfo');if(box&&box.dataset.k===kind){box.remove();return;}
  if(!box){box=document.createElement('div');box.id='kinfo';g.parentNode.insertBefore(box,g.nextSibling);}box.dataset.k=kind;box.innerHTML=kind==='c'?CTRL_HTML():ABOUT_HTML();box.scrollIntoView({block:'nearest'});}
{const c=$('#m-controls'),a=$('#m-about');if(c)c.addEventListener('click',e=>infoToggle('c',e),true);if(a)a.addEventListener('click',e=>infoToggle('a',e),true);}
/* ---------- back: Escape on the web, the system back button on Android ---------- */
function goBack(){
  if(!AN.hidden)return true;                                   // a cutscene owns the screen; its own skip button handles it
  if(!KS.hidden){const c=$('#kcard');const b=c&&c.querySelector('[data-back],#kp-go,#kset-ok,#ks-x,#kmore-x,#kr-map,#kf-map,#ke-ok');if(b){b.click();return true;}
    closeSheet();if(KM.hidden&&KT.hidden&&state!=='play')showMap();return true;}
  if(typeof overlay==='function'&&overlay()){closeOverlays();return true;}   // book / map first
  if(SITE.on&&state==='play'){const b=$('#b-menu');if(b)b.click();return true;}
  if(!KM.hidden){showTitle();return true;}
  if(!KT.hidden)return false;                                  // title: let the app close
  if(state==='play'){openMenu();return true;}
  return false;}
addEventListener('keydown',e=>{if(e.code!=='Escape'||MODE==='p2')return;if(!SITE.on&&KT.hidden&&KM.hidden&&KS.hidden)return;e.stopImmediatePropagation();e.preventDefault();goBack();},true);
try{const A=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.App;if(A&&A.addListener)A.addListener('backButton',()=>{if(!goBack()){try{if(SITE.on&&canSnap())saveRun();else ssave();}catch(_){}A.exitApp();}});}catch(_){}
/* ---------- WebGL context loss: save, explain, reload ---------- */
{const gl=el(`<div id="kglost" hidden role="alert"><div>${L2('Grafik sistemi yeniden başlatılıyor…','The graphics system is restarting…')}<br><small style="font-weight:600">${L2('İlerlemen kaydedildi.','Your progress is saved.')}</small></div></div>`);document.body.appendChild(gl);
  cv.addEventListener('webglcontextlost',e=>{e.preventDefault();try{saveRun()||ssave();}catch(_){}gl.hidden=false;resetInput();},false);
  cv.addEventListener('webglcontextrestored',()=>{try{sessionStorage.setItem('kabe-resume','1');}catch(_){}location.reload();},false);}
/* ---------- marker label never clips at the screen edge or sits on the pad ---------- */
updateMarker=function(){const t=(state==='play'||state==='card'||state==='dlg')?currentTarget():null;if(!t){if(!marker.hidden)marker.hidden=true;return;}
  marker.hidden=false;const y=height(t.x,t.z)+2.6;mvec.set(t.x,y,t.z).project(camera);
  setT(markerTxt,t.n+' · '+Math.round(Math.hypot(P.x-t.x,P.z-t.z))+' m');
  if(marker.__t!==markerTxt.textContent){marker.__t=markerTxt.textContent;marker.__hw=marker.offsetWidth/2||60;}
  const W=innerWidth,H=innerHeight,hw=Math.min(W/2-8,(marker.__hw||60)+10);let behind=mvec.z>1;let x=mvec.x,yy=mvec.y;if(behind){x=-x;yy=-yy;}
  const top=96,bot=H-((isTouch||DP.on)?190:90);
  let px=(x*.5+.5)*W,py=(-yy*.5+.5)*H;const off=behind||px<hw||px>W-hw||py<top||py>bot;
  px=Math.max(hw,Math.min(W-hw,px));py=Math.max(top,Math.min(bot,py));
  marker.style.transform=`translate(${Math.round(px)}px,${Math.round(py)}px) translate(-50%,-100%)`;marker.classList.toggle('edge',off);};
/* ---------- T20: HUD writes only what changed ---------- */
const NAMES_T={mud:L2('Çamur','Mud'),rubble:L2('Moloz','Rubble'),raw:L2('Ham taş','Raw stone'),block:L2('Kesme taş','Cut stone'),rawwood:L2('Tomruk','Timber'),beam:L2('Kiriş','Beam'),water:L2('Su','Water'),dates:L2('Hurma','Dates'),flour:L2('Un','Flour'),bread:L2('Ekmek','Bread')};
const hEl={bar:$('#chbar i'),st:$('#r-stone b'),co:$('#r-wood b'),gd:$('#r-good b'),kb:$('#r-kabe b')};
{const g=$('#r-good');if(g)g.title=L2('İyilik','Kindness');const s=$('#r-stone');if(s)s.title=L2('Taşıdığın / kapasite','Carrying / capacity');}
function actionLine(){const t=currentTarget();if(!t)return '';return (stack.length?L2('Götür: ','Take to: '):L2('Git: ','Go to: '))+t.n;}
function hudSite(dt){const n=R.ch,c=CH[n]||{};
  setT(qCh,(LANG==='en'?'CHAPTER ':'BÖLÜM ')+n+' · '+(c.name||''));let goal='',frac=0;
  if(n===1){goal=L2('Çamur: ','Mud: ')+R.n+'/'+c.goal;frac=R.n/c.goal;}
  else if(n===2){goal=L2('Moloz: ','Rubble: ')+R.n+'/'+c.goal;frac=R.n/c.goal;}
  else if(n===4){goal=L2('Kavga çıkmasın','Keep the peace');frac=Math.min(1,R.t/c.par);}
  else if(c.c0!=null){const cc=COURSES[R.course];let tot=0,dn=0;for(let i=c.c0;i<c.c1;i++){tot+=COURSES[i].n;if(i<R.course)dn+=COURSES[i].n;else if(i===R.course)dn+=R.inCourse;}frac=dn/tot;
    goal=cc?(cc.roof?L2('Çatı','Roof'):cc.door?L2('Kapı','Door'):(R.course+1)+(LANG==='en'?'. course':'. sıra'))+': '+R.inCourse+'/'+cc.n+' '+(cc.t==='stone'?L2('kesme taş','cut stones'):L2('kiriş','beams')):'';}
  setT(qGoal,goal);setW(hEl.bar,Math.round(Math.min(1,frac)*100)+'%');
  setT(qSub,R.thirsty?L2('Ustalar susadı: Zemzem\'den su götür','The craftsmen are thirsty: bring Zamzam water'):actionLine());
  const cap=hooks.cap?hooks.cap():D.cap,top=stack[stack.length-1];setT(hEl.st,(top?NAMES_T[top]+' ':'')+stack.length+'/'+cap);setT(hEl.co,String(D.coins));setT(hEl.gd,String(D.good));
  let done=0,tot=0;COURSES.forEach((cc,i)=>{tot+=cc.n;if(i<R.course)done+=cc.n;else if(i===R.course)done+=R.inCourse;});setT(hEl.kb,(n<3?0:Math.round(done/tot*100))+'%');
  if(!carryEl.hidden)carryEl.hidden=true;if(toastT>0){toastT-=dt;if(toastT<=0)toastEl.classList.remove('on');}}
updateHud=function(dt){if(!SITE.on){uh9(dt);return;}hudSite(dt);};
/* ---------- polish: loads fly between pile and arms ---------- */
const flights=[];const fv=new V3(),fw=new V3();
function nearZone(){let b=null,bd=5.5;for(const z of ZONES){if(!z.mesh.visible)continue;const d=Math.hypot(P.x-z.x,P.z-z.z);if(d<bd){bd=d;b=z;}}return b;}
function zonePt(z){const g=z.pileG;if(g&&g.visible){g.getWorldPosition(fw);fw.y+=.5;return fw.clone();}return new V3(z.x,height(z.x,z.z)+.4,z.z);}
{const sv0=stackVis;stackVis=function(){const before=stackG.children.length;
  if(stack.length<before&&SITE.on&&!RM()){const z=nearZone();const to=z?zonePt(z):null;
    for(let i=before-1;i>=stack.length;i--){const m=stackG.children[i];if(!to||flights.length>24){continue;}m.getWorldPosition(fv);stackG.remove(m);m.position.copy(fv);m.scale.setScalar(.8);scene.add(m);flights.push({m,ghost:true,t:0,d:.28,a:fv.clone(),b:to.clone()});}}
  sv0();const after=stackG.children.length;
  if(after!==before&&SITE.on&&state==='play'){hap();if(after===(hooks.cap?hooks.cap():D.cap)&&after>before)hap('heavy');}
  if(after>before&&SITE.on&&!RM()){const z=nearZone();if(z){const w=zonePt(z);
    for(let i=before;i<after;i++){const m=stackG.children[i];const a=stackG.worldToLocal(w.clone());flights.push({m,ghost:false,t:0,d:.22+(i-before)*.04,a,b:m.position.clone()});m.position.copy(a);}}}};}
function stepFlights(dt){for(let i=flights.length-1;i>=0;i--){const f=flights[i];f.t+=dt;const k=Math.min(1,f.t/f.d),e=k*k*(3-2*k);
    f.m.position.lerpVectors(f.a,f.b,e);f.m.position.y+=Math.sin(k*Math.PI)*.9;
    if(k>=1){if(f.ghost){scene.remove(f.m);puff(f.b.x,f.b.y-.3,f.b.z,2);}else f.m.position.copy(f.b);flights.splice(i,1);}}}
/* ---------- see the courses through the scaffold ---------- */
if(KP.scaffold&&KP.scaffold.material){const m=KP.scaffold.material;m.transparent=true;m.opacity=.55;m.depthWrite=false;m.needsUpdate=true;}
/* ---------- per-frame glue ---------- */
{const es0=extraStep;extraStep=function(dt){es0(dt);if(!SITE.on)return;stepFlights(Math.min(dt,.05));stepPadUI();
  if(canSnap()&&gameActive()){snapT+=dt;if(snapT>2){snapT=0;saveRun();}}else if(!canSnap()&&runDirty&&state!=='play'){ssave();}};}
/* ---------- cutscene objects: everything that existed before any cutscene is shared ---------- */
isSharedMat(null);
scene.traverse(o=>{if(o.geometry)SHARED_GEO.add(o.geometry);const ms=Array.isArray(o.material)?o.material:o.material?[o.material]:[];ms.forEach(m=>{SHARED_MATS.add(m);if(m.map)SHARED_MATS.add(m.map);});});
for(const g of [typeof stoneGeo!=='undefined'?stoneGeo:null,typeof plankGeo!=='undefined'?plankGeo:null,typeof sackGeo!=='undefined'?sackGeo:null])if(g)SHARED_GEO.add(g);
for(const k in mat){const m=mat[k];if(m&&m.map)SHARED_MATS.add(m.map);}
[blockMat,jugMat].forEach(m=>{if(m){SHARED_MATS.add(m);if(m.map)SHARED_MATS.add(m.map);}});
/* ---------- debug surface for tests ---------- */
Object.assign(window.__site,{startChapter,showStory,saveRun,resumeRun,snapRun,goBack,resetInput,siteTarget:()=>siteTarget(),gameActive,PADUI,buyPad,nearestPad,award,ssave,sload,cleanProfile,
  flights:()=>flights.length,FIRES:()=>FIRES.length,mem:()=>Object.assign({},renderer.info.memory),setStack:a=>{stack=a.slice();stackVis();},unload:()=>unload,
  zonesOf:()=>Object.fromEntries(Object.entries(Z).filter(([k,v])=>v&&v.mesh).map(([k,v])=>[k,{x:v.x,z:v.z,count:v.count,vis:v.mesh.visible}])),
  setP:(x,z)=>{P.x=x;P.z=z;P.y=height(x,z);},getP:()=>({x:P.x,z:P.z}),state:()=>state,hud:()=>({ch:qCh.textContent,goal:qGoal.textContent,sub:qSub.textContent,stone:hEl.st.textContent,coins:hEl.co.textContent}),
  marker:()=>({hidden:marker.hidden,t:markerTxt.textContent,r:marker.getBoundingClientRect().toJSON()})});
