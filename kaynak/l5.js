/* ===================== extras: music, riding, course cinematics, horse, bread, the wise elder ===================== */
/* ---------- generative music in a Hicaz colour: drone, frame drum (düm–tek), oud-like plucks ---------- */
const MUS={iv:null,next:0,step:0,deg:4,dg:null};
function musicStart(){if(MUS.iv||!AU.ctx)return;const c=AU.ctx;MUS.next=c.currentTime+.6;
  MUS.dg=c.createGain();MUS.dg.gain.value=0;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=600;MUS.dg.connect(lp).connect(AU.master);
  for(const [f,g] of [[73.42,.5],[110,.22],[146.83,.12]]){const o=c.createOscillator();o.type='triangle';o.frequency.value=f;const gg=c.createGain();gg.gain.value=g;o.connect(gg).connect(MUS.dg);o.start();}
  MUS.iv=setInterval(musTick,120);}
function drum(t,k){if(k==='dum'){nz(.3,85,1.2,.15,'lowpass',null,t);tone(68,.22,.07,t);}else nz(.07,2200,2.2,.045,'bandpass',null,t);}
function musTick(){const c=AU.ctx;if(!c||!MUS.dg)return;
  const mood=state==='title'||state==='menu'?'title':MODE==='p2'?((G.m||0)===3?'night':(G.m||0)>=5?'fest':'day'):G.ch<2?'rain':G.ch===3?'night':G.ch===5?'fest':'day';
  MUS.dg.gain.setTargetAtTime(AU.on?(mood==='night'?.06:mood==='rain'?.035:.028):0,c.currentTime,1.5);
  const beat=mood==='fest'?.3:mood==='day'?.4:.62;
  while(MUS.next<c.currentTime+.35){const t=Math.max(0,MUS.next-c.currentTime),s=MUS.step++;
    if(mood==='day'||mood==='fest'){const m=s%8;if(m===0||m===5)drum(t,'dum');else if(m===3||m===7||(mood==='fest'&&m%2===1))drum(t,'tek');}
    else if(mood==='night'&&s%16===0)drum(t,'dum');
    const p=mood==='rain'?.2:mood==='night'?.14:mood==='title'?.3:mood==='fest'?.55:.4;
    if(s%32===30){pluck(HIC[7],t,.05);pluck(HIC[0],t+.02,.04);MUS.deg=7;}
    else if(s%2===0&&Math.random()<p){MUS.deg=Math.max(0,Math.min(11,MUS.deg+[-2,-1,-1,1,1,2,0][Math.random()*7|0]));pluck(HIC[MUS.deg],t,mood==='night'?.032:.042);
      if(mood!=='rain'&&Math.random()<.25)pluck(HIC[MUS.deg],t+beat*.5,.025);}
    MUS.next+=beat;}}

/* ---------- a short shot every time a course goes up ---------- */
const RISE_SUB={stone:"Ocaktan gelen taşlar yerine oturuyor.",wood:"Gemiden gelen kalın tahtalar duvarın üstüne yatırılıyor.",roof:"Altı direk dikildi; çatı geminin tahtalarıyla örtülüyor.",door:"Kapı, yerden yükseltilmiş eşiğine takılıyor."};
function riseCine(lv){if(state!=='play'||reduce)return;const a0=Math.atan2(camera.position.x,camera.position.z),h0=KP.wallH,h1=lv.h||h0;
  cine([{d:2.9,from:{p:new V3(Math.sin(a0)*21,h0+2.6,Math.cos(a0)*21),l:new V3(0,h0*.6,0)},to:{p:new V3(Math.sin(a0+.9)*18,h1+3.6,Math.cos(a0+.9)*18),l:new V3(0,h1*.6+.8,0)},
    sub:lv.roof?RISE_SUB.roof:lv.door?RISE_SUB.door:RISE_SUB[lv.t]}],()=>{cam.f=null;});}
function statsLine(){const m=Math.max(1,Math.round((G.time||0)/60));return "İyilik: "+G.good+" · Defter: "+Object.keys(G.found).length+"/"+CODEX.length+" · Süre: "+m+" dk.";}

/* ---------- riding the camel ---------- */
function RC(){if(MODE==='p2')return G.flags&&G.flags.gateOpen?CAMELS2[0]:null;return G.camel&&myCamel.g.visible?myCamel:null;}
function mount(){const c=RC();if(!c)return;P.ride=true;c.ridden=true;c.follow=null;c.pen=null;P.carry=null;setHeld(null);sfx.camel();cam.dist=Math.max(cam.dist,8);toast('Devedesin: daha hızlısın. Zıplayamaz, tırmanamazsın.',3.5);}
function dismount(){const c=RC()||myCamel;P.ride=false;c.ridden=false;const s=freeSpot(P.x+Math.cos(P.face)*1.6,P.z-Math.sin(P.face)*1.6,.5);c.x=P.x;c.z=P.z;P.x=s.x;P.z=s.z;P.y=height(P.x,P.z);c.follow=P;cam.dist=6.4;sfx.camel();}

/* ---------- the horse that ran away (D10) ---------- */
function makeHorse(){const g=new THREE.Group(),b=new THREE.Group();g.add(b);const coat=Lm(0x6b4226),mane=Lm(0x231912);
  const body=new THREE.Mesh(new THREE.SphereGeometry(.5,16,12),coat);body.scale.set(.75,.75,1.55);body.position.y=1.3;b.add(body);
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(.16,.24,.9,10),coat);neck.position.set(0,1.7,.78);neck.rotation.x=.6;b.add(neck);
  const mn=new THREE.Mesh(new THREE.BoxGeometry(.06,.75,.18),mane);mn.position.set(0,1.82,.68);mn.rotation.x=.6;b.add(mn);
  const head=new THREE.Group();head.position.set(0,2.08,1.08);b.add(head);const hm=new THREE.Mesh(new THREE.BoxGeometry(.24,.26,.6),coat);hm.position.z=.15;hm.rotation.x=.5;head.add(hm);
  for(const ex of [-.13,.13]){const e=new THREE.Mesh(new THREE.SphereGeometry(.03,6,5),eyeM);e.position.set(ex,.06,.05);head.add(e);const ear=new THREE.Mesh(new THREE.ConeGeometry(.045,.16,5),coat);ear.position.set(ex*.7,.2,-.08);head.add(ear);}
  const tail=new THREE.Mesh(new THREE.ConeGeometry(.08,.8,6),mane);tail.position.set(0,1.2,-.85);tail.rotation.x=-2.6;b.add(tail);
  const legs=[];const lg=new THREE.CylinderGeometry(.06,.05,1.05,7);lg.translate(0,-.52,0);
  for(const [x,z] of [[.2,.55],[-.2,.55],[.2,-.55],[-.2,-.55]]){const l=new THREE.Group();l.position.set(x,1.05,z);l.add(new THREE.Mesh(lg,coat));const f=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.1,7),mane);f.position.y=-1.03;l.add(f);b.add(l);legs.push(l);}
  g.traverse(m=>{if(m.isMesh)m.castShadow=true;});return {g,b,head,legs,phase:0,kind:'horse',h:2.3};}
const seyis=npc({id:'seyis',label:'Seyis',x:-30,z:190,look:{robe:0x3a3a44,cloth:0xe9dcc0,beard:0x2a221c,band:0x8a3a2c},mark:()=>dmark('at')});
const HORSE_HOME=freeSpot(30,232,1);const horse=animal('horse',HORSE_HOME.x,HORSE_HOME.z);horse.graze=false;horse.st='free';horse.tgt=null;horse.v=0;horse.wait=0;
/* ---------- bread for three tents (D11) ---------- */
const baker=npc({id:'baker',label:'Fırıncı kadın',x:34,z:92,look:{female:true,robe:0x8a3a2c,cloth:0xf2e8d5},mark:()=>dmark('ekmek')});
{const g=new THREE.Group();const ov=new THREE.Mesh(new THREE.CylinderGeometry(.55,.7,.9,14,1,true),mat.clay);ov.position.y=.45;g.add(ov);
  const glow=new THREE.Mesh(new THREE.CircleGeometry(.5,14),new THREE.MeshBasicMaterial({color:0xff9a48}));glow.rotation.x=-Math.PI/2;glow.position.y=.6;g.add(glow);
  const s=freeSpot(baker.x+1.6,baker.z+.6,.6);g.position.set(s.x,height(s.x,s.z),s.z);g.traverse(m=>{if(m.isMesh)m.castShadow=true;});scene.add(g);}
const BREAD_T=OBBS.filter(o=>o.tag==='cadir'&&o!==poorTent).sort((a,b)=>Math.hypot(a.cx-baker.x,a.cz-baker.z)-Math.hypot(b.cx-baker.x,b.cz-baker.z)).slice(0,3).map((o,i)=>{
  const lz=-2.9,f=freeSpot(o.cx+lz*o.s,o.cz+lz*o.c,.5);npc({id:'bt'+i,x:f.x+.8,z:f.z,look:{scale:.62,robe:[0xe8dcc4,0x2f5d8a,0xc58b3a][i]},wander:2});return f;});
const loafM=Lm(0xc98a4a);
/* ---------- the wise elder: a small quiz about what you learned ---------- */
const QUIZ=[
  ['e_hatice',"Hz. Hatice'nin evi hangi sokaktaydı?",["Attârîn (sonra Hacer) sokağında","Mesfele'de, kervan yolunda","Safâ tepesinin üstünde"]],
  ['e_nedve',"Dâru'n-Nedve'yi kim yaptırdı?",["Kusay b. Kilâb","Ebrehe","Hâşim b. Abdümenâf"]],
  ['e_esed',"Kâbe'ye çok yakın olduğu için \"Kâbe'nin bebeği\" denen ev kimindi?",["Esed b. Abdüluzzâ'nın","Hakîm b. Hizâm'ın","Ebû Süfyân'ın"]],
  ['e_ebusufyan',"Ebû Süfyân'ın evi kimin evine bitişikti?",["Hz. Hatice'nin","Humeyd b. Züheyr'in","Dâru'n-Nedve'nin"]],
  ['e_erkam',"Erkam'ın ailesinin evi nerededir?",["Safâ tepesinde","Ma'lât'ta","Kuaykıân'ın eteğinde"]],
  ['e_mevlid',"Efendimiz'in (s.a.v.) doğduğu ev hangi mahalledeydi?",["Hâşim oğullarının mahallesinde","Mahzûm oğullarının mahallesinde","Mesfele'de"]],
  ['e_humeyd',"Kâbe'nin hemen arkasındaki ev kimindi?",["Humeyd b. Züheyr'in","Ebû Süfyân'ın","Esed b. Abdüluzzâ'nın"]],
  ['k_esved',"Hacerü'l-Esved Kâbe'nin hangi köşesindedir?",["Doğu köşesinde","Batı köşesinde","Kuzey köşesinde"]],
  ['k_iraki',"Kâbe'nin kapısı hangi iki köşe arasındaki duvardadır?",["Rükn-i Esved ile Rükn-i Irâkî","Rükn-i Yemânî ile Rükn-i Şâmî","Rükn-i Şâmî ile Rükn-i Irâkî"]],
  ['y_mesa',"Safâ ile Merve arasındaki yola ne denir?",["Mes'â","Hicr","Hacûn"]],
  ['o_helal',"Kureyş inşaat için hangi şartı koştu?",["Yalnız helal kazanç girecek","Yalnız Yemen taşı kullanılacak","Yalnız geceleri çalışılacak"]],
  ['o_gemi',"Kâbe'nin kerestesi nereden geldi?",["Cidde kıyısında karaya oturan bir gemiden","Tâif'in ormanlarından","Ebû Kubeys'in ağaçlarından"]],
  ['o_yilan',"Kureyş'in işe başlamasını kolaylaştıran olay hangisiydi?",["Duvardaki yılanı bir kartalın kapması","Zemzem'in taşması","Bir kervanın gelmesi"]],
  ['k_hicr',"Hicr neden binanın dışında kaldı?",["Helal para binanın tamamına yetmedi","Sel o kısmı götürdü","Kapı oraya sığmadı"]]
];
const elderAt=(()=>{const d=doorPt(NAMED.e_nedve);return {x:d.x+2.6,z:d.z+1.2};})();
const elder=npc({id:'elder',label:'Bilge ihtiyar',x:elderAt.x,z:elderAt.z,look:{robe:0xe8dcc4,cloth:0xf2e8d5,beard:0xeeeeee,band:0x1f6f78},mark:()=>quizNext()?'q':''});
function quizNext(){G.quiz=G.quiz||{};return QUIZ.find(q=>G.found[q[0]]&&!G.quiz[q[0]]);}
function quizAsk(){const q=quizNext();if(!q){dialog('Bilge ihtiyar',"Şimdilik sorum yok. Şehri gez, defterine yeni şeyler yaz; sonra yine gel.");return;}
  const opts=q[2].map((t,i)=>({t,fn:()=>{if(i===0){G.quiz[q[0]]=true;queueSaying('ilim');G.qok=(G.qok||0)+1;G.good++;pop('r-good');sfx.good();
      const wood=G.qok%3===0;if(wood){G.wood++;pop('r-wood');}save();if(wood)tryBuild();
      dialog('Bilge ihtiyar',"Doğru! "+(wood?"Üç doğru oldu; tanıdığım bir marangoz Kâbe'ye senin adına bir tahta bırakacak.":"Şehrini tanıyan, ona iyi bakar."),quizNext()?[{t:'Bir soru daha',main:true,fn:quizAsk},{t:'Şimdilik yeter'}]:[{t:'Tamam',main:true}]);}
    else{sfx.ui();dialog('Bilge ihtiyar',"Pek değil. Defterine bir daha bak; sonra yine sorarım.",[{t:'Tamam',main:true}]);}}}));
  for(let k=opts.length-1;k>0;k--){const j=(Math.random()*(k+1))|0;[opts[k],opts[j]]=[opts[j],opts[k]];}
  dialog('Bilge ihtiyar',q[1],opts);}

DEEDS.at={t:'Kaçan at',giver:seyis,ch:2};DEEDS.ekmek={t:'Üç çadıra ekmek',giver:baker,ch:2};

/* ---------- hooks into the core ---------- */
const baseFindAct=findAct;
findAct=function(){
  if(state!=='play'||P.mantle||P.busy>0)return null;
  if(P.ride){const a=baseFindAct();if(a&&(a.label.startsWith('Konuş')||a.label.startsWith('Deveyi boşalt')))return a;return {label:'Deveden in',fn:dismount};}
  if(dst('at').st==='active'&&horse.st==='calm'&&nearP(horse.x,horse.z,2.2))return {label:'Atı yuları tut',fn:()=>{horse.st='led';horse.follow=P;horse.dist=2.6;sfx.ui();toast('At peşinden geliyor. Seyise götür.');}};
  if(dst('ekmek').st==='active'&&(G.bread||0)>0)for(let i=0;i<3;i++){const t=BREAD_T[i];if(!(G.breadT||[]).includes(i)&&nearP(t.x,t.z,3))return {label:'Ekmek bırak',fn:()=>{(G.breadT=G.breadT||[]).push(i);G.bread--;sfx.pick();sparkle(t.x,1.2,t.z,12);
    if(G.breadT.length>=3){setD('ekmek','done');talk([["Çadırdaki anne","Sıcacık ekmek! Fırıncı kadına selam söyle."],["Fırıncı kadın (uzaktan seslenir)","Üç çadır da doydu mu? Eşim gemi kerestesinin hamallarından; iki tahta senin adına Kâbe'ye."]],()=>reward(2,2,'üç çadırın duası'));}
    else toast('Ekmek '+G.breadT.length+' / 3');save();}};}
  const a=baseFindAct();
  const rc=RC();if((!a||a.weak)&&rc&&!rc.ridden&&!P.carry&&!P.jar&&nearP(rc.x,rc.z,2.8))return {label:'Deveye bin',fn:mount};
  return a;};
const baseTalk=onTalk;
onTalk=function(n){
  if(n.id==='elder'){if(!G.flags.elderMet){G.flags.elderMet=true;talk([["Bilge ihtiyar","Gel evlat. Bu şehirde kim nerede oturur, hangi taş nereden gelir, ben bilirim. Sen de öğreniyor musun?"],["Bilge ihtiyar","Defterine yazdıklarından sorarım. Bildikçe iyilik bulursun."]],quizAsk);}else quizAsk();return;}
  if(n.id==='seyis'){const s=dst('at').st;
    if(s==='open')talk([["Seyis","Gök gürleyince atım ürktü, Mesfele'nin aşağısına kaçtı. Koşarak yaklaşırsan yine kaçar."]],()=>dialog('Seyis',"Yavaşça yaklaşıp yularını tutabilir misin?",[{t:'Yavaş yavaş giderim.',main:true,fn:()=>{setD('at','active');G.track='at';toast('Ata yürüyerek yaklaş. Koşarsan ürker.',4);}},{t:'Sonra.'}]));
    else if(s==='active'&&horse.st==='led'&&Math.hypot(horse.x-seyis.x,horse.z-seyis.z)<8){horse.follow=null;horse.st='home';horse.x=seyis.x+2.4;horse.z=seyis.z+1;setD('at','done');
      talk([["Seyis","Aferin! Sabrın atı bile yatıştırdı."],["Seyis","Kervandan alacağım iki tahtayı Kâbe'ye senin adına bırakırım."]],()=>reward(2,1,'seyisin teşekkürü'));}
    else if(s==='active')dialog('Seyis',"Atım güneyde, Mesfele'nin aşağısında. Koşma, yürü.");
    else dialog('Seyis',"Atım sakin artık. Sağ ol.");return;}
  if(n.id==='baker'){const s=dst('ekmek').st;
    if(s==='open')talk([["Fırıncı kadın","Tandırdan yeni çıktı. Selden beri çadırda kalan üç aile var; ekmeklerini götürür müsün?"]],()=>dialog('Fırıncı kadın',"Üç somun, üç çadır.",[{t:'Götürürüm.',main:true,fn:()=>{setD('ekmek','active');G.track='ekmek';G.bread=3;G.breadT=[];sfx.pick();toast('Üç somunu üç çadıra bırak.');}},{t:'Sonra.'}]));
    else if(s==='active')dialog('Fırıncı kadın',"Somunlar: "+(G.bread||0)+" kaldı. Çadırlar vadinin kenarında.");
    else dialog('Fırıncı kadın',"Ekmeğin bereketi paylaşınca artar.");return;}
  baseTalk(n);};
const baseSub=deedSub;deedSub=function(id){if(id==='at')return horse.st==='led'?'Atı seyise götür':'Ata yürüyerek yaklaş';if(id==='ekmek')return 'Ekmek '+((G.breadT||[]).length)+'/3';return baseSub(id);};
const baseTgt=deedTarget;deedTarget=function(id){if(id==='at')return horse.st==='led'?seyis:horse;if(id==='ekmek'){const i=[0,1,2].find(i=>!(G.breadT||[]).includes(i));return i!=null?BREAD_T[i]:baker;}return baseTgt(id);};
const baseSync=syncWorld;syncWorld=function(){baseSync();
  if(dst('at').st==='done'){horse.st='home';horse.follow=null;horse.x=seyis.x+2.4;horse.z=seyis.z+1;}else if(dst('at').st==='active'&&horse.st==='led'){horse.st='calm';horse.follow=null;}};
let sobT=1;
function sob(vol){const c=AU.ctx;if(!c||!AU.on)return;const t0=c.currentTime;
  for(let i=0;i<3;i++){const t=t0+i*.22;nz(.13,1100+Math.random()*250,2.2,.05*vol,'bandpass',700,i*.22);}
  const o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter(),l=c.createOscillator(),lg=c.createGain();o.type='triangle';o.frequency.setValueAtTime(560,t0+.72);o.frequency.exponentialRampToValueAtTime(400,t0+1.5);
  l.frequency.value=7;lg.gain.value=18;l.connect(lg).connect(o.frequency);f.type='lowpass';f.frequency.value=1500;
  g.gain.setValueAtTime(.0001,t0+.72);g.gain.exponentialRampToValueAtTime(.05*vol,t0+.82);g.gain.exponentialRampToValueAtTime(.0001,t0+1.55);
  o.connect(f).connect(g).connect(AU.master);o.start(t0+.7);l.start(t0+.7);o.stop(t0+1.6);l.stop(t0+1.6);}
function giggle(){[0,2,4,2,5].forEach((n,i)=>tone(HIC[n+6]*1.5,.12,.035,i*.09,'triangle'));}
function tears(n){if(reduce)return;const hx=n.x,hy=n.y+1.26*(n.scale||1),hz=n.z;
  for(const s of [-1,1]){const p=FXW.parts[FXW.i=(FXW.i+1)%FXW.parts.length];const sx=Math.cos(n.face)*.06*s,sz=-Math.sin(n.face)*.06*s;
    p.x=hx+sx+Math.sin(n.face)*.1;p.y=hy;p.z=hz+sz+Math.cos(n.face)*.1;p.vx=sx*3;p.vz=sz*3;p.vy=.3;p.life=.55;}}
function extraStep(dt){
  if(child.mode==='cry'&&dst('keci').st!=='done'&&started&&state!=='title'){const d=Math.hypot(P.x-child.x,P.z-child.z);
    if(d<11){sobT-=dt;if(Math.random()<dt*2.2)tears(child);if(sobT<=0){sobT=2.6+Math.random()*1.8;sob(Math.max(.15,1-d/11));}}}
  if(dst('keci').st==='done'&&!G.flags.giggled&&child.mode==='cheer'){G.flags.giggled=true;giggle();}
  if(dst('keci').st==='done'&&child.label!=='Çocuk'){child.label='Çocuk';if(child.mode==='cry')child.mode='idle';}
  if(horse.st==='free'||horse.st==='calm'){const d=Math.hypot(P.x-horse.x,P.z-horse.z);let sp=0;
    if(dst('at').st==='active'&&d<8&&(P.run||P.speed>3.7||P.ride)){const a=Math.atan2(horse.x-P.x,horse.z-P.z)+(Math.random()-.5)*.8;horse.tgt=freeSpot(horse.x+Math.sin(a)*14,horse.z+Math.cos(a)*14,1);horse.v=7;horse.st='free';if(!horse.neigh){horse.neigh=1;nz(.5,900,3,.12,'bandpass',500);toast('At ürktü! Yürüyerek yaklaş.',2.5);setTimeout(()=>horse.neigh=0,2500);}}
    if(horse.tgt){const t=horse.tgt,dd=Math.hypot(t.x-horse.x,t.z-horse.z);if(dd<.4){horse.tgt=null;horse.wait=2+Math.random()*3;horse.v=0;}else{const v=horse.v||.9;horse.x+=(t.x-horse.x)/dd*v*dt;horse.z+=(t.z-horse.z)/dd*v*dt;horse.face=Math.atan2(t.x-horse.x,t.z-horse.z);sp=v;collideEnt(horse,.6,0);}}
    else if((horse.wait-=dt)<=0){if(Math.hypot(horse.x-HORSE_HOME.x,horse.z-HORSE_HOME.z)>30)horse.tgt=freeSpot(HORSE_HOME.x,HORSE_HOME.z,1);else{const a=Math.random()*6.28;horse.tgt=freeSpot(horse.x+Math.cos(a)*4,horse.z+Math.sin(a)*4,1);}horse.v=.9;}
    if(dst('at').st==='active')horse.st=(d<3.2&&!P.run&&P.speed<3.7&&!P.ride)?'calm':horse.st==='calm'&&d>4?'free':horse.st;
    horse.y=height(horse.x,horse.z);horse.g.position.set(horse.x,horse.y,horse.z);horse.g.rotation.y=horse.face;animAnimal(horse,dt*.5,sp);}
}

/* ---------- climbing made easy: a "Tırman" button when a ledge is in reach ---------- */
function climbSpot(){if(heavy()||P.ride||!P.ground||P.jar)return null;let best=null;
  for(const o of SOL){if(!o.climb)continue;const dh=o.top-P.y;if(dh<=STEP||dh>2.5)continue;const dx=P.x-o.cx,dz=P.z-o.cz;if(Math.abs(dx)>o.rad+1.2||Math.abs(dz)>o.rad+1.2)continue;
    const [lx,lz]=toLocal(o,P.x,P.z);const qx=Math.max(-o.hw,Math.min(o.hw,lx)),qz=Math.max(-o.hd,Math.min(o.hd,lz));const ex=lx-qx,ez=lz-qz,d=Math.hypot(ex,ez);if(d>1.0||d<1e-4)continue;
    const ux=ex/d,uz=ez/d;let tlx=qx-ux*.55,tlz=qz-uz*.55;tlx=Math.max(-o.hw+.25,Math.min(o.hw-.25,tlx));tlz=Math.max(-o.hd+.25,Math.min(o.hd-.25,tlz));
    const tx=o.cx+tlx*o.c+tlz*o.s,tz=o.cz-tlx*o.s+tlz*o.c;let ok=true;
    for(const q of SOL){if(q===o)continue;const [qx2,qz2]=toLocal(q,tx,tz);if(Math.abs(qx2)<q.hw+R&&Math.abs(qz2)<q.hd+R&&q.top>o.top+.3){ok=false;break;}}
    if(ok&&(!best||d<best.d))best={tx,tz,ty:o.top,d};}
  return best;}
function climbNow(c){P.mantle={t:0,fx:P.x,fy:P.y,fz:P.z,tx:c.tx,ty:c.ty,tz:c.tz};P.vy=0;P.face=Math.atan2(c.tx-P.x,c.tz-P.z);sfx.climb();}
const findAct2=findAct;
findAct=function(){const a=findAct2();if(a&&!a.weak)return a;if(state!=='play'||P.mantle||P.busy>0)return a;const c=climbSpot();if(c)return {label:'Tırman',fn:()=>climbNow(c)};return a;};

/* ---------- sayings: a hadith or verse for every good deed, in plain words ---------- */
const SAY={
  camur:['h',"Dul ve yoksul için koşmak","Dul kadına ve yoksula yardım için koşturan kişi, Allah yolunda cihad eden gibidir.","Buhârî, Müslim"],
  keci:['h',"Küçüklere şefkat","Küçüklerimize şefkat göstermeyen, büyüklerimize saygı göstermeyen bizden değildir.","Tirmizî, Ebû Dâvûd"],
  su:['h',"Su içirmek","En hayırlı sadaka, su içirmektir.","Ebû Dâvûd, Nesâî"],
  kuzu:['h',"Her canlıya iyilik","Susuz bir köpeğe su veren adamı Allah bağışladı. Her canlıya yapılan iyilikte sevap vardır.","Buhârî, Müslim"],
  agil:['h',"Kardeşinin işini görmek","Kim kardeşinin bir ihtiyacını giderirse, Allah da onun ihtiyacını giderir.","Buhârî, Müslim"],
  koyun:['a',"Sevdiğinden vermek","Sevdiğiniz şeylerden harcamadıkça iyiliğe asla ulaşamazsınız.","Âl-i İmrân 3:92"],
  olcu:['a',"Doğru ölçü","Ölçtüğünüzde tam ölçün, doğru teraziyle tartın. Bu hem daha hayırlı hem de sonuç bakımından daha güzeldir.","İsrâ 17:35"],
  yolcu:['h',"Yol göstermek","Yolunu kaybetmiş birine yol göstermen sadakadır.","Tirmizî"],
  cuval:['h',"Yük taşımak","Birinin bineğine binmesine yardım etmen ya da yükünü kaldırıp bineğine yüklemen sadakadır.","Buhârî, Müslim"],
  at:['h',"Yumuşaklık","Allah her işte yumuşak davranmayı sever.","Buhârî, Müslim"],
  ekmek:['h',"Aç komşu","Komşusu açken tok yatan, gerçek mümin olamaz.","Buhârî, el-Edebü'l-Müfred"],
  baris:['a',"Arayı düzeltmek","Müminler ancak kardeştir. Öyleyse kardeşlerinizin arasını düzeltin.","Hucurât 49:10"],
  helal:['h',"Temiz kazanç","Allah temizdir ve yalnızca temiz olanı kabul eder.","Müslim"],
  ilim:['h',"Öğrenmenin yolu","Kim ilim öğrenmek için bir yola girerse, Allah ona cennetin yolunu kolaylaştırır.","Müslim"],
  fayda:['h',"İnsanlara faydalı olmak","İnsanların en hayırlısı, insanlara en faydalı olanıdır.","Taberânî"]
};
const SAY_H="Bu olaydan yıllar sonra Efendimiz (s.a.v.) şöyle buyuracaktı:",SAY_A="Yıllar sonra inecek Kur'an'da şöyle buyrulur:";
for(const id in SAY){const s=SAY[id];const e={id:'s_'+id,g:'Sözler',t:s[1],b:(s[0]==='h'?SAY_H:SAY_A)+"\n\n“"+s[2]+"”",c:[s[3]],est:'Anlamı, sade dille'};CODEX.push(e);CX[e.id]=e;}
const SQ=[];let sayT=0;
function queueSaying(id){if(!SAY[id]||G.found['s_'+id]||SQ.includes(id))return;SQ.push(id);}
let sayBlock=()=>false;
function stepSayings(dt){if(state==='play'&&!fadeEl.classList.contains('on')&&!rise&&!sayBlock())sayT+=dt;else sayT=0;
  if(SQ.length&&sayT>1.1){const id=SQ.shift();const s=SAY[id];G.found['s_'+id]=true;save();$('#bookdot').hidden=false;sfx.page();
    showCard(s[0]==='h'?'Bir hadis':'Bir âyet',CX['s_'+id],'Devam');sayT=0;}}
const extraStep0=extraStep;extraStep=function(dt){extraStep0(dt);stepSayings(dt);};
