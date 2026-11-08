/* ===================== UI, codex, places, NPCs, followers ===================== */
const SRC={K:'TDV İA, “Kâbe”',M:'TDV İA, “Mekke”',N:'TDV İA, “Dârünnedve”',IH:'İbn Hişâm, es-Sîre',F:'Al-Furqan, “Hz. Hatice\'nin evi”',S:'Sorularla İslamiyet, “Kâbe\'nin yeniden imarı”'};
let state='title',started=false,clock=0;
const G={ch:0,flags:{},deeds:{},level:0,stoneBank:0,wood:0,good:0,found:{},camel:false,placed:false,calm:{},track:null,got:0};

/* ---------- named places (approximate, from the sources) ---------- */
const BSW=kW(KW/2,-KD/2),YEM=kW(KW/2,KD/2),SAM=kW(-KW/2,KD/2),IRQ=kW(-KW/2,-KD/2),MUL=kW(KW/2-1.6,-KD/2);
const DEPOT=kW(2,-KD/2-6.5),QUARRY={x:84,z:74},KUBEYS={x:88,z:60};
const NAMED={
  e_nedve:houses.find(h=>h.darun),
  e_hatice:houseNear(34,-50),e_ebusufyan:houseNear(50,-40),e_mevlid:houseNear(76,-80),
  e_esed:houseNear(-30,4),e_humeyd:houseNear(-20,24),e_hakim:houseNear(-46,62),e_erkam:houseNear(78,38)
};
claimed.add(NAMED.e_nedve);
const CODEX=[
  {id:'k_old',g:'Kâbe',t:'Eski Kâbe',b:"Kureyş'ten önceki Kâbe, harçsız üst üste konmuş taşlardan bir duvardı. Boyu bir adam boyundan biraz yüksekti, üstü açıktı. Hicr denen kısım da binanın içindeydi.",c:[SRC.K,SRC.IH],est:'Ölçüler yaklaşık'},
  {id:'k_esved',g:'Kâbe',t:'Rükn-i Esved',b:"Kâbe'nin doğu köşesi. Hacerü'l-Esved bu köşede, yerden yaklaşık bir buçuk metre yükseklikte durur. Tavaf bu köşeden başlar.",c:[SRC.K],at:BSW,r:4},
  {id:'k_yemani',g:'Kâbe',t:'Rükn-i Yemânî',b:"Güneye, Yemen yönüne bakan köşe.",c:[SRC.K],at:YEM,r:4},
  {id:'k_sami',g:'Kâbe',t:'Rükn-i Şâmî',b:"Batıya, Şam yönüne bakan köşe. Hicr, bu köşe ile Rükn-i Irâkî arasındadır.",c:[SRC.K],at:SAM,r:4},
  {id:'k_iraki',g:'Kâbe',t:'Rükn-i Irâkî',b:"Kuzeye, Irak yönüne bakan köşe. Kapı, bu köşe ile Rükn-i Esved arasındaki duvardadır.",c:[SRC.K],at:IRQ,r:4},
  {id:'k_multezem',g:'Kâbe',t:'Mültezem',b:"Kapı ile Hacerü'l-Esved arasındaki duvar parçası. Duvara yaslanılarak dua edilen yer olarak bilinir.",c:[SRC.K],at:MUL,r:3.2},
  {id:'k_makam',g:'Kâbe',t:"Makām-ı İbrâhim",b:"Hz. İbrâhim'in Kâbe'yi yaparken üzerine çıktığı rivayet edilen taş. Bu dönemdeki yeri tartışmalıdır; oyunda kapının önüne yakın gösterilir.",c:[SRC.K],est:'Yeri temsilî',at:MAKAM,r:3},
  {id:'k_kapi',g:'Kâbe',t:'Yükseltilmiş kapı',b:"Kureyş, Kâbe'yi yeniden yaparken kapıyı yerden yükseltti. Böylece içeriye kimin gireceğine kendileri karar verecekti.",c:[SRC.K,SRC.IH]},
  {id:'k_mizab',g:'Kâbe',t:'Mîzâb ve çatı',b:"Yeni Kâbe'ye ilk kez çatı yapıldı. Çatı içeride altı direğe dayanır; yağmur suyu kuzeybatıdaki oluktan, mîzâbdan, Hicr'e akar.",c:[SRC.K]},
  {id:'k_hicr',g:'Kâbe',t:'Hicr',b:"Kureyş'in helal parası binanın tamamına yetmedi. Kuzeybatı kısmı dışarıda bırakıldı ve alçak, yarım daire bir duvarla çevrildi. Bu yüzden yeni Kâbe eskisinden daha kısadır.",c:[SRC.K,SRC.IH]},
  {id:'y_zemzem',g:'Yerler',t:'Zemzem',b:"Kâbe'nin yanındaki kuyu. Cürhümlüler Mekke'den çıkarken kuyuyu kapattı; yerini yıllar sonra Abdülmuttalib yeniden buldu.",c:[SRC.M],at:ZEM,r:5},
  {id:'y_safa',g:'Yerler',t:'Safâ',b:"Kâbe'nin güneydoğusunda, Ebû Kubeys'in eteğindeki küçük tepe. Hz. Hâcer su ararken Safâ ile Merve arasında yedi kez gidip gelmişti.",c:[SRC.M],at:SAFA,r:10},
  {id:'y_merve',g:'Yerler',t:'Merve',b:"Safâ'nın kuzeyindeki küçük tepe. İkisi arasındaki yola Mes'â denir.",c:[SRC.M],at:MERVE,r:10},
  {id:'y_mesa',g:'Yerler',t:"Mes'â",b:"Safâ ile Merve arasındaki yol. Bu dönemde iki yanında evler ve dükkânlar vardır; çarşı burada kurulur.",c:[SRC.M],at:{x:70,z:-140},r:18},
  {id:'y_kubeys',g:'Yerler',t:'Ebû Kubeys',b:"Mekke'nin doğusundaki dağ. Kâbe'nin yeniden yapımında kullanılan taşlar çevredeki dağlardan getirildi.",c:[SRC.M,SRC.IH],at:KUBEYS,r:16},
  {id:'y_kuaykian',g:'Yerler',t:'Kuaykıân',b:"Vadinin batısındaki dağ. Mekke, Ebû Kubeys ile Kuaykıân arasındaki dar vadide, Batn-ı Mekke'dedir.",c:[SRC.M],at:{x:-82,z:-20},r:14},
  {id:'y_malat',g:'Yerler',t:"Ma'lât",b:"Şehrin yukarı kısmı. Sel suları buradan, vadinin yukarısından Kâbe'ye doğru iner. Hacûn mezarlığı da bu taraftadır.",c:[SRC.M],at:{x:20,z:-220},r:30},
  {id:'y_mesfele',g:'Yerler',t:'Mesfele',b:"Şehrin aşağı kısmı. Vadi buradan güneye, sahile doğru açılır.",c:[SRC.M],at:{x:-5,z:150},r:28},
  {id:'e_nedve',g:'Evler',t:'Dâru\'n-Nedve',b:"Kusay b. Kilâb'ın yaptırdığı meclis evi. Kureyş'in ileri gelenleri burada toplanır; savaş, barış, evlilik ve kervan kararları burada alınır. Kapısı Kâbe'ye açılır.",c:[SRC.N,SRC.M],est:'Planı temsilî',house:'e_nedve'},
  {id:'e_hatice',g:'Evler',t:"Hz. Hatice'nin evi",b:"Mescid'in kuzeydoğusunda, Abdüşems oğullarının mahallesinde, Attârîn (sonra Hacer) sokağındadır. Hz. Fâtıma burada doğdu.",c:[SRC.F],est:'Konum yaklaşık',house:'e_hatice'},
  {id:'e_ebusufyan',g:'Evler',t:"Ebû Süfyân'ın evi",b:"Abdüşems oğulları mahallesinde, Hz. Hatice'nin evinin bitişiğindedir.",c:[SRC.F],est:'Konum yaklaşık',house:'e_ebusufyan'},
  {id:'e_mevlid',g:'Evler',t:"Mevlid: Efendimiz'in doğduğu ev",b:"Hâşim oğullarının mahallesinde, Ebû Kubeys'in eteğindedir. Efendimiz (s.a.v.) bu evde doğdu.",c:[SRC.F,SRC.M],est:'Konum yaklaşık',house:'e_mevlid'},
  {id:'e_esed',g:'Evler',t:"Esed b. Abdüluzzâ'nın evi",b:"Kâbe'nin batısında, ona birkaç zirâ uzaklıktadır. Kâbe'ye bu kadar yakın olduğu için \"Kâbe'nin bebeği\" diye anılırdı.",c:[SRC.F],est:'Konum yaklaşık',house:'e_esed'},
  {id:'e_humeyd',g:'Evler',t:"Humeyd b. Züheyr'in evi",b:"Kâbe'nin hemen arkasındaydı. Daha sonra Kâbe'ye bağışlandı.",c:[SRC.F],est:'Konum yaklaşık',house:'e_humeyd'},
  {id:'e_hakim',g:'Evler',t:"Hakîm b. Hizâm'ın evi",b:"Mescid'in güneybatısında, Hizâmiyye yolu üzerindedir. Hakîm, Hz. Hatice'nin yeğenidir.",c:[SRC.F],est:'Konum yaklaşık',house:'e_hakim'},
  {id:'e_erkam',g:'Evler',t:"Erkam'ın ailesinin evi",b:"Safâ tepesinin üzerindedir. Yıllar sonra Müslümanların gizlice toplandığı Dârü'l-Erkam olacaktır.",c:[SRC.M],est:'Konum yaklaşık',house:'e_erkam'},
  {id:'o_sel',g:'Olaylar',t:'Sel',b:"Kışın vadinin yukarısından gelen sel Kâbe'nin duvarlarını çatlattı. Üstü açık olan binanın çökmesinden ve içindeki eşyaların çalınmasından korkuldu.",c:[SRC.K,SRC.S]},
  {id:'o_helal',g:'Olaylar',t:'Helal şartı',b:"Kureyş, Kâbe'nin yapımına yalnızca helal kazancın girmesini şart koştu. Fâiz, zulüm ve haksız kazançla elde edilen hiçbir mal kabul edilmeyecekti.",c:[SRC.IH,SRC.K]},
  {id:'o_bolum',g:'Olaylar',t:'İşbölümü',b:"Her boya bir duvar düştü: kapının olduğu yüzü Abdümenâf ve Zühre, Hacerü'l-Esved ile Yemânî köşesi arasını Mahzûm, arka yüzü Cumah ve Sehm, Hicr tarafını Abdüddâr, Esed ve Adî oğulları yaptı.",c:[SRC.IH]},
  {id:'o_yilan',g:'Olaylar',t:'Yılan ve kartal',b:"Kâbe'nin içindeki kuyudan çıkan büyük bir yılan her gün duvarın üstünde güneşlenir, yaklaşanları korkuturdu. Bir gün bir kartal onu kapıp götürdü. Kureyş bunu işe başlamak için hayra yordu.",c:[SRC.IH,SRC.S]},
  {id:'o_temel',g:'Olaylar',t:'Yeşil taşlar',b:"Yıkıma Velîd b. Muğîre başladı; insanlar ona bir şey olur mu diye bir gece bekledi. Temele inince deve hörgücü gibi birbirine geçmiş yeşil taşlara ulaştılar: Hz. İbrâhim'in temeli. Oraya dokunmadılar.",c:[SRC.IH,SRC.S]},
  {id:'o_gemi',g:'Olaylar',t:'Gemi kerestesi',b:"Bizanslı bir tüccarın gemisi Cidde kıyısında karaya oturdu. Kureyş geminin kerestesini satın aldı ve bir marangozla anlaştı. Duvarlar bir sıra taş, bir sıra ahşap olarak örüldü.",c:[SRC.IH,SRC.K]},
  {id:'o_hakem',g:'Olaylar',t:'Hacerü\'l-Esved hakemliği',b:"Duvar Hacerü'l-Esved'in hizasına gelince her boy taşı yerine koyma şerefini istedi. Kanlı yeminler edildi, dört beş gece gerginlikle geçti. Sonunda kapıdan ilk girenin hakem olmasına razı oldular.",c:[SRC.IH,SRC.S]},
  {id:'o_fil',g:'Olaylar',t:'Fil Vakası',b:"Yaklaşık otuz beş yıl önce Ebrehe filli bir orduyla Kâbe'yi yıkmaya geldi. Ordu Mekke'ye giremeden helak oldu. Mekkeliler o yıla Fil Yılı der.",c:[SRC.M]}
];
const CX={};CODEX.forEach(e=>{CX[e.id]=e;if(e.house){const h=NAMED[e.house];if(h){e.at=doorPt(h);e.r=7;h.name=e.t;h.cid=e.id;}}});
CX.e_mevlid.r=9;

/* ---------- HUD bits ---------- */
const hud=$('#hud'),qCh=$('#q-ch'),qGoal=$('#q-goal'),qSub=$('#q-sub'),toastEl=$('#toast');
const promptEl=$('#prompt'),promptTxt=promptEl.querySelector('span'),tAct=$('#t-act'),tBtns=$('#tbtns'),hintEl=$('#hint'),carryEl=$('#carry');
const card=$('#cardwrap'),cardGo=$('#card-go'),marker=$('#marker'),markerTxt=marker.querySelector('.txt');
const dlgWrap=$('#dlgwrap'),dlgWho=dlgWrap.querySelector('.who'),dlgSay=dlgWrap.querySelector('.say'),dlgOpts=dlgWrap.querySelector('.opts'),dlgTen=dlgWrap.querySelector('.tension'),dlgTenBar=dlgTen.querySelector('i');
let toastT=0;
function toast(t,dur){toastEl.textContent=t;toastEl.classList.add('on');toastT=dur||3.2;}
function pop(id){const el=$('#'+id);el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop');setTimeout(()=>el.classList.remove('pop'),220);}
let cardCb=null,resumeState='play';
function showCard(eb,d,btn,cb){card.querySelector('.eb').textContent=eb;card.querySelector('h2').textContent=d.t;card.querySelector('.t').textContent=d.b;
  const ch=card.querySelector('.chips');ch.innerHTML='';for(const t of (d.c||[])){const s=document.createElement('span');s.className='chip';s.textContent=t;ch.appendChild(s);}
  if(d.est){const s=document.createElement('span');s.className='chip est';s.textContent=d.est;ch.appendChild(s);}
  cardGo.textContent=btn||'Devam';card.hidden=false;state='card';cardCb=cb||null;for(const k in keys)keys[k]=false;setTimeout(()=>cardGo.focus({preventScroll:true}),50);}
cardGo.addEventListener('click',()=>{card.hidden=true;state='play';const cb=cardCb;cardCb=null;sfx.ui();if(cb)cb();if(state==='play')cv.focus({preventScroll:true});});
// dialog: lines = [{who,say,opts:[{t,fn,main}]}]
function dialog(who,say,opts,ten){
  dlgWho.textContent=who;dlgSay.textContent=say;dlgOpts.innerHTML='';
  if(ten!=null){dlgTen.hidden=false;dlgTenBar.style.width=Math.max(4,Math.min(100,ten))+'%';}else dlgTen.hidden=true;
  (opts&&opts.length?opts:[{t:'Devam',main:true}]).forEach((o,i)=>{const b=document.createElement('button');b.className='opt'+(o.main||!opts||opts.length===1?' main':'');
    b.textContent=(opts&&opts.length>1?(i+1)+'. ':'')+o.t;b.addEventListener('click',()=>{sfx.ui();dlgWrap.hidden=true;state='play';if(o.fn)o.fn();});dlgOpts.appendChild(b);});
  dlgWrap.hidden=false;state='dlg';for(const k in keys)keys[k]=false;setTimeout(()=>{const b=dlgOpts.firstChild;b&&b.focus({preventScroll:true});},40);}
function talk(lines,done){let i=0;const next=()=>{if(i>=lines.length){if(done)done();return;}const l=lines[i++];dialog(l[0],l[1],[{t:i<lines.length?'Devam':(l[2]||'Tamam'),main:true,fn:next}]);};next();}
function discover(id,quiet){if(G.found[id])return false;G.found[id]=true;sfx.page();$('#bookdot').hidden=false;const e=CX[id];if(!quiet)toast('Defter: '+e.t,3.4);save();return true;}

/* ---------- Mekke Defteri ---------- */
const bookEl=$('#book'),mapEl=$('#map');let bookSel=null;
function overlay(){return !bookEl.hidden||!mapEl.hidden;}
function closeOverlays(){bookEl.hidden=true;mapEl.hidden=true;if(state==='play')cv.focus({preventScroll:true});}
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',closeOverlays));
for(const el of [bookEl,mapEl])el.addEventListener('click',e=>{if(e.target===el)closeOverlays();});
function renderBook(){const list=$('#book-list');list.innerHTML='';let n=0;
  for(const grp of ['Kâbe','Evler','Yerler','Olaylar','Sözler']){const h=document.createElement('div');h.className='grp';h.textContent=grp;list.appendChild(h);
    for(const e of CODEX.filter(x=>x.g===grp)){const f=!!G.found[e.id];if(f)n++;const b=document.createElement('button');b.className='it'+(f?'':' lock');b.innerHTML='<i></i>';
      b.appendChild(document.createTextNode(f?e.t:'???'));b.setAttribute('aria-current',bookSel===e.id?'true':'false');
      b.addEventListener('click',()=>{bookSel=e.id;renderBook();});list.appendChild(b);}}
  $('#book-meta').textContent=n+' / '+CODEX.length+' kayıt';
  const d=$('#book-detail');const e=CX[bookSel];
  if(!e){d.innerHTML='<h3>Mekke Defteri</h3><p>Şehirde dolaştıkça evleri, yerleri ve Kâbe\'nin bölümlerini öğrenirsin. Olaylar hikâye ilerledikçe yazılır.</p><p>Kilitli bir kayıt için yaklaşık yerini haritada ara.</p>';return;}
  if(!G.found[e.id]){d.innerHTML='<h3>???</h3><p>'+(e.at?'Henüz keşfedilmedi. Haritada bu bölgeyi gez.':'Hikâye ilerledikçe açılacak.')+'</p>';return;}
  d.innerHTML='';const t=document.createElement('h3');t.textContent=e.t;d.appendChild(t);const p=document.createElement('p');p.textContent=e.b;d.appendChild(p);
  const ch=document.createElement('div');ch.className='chips';for(const c of e.c||[]){const s=document.createElement('span');s.className='chip';s.textContent=c;ch.appendChild(s);}
  if(e.est){const s=document.createElement('span');s.className='chip est';s.textContent=e.est;ch.appendChild(s);}d.appendChild(ch);}
function openBook(){if(state!=='play')return;$('#bookdot').hidden=true;bookEl.hidden=false;renderBook();for(const k in keys)keys[k]=false;setTimeout(()=>bookEl.querySelector('.x').focus(),30);}
$('#b-book').addEventListener('click',openBook);

/* ---------- map ---------- */
const mapC=$('#mapc'),mctx=mapC.getContext('2d');
function openMap(){if(state!=='play')return;mapEl.hidden=false;for(const k in keys)keys[k]=false;requestAnimationFrame(drawMap);setTimeout(()=>mapEl.querySelector('.x').focus(),30);}
$('#b-map').addEventListener('click',openMap);
function drawMap(){
  const W=mapC.clientWidth,H=mapC.clientHeight,dpr=Math.min(2,devicePixelRatio||1);mapC.width=W*dpr;mapC.height=H*dpr;const c=mctx;c.setTransform(dpr,0,0,dpr,0,0);
  // rotate so north (−z) is up: screen x = world x, screen y = world z
  const x0=-110,x1=120,z0=-330,z1=200,s=Math.min(W/(x1-x0),H/(z1-z0)),ox=(W-(x1-x0)*s)/2-x0*s,oy=(H-(z1-z0)*s)/2-z0*s;
  const X=x=>ox+x*s,Y=z=>oy+z*s;
  c.fillStyle='#b9a07c';c.fillRect(0,0,W,H);
  for(let z=z0;z<=z1;z+=6){const cx=-.06*z;c.fillStyle='#ead9b8';c.fillRect(X(cx-86),Y(z),172*s,6*s+1);}
  c.fillStyle='rgba(90,70,50,.25)';c.beginPath();c.arc(X(KUBEYS.x+60),Y(KUBEYS.z-20),60*s,0,7);c.fill();
  for(const h of houses){c.save();c.translate(X(h.x),Y(h.z));c.rotate(-h.th);const named=h.cid&&G.found[h.cid];c.fillStyle=named?'#b5523b':'#8d7a66';c.fillRect(-h.w/2*s,-h.d/2*s,h.w*s,h.d*s);c.restore();}
  c.save();c.translate(X(0),Y(0));c.rotate(-KROT);c.fillStyle='#2a211b';c.fillRect(-KW/2*s,-KD/2*s,KW*s,KD*s);c.restore();
  for(const [p,n] of [[SAFA,'Safâ'],[MERVE,'Merve']]){c.fillStyle='#7a6553';c.beginPath();c.arc(X(p.x),Y(p.z),6*s,0,7);c.fill();}
  c.font='700 12px "Alegreya Sans",sans-serif';c.textAlign='center';
  const label=(x,z,t,col)=>{c.fillStyle='rgba(255,249,238,.85)';const w=c.measureText(t).width+10;c.fillRect(X(x)-w/2,Y(z)-22,w,16);c.fillStyle=col||'#2a211b';c.fillText(t,X(x),Y(z)-10);};
  label(0,-8,'Kâbe');label(SAFA.x,SAFA.z,'Safâ');label(MERVE.x,MERVE.z,'Merve');
  if(G.ch>=2)label(QUARRY.x,QUARRY.z,'Taş ocağı');
  for(const e of CODEX){if(!e.house||!G.found[e.id])continue;label(e.at.x,e.at.z,e.t.replace(/'nin evi|'ın evi|'in evi|'un evi/,'').replace("Mevlid: Efendimiz'in doğduğu ev",'Mevlid'),'#b5523b');}
  for(const q of questMarkers()){c.fillStyle='#d39a2c';c.save();c.translate(X(q.x),Y(q.z));c.rotate(Math.PI/4);c.fillRect(-5,-5,10,10);c.restore();}
  c.save();c.translate(X(P.x),Y(P.z));c.rotate(-P.face+Math.PI);c.fillStyle='#1f6f78';c.beginPath();c.moveTo(0,-9);c.lineTo(6,7);c.lineTo(0,3);c.lineTo(-6,7);c.closePath();c.fill();c.strokeStyle='#fff';c.lineWidth=2;c.stroke();c.restore();
  c.fillStyle='#2a211b';c.font='800 14px "Alegreya Sans",sans-serif';c.fillText('K ↑',W-30,24);
}

/* ---------- compass ---------- */
const compassEl=$('#compass');const CMP=[];
for(const [t,a] of [['K',0],['KD',45],['D',90],['GD',135],['G',180],['GB',225],['B',270],['KB',315]]){const s=document.createElement('span');s.textContent=t;compassEl.appendChild(s);CMP.push({el:s,a:a*Math.PI/180});}
const cmpQ=document.createElement('span');cmpQ.className='q';compassEl.appendChild(cmpQ);
const cmpK=document.createElement('span');cmpK.className='k';compassEl.appendChild(cmpK);
function bearingTo(x,z){return Math.atan2(x-P.x,-(z-P.z));}
function updateCompass(){const W=compassEl.clientWidth;const head=Math.atan2(-Math.sin(cam.yaw),-(-Math.cos(cam.yaw)));
  // camera looks toward -back vector: forward = (-sin yaw, -cos yaw) in (x,z); bearing measured from north (−z) clockwise
  const fwd=Math.atan2(-Math.sin(cam.yaw),Math.cos(cam.yaw));
  const place=(el,a)=>{let d=a-fwd;d=Math.atan2(Math.sin(d),Math.cos(d));const x=W/2+d/(Math.PI*.75)*W/2;el.style.left=x+'px';el.style.display=Math.abs(d)<Math.PI*.8?'':'none';};
  for(const c of CMP)place(c.el,c.a);const q=currentTarget();if(q){cmpQ.style.visibility='visible';place(cmpQ,bearingTo(q.x,q.z));}else cmpQ.style.visibility='hidden';place(cmpK,bearingTo(0,0));}

/* ---------- labels above people and named houses ---------- */
const labelsEl=$('#labels');const LBL=[];for(let i=0;i<14;i++){const d=document.createElement('div');d.className='lbl';d.hidden=true;labelsEl.appendChild(d);LBL.push(d);}
const lv=new V3();
function updateLabels(){let i=0;if(state==='title'||state==='cine'||state==='menu'){for(const l of LBL)l.hidden=true;return;}
  const W=innerWidth,H=innerHeight;const cand=[];
  for(const n of NPCS){if(!n.g.visible||!n.label)continue;const d=Math.hypot(n.x-P.x,n.z-P.z);const st=n.mark?n.mark():'';if(d<(st?34:9))cand.push({x:n.x,y:n.y+(n.lh||1.75),z:n.z,t:n.label,c:st,d});}
  for(const k in NAMED){const h=NAMED[k];if(!h||!G.found[h.cid])continue;const p=doorPt(h);const d=Math.hypot(p.x-P.x,p.z-P.z);if(d<40)cand.push({x:h.x,y:h.y0+h.H+(h.up?3.6:1.0),z:h.z,t:h.name.replace("Mevlid: Efendimiz'in doğduğu ev",'Mevlid'),c:'',d});}
  cand.sort((a,b)=>a.d-b.d);
  for(const c of cand){if(i>=LBL.length)break;lv.set(c.x,c.y,c.z).project(camera);if(lv.z>1||lv.x<-1.1||lv.x>1.1||lv.y<-1.1||lv.y>1.1)continue;const el=LBL[i++];el.hidden=false;
    el.textContent=c.t;el.className='lbl'+(c.c?' '+c.c:'');el.style.transform=`translate(${(lv.x*.5+.5)*W}px,${(-lv.y*.5+.5)*H}px) translate(-50%,-100%)`;el.style.opacity=c.d>28?.7:1;}
  for(;i<LBL.length;i++)LBL[i].hidden=true;}

/* ---------- NPCs ---------- */
const NPCS=[];
function npc(o){const p=makePerson(o.look||{});const s=freeSpot(o.x,o.z,.45);const n={...p,id:o.id,label:o.label,x:s.x,z:s.z,y:height(s.x,s.z),face:o.face!=null?o.face:Math.random()*6,mode:o.mode||'idle',speed:0,mark:o.mark,lh:1.75*(o.look&&o.look.scale||1),wander:o.wander,home:{x:s.x,z:s.z},tgt:null,wait:Math.random()*3,talkR:o.talkR||2.4};
  n.g.position.set(n.x,n.y,n.z);n.g.rotation.y=n.face;scene.add(n.g);NPCS.push(n);return n;}
function faceTo(n,x,z){n.face=Math.atan2(x-n.x,z-n.z);}
function updateNPCs(dt){
  for(const n of NPCS){if(!n.g.visible)continue;let sp=0;
    if(n.follow){const t=n.follow,d=Math.hypot(t.x-n.x,t.z-n.z);if(d>18){const s=freeSpot(t.x-Math.sin(P.face)*2.5,t.z-Math.cos(P.face)*2.5,.5);n.x=s.x;n.z=s.z;}else if(d>2.2){const v=Math.min(d>8?5:3.1,d*1.4);const dx=(t.x-n.x)/d,dz=(t.z-n.z)/d;n.x+=dx*v*dt;n.z+=dz*v*dt;sp=v;n.face=Math.atan2(dx,dz);collideEnt(n,.32,n.y);}}
    else if(n.path){const t=n.path[n.pi];const d=Math.hypot(t.x-n.x,t.z-n.z);if(d<.4){n.pi=(n.pi+1)%n.path.length;n.wait=n.pathWait||0;}else if(n.wait>0)n.wait-=dt;else{const v=n.walk||1.6;n.x+=(t.x-n.x)/d*v*dt;n.z+=(t.z-n.z)/d*v*dt;sp=v;n.face=Math.atan2(t.x-n.x,t.z-n.z);}}
    else if(n.wander){if(n.wait>0){n.wait-=dt;}else if(!n.tgt){const a=Math.random()*6.28,r=4+Math.random()*n.wander;const s=freeSpot(n.home.x+Math.cos(a)*r,n.home.z+Math.sin(a)*r,.5);n.tgt=s;}
      else{const t=n.tgt,d=Math.hypot(t.x-n.x,t.z-n.z);if(d<.5){n.tgt=null;n.wait=2+Math.random()*5;}else{const v=1.3;n.x+=(t.x-n.x)/d*v*dt;n.z+=(t.z-n.z)/d*v*dt;sp=v;n.face=Math.atan2(t.x-n.x,t.z-n.z);const bx=n.x,bz=n.z;collideEnt(n,.32,n.y);if(Math.hypot(bx-n.x,bz-n.z)>.02*v)n.tgt=null;}}}
    const near=Math.hypot(P.x-n.x,P.z-n.z);
    if(sp<.1&&n.label&&near<5&&state!=='cine'){let d=Math.atan2(P.x-n.x,P.z-n.z)-n.face;d=Math.atan2(Math.sin(d),Math.cos(d));n.face+=d*Math.min(1,dt*4);}
    n.y=height(n.x,n.z);if(n.onRoof!=null)n.y=n.onRoof;
    n.g.position.set(n.x,n.y,n.z);n.g.rotation.y=n.face;
    animPerson(n,dt,sp,sp>.1?(n.carrying?'carry':'walk'):n.mode);}
}

/* ---------- followers: lambs, sheep, camel, a lost traveller ---------- */
const ANIMALS=[];
function animal(kind,x,z){const a=kind==='horse'?makeHorse():kind==='camel'?makeCamel():kind==='goat'?makeGoat():makeSheep();const s=freeSpot(x,z,.4);
  const o={...a,x:s.x,z:s.z,y:height(s.x,s.z),face:Math.random()*6,follow:null,dist:kind==='camel'?.6:1.6,speed:0,graze:kind!=='camel',home:{x:s.x,z:s.z},wait:Math.random()*4,tgt:null,carried:false,pen:null};
  o.g.position.set(o.x,o.y,o.z);scene.add(o.g);ANIMALS.push(o);return o;}
function updateAnimals(dt){
  let fi=0;
  for(const a of ANIMALS){if(!a.g.visible)continue;let sp=0;
    if(a.ridden){a.x=P.x;a.z=P.z;a.face=P.face;a.y=height(a.x,a.z);a.g.position.set(a.x,a.y,a.z);a.g.rotation.y=a.face;a.g.scale.setScalar(1);animAnimal(a,dt,P.speed*.8);continue;}
    if(a.carried){a.x=P.x;a.z=P.z;a.y=P.y+1.18;a.face=P.face+Math.PI/2;a.g.position.set(a.x,a.y,a.z);a.g.rotation.y=a.face;a.g.scale.setScalar(.75);animAnimal(a,dt,0);continue;}
    a.g.scale.setScalar(a.kind==='camel'?1:(a.lamb?.7:1));
    if(a.follow){let t=a.follow;if(a.kind==='camel'&&t===P){t={x:P.x+Math.cos(P.face)*2.4-Math.sin(P.face)*1.2,z:P.z-Math.sin(P.face)*2.4-Math.cos(P.face)*1.2};}const want=a.dist+(a.kind==='camel'?0:(fi++)*.9);const d=Math.hypot(t.x-a.x,t.z-a.z);
      if(d>want){const v=Math.min(d>9?6.4:(a.kind==='camel'?3.4:3.8),(d-want)*2.2);const dx=(t.x-a.x)/d,dz=(t.z-a.z)/d;a.x+=dx*v*dt;a.z+=dz*v*dt;sp=v;
        let df=Math.atan2(dx,dz)-a.face;df=Math.atan2(Math.sin(df),Math.cos(df));a.face+=df*Math.min(1,dt*6);}
      if(d>18){const s=freeSpot(t.x-Math.sin(P.face)*3-(Math.random()-.5)*2,t.z-Math.cos(P.face)*3-(Math.random()-.5)*2,.6);a.x=s.x;a.z=s.z;}
      for(const b of ANIMALS){if(b===a||!b.g.visible||b.carried)continue;const dx=a.x-b.x,dz=a.z-b.z,dd=Math.hypot(dx,dz),m=a.kind==='camel'||b.kind==='camel'?1.4:.8;if(dd<m&&dd>1e-4){a.x+=dx/dd*(m-dd)*.5;a.z+=dz/dd*(m-dd)*.5;}}
      collideEnt(a,a.kind==='camel'?.7:.35,a.y);}
    else if(a.pen){if(a.wait>0)a.wait-=dt;else{if(!a.tgt){const r=Math.random()*a.pen.r,an=Math.random()*6.28;a.tgt={x:a.pen.x+Math.cos(an)*r,z:a.pen.z+Math.sin(an)*r};}
      const t=a.tgt,d=Math.hypot(t.x-a.x,t.z-a.z);if(d<.3){a.tgt=null;a.wait=1+Math.random()*4;}else{const v=.8;a.x+=(t.x-a.x)/d*v*dt;a.z+=(t.z-a.z)/d*v*dt;sp=v;a.face=Math.atan2(t.x-a.x,t.z-a.z);}}}
    else if(a.graze){if(a.wait>0)a.wait-=dt;else{if(!a.tgt){const an=Math.random()*6.28,r=Math.random()*3;a.tgt={x:a.home.x+Math.cos(an)*r,z:a.home.z+Math.sin(an)*r};}
      const t=a.tgt,d=Math.hypot(t.x-a.x,t.z-a.z);if(d<.3){a.tgt=null;a.wait=2+Math.random()*5;}else{const v=.6;a.x+=(t.x-a.x)/d*v*dt;a.z+=(t.z-a.z)/d*v*dt;sp=v;a.face=Math.atan2(t.x-a.x,t.z-a.z);}}}
    a.y=a.onRoof!=null?a.onRoof:height(a.x,a.z);a.g.position.set(a.x,a.y,a.z);a.g.rotation.y=a.face;animAnimal(a,dt,sp);
    if(a.kind!=='camel'&&Math.random()<dt*.04&&Math.hypot(a.x-P.x,a.z-P.z)<22)sfx.bleat();}
}
function camelLoadVis(c){while(c.load.children.length)c.load.remove(c.load.children[0]);c.cargo=c.cargo||[];
  c.cargo.forEach((t,i)=>{const m=itemMesh(t);m.position.set(i%2?.32:-.32,.15+Math.floor(i/2)*.32,0);if(t==='wood')m.rotation.y=Math.PI/2;m.scale.setScalar(.85);c.load.add(m);});}

/* ---------- props: depot, quarry, firewood, pen, fires ---------- */
const PROPS={};
{ // depot: cloth mat, stacks that grow, master builder's shade
  const g=new THREE.Group();g.position.set(DEPOT.x,height(DEPOT.x,DEPOT.z),DEPOT.z);g.rotation.y=KROT;scene.add(g);
  const mat_=new THREE.Mesh(new THREE.BoxGeometry(5,.04,3.4),mat.awn);mat_.position.y=.02;mat_.receiveShadow=true;g.add(mat_);
  PROPS.stoneStack=new THREE.Group();PROPS.stoneStack.position.set(-1.3,0,0);g.add(PROPS.stoneStack);
  PROPS.woodStack=new THREE.Group();PROPS.woodStack.position.set(1.3,0,0);g.add(PROPS.woodStack);
  PROPS.depotG=g;
}
function refreshStacks(){
  const ss=PROPS.stoneStack,ws=PROPS.woodStack;while(ss.children.length)ss.remove(ss.children[0]);while(ws.children.length)ws.remove(ws.children[0]);
  for(let i=0;i<Math.min(12,G.stoneBank);i++){const m=new THREE.Mesh(stoneGeo,stoneMat);m.position.set((i%3-1)*.62,.25+Math.floor(i/3)*.45,((i>>1)%2-.5)*.4);m.rotation.y=i;m.castShadow=true;ss.add(m);}
  for(let i=0;i<Math.min(10,G.wood);i++){const m=new THREE.Mesh(plankGeo,mat.wood);m.position.set(0,.07+i*.13,(i%2-.5)*.38);m.rotation.y=Math.PI/2;m.castShadow=true;ws.add(m);}
}
{ // quarry: broken rock face with loose stones
  const g=new THREE.Group();g.position.set(QUARRY.x,height(QUARRY.x,QUARRY.z),QUARRY.z);scene.add(g);
  const rm=Lm(0xa08670);for(let i=0;i<9;i++){const m=new THREE.Mesh(new THREE.DodecahedronGeometry(.6+Math.random()*.9,0),rm);m.position.set((Math.random()-.5)*7,.3,(Math.random()-.5)*7);m.rotation.set(Math.random()*3,Math.random()*3,0);m.castShadow=m.receiveShadow=true;g.add(m);}
  PROPS.qStones=[];for(let i=0;i<4;i++){const a=i/4*6.28+.4,x=QUARRY.x+Math.cos(a)*2.4,z=QUARRY.z+Math.sin(a)*2.4;const m=new THREE.Mesh(stoneGeo,stoneMat);m.position.set(x,height(x,z)+.22,z);m.castShadow=true;scene.add(m);PROPS.qStones.push(m);}
  const pick=new THREE.Mesh(new THREE.BoxGeometry(.08,.08,1.1),mat.darkWood);pick.position.set(QUARRY.x+1,height(QUARRY.x+1,QUARRY.z-1)+.06,QUARRY.z-1);pick.rotation.y=.6;scene.add(pick);
  g.visible=false;PROPS.qStones.forEach(s=>s.visible=false);PROPS.quarryG=g;
}
const BRUSH=[];
{ const r=mulberry32(55);for(let t=0;t<600&&BRUSH.length<10;t++){const z=-170+r()*300,side=r()<.5?-1:1,x=side*(70+r()*12)-.06*z;if(blockedAt(x,z,.8))continue;
    const m=itemMesh('brush');m.position.set(x,height(x,z)+.2,z);m.rotation.y=r()*6;scene.add(m);BRUSH.push({m,x,z,got:false});}}
{ // the shepherd's pen (ağıl): thorn-brush fence on posts, hidden until built
  const g=new THREE.Group();scene.add(g);PROPS.pen=g;g.visible=false;
}
function buildPen(x,z){const g=PROPS.pen;g.position.set(x,height(x,z),z);const post=new THREE.CylinderGeometry(.06,.07,1.1,6);
  for(let i=0;i<14;i++){const a=i/14*6.283;if(i===3)continue;const px=Math.cos(a)*3.4,pz=Math.sin(a)*3.4;const p=new THREE.Mesh(post,mat.darkWood);p.position.set(px,.55,pz);p.castShadow=true;g.add(p);
    const a2=(i+1)/14*6.283;if(i+1===3)continue;const qx=Math.cos(a2)*3.4,qz=Math.sin(a2)*3.4;const br=new THREE.Mesh(new THREE.CylinderGeometry(.16,.18,Math.hypot(qx-px,qz-pz),6),bushMat);
    br.position.set((px+qx)/2,.55,(pz+qz)/2);br.rotation.z=Math.PI/2;br.rotation.y=-Math.atan2(qz-pz,qx-px);br.castShadow=true;g.add(br);}
  g.visible=true;}
const FIRES=[];
function addFire(x,z){const g=new THREE.Group();g.position.set(x,height(x,z),z);scene.add(g);
  for(let i=0;i<5;i++){const l=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.8,5),mat.darkWood);l.rotation.z=Math.PI/2;l.rotation.y=i*1.25;l.position.y=.08;g.add(l);}
  const fl=new THREE.Mesh(new THREE.ConeGeometry(.3,.8,7),new THREE.MeshBasicMaterial({color:0xffa040,transparent:true,opacity:.9}));fl.position.y=.45;g.add(fl);
  const fl2=new THREE.Mesh(new THREE.ConeGeometry(.17,.55,6),new THREE.MeshBasicMaterial({color:0xffe08a}));fl2.position.y=.38;g.add(fl2);
  const pl=new THREE.PointLight(0xff9a48,0,16,2);pl.position.y=1.2;g.add(pl);const f={g,fl,fl2,pl,on:false};FIRES.push(f);g.visible=false;return f;}
function stepFires(){for(const f of FIRES){if(!f.g.visible)continue;const k=1+Math.sin(clock*13+f.g.position.x)*.12+Math.sin(clock*7.3)*.08;f.fl.scale.set(1,k,1);f.fl2.scale.set(1,k*1.1,1);f.pl.intensity=1.6*k;}}
