#!/usr/bin/env python3
import re, struct
from pathlib import Path
root=Path(__file__).resolve().parents[1]
index=(root/'index.html').read_text(encoding='utf-8')
app=(root/'app.js').read_text(encoding='utf-8')
css=(root/'app.css').read_text(encoding='utf-8')
navigation_css=(root/'navigation.css').read_text(encoding='utf-8')
seo_css=(root/'seo-pages.css').read_text(encoding='utf-8')
def fail(msg): raise SystemExit(msg)
static_ids=set(re.findall(r'\bid=["\']([^"\']+)["\']',index))
dom_refs=set(re.findall(r'getElementById\(["\']([^"\']+)["\']\)',app))
missing=sorted(dom_refs-static_ids)
if missing: fail(f'app.js references missing IDs: {missing}')
depth=0;quote=None;comment=False;i=0
while i<len(css):
    pair=css[i:i+2]
    if comment:
        if pair=='*/': comment=False;i+=2;continue
        i+=1;continue
    if not quote and pair=='/*': comment=True;i+=2;continue
    ch=css[i]
    if quote:
        if ch=='\\': i+=2;continue
        if ch==quote: quote=None
    else:
        if ch in "'\"": quote=ch
        elif ch=='{': depth+=1
        elif ch=='}':
            depth-=1
            if depth<0: fail('Extra closing brace in app.css')
    i+=1
if comment or quote or depth: fail('Unclosed construct in app.css')
og_name='og-image-v2.png'
og=(root/og_name).read_bytes()
if og[:8]!=b'\x89PNG\r\n\x1a\n' or og[12:16]!=b'IHDR': fail(f'{og_name} is not valid PNG')
w,h=struct.unpack('>II',og[16:24])
mw=re.search(r'<meta property="og:image:width" content="(\d+)">',index);mh=re.search(r'<meta property="og:image:height" content="(\d+)">',index)
if not mw or not mh or (w,h)!=(int(mw.group(1)),int(mh.group(1))): fail('OG image dimensions mismatch')
if (w,h)!=(1200,630): fail(f'OG image must use the standard 1200x630 canvas, got {w}x{h}')
og_url=f'https://kinorates.ru/{og_name}'
for required in (
    '<meta property="og:title" content="Ставки для кино, сериалов и рекламы">',
    '<meta property="og:description" content="449 ставок с первоисточниками, фильтрами по формату и рабочей сметой.">',
    f'<meta property="og:image" content="{og_url}">',
    '<meta property="og:image:alt" content="KinoRates — справочник ставок и рабочая смета">',
    f'<meta name="twitter:image" content="{og_url}">',
):
    if required not in index: fail(f'Missing refreshed social preview metadata: {required}')
assets={'app.css':r'<link rel="stylesheet" href="app\.css\?v=([^"]+)">','production-type-filter.js':r'<script src="production-type-filter\.js\?v=([^"]+)"></script>','site-updates-data.js':r'<script src="site-updates-data\.js\?v=([^"]+)"></script>','updates.js':r'<script src="updates\.js\?v=([^"]+)"></script>','check-log.js':r'<script src="check-log\.js\?v=([^"]+)"></script>','rates-data.js':r'<script src="rates-data\.js\?v=([^"]+)"></script>','sources-data.js':r'<script src="sources-data\.js\?v=([^"]+)"></script>','market-data.js':r'<script src="market-data\.js\?v=([^"]+)"></script>','app.js':r'<script src="app\.js\?v=([^"]+)"></script>'}
versions={};positions={}
for name,pattern in assets.items():
    m=re.search(pattern,index)
    if not m: fail(f'Missing versioned asset {name}')
    versions[name]=m.group(1);positions[name]=m.start()
if len(set(versions.values()))!=1: fail(f'Asset versions differ: {versions}')
if not positions['production-type-filter.js']<positions['site-updates-data.js']<positions['updates.js']<positions['check-log.js']<positions['rates-data.js']<positions['sources-data.js']<positions['market-data.js']<positions['app.js']: fail('Script load order is invalid')
if '<style>' in index: fail('Inline CSS unexpectedly returned to index.html')
for token in ('FilmRate','FILMRATE_CHECKS','filmrate.ru'):
    for path in ('app.js','index.html','rates-data.js','sources-data.js','market-data.js'):
        if token in (root/path).read_text(encoding='utf-8'): fail(f'Legacy token {token} found in {path}')
for required in ('<meta name="robots" content="index, follow, max-image-preview:large">','<link rel="canonical" href="https://kinorates.ru/">','id="cookieBanner"','id="privacyDialog"'):
    if required not in index: fail(f'Missing production metadata or privacy control: {required}')
for required in ('METRIKA_ID = 111489870','kinorates_analytics_consent','location.protocol === "file:"'):
    if required not in app: fail(f'Missing analytics safeguard: {required}')
if 'class="avatar">АН' in app: fail('Authorization avatar is present without authorization')
if '<lastmod>2026-08-20</lastmod>' not in (root/'sitemap.xml').read_text(encoding='utf-8'): fail('sitemap lastmod was not refreshed')
main_font_url='family=Golos+Text:wght@400;500;600'
if main_font_url not in index: fail('Main page does not load Golos Text 400/500/600')
if 'font-family:"Golos Text"' not in css: fail('app.css does not use Golos Text')
if '"Golos Text"' not in navigation_css: fail('navigation.css does not use Golos Text')
if "--body:'Golos Text'" not in seo_css: fail('seo-pages.css does not use Golos Text')
seo_font_url='family=Golos+Text:wght@400;500;600;700'
seo_pages=(
    'stavki-kinotsekhov/index.html',
    'smeta-filma/index.html',
    'operatorskiy-tsekh/index.html',
    'rezhisserskiy-tsekh/index.html',
    'hudozhestvennyy-tsekh/index.html',
)
for path in seo_pages:
    page=(root/path).read_text(encoding='utf-8')
    if seo_font_url not in page: fail(f'{path} does not load Golos Text 400/500/600/700')
    if f'<meta property="og:image" content="{og_url}">' not in page: fail(f'{path} still uses the stale social preview image')
font_files={
    'index.html':index,
    'app.css':css,
    'navigation.css':navigation_css,
    'seo-pages.css':seo_css,
    **{path:(root/path).read_text(encoding='utf-8') for path in seo_pages},
}
for path,content in font_files.items():
    if 'family=Inter' in content or 'font-family:Inter' in content or "--body:'Inter'" in content:
        fail(f'Legacy Inter font found in {path}')
print(f'Static validation OK: {len(dom_refs)} DOM refs, OG {w}x{h}, asset version {next(iter(versions.values()))}')
