import asyncio, json, os
from playwright.async_api import async_playwright
ROOT='/home/claude/kabe'; OUT=ROOT+'/dist/test'; os.makedirs(OUT,exist_ok=True)
THREE=ROOT+'/vendor/three/three.min.js'
CHROME=dict(executable_path='/usr/bin/google-chrome',args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
def web(): return open(ROOT+'/bekke-kabe.html',encoding='utf-8').read()
async def page(b,w=390,h=844,lang='tr',init='',mobile=True):
    ctx=await b.new_context(viewport={'width':w,'height':h},device_scale_factor=1,is_mobile=mobile,has_touch=mobile,locale='tr-TR' if lang=='tr' else 'en-US')
    await ctx.add_init_script("try{if(!localStorage.getItem('__i')){localStorage.setItem('__i','1');localStorage.setItem('bekke-lang','%s');%s}}catch(_){}"%(lang,init))
    pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('console:'+m.text) if m.type=='error' else None)
    W=web()
    async def route(r):
        u=r.request.url
        if 'three.min.js' in u: await r.fulfill(path=THREE,content_type='application/javascript')
        elif u.startswith('http://game.test'): await r.fulfill(body=W,content_type='text/html')
        else: await r.abort()
    await ctx.route('**/*',route)
    await pg.goto('http://game.test/');await pg.wait_for_timeout(2200)
    return ctx,pg,errs

async def newpage(ctx):
    pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('http://game.test/');await pg.wait_for_timeout(2200);return pg,errs
JS_HELP = r"""
window.T={S:window.__site,
 async play(n){const S=this.S;S.startChapter(n);for(let i=0;i<60;i++){await new Promise(r=>setTimeout(r,50));if(S.state()==='play'&&!S.R().done)break;S.skipClip();}return S.state();},
 async skipAll(){const S=this.S;for(let i=0;i<60;i++){await new Promise(r=>setTimeout(r,50));if(!document.getElementById('ksheet').hidden)break;S.skipClip();}},
 vis(){const v=id=>{const e=document.getElementById(id);return !!e&&!e.hidden;};return {map:v('kmap'),title:v('ktitle'),sheet:v('ksheet'),state:this.S.state()};},
 sheetIds(){if(document.getElementById('ksheet').hidden)return [];return [...document.querySelectorAll('#kcard [id]')].map(e=>e.id);}
};"""
