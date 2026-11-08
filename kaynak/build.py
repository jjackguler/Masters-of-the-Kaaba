"""Kâbe Ustaları build.

Single command (any OS, Python 3.8+):
    python build.py

Outputs
  bekke-kabe.html              web build (three.js r128 from cdnjs + Google Fonts); this is what the claude.ai artifact publishes
  dist/web/kabe-ustalari.html  same web build, under the product name
  dist/app/www/                offline build for Capacitor (iOS/Android): local three.js + local fonts, no network requests
  dist/BUILD_MANIFEST.json     SHA-256 of every input and output, Python version
"""
import hashlib, json, os, platform, re, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)

def rd(p):
    with open(p, encoding='utf-8') as f:
        return f.read()

def wr(p, s):
    os.makedirs(os.path.dirname(p) or '.', exist_ok=True)
    with open(p, 'w', encoding='utf-8', newline='\n') as f:
        f.write(s)

def sha(p):
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''):
            h.update(b)
    return h.hexdigest()

# ---------- 1. every input must be present before anything runs ----------
MODULES_I18N = ['l1.js', 'l2.js', 'l3.js', 'l5.js', 'l4.js', 'l6.js', 'l7.js']   # wrapped by i18n.py -> l*.t.js (generated)
MODULES_RAW = ['world.js', 'l0.js', 'l8.js', 'l9.js', 'l10.js', 'l11.js', 'l12.js', 'l13.js']   # l9 opens the site scope, l13 closes it
INPUTS = {
    'head.html': 'page head: CSS and static DOM',
    'i18n.py': 'wraps Turkish strings in l1-l7 with __t() (writes l*.t.js and strings.json, which are generated)',
    'en1.py': 'English translations, part 1 (index -> text)',
    'en2.py': 'English translations, part 2',
    'tr_list.json': 'the Turkish strings those indices refer to',
    'textures.js': 'baked PBR textures as data URIs (made by texgen.py)',
    'vendor/three/three.min.js': 'three.js r128 (MIT) for the offline app build',
    'vendor/three/LICENSE': 'three.js MIT license',
    'vendor/fonts/fonts.css': '@font-face rules for the offline app build',
    'vendor/fonts/OFL-Alegreya.txt': 'SIL OFL 1.1 license of Alegreya',
    'vendor/fonts/OFL-Alegreya-Sans.txt': 'SIL OFL 1.1 license of Alegreya Sans',
}
for m in MODULES_I18N + MODULES_RAW:
    INPUTS[m] = 'game module'
missing = [p for p in INPUTS if not os.path.isfile(p)]
font_files = re.findall(r'url\(([^)/]+\.woff2)\)', rd('vendor/fonts/fonts.css')) if os.path.isfile('vendor/fonts/fonts.css') else []
missing += ['vendor/fonts/' + f for f in font_files if not os.path.isfile('vendor/fonts/' + f)]
if missing:
    sys.stderr.write('BUILD STOPPED: these input files are missing:\n')
    for p in missing:
        sys.stderr.write('  - %s  (%s)\n' % (p, INPUTS.get(p, 'font file named in vendor/fonts/fonts.css')))
    sys.stderr.write('Copy the original files into this folder; do not create placeholder versions.\n')
    sys.exit(2)

# ---------- 2. translations ----------
ns = {}
exec(rd('en1.py'), ns); exec(rd('en2.py'), ns)
E = ns['E']; E.update(ns['E2'])
r = subprocess.run([sys.executable, 'i18n.py'] + MODULES_I18N, capture_output=True, text=True, encoding='utf-8')
if r.returncode != 0:
    sys.stderr.write('i18n.py failed:\n' + r.stdout + r.stderr); sys.exit(3)
tr = json.loads(rd('tr_list.json'))
EN = {tr[i]: v for i, v in E.items() if i < len(tr)}
l4 = rd('l4.js')
for m in re.finditer(r"'(<dl><dt>(?:Sol taraf|W A S D).*?</dl>)'", l4):   # the controls panel text changed after tr_list was made
    t = m.group(1); EN[t] = E[16] if t.startswith('<dl><dt>Sol') else E[17]
EN['kereste'] = 'timber'; EN['taş'] = 'stone'; EN['Course '] = 'Course '; EN[' going up…'] = ' going up…'
cur = set(json.loads(rd('strings.json')))
untranslated = [s for s in cur if s not in EN and re.search(r'[a-zçğıöşü]{3}', s) and not re.search(r'Alegreya|^(Arrow|Key|Enter|Escape|Space)', s)]
print('untranslated legacy strings (l1-l7, shown in Turkish when the language is English):', len(untranslated))

# ---------- 3. runtime header ----------
RT = r'''const QL=(()=>{let t='auto';try{t=localStorage.getItem('bekke-quality')||'auto';}catch(_){}
  const touch=matchMedia('(pointer:coarse)').matches,cores=navigator.hardwareConcurrency||4,mem=navigator.deviceMemory||4;
  const tier=t!=='auto'?t:(!touch?'high':(cores>=8&&mem>=6?'med':'low'));
  const P={high:{pr:2,sh:2048,post:1,std:true,props:1,grass:1,clouds:true},med:{pr:1.5,sh:1024,post:.8,std:true,props:.7,grass:.5,clouds:true},low:{pr:1,sh:1024,post:.65,std:false,props:.4,grass:0,clouds:false}}[tier];
  return Object.assign({sel:t,tier},P);})();
const MODE=(()=>{try{return localStorage.getItem('bekke-mode')||'p1';}catch(_){return 'p1';}})();
const LANG=(()=>{try{const v=localStorage.getItem('bekke-lang');if(v)return v;}catch(_){}return /^tr/i.test(navigator.language||'')?'tr':'en';})();
const EN=%s;
function __t(s){return LANG==='en'&&EN[s]!=null?EN[s]:s;}
(function translateDom(){if(LANG!=='en')return;document.documentElement.lang='en';document.title=__t(document.title);
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentNode&&/^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
  const ns=[];while(w.nextNode())ns.push(w.currentNode);for(const n of ns){const t=n.nodeValue.trim();if(t&&EN[t]!=null)n.nodeValue=n.nodeValue.replace(t,EN[t]);}
  document.querySelectorAll('[aria-label],[title]').forEach(el=>{for(const a of ['aria-label','title']){const v=el.getAttribute(a);if(v&&EN[v.trim()]!=null)el.setAttribute(a,EN[v.trim()]);}});})();
''' % json.dumps(EN, ensure_ascii=False)

# If three.js did not load (offline web visit, blocked CDN) show a readable message instead of a blank page.
ENGINE_GUARD = r'''<script>
window.__engineMissing=function(){if(window.THREE||document.getElementById('engine-missing'))return;
  var tr=/^tr/i.test((function(){try{return localStorage.getItem('bekke-lang')}catch(_){return null}})()||navigator.language||'');
  var d=document.createElement('div');d.id='engine-missing';d.setAttribute('role','alert');
  d.style.cssText='position:fixed;inset:0;z-index:99;display:flex;align-items:center;justify-content:center;padding:24px;background:#2a211b;color:#fff6e0;font:600 18px/1.5 system-ui,sans-serif;text-align:center';
  d.innerHTML=tr?'<div><b style="font-size:22px">Oyun motoru yüklenemedi</b><br>İnternet bağlantınızı kontrol edip sayfayı yenileyin.<br><button onclick="location.reload()" style="margin-top:18px;font:800 17px system-ui;padding:12px 26px;border:0;border-radius:999px;background:#d39a2c;color:#3a2408">Yenile</button></div>'
                :'<div><b style="font-size:22px">The game engine could not load</b><br>Check your internet connection and reload the page.<br><button onclick="location.reload()" style="margin-top:18px;font:800 17px system-ui;padding:12px 26px;border:0;border-radius:999px;background:#d39a2c;color:#3a2408">Reload</button></div>';
  (document.body||document.documentElement).appendChild(d);};
</script>
'''

head = rd('head.html')
body = rd('textures.js') + ''.join(rd(f) for f in ['world.js', 'l0.js'] + [m.replace('.js', '.t.js') for m in ['l1.js', 'l2.js', 'l3.js', 'l5.js', 'l4.js', 'l6.js', 'l7.js']] + ['l8.js', 'l9.js', 'l10.js', 'l11.js', 'l12.js', 'l13.js'])
MAIN = '<script>\n(function(){\nif(typeof THREE==="undefined"){window.__engineMissing();return;}\n' + RT + body + '\n})();\n</script>\n'

# ---------- 4a. web build ----------
CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
web = head + '\n' + ENGINE_GUARD + '<script src="%s" onerror="window.__engineMissing()"></script>\n' % CDN + MAIN
wr('bekke-kabe.html', web)
wr('dist/web/kabe-ustalari.html', web)

# ---------- 4b. offline app build ----------
app_head = re.sub(r'<link rel="preconnect"[^>]*>\n?', '', head)
app_head = app_head.replace('<meta charset="utf-8">\n', '', 1)   # the app page writes its own charset first
app_head, n = re.subn(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com[^"]*">', '<link rel="stylesheet" href="fonts/fonts.css">', app_head)
assert n == 1, 'Google Fonts link not found in head.html'
i = app_head.index('</style>') + len('</style>')
app = ('<!doctype html>\n<html lang="tr">\n<head>\n<meta charset="utf-8">\n<meta name="theme-color" content="#2a211b">\n' + app_head[:i] + '\n</head>\n<body>\n'
       + app_head[i:] + '\n' + ENGINE_GUARD + '<script src="lib/three.min.js" onerror="window.__engineMissing()"></script>\n' + MAIN + '</body>\n</html>\n')
ext = [u for u in re.findall(r'(?:src|href)="(https?://[^"]+)"', app)]
assert not ext, 'offline build still references the network: %s' % ext
W = 'dist/app/www'
if os.path.isdir(W):
    shutil.rmtree(W)
wr(W + '/index.html', app)
os.makedirs(W + '/lib', exist_ok=True); os.makedirs(W + '/fonts', exist_ok=True); os.makedirs(W + '/licenses', exist_ok=True)
shutil.copy('vendor/three/three.min.js', W + '/lib/three.min.js')
shutil.copy('vendor/fonts/fonts.css', W + '/fonts/fonts.css')
for f in font_files:
    shutil.copy('vendor/fonts/' + f, W + '/fonts/' + f)
shutil.copy('vendor/three/LICENSE', W + '/licenses/three.js-MIT.txt')
shutil.copy('vendor/fonts/OFL-Alegreya.txt', W + '/licenses/Alegreya-OFL.txt')
shutil.copy('vendor/fonts/OFL-Alegreya-Sans.txt', W + '/licenses/Alegreya-Sans-OFL.txt')

# ---------- 5. manifest ----------
outs = ['bekke-kabe.html', 'dist/web/kabe-ustalari.html'] + sorted(os.path.join(dp, f).replace('\\', '/') for dp, _, fs in os.walk(W) for f in fs)
man = {'python': platform.python_version(), 'command': 'python build.py',
       'inputs': {p: sha(p) for p in sorted(list(INPUTS) + ['vendor/fonts/' + f for f in font_files])},
       'generated_intermediates': ['l1.t.js', 'l2.t.js', 'l3.t.js', 'l4.t.js', 'l5.t.js', 'l6.t.js', 'l7.t.js', 'strings.json'],
       'outputs': {p: sha(p) for p in outs}, 'untranslated_legacy_strings': len(untranslated)}
wr('dist/BUILD_MANIFEST.json', json.dumps(man, indent=2, ensure_ascii=False))
print('web  bekke-kabe.html', len(web), 'bytes', man['outputs']['bekke-kabe.html'][:16])
print('app  dist/app/www/index.html', len(app), 'bytes', man['outputs'][W + '/index.html'][:16], '+', len(font_files), 'fonts')
