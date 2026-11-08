/* ===================== l10: story clips (anime cutscenes) ===================== */
const KV=(x,y,z)=>new V3(x,y,z);
const KL=(lx,y,lz)=>{const p=kW(lx,lz);return new V3(p.x,y,p.z);};
const tmpObjs=[];function keep(o){scene.add(o);tmpObjs.push(o);return o;}
const SHARED_MATS=new Set();function isSharedMat(m){if(SHARED_MATS.size===0){Object.values(mat).forEach(x=>SHARED_MATS.add(x));if(typeof PERSON_MAT!=='undefined')SHARED_MATS.add(PERSON_MAT);if(typeof fabricTex!=='undefined')SHARED_MATS.add(fabricTex);}return SHARED_MATS.has(m)||(m&&(m===blockMat||m===jugMat||(m.userData&&m.userData.shared)));}
const SHARED_GEO=new Set([blockGeo,beamGeo,jugGeo,mudGeo]);
function disposeObj(o){o.traverse(m=>{if(!m.isMesh&&!m.isPoints)return;if(m.geometry&&!SHARED_GEO.has(m.geometry)&&!(m.geometry.userData&&m.geometry.userData.shared))m.geometry.dispose();
  const ms=Array.isArray(m.material)?m.material:[m.material];for(const x of ms){if(!x||isSharedMat(x))continue;if(x.map&&!isSharedMat(x.map)&&x.map!==fabricTex)x.map.dispose();x.dispose();}});}
function clearTmp(){tmpObjs.forEach(o=>{scene.remove(o);disposeObj(o);});tmpObjs.length=0;}
function crowdAt(list,look){return list.map(([x,z,o])=>{const p=makePerson(o||{});const s=freeSpot(x,z,.3);p.g.position.set(s.x,height(s.x,s.z),s.z);if(look)p.g.rotation.y=Math.atan2(look.x-s.x,look.z-s.z);keep(p.g);p.x=s.x;p.z=s.z;return p;});}
function pickaxe(p){const t=new THREE.Group();const h=new THREE.Mesh(new THREE.CylinderGeometry(.025,.03,.85,6),mat.wood);h.rotation.x=Math.PI/2;h.position.z=.25;t.add(h);
  const hd=new THREE.Mesh(new THREE.BoxGeometry(.5,.07,.07),Lm(0x55524e));hd.position.z=.66;t.add(hd);t.position.set(0,-.58,.04);p.armR.add(t);return t;}

/* ---------- the snake: a real tapered body with head, eyes and tongue, bent every frame ---------- */
function makeSnake(len){const N=60,RS=9,R0=.095;const pos=new Float32Array((N+1)*RS*3),col=new Float32Array((N+1)*RS*3),idx=[];
  const cA=new THREE.Color(0x5b5328),cB=new THREE.Color(0x2a2410),cBel=new THREE.Color(0xc8b47a);
  for(let i=0;i<=N;i++){const s=i/N;for(let j=0;j<RS;j++){const a=j/RS*6.283,k=(i*RS+j)*3;const belly=Math.sin(a)<-.45;const diamond=Math.sin(s*70+Math.cos(a)*2.2)>.55;const c=belly?cBel:diamond?cB:cA;col[k]=c.r;col[k+1]=c.g;col[k+2]=c.b;}}
  for(let i=0;i<N;i++)for(let j=0;j<RS;j++){const a=i*RS+j,b=i*RS+(j+1)%RS,c=(i+1)*RS+j,d=(i+1)*RS+(j+1)%RS;idx.push(a,b,c,b,d,c);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.setIndex(idx);
  const body=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.55,metalness:.05,side:THREE.DoubleSide}));body.frustumCulled=false;body.castShadow=true;
  const head=new THREE.Group();const hm=new THREE.MeshStandardMaterial({color:0x4f4722,roughness:.5});
  const skull=new THREE.Mesh(new THREE.SphereGeometry(1,14,10),hm);skull.scale.set(R0*1.55,R0*.95,R0*2.5);skull.position.z=R0*1.2;head.add(skull);
  const jaw=new THREE.Group();const jm=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),new THREE.MeshStandardMaterial({color:0xb8a46c,roughness:.6}));jm.scale.set(R0*1.3,R0*.45,R0*2.2);jm.position.set(0,-R0*.1,R0*1.1);jaw.add(jm);jaw.position.y=-R0*.35;head.add(jaw);
  const mouth=new THREE.Mesh(new THREE.SphereGeometry(1,10,6),new THREE.MeshBasicMaterial({color:0x7a1f24}));mouth.scale.set(R0*1.1,R0*.3,R0*1.8);mouth.position.set(0,-R0*.4,R0*1.3);head.add(mouth);
  for(const sx of [-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(R0*.36,10,8),new THREE.MeshStandardMaterial({color:0xe7c23a,roughness:.2,emissive:0x3a2a00}));e.position.set(sx*R0*1.15,R0*.45,R0*2);head.add(e);
    const pu=new THREE.Mesh(new THREE.BoxGeometry(R0*.08,R0*.5,R0*.12),new THREE.MeshBasicMaterial({color:0x080808}));pu.position.set(sx*R0*1.42,R0*.45,R0*2.08);head.add(pu);}
  const tongue=new THREE.Group();const tm=new THREE.MeshBasicMaterial({color:0xc4202e});const t0=new THREE.Mesh(new THREE.BoxGeometry(R0*.16,R0*.08,R0*2.2),tm);t0.position.z=R0*1.1;tongue.add(t0);
  for(const sx of [-1,1]){const f=new THREE.Mesh(new THREE.BoxGeometry(R0*.1,R0*.07,R0*.9),tm);f.position.set(sx*R0*.18,0,R0*2.5);f.rotation.y=sx*.35;tongue.add(f);}
  tongue.position.set(0,-R0*.25,R0*3.4);head.add(tongue);
  const g=new THREE.Group();g.add(body,head);
  const T=new V3(),S=new V3(),U=new V3(),UP=new V3(0,1,0);
  function rad(s){return Math.max(.012,R0*Math.pow(Math.min(1,s/.4),.65)*(s>.92?1-(s-.92)*2.2:1));}
  return {g,len,N,head,jaw,tongue,
    set(spine,open,tng){for(let i=0;i<=N;i++){const p=spine[i];const q=spine[Math.min(N,i+1)],o=spine[Math.max(0,i-1)];T.subVectors(q,o).normalize();S.crossVectors(T,UP);if(S.lengthSq()<1e-6)S.set(1,0,0);S.normalize();U.crossVectors(S,T).normalize();
        const r=rad(i/N);for(let j=0;j<RS;j++){const a=j/RS*6.283,c=Math.cos(a)*r,sn=Math.sin(a)*r*.82,k=(i*RS+j)*3;pos[k]=p.x+S.x*c+U.x*sn;pos[k+1]=p.y+S.y*c+U.y*sn;pos[k+2]=p.z+S.z*c+U.z*sn;}}
      geo.attributes.position.needsUpdate=true;geo.computeVertexNormals();
      const e=spine[N],e0=spine[N-2];head.position.copy(e);T.subVectors(e,e0).normalize();head.lookAt(e.x+T.x,e.y+T.y,e.z+T.z);
      jaw.rotation.x=(open||0)*.55;mouth.visible=(open||0)>.2;tongue.visible=tng>0;tongue.scale.z=Math.max(.01,tng||0);}};}
function makeEagle(){const g=new THREE.Group();const brown=new THREE.MeshStandardMaterial({color:0x4b321f,roughness:.8}),dark=new THREE.MeshStandardMaterial({color:0x2a1b11,roughness:.85}),gold=new THREE.MeshStandardMaterial({color:0x9a6a33,roughness:.7}),yel=new THREE.MeshStandardMaterial({color:0xe0a92a,roughness:.5});
  const body=new THREE.Mesh(new THREE.SphereGeometry(.3,16,12),brown);body.scale.set(.82,.72,1.6);g.add(body);
  const chest=new THREE.Mesh(new THREE.SphereGeometry(.27,14,10),gold);chest.scale.set(.8,.8,1);chest.position.set(0,-.05,.2);g.add(chest);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.17,14,10),gold);head.position.set(0,.13,.54);head.scale.set(.9,.95,1.15);g.add(head);
  const beak=new THREE.Mesh(new THREE.ConeGeometry(.06,.18,10),yel);beak.rotation.x=Math.PI/2;beak.position.set(0,.1,.72);g.add(beak);
  const tip=new THREE.Mesh(new THREE.ConeGeometry(.03,.09,8),dark);tip.rotation.x=Math.PI*.9;tip.position.set(0,.06,.8);g.add(tip);
  for(const sx of [-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.03,8,6),new THREE.MeshBasicMaterial({color:0x140c06}));e.position.set(sx*.09,.17,.64);g.add(e);
    const br=new THREE.Mesh(new THREE.BoxGeometry(.07,.02,.06),dark);br.position.set(sx*.085,.205,.64);br.rotation.z=sx*-.3;g.add(br);}
  const tail=new THREE.Mesh(new THREE.CircleGeometry(.48,14,Math.PI*1.27,Math.PI*.46),new THREE.MeshStandardMaterial({color:0x3a2516,roughness:.85,side:THREE.DoubleSide}));tail.rotation.x=Math.PI/2;tail.position.set(0,.02,-.3);g.add(tail);
  const sh=[],el=[];
  for(const s of [1,-1]){const S=new THREE.Group();S.position.set(s*.17,.08,.06);g.add(S);
    const inner=new THREE.Mesh(new THREE.BoxGeometry(.82,.05,.5),brown);inner.position.set(s*.41,0,0);S.add(inner);
    const cov=new THREE.Mesh(new THREE.BoxGeometry(.7,.06,.22),gold);cov.position.set(s*.38,.02,.13);S.add(cov);
    const E=new THREE.Group();E.position.set(s*.82,0,0);S.add(E);
    const outer=new THREE.Mesh(new THREE.BoxGeometry(.62,.04,.4),dark);outer.position.set(s*.31,0,-.03);E.add(outer);
    for(let k=0;k<6;k++){const f=new THREE.Mesh(new THREE.BoxGeometry(.5,.014,.08),dark);f.position.set(s*(.7),0,.13-k*.06);f.rotation.y=s*(.3-k*.12);E.add(f);}
    sh.push(S);el.push(E);}
  const legs=new THREE.Group();legs.position.set(0,-.16,.08);g.add(legs);
  for(const sx of [-1,1]){const l=new THREE.Mesh(new THREE.CylinderGeometry(.04,.035,.3,8),gold);l.position.set(sx*.08,-.12,0);legs.add(l);const f=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.12,6),yel);f.position.set(sx*.08,-.3,.02);legs.add(f);
    for(let k=0;k<3;k++){const c=new THREE.Mesh(new THREE.ConeGeometry(.015,.09,5),dark);c.position.set(sx*.08+(k-1)*.035,-.36,.06);c.rotation.x=Math.PI*.8;legs.add(c);}}
  g.scale.setScalar(1.55);g.traverse(m=>{if(m.isMesh)m.castShadow=true;});let ph=0;
  return {g,legs,flap(dt,amp,speed,sweep){ph+=dt*(speed||9);const a=Math.sin(ph)*amp,b=Math.sin(ph-.9)*amp*.65;sh[0].rotation.z=a;sh[1].rotation.z=-a;el[0].rotation.z=b;el[1].rotation.z=-b;sh[0].rotation.y=sweep||0;sh[1].rotation.y=-(sweep||0);}};}
function screech(){if(!AU.ctx)return;const c=AU.ctx,o=c.createOscillator(),g=c.createGain();o.type='sawtooth';o.frequency.setValueAtTime(2400,c.currentTime);o.frequency.exponentialRampToValueAtTime(1300,c.currentTime+.55);
  const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=2200;f.Q.value=3;g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(.09,c.currentTime+.04);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.7);o.connect(f);f.connect(g);g.connect(AU.master||c.destination);o.start();o.stop(c.currentTime+.75);}
function hiss(){nz(.9,5200,.6,.18,'highpass');}

/* ---------- Chapter 1 opening: the flood ---------- */
let FULL_INTRO=false;   // chapter 1 opens with a ~10 s short version; the full 19 s intro is one tap away on the story card
function clipFlood(done){setTime('night');RAIN.target=1;RAIN.amt=1;flood.visible=true;kaaba({old:true,wallH:0,rubble:false,green:false,scaffold:false,stone:false,roof:false,door:false,hijr:false});
  const full=FULL_INTRO;FULL_INTRO=false;const pick=sh=>full?sh:[Object.assign({},sh[0],{d:3}),sh[2],sh[4]];
  anime(pick([
    {d:4.2,from:{p:KV(0,60,90),l:KV(0,0,0)},to:{p:KV(10,22,40),l:KV(0,2,0)},title:[L2('Mekke · M.S. 605','Mecca · 605 CE'),NAME],tint:'rgba(20,30,60,.25)',vig:.5},
    {d:4,from:{p:KL(0,7,-22),l:KL(0,2,0)},to:{p:KL(2,5,-16),l:KL(0,2.5,0)},vig:.4,bubbles:[{nar:true,t:L2("Bu, Kâbe. Hz. İbrâhim'in yaptığı ilk ev. Duvarları bir adam boyu, damı yok.","This is the Kaaba, the first house, built by Prophet Ibrahim. Its walls are only a man's height, and it has no roof.")}]},
    {d:3.4,from:{p:KV(-22,16,-26),l:KV(0,0,0)},to:{p:KV(-15,10,-18),l:KV(0,.6,0)},start:()=>{flood.visible=true;flood.scale.setScalar(1.35);},speed:1,impact:L2('SEL!','FLOOD!'),flash:'#cfe0ff',shake:.6,sfx:()=>sfx.thunder(),bubbles:[{nar:true,t:L2('Bir kış gecesi dağlardan dev bir sel indi ve vadiyi doldurdu.','One winter night a great flood rushed down from the mountains and filled the valley.')}]},
    {d:4,from:{p:KV(11,3,-7),l:KV(0,2.5,0)},to:{p:KV(8,2.2,-5),l:KV(-1,2.8,0)},flash:'#fff',sfx:()=>sfx.thunder(),bubbles:[{nar:true,t:L2("Sular Kâbe'nin harçsız duvarlarını çatlattı. Evler çamura gömüldü.","The water cracked the Kaaba's mortarless walls. Houses were buried in mud.")}]},
    {d:3.6,from:{p:KV(26,6,26),l:KV(22,1,20)},to:{p:KV(24,4,22),l:KV(20,1,18)},tint:'rgba(20,30,60,.2)',bubbles:[{who:L2('Bir anne','A mother'),t:L2('Evimiz çamurla doldu! Biri yardım etsin!','Our house is full of mud! Somebody help!'),at:'tl'},{nar:true,t:L2('Sen genç bir Mekkelisin. Önce komşularına yardım et.','You are a young Meccan. First, help your neighbours.'),delay:1.6}]},
  ]),()=>{flood.scale.setScalar(1);if(done)done();});}
/* ---------- Chapter 1 ending: the council, the snake and the eagle ---------- */
function clipCouncil(done){const h=NAMED.e_nedve,nd=doorPt(h),out=KV(nd.x-h.x,0,nd.z-h.z).normalize(),side=KV(-out.z,0,out.x);setTime('eve');RAIN.target=0;
  const NV=(o,s,y)=>KV(nd.x+out.x*o+side.x*s,nd.y+y,nd.z+out.z*o+side.z*s);
  const el=crowdAt([0,1,2,3,4,5].map(i=>{const a=-1+i*.4,p=NV(3.2-Math.cos(a)*1.6,Math.sin(a)*3.2,0);return [p.x,p.z,{robe:[0x8a3a2c,0x2f5d8a,0x4d6b3a,0x6b4a7a,0x7a5a3a,0xc58b3a][i],beard:i%2?0xd8d0c4:0x3a2e26,hat:'turban'}];}),NV(3.2,0,0));
  anime([{d:3.6,from:{p:NV(13,3,6),l:NV(2,1.4,0)},to:{p:NV(10,4,4),l:NV(2.5,1.2,0)},tint:'rgba(255,170,90,.1)',bubbles:[{nar:true,t:L2("Kureyş'in büyükleri Dâru'n-Nedve'de toplandı. Karar verdiler: Kâbe'yi yıkıp sağlam bir şekilde yeniden yapacaklar.","The elders of Quraysh met at the Dar al-Nadwa. They decided to take the Kaaba down and rebuild it strong.")}],upd:()=>el.forEach(p=>animPerson(p,.016,0,'talk'))},
    {d:4,from:{p:NV(7.5,1.9,-1.8),l:NV(3,1.5,0)},to:{p:NV(6.8,1.8,-1.4),l:NV(3,1.6,0)},bubbles:[{who:L2('Ebû Vehb','Abu Wahb'),t:L2('Kâbe\'ye yalnız helal mal girsin! Faizle, kumarla, haksızlıkla kazanılan tek kuruş girmesin!','Only honest money for the Kaaba! Not one coin earned by usury, gambling or injustice!'),at:'tl'},{who:L2('Kureyş','Quraysh'),t:L2('Kabul!','Agreed!'),at:'br',delay:2.4}],upd:()=>el.forEach(p=>animPerson(p,.016,0,'talk'))}
  ],()=>{clearTmp();discover('o_helal',true);clipSnake(done);});}
function clipSnake(done){setTime('noon');kaaba({old:true});
  const lz=-KD/2+.45,sy=OLD_H+.03,A0=KL(-2.6,sy,lz),A1=KL(1.0,sy,lz),nrm=KL(0,0,lz+1).sub(KL(0,0,lz)).normalize();
  const sn=makeSnake(3.6);keep(sn.g);const spine=[];for(let i=0;i<=sn.N;i++)spine.push(new V3());
  let rear=0,open=0,carried=null,tng=0;
  function pose(dt){const t=clock;
    for(let i=0;i<=sn.N;i++){const s=i/sn.N,p=spine[i];
      if(!carried){p.lerpVectors(A0,A1,s);const lat=Math.sin(s*10-t*4.5)*.13*(.35+.65*s)*(1-rear*.6);p.addScaledVector(nrm,lat);p.y=sy+.08;
        if(s>.6&&rear>0){const u=(s-.6)/.4;p.y+=Math.pow(u,1.6)*.95*rear;p.addScaledVector(nrm,-u*u*.5*rear+Math.sin(t*2.6)*.1*u*rear);}}
      else{const u=1-s;p.copy(carried);p.y-=u*sn.len*.9;p.x+=Math.sin(u*6+t*7)*.32*u;p.z+=Math.cos(u*5+t*6)*.26*u;}}
    tng=Math.max(0,Math.sin(t*9))>.4?1:.0;sn.set(spine,open,tng);}
  const eg=makeEagle();keep(eg.g);const head0=KL(1.0,sy+.95,lz-.5);
  const ctr=KL(-1,sy+11,lz-6);let eA=0;const eagleCircle=k=>{eA=1.2+k*2.4;eg.g.position.set(ctr.x+Math.cos(eA)*6.5,ctr.y+Math.sin(eA*2)*1,ctr.z+Math.sin(eA)*6.5);const nx=ctr.x+Math.cos(eA+.1)*6.5,nz2=ctr.z+Math.sin(eA+.1)*6.5;eg.g.lookAt(nx,eg.g.position.y,nz2);eg.g.rotation.z+= -.45;};
  const wk=crowdAt([0,1,2,3,4,5].map(i=>{const p=kW(-3.2+i*1.25,-KD/2-2.6-(i%2)*.9);return [p.x,p.z,{robe:[0x7a5a3a,0x8a3a2c,0x2f5d8a,0x4d6b3a,0xc58b3a,0x6b4a7a][i],hat:i%2?'turban':'scarf',beard:0x3a2e26}];}),KL(-.5,0,lz));
  wk.forEach(p=>{pickaxe(p);p.base=p.g.position.clone();});
  const out=nrm.clone().multiplyScalar(-1);
  const wkPose=(mode,back)=>wk.forEach((p,i)=>{p.g.position.copy(p.base).addScaledVector(out,back||0);animPerson(p,.016,0,mode);});
  const cBase=KL(0,1.6,-KD/2-9);let dive0=new V3(),dive1=head0.clone().add(KV(0,.5,0)).addScaledVector(out,.2);const away=KL(-40,40,-70);
  anime([
    {d:4.6,from:{p:KL(7,4.5,-KD/2-15),l:KL(-1,3,-KD/2)},to:{p:KL(4,7.2,-KD/2-9),l:KL(-.5,sy,lz)},bubbles:[{nar:true,t:L2('Yıkım günü geldi. Ama Kâbe\'nin duvarında yıllardır bir yılan yaşıyordu. İçerideki hazine kuyusunu o bekliyordu.','The day of demolition came. But for years a snake had lived on the Kaaba\'s wall, guarding the treasure pit inside.')}],
      upd:(k,dt)=>{rear=0;open=0;pose(dt);wk.forEach(p=>{p.g.position.copy(p.base).addScaledVector(nrm,k*.6);animPerson(p,.016,1.2,'walk');});eagleCircle(0);eg.g.visible=false;}},
    {d:3.8,from:{p:KL(3.8,sy+1.1,lz-4.2),l:KL(.4,sy+.5,lz)},to:{p:KL(3.1,sy+.95,lz-3.4),l:KL(.8,sy+.8,lz)},impact:L2('TISSS!','HISSS!'),shake:.25,vig:.45,sfx:()=>{hiss();setTimeout(hiss,700);},
      bubbles:[{who:L2('Bir işçi','A worker'),t:L2('Yaklaşan olursa başını kaldırıp ağzını açıyor! Kimse yanına gidemiyor!','Whoever comes near, it rears up and opens its jaws! No one can get close!'),at:'tl'}],
      upd:(k,dt)=>{rear=Math.min(1,k*2.2);open=k>.3?.6+Math.sin(clock*5)*.4:0;pose(dt);wkPose('cry',Math.min(1,k*1.6)*1.6);}},
    {d:3.6,from:{p:cBase,l:ctr.clone().add(KV(0,-6,0))},to:{p:cBase.clone().add(KV(0,.3,0)),l:ctr},vig:.3,sfx:()=>{screech();setTimeout(screech,1400);},
      bubbles:[{nar:true,t:L2('Kureyş korkuyla bekledi. Derken gökyüzünde büyük bir kartal belirdi.','Quraysh waited in fear. Then a great eagle appeared in the sky.')}],
      upd:(k,dt)=>{rear=.7;open=.2;pose(dt);wkPose('idle',1.6);eg.g.visible=true;eagleCircle(k);eg.flap(dt,k<.5?.15:.5,4,0);dive0.copy(eg.g.position);}},
    {d:2.6,from:{p:KL(-6,sy+1.5,-KD/2-6),l:ctr},to:{p:KL(-2.6,sy+1.4,-KD/2-4),l:head0},speed:.9,vig:.55,tint:'rgba(255,240,210,.08)',
      upd:(k,dt)=>{rear=.8;open=.8;pose(dt);wkPose('cry',1.6);const e=k*k;const c=dive0.clone().lerp(dive1,.5).add(KV(0,6,0));const a=dive0.clone().lerp(c,e),b=c.clone().lerp(dive1,e);const p=a.lerp(b,e);
        const prev=eg.g.position.clone();eg.g.position.copy(p);const dir=p.clone().sub(prev);if(dir.lengthSq()>1e-6)eg.g.lookAt(p.clone().add(dir));eg.flap(dt,k>.82?.9:.05,k>.82?14:3,k>.82?0:.95);eg.legs.rotation.x=k>.8?-1.1:0;camera.lookAt(p);}},
    {d:1.5,from:{p:KL(2.2,sy+.9,-KD/2-2.6),l:head0},to:{p:KL(2.4,sy+1.3,-KD/2-3),l:head0.clone().add(KV(0,.6,0))},flash:'#ffffff',shake:.55,sfx:()=>{screech();nz(.25,600,1,.3,'lowpass');},
      upd:(k,dt)=>{eg.g.position.copy(dive1).add(KV(0,Math.sin(clock*9)*.1+k*.5,0));eg.g.rotation.set(-.5,0,0);eg.g.rotation.y=Math.atan2(out.x,out.z)+Math.PI;eg.flap(dt,1,16,0);eg.legs.rotation.x=-1.1;
        const lp=new V3();eg.legs.getWorldPosition(lp);carried=lp.add(KV(0,-.3,0));open=.8;pose(dt);wkPose('cry',1.6);}},
    {d:4.8,from:{p:KL(.5,1.3,-KD/2-6.5),l:dive1},to:{p:KL(.2,1.2,-KD/2-6),l:away.clone().lerp(dive1,.75)},
      bubbles:[{nar:true,t:L2("Kartal yılanı kapıp uzaklara götürdü! Kureyş sevindi: \"Allah niyetimizden razı\" dediler.","The eagle seized the snake and carried it far away! Quraysh rejoiced: \"God is pleased with what we intend,\" they said.")}],
      upd:(k,dt)=>{const e=k*k*(3-2*k);const p=dive1.clone().lerp(away,e*.55);eg.g.position.copy(p);eg.g.lookAt(away);eg.flap(dt,.9,10,0);eg.legs.rotation.x=-1.1;const lp=new V3();eg.legs.getWorldPosition(lp);carried=lp.add(KV(0,-.3,0));open=.3;pose(dt);wkPose('cheer',1.6*(1-k));}}
  ],()=>{clearTmp();discover('o_yilan',true);if(done)done();});}
/* ---------- Chapter 2: the first blow and the green foundation ---------- */
function clipFirstStrike(done){setTime('asr');RAIN.target=0;flood.visible=false;kaaba({old:true,rubble:false});
  const wl=crowdAt([[kW(1,-KD/2-1.6).x,kW(1,-KD/2-1.6).z,{robe:0x6b4a7a,beard:0xd8d0c4,hat:'turban'}]],KL(1,0,-KD/2))[0];const tool=pickaxe(wl);
  const cr=crowdAt([0,1,2,3,4,5,6].map(i=>{const p=kW(-4+i*1.4,-KD/2-6.5-(i%2));return [p.x,p.z,{robe:[0x7a5a3a,0x8a3a2c,0x2f5d8a,0x4d6b3a,0xc58b3a,0x6b4a7a,0x7a5a3a][i]}];}),KL(1,0,-KD/2));
  anime([{d:3.6,from:{p:KL(-6,3,-KD/2-13),l:KL(1,2,-KD/2)},to:{p:KL(-4,2.6,-KD/2-11),l:KL(1,1.8,-KD/2)},bubbles:[{nar:true,t:L2('Herkes hazırdı ama kimse ilk kazmayı vurmaya cesaret edemiyordu. Ya Kâbe\'ye dokunan çarpılırsa?','Everyone was ready, but no one dared strike the first blow. What if whoever touched the Kaaba was struck down?')}],upd:()=>cr.forEach(p=>animPerson(p,.016,0,'idle'))},
    {d:3.4,from:{p:KL(3.2,1.6,-KD/2-3.6),l:KL(1,1.6,-KD/2-1.2)},to:{p:KL(2.8,1.5,-KD/2-3.2),l:KL(1,1.8,-KD/2-1)},bubbles:[{who:L2('Velîd b. Muğîre','Al-Walid ibn al-Mughira'),t:L2('Allah\'ım, korkma! Biz yalnızca iyilik istiyoruz.','O God, fear not! We intend only good.'),at:'tl'}],upd:k=>{wl.armR.rotation.x=-2.6*Math.min(1,k*1.5);}},
    {d:2.6,from:{p:KL(3,1.5,-KD/2-3.2),l:KL(1,1.6,-KD/2)},to:{p:KL(3.2,1.7,-KD/2-3.6),l:KL(1,1.6,-KD/2)},impact:L2('GÜM!','THUD!'),shake:.6,flash:'#fff6d8',sfx:()=>{nz(.8,90,.6,.45,'lowpass');nz(.2,1800,2,.12,'bandpass');},start:()=>puff(kW(1,-KD/2).x,1.6,kW(1,-KD/2).z,14),upd:k=>{wl.armR.rotation.x=-2.6+Math.min(1,k*4)*2.2;}},
    {d:3.6,from:{p:KL(8,5,-KD/2-12),l:KL(0,1.5,0)},to:{p:KL(6,4,-KD/2-10),l:KL(0,1.5,0)},start:()=>setTime('noon'),bubbles:[{nar:true,t:L2('Halk bir gece bekledi. Velîd\'e bir şey olmayınca ertesi sabah herkes yıkıma katıldı. Sıra sende!','The people waited one night. When nothing happened to al-Walid, the next morning everyone joined the demolition. Your turn!')}],upd:()=>cr.forEach(p=>animPerson(p,.016,0,'cheer'))}
  ],()=>{clearTmp();if(done)done();});}
function clipGreen(done){kaaba({old:false,rubble:true,green:true,wallH:0});
  anime([{d:3.6,from:{p:KV(14,10,-14),l:KV(0,0,0)},to:{p:KV(7,3,-7),l:KV(0,.3,0)},speed:.5,bubbles:[{nar:true,t:L2('Duvarları temele kadar indirdiler. Orada ne buldular dersin?','They took the walls down to the foundation. Guess what they found there?')}]},
    {d:4,from:{p:KV(7,2.2,-7),l:KV(0,.2,-3)},to:{p:KV(5,1.4,-5),l:KV(1,.2,-3)},tint:'rgba(80,200,140,.12)',flash:'#d8ffe8',bubbles:[{nar:true,t:L2("Deve hörgücü gibi birbirine kenetlenmiş yeşil taşlar: Hz. İbrâhim'in attığı temel!","Green stones locked together like camel humps: the foundation laid by Prophet Ibrahim!")}]},
    {d:3.6,from:{p:KV(5,1.4,-5),l:KV(1,.2,-3)},to:{p:KV(9,5,-9),l:KV(0,.5,0)},impact:'!!',shake:.8,sfx:()=>nz(1.2,70,.5,.5,'lowpass'),bubbles:[{nar:true,t:L2('Biri bir taşı yerinden oynatmak isteyince bütün Mekke sarsıldı. Temele dokunmadılar; yeni Kâbe bu temelin üstüne kurulacaktı.','When a man tried to pry one loose, all of Mecca shook. They left the foundation alone; the new Kaaba would rise on it.')}]}],
  ()=>{discover('o_temel',true);if(done)done();});}
/* ---------- Chapter 3: who builds which wall ---------- */
function clipClans(done){setTime('asr');kaaba({old:false,rubble:false,green:true,scaffold:true,wallH:0});
  const sides=[[0,-KD/2-3,0x8a3a2c],[KW/2+3,0,0x2f5d8a],[0,KD/2+3,0x4d6b3a],[-KW/2-3,0,0x6b4a7a]];
  const cr=crowdAt(sides.flatMap(([x,z,c])=>[0,1].map(j=>{const p=kW(x+(z?j*1.2-.6:0),z+(x?j*1.2-.6:0));return [p.x,p.z,{robe:c}];})),KV(0,0,0));
  anime([{d:4,from:{p:KV(0,26,-22),l:KV(0,0,0)},to:{p:KV(10,20,-16),l:KV(0,0,0)},bubbles:[{nar:true,t:L2('Kureyş işi paylaştırdı: Kâbe\'nin dört duvarının her birini başka kabileler yapacaktı. Kimse dışarıda kalmasın diye.','Quraysh divided the work: each of the Kaaba\'s four walls went to different clans, so no one was left out.')}],upd:()=>cr.forEach(p=>animPerson(p,.016,0,'cheer'))},
    {d:4,from:{p:KV(24,5,-18),l:KV(18,1.2,-13)},to:{p:KV(22,3.4,-17),l:KV(18,1.2,-13.5)},bubbles:[{who:L2('Ustabaşı','Master builder'),t:L2('Ham taşı taşçıya getir; o düzgün keser. Kesme taşı da duvara taşı. Taşıdıkça Kâbe yükselir!','Bring raw stone to the stonecutter; he shapes it. Then carry the cut stone to the wall. Every load raises the Kaaba!'),at:'tl'}]}],
  ()=>{clearTmp();if(done)done();});}
/* ---------- Chapter 4: the blood oath (night), then the arbiter at dawn ---------- */
let F4=[],FIRE_POOL=null;
function makeClanFires(){
  if(!FIRE_POOL){FIRE_POOL=[];const spots=[[-KW/2-8,-3,0x8a3a2c,L2('Abdüddâr','Abd al-Dar')],[KW/2+8,2,0x2f5d8a,L2('Mahzûm','Makhzum')],[2,KD/2+8,0x4d6b3a,L2('Abdümenâf','Abd Manaf')],[-3,-KD/2-9,0x6b4a7a,L2('Adî','Adi')]];
    for(const [lx,lz,c,n] of spots){const p=kW(lx,lz);const s=freeSpot(p.x,p.z,1.4);const f=addFire(s.x,s.z);
      const men=[0,1,2].map(i=>{const a=i*2.1+.5;const m=makePerson({robe:c,beard:0x2a221c,hat:'turban'});m.g.position.set(s.x+Math.cos(a)*1.5,height(s.x,s.z),s.z+Math.sin(a)*1.5);m.g.rotation.y=Math.atan2(s.x-m.g.position.x,s.z-m.g.position.z);scene.add(m.g);return m;});
      FIRE_POOL.push({f,men,x:s.x,z:s.z,name:n,anger:20});}}
  F4=FIRE_POOL;F4.forEach(f=>{f.f.g.visible=true;f.men.forEach(m=>m.g.visible=true);f.anger=20;});return F4;}
function hideClanFires(){if(FIRE_POOL)FIRE_POOL.forEach(f=>{f.f.g.visible=false;f.men.forEach(m=>m.g.visible=false);});F4=[];}
function clipOath(done){setTime('night');RAIN.target=0;kaaba({old:false,rubble:false,green:false,scaffold:true,wallH:1.6,stone:false});makeClanFires();const f0=F4[0];
  const bowl=keep(new THREE.Mesh(new THREE.CylinderGeometry(.35,.2,.25,14),mat.clay));bowl.position.set(f0.x+.8,height(f0.x,f0.z)+.12,f0.z);
  const blood=new THREE.Mesh(new THREE.CircleGeometry(.3,16),new THREE.MeshBasicMaterial({color:0x6a0a10}));blood.rotation.x=-Math.PI/2;blood.position.y=.13;bowl.add(blood);
  anime([{d:3.8,from:{p:KL(12,3.4,-13),l:KL(6,1.4,-5.4)},to:{p:KL(10,2.6,-11),l:KL(6,1.5,-5.4)},vig:.4,bubbles:[{nar:true,t:L2("Duvarlar Hacerü'l-Esved'in konacağı yere kadar yükseldi. Peki bu kutsal taşı yerine kim koyacaktı?","The walls rose to where the Black Stone belonged. But who would set this sacred stone in place?")}]},
    {d:3.8,from:{p:KV(f0.x+5,3,f0.z+5),l:KV(f0.x,1,f0.z)},to:{p:KV(f0.x+2.6,1.6,f0.z+2.6),l:KV(f0.x+.8,.4,f0.z)},speed:.7,impact:L2('KANLI YEMİN','BLOOD OATH'),tint:'rgba(120,10,10,.16)',vig:.5,sfx:()=>nz(1,120,1,.3,'lowpass'),
      bubbles:[{who:L2('Abdüddâr oğullarından biri','A man of Abd al-Dar'),t:L2('Bu şeref bizim! Ellerimizi bu kana batırdık: ölürüz de vermeyiz!','This honour is ours! We dipped our hands in this blood: we will die before we give it up!'),at:'tl'}],upd:()=>F4.forEach(f=>f.men.forEach(m=>animPerson(m,.016,0,'angry')))},
    {d:3.6,from:{p:KV(0,16,-26),l:KV(0,1,0)},to:{p:KV(0,12,-20),l:KV(0,1,0)},vig:.4,bubbles:[{nar:true,t:L2('Her kabile kendi ateşinin başında öfkeyle bekliyordu. Kâbe\'nin yanında kan dökülmek üzereydi.','Each clan waited angrily by its own fire. Blood was about to be shed beside the Kaaba.')}],upd:()=>F4.forEach(f=>f.men.forEach(m=>animPerson(m,.016,0,'angry')))},
    {d:3.6,from:{p:KV(ZEM.x+5,2.4,ZEM.z+5),l:KV(ZEM.x,1.2,ZEM.z)},to:{p:KV(ZEM.x+4,2,ZEM.z+4),l:KV(ZEM.x,1.3,ZEM.z)},bubbles:[{who:L2('Yaşlı bir Mekkeli','An old Meccan'),t:L2('Evlat, şafağa kadar kavga çıkmasın! Zemzem\'den su götür, ateşlerin başındakileri yatıştır.','Child, there must be no fight before dawn! Take Zamzam water to the fires and calm the men.'),at:'tl'}]}
  ],()=>{clearTmp();if(done)done();});}
function clipArbiter(done){setTime('dawn');
  anime([{d:3.8,from:{p:KV(18,6,-16),l:KV(0,2,0)},to:{p:KV(14,4,-12),l:KV(0,2,0)},bubbles:[{who:L2('Ebû Ümeyye b. Muğîre','Abu Umayya ibn al-Mughira'),t:L2('Ey Kureyş! Şu kapıdan ilk kim girerse, aranızda o hakem olsun!','O Quraysh! Let whoever enters first through that gate be the judge between you!'),at:'tl'}],upd:()=>F4.forEach(f=>f.men.forEach(m=>animPerson(m,.016,0,'idle')))},
    {d:4.2,from:{p:KV(-14,4,18),l:KV(0,1.5,0)},to:{p:KV(-10,3,13),l:KV(0,1.5,0)},flash:'#fff6d8',bubbles:[{nar:true,t:L2('Kapıdan ilk giren, herkesin "el-Emîn", yani "güvenilir" dediği gençti. Hepsi sevindi: "Ona razıyız!"','The first to enter was the young man everyone called "al-Amin", the trustworthy. They all rejoiced: "We accept him!"')}],upd:()=>F4.forEach(f=>f.men.forEach(m=>animPerson(m,.016,0,'cheer')))}
  ],()=>{hideClanFires();stoneLite(done);});}
function stoneLite(done){const out=KV(BSW.x,0,BSW.z).normalize(),cp=KV(BSW.x+out.x*2.6,0,BSW.z+out.z*2.6);cp.y=height(cp.x,cp.z);
  const cg=keep(new THREE.Group());cg.position.copy(cp);const cloth=new THREE.Mesh(new THREE.PlaneGeometry(2.2,2.2),new THREE.MeshLambertMaterial({map:fabricTex,side:THREE.DoubleSide}));cloth.rotation.x=-Math.PI/2;cloth.position.y=.05;cg.add(cloth);
  const stone=new THREE.Mesh(new THREE.SphereGeometry(.22,14,10),new THREE.MeshPhongMaterial({color:0x151312,shininess:70}));stone.scale.set(.95,1.15,.7);stone.position.y=.22;cg.add(stone);
  const el=[];for(let i=0;i<4;i++){const a=i/4*6.283+.785,x=cp.x+Math.cos(a)*1.9,z=cp.z+Math.sin(a)*1.9;const p=makePerson({robe:[0x8a3a2c,0x2f5d8a,0x4d6b3a,0x6b4a7a][i],beard:0xd8d0c4,hat:'turban'});p.g.position.set(x,height(x,z),z);p.g.rotation.y=Math.atan2(cp.x-x,cp.z-z);keep(p.g);el.push(p);}
  const slot=KV();KP.stone.visible=false;KP.stone.getWorldPosition(slot);const perp=KV(-out.z,0,out.x);const cam1=KV(cp.x+out.x*5+perp.x*1.6,cp.y+1.9,cp.z+out.z*5+perp.z*1.6);
  anime([{d:3.8,from:{p:cam1,l:KV(cp.x,cp.y+.6,cp.z)},to:{p:cam1,l:KV(cp.x,cp.y+1.4,cp.z)},bubbles:[{nar:true,t:L2('Bir örtü serdi, taşı ortasına koydu. "Her kabileden biri bir ucundan tutsun" dedi. Hep birlikte kaldırdılar.','He spread a cloak and set the stone in its middle. "Let one man from each clan hold a corner," he said. Together they lifted it.')}],
      upd:k=>{const e=k*k*(3-2*k);cg.position.y=cp.y+e*1.25;el.forEach(p=>{p.armL.rotation.x=p.armR.rotation.x=-.8-e*.9;});}},
    {d:3.4,from:{p:cam1,l:KV(cp.x,cp.y+1.4,cp.z)},to:{p:cam1,l:KV(BSW.x,1.5,BSW.z)},speed:.8,flash:'#fff6d8',bubbles:[{nar:true,t:L2('Taşı kendi eliyle yerine koydu. Herkes payını aldı; tek damla kan dökülmedi.','He set the stone in place with his own hands. Every clan had its share, and not a drop of blood was shed.')}],
      upd:k=>{const e=k*k*(3-2*k);const p=KV().lerpVectors(KV(cp.x,cp.y+1.47,cp.z),slot,e);cg.worldToLocal(p);stone.position.copy(p);if(k>.95&&!KP.stone.visible){KP.stone.visible=true;stone.visible=false;sparkle(slot.x,slot.y,slot.z,40);sfx.build();}}}
  ],()=>{clearTmp();kaaba({stone:true});discover('o_hakem',true);if(done)done();});}
/* ---------- Chapter 5: the ship ---------- */
function clipShip(done){const base=KV(0,0,-520);const g=keep(new THREE.Group());g.position.copy(base);
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(300,300),new THREE.MeshPhongMaterial({color:0x2f6f8a,shininess:90,specular:0x99bbcc}));sea.rotation.x=-Math.PI/2;sea.position.y=.2;g.add(sea);
  const hull=new THREE.Group();const hm=mat.wood;const h1=new THREE.Mesh(new THREE.BoxGeometry(4,2,14),hm);h1.position.y=1;hull.add(h1);const bow=new THREE.Mesh(new THREE.ConeGeometry(2.1,4,4),hm);bow.rotation.x=Math.PI/2;bow.rotation.y=Math.PI/4;bow.position.set(0,1,9);hull.add(bow);
  const mast=new THREE.Mesh(new THREE.CylinderGeometry(.15,.18,10,8),hm);mast.position.set(0,6,0);mast.rotation.z=.35;hull.add(mast);const sail=new THREE.Mesh(new THREE.PlaneGeometry(5,4),new THREE.MeshLambertMaterial({color:0xe8dcc4,side:THREE.DoubleSide}));sail.position.set(1.4,7,0);sail.rotation.z=.5;hull.add(sail);
  hull.rotation.z=.25;g.add(hull);
  const sand=new THREE.Mesh(new THREE.PlaneGeometry(60,30),new THREE.MeshLambertMaterial({color:0xe8d6b0}));sand.rotation.x=-Math.PI/2;sand.position.set(0,.25,-18);g.add(sand);
  const W=v=>KV(base.x+v.x,v.y,base.z+v.z);
  anime([{d:3.8,from:{p:W(KV(30,14,30)),l:W(KV(0,2,0))},to:{p:W(KV(16,6,16)),l:W(KV(0,2,0))},title:[L2('Şuaybe sahili','The shore of Shu\'ayba'),L2('Gemi','The ship')],flash:'#e0ecff',sfx:()=>sfx.thunder(),tint:'rgba(30,50,80,.18)'},
    {d:4,from:{p:W(KV(10,3,-12)),l:W(KV(0,2,2))},to:{p:W(KV(6,2.4,-8)),l:W(KV(0,2,4))},bubbles:[{nar:true,t:L2('Cidde yakınlarında Bizanslı bir tüccarın gemisi fırtınada karaya oturdu. Kureyş geminin tahtalarını satın aldı. Gemideki usta marangoz Bâkûm da işe geldi.','Near Jeddah a Byzantine merchant\'s ship ran aground in a storm. Quraysh bought its timber, and Baqum, the master carpenter on board, came to help.')}]},
    {d:3.6,from:{p:KV(-24,6,18),l:KV(-16,1.2,9)},to:{p:KV(-21,4,15),l:KV(-16,1.2,9)},bubbles:[{who:L2('Bâkûm','Baqum'),t:L2('Duvar bir sıra taş, bir sıra ahşap örülecek. Tahtaları bana getir, kiriş yapayım!','The wall goes up one course of stone, one course of timber. Bring me planks and I\'ll make beams!'),at:'tl'}]}],
  ()=>{clearTmp();discover('o_gemi',true);if(done)done();});}
function clipRain(done){setTime('rain');RAIN.target=.75;
  anime([{d:4,from:{p:KV(20,12,-22),l:KV(0,3,0)},to:{p:KV(16,9,-18),l:KV(0,3.5,0)},bubbles:[{nar:true,t:L2('Duvarlar yükseldikçe iş ağırlaştı. Bir de yağmur başladı! Çamurlu yerlerde yavaşlarsın.','As the walls grew taller the work got harder. Then the rain came! Mud slows you down.')}]},
    {d:3.6,from:{p:KV(26,4,-6),l:KV(20,1,-12)},to:{p:KV(24,3,-8),l:KV(20,1,-12)},bubbles:[{who:L2('Ustabaşı','Master builder'),t:L2('Hamal tut, ustalara su götür. Kalabalık iş birlikte biter!','Hire porters, bring the craftsmen water. Big work is done together!'),at:'tl'}]}],done);}
function clipRoof(done){setTime('asr');RAIN.target=0;
  anime([{d:4.2,from:{p:KV(-18,14,-18),l:KV(0,5,0)},to:{p:KV(-14,11,-14),l:KV(0,6,0)},bubbles:[{nar:true,t:L2('Kureyş Kâbe\'yi eskisinin iki katı yükseltti. İçeriye altı direk dikip üstünü bir damla kapatacaklardı.','Quraysh raised the Kaaba to twice its old height. Inside they would stand six pillars and close it with a roof.')}]},
    {d:3.8,from:{p:KV(10,5,-14),l:KV(0,4,0)},to:{p:KV(8,4,-12),l:KV(0,4.5,0)},bubbles:[{who:L2('Ustabaşı','Master builder'),t:L2('Çatı kirişleri ağır: bir seferde yarısı kadar taşıyabilirsin. Kapı da yerden yüksek olacak!','Roof beams are heavy: you can carry only half as many. And the door will sit high above the ground!'),at:'tl'}]}],done);}
function clipFinale(done){setTime('eve');kaaba({scaffold:false,hijr:true,door:true,roof:true,rubble:false,green:false,stone:true,wallH:8.7});discover('k_kapi',true);discover('k_hicr',true);
  const crowd=crowdAt(Array.from({length:18},(_,i)=>{const a=i/18*6.283,r=15+(i%3);return [Math.cos(a)*r,Math.sin(a)*r,{}];}),KV(0,0,0));
  anime([{d:4.4,from:{p:KV(0,50,60),l:KV(0,4,0)},to:{p:KV(20,10,-22),l:KV(0,4,0)},speed:.4,impact:L2('KÂBE YÜKSELDİ!','THE KAABA HAS RISEN!'),upd:()=>crowd.forEach(p=>animPerson(p,.016,0,'cheer'))},
    {d:4.4,from:{p:KV(-16,4,-12),l:KV(-8,1,2)},to:{p:KV(-18,5,-8),l:KV(-8,1,2)},bubbles:[{nar:true,t:L2('Helal para yetmedi; bu yüzden kuzeydeki yarım yuvarlak kısım, Hicr, dışarıda bırakıldı. Bugün de öyledir.','The honest money ran short, so the half-circle on the north side, the Hijr, was left outside. It is still that way today.')}],upd:()=>crowd.forEach(p=>animPerson(p,.016,0,'cheer'))},
    {d:4.4,from:{p:KV(20,10,-22),l:KV(0,4,0)},to:{p:KV(14,6,-16),l:KV(0,5,0)},bubbles:[{nar:true,t:L2('Selden, korkudan ve kanlı yeminlerden geçip birlikte yükselen bir bina. Bundan beş yıl sonra, bu şehirde vahiy inmeye başlayacaktı.','A house that rose together, through flood, fear and blood oaths. Five years later, revelation would begin in this very city.')}],upd:()=>crowd.forEach(p=>animPerson(p,.016,0,'cheer'))}],
  ()=>{clearTmp();if(done)done();});}
