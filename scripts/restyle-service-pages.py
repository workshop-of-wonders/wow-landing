import re, glob

WORK_ITEMS = {
    "brand": [
        ("../design-system/hero-photos/lamparas-milan-horizontal.webp", "Lámparas Milán — rebranding y diseño web", "Lámparas Milán"),
        ("../design-system/hero-photos/orbit-horizontal.webp", "Orbit — identidad de marca desde cero", "Orbit"),
        ("../design-system/hero-photos/tin-t-horizontal.webp", "Tin-T! — desarrollo de marca", "Tin-T!"),
    ],
    "insight": [
        ("../design-system/hero-photos/aja-waffles-horizontal.webp", "Ajá Waffles — estrategia de marketing digital", "Ajá Waffles"),
        ("../design-system/hero-photos/pretty-pets-horizontal.webp", "Pretty Pets — estrategia y pauta digital", "Pretty Pets"),
        ("../design-system/hero-photos/geco-horizontal.webp", "Geco. — estrategia digital", "Geco."),
    ],
}

LAB = {
    "uxui-design.html": "brand", "ecommerce.html": "brand", "diseno-grafico.html": "brand",
    "seo.html": "insight", "seo-local.html": "insight", "geo-posicionamiento-ia.html": "insight",
    "cro-optimizacion-conversion.html": "insight", "pauta-digital.html": "insight",
    "posts-graficos-pauta.html": "insight", "analitica-de-datos.html": "insight",
    "configuracion-analitica-tracking.html": "insight", "consultoria-de-datos.html": "insight",
    "cursos-digitales.html": "insight",
}
LAB_LABEL = {
    "brand": ("BRAND &amp; EXPERIENCE LAB", "../labs/brand-experience-lab.html", "nav-dot-magenta"),
    "insight": ("INSIGHT LAB", "../labs/insight-lab.html", "nav-dot-orange"),
}
LAB_DOT_COLOR = {"brand": "magenta", "insight": "orange"}
OUTLINE_COLORS = ["outline-magenta", "outline-orange", "outline-blue"]

STEPS_HTML = '''      <ol class="svc-steps">
        <li><span class="svc-step-num">1</span><p><strong>Observamos y aprendemos:</strong> entendemos tu marca, tu audiencia y tus objetivos antes de empezar.</p></li>
        <li><span class="svc-step-num">2</span><p><strong>Definimos qué construir primero:</strong> priorizamos lo que más impacto tiene para tu proyecto.</p></li>
        <li><span class="svc-step-num">3</span><p><strong>Lo construimos y lo lanzamos:</strong> ejecución y control de calidad antes de salir a producción.</p></li>
        <li><span class="svc-step-num">4</span><p><strong>Medimos y volvemos a empezar:</strong> revisamos resultados reales para decidir qué optimizar después.</p></li>
      </ol>'''


def build_work_items(lab):
    out = []
    for img, alt, title in WORK_ITEMS[lab]:
        out.append(f'''        <div class="svc-work-teaser-item">
          <img src="{img}" alt="{alt}" loading="lazy">
          <span>{title}</span>
        </div>''')
    return "\n".join(out)


def process(path):
    s = open(path, encoding="utf-8").read()
    fname = path.split("/")[-1]
    lab = LAB[fname]
    lab_text, lab_href, lab_dot = LAB_LABEL[lab]

    # --- extract hero pieces ---
    m = re.search(r'<section class="svc-hero">\s*<p class="eyebrow">([^<]*)</p>\s*'
                  r'<h1 class="svc-hero-headline">(.*?)</h1>\s*'
                  r'<p class="svc-hero-sub">(.*?)</p>\s*'
                  r'<div class="hero-cta">\s*(<a href="#contacto"[^>]*>[^<]*</a>)\s*</div>\s*</section>', s, re.S)
    assert m, "hero not found in " + path
    h1_text, sub_text, cta_html = m.group(2), m.group(3), m.group(4)

    breadcrumb_name_m = re.search(r'<span aria-current="page">([^<]*)</span>', s)
    breadcrumb_name = breadcrumb_name_m.group(1) if breadcrumb_name_m else ""

    # --- extract svc-service-detail ---
    detail_m = re.search(r'<section class="svc-service-detail">(.*?)</section>', s, re.S)
    assert detail_m, "detail not found in " + path
    detail = detail_m.group(1)

    intro_h2_m = re.search(r'<h2>(.*?)</h2>\s*<p>(.*?)</p>', detail, re.S)
    assert intro_h2_m, "intro not found in " + path
    intro_h2, intro_p = intro_h2_m.group(1), intro_h2_m.group(2)

    cards = re.findall(r'<h4>(.*?)</h4>\s*<p>(.*?)</p>', detail, re.S)
    # cards[0] is the intro pair too (matched above) since same pattern; drop the first if it equals intro
    cards = [c for c in cards if c[0] != intro_h2]

    # second h3 + ul block (kept as a plain bullet list under the cards).
    # [^<]* (not .*?) keeps this from backtracking across the FIRST h3 (the
    # "Qué hacemos" one, already consumed into `cards` above) when that h3's
    # immediate neighbor isn't a <ul> — a plain .*? group would swallow the
    # whole h4/p block plus the next <h3> looking for a </h3><ul> pair,
    # duplicating "Qué hacemos" and its cards as raw text in the output.
    ul_m = re.search(r'<h3>([^<]*)</h3>\s*<ul>(.*?)</ul>\s*$', detail, re.S)
    extra_h3, extra_ul = (ul_m.group(1), ul_m.group(2)) if ul_m else (None, None)

    cards_html = "\n".join(
        f'''        <div class="svc-card">
          <h4>{h}</h4>
          <p>{p}</p>
        </div>''' for h, p in cards
    )

    extra_html = ""
    if extra_h3:
        extra_html = f'''
      <h3>{extra_h3}</h3>
      <ul class="svc-plain-list">{extra_ul}</ul>'''

    # --- extract FAQ ---
    faq_section_m = re.search(r'<section class="svc-faq" id="faq">\s*<p class="eyebrow">PREGUNTAS FRECUENTES</p>\s*'
                              r'<h2>(.*?)</h2>\s*<div class="svc-faq-list">(.*?)</div>\s*</section>', s, re.S)
    assert faq_section_m, "faq not found in " + path
    faq_h2, faq_items_html = faq_section_m.group(1), faq_section_m.group(2)

    work_items_html = build_work_items(lab)

    new_main = f'''<main id="top">
  <section class="svc-hero svc-hero--tight svc-hero--purple">
    <p class="eyebrow"><a href="{lab_href}"><span class="svc-jump-dot {lab_dot}"></span> {lab_text}</a></p>
    <h1 class="svc-hero-headline">{h1_text}</h1>
    <p class="svc-hero-sub">{sub_text}</p>
    <div class="hero-cta">
      {cta_html}
    </div>
  </section>

  <section class="svc-block svc-block-white" id="que-es">
    <span class="outline-word outline-magenta" aria-hidden="true">SERVICIO</span>
    <div class="svc-block-inner">
      <p class="svc-block-eyebrow">QUÉ ES</p>
      <h2>{intro_h2}</h2>
      <p>{intro_p}</p>
    </div>
  </section>

  <section class="svc-block svc-block-cloud" id="que-hacemos">
    <span class="outline-word outline-orange" aria-hidden="true">OFERTA</span>
    <div class="svc-block-inner">
      <p class="svc-block-eyebrow">QUÉ HACEMOS</p>
      <h2>Todo lo que incluye este servicio</h2>
      <div class="svc-includes-grid">
{cards_html}
      </div>{extra_html}
    </div>
  </section>

  <section class="svc-block svc-block-white" id="como-trabajamos">
    <span class="outline-word outline-blue" aria-hidden="true">PROCESO</span>
    <div class="svc-block-inner">
      <p class="svc-block-eyebrow">CÓMO TRABAJAMOS</p>
      <h2>Cómo trabajamos este servicio</h2>
{STEPS_HTML}
    </div>
  </section>

  <section class="svc-block svc-block-cloud" id="trabajo-real">
    <span class="outline-word outline-orange" aria-hidden="true">TRABAJO</span>
    <div class="svc-block-inner">
      <p class="svc-block-eyebrow">TRABAJO REAL</p>
      <h2>Marcas con las que ya trabajamos</h2>
      <div class="svc-work-teaser-grid">
{work_items_html}
      </div>
    </div>
  </section>

  <section class="svc-block svc-block-white svc-block-center" id="faq">
    <span class="outline-word outline-magenta" aria-hidden="true">FAQ</span>
    <div class="svc-block-inner">
      <p class="svc-block-eyebrow">PREGUNTAS FRECUENTES</p>
      <h2>{faq_h2}</h2>
      <div class="svc-faq-list">{faq_items_html}</div>
    </div>
  </section>
</main>'''

    old_main_m = re.search(r'<main id="top">.*?</main>', s, re.S)
    assert old_main_m, "main not found in " + path
    s = s[:old_main_m.start()] + new_main + s[old_main_m.end():]

    open(path, "w", encoding="utf-8").write(s)
    print("restyled", path)


for f in sorted(LAB.keys()):
    process("servicios/" + f)
