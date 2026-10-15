#!/usr/bin/env python3
"""Genera las páginas de posicionamiento (ciudades, marketing médico, guías de costos y pasarelas)
en /servicios/. Reutiliza nav, hero visual, carrusel de casos y cierre de servicios/diseno-web.html.

Uso: python3 scripts/build-seo-pages.py   (desde la raíz del repo)

Reglas de contenido: sin cifras, precios ni resultados inventados; WOW es 100% remoto (no se afirma
oficina en ninguna ciudad); los casos citados son los reales de js/cases.js.
"""
import html
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = 'https://www.efectowow.co/servicios/'
SRC = open(os.path.join(ROOT, 'servicios', 'diseno-web.html'), encoding='utf-8').read()

# ---- bloques reutilizados de diseno-web.html ----
NAV = SRC[SRC.index('<link rel="icon"'):SRC.index('<main id="top">')]
TAIL = SRC[SRC.index('</main>'):]
VISUAL = re.search(r'    <div class="sp-visual" aria-hidden="true">.*?\n    </div>\n', SRC, re.S).group(0)
CASES = {}
for m in re.finditer(r'        <div class="sp-cv-item" data-what=".*?</i>\n          </div>\n        </div>\n', SRC, re.S):
    CASES[re.search(r'data-project="([^"]+)"', m.group(0)).group(1)] = m.group(0)


def esc(s):
    return html.escape(s, quote=True)


def strip(s):
    return re.sub(r'<[^>]+>', '', s)


def faq_html(prefix, faqs):
    out = ''
    for i, (q, a) in enumerate(faqs):
        cid = f'{prefix}FaqA{i + 1}'
        out += f'''        <div class="fc-turn">
          <h3 class="fc-q-h"><button type="button" class="fc-q" aria-expanded="false" aria-controls="{cid}">{q}</button></h3>
          <div class="fc-a" id="{cid}" role="region" aria-label="Respuesta" hidden>
            <img class="fc-avatar" src="../design-system/logo/wow-mark-purple.svg" alt="" width="36" height="36">
            <div class="fc-typing" aria-hidden="true"><i></i><i></i><i></i></div>
            <p class="fc-bubble">{a}</p>
          </div>
        </div>
'''
    return out


def cards_html(cards):
    out = '<div class="sp-geo-grid">\n'
    for c in cards:
        href, h, p = c[0], c[1], c[2]
        if href:
            out += f'      <a class="sp-geo-card" href="{href}"><h3>{h}</h3><p>{p}</p><span class="sp-geo-go">Ver servicio →</span></a>\n'
        else:
            out += f'      <div class="sp-geo-card"><h3>{h}</h3><p>{p}</p></div>\n'
    return out + '    </div>'


def build(p):
    url = BASE + p['slug'] + '.html'
    title, desc = p['title'], p['desc']
    assert len(title) <= 60, (p['slug'], len(title))
    assert len(desc) <= 165, (p['slug'], len(desc))
    area = {'@type': 'City', 'name': p['city']} if p.get('city') else 'Colombia'
    service = {
        '@context': 'https://schema.org', '@type': 'Service', 'name': p['service_name'],
        'serviceType': p['service_type'],
        'provider': {'@type': 'ProfessionalService', 'name': 'Workshop of Wonders', 'url': 'https://www.efectowow.co/',
                     'address': {'@type': 'PostalAddress', 'addressCountry': 'CO'}},
        'areaServed': area, 'url': url, 'description': desc,
    }
    faq = {'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [
        {'@type': 'Question', 'name': strip(q), 'acceptedAnswer': {'@type': 'Answer', 'text': strip(a)}} for q, a in p['faqs']]}
    crumbs = {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': 1, 'name': 'Servicios', 'item': 'https://www.efectowow.co/servicios.html'},
        {'@type': 'ListItem', 'position': 2, 'name': p['crumb'], 'item': url}]}
    ld = ''.join(f'<script type="application/ld+json">\n{json.dumps(o, ensure_ascii=False, indent=2)}\n</script>\n' for o in (service, faq, crumbs))

    head = f'''<!DOCTYPE html>
<html lang="es">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-39Q1KYV3NV"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){{dataLayer.push(arguments);}}
    gtag('js', new Date());

    gtag('config', 'G-39Q1KYV3NV');
  </script>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{url}">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#380757">

<!-- Open Graph / Facebook, LinkedIn, WhatsApp -->
<meta property="og:type" content="website">
<meta property="og:url" content="{url}">
<meta property="og:site_name" content="Workshop of Wonders">
<meta property="og:locale" content="es_CO">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:image" content="https://www.efectowow.co/design-system/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Workshop of Wonders">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(title)}">
<meta name="twitter:description" content="{esc(desc)}">
<meta name="twitter:image" content="https://www.efectowow.co/design-system/og-image.jpg">

{ld}
'''
    visual = VISUAL
    for old, new in zip(re.findall(r'<span class="sp-float sp-float--[abc]">(.*?)</span>', VISUAL), p['floats']):
        visual = visual.replace(f'>{old}</span>', f'>{new}</span>', 1)

    hero = f'''<main id="top">
  <section class="sp-hero sp-hero--{p.get('hero', 'blue')}">
    <div class="sp-hero-copy">
      <nav class="sp-crumbs" aria-label="Ruta"><a href="../servicios.html">Servicios</a><span aria-hidden="true">›</span><span>{p['crumb']}</span></nav>
      <p class="sp-lab-pill"><a href="{p['lab_href']}">{p['lab']}</a><span>{p['pill']}</span></p>
      <h1>{p['h1']}</h1>
      <p class="sp-hero-sub">{p['sub']}</p>
      <div class="sp-hero-cta">
        <a href="#contacto" class="btn btn-primary" data-open-form>{p.get('cta', 'Hablemos de tu proyecto')}</a>
        <a href="#faq" class="sp-link">Preguntas frecuentes <span aria-hidden="true">↓</span></a>
      </div>
    </div>
{visual}  </section>
'''
    intro = f'''
  <section class="sp-sec sp-sec--white" id="que-es">
    <span class="outline-word outline-magenta" aria-hidden="true">{p['word']}</span>
    <div class="sp-intro">
      <div class="sp-callout">
        <p>{p['callout']}</p>
      </div>
      <div class="sp-intro-copy">
        <p class="eyebrow">{p['intro_eyebrow']}</p>
        <h2>{p['intro_h2']}</h2>
{''.join(f'        <p>{x}</p>' + chr(10) for x in p['intro'])}      </div>
    </div>
  </section>
'''
    body = ''
    for i, s in enumerate(p['sections']):
        bg = 'cloud' if i % 2 == 0 else 'white'
        inner = ''
        if s.get('paras'):
            inner += '    <div class="sp-geo-text">\n' + ''.join(f'      <p>{x}</p>\n' for x in s['paras']) + '    </div>\n'
        if s.get('list'):
            inner += '    <ul class="sp-geo-list">\n' + ''.join(f'      <li>{x}</li>\n' for x in s['list']) + '    </ul>\n'
        if s.get('cards'):
            inner += '    ' + cards_html(s['cards']) + '\n'
        lead = f'    <p class="sp-lead">{s["lead"]}</p>\n' if s.get('lead') else ''
        body += f'''
  <section class="sp-sec sp-sec--{bg}" id="{s['id']}">
    <p class="eyebrow">{s['eyebrow']}</p>
    <h2>{s['h2']}</h2>
{lead}{inner}  </section>
'''
    cases = ''
    if p.get('cases'):
        cases = f'''
  <section class="sp-sec sp-sec--white" id="our-workshop">
    <span class="outline-word outline-orange" aria-hidden="true">WORKSHOP</span>
    <p class="eyebrow">THE WOW EXPERIMENT</p>
    <h2>{p.get('cases_h2', 'Lo que sale de <span class="sp-hl">nuestro taller</span>')}</h2>
    <p class="sp-lead">{p['cases_lead']}</p>
    <div class="sp-curve" id="spCurve">
      <div class="sp-cv-track">
{''.join(CASES[n] for n in p['cases'])}      </div>
    </div>
  </section>
'''
    faq_sec = f'''
  <section class="svc-faq faq-chat" id="faq">
    <span class="outline-word outline-orange" aria-hidden="true">PREGUNTAS</span>
    <div class="fc-grid">
      <div class="fc-head">
        <p class="eyebrow eyebrow-dark">PREGUNTAS FRECUENTES</p>
        <h2 class="faq-headline">{p['faq_h2']}</h2>
        <p class="fc-intro">Elige una pregunta. Si no ves la tuya, escríbenos y la respondemos.</p>
        <a href="#contacto" class="btn btn-primary" data-open-form>Escríbenos</a>
      </div>
      <div class="fc-thread">
{faq_html(p['prefix'], p['faqs'])}      </div>
    </div>
  </section>
'''
    tail = TAIL.replace('Hablemos de tu <em>próximo proyecto</em> web', p['closer'])
    assert p['closer'] in tail
    out = head + NAV + hero + intro + body + cases + faq_sec + tail
    path = os.path.join(ROOT, 'servicios', p['slug'] + '.html')
    open(path, 'w', encoding='utf-8').write(out)
    print('ok', p['slug'], len(title), len(desc))


S = '../servicios/'
LINK_WEB, LINK_ECOM, LINK_SEO, LINK_PAUTA = 'diseno-web.html', 'ecommerce.html', 'seo.html', 'pauta-digital.html'
LINK_SEOL, LINK_ANA, LINK_CRO, LINK_UX = 'seo-local.html', 'analitica-de-datos.html', 'cro-optimizacion-conversion.html', 'uxui-design.html'
BE, BE_HREF = 'Brand &amp; Experience Lab', '../labs/brand-experience-lab.html'
IN, IN_HREF = 'Insight Lab', '../labs/insight-lab.html'

CITY_REMOTE = ('Trabajamos 100% remoto con marcas de todo Colombia y de Latinoamérica, así que el proceso es el mismo '
               'estés donde estés: videollamadas, entregas por etapas y un solo equipo de diseño, desarrollo, SEO y analítica.')

PAGES = []

# ---------------------------------------------------------------- Medellín: agencia de marketing digital
PAGES.append(dict(
    slug='agencia-marketing-digital-medellin', prefix='mm', crumb='Marketing digital en Medellín',
    title='Agencia de Marketing Digital en Medellín | WOW',
    desc='Agencia de marketing digital para marcas de Medellín: diseño web, SEO, pauta digital y analítica en un solo equipo, de la estrategia a los resultados.',
    service_name='Agencia de marketing digital en Medellín', service_type='Marketing digital, diseño web, SEO y pauta digital', city='Medellín',
    lab='Brand &amp; Experience Lab · Insight Lab', lab_href='../servicios.html', pill='Marketing digital en Medellín',
    h1='Agencia de marketing digital para marcas de <em>Medellín</em>',
    sub='Diseño web, SEO, pauta digital y analítica trabajando como un solo sistema, para que tu marca en Medellín se encuentre en Google, genere confianza y convierta. ' + CITY_REMOTE,
    floats=['Diseño web', 'SEO', 'Pauta'], word='MEDELLÍN',
    callout='Una agencia digital no debería venderte servicios sueltos. Debería hacer que <em>todo lo que haces en digital</em> trabaje hacia el mismo resultado.',
    intro_eyebrow='QUÉ ES', intro_h2='¿Qué hace una agencia de marketing digital en Medellín?',
    intro=['Una agencia de marketing digital ayuda a que tu negocio se encuentre, se entienda y convierta en internet: construye o mejora tu sitio web, te posiciona en Google, diseña y pauta campañas en redes y mide qué funciona para mejorarlo.',
           'Medellín tiene un mercado muy competitivo: clínicas, restaurantes, marcas de moda, empresas de servicios y emprendimientos que compiten por la misma atención. Por eso en WOW no empezamos por el canal, sino por entender tu marca, tu cliente y tu competencia.',
           'Somos un equipo 100% remoto que ha trabajado con marcas y clínicas en Medellín, y con clientes de otras ciudades de Colombia y Latinoamérica.'],
    sections=[
        dict(id='servicios-medellin', eyebrow='QUÉ HACEMOS', h2='Servicios de marketing digital para tu marca',
             lead='Cada servicio funciona solo, pero rinde más conectado con los demás. Estos son los que más piden las marcas de Medellín.',
             cards=[(LINK_WEB, 'Diseño web', 'Sitios que se ven bien, cargan rápido y están pensados para que quien visita entienda qué haces y dé el siguiente paso.'),
                    (LINK_SEO, 'SEO y posicionamiento', 'Estrategia, contenido y SEO técnico para que te encuentren cuando buscan lo que ofreces.'),
                    (LINK_SEOL, 'SEO local y Google Business Profile', 'Para aparecer en el mapa y en las búsquedas de tu zona, clave si atiendes público en Medellín.'),
                    (LINK_PAUTA, 'Pauta digital', 'Campañas en Meta, Google y TikTok con segmentación, creatividad propia y tracking para medir resultados.'),
                    (LINK_ECOM, 'E-commerce', 'Tiendas en línea listas para vender: catálogo, checkout, pagos y analítica.'),
                    (LINK_ANA, 'Analítica de datos', 'Dashboards y análisis para decidir con datos qué optimizar primero.')]),
        dict(id='como-trabajamos', eyebrow='CÓMO TRABAJAMOS', h2='Wonder, Optimize, Win: nuestro método',
             paras=['<strong>Wonder.</strong> Entendemos tu marca, tu negocio, tu cliente y tu competencia antes de proponer nada.',
                    '<strong>Optimize.</strong> Construimos juntos sitio, contenido, SEO y campañas, con una sola estrategia detrás.',
                    '<strong>Win.</strong> Medimos qué funciona, dónde hay fricción y qué mejorar, para que el trabajo no termine en el lanzamiento.',
                    'Conoce más sobre <a href="../servicios.html">todos nuestros servicios</a> o escríbenos y te contamos cómo lo aplicaríamos a tu caso.']),
    ],
    cases=['Clínica del Cerebro', 'Centro del Sueño y Ronquido', 'Lámparas Milán'],
    cases_lead='Algunas marcas de Medellín y de otras ciudades que han pasado por nuestro laboratorio de diseño, experiencia y marketing digital.',
    faq_h2='Preguntas frecuentes sobre marketing digital en Medellín',
    faqs=[
        ('¿Tienen oficina en Medellín?', 'Trabajamos 100% remoto. Atendemos a marcas de Medellín y de toda Colombia por videollamada y herramientas colaborativas, con entregas por etapas y comunicación directa con el equipo.'),
        ('¿Cuánto cuesta contratar una agencia de marketing digital en Medellín?', 'Depende de lo que necesites: no cuesta lo mismo un sitio web que una estrategia de SEO continua o una campaña de pauta. Cuéntanos tu proyecto y te enviamos una propuesta con alcance y entregables claros. Más detalle en <a href="cuanto-cuesta-pagina-web-colombia.html">cuánto cuesta una página web</a> y <a href="cuanto-cuesta-seo-colombia.html">cuánto cuesta el SEO</a>.'),
        ('¿Qué diferencia a WOW de otras agencias de Medellín?', 'Un solo equipo cubre diseño web, SEO, pauta y analítica, así que no tienes que coordinar tres proveedores. Y el trabajo no termina al lanzar: medimos y mejoramos con datos.'),
        ('¿Trabajan con pymes y emprendimientos?', 'Sí. Trabajamos con marcas de distintos tamaños, desde emprendimientos hasta clínicas y empresas establecidas. Ajustamos el alcance a tu etapa y presupuesto.'),
        ('¿Pueden ayudarme a aparecer en Google en Medellín?', 'Sí. Combinamos <a href="seo.html">SEO</a> y <a href="seo-local.html">SEO local con Google Business Profile</a> para que aparezcas en las búsquedas y en el mapa cuando alguien en tu zona busca lo que ofreces.'),
    ],
    closer='Hablemos de tu <em>marca en Medellín</em>'))

# ---------------------------------------------------------------- Diseño web por ciudad
def city_page(slug, prefix, city, kw_h1, title, desc, intro_extra, nearby):
    return dict(
        slug=slug, prefix=prefix, crumb=f'Diseño web en {city}', title=title, desc=desc,
        service_name=f'Diseño de páginas web en {city}', service_type='Diseño web, desarrollo web y UX/UI', city=city,
        lab=BE, lab_href=BE_HREF, pill=f'Diseño web en {city}',
        h1=kw_h1,
        sub=f'Diseñamos y desarrollamos páginas web para marcas de {city}: estrategia, UX/UI, contenido, SEO y conversión desde el principio. ' + CITY_REMOTE,
        floats=['Estructura', 'UX/UI', 'Responsive'], hero='pink', word=city.upper(),
        callout='Un sitio web no es una vitrina: es el lugar donde tu cliente decide si <em>confía en ti</em>.',
        intro_eyebrow='QUÉ INCLUYE', intro_h2=f'Diseño y desarrollo de páginas web en {city}',
        intro=[f'Si buscas una agencia de diseño web en {city}, lo importante no es solo cómo se ve el sitio, sino qué logra: que se entienda tu propuesta, que cargue rápido en el celular, que Google pueda leerlo y que invite a contactarte o comprar.',
               intro_extra,
               'Diseñamos y desarrollamos en WordPress, Wix o a medida, según lo que necesites editar y quién va a administrar el sitio.'],
        sections=[
            dict(id='que-incluye', eyebrow='QUÉ HACEMOS', h2='Qué incluye el diseño de tu página web',
                 cards=[(None, 'Estrategia y arquitectura', 'Definimos estructura, jerarquía y recorrido antes de diseñar pantallas.'),
                        (None, 'Diseño UX/UI y responsive', 'Interfaces claras que funcionan igual de bien en celular, tableta y computador.'),
                        (None, 'Desarrollo y velocidad', 'Código limpio y carga rápida, base de una buena experiencia y de un buen SEO.'),
                        (None, 'SEO desde el diseño', 'Encabezados, metadatos y datos estructurados listos desde el lanzamiento.'),
                        (None, 'Medición', 'Analítica configurada para saber qué funciona y qué mejorar después de lanzar.')]),
            dict(id='mas', eyebrow='SIGUE LEYENDO', h2='Servicios que se conectan con tu sitio web',
                 paras=['Tu página web rinde más cuando trabaja con otros servicios: <a href="diseno-web.html">diseño web</a>, <a href="ecommerce.html">e-commerce</a>, <a href="seo.html">SEO</a>, <a href="pauta-digital.html">pauta digital</a> y <a href="analitica-de-datos.html">analítica</a>.',
                        f'También atendemos {nearby}. <a href="cuanto-cuesta-pagina-web-colombia.html">Mira de qué depende el precio de una página web</a> o escríbenos para cotizar la tuya.']),
        ],
        cases=['Lámparas Milán', 'Centro del Sueño y Ronquido', 'Clínica del Cerebro', 'La Marquessa'],
        cases_lead='Algunos de los sitios y marcas que han pasado por nuestro taller.',
        faq_h2=f'Preguntas frecuentes sobre diseño web en {city}',
        faqs=[
            (f'¿Cuánto cuesta una página web en {city}?', 'Depende del alcance: una landing page, un sitio institucional y una tienda en línea no cuestan lo mismo. Cuéntanos tu proyecto y te enviamos una cotización con alcance claro. Aquí explicamos <a href="cuanto-cuesta-pagina-web-colombia.html">de qué depende el precio</a>.'),
            (f'¿Tienen oficina en {city}?', 'Trabajamos 100% remoto. Es el mismo proceso para cualquier ciudad: videollamadas, entregas por etapas y un solo equipo de principio a fin.'),
            ('¿Cuánto tarda en estar lista mi página web?', 'Un sitio institucional suele tomar entre 3 y 6 semanas y una tienda en línea entre 6 y 10; una landing page, menos. Te damos un cronograma concreto cuando definimos el alcance.'),
            ('¿Mi página web quedará optimizada para Google?', 'Sí. Estructuramos encabezados, metadatos, velocidad y datos estructurados desde el desarrollo, para que el trabajo de <a href="seo.html">SEO</a> parta de una base sólida.'),
            ('¿Pueden rediseñar mi sitio actual?', 'Sí. Hacemos rediseños migrando el contenido y cuidando el posicionamiento que ya tienes.'),
        ],
        closer=f'Hablemos de tu <em>sitio web en {city}</em>')


PAGES.append(city_page('diseno-web-medellin', 'wm', 'Medellín',
    'Diseño de páginas web en <em>Medellín</em> que funcionan y convierten',
    'Diseño de Páginas Web en Medellín | WOW',
    'Diseño y desarrollo de páginas web en Medellín: sitios rápidos, claros y optimizados para SEO que convierten visitas en clientes. Cotiza tu sitio.',
    'Hemos diseñado sitios para marcas y clínicas de Medellín, desde sitios de servicios de salud hasta marcas de productos, siempre con el foco en que quien llega al sitio encuentre lo que busca.',
    'marcas de Bogotá, Cali, Villavicencio y el resto del país, y también de Panamá y Latinoamérica'))
PAGES.append(city_page('diseno-web-cali', 'wc', 'Cali',
    'Diseño de páginas web en <em>Cali</em> que funcionan y convierten',
    'Diseño de Páginas Web en Cali | WOW',
    'Diseño y desarrollo de páginas web en Cali: sitios rápidos, claros y optimizados para SEO que convierten visitas en clientes. Cotiza tu sitio.',
    'Cali tiene un ecosistema empresarial muy activo, desde servicios y salud hasta comercio y marcas creativas. Un buen sitio web te ayuda a destacar frente a competidores que están a una búsqueda de distancia.',
    'marcas de Medellín, Bogotá, Villavicencio y el resto del país, y también de Panamá y Latinoamérica'))
PAGES.append(city_page('diseno-web-bogota', 'wb', 'Bogotá',
    'Diseño de páginas web en <em>Bogotá</em> que funcionan y convierten',
    'Diseño de Páginas Web en Bogotá | WOW',
    'Diseño y desarrollo de páginas web en Bogotá: sitios rápidos, claros y optimizados para SEO que convierten visitas en clientes. Cotiza tu sitio.',
    'En una ciudad tan grande y competitiva como Bogotá, el sitio web es muchas veces el primer contacto con tu marca: debe explicar rápido qué haces y generar confianza desde el primer scroll.',
    'marcas de Medellín, Cali, Villavicencio y el resto del país, y también de Panamá y Latinoamérica'))

# ---------------------------------------------------------------- Marketing médico
PAGES.append(dict(
    slug='marketing-medico-colombia', prefix='mc', crumb='Marketing médico',
    title='Marketing Médico para Clínicas y Consultorios | WOW',
    desc='Marketing digital para clínicas, consultorios y profesionales de la salud en Colombia: sitio web, SEO, contenido y pauta que generan confianza y citas.',
    service_name='Marketing digital para clínicas y consultorios', service_type='Marketing médico, diseño web y SEO para salud', city=None,
    lab='Brand &amp; Experience Lab · Insight Lab', lab_href='../servicios.html', pill='Marketing para salud',
    h1='Marketing médico para clínicas y consultorios que <em>generan confianza</em>',
    sub='En salud, la gente investiga antes de pedir una cita. Construimos sitio web, SEO, contenido y pauta para que tu clínica o consultorio en Colombia aparezca cuando lo buscan y explique con claridad lo que hace.',
    floats=['Confianza', 'SEO', 'Citas'], word='SALUD',
    callout='En salud, la confianza no se construye con promesas, sino con <em>información clara y útil</em>.',
    intro_eyebrow='POR QUÉ IMPORTA', intro_h2='El marketing en salud es distinto',
    intro=['Quien busca un especialista suele llegar con dudas y preocupación. Antes de agendar, investiga síntomas, compara opciones y lee. Si tu clínica no aparece en Google o su sitio no resuelve esas dudas, la cita se pierde.',
           'Por eso el marketing médico combina un sitio claro, contenido educativo, SEO para las búsquedas de pacientes y pauta responsable, siempre cuidando el tono y sin prometer resultados clínicos.',
           'Hemos trabajado con clínicas y centros de salud en Medellín, desde la estrategia digital hasta el sitio, el contenido y la pauta.'],
    sections=[
        dict(id='que-hacemos', eyebrow='QUÉ HACEMOS', h2='Qué incluye el marketing digital para salud',
             cards=[(LINK_WEB, 'Sitio web para clínicas', 'Un sitio que explica servicios y especialistas en lenguaje sencillo y facilita agendar.'),
                    (LINK_SEO, 'SEO para salud', 'Posicionamiento para las búsquedas de pacientes y contenido educativo que responde sus dudas.'),
                    (LINK_SEOL, 'SEO local y Google Business Profile', 'Para aparecer en el mapa y las búsquedas cerca de ti cuando alguien necesita una consulta.'),
                    (LINK_PAUTA, 'Pauta digital', 'Campañas segmentadas para llegar a pacientes en tu ciudad, con mensajes cuidadosos.'),
                    (None, 'Contenido para redes', 'Contenido educativo sobre temas de salud, claro y respetuoso, para construir confianza antes de la cita.'),
                    (LINK_ANA, 'Analítica', 'Medimos de dónde llegan los pacientes y qué canal genera más contactos.')]),
    ],
    cases=['Clínica del Cerebro', 'Centro del Sueño y Ronquido'],
    cases_lead='Dos clínicas de Medellín con las que hemos trabajado.',
    faq_h2='Preguntas frecuentes sobre marketing médico',
    faqs=[
        ('¿Qué es el marketing médico?', 'Es el conjunto de estrategias digitales (sitio web, SEO, contenido, redes y pauta) que ayudan a clínicas, consultorios y profesionales de la salud a que los pacientes los encuentren, confíen en ellos y agenden una consulta.'),
        ('¿Cómo puede una clínica aparecer en Google?', 'Con un sitio claro y rápido, contenido que responda lo que buscan los pacientes, un perfil de Google Business Profile bien trabajado y SEO constante. Mira nuestro servicio de <a href="seo.html">SEO</a> y de <a href="seo-local.html">SEO local</a>.'),
        ('¿Es posible hacer publicidad médica en redes?', 'Sí, cuidando el tono y las políticas de cada plataforma. Evitamos promesas de resultados clínicos y priorizamos mensajes informativos y respetuosos.'),
        ('¿Trabajan con consultorios pequeños?', 'Sí. Ajustamos el alcance a lo que necesite tu consultorio o clínica en esta etapa.'),
        ('¿Tienen experiencia en salud?', 'Hemos trabajado con la Clínica del Cerebro y el Centro del Sueño y Ronquido en Medellín, con sitio web, contenido, SEO y pauta digital.'),
    ],
    closer='Hablemos del <em>marketing de tu clínica</em>'))

# ---------------------------------------------------------------- Pasarelas de pago
PAGES.append(dict(
    slug='pasarelas-de-pago-colombia', prefix='pp', crumb='Pasarelas de pago en Colombia',
    title='Pasarelas de Pago en Colombia: Guía para tu Tienda | WOW',
    desc='Cómo elegir la mejor pasarela de pago en Colombia para tu tienda online (WooCommerce o Shopify): medios de pago, comisiones y qué revisar antes de decidir.',
    service_name='Integración de pasarelas de pago para tiendas online', service_type='E-commerce y pasarelas de pago', city=None,
    lab=BE, lab_href=BE_HREF, pill='E-commerce en Colombia',
    h1='Pasarelas de pago en Colombia: <em>cómo elegir la mejor</em> para tu tienda',
    sub='Una tienda online no vende si pagar es difícil. Esta guía te ayuda a decidir qué pasarela de pago en Colombia conviene a tu negocio y cómo integrarla en tu e-commerce.',
    floats=['Checkout', 'Pagos', 'Conversión'], word='PAGOS',
    callout='El checkout es donde se gana o se pierde la venta: <em>menos fricción, más compras</em>.',
    intro_eyebrow='QUÉ ES', intro_h2='¿Qué es una pasarela de pago?',
    intro=['Una pasarela de pago es el servicio que procesa los pagos de tu tienda en línea: recibe los datos de la tarjeta u otro medio, los valida de forma segura y te transfiere el dinero.',
           'En Colombia las opciones más conocidas incluyen Wompi, PayU, Mercado Pago, ePayco y otras; y los medios de pago más usados son tarjeta de crédito y débito, PSE, billeteras como Nequi y pago contra entrega.',
           'No hay una pasarela mejor para todos: depende de tus ventas, tus comisiones y la plataforma de tu tienda.'],
    sections=[
        dict(id='como-elegir', eyebrow='CÓMO ELEGIR', h2='Qué revisar antes de decidir', lead='Compara estas variables en cada pasarela antes de integrarla:',
             list=['<strong>Comisiones y costos:</strong> porcentaje por transacción, tarifa fija y costos de retiro; revisa las condiciones vigentes de cada proveedor.',
                   '<strong>Medios de pago:</strong> que acepte los que usan tus clientes (tarjetas, PSE, billeteras, efectivo).',
                   '<strong>Compatibilidad:</strong> que tenga plugin o integración con tu plataforma: WooCommerce (WordPress), Shopify u otra.',
                   '<strong>Tiempos de abono:</strong> cuándo recibes el dinero tras cada venta.',
                   '<strong>Experiencia de checkout:</strong> si el pago ocurre dentro de tu tienda o te redirige a otro sitio, y cuántos pasos exige.',
                   '<strong>Soporte y seguridad:</strong> atención en español, certificaciones y manejo de contracargos.']),
        dict(id='plataformas', eyebrow='PLATAFORMAS', h2='Pasarelas de pago en WooCommerce y en Shopify',
             paras=['En <strong>WooCommerce</strong> (WordPress) la mayoría de pasarelas colombianas ofrecen su propio plugin, lo que te da libertad para elegir y cambiar de proveedor.',
                    'En <strong>Shopify</strong> las opciones dependen de los proveedores disponibles para tu país y de si necesitas una pasarela externa; conviene validarlo antes de elegir plataforma.',
                    'Si estás por montar tu tienda, <a href="ecommerce.html">nuestro servicio de e-commerce</a> incluye integrar la pasarela que mejor se ajuste y trabajar el checkout para reducir abandonos. También puedes ver cuánto tarda y qué incluye el <a href="diseno-web.html">diseño web</a> de una tienda.']),
    ],
    cases=None, cases_lead='',
    faq_h2='Preguntas frecuentes sobre pasarelas de pago',
    faqs=[
        ('¿Cuál es la mejor pasarela de pago en Colombia?', 'No hay una única mejor: depende de tu volumen de ventas, de las comisiones, de los medios de pago que tus clientes usan y de tu plataforma. Lo recomendable es comparar dos o tres opciones con tus cifras reales.'),
        ('¿Qué pasarela de pago puedo usar con WooCommerce en Colombia?', 'Varios proveedores colombianos ofrecen plugin para WooCommerce. Revisa que el plugin esté actualizado, que acepte PSE y tarjetas, y que tenga soporte.'),
        ('¿Necesito una pasarela de pago para vender en línea?', 'Si quieres cobrar con tarjeta o PSE en tu sitio, sí. También puedes combinar con pago contra entrega o transferencia, aunque cada medio tiene su fricción.'),
        ('¿Ustedes integran la pasarela en mi tienda?', 'Sí. Integramos la pasarela que mejor se ajuste y configuramos el checkout y el seguimiento de conversiones. Cuéntanos tu proyecto en el formulario.'),
    ],
    closer='Hablemos de tu <em>tienda online</em>'))

# ---------------------------------------------------------------- Cuánto cuesta una página web
PAGES.append(dict(
    slug='cuanto-cuesta-pagina-web-colombia', prefix='cw', crumb='Cuánto cuesta una página web',
    title='Cuánto Cuesta una Página Web en Colombia | WOW',
    desc='De qué depende el precio de una página web en Colombia (landing, sitio institucional o tienda online) y qué incluir en una cotización para comparar bien.',
    service_name='Cotización de páginas web', service_type='Diseño y desarrollo web', city=None,
    lab=BE, lab_href=BE_HREF, pill='Cotización de página web',
    h1='Cuánto cuesta una página web en Colombia y <em>cómo cotizarla</em>',
    sub='No existe un precio único: depende de lo que tu sitio necesita lograr. Aquí te explicamos qué mueve el costo y qué debe incluir una cotización para que puedas comparar.',
    floats=['Alcance', 'Cotización', 'Entregables'], hero='pink', word='COSTO',
    cta='Pide tu cotización', callout='Una cotización útil dice <em>qué recibes</em>, no solo cuánto pagas.',
    intro_eyebrow='LO PRIMERO', intro_h2='¿De qué depende el precio de una página web?',
    intro=['Dos propuestas con el mismo precio pueden incluir cosas muy distintas. Por eso, antes de comparar números, compara alcances.',
           'En WOW no publicamos una tarifa fija porque cada proyecto es distinto. Te damos una propuesta con alcance, entregables y cronograma claros, ajustada a tu presupuesto.'],
    sections=[
        dict(id='factores', eyebrow='FACTORES', h2='Lo que cambia el costo de un sitio web',
             list=['<strong>Tipo de sitio:</strong> una landing page, un sitio institucional y una tienda en línea tienen alcances distintos.',
                   '<strong>Número de páginas y funcionalidades:</strong> formularios, reservas, blog, integraciones, múltiples idiomas.',
                   '<strong>Diseño:</strong> plantilla adaptada o diseño a medida con UX/UI propio.',
                   '<strong>Contenido:</strong> textos, fotos y videos: si los tienes o hay que crearlos.',
                   '<strong>SEO y analítica:</strong> si el sitio se entrega optimizado y medido desde el inicio.',
                   '<strong>Plataforma:</strong> WordPress, Wix, Shopify o desarrollo a medida.',
                   '<strong>Mantenimiento y evolución:</strong> qué pasa después del lanzamiento.']),
        dict(id='cotizacion', eyebrow='AL COTIZAR', h2='Qué debe incluir una buena cotización',
             list=['Alcance detallado: páginas, secciones y funcionalidades.', 'Qué entrega cada etapa y cuántas rondas de ajustes incluye.',
                   'Cronograma realista: un sitio institucional suele tomar entre 3 y 6 semanas, una tienda entre 6 y 10.',
                   'Quién es dueño del sitio, el dominio y los accesos al terminar.',
                   'Qué incluye en SEO técnico, velocidad y analítica.', 'Costos recurrentes: hosting, dominio, plugins o licencias.']),
        dict(id='relacionados', eyebrow='SIGUE LEYENDO', h2='Para tu proyecto',
             paras=['Mira nuestro servicio de <a href="diseno-web.html">diseño web</a> o el de <a href="ecommerce.html">e-commerce</a> si buscas una tienda. Si ya sabes cuál es tu ciudad, también atendemos <a href="diseno-web-medellin.html">Medellín</a>, <a href="diseno-web-bogota.html">Bogotá</a> y <a href="diseno-web-cali.html">Cali</a>.']),
    ],
    cases=None, cases_lead='',
    faq_h2='Preguntas frecuentes sobre el costo de una página web',
    faqs=[
        ('¿Cuánto cuesta una página web en Colombia?', 'Depende del tipo de sitio, el diseño, el contenido y las funcionalidades. Por eso preferimos cotizar según tu proyecto en vez de publicar un valor único que no te serviría.'),
        ('¿Cuánto cuesta una landing page?', 'Una landing page tiene un alcance más acotado que un sitio completo, por lo que suele ser la opción más económica y rápida. El valor depende del diseño, el contenido y las integraciones que necesite.'),
        ('¿Qué necesito para pedir una cotización?', 'Cuéntanos qué hace tu negocio, qué tipo de sitio imaginas, ejemplos que te gusten y para cuándo lo necesitas. Con eso armamos una propuesta, y te respondemos en máximo 1 día hábil.'),
        ('¿El hosting y el dominio están incluidos?', 'Los explicamos en la propuesta de forma separada: son costos recurrentes que deben quedar claros desde el inicio y a tu nombre.'),
    ],
    closer='Pide tu <em>cotización</em> de página web'))

# ---------------------------------------------------------------- Cuánto cuesta el SEO
PAGES.append(dict(
    slug='cuanto-cuesta-seo-colombia', prefix='cs', crumb='Cuánto cuesta el SEO',
    title='Cuánto Cuesta el SEO en Colombia | WOW',
    desc='De qué depende el precio del posicionamiento SEO en Colombia, qué debe incluir una propuesta y en cuánto tiempo suelen verse los primeros resultados.',
    service_name='Posicionamiento SEO', service_type='SEO y posicionamiento orgánico', city=None,
    lab=IN, lab_href=IN_HREF, pill='Precio del SEO',
    h1='Cuánto cuesta el SEO en Colombia y <em>qué deberías recibir</em>',
    sub='El costo del posicionamiento SEO cambia según tu sitio, tu competencia y el alcance. Te explicamos qué lo mueve y cómo evaluar una propuesta.',
    floats=['Diagnóstico', 'Contenido', 'Medición'], word='SEO',
    cta='Pide tu propuesta', callout='El SEO se paga por <em>trabajo y estrategia</em>, no por promesas de “primer lugar”.',
    intro_eyebrow='LO PRIMERO', intro_h2='¿De qué depende el precio del posicionamiento SEO?',
    intro=['Desconfía de quien garantiza el primer lugar en Google: nadie controla el buscador. Lo que sí puede garantizar una agencia es el trabajo: auditoría, estrategia, contenido, optimización y reportes.',
           'En WOW empezamos con un diagnóstico del estado de tu sitio y tu competencia, y a partir de ahí te presentamos una propuesta con alcance y entregables claros.'],
    sections=[
        dict(id='factores', eyebrow='FACTORES', h2='Lo que cambia el costo del SEO',
             list=['<strong>Estado actual del sitio:</strong> problemas técnicos, velocidad, estructura.', '<strong>Competencia:</strong> qué tan disputadas son tus palabras clave.',
                   '<strong>Tamaño del sitio:</strong> número de páginas y de productos o servicios.', '<strong>Contenido:</strong> cuánto hay que crear u optimizar.',
                   '<strong>Autoridad:</strong> trabajo de menciones y enlaces de calidad.', '<strong>SEO local:</strong> si necesitas posicionar en una ciudad o zona concreta.',
                   '<strong>Frecuencia de reportes y medición:</strong> qué se mide y cada cuánto.']),
        dict(id='propuesta', eyebrow='AL EVALUAR', h2='Qué debería incluir una propuesta de SEO',
             list=['Auditoría técnica y de contenido.', 'Investigación de palabras clave según la intención de búsqueda.', 'Plan de contenido y de optimización on-page.',
                   'Trabajo técnico: velocidad, indexación, estructura.', 'Reportes claros con indicadores que importan (visibilidad, tráfico, contactos).',
                   'Un plazo realista: los primeros movimientos suelen verse entre 1 y 3 meses y los más sólidos a partir de los 6.']),
        dict(id='relacionados', eyebrow='SIGUE LEYENDO', h2='Conoce nuestro servicio',
             paras=['Mira cómo trabajamos el <a href="seo.html">SEO</a>, el <a href="seo-local.html">SEO local</a> y el <a href="geo-posicionamiento-ia.html">GEO para motores de IA</a>. Y si necesitas un sitio nuevo, revisa el <a href="diseno-web.html">diseño web</a> pensado para SEO.']),
    ],
    cases=['Centro del Sueño y Ronquido', 'Lámparas Milán'],
    cases_lead='Dos marcas en las que el SEO hace parte de la estrategia.',
    faq_h2='Preguntas frecuentes sobre el costo del SEO',
    faqs=[
        ('¿Cuánto cuesta un posicionamiento SEO en Colombia?', 'No hay un valor único. Depende del estado del sitio, la competencia y el alcance. Te presentamos una propuesta tras revisar tu caso.'),
        ('¿Cuánto tarda el SEO en dar resultados?', 'Los primeros movimientos suelen verse entre 1 y 3 meses y los resultados más sólidos a partir de los 6 meses, según la competencia y el estado del sitio.'),
        ('¿Garantizan el primer lugar en Google?', 'No, y desconfía de quien lo haga. Garantizamos trabajo transparente: estrategia, optimización, contenido y reportes.'),
        ('¿El SEO es un gasto mensual o un pago único?', 'El SEO es un trabajo continuo porque Google y la competencia cambian. Puedes empezar con un diagnóstico y plan inicial y luego decidir el acompañamiento.'),
        ('¿Cuánto cuesta una agencia SEO frente a hacerlo yo mismo?', 'Hacerlo tú mismo es posible si tienes tiempo y conocimiento técnico. Una agencia ahorra tiempo, evita errores y conecta el SEO con tu sitio, contenido y analítica.'),
    ],
    closer='Pide tu <em>propuesta de SEO</em>'))


if __name__ == '__main__':
    for page in PAGES:
        page.setdefault('cases', None)
        build(page)
