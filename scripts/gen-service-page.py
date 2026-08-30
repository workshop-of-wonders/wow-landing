#!/usr/bin/env python3
"""Genera páginas de servicio individuales en /servicios/ a partir de una plantilla común."""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

HEAD = """<!DOCTYPE html>
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
    {{ "@type": "ListItem", "position": 2, "name": "Servicios", "item": "https://efectowow.co/servicios.html" }},
    {{ "@type": "ListItem", "position": 3, "name": "{breadcrumb_name}", "item": "{canonical}" }}
  ]
}}
</script>
<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "{service_name}",
  "serviceType": "{service_type}",
  "provider": {{ "@type": "ProfessionalService", "name": "Workshop of Wonders", "url": "https://efectowow.co/" }},
  "areaServed": "Global",
  "url": "{canonical}",
  "description": "{description}"
}}
</script>
<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
{faq_jsonld}
  ]
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
    <a href="../index.html">Inicio</a> / <a href="../servicios.html">Servicios</a> / <span aria-current="page">{breadcrumb_name}</span>
  </nav>

  <section class="svc-hero">
    <p class="eyebrow">{eyebrow}</p>
    <h1 class="svc-hero-headline">{h1}</h1>
    <p class="svc-hero-sub">{hero_sub}</p>
    <div class="hero-cta">
      <a href="#contacto" class="btn btn-primary" data-open-form>Hablemos de tu proyecto</a>
      <a href="../portafolio.html" class="btn btn-outline">Ver nuestro trabajo</a>
    </div>
  </section>

{body}

  <section class="svc-faq" id="faq">
    <p class="eyebrow">PREGUNTAS FRECUENTES</p>
    <h2>Preguntas frecuentes sobre {faq_topic}</h2>
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

def faq_block(items, prefix):
    html_items = []
    jsonld_items = []
    for i, (q, a) in enumerate(items, 1):
        cid = f"{prefix}FaqA{i}"
        html_items.append(f'''      <div class="svc-faq-item">
        <h4 class="svc-faq-q-h"><button type="button" class="svc-faq-q" aria-expanded="false" aria-controls="{cid}"><span>{q}</span><span class="svc-faq-icon">+</span></button></h4>
        <div class="svc-faq-a" id="{cid}"><p>{a}</p></div>
      </div>''')
        jsonld_items.append(f'    {{ "@type": "Question", "name": "{q}", "acceptedAnswer": {{ "@type": "Answer", "text": "{a}" }} }}')
    return "\n".join(html_items), ",\n".join(jsonld_items)


def write_page(slug, **kw):
    faq_html, faq_jsonld = faq_block(kw.pop("faq_items"), kw.pop("faq_prefix"))
    html = HEAD.format(faq_html=faq_html, faq_jsonld=faq_jsonld, **kw)
    out = os.path.join(ROOT, "servicios", f"{slug}.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    print("wrote", out)
