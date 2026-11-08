/* ===================== story, good deeds, building, loop ===================== */
const LEVELS=[{t:'stone',n:3,h:1.6},{t:'wood',n:2,h:3.0},{t:'stone',n:3,h:4.6},{t:'wood',n:2,h:6.0},{t:'stone',n:3,h:7.4},{t:'wood',n:3,h:8.7,roof:true},{t:'wood',n:1,door:true}];
const UNITS=LEVELS.reduce((s,l)=>s+l.n,0);
const CHN=['Bölüm I · Sel','Bölüm I · Sel','Bölüm II · Helal Katkı','Bölüm III · Anlaşmazlık','Bölüm IV · Kâbe Yükseliyor','Son · Mekke Akşamı'];
const TNAME={stone:__t('taş'),wood:__t('kereste')};
function dst(id){return G.deeds[id]||(G.deeds[id]={st:'hidden',n:0});}
function setD(id,st){dst(id).st=st;save();if(st==='done')queueSaying(id);}
function reward(wood,good,why){if(wood){G.wood+=wood;pop('r-wood');}if(good){G.good+=good;pop('r-good');}sfx.good();sparkle(P.x,P.y+1.6,P.z,26);buzz([10,40,10]);
  toast((wood?'+'+wood+' kereste':'')+(wood&&good?' · ':'')+(good?'+'+good+' iyilik':'')+(why?' — '+why:''),3.6);if(wood&&!G.found.o_gemi)setTimeout(()=>discover('o_gemi'),1200);save();tryBuild();}

/* ---------- people of Mekke ---------- */
const usta=npc({id:'usta',label:'Ustabaşı',x:DEPOT.x+2.6,z:DEPOT.z+1.2,look:{robe:0x7a5a3a,cloth:0xe9dcc0,beard:0x3a2e26,band:0x8a3a2c},mark:()=>G.ch>=2&&!G.flags.ustaMet?'q':''});
usta.g.visible=false;
// D1 — mud at the widow's door, next to Hz. Hatice's street
const widowH=houseNear(24,-64,h=>!h.up&&!h.awn)||houseNear(24,-64);const widowDoor=doorPt(widowH);
const widowAt=(()=>{const [x,z]=hWorld(widowH,widowH.dx+(widowH.dx>0?-1:1)*3.2,-widowH.d/2-.9);return {x,z};})();
const widow=npc({id:'widow',label:'Yaşlı teyze',x:widowAt.x,z:widowAt.z,look:{female:true,robe:0x5b4a6a,cloth:0x2f2a33,skin:0xa47652},mark:()=>dmark('camur')});
const MUD=[];{const [ox,oz]=[Math.sin(widowH.th),Math.cos(widowH.th)];
  for(const s of [-1.3,0,1.3]){const [x,z]=hWorld(widowH,widowH.dx+s,-widowH.d/2-1.4);const m=itemMesh('mud');m.scale.set(1.6,1.1,1.6);m.position.set(x,height(x,z)+.08,z);scene.add(m);MUD.push({m,x,z,done:false});}}
// D2 — a goat stuck on a roof, a crying child below
const goatH=houses.filter(h=>h.crate&&!claimed.has(h)&&!h.up&&h.x<0&&h.z>0&&rr(h)>28&&rr(h)<75).sort((a,b)=>rr(a)-rr(b))[0]||houses.find(h=>h.crate&&!claimed.has(h));claimed.add(goatH);
const goatDoor=doorPt(goatH);
const child=npc({id:'child',label:'Ağlayan çocuk',x:goatDoor.x-1.2,z:goatDoor.z,look:{scale:.68,robe:0xc58b3a,cloth:0xf2e8d5},mode:'cry',mark:()=>dmark('keci')});
const goat=animal('goat',goatH.x,goatH.z);goat.x=goatH.x;goat.z=goatH.z;goat.onRoof=goatH.y0+goatH.H;goat.graze=false;goat.home={x:goatH.x,z:goatH.z};
// D3 — thirsty traveller by Safâ
const thirsty=npc({id:'thirsty',label:'Susamış yolcu',x:70,z:8,look:{robe:0x7c7f86,cloth:0xd8c7a8,beard:0x2a221c},mark:()=>dmark('su')});
// D4/D5 — the shepherd of Ma'lât, three lost lambs, a pen
const shep=npc({id:'shep',label:'Çoban',x:30,z:-208,look:{robe:0x4d6b3a,cloth:0xe9dcc0,beard:0x5a4636},mark:()=>dmark('kuzu')||dmark('agil')});
const PEN={x:shep.x+7,z:shep.z-5};{const s=freeSpot(PEN.x,PEN.z,3.8);PEN.x=s.x;PEN.z=s.z;}
const LAMB_AT=[[-76,-150],[76,-112],[-68,-262]];const LAMBS=LAMB_AT.map(([x,z])=>{const a=animal('sheep',x,z);a.lamb=true;a.g.visible=false;return a;});
const flock=[0,1,2,3].map(i=>{const a=animal('sheep',shep.x+3+Math.random()*3,shep.z+2+Math.random()*3);return a;});
// D6 — a poor family in a hair tent
const poorTent=OBBS.filter(o=>o.tag==='cadir').sort((a,b)=>Math.hypot(a.cx+80,a.cz-40)-Math.hypot(b.cx+80,b.cz-40))[0];
const tentFront=(()=>{const lz=-2.9,x=poorTent.cx+lz*poorTent.s,z=poorTent.cz+lz*poorTent.c;return freeSpot(x,z,.5);})();
const poor=npc({id:'poor',label:'Bedevî anne',x:tentFront.x,z:tentFront.z,look:{female:true,robe:0x3a3a44,cloth:0x8a3a2c},mark:()=>dmark('koyun')});
const poorKid=npc({id:'poorkid',x:tentFront.x+1.2,z:tentFront.z+.6,look:{scale:.6,robe:0xe8dcc4,cloth:0x3a3a44},wander:3});
const giftSheep=animal('sheep',shep.x+2,shep.z+3);giftSheep.g.visible=false;
// D7 — a quarrel about a measure in the market of the Mes'â
const buyer=npc({id:'buyer',label:'Alıcı',x:66,z:-120,look:{robe:0x8a3a2c,cloth:0xf2e8d5,beard:0x2a221c},mode:'angry',mark:()=>dmark('olcu')});
const seller=npc({id:'seller',label:'Satıcı',x:68.5,z:-118.4,look:{robe:0xc58b3a,cloth:0xe9dcc0,beard:0x5a4636},mode:'angry'});
faceTo(buyer,seller.x,seller.z);faceTo(seller,buyer.x,buyer.z);
{const g=new THREE.Group();const st=new THREE.Mesh(new THREE.BoxGeometry(1.6,.7,.9),mat.wood);st.position.y=.35;g.add(st);for(let i=0;i<3;i++){const b=new THREE.Mesh(new THREE.CylinderGeometry(.22,.18,.3,10),sackMat);b.position.set(-.5+i*.5,.85,0);g.add(b);}
  g.position.set(seller.x+.9,height(seller.x,seller.z),seller.z+1);g.traverse(m=>{if(m.isMesh)m.castShadow=true;});scene.add(g);}
// D8 — a lost traveller in the Mesfele who wants the assembly house
const lost=npc({id:'lost',label:'Yolunu kaybetmiş yolcu',x:-6,z:150,look:{robe:0x3d6f74,cloth:0xd8c7a8,beard:0x2a221c},mark:()=>dmark('yolcu')});
// D9 — unloading a caravan
const merch=npc({id:'merch',label:'Kervancı',x:14,z:118,look:{robe:0x6b4a7a,cloth:0xf2e8d5,beard:0x3a2e26,band:0xd39a2c},mark:()=>dmark('cuval')});
const merchCamel=animal('camel',merch.x+3,merch.z+1.5);merchCamel.graze=false;merchCamel.face=1.4;
const storeH=houseNear(merch.x-6,merch.z-4);const storeDoor=doorPt(storeH);
const SACKS=[0,1,2].map(i=>{const m=itemMesh('sack');const x=merchCamel.x-1.2+i*.7,z=merchCamel.z+1.4;m.position.set(x,height(x,z)+.25,z);scene.add(m);m.visible=false;return {m,x,z,got:false};});
// the camel that will help you carry stones
const myCamel=animal('camel',shep.x-4,shep.z+4);myCamel.graze=false;myCamel.g.visible=false;myCamel.cargo=[];
// town life
const WANDER=[[-14,40],[30,-30],[-40,-60],[50,10],[0,80],[-30,120],[40,-150],[10,-90],[-50,20],[60,-60]];
WANDER.forEach(([x,z],i)=>npc({id:'w'+i,x,z,look:{female:i%3===0,scale:i%4===3?.7:1},wander:14}));
const WORKERS=[];for(let i=0;i<5;i++){const side=[[-2,-1],[2,1],[0,2],[-1,-2],[1.5,-.5]][i];const a=kW(side[0]*3,-KD/2-2.2),b={x:DEPOT.x+side[0]*.6,z:DEPOT.z+side[1]*.6};
  const w=npc({id:'wk'+i,x:b.x,z:b.z,look:{robe:[0x7a5a3a,0x8a3a2c,0x4d6b3a,0x2f5d8a,0xc58b3a][i]}});w.path=[a,b];w.pi=i%2;w.walk=1.2+i*.1;w.pathWait=1.5;w.carrying=true;
  const it=itemMesh('stone');it.position.set(0,1.6,0);it.scale.setScalar(.72);w.body.add(it);w.g.visible=false;WORKERS.push(w);}
// clan camps for the night of the dispute
const CAMP_DEF=[
  {id:'dar',fn:'Abdüddâr ateşi',who:'Abdüddâr oğullarından bir genç',at:kW(-KW/2-11,0),start:75,steps:[
    {say:"Ellerimizi kana batırıp yemin ettik! Taşı biz koyacağız; karşı çıkanla kılıçlarımız konuşur.",o:[
      ["Yemininizi duydum. Ama Harem'de kan dökülürse, Kâbe'yi yapan eller kana bulanmaz mı?",-25,"…Harem'in hürmetini biz de biliriz."],
      ["Haklısınız, bu şeref en çok sizin.",15,"Duydunuz mu? Bu genç bile bizden yana!"],
      ["Kana batmış eller mi? Ayıp size!",25,"Bize ayıp diyen sen kimsin!"]]},
    {say:"Peki ne yapalım? Şerefimizi yere mi bırakalım?",o:[
      ["Şeref, Kâbe'yi kansız yükseltmektir. Herkesin razı olacağı bir yol bulunana kadar bekleyin.",-30,"Bekleriz… ama o yol bulunsun."],
      ["Kura çekin, kim çıkarsa o koysun.",-5,"Kura mı? Bu iş talihe bırakılmaz."],
      ["Kim güçlüyse o koysun.",30,"İşte bunu anlarım!"]]}],ok:"Peki. Kılıçlar kınında kalsın. Bekleyelim."},
  {id:'mah',fn:'Mahzûm ateşi',who:'Mahzûm oğullarından bir yaşlı',at:kW(KW/2+9,1),start:65,steps:[
    {say:"Hacerü'l-Esved'in yanındaki duvarı biz ördük. Taş bizim duvarımızda; onu başkasına bırakmayız.",o:[
      ["Emeğinizi herkes gördü. Emeği olan çok; şeref de herkesin olamaz mı?",-25,"Herkesin mi… Hm."],
      ["O köşe herkesindir, sizin değil.",15,"Sözüne dikkat et, genç!"],
      ["Bırakın, kim koyarsa koysun; ne fark eder?",20,"Fark etmez mi? Bu Kâbe!"]]},
    {say:"Herkesin olsun dediğin şeref nasıl paylaşılır?",o:[
      ["Bilmiyorum. Ama aklı başında bir hakem bulunursa, bütün boylar aynı anda razı olabilir.",-25,"Bir hakem… Belki."],
      ["En yaşlınız karar versin.",-10,"Yaşlılarımızın sözü değerlidir, evet."],
      ["Paylaşılmaz; savaşın, kim kazanırsa.",35,"Delikanlı, ateşi körükleme!"]]}],ok:"Sabredelim. Bir hakem çıkarsa dinleriz."},
  {id:'men',fn:'Abdümenâf ateşi',who:'Abdümenâf oğullarından biri',at:kW(-3,-KD/2-10),start:55,steps:[
    {say:"Kapının olduğu yüzü biz yaptık. Kavga istemeyiz, ama hakkımızı da bırakmayız.",o:[
      ["Kavga istemediğinizi söylemeniz çok kıymetli. Bunu diğer ateşlere de söyler misiniz?",-25,"Söyleriz. Kan dökülsün istemeyiz."],
      ["O zaman geri çekilin.",15,"Neden biz çekilelim?"],
      ["Hakkınız için savaşmalısınız.",30,"Öyle mi diyorsun…"]]},
    {say:"Biz söyleriz de, dinlerler mi?",o:[
      ["Bir kişi bile 'bekleyelim' derse öfke biraz söner.",-20,"Doğru. Biri başlamalı."],
      ["Dinlemezler, boş verin.",15,"O hâlde biz de hazırlanalım."],
      ["Silahlarınızı hazır tutun.",35,"…"]]}],ok:"Gidip söyleyeceğiz: bekleyelim, kan dökülmesin."},
  {id:'cum',fn:'Cumah ve Sehm ateşi',who:'Cumah ve Sehm oğullarından biri',at:kW(1,KD/2+9),start:70,steps:[
    {say:"Arka duvarı biz ördük. Kimse görmüyor diye hakkımız yok mu sayılır?",o:[
      ["Görünmeyen duvar da Kâbe'yi taşır. Emeğiniz unutulmadı.",-30,"…Bunu duymak iyi geldi."],
      ["Arka duvar o kadar önemli değil.",25,"Önemli değil mi!?"],
      ["Öyleyse öne geçin, zorla alın.",30,"Belki de öyle yapmalıyız!"]]},
    {say:"Peki şimdi ne olacak?",o:[
      ["Sabır. Kureyş'in büyükleri bir yol arıyor; acele kanı çağırır.",-25,"Sabır… peki."],
      ["Bilmiyorum.",10,"Bilmiyorsan karışma."],
      ["Ateşi büyütün, korksunlar.",30,"Evet, görsünler bizi!"]]}],ok:"Bekleyeceğiz. Ama uzun sürmesin."}
];
const CAMPS=CAMP_DEF.map((c,i)=>{const s=freeSpot(c.at.x,c.at.z,1.2);const f=addFire(s.x,s.z);const ppl=[];
  for(let k=0;k<3;k++){const a=k/3*6.28+i;const n=npc({id:'camp'+i+k,label:k===0?c.fn:null,x:s.x+Math.cos(a)*1.7,z:s.z+Math.sin(a)*1.7,look:{robe:[0x8a3a2c,0x2f5d8a,0x4d6b3a,0x6b4a7a][i],beard:k===0?0xd8d0c4:0x2a221c},mode:'angry',mark:k===0?()=>G.ch===3&&!G.calm[c.id]?'q':(G.calm[c.id]&&G.ch===3?'r':''):null});
    faceTo(n,s.x,s.z);n.g.visible=false;ppl.push(n);}
  return {...c,x:s.x,z:s.z,fire:f,ppl};});
// celebration crowd at the end
const CROWD=[];for(let i=0;i<14;i++){const a=i/14*6.283,r=15+Math.random()*4;const n=npc({id:'cr'+i,x:Math.cos(a)*r,z:Math.sin(a)*r,look:{female:i%3===1,scale:i%5===4?.7:1},mode:'cheer'});faceTo(n,0,0);n.g.visible=false;CROWD.push(n);}

function dmark(id){const s=dst(id).st;return s==='open'?'q':s==='ready'?'r':'';}
const DEEDS={
  camur:{t:'Çamurlu eşik',giver:widow,ch:0},keci:{t:'Damdaki keçi',giver:child,ch:0},
  su:{t:'Bir testi su',giver:thirsty,ch:2},kuzu:{t:'Kayıp kuzular',giver:shep,ch:2},agil:{t:'Ağıl',giver:shep,ch:99},koyun:{t:'Bir koyun',giver:poor,ch:99},
  olcu:{t:'Eksik ölçü',giver:buyer,ch:2},yolcu:{t:'Yolunu kaybeden yolcu',giver:lost,ch:2},cuval:{t:'Kervan yükü',giver:merch,ch:2}
};
function openDeedsFor(ch){for(const id in DEEDS){if(DEEDS[id].ch<=ch&&dst(id).st==='hidden')dst(id).st='open';}}

/* ---------- talking ---------- */
function onTalk(n){
  const id=n.id;
  if(id==='widow'){const s=dst('camur').st;
    if(s==='open')talk([["Yaşlı teyze","Evladım, gece gelen sel kapımın önünü çamurla doldurdu. Belim tutmuyor, kapıyı açamıyorum."]],()=>dialog('Yaşlı teyze',"Yardım eder misin?",[{t:'Hemen temizlerim, teyze.',main:true,fn:()=>{setD('camur','active');G.track='camur';toast('Kapının önündeki üç çamur yığınını temizle.');}},{t:'Biraz sonra gelirim.'}]));
    else if(s==='active')dialog('Yaşlı teyze',"Kapının önündeki çamur… Allah razı olsun, acele etme.");
    else if(s==='ready')talk([["Yaşlı teyze","Kapım açıldı, nefesim açıldı! Bak evladım, bu sokak Attârîn sokağıdır. Şu bitişikteki ev Hatice'nin evi; yanındaki de Ebû Süfyân'ın."],
      ["Yaşlı teyze","Ben Fil Yılı'nı hatırlarım. Ebrehe filleriyle geldiğinde Kureyş dağlara çekilmişti; Kâbe'yi sahibi korudu."],
      ["Yaşlı teyze","Rahmetli kocamın birkaç tahtası kaldı. Ustabaşına söyledim; Kâbe'ye helal katkı olsun."]],()=>{setD('camur','done');discover('e_hatice',true);discover('e_ebusufyan',true);discover('o_fil');reward(1,1,'teyzenin tahtaları');afterCh1();});
    else dialog('Yaşlı teyze',"Kapım hep açık evladım. Hatice'nin evinin önünden geçersen selam söyle.");return;}
  if(id==='child'){const s=dst('keci').st;
    if(s==='open')talk([["Ağlayan çocuk","Keçim! Selden kaçarken dama çıktı, şimdi inemiyor!"]],()=>dialog('Ağlayan çocuk',"Onu indirebilir misin?",[{t:'Merak etme, indiririm.',main:true,fn:()=>{setD('keci','active');G.track='keci';toast('Evin önündeki sandığa git ve Tırman düğmesine bas; oradan dama da tırman.',5);}},{t:'Birazdan.'}]));
    else if(s==='active'&&P.carry==='goat')giveGoat();
    else if(s==='active')dialog('Ağlayan çocuk',"Orada, damda! Sandıktan tırmanabilirsin.");
    else dialog('Çocuk',"Keçim artık korkmuyor. Teşekkür ederim!");return;}
  if(id==='usta'){
    if(!G.flags.ustaMet){G.flags.ustaMet=true;talk([["Ustabaşı","Hoş geldin genç. Kureyş'in şartını duydun: bu binaya yalnız helal girecek."],
      ["Ustabaşı","Taşları Ebû Kubeys'in eteğindeki ocaktan getir; dağın taşı kimsenin malı değil. Kereste ise gemiden geliyor. Onu iyilikle kazanırsın: yardım ettiğin insanlar payına düşen tahtayı buraya getirir."],
      ["Ustabaşı","Duvarlar bir sıra taş, bir sıra ahşap yükselecek. Haydi bakalım!"]],()=>{save();});return;}
    const lv=LEVELS[G.level];
    if(!lv){dialog('Ustabaşı',"Bitti genç. Helal emekle yükseldi. Gözümüz aydın.");return;}
    if(G.ch===3){dialog('Ustabaşı',"Taş beklemede. Önce boyların öfkesi dinmeli. Ateşlere git, kan dökülmesin.");return;}
    const have=lv.t==='stone'?G.stoneBank:G.wood;
    dialog('Ustabaşı',(lv.roof?"Sıra çatıda: altı direk ve geminin kalın tahtaları. ":lv.door?"Son iş kapı. Yerden yükseltilmiş, tek kanatlı bir kapı. ":"")+"Şimdiki sıra "+TNAME[lv.t]+": "+Math.min(have,lv.n)+" / "+lv.n+". "+(lv.t==='stone'?"Ocaktan taş getir"+(G.camel?"; deven dört taşa kadar taşır.":"."):"Kereste iyilik yaptıklarından gelir; şehirde yardım bekleyenler var."));return;}
  if(id==='thirsty'){const s=dst('su').st;
    if(s==='open')talk([["Susamış yolcu","Yemen'den geliyorum, ayaklarım kurudu. Zemzem'den bir yudum su getirebilir misin? Ben Kâbe'nin yanına kadar yürüyemem."]],()=>dialog('Susamış yolcu','Getirebilir misin?',[{t:'Testiyle getiririm.',main:true,fn:()=>{setD('su','active');G.track='su';toast("Zemzem'den testiyi doldur. Koşmak ve zıplamak suyu döker.",4.5);}},{t:'Sonra.'}]));
    else if(s==='active'&&P.jar&&P.water>=50){P.busy=.7;P.busyAnim='pour';sfx.pour();P.busyCb=()=>{const w=Math.round(P.water);P.jar=false;P.water=0;jarMesh.visible=false;setD('su','done');
      talk([["Susamış yolcu",w>85?"Bir damlası bile dökülmemiş! Ne güzel taşıdın.":"Oh… can buldum."],["Susamış yolcu","Kervanımızdaki kereste yükünden bir tahta senin olsun; Kâbe'ye katkı olarak ustabaşına bıraktırırım."]],()=>reward(1,1,'yolcunun hediyesi'));};}
    else if(s==='active')dialog('Susamış yolcu',P.jar?"Testide su azalmış… Zemzem'den tekrar doldurur musun?":"Zemzem, Kâbe'nin doğusundaki kuyu.");
    else dialog('Yolcu',"Allah yoluna bereket versin.");return;}
  if(id==='shep'){const k=dst('kuzu').st,a=dst('agil').st;
    if(k==='open')talk([["Çoban","Selde üç kuzum dağa kaçtı. Biri Kuaykıân tarafında, biri Ebû Kubeys'in yamacında, biri de kuzeyde, Hacûn'un ardında."]],()=>dialog('Çoban',"Onları bulup getirir misin? Sesleri yakından duyulur.",[{t:'Bulurum.',main:true,fn:()=>{setD('kuzu','active');G.track='kuzu';LAMBS.forEach((l,i)=>{if(!(G.flags.lambs||[])[i])l.g.visible=true;});}},{t:'Sonra.'}]));
    else if(k==='active'){const near=LAMBS.filter(l=>l.follow===P&&Math.hypot(l.x-shep.x,l.z-shep.z)<9).length;
      if(near===3){LAMBS.forEach(l=>{l.follow=null;l.home={x:shep.x+2,z:shep.z+2};l.graze=true;});setD('kuzu','done');setD('agil','active');G.track='agil';
        talk([["Çoban","Üçü de burada! Ama ağılı sel yıktı; hayvanlar yine dağılır."],["Çoban","Vadinin kenarındaki çalı çırpıdan üç demet getirirsen beraber yeni bir ağıl öreriz."]],()=>toast('Vadi kenarından üç demet çalı topla.',4));}
      else dialog('Çoban',near?"Bir kuzu daha eksik… Sesini dinle.":"Kuzularımı bulursan peşinden gelirler.");}
    else if(a==='active')dialog('Çoban',(G.brush||0)>=3?"Çalılar tamam! Ağılın yerine gidip örelim.":"Çalı demetleri: "+(G.brush||0)+" / 3.");
    else if(a==='done'&&dst('koyun').st!=='done')dialog('Çoban',"Deve sana emanet. Koyunu da Bedevî çadırına götürmeyi unutma.");
    else dialog('Çoban',"Kuzular ağılda, gönlüm rahat.");return;}
  if(id==='poor'){const s=dst('koyun').st;
    if(s==='active'&&Math.hypot(giftSheep.x-poor.x,giftSheep.z-poor.z)<7){giftSheep.follow=null;giftSheep.home={x:poor.x+2,z:poor.z+1.5};giftSheep.graze=true;setD('koyun','done');
      talk([["Bedevî anne","Bu koyun bizim için mi? Çocuklarım sütüyle doyar…"],["Bedevî anne","Elimizde mal yok, ama kocamın gücü var. Gemiden gelen keresteden iki tahtayı o taşıyacak, senin adına."]],()=>reward(2,2,'Bedevî ailenin emeği'));}
    else if(s==='active')dialog('Bedevî anne',"Çoban bize bir koyun mu yolladı? Peşinden getirebilir misin?");
    else dialog('Bedevî anne',G.deeds.koyun&&G.deeds.koyun.st==='done'?"Koyunumuz sağ olsun. Sen de sağ ol.":"Selden beri çadırımız ıslak. Geçmiş olsun bize.");return;}
  if(id==='buyer'||id==='seller'){const s=dst('olcu').st;
    if(s==='open'){G.track='olcu';mediate({who:'Alıcı',start:60,steps:[
      {say:"Bu adam ölçeğini eksik tutuyor! Bir sâ' arpa dedi, ölçek yarım!  — Satıcı: “Yalan! Ölçeğim babamdan kalma!”",o:[
        ["İkinizi de dinledim. Çarşıda herkesin güvendiği bir ölçek yok mu?",-25,"Var… çarşı başındaki büyük ölçek."],
        ["Satıcılar hep hile yapar zaten.",20,"Satıcı: “Ne dedin sen!?”"],
        ["Alıcı abartıyor, bu kadar bağırmaya gerek yok.",20,"Alıcı: “Bağırırım tabii, hakkım yeniyor!”"]]},
      {say:"Peki o ölçekle tartarsak, kim razı olacak?",o:[
        ["Bir kez tartalım. Eksik çıkarsa tamamlanır; çıkmazsa helalleşirsiniz.",-30,"İkisi birden: “…Olur.”"],
        ["Boş verin, herkes yoluna gitsin.",10,"Hakkım ne olacak?"],
        ["Kim haksızsa ceza ödesin.",20,"Ceza mı? Daha da kızıştılar."]]}],
      ok:"Satıcı: “Tarttık… gerçekten eksikmiş. Ölçeğim aşınmış, bilmiyordum. Hakkını tamamlıyorum.” Alıcı: “Ben de sesimi yükselttim, hakkını helal et.”"},
      ()=>{setD('olcu','done');buyer.mode='idle';seller.mode='idle';talk([["Satıcı","Genç, araya girdin de dükkânımın adı kirlenmedi. Kardeşim gemi kerestesini taşıyor; iki tahta Kâbe'ye, senin adına."]],()=>reward(2,1,'adil ölçü'));});}
    else dialog(n.label,s==='done'?"Ölçü doğru olunca çarşı da huzurlu oluyor.":"…");return;}
  if(id==='lost'){const s=dst('yolcu').st;
    if(s==='open')talk([["Yolunu kaybetmiş yolcu","Selamün aleyküm. Tâif'ten geldim; Dâru'n-Nedve'de kervan işim var ama sokaklar birbirine benziyor."]],()=>dialog('Yolcu',"Beni oraya götürür müsün?",[{t:'Peşimden gel.',main:true,fn:()=>{setD('yolcu','active');G.track='yolcu';lost.follow=P;lost.wander=0;}},{t:'Şimdi olmaz.'}]));
    else if(s==='active')dialog('Yolcu',"Peşindeyim.");
    else dialog('Yolcu',"Sağ ol delikanlı.");return;}
  if(id==='merch'){const s=dst('cuval').st;
    if(s==='open')talk([["Kervancı","Devem yorgun, çuvallar ağır. Şu üç çuvalı ambarın kapısına taşıyabilir misin?"]],()=>dialog('Kervancı','Yardım eder misin?',[{t:'Taşırım.',main:true,fn:()=>{setD('cuval','active');G.track='cuval';SACKS.forEach(s=>{if(!s.got)s.m.visible=true;});}},{t:'Sonra.'}]));
    else if(s==='active')dialog('Kervancı',"Çuvallar: "+dst('cuval').n+" / 3. Ambar, şu kapısı açık ev.");
    else dialog('Kervancı',"Yolun açık olsun.");return;}
  for(const c of CAMPS){if(c.ppl[0]===n){if(G.ch!==3)return;if(G.calm[c.id]){dialog(c.who,c.ok);return;}
    mediate(c,()=>{G.calm[c.id]=true;queueSaying('baris');c.ppl.forEach(p=>p.mode='idle');sfx.good();sparkle(c.x,1.5,c.z,20);G.good++;pop('r-good');save();
      const n2=Object.keys(G.calm).length;toast('Sakinleşen ateşler: '+n2+' / 4',3);if(n2>=4)setTimeout(stonePlacement,1400);});return;}}
}
function mediate(c,ok){let ten=c.start,i=0;
  const step=()=>{const s=c.steps[i];const opts=s.o.map(o=>({t:o[0],fn:()=>{ten=Math.max(0,Math.min(100,ten+o[1]));
      if(ten>=100){dialog(c.who,"Öfke kabardı! — Biraz bekle, sonra tekrar konuş.",[{t:'Tamam',main:true}],ten);return;}
      dialog(c.who,o[2],[{t:'Devam',main:true,fn:()=>{i++;if(i<c.steps.length)step();else if(ten<=35){dialog(c.who,c.ok,[{t:'Tamam',main:true,fn:ok}],ten);}else dialog(c.who,"Hâlâ çok öfkeliyiz. Sonra gel.",[{t:'Tamam',main:true}],ten);}}],ten);}}));
    for(let k=opts.length-1;k>0;k--){const j=(Math.random()*(k+1))|0;[opts[k],opts[j]]=[opts[j],opts[k]];}
    dialog(c.who,s.say,opts,ten);};step();}
function giveGoat(){goat.carried=false;goat.onRoof=null;goat.home={x:child.x+1.4,z:child.z+.8};goat.x=goat.home.x;goat.z=goat.home.z;goat.graze=true;P.carry=null;setHeld(null);child.mode='cheer';setD('keci','done');
  setTimeout(()=>{child.mode='idle';},3000);
  talk([["Çocuk","Keçim! Teşekkür ederim!"],["Çocuğun babası","Oğlumun gözyaşını sildin. Ben gemiden gelen kerestenin yükünü taşıyanlardanım; payımdan bir tahta Kâbe'ye, senin adına."]],()=>{reward(1,1,'babanın payı');afterCh1();});}
function afterCh1(){if(G.ch===0&&dst('camur').st==='done'&&dst('keci').st==='done'){G.ch=1;save();setTimeout(()=>showCard('Haber',{t:'Kureyş toplanıyor',b:"Dâru'n-Nedve'den haber geldi: boy başkanları Kâbe için toplanıyor. Herkes merak içinde.",c:[SRC.N]},'Dâru\'n-Nedve\'ye git'),900);}}

/* ---------- actions near the player ---------- */
let act=null;
function nearP(x,z,r){return Math.hypot(P.x-x,P.z-z)<r;}
function findAct(){
  if(state!=='play'||P.mantle||P.busy>0)return null;
  // talking
  let best=null,bd=1e9;for(const n of NPCS){if(!n.g.visible||!n.label)continue;const d=Math.hypot(P.x-n.x,P.z-n.z);if(d<n.talkR&&Math.abs(P.y-n.y)<.6&&d<bd){bd=d;best=n;}}
  // carried things first
  if(P.carry==='stone'||P.carry==='wood'){
    if(G.camel&&myCamel.g.visible&&nearP(myCamel.x,myCamel.z,3.2)&&myCamel.cargo.length<3&&!nearP(DEPOT.x,DEPOT.z,4.5))return {label:'Deveye yükle ('+(myCamel.cargo.length+1)+'/3)',fn:()=>{myCamel.cargo.push(P.carry);camelLoadVis(myCamel);P.carry=null;setHeld(null);sfx.thunk();sfx.camel();}};
    if(nearP(DEPOT.x,DEPOT.z,4.5))return {label:'Taşı bırak',fn:()=>{P.carry=null;setHeld(null);G.stoneBank++;sfx.thunk();puff(DEPOT.x,height(DEPOT.x,DEPOT.z),DEPOT.z,5);refreshStacks();pop('r-stone');save();tryBuild();}};}
  if(G.camel&&myCamel.cargo.length&&nearP(DEPOT.x,DEPOT.z,5)&&nearP(myCamel.x,myCamel.z,8)&&!P.carry)return {label:'Deveyi boşalt ('+myCamel.cargo.length+' taş)',fn:()=>{P.busy=.9;P.busyAnim='work';sfx.camel();P.busyCb=()=>{G.stoneBank+=myCamel.cargo.length;myCamel.cargo=[];camelLoadVis(myCamel);sfx.thunk();refreshStacks();pop('r-stone');save();tryBuild();};}};
  if(P.carry==='goat'&&nearP(child.x,child.z,3))return {label:'Keçiyi ver',fn:giveGoat};
  if(P.carry==='sack'&&nearP(storeDoor.x,storeDoor.z,2.6))return {label:'Çuvalı ambara bırak',fn:()=>{P.carry=null;setHeld(null);sfx.thunk();const d=dst('cuval');d.n++;save();
    if(d.n>=3){setD('cuval','done');talk([["Kervancı","Hepsi ambarda! Bu kervanda gemi kerestesi de var; iki tahta Kâbe'ye gitsin, senin emeğinle."]],()=>reward(2,1,'kervancının payı'));}else toast('Çuval '+d.n+' / 3');}};
  // deed objects
  if(dst('camur').st==='active')for(const m of MUD){if(!m.done&&nearP(m.x,m.z,1.9))return {label:'Çamuru temizle',fn:()=>{P.busy=1.1;P.busyAnim='dig';sfx.dig();P.busyCb=()=>{m.done=true;m.m.visible=false;puff(m.x,height(m.x,m.z),m.z,8);sfx.dig();const d=dst('camur');d.n++;save();
      if(d.n>=3){setD('camur','ready');toast('Kapı açıldı. Teyzeye haber ver.');}else toast('Çamur '+d.n+' / 3');};}};}
  if(dst('keci').st==='active'&&!P.carry&&!goat.carried&&goat.onRoof!=null&&nearP(goat.x,goat.z,1.8)&&Math.abs(P.y-goat.onRoof)<.6)return {label:'Keçiyi kucakla',fn:()=>{goat.carried=true;P.carry='goat';sfx.bleat();toast('Keçiyi çocuğa götür. Damdan atlayabilirsin.');}};
  if(dst('su').st==='active'&&nearP(ZEM.x,ZEM.z,3.6)&&(!P.jar||P.water<99)&&!heavy())return {label:'Testiyi doldur',fn:()=>{P.busy=.9;P.busyAnim='pour';sfx.pour();P.busyCb=()=>{P.jar=true;P.water=100;P.slosh=0;jarMesh.visible=true;toast('Testi doldu. Dikkatli yürü!');};}};
  if(dst('agil').st==='active'){for(const b of BRUSH){if(!b.got&&nearP(b.x,b.z,1.8))return {label:'Çalı demetini al',fn:()=>{b.got=true;b.m.visible=false;(G.brushGot=G.brushGot||[]).push(BRUSH.indexOf(b));G.brush=(G.brush||0)+1;sfx.pick();toast('Çalı '+Math.min(3,G.brush)+' / 3');save();}};}
    if((G.brush||0)>=3&&nearP(PEN.x,PEN.z,4.5))return {label:'Ağılı ör',fn:()=>{P.busy=2;P.busyAnim='work';sfx.dig();P.busyCb=finishPen;}};}
  if(dst('cuval').st==='active'&&!P.carry)for(const s of SACKS){if(!s.got&&nearP(s.x,s.z,1.6))return {label:'Çuvalı yüklen',fn:()=>{s.got=true;s.m.visible=false;P.carry='sack';setHeld('sack');sfx.pick();}};}
  if(best)return {label:'Konuş: '+best.label,fn:()=>onTalk(best)};
  if(G.ch>=2&&!P.carry&&nearP(QUARRY.x,QUARRY.z,4.2))return {label:'Taş kopar',fn:()=>{P.busy=1.1;P.busyAnim='dig';sfx.pick();P.busyCb=()=>{P.carry='stone';setHeld('stone');sfx.thunk();puff(P.x,P.y,P.z,4);if(!G.flags.stoneHint){G.flags.stoneHint=true;toast(G.camel?'Taşı deveye yükle ya da inşaata götür.':'Taş ağır: yavaş yürürsün, tırmanamazsın. İnşaata götür.',4.5);}};}};
  if(G.ch===1&&nearP(doorPt(NAMED.e_nedve).x,doorPt(NAMED.e_nedve).z,3.5))return {label:"Dâru'n-Nedve'ye gir",fn:council};
  if(P.carry&&P.carry!=='goat')return {label:'Bırak (Q)',fn:dropCarry,weak:true};
  return null;
}
function dropCarry(){if(!P.carry||P.carry==='tools')return;if(P.carry==='goat'){goat.carried=false;goat.onRoof=null;goat.x=P.x+Math.sin(P.face);goat.z=P.z+Math.cos(P.face);goat.home={x:goat.x,z:goat.z};goat.graze=true;}
  else if(P.carry==='sack'){const s=SACKS.find(s=>s.got&&!s.m.visible);if(s){s.got=false;s.x=P.x+Math.sin(P.face);s.z=P.z+Math.cos(P.face);s.m.position.set(s.x,height(s.x,s.z)+.25,s.z);s.m.visible=true;}}
  P.carry=null;setHeld(null);sfx.thunk();}
function finishPen(){buildPen(PEN.x,PEN.z);for(const l of [...LAMBS,...flock]){l.pen={x:PEN.x,z:PEN.z,r:2.4};const a=Math.random()*6.28;l.x=PEN.x+Math.cos(a)*1.5;l.z=PEN.z+Math.sin(a)*1.5;l.graze=false;l.follow=null;}
  setD('agil','done');sfx.build();sparkle(PEN.x,1.4,PEN.z,30);
  talk([["Çoban","Sağlam bir ağıl oldu! Kuzular artık kaçmaz."],["Çoban","Taş taşıyorsun, duydum. Amcamın devesini al; taşları o taşısın. Bir de şu koyunu Bedevî çadırındaki aileye götür, çocukları sütüyle doysun."]],()=>{
    G.camel=true;myCamel.g.visible=true;myCamel.follow=P;giftSheep.g.visible=true;giftSheep.follow=P;setD('koyun','active');G.track='koyun';G.good++;pop('r-good');sfx.camel();save();toast('Deve seni takip ediyor: elindeki taşı deveye yükleyebilirsin (en çok 3).',5);});}

/* ---------- building the Kâbe ---------- */
let rise=null;
function kaabaFromG(){const lv=G.level,done=lv>=LEVELS.length;
  return {old:G.ch<2,rubble:G.ch>=2&&lv<2,green:G.ch>=2&&lv===0,wallH:G.ch<2?0:(lv>0?LEVELS[Math.min(lv,6)-1].h:0)||0,scaffold:G.ch>=2&&!done,roof:lv>=6,door:done,stone:G.placed,hijr:done};}
function tryBuild(){if(rise||G.ch<2)return;const lv=LEVELS[G.level];if(!lv)return;if(G.level>=1&&!G.placed)return;
  const bank=lv.t==='stone'?'stoneBank':'wood';if(G[bank]<lv.n)return;
  G[bank]-=lv.n;refreshStacks();const from=KP.wallH,to=lv.h||from;rise={t:0,from,to,lv};sfx.build();riseCine(lv);toast(lv.roof?'Çatı kuruluyor…':lv.door?'Kapı takılıyor…':(LANG==='en'?'Course '+(G.level+1)+' going up…':(G.level+1)+'. sıra örülüyor…'),2.6);}
function stepRise(dt){if(!rise)return;rise.t+=dt/2.6;const k=Math.min(1,rise.t),e=k*k*(3-2*k);
  if(rise.to>rise.from){kaaba({wallH:rise.from+(rise.to-rise.from)*e});if(Math.random()<dt*14){const a=Math.random()*6.28;puff(Math.cos(a)*8,KP.wallH,Math.sin(a)*8,2);}}
  if(k>=1){const lv=rise.lv;rise=null;G.level++;kaaba(kaabaFromG());sparkle(0,KP.wallH+.5,0,40);sfx.good();pop('r-kabe');save();levelDone(lv);}}
function levelDone(lv){
  if(G.level===1&&!G.placed){setTimeout(startDispute,1200);return;}
  if(lv.roof){discover('k_mizab');}
  if(G.level>=LEVELS.length){setTimeout(finale,1400);return;}
  const nx=LEVELS[G.level];toast('Sıra tamam! Şimdi: '+(nx.roof?'çatı (kereste)':nx.door?'kapı (kereste)':TNAME[nx.t]+' sırası'),3.6);tryBuild();}

/* ---------- story beats ---------- */
function council(){state='card';fadeOut(()=>{
  showCard("Dâru'n-Nedve",{t:'Kureyş karar veriyor',b:"Boy başkanları toplandı. Kâbe yıkılıp yeniden ve bu sefer çatılı yapılacak. Ebû Vehb ayağa kalktı: “Bu işe yalnız helal kazancınızı katın. Fâizden, zulümden, haksız kazançtan tek dirhem girmesin.” Herkes kabul etti. Her boya bir duvar düştü.",c:[SRC.IH,SRC.N]},'Devam',()=>{
    discover('e_nedve',true);discover('o_helal',true);queueSaying('helal');discover('o_bolum');fadeIn();snakeScene();});
  },true);}
function snakeScene(){
  const sp=kW(1.2,-KD/2+.6);const sy=OLD_H+.06;
  const pts=[];for(let i=0;i<=40;i++){const t=i/40,a=t*Math.PI*3.2,r=.55-t*.35;pts.push(new V3(Math.cos(a)*r,.05+Math.sin(t*9)*.02,Math.sin(a)*r));}
  pts.push(new V3(.25,.25,-.1),new V3(.35,.42,-.05));
  const snake=new THREE.Group();const tube=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),80,.07,7),Lm(0x5c5634));tube.castShadow=true;snake.add(tube);
  snake.position.set(sp.x,sy,sp.z);scene.add(snake);
  const eagle=new THREE.Group();const em=Lm(0x5a4030);const body=new THREE.Mesh(new THREE.SphereGeometry(.35,12,8),em);body.scale.set(.8,.7,1.6);eagle.add(body);
  const hd=new THREE.Mesh(new THREE.SphereGeometry(.18,10,8),Lm(0xe8dcc4));hd.position.set(0,.12,.55);eagle.add(hd);
  const wL=new THREE.Group(),wR=new THREE.Group();for(const [w,s] of [[wL,1],[wR,-1]]){const m=new THREE.Mesh(new THREE.BoxGeometry(1.5,.04,.55),em);m.position.x=s*.8;w.add(m);eagle.add(w);}
  eagle.traverse(m=>{if(m.isMesh)m.castShadow=true;});scene.add(eagle);const e0=new V3(sp.x+50,sy+35,sp.z-30),e1=new V3(sp.x,sy+.6,sp.z),e2=new V3(sp.x-70,sy+45,sp.z+60);eagle.position.copy(e0);
  RAIN.target=.15;setTime('asr');
  const cA=new V3(sp.x+9,sy+1.5,sp.z-9),cB=new V3(sp.x+6,sy+.8,sp.z-6),look=new V3(sp.x,sy+.3,sp.z);
  cine([
    {d:4.2,from:{p:cA,l:look},to:{p:cB,l:look},sub:"Kâbe'nin içindeki kuyudan çıkan büyük bir yılan her gün duvarın üstünde güneşlenirdi. Kimse yaklaşamıyordu.",upd:k=>{snake.rotation.y=Math.sin(clock*1.5)*.15;}},
    {d:2.6,from:{p:cB,l:look},to:{p:new V3(sp.x+7,sy+2.5,sp.z-5),l:look},sub:"Bir gün gökten bir kartal süzüldü…",start:()=>sfx.wing(),upd:k=>{const e=k*k;eagle.position.lerpVectors(e0,e1,e);eagle.lookAt(e1);const f=Math.sin(clock*14)*.5;wL.rotation.z=f;wR.rotation.z=-f;}},
    {d:3.4,from:{p:new V3(sp.x+7,sy+2.5,sp.z-5),l:look},to:{p:new V3(sp.x+10,sy+3,sp.z-8),l:new V3(sp.x-20,sy+12,sp.z+18)},sub:"…ve yılanı kapıp götürdü. Kureyş bunu işe başlamak için hayra yordu.",
      start:()=>{snake.position.set(0,-.3,0);snake.scale.setScalar(.8);eagle.add(snake);sfx.wing();},upd:k=>{eagle.position.lerpVectors(e1,e2,k*k);eagle.lookAt(e2);const f=Math.sin(clock*12)*.6;wL.rotation.z=f;wR.rotation.z=-f;}}
  ],()=>{scene.remove(eagle);discover('o_yilan',true);
    showCard('Olay',CX.o_yilan,'Devam',()=>fadeOut(()=>{
      G.ch=2;openDeedsFor(2);RAIN.target=0;flood.visible=false;setTime('noon');kaaba(kaabaFromG());syncWorld();
      P.x=DEPOT.x+4;P.z=DEPOT.z-3;P.y=height(P.x,P.z);P.face=Math.atan2(-P.x,-P.z);cam.yaw=P.face+Math.PI;discover('o_temel',true);save();
      fadeIn();showCard('Ertesi sabah',CX.o_temel,'İnşaata katıl',()=>toast('Ustabaşı ile konuş.',3));
    }));});
}
function startDispute(){
  G.ch=3;save();
  showCard('Duvar yükseldi',{t:"Hacerü'l-Esved'in hizası",b:"Duvar, Hacerü'l-Esved'in konacağı yüksekliğe geldi. Her boy taşı yerine koyma şerefini istiyor. Abdüddâr oğulları kanla dolu bir kap getirip içine ellerini batırdı; Adî oğulları da onlara katıldı. Kılıçlar bileniyor.",c:[SRC.IH,SRC.S]},'Ateşlere git',()=>{
    fadeOut(()=>{setTime('night');syncWorld();fadeIn();toast('Dört boyun ateşini ziyaret et. Kan dökülmesin.',4.5);});});}
function stonePlacement(){
  const out=new V3(BSW.x,0,BSW.z).normalize();const cp=new V3(BSW.x+out.x*2.6,0,BSW.z+out.z*2.6);cp.y=height(cp.x,cp.z);
  setTime('dawn');CAMPS.forEach(c=>{c.ppl.forEach(p=>p.g.visible=false);c.fire.g.visible=false;});
  const cloth=new THREE.Mesh(new THREE.PlaneGeometry(2.2,2.2,6,6),new THREE.MeshLambertMaterial({map:fabricTex,side:THREE.DoubleSide}));cloth.rotation.x=-Math.PI/2;
  const cg=new THREE.Group();cg.position.copy(cp);cg.add(cloth);cloth.position.y=.05;scene.add(cg);
  const stone=new THREE.Mesh(new THREE.SphereGeometry(.22,14,10),new THREE.MeshPhongMaterial({color:0x151312,shininess:70,specular:0x333333}));stone.scale.set(.95,1.15,.7);stone.position.y=.22;cg.add(stone);
  const elders=[];for(let i=0;i<4;i++){const a=i/4*6.283+.785,x=cp.x+Math.cos(a)*1.9,z=cp.z+Math.sin(a)*1.9;const p=makePerson({robe:[0x8a3a2c,0x2f5d8a,0x4d6b3a,0x6b4a7a][i],beard:0xd8d0c4,cloth:0xf2e8d5});p.g.position.set(x,height(x,z),z);p.g.rotation.y=Math.atan2(cp.x-x,cp.z-z);scene.add(p.g);elders.push(p);}
  const crowd=CROWD.slice(0,10);crowd.forEach((n,i)=>{n.g.visible=true;n.mode='idle';const a=i/10*3+out.x*0+Math.atan2(out.z,out.x)-1.5,r=7+i%3;n.x=cp.x+Math.cos(a)*r;n.z=cp.z+Math.sin(a)*r;faceTo(n,cp.x,cp.z);});
  const slot=new V3();KP.stone.visible=false;
  const perp=new V3(-out.z,0,out.x);const camA=new V3(cp.x+out.x*7+perp.x*2.5,cp.y+2.6,cp.z+out.z*7+perp.z*2.5),camB=new V3(cp.x+out.x*3.6+perp.x*1.3,cp.y+1.7,cp.z+out.z*3.6+perp.z*1.3);const lk=new V3(cp.x,cp.y+1,cp.z);
  cine([
    {d:4.5,from:{p:camA,l:new V3(0,4,0)},to:{p:camA,l:lk},sub:"Beşinci gün, Kureyş'in en yaşlısı Ebû Ümeyye b. Muğîre bir öneride bulundu: “Mescide kapıdan ilk girecek kişi aranızda hakem olsun.”"},
    {d:4.5,from:{p:camA,l:lk},to:{p:camB,l:lk},sub:"Kapıdan ilk giren, herkesin “el-Emîn” diye tanıdığı kişiydi. “Razıyız” dediler."},
    {d:4.5,from:{p:camB,l:lk},to:{p:camB,l:new V3(cp.x,cp.y+1.6,cp.z)},sub:"Bir örtü serdi, taşı ortasına koydu ve her boydan birine örtünün bir ucundan tutturdu. Hep birlikte kaldırdılar.",
      upd:k=>{const e=k*k*(3-2*k);cg.position.y=cp.y+e*1.25;elders.forEach(p=>{p.armL.rotation.x=p.armR.rotation.x=-.8-e*.9;});}},
    {d:4,from:{p:camB,l:new V3(cp.x,cp.y+1.6,cp.z)},to:{p:camB,l:new V3(BSW.x,1.5,BSW.z)},sub:"Taş hizasına gelince onu kendi eliyle yerine koydu. Tek damla kan dökülmedi.",
      start:()=>{KP.stone.getWorldPosition(slot);},upd:k=>{const e=k*k*(3-2*k);const w=new V3();cg.localToWorld(w.set(0,.22,0));stone.position.set(0,.22,0);
        const p=new V3().lerpVectors(new V3(cp.x,cp.y+1.25+.22,cp.z),slot,e);cg.worldToLocal(p);stone.position.copy(p);if(k>.95&&!KP.stone.visible){KP.stone.visible=true;stone.visible=false;sparkle(slot.x,slot.y,slot.z,40);sfx.build();}}}
  ],()=>{scene.remove(cg);elders.forEach(p=>scene.remove(p.g));crowd.forEach(n=>n.g.visible=false);G.placed=true;G.ch=4;kaaba(kaabaFromG());syncWorld();discover('o_hakem',true);save();
    showCard('Olay',{t:CX.o_hakem.t,b:CX.o_hakem.b+" Bu oyunda Efendimiz (s.a.v.) tasvir edilmez; olay yalnızca anlatılır.",c:CX.o_hakem.c},'İnşaata dön',()=>{setTime('noon');tryBuild();toast('Sıradaki: kereste. İyilik yaptıkça kereste gelir.',4);});});
}
function finale(){G.ch=5;queueSaying('fayda');discover('k_kapi',true);discover('k_hicr',true);kaaba(kaabaFromG());syncWorld();save();
  setTime('eve');CROWD.forEach(n=>{n.g.visible=true;n.mode='cheer';});
  showCard('Bitti',{t:"Kâbe yükseldi",b:"Bir sıra taş, bir sıra ahşap; çatısı altı direğe dayanıyor, kapısı yerden yüksek. Helal para yetmediği için Hicr dışarıda kaldı ve alçak bir duvarla çevrildi. Sel çamurundan, kanlı yeminlerden geçip sabırla, iyilikle yükselen bir bina. Sen de taşını koydun. "+statsLine(),c:[SRC.K,SRC.IH]},'Mekke akşamında dolaş',()=>{
    toast('Defteri tamamla: evleri, yerleri, Kâbe\'nin bölümlerini keşfet.',5);setTimeout(()=>CROWD.forEach(n=>n.mode='idle'),9000);});}

/* ---------- world sync (used on load and after story beats) ---------- */
function syncWorld(){
  const ch=G.ch;kaaba(kaabaFromG());
  RAIN.target=ch<2?1:0;flood.visible=ch<2;puddles.visible=ch<2;
  usta.g.visible=ch>=2;WORKERS.forEach(w=>w.g.visible=ch===2||ch===4);
  PROPS.quarryG.visible=ch>=2;PROPS.qStones.forEach(s=>s.visible=ch>=2);
  const night=ch===3;CAMPS.forEach(c=>{c.ppl.forEach(p=>{p.g.visible=night;if(G.calm[c.id])p.mode='idle';});c.fire.g.visible=night;});
  CROWD.forEach(n=>n.g.visible=ch===5);
  MUD.forEach((m,i)=>{m.done=i<dst('camur').n||dst('camur').st==='done'||dst('camur').st==='ready';m.m.visible=!m.done;});
  if(dst('keci').st==='done'){goat.onRoof=null;goat.carried=false;goat.home={x:child.x+1.4,z:child.z+.8};goat.x=goat.home.x;goat.z=goat.home.z;goat.graze=true;}
  const lambs=G.flags.lambs||[];
  if(dst('agil').st==='done'){buildPen(PEN.x,PEN.z);for(const l of [...LAMBS,...flock]){l.g.visible=true;l.pen={x:PEN.x,z:PEN.z,r:2.4};l.x=PEN.x+(Math.random()-.5)*2;l.z=PEN.z+(Math.random()-.5)*2;l.graze=false;}}
  else if(dst('kuzu').st==='done'){LAMBS.forEach(l=>{l.g.visible=true;l.x=shep.x+2+Math.random()*2;l.z=shep.z+2;l.home={x:l.x,z:l.z};l.follow=null;});}
  else if(dst('kuzu').st==='active'){LAMBS.forEach(l=>l.g.visible=true);}
  BRUSH.forEach((b,i)=>{b.got=(G.brushGot||[]).includes(i);b.m.visible=!b.got;});
  if(G.camel){myCamel.g.visible=true;myCamel.follow=P;}
  if(dst('koyun').st==='active'){giftSheep.g.visible=true;giftSheep.follow=P;}else if(dst('koyun').st==='done'){giftSheep.g.visible=true;giftSheep.follow=null;giftSheep.x=poor.x+2;giftSheep.z=poor.z+1.5;giftSheep.home={x:giftSheep.x,z:giftSheep.z};}
  if(dst('olcu').st==='done'){buyer.mode='idle';seller.mode='idle';}
  if(dst('yolcu').st==='done'){const d=doorPt(NAMED.e_nedve);lost.x=d.x+2;lost.z=d.z;lost.follow=null;}else if(dst('yolcu').st==='active'){lost.follow=P;}
  const cn=dst('cuval');SACKS.forEach((s,i)=>{s.got=i<cn.n;s.m.visible=cn.st==='active'&&!s.got;});
  refreshStacks();
}

/* ---------- objectives, marker, HUD ---------- */
function mainGoal(){const lv=LEVELS[G.level];
  if(G.ch===0){const a=dst('camur').st,b=dst('keci').st;return a!=='done'||b!=='done'?'Selden sonra mahalleye yardım et':'…';}
  if(G.ch===1)return "Dâru'n-Nedve'ye git: Kureyş toplanıyor";
  if(G.ch===3)return 'Dört boyun ateşine git, öfkeyi yatıştır ('+Object.keys(G.calm).length+'/4)';
  if(G.ch===5)return 'Mekke akşamında dolaş · Defter '+Object.keys(G.found).length+'/'+CODEX.length;
  if(!G.flags.ustaMet)return 'İnşaatta ustabaşı ile konuş';
  if(!lv)return 'Kâbe tamamlandı';
  const have=lv.t==='stone'?G.stoneBank:G.wood;
  return (lv.roof?'Çatı':lv.door?'Kapı':(LANG==='en'?'Course '+(G.level+1):(G.level+1)+'. sıra'))+': '+TNAME[lv.t]+' '+Math.min(have,lv.n)+'/'+lv.n+(lv.t==='stone'?' · ocaktan taş getir':' · iyilik yap, kereste kazan');}
function deedSub(id){const d=dst(id);
  switch(id){case 'camur':return d.st==='ready'?'Teyzeye haber ver':'Çamur yığınları '+d.n+'/3';
    case 'keci':return P.carry==='goat'?'Keçiyi çocuğa götür':'Damdaki keçiyi indir';
    case 'su':return P.jar?'Suyu yolcuya götür (testi %'+Math.round(P.water)+')':"Zemzem'den testiyi doldur";
    case 'kuzu':return 'Kuzular '+LAMBS.filter(l=>l.follow===P).length+'/3 · çobana götür';
    case 'agil':return (G.brush||0)>=3?'Ağılın yerinde çalıları ör':'Çalı demetleri '+Math.min(3,G.brush||0)+'/3';
    case 'koyun':return 'Koyunu Bedevî çadırına götür';
    case 'yolcu':return "Yolcuyu Dâru'n-Nedve'ye götür";
    case 'cuval':return 'Çuvallar '+d.n+'/3 · ambara taşı';}return '';}
function deedTarget(id){
  switch(id){case 'camur':{if(dst('camur').st==='ready')return widow;const m=MUD.find(m=>!m.done);return m||widow;}
    case 'keci':return P.carry==='goat'?child:{x:goat.x,z:goat.z};
    case 'su':return P.jar&&P.water>=50?thirsty:ZEM;
    case 'kuzu':{if(LAMBS.every(l=>l.follow===P))return shep;let b=null,bd=1e9;for(const l of LAMBS){if(l.follow===P)continue;const d=Math.hypot(l.x-P.x,l.z-P.z);if(d<bd){bd=d;b=l;}}return b;}
    case 'agil':{if((G.brush||0)>=3)return PEN;let b=null,bd=1e9;for(const br of BRUSH){if(br.got)continue;const d=Math.hypot(br.x-P.x,br.z-P.z);if(d<bd){bd=d;b=br;}}return b;}
    case 'koyun':return poor;case 'yolcu':return doorPt(NAMED.e_nedve);
    case 'cuval':return P.carry==='sack'?storeDoor:SACKS.find(s=>!s.got)||merch;}return null;}
function activeDeeds(){return Object.keys(DEEDS).filter(id=>{const s=dst(id).st;return s==='active'||s==='ready';});}
function currentTarget(){
  if(state==='cine')return null;
  if(P.carry==='stone'||P.carry==='wood')return {...DEPOT,n:'İnşaat'};
  if(G.camel&&myCamel.cargo.length>=3)return {...DEPOT,n:'İnşaat'};
  if(G.ch===1){const d=doorPt(NAMED.e_nedve);return {x:d.x,z:d.z,n:"Dâru'n-Nedve"};}
  if(G.ch===3){let b=null,bd=1e9;for(const c of CAMPS){if(G.calm[c.id])continue;const d=Math.hypot(c.x-P.x,c.z-P.z);if(d<bd){bd=d;b=c;}}return b?{x:b.x,z:b.z,n:'Ateş'}:null;}
  const act=activeDeeds();const tid=act.includes(G.track)?G.track:act[0];
  if(tid){const t=deedTarget(tid);if(t)return {x:t.x,z:t.z,n:DEEDS[tid].t};}
  if(G.ch>=2&&!G.flags.ustaMet)return {x:usta.x,z:usta.z,n:'Ustabaşı'};
  const lv=LEVELS[G.level];
  if((G.ch===2||G.ch===4)&&lv&&lv.t==='stone'&&G.stoneBank<lv.n)return {...QUARRY,n:'Taş ocağı'};
  let b=null,bd=1e9;for(const id in DEEDS){if(dst(id).st!=='open')continue;const n=DEEDS[id].giver;const d=Math.hypot(n.x-P.x,n.z-P.z);if(d<bd){bd=d;b=n;}}
  if(b)return {x:b.x,z:b.z,n:b.label};return null;}
function questMarkers(){const out=[];for(const id in DEEDS){if(dst(id).st==='open'){const n=DEEDS[id].giver;out.push({x:n.x,z:n.z});}}const t=currentTarget();if(t)out.push(t);return out;}
const mvec=new V3();
function updateMarker(){const t=(state==='play'||state==='card'||state==='dlg')?currentTarget():null;if(!t){marker.hidden=true;return;}
  marker.hidden=false;const y=height(t.x,t.z)+2.6;mvec.set(t.x,y,t.z).project(camera);
  const W=innerWidth,H=innerHeight,m=40;let behind=mvec.z>1;let x=mvec.x,yy=mvec.y;if(behind){x=-x;yy=-yy;}
  let px=(x*.5+.5)*W,py=(-yy*.5+.5)*H;const off=behind||px<m||px>W-m||py<m+80||py>H-m-60;
  px=Math.max(m,Math.min(W-m,px));py=Math.max(m+80,Math.min(H-m-60,py));
  marker.style.transform=`translate(${px}px,${py}px) translate(-50%,-100%)`;marker.classList.toggle('edge',off);
  markerTxt.textContent=t.n+' · '+Math.round(Math.hypot(P.x-t.x,P.z-t.z))+' m';}
function updateHud(dt){
  qCh.textContent=CHN[G.ch];qGoal.textContent=mainGoal();
  const ad=activeDeeds();const tid=ad.includes(G.track)?G.track:ad[0];qSub.textContent=tid?DEEDS[tid].t+': '+deedSub(tid):(G.ch===2||G.ch===4?'Yardım bekleyenler haritada ◆ ile gösterilir':'');
  const carried=(P.carry==='stone'?1:0)+(myCamel.cargo?myCamel.cargo.length:0);
  $('#r-stone b').textContent=carried+(G.camel?'/4':'');$('#r-wood b').textContent=G.wood;$('#r-good b').textContent=G.good;
  let done=0;for(let i=0;i<Math.min(G.level,LEVELS.length);i++)done+=LEVELS[i].n;$('#r-kabe b').textContent=Math.round(done/UNITS*100)+'%';
  carryEl.hidden=!P.carry&&!P.jar;carryEl.textContent=P.jar?'Testi: %'+Math.round(P.water):P.carry==='stone'?'Taş taşıyorsun: yavaşsın · Q bırak':P.carry==='sack'?'Çuval taşıyorsun · Q bırak':P.carry==='goat'?'Keçiyi taşıyorsun':'';
  if(toastT>0){toastT-=dt;if(toastT<=0)toastEl.classList.remove('on');}
}
