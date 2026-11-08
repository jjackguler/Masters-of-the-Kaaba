/* ===================== l11: chapters, screens, tutorial, hooks ===================== */
const CH=[null,
 {name:L2('Sel Gecesi','The Flood'),icon:'🌧️',par:75,goal:12,
  story:L2('M.S. 605. Mekke\'de bir kış gecesi dev bir sel indi. Sular Kâbe\'nin duvarlarını çatlattı, evleri çamura gömdü.','605 CE. One winter night a great flood swept through Mecca. It cracked the Kaaba\'s walls and buried houses in mud.'),
  task:L2('Komşularının evlerindeki çamuru temizle: 12 yükü vadinin dışına taşı.','Clear your neighbours\' houses: carry 12 loads of mud out of the valley.'),
  learn:L2('O zamanki Kâbe\'nin damı yoktu; duvarları bir adam boyu kadardı ve taşlar harçsız dizilmişti. Bu sel, Kureyş\'in onu yeniden yapmasına yol açtı.','The Kaaba of that time had no roof; its walls were about a man\'s height, stacked without mortar. This flood led Quraysh to rebuild it.')},
 {name:L2('Yıkım','Taking It Down'),icon:'⛏️',par:90,goal:20,
  story:L2('Kureyş Kâbe\'yi yıkıp sağlam bir şekilde yeniden yapmaya karar verdi. Ama herkes ilk darbeyi vurmaktan korkuyordu.','Quraysh decided to take the Kaaba down and rebuild it strong. But everyone was afraid to strike the first blow.'),
  task:L2('Eski duvarların molozunu taşı: 20 yükü vadinin dışına götür.','Haul away the old walls: carry 20 loads of rubble out of the valley.'),
  learn:L2('Yıkım, Hz. İbrâhim\'in attığı yeşil temel taşlarına gelince durdu. Yeni Kâbe o temelin üzerine kuruldu.','The demolition stopped at the green foundation stones laid by Prophet Ibrahim. The new Kaaba was built on top of them.')},
 {name:L2('Taşçılar','The Stonecutters'),icon:'🔨',par:130,c0:0,c1:1,
  story:L2('Temel ortaya çıktı. Kureyş duvarları kabileler arasında paylaştırdı; her kabile kendi payına düşen duvarı örecekti.','The foundation was found. Quraysh divided the walls among the clans; each clan would build its own share.'),
  task:L2('Ham taşı taşçıya, kesme taşı duvara taşı. İlk sırayı tamamla.','Take raw stone to the stonecutter and cut stone to the wall. Finish the first course.'),
  learn:L2('Kâbe\'nin duvarları kabileler arasında paylaştırıldı. Böylece kimse bu şereften mahrum kalmadı.','The Kaaba\'s walls were shared among the clans, so no one was left out of the honour.')},
 {name:L2('Kanlı Yemin','The Blood Oath'),icon:'🔥',par:60,
  story:L2('Duvarlar Hacerü\'l-Esved\'in yerine kadar yükseldi. Her kabile o taşı kendisi koymak istedi. Bazıları ellerini kana batırıp ölümüne yemin etti.','The walls reached the place of the Black Stone. Every clan wanted to set it themselves. Some dipped their hands in blood and swore to fight to the death.'),
  task:L2('Şafağa kadar kavga çıkmasın! Zemzem\'den su götürüp ateşlerin başındakileri yatıştır.','No fight before dawn! Bring Zamzam water to the men at the fires and calm them.'),
  learn:L2('Hakem, herkesin "el-Emîn" (güvenilir) dediği gençti. Taşı bir örtüye koydu, her kabile bir ucundan tuttu. Kan dökülmeden sorun çözüldü.','The judge was the young man everyone called "al-Amin", the trustworthy. He put the stone on a cloak and every clan held a corner. It was solved without bloodshed.')},
 {name:L2('Gemi','The Ship'),icon:'🚢',par:220,c0:1,c1:3,
  story:L2('Cidde yakınlarında karaya oturan bir geminin tahtaları Mekke\'ye geldi. Duvar artık bir sıra ahşap, bir sıra taşla yükselecek.','Timber from a ship wrecked near Jeddah reached Mecca. Now the wall rises one course of wood, one course of stone.'),
  task:L2('Tahtayı marangoza, kirişi duvara taşı. Taş zincirini de sürdür. İki sırayı tamamla.','Carry planks to the carpenter and beams to the wall, and keep the stone flowing. Finish two courses.'),
  learn:L2('Ahşap sıralar duvarı esnek ve sağlam yapıyordu. Geminin ustası Bâkûm inşaatta çalıştı.','The wooden courses made the wall flexible and strong. The ship\'s carpenter, Baqum, worked on the building.')},
 {name:L2('Yükselen Duvarlar','Rising Walls'),icon:'🌦️',par:240,c0:3,c1:5,
  story:L2('Kâbe eskisinin iki katı yükseklikte olacaktı. İş büyüdü, üstüne bir de yağmur bastırdı.','The Kaaba would be twice its old height. The work grew, and then the rain came.'),
  task:L2('Çamura dikkat et, hamal tut, ustalara su götür. İki sırayı daha bitir.','Mind the mud, hire porters, bring the craftsmen water. Finish two more courses.'),
  learn:L2('Yeni Kâbe 18 arşın (yaklaşık 9 metre) yüksekliğe çıktı. Eskisinin iki katıydı.','The new Kaaba rose to 18 cubits, about 9 metres, twice the old height.')},
 {name:L2('Çatı ve Kapı','Roof and Door'),icon:'🕋',par:200,c0:5,c1:7,
  story:L2('Son aşama! İçeriye altı direk dikilecek, üstü kapatılacak. Kapı yerden yüksek yapılacak.','The last stage! Six pillars inside, a roof on top, and a door raised high above the ground.'),
  task:L2('Ağır çatı kirişlerini ve kapıyı tamamla.','Finish the heavy roof beams and the door.'),
  learn:L2('Helal para yetmeyince kuzeydeki yarım yuvarlak kısım (Hicr) dışarıda bırakıldı. Bugün de öyledir. Bu olaydan beş yıl sonra vahiy başladı.','When the honest money ran short, the half-circle on the north side (the Hijr) was left outside. It is still so today. Five years later, revelation began.')}];
CH[1].intro=clipFlood;CH[1].outro=clipCouncil;CH[2].intro=clipFirstStrike;CH[2].outro=clipGreen;CH[3].intro=clipClans;CH[4].intro=clipOath;CH[4].outro=clipArbiter;CH[5].intro=clipShip;CH[6].intro=clipRain;CH[7].intro=clipRoof;CH[7].outro=clipFinale;
const NCH=7;
/* ---------- screens ---------- */
const ui=document.createElement('style');ui.textContent=`
.kscr{position:fixed;inset:0;z-index:8;display:flex;flex-direction:column;color:#fff6e0;font-family:var(--f-ui);-webkit-tap-highlight-color:transparent}
.kscr[hidden]{display:none}
#ktitle{align-items:center;justify-content:flex-end;padding:0 20px calc(env(safe-area-inset-bottom,0px) + 34px);background:linear-gradient(180deg,rgba(20,14,9,.0) 0%,rgba(20,14,9,.1) 38%,rgba(20,14,9,.82) 100%);text-align:center}
#ktitle .logo{display:none;width:min(46vw,180px);filter:drop-shadow(0 10px 22px rgba(0,0,0,.45));margin-bottom:6px;animation:float 5s ease-in-out infinite}
@keyframes float{50%{transform:translateY(-6px)}}
#ktitle h1{font:800 clamp(44px,12vw,84px)/.95 var(--f-display);margin:0;letter-spacing:-.01em;text-shadow:0 4px 24px rgba(0,0,0,.55)}
#ktitle .tag{font:700 13px var(--f-ui);letter-spacing:.32em;text-transform:uppercase;color:#f2c45a;margin:10px 0 26px}
.bigbtn{border:0;border-radius:999px;background:linear-gradient(180deg,#f6cf6a,#d39a2c);color:#3a2408;font:900 clamp(20px,5.4vw,26px) var(--f-ui);letter-spacing:.06em;padding:16px 64px;box-shadow:0 6px 0 #8f5f12,0 14px 30px rgba(0,0,0,.35);cursor:pointer;animation:pulse 2.2s ease-in-out infinite}
.bigbtn:active{transform:translateY(4px);box-shadow:0 2px 0 #8f5f12,0 8px 18px rgba(0,0,0,.35)}
@keyframes pulse{50%{transform:scale(1.04)}}
.row2{display:flex;gap:12px;margin-top:20px;justify-content:center;flex-wrap:wrap}
.pill{border:1.5px solid rgba(255,246,224,.55);background:rgba(20,14,9,.45);color:#fff6e0;border-radius:999px;padding:10px 18px;min-height:48px;font:800 14px var(--f-ui);cursor:pointer;backdrop-filter:blur(6px)}
#ktitle .note{font:500 12px/1.45 var(--f-ui);color:rgba(255,246,224,.72);max-width:420px;margin:22px auto 0}
#kmap{background:linear-gradient(180deg,rgba(24,30,46,.86),rgba(58,36,20,.78));overflow:hidden}
.khead{display:flex;align-items:center;gap:10px;padding:calc(env(safe-area-inset-top,0px) + 14px) 16px 10px}
.khead h2{flex:1;margin:0;font:800 24px var(--f-display)}
.kback{width:42px;height:42px;border-radius:50%;border:0;background:rgba(255,246,224,.16);color:#fff6e0;font:800 22px var(--f-ui);cursor:pointer}
.kchip{background:rgba(255,246,224,.14);border-radius:999px;padding:6px 12px;font:800 14px var(--f-ui)}
.kpath{flex:1;overflow-y:auto;padding:10px 0 40px;display:flex;flex-direction:column-reverse;gap:6px;align-items:center}
.knode{position:relative;display:flex;flex-direction:column;align-items:center;width:150px;border:0;background:none;color:inherit;cursor:pointer;padding:6px 0}
.knode .c{width:84px;height:84px;border-radius:50%;display:grid;place-items:center;font-size:38px;background:radial-gradient(circle at 35% 30%,#fff3d6,#e9c27a 55%,#b9822c);box-shadow:0 6px 0 #7d5414,0 12px 22px rgba(0,0,0,.35);transition:transform .15s}
.knode:active .c{transform:translateY(3px)}
.knode .n{position:absolute;top:4px;right:28px;background:#1f6f78;color:#fff;border:2px solid #fff6e0;border-radius:999px;font:900 13px var(--f-ui);padding:2px 8px}
.knode .t{margin-top:10px;font:800 15px var(--f-ui);text-align:center;text-shadow:0 2px 6px rgba(0,0,0,.5)}
.knode .s{font-size:16px;letter-spacing:2px;color:#f6cf6a;min-height:20px}
.knode.lock .c{background:radial-gradient(circle at 35% 30%,#8a8580,#5a5550 60%,#3a3632);box-shadow:0 6px 0 #26231f,0 12px 22px rgba(0,0,0,.35);filter:grayscale(1);font-size:28px}
.knode.lock{opacity:.75;cursor:default}
.knode.cur .c{animation:pulse 1.6s ease-in-out infinite;box-shadow:0 6px 0 #7d5414,0 0 0 6px rgba(246,207,106,.35),0 12px 22px rgba(0,0,0,.35)}
.knode.cur::after{content:'${L2('OYNA','PLAY')}';position:absolute;bottom:-14px;background:#d39a2c;color:#3a2408;font:900 12px var(--f-ui);letter-spacing:.12em;border-radius:999px;padding:3px 12px}
.kdots{width:4px;height:26px;background:repeating-linear-gradient(180deg,rgba(255,246,224,.6) 0 5px,transparent 5px 10px)}
.ksheet{position:fixed;inset:0;z-index:9;display:flex;align-items:flex-end;justify-content:center;background:rgba(15,10,6,.55);backdrop-filter:blur(3px)}
.ksheet[hidden]{display:none}
.kcard{width:min(100%,520px);background:#fff8ea;color:#2a211b;border-radius:26px 26px 0 0;padding:22px 22px calc(env(safe-area-inset-bottom,0px) + 22px);box-shadow:0 -10px 40px rgba(0,0,0,.35);animation:up .35s cubic-bezier(.2,1.2,.4,1) both;max-height:92vh;overflow-y:auto}
@media(min-width:700px){.ksheet{align-items:center}.kcard{border-radius:26px}}
@keyframes up{0%{transform:translateY(60px);opacity:0}100%{transform:none;opacity:1}}
.kcard .eb{font:900 12px var(--f-ui);letter-spacing:.24em;color:#b5523b;text-transform:uppercase;margin:0}
.kcard h2{font:800 30px/1.1 var(--f-display);margin:4px 0 12px}
.kcard .ic{font-size:46px;float:right;margin:-4px 0 0 10px}
.kcard p{font:500 17px/1.5 var(--f-ui);margin:0 0 14px}
.kcard .task{display:flex;gap:10px;align-items:flex-start;background:#f3e3c2;border-radius:16px;padding:12px 14px;font:700 16px/1.4 var(--f-ui);margin-bottom:18px}
.kcard .learn{background:#e7f0ef;border-radius:16px;padding:12px 14px;font:500 15px/1.5 var(--f-ui);margin-bottom:18px}
.kcard .learn b{display:block;font:900 12px var(--f-ui);letter-spacing:.16em;color:#1f6f78;margin-bottom:4px;text-transform:uppercase}
.kbtns{display:flex;gap:10px;flex-wrap:wrap}
.kbtn{flex:1;min-width:130px;border:0;border-radius:16px;padding:15px 16px;font:900 17px var(--f-ui);cursor:pointer;background:#1f6f78;color:#fff;box-shadow:0 4px 0 #13474d}
.kbtn.alt{background:#efe2c8;color:#2a211b;box-shadow:0 4px 0 #c9b48c}
.kbtn:active{transform:translateY(3px);box-shadow:none}
.kstars{display:flex;justify-content:center;gap:10px;margin:6px 0 14px}
.kstars span{font-size:52px;color:#d9cdb5;transform:scale(.4);opacity:.3;transition:transform .35s cubic-bezier(.2,1.8,.4,1),opacity .3s,color .3s}
.kstars span.on{color:#f0b73a;transform:scale(1);opacity:1;text-shadow:0 4px 0 #a5721a}
.kstats{display:flex;justify-content:space-around;background:#f3e3c2;border-radius:16px;padding:10px 6px;margin-bottom:14px;text-align:center}
.kstats div{font:900 20px var(--f-ui)}.kstats small{display:block;font:700 11px var(--f-ui);letter-spacing:.12em;color:#6a5a4c;text-transform:uppercase}
.ksgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}
.ksgrid button{border:0;border-radius:14px;background:#efe2c8;color:#2a211b;font:800 14px var(--f-ui);padding:12px 8px;cursor:pointer;text-align:center}
#ktip{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 112px);transform:translateX(-50%);z-index:6;background:rgba(22,16,11,.9);color:#fff6e0;border:2px solid #f2c45a;border-radius:18px;padding:12px 18px;font:800 17px/1.35 var(--f-ui);text-align:center;max-width:min(88vw,440px);pointer-events:none;box-shadow:0 10px 30px rgba(0,0,0,.35)}
#ktip[hidden]{display:none}
#khand{position:fixed;z-index:6;font-size:54px;pointer-events:none;left:28%;bottom:22%;animation:drag 1.8s ease-in-out infinite;filter:drop-shadow(0 4px 6px rgba(0,0,0,.4))}
#khand[hidden]{display:none}
@keyframes drag{0%{transform:translate(0,0)}50%{transform:translate(70px,-70px)}100%{transform:translate(0,0)}}
#chbar{height:7px;border-radius:99px;background:rgba(42,33,27,.15);overflow:hidden;margin-top:6px}
#chbar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#d39a2c,#f6cf6a);border-radius:99px;transition:width .3s}
.abar{position:fixed;z-index:4;transform:translate(-50%,-100%);pointer-events:none;text-align:center;font:900 12px var(--f-ui);color:#fff;text-shadow:0 1px 3px #000;width:92px}
.abar .b{height:9px;border-radius:99px;background:rgba(0,0,0,.45);border:1.5px solid rgba(255,255,255,.7);overflow:hidden;margin-top:3px}
.abar .b i{display:block;height:100%;background:linear-gradient(90deg,#f6cf6a,#e0582c,#b0161e);background-size:92px 100%;width:0}
.abar.hot{animation:shake .25s linear infinite}
@keyframes shake{25%{margin-left:-2px}75%{margin-left:2px}}
#ktimer{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 64px);transform:translateX(-50%);z-index:4;background:rgba(22,16,11,.8);color:#fff6e0;border-radius:999px;padding:6px 16px;font:900 18px var(--f-ui)}
#ktimer[hidden]{display:none}
`;document.head.appendChild(ui);
const LOGO=`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8d77a"/><stop offset="1" stop-color="#c98d22"/></linearGradient></defs>
<path d="M100 18 L172 56 L100 94 L28 56 Z" fill="#3b3430"/><path d="M28 56 L100 94 L100 182 L28 144 Z" fill="#1b1714"/><path d="M172 56 L100 94 L100 182 L172 144 Z" fill="#2a2420"/>
<path d="M28 74 L100 112 L100 126 L28 88 Z" fill="url(#lg1)"/><path d="M172 74 L100 112 L100 126 L172 88 Z" fill="url(#lg1)" opacity=".86"/>
<path d="M64 132 l14 7.4 v26 l-14 -7.4 z" fill="url(#lg1)" opacity=".9"/><path d="M100 18 L172 56 L100 94 L28 56 Z" fill="none" stroke="#f8d77a" stroke-width="2" opacity=".35"/></svg>`;
function el(html){const d=document.createElement('div');d.innerHTML=html.trim();return d.firstChild;}
const KT=el(`<div class="kscr" id="ktitle" hidden><div class="logo">${LOGO}</div><h1>${NAME}</h1><p class="tag">${L2('Mekke · M.S. 605','Mecca · 605 CE')}</p>
  <button class="bigbtn" id="k-play">${L2('OYNA','PLAY')}</button><div class="row2"><button class="pill" id="k-set">⚙ ${L2('Ayarlar','Settings')}</button><button class="pill" id="k-more">✦ ${L2('Diğer modlar','More modes')}</button></div>
  <p class="note">${L2('Efendimiz (s.a.v.) ve ashâbı tasvir edilmez; onlarla ilgili olaylar yalnızca anlatılır. Tarihî bilgiler İbn Hişâm\'ın Sîre\'si ve TDV İslâm Ansiklopedisi\'ne dayanır.','The Prophet (pbuh) and his Companions are never depicted; events involving them are only narrated. History follows Ibn Hisham\'s Sira and the TDV Encyclopedia of Islam.')}</p></div>`);
const KM=el(`<div class="kscr" id="kmap" hidden><div class="khead"><button class="kback" id="km-back" aria-label="${L2('Geri','Back')}">‹</button><h2>${L2('Bölümler','Chapters')}</h2><span class="kchip" id="km-stars">★ 0</span><span class="kchip" id="km-coins">🪙 0</span></div><div class="kpath" id="km-path"></div></div>`);
const KS=el(`<div class="ksheet" id="ksheet" hidden><div class="kcard" id="kcard"></div></div>`);
const TIP=el(`<div id="ktip" hidden></div>`),HAND=el(`<div id="khand" hidden>👆</div>`),TIMER=el(`<div id="ktimer" hidden></div>`);
document.body.append(KT,KM,KS,TIP,HAND,TIMER);
$('.quest').appendChild(el('<div id="chbar"><i></i></div>'));
function sheet(html,onReady){const c=$('#kcard');c.innerHTML=html;KS.hidden=false;c.style.animation='none';void c.offsetWidth;c.style.animation='';if(onReady)onReady(c);}
function closeSheet(){KS.hidden=true;}
function starStr(n){return '★'.repeat(n)+'☆'.repeat(3-n);}
function showTitle(){KT.hidden=false;KM.hidden=true;closeSheet();titleEl.hidden=true;hud.style.opacity=0;state='title';}
function showMap(){KT.hidden=true;KM.hidden=false;closeSheet();hud.style.opacity=0;TIMER.hidden=true;TIP.hidden=true;HAND.hidden=true;state='hub';kaabaForMap();
  const path=$('#km-path');path.innerHTML='';let tot=0;
  for(let n=1;n<=NCH;n++){const c=CH[n],lock=n>D.unl,s=D.stars[n]||0;tot+=s;const cur=!lock&&(n===D.unl||(!s&&!lock));
    if(n>1)path.appendChild(el('<div class="kdots"></div>'));
    const b=el(`<button class="knode${lock?' lock':''}${cur&&n===Math.min(D.unl,NCH)?' cur':''}" style="transform:translateX(${Math.sin(n*1.3)*70}px)"><span class="c">${lock?'🔒':c.icon}</span><span class="n">${n}</span><span class="t">${c.name}</span><span class="s">${s?starStr(s):''}</span></button>`);
    if(!lock)b.onclick=()=>{sfx.ui&&sfx.ui();showStory(n);};path.appendChild(b);}
  $('#km-stars').textContent='★ '+tot+'/'+NCH*3;$('#km-coins').textContent='🪙 '+D.coins;
  setTimeout(()=>{const c=path.querySelector('.cur');if(c)c.scrollIntoView({block:'center'});},30);}
function kaabaForMap(){const u=D.unl;if(u<=2)kaaba({old:true,rubble:false,green:false,scaffold:false,stone:false,roof:false,door:false,hijr:false,wallH:0});
  else{const co=[0,0,0,0,1,1,3,5][Math.min(u,7)];kaaba({old:false,rubble:false,green:u===3,scaffold:u<=7&&!(D.stars[7]),wallH:D.stars[7]?8.7:wallAt(co,0),stone:u>=5,roof:!!D.stars[7],door:!!D.stars[7],hijr:!!D.stars[7]});}
  RAIN.target=0;flood.visible=false;setTime(D.stars[7]?'eve':'asr');resetOld();}
function showStory(n){const c=CH[n];sheet(`<span class="ic">${c.icon}</span><p class="eb">${L2('Bölüm','Chapter')} ${n} / ${NCH}</p><h2>${c.name}</h2><p>${c.story}</p><div class="task"><span>🎯</span><span>${c.task}</span></div>
  <div class="kbtns"><button class="kbtn alt" id="ks-x">${L2('Geri','Back')}</button><button class="kbtn" id="ks-go">${L2('Başla','Start')}</button></div>`,c2=>{c2.querySelector('#ks-x').onclick=()=>{closeSheet();if(KM.hidden&&KT.hidden)showMap();};c2.querySelector('#ks-go').onclick=()=>{closeSheet();startChapter(n);};});}
/* ---------- chapter setup ---------- */
function resetOld(){KP.old.scale.y=1;KP.old.position.y=0;KP.oldDoor.visible=KSTATE.old;}
function cleanupChapter(){unload.z=null;stack=[];stackVis();families.forEach(f=>f.p.g.visible=false);hideClanFires();abars.forEach(a=>a.remove());abars=[];TIMER.hidden=true;resetOld();hooks.step=hooks.beat=hooks.cap=null;R.done=true;clearTmp();}
function coinIcon(){const w=$('#r-wood svg');if(w&&!w.dataset.c){w.dataset.c=1;w.innerHTML='<circle cx="12" cy="12" r="8.5" fill="#e3a51f" stroke="#a8741a" stroke-width="2"/><circle cx="12" cy="12" r="4.5" fill="none" stroke="#fff1b8" stroke-width="1.6"/>';$('#r-wood').title=L2('Bereket','Bereket');}}
function startChapter(n){auInit();coinIcon();musicStart();cleanupChapter();KM.hidden=true;KT.hidden=true;titleEl.hidden=true;SITE.on=true;started=true;build();makeUpgradeWorkers();
  setupCh(n);hud.style.opacity=0;const c=CH[n];
  const go=()=>{afterIntro(n);state='play';hud.style.opacity=1;dpadApply();R.done=false;R.t=0;if(n===1&&!D.tut)startTutorial();else toast(c.task,5);};
  if(c.intro)c.intro(go);else go();}
function placeHero(x,z){const s=freeSpot(x,z,.5);P.x=s.x;P.z=s.z;P.y=height(P.x,P.z);P.vy=0;P.speed=0;cam.f=null;cam.pitch=.84;cam.dist=11;cam.cur=11;}
function setupCh(n){R={ch:n,t:0,done:true,n:0,coins:0,good:0,bank:{},water:0,thirstT:0,thirsty:false,maxAnger:0,course:CH[n].c0||0,inCourse:0};stack=[];
  for(const z of ZONES){z.count=0;z.t=0;}Z.raw.count=12;Z.rawWood.count=9;
  for(const z of ZONES)if(z.pileG)pileVis(z);
  hooks.step=hooks.beat=hooks.cap=null;resetOld();
  if(n===1){kaaba({old:true,rubble:false,green:false,scaffold:false,stone:false,roof:false,door:false,hijr:false,wallH:0});families.forEach(f=>{f.z.count=4;pileVis(f.z,'mud');f.happy=false;f.p.g.visible=true;});
    hooks.beat=ch1Beat;hooks.step=famStep;placeHero(14,8);}
  else if(n===2){kaaba({old:true,rubble:true,green:false,scaffold:false,stone:false,wallH:0});Z.dump.count=0;pileVis(Z.dump,'rubble');hooks.beat=ch2Beat;placeHero(Z.rubble.x+4,Z.rubble.z+3);}
  else if(n===4){kaaba({old:false,rubble:false,green:false,scaffold:true,wallH:1.6,stone:false,roof:false,door:false,hijr:false});hooks.beat=ch4Beat;hooks.step=ch4Step;placeHero(ZEM.x+4,ZEM.z+3);}
  else{const c0=CH[n].c0;kaaba({old:false,rubble:false,green:n===3,scaffold:true,wallH:wallAt(c0,0),stone:n>=5,roof:false,door:false,hijr:false});hooks.beat=courseBeat;hooks.step=courseStep;hooks.cap=()=>n===7?Math.max(2,Math.ceil(D.cap/2)):D.cap;placeHero(24,-8);}
  syncPads();}
function afterIntro(n){if(n===1){setTime('dawn');RAIN.target=.3;flood.visible=false;}else if(n===2){setTime('noon');RAIN.target=0;}else if(n===4){setTime('night');RAIN.target=0;if(!F4.length)makeClanFires();F4.forEach((f,i)=>{f.anger=12+i*7;});makeBars();TIMER.hidden=false;}
  else if(n===6){setTime('rain');RAIN.target=.6;}else{setTime(n===7?'asr':'noon');RAIN.target=0;}
  if(n===1)placeHero(14,8);else if(n===2)placeHero(Z.rubble.x+4,Z.rubble.z+3);else if(n===4)placeHero(ZEM.x+4,ZEM.z+3);else placeHero(24,-8);cam.yaw=Math.atan2(P.x,P.z);}
/* ---------- chapter 1: mud ---------- */
function ch1Beat(top,cap){for(const f of families){const z=f.z;if(inZ(z)&&z.count>0&&stack.length<cap&&(!stack.length||stack[0]==='mud')){z.count--;stack.push('mud');pileVis(z,'mud');sfx.dig();
      if(z.count===0&&!f.happy){f.happy=true;D.good++;R.good++;pop('r-good');sfx.good();sparkle(f.p.g.position.x,2,f.p.g.position.z,24);ftext(L2('Allah razı olsun!','God bless you!'),f.p.g.position.x,2.4,f.p.g.position.z,'#ffe3a6');}}}
  if(inZ(Z.dump)&&top==='mud'){stack.pop();R.n++;Z.dump.count++;pileVis(Z.dump,'mud');sfx.thunk();award(2);bumpUnload(Z.dump,1);if(R.n===1)ftext('+2 🪙',Z.dump.x,2,Z.dump.z,'#ffd75e');if(R.n>=CH[1].goal)chapterDone();}}
function famStep(dt){families.forEach(f=>animPerson(f.p,dt,0,f.happy?'cheer':'cry'));}
/* ---------- chapter 2: rubble ---------- */
function ch2Beat(top,cap){if(inZ(Z.rubble)&&R.n+stack.length<CH[2].goal&&stack.length<cap&&(!stack.length||stack[0]==='rubble')){stack.push('rubble');sfx.pick();}
  if(inZ(Z.dump)&&top==='rubble'){stack.pop();R.n++;Z.dump.count++;pileVis(Z.dump,'rubble');sfx.thunk();award(2);bumpUnload(Z.dump,1);
    const s=1-R.n/CH[2].goal*.88;KP.old.scale.y=s;KP.oldDoor.visible=s>.6;if(R.n>=CH[2].goal)chapterDone();}}
/* ---------- chapter 4: calm the clans ---------- */
let abars=[];
function makeBars(){abars.forEach(a=>a.remove());abars=F4.map(f=>{const a=el(`<div class="abar">${f.name}<div class="b"><i></i></div></div>`);document.body.appendChild(a);return a;});}
function ch4Step(dt,playing){if(!F4.length)return;const T4=CH[4].par;
  F4.forEach((f,i)=>{if(playing){const r=1.55+i*.18+.7*Math.sin(R.t*.35+i*1.7);f.anger=Math.min(100,f.anger+Math.max(.5,r)*dt);R.maxAnger=Math.max(R.maxAnger,f.anger);}
    f.men.forEach(m=>animPerson(m,dt,0,f.anger>65?'angry':f.anger<35?'idle':'talk'));
    const a=abars[i];if(a){const s=scr(f.x,3.1,f.z);const dsp=s.ok&&state==='play'?'':'none';if(a.__d!==dsp){a.__d=dsp;a.style.display=dsp;}if(dsp===''){const x=Math.round(s.x),y=Math.round(s.y);if(a.__x!==x||a.__y!==y){a.__x=x;a.__y=y;a.style.left=x+'px';a.style.top=y+'px';}const w=Math.round(f.anger);if(a.__w!==w){a.__w=w;(a.__i||(a.__i=a.querySelector('i'))).style.width=w+'%';}const hot=f.anger>75;if(a.__h!==hot){a.__h=hot;a.classList.toggle('hot',hot);}}}
    });
  if(!playing)return;const left=Math.max(0,T4-R.t);
  if(left<=0){TIMER.hidden=true;chapterDone();return;}   // rule: when dawn and a full bar happen in the same frame, dawn wins
  const hot=F4.find(f=>f.anger>=100);if(hot){fail4(hot);return;}
  let w=F4[0];for(const f of F4)if(f.anger>w.anger)w=f;TIMER.textContent='🌙 '+L2('Şafağa ','Dawn in ')+Math.ceil(left)+L2(' sn',' s')+' · '+L2('En öfkeli: ','Angriest: ')+w.name+' %'+Math.round(w.anger);}
function ch4Beat(top,cap){if(inZ(Z.well)&&stack.length<cap&&(!stack.length||stack[0]==='water')){stack.push('water');sfx.pour();}
  if(top==='water')for(const f of F4){if(Math.hypot(P.x-f.x,P.z-f.z)<3.2&&f.anger>8){stack.pop();const was=f.anger;f.anger=Math.max(0,f.anger-40);sfx.pour();sparkle(f.x,1.8,f.z,14);if(was>45){D.good++;R.good++;pop('r-good');}
      const lines=[L2('Haklısın, bekleyelim.','You\'re right, let\'s wait.'),L2('Allah razı olsun evlat.','Bless you, child.'),L2('Tamam, sakinim.','Fine, I\'m calm.'),L2('Kan dökmeyelim.','Let\'s shed no blood.')];
      ftext(lines[(Math.random()*lines.length)|0],f.x,2.8,f.z,'#bfe6ff');break;}}}
function fail4(f){if(R.done||R.ended)return;R.done=true;R.ended=true;D.run=null;ssave();stack=[];TIMER.hidden=true;anime([{d:2.6,from:{p:KV(f.x+5,3,f.z+5),l:KV(f.x,1,f.z)},to:{p:KV(f.x+3,2,f.z+3),l:KV(f.x,1.2,f.z)},impact:L2('KAVGA!','A FIGHT!'),shake:.6,tint:'rgba(140,10,10,.25)',sfx:()=>nz(.8,200,1,.4,'lowpass')}],()=>{state='ui';
  sheet(`<span class="ic">🔥</span><p class="eb">${L2('Bölüm 4','Chapter 4')}</p><h2>${L2('Kavga çıktı!','A fight broke out!')}</h2><p>${L2(f.name+' kabilesinin öfkesi taştı. Ateşlerin başındaki çubukları izle; dolmak üzere olana önce su götür.','The '+f.name+' clan lost its temper. Watch the bars over the fires and bring water to the fullest one first.')}</p>
    <div class="kbtns"><button class="kbtn alt" id="kf-map">${L2('Bölümler','Chapters')}</button><button class="kbtn" id="kf-re">${L2('Tekrar dene','Try again')}</button></div>`,c=>{c.querySelector('#kf-map').onclick=()=>{cleanupChapter();showMap();};c.querySelector('#kf-re').onclick=()=>{closeSheet();retry(4);};});});}
function retry(n){cleanupChapter();D.run=null;setupCh(n);afterIntro(n);state='play';hud.style.opacity=1;R.done=false;R.t=0;toast(CH[n].task,4);}
/* ---------- course chapters (3,5,6,7) ---------- */
function courseStep(dt,playing){if(!playing||R.ch===3)return;R.thirstT+=dt;if(R.thirstT>40&&!R.thirsty&&R.water<=0){R.thirsty=true;toast(L2('Ustalar susadı! Zemzem\'den su götür: daha hızlı çalışırlar.','The craftsmen are thirsty! Bring Zamzam water: they will work faster.'),4.5);}
  if(R.thirsty&&Math.random()<dt*.6){const c=cutter[0];ftext('💧?',c.x,2.6,c.z);}}
function courseBeat(top,cap){
  if(inZ(Z.well)&&R.thirsty&&stack.length<3&&(!stack.length||stack[0]==='water')){stack.push('water');sfx.pour();}
  if(R.thirsty&&top==='water'){for(const c of [...cutter,carp]){if(c.g.visible&&Math.hypot(P.x-c.x,P.z-c.z)<3){stack.pop();if(!stack.includes('water')){R.thirsty=false;R.thirstT=0;R.water=45;D.good+=2;R.good+=2;pop('r-good');sfx.good();sparkle(c.x,c.y+1.6,c.z,20);ftext(L2('+2 İYİLİK','+2 KINDNESS'),c.x,c.y+2.3,c.z,'#ffb3b3');queueSaying('su');}break;}}}
  const c=COURSES[R.course];if(!c||!inZ(Z.wall))return;const need=c.t==='stone'?'block':'beam';
  if(top&&top!==need&&(top==='block'||top==='beam')){stack.pop();R.bank[top]=(R.bank[top]||0)+1;sfx.thunk();if(!R.bankTip){R.bankTip=1;toast(L2('Fazla malzeme kenara kondu; sırası gelince kendiliğinden yerleşir.','Extra material set aside; it will be laid when its course comes.'),4);}return;}
  if(top===need||(R.bank[need]>0&&!stack.length)){if(top===need)stack.pop();else R.bank[need]--;R.inCourse++;const pay=need==='block'?5:7;award(pay);ftext('+'+pay,Z.wall.x,2.2,Z.wall.z,'#ffd75e');coinsFly(1,Z.wall.x,1.2,Z.wall.z);bumpUnload(Z.wall,1);
    kaaba({wallH:wallAt(R.course,R.inCourse)});sfx.thunk();puff(Z.wall.x,height(Z.wall.x,Z.wall.z),Z.wall.z,3);if(R.inCourse>=c.n)courseFinished();}}
function courseFinished(){const c=COURSES[R.course];R.course++;R.inCourse=0;award(15);sfx.good();sparkle(0,KP.wallH+1,0,50);ssave();
  if(c.roof)discover('k_mizab',true);
  if(R.course>=CH[R.ch].c1){chapterDone();return;}
  const nx=COURSES[R.course];R.done=true;stack=[];
  anime([{d:2.6,from:{p:KV(22,KP.wallH+4,-16),l:KV(0,KP.wallH*.6,0)},to:{p:KV(18,KP.wallH+7,-22),l:KV(0,KP.wallH*.7,0)},speed:.6,impact:L2('SIRA TAMAM!','COURSE DONE!'),
    bubbles:[{who:L2('Ustabaşı','Master builder'),t:nx.roof?L2('Şimdi çatı kirişleri!','Now the roof beams!'):nx.door?L2('Son iş: yerden yüksek kapı! Kiriş getir.','Last job: the raised door! Bring beams.'):nx.t==='stone'?L2('Ahşap sıra bitti, şimdi taş!','Timber course done, now stone!'):L2('Taş sıra bitti, şimdi ahşap kiriş!','Stone course done, now timber beams!'),at:'bl'}]}],()=>{R.done=false;});}
/* ---------- chapter end ---------- */
function chapterDone(){if(R.ch===0||R.ended)return;R.ended=true;unloadBonus();const n=R.ch,c=CH[n];R.done=true;stack=[];stackVis();D.run=null;
  let s;if(n===4)s=R.maxAnger<80?3:R.maxAnger<93?2:1;else s=R.t<=c.par?3:R.t<=c.par*1.6?2:1;
  const first=!D.stars[n];D.stars[n]=Math.max(D.stars[n]||0,s);D.best[n]=Math.min(D.best[n]||1e9,Math.round(R.t));D.unl=Math.max(D.unl,Math.min(NCH,n+1));if(n===NCH)D.done=true;ssave();
  abars.forEach(a=>a.remove());abars=[];TIMER.hidden=true;
  const fin=()=>{hud.style.opacity=0;state='ui';showResult(n,s,first);};
  setTimeout(()=>{sfx.build();if(c.outro){hud.style.opacity=0;c.outro(fin);}else fin();},500);}
function showResult(n,s,first){const c=CH[n],last=n===NCH;const tt=Math.round(R.t),m=Math.floor(tt/60),sec=tt%60;
  sheet(`<p class="eb" style="text-align:center">${L2('Bölüm','Chapter')} ${n} · ${c.name}</p><h2 style="text-align:center">${last?L2('Kâbe tamamlandı!','The Kaaba is complete!'):L2('Bölüm tamamlandı!','Chapter complete!')}</h2>
    <div class="kstars"><span>★</span><span>★</span><span>★</span></div>
    <div class="kstats"><div>${m}:${String(sec).padStart(2,'0')}<small>${L2('Süre','Time')}</small></div><div>🪙 ${R.coins}<small>${L2('Bereket','Bereket')}</small></div><div>❤ ${R.good}<small>${L2('İyilik','Kindness')}</small></div></div>
    <div class="learn"><b>📜 ${L2('Bunu biliyor muydun?','Did you know?')}</b>${c.learn}</div>
    <div class="kbtns"><button class="kbtn alt" id="kr-map">${L2('Bölümler','Chapters')}</button>${last?`<button class="kbtn" id="kr-end">${L2('Son','The end')}</button>`:`<button class="kbtn" id="kr-next">${L2('Sonraki bölüm ›','Next chapter ›')}</button>`}</div>
    ${s<3?`<p style="text-align:center;margin:12px 0 0;font:700 14px var(--f-ui);color:#6a5a4c">${n===4?L2('3 yıldız için hiçbir ateşin öfkesi %80\'i geçmesin.','For 3 stars, keep every fire under 80% anger.'):L2('3 yıldız için ','For 3 stars, finish within ')+Math.floor(c.par/60)+':'+String(c.par%60).padStart(2,'0')+L2(' içinde bitir.','.')} <a href="#" id="kr-re" style="color:#1f6f78">${L2('Tekrar oyna','Play again')}</a></p>`:''}`,
  card=>{const st=card.querySelectorAll('.kstars span');for(let i=0;i<s;i++)setTimeout(()=>{st[i].classList.add('on');tone(HIC[5+i*2]*2,.18,.06);if(navigator.vibrate)try{navigator.vibrate(20);}catch(_){}},450+i*380);
    card.querySelector('#kr-map').onclick=()=>{cleanupChapter();showMap();};
    const nx=card.querySelector('#kr-next');if(nx)nx.onclick=()=>{closeSheet();cleanupChapter();showStory(n+1);};
    const en=card.querySelector('#kr-end');if(en)en.onclick=()=>{sheet(`<span class="ic">🕋</span><p class="eb">${NAME}</p><h2>${L2('Teşekkürler','Thank you')}</h2><p>${L2('Kâbe\'nin yeniden inşasını baştan sona yaşadın: selden, yıkımdan, kanlı yeminden ve hakemlikten geçerek. Mekke\'yi keşfetmeye "Diğer modlar"dan devam edebilirsin: Mekke Hikâyesi ve Fil Yılı.','You lived the rebuilding of the Kaaba from start to finish: through flood, demolition, the blood oath and the arbitration. Keep exploring Mecca under "More modes": the Mecca Story and the Year of the Elephant.')}</p><div class="kbtns"><button class="kbtn" id="ke-ok">${L2('Bölümler','Chapters')}</button></div>`,c2=>{c2.querySelector('#ke-ok').onclick=()=>{cleanupChapter();showMap();};});};
    const re=card.querySelector('#kr-re');if(re)re.onclick=e=>{e.preventDefault();closeSheet();cleanupChapter();startChapter(n);};});}
/* ---------- tutorial ---------- */
let tutStep=0,tutFrom=null;
function startTutorial(){tutStep=1;tutFrom={x:P.x,z:P.z};TIP.hidden=false;TIP.textContent=DP.on?L2('Ekrandaki yön tuşlarıyla yürü','Walk with the on-screen arrows'):isTouch?L2('Parmağını ekranda sürükleyerek yürü','Drag your finger on the screen to walk'):L2('W A S D veya ok tuşlarıyla yürü','Walk with W A S D or the arrow keys');HAND.hidden=!(isTouch&&!DP.on);}
function stepTutorial(){if(tutStep){TIP.hidden=state!=='play';HAND.hidden=state!=='play'||tutStep!==1||!(isTouch&&!DP.on);}if(!tutStep||state!=='play')return;
  if(tutStep===1&&Math.hypot(P.x-tutFrom.x,P.z-tutFrom.z)>3){tutStep=2;TIP.textContent=L2('Sarı ok gideceğin yeri gösterir. Çamurlu daireye git!','The yellow arrow shows where to go. Walk to the mud circle!');}
  else if(tutStep===2&&stack.length>0){tutStep=3;TIP.textContent=L2('Dairede durunca yükler kendiliğinden alınır. Şimdi vadi dışına götür!','Stand in a circle and you load up automatically. Now take it out of the valley!');}
  else if(tutStep===3&&R.n>0){tutStep=4;TIP.textContent=L2('Harika! Tam yük taşırsan bereket kazanırsın 🪙','Great! Carry full loads to earn bereket 🪙');setTimeout(()=>{TIP.hidden=true;tutStep=0;D.tut=1;ssave();},3500);}}
/* ---------- hooks into the engine ---------- */
const fa9=findAct;findAct=function(){if(!SITE.on)return fa9();return null;};
const tg9=currentTarget;
function nearestMud(){let b=null,bd=1e9;for(const f of families){if(f.z.count<=0)continue;const d=Math.hypot(P.x-f.z.x,P.z-f.z.z);if(d<bd){bd=d;b=f.z;}}return b;}
const ZT=z=>z?{x:z.x,z:z.z,n:z.label}:null;
function siteTarget(){if(state!=='play'||R.done)return null;const top=stack[stack.length-1],n=R.ch;
  if(n===1)return top==='mud'?ZT(Z.dump):ZT(nearestMud());
  if(n===2)return top==='rubble'?ZT(Z.dump):ZT(Z.rubble);
  if(n===4){if(!stack.length)return ZT(Z.well);let b=null;for(const f of F4)if(!b||f.anger>b.anger)b=f;return b?{x:b.x,z:b.z,n:b.name}:null;}
  if(R.thirsty&&!stack.length)return ZT(Z.well);if(top==='water')return {x:cutter[0].x,z:cutter[0].z,n:L2('Ustalar','Craftsmen')};
  const c=COURSES[R.course];if(!c)return null;const p=PADS.find(p=>D.coins>=p.u.cost-p.paid);if(p&&!stack.length)return {x:p.u.x,z:p.u.z,n:p.u.label};
  if(c.t==='stone'){if(top==='block')return ZT(Z.wall);if(top==='raw')return ZT(Z.cutIn);return Z.cutOut.count>=2?ZT(Z.cutOut):ZT(Z.raw);}
  if(top==='beam')return ZT(Z.wall);if(top==='rawwood')return ZT(Z.carIn);return Z.carOut.count>=2?ZT(Z.carOut):ZT(Z.rawWood);}
currentTarget=function(){if(!SITE.on)return tg9();const r=siteTarget();currentTargetZone=r?ZONES.find(z=>z.x===r.x&&z.z===r.z)||null:null;return r;};
const uh9=updateHud;updateHud=function(dt){if(!SITE.on){uh9(dt);return;}const n=R.ch,c=CH[n]||{};
  qCh.textContent=(LANG==='en'?'CHAPTER ':'BÖLÜM ')+n+' · '+(c.name||'');let goal='',frac=0;
  if(n===1){goal=L2('Çamur: ','Mud: ')+R.n+'/'+c.goal;frac=R.n/c.goal;}
  else if(n===2){goal=L2('Moloz: ','Rubble: ')+R.n+'/'+c.goal;frac=R.n/c.goal;}
  else if(n===4){goal=L2('Kavga çıkmasın','Keep the peace');frac=Math.min(1,R.t/c.par);}
  else if(c.c0!=null){const cc=COURSES[R.course];let tot=0,dn=0;for(let i=c.c0;i<c.c1;i++){tot+=COURSES[i].n;if(i<R.course)dn+=COURSES[i].n;else if(i===R.course)dn+=R.inCourse;}frac=dn/tot;
    goal=cc?(cc.roof?L2('Çatı','Roof'):cc.door?L2('Kapı','Door'):(R.course+1)+(LANG==='en'?'. course':'. sıra'))+': '+R.inCourse+'/'+cc.n+' '+(cc.t==='stone'?L2('kesme taş','cut stones'):L2('kiriş','beams')):'';}
  qGoal.textContent=goal;$('#chbar i').style.width=Math.round(frac*100)+'%';
  qSub.textContent=R.thirsty?L2('Ustalar susadı: Zemzem\'den su götür','The craftsmen are thirsty: bring Zamzam water'):PADS.length&&!stack.length&&PADS.some(p=>D.coins>=p.u.cost-p.paid)?L2('Bereketin yetiyor: altın dairede yükseltme al','You can afford an upgrade: stand on a golden circle'):'';
  const cap=hooks.cap?hooks.cap():D.cap;$('#r-stone b').textContent=stack.length+'/'+cap;$('#r-wood b').textContent=D.coins;$('#r-good b').textContent=D.good;
  let done=0,tot=0;COURSES.forEach((cc,i)=>{tot+=cc.n;if(i<R.course)done+=cc.n;else if(i===R.course)done+=R.inCourse;});$('#r-kabe b').textContent=(n<3?0:Math.round(done/tot*100))+'%';
  carryEl.hidden=true;if(toastT>0){toastT-=dt;if(toastT<=0)toastEl.classList.remove('on');}};
{const sb9=sayBlock;sayBlock=()=>sb9()||(SITE.on&&(R.done||!KS.hidden||state!=='play'));}
const wc9=worldChecks;worldChecks=function(dt){if(SITE.on)return;wc9(dt);};
const es9=extraStep;extraStep=function(dt){es9(dt);siteStep(dt);stepArrow(SITE.on?currentTarget():null);stepTutorial();drawAnim();};
const sv9=save;save=function(){if(SITE.on)ssave();else sv9();};
const sy9=syncWorld;syncWorld=function(){if(SITE.on)return;sy9();};
/* ---------- title, settings, more modes, pause ---------- */
if(MODE!=='p2'){
  titleEl.hidden=true;
  const btns=[...document.querySelectorAll('#title .btns button')].filter(b=>!['m-start','m-new','m-part'].includes(b.id));
  const more=[$('#m-part')].filter(Boolean);
  const mk=(t,fn)=>{const b=document.createElement('button');b.textContent=t;b.onclick=fn;return b;};
  const boot=k=>{try{localStorage.setItem('kabe-boot',k);}catch(_){}location.reload();};
  const story=mk(L2('Mekke Hikâyesi (keşif)','Mecca Story (explore)'),()=>boot('story'));
  const puz=mk(L2('Kâbe Taşları (bulmaca)','Kaaba Stones (puzzle)'),()=>boot('puz'));
  function setSheet(back){sheet(`<p class="eb">${NAME}</p><h2>${L2('Ayarlar','Settings')}</h2><div class="ksgrid" id="kset"></div><div class="kbtns"><button class="kbtn" id="kset-ok">${L2('Tamam','Done')}</button></div>`,c=>{const g=c.querySelector('#kset');btns.forEach(b=>{b.className='';g.appendChild(b);});c.querySelector('#kset-ok').onclick=()=>{closeSheet();if(back)back();};});}
  function moreSheet(){sheet(`<p class="eb">${NAME}</p><h2>${L2('Diğer modlar','More modes')}</h2><p>${L2('Ana oyunun dışındaki ek modlar.','Extra modes beyond the main game.')}</p><div class="ksgrid" id="kmore"></div><div class="kbtns"><button class="kbtn alt" id="kmore-x">${L2('Kapat','Close')}</button></div>`,c=>{const g=c.querySelector('#kmore');[story,puz,...more].forEach(b=>{b.className='';g.appendChild(b);});c.querySelector('#kmore-x').onclick=closeSheet;});}
  $('#k-play').onclick=()=>{auInit();musicStart();sfx.ui&&sfx.ui();if(!D.stars[1]&&D.unl===1)showStory(1);else showMap();};
  $('#k-set').onclick=()=>setSheet();$('#k-more').onclick=moreSheet;$('#km-back').onclick=showTitle;
  const bm=$('#b-menu'),nb=bm.cloneNode(true);bm.replaceWith(nb);
  nb.addEventListener('click',()=>{if(!SITE.on){if(state==='play')openMenu();return;}if(state!=='play')return;state='ui';
    sheet(`<p class="eb">${L2('Duraklatıldı','Paused')}</p><h2>${CH[R.ch].name}</h2><p>${CH[R.ch].task}</p><div class="ksgrid"><button id="kp-set">⚙ ${L2('Ayarlar','Settings')}</button><button id="kp-re">↺ ${L2('Baştan başla','Restart')}</button></div><div class="kbtns"><button class="kbtn alt" id="kp-map">${L2('Bölümler','Chapters')}</button><button class="kbtn" id="kp-go">${L2('Devam','Resume')}</button></div>`,c=>{
      c.querySelector('#kp-go').onclick=()=>{closeSheet();state='play';};c.querySelector('#kp-map').onclick=()=>{cleanupChapter();showMap();};
      c.querySelector('#kp-re').onclick=()=>{closeSheet();const n=R.ch;cleanupChapter();startChapter(n);};c.querySelector('#kp-set').onclick=()=>setSheet(()=>{state='play';});});});
  sload();R.ch=0;let bk=null;try{bk=localStorage.getItem('kabe-boot');localStorage.removeItem('kabe-boot');}catch(_){}
  if(bk==='story'){KT.hidden=true;window.__storyGo=true;setTimeout(()=>mStart.click(),60);}
  else if(bk==='puz'){KT.hidden=true;setTimeout(()=>openHub(),60);}
  else showTitle();
}
{const hb=document.createElement('button');hb.className='go alt';hb.id='m-home';hb.textContent=L2('Ana oyun','Main game');hb.onclick=()=>location.reload();const bx=$('#title .btns');if(bx)bx.appendChild(hb);}
document.title=NAME+(LANG==='en'?': Mecca 605':': Mekke 605');
{const h=$('#title h1');if(h)h.textContent=NAME;}
window.startSite=()=>{$('#k-play')&&$('#k-play').click();};
window.__site={cineTo:i=>{let n=0;while(CINE&&CINE.i<i&&n++<30){const s=CINE.steps[CINE.i];CINE.t=s.d;stepCine(0);}},makeUpgradeWorkers,build,clips:{clipSnake,clipFlood,clipCouncil,clipFirstStrike,clipGreen,clipClans,clipOath,clipArbiter,clipShip,clipRain,clipRoof,clipFinale},setTimeNow:k=>{setTime(k);stepTime(5);applyTime();},cineFF:t=>{let n=Math.round(t/.05);while(n-->0&&CINE){clock+=.05;stepCine(.05);}},cineState:()=>CINE?{i:CINE.i,t:CINE.t,n:CINE.steps.length}:null,step:(n,dt)=>{for(let i=0;i<n;i++){clock+=dt;siteStep(dt);updateHud(dt);}},D:()=>D,R:()=>R,stack:()=>stack,Z:()=>Z,COURSES,CH,F4:()=>F4,setD:o=>Object.assign(D,o),setR:o=>Object.assign(R,o),chapterDone,courseFinished,startChapter,showMap,showStory,PADS,syncPads,skipClip,families:()=>families,give:(t,n)=>{for(let i=0;i<n;i++)stack.push(t);}};

