#!/usr/bin/env python3
import re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
html=(root/'preview-v4/index.html').read_text(encoding='utf-8')
css=(root/'preview-v4/app.css').read_text(encoding='utf-8')
js=(root/'preview-v4/app.js').read_text(encoding='utf-8')
template=(root/'preview-v4/budget-template.js').read_text(encoding='utf-8')
def fail(msg): raise SystemExit(msg)
if 'name="robots" content="noindex,nofollow,noarchive"' not in html: fail('preview-v4 must be noindex/nofollow')
if 'Disallow: /preview-v4/' not in (root/'robots.txt').read_text(): fail('preview-v4 missing from robots.txt')
for token in ('mc.yandex','ym(','metrika','googletag','analytics.js'):
    if token.lower() in (html+js).lower(): fail(f'Analytics token found: {token}')
for asset in ('app.css','budget-template.js','app.js'):
    if not re.search(rf'(?:href|src)="{re.escape(asset)}\?v=[^"]+"',html): fail(f'Missing versioned {asset}')
for route in ('home','projects','rates','knowledge','resources','about'):
    if f'data-route="{route}"' not in html: fail(f'Missing route {route}')
for text in ('Обратная связь','О проекте','Портал продюсера'):
    if text not in html: fail(f'Missing product surface: {text}')
depth=0
for ch in re.sub(r'/\*.*?\*/','',css,flags=re.S):
    depth += 1 if ch=='{' else -1 if ch=='}' else 0
    if depth<0: fail('Extra CSS closing brace')
if depth: fail('Unclosed CSS block')
if len(js)<15000: fail('preview-v4 app is unexpectedly small')
for label in ('Сценарный девелопмент','Подготовка и съёмка','Постпродакшн','Общестудийные расходы','Непредвиденные расходы','Маркетинг и реклама'):
    if label not in template: fail(f'Missing budget stage: {label}')
if 'Контрагент' not in js or 'Оплачено' not in js or 'В плане' not in js:
    fail('Budget control fields are incomplete')
print('Preview v4 validation OK: portal, production budget, noindex and no analytics verified')
