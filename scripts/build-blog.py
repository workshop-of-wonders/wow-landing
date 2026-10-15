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


def index(posts):
    url = SITE + 'blog/'
    title = 'Blog de Marketing Digital y Diseño Web | WOW'
    desc = 'Guías prácticas sobre marketing digital, SEO, pauta, diseño web y e-commerce para clínicas, pymes y marcas en Colombia, escritas por el equipo de WOW.'
    ld = [{'@context': 'https://schema.org', '@type': 'Blog', 'name': 'Blog de Workshop of Wonders', 'url': url, 'inLanguage': 'es-CO',
           'publisher': {'@type': 'Organization', 'name': 'Workshop of Wonders', 'url': SITE}}]
    chips = '<li><button type="button" class="bl-chip is-on" data-f="">Todos</button></li>' + ''.join(
        f'<li><button type="button" class="bl-chip" data-f="{c}">{c}</button></li>' for c in CATS)
    feat = card(posts[0], True)
    grid = ''.join(card(p) for p in posts[1:])
    body = f'''<main id="top">
  <section class="bl-hero">
    <p class="eyebrow">BLOG WOW</p>
    <h1>Ideas para que tu marca <em>se encuentre y convierta</em></h1>
    <p>Guías prácticas de marketing digital, SEO, pauta, diseño web y e-commerce, pensadas para clínicas, pymes y marcas en Colombia.</p>
  </section>
  <section class="bl-wrap">
    <ul class="bl-chips" aria-label="Categorías">{chips}</ul>
    {feat}    <div class="bl-grid" id="blGrid">
      {grid}    </div>
    <div class="bl-cta">
      <p>¿Quieres aplicar esto en <em>tu marca</em>?</p>
      <a href="#contacto" class="btn btn-primary" data-open-form>Hablemos de tu proyecto</a>
    </div>
  </section>
</main>
<script>
(function () {{
  var chips = document.querySelectorAll('.bl-chip'), cards = document.querySelectorAll('.bl-card, .bl-featured');
  chips.forEach(function (c) {{ c.addEventListener('click', function () {{
    chips.forEach(function (x) {{ x.classList.toggle('is-on', x === c); }});
    var f = c.getAttribute('data-f');
    cards.forEach(function (k) {{ k.hidden = !!f && k.getAttribute('data-cat') !== f; }});
  }}); }});
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
