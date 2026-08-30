import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

TEMPLATE = """<!DOCTYPE html>
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
<title>{title}</title>
<meta name="description" content="{description}">
<link rel="canonical" href="{canonical}">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#380757">

<!-- Open Graph / Facebook, LinkedIn, WhatsApp -->
<meta property="og:type" content="website">
<meta property="og:url" content="{canonical}">
<meta property="og:site_name" content="Workshop of Wonders">
<meta property="og:locale" content="es_CO">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:image" content="https://efectowow.co/design-system/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Workshop of Wonders">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{description}">
<meta name="twitter:image" content="https://efectowow.co/design-system/og-image.jpg">

<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {{ "@type": "ListItem", "position": 1, "name": "Workshop of Wonders", "item": "https://efectowow.co/" }},
    {{ "@type": "ListItem", "position": 2, "name": "{lab_name}", "item": "{canonical}" }}
  ]
}}
</script>
<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "{lab_name}",
  "serviceType": "{service_type}",
  "provider": {{ "@type": "ProfessionalService", "name": "Workshop of Wonders", "url": "https://efectowow.co/" }},
  "areaServed": "Global",
  "url": "{canonical}",
  "description": "{description}",
  "hasOfferCatalog": {{
    "@type": "OfferCatalog",
    "name": "{lab_name}",
    "itemListElement": [
{offer_jsonld}
    ]
  }}
}}
</script>

<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22><text y=%2220%22 font-size=%2220%22>✦</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=DM+Sans:wght@400;500;700&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../styles.css">
</head>
<body>

<header class="nav is-scrolled">
  <a href="../index.html" class="logo">
    <img src="../design-system/logo/wow-logo-white.webp" alt="Workshop of Wonders" class="logo-img" width="773" height="295">
  </a>
  <nav class="nav-links">
    <a href="../servicios.html">Servicios</a>
    <a href="../index.html#labs">Labs</a>
    <a href="../index.html#trabajo">Trabajo</a>
    <a href="#contacto" class="btn btn-primary btn-sm" data-open-form>Hablemos de tu proyecto</a>
  </nav>
  <button type="button" class="nav-burger" id="navBurger" aria-label="Abrir menú" aria-expanded="false" aria-controls="navMobileMenu">
    <span></span><span></span><span></span>
  </button>
</header>
<div class="nav-mobile-menu" id="navMobileMenu">
  <div class="nav-mobile-panel">
    <div class="nav-mobile-top">
      <a href="../index.html" class="logo">
        <img src="../design-system/logo/wow-logo-white.webp" alt="Workshop of Wonders" class="logo-img" width="773" height="295">
      </a>
      <button type="button" class="nav-mobile-close" id="navMobileClose" aria-label="Cerrar menú">
        <span></span><span></span>
      </button>
    </div>
    <nav class="nav-mobile-links">
      <a href="../servicios.html"><span class="nav-mobile-link-num">01</span>Servicios</a>
      <a href="../index.html#labs"><span class="nav-mobile-link-num">02</span>Labs</a>
      <a href="../index.html#trabajo"><span class="nav-mobile-link-num">03</span>Trabajo</a>
    </nav>
    <a href="#contacto" class="btn btn-primary nav-mobile-cta" data-open-form>Hablemos de tu proyecto <span class="nav-mobile-cta-arrow">→</span></a>
    <div class="nav-mobile-foot">
      <span class="nav-mobile-foot-mark">✦</span>
      <a href="https://instagram.com/workshopofwonders" target="_blank" rel="noopener">Instagram</a>
      <a href="https://linkedin.com" target="_blank" rel="noopener">LinkedIn</a>
    </div>
  </div>
</div>

<main id="top">
  <nav class="svc-breadcrumb" aria-label="Ruta de navegación">
    <a href="../index.html">Inicio</a> / <a href="../index.html#labs">Labs</a> / <span aria-current="page">{lab_name}</span>
  </nav>

  <section class="svc-hero">
    <p class="eyebrow"><span class="svc-jump-dot {dot_class}"></span> {eyebrow}</p>
    <h1 class="svc-hero-headline">{h1}</h1>
    <p class="svc-hero-sub">{hero_sub}</p>
    <div class="hero-cta">
      <a href="#contacto" class="btn btn-primary" data-open-form>Hablemos de tu proyecto</a>
      <a href="../portafolio.html" class="btn btn-outline">Ver nuestro trabajo</a>
    </div>
    <div class="svc-highlight-row">
{highlight_chips}
    </div>
  </section>

  <section class="svc-service-detail">
    <h2>{intro_h2}</h2>
    <p>{intro_p}</p>

    <h3>Servicios de {lab_name}</h3>
    <div class="svc-includes-grid">
{service_cards}
    </div>
  </section>

  <section class="svc-work-teaser">
    <p class="eyebrow">TRABAJO REAL</p>
    <h2>{work_h2}</h2>
    <div class="svc-work-teaser-grid">
{work_items}
    </div>
    <a href="../portafolio.html" class="btn btn-outline">Ver todo el portafolio</a>
  </section>

  <section class="svc-faq" id="faq">
    <p class="eyebrow">PREGUNTAS FRECUENTES</p>
    <h2>Preguntas frecuentes sobre {lab_name}</h2>
    <div class="svc-faq-list">
{faq_html}
    </div>
  </section>
</main>

<section id="contacto" class="svc-contact">
  <p class="closer-line">Y si hacemos <em>maravillas</em> juntos</p>
  <p class="essence-lead">Cuéntanos tu proyecto o encuéntranos en redes.</p>
  <div class="contact-links">
    <a class="contact-pill contact-pill-primary" href="#" data-open-form>Hablemos de tu proyecto</a>
  </div>
</section>
<footer class="footer">
  <div class="footer-logo">
    <img src="../design-system/logo/wow-logo-white.webp" alt="Workshop of Wonders" class="footer-logo-img" width="773" height="295" loading="lazy">
  </div>
  <p class="footer-quote">&ldquo;Seguimos aquí después de lanzar — porque una marca que se siente real no termina en la entrega.&rdquo;</p>
  <div class="footer-socials">
    <a href="https://instagram.com/workshopofwonders" target="_blank" rel="noopener" aria-label="Instagram">Instagram</a>
    <a href="https://linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn">LinkedIn</a>
  </div>
  <p>© <span id="year"></span> Workshop of Wonders. Hecho con asombro.</p>
</footer>

<script src="../js/common.js" defer></script>
<script src="../js/servicios.js" defer></script>
<script defer src="/_vercel/insights/script.js"></script>
</body>
</html>
"""


def build_faq(items, prefix):
    html_items = []
    jsonld_items = []
    for i, (q, a) in enumerate(items, 1):
        cid = f"{prefix}FaqA{i}"
        html_items.append(f'''      <div class="svc-faq-item">
        <h4 class="svc-faq-q-h"><button type="button" class="svc-faq-q" aria-expanded="false" aria-controls="{cid}"><span>{q}</span><span class="svc-faq-icon">+</span></button></h4>
        <div class="svc-faq-a" id="{cid}"><p>{a}</p></div>
      </div>''')
    return "\n".join(html_items)


def build_cards(services):
    cards = []
    for href, name, desc in services:
        cards.append(f'''      <div class="svc-card">
        <h4><a href="{href}">{name}</a></h4>
        <p>{desc}</p>
      </div>''')
    return "\n".join(cards)


def build_chips(chips):
    out = []
    for color, text in chips:
        out.append(f'      <span class="svc-highlight-chip"><span class="dot" style="background:var(--{color})"></span>{text}</span>')
    return "\n".join(out)


def build_work_items(items):
    out = []
    for img, alt, title in items:
        out.append(f'''      <a class="svc-work-teaser-item" href="../portafolio.html">
        <img src="{img}" alt="{alt}" loading="lazy">
        <span>{title}</span>
      </a>''')
    return "\n".join(out)


def write_page(slug, offers, **kw):
    offer_jsonld = ",\n".join(f'      {{ "@type": "Offer", "itemOffered": {{ "@type": "Service", "name": "{o}" }} }}' for o in offers)
    html = TEMPLATE.format(offer_jsonld=offer_jsonld, **kw)
    out = os.path.join(ROOT, "labs", f"{slug}.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    print("wrote", out)


write_page(
    "brand-experience-lab",
    offers=["Diseño web", "UX/UI Design", "E-commerce", "Diseño gráfico"],
    title="Brand & Experience Lab: Diseño Web y UX/UI | Workshop of Wonders",
    description="Brand & Experience Lab convierte objetivos de negocio en un sitio real: diseño web, UX/UI, e-commerce y diseño gráfico, con dirección de marca desde el primer boceto.",
    canonical="https://efectowow.co/labs/brand-experience-lab.html",
    lab_name="Brand & Experience Lab",
    service_type="Diseño web, UX/UI, e-commerce y diseño gráfico",
    dot_class="nav-dot-magenta",
    eyebrow="CREA — BRAND & EXPERIENCE LAB",
    h1="De la estrategia a un sitio que funciona",
    hero_sub="Convertimos objetivos de negocio en un sitio real: diseño, experiencia de usuario y tienda en línea listos para recibir tráfico y convertirlo. Todo lo que construimos aquí parte de una dirección definida — diseñamos con intención, no solo para vernos bien.",
    highlight_chips=build_chips([
        ("magenta", "Diseño web y UX/UI"),
        ("orange", "E-commerce listo para vender"),
        ("blue", "Diseño gráfico consistente con tu marca"),
    ]),
    intro_h2="Un mismo equipo, de la estrategia al sitio en producción",
    intro_p="Brand & Experience Lab es el equipo detrás de todo lo que tu marca construye para verse y funcionar: sitios web, interfaces, tiendas en línea y piezas gráficas. No trabajamos por encargos sueltos — cada pieza parte de la misma dirección de marca, para que tu sitio, tus redes y tu material gráfico se sientan como una sola cosa.",
    service_cards=build_cards([
        ("../servicios/diseno-web.html", "Diseño web", "Sitios web, landing pages y tiendas en línea con una estética que representa tu marca."),
        ("../servicios/uxui-design.html", "UX/UI Design", "Interfaces claras y experiencias de usuario pensadas de principio a fin."),
        ("../servicios/ecommerce.html", "E-commerce", "Tiendas en línea listas para vender, del catálogo al checkout."),
        ("../servicios/diseno-grafico.html", "Diseño gráfico", "Piezas gráficas para redes, presentaciones y material digital, con la misma estética de tu sitio."),
    ]),
    work_h2="Marcas que ya construimos con Brand & Experience Lab",
    work_items=build_work_items([
        ("../design-system/hero-photos/lamparas-milan-horizontal.webp", "Lámparas Milán — rebranding y diseño web", "Lámparas Milán"),
        ("../design-system/hero-photos/orbit-horizontal.webp", "Orbit — identidad de marca desde cero", "Orbit"),
        ("../design-system/hero-photos/tin-t-horizontal.webp", "Tin-T! — desarrollo de marca", "Tin-T!"),
    ]),
    faq_html=build_faq([
        ("¿Qué es Brand & Experience Lab?",
         "Es el equipo de Workshop of Wonders enfocado en diseño web, UX/UI, e-commerce y diseño gráfico — todo lo que tu marca necesita para verse y funcionar de forma consistente."),
        ("¿En qué se diferencia de contratar diseño web y diseño gráfico por separado?",
         "Al ser un mismo equipo con una sola dirección de marca, tu sitio, tu tienda en línea y tus piezas gráficas se sienten parte de la misma marca, sin las inconsistencias de coordinar proveedores distintos."),
        ("¿Puedo contratar solo uno de los servicios del Lab, como e-commerce?",
         "Sí, puedes contratar un servicio puntual del Lab o un proyecto integral que combine varios, según lo que tu marca necesite."),
        ("¿Cómo se conecta Brand & Experience Lab con Insight Lab?",
         "Lo que construimos aquí (sitio, tienda, piezas) es lo que Insight Lab luego posiciona y hace crecer con SEO, pauta digital y analítica — trabajan como un sistema integrado."),
    ], "brandLab"),
)

write_page(
    "insight-lab",
    offers=["SEO", "SEO local", "GEO", "CRO", "Pauta digital", "Posts gráficos para pauta", "Analítica de datos", "Configuración de analítica", "Consultoría de datos", "Cursos digitales"],
    title="Insight Lab: SEO, SEM y Analítica de Datos | Workshop of Wonders",
    description="Insight Lab lleva tu marca a las personas correctas y mide lo que realmente funciona: SEO, GEO, pauta digital, CRO y analítica de datos convertidos en decisiones.",
    canonical="https://efectowow.co/labs/insight-lab.html",
    lab_name="Insight Lab",
    service_type="SEO, SEM, GEO, CRO y analítica de datos",
    dot_class="nav-dot-orange",
    eyebrow="CRECE — INSIGHT LAB",
    h1="Crecer también es saber qué cambiar",
    hero_sub="Llevamos tu marca a las personas correctas y medimos lo que realmente funciona. Insight Lab convierte datos y comportamiento en decisiones: qué canal, qué mensaje y qué ajustar para seguir creciendo.",
    highlight_chips=build_chips([
        ("orange", "SEO, GEO y SEO local"),
        ("magenta", "Pauta digital con estrategia detrás"),
        ("blue", "Analítica que se traduce en decisiones"),
    ]),
    intro_h2="Datos y comportamiento convertidos en decisiones",
    intro_p="Insight Lab es el equipo detrás de todo lo que hace crecer a tu marca después del lanzamiento: SEO, GEO, pauta digital, CRO y analítica de datos. En lugar de reportes que nadie lee, entregamos decisiones claras: qué canal priorizar, qué mensaje funciona y qué ajustar para seguir creciendo.",
    service_cards=build_cards([
        ("../servicios/seo.html", "SEO", "Investigamos las palabras clave correctas y posicionamos tu sitio para que te encuentren cuando te buscan."),
        ("../servicios/seo-local.html", "SEO local & GBP", "Optimizamos tu perfil de Google Business y tu presencia local para que te encuentren cerca."),
        ("../servicios/geo-posicionamiento-ia.html", "GEO (posicionamiento en IA)", "Optimizamos tu marca para aparecer en las respuestas de ChatGPT, Google AI y otros buscadores con IA."),
        ("../servicios/cro-optimizacion-conversion.html", "CRO", "Maximizamos las conversiones de tu sitio con pruebas y optimización continua."),
        ("../servicios/pauta-digital.html", "Pauta digital", "Campañas en Meta, Google y TikTok con la segmentación de audiencia correcta detrás."),
        ("../servicios/posts-graficos-pauta.html", "Posts gráficos para pauta", "Piezas gráficas pensadas para detener el scroll y convertir en cada plataforma."),
        ("../servicios/analitica-de-datos.html", "Analítica de datos", "Dashboards claros que traducen tus datos en decisiones, sin depender de hojas de cálculo."),
        ("../servicios/configuracion-analitica-tracking.html", "Configuración de analítica", "GA4, Tag Manager y eventos de conversión — la base técnica sin la que no hay datos que analizar."),
        ("../servicios/consultoria-de-datos.html", "Consultoría de datos", "Te ayudamos a decidir qué medir y por qué, no solo a entregarte un dashboard."),
        ("../servicios/cursos-digitales.html", "Cursos digitales", "Talleres y cursos para que tu equipo maneje SEO, pauta digital y analítica por su cuenta."),
    ]),
    work_h2="Marcas que ya crecieron con Insight Lab",
    work_items=build_work_items([
        ("../design-system/hero-photos/aja-waffles-horizontal.webp", "Ajá Waffles — estrategia de marketing digital", "Ajá Waffles"),
        ("../design-system/hero-photos/pretty-pets-horizontal.webp", "Pretty Pets — estrategia y pauta digital", "Pretty Pets"),
        ("../design-system/hero-photos/geco-horizontal.webp", "Geco. — estrategia digital", "Geco."),
    ]),
    faq_html=build_faq([
        ("¿Qué es Insight Lab?",
         "Es el equipo de Workshop of Wonders enfocado en SEO, GEO, pauta digital, CRO y analítica de datos — todo lo que hace crecer a tu marca después de que el sitio o la tienda ya están construidos."),
        ("¿Necesito tener el sitio hecho por Workshop of Wonders para trabajar con Insight Lab?",
         "No, trabajamos SEO, pauta digital y analítica sobre sitios existentes, sean o no un proyecto nuestro."),
        ("¿Cuánto tiempo toma ver resultados de Insight Lab?",
         "Depende del servicio: la pauta digital puede mostrar resultados en semanas, mientras que el SEO orgánico suele mostrar los primeros movimientos entre 1 y 3 meses."),
        ("¿Cómo se conecta Insight Lab con Brand & Experience Lab?",
         "Insight Lab mide y hace crecer lo que Brand & Experience Lab construye — trabajan como un sistema integrado donde los datos de uno alimentan las decisiones del otro."),
    ], "insightLab"),
)
