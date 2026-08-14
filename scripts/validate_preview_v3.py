#!/usr/bin/env python3
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
preview = root / 'preview-v3'
html = (preview / 'index.html').read_text(encoding='utf-8')
css = (preview / 'app.css').read_text(encoding='utf-8')
js = (preview / 'app.js').read_text(encoding='utf-8')

def fail(message):
    raise SystemExit(message)

if 'name="robots" content="noindex,nofollow,noarchive"' not in html:
    fail('preview-v3 must be noindex/nofollow')
if 'Disallow: /preview-v3/' not in (root / 'robots.txt').read_text(encoding='utf-8'):
    fail('preview-v3 must be blocked in robots.txt')
for token in ('mc.yandex', 'ym(', 'metrika', 'googletag', 'analytics'):
    if token.lower() in html.lower() or token.lower() in js.lower():
        fail(f'Analytics token found in preview-v3: {token}')
for asset in ('app.css', 'app.js'):
    if not re.search(rf'(?:href|src)="{re.escape(asset)}\?v=[^"]+"', html):
        fail(f'Missing versioned preview-v3 asset: {asset}')
for route in ('overview', 'rates', 'professions', 'departments', 'sources', 'budget'):
    if f'data-route="{route}"' not in html:
        fail(f'Missing product route: {route}')
depth = 0
for char in re.sub(r'/\*.*?\*/', '', css, flags=re.S):
    if char == '{': depth += 1
    elif char == '}': depth -= 1
    if depth < 0: fail('Extra closing brace in preview-v3/app.css')
if depth:
    fail('Unclosed block in preview-v3/app.css')
if len(js) < 10000:
    fail('preview-v3 application bundle is unexpectedly small')
print('Preview v3 validation OK: noindex, no analytics, routes and assets verified')
