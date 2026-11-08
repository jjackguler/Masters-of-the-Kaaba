/* ===================== Bölüm 2 · Fil Yılı (yaklaşık 570) ===================== */
const L2=(t,e)=>LANG==='en'?e:t;
{ // switch between the two parts from the title screen
  const b=document.createElement('button');b.className='go alt';b.id='m-part';
  b.textContent=MODE==='p2'?L2("Bölüm 1: Kâbe'nin İnşası","Part 1: Building the Kaaba"):L2('Bölüm 2: Fil Yılı','Part 2: Year of the Elephant');
  $('#m-start').after(b);b.addEventListener('click',()=>{try{localStorage.setItem('bekke-mode',MODE==='p2'?'p1':'p2');}catch(_){}location.reload();});
}
const P2KEY='bekke-fil-v1';
const REF=freeSpot(83,48,.8);
let SW={t:0,dur:0,kind:'',hit:false,combo:0,last:-9,hold:0,holding:false,from:0,to:0},BOW={draw:0,holding:false},BLOCK=false;
const ENEMIES=[],ARW=[],DUMMIES=[];
let p2N={};

/* ---------- weapons on the hero ---------- */
const swordG=new THREE.Group();swordG.position.set(0,-.46,0);hero.armR.add(swordG);
const bladeM=new THREE.MeshPhongMaterial({color:0xd8dde4,shininess:90,specular:0xffffff,emissive:0x000000});
{const bl=new THREE.Mesh(new THREE.BoxGeometry(.05,.85,.018),bladeM);bl.position.y=-.5;swordG.add(bl);
 const tip=new THREE.Mesh(new THREE.ConeGeometry(.035,.12,4),bladeM);tip.position.y=-.98;tip.rotation.x=Math.PI;swordG.add(tip);
 const gd=new THREE.Mesh(new THREE.BoxGeometry(.22,.04,.05),Lm(0xb88a3a));gd.position.y=-.06;swordG.add(gd);
 const gr=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.16,6),Lm(0x3a2a1c));gr.position.y=.05;swordG.add(gr);
 swordG.traverse(m=>{if(m.isMesh)m.castShadow=true;});}
swordG.visible=false;
const bowG=new THREE.Group();bowG.position.set(0,-.44,0);hero.armL.add(bowG);
{const arc=new THREE.Mesh(new THREE.TorusGeometry(.5,.022,6,18,Math.PI*1.1),Lm(0x6a4424));arc.rotation.y=Math.PI/2;arc.rotation.x=-Math.PI*.55;bowG.add(arc);}
bowG.visible=false;
const shieldM=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.05,16),Lm(0x8a5a2a));shieldM.rotation.z=Math.PI/2;shieldM.position.set(-.08,-.25,.1);hero.armL.add(shieldM);shieldM.visible=false;
// sword trail ribbon
const TRN=16,trPos=new Float32Array(TRN*2*3),trAge=new Float32Array(TRN);
const trGeo=new THREE.BufferGeometry();trGeo.setAttribute('position',new THREE.BufferAttribute(trPos,3));
{const idx=[];for(let i=0;i<TRN-1;i++){const a=i*2,b=a+1,c=a+2,d=a+3;idx.push(a,b,c,b,d,c);}trGeo.setIndex(idx);}
const trMat=new THREE.MeshBasicMaterial({color:0xffd27a,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending});
const trail=new THREE.Mesh(trGeo,trMat);trail.frustumCulled=false;scene.add(trail);let trN=0;
const tipV=new V3(),midV=new V3();
function trailPush(){swordG.updateMatrixWorld(true);tipV.set(0,-1.0,0).applyMatrix4(swordG.matrixWorld);midV.set(0,-.35,0).applyMatrix4(swordG.matrixWorld);
  for(let i=TRN-1;i>0;i--){trPos.copyWithin(i*6,(i-1)*6,(i-1)*6+6);}trPos.set([tipV.x,tipV.y,tipV.z,midV.x,midV.y,midV.z],0);trN=Math.min(TRN,trN+1);
  for(let i=trN;i<TRN;i++)trPos.copyWithin(i*6,(trN-1)*6,(trN-1)*6+6);trGeo.attributes.position.needsUpdate=true;}

/* ---------- soldiers of the vanguard (no one dies: they are knocked down, surrender or flee) ---------- */
const helmM=Lm(0xb08a4a);
function makeSoldier(type){
  const p=makePerson({robe:type==='cook'?0xe8dcc4:[0x6b2a22,0x3a2a24,0x7a3a1a][(Math.random()*3)|0],cloth:0x2a2420,beard:0x2a221c,sashC:0xb08a4a,hat:type==='cook'?'turban':'hair',cloak:null});
  if(type!=='cook'){const h=new THREE.Mesh(new THREE.SphereGeometry(.235,14,8,0,Math.PI*2,0,Math.PI*.5),helmM);h.position.y=.05;p.head.add(h);
    const cr=new THREE.Mesh(new THREE.BoxGeometry(.04,.12,.3),Lm(0x8a2a22));cr.position.y=.27;p.head.add(cr);}
  if(type==='spear'){const sp=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,2.0,6),mat.darkWood);sp.position.set(0,-.3,.0);sp.rotation.x=Math.PI/2;p.armR.add(sp);
    const hd=new THREE.Mesh(new THREE.ConeGeometry(.05,.22,5),bladeM);hd.position.set(0,-.3,1.08);hd.rotation.x=Math.PI/2;p.armR.add(hd);
    const sh=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.05,14),Lm(0x5a3a22));sh.rotation.z=Math.PI/2;sh.position.set(-.08,-.25,.1);p.armL.add(sh);}
  if(type==='archer'){const arc=new THREE.Mesh(new THREE.TorusGeometry(.45,.02,6,16,Math.PI*1.1),Lm(0x4a3020));arc.rotation.y=Math.PI/2;arc.rotation.x=-Math.PI*.55;arc.position.y=-.44;p.armL.add(arc);}
  p.g.traverse(m=>{if(m.isMesh)m.castShadow=true;});p.robeMat=p.body.children[0].material;return p;}
function enemy(type,x,z,grp){const s=freeSpot(x,z,.5);const p=makeSoldier(type);
  const e={...p,type,grp,x:s.x,z:s.z,y:height(s.x,s.z),face:Math.random()*6,home:{x:s.x,z:s.z},hp:type==='archer'?3:4,max:type==='archer'?3:4,st:type==='cook'?'cook':'idle',t:0,cd:1+Math.random(),asked:false,kb:{x:0,z:0},tgt:null,wait:Math.random()*3,active:false};
  e.g.position.set(e.x,e.y,e.z);e.g.visible=false;scene.add(e.g);ENEMIES.push(e);return e;}
function alive(e){return e.g.visible&&!['surrender','down','flee','gone','cook'].includes(e.st);}

/* ---------- part-2 world ---------- */
function freeOpen(cx,cz,r){let best=null,bd=-1;for(let x=cx-40;x<=cx+40;x+=4)for(let z=cz-40;z<=cz+40;z+=4){if(blockedAt(x,z,1))continue;let m=1e9;for(const h of houses){const d=Math.hypot(h.x-x,h.z-z)-Math.max(h.w,h.d)/2;if(d<m)m=d;}if(m>bd){bd=m;best={x,z};}}return best||{x:cx,z:cz};}
let CAMP2=null,CORRAL=null,CAMELS2=[],TOOLS=null,RACK=null;
function p2Build(){
  // hide everything of part 1
  for(const n of NPCS){n.g.visible=false;n.label=null;}for(const a of ANIMALS)a.g.visible=false;
  PROPS.depotG.visible=false;PROPS.quarryG.visible=false;PROPS.qStones.forEach(s=>s.visible=false);BRUSH.forEach(b=>b.m.visible=false);MUD.forEach(m=>m.m.visible=false);SACKS.forEach(s=>s.m.visible=false);
  child.mode='idle';FIRES.forEach(f=>f.g.visible=false);RAIN.target=0;RAIN.amt=0;flood.visible=false;puddles.visible=false;kaaba({old:true,wallH:0});
  hero.setRobe&&hero.setRobe(0x7a4a2a);
  // the refuge on the slope of Ebû Kubeys
  for(const [dx,dz] of [[-4,3],[4,4]]){const g=new THREE.Mesh(new THREE.BoxGeometry(3.4,1.8,2.6),mat.tent);const x=REF.x+dx,z=REF.z+dz;g.position.set(x,height(x,z)+.9,z);g.castShadow=g.receiveShadow=true;scene.add(g);}
  const rf=addFire(REF.x,REF.z+1);rf.g.visible=true;
  RACK=freeSpot(REF.x-2.5,REF.z-2.5,.4);{const g=new THREE.Group();for(let i=0;i<5;i++){const a=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.9,4),mat.darkWood);a.position.set(-.3+i*.15,.6,0);a.rotation.z=.15;g.add(a);}
    const st=new THREE.Mesh(new THREE.BoxGeometry(1,.1,.3),mat.wood);st.position.y=.2;g.add(st);g.position.set(RACK.x,height(RACK.x,RACK.z),RACK.z);scene.add(g);}
  p2N.smith=npc({id:'smith',label:L2('Demirci','Blacksmith'),x:-22,z:26,look:{robe:0x3a3a44,cloth:0xd8c7a8,beard:0x2a221c,band:0x8a3a2c},mark:()=>p2mark('smith')});
  TOOLS=(()=>{const s=freeSpot(p2N.smith.x+1.6,p2N.smith.z+.6,.4);const m=itemMesh('sack');m.position.set(s.x,height(s.x,s.z)+.25,s.z);scene.add(m);return {m,x:s.x,z:s.z};})();
  p2N.elder=npc({id:'p2elder',label:L2('Yaşlı adam','Old man'),x:-34,z:-44,look:{robe:0xe8dcc4,cloth:0xf2e8d5,beard:0xeeeeee},mark:()=>p2mark('p2elder')});
  p2N.bowyer=npc({id:'bowyer',label:L2('Okçu','Bowyer'),x:REF.x+2,z:REF.z-3,look:{robe:0x4d6b3a,cloth:0xe9dcc0,beard:0x5a4636,band:0xd39a2c},mark:()=>p2mark('bowyer')});
  p2N.healer=npc({id:'healer',label:L2('Şifacı kadın','Healer'),x:REF.x-3,z:REF.z+1,look:{female:true,robe:0x6b4a7a,cloth:0xf2e8d5},mark:()=>p2mark('healer')});
  for(let i=0;i<5;i++)npc({id:'ref'+i,x:REF.x+(Math.random()-.5)*8,z:REF.z+(Math.random()-.5)*8,look:{female:i%2===0,scale:i===3?.65:1},wander:4});
  p2N.blind=npc({id:'blind',label:L2('Gözleri görmeyen ihtiyar','Blind elder'),x:12,z:-150,look:{robe:0x7c7f86,cloth:0xe9dcc0,beard:0xdddddd},mark:()=>p2mark('blind')});
  p2N.mother=npc({id:'mother',label:L2('Çocuklu anne','Mother and child'),x:-58,z:62,look:{female:true,robe:0x2f5d8a,cloth:0x3a3a44},mark:()=>p2mark('mother')});
  p2N.kid=npc({id:'mkid',x:-57,z:63,look:{scale:.6,robe:0xc58b3a}});
  p2N.boy=npc({id:'boy',label:L2('Çoban çocuk','Shepherd boy'),x:24,z:122,look:{scale:.72,robe:0x4d6b3a,cloth:0xf2e8d5},mark:()=>p2mark('boy')});
  for(const id of ['p2elder','blind','mother','boy'])NPCS.find(n=>n.id===id).p2esc=true;
  // training dummies
  for(let i=0;i<3;i++){const s=freeSpot(REF.x-6+i*2.6,REF.z-7,.5);const g=new THREE.Group();const post=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,1.6,6),mat.darkWood);post.position.y=.8;g.add(post);
    const body=new THREE.Mesh(new THREE.CylinderGeometry(.26,.3,.9,10),Lm(0xd9b86a));body.position.y=1.15;g.add(body);const hd=new THREE.Mesh(new THREE.SphereGeometry(.18,10,8),Lm(0xd9b86a));hd.position.y=1.8;g.add(hd);
    g.position.set(s.x,height(s.x,s.z),s.z);g.traverse(m=>{if(m.isMesh)m.castShadow=true;});scene.add(g);DUMMIES.push({g,x:s.x,z:s.z,wob:0});}
  // the vanguard's camp in the Mesfele: a corral with Mekke's camels
  CAMP2=freeOpen(-10,215);CORRAL={x:CAMP2.x+6,z:CAMP2.z+2};
  {const g=new THREE.Group();g.position.set(CORRAL.x,height(CORRAL.x,CORRAL.z),CORRAL.z);const post=new THREE.CylinderGeometry(.06,.07,1.3,6);
    for(let i=0;i<18;i++){if(i===0||i===1)continue;const a=i/18*6.283,px=Math.cos(a)*5,pz=Math.sin(a)*5;const p=new THREE.Mesh(post,mat.darkWood);p.position.set(px,.65,pz);g.add(p);
      const a2=(i+1)/18*6.283;if(i+1===18)continue;const qx=Math.cos(a2)*5,qz=Math.sin(a2)*5;const r=new THREE.Mesh(new THREE.BoxGeometry(Math.hypot(qx-px,qz-pz),.07,.07),mat.wood);r.position.set((px+qx)/2,1.0,(pz+qz)/2);r.rotation.y=-Math.atan2(qz-pz,qx-px);g.add(r);}
    g.traverse(m=>{if(m.isMesh)m.castShadow=true;});scene.add(g);}
  for(let i=0;i<6;i++){const c=animal('camel',CORRAL.x+(Math.random()-.5)*4,CORRAL.z+(Math.random()-.5)*4);c.graze=false;c.pen={x:CORRAL.x,z:CORRAL.z,r:3};c.g.visible=true;CAMELS2.push(c);}
  {const t=new THREE.Mesh(new THREE.ConeGeometry(2.4,2.6,8),Lm(0x8a3a2c));t.position.set(CAMP2.x-4,height(CAMP2.x-4,CAMP2.z)+1.3,CAMP2.z);t.castShadow=true;scene.add(t);const cf=addFire(CAMP2.x-1,CAMP2.z+3);cf.g.visible=true;}
  for(const [t,dx,dz] of [['spear',0,0],['spear',3,-3],['spear',-3,-4],['spear',2,5],['archer',-6,4],['archer',8,-6],['cook',-2,3.5]])enemy(t,CAMP2.x+dx,CAMP2.z+dz,'camp');
  // scouts that search the city on the last night
  for(const [x,z] of [[0,-120],[0,-130],[-40,40],[-44,48],[18,100],[10,96]])enemy(Math.random()<.3?'archer':'spear',x,z,'scout');
}
function p2mark(id){const m=G.m||0;
  if(id==='p2elder')return m===0&&!G.flags.elderDone?(G.flags.elderGo?'':'q'):'';
  if(id==='smith')return (m===0&&!G.flags.toolsDone&&!G.flags.toolsGo)||(m>=2&&canUpgrade('smith'))?'q':'';
  if(id==='bowyer')return m===1&&!G.bw?'q':(m>=2&&canUpgrade('bowyer'))?'q':'';
  if(id==='healer')return G.hp<10||!G.flags.tulum?'q':'';
  if(['blind','mother','boy'].includes(id))return m===3&&!G.rescued[id]&&!(p2N[id]&&p2N[id].follow)?'q':'';return '';}
const UPG={smith:[['sw',2,2,L2('Kılıç II: daha güçlü, daha çabuk dolar','Sword II: stronger, charges faster')],['sw',3,4,L2('Kılıç III: geniş dönen vuruş, sersemletir','Sword III: wide spin, staggers')],['sh',1,3,L2('Kalkan: önden gelen darbeleri tut (G / Kalkan)','Shield: block blows from the front (G / Shield)')]],
  bowyer:[['bw',2,2,L2('Yay II: çabuk gerilir, dolu ok iki kişiyi geçer','Bow II: draws faster, a full draw passes through two')]]};
function canUpgrade(who){return UPG[who].some(u=>(G[u[0]]||0)===u[1]-1&&G.good>=u[2]);}

/* ---------- missions ---------- */
const MIS=[
  ()=>L2("Halkı dağa çıkar: yaşlı adam ve demircinin aletleri","Get people to the mountain: the old man and the blacksmith's tools")+' ('+((G.flags.elderDone?1:0)+(G.flags.toolsDone?1:0))+'/2)',
  ()=>L2('Sığınakta talim','Train at the refuge')+(G.bw?'':' · '+L2('okçu ile konuş','talk to the bowyer')),
  ()=>{const left=ENEMIES.filter(e=>e.grp==='camp'&&alive(e)).length;return left?L2("Mesfele'deki öncü birlik: muhafızlar ","The vanguard in the Misfala: guards ")+left:L2('Develeri sığınağa götür ','Lead the camels to the refuge ')+camelsHome()+'/6';},
  ()=>L2('Şehirde kalanları dağa çıkar ','Bring those left in the city to the mountain ')+'('+Object.keys(G.rescued).length+'/3)',
  ()=>L2('Fil Yılı','The Year of the Elephant'),
  ()=>L2('Kâbe ayakta. Serbestçe dolaş.','The Kaaba stands. Wander freely.')];
function camelsHome(){return CAMELS2.filter(c=>Math.hypot(c.x-REF.x,c.z-REF.z)<14).length;}
function trainSub(){const t=G.train||{};return L2('Vuruş ','Hits ')+Math.min(3,t.hit||0)+'/3 · '+L2('Dolu vuruş ','Charged ')+Math.min(1,t.spin||0)+'/1 · '+L2('Ok ','Arrow ')+Math.min(1,t.arrow||0)+'/1';}
function setM(m){G.m=m;save();
  if(m===1){toast(L2('Sığınakta talim yap: kuklalara vur.','Train at the refuge: strike the dummies.'),4);}
  if(m===2){setTime('asr');ENEMIES.filter(e=>e.grp==='camp').forEach(e=>{e.g.visible=true;});queueSaying('p_cocuk');
    showCard(L2('Görev','Mission'),{t:L2('Develer','The camels'),b:L2("Ebrehe'nin öncü birliği Tihâme'de sürülere baskın yaptı; Mekke'nin develerini Mesfele'nin aşağısındaki ağıla kapattılar. Develer halkın geçimi. Onları geri getir. Ama unutma: savaşmayana dokunma, teslim olana kılıç kaldırma, hayvana zarar verme.","Abraha's vanguard raided the herds of Tihama and penned Mecca's camels below the Misfala. The camels are the people's livelihood. Bring them back. But remember: don't touch those who don't fight, don't raise a sword against someone who surrenders, don't harm the animals."),c:[SRC.IH]},L2('Yola çık','Set out'));}
  if(m===3){setTime('night');ENEMIES.filter(e=>e.grp==='scout').forEach(e=>{e.g.visible=true;e.st='idle';});
    showCard(L2('Gece','Night'),{t:L2('Şehirde kalanlar','Those left behind'),b:L2("Abdülmuttalib halka dağlara çekilmesini söyledi; Ebrehe'nin ordusu yarın şehre girecek. Ama bazıları hâlâ evlerinde. Gözcüler sokaklarda dolaşıyor. Onları bul ve dağa çıkar.","Abd al-Muttalib told the people to withdraw to the mountains; Abraha's army will enter the city tomorrow. But some are still in their homes, and scouts roam the streets. Find them and bring them up the mountain."),c:[SRC.IH]},L2('Devam','Continue'));}
}
function p2Start(){
  auInit();musicStart();const had=p2Load();started=true;titleEl.hidden=true;hud.style.opacity=1;dpadApply();p2Buttons();
  hintEl.textContent=isTouch||DP.on?'':L2('F kılıç (basılı tut: dolu vuruş) · R ok · G kalkan · E eylem','F sword (hold: charged) · R bow · G shield · E action');hintEl.hidden=false;setTimeout(()=>{hintEl.hidden=true;},16000);
  p2Sync();setTime(['asr','asr','asr','night','dawn','noon'][G.m||0]);
  if(!had){G.m=0;G.hp=10;G.rescued={};G.train={};discover('o_fil',true);
    showCard(L2('Mekke, yaklaşık 570','Mecca, around 570'),{t:L2('Fil Yılı','The Year of the Elephant'),b:L2("Yemen'deki Ebrehe, San'a'da yaptırdığı büyük kiliseye Arapları çekemeyince Kâbe'yi yıkmaya yemin etti. Önünde bir fil, arkasında büyük bir ordu, Mekke'ye yaklaşıyor. Mekkeliler savaşacak güçte değil; dağlara çekiliyorlar. Sen genç bir Mekkelisin. Önce halkın dağa çıkmasına yardım et.","Abraha of Yemen, unable to draw the Arabs to the great church he built in San'a, swore to destroy the Kaaba. With an elephant in front and a great army behind, he is nearing Mecca. The Meccans are not strong enough to fight; they are withdrawing to the mountains. You are a young Meccan. First, help the people up the mountain."),c:[SRC.IH,SRC.M]},L2('Yola çık','Set out'),()=>toast(L2('Başında ! olanlarla konuş.','Talk to those with a ! above them.'),4));}
  else toast(L2('Kaldığın yerden devam.','Continuing where you left off.'),2.5);
}
function p2Sync(){const m=G.m||0;
  swordG.visible=(G.sw||0)>0;shieldM.visible=(G.sh||0)>0;
  if(G.flags.toolsDone||G.flags.toolsGo){p2N.smith.x=REF.x+3;p2N.smith.z=REF.z+2.5;TOOLS.m.visible=false;}
  if(G.flags.elderDone){p2N.elder.x=REF.x-1;p2N.elder.z=REF.z+3;}
  ENEMIES.forEach(e=>{e.g.visible=(e.grp==='camp'&&m===2)||(e.grp==='scout'&&m===3);});
  if(G.flags.campDone)ENEMIES.filter(e=>e.grp==='camp').forEach(e=>{e.g.visible=false;e.st='gone';});
  if(G.flags.campDone||m>=3)CAMELS2.forEach((c,i)=>{c.pen={x:REF.x+6,z:REF.z-2,r:3};c.follow=null;c.x=REF.x+6+(i%3);c.z=REF.z-2+(i>>1)*.8;});
  for(const id in (G.rescued||{})){const n=p2N[id];if(n){n.x=REF.x+(Math.random()-.5)*6;n.z=REF.z+(Math.random()-.5)*6;n.follow=null;}}
  if(G.rescued&&G.rescued.mother){p2N.kid.x=p2N.mother.x+1;p2N.kid.z=p2N.mother.z;}
}
function p2Save(){if(!started)return;try{localStorage.setItem(P2KEY,JSON.stringify({G,p:[P.x,P.z]}));}catch(_){}}
function p2Load(){try{const s=JSON.parse(localStorage.getItem(P2KEY)||'null');if(!s||!s.G)return false;Object.assign(G,s.G);G.rescued=G.rescued||{};G.train=G.train||{};
  P.x=REF.x+2;P.z=REF.z+2;P.y=height(P.x,P.z);return true;}catch(_){return false;}}

/* ---------- talking ---------- */
function p2Talk(n){const id=n.id;
  if(id==='p2elder'){if(G.flags.elderDone){dialog(n.label,L2('Burası güvenli. Allah razı olsun evlat.','It is safe here. May Allah reward you, child.'));return;}
    if(G.flags.elderGo){dialog(n.label,L2('Peşindeyim evlat, yavaş git.',"I'm right behind you, child; go slowly."));return;}
    talk([[n.label,L2("Dizlerim tutmuyor evlat. Herkes Ebû Kubeys'e çıktı, ben kaldım.","My knees are weak, child. Everyone has gone up Abu Qubays; I was left behind.")]],()=>dialog(n.label,L2('Beni dağa götürür müsün?','Will you take me up the mountain?'),[{t:L2('Peşimden gelin.','Follow me.'),main:true,fn:()=>{G.flags.elderGo=true;n.follow=P;save();}},{t:L2('Birazdan.','In a moment.')}]));return;}
  if(id==='smith'){
    if((G.m||0)===0&&!G.flags.toolsDone){if(G.flags.toolsGo){dialog(n.label,L2('Aletlerim! Sığınağa götürebildin mi?','My tools! Have you brought them to the refuge?'));return;}
      talk([[n.label,L2('Örsüm, çekicim, ne varsa bu çuvalda. Ağır, ben taşıyamıyorum. Dağdaki sığınağa götürür müsün?','My anvil, my hammers, everything is in this sack. It is heavy; I cannot carry it. Will you take it to the refuge on the mountain?')]],()=>{G.flags.toolsGo=true;n.x=REF.x+3;n.z=REF.z+2.5;save();toast(L2('Demircinin çuvalını al ve sığınağa götür.',"Pick up the blacksmith's sack and take it to the refuge."),4);});return;}
    if(G.m>=2||G.flags.toolsDone){upgradeMenu('smith');return;}return;}
  if(id==='bowyer'){if((G.m||0)===1&&!G.bw){G.bw=1;G.ar=12;bowG.visible=false;save();
      talk([[n.label,L2('Demirci sana kılıç vermiş. Al, bu yay da senin. Okları raftan alırsın.','The blacksmith gave you a sword. Here, take this bow too. You can take arrows from the rack.')],
        [n.label,L2('Talim et: kuklaya üç kez vur, bir kez kılıcı basılı tutup dolu vuruş yap, bir ok at.','Train: hit a dummy three times, hold the sword for one charged strike, and shoot one arrow.')],
        [n.label,L2('Ve şunu unutma: güçlü olan, öfkesine hâkim olandır.','And never forget: the strong one is the one who masters his anger.')]],()=>{pop('r-stone');p2Buttons();});return;}
    if(G.m>=2){upgradeMenu('bowyer');return;}dialog(n.label,L2('Talime devam.','Keep training.'));return;}
  if(id==='healer'){G.hp=10;pop('r-wood');sfx.good();
    if(!G.flags.tulum){G.flags.tulum=true;save();talk([[n.label,L2('Yaralarını sardım. Şu su tulumunu da al; yolda susuz kalan olursa ver.',"I've dressed your wounds. Take this waterskin too; give it to anyone thirsty on the way.")]]);}
    else dialog(n.label,L2('Yaraların sarıldı. Dikkatli ol.','Your wounds are dressed. Be careful.'));return;}
  if(['blind','mother','boy'].includes(id)){if(G.rescued[id]){dialog(n.label,L2('Sağ ol evlat.','Thank you, child.'));return;}
    if(n.follow){dialog(n.label,L2('Peşindeyim.',"I'm behind you."));return;}
    const lines={blind:L2('Ayak seslerinden anladım, sen Mekkelisin. Yolu göremiyorum; elimden tutar mısın?',"I can tell by your steps you're a Meccan. I can't see the road; will you take my hand?"),
      mother:L2('Çocuğum hastaydı, çıkamadık. Gözcülerden korkuyorum.',"My child was ill and we couldn't leave. I'm afraid of the scouts."),
      boy:L2('Kuzularımı bırakamadım… ama artık gitmeliyim, değil mi?',"I couldn't leave my lambs… but I should go now, shouldn't I?")};
    talk([[n.label,lines[id]]],()=>{n.follow=P;n.wander=0;if(id==='mother'){p2N.kid.follow=n;}toast(L2('Peşinden geliyor. Gözcülerden koru.','Following you. Protect them from the scouts.'));});return;}
}
function upgradeMenu(who){const opts=[];for(const u of UPG[who]){const cur=G[u[0]]||0;if(cur!==u[1]-1)continue;
    opts.push({t:u[3]+' — '+u[2]+' '+L2('iyilik','kindness'),fn:()=>{if(G.good<u[2]){dialog(who==='smith'?L2('Demirci','Blacksmith'):L2('Okçu','Bowyer'),L2('Henüz yetecek iyiliğin yok. İyilik yaptıkça gel.',"You don't have enough kindness yet. Come back as you do good."));return;}
      G.good-=u[2];G[u[0]]=u[1];pop('r-good');sfx.build();sparkle(P.x,P.y+1.5,P.z,30);save();p2Sync();p2Buttons();toast(u[3],3.5);}});}
  if(who==='bowyer')opts.push({t:L2('Ok doldur','Refill arrows'),fn:()=>{G.ar=12;pop('r-stone');sfx.pick();}});
  opts.push({t:L2('Şimdilik yok','Nothing for now')});
  dialog(who==='smith'?L2('Demirci','Blacksmith'):L2('Okçu','Bowyer'),who==='smith'?L2('Ne yapalım? Silah, kötülüğü durdurmak içindir; övünmek için değil.','What shall we make? A weapon is for stopping harm, not for boasting.'):L2('Yayın gücü, gerenin sabrındadır.',"A bow's strength is in the archer's patience."),opts);}

/* ---------- player combat ---------- */
let atkHeld=false,atkDownT=0,bowHeld=false,blkHeld=false,mDown=null;
addEventListener('keydown',e=>{if(MODE!=='p2'||state!=='play'||overlay())return;if(e.code==='KeyF'&&!atkHeld){atkHeld=true;atkDownT=clock;}if(e.code==='KeyR')bowHeld=true;if(e.code==='KeyG')blkHeld=true;});
addEventListener('keyup',e=>{if(MODE!=='p2')return;if(e.code==='KeyF'&&atkHeld){atkHeld=false;releaseAttack();}if(e.code==='KeyR'&&bowHeld){bowHeld=false;releaseBow();}if(e.code==='KeyG')blkHeld=false;});
cv.addEventListener('pointerdown',e=>{if(MODE==='p2'&&e.pointerType==='mouse'&&e.button===0&&state==='play')mDown={x:e.clientX,y:e.clientY,t:clock};});
cv.addEventListener('pointerup',e=>{if(MODE==='p2'&&mDown&&e.pointerType==='mouse'){if(Math.hypot(e.clientX-mDown.x,e.clientY-mDown.y)<6){atkDownT=mDown.t;releaseAttack();}mDown=null;}});
function p2Buttons(){let box=$('#cbtns');if(!box){box=document.createElement('div');box.id='cbtns';box.className='tbtns';box.style.bottom='calc(env(safe-area-inset-bottom,0px) + 122px)';
    box.innerHTML='<button class="tbtn" id="c-blk"></button><button class="tbtn" id="c-bow"></button><button class="tbtn act" id="c-atk" style="background:#b5523b"></button>';$('#hud').appendChild(box);
    const hold=(id,on,off)=>{const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();auInit();try{b.setPointerCapture(e.pointerId);}catch(_){}on();});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>off());};
    hold('#c-atk',()=>{if(!atkHeld){atkHeld=true;atkDownT=clock;}},()=>{if(atkHeld){atkHeld=false;releaseAttack();}});
    hold('#c-bow',()=>{bowHeld=true;},()=>{if(bowHeld){bowHeld=false;releaseBow();}});
    hold('#c-blk',()=>{blkHeld=true;},()=>{blkHeld=false;});}
  $('#c-atk').textContent=L2('Kılıç','Sword');$('#c-bow').textContent=L2('Ok','Bow');$('#c-blk').textContent=L2('Kalkan','Shield');
  box.hidden=!(isTouch||DP.on)||!started||!(G.sw>0);$('#c-bow').hidden=!(G.bw>0);$('#c-blk').hidden=!(G.sh>0);}
function nearestEnemy(r,cone){let b=null,bd=r;const fx=-Math.sin(cam.yaw),fz=-Math.cos(cam.yaw);
  for(const e of ENEMIES){if(!alive(e))continue;const dx=e.x-P.x,dz=e.z-P.z,d=Math.hypot(dx,dz);if(d>bd)continue;if(cone&&(dx*fx+dz*fz)/d<Math.cos(cone))continue;bd=d;b=e;}return b;}
function releaseAttack(heldQ){if(!(G.sw>0)||P.busy>0||P.mantle)return;if(SW.t>0){SW.queued=clock-atkDownT;return;}const held=heldQ!=null?heldQ:clock-atkDownT,ct=G.sw>=2?.45:.65;
  const near=nearestEnemy(3.6)||DUMMIES.filter(d=>Math.hypot(d.x-P.x,d.z-P.z)<2.6)[0];if(near)P.face=Math.atan2(near.x-P.x,near.z-P.z);
  if(held>=ct){SW={...SW,t:.42,dur:.42,kind:'spin',hit:false,from:0,to:Math.PI*2};sfx.wing();nz(.35,1600,.8,.12,'bandpass',500);}
  else{SW.combo=clock-SW.last<.55?(SW.combo+1)%3:0;SW.last=clock;const s=SW.combo%2?-1:1;SW={...SW,t:.26,dur:.26,kind:'slash',hit:false,from:1.15*s,to:-1.15*s};nz(.16,1200,1,.08,'bandpass',600);}
  trN=0;}
function releaseBow(){if(!(G.bw>0)){BOW.draw=0;return;}const k=BOW.draw;BOW.draw=0;if(k<.15)return;if((G.ar||0)<=0){toast(L2('Okun kalmadı. Raftan ya da okçudan al.','Out of arrows. Take some from the rack or the bowyer.'));return;}
  G.ar--;pop('r-stone');const t=nearestEnemy(28,.55)||DUMMIES.filter(d=>Math.hypot(d.x-P.x,d.z-P.z)<20).sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z))[0];
  const sx=P.x,sy=P.y+1.35,sz=P.z;let dx,dy,dz;if(t){dx=t.x-sx;dz=t.z-sz;dy=(height(t.x,t.z)+1.1)-sy;}else{dx=-Math.sin(cam.yaw);dz=-Math.cos(cam.yaw);dy=.05;}
  const l=Math.hypot(dx,dy,dz)||1,sp=14+18*k;P.face=Math.atan2(dx,dz);shoot('p',sx,sy,sz,dx/l*sp,dy/l*sp+(t?Math.hypot(dx,dz)*.12:0),dz/l*sp,(.6+.8*k)*(k>.95?1.3:1),G.bw>=2&&k>.95?2:1);
  nz(.12,900,2,.1,'bandpass',300);}
const arrowGeo=new THREE.CylinderGeometry(.015,.015,.8,4);arrowGeo.rotateX(Math.PI/2);
function shoot(from,x,y,z,vx,vy,vz,dmg,pierce){const m=new THREE.Mesh(arrowGeo,from==='p'?Lm(0xe8dcc4):Lm(0x3a2a1c));m.position.set(x,y,z);scene.add(m);ARW.push({m,x,y,z,vx,vy,vz,from,dmg,pierce,life:3,hits:new Set(),stuck:0});}
function hitEnemy(e,dmg,kx,kz,spin){
  if(e.st==='surrender'||e.st==='cook'){if(!e.warned){e.warned=true;toast(e.st==='cook'?L2('Savaşmayana dokunulmaz.','Those who do not fight are not to be touched.'):L2('Teslim olana dokunulmaz.','Those who surrender are not to be touched.'),3);}return false;}
  if(!alive(e))return false;
  e.hp-=dmg;e.kb.x=kx*(spin?7:4.5);e.kb.z=kz*(spin?7:4.5);sparkle(e.x,e.y+1.2,e.z,8);nz(.12,2400,3,.18,'bandpass',900);tone(220,.12,.05);HITSTOP=.06;
  if(e.hp<=0){e.st='down';e.t=9;e.robeMat.emissive.setHex(0);sfx.land(1);puff(e.x,e.y,e.z,10);return true;}
  if(e.hp<=e.max*.45&&!e.asked){e.asked=true;if(Math.random()<.55){e.st='surrender';e.t=8;e.robeMat.emissive.setHex(0);G.good++;pop('r-good');sfx.good();toast(L2('Teslim oldu. Merhamet: +1 iyilik','He surrendered. Mercy: +1 kindness'),3.2);queueSaying('p_baris');save();return true;}}
  e.st='stagger';e.t=G.sw>=3&&spin?.9:.38;e.robeMat.emissive.setHex(0);return true;}
let HITSTOP=0,hurtT=0,lastHurt=-99,regenT=0;
const hurtEl=document.createElement('div');hurtEl.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:2;box-shadow:inset 0 0 120px rgba(181,40,30,.75);opacity:0;transition:opacity .25s';document.body.appendChild(hurtEl);
function hurt(n,ex,ez){if(P.inv>0||state!=='play')return;
  const fx=Math.sin(P.face),fz=Math.cos(P.face),dx=ex-P.x,dz=ez-P.z,d=Math.hypot(dx,dz)||1;
  if(BLOCK&&(dx*fx+dz*fz)/d>.3){nz(.15,1800,4,.2,'bandpass',800);sparkle(P.x+fx*.5,P.y+1.2,P.z+fz*.5,6);P.inv=.3;return;}
  G.hp=Math.max(0,G.hp-n);P.inv=.8;lastHurt=clock;pop('r-wood');hurtEl.style.opacity=1;setTimeout(()=>hurtEl.style.opacity=0,220);buzz(60);sfx.land(.8);
  P.x-=dx/d*1.2;P.z-=dz/d*1.2;collideEnt(P,R,P.y);
  if(G.hp<=0){state='card';fadeOut(()=>{P.x=REF.x+2;P.z=REF.z+2;P.y=height(P.x,P.z);G.hp=10;cam.f=null;
    for(const e of ENEMIES){if(alive(e)||e.st==='stagger'){e.x=e.home.x;e.z=e.home.z;e.st='idle';e.hp=Math.max(e.hp,e.max*.6);}}
    fadeIn();state='play';toast(L2('Yaralandın. Sığınakta yaraların sarıldı.','You were wounded. Your wounds were dressed at the refuge.'),4);});}}

/* ---------- per-frame part-2 update ---------- */
function p2Step(dt){
  if(HITSTOP>0){HITSTOP-=dt;}
  P.inv=Math.max(0,(P.inv||0)-dt);
  const m=G.m||0;
  // hold states
  BLOCK=blkHeld&&(G.sh||0)>0&&state==='play';
  if(bowHeld&&G.bw>0&&state==='play'){BOW.draw=Math.min(1,BOW.draw+dt/(G.bw>=2?.5:.8));const t=nearestEnemy(28,.55);if(t)P.face=Math.atan2(t.x-P.x,t.z-P.z);}
  const charging=atkHeld&&G.sw>0&&clock-atkDownT>.15;
  P.slow=BLOCK?.4:bowHeld?.45:charging?.5:SW.t>0?.35:1;
  bladeM.emissive.setHex(charging&&clock-atkDownT>=(G.sw>=2?.45:.65)?0x7a5a10:charging?0x2a1a04:0x000000);
  // hero arm poses for weapons (after animHero)
  const h=hero;
  if(SW.t>0){SW.t-=dt;const k=1-Math.max(0,SW.t)/SW.dur,e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
    h.armR.rotation.x=-1.55;h.armR.rotation.z=0;h.body.rotation.y=SW.from+(SW.to-SW.from)*e;trailPush();trMat.opacity=SW.kind==='spin'?.85:.6;
    if(!SW.hit&&k>.45){SW.hit=true;const rng=SW.kind==='spin'?(G.sw>=3?3.5:2.7):2.4,dmg=(G.sw>=2?1.5:1)*(SW.kind==='spin'?1.6:SW.combo===2?1.3:1);
      for(const en of ENEMIES){if(!en.g.visible||en.st==='gone')continue;const dx=en.x-P.x,dz=en.z-P.z,d=Math.hypot(dx,dz);if(d>rng)continue;
        if(SW.kind!=='spin'){const a=Math.atan2(dx,dz)-P.face;if(Math.cos(a)<.25)continue;}hitEnemy(en,dmg,dx/(d||1),dz/(d||1),SW.kind==='spin');}
      for(const du of DUMMIES){const d=Math.hypot(du.x-P.x,du.z-P.z);if(d<rng+.3){du.wob=1;sfx.thunk();G.train=G.train||{};if(SW.kind==='spin')G.train.spin=(G.train.spin||0)+1;else G.train.hit=(G.train.hit||0)+1;}}}
    if(SW.t<=0){h.body.rotation.y=0;if(SW.queued!=null){const q=SW.queued;SW.queued=null;releaseAttack(q);}}}
  else{h.body.rotation.y*=Math.max(0,1-dt*12);trMat.opacity=Math.max(0,trMat.opacity-dt*3);if(charging){h.armR.rotation.x=-.4;h.armR.rotation.z=.6;}}
  if(BOW.draw>0||bowHeld){bowG.visible=true;h.armL.rotation.x=-1.55;h.armR.rotation.x=-1.45;h.armR.rotation.z=-.3*BOW.draw;}else bowG.visible=false;
  if(BLOCK){h.armL.rotation.x=-1.3;h.armL.rotation.z=.5;}
  // regen
  if(clock-lastHurt>6&&G.hp<10){regenT+=dt;if(regenT>3.5){regenT=0;G.hp++;}}
  // enemies
  for(const e of ENEMIES){if(!e.g.visible)continue;const dx=P.x-e.x,dz=P.z-e.z,d=Math.hypot(dx,dz);let sp=0,mode='idle';
    e.kb.x*=Math.exp(-8*dt);e.kb.z*=Math.exp(-8*dt);e.x+=e.kb.x*dt;e.z+=e.kb.z*dt;
    const sight=G.m===3?11:15,engaged=state==='play'&&!CINE;
    switch(e.st){
      case 'idle':{if(e.wait>0)e.wait-=dt;else{if(!e.tgt){const a=Math.random()*6.28;e.tgt=freeSpot(e.home.x+Math.cos(a)*5,e.home.z+Math.sin(a)*5,.5);}
          const t=e.tgt,td=Math.hypot(t.x-e.x,t.z-e.z);if(td<.4){e.tgt=null;e.wait=2+Math.random()*3;}else{e.x+=(t.x-e.x)/td*1.1*dt;e.z+=(t.z-e.z)/td*1.1*dt;e.face=Math.atan2(t.x-e.x,t.z-e.z);sp=1.1;}}
        if(engaged&&d<sight){e.st='chase';tone(330,.15,.05);}break;}
      case 'chase':{e.face=Math.atan2(dx,dz);
        if(e.type==='archer'){const want=d<7?-1:d>12?1:0;if(want){e.x+=dx/d*2.3*want*dt;e.z+=dz/d*2.3*want*dt;sp=2.3;}e.cd-=dt;if(e.cd<=0&&d<20&&engaged){e.st='windup';e.t=.9;}}
        else{if(d>1.8){e.x+=dx/d*2.7*dt;e.z+=dz/d*2.7*dt;sp=2.7;}else if((e.cd-=dt)<=0&&engaged){e.st='windup';e.t=.6;}}
        if(d>sight*2.2){e.st='idle';e.tgt=null;}break;}
      case 'windup':{e.face=Math.atan2(dx,dz);e.t-=dt;e.robeMat.emissive.setHex(Math.sin(clock*30)>0?0x661010:0x220404);mode='angry';
        if(e.type==='archer'){e.armL.rotation.x=-1.55;e.armR.rotation.x=-1.4;}else{e.armR.rotation.x=-2.2;}
        if(e.t<=0){e.robeMat.emissive.setHex(0);
          if(e.type==='archer'){const vx=dx,vz=dz,vy=(P.y+1.1)-(e.y+1.35),l=Math.hypot(vx,vy,vz)||1,s=15;shoot('e',e.x,e.y+1.35,e.z,vx/l*s,vy/l*s+d*.1,vz/l*s,2,1);e.cd=2.2+Math.random();}
          else{e.armR.rotation.x=-1.0;if(d<2.3){const a=Math.atan2(dx,dz)-e.face;if(Math.cos(a)>.4)hurt(2,e.x,e.z);}e.cd=.9+Math.random()*.6;}
          e.st='recover';e.t=.7;}break;}
      case 'recover':{e.t-=dt;if(e.t<=0)e.st='chase';break;}
      case 'stagger':{e.t-=dt;e.body.rotation.x=-.25;if(e.t<=0){e.st='chase';e.body.rotation.x=0;}break;}
      case 'surrender':{e.body.position.y=-.32;e.armL.rotation.x=e.armR.rotation.x=-2.9;e.t-=dt;if(e.t<=0&&!e.keep){e.st='flee';e.body.position.y=0;}mode='surr';break;}
      case 'down':{e.body.rotation.x=-1.45;e.body.position.y=.25;e.t-=dt;if(e.t<=0&&!e.keep){e.st='flee';e.body.rotation.x=0;e.body.position.y=0;}mode='surr';break;}
      case 'cook':{if(d<7){e.x-=dx/d*3*dt;e.z-=dz/d*3*dt;sp=3;e.face=Math.atan2(-dx,-dz);}break;}
      case 'flee':{const tx=e.x,tz=e.z+40;e.x+=0;e.z+=3.6*dt;e.face=0;sp=3.6;e.t=(e.t||0)-dt;if(e.t<-6){e.st='gone';e.g.visible=false;}break;}
    }
    collideEnt(e,.35,e.y);for(const o of ENEMIES){if(o===e||!o.g.visible)continue;const ox=e.x-o.x,oz=e.z-o.z,od=Math.hypot(ox,oz);if(od<.7&&od>1e-4){e.x+=ox/od*(.7-od)*.5;e.z+=oz/od*(.7-od)*.5;}}
    e.y=height(e.x,e.z);e.g.position.set(e.x,e.y,e.z);e.g.rotation.y=e.face;
    if(mode==='idle'&&e.st!=='windup')animPerson(e,dt,sp,e.st==='cook'?'idle':'walk');}
  // arrows
  for(let i=ARW.length-1;i>=0;i--){const a=ARW[i];if(a.stuck>0){a.stuck-=dt;if(a.stuck<=0){scene.remove(a.m);ARW.splice(i,1);}continue;}
    a.life-=dt;let done=a.life<=0;const nSub=Math.max(1,Math.ceil(Math.hypot(a.vx,a.vy,a.vz)*dt/.25)),sdt=dt/nSub;
    for(let si=0;si<nSub&&!done;si++){
    a.vy-=6*sdt;a.x+=a.vx*sdt;a.y+=a.vy*sdt;a.z+=a.vz*sdt;
    done=a.y<height(a.x,a.z);
    for(const o of SOL){if(o.top<a.y)continue;const [lx,lz]=toLocal(o,a.x,a.z);if(Math.abs(lx)<o.hw&&Math.abs(lz)<o.hd){done=true;break;}}
    if(a.from==='p'){for(const e of ENEMIES){if(!e.g.visible||a.hits.has(e))continue;if(Math.hypot(e.x-a.x,e.z-a.z)<.55&&a.y>e.y+.2&&a.y<e.y+1.8){a.hits.add(e);const l=Math.hypot(a.vx,a.vz)||1;if(hitEnemy(e,a.dmg,a.vx/l,a.vz/l,false)||e.st==='surrender'||e.st==='cook'){if(a.hits.size>=a.pierce)done=true;}}}
      for(const du of DUMMIES){if(Math.hypot(du.x-a.x,du.z-a.z)<.45&&a.y<height(du.x,du.z)+2){du.wob=1;G.train=G.train||{};G.train.arrow=(G.train.arrow||0)+1;sfx.thunk();done=true;}}}
    else if(Math.hypot(P.x-a.x,P.z-a.z)<.5&&a.y>P.y+.2&&a.y<P.y+1.8){hurt(a.dmg,a.x-a.vx,a.z-a.vz);done=true;}
    }
    a.m.position.set(a.x,a.y,a.z);a.m.lookAt(a.x+a.vx,a.y+a.vy,a.z+a.vz);
    if(done){a.stuck=2;}}
  for(const du of DUMMIES){du.wob=Math.max(0,du.wob-dt*2);du.g.rotation.z=Math.sin(clock*20)*.2*du.wob;}
  // missions
  if(m===0){const el=p2N.elder;if(G.flags.elderGo&&!G.flags.elderDone&&Math.hypot(el.x-REF.x,el.z-REF.z)<9){G.flags.elderDone=true;el.follow=null;el.home={x:el.x,z:el.z};G.good+=2;pop('r-good');sfx.good();toast(L2('Yaşlı adam güvende. +2 iyilik','The old man is safe. +2 kindness'));save();}
    if(G.flags.toolsDone&&G.flags.elderDone&&!(G.sw>0)){G.sw=1;swordG.visible=true;save();
      talk([[L2('Demirci','Blacksmith'),L2('Aletlerimi getirdin, yaşlıyı da. Al, bu kılıcı babam dövmüştü. Saldırmak için değil, korumak için taşı.',"You brought my tools, and the old man too. Here, my father forged this sword. Carry it to protect, not to attack.")]],()=>{setM(1);p2Buttons();toast(L2('Kılıç: F tuşu ya da Kılıç düğmesi. Basılı tutup bırakınca dolu vuruş.','Sword: F key or the Sword button. Hold and release for a charged strike.'),5);});}}
  if(m===1){const t=G.train||{};if(G.bw&&(t.hit||0)>=3&&(t.spin||0)>=1&&(t.arrow||0)>=1){queueSaying('p_ahlak');setM(2);}}
  if(m===2){const left=ENEMIES.filter(e=>e.grp==='camp'&&alive(e)).length;
    if(!left&&!G.flags.campDone&&!G.flags.gate){G.flags.gate=true;toast(L2('Muhafızlar kalmadı. Ağılın kapısını aç.','No guards left. Open the corral gate.'),4);
      const keep=ENEMIES.find(e=>e.grp==='camp'&&(e.st==='surrender'||e.st==='down'));if(keep){keep.keep=true;keep.thirst=true;keep.label=L2('Yaralı asker','Wounded soldier');}}
    if(G.flags.campDone===undefined&&camelsHome()>=5){G.flags.campDone=true;G.good+=3;pop('r-good');sfx.good();save();
      talk([[L2('Okçu','Bowyer'),L2('Develer döndü! Halkın ekmeği kurtuldu. Demirci ile okçu artık silahlarını güçlendirebilir; iyiliğin karşılığıdır.',"The camels are back! The people's livelihood is saved. The blacksmith and I can now strengthen your weapons; it is the reward of your kindness.")]],()=>setTimeout(()=>setM(3),400));}}
  if(m===3){for(const id of ['blind','mother','boy']){const n=p2N[id];if(n.follow&&!G.rescued[id]&&Math.hypot(n.x-REF.x,n.z-REF.z)<9){G.rescued[id]=true;n.follow=null;n.home={x:n.x,z:n.z};n.wander=3;if(id==='mother')p2N.kid.follow=null;G.good+=2;pop('r-good');sfx.good();toast(L2('Güvende! +2 iyilik','Safe! +2 kindness'));save();}}
    if(Object.keys(G.rescued).length>=3&&!G.flags.finale){G.flags.finale=true;save();setTimeout(elephantScene,1500);}}
}
sayBlock=()=>MODE==='p2'&&ENEMIES.some(e=>alive(e)&&e.st!=='idle'&&Math.hypot(e.x-P.x,e.z-P.z)<30);
const es2=extraStep;extraStep=function(dt){es2(dt);if(MODE==='p2'&&started)p2Step(dt);};
// soldiers' labels are not needed except the wounded one
for(const e of ENEMIES){}

/* ---------- actions ---------- */
const fa3=findAct;
function p2Act(){if(state!=='play'||P.mantle||P.busy>0)return null;
  if(P.carry==='tools'&&Math.hypot(P.x-REF.x,P.z-REF.z)<8)return {label:L2('Aletleri bırak','Set down the tools'),fn:()=>{P.carry=null;setHeld(null);sfx.thunk();G.flags.toolsDone=true;G.good+=1;pop('r-good');save();toast(L2('Demircinin aletleri güvende. +1 iyilik',"The blacksmith's tools are safe. +1 kindness"));}};
  if(G.flags.toolsGo&&!G.flags.toolsDone&&!P.carry&&TOOLS.m.visible&&Math.hypot(P.x-TOOLS.x,P.z-TOOLS.z)<1.8)return {label:L2('Çuvalı yüklen','Shoulder the sack'),fn:()=>{TOOLS.m.visible=false;P.carry='tools';setHeld('sack');sfx.pick();}};
  if(G.flags.gate&&!G.flags.gateOpen&&Math.hypot(P.x-CORRAL.x,P.z-CORRAL.z)<6.5)return {label:L2('Ağılın kapısını aç','Open the corral gate'),fn:()=>{G.flags.gateOpen=true;CAMELS2.forEach(c=>{c.pen=null;c.follow=P;});sfx.camel();save();toast(L2('Develer peşinde. Onları sığınağa götür.','The camels follow you. Lead them to the refuge.'),4);}};
  const th=ENEMIES.find(e=>e.thirst&&e.g.visible&&Math.hypot(P.x-e.x,P.z-e.z)<2.2);
  if(th){if(!G.flags.tulum)return {label:L2('Yaralı asker: “Su…”','Wounded soldier: “Water…”'),fn:()=>toast(L2('Su tulumun yok. Sığınaktaki şifacı kadından alabilirsin.','You have no waterskin. The healer at the refuge can give you one.'),4)};
    return {label:L2('Su ver','Give water'),fn:()=>{th.thirst=false;th.keep=false;th.t=3;G.good+=2;pop('r-good');sfx.pour();save();queueSaying('p_esir');
      talk([[L2('Yaralı asker','Wounded soldier'),L2('…Düşmanına su mu veriyorsun? Ebrehe bize sizin vahşi olduğunuzu söylemişti.','…You give water to your enemy? Abraha told us you were savages.')],[L2('Yaralı asker','Wounded soldier'),L2('Bu yoldan döneceğim. Allah seni korusun.','I will turn back from this road. May God protect you.')]]);}};}
  if(RACK&&Math.hypot(P.x-RACK.x,P.z-RACK.z)<2&&G.bw>0&&(G.ar||0)<12)return {label:L2('Ok al','Take arrows'),fn:()=>{G.ar=12;pop('r-stone');sfx.pick();}};
  return fa3();}
findAct=function(){return MODE==='p2'?p2Act():fa3();};
const tk3=onTalk;onTalk=function(n){if(MODE==='p2'){p2Talk(n);return;}tk3(n);};

/* ---------- hud, targets, saving in part 2 ---------- */
function p2Target(){const m=G.m||0;
  if(state==='cine')return null;
  if(P.carry==='tools')return {x:REF.x,z:REF.z,n:L2('Sığınak','Refuge')};
  if(m===0){if(!G.flags.elderGo)return {x:p2N.elder.x,z:p2N.elder.z,n:p2N.elder.label};if(!G.flags.elderDone&&p2N.elder.follow)return {x:REF.x,z:REF.z,n:L2('Sığınak','Refuge')};
    if(!G.flags.toolsGo)return {x:p2N.smith.x,z:p2N.smith.z,n:p2N.smith.label};if(!G.flags.toolsDone)return {x:TOOLS.x,z:TOOLS.z,n:L2('Aletler','Tools')};return {x:REF.x,z:REF.z,n:L2('Sığınak','Refuge')};}
  if(m===1){if(!G.bw)return {x:p2N.bowyer.x,z:p2N.bowyer.z,n:p2N.bowyer.label};return {x:DUMMIES[1].x,z:DUMMIES[1].z,n:L2('Kuklalar','Dummies')};}
  if(m===2){if(!G.flags.gateOpen)return {x:CORRAL.x,z:CORRAL.z,n:L2('Develer','Camels')};return {x:REF.x,z:REF.z,n:L2('Sığınak','Refuge')};}
  if(m===3){for(const id of ['blind','mother','boy']){const n=p2N[id];if(n.follow)return {x:REF.x,z:REF.z,n:L2('Sığınak','Refuge')};}
    let b=null,bd=1e9;for(const id of ['blind','mother','boy']){if(G.rescued[id])continue;const n=p2N[id];const d=Math.hypot(n.x-P.x,n.z-P.z);if(d<bd){bd=d;b=n;}}return b?{x:b.x,z:b.z,n:b.label}:null;}
  return null;}
function p2Hud(dt){qCh.textContent=L2('Bölüm 2 · Fil Yılı','Part 2 · Year of the Elephant');qGoal.textContent=MIS[Math.min(G.m||0,5)]();
  qSub.textContent=(G.m||0)===1?trainSub():(G.m||0)===2&&G.flags.gate&&!G.flags.campDone&&ENEMIES.some(e=>e.thirst)?L2('Yaralı bir asker su istiyor.','A wounded soldier asks for water.'):(G.m||0)===2?L2("Kırmızı pelerinliler Ebrehe'nin askerleri · teslim olana dokunma","Red cloaks are Abraha's soldiers · don't touch those who surrender"):'';
  $('#r-stone b').textContent=G.bw?(G.ar||0):'–';$('#r-wood b').textContent=Math.ceil((G.hp||0)/2)+'/5';$('#r-good b').textContent=G.good;$('#r-kabe b').textContent=camelsHome()+'/6';
  carryEl.hidden=P.carry!=='tools';carryEl.textContent=L2('Demircinin aletleri: ağır','Blacksmith\'s tools: heavy');
  if(toastT>0){toastT-=dt;if(toastT<=0)toastEl.classList.remove('on');}}
const uh=updateHud;updateHud=function(dt){if(MODE==='p2')p2Hud(dt);else uh(dt);};
const ct=currentTarget;currentTarget=function(){return MODE==='p2'?p2Target():ct();};
const qm=questMarkers;questMarkers=function(){if(MODE!=='p2')return qm();const t=p2Target();return t?[t]:[];};
const sv=save;save=function(){if(MODE==='p2')p2Save();else sv();};
const sw0=syncWorld;syncWorld=function(){if(MODE==='p2'){p2Sync();return;}sw0();};

/* ---------- sayings and notebook entries for part 2 ---------- */
Object.assign(SAY,{
  p_ahlak:['a',L2('Aşırı gitmemek','Do not transgress'),L2('Sizinle savaşanlarla Allah yolunda savaşın, fakat aşırı gitmeyin. Allah aşırı gidenleri sevmez.','Fight in the way of Allah those who fight you, but do not transgress. Allah does not love transgressors.'),L2('Bakara 2:190','Al-Baqara 2:190')],
  p_cocuk:['h',L2('Savaşın ahlakı','The ethics of war'),L2('Allah\'ın adıyla yola çıkın. Hainlik etmeyin, sözünüzden dönmeyin, ölülere eziyet etmeyin, çocukları öldürmeyin.','Set out in the name of Allah. Do not betray, do not break your word, do not mutilate the dead, do not kill children.'),L2('Müslim','Muslim')],
  p_baris:['a',L2('Barışa yanaşmak','Inclining to peace'),L2('Eğer onlar barışa yanaşırlarsa, sen de ona yanaş ve Allah\'a güven.','If they incline to peace, then incline to it too, and trust in Allah.'),L2('Enfâl 8:61','Al-Anfal 8:61')],
  p_esir:['a',L2('Esire yemek','Feeding the captive'),L2('Onlar, kendileri sevdikleri hâlde yemeği yoksula, yetime ve esire yedirirler.','They give food, despite loving it, to the poor, the orphan and the captive.'),L2('İnsân 76:8','Al-Insan 76:8')],
  p_guclu:['h',L2('Gerçek güç','True strength'),L2('Güçlü kişi, güreşte rakibini yenen değil, öfkelendiğinde kendine hâkim olandır.','The strong one is not the one who overcomes others in wrestling, but the one who controls himself when angry.'),L2('Buhârî, Müslim','Bukhari, Muslim')],
  p_fil:['a',L2('Fîl Sûresi','Surah al-Fil'),L2('Rabbinin fil sahiplerine ne yaptığını görmedin mi? Onların tuzağını boşa çıkarmadı mı? Üzerlerine sürü sürü kuşlar gönderdi. Onlara pişmiş çamurdan taşlar atıyorlardı. Sonunda onları yenilmiş ekin yaprağı gibi yaptı.','Have you not seen how your Lord dealt with the people of the elephant? Did He not make their plan go astray? He sent against them birds in flocks, striking them with stones of baked clay, and made them like eaten-up straw.'),L2('Fîl 105:1–5','Al-Fil 105:1–5')]
});
for(const id of ['p_ahlak','p_cocuk','p_baris','p_esir','p_guclu','p_fil']){const s=SAY[id];const e={id:'s_'+id,g:'Sözler',t:s[1],b:(s[0]==='h'?SAY_H:SAY_A)+"\n\n“"+s[2]+"”",c:[s[3]],est:CX.s_camur?CX.s_camur.est:''};CODEX.push(e);CX[e.id]=e;}
for(const e of [
  {id:'o_kulleys',g:'Olaylar',t:L2("Ebrehe'nin kilisesi","Abraha's church"),b:L2("Yemen'i Habeş krallığı adına yöneten Ebrehe, San'a'da Kulleys denen büyük bir kilise yaptırdı ve Arapların haccını oraya çevirmek istedi. Bu olmayınca Kâbe'yi yıkmak için yola çıktı.","Abraha, ruling Yemen for the Abyssinian kingdom, built a great church in San'a called al-Qullays and wanted to turn the Arabs' pilgrimage toward it. When that failed, he set out to destroy the Kaaba."),c:[SRC.IH]},
  {id:'o_develer',g:'Olaylar',t:L2('Develerin sahibi','The owner of the camels'),b:L2("Ebrehe'nin askerleri Abdülmuttalib'in iki yüz devesini ele geçirdi. Abdülmuttalib Ebrehe'nin huzuruna çıkıp yalnızca develerini istedi. Ebrehe şaşırınca şöyle dedi: “Ben develerin sahibiyim. Bu Evin de bir sahibi var; onu O korur.”","Abraha's soldiers seized two hundred camels belonging to Abd al-Muttalib. He went before Abraha and asked only for his camels. When Abraha was surprised, he said: “I am the owner of the camels. The House has its own Lord, who will protect it.”"),c:[SRC.IH]},
  {id:'o_mahmud',g:'Olaylar',t:L2('Fil Mahmûd','The elephant Mahmud'),b:L2("Ordunun önündeki filin adı Mahmûd'du. Kâbe'ye doğru çevrildiğinde çöküp kaldı; dövseler de kalkmadı. Yemen'e çevirdiklerinde kalkıp yürüdü, yeniden Kâbe'ye çevirdiklerinde yine çöktü.","The elephant at the head of the army was called Mahmud. When turned toward the Kaaba it knelt and would not rise, however they beat it. Turned toward Yemen it got up and walked; turned toward the Kaaba again, it knelt."),c:[SRC.IH]},
  {id:'o_ebabil',g:'Olaylar',t:L2('Ebabil kuşları','The birds of Ababil'),b:L2("Denizden sürü sürü kuşlar geldi. Her birinin gagasında ve ayaklarında nohut büyüklüğünde taşlar vardı. Ordu dağıldı, kaçarken yollarda helak oldu; Ebrehe de San'a'ya dönerken öldü.","Flocks of birds came from the sea, each carrying stones the size of chickpeas in its beak and claws. The army scattered and perished on the roads as it fled; Abraha died on the way back to San'a."),c:[SRC.IH]},
  {id:'o_dogum',g:'Olaylar',t:L2('O yıl doğan çocuk','The child born that year'),b:L2("Araplar bu yıla Fil Yılı dedi. Aynı yıl Mekke'de, Abdullah ile Âmine'nin oğlu dünyaya geldi: Efendimiz Muhammed (s.a.v.).","The Arabs called this year the Year of the Elephant. That same year in Mecca, the son of Abdullah and Amina was born: the Prophet Muhammad (pbuh)."),c:[SRC.IH,SRC.M]}
]){CODEX.push(e);CX[e.id]=e;}

/* ---------- the end: Mahmûd kneels, the birds come ---------- */
function makeElephant(){const g=new THREE.Group(),b=new THREE.Group();g.add(b);const skin=Lm(0x8a8580);
  const body=new THREE.Mesh(new THREE.SphereGeometry(1.4,18,14),skin);body.scale.set(1,.95,1.35);body.position.y=2.6;b.add(body);
  const head=new THREE.Group();head.position.set(0,3.1,1.9);b.add(head);const hm=new THREE.Mesh(new THREE.SphereGeometry(.85,16,12),skin);head.add(hm);
  for(const s of [-1,1]){const ear=new THREE.Mesh(new THREE.CircleGeometry(.85,14),Lm(0x7d7873));ear.material.side=THREE.DoubleSide;ear.position.set(s*.8,.1,-.2);ear.rotation.y=s*1.2;head.add(ear);
    const tk=new THREE.Mesh(new THREE.ConeGeometry(.08,.8,8),Lm(0xf0e8d8));tk.position.set(s*.32,-.55,.6);tk.rotation.x=2.2;head.add(tk);
    const ey=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),eyeM);ey.position.set(s*.42,.2,.62);head.add(ey);}
  let seg=head;for(let i=0;i<5;i++){const t=new THREE.Group();t.position.set(0,i?-.32:-.3,i?.05:.7);seg.add(t);const m=new THREE.Mesh(new THREE.CylinderGeometry(.22-i*.03,.25-i*.03,.36,10),skin);m.position.y=-.16;t.add(m);t.rotation.x=.25;seg=t;}
  const legs=[];for(const [x,z] of [[.65,.9],[-.65,.9],[.65,-.9],[-.65,-.9]]){const l=new THREE.Group();l.position.set(x,1.9,z);const m=new THREE.Mesh(new THREE.CylinderGeometry(.34,.32,1.9,10),skin);m.position.y=-.95;l.add(m);b.add(l);legs.push(l);}
  const how=new THREE.Mesh(new THREE.BoxGeometry(1.5,.9,1.6),Lm(0x8a2a22));how.position.set(0,4.2,-.2);b.add(how);const roof=new THREE.Mesh(new THREE.ConeGeometry(1.1,.7,4),Lm(0xb08a4a));roof.position.set(0,5.0,-.2);roof.rotation.y=Math.PI/4;b.add(roof);
  g.traverse(m=>{if(m.isMesh)m.castShadow=true;});return {g,b,legs,head};}
function elephantScene(){
  setTime('dawn');ENEMIES.forEach(e=>e.g.visible=false);
  const base=freeOpen(0,150);const el=makeElephant();el.g.position.set(base.x,height(base.x,base.z),base.z);el.g.rotation.y=Math.PI;scene.add(el.g);
  const army=[];for(let i=0;i<28;i++){const p=makeSoldier(i%5===0?'archer':'spear');const x=base.x+((i%7)-3)*1.6,z=base.z+5+Math.floor(i/7)*1.8;p.g.position.set(x,height(x,z),z);p.g.rotation.y=Math.PI;scene.add(p.g);army.push({p,x,z,vx:0,vz:0});}
  const N=90,bm=new THREE.InstancedMesh(new THREE.ConeGeometry(.18,.6,4),Lm(0x2a2420),N);bm.frustumCulled=false;scene.add(bm);const birds=[];
  for(let i=0;i<N;i++)birds.push({x:base.x-120-Math.random()*60,y:30+Math.random()*14,z:base.z-20+Math.random()*50,s:14+Math.random()*6,ph:Math.random()*6});
  const dm=new THREE.Object3D();const hideBirds=()=>{for(let i=0;i<N;i++){dm.position.set(0,-99,0);dm.updateMatrix();bm.setMatrixAt(i,dm.matrix);}bm.instanceMatrix.needsUpdate=true;};hideBirds();
  const look=new V3(base.x,3,base.z),eye=new V3(base.x+18,10,base.z-22),eye2=new V3(base.x+7,4,base.z-9);
  const march=k=>{for(const a of army){a.p.g.position.z=a.z-k*3;animPerson(a.p,.016,1.6,'walk');}};
  cine([
    {d:4.5,from:{p:new V3(base.x+34,16,base.z-44),l:look},to:{p:eye,l:look},sub:L2("Sabah Ebrehe ordusunu ve filini Kâbe'ye doğru sürdü.","In the morning Abraha drove his army and his elephant toward the Kaaba."),upd:k=>{march(k);el.g.position.z=base.z-k*3;}},
    {d:4.5,from:{p:eye2,l:look},to:{p:eye2,l:new V3(base.x,2,base.z-3)},sub:L2("Ama önde yürüyen fil, Mahmûd, Kâbe'ye çevrilince çöküp kaldı. Dövdüler, kalkmadı.","But the elephant in front, Mahmud, knelt down when turned toward the Kaaba. They beat it; it would not rise."),
      upd:k=>{const e=Math.min(1,k*1.6);el.legs[0].rotation.x=el.legs[1].rotation.x=-1.3*e;el.legs[2].rotation.x=el.legs[3].rotation.x=1.0*e;el.b.position.y=-1.2*e;el.b.rotation.x=.12*e;}},
    {d:4,from:{p:eye2,l:new V3(base.x,2,base.z-3)},to:{p:eye,l:new V3(base.x-30,20,base.z)},sub:L2("Yemen'e çevirdiler, kalkıp yürüdü. Kâbe'ye çevirdiler, yine çöktü. Sonra denizden doğru sürü sürü kuşlar göründü.","Turned toward Yemen, it rose and walked; turned toward the Kaaba, it knelt again. Then flocks of birds appeared from the direction of the sea."),
      start:()=>{nz(3,3000,.5,.06,'highpass');},upd:k=>{for(let i=0;i<N;i++){const b=birds[i];b.x+=b.s*.016*(1+k);dm.position.set(b.x,b.y+Math.sin(clock*8+b.ph)*.3,b.z);dm.rotation.set(0,0,-Math.PI/2);dm.scale.set(1,1,1+Math.sin(clock*20+b.ph)*.3);dm.updateMatrix();bm.setMatrixAt(i,dm.matrix);}bm.instanceMatrix.needsUpdate=true;}},
    {d:5,from:{p:eye,l:look},to:{p:new V3(base.x+28,16,base.z-30),l:new V3(base.x,2,base.z+8)},sub:L2("Kuşlar orduya pişmiş çamurdan taşlar attı. Ordu dağıldı, geldiği yoldan kaçtı.","The birds pelted the army with stones of baked clay. The army scattered and fled the way it had come."),
      upd:k=>{for(let i=0;i<N;i++){const b=birds[i];b.x+=(base.x+((i%9)-4)*2-b.x)*.02;b.z+=(base.z+6+((i/9|0)-5)*1.4-b.z)*.02;b.y+=(12-b.y)*.02;dm.position.set(b.x,b.y+Math.sin(clock*8+b.ph)*.3,b.z);dm.updateMatrix();bm.setMatrixAt(i,dm.matrix);
          if(Math.random()<.04){const p=FX.parts[FX.i=(FX.i+1)%FX.parts.length];p.x=b.x;p.y=b.y;p.z=b.z;p.vx=0;p.vz=0;p.vy=-14;p.life=.8;}}bm.instanceMatrix.needsUpdate=true;
        for(const a of army){a.p.g.position.z+=(4+Math.random()*2)*.016*k*3;a.p.g.rotation.y=0;animPerson(a.p,.016,4,'walk');if(Math.random()<.02)puff(a.p.g.position.x,a.p.g.position.y,a.p.g.position.z,4);}}},
    {d:4.5,from:{p:new V3(16,7,-18),l:new V3(0,3,0)},to:{p:new V3(22,9,-24),l:new V3(0,3,0)},sub:L2("Kâbe ayakta kaldı. Mekkeliler dağlardan indi.","The Kaaba remained standing. The Meccans came down from the mountains."),start:()=>{setTime('noon');army.forEach(a=>a.p.g.visible=false);el.g.visible=false;hideBirds();}}
  ],()=>{army.forEach(a=>scene.remove(a.p.g));scene.remove(el.g);scene.remove(bm);G.m=5;save();discover('o_mahmud',true);discover('o_ebabil',true);discover('o_develer',true);discover('o_kulleys',true);discover('o_dogum',true);
    P.x=14;P.z=-12;P.y=height(P.x,P.z);cam.f=null;queueSaying('p_fil');
    const m=Math.max(1,Math.round((G.time||0)/60));
    showCard(L2('Son','The end'),{t:L2('Fil Yılı','The Year of the Elephant'),b:CX.o_dogum.b+'\n\n'+L2('İyilik: ','Kindness: ')+G.good+' · '+L2('Süre: ','Time: ')+m+L2(' dk.',' min.'),c:[SRC.IH]},L2('Devam','Continue'),()=>queueSaying('p_guclu'));});
}

/* ---------- start-up in part 2 ---------- */
if(MODE==='p2'){
  p2Build();G.m=0;G.hp=10;G.rescued={};G.train={};
  $('.tbox .over').textContent=L2('Mekke · yaklaşık 570','Mecca · around 570');$('.tbox .sub').textContent=L2('Fil Yılı','The Year of the Elephant');
  $('#p-about').innerHTML='<p style="margin:0 0 6px">'+L2("Ebrehe, filleriyle Kâbe'yi yıkmaya geliyor. Mekkeliler dağlara çekiliyor. Sen genç bir Mekkelisin: halkı dağa çıkar, kaçırılan develeri kurtar, şehirde kalanları koru.","Abraha is coming with his elephants to destroy the Kaaba. The Meccans are withdrawing to the mountains. You are a young Meccan: help the people up the mountain, rescue the stolen camels, protect those left in the city.")+'</p><p style="margin:0">'+L2('Bu bölümde kimse ölmez: düşmanlar yere düşer, teslim olur ya da kaçar. Savaşmayana ve teslim olana dokunulmaz.','No one dies in this part: enemies fall, surrender or flee. Those who do not fight or who surrender are never to be touched.')+'</p>';
  $('#p-controls').innerHTML+=(isTouch?'':'<dl style="margin-top:6px"><dt>F</dt><dd>'+L2('Kılıç; basılı tutup bırak: dolu vuruş. Fare tıklaması da olur.','Sword; hold and release: charged strike. Mouse click works too.')+'</dd><dt>R</dt><dd>'+L2('Ok: basılı tut, ger, bırak.','Bow: hold to draw, release.')+'</dd><dt>G</dt><dd>'+L2('Kalkan','Shield')+'</dd></dl>');
  const hs=(()=>{try{return !!localStorage.getItem(P2KEY);}catch(_){return false;}})();mStart.textContent=hs?L2('Devam et','Continue'):L2('Başla','Start');mNew.hidden=!hs;
  // the stone/timber/kabe chips become arrows, health and camels in part 2
  $('#r-stone svg').innerHTML='<path d="M4 20L20 4M20 4h-6M20 4v6M4 20l3-1-2-2z" stroke="#4a3f36" stroke-width="2" fill="none" stroke-linecap="round"/>';
  $('#r-wood svg').innerHTML='<path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z" fill="#b5523b"/>';
  $('#r-kabe svg').innerHTML='<path d="M4 18v-5c0-2 2-3 4-3l2-3h3l1 3c3 0 6 1 6 4v4M7 18v2M17 18v2" stroke="#8a6a44" stroke-width="2" fill="none" stroke-linecap="round"/>';
  T=cloneT(TIMES.asr);RAIN.target=0;RAIN.amt=0;flood.visible=false;puddles.visible=false;
}
window.__p2={ENEMIES,DUMMIES,CAMELS2,p2N,REF:()=>REF,CORRAL:()=>CORRAL,TOOLS:()=>TOOLS,setM,camelsHome,
  atk:hold=>{atkDownT=clock-(hold||0);releaseAttack();},bow:k=>{BOW.draw=k;releaseBow();},alive,SW:()=>SW};
