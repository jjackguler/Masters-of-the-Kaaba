/* ===================== l13: Hacılara Hizmet: the endless layer after the story =====================
   Historical frame: Quraysh's offices of Siqaya (water) and Rifada (food) for pilgrims, organised by Qusayy.
   Game frame: stock three stands, keep queues moving, hire helpers, finish ever larger pilgrimage seasons.
   Nobody here is a named historical person; the hero stays the same nameless Meccan. */
const MCH=8;
CH[MCH]={name:L2('Hacılara Hizmet','Serving the Pilgrims'),icon:'🫖',par:600,story:'',learn:'',
  task:L2('Hacılara su, hurma ve ekmek ikram et: stantları dolu tut, tezgâhtaki bereketi topla.','Serve the pilgrims water, dates and bread: keep the stands stocked and collect the bereket on the counters.')};
const MUPG=[
  {id:'standD',cost:120,icon:'🌴',label:L2('Hurma ikramı','Date stand'),desc:L2('Hurma standı ve kervanı açılır. Bir hurma ikramı 4 bereket.','Opens the date stand and its caravan. Each serving pays 4 bereket.')},
  {id:'mcap1',cost:150,icon:'🎒',label:L2('Taşıma +2','Carry +2'),desc:L2('Burada bir seferde 2 yük daha taşırsın.','Carry 2 more loads here.')},
  {id:'saka',cost:220,icon:'🫗',label:L2('Saka (sucu)','Water carrier'),desc:L2('Zemzem\'den su standına su taşır; sen yokken de çalışır.','Carries Zamzam water to the water stand, even while you are away.')},
  {id:'standB',cost:380,need:'standD',icon:'🍞',label:L2('Ekmek ikramı','Bread stand'),desc:L2('Un, fırın ve ekmek standı açılır. Bir ekmek ikramı 6 bereket.','Opens flour, the oven and the bread stand. Each serving pays 6 bereket.')},
  {id:'shade',cost:300,icon:'⛱️',label:L2('Gölgelik','Shade'),desc:L2('Hacılar sırada %50 daha uzun sabreder.','Pilgrims wait 50% longer in the queues.')},
  {id:'hurmaci',cost:450,need:'standD',icon:'🧺',label:L2('Hurma yardımcısı','Date helper'),desc:L2('Kervandan hurma standına hurma taşır; sen yokken de çalışır.','Carries dates to the stand, even while you are away.')},
  {id:'big',cost:500,icon:'🪵',label:L2('Büyük tezgâh','Big counters'),desc:L2('Her stant iki kat stok tutar.','Every stand holds twice the stock.')},
  {id:'mcap2',cost:600,need:'mcap1',icon:'🎒',label:L2('Taşıma +2','Carry +2'),desc:L2('Burada bir seferde 2 yük daha taşırsın.','Carry 2 more loads here.')},
  {id:'cirak',cost:700,need:'standB',icon:'🧑‍🍳',label:L2('Fırıncı çırağı','Baker\'s apprentice'),desc:L2('Unu fırına, ekmeği standa taşır; sen yokken de çalışır.','Carries flour to the oven and bread to the stand, even while you are away.')}];
const STD={w:{k:'w',item:'water',price:2,icon:'💧',label:L2('Su ikramı','Water stand'),base:[12.5,-8.5],q:[],cash:0,t:0},
  d:{k:'d',item:'dates',price:4,icon:'🌴',label:L2('Hurma ikramı','Date stand'),base:[-13.5,8.5],q:[],cash:0,t:0,unlock:'standD'},
  b:{k:'b',item:'bread',price:6,icon:'🍞',label:L2('Ekmek ikramı','Bread stand'),base:[-4.5,-16],q:[],cash:0,t:0,unlock:'standB'}};
const ITEM_STAND={water:'w',dates:'d',bread:'b'};
function cleanMeta(m){const n=(v,d,lo,hi)=>{v=Number(v);return isFinite(v)?Math.min(hi,Math.max(lo,v)):d;};m=m&&typeof m==='object'?m:{};
  const o={season:Math.round(n(m.season,1,1,9999)),ss:Math.round(n(m.ss,0,0,1e6)),ms:Math.round(n(m.ms,0,0,1e6)),served:Math.round(n(m.served,0,0,1e9)),missed:Math.round(n(m.missed,0,0,1e9)),
    earned:Math.round(n(m.earned,0,0,1e9)),lastT:n(m.lastT,0,0,1e14),intro:m.intro?1:0,between:m.between?1:0,up:{},stock:{},cash:{}};
  if(m.up&&typeof m.up==='object')for(const u of MUPG)if(m.up[u.id])o.up[u.id]=true;
  for(const k of ['w','d','b','dates','flour','oven','ovenOut'])o.stock[k]=Math.round(n(m.stock&&m.stock[k],0,0,40));
  for(const k in STD)o.cash[k]=Math.round(n(m.cash&&m.cash[k],0,0,1e6));
  return o;}
D.meta=cleanMeta(D.meta);
{const cp0=cleanProfile;cleanProfile=function(s){const o=cp0(s);o.meta=cleanMeta(o.meta);return o;};}
const MU=id=>!!D.meta.up[id];
const standOpen=k=>!STD[k].unlock||MU(STD[k].unlock);
const openStands=()=>Object.keys(STD).filter(standOpen);
function seasonTarget(s){return 15+5*(s-1)*(s+2)/2;}
function metaCap(){return D.cap+(MU('mcap1')?2:0)+(MU('mcap2')?2:0);}
/* ---------- items ---------- */
ITEM.flour='sack';
const datesGeo=new THREE.CylinderGeometry(.24,.19,.22,10),datesMat=new THREE.MeshLambertMaterial({color:0x7a4320});
const breadGeo=new THREE.CylinderGeometry(.27,.27,.09,14),breadMat=new THREE.MeshLambertMaterial({color:0xd9a35a});
const coinGeo=new THREE.CylinderGeometry(.12,.12,.04,10),coinMat=new THREE.MeshLambertMaterial({color:0xe3a51f,emissive:0x3a2600});
[datesGeo,breadGeo,coinGeo].forEach(g=>SHARED_GEO.add(g));[datesMat,breadMat,coinMat].forEach(m=>SHARED_MATS.add(m));
{const io0=itemOf;itemOf=function(t){if(t==='dates'){const m=new THREE.Mesh(datesGeo,datesMat);m.castShadow=true;return m;}if(t==='bread'){const m=new THREE.Mesh(breadGeo,breadMat);m.castShadow=true;return m;}return io0(t);};}
NAMES_T.dates=L2('Hurma','Dates');NAMES_T.flour=L2('Un','Flour');NAMES_T.bread=L2('Ekmek','Bread');
/* ---------- the place ---------- */
let metaBuilt=false,metaG=null,KC=null,RING=11.6,GATES=[],baker=null,ovenFire=null;const MPADS=[],PIL=[],HELP=[];
const PMAX=QL.tier==='low'?8:QL.tier==='med'?12:14;
function stall(x,z,ox,oz,col){const g=new THREE.Group();g.position.set(x,height(x,z),z);g.rotation.y=Math.atan2(ox,oz);
  const top=new THREE.Mesh(new THREE.BoxGeometry(2.6,.16,1.1),mat.wood);top.position.y=.9;top.castShadow=top.receiveShadow=true;g.add(top);
  const front=new THREE.Mesh(new THREE.BoxGeometry(2.5,.8,.12),mat.wood);front.position.set(0,.45,.48);g.add(front);
  for(const sx of [-1.2,1.2])for(const sz of [-.5,.5]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,2.3,6),mat.wood);p.position.set(sx,1.15,sz);g.add(p);}
  const aw=new THREE.Mesh(new THREE.PlaneGeometry(2.9,1.5),new THREE.MeshLambertMaterial({color:col,side:THREE.DoubleSide}));aw.rotation.x=-Math.PI/2+.25;aw.position.y=2.32;aw.castShadow=true;g.add(aw);
  metaG.add(g);return g;}
function buildMeta(){if(metaBuilt)return;metaBuilt=true;build();metaG=new THREE.Group();scene.add(metaG);KC=kW(0,0);
  Z.well.chs.push(MCH);
  for(const k in STD){const s=STD[k];const p=freeSpot(s.base[0],s.base[1],2.2);let ox=p.x-KC.x,oz=p.z-KC.z;const l=Math.hypot(ox,oz)||1;ox/=l;oz/=l;s.out={x:ox,z:oz};
    const cx=p.x+ox*1.9,cz=p.z+oz*1.9;s.g=stall(cx,cz,ox,oz,k==='w'?0x2f5d8a:k==='d'?0x4d6b3a:0x8a3a2c);
    const z=zone({id:'st_'+k,chs:[MCH],x:p.x,z:p.z,icon:s.icon,label:s.label,col:'#b5523b',r:1.8,pileAt:{x:cx,z:cz},item:s.item,max:8,cols:3,when:()=>standOpen(k)});
    z.pileG.position.y+=.98;z.pileG.rotation.y=s.g.rotation.y;Z['st_'+k]=z;s.z=z;
    s.coins=new THREE.Group();s.coins.position.set(cx+(-oz)*.95,height(cx,cz)+.99,cz+ox*.95);metaG.add(s.coins);}
  Z.mdates=zone({id:'mdates',chs:[MCH],x:-25,z:15,icon:'🐪',label:L2('Hurma kervanı','Date caravan'),col:'#7a5a3a',pileAt:{x:-27.4,z:17},item:'dates',max:20,cols:4,when:()=>standOpen('d')});
  Z.mdates.camel=animal('camel',-30,19);Z.mdates.camel.graze=false;Z.mdates.camel.face=2.2;Z.mdates.camel.g.visible=false;
  Z.mflour=zone({id:'mflour',chs:[MCH],x:7,z:-25,icon:'🌾',label:L2('Un çuvalları','Flour sacks'),col:'#7a6553',pileAt:{x:9.4,z:-27},item:'flour',max:18,cols:3,when:()=>standOpen('b')});
  const ov=freeSpot(-4,-24,2);Z.oven=zone({id:'oven',chs:[MCH],x:ov.x+2.6,z:ov.z,icon:'🔥',label:L2('Fırın','Oven'),col:'#8a3a2c',r:1.8,pileAt:{x:ov.x+2.4,z:ov.z+2},item:'flour',max:10,cols:2,when:()=>standOpen('b')});
  Z.ovenOut=zone({id:'ovenOut',chs:[MCH],x:ov.x-2.6,z:ov.z,icon:'🍞',label:L2('Taze ekmek','Fresh bread'),col:'#3d8a59',r:1.8,pileAt:{x:ov.x-2.4,z:ov.z+2},item:'bread',max:12,cols:3,when:()=>standOpen('b')});
  const dome=new THREE.Mesh(new THREE.SphereGeometry(1.2,16,10,0,Math.PI*2,0,Math.PI/2),mat.clay||mat.wood);dome.position.set(ov.x,height(ov.x,ov.z),ov.z);dome.castShadow=true;metaG.add(dome);Z.oven.dome=dome;
  baker=makePerson({robe:0x8a6a4a,cloth:0xf2e8d5,beard:0x3a2e26,hat:'scarf'});const bs=freeSpot(ov.x,ov.z+1.9,.4);baker.x=bs.x;baker.z=bs.z;baker.g.position.set(bs.x,height(bs.x,bs.z),bs.z);baker.g.rotation.y=Math.PI;scene.add(baker.g);baker.t=0;
  GATES=[[32,-12],[-31,-8],[-6,31],[24,24]].map(([x,z])=>freeSpot(x,z,.8));
  metaG.visible=false;baker.g.visible=false;}
/* ---------- upgrade pads for this layer ---------- */
const MPOS=[[17,9],[13.5,12.5],[9.5,14.5]];
function syncMPads(){for(const p of MPADS.splice(0))scene.remove(p.mesh);if(R.ch!==MCH)return;
  const av=MUPG.filter(u=>!MU(u.id)&&(!u.need||MU(u.need))).slice(0,3);
  av.forEach((u,i)=>{const s=freeSpot(MPOS[i][0],MPOS[i][1],1.7);u.x=s.x;u.z=s.z;
    const m=new THREE.Mesh(new THREE.CircleGeometry(1.6,40),new THREE.MeshBasicMaterial({map:padTex(u.icon,'★'+u.cost,'#d39a2c'),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4}));
    m.rotation.x=-Math.PI/2;m.position.set(u.x,height(u.x,u.z)+.07,u.z);scene.add(m);
    const p={u,mesh:m,paid:0,buy(){D.meta.up[u.id]=true;applyMeta();syncMPads();toast('✓ '+u.label+': '+u.desc,4);}};MPADS.push(p);});}
PADSETS.push(()=>R.ch===MCH?MPADS:[]);
function applyMeta(){const big=MU('big');for(const k in STD){STD[k].z.max=big?16:8;}makeHelpers();}
/* ---------- helpers ---------- */
const HJOB={saka:()=>({src:Z.well,dst:STD.w.z,item:'water',inf:true}),hurmaci:()=>({src:Z.mdates,dst:STD.d.z,item:'dates'}),
  cirak:()=>Z.ovenOut.count>=2&&STD.b.z.count<STD.b.z.max?{src:Z.ovenOut,dst:STD.b.z,item:'bread'}:Z.mflour.count>=2&&Z.oven.count<Z.oven.max-2?{src:Z.mflour,dst:Z.oven,item:'flour'}:null};
const HLOOK={saka:{robe:0x2f5d8a,cloth:0xe9dcc0,hat:'scarf'},hurmaci:{robe:0x4d6b3a,cloth:0xf2e8d5,hat:'turban'},cirak:{robe:0xc58b3a,cloth:0xf2e8d5,hat:'scarf'}};
function makeHelpers(){for(const id in HJOB){if(!MU(id)||HELP.some(h=>h.id===id))continue;const per=makePerson(Object.assign({beard:0x3a2e26},HLOOK[id]));const s=freeSpot(16,4,.4);
    const h={id,per,x:s.x,z:s.z,face:0,carry:[],job:null,t:0};per.g.position.set(s.x,height(s.x,s.z),s.z);scene.add(per.g);per.g.visible=R.ch===MCH;HELP.push(h);}}
function stepHelpers(dt,sim){for(const h of HELP){h.per.g.visible=true;let sp=0;
    if(!h.job)h.job=HJOB[h.id]();const j=h.job;if(!j){animPerson(h.per,dt,0,'idle');continue;}
    const t=h.carry.length?j.dst:j.src;const dx=t.x-h.x,dz=t.z-h.z,d=Math.hypot(dx,dz);
    if(d>1.1){if(sim){const v=2.6;h.x+=dx/d*v*dt;h.z+=dz/d*v*dt;h.face=Math.atan2(dx,dz);sp=v;collideEnt(h,.3,0);}}
    else if(sim){h.t+=dt;if(h.t>.35){h.t=0;
      if(h.carry.length){if(j.dst.count<j.dst.max){h.carry.pop();j.dst.count++;pileVis(j.dst);}else{h.carry.length=0;}if(!h.carry.length)h.job=null;}
      else{if(j.inf){h.carry=[1,1,1];}else if(j.src.count>=1){const n=Math.min(3,j.src.count);j.src.count-=n;h.carry=new Array(n).fill(1);pileVis(j.src);}else h.job=null;}}}
    h.per.g.position.set(h.x,height(h.x,h.z),h.z);h.per.g.rotation.y=h.face;animPerson(h.per,dt,sp,h.carry.length?'carry':sp?'walk':'idle');}}
/* ---------- pilgrims ---------- */
const PROBES=[0xe8dcc4,0xd9cdb3,0x8a6a4a,0xb59a74,0x6b4a7a,0x2f5d8a,0x8a3a2c,0x4d6b3a];
function getPilgrim(){let p=PIL.find(q=>!q.on);if(!p){if(PIL.length>=PMAX)return null;const per=makePerson({robe:PROBES[PIL.length%PROBES.length],cloth:0xf2e8d5,female:PIL.length%3===1});scene.add(per.g);p={per,on:false};PIL.push(p);}return p;}
let spawnT=0;
function spawnPilgrim(){const open=openStands();let best=null;for(const k of open){const s=STD[k];if(s.q.length>=6)continue;if(!best||s.q.length<STD[best].q.length||(s.q.length===STD[best].q.length&&Math.random()<.5))best=k;}
  if(!best)return;const p=getPilgrim();if(!p)return;const g=GATES[(Math.random()*GATES.length)|0];
  Object.assign(p,{on:true,st:'in',stand:STD[best],x:g.x,z:g.z,face:0,wait:0,pat:(30-Math.min(10,D.meta.season))*(MU('shade')?1.5:1),stuck:0,gate:g});
  p.per.g.visible=true;p.per.g.position.set(p.x,height(p.x,p.z),p.z);STD[best].q.push(p);}
function slotOf(p){const s=p.stand,i=s.q.indexOf(p);const z=s.z;return {x:z.x+s.out.x*(3.6+1.15*i),z:z.z+s.out.z*(3.6+1.15*i)};}
function walk(p,tx,tz,dt,v){const dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz);if(d<.18)return 0;const s=Math.min(d,v*dt);const ox=p.x,oz=p.z;p.x+=dx/d*s;p.z+=dz/d*s;p.face=Math.atan2(dx,dz);collideEnt(p,.3,0);
  if(Math.hypot(p.x-ox,p.z-oz)<s*.25){p.stuck+=dt;if(p.stuck>1.2){p.x=ox+dx/d*Math.min(d,1.2);p.z=oz+dz/d*Math.min(d,1.2);p.stuck=0;}}else p.stuck=0;return v;}
function leaveQueue(p){const q=p.stand.q,i=q.indexOf(p);if(i>=0)q.splice(i,1);}
function serve(s){const p=s.q[0];s.z.count--;pileVis(s.z);s.cash+=s.price;D.meta.ss++;D.meta.served++;coinVis(s);leaveQueue(p);
  p.st='tw';p.ang=Math.atan2(p.z-KC.z,p.x-KC.x);p.left=Math.PI*2;
  const c=s.g.position;if(Math.random()<.35)ftext([L2('Allah razı olsun!','God bless you!'),L2('Bereketli olsun!','May it be blessed!'),L2('Eksik olmayın!','Thank you kindly!')][(Math.random()*3)|0],c.x,2.6,c.z,'#ffe3a6');
  tone(HIC[5],.08,.03);if(D.meta.ss>=seasonTarget(D.meta.season)&&!D.meta.between)seasonDone();}
function coinVis(s){const n=Math.min(14,Math.ceil(s.cash/3));const g=s.coins;while(g.children.length>n)g.remove(g.children[g.children.length-1]);
  while(g.children.length<n){const i=g.children.length;const m=new THREE.Mesh(coinGeo,coinMat);m.position.set((i%2)*.18,.03+Math.floor(i/2)*.045,0);g.add(m);}}
function stepPilgrims(dt,sim){for(const p of PIL){if(!p.on)continue;let sp=0;const per=p.per;
    if(sim){if(p.st==='in'||p.st==='q'){p.wait+=dt;if(p.wait>p.pat){leaveQueue(p);p.st='out';D.meta.ms++;D.meta.missed++;ftext('😞',p.x,2.4,p.z);}}
      if(p.st==='in'||p.st==='q'){const t=slotOf(p);sp=walk(p,t.x,t.z,dt,2.3);p.st=sp?'in':'q';}
      else if(p.st==='tw'){const tx=KC.x+Math.cos(p.ang)*RING,tz=KC.z+Math.sin(p.ang)*RING;sp=walk(p,tx,tz,dt,2.3);if(!sp)p.st='lap';}
      else if(p.st==='lap'){const w=2.1/RING*dt;p.ang-=w;p.left-=w;p.x=KC.x+Math.cos(p.ang)*RING;p.z=KC.z+Math.sin(p.ang)*RING;p.face=Math.atan2(Math.sin(p.ang),-Math.cos(p.ang));sp=2.1;
        if(p.left<=0){p.st='out';let g=GATES[0],gd=1e9;for(const q of GATES){const d=Math.hypot(q.x-p.x,q.z-p.z);if(d<gd){gd=d;g=q;}}p.gate=g;}}
      else if(p.st==='out'){sp=walk(p,p.gate.x,p.gate.z,dt,2.5);if(!sp){p.on=false;per.g.visible=false;continue;}}}
    per.g.position.set(p.x,height(p.x,p.z),p.z);per.g.rotation.y=p.face;
    const mood=p.st==='q'&&p.wait>p.pat*.6?'angry':p.st==='q'?'idle':'walk';animPerson(per,dt,sp,sp?'walk':mood);}
  for(const k in STD){const s=STD[k];if(!standOpen(k)||!s.q.length)continue;const p=s.q[0];
    if(sim&&p.st==='q'&&s.z.count>0){s.t+=dt;if(s.t>.9){s.t=0;serve(s);}}else s.t=0;}}
/* ---------- seasons ---------- */
function seasonDone(){D.meta.between=1;const s=D.meta.season,bonus=20*s;award(bonus);ssave();
  setTimeout(()=>{if(R.ch!==MCH)return;state='ui';sfx.build();hap('heavy');
    sheet(`<span class="ic">🌙</span><p class="eb">${CH[MCH].name}</p><h2>${L2('Hac mevsimi '+s+' tamamlandı!','Pilgrimage season '+s+' complete!')}</h2>
      <div class="kstats"><div>${D.meta.ss}<small>${L2('İkram','Served')}</small></div><div>${D.meta.ms}<small>${L2('Bekleyip giden','Left waiting')}</small></div><div>🪙 +${bonus}<small>${L2('Mevsim hediyesi','Season gift')}</small></div></div>
      <div class="learn"><b>📜 ${L2('Bunu biliyor muydun?','Did you know?')}</b>${SEASON_FACTS[(s-1)%SEASON_FACTS.length]}</div>
      <p style="text-align:center;font:700 14px var(--f-ui);margin:10px 0 0">${L2('Sonraki mevsim: ','Next season: ')}${seasonTarget(s+1)} ${L2('hacı','pilgrims')}</p>
      <div class="kbtns"><button class="kbtn alt" id="km-leave" data-back>${L2('Bölümler','Chapters')}</button><button class="kbtn" id="km-next">${L2('Sonraki mevsim ›','Next season ›')}</button></div>`,c=>{
      c.querySelector('#km-next').onclick=()=>{nextSeason();closeSheet();state='play';};c.querySelector('#km-leave').onclick=()=>{nextSeason();cleanupChapter();showMap();};});},700);}
function nextSeason(){if(!D.meta.between)return;D.meta.between=0;D.meta.season++;D.meta.ss=0;D.meta.ms=0;ssave();}
const SEASON_FACTS=[
  L2('Hacılara su vermeye “sikâye”, onları doyurmaya “rifâde” denirdi. Kusay b. Kilâb bu görevleri düzenledi.','Giving pilgrims water was called “siqaya” and feeding them “rifada”. Qusayy ibn Kilab organised both offices.'),
  L2('Kusay, rifâde için Kureyşlilerden her hac mevsiminde katkı toplanmasını istemişti.','Qusayy asked the Quraysh to contribute every season so the pilgrims could be fed.'),
  L2('Hâşim adı, hacılar için ekmeği ufalayıp et suyuyla tirit yapmasından gelir.','The name Hashim comes from crumbling bread into broth to make tharid for the pilgrims.'),
  L2('Zemzem suyu hacılara deri kaplarla ve havuzlarla sunulurdu.','Zamzam water was offered to pilgrims from leather skins and basins.'),
  L2('Mekke\'de tarım yoktu; hurma, un ve et kervanlarla gelirdi.','Mecca had no farmland; dates, flour and meat came by caravan.')];
/* ---------- away earnings: only hired helpers work while you are gone ---------- */
function awayEarnings(){const m=D.meta,now=Date.now();const hs=['saka','hurmaci','cirak'].filter(MU);
  if(!hs.length||!m.lastT||now<=m.lastT){m.lastT=now;return null;}
  const secs=Math.min(7200,(now-m.lastT)/1000);m.lastT=now;if(secs<120)return null;
  const per=Math.floor(secs/20);const price={saka:2,hurmaci:4,cirak:6};let n=0,c=0;for(const h of hs){n+=per;c+=per*price[h];}
  c=Math.round(c*.5);D.coins+=c;m.earned+=c;m.served+=n;ssave();return {n,c,mins:Math.round(secs/60)};}
/* ---------- entering / leaving ---------- */
function startMeta(){if(!D.stars[NCH]){showMap();return;}if(D.run){D.run=null;}
  auInit();coinIcon();musicStart();cleanupChapter();KM.hidden=true;KT.hidden=true;titleEl.hidden=true;closeSheet();SITE.on=true;started=true;build();buildMeta();makeUpgradeWorkers();
  R={ch:MCH,t:0,done:true,n:0,coins:0,good:0,bank:{},water:0,thirstT:0,thirsty:false,maxAnger:0,course:0,inCourse:0};stack=[];stackVis();syncPads();
  for(const z of ZONES){if(!z.chs.includes(MCH)){continue;}z.t=0;}
  const st=D.meta.stock;STD.w.z.count=st.w;STD.d.z.count=st.d;STD.b.z.count=st.b;Z.mdates.count=st.dates||12;Z.mflour.count=st.flour||9;Z.oven.count=st.oven;Z.ovenOut.count=st.ovenOut;
  for(const k in STD){STD[k].cash=D.meta.cash[k]||0;STD[k].q.length=0;coinVis(STD[k]);}
  applyMeta();for(const z of ZONES)if(z.chs.includes(MCH)&&z.pileG)pileVis(z);
  kaaba({old:false,rubble:false,green:false,scaffold:false,wallH:8.7,stone:true,roof:true,door:true,hijr:true});setTime('asr');RAIN.target=0;flood.visible=false;resetOld();
  metaG.visible=true;baker.g.visible=true;HELP.forEach(h=>h.per.g.visible=true);
  hooks.step=metaStep;hooks.beat=metaBeat;hooks.cap=metaCap;placeHero(16.5,6.5);cam.yaw=Math.atan2(P.x,P.z);syncMPads();
  hud.style.opacity=1;dpadApply();const aw=awayEarnings();state='play';R.done=false;
  if(D.meta.between){D.meta.between=1;nextSeason();}
  if(aw){state='ui';sheet(`<span class="ic">🫗</span><p class="eb">${CH[MCH].name}</p><h2>${L2('Hoş geldin!','Welcome back!')}</h2><p>${L2(`Sen yokken (${aw.mins} dk) yardımcıların ${aw.n} ikram yaptı.`,`While you were away (${aw.mins} min) your helpers served ${aw.n} times.`)}</p><div class="kstats"><div>🪙 +${aw.c}<small>${L2('Bereket','Bereket')}</small></div></div><div class="kbtns"><button class="kbtn" id="kw-ok" data-back>${L2('Devam','Continue')}</button></div>`,c=>{c.querySelector('#kw-ok').onclick=()=>{closeSheet();state='play';};});}
  else toast(CH[MCH].task,5);}
function leaveMeta(){if(!metaBuilt)return;saveMeta();for(const p of PIL){p.on=false;p.per.g.visible=false;}for(const k in STD)STD[k].q.length=0;
  metaG.visible=false;baker.g.visible=false;HELP.forEach(h=>{h.per.g.visible=false;h.carry.length=0;h.job=null;});Z.mdates.camel.g.visible=false;for(const p of MPADS.splice(0))scene.remove(p.mesh);}
function saveMeta(){if(!metaBuilt)return;const st=D.meta.stock;st.w=STD.w.z.count;st.d=STD.d.z.count;st.b=STD.b.z.count;st.dates=Z.mdates.count;st.flour=Z.mflour.count;st.oven=Z.oven.count;st.ovenOut=Z.ovenOut.count;
  for(const k in STD)D.meta.cash[k]=STD[k].cash;D.meta.lastT=Date.now();}
{const cc0=cleanupChapter;cleanupChapter=function(){if(R.ch===MCH)leaveMeta();cc0();};}
{const sc0=startChapter;startChapter=function(n){if(n===MCH){startMeta();return;}sc0(n);};}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&R.ch===MCH&&SITE.on){saveMeta();ssave();}});
addEventListener('pagehide',()=>{if(R.ch===MCH&&SITE.on){saveMeta();ssave();}});
/* ---------- per frame ---------- */
let metaSaveT=0;const refill={d:0,f:0};
function metaStep(dt,playing){const sim=dt>0;cutter.forEach(c=>c.g.visible=false);if(carp)carp.g.visible=false;
  const dOpen=standOpen('d'),bOpen=standOpen('b');Z.mdates.camel.g.visible=dOpen;
  if(sim){if(dOpen){refill.d+=dt;if(refill.d>5){refill.d=0;if(Z.mdates.count<Z.mdates.max){Z.mdates.count=Math.min(Z.mdates.max,Z.mdates.count+4);pileVis(Z.mdates);}}}
    if(bOpen){refill.f+=dt;if(refill.f>5.5){refill.f=0;if(Z.mflour.count<Z.mflour.max){Z.mflour.count=Math.min(Z.mflour.max,Z.mflour.count+3);pileVis(Z.mflour);}}
      baker.t+=dt;if(baker.t>2.4){baker.t=0;if(Z.oven.count>0&&Z.ovenOut.count<Z.ovenOut.max){Z.oven.count--;Z.ovenOut.count++;pileVis(Z.oven);pileVis(Z.ovenOut);puff(Z.oven.dome.position.x,1.6,Z.oven.dome.position.z,3);}}}
    if(playing&&!D.meta.between){spawnT-=dt;if(spawnT<=0){spawnT=Math.max(1.5,5.2-.35*(D.meta.season-1))*(.75+Math.random()*.5);spawnPilgrim();}}
    metaSaveT+=dt;if(metaSaveT>3){metaSaveT=0;saveMeta();ssave();}}
  animPerson(baker,dt||.016,0,bOpen&&Z.oven.count>0?'talk':'idle');baker.g.visible=bOpen;
  stepPilgrims(dt,sim);stepHelpers(dt,sim);
  for(const k in STD){const s=STD[k];s.g.visible=standOpen(k);s.coins.visible=s.g.visible;}}
function metaBeat(top,cap,take,give){
  if(inZ(Z.well)&&stack.length<cap&&(!stack.length||stack[0]==='water')){stack.push('water');sfx.pour();}
  if(inZ(Z.mdates))take(Z.mdates,'dates');if(inZ(Z.mflour))take(Z.mflour,'flour');if(inZ(Z.oven))give(Z.oven,'flour');if(inZ(Z.ovenOut))take(Z.ovenOut,'bread');
  for(const k of openStands()){const s=STD[k];if(!inZ(s.z))continue;give(s.z,s.item);
    if(s.cash>0){const c=s.cash;s.cash=0;award(c);coinVis(s);coinsFly(Math.min(6,1+Math.floor(c/6)),s.coins.position.x,s.coins.position.y,s.coins.position.z);ftext('+'+c+' 🪙',s.z.x,2.4,s.z.z,'#ffd75e');sfx.good();hap();}}}
/* ---------- arrow + HUD ---------- */
{const st0=siteTarget;siteTarget=function(){if(R.ch!==MCH)return st0();if(state!=='play'||R.done)return null;const top=stack[stack.length-1];
  if(top==='flour')return ZT(Z.oven);if(top&&ITEM_STAND[top]&&standOpen(ITEM_STAND[top]))return ZT(STD[ITEM_STAND[top]].z);
  let best=null,bs=-1;for(const k of openStands()){const s=STD[k];const u=(s.q.length+1)*(s.z.count<2?3:1)/(1+s.z.count)+(s.cash>=24?2:0);if(u>bs){bs=u;best=k;}}
  if(!best)return ZT(Z.well);const s=STD[best];if(s.cash>=24&&s.z.count>=2)return ZT(s.z);
  if(best==='w')return ZT(Z.well);if(best==='d')return ZT(Z.mdates);return Z.ovenOut.count>0?ZT(Z.ovenOut):ZT(Z.mflour);};}
{const uh0=updateHud;updateHud=function(dt){if(!(SITE.on&&R.ch===MCH)){uh0(dt);return;}const m=D.meta,tg=seasonTarget(m.season);
  setT(qCh,'🫖 '+CH[MCH].name+' · '+L2('Mevsim ','Season ')+m.season);setT(qGoal,L2('İkram: ','Served: ')+m.ss+'/'+tg);setW(hEl.bar,Math.round(Math.min(1,m.ss/tg)*100)+'%');
  let warn='';for(const k of openStands()){const s=STD[k];if(s.q.length>=3&&s.z.count===0){warn=s.icon+' '+L2(s.q.length+' hacı bekliyor: ','')+s.label+L2('',': '+s.q.length+' pilgrims waiting');break;}}
  setT(qSub,warn||actionLine());const cap=metaCap(),top=stack[stack.length-1];setT(hEl.st,(top?NAMES_T[top]+' ':'')+stack.length+'/'+cap);setT(hEl.co,String(D.coins));setT(hEl.gd,String(D.good));setT(hEl.kb,'100%');
  if(!carryEl.hidden)carryEl.hidden=true;if(toastT>0){toastT-=dt;if(toastT<=0)toastEl.classList.remove('on');}};}
/* ---------- the map shows the layer: a teaser before chapter 7, the door after it ---------- */
function metaIntro(){sheet(`<span class="ic">🫖</span><p class="eb">${L2('Hikâyeden sonra','After the story')}</p><h2>${CH[MCH].name}</h2>
  <p>${L2('Kâbe\'nin hizmetleri arasında hacılara su vermek (<b>sikâye</b>) ve onları doyurmak (<b>rifâde</b>) vardı. Kusay b. Kilâb bu görevleri düzenledi; Kureyşliler her hac mevsiminde bunun için katkı toplardı.','Among the Kaaba\'s duties were giving pilgrims water (<b>siqaya</b>) and feeding them (<b>rifada</b>). Qusayy ibn Kilab organised these offices, and the Quraysh contributed every pilgrimage season.')}</p>
  <div class="task"><span>🎮</span><span>${L2('Oyunda: stantlar, sıralar, yardımcılar ve sayılar oyun mekaniğidir. Hacılar Kâbe\'yi bir tur tavaf eder; gerçekte tavaf yedi şavttır.','In the game: stands, queues, helpers and numbers are game mechanics. Pilgrims walk one circuit around the Kaaba; a real tawaf is seven.')}</span></div>
  <div class="kbtns"><button class="kbtn alt" id="mi-x" data-back>${L2('Geri','Back')}</button><button class="kbtn" id="mi-go">${L2('Başla','Start')}</button></div>`,c=>{
  c.querySelector('#mi-x').onclick=()=>{closeSheet();if(KM.hidden&&KT.hidden)showMap();};c.querySelector('#mi-go').onclick=()=>{D.meta.intro=1;ssave();closeSheet();startMeta();};});}
{const sm0=showMap;showMap=function(){sm0();const path=$('#km-path');if(!path)return;const lock=!D.stars[NCH];path.appendChild(el('<div class="kdots"></div>'));
  const b=el(`<button class="knode${lock?' lock':''}" id="km-meta" style="transform:translateX(${Math.sin(8*1.3)*70}px)"><span class="c">${lock?'🔒':'🫖'}</span><span class="n">∞</span><span class="t">${CH[MCH].name}</span><span class="s">${lock?L2('7. bölümden sonra','After chapter 7'):L2('Mevsim ','Season ')+D.meta.season}</span></button>`);
  b.onclick=()=>{sfx.ui&&sfx.ui();if(lock){toast(L2('Kâbe\'yi tamamlayınca açılır: hacılara su, hurma ve ekmek ikram edeceksin.','Opens when the Kaaba is complete: you will serve pilgrims water, dates and bread.'),4);return;}if(!D.meta.intro)metaIntro();else startMeta();};path.appendChild(b);
  if(!lock){path.querySelectorAll('.knode.cur').forEach(n=>n.classList.remove('cur'));b.classList.add('cur');setTimeout(()=>b.scrollIntoView({block:'center'}),40);}};}
/* the title's PLAY goes to the map when the story is done (the map offers both) */
Object.assign(window.__site,{startMeta,leaveMeta,STD,MUPG,PIL:()=>PIL.filter(p=>p.on).map(p=>({st:p.st,stand:p.stand.k,x:p.x,z:p.z})),HELP:()=>HELP.map(h=>({id:h.id,x:h.x,z:h.z,carry:h.carry.length})),
  meta:()=>D.meta,seasonTarget,awayEarnings,MPADS:()=>MPADS.map(p=>p.u.id),metaCap,saveMeta,startChapter,showMap,showStory,
  spawn:()=>spawnPilgrim(),setStock:(k,n)=>{STD[k].z.count=n;pileVis(STD[k].z);}});
/* ---------- one late check after everything loaded: a context-loss reload resumes play ---------- */
try{if(sessionStorage.getItem('kabe-resume')){sessionStorage.removeItem('kabe-resume');if(D.run&&MODE!=='p2'&&!KT.hidden)setTimeout(()=>showStory(D.run.ch),200);}}catch(_){}
})();
