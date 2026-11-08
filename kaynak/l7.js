/* ===================== clarity pass: who the enemies are, how to fight, how to ride ===================== */
/* ---------- camel button (and C key): mount, dismount, or call the camel to you ---------- */
{const b=document.createElement('button');b.className='ibtn';b.id='b-camel';b.hidden=true;b.setAttribute('aria-label',L2('Deve (C)','Camel (C)'));
  b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="#2a211b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17v-4c0-2 1.5-3 3-3l1.5-3h2l1 3h1l1.5-3h2l1.5 3c1.5 0 2.5 1 2.5 3v1"/><path d="M5 17v3M10 17v3M15 17v3M19 14v6"/><path d="M19 9l2-3"/></svg>';
  $('#b-book').before(b);b.addEventListener('click',camelButton);}
function camelButton(){if(state!=='play')return;const c=RC();if(!c&&!P.ride)return;
  if(P.ride){dismount();return;}
  if(P.carry||P.jar){toast(L2('Önce taşıdığını bırak.','Put down what you are carrying first.'));return;}
  if(Math.hypot(c.x-P.x,c.z-P.z)<3){mount();return;}
  const s=freeSpot(P.x-Math.sin(P.face)*2.2+Math.cos(P.face)*1.2,P.z-Math.cos(P.face)*2.2-Math.sin(P.face)*1.2,.7);c.x=s.x;c.z=s.z;c.follow=P;c.pen=null;sfx.camel();puff(c.x,height(c.x,c.z),c.z,6);
  toast(L2('Deven yanına geldi. Binmek için Deve düğmesine (C) yeniden bas.','Your camel has come. Press the Camel button (C) again to ride.'),4);}
addEventListener('keydown',e=>{if(e.code==='KeyC'&&state==='play'&&!overlay()){e.preventDefault();camelButton();}});

/* ---------- soldiers: red cloaks, nameplates with a health bar and their state ---------- */
const capeM=new THREE.MeshLambertMaterial({color:0xa3261c,side:THREE.DoubleSide});
function addCape(p){const c=new THREE.Mesh(new THREE.PlaneGeometry(.52,.85),capeM);c.position.set(0,.68,-.25);c.rotation.x=.12;c.castShadow=true;p.body.add(c);}
for(const e of ENEMIES)if(e.type!=='cook')addCape(e);
const ms0=makeSoldier;makeSoldier=function(t){const p=ms0(t);if(t!=='cook')addCape(p);return p;};
const elab=document.createElement('div');elab.className='labels';document.body.appendChild(elab);
const EST=document.createElement('style');EST.textContent=`.elb{position:absolute;left:0;top:0;transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;gap:3px;pointer-events:none;white-space:nowrap}
.elb b{font:800 12px var(--f-ui);color:#fff;background:rgba(120,24,18,.82);border-radius:999px;padding:2px 8px}
.elb.s b{background:rgba(79,138,74,.9)}.elb.d b{background:rgba(60,52,46,.75)}.elb.c b{background:rgba(31,111,120,.88)}
.elb i{display:block;width:54px;height:6px;border-radius:9px;background:rgba(0,0,0,.35);overflow:hidden}.elb i u{display:block;height:100%;background:#e0503c}
.elb.w b{animation:wb .25s steps(2) infinite}@keyframes wb{50%{background:#e8b030;color:#2a211b}}
#ctips{position:fixed;left:max(16px,env(safe-area-inset-left,0px));top:calc(env(safe-area-inset-top,0px) + 120px);z-index:2;background:var(--panel);border-radius:14px;padding:10px 14px;box-shadow:var(--shadow);max-width:min(300px,70vw);font-size:13.5px;line-height:1.4;pointer-events:auto}
#ctips h3{margin:0 0 4px;font:800 11px var(--f-ui);letter-spacing:.14em;text-transform:uppercase;color:var(--rose)}#ctips p{margin:0 0 3px}#ctips kbd{font:800 12px var(--f-ui);background:var(--ink);color:#fff;border-radius:5px;padding:0 6px}
#ctips button{position:absolute;right:6px;top:4px;border:0;background:none;font-size:18px;width:32px;height:32px}
@media (max-width:560px){#ctips{top:calc(env(safe-area-inset-top,0px) + 150px);font-size:12px;padding:8px 12px;max-width:62vw}}`;document.head.appendChild(EST);
const EL=[];for(let i=0;i<10;i++){const d=document.createElement('div');d.className='elb';d.hidden=true;d.innerHTML='<b></b><i><u></u></i>';elab.appendChild(d);EL.push(d);}
const ev3=new V3();
function updateEnemyLabels(){let k=0;
  if(MODE==='p2'&&started&&(state==='play'||state==='dlg')){const W=innerWidth,H=innerHeight;
    const list=ENEMIES.filter(e=>e.g.visible&&e.st!=='gone'&&Math.hypot(e.x-P.x,e.z-P.z)<26).sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z));
    let named=0;for(const e of list){if(k>=EL.length)break;ev3.set(e.x,e.y+2.15,e.z).project(camera);if(ev3.z>1||Math.abs(ev3.x)>1.1||Math.abs(ev3.y)>1.1)continue;const d=EL[k++];d.hidden=false;
      const nm=e.type==='cook'?L2('Aşçı · savaşmıyor','Cook · not a fighter'):e.st==='surrender'?L2('Teslim oldu','Surrendered'):e.st==='down'?L2('Bayıldı','Knocked out'):e.st==='flee'?L2('Kaçıyor','Fleeing'):e.type==='archer'?L2('Ebrehe\'nin okçusu','Abraha\'s archer'):L2('Ebrehe\'nin askeri','Abraha\'s soldier');
      const full=named<3||e.st==='windup'||e.thirst||Math.hypot(e.x-P.x,e.z-P.z)<9;if(full)named++;d.firstChild.style.display=full?'':'none';
      d.firstChild.textContent=e.thirst?L2('Yaralı asker · su istiyor','Wounded soldier · asks for water'):nm;
      d.className='elb'+(e.type==='cook'?' c':e.st==='surrender'||e.thirst?' s':e.st==='down'||e.st==='flee'?' d':e.st==='windup'?' w':'');
      const showBar=alive(e);d.lastChild.style.display=showBar?'':'none';if(showBar)d.lastChild.firstChild.style.width=Math.max(0,e.hp/e.max*100)+'%';
      d.style.transform=`translate(${(ev3.x*.5+.5)*W}px,${(-ev3.y*.5+.5)*H}px) translate(-50%,-100%)`;}}
  for(;k<EL.length;k++)EL[k].hidden=true;}

/* ---------- first contact: who they are and how to deal with them ---------- */
CODEX.push({id:'o_esved',g:'Olaylar',t:L2('Ebrehe\'nin öncü birliği','Abraha\'s vanguard'),b:L2("Ebrehe, Mekke'ye varmadan önce Esved b. Maksûd komutasında bir öncü birlik gönderdi. Bu birlik Tihâme'deki sürüleri, Abdülmuttalib'in iki yüz devesi de dahil, ele geçirdi. Ebrehe'nin ordusu Habeş (Aksum) askerlerinden ve Yemenli müttefiklerinden oluşuyordu.","Before reaching Mecca, Abraha sent ahead a vanguard under al-Aswad ibn Maqsud. It seized the herds of Tihama, including two hundred camels of Abd al-Muttalib. Abraha's army was made up of Abyssinian (Aksumite) soldiers and Yemeni allies."),c:[SRC.IH]});CX.o_esved=CODEX[CODEX.length-1];
const tipsEl=document.createElement('div');tipsEl.id='ctips';tipsEl.hidden=true;document.body.appendChild(tipsEl);
function renderTips(){const t=isTouch||DP.on;
  tipsEl.innerHTML='<button aria-label="'+L2('Kapat','Close')+'">×</button><h3>'+L2('Dövüş','Fighting')+'</h3>'+
  '<p><b>'+L2('Kırmızı pelerinliler','Red cloaks')+'</b> '+L2('Ebrehe\'nin askerleri.','are Abraha\'s soldiers.')+'</p>'+
  '<p>'+(t?L2('<b>Kılıç</b> düğmesi: vur. Basılı tut, bırak: dolu vuruş.','<b>Sword</b> button: strike. Hold, release: charged strike.'):L2('<kbd>F</kbd> ya da tıkla: vur. Basılı tut, bırak: dolu vuruş.','<kbd>F</kbd> or click: strike. Hold, release: charged strike.'))+'</p>'+
  '<p>'+L2('İsmi <b>sarı yanıp sönen</b> saldırmak üzere: geri çekil','A name <b>flashing yellow</b> is about to strike: step back')+((G.sh||0)>0?(t?L2(' ya da Kalkan tut.',' or hold Shield.'):L2(' ya da <kbd>G</kbd> kalkan.',' or hold <kbd>G</kbd> shield.')):'.')+'</p>'+
  ((G.bw||0)>0?'<p>'+(t?L2('<b>Ok</b>: basılı tut, ger, bırak. Okçulara yarar.','<b>Bow</b>: hold to draw, release. Good against archers.'):L2('<kbd>R</kbd> basılı tut, bırak: ok. Okçulara yarar.','Hold <kbd>R</kbd>, release: arrow. Good against archers.'))+'</p>':'')+
  '<p>'+L2('Can çubuğu azalan <b>teslim olabilir</b>: ona dokunma, +1 iyilik. Kimse ölmez; bayılan sonra kaçar.','One whose bar runs low <b>may surrender</b>: don\'t touch him, +1 kindness. No one dies; the knocked-out flee later.')+'</p>';
  tipsEl.firstChild.onclick=()=>{tipsEl.hidden=true;G.flags.tipsClosed=true;};}
let tipsFor=-1,tipsT=0;
function clarityStep(){
  updateEnemyLabels();
  if(MODE==='p2'&&started){const m=G.m||0;
    if(m===2&&CAMP2&&!G.flags.campIntro&&state==='play'&&Math.hypot(P.x-CAMP2.x,P.z-CAMP2.z)<45){G.flags.campIntro=true;save();discover('o_esved',true);
      showCard(L2('Düşman','The enemy'),{t:L2('Ebrehe\'nin öncü birliği','Abraha\'s vanguard'),b:L2("Kırmızı pelerinli, tunç miğferli bu askerler Ebrehe'nin öncüleri. Esved b. Maksûd'un birliği Mekke'nin develerini ele geçirip bu ağıla kapattı. Ordu Habeş (Aksum) askerleriyle Yemenli müttefiklerden oluşuyor.\n\nMızraklılar yakına gelir; başlarındaki isim sarı yanıp sönünce saldıracaklar demektir: geri çekil, sonra vur. Okçular uzaktan atar: yanlara kaç, yaklaş ya da okla karşılık ver. Canı azalan teslim olabilir; ona dokunma. Aşçı savaşmaz.","These red-cloaked, bronze-helmeted soldiers are Abraha's vanguard. Al-Aswad ibn Maqsud's company seized Mecca's camels and penned them here. The army is made up of Abyssinian (Aksumite) soldiers and Yemeni allies.\n\nSpearmen come close; when the name above them flashes yellow they are about to strike: step back, then hit. Archers shoot from afar: dodge sideways, close in, or answer with arrows. One whose strength runs low may surrender; don't touch him. The cook does not fight."),c:[SRC.IH]},L2('Anladım','Got it'),()=>{tipsFor=-1;});}
    const want=(m===2&&!G.flags.campDone&&CAMP2&&Math.hypot(P.x-CAMP2.x,P.z-CAMP2.z)<60)||(m===3&&ENEMIES.some(e=>e.grp==='scout'&&alive(e)&&e.st!=='idle'));
    if(want&&state==='play'){tipsT=(tipsT||0)+1/60;if(tipsT>(isTouch?14:30))G.flags.tipsClosed=true;}
    const show=want&&!G.flags.tipsClosed&&state==='play';if(show&&tipsFor!==(G.bw?1:0)+(G.sh?2:0)+(DP.on?4:0)){tipsFor=(G.bw?1:0)+(G.sh?2:0)+(DP.on?4:0);renderTips();}tipsEl.hidden=!show;
    if(G.flags.gateOpen&&!G.flags.rideTip&&state==='play'){G.flags.rideTip=true;toast(L2('Öndeki deveye binebilirsin: Deve düğmesi ya da C.','You can ride the lead camel: Camel button or C.'),5);}}
  else tipsEl.hidden=true;
  if(MODE!=='p2'&&started&&G.camel&&!G.flags.camelTip&&state==='play'){G.flags.camelTip=true;save();
    showCard(L2('Yeni','New'),{t:L2('Deven var','You have a camel'),b:L2("Çobanın devesi artık peşinden geliyor.\n\nBinmek: devenin yanına git ve “Deveye bin”e bas (E ya da büyük düğme). Ya da üstteki Deve düğmesine (C) bas: deve uzaktaysa yanına gelir, bir daha basınca binersin.\nİnmek: yine E ya da Deve düğmesi.\nDevedeyken hızlısın ama zıplayamaz, tırmanamazsın.\nTaş taşırken: elindeki taşı devenin yanında “Deveye yükle” ile sırtına koy; en çok üç taş taşır. İnşaatın yanında “Deveyi boşalt”.","The shepherd's camel now follows you.\n\nTo ride: go up to it and press “Ride the camel” (E or the big button). Or press the Camel button at the top (C): if it is far away it comes to you, press again to mount.\nTo get off: E or the Camel button again.\nOn the camel you are faster, but you can't jump or climb.\nCarrying stone: next to the camel use “Load onto the camel”; it carries up to three. At the building site, “Unload the camel”."),c:[]},L2('Anladım','Got it'));}
  const c=RC();$('#b-camel').hidden=!started||(!c&&!P.ride)||state==='title';
}
const es3=extraStep;extraStep=function(dt){es3(dt);clarityStep();};
// no sword swings from the saddle
const ra0=releaseAttack;releaseAttack=function(h){if(P.ride){toast(L2('Devedeyken kılıç kullanamazsın. İnmek için C.','You can\'t use the sword while riding. Press C to get off.'));return;}ra0(h);};
const rb0=releaseBow;releaseBow=function(){if(P.ride){BOW.draw=0;return;}rb0();};
