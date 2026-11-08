# Tests for the K1-K13 fixes, the status chip, the sales gate, the short intro and the service tutorial.
import sys, asyncio, json, time
sys.path.insert(0, '/home/claude/kabe')
from tlib import *
R = []
def rec(t, ok, d): R.append({'test': t, 'ok': bool(ok), 'detail': d}); print(('PASS ' if ok else 'FAIL ') + t + ' | ' + d, flush=True)
SK = 'kabe-ustalari-v1'
ALL7 = "localStorage.setItem('%s',JSON.stringify({unl:7,stars:{1:3,2:3,3:3,4:3,5:3,6:3},coins:500,cap:4,up:{},tut:1}));" % SK
def DONE(meta='{intro:1,tut:1,up:{saka:true}}', coins=200):
    return "localStorage.setItem('%s',JSON.stringify({unl:7,stars:{1:3,2:3,3:3,4:3,5:3,6:3,7:3},done:true,coins:%d,cap:8,up:{cap1:true,cap2:true},tut:1,meta:%s}));" % (SK, coins, meta)
def real(e): return [x for x in e if 'Failed to load resource' not in x]
SAVED = "JSON.parse(localStorage.getItem('%s'))" % SK

async def app_page(b, init):
    """The app build (STORE_BUILD=true): served from dist/app/www."""
    ctx = await b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, locale='tr-TR')
    await ctx.add_init_script("try{if(!localStorage.getItem('__i')){localStorage.setItem('__i','1');localStorage.setItem('bekke-lang','tr');%s}}catch(_){}" % init)
    W = ROOT + '/dist/app/www'
    async def route(r):
        u = r.request.url
        if u.startswith('http://app.test/'):
            path = u[len('http://app.test/'):].split('?')[0] or 'index.html'
            import os, mimetypes
            fp = os.path.join(W, path)
            if os.path.isfile(fp): await r.fulfill(path=fp, content_type=mimetypes.guess_type(fp)[0] or 'application/octet-stream')
            else: await r.fulfill(status=404, body='')
        else: await r.abort()
    await ctx.route('**/*', route)
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.goto('http://app.test/index.html'); await pg.wait_for_timeout(2200); await pg.evaluate(JS_HELP)
    return ctx, pg, errs

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(**CHROME)
        # ---------- K1: collected counter money cannot be collected again ----------
        ctx, pg, errs = await page(b, init=DONE()); await pg.evaluate(JS_HELP)
        await pg.evaluate("T.S.startMeta()"); await pg.wait_for_timeout(400)
        await pg.evaluate("T.S.STD.w.cash=24;T.S.ssave()")
        live = await pg.evaluate("(()=>{const z=T.S.STD.w.z;T.S.setStack([]);T.S.setP(z.x,z.z);T.S.step(3,.05);const r={coins:T.S.D().coins,cash:T.S.STD.w.cash};T.S.goBack();return r})()")
        await pg.wait_for_timeout(600); await pg.evaluate("T.S.goBack()")
        sv = await pg.evaluate("(()=>{const s=%s;return {coins:s.coins,cash:s.meta.cash.w}})()" % SAVED)
        rec('K1 tezgâh parası ikinci kez alınamaz', live['coins'] == 224 and sv['coins'] + sv['cash'] == 224, f'canlı={live} kayıt={sv} (bakiye+tezgâh 224 kalmalı)')
        # ---------- K3: clock trick ----------
        await pg.evaluate("T.S.meta().lastT=Date.now()-7200e3")
        a1 = await pg.evaluate("JSON.stringify(T.S.awayEarnings())")
        await pg.evaluate("window.__n=Date.now;Date.now=()=>window.__n()-7200e3")
        a2 = await pg.evaluate("JSON.stringify(T.S.awayEarnings())")
        await pg.evaluate("Date.now=window.__n")
        a3 = await pg.evaluate("JSON.stringify(T.S.awayEarnings())")
        await pg.evaluate("Date.now=()=>window.__n()+3600e3")
        a4 = await pg.evaluate("JSON.stringify(T.S.awayEarnings())"); await pg.evaluate("Date.now=window.__n")
        rec('K3 saat geri-ileri hilesi', a1 != 'null' and a2 == 'null' and a3 == 'null' and a4 != 'null', f'ileri={a1} geri={a2} tekrar ileri={a3} · gerçekten 1 saat sonra={a4}')
        # ---------- K4: loads in hands and helpers survive; helpers wait at a full stand ----------
        await pg.evaluate("T.S.setStock('w',16)"); await pg.evaluate("T.S.step(400,.05)")
        h1 = await pg.evaluate("T.S.HELP()")
        await pg.evaluate("T.S.setStack(['water','water','water']);T.S.ssave()")
        pg2, e2 = await newpage(ctx); await pg2.evaluate(JS_HELP); await pg.close(); pg = pg2
        await pg.evaluate("T.S.startMeta()"); await pg.wait_for_timeout(400)
        k4 = await pg.evaluate("({stack:T.S.stack(),help:T.S.HELP()})")
        rec('K4 taşınan yük korunur', k4['stack'] == ['water'] * 3 and any(h['carry'] > 0 for h in h1) and any(h['carry'] > 0 for h in k4['help']), f"yeniden açınca elde={k4['stack']} · dolu standda saka yükü={[h['carry'] for h in h1]} → açılışta={[h['carry'] for h in k4['help']]}")
        # ---------- K6: a late season sheet never opens after leaving ----------
        await pg.evaluate("(()=>{const m=T.S.meta();m.between=0;m.ss=T.S.seasonTarget(m.season);T.S.seasonDone();T.S.goBack();})()")
        await pg.wait_for_timeout(150)
        await pg.evaluate("document.getElementById('kp-map')&&document.getElementById('kp-map').click()")
        await pg.wait_for_timeout(1300)
        k6 = await pg.evaluate("({ids:T.sheetIds(),vis:T.vis()})")
        rec('K6 geç gelen mevsim ekranı', 'km-next' not in k6['ids'] and k6['vis']['map'], json.dumps(k6))
        await ctx.close()
        # ---------- K2: the course-end reward is saved together with the course ----------
        ctx, pg, errs = await page(b, init=ALL7); await pg.evaluate(JS_HELP)
        await pg.evaluate("T.play(5)")
        k2 = await pg.evaluate("""(()=>{const S=T.S,c=S.CH[5];S.setR({course:c.c0,inCourse:S.COURSES[c.c0].n-1});const W=S.zonesOf().wall;const d0=S.D().coins;
           S.setStack([S.COURSES[c.c0].t==='stone'?'block':'beam']);S.setP(W.x,W.z);S.step(4,.05);const s=%s;return {state:S.state(),course:S.R().course,savedCourse:s.run&&s.run.course,savedIn:s.run&&s.run.inCourse,dCoins:s.coins-d0}})()""" % SAVED)
        rec('K2 sıra sonu ödülü + bölüm kaydı birlikte', k2['savedCourse'] == k2['course'] and k2['savedIn'] == 0 and k2['dCoins'] >= 15, json.dumps(k2))
        await pg.evaluate("T.skipAll()")
        # ---------- K5 + T2: no dead end at a full workshop; the chip says why ----------
        await pg.evaluate("T.play(3)")
        k5 = await pg.evaluate("""(()=>{const S=T.S,Z=S.Z();Z.cutIn.count=Z.cutIn.max;Z.cutOut.count=Z.cutOut.max;S.setStack(['raw']);const t=S.siteTarget().n;
           const ci=S.zonesOf().cutIn;S.setP(ci.x,ci.z);S.step(4,.05);return {t}})()""")
        await pg.wait_for_timeout(900); chip_full = await pg.evaluate("T.S.chip()")
        k5b = await pg.evaluate("""(()=>{const S=T.S,Z=S.Z();const r=S.zonesOf().raw;S.setP(r.x,r.z);S.step(6,.05);const a=S.stack().slice();const o=S.zonesOf().cutOut;S.setP(o.x,o.z);S.step(6,.05);return {afterBack:a,afterTake:S.stack().slice()}})()""")
        await pg.evaluate("(()=>{const S=T.S;S.setStack(['block']);const ci=S.zonesOf().cutIn;S.setP(ci.x,ci.z);S.Z().cutIn.count=3;})()"); await pg.wait_for_timeout(900)
        chip_wrong = await pg.evaluate("T.S.chip()")
        rec('K5 dolu atölyede kilit yok', 'Geri bırak' in k5['t'] and k5b['afterBack'] == [] and len(k5b['afterTake']) > 0 and set(k5b['afterTake']) == {'block'}, f"ok: {k5['t']!r} · ham taşa dönünce el={k5b['afterBack']} · sonra kesme taş alındı={k5b['afterTake']}")
        rec('T2 durum çipi', 'Dolu' in chip_full and 'Yanlış' in chip_wrong, f'dolu atölyede: {chip_full!r} · kesme taşla taşçı girişinde: {chip_wrong!r}')
        # ---------- K9: chapter 7 full-load bonus at a small capacity ----------
        await pg.evaluate("T.S.setD({cap:6,up:{cap1:true}})"); await pg.evaluate("T.play(7)")
        k9 = await pg.evaluate("""(()=>{const S=T.S;const W=S.zonesOf().wall;const cap=S.unload?0:0;const d0=S.D().coins;S.setStack(['beam','beam','beam']);S.setP(W.x,W.z);S.step(12,.05);S.setP(W.x+12,W.z+12);S.step(14,.05);return {d:S.D().coins-d0}})()""")
        rec('K9 Bölüm 7 tam yük bonusu (kapasite 3)', k9['d'] >= 3 * 7 + 6, f"3 kiriş: +{k9['d']} bereket (3×7 + 6 bonus beklenir)")
        # ---------- K12: no arrow bob with reduced motion ----------
        await pg.evaluate("T.S.setD({rm:true})"); await pg.evaluate("T.play(1)")
        sc = await pg.evaluate("(async()=>{const a=[];for(let i=0;i<6;i++){await new Promise(r=>setTimeout(r,120));a.push(T.S.arrowScale?T.S.arrowScale():null);}return a})()")
        rec('K12 hareket azaltmada ok sallanmaz', len(set(sc)) == 1 and sc[0] is not None, f'ok ölçeği 6 karede: {sc}')
        # ---------- K10: removed pads free their textures ----------
        await pg.evaluate("T.S.setD({coins:2000,up:{}});T.play(5)")
        m0 = await pg.evaluate("T.S.mem().textures")
        for i in range(4):
            await pg.evaluate("(()=>{const p=T.S.PADS[0];if(p)T.S.buyPad(p);})()")
        await pg.wait_for_timeout(300); m1 = await pg.evaluate("T.S.mem().textures")
        rec('K10 alınan yükseltme dairesi belleği bırakır', m1 <= m0, f'doku sayısı {m0} → {m1} (4 alım)')
        await ctx.close()
        # ---------- K8: a half chapter number in the save ----------
        ctx, pg, errs = await page(b, init="localStorage.setItem('%s',JSON.stringify({unl:3,stars:{1:3,2:3},run:{ch:1.5,t:3}}));" % SK); await pg.evaluate(JS_HELP)
        await pg.evaluate("document.getElementById('k-play').click()"); await pg.wait_for_timeout(400)
        k8 = await pg.evaluate("({run:T.S.D().run,ids:T.sheetIds(),vis:T.vis()})")
        rec('K8 bozuk bölüm numarası', k8['run'] is None and 'kr-res' not in k8['ids'] and not real(errs), json.dumps(k8))
        await ctx.close()
        # ---------- T1: chapter 1 short intro, full intro on request ----------
        ctx, pg, errs = await page(b, init="localStorage.setItem('%s',JSON.stringify({unl:1,tut:0}));" % SK); await pg.evaluate(JS_HELP)
        async def intro_len():
            n = await pg.evaluate("T.S.cineState()&&T.S.cineState().n"); t = 0
            while t < 60:
                st = await pg.evaluate("T.S.cineFF(0.5),T.S.state()"); t += .5
                if st == 'play': break
            return n, t
        await pg.evaluate("T.S.startChapter(1)"); await pg.wait_for_timeout(200); n1, t1 = await intro_len()
        await pg.evaluate("T.S.showMap();T.S.showStory(1)"); await pg.wait_for_timeout(200)
        has = await pg.evaluate("!!document.getElementById('ks-full')")
        await pg.evaluate("document.getElementById('ks-full').click()"); await pg.wait_for_timeout(200); n2, t2 = await intro_len()
        rec('T1 kısa giriş (Bölüm 1)', n1 == 3 and t1 <= 15 and has and n2 == 5, f'kısa: {n1} sahne, {t1:.1f} sn oyun zamanı · "Girişi uzun izle" düğmesi={has} → {n2} sahne, {t2:.1f} sn')
        await ctx.close()
        # ---------- T4: first-visit tutorial in the service layer + mastery goal ----------
        ctx, pg, errs = await page(b, init=DONE(meta='{intro:1,up:{}}')); await pg.evaluate(JS_HELP)
        await pg.evaluate("T.S.startMeta()"); await pg.wait_for_timeout(500)
        steps = [await pg.evaluate("document.getElementById('ktip').textContent")]
        await pg.evaluate("(()=>{const S=T.S;const w=S.zonesOf().well;S.setP(w.x,w.z);S.step(6,.05);})()"); await pg.wait_for_timeout(300)
        steps.append(await pg.evaluate("document.getElementById('ktip').textContent"))
        await pg.evaluate("(()=>{const S=T.S;const z=S.STD.w.z;S.setP(z.x,z.z);S.step(6,.05);S.setP(z.x+6,z.z+6);})()"); await pg.wait_for_timeout(300)
        steps.append(await pg.evaluate("document.getElementById('ktip').textContent"))
        for i in range(30):
            await pg.evaluate("T.S.step(40,.05)")
            if await pg.evaluate("T.S.STD.w.cash>0"): break
        await pg.wait_for_timeout(300); steps.append(await pg.evaluate("document.getElementById('ktip').textContent"))
        await pg.evaluate("(()=>{const S=T.S;const z=S.STD.w.z;S.setP(z.x,z.z);S.step(6,.05);})()"); await pg.wait_for_timeout(300)
        steps.append(await pg.evaluate("document.getElementById('ktip').textContent")); tut = await pg.evaluate("T.S.meta().tut")
        sub = await pg.evaluate("T.S.step(2,.05),T.S.hud().sub")
        rec('T4 Hacılara Hizmet öğreticisi (4 adım)', tut == 1 and steps[1].startswith('2/4') and steps[2].startswith('3/4') and steps[3].startswith('4/4'), ' → '.join(s[:30] for s in steps))
        rec('T4 mevsim ustalık hedefi', 'Ustalık' in sub, f'görev satırı: {sub!r}')
        await ctx.close()
        # ---------- sales gate in the app build ----------
        ctx, pg, errs = await app_page(b, "localStorage.setItem('%s',JSON.stringify({unl:3,stars:{1:3,2:3},tut:1}));" % SK)
        g0 = await pg.evaluate("({full:T.S.isFull(),store:T.S.STORE_BUILD})")
        await pg.evaluate("T.S.showMap()"); await pg.wait_for_timeout(300)
        badges = await pg.evaluate("[...document.querySelectorAll('#km-path .knode')].map(b=>!!b.querySelector('.kpaid'))")
        await pg.screenshot(path=OUT + '/app_harita_kilit.png')
        await pg.evaluate("T.S.showStory(3)"); await pg.wait_for_timeout(300)
        pw = await pg.evaluate("({ids:T.sheetIds(),msg:(document.getElementById('kpw-msg')||{}).textContent,buy:(document.getElementById('kpw-buy')||{}).textContent})")
        await pg.screenshot(path=OUT + '/app_tam_surum.png')
        await pg.evaluate("document.getElementById('kpw-x').click()")
        free = await pg.evaluate("T.play(2)")
        await pg.evaluate("T.S.startChapter(5)"); await pg.wait_for_timeout(300); direct = await pg.evaluate("T.sheetIds()")
        await pg.evaluate("T.S.grantFull('test')"); await pg.wait_for_timeout(300)
        after = await pg.evaluate("T.play(3)")
        rec('Satış kilidi (uygulama paketi)', g0 == {'full': False, 'store': True} and badges[:2] == [False, False] and all(badges[2:7]) and 'kpw-buy' in pw['ids'] and 'kpw-restore' in pw['ids'] and free == 'play' and 'kpw-buy' in direct and after == 'play' and not real(errs),
            f"kilitli rozetler={badges} · 3. bölüm → satın alma ekranı ({pw['buy']!r}; {pw['msg']!r}) · 2. bölüm açık={free} · doğrudan 5. bölüm de kilitli · açılınca 3. bölüm={after}")
        await ctx.close()
        ctx, pg, errs = await page(b, init=ALL7); await pg.evaluate(JS_HELP)
        wf = await pg.evaluate("({full:T.S.isFull(),store:T.S.STORE_BUILD})"); st5 = await pg.evaluate("T.play(5)")
        rec('Web sürümü tam açık', wf == {'full': True, 'store': False} and st5 == 'play', json.dumps(wf))
        await ctx.close(); await b.close()
    json.dump(R, open(OUT + '/t23_sonuc.json', 'w'), ensure_ascii=False, indent=1)
    print('TOPLAM', sum(r['ok'] for r in R), '/', len(R))
asyncio.run(main())
