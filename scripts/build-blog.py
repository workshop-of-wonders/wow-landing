#!/usr/bin/env python3
"""Genera el blog: /blog/index.html y un artículo por post en /blog/<slug>.html (archivo físico).
Las URLs públicas de los artículos son /<slug> (sin /blog ni .html): `sync_vercel()` escribe en vercel.json el rewrite
/<slug> -> /blog/<slug>.html y el 301 de /blog/<slug>[.html] -> /<slug>. Los enlaces internos usan siempre /<slug>.
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


def head(title, desc, url, ld, extra='', image=None):
    image = image or SITE + 'design-system/og-image.jpg'
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
<meta property="og:image" content="{image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(title)}">
<meta name="twitter:description" content="{esc(desc)}">
<meta name="twitter:image" content="{image}">
{''.join(f'<script type="application/ld+json">{json.dumps(o, ensure_ascii=False)}</script>' + chr(10) for o in ld)}
'''


def card(p, featured=False):
    cls = 'bl-featured' if featured else 'bl-card'
    h = 'h2' if featured else 'h3'
    return f'''<a class="{cls}" href="/{p['slug']}" data-cat="{p['cat']}">
        <div class="bl-card-top" data-cat="{p['cat']}"><span class="bl-cat">{p['cat']}</span></div>
        <div class="bl-card-body"><{h}>{p['h1']}</{h}><p>{p['excerpt']}</p><span class="bl-meta">{DATE_ES} · {p['read']} min de lectura</span></div>
      </a>
'''


def bx_card(p):
    return f'''<a class="bx-card bx-rv" href="/{p['slug']}" data-cat="{p['cat']}">
          <div class="bx-cover" data-cat="{p['cat']}"><span class="bx-read">{p['read']} min</span><span class="bx-ico" aria-hidden="true"></span></div>
          <div class="bx-body"><span class="bx-date">{DATE_ES} · {p['cat']}</span><h3>{p['h1']}</h3><p>{p['excerpt']}</p></div>
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
    body = f'''<main id="top" class="bx-page">
  <section class="bx-hero">
    <div class="bx-hero-in">
      <div class="bx-hero-copy">
        <p class="bx-pill-hero"><b>Blog</b><span>Guías de WOW</span></p>
        <h1>Lo que funciona en digital, <em>sin rodeos.</em></h1>
        <p class="bx-sub">Guías de marketing digital, SEO y diseño web para clínicas, pymes y marcas en Colombia.</p>
        <form class="bx-search" role="search" data-hero-search>
          <input type="search" placeholder="Busca un tema, una ciudad o una herramienta…" aria-label="Buscar en el blog" autocomplete="off">
          <button type="submit" class="bx-go">Buscar</button>
        </form>
      </div>
      <img class="bx-hero-wd" src="../design-system/wonders/Wonder_Rosa_Leyendo_Libro.png" alt="" width="1200" height="1139">
    </div>
  </section>
  <section class="bx-sec" id="articulos">
    <header class="bx-head bx-rv"><h2>Todos los artículos</h2><span class="bx-count" id="bxCount">{n}</span></header>
    <p class="bx-lead">Filtra por tema o busca lo que necesitas.</p>
    <div class="bx-filters">
      <div class="bx-pills" role="group" aria-label="Filtrar por tema">{pills}</div>
      <form class="bx-search bx-search--sm" role="search" onsubmit="return false"><input type="search" id="bxList" placeholder="Buscar en los artículos…" aria-label="Buscar en los artículos" autocomplete="off"></form>
    </div>
    <div class="bx-grid" id="bxGrid">
        {''.join(bx_card(p) for p in posts)}</div>
    <p class="bx-empty" id="bxEmpty" hidden>No encontramos artículos con esa búsqueda. <button type="button" class="bx-link" id="bxReset">Ver todos</button></p>
    <nav class="bx-pager" aria-label="Paginación"><span class="bx-pg" id="bxPg">Pág. 1 de 1</span><span class="bx-nums" id="bxNums"></span><button type="button" class="bx-next" id="bxNext">Siguiente →</button></nav>
  </section>

  <div class="bx-wordmark" aria-hidden="true"><div class="bx-wordmark-track"><span>WORKSHOP OF WONDERS</span><i class="wsp" aria-hidden="true"></i><span>WORKSHOP OF WONDERS</span><i class="wsp" aria-hidden="true"></i><span>WORKSHOP OF WONDERS</span><i class="wsp" aria-hidden="true"></i><span>WORKSHOP OF WONDERS</span><i class="wsp" aria-hidden="true"></i></div></div>
</main>
<script src="../js/blog.js" defer></script>
'''
    tail = TAIL.replace('</main>\n', '', 1) if TAIL.startswith('</main>') else TAIL
    tail = tail.replace('Hablemos de tu <em>próximo proyecto</em> web', 'Hablemos de tu <em>próximo proyecto</em>')
    os.makedirs(os.path.join(ROOT, 'blog'), exist_ok=True)
    open(os.path.join(ROOT, 'blog', 'index.html'), 'w', encoding='utf-8').write(
        '<!DOCTYPE html>\n<html lang="es">\n<head>\n' + head(title, desc, url, ld) + NAV + body + tail)


def article(p, posts):
    url = SITE + p['slug']
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
         'image': SITE + 'design-system/' + p['img'],
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
      <div class="bl-post-copy">
        <nav class="bl-crumbs" aria-label="Ruta"><a href="/blog/">Blog</a><span aria-hidden="true">›</span><span>{p['cat']}</span></nav>
        <span class="bl-cat">{p['cat']}</span>
        <h1>{p['h1']}</h1>
        <p class="bl-lead">{p['lead']}</p>
        <p class="bl-meta">Por el equipo de Workshop of Wonders · {DATE_ES} · {p['read']} min de lectura</p>
      </div>
      <figure class="bl-post-photo"><img src="../design-system/{p['img']}" alt="{p['alt']}" width="{p['iw']}" height="{p['ih']}" fetchpriority="high"></figure>
    </div>
  </header>
  <article class="bl-article">
    <nav class="bl-toc" aria-label="Contenido"><p>En este artículo</p><ol>{toc}</ol></nav>
{inner}    <h2 id="faq">Preguntas frecuentes</h2>
{faq}    <div class="bl-cta">
      <p>{p['cta']}</p>
      <a href="#contacto" class="btn btn-primary" data-open-form>Hablemos de tu proyecto</a>
    </div>
    <img class="wd wd--end" src="../design-system/wonders/Wonder_Rosa_Leyendo_Libro.png" alt="" width="1200" height="1139" loading="lazy">
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
        '<!DOCTYPE html>\n<html lang="es">\n<head>\n' + head(p['title'], p['desc'], url, ld, extra='article', image=SITE + 'design-system/' + p['img']) + NAV + body + tail)
    print('ok', p['slug'], len(p['title']), len(p['desc']))


L = '../servicios/'
CTA_DEFAULT = '¿Quieres aplicar esto en <em>tu marca</em>? Cuéntanos tu proyecto.'

from blog_posts import POSTS  # noqa: E402  (contenido de los artículos, en scripts/blog_posts.py)

def sync_vercel(posts):
    """Rewrites y redirecciones de los artículos en vercel.json (reemplaza las que ya apuntaban al blog)."""
    path = os.path.join(ROOT, 'vercel.json')
    cfg = json.load(open(path, encoding='utf-8'))
    for p in posts:
        for ext in ('', '.html'):
            assert not os.path.exists(os.path.join(ROOT, p['slug'] + ext)), 'el slug choca con una página de la raíz: ' + p['slug']
    cfg['rewrites'] = [r for r in cfg.get('rewrites', []) if not r['destination'].startswith('/blog/')] + [
        {'source': '/' + p['slug'], 'destination': '/blog/' + p['slug'] + '.html'} for p in posts]
    old = [r for r in cfg.get('redirects', []) if not r['source'].startswith('/blog/')]
    cfg['redirects'] = old + [
        {'source': '/blog/' + p['slug'] + ext, 'destination': '/' + p['slug'], 'permanent': True} for p in posts for ext in ('.html', '')]
    with open(path, 'w', encoding='utf-8') as f:
        f.write(json.dumps(cfg, ensure_ascii=False, indent=2) + chr(10))


if __name__ == '__main__':
    index(POSTS)
    for post in POSTS:
        article(post, POSTS)
    sync_vercel(POSTS)
