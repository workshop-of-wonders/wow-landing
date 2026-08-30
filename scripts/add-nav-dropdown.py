import glob

OLD = '''  <nav class="nav-links">
    <a href="../servicios.html">Servicios</a>
    <a href="../index.html#labs">Labs</a>
    <a href="../index.html#trabajo">Trabajo</a>
    <a href="#contacto" class="btn btn-primary btn-sm" data-open-form>Hablemos de tu proyecto</a>
  </nav>'''

NEW = '''  <nav class="nav-links">
    <div class="nav-item">
      <a href="../servicios.html" class="nav-item-trigger"><span>Servicios</span> <span class="nav-item-caret">▾</span></a>
      <div class="nav-dropdown" id="navServicesDropdown">
        <div class="nav-dropdown-grid">
          <div class="nav-dropdown-col">
            <p class="nav-dropdown-cat"><span class="nav-dropdown-dot nav-dot-blue"></span>Brand &amp; Experience Lab</p>
            <a href="../servicios/diseno-web.html" class="nav-dropdown-link" title="Sitios web, landing pages y tiendas en línea con una estética que representa tu marca.">Diseño web</a>
            <a href="../servicios/uxui-design.html" class="nav-dropdown-link" title="Interfaces claras y experiencias de usuario pensadas de principio a fin.">UX/UI Design</a>
            <a href="../servicios/ecommerce.html" class="nav-dropdown-link" title="Tiendas en línea listas para vender, del catálogo al checkout.">E-commerce</a>
            <a href="../servicios/diseno-grafico.html" class="nav-dropdown-link" title="Piezas gráficas para redes, presentaciones y material digital, con la misma estética de tu sitio.">Diseño gráfico</a>
          </div>
          <div class="nav-dropdown-col">
            <p class="nav-dropdown-cat"><span class="nav-dropdown-dot nav-dot-orange"></span>SEO, SEM &amp; Analítica</p>
            <a href="../servicios/seo.html" class="nav-dropdown-link" title="Investigamos las palabras clave correctas y posicionamos tu sitio para que te encuentren cuando te buscan.">SEO</a>
            <a href="../servicios/seo-local.html" class="nav-dropdown-link" title="Optimizamos tu perfil de Google Business y tu presencia local para que te encuentren cerca.">SEO local &amp; Google Business Profile</a>
            <a href="../servicios/geo-posicionamiento-ia.html" class="nav-dropdown-link" title="Optimizamos tu marca para aparecer en las respuestas de ChatGPT, Google AI y otros buscadores con IA.">GEO (posicionamiento en IA)</a>
            <a href="../servicios/cro-optimizacion-conversion.html" class="nav-dropdown-link" title="Maximizamos las conversiones de tu sitio con pruebas y optimización continua.">CRO (Optimización de la Tasa de Conversión)</a>
            <a href="../servicios/pauta-digital.html" class="nav-dropdown-link" title="Pauta y campañas en Meta, Google y TikTok, con una estrategia detrás: la segmentación de audiencia correcta y mensajes coordinados para lanzar con fuerza.">Pauta digital</a>
            <a href="../servicios/posts-graficos-pauta.html" class="nav-dropdown-link" title="Convertimos tu inversión en pauta en piezas que sí detienen el scroll — sin depender de una agencia distinta para la parte creativa.">Creación de posts gráficos para pauta</a>
            <a href="../servicios/analitica-de-datos.html" class="nav-dropdown-link" title="Convertimos el tráfico de tu sitio en decisiones: qué está funcionando, qué no, y qué cambiar primero.">Análisis de métricas de sitios web</a>
            <a href="../servicios/analitica-de-datos.html" class="nav-dropdown-link" title="Dashboards claros que traducen tus datos en decisiones, sin depender de hojas de cálculo.">Reportería y dashboards</a>
            <a href="../servicios/configuracion-analitica-tracking.html" class="nav-dropdown-link" title="Configuramos GA4, Tag Manager y eventos de conversión — la base técnica sin la que no hay datos que analizar.">Configuración de analítica y tracking</a>
            <a href="../servicios/consultoria-de-datos.html" class="nav-dropdown-link" title="Te ayudamos a decidir qué medir y por qué, no solo a entregarte un dashboard.">Consultoría de datos</a>
            <a href="../servicios/cursos-digitales.html" class="nav-dropdown-link" title="Talleres y cursos para que tu equipo maneje SEO, pauta digital y analítica por su cuenta.">Cursos digitales</a>
          </div>
        </div>
        <a href="#contacto" class="nav-dropdown-cta" data-open-form>Hablemos de tu proyecto</a>
      </div>
    </div>
    <a href="../index.html#labs">Labs</a>
    <a href="../index.html#trabajo">Trabajo</a>
    <a href="../portafolio.html">Portafolio</a>
    <a href="#contacto" class="btn btn-primary btn-sm" data-open-form>Hablemos de tu proyecto</a>
  </nav>'''

files = glob.glob("servicios/*.html") + glob.glob("labs/*.html")
changed = 0
for f in files:
    s = open(f, encoding="utf-8").read()
    if OLD in s:
        s = s.replace(OLD, NEW)
        open(f, "w", encoding="utf-8").write(s)
        changed += 1
    else:
        print("NO MATCH:", f)
print("changed", changed, "of", len(files))
