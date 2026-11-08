/* ===================== Kâbe Taşları: block puzzle, level map, star-built Kâbe ===================== */
(function(){
const st=document.createElement('style');st.textContent=`
#hub,#puz{position:fixed;inset:0;z-index:7;display:flex;flex-direction:column;align-items:center;font-family:var(--f-ui)}
#hub{background:linear-gradient(180deg,rgba(20,16,12,.0) 30%,rgba(20,16,12,.55))}
#puz{background:radial-gradient(120% 90% at 50% 0%,#f6e7c8 0%,#e5cfa6 55%,#c9a978 100%)}
.hbar{width:min(520px,100%);box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 12px) max(16px,env(safe-area-inset-right,0px)) 8px max(16px,env(safe-area-inset-left,0px))}
.pill{display:flex;align-items:center;gap:6px;background:var(--panel);border-radius:999px;padding:6px 14px 6px 10px;font-weight:800;font-size:16px;box-shadow:0 4px 14px rgba(42,33,27,.18);font-variant-numeric:tabular-nums}
.pill .st{color:#e3a51f;font-size:20px;line-height:1}
.rb{border:0;border-radius:14px;background:var(--panel);width:46px;height:46px;font-size:22px;box-shadow:0 4px 14px rgba(42,33,27,.18);display:grid;place-items:center}
#lvlist{flex:1;width:min(520px,100%);overflow-y:auto;overscroll-behavior:contain;padding:10px 0 20px;position:relative;scrollbar-width:none}
#lvlist::-webkit-scrollbar{display:none}
.lvn{position:relative;margin:0 auto 18px;width:74px;height:74px;border-radius:50%;border:0;font:800 24px var(--f-display);color:#fff;background:radial-gradient(circle at 35% 30%,#3fa3ad,#1f6f78 60%,#16545b);box-shadow:0 6px 0 #0f3e43,0 10px 20px rgba(0,0,0,.25);display:grid;place-items:center}
.lvn.lock{background:radial-gradient(circle at 35% 30%,#b8ab98,#8a7c69);box-shadow:0 6px 0 #5f5446,0 10px 20px rgba(0,0,0,.2);color:#efe6d6}
.lvn.cur{animation:bob 1.4s ease-in-out infinite;background:radial-gradient(circle at 35% 30%,#f2c45a,#d39a2c 60%,#a8741a);box-shadow:0 6px 0 #7a5410,0 0 0 6px rgba(255,236,170,.6),0 10px 24px rgba(0,0,0,.3)}
.lvn .ss{position:absolute;bottom:-14px;left:50%;transform:translateX(-50%);font-size:15px;letter-spacing:-1px;color:#e3a51f;text-shadow:0 1px 0 #7a5410}
.lvn .ss i{font-style:normal;color:rgba(255,255,255,.55);text-shadow:none}
@keyframes bob{50%{transform:translateY(-6px)}}
.hfoot{width:min(520px,100%);box-sizing:border-box;padding:10px max(16px,env(safe-area-inset-right,0px)) calc(env(safe-area-inset-bottom,0px) + 14px) max(16px,env(safe-area-inset-left,0px));display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
.bigb{border:0;border-radius:18px;padding:10px 6px;font:800 15px var(--f-ui);color:#fff;background:linear-gradient(#3fa3ad,#1f6f78);box-shadow:0 5px 0 #0f3e43,0 8px 18px rgba(0,0,0,.25);min-height:58px;line-height:1.15}
.bigb small{display:block;font-size:12px;font-weight:700;opacity:.9}
.bigb.gold{background:linear-gradient(#f2c45a,#d39a2c);box-shadow:0 5px 0 #7a5410,0 8px 18px rgba(0,0,0,.25);color:#3a2608}
.bigb.gold.pulse{animation:pul 1s ease-in-out infinite}@keyframes pul{50%{transform:scale(1.05)}}
.bigb.dim{background:linear-gradient(#b8ab98,#8a7c69);box-shadow:0 5px 0 #5f5446}
.bigb:active{transform:translateY(3px)}
.buildbar{width:min(520px,100%);box-sizing:border-box;padding:0 16px}
.bbar{background:var(--panel);border-radius:16px;padding:8px 12px;box-shadow:0 4px 14px rgba(42,33,27,.18);font-size:13px;font-weight:700}
.bbar .tr{height:10px;border-radius:9px;background:rgba(42,33,27,.12);overflow:hidden;margin-top:5px}.bbar .tr i{display:block;height:100%;background:linear-gradient(90deg,#d39a2c,#f2c45a)}
#pzc{touch-action:none;display:block}
.pgoal{display:flex;gap:6px;align-items:center}
.gchip{display:flex;align-items:center;gap:5px;background:var(--panel);border-radius:12px;padding:5px 10px;font-weight:800;font-size:15px;box-shadow:0 3px 10px rgba(42,33,27,.15)}
.gchip canvas{width:22px;height:22px}
.gchip.done{background:#dff0d6}
#pzmsg{position:fixed;left:50%;top:38%;transform:translate(-50%,-50%);z-index:8;pointer-events:none;font:800 clamp(30px,8vw,46px) var(--f-display);color:#fff;-webkit-text-stroke:2px #7a4a12;text-shadow:0 4px 0 #7a4a12,0 8px 20px rgba(0,0,0,.35);opacity:0;white-space:nowrap}
#pzmsg.on{animation:msg 1s ease-out}@keyframes msg{0%{opacity:0;transform:translate(-50%,-30%) scale(.6)}20%{opacity:1;transform:translate(-50%,-50%) scale(1.1)}70%{opacity:1}100%{opacity:0;transform:translate(-50%,-70%) scale(1)}}
.pov{position:fixed;inset:0;z-index:9;background:rgba(30,22,14,.55);display:flex;align-items:center;justify-content:center;padding:16px}
.pbox{background:var(--panel);border-radius:24px;padding:22px 22px 18px;width:min(380px,100%);text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.35);animation:rise .35s ease-out}
.pbox h2{font:800 30px var(--f-display);margin:0 0 4px}.pbox p{margin:6px 0 14px;color:var(--ink-soft)}
.pstars{font-size:52px;letter-spacing:6px;margin:4px 0}.pstars span{display:inline-block;color:#d8cdbd}.pstars span.on{color:#e3a51f;animation:spop .45s ease-out both}
@keyframes spop{0%{transform:scale(0) rotate(-40deg)}70%{transform:scale(1.3)}100%{transform:scale(1)}}
.pbtns{display:flex;gap:8px;justify-content:center}.pbtns .bigb{flex:1;font-size:16px}
#hand{position:fixed;z-index:8;width:46px;height:46px;pointer-events:none;font-size:40px;transition:none}
`;document.head.appendChild(st);

/* ---------- state ---------- */
const SKEY='bekke-puz-v1';
let S={lv:1,stars:{},spent:0,step:0,best:0,seen:{}};
try{const s=JSON.parse(localStorage.getItem(SKEY)||'null');if(s)S=Object.assign(S,s);}catch(_){}
function psave(){try{localStorage.setItem(SKEY,JSON.stringify(S));}catch(_){}}
const totalStars=()=>Object.values(S.stars).reduce((a,b)=>a+b,0);
const freeStars=()=>totalStars()-S.spent;
/* ---------- the Kâbe, built with stars ---------- */
const BUILD=[
  {cost:6,k:{old:false,rubble:true,green:true,scaffold:true,wallH:0},cards:['o_yilan','o_temel'],t:L2('Yıkım ve temel','Demolition and foundation')},
  {cost:8,k:{wallH:1.6,green:false},cards:['o_helal'],t:L2('1. taş sırası','1st stone course')},
  {cost:10,k:{wallH:3.0},cards:['o_gemi'],t:L2('1. ahşap sırası','1st timber course')},
  {cost:10,k:{stone:true},cards:['o_hakem'],t:L2("Hacerü'l-Esved","The Black Stone"),note:true},
  {cost:12,k:{wallH:4.6,rubble:false},cards:['o_bolum'],t:L2('2. taş sırası','2nd stone course')},
  {cost:12,k:{wallH:6.0},cards:[],t:L2('2. ahşap sırası','2nd timber course')},
  {cost:14,k:{wallH:7.4},cards:[],t:L2('3. taş sırası','3rd stone course')},
  {cost:14,k:{wallH:8.7,roof:true},cards:['k_mizab'],t:L2('Çatı','The roof')},
  {cost:16,k:{door:true},cards:['k_kapi'],t:L2('Yükseltilmiş kapı','The raised door')},
  {cost:18,k:{hijr:true,scaffold:false},cards:['k_hicr'],t:L2('Hicr ve son','The Hijr, and the end')}];
function kState(step){let k={old:true,wallH:0,rubble:false,green:false,scaffold:false,roof:false,door:false,stone:false,hijr:false};for(let i=0;i<step;i++)k=Object.assign(k,BUILD[i].k);if(step>0)k.old=false;return k;}

/* ---------- tiles (cached, bevelled, textured) ---------- */
const KINDS={sand:['#e2c08a','#c9a46a'],granite:['#9b9a98','#7d7c7b'],rose:['#d9a08a','#bf8068'],ochre:['#e0a64a','#c0842c'],slate:['#7f93a3','#627688'],wood:['#b98552','#94653a'],mud:['#8a6a48','#6b5036'],green:['#5fb07a','#3d8a59']};
const TILE={};
function tileImg(kind,s){const key=kind+s;if(TILE[key])return TILE[key];const c=document.createElement('canvas');c.width=c.height=s;const g=c.getContext('2d');const [a,b]=KINDS[kind];const r=Math.max(3,s*.16);
  const rr=(x,y,w,h,rad)=>{g.beginPath();g.moveTo(x+rad,y);g.arcTo(x+w,y,x+w,y+h,rad);g.arcTo(x+w,y+h,x,y+h,rad);g.arcTo(x,y+h,x,y,rad);g.arcTo(x,y,x+w,y,rad);g.closePath();};
  rr(1,1,s-2,s-2,r);g.fillStyle=b;g.fill();
  const gr=g.createLinearGradient(0,0,s,s);gr.addColorStop(0,a);gr.addColorStop(1,b);rr(s*.06,s*.05,s*.88,s*.84,r*.85);g.fillStyle=gr;g.fill();
  g.save();rr(s*.06,s*.05,s*.88,s*.84,r*.85);g.clip();
  const R=mulberry32(kind.length*97+s);
  if(kind==='wood'){g.strokeStyle='rgba(70,40,18,.35)';g.lineWidth=Math.max(1,s*.025);for(let i=0;i<5;i++){const y=s*(.18+i*.16)+R()*s*.04;g.beginPath();g.moveTo(0,y);g.bezierCurveTo(s*.3,y+R()*s*.06,s*.6,y-R()*s*.06,s,y);g.stroke();}}
  else if(kind==='mud'){g.strokeStyle='rgba(40,26,14,.5)';g.lineWidth=Math.max(1,s*.03);for(let k=0;k<3;k++){let x=R()*s,y=R()*s;g.beginPath();g.moveTo(x,y);for(let i=0;i<5;i++){x+=(R()-.5)*s*.4;y+=(R()-.5)*s*.4;g.lineTo(x,y);}g.stroke();}}
  else{for(let i=0;i<s*1.6;i++){g.fillStyle=R()<.5?'rgba(255,255,255,.18)':'rgba(0,0,0,.16)';g.fillRect(R()*s,R()*s,Math.max(1,s*.025),Math.max(1,s*.025));}}
  const hl=g.createLinearGradient(0,0,0,s);hl.addColorStop(0,'rgba(255,255,255,.45)');hl.addColorStop(.35,'rgba(255,255,255,0)');g.fillStyle=hl;g.fillRect(0,0,s,s);g.restore();
  if(kind==='green'){g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.ellipse(s*.34,s*.3,s*.12,s*.07,-.5,0,7);g.fill();g.strokeStyle='rgba(255,255,220,.8)';g.lineWidth=s*.04;rr(s*.1,s*.09,s*.8,s*.76,r*.7);g.stroke();}
  TILE[key]=c;return c;}

/* ---------- shapes ---------- */
const SH=[[[0,0]],[[0,0],[0,1]],[[0,0],[1,0]],[[0,0],[0,1],[0,2]],[[0,0],[1,0],[2,0]],[[0,0],[0,1],[0,2],[0,3]],[[0,0],[1,0],[2,0],[3,0]],[[0,0],[0,1],[0,2],[0,3],[0,4]],[[0,0],[1,0],[2,0],[3,0],[4,0]],
  [[0,0],[0,1],[1,0],[1,1]],[[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]],[[0,0],[1,0],[1,1]],[[0,1],[1,0],[1,1]],[[0,0],[0,1],[1,0]],[[0,0],[0,1],[1,1]],
  [[0,0],[1,0],[2,0],[2,1]],[[0,1],[1,1],[2,1],[2,0]],[[0,0],[0,1],[1,0],[2,0]],[[0,0],[0,1],[1,1],[2,1]],[[0,0],[0,1],[0,2],[1,1]],[[1,0],[1,1],[1,2],[0,1]],[[0,0],[1,0],[1,1],[2,0]],[[0,1],[1,0],[1,1],[2,1]],
  [[0,0],[0,1],[1,1],[1,2]],[[0,1],[0,2],[1,0],[1,1]],[[0,0],[1,0],[2,0],[2,1],[2,2]],[[0,0],[0,1],[0,2],[1,0],[2,0]],[[0,2],[1,2],[2,0],[2,1],[2,2]],[[0,0],[0,1],[0,2],[1,2],[2,2]],[[0,0],[1,1]],[[0,1],[1,0]]];
const PKINDS=['sand','granite','rose','ochre','slate','wood'];

/* ---------- levels (deterministic) ---------- */
function levelDef(n){const R=mulberry32(n*7919+13);const type=n<=2?'lines':['lines','green','mud','lines','green','score','mud'][(n-3)%7];
  const tier=Math.min(1,(n-1)/55);
  const d={n,type,mud:[],green:[],seed:n*101};
  if(type==='lines')d.goal=2+Math.round(tier*10)+(n%3);
  if(type==='green'){d.goal=4+Math.round(tier*12);d.greenChance=.32;}
  if(type==='score')d.goal=180+Math.round(tier*900);
  if(type==='mud'){const cnt=6+Math.round(tier*16);const used=new Set();for(let i=0;i<cnt;i++){let r,c,k,t=0;do{r=(R()*8)|0;c=(R()*8)|0;k=r*8+c;t++;}while((used.has(k))&&t<50);used.add(k);d.mud.push([r,c]);}d.goal=d.mud.length;}
  if(type!=='mud'&&n>8){const cnt=Math.round(tier*8);for(let i=0;i<cnt;i++)d.mud.push([(R()*8)|0,(R()*8)|0]);}
  const base=type==='score'?d.goal:(type==='lines'?d.goal*26:type==='green'?d.goal*22:d.goal*14);d.t2=Math.round(base*1.35);d.t3=Math.round(base*1.8);
  d.hard=tier;return d;}
const NLV=60;

/* ---------- DOM ---------- */
const hub=document.createElement('div');hub.id='hub';hub.hidden=true;document.body.appendChild(hub);
const puz=document.createElement('div');puz.id='puz';puz.hidden=true;document.body.appendChild(puz);
const msgEl=document.createElement('div');msgEl.id='pzmsg';document.body.appendChild(msgEl);
function flash(t){msgEl.textContent=t;msgEl.classList.remove('on');void msgEl.offsetWidth;msgEl.classList.add('on');}
function nextBuild(){return BUILD[S.step];}
function renderHub(){
  const nb=nextBuild();const fs=freeStars();
  hub.innerHTML=`<div class="hbar"><button class="rb" id="h-menu" aria-label="${L2('Menü','Menu')}">≡</button><div class="pill"><span class="st">★</span><span>${fs}</span></div><button class="rb" id="h-book" aria-label="${L2('Defter','Notebook')}">📖</button></div>
  <div class="buildbar"><div class="bbar">${nb?L2('Sıradaki inşa: ','Next build: ')+'<b>'+nb.t+'</b> · ★'+nb.cost:L2('Kâbe tamamlandı. Serbest modda rekor kır!','The Kaaba is complete. Chase a record in Free mode!')}<div class="tr"><i style="width:${Math.round(S.step/BUILD.length*100)}%"></i></div></div></div>
  <div id="lvlist"></div>
  <div class="hfoot"><button class="bigb" id="h-story">${L2('Hikâye','Story')}<small>${L2('3D bölümler','3D chapters')}</small></button><button class="bigb gold${nb&&fs>=nb.cost?' pulse':nb?'':' dim'}" id="h-build">${L2('İnşa et','Build')}<small>${nb?'★'+nb.cost:'✓'}</small></button><button class="bigb" id="h-free">${L2('Serbest','Free play')}<small>${L2('Rekor: ','Best: ')+S.best}</small></button></div>`;
  const list=hub.querySelector('#lvlist');const cur=Math.min(S.lv,NLV);
  for(let n=NLV;n>=1;n--){const b=document.createElement('button');const st_=S.stars[n]||0;b.className='lvn'+(n>S.lv?' lock':n===cur&&!S.stars[n]?' cur':'');b.style.transform=`translateX(${Math.sin(n*.9)*90}px)`;
    b.innerHTML=n+(n<=S.lv&&S.stars[n]?`<span class="ss">${'★'.repeat(st_)}<i>${'★'.repeat(3-st_)}</i></span>`:'');b.setAttribute('aria-label',L2('Bölüm ','Level ')+n);
    if(n<=S.lv)b.addEventListener('click',()=>{sfx.ui();startLevel(n);});list.appendChild(b);if(n===cur)b.id='lv-cur';}
  requestAnimationFrame(()=>{const c=hub.querySelector('#lv-cur');if(c)c.scrollIntoView({block:'center'});});
  hub.querySelector('#h-menu').onclick=()=>{location.reload();};
  hub.querySelector('#h-book').onclick=()=>{state='play';openBook();state='hub';};
  hub.querySelector('#h-free').onclick=()=>{sfx.ui();startLevel(0);};
  hub.querySelector('#h-build').onclick=()=>{const nb=nextBuild();if(!nb)return;if(freeStars()<nb.cost){flash(L2('★ yetmiyor','Need more ★'));sfx.ui();return;}doBuild();};
  hub.querySelector('#h-story').onclick=storyMenu;}
function storyMenu(){const ov=document.createElement('div');ov.className='pov';ov.innerHTML=`<div class="pbox"><h2>${L2('Hikâye','Story')}</h2><p>${L2('Mekke\'de 3D olarak oynanan uzun bölümler.','Longer chapters played in 3D Mecca.')}</p>
  <div style="display:grid;gap:8px"><button class="bigb" id="s1">${L2("Kâbe'nin İnşası (605)","Building the Kaaba (605)")}</button><button class="bigb" id="s2">${L2('Fil Yılı (570)','The Year of the Elephant (570)')}</button><button class="bigb dim" id="s0">${L2('Kapat','Close')}</button></div></div>`;
  document.body.appendChild(ov);ov.querySelector('#s0').onclick=()=>ov.remove();
  ov.querySelector('#s1').onclick=()=>{ov.remove();hub.hidden=true;window.__storyGo=true;state='title';mStart.click();};
  ov.querySelector('#s2').onclick=()=>{try{localStorage.setItem('bekke-mode','p2');}catch(_){}location.reload();};}
function openHub(){auInit();musicStart();titleEl.hidden=true;hud.style.opacity=0;state='hub';kaaba(kState(S.step));RAIN.target=S.step===0?.6:0;flood.visible=S.step===0;setTime(S.step===0?'rain':S.step>=BUILD.length?'eve':'asr');
  renderHub();hub.hidden=false;puz.hidden=true;hideHand();window.__skip3D=false;
  if(!S.seen.intro){S.seen.intro=1;psave();setTimeout(()=>{showCard(L2('Mekke, yaklaşık 605','Mecca, around 605'),{t:L2('Kâbe Taşları','Stones of the Kaaba'),b:L2("Kış seli Kâbe'nin duvarlarını çatlattı. Kureyş onu yeniden yapacak; yalnız helal emekle. Bölümleri geçip yıldız topla, yıldızlarla Kâbe'yi sıra sıra yeniden yükselt.","A winter flood has cracked the Kaaba's walls. Quraysh will rebuild it, with halal labour only. Clear levels to earn stars, and use the stars to raise the Kaaba course by course."),c:[SRC.K]},L2('Başla','Start'),()=>{state='hub';});},400);}}
window.openHub=openHub;
function doBuild(){const nb=nextBuild();S.spent+=nb.cost;S.step++;psave();hub.hidden=true;sfx.build();
  const k=kState(S.step),from=KP.wallH,to=k.wallH;RAIN.target=0;flood.visible=false;
  kaaba(Object.assign({},k,{wallH:from}));const a=titleA;
  cine([{d:3.4,from:{p:new V3(Math.sin(a)*28,8,Math.cos(a)*28),l:new V3(0,from*.6+1,0)},to:{p:new V3(Math.sin(a+.7)*24,Math.max(9,to+5),Math.cos(a+.7)*24),l:new V3(0,to*.6+1,0)},sub:nb.t,
    upd:kk=>{const e=kk*kk*(3-2*kk);if(to>from)kaaba({wallH:from+(to-from)*e});if(Math.random()<.3){const an=Math.random()*6.28;puff(Math.cos(an)*8,KP.wallH,Math.sin(an)*8,2);}}}],
    ()=>{state='hub';kaaba(k);sparkle(0,KP.wallH+1,0,40);sfx.good();setTime(S.step>=BUILD.length?'eve':'asr');
      const cards=nb.cards.slice();const show=()=>{const id=cards.shift();if(!id){state='hub';renderHub();hub.hidden=false;if(S.step>=BUILD.length&&!S.seen.end){S.seen.end=1;psave();showCard(L2('Bitti','Complete'),{t:L2('Kâbe yükseldi','The Kaaba has risen'),b:L2('Bir sıra taş, bir sıra ahşap; çatı, yükseltilmiş kapı ve dışarıda kalan Hicr. Her yıldızın helal emekti. Serbest modda rekorunu kırmaya ya da hikâye bölümlerini oynamaya devam edebilirsin.','A course of stone, a course of timber; the roof, the raised door, and the Hijr left outside. Every star was halal labour. You can keep chasing records in Free mode or play the story chapters.'),c:[SRC.K,SRC.IH]},L2('Tamam','OK'),()=>{state='hub';});}return;}
        const e=CX[id];discover(id,true);showCard(L2('Hikâye','Story'),{t:e.t,b:e.b+(id==='o_hakem'?L2(' Bu oyunda Efendimiz (s.a.v.) tasvir edilmez; olay yalnızca anlatılır.',' The Prophet (pbuh) is not depicted in this game; the event is only narrated.'):''),c:e.c,est:e.est},L2('Devam','Continue'),()=>{show();});};show();});}

/* ---------- the puzzle ---------- */
let P_={};const NB=8;
puz.innerHTML=`<div class="hbar"><button class="rb" id="pz-back" aria-label="${L2('Geri','Back')}">‹</button><div class="pgoal" id="pz-goal"></div><div class="pill" id="pz-score">0</div></div><canvas id="pzc"></canvas>`;
const cvs=puz.querySelector('#pzc'),cx=cvs.getContext('2d');
let LAY={};
function layout(){const W=Math.min(innerWidth,520),top=puz.querySelector('.hbar').getBoundingClientRect().height;const H=innerHeight-top;
  const dpr=Math.min(2,devicePixelRatio||1);cvs.style.width=W+'px';cvs.style.height=H+'px';cvs.width=W*dpr;cvs.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0);
  const bs=Math.min(W-28,H*.62,480);const cell=Math.floor(bs/NB);const bw=cell*NB;LAY={W,H,cell,bx:(W-bw)/2,by:Math.max(10,(H-bw-cell*3.6)/2.6),bw,top,dpr};
  LAY.ty=LAY.by+bw+cell*.6;LAY.tcell=Math.floor(cell*.55);}
addEventListener('resize',()=>{if(!puz.hidden){layout();}});
function newBoard(){return Array.from({length:NB},()=>Array(NB).fill(null));}
function startLevel(n){const d=n?levelDef(n):{n:0,type:'endless',mud:[],green:[],goal:0};hub.hidden=true;puz.hidden=false;window.__skip3D=true;state='hub';
  P_={d,b:newBoard(),tray:[],score:0,shown:0,combo:0,streak:0,lines:0,greens:0,mud:d.mud.length,drag:null,fx:[],over:false,won:false,undo:null,undoLeft:n?1:0,clearing:[],shake:0,placed:0,R:mulberry32((d.seed||Date.now())|0)};
  for(const [r,c] of d.mud)P_.b[r][c]={k:'mud'};
  // avoid full lines at start
  for(let r=0;r<NB;r++)if(P_.b[r].every(x=>x))P_.b[r][0]=null;
  layout();refill();renderGoal();P_.t0=performance.now();
  if(n===1&&!S.seen.tut)showHand();}
function pieceFits(sh,b){for(let r=0;r<NB;r++)for(let c=0;c<NB;c++)if(canPlace(sh,r,c,b))return true;return false;}
function canPlace(sh,r,c,b){for(const [dr,dc] of sh){const rr=r+dr,cc=c+dc;if(rr<0||cc<0||rr>=NB||cc>=NB||b[rr][cc])return false;}return true;}
function fillRatio(){let n=0;for(const row of P_.b)for(const x of row)if(x)n++;return n/64;}
function genPiece(){const R=P_.R,fr=fillRatio(),hard=P_.d.hard||0;
  let pool=SH.map((s,i)=>i);const wt=i=>{const n=SH[i].length;if(fr>.55)return n<=3?3:n<=4?1:.3;return n===1?.4:n>=9?.5+hard:1;};
  let tot=pool.reduce((a,i)=>a+wt(i),0),x=R()*tot,pi=0;for(const i of pool){x-=wt(i);if(x<=0){pi=i;break;}}
  const sh=SH[pi].map(a=>a.slice());const kind=PKINDS[(R()*PKINDS.length)|0];const g=P_.d.type==='green'&&R()<P_.d.greenChance?(R()*sh.length)|0:-1;
  return {sh,kind,g,used:false};}
function refill(){for(let t=0;t<30;t++){P_.tray=[genPiece(),genPiece(),genPiece()];if(P_.tray.some(p=>pieceFits(p.sh,P_.b)))break;}P_.trayAnim=performance.now();checkOver();}
function trayPos(i){const W=LAY.W,slot=W/3;const p=P_.tray[i];const w=Math.max(...p.sh.map(a=>a[1]))+1,h=Math.max(...p.sh.map(a=>a[0]))+1;const s=LAY.tcell;
  return {x:slot*i+slot/2-w*s/2,y:LAY.ty+LAY.cell*1.5-h*s/2,s,w,h};}
function renderGoal(){const d=P_.d,el=puz.querySelector('#pz-goal');
  const chip=(kind,txt,done)=>`<div class="gchip${done?' done':''}"><canvas data-k="${kind}" width="44" height="44"></canvas>${txt}</div>`;
  let h='';if(d.type==='endless')h=`<div class="gchip">${L2('Serbest','Free')} · ${L2('Rekor ','Best ')}${S.best}</div>`;
  else{h+=`<div class="gchip">${L2('Bölüm ','Lv ')}${d.n}</div>`;
    if(d.type==='lines')h+=chip('granite',`${Math.min(P_.lines,d.goal)}/${d.goal}`,P_.lines>=d.goal);
    if(d.type==='green')h+=chip('green',`${Math.min(P_.greens,d.goal)}/${d.goal}`,P_.greens>=d.goal);
    if(d.type==='mud')h+=chip('mud',`${Math.max(0,P_.mud)}`,P_.mud<=0);
    if(d.type==='score')h+=`<div class="gchip${P_.score>=d.goal?' done':''}">★ ${Math.min(P_.score,d.goal)}/${d.goal}</div>`;}
  el.innerHTML=h;el.querySelectorAll('canvas').forEach(c=>{c.getContext('2d').drawImage(tileImg(c.dataset.k,44),0,0);});}
function goalDone(){const d=P_.d;return d.type==='lines'?P_.lines>=d.goal:d.type==='green'?P_.greens>=d.goal:d.type==='mud'?P_.mud<=0:d.type==='score'?P_.score>=d.goal:false;}
/* ---------- input ---------- */
function cellAt(x,y){return {c:Math.floor((x-LAY.bx)/LAY.cell),r:Math.floor((y-LAY.by)/LAY.cell)};}
cvs.addEventListener('pointerdown',e=>{if(P_.over||P_.won)return;auInit();const rc=cvs.getBoundingClientRect(),x=e.clientX-rc.left,y=e.clientY-rc.top;
  for(let i=0;i<3;i++){const p=P_.tray[i];if(!p||p.used)continue;const t=trayPos(i);if(x>t.x-20&&x<t.x+t.w*t.s+20&&y>t.y-30&&y<t.y+t.h*t.s+30){
    P_.drag={i,x,y,ox:x-t.x,oy:y-t.y,lift:isTouch?LAY.cell*2.1:LAY.cell*.6};try{cvs.setPointerCapture(e.pointerId);}catch(_){}hideHand();tone(HIC[7],.08,.03);break;}}});
cvs.addEventListener('pointermove',e=>{if(!P_.drag)return;const rc=cvs.getBoundingClientRect();P_.drag.x=e.clientX-rc.left;P_.drag.y=e.clientY-rc.top;});
cvs.addEventListener('pointerup',e=>{const d=P_.drag;if(!d)return;P_.drag=null;const g=dragGrid(d);if(g&&canPlace(P_.tray[d.i].sh,g.r,g.c,P_.b))place(d.i,g.r,g.c);});
cvs.addEventListener('pointercancel',()=>{P_.drag=null;});
function dragGrid(d){const p=P_.tray[d.i];const cs=LAY.cell;const x=d.x-cs*.5*(Math.max(...p.sh.map(a=>a[1]))+1)+cs*.5,y=d.y-d.lift-cs*.5*(Math.max(...p.sh.map(a=>a[0]))+1)+cs*.5;
  const g=cellAt(x,y);return g;}
/* ---------- placing and clearing ---------- */
function place(i,r,c){const p=P_.tray[i];P_.undo={b:P_.b.map(row=>row.slice()),tray:P_.tray.map(t=>({...t})),score:P_.score,lines:P_.lines,greens:P_.greens,mud:P_.mud,combo:P_.combo,streak:P_.streak};
  p.sh.forEach(([dr,dc],k)=>{P_.b[r+dr][c+dc]={k:k===p.g?'green':p.kind,g:k===p.g,pop:performance.now()};});p.used=true;P_.placed++;
  P_.score+=p.sh.length;sfx.thunk();buzz(8);
  const rows=[],cols=[];for(let k=0;k<NB;k++){if(P_.b[k].every(x=>x))rows.push(k);if(P_.b.every(row=>row[k]))cols.push(k);}
  const n=rows.length+cols.length;
  if(n){const set=new Set();rows.forEach(rr=>{for(let k=0;k<NB;k++)set.add(rr*8+k);});cols.forEach(cc=>{for(let k=0;k<NB;k++)set.add(k*8+cc);});
    P_.streak++;P_.combo=P_.streak>1?P_.streak-1:0;const gain=n*10*n+P_.combo*10*n;P_.score+=gain;P_.lines+=n;
    let gr=0,md=0;const now=performance.now();
    for(const key of set){const rr=key>>3,cc=key&7,cell=P_.b[rr][cc];if(!cell)continue;if(cell.g)gr++;if(cell.k==='mud')md++;P_.clearing.push({r:rr,c:cc,k:cell.k,t:now+((rr+cc)%8)*22});
      for(let q=0;q<4;q++)P_.fx.push({x:LAY.bx+(cc+.5)*LAY.cell,y:LAY.by+(rr+.5)*LAY.cell,vx:(Math.random()-.5)*260,vy:-Math.random()*260-60,life:.7+Math.random()*.3,col:cell.k==='green'?'#7fe0a0':KINDS[cell.k][0],s:3+Math.random()*4});
      P_.b[rr][cc]=null;}
    P_.greens+=gr;P_.mud-=md;P_.shake=Math.min(14,4+n*3+P_.combo*2);buzz([20,30,20]);
    [0,2,4,7,9].slice(0,Math.min(5,1+n+P_.combo)).forEach((k,ii)=>pluck(HIC[Math.min(11,k+P_.combo)],ii*.07,.07));nz(.4,180,.8,.2,'lowpass');
    P_.fx.push({txt:'+'+gain,x:LAY.bx+LAY.bw/2,y:LAY.by+LAY.bw/2,vx:0,vy:-60,life:1.1,big:true});
    const words=L2('Güzel!|Harika!|Muhteşem!|Maşallah!|Efsane!','Nice!|Great!|Amazing!|Masha\'Allah!|Legendary!').split('|');if(n>=2||P_.combo>=1)flash(words[Math.min(words.length-1,n-1+P_.combo)]);
    if(gr)sfx.page();}
  else{P_.streak=0;P_.combo=0;}
  renderGoal();
  if(P_.d.type!=='endless'&&goalDone()){setTimeout(win,650);return;}
  if(P_.tray.every(t=>t.used))setTimeout(refill,180);else checkOver();}
function checkOver(){if(P_.won)return;const left=P_.tray.filter(t=>!t.used);if(left.length&&!left.some(t=>pieceFits(t.sh,P_.b))){P_.over=true;setTimeout(lose,500);}}
function win(){if(P_.won)return;P_.won=true;const d=P_.d;const stars=P_.score>=d.t3?3:P_.score>=d.t2?2:1;const prev=S.stars[d.n]||0;if(stars>prev)S.stars[d.n]=stars;if(d.n>=S.lv)S.lv=Math.min(NLV,d.n+1);if(d.n===1)S.seen.tut=1;psave();
  sfx.good();setTimeout(()=>sfx.build(),300);
  const ov=document.createElement('div');ov.className='pov';ov.innerHTML=`<div class="pbox"><h2>${L2('Tamamlandı!','Complete!')}</h2><div class="pstars">${[1,2,3].map(i=>`<span class="${i<=stars?'on':''}" style="animation-delay:${i*.18}s">★</span>`).join('')}</div><p>${L2('Puan','Score')}: <b>${P_.score}</b>${stars>prev?' · +'+(stars-prev)+'★':''}</p><div class="pbtns"><button class="bigb dim" id="w-map">${L2('Harita','Map')}</button>${d.n<NLV?`<button class="bigb gold" id="w-next">${L2('Sonraki','Next')}</button>`:''}</div></div>`;
  document.body.appendChild(ov);ov.querySelector('#w-map').onclick=()=>{ov.remove();backToHub();};const nx=ov.querySelector('#w-next');if(nx)nx.onclick=()=>{ov.remove();startLevel(d.n+1);};}
function lose(){const d=P_.d;sfx.land(1);tone(110,.6,.06);
  if(d.type==='endless'){const nb=P_.score>S.best;if(nb){S.best=P_.score;psave();}
    const ov=document.createElement('div');ov.className='pov';ov.innerHTML=`<div class="pbox"><h2>${nb?L2('Yeni rekor!','New record!'):L2('Yer kalmadı','No room left')}</h2><p>${L2('Puan','Score')}: <b style="font-size:28px">${P_.score}</b><br>${L2('Rekor','Best')}: ${S.best}</p><div class="pbtns"><button class="bigb dim" id="l-map">${L2('Harita','Map')}</button><button class="bigb gold" id="l-re">${L2('Tekrar','Again')}</button></div></div>`;
    document.body.appendChild(ov);ov.querySelector('#l-map').onclick=()=>{ov.remove();backToHub();};ov.querySelector('#l-re').onclick=()=>{ov.remove();startLevel(0);};return;}
  const ov=document.createElement('div');ov.className='pov';ov.innerHTML=`<div class="pbox"><h2>${L2('Yer kalmadı','No room left')}</h2><p>${L2('Hiçbir taş sığmıyor.','No stone fits.')}</p><div class="pbtns">${P_.undoLeft?`<button class="bigb gold" id="l-undo">${L2('Geri al','Undo')}<small>${L2('1 hak','1 left')}</small></button>`:''}<button class="bigb" id="l-re">${L2('Tekrar dene','Try again')}</button><button class="bigb dim" id="l-map">${L2('Harita','Map')}</button></div></div>`;
  document.body.appendChild(ov);ov.querySelector('#l-map').onclick=()=>{ov.remove();backToHub();};ov.querySelector('#l-re').onclick=()=>{ov.remove();startLevel(d.n);};
  const u=ov.querySelector('#l-undo');if(u)u.onclick=()=>{ov.remove();const U=P_.undo;Object.assign(P_,{b:U.b,tray:U.tray,score:U.score,lines:U.lines,greens:U.greens,mud:U.mud,combo:U.combo,streak:U.streak,over:false,undoLeft:0});
    // a mercy: replace the tray with small pieces
    P_.tray=P_.tray.map(t=>t.used?t:{sh:[[0,0]],kind:t.kind,g:-1,used:false});renderGoal();};}
function backToHub(){puz.hidden=true;window.__skip3D=false;renderHub();hub.hidden=false;state='hub';}
puz.querySelector('#pz-back').onclick=()=>{sfx.ui();backToHub();};
/* ---------- tutorial hand ---------- */
let handEl=null,handT=0;
function showHand(){handEl=document.createElement('div');handEl.id='hand';handEl.textContent='👆';document.body.appendChild(handEl);handT=performance.now();
  flash(L2('Taşı sürükle!','Drag a stone!'));}
function hideHand(){if(handEl){handEl.remove();handEl=null;}}
/* ---------- drawing ---------- */
let lastT=performance.now();
function drawPuz(now){const dt=Math.min(.05,(now-lastT)/1000);lastT=now;if(puz.hidden)return;const L=LAY,g=cx,cs=L.cell;
  g.clearRect(0,0,L.W,L.H);g.save();if(P_.shake>0){g.translate((Math.random()-.5)*P_.shake,(Math.random()-.5)*P_.shake);P_.shake*=.86;if(P_.shake<.3)P_.shake=0;}
  // board frame: carved wood around a mortar bed
  g.fillStyle='#6b4527';rnd(g,L.bx-12,L.by-12,L.bw+24,L.bw+24,18);g.fill();g.fillStyle='#8a5c34';rnd(g,L.bx-8,L.by-8,L.bw+16,L.bw+16,14);g.fill();
  g.fillStyle='#4a3a2c';rnd(g,L.bx-3,L.by-3,L.bw+6,L.bw+6,10);g.fill();
  for(let r=0;r<NB;r++)for(let c=0;c<NB;c++){g.fillStyle=(r+c)%2?'#5a4836':'#554332';rnd(g,L.bx+c*cs+1.5,L.by+r*cs+1.5,cs-3,cs-3,cs*.14);g.fill();}
  // preview of the dragged piece
  let prev=null,lines=null;if(P_.drag){const d=P_.drag,p=P_.tray[d.i],gp=dragGrid(d);if(gp&&canPlace(p.sh,gp.r,gp.c,P_.b)){prev={p,gp};
      const tb=P_.b.map(row=>row.slice());p.sh.forEach(([dr,dc])=>tb[gp.r+dr][gp.c+dc]={k:p.kind});lines={rows:[],cols:[]};for(let k=0;k<NB;k++){if(tb[k].every(x=>x))lines.rows.push(k);if(tb.every(row=>row[k]))lines.cols.push(k);}}}
  // cells
  for(let r=0;r<NB;r++)for(let c=0;c<NB;c++){const cell=P_.b[r][c];if(!cell)continue;let s=1;if(cell.pop){const t=(now-cell.pop)/180;if(t<1)s=.7+.3*Math.sin(t*Math.PI*.5)+(.12*Math.sin(t*Math.PI));else cell.pop=0;}
    const hl=lines&&(lines.rows.includes(r)||lines.cols.includes(c));drawCell(g,L.bx+c*cs,L.by+r*cs,cs,cell.k,s,1);if(hl){g.fillStyle='rgba(255,236,170,.45)';rnd(g,L.bx+c*cs+2,L.by+r*cs+2,cs-4,cs-4,cs*.16);g.fill();}}
  if(prev){prev.p.sh.forEach(([dr,dc],k)=>{drawCell(g,L.bx+(prev.gp.c+dc)*cs,L.by+(prev.gp.r+dr)*cs,cs,k===prev.p.g?'green':prev.p.kind,1,.38);});
    if(lines)for(const rr of lines.rows){g.fillStyle='rgba(255,230,140,.28)';g.fillRect(L.bx,L.by+rr*cs,L.bw,cs);}if(lines)for(const cc of lines.cols){g.fillStyle='rgba(255,230,140,.28)';g.fillRect(L.bx+cc*cs,L.by,cs,L.bw);}}
  // clearing animation
  P_.clearing=P_.clearing.filter(q=>{const t=(now-q.t)/260;if(t<0){drawCell(g,L.bx+q.c*cs,L.by+q.r*cs,cs,q.k,1,1);return true;}if(t>1)return false;
    g.save();g.globalAlpha=1-t;drawCell(g,L.bx+q.c*cs,L.by+q.r*cs,cs,q.k,1+t*.35,1);g.globalCompositeOperation='lighter';g.fillStyle=`rgba(255,240,190,${(1-t)*.8})`;rnd(g,L.bx+q.c*cs,L.by+q.r*cs,cs,cs,cs*.16);g.fill();g.restore();return true;});
  // tray
  for(let i=0;i<3;i++){const p=P_.tray[i];if(!p||p.used)continue;if(P_.drag&&P_.drag.i===i)continue;const t=trayPos(i);const fits=pieceFits(p.sh,P_.b);const ap=Math.min(1,(now-(P_.trayAnim||0))/260);
    p.sh.forEach(([dr,dc],k)=>drawCell(g,t.x+dc*t.s,t.y+dr*t.s+(1-ap)*40,t.s,k===p.g?'green':p.kind,ap,fits?1:.35));}
  if(P_.drag){const d=P_.drag,p=P_.tray[d.i];const w=Math.max(...p.sh.map(a=>a[1]))+1,h=Math.max(...p.sh.map(a=>a[0]))+1;const ox=d.x-w*cs/2,oy=d.y-d.lift-h*cs/2;
    g.save();g.shadowColor='rgba(0,0,0,.35)';g.shadowBlur=14;g.shadowOffsetY=8;p.sh.forEach(([dr,dc],k)=>drawCell(g,ox+dc*cs,oy+dr*cs,cs,k===p.g?'green':p.kind,1.04,1));g.restore();}
  // particles and floating text
  P_.fx=P_.fx.filter(f=>{f.life-=dt;if(f.life<=0)return false;f.x+=f.vx*dt;f.y+=f.vy*dt;if(!f.txt){f.vy+=700*dt;g.fillStyle=f.col;g.globalAlpha=Math.min(1,f.life*2);g.fillRect(f.x,f.y,f.s,f.s);g.globalAlpha=1;}
    else{g.globalAlpha=Math.min(1,f.life*1.5);g.font=`800 ${f.big?34:20}px Alegreya,Georgia,serif`;g.textAlign='center';g.lineWidth=5;g.strokeStyle='#7a4a12';g.strokeText(f.txt,f.x,f.y);g.fillStyle='#fff3c8';g.fillText(f.txt,f.x,f.y);g.globalAlpha=1;}return true;});
  // score count-up
  if(P_.shown<P_.score)P_.shown=Math.min(P_.score,P_.shown+Math.max(1,Math.ceil((P_.score-P_.shown)*.15)));puz.querySelector('#pz-score').textContent=P_.shown;
  // star meter under the tray
  if(P_.d.type!=='endless'){const y=L.ty+cs*3.15,w=L.bw,x=L.bx,k=Math.min(1,P_.score/P_.d.t3);g.fillStyle='rgba(42,33,27,.18)';rnd(g,x,y,w,10,5);g.fill();g.fillStyle='#e3a51f';rnd(g,x,y,Math.max(10,w*k),10,5);g.fill();
    for(const [t,lab] of [[P_.d.t2,'★★'],[P_.d.t3,'★★★']]){const px=x+w*Math.min(1,t/P_.d.t3);g.fillStyle=P_.score>=t?'#e3a51f':'#8a7c69';g.font='800 13px Alegreya Sans,sans-serif';g.textAlign='center';g.fillText(lab,Math.min(px,x+w-14),y+26);}}
  g.restore();
  if(handEl){const t=((now-handT)/1600)%1;const p=P_.tray[0];if(p&&!p.used){const tp=trayPos(0),rc=cvs.getBoundingClientRect();const sx=rc.left+tp.x+tp.w*tp.s/2,sy=rc.top+tp.y+tp.h*tp.s/2,ex=rc.left+L.bx+L.bw/2,ey=rc.top+L.by+L.bw/2;const e=t<.15?0:t>.85?1:(t-.15)/.7;
    handEl.style.transform=`translate(${sx+(ex-sx)*e-10}px,${sy+(ey-sy)*e}px)`;handEl.style.opacity=t>.9?0:1;}}
}
function rnd(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function drawCell(g,x,y,s,kind,scale,alpha){const img=tileImg(kind,Math.round(s*LAY.dpr));const sc=scale||1;g.globalAlpha=alpha==null?1:alpha;const w=s*sc,o=(s-w)/2;g.drawImage(img,x+o,y+o,w,w);g.globalAlpha=1;}
(function tick(now){drawPuz(now);const on=!hub.hidden||!puz.hidden;if(on)marker.hidden=true;labelsEl.style.display=on?'none':'';requestAnimationFrame(tick);})(performance.now());
window.__puz={startLevel,levelDef,S:()=>S,P:()=>P_,place:(i,r,c)=>{if(canPlace(P_.tray[i].sh,r,c,P_.b)){place(i,r,c);return true;}return false;},canPlace,openHub,doBuild,setStars:n=>{S.stars={};for(let i=1;i<=n;i++)S.stars[i]=3;S.lv=n+1;psave();}};
})();
