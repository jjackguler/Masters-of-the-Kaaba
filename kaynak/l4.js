/* ===================== water jar, cinematics, saving, player, camera, loop ===================== */
let lastCause='çalkalanma',spillAcc=0;
function spill(n,why){if(!P.jar||P.water<=0)return;const before=P.water;P.water=Math.max(0,P.water-n);spillAcc+=before-P.water;if(why&&spillAcc>=3){toast('Su döküldü ('+why+') −%'+Math.round(spillAcc));spillAcc=0;}}
function slosh(a,cause){if(!P.jar)return;P.slosh+=a;if(cause)lastCause=cause;}
function sloshStep(dt){P.slosh*=Math.exp(-2.1*dt);if(P.jar&&P.slosh>1&&P.water>0){const ex=P.slosh-1;spill(8+ex*26,lastCause);P.slosh=.8;splash();sfx.splash();buzz(30);}}

/* ---------- cinematics ---------- */
let CINE=null;const subt=$('#subt'),fadeEl=$('#fade');
function cine(steps,done){CINE={steps,i:-1,t:0,done};document.body.classList.add('cinema');state='cine';marker.hidden=true;nextShot();}
function nextShot(){CINE.i++;CINE.t=0;const s=CINE.steps[CINE.i];if(!s){document.body.classList.remove('cinema');subt.textContent='';const d=CINE.done;CINE=null;state='play';if(d)d();return;}subt.textContent=s.sub||'';if(s.start)s.start();}
const cl=new V3();
function stepCine(dt){const s=CINE.steps[CINE.i];CINE.t+=dt;const k=Math.min(1,CINE.t/s.d);const e=k*k*(3-2*k);camera.position.lerpVectors(s.from.p,s.to.p,e);cl.lerpVectors(s.from.l,s.to.l,e);camera.lookAt(cl);if(s.upd)s.upd(k,dt);if(k>=1)nextShot();}
addEventListener('keydown',e=>{if(state==='cine'&&CINE&&(e.code==='Enter'||e.code==='Space'||e.code==='KeyE')){e.preventDefault();const s=CINE.steps[CINE.i];if(s&&CINE.t<s.d-.3)CINE.t=s.d-.3;}});
cv.addEventListener('pointerdown',()=>{if(state==='cine'&&CINE){const s=CINE.steps[CINE.i];if(s&&CINE.t<s.d-.3)CINE.t=Math.max(CINE.t,s.d*.6);}});
function fadeOut(cb){fadeEl.classList.add('on');setTimeout(()=>{if(cb)cb();},reduce?60:850);}
function fadeIn(){fadeEl.classList.remove('on');}

/* ---------- saving ---------- */
const KEY='bekke-kabe-v1';
function save(){if(!started)return;try{localStorage.setItem(KEY,JSON.stringify({G,p:[P.x,P.z]}));}catch(_){}}
function hasSave(){try{return !!localStorage.getItem(KEY);}catch(_){return false;}}
function load(){try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(!s||!s.G)return false;Object.assign(G,s.G);
  if(s.p&&!blockedAt(s.p[0],s.p[1],.4)){P.x=s.p[0];P.z=s.p[1];}else{P.x=DEPOT.x+4;P.z=DEPOT.z-3;}P.y=height(P.x,P.z);cam.yaw=Math.atan2(P.x,P.z);return true;}catch(_){return false;}}

/* ---------- per-frame player update ---------- */
function updatePlayer(dt){
  let f=0,s=0,ctrl=state==='play'&&!overlay();
  if(ctrl){if(keys.KeyW||keys.ArrowUp)f+=1;if(keys.KeyS||keys.ArrowDown)f-=1;if(keys.KeyD||keys.ArrowRight)s+=1;if(keys.KeyA||keys.ArrowLeft)s-=1;f+=joy.y;s+=joy.x;if(DP.on){f+=DP.f;if(DP.t){cam.yaw-=DP.t*1.9*dt;cam.lastDrag=clock;}}}
  const mag=Math.min(1,Math.hypot(f,s));
  const sy=Math.sin(cam.yaw),cy=Math.cos(cam.yaw);
  let dx=-sy*f+cy*s,dz=-cy*f-sy*s;const dl=Math.hypot(dx,dz)||1;dx/=dl;dz/=dl;
  P.run=ctrl&&mag>.2&&(keys.ShiftLeft||keys.ShiftRight||joy.mag>.92||(DP.on&&DP.run));
  if(ctrl&&DP.on&&DP.t&&!DP.f&&mag<.05){const tf=cam.yaw+Math.PI;let d=tf-P.face;d=Math.atan2(Math.sin(d),Math.cos(d));P.face+=d*Math.min(1,dt*10);}
  const hv=heavy();const target=(P.slow||1)*mag*(P.ride?(P.run?8.5:5.2):P.run?(hv?3.6:6.4):(hv?2.3:3.2));P.speed+=(target-P.speed)*Math.min(1,dt*(P.ground?10:3));
  if(jumpQ&&ctrl)P.jbuf=.15;jumpQ=false;P.jbuf=Math.max(0,P.jbuf-dt);
  P.coy=P.ground?.12:Math.max(0,P.coy-dt);
  if(P.busy>0){P.busy-=dt;P.speed*=Math.exp(-12*dt);if(P.busy<=0&&P.busyCb){const cb=P.busyCb;P.busyCb=null;P.busyAnim='';cb();}return;}
  if(P.mantle){const m=P.mantle;m.t+=dt/.48;const e=t=>t*t*(3-2*t);
    if(m.t<.5){P.y=lerp(m.fy,m.ty+.08,e(m.t/.5));}else{P.y=m.ty;const k=e(Math.min(1,(m.t-.5)/.5));P.x=lerp(m.fx,m.tx,k);P.z=lerp(m.fz,m.tz,k);}
    if(m.t>=1){P.mantle=null;P.ground=true;P.vy=0;P.speed=0;puff(P.x,P.y,P.z,5);}return;}
  if(mag>.05){const tf=Math.atan2(dx,dz);let d=tf-P.face;d=Math.atan2(Math.sin(d),Math.cos(d));P.face+=d*Math.min(1,dt*12);}
  const mv=mag>.05?1:0,vx=dx*P.speed*mv,vz=dz*P.speed*mv;
  if(P.ground){const acc=Math.hypot(vx-P.pvx,vz-P.pvz);slosh(acc*.06,acc>2.5?'ani dönüş':'çalkalanma');if(P.run&&P.speed>4)slosh(dt*.6,'koşu');}
  P.pvx=vx;P.pvz=vz;P.x+=vx*dt;P.z+=vz*dt;
  const ct=collideEnt(P,P.ride?.62:R,P.y);
  if(P.jbuf>0&&(P.ground||P.coy>0)&&!P.ride){if(!tryMantle(ct)){P.vy=hv?4.4:6.6;P.ground=false;P.coy=0;P.cut=false;P.airTop=P.y;slosh(.33,'zıplama');sfx.jump();puff(P.x,P.y,P.z,3);}P.jbuf=0;}
  else if(!P.ground&&ct&&(mag>.3||P.jbuf>0)){if(tryMantle(ct))P.jbuf=0;}
  if(!P.ground&&!P.cut&&P.vy>0&&!jumpHeld()){P.vy*=.5;P.cut=true;}
  if(P.mantle)return;
  P.vy-=GRAV*dt;P.y+=P.vy*dt;
  const gy=support(P.x,P.z,P.y);
  if(P.y<=gy){if(!P.ground){const fall=P.airTop-gy;slosh(Math.max(0,fall-.6)*.5,'yüksekten iniş');sfx.land(Math.min(1,fall/3));if(fall>.5)puff(P.x,gy,P.z,4+Math.min(8,fall*3|0));if(fall>2)buzz(25);
      if(RAIN.amt>.3&&fall>.3)splash();}P.y=gy;P.vy=0;P.ground=true;}
  else if(P.ground&&P.y-gy>.06){P.ground=false;P.airTop=P.y;}
  if(!P.ground)P.airTop=Math.max(P.airTop,P.y);
  sloshStep(dt);
  if(P.ground&&P.speed>.6){const sg=Math.sign(Math.sin(P.phase));if(sg!==P.stepSign){P.stepSign=sg;sfx.step(P.run);if(RAIN.amt>.4&&Math.random()<.3)nz(.1,1400,1,.05,'bandpass');if(P.run&&P.speed>4)puff(P.x,P.y,P.z,1);}}
}

/* ---------- hero animation + scarf ---------- */
const tmpA=new V3(),tmpB=new V3();
function animHero(dt){
  const h=hero;h.g.position.set(P.x,P.y+(P.ride?2.02:0),P.z);h.g.rotation.y=P.face;
  const amt=Math.min(1,P.speed/3);P.phase+=dt*(2.4+P.speed*1.9)*(amt>.05?1:0);const sw=Math.sin(P.phase);
  h.armL.rotation.z=0;h.armR.rotation.z=0;
  if(P.busy>0){const a=P.busyAnim;if(a==='dig'){const q=Math.sin(clock*9);h.armL.rotation.x=h.armR.rotation.x=-1.2+q*.7;h.body.rotation.x=.25+q*.08;}
    else if(a==='pour'){h.armR.rotation.x=-1.3;h.armL.rotation.x=-1.0;}else{h.armL.rotation.x=-1.0+Math.sin(clock*7)*.4;h.armR.rotation.x=-1.0-Math.sin(clock*7)*.4;}
    h.legL.rotation.x=h.legR.rotation.x=0;}
  else if(P.mantle){h.legL.rotation.x=1.0;h.legR.rotation.x=-.1;h.armR.rotation.x=h.armL.rotation.x=-2.8;}
  else{const carry=P.carry&&P.carry!=='mud';
    if(!P.ground){h.legL.rotation.x=.65;h.legR.rotation.x=-.35;if(!carry){h.armR.rotation.x=-1.3;h.armL.rotation.x=-.4;}}
    else{h.legL.rotation.x=sw*.75*amt;h.legR.rotation.x=-sw*.75*amt;if(!carry){h.armR.rotation.x=-sw*.6*amt;h.armL.rotation.x=P.jar?-2.75:sw*.6*amt;}}
    if(carry){h.armL.rotation.x=h.armR.rotation.x=P.carry==='goat'?-1.3:-2.75;}
    if(P.jar&&!carry){h.armL.rotation.x=-2.75;}}
  h.body.position.y=P.ground&&!reduce?Math.abs(Math.sin(P.phase))*.05*amt:0;
  if(!(P.busy>0&&P.busyAnim==='dig'))h.body.rotation.x=P.ground?-.07*amt*(P.run?1.8:1)+(heavy()?.1:0):0;
  if(P.ride){h.legL.rotation.x=h.legR.rotation.x=-1.25;h.legL.rotation.z=.55;h.legR.rotation.z=-.55;h.body.position.y=Math.abs(Math.sin(clock*(P.run?9:5)))*.05*Math.min(1,P.speed/3);}else{h.legL.rotation.z=h.legR.rotation.z=0;}
  h.g.updateMatrixWorld(true);
  const sc=heroScarf,anc=tmpA.set(0,1.3,-.16).applyMatrix4(h.body.matrixWorld);
  if(sc.init&&sc.pts[0].distanceTo(anc)>1.5)sc.init=false;
  if(!sc.init){for(let i=0;i<sc.N;i++){sc.pts[i].copy(anc);sc.pts[i].y-=i*sc.seg;sc.prev[i].copy(sc.pts[i]);}sc.init=true;}
  sc.pts[0].copy(anc);const g=-3.2*dt*dt;
  for(let i=1;i<sc.N;i++){const p=sc.pts[i],q=sc.prev[i];const vx=(p.x-q.x)*.9,vy=(p.y-q.y)*.9,vz=(p.z-q.z)*.9;q.copy(p);p.x+=vx+.15*dt*dt;p.y+=vy+g;p.z+=vz;}
  for(let it=0;it<3;it++)for(let i=1;i<sc.N;i++){const a=sc.pts[i-1],b=sc.pts[i];tmpB.subVectors(b,a);const l=tmpB.length()||1;b.copy(a).addScaledVector(tmpB,sc.seg/l);}
  for(let i=0;i<sc.N-1;i++){const m=sc.segs[i],a=sc.pts[i],b=sc.pts[i+1];m.position.addVectors(a,b).multiplyScalar(.5);m.lookAt(b);m.scale.z=sc.seg;}
  heldGroup.visible=!!P.carry&&P.carry!=='goat';
}

/* ---------- camera ---------- */
function inSolid(p){if(p.y<height(p.x,p.z)+.25)return true;
  for(const o of SOL){const dx=p.x-o.cx,dz=p.z-o.cz;if(Math.abs(dx)>o.rad||Math.abs(dz)>o.rad)continue;const [lx,lz]=toLocal(o,p.x,p.z);if(Math.abs(lx)<o.hw+.15&&Math.abs(lz)<o.hd+.15&&p.y<o.camTop+.2)return true;}return false;}
const camHead=new V3(),camBack=new V3(),camP=new V3();
function updateCamera(dt){
  if(state==='play'&&P.speed>1&&clock-cam.lastDrag>1.8){let d=P.face+Math.PI-cam.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));if(Math.abs(d)<2.4)cam.yaw+=d*Math.min(1,dt*.9);}
  if(!cam.f)cam.f=new V3(P.x,P.y,P.z);cam.f.x+=(P.x-cam.f.x)*Math.min(1,dt*14);cam.f.z+=(P.z-cam.f.z)*Math.min(1,dt*14);cam.f.y+=(P.y-cam.f.y)*Math.min(1,dt*(P.ground?8:4));
  const base=innerHeight>innerWidth*1.1?78:66;const fov=P.run&&P.speed>4?base+6:base;if(Math.abs(camera.fov-fov)>.05){camera.fov+=(fov-camera.fov)*Math.min(1,dt*3);camera.updateProjectionMatrix();}
  camHead.set(cam.f.x,cam.f.y+1.35,cam.f.z);const cp=Math.cos(cam.pitch);camBack.set(Math.sin(cam.yaw)*cp,Math.sin(cam.pitch),Math.cos(cam.yaw)*cp);
  let d=cam.dist;for(let t=.8;t<=cam.dist;t+=.3){camP.copy(camHead).addScaledVector(camBack,t);if(inSolid(camP)){d=Math.max(.8,t-.35);break;}}
  cam.cur=d<cam.cur?d:cam.cur+(d-cam.cur)*Math.min(1,dt*3);
  camera.position.copy(camHead).addScaledVector(camBack,cam.cur);if(cam.cur<2.6)camera.position.y+=(2.6-cam.cur)*.9;camera.lookAt(camHead.x,camHead.y+.15-(cam.cur<2.6?(2.6-cam.cur)*.25:0),camHead.z);}
let titleA=2.2;
function titleCam(dt){if(!reduce)titleA+=dt*.035;const r=27;camera.position.set(Math.sin(titleA)*r,6.5,Math.cos(titleA)*r);camera.lookAt(0,3.4,0);}

/* ---------- menus ---------- */
const titleEl=$('#title'),mStart=$('#m-start'),mNew=$('#m-new');
$('#p-controls').innerHTML=isTouch
  ?'<dl><dt>Sol taraf</dt><dd>Parmağını koy ve kaydır: yürü. Sonuna kadar it: koş.</dd><dt>Sağ taraf</dt><dd>Sürükle: kamerayı çevir.</dd><dt>Yön tuşları</dt><dd>Yukarı/aşağı: yürü. Sağ/sol: dön.</dd><dt>Tırman</dt><dd>Bir kenara yaklaşınca büyük düğme Tırman olur.</dd><dt>Büyük düğme</dt><dd>Konuş, al, bırak, yükle.</dd><dt>Üst sağ</dt><dd>Defter ve harita.</dd></dl>'
  :'<dl><dt>W A S D</dt><dd>Yürü (oklar da olur). Shift: koş.</dd><dt>Boşluk</dt><dd>Zıpla; kenara doğru zıplarsan tırman.</dd><dt>E</dt><dd>Konuş, al, bırak, tırman, deveye yükle.</dd><dt>Q</dt><dd>Taşıdığını yere bırak.</dd><dt>1–3</dt><dd>Konuşmada seçenek seç.</dd><dt>B / M</dt><dd>Mekke Defteri / harita.</dd><dt>Fare</dt><dd>Sürükle: kamerayı çevir. Tekerlek: yakınlaş.</dd><dt>Esc</dt><dd>Menü.</dd></dl>';
function togglePanel(id){for(const p of ['p-controls','p-about']){const el=$('#'+p);el.hidden=p===id?!el.hidden:true;}}
$('#m-controls').addEventListener('click',()=>togglePanel('p-controls'));
$('#m-about').addEventListener('click',()=>togglePanel('p-about'));
$('#m-sound').addEventListener('click',e=>{AU.on=!AU.on;if(AU.master)AU.master.gain.value=AU.on?.7:0;e.currentTarget.textContent='Ses: '+(AU.on?'Açık':'Kapalı');});
const LOOKS=[[8,'Canlı'],[3,'Resimsel'],[1,'Mürekkep'],[0,'Ham']];let lookI=0;
$('#m-style').addEventListener('click',e=>{lookI=(lookI+1)%LOOKS.length;setStyle(LOOKS[lookI][0]);e.currentTarget.textContent='Görünüm: '+LOOKS[lookI][1];});
mNew.addEventListener('click',()=>{try{localStorage.removeItem(MODE==='p2'?'bekke-fil-v1':KEY);}catch(_){}location.reload();});
if(hasSave()){mStart.textContent='Devam et';mNew.hidden=false;}
function openMenu(){state='menu';titleEl.hidden=false;hud.style.opacity=0;marker.hidden=true;mStart.textContent='Devam';setTimeout(()=>mStart.focus({preventScroll:true}),30);}
function closeMenu(){titleEl.hidden=true;hud.style.opacity=1;state=!card.hidden?'card':!dlgWrap.hidden?'dlg':'play';cv.focus({preventScroll:true});}
$('#b-menu').addEventListener('click',()=>{if(state==='play')openMenu();});
const CH_TIME=['rain','rain','noon','night','noon','eve'];
mStart.addEventListener('click',()=>{
  if(started){closeMenu();return;}
  if(MODE==='p2'){p2Start();return;}
  if(!window.__storyGo){window.startSite();return;}
  auInit();musicStart();const had=load();started=true;titleEl.hidden=true;hud.style.opacity=1;dpadApply();
  hintEl.textContent=isTouch||DP.on?'':'WASD · Boşluk · E · B defter · M harita';setTimeout(()=>{hintEl.hidden=true;},14000);
  openDeedsFor(G.ch);syncWorld();setTime(CH_TIME[G.ch]);
  if(!had){discover('k_old',true);discover('o_sel',true);
    showCard('Mekke, yaklaşık 605',{t:'Sel',b:"Kış gecesi vadinin yukarısından inen sel Kâbe'nin harçsız duvarlarını çatlattı. Sokaklar çamur, insanlar dertli. Sen isimsiz bir Mekkeli gençsin. Önce mahallene yardım et; sonra Kâbe'nin yeniden yükselişine katılacaksın.",c:[SRC.K,SRC.S]},'Yola çık',()=>{
      toast('Yardım bekleyenlerin başında ! işareti var. '+(isTouch||DP.on?'Yanına git, büyük düğmeye bas.':'Konuşmak için E.'),5);});}
  else{toast('Kaldığın yerden devam.',2.5);}
});

/* ---------- world checks (discovery, followers) ---------- */
let chkT=0;
function worldChecks(dt){chkT-=dt;if(chkT>0)return;chkT=.2;
  if(started&&state==='play')for(const e of CODEX){if(G.found[e.id]||!e.at)continue;if(Math.hypot(P.x-e.at.x,P.z-e.at.z)<e.r){if(e.id.startsWith('k_')&&G.ch<2&&e.id!=='k_makam')continue;discover(e.id);}}
  if(dst('kuzu').st==='active'){LAMBS.forEach((l,i)=>{if(!l.follow&&l.g.visible&&Math.hypot(l.x-P.x,l.z-P.z)<2.8){l.follow=P;l.graze=false;sfx.bleat();(G.flags.lambs=G.flags.lambs||[])[i]=true;toast('Kuzu peşine takıldı ('+LAMBS.filter(x=>x.follow===P).length+'/3)');}
      else if(!l.follow&&l.g.visible&&Math.random()<.04&&Math.hypot(l.x-P.x,l.z-P.z)<30)sfx.bleat();});}
  if(dst('yolcu').st==='active'&&lost.follow===P){const d=doorPt(NAMED.e_nedve);if(Math.hypot(lost.x-d.x,lost.z-d.z)<6){lost.follow=null;lost.wander=0;setD('yolcu','done');
    talk([["Yolcu","İşte Dâru'n-Nedve! Kusay b. Kilâb yaptırmış derler; kervanlar buradan yola çıkar."],["Yolcu","Kervanımız gemi kerestesi de getirdi. Bir tahtayı senin adına ustabaşına bırakacağım."]],()=>{discover('e_nedve');reward(1,1,'yolcunun teşekkürü');});}}
  if(dst('koyun').st==='active'&&Math.hypot(giftSheep.x-poor.x,giftSheep.z-poor.z)<7&&!G.flags.koyunHint){G.flags.koyunHint=true;toast('Bedevî anneyle konuş.');}
}

/* ---------- loop ---------- */
let last=performance.now(),flashT=0,thunderT=6;
function loop(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;clock+=dt;
  stepTime(dt);applyTime();if(state==='play')G.time=(G.time||0)+dt;
  if(RAIN.amt>.5){thunderT-=dt;if(thunderT<=0){thunderT=9+Math.random()*14;flashT=.35;setTimeout(()=>sfx.thunder(),400+Math.random()*900);}}
  if(flashT>0){hemi.intensity+=flashT*3;flashT-=dt;}
  if(CINE&&state!=='cine'){document.body.classList.remove('cinema');subt.textContent='';const d=CINE.done;CINE=null;if(d)try{d();}catch(_){}}
  if(state==='title'||state==='hub')titleCam(dt);
  else if(state==='cine'&&CINE)stepCine(dt);
  else{updatePlayer(dt);if(state!=='menu')updateCamera(dt);}
  animHero(dt);updateNPCs(dt);updateAnimals(dt);stepFX(dt);stepRain(dt);stepRise(dt);stepFires();worldChecks(dt);extraStep(dt);
  if(flood.visible)flood.position.y=.38+Math.sin(clock*.6)*.03;
  act=findAct();
  if(actQ){actQ=false;if(act&&act.fn)act.fn();}
  const showA=act&&state==='play'&&!overlay();promptEl.hidden=!showA;if(act)promptTxt.textContent=act.label;
  tAct.hidden=!showA||!act.fn;if(act)tAct.textContent=act.label.startsWith('Konuş: ')?'Konuş':act.label;
  const fx=state==='title'?0:P.x,fz=state==='title'?0:P.z;
  sun.target.position.set(fx,0,fz);sun.position.set(fx,0,fz).addScaledVector(sunDir,200);
  sky.position.copy(camera.position);stars.position.copy(camera.position);
  const a=dust.geometry.attributes.position.array,cx=camera.position.x,cy=camera.position.y,cz=camera.position.z;
  for(let i=0;i<a.length;i+=3){a[i]+=.5*dt;a[i+2]+=.2*dt;for(let k=0;k<3;k++){const c=k===0?cx:k===1?cy:cz;if(a[i+k]-c>24)a[i+k]-=48;else if(a[i+k]-c<-24)a[i+k]+=48;}}
  dust.geometry.attributes.position.needsUpdate=true;
  if(state!=='title'){updateHud(dt);updateCompass();}
  updateMarker();updateLabels();
  if(!window.__skip3D)renderFrame();
  requestAnimationFrame(loop);
}
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();sizePost();});
syncWorld();T=cloneT(TIMES[CH_TIME[0]]);
if(hasSave()){try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&s.G){const g=s.G;const tmp={ch:G.ch,level:G.level,placed:G.placed};G.ch=g.ch;G.level=g.level;G.placed=g.placed;kaaba(kaabaFromG());T=cloneT(TIMES[CH_TIME[G.ch]]);RAIN.target=G.ch<2?1:0;flood.visible=G.ch<2;Object.assign(G,tmp);}}catch(_){}}
requestAnimationFrame(loop);
setTimeout(()=>mStart.focus({preventScroll:true}),100);
window.__kabe={G,P,keys,cam,LEVELS,CAMPS,DEEDS,NAMED,LAMBS,myCamel,QUARRY,DEPOT,get state(){return state;},set state(v){state=v;},
  start:()=>mStart.click(),step:(n,dt)=>{for(let i=0;i<n;i++){clock+=dt;updatePlayer(dt);updateNPCs(dt);updateAnimals(dt);stepRise(dt);worldChecks(dt);}},
  tp:(x,z)=>{P.x=x;P.z=z;P.y=support(x,z,99);P.vy=0;},act:()=>{const a=findAct();if(a&&a.fn)a.fn();return a&&a.label;},findAct:()=>{const a=findAct();return a&&a.label;},
  talkTo:id=>{const n=NPCS.find(n=>n.id===id);if(n){P.x=n.x+1;P.z=n.z;P.y=height(P.x,P.z);onTalk(n);}},opt:i=>{const b=dlgOpts.children[i];if(b)b.click();},card:()=>cardGo.click(),
  dlg:()=>({who:dlgWho.textContent,say:dlgSay.textContent,opts:[...dlgOpts.children].map(b=>b.textContent),hidden:dlgWrap.hidden}),
  council,startDispute,stonePlacement,finale,syncWorld,tryBuild,kaabaFromG,currentTarget,setD,dst,doorPt,goat,giftSheep,lost,widow,child,MUD,BRUSH,PEN,SACKS,storeDoor,CINE:()=>CINE,horse:()=>horse,BREAD_T:()=>BREAD_T,ride:()=>P.ride,cineSkip:()=>{while(CINE){CINE.t=999;stepCine(.016);}},setTime,setStyle,heroPos:()=>[P.x,P.y,P.z]};

/* ---------- on-screen direction pad (optional; on by default for touch) ---------- */
function dpadApply(){$('#dpad').hidden=!DP.on||!started;tBtns.hidden=!(isTouch||DP.on)||!started;if(DP.on)hintEl.hidden=true;$('#m-dpad').textContent='Yön tuşları: '+(DP.on?'Açık':'Kapalı');}
$('#m-dpad').addEventListener('click',()=>{DP.on=!DP.on;try{localStorage.setItem('bekke-dpad',DP.on?'1':'0');}catch(_){}DP.f=DP.t=0;dpadApply();});
document.querySelectorAll('#dpad button').forEach(b=>{const d=b.dataset.d;
  if(d==='run'){b.addEventListener('click',()=>{DP.run=!DP.run;b.classList.toggle('on',DP.run);b.setAttribute('aria-pressed',DP.run);});return;}
  const set=v=>{if(d==='f')DP.f=v;else if(d==='b')DP.f=-v;else if(d==='l')DP.t=-v;else DP.t=v;b.classList.toggle('on',!!v);};
  b.addEventListener('pointerdown',e=>{e.preventDefault();auInit();try{b.setPointerCapture(e.pointerId);}catch(_){}set(1);});
  for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>{if((d==='f'&&DP.f>0)||(d==='b'&&DP.f<0)||(d==='l'&&DP.t<0)||(d==='r'&&DP.t>0))set(0);});
  b.addEventListener('contextmenu',e=>e.preventDefault());});
dpadApply();

$('#m-lang').textContent=LANG==='en'?'Türkçe':'English';$('#m-lang').setAttribute('lang',LANG==='en'?'tr':'en');
$('#m-lang').addEventListener('click',()=>{try{localStorage.setItem('bekke-lang',LANG==='en'?'tr':'en');}catch(_){}location.reload();});
