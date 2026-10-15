#!/usr/bin/env python3
"""Genera el blog: /blog/index.html y un artículo por post en /blog/<slug>.html.
Reutiliza nav, cierre y scripts de servicios/diseno-web.html (ambas carpetas están a un nivel de la raíz).

Uso: python3 scripts/build-blog.py   (desde la raíz del repo; luego `npm run minify` si cambió el CSS)

Para agregar un artículo: añade un dict a POSTS (el más reciente primero). Reglas: sin cifras, precios ni
resultados inventados; los casos citados son los reales de js/cases.js; WOW es 100% remoto.
"""
import html
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://www.efectowow.co/'
SRC = open(os.path.join(ROOT, 'servicios', 'diseno-web.html'), encoding='utf-8').read()
NAV = SRC[SRC.index('<link rel="icon"'):SRC.index('<main id="top">')]
TAIL = SRC[SRC.index('</main>'):]
GTAG = SRC[SRC.index('  <!-- Google tag'):SRC.index('<meta charset')]
DATE = '2026-10-15'
DATE_ES = '15 oct 2026'
CATS = ['Marketing médico', 'Redes y pauta', 'Diseño web y e-commerce', 'Agencias y pymes']


def esc(s):
    return html.escape(s, quote=True)


def strip(s):
    return re.sub(r'<[^>]+>', '', s)


def head(title, desc, url, ld, extra=''):
    assert len(title) <= 60, (title, len(title))
    assert len(desc) <= 165, (desc, len(desc))
    return f'''{GTAG}<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{url}">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#380757">
<meta property="og:type" content="{'article' if extra else 'website'}">
<meta property="og:url" content="{url}">
<meta property="og:site_name" content="Workshop of Wonders">
<meta property="og:locale" content="es_CO">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:image" content="{SITE}design-system/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(title)}">
<meta name="twitter:description" content="{esc(desc)}">
<meta name="twitter:image" content="{SITE}design-system/og-image.jpg">
{''.join(f'<script type="application/ld+json">{json.dumps(o, ensure_ascii=False)}</script>' + chr(10) for o in ld)}
'''


def card(p, featured=False):
    cls = 'bl-featured' if featured else 'bl-card'
    h = 'h2' if featured else 'h3'
    return f'''<a class="{cls}" href="{p['slug']}.html" data-cat="{p['cat']}">
        <div class="bl-card-top" data-cat="{p['cat']}"><span class="bl-cat">{p['cat']}</span></div>
        <div class="bl-card-body"><{h}>{p['h1']}</{h}><p>{p['excerpt']}</p><span class="bl-meta">{DATE_ES} · {p['read']} min de lectura</span></div>
      </a>
'''


def bx_card(p):
    return f'''<a class="bx-card" href="{p['slug']}.html" data-cat="{p['cat']}">
          <div class="bx-cover" data-cat="{p['cat']}"><span class="bx-read">{p['read']} MIN</span><span class="bx-ico" aria-hidden="true"></span></div>
          <div class="bx-body"><span class="bx-date">{DATE_ES.upper()} · {p['cat'].upper()}</span><h3>{p['h1']}</h3><p>{p['excerpt']}</p></div>
        </a>
        '''


TOPICS = ['Diseño web', 'SEO', 'Pauta digital', 'E-commerce', 'Marketing médico', 'SEO local', 'Analítica', 'GEO', 'Pymes', 'Medellín']
SUGGEST = ['SEO', 'pauta', 'médicos', 'Medellín', 'WooCommerce']


def index(posts):
    url = SITE + 'blog/'
    title = 'Blog de Marketing Digital y Diseño Web | WOW'
    desc = 'Guías prácticas sobre marketing digital, SEO, pauta, diseño web y e-commerce para clínicas, pymes y marcas en Colombia, escritas por el equipo de WOW.'
    ld = [{'@context': 'https://schema.org', '@type': 'Blog', 'name': 'Blog de Workshop of Wonders', 'url': url, 'inLanguage': 'es-CO',
           'publisher': {'@type': 'Organization', 'name': 'Workshop of Wonders', 'url': SITE}}]
    n = len(posts)
    avg = round(sum(p['read'] for p in posts) / n)
    counts = {c: sum(1 for p in posts if p['cat'] == c) for c in CATS}
    pills = f'<button type="button" class="bx-pill is-on" data-f="">Todos <b>{n}</b></button>' + ''.join(
        f'<button type="button" class="bx-pill" data-f="{c}">{c} <b>{counts[c]}</b></button>' for c in CATS if counts[c])
    sugg = ''.join(f'<button type="button" class="bx-sug" data-q="{s}">{s}</button>' for s in SUGGEST)
    ticker = ''.join(f'<span>{t}</span><i aria-hidden="true">✦</i>' for t in TOPICS)
    feat = posts[0]
    essentials = ''.join(
        f'<a class="bx-ess" href="{p["slug"]}.html"><span class="bx-ess-n">0{i + 1}</span><span class="bx-ess-t">{p["h1"]}</span><span class="bx-ess-go" aria-hidden="true">→</span></a>\n      '
        for i, p in enumerate(posts[:3]))
    body = f'''<main id="top" class="bx-page">
  <section class="bx-hero">
    <p class="bx-kicker">BLOG · WOW</p>
    <h1>Lo que funciona en digital, <em>sin rodeos.</em></h1>
    <p class="bx-sub">Guías prácticas de marketing digital, SEO, pauta, diseño web y e-commerce para clínicas, pymes y marcas en Colombia. Lo que aprendemos en el taller, sin guardarnos nada.</p>
    <div class="bx-hero-row">
      <div class="bx-hero-search">
        <form class="bx-search" role="search" data-hero-search>
          <input type="search" placeholder="Busca un tema, una ciudad o una herramienta…" aria-label="Buscar en el blog" autocomplete="off">
          <button type="submit" class="bx-go">Buscar</button>
        </form>
        <p class="bx-try">Prueba con: {sugg}</p>
      </div>
      <ul class="bx-stats">
        <li><b>{n}</b><span>Artículos</span></li>
        <li><b>{len([c for c in CATS if counts[c]])}</b><span>Temas</span></li>
        <li><b>{avg}&prime;</b><span>Lectura promedio</span></li>
      </ul>
    </div>
  </section>
  <div class="bx-ticker" aria-hidden="true"><div class="bx-ticker-track">{ticker}{ticker}</div></div>

  <section class="bx-sec" id="para-empezar">
    <header class="bx-head"><h2>Para empezar</h2><span class="bx-tag">SELECCIÓN WOW</span></header>
    <p class="bx-lead">Si solo vas a leer una guía, que sea esta.</p>
    <a class="bx-feature" href="{feat['slug']}.html" data-cat="{feat['cat']}">
      <span class="bx-feature-ico" aria-hidden="true"></span>
      <span class="bx-feature-cat">{feat['cat'].upper()}</span>
      <h3>{feat['h1']}</h3>
      <p>{feat['excerpt']}</p>
      <span class="bx-feature-meta">{DATE_ES.upper()} · {feat['read']} MIN DE LECTURA <b>LEER →</b></span>
    </a>
  </section>

  <section class="bx-sec" id="articulos">
    <header class="bx-head"><h2>Todos los artículos</h2><span class="bx-count" id="bxCount">{n}</span></header>
    <p class="bx-lead">Filtra por tema o busca lo que necesitas.</p>
    <div class="bx-filters">
      <div class="bx-pills" role="group" aria-label="Filtrar por tema">{pills}</div>
      <form class="bx-search bx-search--sm" role="search" onsubmit="return false"><input type="search" id="bxList" placeholder="Buscar en los artículos…" aria-label="Buscar en los artículos" autocomplete="off"></form>
    </div>
    <div class="bx-grid" id="bxGrid">
        {''.join(bx_card(p) for p in posts)}</div>
    <p class="bx-empty" id="bxEmpty" hidden>No encontramos artículos con esa búsqueda. <button type="button" class="bx-link" id="bxReset">Ver todos</button></p>
    <nav class="bx-pager" aria-label="Paginación"><span class="bx-pg" id="bxPg">PÁG 1 DE 1</span><span class="bx-nums" id="bxNums"></span><button type="button" class="bx-next" id="bxNext">SIGUIENTE →</button></nav>
  </section>

  <section class="bx-sec" id="esenciales">
    <header class="bx-head"><h2>Guías esenciales</h2><span class="bx-tag">EMPIEZA POR AQUÍ</span></header>
    <p class="bx-lead">Tres lecturas para ordenar tu marketing digital antes de gastar un peso más.</p>
    <div class="bx-ess-list">
      {essentials}</div>
  </section>

  <section class="bx-cta">
    <h2>¿Prefieres que lo hagamos <em>juntos?</em></h2>
    <p>Cuéntanos tu proyecto y te respondemos en máximo 1 día hábil.</p>
    <a href="#contacto" class="btn btn-primary" data-open-form>Hablemos de tu proyecto</a>
  </section>
  <div class="bx-wordmark" aria-hidden="true"><div class="bx-wordmark-track"><span>WORKSHOP OF WONDERS</span><i>✦</i><span>WORKSHOP OF WONDERS</span><i>✦</i><span>WORKSHOP OF WONDERS</span><i>✦</i><span>WORKSHOP OF WONDERS</span><i>✦</i></div></div>
</main>
<script>
(function () {{
  var PAGE = 9, state = {{ f: '', q: '', p: 1 }};
  var cards = [].slice.call(document.querySelectorAll('#bxGrid .bx-card'));
  var pills = [].slice.call(document.querySelectorAll('.bx-pill'));
  var inputs = [].slice.call(document.querySelectorAll('.bx-search input'));
  var count = document.getElementById('bxCount'), empty = document.getElementById('bxEmpty');
  var pg = document.getElementById('bxPg'), nums = document.getElementById('bxNums'), next = document.getElementById('bxNext');
  function norm(s) {{ return (s || '').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, ''); }}
  cards.forEach(function (c) {{ c._t = norm(c.textContent); }});
  function render() {{
    var q = norm(state.q).trim();
    var hits = cards.filter(function (c) {{ return (!state.f || c.dataset.cat === state.f) && (!q || c._t.indexOf(q) > -1); }});
    var pages = Math.max(1, Math.ceil(hits.length / PAGE));
    if (state.p > pages) state.p = pages;
    cards.forEach(function (c) {{ c.hidden = true; }});
    hits.slice((state.p - 1) * PAGE, state.p * PAGE).forEach(function (c) {{ c.hidden = false; }});
    count.textContent = hits.length; empty.hidden = hits.length > 0;
    pg.textContent = 'PÁG ' + state.p + ' DE ' + pages;
    nums.innerHTML = '';
    for (var i = 1; i <= pages; i++) {{
      var b = document.createElement('button'); b.type = 'button'; b.textContent = i; b.className = 'bx-num' + (i === state.p ? ' is-on' : '');
      b.onclick = (function (n) {{ return function () {{ state.p = n; render(); document.getElementById('articulos').scrollIntoView({{ behavior: 'smooth' }}); }}; }})(i);
      nums.appendChild(b);
    }}
    next.disabled = state.p >= pages;
    pills.forEach(function (x) {{ x.classList.toggle('is-on', x.dataset.f === state.f); }});
  }}
  pills.forEach(function (x) {{ x.addEventListener('click', function () {{ state.f = x.dataset.f; state.p = 1; render(); }}); }});
  inputs.forEach(function (i) {{ i.addEventListener('input', function () {{ state.q = i.value; state.p = 1; inputs.forEach(function (o) {{ if (o !== i) o.value = i.value; }}); render(); }}); }});
  next.addEventListener('click', function () {{ state.p++; render(); document.getElementById('articulos').scrollIntoView({{ behavior: 'smooth' }}); }});
  document.getElementById('bxReset').addEventListener('click', function () {{ state = {{ f: '', q: '', p: 1 }}; inputs.forEach(function (i) {{ i.value = ''; }}); render(); }});
  document.querySelector('[data-hero-search]').addEventListener('submit', function (e) {{ e.preventDefault(); document.getElementById('articulos').scrollIntoView({{ behavior: 'smooth' }}); }});
  [].forEach.call(document.querySelectorAll('.bx-sug'), function (s) {{ s.addEventListener('click', function () {{
    inputs.forEach(function (i) {{ i.value = s.dataset.q; }}); state.q = s.dataset.q; state.p = 1; render(); document.getElementById('articulos').scrollIntoView({{ behavior: 'smooth' }}); }}); }});
  render();
}})();
</script>
'''
    tail = TAIL.replace('</main>\n', '', 1) if TAIL.startswith('</main>') else TAIL
    tail = tail.replace('Hablemos de tu <em>próximo proyecto</em> web', 'Hablemos de tu <em>próximo proyecto</em>')
    os.makedirs(os.path.join(ROOT, 'blog'), exist_ok=True)
    open(os.path.join(ROOT, 'blog', 'index.html'), 'w', encoding='utf-8').write(
        '<!DOCTYPE html>\n<html lang="es">\n<head>\n' + head(title, desc, url, ld) + NAV + body + tail)


def article(p, posts):
    url = SITE + 'blog/' + p['slug'] + '.html'
    secs = p['sections']
    toc = ''.join(f'<li><a href="#s{i + 1}">{s[0]}</a></li>' for i, s in enumerate(secs)) + '<li><a href="#faq">Preguntas frecuentes</a></li>'
    inner = ''
    for i, (h, blocks) in enumerate(secs):
        inner += f'    <h2 id="s{i + 1}">{h}</h2>\n' + ''.join(f'    {b}\n' for b in blocks)
    faq = ''.join(f'    <h3>{q}</h3>\n    <p>{a}</p>\n' for q, a in p['faqs'])
    related = [x for x in posts if x['slug'] != p['slug']]
    related.sort(key=lambda x: x['cat'] != p['cat'])
    rel = ''.join(card(x) for x in related[:3])
    ld = [
        {'@context': 'https://schema.org', '@type': 'BlogPosting', 'headline': p['h1'], 'description': p['desc'], 'inLanguage': 'es-CO',
         'datePublished': DATE, 'dateModified': DATE, 'mainEntityOfPage': url,
         'image': SITE + 'design-system/og-image.jpg',
         'author': {'@type': 'Organization', 'name': 'Workshop of Wonders', 'url': SITE},
         'publisher': {'@type': 'Organization', 'name': 'Workshop of Wonders', 'url': SITE,
                       'logo': {'@type': 'ImageObject', 'url': SITE + 'design-system/logo/wow-logo-white.webp'}}},
        {'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [
            {'@type': 'Question', 'name': strip(q), 'acceptedAnswer': {'@type': 'Answer', 'text': strip(a)}} for q, a in p['faqs']]},
        {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Blog', 'item': SITE + 'blog/'},
            {'@type': 'ListItem', 'position': 2, 'name': p['h1'], 'item': url}]},
    ]
    body = f'''<main id="top">
  <header class="bl-post-head">
    <div class="bl-inner">
      <nav class="bl-crumbs" aria-label="Ruta"><a href="index.html">Blog</a><span aria-hidden="true">›</span><span>{p['cat']}</span></nav>
      <span class="bl-cat">{p['cat']}</span>
      <h1>{p['h1']}</h1>
      <p class="bl-lead">{p['lead']}</p>
      <p class="bl-meta">Por el equipo de Workshop of Wonders · {DATE_ES} · {p['read']} min de lectura</p>
    </div>
  </header>
  <article class="bl-article">
    <nav class="bl-toc" aria-label="Contenido"><p>En este artículo</p><ol>{toc}</ol></nav>
{inner}    <h2 id="faq">Preguntas frecuentes</h2>
{faq}    <div class="bl-cta">
      <p>{p['cta']}</p>
      <a href="#contacto" class="btn btn-primary" data-open-form>Hablemos de tu proyecto</a>
    </div>
  </article>
  <section class="bl-related">
    <h2>Sigue leyendo</h2>
    <div class="bl-grid">
      {rel}    </div>
  </section>
</main>
'''
    tail = TAIL.replace('</main>\n', '', 1) if TAIL.startswith('</main>') else TAIL
    tail = tail.replace('Hablemos de tu <em>próximo proyecto</em> web', 'Hablemos de tu <em>próximo proyecto</em>')
    open(os.path.join(ROOT, 'blog', p['slug'] + '.html'), 'w', encoding='utf-8').write(
        '<!DOCTYPE html>\n<html lang="es">\n<head>\n' + head(p['title'], p['desc'], url, ld, extra='article') + NAV + body + tail)
    print('ok', p['slug'], len(p['title']), len(p['desc']))


L = '../servicios/'
CTA_DEFAULT = '¿Quieres aplicar esto en <em>tu marca</em>? Cuéntanos tu proyecto.'

from blog_posts import POSTS  # noqa: E402  (contenido de los artículos, en scripts/blog_posts.py)

if __name__ == '__main__':
    index(POSTS)
    for post in POSTS:
        article(post, POSTS)
