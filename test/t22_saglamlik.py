# Aşama 2-4 tests: robustness (T03-T20 + lifecycle), polish, and the "Hacılara Hizmet" layer.
import sys, asyncio, json, time
sys.path.insert(0, '/home/claude/kabe')
from tlib import *
R = []
def rec(t, ok, d): R.append({'test': t, 'ok': bool(ok), 'detail': d}); print(('PASS ' if ok else 'FAIL ') + t + ' | ' + d, flush=True)
SK = 'kabe-ustalari-v1'
ALL7 = "localStorage.setItem('%s',JSON.stringify({unl:7,stars:{1:3,2:3,3:3,4:3,5:3,6:3},coins:500,cap:4,up:{},tut:1}));" % SK
DONE = "localStorage.setItem('%s',JSON.stringify({unl:7,stars:{1:3,2:3,3:3,4:3,5:3,6:3,7:3},done:true,coins:2000,cap:8,up:{cap1:true,cap2:true},tut:1}));" % SK
def real_errs(e): return [x for x in e if 'Failed to load resource' not in x]

async def prep(pg):
    await pg.evaluate(JS_HELP)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(**CHROME)
        # ---------- load in both languages ----------
        for lang in ['tr', 'en']:
            ctx, pg, errs = await page(b, lang=lang); await prep(pg)
            st = await pg.evaluate("T.play(1)"); hud = await pg.evaluate("T.S.step(20,.05),T.S.hud()")
            rec(f'açılış + Bölüm 1 ({lang})', st == 'play' and not real_errs(errs), f"state={st} hud={hud} hata={real_errs(errs)}")
            await ctx.close()
        # ---------- T03: result -> next -> back never leaves a blank screen (x20) ----------
        ctx, pg, errs = await page(b, init=ALL7); await prep(pg)
        bad = []
        for i in range(20):
            n = 1 + i % 6
            await pg.evaluate(f"T.play({n})")
            await pg.evaluate("T.S.chapterDone()"); await pg.wait_for_timeout(700); await pg.evaluate("T.skipAll()")
            ids = await pg.evaluate("T.sheetIds()")
            if 'kr-next' not in ids: bad.append((i, 'sonuç yok', ids)); continue
            await pg.evaluate("document.getElementById('kr-next').click()"); await pg.wait_for_timeout(200)
            await pg.evaluate("document.getElementById('ks-x').click()"); await pg.wait_for_timeout(200)
            v = await pg.evaluate("T.vis()")
            if not (v['map'] or v['title'] or v['sheet'] or v['state'] == 'play'): bad.append((i, v))
        rec('T03 sonuç→sonraki→geri ×20', not bad and not real_errs(errs), f'boş ekran={bad} hata={real_errs(errs)[:2]}')
        # ---------- T04: book / map / sheet stop the simulation ----------
        await pg.evaluate("T.play(3)"); await pg.evaluate("T.S.step(10,.05)")
        await pg.evaluate("document.getElementById('b-book').click()"); await pg.wait_for_timeout(300)
        a = await pg.evaluate("({t:T.S.R().t,raw:T.S.zonesOf().raw.count,cut:T.S.zonesOf().cutOut.count})")
        await pg.evaluate("T.S.step(600,.05)")
        bk = await pg.evaluate("({t:T.S.R().t,raw:T.S.zonesOf().raw.count,cut:T.S.zonesOf().cutOut.count,active:T.S.gameActive()})")
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(200)
        esc = await pg.evaluate("({book:!document.getElementById('book').hidden,sheet:T.vis().sheet})")
        await pg.evaluate("document.getElementById('b-map').click()"); await pg.wait_for_timeout(300); a2 = await pg.evaluate("T.S.R().t"); await pg.evaluate("T.S.step(200,.05)")
        mp = await pg.evaluate("({t:T.S.R().t,active:T.S.gameActive()})")
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(200)
        await pg.evaluate("T.S.step(40,.05)"); af = await pg.evaluate("T.S.R().t")
        rec('T04 kitap/harita açıkken simülasyon durur', abs(bk['t'] - a['t']) < 1e-6 and bk['raw'] == a['raw'] and bk['cut'] == a['cut'] and not bk['active'] and abs(mp['t'] - a2) < 1e-6 and af > mp['t'] + 1.5 and not esc['book'] and not esc['sheet'],
            f"kitap açık: önce={a} 30 sn sonra={bk}; Esc kitabı kapattı={not esc['book']}, duraklatma açılmadı={not esc['sheet']}; harita 10 sn: R.t {a2:.2f}→{mp['t']:.2f}; kapatınca 2 sn sonra R.t={af:.2f}")
        # ---------- T05: dawn and a full bar in the same frame -> exactly one result ----------
        await pg.evaluate("T.play(4)")
        await pg.evaluate("(()=>{const S=T.S;S.setR({t:S.CH[4].par-0.01});S.F4()[0].anger=99.999;S.F4().forEach((f,i)=>{if(i)f.anger=10});S.step(1,.05)})()")
        await pg.wait_for_timeout(900); await pg.evaluate("T.skipAll()"); await pg.wait_for_timeout(300)
        ids = await pg.evaluate("T.sheetIds()"); rr = await pg.evaluate("({ended:T.S.R().ended,stars:T.S.D().stars[4]})")
        ok1 = ('kr-map' in ids) and ('kf-re' not in ids) and rr['ended']
        await pg.evaluate("T.play(4)")
        await pg.evaluate("(()=>{const S=T.S;S.setR({t:5});S.F4()[1].anger=99.999;S.step(1,.05);S.chapterDone();})()")
        await pg.wait_for_timeout(600); await pg.evaluate("T.skipAll()"); await pg.wait_for_timeout(300); ids2 = await pg.evaluate("T.sheetIds()")
        ok2 = 'kf-re' in ids2 and 'kr-next' not in ids2
        rec('T05 Bölüm 4 tek sonuç', ok1 and ok2, f'aynı kare: şafak kazandı={ok1} ({ids}); erken öfke: yalnız kavga ekranı={ok2} ({ids2})')
        # ---------- T08: target follows what you hold ----------
        await pg.evaluate("T.play(3)")
        cases = {}
        for stack, extra, want in [(['raw'], '', 'cutIn'), (['block'], '', 'wall'), (['water'], '', 'well'), (['water'], 'T.S.setR({thirsty:true});', 'craft'), ([], 'T.S.setR({thirsty:false});', 'src'), (['beam'], '', 'wall')]:
            r = await pg.evaluate(f"(()=>{{{extra}T.S.setStack({json.dumps(stack)});const t=T.S.siteTarget();const Z=T.S.zonesOf();return {{t,Z}}}})()")
            t, Z = r['t'], r['Z']
            def at(k): return abs(t['x'] - Z[k]['x']) < .01 and abs(t['z'] - Z[k]['z']) < .01
            ok = (want == 'craft' and t['n'] in ('Ustalar', 'Craftsmen')) or (want == 'src' and (at('raw') or at('cutOut'))) or (want not in ('craft', 'src') and at(want))
            cases[str(stack) + extra[:20]] = (t['n'], ok)
        rec('T08 hedef envantere göre', all(v[1] for v in cases.values()), json.dumps(cases, ensure_ascii=False))
        # ---------- T11/T12: one coin ledger, bonus counted and flushed, ch7 threshold ----------
        await pg.evaluate("T.play(3)")
        led = await pg.evaluate("""(()=>{const S=T.S,D=S.D(),R=S.R();const d0=D.coins,r0=R.coins;const W=S.zonesOf().wall;
          S.setStack(['block','block','block','block']);S.setP(W.x,W.z);S.step(12,.05);S.setP(W.x+12,W.z+12);S.step(14,.05);
          return {dD:S.D().coins-d0,dR:S.R().coins-r0,inC:S.R().inCourse}})()""")
        flush = await pg.evaluate("""(()=>{const S=T.S;const W=S.zonesOf().wall;const d0=S.D().coins,r0=S.R().coins;S.setStack(['block','block','block','block']);S.setP(W.x,W.z);S.step(12,.05);
          const pend=S.unload().n;S.chapterDone();return {pend,dD:S.D().coins-d0,dR:S.R().coins-r0}})()""")
        await pg.wait_for_timeout(600); await pg.evaluate("T.skipAll()")
        await pg.evaluate("T.S.setD({cap:8,up:{cap1:true,cap2:true}})"); await pg.evaluate("T.play(7)")
        c7 = await pg.evaluate("""(()=>{const S=T.S;const W=S.zonesOf().wall;S.setStack(['beam','beam','beam','beam']);S.setP(W.x,W.z);S.step(12,.05);return {cap:S.unload().cap,n:S.unload().n}})()""")
        rec('T11/T12 bereket defteri + bonus', led['dD'] == led['dR'] and led['dD'] == 4 * 5 + 8 and flush['dD'] == flush['dR'] == 4 * 5 + 8 and c7['cap'] == 4,
            f"4 kesme taş: profil +{led['dD']} / bölüm +{led['dR']} (beklenen 20+8 bonus); bitişte bekleyen {flush['pend']} yük bonusu: +{flush['dD']}/+{flush['dR']}; Bölüm 7 bonus eşiği={c7['cap']} (D.cap=8)")
        # ---------- T14 / T13: clan fires are pooled, cutscene objects are freed ----------
        f0 = await pg.evaluate("T.S.FIRES()")
        for i in range(20):
            await pg.evaluate("T.play(4)"); await pg.evaluate("T.S.step(3,.05)")
        f1 = await pg.evaluate("T.S.FIRES()")
        await pg.evaluate("T.S.showMap()"); m0 = await pg.evaluate("T.S.mem()")
        for i in range(10):
            await pg.evaluate("T.play(6)"); await pg.evaluate("T.S.step(4,.05)"); await pg.evaluate("T.S.showMap()")
        await pg.wait_for_timeout(300); m1 = await pg.evaluate("T.S.mem()")
        rec('T14 ateş havuzu (20 deneme)', f1 - f0 <= 4, f'FIRES {f0} → {f1}')
        rec('T13 ara sahne belleği (10 tekrar)', m1['geometries'] - m0['geometries'] < 40 and m1['textures'] - m0['textures'] < 6, f'renderer.info önce={m0} sonra={m1}')
        # ---------- T19: time format ----------
        await pg.evaluate("T.play(5)"); await pg.evaluate("T.S.setR({t:119.6});T.S.chapterDone()"); await pg.wait_for_timeout(700); await pg.evaluate("T.skipAll()")
        tm = await pg.evaluate("document.querySelector('.kstats div').firstChild.textContent")
        nx = await pg.evaluate("(document.querySelector('.knext')||{}).textContent")
        rec('T19 süre biçimi', tm == '2:00', f'119.6 sn → "{tm}"; sonuç ekranı: "{nx}"')
        await ctx.close()
        # ---------- T10: upgrades are bought on purpose ----------
        ctx, pg, errs = await page(b, init=ALL7); await prep(pg)
        await pg.evaluate("T.play(3)"); await pg.evaluate("T.S.setD({coins:100})")
        pad = await pg.evaluate("(()=>{const p=T.S.PADS.find(p=>p.u.id==='cap1');T.S.setP(p.u.x,p.u.z);T.S.step(100,.05);return 0})()"); await pg.wait_for_timeout(400)
        pad = await pg.evaluate("(()=>{return {coins:T.S.D().coins,vis:!document.getElementById('kpad').hidden,txt:document.getElementById('kpad').innerText}})()")
        await pg.evaluate("document.querySelector('#kpad button').click()"); await pg.wait_for_timeout(200)
        aft = await pg.evaluate("({coins:T.S.D().coins,cap:T.S.D().cap,up:T.S.D().up})")
        rec('T10 yükseltme onayla alınır', pad['coins'] == 100 and pad['vis'] and aft['coins'] == 70 and aft['cap'] == 6 and aft['up'].get('cap1'), f"5 sn dairede bekleyince bereket={pad['coins']} (harcanmadı), kart={pad['txt']!r}; 'Al' sonrası bereket={aft['coins']} kapasite={aft['cap']}")
        poor = await pg.evaluate("(()=>{T.S.setD({coins:10});const p=T.S.PADS.find(p=>p.u.id==='cutter2');T.S.setP(p.u.x,p.u.z);T.S.step(10,.05);return 0})()"); await pg.wait_for_timeout(400)
        poor = await pg.evaluate("(()=>{const b=document.querySelector('#kpad button');return {dis:b.disabled,txt:document.getElementById('kpad').innerText}})()")
        rec('T10 yetmeyen bereket', poor['dis'], f"düğme kapalı={poor['dis']} kart={poor['txt']!r}")
        # ---------- T15: held input is forgotten when a sheet opens ----------
        await pg.evaluate("T.S.setP(24,-8)")
        await pg.keyboard.down('KeyW'); await pg.wait_for_timeout(250)
        p0 = await pg.evaluate("T.S.getP()")
        await pg.evaluate("T.S.goBack()"); await pg.wait_for_timeout(150); await pg.evaluate("T.S.goBack()"); await pg.wait_for_timeout(600)
        p1 = await pg.evaluate("T.S.getP()"); await pg.wait_for_timeout(600); p2 = await pg.evaluate("T.S.getP()")
        await pg.keyboard.up('KeyW')
        rec('T15 duraklatınca tuşlar bırakılır', abs(p2['x'] - p1['x']) + abs(p2['z'] - p1['z']) < .05, f'W basılı kaldı; duraklat→devam sonrası 0.6 sn hareket={abs(p2["x"]-p1["x"])+abs(p2["z"]-p1["z"]):.3f} m')
        # ---------- back button logic ----------
        seq = []
        seq.append(await pg.evaluate("T.S.goBack(),T.vis()")); seq.append(await pg.evaluate("T.S.goBack(),T.vis()"))
        await pg.evaluate("T.S.showMap()"); seq.append(await pg.evaluate("T.S.goBack(),T.vis()")); last = await pg.evaluate("T.S.goBack()")
        rec('Geri tuşu (Android/Esc)', seq[0]['sheet'] and seq[1]['state'] == 'play' and not seq[1]['sheet'] and seq[2]['title'] and last is False,
            f'oyunda→duraklat {seq[0]}, tekrar→devam {seq[1]}, haritada→başlık {seq[2]}, başlıkta→uygulama kapanır={last is False}')
        # ---------- T17/T18: settings content ----------
        await pg.evaluate("T.S.showMap();document.getElementById('km-back').click()")
        await pg.evaluate("document.getElementById('k-set').click()"); await pg.wait_for_timeout(200); await pg.evaluate("document.getElementById('m-controls').click()"); await pg.wait_for_timeout(150)
        c1 = await pg.evaluate("(document.getElementById('kinfo')||{}).innerText||''")
        await pg.evaluate("document.getElementById('m-about').click()"); await pg.wait_for_timeout(150); a1 = await pg.evaluate("(document.getElementById('kinfo')||{}).innerText||''")
        await pg.evaluate("document.getElementById('m-rm').click()"); rm = await pg.evaluate("({rm:document.body.classList.contains('rm'),D:T.S.D().rm,txt:document.getElementById('m-rm').textContent})")
        await pg.evaluate("document.getElementById('m-vib').click()"); vb = await pg.evaluate("({v:T.S.D().novib,txt:document.getElementById('m-vib').textContent})")
        await pg.screenshot(path=OUT + '/ayarlar_390.png')
        rec('T17 Kontroller/Hakkında içerik gösterir', len(c1) > 80 and 'tasvir' in a1, f'kontroller {len(c1)} harf, hakkında {len(a1)} harf')
        rec('T18 hareket azaltma + titreşim ayarı', rm['rm'] and rm['D'] and vb['v'], f"{rm['txt']} body.rm={rm['rm']} · {vb['txt']}")
        await pg.evaluate("document.getElementById('kset-ok').click()")
        await ctx.close()
        ctx = await b.new_context(viewport={'width': 390, 'height': 844}, reduced_motion='reduce'); pg = await ctx.new_page()
        W = web()
        async def route(r):
            u = r.request.url
            if 'three.min.js' in u: await r.fulfill(path=THREE, content_type='application/javascript')
            elif u.startswith('http://game.test'): await r.fulfill(body=W, content_type='text/html')
            else: await r.abort()
        await ctx.route('**/*', route); await pg.goto('http://game.test/'); await pg.wait_for_timeout(2000)
        rmo = await pg.evaluate("document.body.classList.contains('rm')")
        rec('T18 sistemde "hareketi azalt" açıkken', rmo, f'body.rm={rmo}')
        await ctx.close()
        # ---------- T06/T09: save, kill, relaunch, resume: every chapter ----------
        ctx, pg, errs = await page(b, init=ALL7); await prep(pg)
        res = {}
        for n in range(1, 8):
            await pg.evaluate(f"T.play({n})")
            await pg.evaluate("T.S.step(30,.05)")
            snap = await pg.evaluate("""(()=>{const S=T.S;const R=S.R();if(R.ch===1||R.ch===2)S.setR({n:3});if(S.CH[R.ch].c0!=null)S.setR({inCourse:2});if(R.ch===4)S.F4()[2].anger=55;
               S.setStack(R.ch===1?['mud','mud']:R.ch===2?['rubble']:R.ch===4?['water']:['raw']);S.setP(S.getP().x+1.5,S.getP().z+1);S.saveRun();return {t:S.R().t,n:S.R().n,ic:S.R().inCourse,st:S.stack().length,p:S.getP()}})()""")
            pg2, e2 = await newpage(ctx); await prep(pg2); await pg.close(); pg = pg2
            await pg.evaluate("document.getElementById('k-play').click()"); await pg.wait_for_timeout(250)
            ids = await pg.evaluate("T.sheetIds()")
            if 'kr-res' in ids: await pg.evaluate("document.getElementById('kr-res').click()"); await pg.wait_for_timeout(300)
            got = await pg.evaluate("(()=>{const S=T.S,R=S.R();return {ch:R.ch,t:R.t,n:R.n,ic:R.inCourse,st:S.stack().length,state:S.state(),p:S.getP(),a:R.ch===4?S.F4()[2].anger:null}})()")
            ok = 'kr-res' in ids and got['ch'] == n and got['state'] == 'play' and abs(got['t'] - snap['t']) < .3 and got['n'] == snap['n'] and got['ic'] == snap['ic'] and got['st'] == snap['st'] and abs(got['p']['x'] - snap['p']['x']) < .6 and (n != 4 or abs(got['a'] - 55) < .5) and not e2
            res[n] = ok
            if not ok: print('   ', n, snap, got, ids, e2)
        rec('T06 kaydet→kapat→aç→devam (Bölüm 1-7)', all(res.values()), json.dumps(res))
        # visibility: the app goes to the background
        await pg.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))")
        hv = await pg.evaluate("({sheet:T.vis().sheet,run:!!JSON.parse(localStorage.getItem('%s')).run})" % SK)
        await pg.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'))")
        rec('Arka plana geçince duraklat + kaydet', hv['sheet'] and hv['run'], json.dumps(hv))
        await ctx.close()
        # ---------- T09: corrupt or hostile saves ----------
        cases = {'bozuk JSON': "'{'", 'null': "'null'", 'yanlış tipler': json.dumps(json.dumps({'unl': 'x', 'coins': -5, 'cap': 999, 'stars': {'1': 9, '9': 3}, 'up': {'cap1': 1, 'evil': 1}, 'best': 'x', 'codex': ['nope', 5], 'run': {'ch': 99}})),
                 'dev sayılar': json.dumps(json.dumps({'unl': 1e9, 'coins': 1e30, 'stars': {'7': 3}, 'cap': -1}))}
        out = {}
        for k, v in cases.items():
            ctx, pg, errs = await page(b, init="localStorage.setItem('%s',%s);" % (SK, v)); await prep(pg)
            d = await pg.evaluate("(()=>{const D=T.S.D();return {unl:D.unl,coins:D.coins,cap:D.cap,stars:D.stars,up:D.up,run:D.run}})()")
            st = await pg.evaluate("T.play(1)")
            ok = not real_errs(errs) and st == 'play' and 1 <= d['unl'] <= 7 and 0 <= d['coins'] <= 1e7 and 4 <= d['cap'] <= 8 and all(1 <= x <= 3 for x in d['stars'].values()) and d['run'] is None and 'evil' not in d['up']
            out[k] = (ok, d); await ctx.close()
        ctx, pg, errs = await page(b, init="localStorage.setItem('%s','{bad');localStorage.setItem('%s-bak',JSON.stringify({unl:5,stars:{1:3,2:2,3:1,4:3},coins:77}));" % (SK, SK)); await prep(pg)
        bk = await pg.evaluate("({unl:T.S.D().unl,coins:T.S.D().coins})"); await ctx.close()
        rec('T09 bozuk kayıtlar', all(v[0] for v in out.values()) and bk == {'unl': 5, 'coins': 77}, json.dumps({k: v[1] for k, v in out.items()}, ensure_ascii=False)[:600] + f' · yedekten dönüş={bk}')
        # ---------- T07: codex survives a relaunch ----------
        ctx, pg, errs = await page(b, init=ALL7); await prep(pg)
        await pg.evaluate("T.play(7)"); await pg.evaluate("T.S.courseFinished&&0")
        await pg.evaluate("(()=>{const S=T.S;S.setR({course:S.CH[7].c1-1,inCourse:0});})()")
        c0 = await pg.evaluate("T.S.ssave(),JSON.parse(localStorage.getItem('%s')).codex" % SK)
        await pg.evaluate("localStorage.setItem('%s',JSON.stringify(Object.assign(JSON.parse(localStorage.getItem('%s')),{codex:['k_mizab']})))" % (SK, SK))
        pg2, e2 = await newpage(ctx); await prep(pg2)
        found = await pg2.evaluate("T.S.D().codex")
        rec('T07 keşif defteri kalıcı', 'k_mizab' in found, f'kayıttaki defter={found}')
        await ctx.close()
        # ---------- Full story 1 -> 7, then the second layer opens ----------
        ctx, pg, errs = await page(b, init="localStorage.setItem('%s',JSON.stringify({unl:1,tut:1}));" % SK); await prep(pg)
        chain = []
        for n in range(1, 8):
            await pg.evaluate(f"T.play({n})")
            await pg.evaluate("""(async()=>{const S=T.S,R=S.R(),c=S.CH[R.ch];
              if(R.ch===1||R.ch===2){S.setR({n:c.goal-1});const z=S.zonesOf().dump;S.setStack([R.ch===1?'mud':'rubble']);S.setP(z.x,z.z);S.step(6,.05);}
              else if(R.ch===4){S.setR({t:c.par-.2});S.F4().forEach(f=>f.anger=10);S.step(8,.05);}
              else{const last=c.c1-1;S.setR({course:last,inCourse:S.COURSES[last].n-1});const W=S.zonesOf().wall;S.setStack([S.COURSES[last].t==='stone'?'block':'beam']);S.setP(W.x,W.z);S.step(6,.05);}})()""")
            await pg.wait_for_timeout(800); await pg.evaluate("T.skipAll()"); await pg.wait_for_timeout(200)
            ids = await pg.evaluate("T.sheetIds()"); d = await pg.evaluate("({unl:T.S.D().unl,s:T.S.D().stars})")
            chain.append((n, 'kr-next' in ids or 'kr-end' in ids, d['unl']))
            await pg.screenshot(path=f'{OUT}/sonuc_{n}.png')
        await pg.evaluate("T.S.showMap()"); await pg.wait_for_timeout(300)
        mnode = await pg.evaluate("(()=>{const b=document.getElementById('km-meta');return b?{lock:b.classList.contains('lock'),t:b.innerText}:null})()")
        await pg.screenshot(path=OUT + '/harita_meta.png')
        rec('Hikâye 1→7 baştan sona', all(c[1] for c in chain) and mnode and not mnode['lock'] and not real_errs(errs), f'{chain} · harita düğümü={mnode} hata={real_errs(errs)[:2]}')
        await ctx.close()
        ctx, pg, errs = await page(b, init=ALL7); await prep(pg)
        await pg.evaluate("T.S.showMap()"); await pg.wait_for_timeout(200)
        lk = await pg.evaluate("(()=>{const b=document.getElementById('km-meta');b.click();return {lock:b.classList.contains('lock'),state:T.S.state()}})()")
        rec('Hacılara Hizmet: hikâye bitmeden kilitli', lk['lock'] and lk['state'] == 'hub', json.dumps(lk))
        await ctx.close()
        # ---------- second layer ----------
        ctx, pg, errs = await page(b, init=DONE); await prep(pg)
        await pg.evaluate("T.S.showMap()"); await pg.wait_for_timeout(200); await pg.evaluate("document.getElementById('km-meta').click()"); await pg.wait_for_timeout(250)
        intro = await pg.evaluate("document.getElementById('kcard').innerText")
        await pg.screenshot(path=OUT + '/meta_giris.png')
        await pg.evaluate("document.getElementById('mi-go').click()"); await pg.wait_for_timeout(500)
        st = await pg.evaluate("({state:T.S.state(),ch:T.S.R().ch,hud:T.S.hud(),pads:T.S.MPADS(),cap:T.S.metaCap()})")
        rec('Hacılara Hizmet açılır', st['state'] == 'play' and st['ch'] == 8 and 'sikâye' in intro and len(st['pads']) == 3, f"{st} · tarih notu var={'sikâye' in intro}")
        await pg.evaluate("T.S.setStock('w',6)")
        for i in range(6): await pg.evaluate("T.S.spawn()")
        await pg.evaluate("T.S.step(900,.05)")
        r1 = await pg.evaluate("({m:{ss:T.S.meta().ss,served:T.S.meta().served,ms:T.S.meta().ms},cash:T.S.STD.w.cash,stock:T.S.STD.w.z.count,pil:T.S.PIL()})")
        await pg.screenshot(path=OUT + '/meta_oyun.png')
        coins0 = await pg.evaluate("T.S.D().coins")
        await pg.evaluate("(()=>{const z=T.S.STD.w.z;T.S.setStack(['water','water']);T.S.setP(z.x,z.z);T.S.step(12,.05)})()")
        got = await pg.evaluate("({coins:T.S.D().coins,cash:T.S.STD.w.cash,stock:T.S.STD.w.z.count})")
        rec('Hacılar sıraya girer, ikram edilir, bereket toplanır', r1['m']['ss'] >= 4 and r1['cash'] >= 8 and got['coins'] >= coins0 + r1['cash'] and got['cash'] == 0 and got['stock'] >= 2,
            f"45 sn: ikram={r1['m']['ss']} tezgâhta={r1['cash']} · tezgâha gelince +{got['coins']-coins0} bereket, stok {r1['stock']}→{got['stock']}")
        # pilgrims finish a lap and leave
        seen = set(); left0 = await pg.evaluate("T.S.meta().served")
        for i in range(16):
            await pg.evaluate("T.S.meta().ss=0;T.S.setStock('w',6);T.S.step(100,.05)")
            for q in await pg.evaluate("T.S.PIL()"): seen.add(q['st'])
        lp = await pg.evaluate("({n:T.S.PIL().length,pool:T.S.PIL().length})")
        rec('Hacı tavaf turu ve çıkış', {'q', 'tw', 'lap', 'out'} <= seen, f'80 sn içinde görülen durumlar={sorted(seen)} (q=sıra, tw=tavafa yürüyüş, lap=tavaf, out=çıkış); şu an aktif={lp["n"]}')
        # buy the water carrier through the pad card
        await pg.evaluate("T.S.setD({coins:2000})")
        buys = []
        for want in ['standD', 'mcap1', 'saka']:
            await pg.evaluate(f"(()=>{{const p=T.S.nearestPad;const ids=T.S.MPADS();}})()")
            pos = await pg.evaluate(f"(()=>{{const u=T.S.MUPG.find(u=>u.id==='{want}');T.S.setP(u.x,u.z);T.S.step(4,.05);return 0}})()"); await pg.wait_for_timeout(400)
            pos = await pg.evaluate(f"(()=>{{return !document.getElementById('kpad').hidden}})()")
            if pos: await pg.evaluate("document.querySelector('#kpad button').click()"); await pg.wait_for_timeout(120)
            buys.append((want, pos, await pg.evaluate(f"!!T.S.meta().up['{want}']")))
        await pg.evaluate("T.S.setStock('w',0)"); await pg.evaluate("T.S.step(500,.05)")
        hp = await pg.evaluate("({help:T.S.HELP(),stock:T.S.STD.w.z.count,pads:T.S.MPADS(),dOpen:T.S.zonesOf().mdates.vis})")
        rec('Yardımcı alımı + saka su taşır', all(b_[2] for b_ in buys) and hp['stock'] > 0 and hp['dOpen'], f'alımlar={buys} · saka sonrası su stoku={hp["stock"]} · yeni daireler={hp["pads"]}')
        # season end
        await pg.evaluate("(()=>{const m=T.S.meta();m.ss=T.S.seasonTarget(m.season)-1;T.S.setStock('w',6);T.S.spawn();T.S.spawn();})()")
        for i in range(40):
            await pg.evaluate("T.S.step(40,.05)")
            if await pg.evaluate("T.vis().sheet"): break
        await pg.wait_for_timeout(900)
        sids = await pg.evaluate("T.sheetIds()"); await pg.screenshot(path=OUT + '/meta_mevsim.png')
        if 'km-next' in sids: await pg.evaluate("document.getElementById('km-next').click()")
        ss = await pg.evaluate("({season:T.S.meta().season,ss:T.S.meta().ss,state:T.S.state(),next:T.S.seasonTarget(T.S.meta().season)})")
        rec('Hac mevsimi biter, sonraki başlar', 'km-next' in sids and ss['season'] == 2 and ss['ss'] == 0 and ss['state'] == 'play', f'ekran={sids} sonra={ss}')
        # away earnings
        await pg.evaluate("T.S.saveMeta();T.S.meta().lastT=Date.now()-3600e3;T.S.ssave()")
        pg2, e2 = await newpage(ctx); await prep(pg2); await pg.close(); pg = pg2
        c0 = await pg.evaluate("T.S.D().coins")
        await pg.evaluate("T.S.startMeta()"); await pg.wait_for_timeout(300)
        aw = await pg.evaluate("({txt:document.getElementById('kcard').innerText,vis:T.vis().sheet,coins:T.S.D().coins})")
        await pg.screenshot(path=OUT + '/meta_hosgeldin.png')
        rec('Sen yokken kazanç (1 saat, saka)', aw['vis'] and aw['coins'] - c0 == 180, f"+{aw['coins']-c0} bereket (beklenen: 3600 sn / 20 sn = 180 ikram × 2 × %50 = 180)")
        # meta save survives relaunch
        await pg.evaluate("document.getElementById('kw-ok')&&document.getElementById('kw-ok').click()")
        await pg.evaluate("T.S.step(80,.05)")
        pg2, e2 = await newpage(ctx); await prep(pg2)
        mm = await pg2.evaluate("({season:T.S.meta().season,up:Object.keys(T.S.meta().up),served:T.S.meta().served})")
        rec('Hacılara Hizmet kaydı kalıcı', mm['season'] == 2 and 'saka' in mm['up'] and not real_errs(errs), json.dumps(mm))
        await ctx.close()
        # ---------- marker label stays on screen ----------
        ctx, pg, errs = await page(b, w=360, h=780, init=ALL7); await prep(pg)
        await pg.evaluate("T.play(1)"); edge = []
        for yaw in range(0, 628, 40):
            await pg.evaluate(f"T.S.step(2,.05)")
            m = await pg.evaluate("T.S.marker()")
            if not m['hidden']: edge.append(m['r']['left'] >= 0 and m['r']['right'] <= 360)
            await pg.mouse.move(250, 400); await pg.mouse.down(); await pg.mouse.move(290, 400); await pg.mouse.up()
        rec('Hedef etiketi ekranda kalır (360 px)', edge and all(edge), f'{sum(edge)}/{len(edge)} karede tam görünür')
        await ctx.close()
        await b.close()
    json.dump(R, open(OUT + '/t22_sonuc.json', 'w'), ensure_ascii=False, indent=1)
    print('TOPLAM', sum(r['ok'] for r in R), '/', len(R))
asyncio.run(main())
