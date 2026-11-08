/* ===================== visual upgrade: baked textures, PBR materials, props, grass, clouds ===================== */
const TLd=new THREE.TextureLoader();
const ANI=Math.min(QL.tier==='high'?8:4,renderer.capabilities.getMaxAnisotropy());
function tx(name){const t=TLd.load(TEXDATA[name]);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=ANI;return t;}
const TX={};for(const n of ['plaster','stone','kaaba','sand','wood','wool'])TX[n]={a:tx(n+'_a'),n:QL.std?tx(n+'_n'):null};
function pbr(name,color,o){o=o||{};const t=TX[name];
  if(QL.std)return new THREE.MeshStandardMaterial(Object.assign({map:t.a,normalMap:t.n,normalScale:new THREE.Vector2(o.ns||.9,o.ns||.9),color:color==null?0xffffff:color,roughness:o.rough||.94,metalness:0},o.extra||{}));
  return new THREE.MeshLambertMaterial(Object.assign({map:t.a,color:color==null?0xffffff:color},o.extra||{}));}
// replacements for the materials the world was built with
const REPL=new Map();
const newMat={
  mud:pbr('plaster',0xf4e6cf),mud1:pbr('plaster',0xf8dcc8),mud2:pbr('plaster',0xefe8d8),roof:pbr('plaster',0xd2bc9a,{ns:.5}),
  stone:pbr('stone',0xffffff,{ns:1.2}),kaaba:pbr('kaaba',0xffffff,{ns:1.1,rough:.8}),wood:pbr('wood',0xffffff),
  fabric:pbr('wool',0xffffff,{ns:.6}),awn:pbr('wool',0xffffff,{ns:.6,extra:{side:THREE.DoubleSide}}),tent:pbr('wool',0x4a3e36,{ns:.8,extra:{}}),
};
for(const k in newMat){if(mat[k]){REPL.set(mat[k],newMat[k]);mat[k]=newMat[k];}}
if(QL.std&&mat.oldk){const m=new THREE.MeshStandardMaterial({map:mat.oldk.map,normalMap:TX.stone.n,normalScale:new THREE.Vector2(.8,.8),roughness:.95});REPL.set(mat.oldk,m);mat.oldk=m;}
{ // terrain: sand with ripples and pebbles
  const tm=terrainRef.material;const t=TX.sand;t.a.repeat.set(TS/9,TS/9);if(t.n)t.n.repeat.set(TS/9,TS/9);
  const m=QL.std?new THREE.MeshStandardMaterial({map:t.a,normalMap:t.n,normalScale:new THREE.Vector2(.7,.7),vertexColors:true,roughness:1,metalness:0}):new THREE.MeshLambertMaterial({map:t.a,vertexColors:true});
  REPL.set(tm,m);
}
function upgradeMat(m){if(REPL.has(m))return REPL.get(m);
  if(QL.std&&m&&m.isMeshLambertMaterial&&!m.map){const n=new THREE.MeshStandardMaterial({color:m.color,roughness:.9,metalness:0,side:m.side,transparent:m.transparent,opacity:m.opacity,vertexColors:m.vertexColors,depthWrite:m.depthWrite,emissive:m.emissive,polygonOffset:m.polygonOffset,polygonOffsetFactor:m.polygonOffsetFactor});REPL.set(m,n);return n;}
  return m;}
function upgradeScene(root){root.traverse(o=>{if(o.isMesh&&!o.isSprite&&o.material&&!Array.isArray(o.material))o.material=upgradeMat(o.material);});}
upgradeScene(scene);

/* ---------- street and roof life (instanced, density by quality) ---------- */
{
  const R=mulberry32(1405),bench=[],basket=[],rug=[],sack=[],logs=[],poles=[],shade=[],rail=[],rung=[];
  const T=(h,lx,ly,lz,ry,sx,sy,sz)=>M(h.x,0,h.z,h.th).multiply(M(lx,ly,lz,ry||0,sx==null?1:sx,sy==null?1:sy,sz==null?1:sz));
  for(const h of houses){if(R()>QL.props)continue;const {w,d,y0,H}=h;const top=y0+H+.05;
    // stone bench (mastaba) beside the door
    if(R()<.5){const s=R()<.5?-1:1;const bx=h.dx+s*(h.doorW/2+.85);if(Math.abs(bx)<w/2-.6)bench.push(T(h,bx,y0+.38,-d/2-.38,0,1.2,.42,.55));}
    // baskets and sacks by the door
    if(R()<.45)basket.push(T(h,h.dx+(R()<.5?-1:1)*(h.doorW/2+.5+R()*.6),y0+.33,-d/2-.45-R()*.3,R()*6,1,1,1));
    if(R()<.3)sack.push(T(h,h.dx+(R()<.5?-1:1)*(h.doorW/2+.4),y0+.42,-d/2-.4,R()*6,1,.8,1));
    // roof clutter, kept away from the upper room
    const free=h.up?-h.side:(R()<.5?-1:1),rx=()=>free*(.6+R()*(w/2-1.4)),rz=()=>(R()-.5)*(d-1.6);
    const n=R()<.7?1+(R()*3|0):0;
    for(let k=0;k<n;k++){const t=R();if(t<.35)rug.push(T(h,rx(),top+.14,rz(),R()*3,1,1,1));else if(t<.6)basket.push(T(h,rx(),top+.18,rz(),R()*6,1,1,1));else if(t<.8)sack.push(T(h,rx(),top+.25,rz(),R()*6,1,.8,1));else{const x=rx(),z=rz(),ry=R()*3;for(let j=0;j<3;j++)logs.push(T(h,x,top+.08+(j===2?.14:0),z+(j===2?0:(j-.5)*.2),ry,1,1,1));}}
    // a palm-frond shade on some roofs
    if(R()<.18&&!h.up){const sx=free*(w/4),sw=Math.min(3.2,w/2-.4),sd=Math.min(2.8,d-1.4);for(const [px,pz] of [[-1,-1],[1,-1],[-1,1],[1,1]])poles.push(T(h,sx+px*sw/2,top+1.05,pz*sd/2,0,1,2.1,1));shade.push(T(h,sx,top+2.12,0,0,sw+.3,.07,sd+.3));}
    // a ladder leaning on the wall
    if(R()<.12){const lx=(R()-.5)*(w-2.5),lz=d/2+.42,len=H+.3;for(const s of [-.25,.25])rail.push(T(h,lx+s,y0+len/2,lz,0,1,len,1).multiply(new THREE.Matrix4().makeRotationX(-.13)));
      for(let y=.35;y<len-.2;y+=.4)rung.push(T(h,lx,y0+y,lz+.13-.042*y*.0,0,1,1,1).multiply(new THREE.Matrix4().makeRotationX(-.13)));}
  }
  const inst=(geo,m,l)=>{if(!l.length)return;const im=new THREE.InstancedMesh(geo,m,l.length);l.forEach((mm,i)=>im.setMatrixAt(i,mm));im.castShadow=true;im.receiveShadow=true;im.frustumCulled=false;scene.add(im);};
  const clayM=upgradeMat(new THREE.MeshLambertMaterial({color:0xb27a4c})),reedM=upgradeMat(new THREE.MeshLambertMaterial({color:0xb8995c})),sackM=upgradeMat(new THREE.MeshLambertMaterial({color:0xd6c39c}));
  inst(new THREE.BoxGeometry(1,1,1),mat.stone,bench);
  const bg=new THREE.CylinderGeometry(.26,.2,.36,10,1,true);inst(bg,reedM,basket);
  const rg=new THREE.CylinderGeometry(.15,.15,1.5,8);rg.rotateZ(Math.PI/2);inst(rg,mat.fabric,rug);
  inst(new THREE.SphereGeometry(.3,8,6),sackM,sack);
  const lg=new THREE.CylinderGeometry(.07,.07,1.1,6);lg.rotateZ(Math.PI/2);inst(lg,mat.wood,logs);
  inst(new THREE.CylinderGeometry(.06,.07,1,6),mat.wood,poles);inst(new THREE.BoxGeometry(1,1,1),reedM,shade);
  inst(new THREE.BoxGeometry(.07,1,.07),mat.wood,rail);inst(new THREE.BoxGeometry(.5,.05,.06),mat.wood,rung);
}
/* ---------- desert grass tufts along walls and the valley edges ---------- */
if(QL.grass>0){
  const gt=TLd.load(TEXDATA.grass);const gm=new THREE.MeshLambertMaterial({map:gt,alphaTest:.45,side:THREE.DoubleSide,color:0xd9cf9a});
  const pg=new THREE.PlaneGeometry(.9,.9);pg.translate(0,.42,0);const g2=pg.clone();g2.rotateY(Math.PI/2);
  const pos=[];const R=mulberry32(77);const inside=(x,z)=>{for(const o of OBBS){const dx=x-o.cx,dz=z-o.cz;if(Math.abs(dx)>o.rad+.5||Math.abs(dz)>o.rad+.5)continue;const lx=dx*o.c-dz*o.s,lz=dx*o.s+dz*o.c;if(Math.abs(lx)<o.hw+.2&&Math.abs(lz)<o.hd+.2)return true;}return false;};
  const want=Math.round(1400*QL.grass);
  for(let t=0;t<want*6&&pos.length<want;t++){let x,z;
    if(R()<.55){const h=houses[(R()*houses.length)|0];const side=R()*4|0,c=Math.cos(h.th),s=Math.sin(h.th);let lx,lz;if(side<2){lx=(R()-.5)*h.w;lz=(side?1:-1)*(h.d/2+.25);}else{lz=(R()-.5)*h.d;lx=(side===2?1:-1)*(h.w/2+.25);}x=h.x+lx*c+lz*s;z=h.z-lx*s+lz*c;}
    else{x=(R()*2-1)*95;z=(R()*2-1)*330;if(valleyD(x,z)<70&&R()<.8)continue;}
    if(Math.hypot(x,z)<30||valleyD(x,z)>92||inside(x,z))continue;const s=.6+R()*.9;
    pos.push(new THREE.Matrix4().compose(new THREE.Vector3(x,height(x,z)-.03,z),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),R()*3),new THREE.Vector3(s,s*(.8+R()*.5),s)));}
  for(const geo of [pg,g2]){const im=new THREE.InstancedMesh(geo,gm,pos.length);pos.forEach((m,i)=>im.setMatrixAt(i,m));im.frustumCulled=false;im.receiveShadow=true;scene.add(im);}
}
/* ---------- clouds ---------- */
const cloudG=new THREE.Group();scene.add(cloudG);
if(QL.clouds){const ct=TLd.load(TEXDATA.cloud);const R=mulberry32(99);
  for(let i=0;i<22;i++){const m=new THREE.SpriteMaterial({map:ct,transparent:true,depthWrite:false,fog:false,opacity:.55+R()*.35});const s=new THREE.Sprite(m);
    const a=R()*6.283,r=700+R()*1100;s.position.set(Math.cos(a)*r,240+R()*260,Math.sin(a)*r);const sc=380+R()*520;s.scale.set(sc,sc*(.32+R()*.18),1);s.userData.a=a;s.userData.r=r;cloudG.add(s);}}
let cloudCol=new THREE.Color();
function stepClouds(dt){if(!QL.clouds)return;cloudG.position.set(camera.position.x,0,camera.position.z);cloudG.rotation.y+=dt*.002;
  const sh=(typeof T!=='undefined'&&T.hor)?T.hor:null;if(sh){cloudCol.copy(sh).lerp(new THREE.Color(1,1,1),.55);}
  const rain=typeof RAIN!=='undefined'?RAIN.amt:0;for(const s of cloudG.children){s.material.color.copy(cloudCol);if(rain>.1)s.material.color.multiplyScalar(1-.45*rain);}}
const e0=extraStep;extraStep=function(dt){e0(dt);stepClouds(dt);};
/* ---------- quality menu ---------- */
{const b=document.createElement('button');b.className='go alt';b.id='m-quality';
  const name={auto:LANG==='en'?'Auto':'Otomatik',high:LANG==='en'?'High':'Yüksek',med:LANG==='en'?'Medium':'Orta',low:LANG==='en'?'Low':'Düşük'};
  b.textContent=(LANG==='en'?'Quality: ':'Kalite: ')+name[QL.sel]+(QL.sel==='auto'?' ('+name[QL.tier]+')':'');
  document.getElementById('m-style').after(b);
  b.addEventListener('click',()=>{const order=['auto','high','med','low'];const nx=order[(order.indexOf(QL.sel)+1)%4];try{localStorage.setItem('bekke-quality',nx);}catch(_){}location.reload();});}
