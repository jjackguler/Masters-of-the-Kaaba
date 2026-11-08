/* ===================== Kâbe Ustaları — site core (l9), clips (l10), chapters + UI (l11) share one scope ===================== */
const SITE={on:false};
(function(){
const NAME=L2('Kâbe Ustaları','Kaaba Builders');
const st=document.createElement('style');st.textContent=`
#anim{position:fixed;inset:0;z-index:5;pointer-events:none}
#anim canvas{position:absolute;inset:0;width:100%;height:100%}
.bub{position:absolute;max-width:min(86vw,460px);background:#fffaf0;color:#1c140e;border:3px solid #1c140e;border-radius:20px;padding:10px 16px;font:700 clamp(16px,4vw,20px)/1.4 var(--f-ui);box-shadow:5px 5px 0 rgba(28,20,14,.85);animation:bpop .3s cubic-bezier(.2,1.6,.4,1) both}
.bub b{display:block;font:800 12px var(--f-ui);letter-spacing:.12em;text-transform:uppercase;color:#b5523b;margin-bottom:2px}
.bub.nar{background:rgba(22,16,11,.92);color:#fff6e0;border:2px solid rgba(255,246,224,.85);box-shadow:0 8px 24px rgba(0,0,0,.45);font:600 clamp(17px,4.3vw,22px)/1.42 var(--f-display);text-align:center}
.bub.nar b{color:#f2c45a}
@keyframes bpop{0%{opacity:0;transform:var(--tx,none) scale(.6)}100%{opacity:1;transform:var(--tx,none)}}
.impact{position:absolute;left:50%;top:40%;transform:translate(-50%,-50%) rotate(-6deg);font:900 clamp(46px,13vw,110px) var(--f-display);color:#fff;-webkit-text-stroke:4px #1c140e;text-shadow:7px 7px 0 #b5523b;animation:imp 1.1s ease-out both;white-space:nowrap}
@keyframes imp{0%{opacity:0;transform:translate(-50%,-50%) rotate(-6deg) scale(2.4)}18%{opacity:1;transform:translate(-50%,-50%) rotate(-6deg) scale(.95)}78%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) rotate(-6deg) scale(1.05)}}
.ctitle{position:absolute;left:0;right:0;top:42%;transform:translateY(-50%);text-align:center;color:#fff6e0;font:800 clamp(34px,9vw,68px)/1.05 var(--f-display);text-shadow:0 4px 24px rgba(0,0,0,.7);animation:ctin 3.4s ease both;padding:0 16px}
.ctitle small{display:block;font:800 13px var(--f-ui);letter-spacing:.3em;color:#f2c45a;text-transform:uppercase;margin-bottom:8px}
@keyframes ctin{0%{opacity:0;transform:translateY(-50%) scale(1.08)}20%{opacity:1;transform:translateY(-50%) scale(1)}82%{opacity:1}100%{opacity:0}}
.skipb{position:fixed;right:14px;top:calc(env(safe-area-inset-top,0px) + 14px);z-index:9;border:0;border-radius:999px;background:rgba(255,246,224,.9);color:#2a211b;font:800 14px var(--f-ui);padding:9px 16px;pointer-events:auto;box-shadow:0 4px 14px rgba(0,0,0,.25)}
.coinfly{position:fixed;z-index:6;width:22px;height:22px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffe9a0,#e3a51f 60%,#a8741a);box-shadow:0 2px 4px rgba(0,0,0,.3);pointer-events:none;transition:transform .55s cubic-bezier(.5,-.3,.7,1),opacity .55s}
.ftx{position:fixed;z-index:6;pointer-events:none;font:900 22px var(--f-ui);color:#fff;-webkit-text-stroke:1.5px rgba(42,33,27,.85);text-shadow:0 3px 0 rgba(42,33,27,.5);transform:translate(-50%,-50%);animation:ftx 1.1s ease-out both;white-space:nowrap}
@keyframes ftx{0%{opacity:0;transform:translate(-50%,-30%) scale(.6)}15%{opacity:1;transform:translate(-50%,-60%) scale(1.15)}100%{opacity:0;transform:translate(-50%,-260%) scale(1)}}
`;document.head.appendChild(st);
const AN=document.createElement('div');AN.id='anim';AN.hidden=true;AN.innerHTML='<canvas></canvas>';document.body.appendChild(AN);
const acv=AN.querySelector('canvas'),actx=acv.getContext('2d');let animFx={speed:0,flash:0,flashCol:'#fff',shake:0,tint:null,vig:0};
const skipB=document.createElement('button');skipB.className='skipb';skipB.hidden=true;skipB.textContent=L2('Geç ››','Skip ››');document.body.appendChild(skipB);
let cineSkip=false;
function skipClip(){const orig=CINE;let n=0;cineSkip=true;try{while(CINE&&CINE===orig&&n++<40){const s=CINE.steps[CINE.i];if(!s)break;CINE.t=s.d;stepCine(0);}}finally{cineSkip=false;}}
skipB.onclick=e=>{e.stopPropagation();skipClip();};
/* ---------- anime cutscene system on top of cine() ---------- */
function clearAnimDom(){AN.querySelectorAll('.bub,.impact,.ctitle').forEach(e=>e.remove());}
const BPOS={tl:'left:4%;top:13%',tr:'right:4%;top:13%',bl:'left:4%;bottom:15%',br:'right:4%;bottom:15%',tc:'left:50%;top:13%;--tx:translateX(-50%);transform:translateX(-50%)',bc:'left:50%;bottom:13%;--tx:translateX(-50%);transform:translateX(-50%);width:min(86vw,520px)',mc:'left:50%;top:50%;--tx:translate(-50%,-50%);transform:translate(-50%,-50%)'};
function bubble(b){const d=document.createElement('div');d.className='bub'+(b.nar?' nar':'');d.innerHTML=(b.who?'<b>'+b.who+'</b>':'')+b.t;
  d.setAttribute('style',BPOS[b.at||(b.nar?'bc':'tl')]+(b.delay?';animation-delay:'+b.delay+'s':''));AN.appendChild(d);}
function readTime(s){let n=0;(s.bubbles||[]).forEach(b=>n+=b.t.length+(b.delay||0)*16);return n?1.4+n/19:0;}
function anime(shots,done){AN.hidden=false;skipB.hidden=false;const steps=shots.map(s=>({d:Math.max(s.d,readTime(s)),from:s.from,to:s.to,sub:'',
  start:()=>{clearAnimDom();animFx.speed=s.speed||0;animFx.tint=s.tint||null;animFx.vig=s.vig||0;if(s.flash){animFx.flash=.7;animFx.flashCol=s.flash;}if(s.shake)animFx.shake=s.shake;
    if(!cineSkip){(s.bubbles||[]).forEach(bubble);if(s.impact){const d=document.createElement('div');d.className='impact';d.textContent=s.impact;AN.appendChild(d);}
    if(s.title){const d=document.createElement('div');d.className='ctitle';d.innerHTML=(s.title[0]?'<small>'+s.title[0]+'</small>':'')+s.title[1];AN.appendChild(d);}
    if(s.sfx)s.sfx();}if(s.start)s.start();},
  upd:(k,dt)=>{if(s.upd)s.upd(k,dt);}}));
  cine(steps,()=>{AN.hidden=true;skipB.hidden=true;clearAnimDom();animFx.speed=0;animFx.shake=0;animFx.tint=null;animFx.vig=0;if(done)done();});}
function drawAnim(){if(AN.hidden)return;const W=innerWidth,H=innerHeight;if(acv.width!==W||acv.height!==H){acv.width=W;acv.height=H;}const g=actx;g.clearRect(0,0,W,H);
  if(animFx.tint){g.fillStyle=animFx.tint;g.fillRect(0,0,W,H);}
  if(animFx.vig){const gr=g.createRadialGradient(W/2,H/2,Math.min(W,H)*.25,W/2,H/2,Math.max(W,H)*.7);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,`rgba(0,0,0,${animFx.vig})`);g.fillStyle=gr;g.fillRect(0,0,W,H);}
  if(animFx.speed>0){g.save();g.translate(W/2,H/2);const n=80;for(let i=0;i<n;i++){const a=Math.random()*6.283,r0=Math.min(W,H)*(.34+Math.random()*.18),r1=Math.max(W,H)*.9;
      g.strokeStyle=`rgba(255,255,255,${.35*animFx.speed*Math.random()})`;g.lineWidth=1+Math.random()*3;g.beginPath();g.moveTo(Math.cos(a)*r0,Math.sin(a)*r0);g.lineTo(Math.cos(a)*r1,Math.sin(a)*r1);g.stroke();}g.restore();}
  if(animFx.flash>0){g.globalAlpha=animFx.flash;g.fillStyle=animFx.flashCol;g.fillRect(0,0,W,H);g.globalAlpha=1;animFx.flash=Math.max(0,animFx.flash-.08);}
  if(animFx.shake>0){camera.position.x+=(Math.random()-.5)*animFx.shake;camera.position.y+=(Math.random()-.5)*animFx.shake;animFx.shake*=.92;if(animFx.shake<.01)animFx.shake=0;}}
/* ---------- juice: floating text, coins ---------- */
function scr(wx,wy,wz){const v=new V3(wx,wy,wz).project(camera);return {x:(v.x*.5+.5)*innerWidth,y:(-v.y*.5+.5)*innerHeight,ok:v.z<1};}
function ftext(t,wx,wy,wz,col){const s=scr(wx,wy,wz);if(!s.ok)return;const d=document.createElement('div');d.className='ftx';d.textContent=t;d.style.left=s.x+'px';d.style.top=s.y+'px';if(col)d.style.color=col;document.body.appendChild(d);setTimeout(()=>d.remove(),1150);}
function coinsFly(n,wx,wy,wz){const s=scr(wx,wy,wz);const tgt=$('#r-wood').getBoundingClientRect();
  for(let i=0;i<Math.min(6,n);i++){const c=document.createElement('div');c.className='coinfly';c.style.left=s.x+'px';c.style.top=s.y+'px';document.body.appendChild(c);
    setTimeout(()=>{c.style.transform=`translate(${tgt.left-s.x+10}px,${tgt.top-s.y+4}px) scale(.7)`;c.style.opacity=.2;},20+i*60);setTimeout(()=>c.remove(),700+i*60);}
  setTimeout(()=>{pop('r-wood');tone(HIC[9]*2,.08,.03);},500);}
/* ---------- the ground arrow that always points to the next job ---------- */
const arrowG=new THREE.Group();{const sh=new THREE.Shape();sh.moveTo(0,.55);sh.lineTo(.42,.05);sh.lineTo(.2,.05);sh.lineTo(.2,-.4);sh.lineTo(-.2,-.4);sh.lineTo(-.2,.05);sh.lineTo(-.42,.05);sh.lineTo(0,.55);
  const m=new THREE.Mesh(new THREE.ShapeGeometry(sh),new THREE.MeshBasicMaterial({color:0xffd75e,transparent:true,opacity:.95,depthWrite:false}));m.rotation.x=-Math.PI/2;m.renderOrder=3;
  const o=new THREE.Mesh(new THREE.ShapeGeometry(sh),new THREE.MeshBasicMaterial({color:0x5a3a10,transparent:true,opacity:.55,depthWrite:false}));o.rotation.x=-Math.PI/2;o.scale.setScalar(1.18);o.position.y=-.01;o.renderOrder=2;
  arrowG.add(o,m);scene.add(arrowG);arrowG.visible=false;}
function stepArrow(t){if(!SITE.on||state!=='play'||!t){arrowG.visible=false;return;}const dx=t.x-P.x,dz=t.z-P.z,d=Math.hypot(dx,dz);if(d<3.2){arrowG.visible=false;return;}
  arrowG.visible=true;const bob=(typeof RM==='function'&&RM())?0:1;const k=1.6+Math.sin(clock*6)*.15*bob;arrowG.position.set(P.x+dx/d*k,P.y+.08,P.z+dz/d*k);arrowG.rotation.y=Math.atan2(dx,dz)+Math.PI;arrowG.scale.setScalar(1+Math.sin(clock*6)*.06*bob);}

/* ---------- site data ---------- */
const COURSES=[{t:'stone',n:12,h:1.6},{t:'wood',n:8,h:3.0},{t:'stone',n:14,h:4.6},{t:'wood',n:10,h:6.0},{t:'stone',n:16,h:7.4},{t:'wood',n:10,h:8.7,roof:true},{t:'wood',n:6,door:true}];
function wallAt(course,inC){if(course>=COURSES.length)return 8.7;const base=course>0?COURSES[course-1].h:0,c=COURSES[course],to=c.h||base;return base+(to-base)*Math.min(1,inC/c.n);}
const SKEY='kabe-ustalari-v1';
let D={unl:1,stars:{},best:{},coins:0,good:0,cap:4,up:{},tut:0,last:1};
let R={ch:0,t:0,done:false};// the chapter being played
let stack=[];
const ZONES=[];
function padTex(icon,label,col){const c=document.createElement('canvas');c.width=256;c.height=256;const g=c.getContext('2d');
  g.fillStyle=col;g.globalAlpha=.9;g.beginPath();g.arc(128,128,120,0,7);g.fill();g.globalAlpha=1;g.lineWidth=10;g.strokeStyle='#fff8e6';g.setLineDash([22,14]);g.beginPath();g.arc(128,128,108,0,7);g.stroke();
  g.font='92px serif';g.textAlign='center';g.textBaseline='middle';g.fillText(icon,128,110);g.font='800 30px "Alegreya Sans",sans-serif';g.fillStyle='#fff';g.fillText(label,128,196);const t=new THREE.CanvasTexture(c);return t;}
function zone(o){const r=o.r||2.2;const m=new THREE.Mesh(new THREE.CircleGeometry(r,40),new THREE.MeshBasicMaterial({map:padTex(o.icon,o.label,o.col||'#1f6f78'),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4}));
  m.rotation.x=-Math.PI/2;m.position.set(o.x,height(o.x,o.z)+.06,o.z);scene.add(m);m.visible=false;const z=Object.assign({r,mesh:m,t:0,count:0,max:24},o);
  if(o.pileAt){z.pileG=new THREE.Group();z.pileG.position.set(o.pileAt.x,height(o.pileAt.x,o.pileAt.z),o.pileAt.z);scene.add(z.pileG);z.pileG.visible=false;}ZONES.push(z);return z;}
const ITEM={raw:'stone',rawwood:'wood',rubble:'mud',mud:'mud'};
const blockGeo=new THREE.BoxGeometry(.62,.3,.4),beamGeo=new THREE.BoxGeometry(1.1,.18,.24),jugGeo=new THREE.CylinderGeometry(.14,.18,.34,10);
let blockMat,jugMat;const mudGeo=new THREE.DodecahedronGeometry(.24,0),mudMat=new THREE.MeshLambertMaterial({color:0x8a6440});
function itemOf(t){let m;if(t==='block')m=new THREE.Mesh(blockGeo,blockMat);else if(t==='beam')m=new THREE.Mesh(beamGeo,mat.wood);else if(t==='water')m=new THREE.Mesh(jugGeo,jugMat);else if(t==='mud'){m=new THREE.Mesh(mudGeo,mudMat);m.scale.set(1,.7,1);}else return itemMesh(ITEM[t]||'stone');m.castShadow=true;return m;}
function pileVis(z,type,cols){const g=z.pileG;if(!g)return;const n=Math.min(z.count||0,30);type=type||z.item;
  while(g.children.length>n)g.remove(g.children[g.children.length-1]);
  while(g.children.length<n){const i=g.children.length;const m=itemOf(type);const per=cols||z.cols||3;const L=Math.floor(i/(per*2)),j=i%(per*2);m.position.set(((j%per)-(per-1)/2)*.6+L*.1,.18+L*.3,(Math.floor(j/per)-.5)*.5+L*.07);m.rotation.y=(i*.37)%1*.3;g.add(m);}}
// the stack on the hero's arms
const stackG=new THREE.Group();stackG.position.set(0,1.28,.5);hero.body.add(stackG);
function stackVis(){while(stackG.children.length>stack.length)stackG.remove(stackG.children[stackG.children.length-1]);
  while(stackG.children.length<stack.length){const i=stackG.children.length;const t=stack[i];const m=itemOf(t);m.scale.setScalar(.8);m.position.y=i*(t==='beam'?.17:t==='water'?.3:.26);stackG.add(m);}}
let sway=0;
// workers
const WK=[];
function worker(x,z,look,job){const p=makePerson(look);const s=freeSpot(x,z,.4);p.g.position.set(s.x,height(s.x,s.z),s.z);scene.add(p.g);const w=Object.assign(p,{x:s.x,z:s.z,y:height(s.x,s.z),face:0,job,carry:[],t:0});WK.push(w);return w;}
let Z={},cutter=[],carp=null,porters=[],families=[],puddles=[],built=false;
function build(){if(built)return;built=true;
  blockMat=upgradeMat(new THREE.MeshLambertMaterial({color:0x8f8c88}));jugMat=mat.clay;
  for(const n of NPCS){n.g.visible=false;n.label=null;}for(const a of ANIMALS)a.g.visible=false;
  PROPS.depotG.visible=false;PROPS.quarryG.visible=false;PROPS.qStones.forEach(s=>s.visible=false);BRUSH.forEach(b=>b.m.visible=false);MUD.forEach(m=>m.m.visible=false);SACKS.forEach(s=>s.m.visible=false);child.mode='idle';
  const K=(lx,lz)=>kW(lx,lz);
  // chapter 1: flood mud in front of three houses, carried out of the valley
  const cand=houses.map(h=>({h,p:doorPt(h)})).filter(o=>{const d=Math.hypot(o.p.x,o.p.z);return d>20&&d<34;}).sort((a,b)=>Math.atan2(a.p.z,a.p.x)-Math.atan2(b.p.z,b.p.x));
  const picks=[];for(const o of cand){if(picks.every(p=>Math.hypot(p.p.x-o.p.x,p.p.z-o.p.z)>16))picks.push(o);if(picks.length>=3)break;}
  picks.forEach((o,i)=>{const s=freeSpot(o.p.x,o.p.z,1.2);const z=zone({id:'mud'+i,chs:[1],x:s.x,z:s.z,icon:'🌊',label:L2('Çamur','Mud'),col:'#6b5038',r:1.9,item:'mud',pileAt:{x:s.x+1.6,z:s.z+.8},cols:2});Z['mud'+i]=z;
    const f=makePerson({robe:[0x8a3a2c,0x2f5d8a,0x6b4a7a][i],female:i!==1,cloth:0xf2e8d5});const fs=freeSpot(s.x-1.4,s.z-1.2,.4);f.g.position.set(fs.x,height(fs.x,fs.z),fs.z);f.g.rotation.y=Math.atan2(s.x-fs.x,s.z-fs.z);scene.add(f.g);f.g.visible=false;families.push({p:f,z,happy:false});});
  Z.dump=zone({id:'dump',chs:[1,2],x:30,z:-26,icon:'⛏️',label:L2('Vadi dışı','Out of the valley'),col:'#6a5a4c',pileAt:{x:32,z:-29},item:'rubble',cols:4});
  // chapter 2: the old walls come down
  Z.rubble=zone({id:'rubble',chs:[2],x:K(KW/2+3.4,1.5).x,z:K(KW/2+3.4,1.5).z,icon:'🪨',label:L2('Moloz','Rubble'),col:'#8a6a48'});
  // stone chain
  Z.raw=zone({id:'raw',chs:[3,5,6],x:34,z:8,icon:'⛰️',label:L2('Ham taş','Raw stone'),col:'#7a6553',pileAt:{x:36.5,z:10},item:'raw',max:24,cols:4});
  Z.cutIn=zone({id:'cutIn',chs:[3,5,6],x:20,z:-12,icon:'🔨',label:L2('Taşçı','Stonecutter'),col:'#1f6f78',r:1.9,pileAt:{x:21.8,z:-13.6},item:'raw',max:16});
  Z.cutOut=zone({id:'cutOut',chs:[3,5,6],x:15,z:-17,icon:'🧱',label:L2('Kesme taş','Cut stone'),col:'#3d8a59',r:1.9,pileAt:{x:13.4,z:-18.8},item:'block',max:18});
  Z.wall=zone({id:'wall',chs:[3,5,6,7],x:K(4,-KD/2-2.8).x,z:K(4,-KD/2-2.8).z,icon:'🕋',label:L2('Duvar','Wall'),col:'#b5523b',r:2.4});
  Z.well=zone({id:'well',chs:[4,5,6,7],x:ZEM.x+2.6,z:ZEM.z-1.6,icon:'💧',label:L2('Zemzem','Zamzam'),col:'#2f5d8a',r:1.8});
  // timber chain
  Z.rawWood=zone({id:'rawWood',chs:[5,6,7],x:-30,z:22,icon:'🚢',label:L2('Gemi tahtası','Ship timber'),col:'#7a5a3a',pileAt:{x:-32.5,z:24},item:'rawwood',max:18,cols:3});
  Z.carIn=zone({id:'carIn',chs:[5,6,7],x:-18,z:6,icon:'🪚',label:L2('Marangoz','Carpenter'),col:'#1f6f78',r:1.9,pileAt:{x:-19.8,z:4.4},item:'rawwood',max:12});
  Z.carOut=zone({id:'carOut',chs:[5,6,7],x:-14,z:11,icon:'🪵',label:L2('Kiriş','Beams'),col:'#3d8a59',r:1.9,pileAt:{x:-12.2,z:12.8},item:'beam',max:14,cols:2});
  const bench=(x,z)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(1.4,.7,.8),mat.wood);b.position.set(x,height(x,z)+.35,z);b.castShadow=b.receiveShadow=true;scene.add(b);};
  bench(18.2,-14.4);bench(-16.2,8.4);
  cutter.push(worker(17.6,-13.2,{robe:0x7a5a3a,cloth:0xe9dcc0,beard:0x3a2e26,hat:'turban'},'cut'));
  carp=worker(-15.6,9.6,{robe:0x4d6b3a,cloth:0xe9dcc0,beard:0x5a4636,hat:'scarf'},'carp');
  Z.raw.camel=animal('camel',40,14);Z.raw.camel.graze=false;Z.raw.camel.face=-1.2;
  Z.rawWood.camel=animal('camel',-36,27);Z.rawWood.camel.graze=false;Z.rawWood.camel.face=2;
  // rain puddles that slow you down (chapter 6)
  const pm=new THREE.MeshPhongMaterial({color:0x4a3a2a,shininess:120,specular:0x8899aa,transparent:true,opacity:.85,depthWrite:false});
  [[27,-3,3.2],[18,-4,2.6],[26,-14,2.4],[-20,16,2.8],[-6,-14,2.6]].forEach(([x,z,r])=>{const m=new THREE.Mesh(new THREE.CircleGeometry(r,28),pm);m.rotation.x=-Math.PI/2;m.position.set(x,height(x,z)+.05,z);m.visible=false;scene.add(m);puddles.push({x,z,r,m});});
}
/* ---------- upgrades: golden pads, paid with bereket by standing on them ---------- */
const PADS=[];
const UPG=[
  {id:'cap1',cost:30,ch:3,x:24,z:-4,icon:'🎒',label:L2('Taşıma +2','Carry +2'),apply:()=>{D.cap+=2;}},
  {id:'cutter2',cost:60,ch:3,need:'cap1',x:22.5,z:-17.5,icon:'👷',label:L2('2. taşçı','2nd cutter'),mk:()=>{cutter.push(worker(22.4,-15.6,{robe:0x8a3a2c,cloth:0xe9dcc0,beard:0x2a221c,hat:'turban'},'cut'));}},
  {id:'porter1',cost:80,ch:5,x:30,z:-6,icon:'🧔',label:L2('Taş hamalı','Stone porter'),mk:()=>{porters.push(worker(32,6,{robe:0xc58b3a,cloth:0xf2e8d5},'porter'));}},
  {id:'cap2',cost:120,ch:5,need:'porter1',x:6,z:-24,icon:'🎒',label:L2('Taşıma +2','Carry +2'),apply:()=>{D.cap+=2;}},
  {id:'porter2',cost:140,ch:6,x:-26,z:8,icon:'🧔',label:L2('Tahta hamalı','Timber porter'),mk:()=>{porters.push(worker(-28,20,{robe:0x2f5d8a,cloth:0xe9dcc0},'porterW'));}},
  {id:'fast',cost:180,ch:6,need:'porter2',x:4,z:-30,icon:'🩴',label:L2('Hızlı sandalet','Quick sandals'),apply:()=>{}}];
function padsOn(){return R.ch>=3&&R.ch!==4;}
function killPad(m){scene.remove(m);try{m.geometry.dispose();if(m.material.map)m.material.map.dispose();m.material.dispose();}catch(_){}}
function syncPads(){for(const u of UPG){const want=padsOn()&&!D.up[u.id]&&R.ch>=u.ch&&(!u.need||D.up[u.need]);const p=PADS.find(p=>p.u===u);
    if(p&&!want){killPad(p.mesh);PADS.splice(PADS.indexOf(p),1);}
    if(!p&&want){const m=new THREE.Mesh(new THREE.CircleGeometry(1.6,40),new THREE.MeshBasicMaterial({map:padTex(u.icon,'★'+u.cost,'#d39a2c'),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4}));
      m.rotation.x=-Math.PI/2;m.position.set(u.x,height(u.x,u.z)+.07,u.z);scene.add(m);PADS.push({u,mesh:m,paid:D.up['p_'+u.id]||0});}}}
let workersMade={};
function makeUpgradeWorkers(){for(const u of UPG)if(D.up[u.id]&&u.mk&&!workersMade[u.id]){workersMade[u.id]=1;u.mk();}}
/* ---------- per-frame site logic ---------- */
function inZ(z){return z.mesh.visible&&Math.hypot(P.x-z.x,P.z-z.z)<z.r&&!P.ride;}
let padNear=null;
let tick=0,currentTargetZone=null,unload={z:null,n:0,t:0};
const hooks={};// chapter-specific logic installed by l11
function gameActive(){return state==='play'&&bookEl.hidden&&mapEl.hidden&&(typeof KS==='undefined'||KS.hidden)&&!document.hidden&&!(typeof PADUI!=='undefined'&&PADUI.open);}
/* one ledger for bereket: profile and the running chapter move together (T11) */
function award(n){n=Math.max(0,Math.round(n));D.coins+=n;R.coins=(R.coins||0)+n;runDirty=true;}
let runDirty=false;
function unloadBonus(){if(!unload.z)return;const cap=unload.cap||D.cap;if(unload.n>=Math.max(2,cap)){const b=unload.n*2;award(b);ftext(L2('TAM YÜK! +','FULL LOAD! +')+b,P.x,P.y+2.4,P.z,'#ffd75e');coinsFly(3,P.x,P.y+1.5,P.z);}unload.z=null;}
function zoneOn(z){return z.chs.includes(R.ch)&&(!z.when||z.when());}
function bumpUnload(z,n){if(unload.z!==z){unloadBonus();unload={z,n:0,t:0,cap:hooks.cap?hooks.cap():D.cap};}unload.n+=n;unload.t=0;runDirty=true;}
function siteStep(dt){if(!SITE.on||!started)return;
  for(const z of ZONES){const v=zoneOn(z);z.mesh.visible=v;if(z.pileG)z.pileG.visible=v||(z.id==='dump'&&R.ch<=2);z.mesh.material.opacity=currentTargetZone===z?.8+Math.sin(clock*5)*.2:.78;}
  for(const p of PADS)p.mesh.material.opacity=.75+Math.sin(clock*4)*.2;
  const sim=gameActive(),sdt=sim?dt:0;const playing=sim&&!R.done;if(playing)R.t+=dt;tick-=sdt;const beat=sim&&tick<=0;if(beat)tick=.11;
  // full-load bonus: after the player leaves an unload zone
  if(unload.z&&sim){unload.t+=dt;if(unload.t>.5)unloadBonus();}
  // deliveries arrive by camel
  if(Z.raw.mesh.visible){Z.raw.t+=sdt;Z.raw.camel.g.visible=true;if(Z.raw.t>4.5){Z.raw.t=0;if(Z.raw.count<Z.raw.max){Z.raw.count=Math.min(Z.raw.max,Z.raw.count+4);pileVis(Z.raw);if(Math.hypot(P.x-Z.raw.x,P.z-Z.raw.z)<25)sfx.camel();}}}else Z.raw.camel.g.visible=false;
  if(Z.rawWood.mesh.visible){Z.rawWood.t+=sdt;Z.rawWood.camel.g.visible=true;if(Z.rawWood.t>5){Z.rawWood.t=0;if(Z.rawWood.count<Z.rawWood.max){Z.rawWood.count=Math.min(Z.rawWood.max,Z.rawWood.count+3);pileVis(Z.rawWood);}}}else Z.rawWood.camel.g.visible=false;
  // workshops
  const morale=R.water>0?1.5:1;if(R.water>0)R.water-=sdt;
  for(const c of cutter){const on=Z.cutIn.mesh.visible;c.g.visible=R.ch>=3&&R.ch!==4;if(!on){animPerson(c,dt,0,'idle');continue;}c.t+=sdt*morale;const busy=Z.cutIn.count>0&&Z.cutOut.count<Z.cutOut.max;animPerson(c,dt,0,busy?'talk':'idle');faceW(c,Z.cutIn);
    if(c.t>1.5){c.t=0;if(busy){Z.cutIn.count--;Z.cutOut.count++;pileVis(Z.cutIn);pileVis(Z.cutOut);if(Math.hypot(P.x-c.x,P.z-c.z)<18)nz(.08,2600,4,.05,'bandpass');puff(c.x,c.y+.8,c.z,2);}}}
  carp.g.visible=R.ch>=5;
  if(Z.carIn.mesh.visible){carp.t+=sdt*morale;const busy=Z.carIn.count>0&&Z.carOut.count<Z.carOut.max;animPerson(carp,dt,0,busy?'talk':'idle');faceW(carp,Z.carIn);if(carp.t>1.6){carp.t=0;if(busy){Z.carIn.count--;Z.carOut.count++;pileVis(Z.carIn);pileVis(Z.carOut);if(Math.hypot(P.x-carp.x,P.z-carp.z)<18)nz(.12,1400,2,.04,'bandpass');}}}
  else animPerson(carp,dt,0,'idle');
  // porters
  for(const w of porters){const src=w.job==='porter'?Z.raw:Z.rawWood,dst=w.job==='porter'?Z.cutIn:Z.carIn;w.g.visible=src.mesh.visible;if(!w.g.visible)continue;const t=w.carry.length?dst:src;const dx=t.x-w.x,dz=t.z-w.z,d=Math.hypot(dx,dz);let sp=0;
    if(d>1.2&&sim){const v=2.8;w.x+=dx/d*v*dt;w.z+=dz/d*v*dt;w.face=Math.atan2(dx,dz);sp=v;collideEnt(w,.3,0);}
    else if(beat){if(w.carry.length&&dst.count<dst.max){w.carry.pop();dst.count++;pileVis(dst);}else if(!w.carry.length&&src.count>=3){src.count-=3;w.carry=[1,1,1];pileVis(src);}}
    w.y=height(w.x,w.z);w.g.position.set(w.x,w.y,w.z);w.g.rotation.y=w.face;animPerson(w,dt,sp,w.carry.length?'carry':sp?'walk':'idle');}
  if(hooks.step)hooks.step(sdt,playing,beat);
  // puddles
  let slow=D.up.fast?1.22:1;for(const p of puddles){p.m.visible=R.ch===6;if(p.m.visible&&Math.hypot(P.x-p.x,P.z-p.z)<p.r){slow*=.55;if(beat&&P.speed>1&&Math.random()<.3)sfx.splash();}}P.slow=slow;
  if(!playing){stackVis();return;}
  if(beat){const top=stack[stack.length-1];const cap=hooks.cap?hooks.cap():D.cap;
    const take=(z,type)=>{if(typeof takeBlocked==='function'&&takeBlocked(z,type))return false;if(z.count>0&&stack.length<cap&&(!stack.length||stack[0]===type)){z.count--;stack.push(type);pileVis(z);tone(HIC[4+stack.length%5],.06,.025);if(stack.length===cap)ftext(L2('DOLU','FULL'),P.x,P.y+2.3,P.z,'#ffd75e');return true;}return false;};
    const give=(z,type)=>{if(stack.length&&stack[stack.length-1]===type&&(z.count||0)<z.max){stack.pop();z.count=(z.count||0)+1;pileVis(z);sfx.thunk();bumpUnload(z,1);return true;}return false;};
    if(inZ(Z.raw))take(Z.raw,'raw');if(inZ(Z.cutIn))give(Z.cutIn,'raw');if(inZ(Z.cutOut))take(Z.cutOut,'block');
    if(inZ(Z.rawWood))take(Z.rawWood,'rawwood');if(inZ(Z.carIn))give(Z.carIn,'rawwood');if(inZ(Z.carOut))take(Z.carOut,'beam');
    if(hooks.beat)hooks.beat(top,cap,take,give);
    padNear=null;for(const p of PADS){if(Math.hypot(P.x-p.u.x,P.z-p.u.z)<1.6){padNear=p;break;}}
  }
  stackVis();sway+=dt*(P.speed>.5?9:2);stackG.rotation.z=Math.sin(sway)*.04*Math.min(1,stack.length/3);stackG.rotation.x=Math.sin(sway*.5)*.03;
  if(stack.length){hero.armL.rotation.x=hero.armR.rotation.x=-1.25;}
}
function faceW(w,z){w.face=Math.atan2(z.x-w.x,z.z-w.z);w.g.rotation.y=w.face;}
const SAVE_VER=2;
const PRESAVE=[];
function ssave(){for(const f of PRESAVE){try{f();}catch(e){console.warn('presave',e);}}try{D.ver=SAVE_VER;D.codex=Object.keys(G.found||{});const j=JSON.stringify(D);localStorage.setItem(SKEY,j);localStorage.setItem(SKEY+'-bak',j);runDirty=false;return true;}catch(e){console.warn('save failed',e);saveFailed=true;return false;}}
let saveFailed=false;
const num=(v,d,lo,hi)=>{v=Number(v);if(!isFinite(v))return d;return Math.min(hi,Math.max(lo,v));};
function cleanProfile(s){const o={unl:1,stars:{},best:{},coins:0,good:0,cap:4,up:{},tut:0,last:1,codex:[],run:null,meta:null,ver:SAVE_VER};if(!s||typeof s!=='object')return o;
  o.unl=Math.round(num(s.unl,1,1,7));o.coins=Math.round(num(s.coins,0,0,1e7));o.good=Math.round(num(s.good,0,0,1e7));o.cap=Math.round(num(s.cap,4,4,20));o.tut=s.tut?1:0;o.done=!!s.done;o.rm=!!s.rm;o.novib=!!s.novib;
  if(s.stars&&typeof s.stars==='object')for(let i=1;i<=7;i++){const v=Math.round(num(s.stars[i],0,0,3));if(v)o.stars[i]=v;}
  if(s.best&&typeof s.best==='object')for(let i=1;i<=7;i++){const v=num(s.best[i],0,0,1e6);if(v)o.best[i]=Math.round(v);}
  for(let i=1;i<=7;i++)if(o.stars[i])o.unl=Math.max(o.unl,Math.min(7,i+1));
  const ids=new Set(UPG.map(u=>u.id));if(s.up&&typeof s.up==='object')for(const k in s.up){const m=/^p_(.+)$/.exec(k);if(m){if(ids.has(m[1]))o.up[k]=Math.round(num(s.up[k],0,0,1e6));}else if(ids.has(k)&&s.up[k])o.up[k]=true;}
  // capacity is derived from purchased upgrades, so a damaged number can not give infinite carry
  o.cap=4+(o.up.cap1?2:0)+(o.up.cap2?2:0);
  if(Array.isArray(s.codex))o.codex=s.codex.filter(x=>typeof x==='string'&&CX[x]);
  if(s.run&&typeof s.run==='object'&&Number.isInteger(s.run.ch)&&s.run.ch>=1&&s.run.ch<=7&&s.run.ch<=Math.max(o.unl,o.done?8:0))o.run=s.run;
  if(s.meta&&typeof s.meta==='object')o.meta=s.meta;
  return o;}
function sload(){let s=null,src='none';for(const k of [SKEY,SKEY+'-bak']){try{const t=localStorage.getItem(k);if(t){s=JSON.parse(t);src=k;break;}}catch(_){s=null;}}
  D=cleanProfile(s);for(const id of D.codex)G.found[id]=true;return src!=='none';}
