/* ===================== Bekke: Kâbe'nin İnşası — core ===================== */
const V3=THREE.Vector3;
setStyle(8);
setShadowExtent(38);

/* ---------- platforming solids ---------- */
const SOL=[];
function addSolid(cx,cz,hw,hd,th,top,o){o=o||{};const s={cx,cz,hw,hd,c:Math.cos(th),s:Math.sin(th),rad:Math.hypot(hw,hd),top,camTop:o.camTop!=null?o.camTop:top,climb:!o.noClimb,tag:o.tag||''};SOL.push(s);return s;}
function toLocal(o,x,z){const dx=x-o.cx,dz=z-o.cz;return [dx*o.c-dz*o.s,dx*o.s+dz*o.c];}
function hWorld(h,lx,lz){const c=Math.cos(h.th),s=Math.sin(h.th);return [h.x+lx*c+lz*s,h.z-lx*s+lz*c];}
for(const h of houses){
  h.sol=addSolid(h.x,h.z,h.w/2,h.d/2,h.th,h.y0+h.H,{tag:'ev'});
  if(h.up){const [wx,wz]=hWorld(h,h.up.ux,h.up.uz);h.upSol=addSolid(wx,wz,h.up.uw/2,h.up.ud/2,h.th,h.up.uy+2.9,{tag:'oda'});}
}
const KSOL=addSolid(0,0,KW/2,KD/2,KROT,1e4,{noClimb:true,camTop:KH+.2,tag:'kabe'});
function syncKaabaSolid(){const k=KSTATE;KSOL.cx=KOBB.cx;KSOL.cz=KOBB.cz;KSOL.hw=KOBB.hw;KSOL.rad=KOBB.rad;
  if(k.old){KSOL.climb=false;KSOL.top=1e4;KSOL.camTop=OLD_H+.2;}
  else if((k.wallH||0)<.6){KSOL.climb=true;KSOL.top=k.green?.42:.05;KSOL.camTop=.5;}
  else{KSOL.climb=false;KSOL.top=1e4;KSOL.camTop=k.wallH+.2;}}
function kaaba(o){setKaaba(o);syncKaabaSolid();}
for(const o of OBBS)if(o.tag==='cadir')addSolid(o.cx,o.cz,o.hw,o.hd,Math.atan2(o.s,o.c),height(o.cx,o.cz)+2.1,{noClimb:true,tag:'cadir'});

/* ---------- crates: the way up to the roofs ---------- */
const crateTex=canvasTex(128,128,(g,w,h)=>{g.fillStyle='#9a6c42';g.fillRect(0,0,w,h);g.fillStyle='rgba(30,18,10,.45)';for(let y=0;y<h;y+=32)g.fillRect(0,y,w,3);
  g.strokeStyle='#5a3a20';g.lineWidth=12;g.strokeRect(6,6,w-12,h-12);g.lineWidth=9;g.beginPath();g.moveTo(10,h-10);g.lineTo(w-10,10);g.stroke();});
const crateM=[],crateRng=mulberry32(1453);
function addCrate(h,side){
  let lx=side*(h.w/2-.75);if(Math.abs(lx-h.dx)<1.4)lx=-lx;if(Math.abs(lx-h.dx)<1.4)return null;
  const lz=-h.d/2-.62,[wx,wz]=hWorld(h,lx,lz),gy=height(wx,wz),sz=1.1,rot=h.th+(crateRng()-.5)*.12;
  crateM.push(new THREE.Matrix4().compose(new V3(wx,gy+sz/2,wz),new THREE.Quaternion().setFromAxisAngle(UP,rot),new V3(sz,sz,sz)));
  h.crate=addSolid(wx,wz,sz/2,sz/2,rot,gy+sz,{tag:'sandik'});return h.crate;
}
for(const h of houses){if(h.darun||h.awn)continue;const r=Math.hypot(h.x,h.z);if(r<110&&crateRng()<.3)addCrate(h,crateRng()<.5?-1:1);}

/* ---------- helpers ---------- */
const rr=h=>Math.hypot(h.x,h.z);
function doorPt(h){const [x,z]=hWorld(h,h.dx,-h.d/2-1.1);return new V3(x,height(x,z),z);}
function blockedAt(x,z,pad){pad=pad||.6;for(const o of SOL){const [lx,lz]=toLocal(o,x,z);if(Math.abs(lx)<o.hw+pad&&Math.abs(lz)<o.hd+pad)return true;}
  for(const c of CIRC){if(!c.off&&Math.hypot(x-c.x,z-c.z)<c.r+pad)return true;}if(Math.abs(x+.06*z)>88)return true;return false;}
function freeSpot(x,z,pad){if(!blockedAt(x,z,pad))return {x,z};for(let r=1;r<30;r+=.7){for(let a=0;a<6.28;a+=.5){const px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;if(!blockedAt(px,pz,pad))return {x:px,z:pz};}}return {x,z};}
const claimed=new Set();
function houseNear(x,z,filter){let best=null,bd=1e9;for(const h of houses){if(claimed.has(h)||(filter&&!filter(h)))continue;const d=Math.hypot(h.x-x,h.z-z);if(d<bd){bd=d;best=h;}}if(best)claimed.add(best);return best;}

/* ---------- player ---------- */
const R=.32,GRAV=20,REACH=1.95,STEP=.45;
const P={x:24,y:0,z:-6,vy:0,ground:true,face:0,speed:0,phase:0,water:0,jar:false,mantle:null,airTop:0,run:false,jbuf:0,coy:0,cut:true,slosh:0,pvx:0,pvz:0,busy:0,busyCb:null,busyAnim:'',stepSign:1,carry:null};
P.y=height(P.x,P.z);P.face=Math.atan2(-P.x,-P.z);
const cam={yaw:P.face+Math.PI,pitch:.3,dist:6.4,cur:6.4,lastDrag:-10};
function heavy(){return P.carry&&(P.carry==='stone'||P.carry==='wood'||P.carry==='sack'||P.carry==='tools');}
function support(x,z,y){let gy=height(x,z);for(const o of SOL){if(!o.climb)continue;const dx=x-o.cx,dz=z-o.cz;if(Math.abs(dx)>o.rad+.3||Math.abs(dz)>o.rad+.3)continue;
  const [lx,lz]=toLocal(o,x,z);if(Math.abs(lx)<=o.hw+.1&&Math.abs(lz)<=o.hd+.1&&y>=o.top-STEP&&o.top>gy)gy=o.top;}return gy;}
function collideEnt(e,r,ey){
  let contact=null;
  for(const o of SOL){
    if(o.climb&&ey>=o.top-STEP)continue;
    const dx=e.x-o.cx,dz=e.z-o.cz;if(Math.abs(dx)>o.rad+r||Math.abs(dz)>o.rad+r)continue;
    const lx=dx*o.c-dz*o.s,lz=dx*o.s+dz*o.c;const qx=Math.max(-o.hw,Math.min(o.hw,lx)),qz=Math.max(-o.hd,Math.min(o.hd,lz));
    let ex=lx-qx,ez=lz-qz,dist=Math.hypot(ex,ez),nlx,nlz,ux,uz;
    if(dist>1e-6){if(dist>=r)continue;ux=ex/dist;uz=ez/dist;nlx=lx+ux*(r-dist);nlz=lz+uz*(r-dist);}
    else{if(o.hw-Math.abs(lx)<o.hd-Math.abs(lz)){ux=Math.sign(lx||1);uz=0;nlx=ux*(o.hw+r);nlz=lz;}else{uz=Math.sign(lz||1);ux=0;nlz=uz*(o.hd+r);nlx=lx;}}
    e.x=o.cx+nlx*o.c+nlz*o.s;e.z=o.cz-nlx*o.s+nlz*o.c;
    const nx=ux*o.c+uz*o.s,nz=-ux*o.s+uz*o.c;
    if(!contact||o.top<contact.o.top)contact={o,nx,nz};
  }
  for(const c of CIRC){if(c.off)continue;const dx=e.x-c.x,dz=e.z-c.z,d=Math.hypot(dx,dz),m=c.r+r;if(d<m&&d>1e-6){e.x=c.x+dx/d*m;e.z=c.z+dz/d*m;}}
  const vd=e.x+.06*e.z;if(Math.abs(vd)>93)e.x-=(Math.abs(vd)-93)*Math.sign(vd);
  if(Math.abs(e.z)>360)e.z=Math.sign(e.z)*360;
  return contact;
}
function tryMantle(ct){
  if(heavy()||P.ride||!ct||!ct.o.climb)return false;const o=ct.o,dh=o.top-P.y;if(dh<=STEP||dh>REACH)return false;
  const tx=P.x-ct.nx*(R+.5),tz=P.z-ct.nz*(R+.5);const [lx,lz]=toLocal(o,tx,tz);if(Math.abs(lx)>o.hw+.05||Math.abs(lz)>o.hd+.05)return false;
  for(const q of SOL){if(q===o)continue;const [qx,qz]=toLocal(q,tx,tz);if(Math.abs(qx)<q.hw+R&&Math.abs(qz)<q.hd+R&&q.top>o.top+.3)return false;}
  P.mantle={t:0,fx:P.x,fy:P.y,fz:P.z,tx,ty:o.top,tz};P.vy=0;P.face=Math.atan2(ct.nx,ct.nz);slosh(.42);sfx.climb();return true;
}

/* ---------- input ---------- */
const keys={};let jumpQ=false,actQ=false;
const DP={on:(()=>{try{const v=localStorage.getItem('bekke-dpad');if(v!=null)return v==='1';}catch(_){}return isTouch;})(),f:0,t:0,run:false};
addEventListener('keydown',e=>{
  if(e.code==='Escape'){if(overlay()){closeOverlays();return;}if(state==='play')openMenu();else if(state==='menu'&&started)closeMenu();return;}
  if(state==='card'&&(e.code==='Enter'||e.code==='Space'||e.code==='KeyE')){e.preventDefault();cardGo.click();return;}
  if(state==='dlg'){const n=+e.key;if(n>=1&&n<=4){const b=dlgOpts.children[n-1];if(b){e.preventDefault();b.click();}}else if(e.code==='Enter'||e.code==='Space'||e.code==='KeyE'){const b=dlgOpts.children[0];if(b&&dlgOpts.children.length===1){e.preventDefault();b.click();}}return;}
  if(state==='play'&&!overlay()){if(e.code==='KeyB'){openBook();return;}if(e.code==='KeyM'){openMap();return;}}
  if(state!=='play'||overlay())return;
  keys[e.code]=true;
  if(e.code==='Space'){jumpQ=true;e.preventDefault();}
  if(e.code==='KeyE'||e.code==='Enter')actQ=true;
  if(e.code==='KeyQ')dropCarry();
  if(e.code.startsWith('Arrow'))e.preventDefault();
});
addEventListener('keyup',e=>{keys[e.code]=false;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
const cv=renderer.domElement,joyEl=$('#joy'),knob=joyEl.querySelector('i');
const joy={id:null,cx:0,cy:0,x:0,y:0,mag:0};const looks=new Map();
cv.addEventListener('pointerdown',e=>{
  if(state==='title'||state==='menu')return;auInit();
  try{cv.setPointerCapture(e.pointerId);}catch(_){}
  if(e.pointerType==='touch'&&joy.id===null&&e.clientX<innerWidth*.45){joy.id=e.pointerId;joy.cx=e.clientX;joy.cy=e.clientY;joy.x=joy.y=joy.mag=0;
    joyEl.style.left=joy.cx+'px';joyEl.style.top=joy.cy+'px';knob.style.transform='';joyEl.hidden=false;return;}
  looks.set(e.pointerId,{x:e.clientX,y:e.clientY});
});
cv.addEventListener('pointermove',e=>{
  if(e.pointerId===joy.id){let dx=e.clientX-joy.cx,dy=e.clientY-joy.cy;const l=Math.hypot(dx,dy),RR=54;if(l>RR){dx*=RR/l;dy*=RR/l;}
    joy.x=dx/RR;joy.y=-dy/RR;joy.mag=Math.min(1,l/RR);knob.style.transform=`translate(${dx}px,${dy}px)`;return;}
  const p=looks.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
  const k=e.pointerType==='touch'?.006:.004;cam.yaw-=dx*k;cam.pitch=Math.max(-.15,Math.min(1.2,cam.pitch+dy*k));cam.lastDrag=clock;
});
function endPtr(e){if(e.pointerId===joy.id){joy.id=null;joy.x=joy.y=joy.mag=0;joyEl.hidden=true;return;}looks.delete(e.pointerId);}
cv.addEventListener('pointerup',endPtr);cv.addEventListener('pointercancel',endPtr);
cv.addEventListener('wheel',e=>{e.preventDefault();cam.dist=Math.max(3,Math.min(14,cam.dist*(1+e.deltaY*.001)));},{passive:false});
let tJumpHeld=false;
$('#t-jump').addEventListener('pointerdown',e=>{e.preventDefault();jumpQ=true;tJumpHeld=true;auInit();});
for(const ev of ['pointerup','pointercancel','pointerleave'])$('#t-jump').addEventListener(ev,()=>{tJumpHeld=false;});
function jumpHeld(){return !!keys.Space||tJumpHeld;}
$('#t-act').addEventListener('pointerdown',e=>{e.preventDefault();actQ=true;});

/* ---------- sound (synthesised, no files) ---------- */
const AU={ctx:null,on:true,master:null,noise:null,rainG:null};
function auInit(){if(AU.ctx)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=AU.ctx=new C();
  AU.master=c.createGain();AU.master.gain.value=AU.on?.7:0;AU.master.connect(c.destination);
  const b=AU.noise=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=b.getChannelData(0);let last=0;for(let i=0;i<d.length;i++){const w=Math.random()*2-1;last=(last+.02*w)/1.02;d[i]=w*.5+last*3;}
  const src=c.createBufferSource();src.buffer=b;src.loop=true;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=380;const g=c.createGain();g.gain.value=.04;
  const lfo=c.createOscillator();lfo.frequency.value=.07;const lg=c.createGain();lg.gain.value=160;lfo.connect(lg).connect(f.frequency);lfo.start();
  src.connect(f).connect(g).connect(AU.master);src.start();
  const rs=c.createBufferSource();rs.buffer=b;rs.loop=true;const rf=c.createBiquadFilter();rf.type='bandpass';rf.frequency.value=2400;rf.Q.value=.4;AU.rainG=c.createGain();AU.rainG.gain.value=0;rs.connect(rf).connect(AU.rainG).connect(AU.master);rs.start();
  }catch(e){AU.ctx=null;}}
function nz(dur,freq,q,gain,type,sweep,delay){const c=AU.ctx;if(!c||!AU.on)return;const t=c.currentTime+(delay||0),s=c.createBufferSource();s.buffer=AU.noise;
  const f=c.createBiquadFilter();f.type=type||'bandpass';f.frequency.setValueAtTime(freq,t);if(sweep)f.frequency.exponentialRampToValueAtTime(sweep,t+dur);f.Q.value=q;
  const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  s.connect(f).connect(g).connect(AU.master);s.start(t,Math.random()*1.5);s.stop(t+dur+.05);}
function tone(freq,dur,gain,delay,type){const c=AU.ctx;if(!c||!AU.on)return;const t=c.currentTime+(delay||0),o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.value=freq;
  const o2=c.createOscillator();o2.type='triangle';o2.frequency.value=freq*2.01;const g2=c.createGain();g2.gain.value=.25;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);o2.connect(g2).connect(g);g.connect(AU.master);o.start(t);o2.start(t);o.stop(t+dur+.05);o2.stop(t+dur+.05);}
function pluck(freq,delay,gain){const c=AU.ctx;if(!c||!AU.on)return;const t=c.currentTime+(delay||0),o=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain();
  o.type='sawtooth';o.frequency.value=freq;f.type='lowpass';f.frequency.setValueAtTime(freq*6,t);f.frequency.exponentialRampToValueAtTime(freq*1.2,t+.5);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain||.08,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+1.1);o.connect(f).connect(g).connect(AU.master);o.start(t);o.stop(t+1.2);}
// Hicaz-flavoured scale on D
const HIC=[146.83,155.56,185.0,196.0,220.0,233.08,261.63,293.66,311.13,369.99,392.0,440.0];
const sfx={
  step:run=>nz(run?.07:.09,260+Math.random()*160,1.1,run?.16:.11,'lowpass'),
  jump:()=>nz(.16,700,.7,.07,'bandpass',1500),
  climb:()=>{nz(.12,500,.9,.1,'lowpass');nz(.18,900,.7,.06,'bandpass',400);},
  land:k=>nz(.18+.12*k,160,.8,.1+.25*k,'lowpass'),
  splash:()=>{nz(.45,1800,.5,.2,'bandpass',600);nz(.3,700,.9,.12,'bandpass');},
  pour:()=>{nz(.85,500,.6,.09,'bandpass',2200);nz(.85,1200,.4,.05,'highpass');},
  pick:()=>{nz(.12,220,1,.22,'lowpass');nz(.08,1600,2,.05,'bandpass');},
  thunk:()=>{nz(.25,120,1,.35,'lowpass');nz(.1,900,3,.08,'bandpass');},
  dig:()=>nz(.22,500,.8,.16,'bandpass',200),
  bleat:()=>{const c=AU.ctx;if(!c||!AU.on)return;const t=c.currentTime,o=c.createOscillator(),g=c.createGain(),l=c.createOscillator(),lg=c.createGain();o.type='sawtooth';o.frequency.value=520+Math.random()*80;l.frequency.value=24;lg.gain.value=30;l.connect(lg).connect(o.frequency);
    const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=1200;f.Q.value=1.4;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.07,t+.05);g.gain.exponentialRampToValueAtTime(.0001,t+.55);o.connect(f).connect(g).connect(AU.master);o.start(t);l.start(t);o.stop(t+.6);l.stop(t+.6);},
  camel:()=>{nz(.6,180,2,.18,'bandpass',120);nz(.4,90,1,.12,'lowpass');},
  thunder:()=>{nz(2.6,90,.7,.5,'lowpass',40);nz(1.2,300,.6,.15,'lowpass',80,.1);},
  good:()=>{[0,2,4,7].forEach((n,i)=>pluck(HIC[n+3],i*.11,.07));tone(HIC[10],1.6,.04,.45);},
  build:()=>{[0,4,7,11].forEach((n,i)=>pluck(HIC[n],i*.16,.08));nz(.6,140,.8,.25,'lowpass');},
  page:()=>{[7,9,11].forEach((n,i)=>tone(HIC[n],1.1,.05,i*.09));},
  wing:()=>nz(.25,600,.8,.12,'bandpass',300),
  ui:()=>tone(HIC[7],.25,.04)
};
function buzz(ms){try{navigator.vibrate&&navigator.vibrate(ms);}catch(_){}}

/* ---------- particles ---------- */
const FX=(()=>{const n=160,pos=new Float32Array(n*3),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const ptsD=new THREE.Points(geo,new THREE.PointsMaterial({color:0xb59a78,size:.34,transparent:true,opacity:.6,depthWrite:false}));ptsD.frustumCulled=false;scene.add(ptsD);
  const parts=[];for(let i=0;i<n;i++){parts.push({x:0,y:-999,z:0,vx:0,vy:0,vz:0,life:0});pos[i*3+1]=-999;}
  return {geo,pos,parts,i:0};})();
const FXW=(()=>{const n=60,pos=new Float32Array(n*3),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const p=new THREE.Points(geo,new THREE.PointsMaterial({color:0x5b86c4,size:.11,transparent:true,opacity:.9,depthWrite:false}));p.frustumCulled=false;scene.add(p);
  const parts=[];for(let i=0;i<n;i++){parts.push({x:0,y:-999,z:0,vx:0,vy:0,vz:0,life:0});pos[i*3+1]=-999;}return {geo,pos,parts,i:0};})();
const FXG=(()=>{const n=80,pos=new Float32Array(n*3),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const p=new THREE.Points(geo,new THREE.PointsMaterial({color:0xffd27a,size:.18,transparent:true,opacity:.95,depthWrite:false,blending:THREE.AdditiveBlending}));p.frustumCulled=false;scene.add(p);
  const parts=[];for(let i=0;i<n;i++){parts.push({x:0,y:-999,z:0,vx:0,vy:0,vz:0,life:0});pos[i*3+1]=-999;}return {geo,pos,parts,i:0};})();
function puff(x,y,z,n){if(reduce)return;for(let k=0;k<n;k++){const p=FX.parts[FX.i=(FX.i+1)%FX.parts.length];const a=Math.random()*6.28,s=.6+Math.random()*1.2;
  p.x=x;p.y=y+.08;p.z=z;p.vx=Math.cos(a)*s;p.vz=Math.sin(a)*s;p.vy=.4+Math.random()*.6;p.life=.6+Math.random()*.4;}}
function sparkle(x,y,z,n){for(let k=0;k<n;k++){const p=FXG.parts[FXG.i=(FXG.i+1)%FXG.parts.length];const a=Math.random()*6.28,s=.4+Math.random()*1.4;
  p.x=x;p.y=y;p.z=z;p.vx=Math.cos(a)*s;p.vz=Math.sin(a)*s;p.vy=1.2+Math.random()*1.8;p.life=.9+Math.random()*.5;}}
function splash(){const fx=-Math.sin(P.face),fz=-Math.cos(P.face);
  for(let k=0;k<22;k++){const p=FXW.parts[FXW.i=(FXW.i+1)%FXW.parts.length];p.x=P.x;p.y=P.y+1.4;p.z=P.z;
    p.vx=fx*(.5+Math.random()*1.5)+(Math.random()-.5)*2;p.vz=fz*(.5+Math.random()*1.5)+(Math.random()-.5)*2;p.vy=1+Math.random()*2;p.life=.9;}}
function stepFX(dt){
  for(const [F,grav,drag] of [[FX,-.4,2.5],[FXW,-9.8,.2],[FXG,-1.2,1.2]]){const pos=F.pos;for(let i=0;i<F.parts.length;i++){const p=F.parts[i];
    if(p.life>0){p.life-=dt;p.vy+=grav*dt;const k=Math.exp(-drag*dt);p.vx*=k;p.vz*=k;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;if(p.life<=0)p.y=-999;}
    pos[i*3]=p.x;pos[i*3+1]=p.y;pos[i*3+2]=p.z;}F.geo.attributes.position.needsUpdate=true;}
}

/* ---------- rain, flood, puddles ---------- */
const RAIN=(()=>{const n=isTouch?900:1800,pos=new Float32Array(n*6),r=mulberry32(19);for(let i=0;i<n;i++){const x=(r()*2-1)*30,y=r()*22,z=(r()*2-1)*30;pos.set([x,y,z,x+.05,y+.55,z+.02],i*6);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const m=new THREE.LineBasicMaterial({color:0xdfe7ef,transparent:true,opacity:0,depthWrite:false});const l=new THREE.LineSegments(g,m);l.frustumCulled=false;scene.add(l);return {l,m,pos,n,amt:0,target:0};})();
function stepRain(dt){RAIN.amt+=(RAIN.target-RAIN.amt)*Math.min(1,dt*.6);RAIN.m.opacity=RAIN.amt*.45;RAIN.l.visible=RAIN.amt>.02;
  if(AU.rainG)AU.rainG.gain.value=RAIN.amt*.09;
  if(!RAIN.l.visible)return;const p=RAIN.pos,cx=camera.position.x,cy=camera.position.y,cz=camera.position.z,v=22*dt;
  for(let i=0;i<RAIN.n;i++){const o=i*6;p[o+1]-=v;p[o+4]-=v;if(p[o+1]<cy-8){const dy=22;p[o+1]+=dy;p[o+4]+=dy;}
    for(const k of [0,2]){const c=k===0?cx:cz;if(p[o+k]-c>30){p[o+k]-=60;p[o+3+k]-=60;}else if(p[o+k]-c<-30){p[o+k]+=60;p[o+3+k]+=60;}}
    if(p[o+1]>cy+16){p[o+1]-=22;p[o+4]-=22;}}
  RAIN.l.geometry.attributes.position.needsUpdate=true;}
const flood=new THREE.Mesh(new THREE.CircleGeometry(30,48),new THREE.MeshPhongMaterial({color:0x7a705e,transparent:true,opacity:.72,shininess:110,specular:0xb8c0c8,depthWrite:false}));
flood.rotation.x=-Math.PI/2;flood.position.y=.42;flood.visible=false;scene.add(flood);
const puddles=(()=>{const g=new THREE.CircleGeometry(1,20);const m=new THREE.MeshPhongMaterial({color:0x6b5a48,transparent:true,opacity:.7,shininess:80,specular:0x888888,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3});
  const list=[],r=mulberry32(33);for(let t=0;t<400&&list.length<70;t++){const x=(r()*2-1)*80,z=(r()*2-1)*200;if(blockedAt(x,z,.5)||Math.hypot(x,z)<14)continue;const s=.6+r()*1.8;
    list.push(new THREE.Matrix4().compose(new V3(x,height(x,z)+.03,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI/2,0,r()*6)),new V3(s*(1+r()),s,1)));}
  const im=new THREE.InstancedMesh(g,m,list.length);list.forEach((mm,i)=>im.setMatrixAt(i,mm));im.frustumCulled=false;scene.add(im);return im;})();

/* ---------- characters: soft, rounded, readable ---------- */
const Lm=c=>QL.std?new THREE.MeshStandardMaterial({color:c,roughness:.88,metalness:0}):new THREE.MeshLambertMaterial({color:c});
const eyeM=new THREE.MeshBasicMaterial({color:0x1c1410});
/* people: merged, vertex-coloured parts (6 draw calls a person), soft rounded style with readable faces */
const PERSON_MAT=QL.std?new THREE.MeshStandardMaterial({vertexColors:true,roughness:.86,metalness:0}):new THREE.MeshLambertMaterial({vertexColors:true});
const _pc=new THREE.Color();
function mergeParts(parts){let n=0;const gs=[],ranges={};
  for(const [g,c,m,tag] of parts){const gg=g.index?g.toNonIndexed():g.clone();if(m)gg.applyMatrix4(m);const cnt=gg.attributes.position.count;if(tag)ranges[tag]=(ranges[tag]||[]).concat([[n,cnt]]);gs.push([gg,c,cnt]);n+=cnt;}
  const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3);let o=0;
  for(const [g,c,cnt] of gs){pos.set(g.attributes.position.array,o*3);nor.set(g.attributes.normal.array,o*3);_pc.set(c);for(let i=0;i<cnt;i++){col[(o+i)*3]=_pc.r;col[(o+i)*3+1]=_pc.g;col[(o+i)*3+2]=_pc.b;}o+=cnt;g.dispose();}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.BufferAttribute(nor,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.userData.ranges=ranges;return geo;}
const MX=(x,y,z,rx,ry,rz,sx,sy,sz)=>new THREE.Matrix4().compose(new THREE.Vector3(x||0,y||0,z||0),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx||0,ry||0,rz||0)),new THREE.Vector3(sx==null?1:sx,sy==null?(sx==null?1:sx):sy,sz==null?(sx==null?1:sx):sz));
const shade=(hex,k)=>{const c=new THREE.Color(hex);c.multiplyScalar(k);return c.getHex();};
const SKIN=[0xc89a74,0xb07f5c,0x9a6a4a,0xd6aa84,0x8a5c3e];
const ROBE=[0x2f5d8a,0x8a3a2c,0xc58b3a,0x4d6b3a,0x6b4a7a,0xe8dcc4,0x3d6f74,0xa0522d,0x7c7f86];
const CLOTH=[0xf2e8d5,0xe9dcc0,0xd8c7a8,0x3a3a44,0xc9b28a];
const pick=a=>a[(Math.random()*a.length)|0];
function makePerson(o){
  o=o||{};const s=o.scale||1;const g=new THREE.Group();const body=new THREE.Group();g.add(body);body.scale.setScalar(s);
  const robe=o.robe!=null?o.robe:pick(ROBE),cloth=o.cloth!=null?o.cloth:pick(CLOTH),skin=o.skin!=null?o.skin:pick(SKIN),hair=0x241a14;
  const child=s<.8,female=!!o.female,style=o.hat||(female?'veil':child?'hair':(Math.random()<.45?'turban':'scarf'));
  const cloak=o.cloak!==undefined?o.cloak:(!female&&!child&&Math.random()<.4?pick([0xe8dcc4,0x8a6a4a,0x3a3430,0xb59a74]):null);
  // ---- body
  const prof=female?[[0,.04],[.36,.04],[.35,.16],[.31,.45],[.26,.72],[.235,.9],[.16,1.0],[.1,1.06],[0,1.07]]:[[0,.32],[.31,.32],[.3,.42],[.27,.62],[.245,.8],[.225,.94],[.15,1.03],[.09,1.07],[0,1.08]];
  const bp=[[new THREE.LatheGeometry(prof.map(p=>new THREE.Vector2(p[0],p[1])),22),robe,null,'robe']];
  const hemY=female?.06:.34,hemR=female?.355:.305;
  bp.push([new THREE.TorusGeometry(hemR,.022,5,24),o.trim||shade(robe,.62),MX(0,hemY,0,Math.PI/2),'trim']);
  if(!female){bp.push([new THREE.TorusGeometry(.262,.036,6,22),o.sashC||0x8a3526,MX(0,.62,0,Math.PI/2)]);bp.push([new THREE.BoxGeometry(.07,.26,.03),o.sashC||0x8a3526,MX(.12,.5,.22,0,0,.1)]);}
  if(cloak)bp.push([new THREE.CylinderGeometry(.255,.33,.62,20,1,true,Math.PI*.38,Math.PI*1.24),cloak,MX(0,.74,-.01)]);
  bp.push([new THREE.CylinderGeometry(.07,.08,.12,10),skin,MX(0,1.1,0)]);
  const bm=new THREE.Mesh(mergeParts(bp),QL.std?new THREE.MeshStandardMaterial({vertexColors:true,roughness:.88,metalness:0}):new THREE.MeshLambertMaterial({vertexColors:true}));body.add(bm);
  // ---- head
  const head=new THREE.Group();head.position.y=1.27;body.add(head);
  const hp=[[new THREE.SphereGeometry(.205,20,16),skin,MX(0,0,0,0,0,0,1,1.05,1)]];
  for(const sx of [-1,1]){
    hp.push([new THREE.SphereGeometry(.045,10,8),0xfbf8f2,MX(sx*.078,.012,.172,0,0,0,1,1.18,.55)]);
    hp.push([new THREE.SphereGeometry(.03,10,8),0x2a1c14,MX(sx*.078,.006,.194,0,0,0,1,1.15,.5)]);
    hp.push([new THREE.SphereGeometry(.009,6,5),0xffffff,MX(sx*.078+.01,.02,.209)]);
    hp.push([new THREE.BoxGeometry(.07,.014,.012),o.beard&&o.beard>0xaaaaaa?0xd8d2c8:hair,MX(sx*.08,.078,.19,0,0,sx*-.12)]);
    if(female||child)hp.push([new THREE.SphereGeometry(.03,8,6),0xe7907a,MX(sx*.115,-.052,.163,0,0,0,1,.6,.4)]);}
  hp.push([new THREE.SphereGeometry(.026,8,6),shade(skin,.9),MX(0,-.028,.2,0,0,0,1,.9,1)]);
  if(o.beard)hp.push([new THREE.SphereGeometry(.13,12,9),o.beard,MX(0,-.14,.1,0,0,0,1.05,.85,.62)]);
  if(style==='turban'){hp.push([new THREE.SphereGeometry(.212,18,10,0,Math.PI*2,0,Math.PI*.45),cloth,MX(0,.04,0)]);
    hp.push([new THREE.TorusGeometry(.2,.062,8,22),cloth,MX(0,.1,0,Math.PI/2+.12)]);hp.push([new THREE.TorusGeometry(.185,.05,8,22),shade(cloth,.9),MX(0,.16,0,Math.PI/2-.1)]);
    hp.push([new THREE.BoxGeometry(.09,.34,.02),cloth,MX(-.06,-.12,-.19,.15)]);}
  else if(style==='scarf'){hp.push([new THREE.SphereGeometry(.232,18,10,0,Math.PI*2,0,Math.PI*.5),cloth,MX(0,.03,0)]);
    hp.push([new THREE.TorusGeometry(.216,.036,6,22),o.band||0x2a2420,MX(0,.09,0,Math.PI/2)]);
    hp.push([new THREE.CylinderGeometry(.205,.27,.42,18,1,true,Math.PI*.42,Math.PI*1.16),cloth,MX(0,-.14,-.02)]);}
  else if(style==='veil'){hp.push([new THREE.SphereGeometry(.245,18,12,0,Math.PI*2,0,Math.PI*.6),cloth,MX(0,.03,-.03,-.32)]);
    hp.push([new THREE.CylinderGeometry(.22,.34,.78,18,1,true,Math.PI*.3,Math.PI*1.4),cloth,MX(0,-.38,-.05)]);}
  else if(style==='hair'){hp.push([new THREE.SphereGeometry(.214,16,10,0,Math.PI*2,0,Math.PI*.42),hair,MX(0,.03,-.01)]);}
  const hm=new THREE.Mesh(mergeParts(hp),PERSON_MAT);head.add(hm);
  // ---- limbs: legs with sandals, arms with sleeves and hands
  function limb(parts,x,y,z){const piv=new THREE.Group();piv.position.set(x,y,z);piv.add(new THREE.Mesh(mergeParts(parts),PERSON_MAT));body.add(piv);return piv;}
  const legP=()=>[[new THREE.CylinderGeometry(.06,.055,.32,8),0x3a2f28,MX(0,-.16,0)],[new THREE.BoxGeometry(.11,.05,.2),0x6b4a2a,MX(0,-.33,.04)],[new THREE.CylinderGeometry(.052,.05,.05,8),skin,MX(0,-.295,.03)]];
  const legL=limb(legP(),.11,.36,0),legR=limb(legP(),-.11,.36,0);if(female){legL.visible=legR.visible=false;}
  const armP=()=>[[new THREE.CylinderGeometry(.062,.095,.42,10),robe,MX(0,-.2,0)],[new THREE.SphereGeometry(.058,10,8),skin,MX(0,-.45,0)]];
  const armR=limb(armP(),.27,.93,0),armL=limb(armP(),-.27,.93,0);
  g.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;}});
  const p={g,body,head,legL,legR,armL,armR,phase:Math.random()*6,scale:s};
  p.setRobe=hex=>{const geo=bm.geometry,c=geo.attributes.color,r=geo.userData.ranges.robe||[];_pc.set(hex);for(const [st,cnt] of r)for(let i=st;i<st+cnt;i++)c.setXYZ(i,_pc.r,_pc.g,_pc.b);c.needsUpdate=true;
    for(const A of [armL,armR]){const ag=A.children[0].geometry,ac=ag.attributes.color;for(let i=0;i<ac.count;i++){if(i<ac.count*.85)ac.setXYZ(i,_pc.r,_pc.g,_pc.b);}ac.needsUpdate=true;}};
  return p;
}
function animPerson(p,dt,speed,mode){
  const amt=Math.min(1,speed/2.5);p.phase+=dt*(2.2+speed*2)*(amt>.05?1:0);const sw=Math.sin(p.phase);
  if(mode==='talk'){p.armR.rotation.x=-.6+Math.sin(clock*5+p.phase)*.35;p.armR.rotation.z=.2;p.armL.rotation.x=0;p.legL.rotation.x=p.legR.rotation.x=0;p.head.rotation.z=Math.sin(clock*2.3+p.phase)*.06;}
  else if(mode==='carry'){p.armL.rotation.x=p.armR.rotation.x=-2.6;p.legL.rotation.x=sw*.6*amt;p.legR.rotation.x=-sw*.6*amt;}
  else if(mode==='cheer'){p.armL.rotation.x=p.armR.rotation.x=-2.7+Math.sin(clock*8+p.phase)*.3;p.body.position.y=Math.abs(Math.sin(clock*6+p.phase))*.12;}
  else if(mode==='angry'){p.armR.rotation.x=-1.4+Math.sin(clock*9+p.phase)*.4;p.armL.rotation.x=-.3;p.head.rotation.z=0;}
  else if(mode==='cry'){p.armL.rotation.x=p.armR.rotation.x=-1.9;p.armL.rotation.z=-.4;p.armR.rotation.z=.4;p.head.rotation.x=.3+Math.sin(clock*7)*.05;}
  else{p.legL.rotation.x=sw*.7*amt;p.legR.rotation.x=-sw*.7*amt;p.armR.rotation.x=-sw*.5*amt;p.armL.rotation.x=sw*.5*amt;p.armR.rotation.z=0;p.armL.rotation.z=0;
    p.head.rotation.z=0;p.head.rotation.x=0;}
  if(mode!=='cheer')p.body.position.y=amt>.05&&!reduce?Math.abs(sw)*.04*amt:Math.sin(clock*1.6+p.phase)*.006;
}
/* animals */
function makeSheep(col){const g=new THREE.Group(),b=new THREE.Group();g.add(b);const wool=Lm(col||0xf4eee2),dark=Lm(0x2c2420);
  const body=new THREE.Mesh(new THREE.IcosahedronGeometry(.42,1),wool);body.scale.set(.9,.8,1.25);body.position.y=.55;b.add(body);
  for(let i=0;i<5;i++){const t=new THREE.Mesh(new THREE.IcosahedronGeometry(.2,1),wool);t.position.set((i%2?.18:-.18),.78,-.32+i*.16);b.add(t);}
  const head=new THREE.Group();head.position.set(0,.72,.52);b.add(head);const hm=new THREE.Mesh(new THREE.SphereGeometry(.16,12,10),dark);hm.scale.set(.85,.9,1.2);head.add(hm);
  for(const ex of [-.07,.07]){const e=new THREE.Mesh(new THREE.SphereGeometry(.022,6,5),new THREE.MeshBasicMaterial({color:0xffffff}));e.position.set(ex,.04,.15);head.add(e);
    const ear=new THREE.Mesh(new THREE.BoxGeometry(.14,.04,.07),dark);ear.position.set(ex*2.1,.05,0);ear.rotation.z=ex>0?-.4:.4;head.add(ear);}
  const legs=[];const lg=new THREE.CylinderGeometry(.04,.035,.36,6);lg.translate(0,-.18,0);
  for(const [x,z] of [[.17,.3],[-.17,.3],[.17,-.3],[-.17,-.3]]){const l=new THREE.Group();l.position.set(x,.38,z);l.add(new THREE.Mesh(lg,dark));b.add(l);legs.push(l);}
  g.traverse(m=>{if(m.isMesh)m.castShadow=true;});return {g,b,head,legs,phase:Math.random()*6,kind:'sheep',h:.9};}
function makeGoat(){const s=makeSheep(0x8b6243);s.kind='goat';const horn=Lm(0xd8c7a8);for(const x of [-.06,.06]){const h=new THREE.Mesh(new THREE.ConeGeometry(.035,.2,6),horn);h.position.set(x,.15,-.05);h.rotation.x=-.6;s.head.add(h);}return s;}
function makeCamel(){const g=new THREE.Group(),b=new THREE.Group();g.add(b);const fur=Lm(0xc9a06a),dark=Lm(0x8a6a44);
  const body=new THREE.Mesh(new THREE.SphereGeometry(.62,16,12),fur);body.scale.set(.8,.7,1.35);body.position.y=1.55;b.add(body);
  const hump=new THREE.Mesh(new THREE.SphereGeometry(.42,14,10),fur);hump.scale.set(.9,.85,1.1);hump.position.set(0,2.0,-.05);b.add(hump);
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(.13,.2,1.0,10),fur);neck.position.set(0,1.95,.85);neck.rotation.x=.75;b.add(neck);
  const head=new THREE.Group();head.position.set(0,2.4,1.2);b.add(head);const hm=new THREE.Mesh(new THREE.SphereGeometry(.17,12,10),fur);hm.scale.set(.9,.9,1.6);hm.position.z=.12;head.add(hm);
  for(const ex of [-.1,.1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.025,6,5),eyeM);e.position.set(ex,.06,.18);head.add(e);const ear=new THREE.Mesh(new THREE.ConeGeometry(.04,.12,5),fur);ear.position.set(ex*1.2,.15,-.02);head.add(ear);}
  const legs=[];const lg=new THREE.CylinderGeometry(.075,.06,1.25,7);lg.translate(0,-.62,0);
  for(const [x,z] of [[.24,.55],[-.24,.55],[.24,-.55],[-.24,-.55]]){const l=new THREE.Group();l.position.set(x,1.3,z);l.add(new THREE.Mesh(lg,fur));const f=new THREE.Mesh(new THREE.SphereGeometry(.1,8,6),dark);f.scale.y=.4;f.position.y=-1.25;l.add(f);b.add(l);legs.push(l);}
  const saddle=new THREE.Mesh(new THREE.BoxGeometry(.95,.12,.9),Lm(0x8a3a2c));saddle.position.set(0,2.38,-.05);b.add(saddle);
  const load=new THREE.Group();load.position.set(0,2.45,-.05);b.add(load);
  g.traverse(m=>{if(m.isMesh)m.castShadow=true;});return {g,b,head,legs,load,phase:0,kind:'camel',h:2.6};}
function animAnimal(a,dt,speed){const amt=Math.min(1,speed/1.5);a.phase+=dt*(3+speed*3)*(amt>.05?1:0);const sw=Math.sin(a.phase);
  a.legs.forEach((l,i)=>{l.rotation.x=(i===0||i===3?sw:-sw)*.6*amt;});
  a.b.position.y=amt>.05?Math.abs(sw)*.03:0;a.head.rotation.x=amt>.05?0:Math.sin(clock*.8+a.phase)*.15+.1;}

/* carried items (hero hands / camel back) */
const stoneGeo=new THREE.DodecahedronGeometry(.32,0),plankGeo=new THREE.BoxGeometry(1.5,.12,.32),sackGeo=new THREE.SphereGeometry(.3,10,8),bundleGeo=new THREE.CylinderGeometry(.18,.18,.9,8);
const stoneMat=Lm(0x8a8075),sackMat=Lm(0xd8c39a),bushMat=Lm(0x8b7a4a);
function itemMesh(type){const g=new THREE.Group();
  if(type==='stone'){const m=new THREE.Mesh(stoneGeo,stoneMat);m.scale.set(1.15,.85,1);g.add(m);}
  else if(type==='wood'){for(let i=0;i<3;i++){const m=new THREE.Mesh(plankGeo,mat.wood);m.position.y=i*.13;g.add(m);}}
  else if(type==='sack'){const m=new THREE.Mesh(sackGeo,sackMat);m.scale.set(1,.85,1.2);g.add(m);}
  else if(type==='brush'){const m=new THREE.Mesh(bundleGeo,bushMat);m.rotation.z=Math.PI/2;g.add(m);}
  else if(type==='mud'){const m=new THREE.Mesh(stoneGeo,Lm(0x6b5038));m.scale.set(.8,.5,.8);g.add(m);}
  g.traverse(m=>{if(m.isMesh)m.castShadow=true;});return g;}

/* ---------- the hero: a fictional, nameless young Meccan ---------- */
const heroP=makePerson({robe:0x2f6f7a,cloth:0xf3ead6,skin:0xb98a64,sashC:0xd39a2c,band:0xd39a2c,hat:'scarf',cloak:null});
const hero={...heroP,g:heroP.g};scene.add(hero.g);
const jarMesh=new THREE.Mesh(jarGeo,mat.clay);jarMesh.scale.set(.7,.7,.7);jarMesh.position.set(-.3,1.05,.05);jarMesh.rotation.z=.3;hero.body.add(jarMesh);jarMesh.visible=false;
const heldGroup=new THREE.Group();heldGroup.position.set(0,1.62,.05);hero.body.add(heldGroup);
const heroScarf=(()=>{const N=6,pts=[],prev=[],segs=[];for(let i=0;i<N;i++){pts.push(new V3());prev.push(new V3());}
  for(let i=0;i<N-1;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(.13,.02,1),Lm(0xd39a2c));m.castShadow=true;scene.add(m);segs.push(m);}
  return {pts,prev,segs,N,seg:.12,init:false};})();
let heldType=null;
function setHeld(type){if(heldType===type)return;heldType=type;while(heldGroup.children.length)heldGroup.remove(heldGroup.children[0]);
  if(type&&type!=='goat'&&type!=='lamb'){const m=itemMesh(type);heldGroup.add(m);}}
