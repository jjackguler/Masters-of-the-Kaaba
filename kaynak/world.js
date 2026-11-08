'use strict';
const $=s=>document.querySelector(s);
const isTouch=matchMedia('(pointer: coarse)').matches;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(isTouch) document.body.classList.add('touch');

/* ---------- utilities ---------- */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hash(ix,iz){let h=Math.imul(ix,374761393)^Math.imul(iz,668265263);h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296;}
function vnoise(x,z){const ix=Math.floor(x),iz=Math.floor(z),fx=x-ix,fz=z-iz;const a=hash(ix,iz),b=hash(ix+1,iz),c=hash(ix,iz+1),d=hash(ix+1,iz+1);const ux=fx*fx*(3-2*fx),uz=fz*fz*(3-2*fz);return a+(b-a)*ux+(c-a)*uz+(a-b-c+d)*ux*uz;}
function fbm(x,z,o){o=o||4;let s=0,a=.5,f=1;for(let i=0;i<o;i++){s+=a*vnoise(x*f,z*f);f*=2.03;a*=.5;}return s/(1-Math.pow(.5,o));}
const smooth=t=>{t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
const lerp=(a,b,t)=>a+(b-a)*t;
const g2=(x,z,cx,cz,s)=>Math.exp(-((x-cx)*(x-cx)+(z-cz)*(z-cz))/(2*s*s));
const SAFA={x:88,z:22}, MERVE={x:55,z:-300};
function valleyD(x,z){return Math.abs(x+0.06*z);}

/* Batn-ı Mekke: N–S valley floor, Ebû Kubeys east, Kuaykıân west, Kâbe at the lowest point (Bathâ). */
function height(x,z){
  const d=valleyD(x,z), t=smooth((d-85)/170), m=smooth((d-60)/120);
  let h=t*105 + t*(fbm(x*.006+3,z*.006,4)*70-28) + t*fbm(x*.03,z*.03,3)*10;
  h+=m*150*g2(x,z,215,30,75);
  h+=m*135*g2(x,z,-235,-15,90);
  h+=smooth((Math.abs(z)-430)/250)*70*(.6+fbm(x*.01,z*.01,3));
  h+=7*g2(x,z,SAFA.x,SAFA.z,9)+6*g2(x,z,MERVE.x,MERVE.z,9);
  const r=Math.hypot(x,z);
  if(r>32) h+=.35*(fbm(x*.04,z*.04,2)-.5)*smooth((r-32)/20);
  return h;
}

/* ---------- renderer / scene ---------- */
const stage=$('#stage');
const renderer=new THREE.WebGLRenderer({antialias:!isTouch,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,QL.pr));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
stage.appendChild(renderer.domElement);
renderer.domElement.tabIndex=0;
const scene=new THREE.Scene();
scene.fog=new THREE.Fog(0xe3dccd,120,1300);
const camera=new THREE.PerspectiveCamera(68,innerWidth/innerHeight,.1,4000);
camera.rotation.order='YXZ';
const UP=new THREE.Vector3(0,1,0);
const ANISO=renderer.capabilities.getMaxAnisotropy();

function M(x,y,z,ry,sx,sy,sz){const m=new THREE.Matrix4();m.compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromAxisAngle(UP,ry||0),new THREE.Vector3(sx==null?1:sx,sy==null?1:sy,sz==null?1:sz));return m;}

/* merged geometry with world-projected UVs so textures keep real-world scale */
class Batch{
  constructor(){this.p=[];this.n=[];this.u=[];this.i=[];this.c=0;}
  add(geo,mat,su,sv){
    sv=sv||su;const g=geo.clone();g.applyMatrix4(mat);
    const P=g.attributes.position,N=g.attributes.normal;
    for(let k=0;k<P.count;k++){
      const x=P.getX(k),y=P.getY(k),z=P.getZ(k),nx=N.getX(k),ny=N.getY(k),nz=N.getZ(k);
      this.p.push(x,y,z);this.n.push(nx,ny,nz);
      let u,v;
      if(Math.abs(ny)>.7){u=x;v=z;}else{const l=Math.hypot(nx,nz)||1;u=x*(-nz/l)+z*(nx/l);v=y;}
      this.u.push(u/su,v/sv);
    }
    if(g.index){for(let k=0;k<g.index.count;k++)this.i.push(g.index.getX(k)+this.c);}
    else{for(let k=0;k<P.count;k++)this.i.push(k+this.c);}
    this.c+=P.count;g.dispose();
  }
  build(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(this.n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(this.u,2));g.setIndex(this.i);g.computeBoundingSphere();return g;}
}

/* ---------- procedural textures ---------- */
function canvasTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=ANISO;return t;}
function speckle(g,w,h,n,alpha,cols,rnd){for(let i=0;i<n;i++){g.globalAlpha=alpha*rnd();g.fillStyle=cols[(rnd()*cols.length)|0];const s=1+rnd()*2.2;g.fillRect(rnd()*w,rnd()*h,s,s);}g.globalAlpha=1;}
function wrapRect(g,x,y,bw,bh,w){g.fillRect(x,y,bw,bh);if(x+bw>w)g.fillRect(x-w,y,bw,bh);if(x<0)g.fillRect(x+w,y,bw,bh);}

// rough local stone, 4 m tile
const stoneTex=canvasTex(512,512,(g,w,h)=>{const r=mulberry32(11);g.fillStyle='#3d3732';g.fillRect(0,0,w,h);let y=0;
  while(y<h){const ch=Math.round((.32+r()*.22)*128);let x=-r()*70;
    while(x<w){const bw=(.45+r()*.7)*128,s=78+r()*48|0;g.fillStyle=`rgb(${s+10},${s+2},${s-8})`;wrapRect(g,x+3,y+3,bw-6,ch-6,w);
      g.fillStyle='rgba(255,240,220,.08)';wrapRect(g,x+3,y+3,bw-6,3,w);g.fillStyle='rgba(0,0,0,.18)';wrapRect(g,x+3,y+ch-6,bw-6,3,w);x+=bw;}
    y+=ch;}
  speckle(g,w,h,9000,.35,['#1f1b18','#8a8075','#5c544c'],r);});
// mud plaster over mud brick, 4 m tile
const mudTex=canvasTex(512,512,(g,w,h)=>{const r=mulberry32(23);g.fillStyle='#dcc29c';g.fillRect(0,0,w,h);
  for(let i=0;i<420;i++){g.globalAlpha=.11;g.fillStyle=['#e8d2ae','#c4a47c','#dcc098','#bf9f78'][i%4];g.beginPath();g.arc(r()*w,r()*h,8+r()*42,0,7);g.fill();}
  g.globalAlpha=1;
  for(let k=0;k<5;k++){const px=r()*w,py=r()*h,pw=60+r()*90,ph=30+r()*60;g.fillStyle='rgba(150,115,80,.22)';
    for(let by=py;by<py+ph;by+=14){for(let bx=px+((by/14|0)%2)*14;bx<px+pw;bx+=30){g.fillRect(bx,by,26,11);}}}
  g.strokeStyle='rgba(222,200,150,.55)';g.lineWidth=1;for(let i=0;i<500;i++){const x=r()*w,y=r()*h,a=r()*6.3,l=3+r()*6;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke();}
  g.strokeStyle='rgba(70,50,30,.35)';for(let i=0;i<14;i++){let x=r()*w,y=r()*h;g.beginPath();g.moveTo(x,y);for(let s=0;s<6;s++){x+=(r()-.5)*22;y+=r()*16;g.lineTo(x,y);}g.stroke();}
  speckle(g,w,h,7000,.25,['#7d6244','#d9c39b'],r);});
// planks, 2 m tile
const woodTex=canvasTex(256,256,(g,w,h)=>{const r=mulberry32(31);let x=0;
  while(x<w){const pw=26+r()*12|0,s=r();g.fillStyle=`rgb(${88+s*24|0},${60+s*16|0},${38+s*10|0})`;g.fillRect(x,0,pw,h);
    g.strokeStyle='rgba(40,25,15,.35)';for(let k=0;k<6;k++){const gx=x+r()*pw;g.beginPath();g.moveTo(gx,0);for(let y=0;y<=h;y+=16)g.lineTo(gx+Math.sin(y*.05+k)*2.5,y);g.stroke();}
    g.fillStyle='rgba(25,15,8,.8)';g.fillRect(x+pw-2,0,2,h);x+=pw;}
  speckle(g,w,h,1500,.3,['#2a1a10','#a07a55'],r);});
// Kâbe wall: one course of dark stone, one course of timber; 4 m × 3 m tile (ratio is an estimate)
const kaabaTex=canvasTex(512,384,(g,w,h)=>{const r=mulberry32(605);g.fillStyle='#55524e';g.fillRect(0,0,w,h);
  for(let i=0;i<3;i++){const base=h-i*128;
    const sy=base-92;let x=-r()*60;
    while(x<w){const bw=(.5+r()*.65)*128,s=92+r()*24|0;g.fillStyle=`rgb(${s},${s+1},${s+6})`;wrapRect(g,x+3,sy+3,bw-6,86,w);
      g.fillStyle='rgba(255,245,230,.07)';wrapRect(g,x+3,sy+3,bw-6,3,w);x+=bw;}
    const ty=base-128;g.fillStyle='#8a5e3a';g.fillRect(0,ty,w,36);
    g.strokeStyle='rgba(30,18,10,.45)';for(let k=0;k<7;k++){const gy=ty+3+r()*30;g.beginPath();g.moveTo(0,gy);for(let xx=0;xx<=w;xx+=24)g.lineTo(xx,gy+Math.sin(xx*.03+k)*1.4);g.stroke();}
    g.fillStyle='rgba(255,230,200,.10)';g.fillRect(0,ty,w,3);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,ty+33,w,3);
    for(let jx=r()*w;jx<w;jx+=230+r()*60){g.fillStyle='rgba(20,12,6,.8)';g.fillRect(jx,ty,3,36);}}
  speckle(g,w,h,6000,.3,['#151210','#6f665e'],r);});
// unbleached cloth with indigo and madder stripes (representative only)
const fabricTex=canvasTex(256,256,(g,w,h)=>{const r=mulberry32(7);g.fillStyle='#d9cdb3';g.fillRect(0,0,w,h);
  const st=[[30,6,'#33406e'],[42,3,'#7a3b2a'],[96,10,'#33406e'],[150,4,'#7a3b2a'],[200,6,'#33406e'],[212,3,'#7a3b2a']];
  for(const [x,sw,c] of st){g.fillStyle=c;g.globalAlpha=.85;g.fillRect(x,0,sw,h);}
  g.globalAlpha=1;for(let x=0;x<w;x+=2){g.fillStyle=`rgba(0,0,0,${(.04+.06*Math.sin(x*.09))*.8})`;g.fillRect(x,0,2,h);}
  speckle(g,w,h,5000,.2,['#8b7d63','#f3ead8'],r);});
// ground detail (multiplies vertex colour), 10 m tile
const groundTex=canvasTex(256,256,(g,w,h)=>{const r=mulberry32(3);g.fillStyle='#e9e4dc';g.fillRect(0,0,w,h);
  for(let i=0;i<260;i++){g.globalAlpha=.05;g.fillStyle=r()<.5?'#c9c0b2':'#ffffff';g.beginPath();g.arc(r()*w,r()*h,4+r()*22,0,7);g.fill();}
  g.globalAlpha=1;speckle(g,w,h,9000,.3,['#a89f92','#fffaf2','#8d8274'],r);});

const mat={
  stone:new THREE.MeshLambertMaterial({map:stoneTex}),
  mud:new THREE.MeshLambertMaterial({map:mudTex}),
  roof:new THREE.MeshLambertMaterial({map:mudTex,color:0xc9b79c}),
  wood:new THREE.MeshLambertMaterial({map:woodTex}),
  darkWood:new THREE.MeshLambertMaterial({color:0x3b2a1d}),
  dark:new THREE.MeshLambertMaterial({color:0x1d1713}),
  kaaba:new THREE.MeshLambertMaterial({map:kaabaTex}),
  fabric:new THREE.MeshLambertMaterial({map:fabricTex}),
  tent:new THREE.MeshLambertMaterial({color:0x2f2823}),
  clay:new THREE.MeshLambertMaterial({color:0xa3683f}),
};
const BOX=new THREE.BoxGeometry(1,1,1);

/* ---------- terrain ---------- */
let terrainRef=null;
const TS=1400,SEG=isTouch?140:180;
{
  const tg=new THREE.PlaneGeometry(TS,TS,SEG,SEG);tg.rotateX(-Math.PI/2);
  const P=tg.attributes.position;
  for(let i=0;i<P.count;i++)P.setY(i,height(P.getX(i),P.getZ(i)));
  tg.computeVertexNormals();
  const N=tg.attributes.normal,col=new Float32Array(P.count*3);
  for(let i=0;i<P.count;i++){
    const x=P.getX(i),z=P.getZ(i),n=fbm(x*.05,z*.05,3),slope=1-N.getY(i);
    const out=Math.max(g2(x,z,SAFA.x,SAFA.z,11),g2(x,z,MERVE.x,MERVE.z,11));
    const rock=Math.min(1,smooth((valleyD(x,z)-78)/70)*.85+slope*2.4+out*.9);
    const sv=.9+.18*n;
    const sr=.88*sv,sg=.75*sv,sb=.57*sv;
    const rr=lerp(.56,.7,n),rg=lerp(.45,.56,n),rb=lerp(.36,.44,n);
    col[i*3]=lerp(sr,rr,rock);col[i*3+1]=lerp(sg,rg,rock);col[i*3+2]=lerp(sb,rb,rock);
  }
  tg.setAttribute('color',new THREE.BufferAttribute(col,3));
  groundTex.repeat.set(TS/10,TS/10);
  const terrain=new THREE.Mesh(tg,new THREE.MeshLambertMaterial({map:groundTex,vertexColors:true}));
  terrain.receiveShadow=true;scene.add(terrain);terrainRef=terrain;
}
// compacted courtyard sand (metâf), size is an estimate
{
  const t=canvasTex(256,256,(g,w,h)=>{const gr=g.createRadialGradient(128,128,0,128,128,128);gr.addColorStop(0,'rgba(206,190,160,1)');gr.addColorStop(.78,'rgba(200,183,152,.9)');gr.addColorStop(1,'rgba(200,183,152,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);
    const r=mulberry32(9);speckle(g,w,h,4000,.35,['#a39478','#fff8ea'],r);});
  t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;
  const m=new THREE.Mesh(new THREE.CircleGeometry(26,72),new THREE.MeshLambertMaterial({map:t,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));
  m.rotation.x=-Math.PI/2;m.position.y=.02;m.receiveShadow=true;scene.add(m);
}

/* ---------- collision registry ---------- */
const OBBS=[],CIRC=[];
function addOBB(cx,cz,hw,hd,th,tag){const o={cx,cz,hw,hd,c:Math.cos(th),s:Math.sin(th),rad:Math.hypot(hw,hd),tag};OBBS.push(o);return o;}
function obbLocal(o,x,z){const dx=x-o.cx,dz=z-o.cz;return [dx*o.c-dz*o.s,dx*o.s+dz*o.c];}
function obbDist(o,x,z){const [lx,lz]=obbLocal(o,x,z);const ex=Math.max(Math.abs(lx)-o.hw,0),ez=Math.max(Math.abs(lz)-o.hd,0);return Math.hypot(ex,ez);}

/* ---------- Kâbe: staged (eski Kâbe → yıkım → temel → duvar sıraları → çatı → kapı → Hacerülesved) ---------- */
const KW=12,KD=10.7,KH=8.7,KROT=-Math.PI/4;
const kc=Math.cos(KROT),ks=Math.sin(KROT);
const kW=(lx,lz)=>({x:lx*kc+lz*ks,z:-lx*ks+lz*kc});
const kaabaM=new THREE.Matrix4().makeRotationY(KROT);
const stoneB=new Batch(),roofB=new Batch(),tentB=new Batch(),awnB=new Batch();
const mudBs=[new Batch(),new Batch(),new Batch()];let mudB=mudBs[0];
const kGroup=new THREE.Group();kGroup.rotation.y=KROT;scene.add(kGroup);
function kAdd(geo,m,x,y,z,cast){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=cast!==false;o.receiveShadow=true;kGroup.add(o);return o;}
function kMesh(lx,y,lz,sx,sy,sz,m,su,sv){const b=new Batch();b.add(BOX,kaabaM.clone().multiply(M(lx,y,lz,0,sx,sy,sz)),su,sv);const o=new THREE.Mesh(b.build(),m);o.castShadow=o.receiveShadow=true;scene.add(o);return o;}
// the old Kâbe: dry-laid stone, about a man and a half high, no roof, door at ground level, Hicr still inside
const OLD_EXT=3.2,OLD_H=4.4;
const oldTex=canvasTex(512,512,(g,w,h)=>{const r=mulberry32(570);g.fillStyle='#3a332d';g.fillRect(0,0,w,h);let y=0;
  while(y<h){const ch=(.18+r()*.14)*128;let x=-r()*50;while(x<w){const bw=(.3+r()*.5)*128,s=92+r()*40|0;g.fillStyle=`rgb(${s+8},${s},${s-12})`;wrapRect(g,x+2,y+2,bw-4,ch-4,w);
    g.fillStyle='rgba(255,240,215,.1)';wrapRect(g,x+2,y+2,bw-4,3,w);x+=bw;}y+=ch;}
  g.strokeStyle='rgba(20,14,10,.85)';g.lineWidth=3;for(let k=0;k<5;k++){let x=r()*w,yy=0;g.beginPath();g.moveTo(x,yy);while(yy<h){x+=(r()-.5)*40;yy+=10+r()*24;g.lineTo(x,yy);}g.stroke();}
  speckle(g,w,h,6000,.3,['#1f1a16','#9b8d7d'],r);});
mat.oldk=new THREE.MeshLambertMaterial({map:oldTex});
const KP={};
KP.old=kMesh(-OLD_EXT/2,OLD_H/2,0,KW+OLD_EXT,OLD_H,KD,mat.oldk,4,4);
KP.oldDoor=kAdd(new THREE.BoxGeometry(1.5,2.2,.12),mat.darkWood,DXF(),1.1,-KD/2-.06);
function DXF(){return 3.1;}
// rubble heaps and the green foundation stones ("deve hörgücü gibi")
{
  const rg=mulberry32(606),rm=[];
  for(let k=0;k<9;k++){const a=k/9*6.283+.3,rr=10+rg()*3,cx=Math.cos(a)*rr,cz=Math.sin(a)*rr;
    for(let i=0;i<14;i++){const s=.35+rg()*.45;rm.push(new THREE.Matrix4().compose(new THREE.Vector3(cx+(rg()-.5)*2.4,s*.4+rg()*.5,cz+(rg()-.5)*2.4),new THREE.Quaternion().setFromEuler(new THREE.Euler(rg()*3,rg()*3,rg()*3)),new THREE.Vector3(s*1.3,s,s*1.1)));}}
  const im=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),new THREE.MeshLambertMaterial({color:0xa49a8e}),rm.length);rm.forEach((m,i)=>im.setMatrixAt(i,m));im.castShadow=im.receiveShadow=true;im.frustumCulled=false;scene.add(im);KP.rubble=im;
  const gm=[],gg=mulberry32(2);
  const per=(lx,lz)=>{const w=kW(lx,lz);gm.push(new THREE.Matrix4().compose(new THREE.Vector3(w.x,.25,w.z),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,gg()*3,0)),new THREE.Vector3(.75,.42,.62)));};
  for(let t=-KW/2-OLD_EXT;t<=KW/2;t+=1.15){per(t,-KD/2);per(t,KD/2);}
  for(let t=-KD/2+1.1;t<KD/2;t+=1.15){per(KW/2,t);per(-KW/2-OLD_EXT,t);}
  const gi=new THREE.InstancedMesh(new THREE.SphereGeometry(1,10,7),new THREE.MeshLambertMaterial({color:0x5f8a62}),gm.length);gm.forEach((m,i)=>gi.setMatrixAt(i,m));gi.castShadow=gi.receiveShadow=true;gi.frustumCulled=false;scene.add(gi);KP.green=gi;
}
// rising walls: alternating courses of stone and ship timber
KP.wall=null;KP.wallH=0;
function setWallH(h){if(KP.wall){scene.remove(KP.wall);KP.wall.geometry.dispose();KP.wall=null;}KP.wallH=h;if(h<=.01)return;KP.wall=kMesh(0,h/2,0,KW,h,KD,mat.kaaba,4,3);}
// scaffolding
{
  const sb=new Batch();const pole=new THREE.CylinderGeometry(.07,.08,1,6);
  const ring=[];for(let t=-KW/2-.9;t<=KW/2+.95;t+=2.6){ring.push([t,-KD/2-.9],[t,KD/2+.9]);}for(let t=-KD/2+1.7;t<KD/2;t+=2.6){ring.push([-KW/2-.9,t],[KW/2+.9,t]);}
  for(const [lx,lz] of ring)sb.add(pole,kaabaM.clone().multiply(M(lx,4.9,lz,0,1,9.8,1)),1);
  for(let y=1.6;y<9.6;y+=1.6){sb.add(BOX,kaabaM.clone().multiply(M(0,y,-KD/2-.9,0,KW+1.9,.1,.1)),1);sb.add(BOX,kaabaM.clone().multiply(M(0,y,KD/2+.9,0,KW+1.9,.1,.1)),1);
    sb.add(BOX,kaabaM.clone().multiply(M(-KW/2-.9,y,0,0,.1,.1,KD+1.9)),1);sb.add(BOX,kaabaM.clone().multiply(M(KW/2+.9,y,0,0,.1,.1,KD+1.9)),1);}
  KP.scaffold=new THREE.Mesh(sb.build(),new THREE.MeshLambertMaterial({color:0x9a7048}));KP.scaffold.castShadow=true;scene.add(KP.scaffold);
}
KP.roof=new THREE.Group();kGroup.add(KP.roof);
{const r=new THREE.Mesh(new THREE.BoxGeometry(KW+.08,.16,KD+.08),mat.roof);r.position.y=KH+.02;r.castShadow=r.receiveShadow=true;KP.roof.add(r);
 const mz=new THREE.Mesh(new THREE.BoxGeometry(1.4,.2,.24),mat.wood);mz.position.set(-KW/2-.62,KH-.05,0);mz.castShadow=true;KP.roof.add(mz);}
// raised single-leaf door on the NE wall, ~2 m from the Black Stone corner
const DX=3.1,DY=2.0,DH=2.9,DW=1.7,FZ=-KD/2;
KP.door=new THREE.Group();kGroup.add(KP.door);
{const add=(geo,m,x,y,z)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;KP.door.add(o);return o;};
 add(new THREE.BoxGeometry(DW,DH,.14),mat.wood,DX,DY+DH/2,FZ-.07);
 add(new THREE.BoxGeometry(DW+.6,.24,.3),mat.darkWood,DX,DY+DH+.12,FZ-.1);
 add(new THREE.BoxGeometry(DW+.4,.18,.34),mat.darkWood,DX,DY-.09,FZ-.12);
 add(new THREE.BoxGeometry(.22,DH+.2,.26),mat.darkWood,DX-DW/2-.11,DY+DH/2,FZ-.1);
 add(new THREE.BoxGeometry(.22,DH+.2,.26),mat.darkWood,DX+DW/2+.11,DY+DH/2,FZ-.1);
 add(new THREE.TorusGeometry(.09,.02,6,12),mat.dark,DX+.45,DY+DH*.5,FZ-.16);}
// Hacerülesved at the east corner, ~1.5 m up
const BSTONE_L={x:KW/2-.06,y:1.5,z:FZ+.06};
KP.stone=kAdd(new THREE.SphereGeometry(.22,14,10),new THREE.MeshPhongMaterial({color:0x151312,shininess:70,specular:0x333333}),BSTONE_L.x,BSTONE_L.y,BSTONE_L.z,false);KP.stone.scale.set(.95,1.15,.7);KP.stone.rotation.y=Math.PI/4;
// kisve (representative; colour and cloth uncertain)
const coverB=new Batch();coverB.add(BOX,kaabaM.clone().multiply(M(0,4.15,0,0,KW+.1,8.3,KD+.1)),2,8.3);
const cover=new THREE.Mesh(coverB.build(),mat.fabric);cover.castShadow=cover.receiveShadow=true;cover.visible=false;scene.add(cover);
addOBB(0,0,KW/2,KD/2,KROT,'kabe');
const KOBB=OBBS[0];
// Hicr / hatîm: low semicircular wall in front of the NW face, left outside the building
const hijrB=new Batch(),HIJR_C=[];
{
  const ax=8.4,bz=5.6,phs=Math.asin(2/ax),N=26,pts=[];
  for(let i=0;i<=N;i++){const ph=phs+(Math.PI-2*phs)*i/N;pts.push({x:-KW/2-ax*Math.sin(ph),z:bz*Math.cos(ph)});}
  for(let i=0;i<N;i++){const a=pts[i],b=pts[i+1],dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz);
    hijrB.add(BOX,kaabaM.clone().multiply(M((a.x+b.x)/2,.5,(a.z+b.z)/2,Math.atan2(-dz,dx),l+.14,1.0,.9)),4);}
  for(let i=0;i<=N;i+=1){const w=kW(pts[i].x,pts[i].z);const c={x:w.x,z:w.z,r:.55,tag:'hicr',off:true};CIRC.push(c);HIJR_C.push(c);}
}
KP.hijr=new THREE.Mesh(hijrB.build(),mat.stone);KP.hijr.castShadow=KP.hijr.receiveShadow=true;scene.add(KP.hijr);
/* o: {old, rubble, green, wallH, scaffold, roof, door, stone, hijr} */
const KSTATE={};
function setKaaba(o){Object.assign(KSTATE,o);const k=KSTATE;
  KP.old.visible=!!k.old;KP.oldDoor.visible=!!k.old;KP.rubble.visible=!!k.rubble;KP.green.visible=!!k.green;
  if(Math.abs((k.wallH||0)-KP.wallH)>.001)setWallH(k.wallH||0);
  KP.scaffold.visible=!!k.scaffold;KP.roof.visible=!!k.roof;KP.door.visible=!!k.door;KP.stone.visible=!!k.stone;KP.hijr.visible=!!k.hijr;
  for(const c of HIJR_C)c.off=!k.hijr;
  if(k.old){const c=kW(-OLD_EXT/2,0);KOBB.cx=c.x;KOBB.cz=c.z;KOBB.hw=(KW+OLD_EXT)/2;}else{KOBB.cx=0;KOBB.cz=0;KOBB.hw=KW/2;}
  KOBB.rad=Math.hypot(KOBB.hw,KOBB.hd);
  return k;}
setKaaba({old:true,wallH:0});
// Makām-ı İbrâhim (position in this period is disputed; representative)
const MAKAM=kW(-.5,-6.6);
{const m=new THREE.Mesh(new THREE.DodecahedronGeometry(.38,0),new THREE.MeshLambertMaterial({color:0xb7a88f}));m.scale.set(1,.75,.9);m.position.set(MAKAM.x,.28,MAKAM.z);m.castShadow=m.receiveShadow=true;scene.add(m);CIRC.push({x:MAKAM.x,z:MAKAM.z,r:.55});}

/* ---------- Zemzem ---------- */
const ZEM={x:19,z:3};
const jarGeo=new THREE.LatheGeometry([[0,0],[.14,.02],[.22,.2],[.24,.35],[.18,.55],[.1,.62],[.11,.68],[.0,.68]].map(p=>new THREE.Vector2(p[0],p[1])),10);
const jarM=[];
{
  const g=new THREE.Group();g.position.set(ZEM.x,0,ZEM.z);scene.add(g);
  const add=(geo,m,x,y,z)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;g.add(o);return o;};
  const ringTex=stoneTex.clone();ringTex.needsUpdate=true;ringTex.repeat.set(3,.25);
  const ringMat=new THREE.MeshLambertMaterial({map:ringTex,side:THREE.DoubleSide});
  add(new THREE.CylinderGeometry(1.35,1.45,.85,22,1,true),ringMat,0,.42,0);
  add(new THREE.CylinderGeometry(.95,.95,.85,22,1,true),ringMat,0,.42,0);
  const top=add(new THREE.RingGeometry(.95,1.35,22),new THREE.MeshLambertMaterial({map:stoneTex,side:THREE.DoubleSide}),0,.85,0);top.rotation.x=-Math.PI/2;
  const water=add(new THREE.CircleGeometry(.95,22),new THREE.MeshBasicMaterial({color:0x0b0d0d}),0,.25,0);water.rotation.x=-Math.PI/2;
  add(new THREE.BoxGeometry(.18,2.4,.18),mat.darkWood,-1.55,1.2,0);
  add(new THREE.BoxGeometry(.18,2.4,.18),mat.darkWood,1.55,1.2,0);
  add(new THREE.BoxGeometry(3.4,.16,.16),mat.darkWood,0,2.35,0);
  const pul=add(new THREE.CylinderGeometry(.16,.16,.08,14),mat.wood,0,2.18,0);pul.rotation.x=Math.PI/2;
  add(new THREE.CylinderGeometry(.012,.012,1.7,4),new THREE.MeshLambertMaterial({color:0x8a7454}),.16,1.25,0);
  add(new THREE.CylinderGeometry(.16,.12,.28,10),new THREE.MeshLambertMaterial({color:0x5b3a22}),1.1,1.0,.6);
  add(new THREE.BoxGeometry(2.2,.45,.7),mat.stone,0,.22,2.3);
  CIRC.push({x:ZEM.x,z:ZEM.z,r:1.75,tag:'zemzem'});CIRC.push({x:ZEM.x,z:ZEM.z+2.3,r:.9});
  for(let i=0;i<7;i++){const a=-.6+i*.32;jarM.push(M(ZEM.x-2.6*Math.cos(a)*.9,0,ZEM.z-2.6*Math.sin(a)+.2,i,1,1,1));}
}

/* ---------- houses ---------- */
const DARUN={x:-22,z:-26};
const ALLEYS=[.25,.95,1.57,2.35,3.14,4.71,5.5];
function angDist(a,b){let d=Math.abs(a-b)%(Math.PI*2);return d>Math.PI?Math.PI*2-d:d;}
const houses=[];
const rng=mulberry32(605);
function blockedFor(x,z,R){
  const r=Math.hypot(x,z);
  if(r-R<25) return true;
  if(r<95){const a=(Math.atan2(z,x)+Math.PI*2)%(Math.PI*2);for(const al of ALLEYS){if(Math.sin(Math.min(angDist(a,al),1.5))*r<R+1.8&&angDist(a,al)<1.2)return true;}}
  else if(Math.abs(x+.06*z)<R+3.2) return true;
  if(Math.hypot(x-DARUN.x,z-DARUN.z)<R+9.5) return true;
  if(Math.hypot(x-SAFA.x,z-SAFA.z)<R+13) return true;
  if(Math.hypot(x-MERVE.x,z-MERVE.z)<R+13) return true;
  if(valleyD(x,z)>78-R) return true;
  for(const h of houses){if(Math.hypot(x-h.x,z-h.z)<R+h.R+1.5)return true;}
  return false;
}
function makeHouse(x,z,w,d,th,opts){
  opts=opts||{};
  const R=.5*Math.max(w,d);
  const c=Math.cos(th),s=Math.sin(th);
  let ymin=1e9;for(const [lx,lz] of [[-w/2,-d/2],[w/2,-d/2],[-w/2,d/2],[w/2,d/2],[0,0]]){ymin=Math.min(ymin,height(x+lx*c+lz*s,z-lx*s+lz*c));}
  const H=opts.H||(3.3+rng()*.6);
  const r=Math.hypot(x,z);
  const upper=opts.upper!=null?opts.upper:rng()<(r<60?.42:.2);
  const h={x,z,w,d,th,R,y0:ymin-.15,H,upper,tint:(rng()*3)|0,awn:rng()<.3,dx:opts.dx!=null?opts.dx:(rng()-.5)*Math.max(0,w-2.6),doorW:opts.doorW||1.0,side:rng()<.5?-1:1};
  houses.push(h);h.obb=addOBB(x,z,w/2+.04,d/2+.04,th,'ev');
  return h;
}
makeHouse(DARUN.x,DARUN.z,15,12,Math.atan2(DARUN.x,DARUN.z),{H:4.4,upper:true,dx:0,doorW:1.8});
houses[0].darun=true;
for(let tries=0;tries<9000&&houses.length<165;tries++){
  const x=(rng()*2-1)*80,z=(rng()*2-1)*330,r=Math.hypot(x,z);
  if(r>85&&rng()>.2)continue;
  const w=6+rng()*6,d=5+rng()*5,R=.5*Math.max(w,d);
  if(blockedFor(x,z,R))continue;
  const th=r<90?Math.atan2(x,z)+(rng()-.5)*.3:(Math.floor(rng()*4)*Math.PI/2+(rng()-.5)*.15);
  makeHouse(x,z,w,d,th);
}
const doorI=[],lintelI=[],winI=[],beamI=[],lampPos=[];
const beamGeo=new THREE.CylinderGeometry(.085,.085,.5,6);beamGeo.rotateX(Math.PI/2);
for(const h of houses){
  const HM=M(h.x,0,h.z,h.th);
  const L=(lx,ly,lz,sx,sy,sz)=>HM.clone().multiply(M(lx,ly,lz,0,sx,sy,sz));
  const {w,d,y0,H}=h;mudB=mudBs[h.tint];
  stoneB.add(BOX,L(0,y0+.35,0,w,1.3,d),4);
  mudB.add(BOX,L(0,y0+1+(H-1)/2,0,w-.08,H-1,d-.08),4);
  const ph=.45,pt=.25,ty=y0+H+ph/2,iw=w-.08,id=d-.08;
  mudB.add(BOX,L(0,ty,-id/2+pt/2,iw,ph,pt),4);
  mudB.add(BOX,L(0,ty,id/2-pt/2,iw,ph,pt),4);
  mudB.add(BOX,L(-iw/2+pt/2,ty,0,pt,ph,id-2*pt),4);
  mudB.add(BOX,L(iw/2-pt/2,ty,0,pt,ph,id-2*pt),4);
  roofB.add(BOX,L(0,y0+H+.02,0,w-.6,.05,d-.6),4);
  // door + lintel
  if(h.awn){const aw=h.doorW+1.6;awnB.add(BOX,L(h.dx,y0+2.55,-d/2-.55,1,1,1).multiply(new THREE.Matrix4().makeRotationX(-.28)).multiply(new THREE.Matrix4().makeScale(aw,.05,1.1)),2);
    for(const sx of [-1,1])awnB.add(BOX,L(h.dx+sx*(aw/2-.08),y0+1.25,-d/2-1.0,.06,2.5,.06),2);}
  doorI.push(L(h.dx,y0+.2+.975,-d/2-.04,h.doorW,1.95,.1));
  lintelI.push(L(h.dx,y0+.2+2.05,-d/2-.07,h.doorW+.5,.2,.18));
  lampPos.push({h,p:new THREE.Vector3(h.dx+h.doorW/2+.4,y0+2.45,-d/2-.18).applyMatrix4(HM)});
  // small high windows (no glass)
  const nW=w>8?2:1;for(let k=0;k<nW;k++){const wx=-w/2+1+(w-2)*(k+.5)/nW;if(Math.abs(wx-h.dx)>1.1)winI.push(L(wx,y0+2.55,-d/2-.02,.5,.42,.06));}
  winI.push(L(w/2+.02,y0+2.55,(rng()-.5)*(d-2),.06,.42,.5));
  // protruding palm-trunk beam ends
  for(let bx=-w/2+.45;bx<=w/2-.45;bx+=.8){beamI.push(L(bx,y0+H-.32,-d/2,1,1,1));beamI.push(L(bx,y0+H-.32,d/2,1,1,1));}
  if(h.upper){
    const uw=Math.max(3,w*(h.darun?.55:.45)),ud=Math.max(3,d*.45),ux=h.side*(w/2-uw/2-.4),uz=d/2-ud/2-.4,uy=y0+H;h.up={ux,uz,uw,ud,uy};
    mudB.add(BOX,L(ux,uy+1.3,uz,uw,2.6,ud),4);
    mudB.add(BOX,L(ux,uy+2.75,uz,uw+.1,.3,ud+.1),4);
    roofB.add(BOX,L(ux,uy+2.92,uz,uw-.3,.05,ud-.3),4);
    doorI.push(L(ux,uy+.95,uz-ud/2-.04,.85,1.8,.1));
    winI.push(L(ux+(uw>4?1.2:.9)*(h.side),uy+1.6,uz-ud/2-.02,.45,.38,.06));
  }
  const r=Math.hypot(h.x,h.z);
  if(r<75&&rng()<.4){const n=1+(rng()<.4?1:0);for(let k=0;k<n;k++)jarM.push(HM.clone().multiply(M(h.dx-h.doorW/2-.45-k*.55,y0+.15,-d/2-.4,rng()*6,.9+rng()*.25,.9+rng()*.25,.9+rng()*.25)));}
}
function instanced(geo,m,list,cast){const im=new THREE.InstancedMesh(geo,m,list.length);list.forEach((mm,i)=>im.setMatrixAt(i,mm));im.castShadow=cast!==false;im.receiveShadow=true;im.frustumCulled=false;scene.add(im);return im;}
instanced(BOX,mat.wood,doorI);instanced(BOX,mat.darkWood,lintelI);instanced(BOX,mat.dark,winI,false);instanced(beamGeo,mat.darkWood,beamI);

/* ---------- tents at the valley edge (deve/keçi kılı) ---------- */
const tents=[];
{
  const tr=mulberry32(42);
  for(let i=0;i<10;i++){
    const side=i%2?1:-1,z=-220+tr()*440,x=side*(83+tr()*6)-.06*z;
    if(Math.hypot(x,z)<70)continue;
    const th=(tr()-.5)*.4,y=height(x,z)-.05,TM=M(x,0,z,th);
    const L=(lx,ly,lz,sx,sy,sz,rx)=>{const m=TM.clone().multiply(M(lx,ly,lz,0,1,1,1));if(rx)m.multiply(new THREE.Matrix4().makeRotationX(rx));return m.multiply(new THREE.Matrix4().makeScale(sx,sy,sz));};
    tentB.add(BOX,L(0,y+1.75,0,5.2,.07,3.8,-.17),2);
    tentB.add(BOX,L(0,y+.82,1.75,5.2,1.6,.06),2);
    tentB.add(BOX,L(-2.55,y+.95,.6,.06,1.3,2.2),2);
    for(const px of [-2.2,0,2.2])tentB.add(BOX,L(px,y+1.05,-1.5,.09,2.2,.09),2);
    tents.push({x,z});addOBB(x,z,2.6,1.9,th,'cadir');
  }
}

/* ---------- build merged meshes ---------- */
mat.mud1=mat.mud.clone();mat.mud1.color.setHex(0xf6dcc6);mat.mud2=mat.mud.clone();mat.mud2.color.setHex(0xebe6d6);
mat.awn=new THREE.MeshLambertMaterial({map:fabricTex,side:THREE.DoubleSide});
for(const [b,m] of [[stoneB,mat.stone],[mudBs[0],mat.mud],[mudBs[1],mat.mud1],[mudBs[2],mat.mud2],[roofB,mat.roof],[tentB,mat.tent],[awnB,mat.awn]]){if(!b.c)continue;const o=new THREE.Mesh(b.build(),m);o.castShadow=o.receiveShadow=true;scene.add(o);}

/* ---------- vegetation and rocks ---------- */
const vr=mulberry32(77);
function insideHouse(x,z,pad){for(const h of houses){if(obbDist(h.obb,x,z)<pad)return true;}return false;}
const trees=[];
{
  const tm=[],cm=[];
  const place=(x,z,s)=>{const y=height(x,z);const th=vr()*6.3,lean=(vr()-.5)*.25;const trunkH=(1.8+vr()*1.3)*s;
    const T=new THREE.Matrix4().compose(new THREE.Vector3(x,y-.1,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(lean,th,lean*.6)),new THREE.Vector3(s,trunkH,s));tm.push(T);
    const top=new THREE.Vector3(0,1,0).applyMatrix4(T);
    cm.push(new THREE.Matrix4().compose(top.clone().add(new THREE.Vector3(0,.15*s,0)),new THREE.Quaternion().setFromAxisAngle(UP,th),new THREE.Vector3((2.4+vr())*s,(.42+vr()*.15)*s,(2.1+vr()*.8)*s)));
    cm.push(new THREE.Matrix4().compose(top.clone().add(new THREE.Vector3((vr()-.5)*2*s,-.35*s,(vr()-.5)*2*s)),new THREE.Quaternion(),new THREE.Vector3(1.4*s,.35*s,1.3*s)));
    trees.push({x,z});if(valleyD(x,z)<95)CIRC.push({x,z,r:.35*s,tag:'agac'});};
  let n=0;for(let t=0;t<3000&&n<55;t++){const x=(vr()*2-1)*260,z=(vr()*2-1)*380,dd=valleyD(x,z);if(dd<80||dd>170)continue;if(height(x,z)>45)continue;place(x,z,.8+vr()*.5);n++;}
  n=0;for(let t=0;t<3000&&n<14;t++){const x=(vr()*2-1)*78,z=(vr()*2-1)*120,r=Math.hypot(x,z);if(r<30||valleyD(x,z)>76)continue;if(insideHouse(x,z,1.6))continue;if(Math.hypot(x-SAFA.x,z-SAFA.z)<10)continue;place(x,z,.75+vr()*.35);n++;}
  const trunkGeo=new THREE.CylinderGeometry(.11,.19,1,6);trunkGeo.translate(0,.5,0);
  instanced(trunkGeo,new THREE.MeshLambertMaterial({color:0x4a3a2c}),tm);
  instanced(new THREE.IcosahedronGeometry(1,1),new THREE.MeshLambertMaterial({color:0x7e9447}),cm);
}
{
  const rm=[],rc=[],bm=[],im=[];
  const colA=new THREE.Color(0x7a6553),colB=new THREE.Color(0xa08670);
  for(let t=0;t<5000&&rm.length<380;t++){const x=(vr()*2-1)*420,z=(vr()*2-1)*460,dd=valleyD(x,z);
    const near=Math.max(g2(x,z,SAFA.x,SAFA.z,12),g2(x,z,MERVE.x,MERVE.z,12));
    if(dd<88&&near<.3)continue;const s=.4+vr()*vr()*2.6;const y=height(x,z);
    rm.push(new THREE.Matrix4().compose(new THREE.Vector3(x,y-.25*s,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(vr()*3,vr()*3,vr()*3)),new THREE.Vector3(s*(1+vr()*.6),s*(.6+vr()*.5),s*(1+vr()*.5))));rc.push(colA.clone().lerp(colB,vr()));}
  const rocks=instanced(new THREE.IcosahedronGeometry(1,0),new THREE.MeshLambertMaterial({color:0xffffff}),rm);
  rc.forEach((c,i)=>rocks.setColorAt(i,c));if(rocks.instanceColor)rocks.instanceColor.needsUpdate=true;
  for(let t=0;t<3000&&bm.length<60;t++){const x=(vr()*2-1)*200,z=(vr()*2-1)*360,dd=valleyD(x,z);if(dd<70||dd>140)continue;const s=.5+vr()*.6;
    bm.push(new THREE.Matrix4().compose(new THREE.Vector3(x,height(x,z)+.15*s,z),new THREE.Quaternion().setFromAxisAngle(UP,vr()*6),new THREE.Vector3(1.3*s,.7*s,1.1*s)));}
  instanced(new THREE.IcosahedronGeometry(1,0),new THREE.MeshLambertMaterial({color:0x6f8c45}),bm);
  for(let t=0;t<4000&&im.length<280;t++){const cx=(vr()*2-1)*170,cz=(vr()*2-1)*360,dd=valleyD(cx,cz);if(dd<60||dd>150)continue;
    for(let k=0;k<4;k++){const x=cx+(vr()-.5)*2,z=cz+(vr()-.5)*2,s=.6+vr()*.7;im.push(new THREE.Matrix4().compose(new THREE.Vector3(x,height(x,z)+.2*s,z),new THREE.Quaternion().setFromEuler(new THREE.Euler((vr()-.5)*.4,vr()*6,(vr()-.5)*.4)),new THREE.Vector3(s,s,s)));}}
  instanced(new THREE.ConeGeometry(.22,.45,5),new THREE.MeshLambertMaterial({color:0xc6b07a}),im,false);
}
instanced(jarGeo,mat.clay,jarM);

/* ---------- sky, sun, moon, stars ---------- */
const skyU={top:{value:new THREE.Color()},hor:{value:new THREE.Color()},sunCol:{value:new THREE.Color()},sunDir:{value:new THREE.Vector3(0,1,0)},sunSize:{value:1},glow:{value:.3}};
const sky=new THREE.Mesh(new THREE.SphereGeometry(3000,32,16),new THREE.ShaderMaterial({uniforms:skyU,side:THREE.BackSide,depthWrite:false,fog:false,
  vertexShader:'varying vec3 vDir;void main(){vDir=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:'uniform vec3 top;uniform vec3 hor;uniform vec3 sunCol;uniform vec3 sunDir;uniform float sunSize;uniform float glow;varying vec3 vDir;void main(){vec3 d=normalize(vDir);float e=max(d.y,0.0);vec3 c=mix(hor,top,pow(e,0.55));float s=max(dot(d,normalize(sunDir)),0.0);c+=sunCol*(pow(s,900.0)*2.0*sunSize+pow(s,10.0)*glow);gl_FragColor=vec4(c,1.0);}'}));
sky.renderOrder=-1;scene.add(sky);
const stars=(()=>{const n=900,p=new Float32Array(n*3),r=mulberry32(5);for(let i=0;i<n;i++){const u=r()*6.283,v=Math.acos(1-r()*.95);p[i*3]=Math.sin(v)*Math.cos(u)*2500;p[i*3+1]=Math.cos(v)*2500;p[i*3+2]=Math.sin(v)*Math.sin(u)*2500;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));const s=new THREE.Points(g,new THREE.PointsMaterial({color:0xf2ecdf,size:1.6,sizeAttenuation:false,transparent:true,opacity:0,fog:false,depthWrite:false}));scene.add(s);return s;})();
const hemi=new THREE.HemisphereLight(0xcfdbe6,0xb49a74,.75);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffffff,1);sun.castShadow=true;
sun.shadow.mapSize.set(QL.sh,QL.sh);sun.shadow.bias=-.0004;sun.shadow.normalBias=.03;
sun.shadow.bias=-.0004;sun.shadow.normalBias=.04;sun.shadow.camera.near=1;sun.shadow.camera.far=520;
scene.add(sun);scene.add(sun.target);
function setShadowExtent(e){const c=sun.shadow.camera;c.left=-e;c.right=e;c.top=e;c.bottom=-e;c.updateProjectionMatrix();}
setShadowExtent(55);

// oil lamps by the doors nearest the courtyard (night)
const flames=[],lampLights=[];
{
  lampPos.sort((a,b)=>Math.hypot(a.p.x,a.p.z)-Math.hypot(b.p.x,b.p.z));
  const fm=new THREE.MeshBasicMaterial({color:0xffb45a,transparent:true,opacity:0});
  const fg=new THREE.SphereGeometry(.09,8,6);
  lampPos.slice(0,16).forEach((l,i)=>{const f=new THREE.Mesh(fg,fm);f.position.copy(l.p);scene.add(f);flames.push(f);
    if(i<5){const pl=new THREE.PointLight(0xffa456,0,20,2);pl.position.copy(l.p);scene.add(pl);lampLights.push(pl);}});
  const zl=new THREE.PointLight(0xffa456,0,16,2);zl.position.set(ZEM.x+1.5,2.6,ZEM.z);scene.add(zl);lampLights.push(zl);
  const zf=new THREE.Mesh(fg,fm);zf.position.copy(zl.position);scene.add(zf);flames.push(zf);
  flames.mat=fm;
}

// drifting dust
const dust=(()=>{const n=isTouch?260:500,p=new Float32Array(n*3),r=mulberry32(8);for(let i=0;i<n*3;i++)p[i]=(r()*2-1)*24;
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));
  const pts=new THREE.Points(g,new THREE.PointsMaterial({color:0xf3e7cf,size:.05,transparent:true,opacity:.45,depthWrite:false}));pts.frustumCulled=false;scene.add(pts);return pts;})();

/* ---------- time of day ---------- */
const C=h=>new THREE.Color(h);
const TIMES={
  noon:{el:62,az:150,sunCol:C(0xfff0d8),sunInt:.95,hs:C(0xc8d6e6),hg:C(0xa88d68),hi:.58,top:C(0x5b9cdc),hor:C(0xf0e6d2),fn:120,ff:1300,lamp:0,stars:0,sunSize:1,glow:.25,dust:.4},
  asr:{el:30,az:248,sunCol:C(0xffd8a6),sunInt:.9,hs:C(0xc6d2df),hg:C(0xa98a64),hi:.5,top:C(0x6c94c0),hor:C(0xeedabd),fn:110,ff:1200,lamp:0,stars:0,sunSize:1,glow:.35,dust:.45},
  eve:{el:3.5,az:288,sunCol:C(0xff9a58),sunInt:.6,hs:C(0x8d7f9e),hg:C(0x5a4535),hi:.42,top:C(0x3d4e7a),hor:C(0xe69a6a),fn:70,ff:900,lamp:.55,stars:.15,sunSize:1.2,glow:.7,dust:.35},
  rain:{el:60,az:200,sunCol:C(0xd8dde4),sunInt:.3,hs:C(0xb4bcc6),hg:C(0x6d6253),hi:.8,top:C(0x67727f),hor:C(0xa9afb3),fn:30,ff:420,lamp:.3,stars:0,sunSize:0,glow:.04,dust:0},
  dawn:{el:9,az:95,sunCol:C(0xffc790),sunInt:.8,hs:C(0xb8c3d8),hg:C(0x8f7458),hi:.6,top:C(0x5c80b8),hor:C(0xf4cfa8),fn:90,ff:1100,lamp:.15,stars:.03,sunSize:1.1,glow:.6,dust:.3},
  night:{el:48,az:125,sunCol:C(0xa9bce6),sunInt:.28,hs:C(0x26304f),hg:C(0x120f0c),hi:.32,top:C(0x070b1a),hor:C(0x1b2341),fn:35,ff:620,lamp:1,stars:1,sunSize:.45,glow:.12,dust:.12}
};
const cur=JSON.parse(JSON.stringify({}));
function cloneT(t){const o={};for(const k in t)o[k]=t[k].isColor?t[k].clone():t[k];return o;}
let T=cloneT(TIMES.noon),tFrom=null,tTo=null,tK=1;
function setTime(key){tFrom=cloneT(T);tTo=TIMES[key];tK=reduce?1:0;if(reduce){T=cloneT(tTo);}
  document.querySelectorAll('.seg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.t===key?'true':'false'));}
const sunDir=new THREE.Vector3();
function applyTime(){
  const el=T.el*Math.PI/180,az=T.az*Math.PI/180;
  sunDir.set(Math.sin(az)*Math.cos(el),Math.sin(el),-Math.cos(az)*Math.cos(el)).normalize();
  sun.color.copy(T.sunCol);sun.intensity=T.sunInt*(QL.std?1.55:1);hemi.color.copy(T.hs);hemi.groundColor.copy(T.hg);hemi.intensity=T.hi*(QL.std?.62:1);
  skyU.top.value.copy(T.top);skyU.hor.value.copy(T.hor);skyU.sunCol.value.copy(T.sunCol);skyU.sunDir.value.copy(sunDir);skyU.sunSize.value=T.sunSize;skyU.glow.value=T.glow;
  scene.fog.color.copy(T.hor);scene.fog.near=T.fn;scene.fog.far=T.ff;renderer.setClearColor(T.hor);
  flames.mat.opacity=T.lamp;lampLights.forEach(l=>l.intensity=T.lamp*1.7);stars.material.opacity=T.stars;dust.material.opacity=T.dust;
  // miniature painting: flat, shadowless light
  const flat=styleIdx===2;sun.castShadow=!flat;
  if(flat){hemi.color.set(0xfffaf0);hemi.groundColor.set(0xd8c7a8);hemi.intensity=Math.max(.95,T.hi*1.6)*(1-T.lamp*.45);sun.intensity=T.sunInt*.4;}
}

/* ---------- art-direction styles (screen-space post-processing) ---------- */
const STYLES=['Ham','Mürekkep','Minyatür','Resimsel','Low-poly','Siluet','Gravür','Kâğıt','Canlı'];
let styleIdx=0;
const canPost=renderer.capabilities.isWebGL2||!!renderer.extensions.get('WEBGL_depth_texture');
const POST_SCALE=QL.post;
const rt=new THREE.WebGLRenderTarget(1,1,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat});
rt.depthTexture=new THREE.DepthTexture();rt.depthTexture.type=THREE.UnsignedIntType;
const postU={tColor:{value:rt.texture},tDepth:{value:rt.depthTexture},res:{value:new THREE.Vector2(1,1)},cNear:{value:camera.near},cFar:{value:camera.far},style:{value:0},night:{value:0},sunUV:{value:new THREE.Vector2(.5,.5)},sunVis:{value:0}};
const postMat=new THREE.ShaderMaterial({uniforms:postU,depthTest:false,depthWrite:false,
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',
  fragmentShader:`
uniform sampler2D tColor;uniform sampler2D tDepth;uniform vec2 res;uniform float cNear;uniform float cFar;uniform int style;uniform float night;uniform vec2 sunUV;uniform float sunVis;
varying vec2 vUv;
float linD(vec2 uv){float z=texture2D(tDepth,uv).x*2.0-1.0;return (2.0*cNear*cFar)/(cFar+cNear-z*(cFar-cNear));}
float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);return mix(mix(h1(i),h1(i+vec2(1.0,0.0)),u.x),mix(h1(i+vec2(0.0,1.0)),h1(i+vec2(1.0,1.0)),u.x),u.y);}
float fbm(vec2 p){float s=0.0,a=0.5;for(int i=0;i<5;i++){s+=a*vn(p);p*=2.03;a*=0.5;}return s;}
float lum(vec3 c){return dot(c,vec3(0.299,0.587,0.114));}
float eDepth(vec2 uv,float px){vec2 o=vec2(px)/res;float dx=log(linD(uv+vec2(o.x,0.0)))-log(linD(uv-vec2(o.x,0.0)));float dy=log(linD(uv+vec2(0.0,o.y)))-log(linD(uv-vec2(0.0,o.y)));return length(vec2(dx,dy));}
float eLum(vec2 uv,float px){vec2 o=vec2(px)/res;float l=lum(texture2D(tColor,uv-vec2(o.x,0.0)).rgb),r=lum(texture2D(tColor,uv+vec2(o.x,0.0)).rgb),t=lum(texture2D(tColor,uv+vec2(0.0,o.y)).rgb),b=lum(texture2D(tColor,uv-vec2(0.0,o.y)).rgb);return length(vec2(r-l,t-b));}
vec3 soft(vec2 uv,float r){vec2 o=r/res;return (texture2D(tColor,uv).rgb*2.0+texture2D(tColor,uv+vec2(o.x,0.0)).rgb+texture2D(tColor,uv-vec2(o.x,0.0)).rgb+texture2D(tColor,uv+vec2(0.0,o.y)).rgb+texture2D(tColor,uv-vec2(0.0,o.y)).rgb)/6.0;}
vec3 kuwahara(vec2 uv){
  vec2 o=1.7/res;vec3 m0=vec3(0.0),m1=vec3(0.0),m2=vec3(0.0),m3=vec3(0.0),s0=vec3(0.0),s1=vec3(0.0),s2=vec3(0.0),s3=vec3(0.0);
  for(int j=0;j<4;j++){for(int i=0;i<4;i++){vec2 a=vec2(float(i),float(j))*o;
    vec3 c0=texture2D(tColor,uv+vec2(-a.x,-a.y)).rgb;m0+=c0;s0+=c0*c0;
    vec3 c1=texture2D(tColor,uv+vec2(a.x,-a.y)).rgb;m1+=c1;s1+=c1*c1;
    vec3 c2=texture2D(tColor,uv+vec2(-a.x,a.y)).rgb;m2+=c2;s2+=c2*c2;
    vec3 c3=texture2D(tColor,uv+vec2(a.x,a.y)).rgb;m3+=c3;s3+=c3*c3;}}
  m0/=16.0;m1/=16.0;m2/=16.0;m3/=16.0;
  float v0=dot(abs(s0/16.0-m0*m0),vec3(1.0)),v1=dot(abs(s1/16.0-m1*m1),vec3(1.0)),v2=dot(abs(s2/16.0-m2*m2),vec3(1.0)),v3=dot(abs(s3/16.0-m3*m3),vec3(1.0));
  vec3 r=m0;float v=v0;if(v1<v){v=v1;r=m1;}if(v2<v){v=v2;r=m2;}if(v3<v){r=m3;}return r;}
void main(){
  vec2 pp=vUv*res/220.0;
  if(style==1){
    vec2 wob=(vec2(fbm(vUv*vec2(res.x/res.y,1.0)*7.0),fbm(vUv*7.0+7.3))-0.5)*0.004;
    vec2 uv=vUv+wob;vec3 c=(soft(uv,3.0)+soft(uv,6.0))*0.5;float D=linD(uv);float L=lum(c);
    float grain=fbm(pp*3.0)*0.5+fbm(pp*18.0)*0.5;
    vec3 paper=mix(vec3(0.93,0.88,0.78),vec3(0.84,0.77,0.63),grain*0.8+0.25*length(vUv-0.5));
    float q=floor(clamp(L*1.45,0.0,1.0)*4.0+fbm(pp*3.0)*0.35)/4.0;
    vec3 ink=mix(vec3(0.17,0.14,0.12),vec3(0.66,0.5,0.33),smoothstep(0.0,0.95,q));
    vec3 hue=mix(vec3(1.0),c/(L+0.001),0.3);
    vec3 wash=paper*mix(vec3(1.0),ink*hue*1.25,(1.0-q)*0.78+0.05);
    float fade=smoothstep(50.0,850.0,D);float sky=step(2400.0,D);
    wash=mix(wash,paper*vec3(0.98,0.95,0.9),fade*0.82);
    vec3 skyc=mix(paper,vec3(0.78,0.42,0.28),smoothstep(0.55,1.0,vUv.y)*0.35*(1.0-night));
    wash=mix(wash,skyc,sky);
    float e=smoothstep(0.04,0.14,eDepth(uv,1.5))+smoothstep(0.16,0.36,eLum(uv,1.5))*0.35;
    e*=(1.0-fade*0.75)*(1.0-sky);
    float dry=smoothstep(0.3,0.7,fbm(pp*10.0));
    wash=mix(wash,vec3(0.11,0.09,0.08),clamp(e,0.0,1.0)*(0.5+0.5*dry));
    wash*=mix(1.0,0.45,night);
    wash*=1.0-0.25*pow(length(vUv-0.5)*1.2,2.0);
    gl_FragColor=vec4(wash,1.0);return;}
  if(style==2){
    vec3 c=soft(vUv,1.5);float D=linD(vUv);float L=lum(c);
    c=mix(vec3(L),c,1.3);c=mix(c,c*vec3(0.94,0.97,1.06),0.35);c=floor(c*7.0+0.5)/7.0;
    float sky=step(2400.0,D);
    vec3 skyc=mix(vec3(0.85,0.72,0.42),vec3(0.2,0.31,0.56),smoothstep(0.45,0.95,vUv.y));
    skyc=mix(skyc,vec3(0.05,0.07,0.16),night);c=mix(c,skyc,sky);
    float e=smoothstep(0.03,0.09,eDepth(vUv,1.0))+smoothstep(0.16,0.34,eLum(vUv,1.5))*0.3;e*=(1.0-sky);
    c=mix(c,vec3(0.16,0.11,0.08),clamp(e,0.0,1.0)*0.85);
    c*=0.92+0.1*fbm(pp*8.0);
    vec2 b=min(vUv,1.0-vUv)*res;float m=min(b.x,b.y);vec3 margin=vec3(0.91,0.85,0.72)*(0.95+0.08*fbm(pp*5.0));
    if(m<18.0)c=margin;else if(m<21.0)c=vec3(0.55,0.18,0.12);else if(m<23.0)c=margin;else if(m<24.5)c=vec3(0.2,0.27,0.5);
    gl_FragColor=vec4(c,1.0);return;}
  if(style==3){
    vec2 uv=vUv+(vec2(fbm(vUv*vec2(res.x/res.y,1.0)*40.0),fbm(vUv*40.0+3.1))-0.5)*0.0025;
    vec3 c=kuwahara(uv);float D=linD(vUv);
    c=pow(max(c,vec3(0.0)),vec3(0.8));c=mix(c,c*vec3(1.07,1.0,0.88),0.5);
    float L=lum(c);c=mix(vec3(L),c,0.9);
    c=mix(vec3(0.1,0.08,0.07),vec3(1.02,0.98,0.92),smoothstep(-0.02,1.0,c));
    vec3 haze=mix(vec3(0.93,0.82,0.66),vec3(0.12,0.14,0.22),night);
    c=mix(c,haze,smoothstep(80.0,1100.0,D)*0.45*step(D,2400.0));
    c*=0.94+0.08*fbm(pp*22.0);
    c*=1.0-0.2*pow(length(vUv-0.5)*1.25,2.0);
    gl_FragColor=vec4(c,1.0);return;}
  if(style==4){
    vec3 c=texture2D(tColor,vUv).rgb;float D=linD(vUv);float sky=step(2400.0,D);
    float L=lum(c);float Lq=floor(L*8.0+0.5)/8.0;c=c*(Lq/max(L,0.001));c=c*0.86+vec3(0.1,0.075,0.06)*(1.0-night);
    vec3 skyc=mix(vec3(0.98,0.84,0.62),vec3(0.42,0.62,0.82),smoothstep(0.42,1.0,vUv.y));skyc=mix(skyc,vec3(0.05,0.07,0.15),night);
    c=mix(c,skyc,sky);c=mix(c,mix(vec3(0.96,0.84,0.66),vec3(0.1,0.12,0.2),night),smoothstep(120.0,1200.0,D)*0.55*(1.0-sky));
    c*=1.0-0.18*pow(length(vUv-0.5)*1.2,2.0);gl_FragColor=vec4(c,1.0);return;}
  if(style==5){
    float D=linD(vUv);float sky=step(2400.0,D);vec3 c=texture2D(tColor,vUv).rgb;
    vec3 hor=vec3(0.98,0.62,0.34),top=vec3(0.24,0.2,0.36);
    vec3 skyc=mix(hor,top,smoothstep(0.35,1.0,vUv.y));
    float sd=length((vUv-sunUV)*vec2(res.x/res.y,1.0));float sun=smoothstep(0.06,0.054,sd)*sunVis;skyc+=vec3(1.0,0.6,0.3)*exp(-sd*7.0)*0.35*sunVis;
    skyc=mix(skyc,vec3(1.0,0.86,0.6),sun);
    float t=smoothstep(8.0,700.0,D);
    vec3 sil=mix(vec3(0.08,0.05,0.07),mix(vec3(0.55,0.3,0.28),hor*0.9,0.5),pow(t,0.55));
    float rim=smoothstep(0.55,0.95,lum(c))*0.12*(1.0-t);
    sil+=vec3(0.9,0.5,0.25)*rim;
    vec3 o=mix(sil,skyc,sky);
    o*=0.96+0.06*fbm(pp*20.0);gl_FragColor=vec4(o,1.0);return;}
  if(style==6){
    vec3 c=soft(vUv,2.0);float D=linD(vUv);float sky=step(2400.0,D);float L=clamp(lum(c)*1.25,0.0,1.0);
    L=mix(L,0.92,smoothstep(150.0,1400.0,D)*0.75);if(sky>0.5)L=0.97-0.12*vUv.y;
    vec2 px=vUv*res;float w=6.0;
    float h1=abs(fract((px.x+px.y)/w)-0.5)*2.0,h2=abs(fract((px.x-px.y)/w)-0.5)*2.0,h3=abs(fract(px.y/(w*0.8))-0.5)*2.0,h4=abs(fract(px.x/(w*0.8))-0.5)*2.0;
    float ink=0.0;
    ink=max(ink,(1.0-smoothstep(0.0,0.35+0.4*(0.8-L),h1))*step(L,0.8));
    ink=max(ink,(1.0-smoothstep(0.0,0.3+0.4*(0.58-L),h2))*step(L,0.58));
    ink=max(ink,(1.0-smoothstep(0.0,0.3+0.4*(0.38-L),h3))*step(L,0.38));
    ink=max(ink,(1.0-smoothstep(0.0,0.35,h4))*step(L,0.2));
    float e=smoothstep(0.04,0.12,eDepth(vUv,1.2))*(1.0-sky);ink=max(ink,e);
    vec3 paper=mix(vec3(0.95,0.92,0.84),vec3(0.88,0.83,0.72),fbm(pp*4.0)*0.7+0.3*length(vUv-0.5));
    vec3 o=mix(paper,vec3(0.16,0.12,0.1),ink*0.92);
    o*=mix(1.0,0.5,night);gl_FragColor=vec4(o,1.0);return;}
  if(style==7){
    vec3 c=(soft(vUv,4.0)+soft(vUv,9.0))*0.5;float D=linD(vUv);float sky=step(2400.0,D);
    float layer=floor(log(D)*2.2);
    float Lp=floor(clamp(lum(c)*1.3,0.0,1.0)*4.0+0.5)/4.0;
    vec3 pastel=Lp<0.13?vec3(0.42,0.3,0.24):Lp<0.38?vec3(0.66,0.45,0.32):Lp<0.63?vec3(0.84,0.64,0.44):Lp<0.88?vec3(0.92,0.8,0.6):vec3(0.97,0.92,0.8);
    float hueK=clamp((c.b-c.r)*3.0,0.0,1.0);pastel=mix(pastel,vec3(0.55,0.62,0.66),hueK*0.5);
    pastel*=0.9+0.12*fract(sin(layer*12.9898)*43758.5453);
    vec2 so=vec2(5.0,-6.0)/res;float Dn=linD(vUv+so);
    float shadow=smoothstep(0.04,0.18,log(D)-log(Dn))*(1.0-sky);
    float edge=smoothstep(0.05,0.12,eDepth(vUv,1.0))*(1.0-sky);
    vec3 skyc=mix(vec3(0.97,0.88,0.72),vec3(0.62,0.76,0.86),smoothstep(0.45,1.0,vUv.y));skyc=mix(skyc,vec3(0.1,0.12,0.22),night);
    vec3 o=mix(pastel,skyc,sky);
    o=mix(o,vec3(1.0,0.98,0.94),edge*0.6);o*=1.0-shadow*0.35;
    o*=0.93+0.1*fbm(pp*26.0+fbm(pp*3.0));
    gl_FragColor=vec4(o,1.0);return;}
  if(style==8){
    vec3 c=texture2D(tColor,vUv).rgb;float D=linD(vUv);float sky=step(2400.0,D);
    float L=lum(c);float b=L*4.0;float Lt=(floor(b)+smoothstep(0.3,0.7,fract(b)))/4.0;Lt=mix(L,Lt,0.18);
    c*=Lt/max(L,0.001);
    float Lc=lum(c);c=mix(vec3(Lc),c,1.12);
    c=mix(c*vec3(0.88,0.92,1.08),c*vec3(1.06,1.0,0.9),smoothstep(0.15,0.65,Lc));
    float fadeE=1.0-smoothstep(40.0,320.0,D);
    float e=smoothstep(0.045,0.13,eDepth(vUv,1.0))*(1.0-sky)*fadeE;
    c=mix(c,c*vec3(0.36,0.27,0.22),clamp(e,0.0,1.0)*0.42);
    vec3 bl=soft(vUv,5.0);c+=max(bl-0.78,vec3(0.0))*0.4*(1.0-night*0.5);
    c*=1.08;c=clamp((c*(2.51*c+0.03))/(c*(2.43*c+0.59)+0.14),0.0,1.0);
    c=pow(max(c,vec3(0.0)),vec3(0.96));
    c*=1.0-0.16*pow(length(vUv-0.5)*1.25,2.0);
    gl_FragColor=vec4(c,1.0);return;}
  gl_FragColor=texture2D(tColor,vUv);
}`});
// tezhip (illumination) frame drawn over any style
const frameMat=new THREE.ShaderMaterial({uniforms:{res:postU.res},depthTest:false,depthWrite:false,
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',
  fragmentShader:`uniform vec2 res;varying vec2 vUv;
void main(){vec2 px=vUv*res;vec2 b=min(px,res-px);float m=min(b.x,b.y);float W=max(30.0,min(res.x,res.y)*0.055);
  if(m>W)discard;
  vec3 gold=vec3(0.80,0.64,0.30),lap=vec3(0.12,0.22,0.43),cream=vec3(0.93,0.87,0.74),c;
  float bw=W-12.0;
  if(m<3.0)c=gold;else if(m<6.0)c=lap;else if(m<W-6.0){
    float along=(b.x<b.y)?px.y:px.x;vec2 t=vec2(fract(along/bw)-0.5,(m-6.0)/bw-0.5);
    float r=length(t),a=atan(t.y,t.x),star=0.32+0.09*cos(8.0*a);
    c=r<star?gold:lap;if(r<0.11)c=cream;if(abs(r-star)<0.03)c=vec3(0.96,0.86,0.56);
    vec2 t2=vec2(fract(along/bw),(m-6.0)/bw)-vec2(0.0,0.5);if(length(t2)<0.1||length(t2-vec2(1.0,0.0))<0.1)c=cream;
  }else if(m<W-3.0)c=gold;else c=lap;
  gl_FragColor=vec4(c,1.0);}`});
let frameOn=false;
const postScene=new THREE.Scene(),postCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),postMat));
const frameMesh=new THREE.Mesh(new THREE.PlaneGeometry(2,2),frameMat);frameMesh.renderOrder=1;frameMesh.visible=false;postScene.add(frameMesh);
function sizePost(){const s=renderer.getDrawingBufferSize(new THREE.Vector2()).multiplyScalar(POST_SCALE);rt.setSize(Math.round(s.x),Math.round(s.y));postU.res.value.set(Math.round(s.x),Math.round(s.y));}
sizePost();
const FLAT_COL={stone:0x6c6055,mud:0xc29a6c,roof:0xb08b64,wood:0x6b4a2f,fabric:0xd9cdb3};
let flatTerrain=null;
function setFlat(on){
  for(const k in FLAT_COL){const m=mat[k];if(m.userData.map===undefined){m.userData.map=m.map;m.userData.col=m.color.getHex();}
    m.map=on?null:m.userData.map;m.color.setHex(on?FLAT_COL[k]:m.userData.col);m.needsUpdate=true;}
  if(terrainRef){if(!terrainRef.userData.mat)terrainRef.userData.mat=terrainRef.material;
    if(on&&!flatTerrain)flatTerrain=new THREE.MeshPhongMaterial({vertexColors:true,flatShading:true,shininess:0,specular:0x000000});
    terrainRef.material=on?flatTerrain:terrainRef.userData.mat;}
}
function setFrame(on){frameOn=!!on&&canPost;frameMesh.visible=frameOn;const b=$('#b-frame');if(b)b.setAttribute('aria-pressed',frameOn);}
function setStyle(i){styleIdx=canPost?i:0;postU.style.value=styleIdx;setFlat(styleIdx===4);{const bs=$('#b-style');if(bs)bs.textContent='Stil: '+STYLES[styleIdx];}applyTime();}
function renderFrame(){
  if(styleIdx===0&&!frameOn){renderer.render(scene,camera);return;}
  postU.night.value=T.stars;
  const sp=camera.position.clone().addScaledVector(sunDir,1000).project(camera);postU.sunUV.value.set(sp.x*.5+.5,sp.y*.5+.5);postU.sunVis.value=sp.z<1?1:0;
  renderer.setRenderTarget(rt);renderer.render(scene,camera);renderer.setRenderTarget(null);renderer.render(postScene,postCam);
}
function stepTime(dt){if(tK>=1||!tTo)return;tK=Math.min(1,tK+dt/1.3);const e=tK*tK*(3-2*tK);
  for(const k in tTo){if(tTo[k].isColor)T[k].copy(tFrom[k]).lerp(tTo[k],e);else T[k]=lerp(tFrom[k],tTo[k],e);}}
applyTime();

