from pathlib import Path

index = Path('index.html')
html = index.read_text(encoding='utf-8')

old_meta = '<div class="title-block"><div class="title-meta"><small class="beta-mark" title="Сервис развивается, расчёты и данные продолжают проверяться">Beta version</small><button class="updates-action" id="updatesOpen">Обновления <span class="updates-count" id="updatesCount">4</span></button></div><h1>'
new_meta = '<div class="title-block"><div class="title-meta"><small class="beta-mark" title="Сервис развивается, расчёты и данные продолжают проверяться">Beta version</small></div><h1>'
if old_meta not in html:
    raise SystemExit('title updates button anchor not found')
html = html.replace(old_meta, new_meta, 1)

nav_anchor = '  <nav class="header-resources" aria-label="Полезные материалы KinoRates">'
if nav_anchor not in html:
    raise SystemExit('header resources anchor not found')
inline = '''  <section class="updates-inline" aria-labelledby="updatesInlineTitle">
    <div class="updates-inline-head"><span id="updatesInlineTitle">Последние обновления</span><small><b id="updatesCount">4</b> записи</small></div>
    <div class="updates-list" id="updatesList"></div>
  </section>
  <button id="updatesOpen" type="button" hidden aria-hidden="true"></button>
'''
html = html.replace(nav_anchor, inline + nav_anchor, 1)

old_dialog = '''<dialog class="feedback-dialog updates-dialog" id="updatesDialog">
  <div class="feedback-inner">
    <div class="feedback-top"><div><h2>Обновления KinoRates</h2><p>Что изменилось в базе ставок и в самом сервисе.</p></div><button class="dialog-x" id="updatesClose" aria-label="Закрыть">×</button></div>
    <div class="updates-list" id="updatesList"></div>
  </div>
</dialog>'''
new_dialog = '<dialog id="updatesDialog" hidden aria-hidden="true"><button id="updatesClose" type="button" hidden>Закрыть</button></dialog>'
if old_dialog not in html:
    raise SystemExit('updates dialog anchor not found')
html = html.replace(old_dialog, new_dialog, 1)

html = html.replace('20260813-1026', '20260813-1226')
index.write_text(html, encoding='utf-8')

css = Path('app.css')
styles = css.read_text(encoding='utf-8')
marker = '/* compact inline updates v8 */'
if marker not in styles:
    styles += r'''

/* compact inline updates v8 */
.updates-inline{grid-column:1;min-width:0;border:1px solid var(--rule);border-radius:9px;background:#fafbf9;overflow:hidden}
.updates-inline-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:7px 10px;border-bottom:1px solid var(--rule);background:#fff}
.updates-inline-head>span{font:700 8px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--ink-2)}
.updates-inline-head small{display:flex;align-items:baseline;gap:4px;color:var(--ink-3);font-size:8px}.updates-inline-head small b{color:var(--blue);font:700 9px var(--mono)}
.updates-inline .updates-list{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin:0;border:0;background:#fafbf9}
.updates-inline .update-item{display:block;min-width:0;padding:9px 11px 10px;border:0;border-right:1px solid var(--rule)}
.updates-inline .update-item:last-child{border-right:0}
.updates-inline .update-meta{display:flex;align-items:center;gap:7px;min-width:0;margin-bottom:5px}
.updates-inline .update-meta time{font:600 7.5px var(--mono);color:var(--ink-3);white-space:nowrap}
.updates-inline .update-type{margin:0;padding:0;border:0!important;background:transparent!important;color:var(--blue)!important;font:700 7px var(--mono);letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}
.updates-inline .update-content h3{display:-webkit-box;margin:0;color:var(--ink);font-size:10.5px;line-height:1.3;letter-spacing:-.01em;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.updates-inline .update-content p{display:-webkit-box;margin:4px 0 0;color:var(--ink-3);font-size:8.5px;line-height:1.4;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.updates-inline .update-content a{display:inline-block;margin-top:5px;color:var(--blue);font-size:8px;text-decoration:none}.updates-inline .update-content a:hover{text-decoration:underline}
.updates-inline .updates-empty{margin:0;padding:12px;color:var(--ink-3);font-size:9px}
@media(max-width:980px){.updates-inline .updates-list{display:grid;grid-template-columns:none;grid-auto-flow:column;grid-auto-columns:minmax(220px,42vw);overflow-x:auto;overscroll-behavior-inline:contain;scroll-snap-type:x proximity}.updates-inline .update-item{scroll-snap-align:start}.updates-inline .update-item:last-child{border-right:1px solid var(--rule)}}
@media(max-width:600px){.updates-inline-head{padding:7px 9px}.updates-inline .updates-list{grid-auto-columns:minmax(240px,82vw)}.updates-inline .update-item{padding:9px 10px}.updates-inline .update-content h3{font-size:10px}.updates-inline .update-content p{font-size:8.5px}}
'''
css.write_text(styles, encoding='utf-8')
print('compact inline updates patch applied')
