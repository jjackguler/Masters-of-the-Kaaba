# Aşama 1 tests: viewport on phones (raw HTML, as Codex opened it), offline app build, CDN failure fallback
import asyncio, json, os, mimetypes
from playwright.async_api import async_playwright
ROOT = '/home/claude/kabe'
OUT = ROOT + '/dist/test'; os.makedirs(OUT, exist_ok=True)
WEB = open(ROOT + '/bekke-kabe.html', encoding='utf-8').read()
APPDIR = ROOT + '/dist/app/www'
THREE = ROOT + '/vendor/three/three.min.js'
CHROME = dict(executable_path='/usr/bin/google-chrome', args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
R = []
def rec(test, ok, detail): R.append({'test': test, 'ok': ok, 'detail': detail}); print(('PASS ' if ok else 'FAIL ') + test + ' | ' + detail, flush=True)

M = """()=>{const r=e=>{const el=document.querySelector(e);if(!el)return null;const b=el.getBoundingClientRect();return {w:Math.round(b.width),h:Math.round(b.height),x:Math.round(b.x),r:Math.round(b.right)}};
 const over=[...document.querySelectorAll('#ktitle button,.kcard button,.kbtn')].filter(b=>b.offsetParent&&b.scrollWidth>b.clientWidth+1).map(b=>b.textContent.trim());
 return {iw:innerWidth,ih:innerHeight,vw:visualViewport.width,scale:visualViewport.scale,play:r('#k-play'),set:r('#k-set'),more:r('#k-more'),go:r('#ks-go'),back:r('#ks-x'),overflow:over,docW:document.documentElement.scrollWidth}}"""

async def web_page(b, w, h, lang, block_cdn=False):
    ctx = await b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=3, is_mobile=True, has_touch=True, locale='tr-TR' if lang == 'tr' else 'en-US')
    await ctx.add_init_script("try{localStorage.setItem('bekke-lang','%s')}catch(_){}" % lang)
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    async def route(r):
        u = r.request.url
        if 'three.min.js' in u:
            if block_cdn: await r.abort()
            else: await r.fulfill(path=THREE, content_type='application/javascript')   # stands in for cdnjs r128 (sandbox has no internet)
        elif u.startswith('http://game.test'): await r.fulfill(body=WEB, content_type='text/html')    # served raw, no extra viewport added
        else: await r.abort()
    await pg.route('**/*', route)
    await pg.goto('http://game.test/'); await pg.wait_for_timeout(2500)
    return ctx, pg, errs

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(**CHROME)
        # 1. viewport + touch-target sizes, TR/EN, three phone widths
        for (w, h) in [(360, 780), (390, 844), (430, 932)]:
            for lang in ['tr', 'en']:
                ctx, pg, errs = await web_page(b, w, h, lang)
                m = await pg.evaluate(M)
                await pg.screenshot(path=f'{OUT}/title_{w}_{lang}.png')
                ok = m['iw'] == w and abs(m['scale'] - 1) < 1e-6 and m['docW'] <= w and m['play']['h'] >= 44 and m['set']['h'] >= 44 and not m['overflow'] and m['play']['r'] <= w and not errs
                rec(f'viewport {w}x{h} {lang}', ok, f"innerWidth={m['iw']} scale={m['scale']} docW={m['docW']} OYNA={m['play']['w']}x{m['play']['h']} Ayarlar={m['set']['w']}x{m['set']['h']} Diğer={m['more']['w']}x{m['more']['h']} taşma={m['overflow']} hata={len(errs)}")
                await pg.click('#k-play', force=True); await pg.wait_for_timeout(700)
                m2 = await pg.evaluate(M)
                await pg.screenshot(path=f'{OUT}/story_{w}_{lang}.png')
                ok2 = m2['go'] and m2['go']['h'] >= 44 and m2['back']['h'] >= 44 and not m2['overflow'] and m2['docW'] <= w
                rec(f'hikâye kartı {w} {lang}', bool(ok2), f"Başla={m2['go']} Geri={m2['back']} taşma={m2['overflow']}")
                await ctx.close()
        # 2. large text: Android WebView text zoom is approximated with -webkit-text-size-adjust on a mobile viewport
        ctx, pg, errs = await web_page(b, 390, 844, 'tr')
        base = await pg.evaluate("parseFloat(getComputedStyle(document.querySelector('#k-play')).fontSize)")
        await pg.add_style_tag(content='html{-webkit-text-size-adjust:200%!important;text-size-adjust:200%!important}')
        await pg.wait_for_timeout(300)
        big = await pg.evaluate("parseFloat(getComputedStyle(document.querySelector('#k-play')).fontSize)")
        await pg.screenshot(path=f'{OUT}/title_390_tr_text200.png')
        m = await pg.evaluate(M)
        rec('büyük yazı (emülasyon)', big > base * 1.5 and not m['overflow'] and m['docW'] <= 390, f'OYNA yazı boyu {base}px -> {big}px, taşma={m["overflow"]}, docW={m["docW"]}' + ('' if big > base * 1.5 else ' (text-size-adjust bu emülasyonda etki etmedi; test geçersiz)'))
        await ctx.close()
        # 3. CDN unreachable -> readable message instead of a blank page
        ctx, pg, errs = await web_page(b, 390, 844, 'tr', block_cdn=True)
        t = await pg.evaluate("(document.getElementById('engine-missing')||{}).innerText||''")
        await pg.screenshot(path=f'{OUT}/cdn_yok_390_tr.png')
        rec('CDN yokken açıklayıcı ekran', 'Oyun motoru yüklenemedi' in t, repr(t[:60]) + f' sayfa hatası={errs[:1]}')
        await ctx.close()
        # 4. offline app build: every request must be a local file; anything else is recorded and aborted
        ctx = await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True, locale='tr-TR')
        await ctx.set_offline(True)
        pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        local, external = [], []
        async def route(r):
            u = r.request.url
            if u.startswith('http://app.local/'):
                rel = u[len('http://app.local/'):].split('?')[0] or 'index.html'
                fp = os.path.join(APPDIR, rel)
                if os.path.isfile(fp):
                    local.append(rel); await r.fulfill(path=fp, content_type=mimetypes.guess_type(fp)[0] or 'application/octet-stream')
                else: external.append('LOCAL-404 ' + rel); await r.abort()
            elif u.startswith('data:') or u.startswith('blob:'): await r.continue_()
            else: external.append(u); await r.abort()
        await pg.route('**/*', route)
        await pg.goto('http://app.local/index.html'); await pg.wait_for_timeout(3000)
        info = await pg.evaluate("""async()=>{await document.fonts.ready;return {three:window.THREE&&THREE.REVISION,fontD:document.fonts.check('800 20px Alegreya'),fontU:document.fonts.check('800 16px "Alegreya Sans"'),title:!document.getElementById('ktitle').hidden,iw:innerWidth,engineMsg:!!document.getElementById('engine-missing')}}""")
        await pg.screenshot(path=f'{OUT}/app_offline_title.png')
        rec('app: dış ağ isteği yok (çevrimdışı mod)', not external, f'yerel istek={len(local)} dış/eksik={external[:5]}')
        rec('app: motor + fontlar yerelden', info['three'] == '128' and info['fontD'] and info['fontU'] and info['title'] and not info['engineMsg'] and not errs, json.dumps(info) + f' hata={errs[:1]}')
        # play into chapter 1 offline
        await pg.click('#k-play', force=True); await pg.wait_for_timeout(600); await pg.click('#ks-go', force=True); await pg.wait_for_timeout(1500)
        for i in range(40):
            if await pg.evaluate('__kabe.state') != 'cine': break
            await pg.evaluate('__site.skipClip()'); await pg.wait_for_timeout(150)
        await pg.wait_for_timeout(1500)
        st = await pg.evaluate("({state:__kabe.state,ch:__site.R().ch})")
        await pg.screenshot(path=f'{OUT}/app_offline_bolum1.png')
        rec('app: çevrimdışı Bölüm 1 oynanır duruma gelir', st['state'] == 'play' and st['ch'] == 1 and not external and not errs, json.dumps(st) + f' dış={external[:3]} hata={errs[:1]}')
        await ctx.close(); await b.close()
    json.dump(R, open(OUT + '/sonuclar.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('TOPLAM', sum(r['ok'] for r in R), '/', len(R))
asyncio.run(main())
