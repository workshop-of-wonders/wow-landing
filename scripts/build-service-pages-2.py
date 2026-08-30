import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from importlib.util import spec_from_file_location, module_from_spec

spec = spec_from_file_location("gen", os.path.join(os.path.dirname(__file__), "gen-service-page.py"))
gen = module_from_spec(spec)
spec.loader.exec_module(gen)

gen.write_page(
    "ecommerce",
    title="Diseño y Desarrollo de Tiendas en Línea (E-commerce) | Workshop of Wonders",
    description="Diseñamos y desarrollamos tiendas en línea listas para vender: catálogo, pasarela de pagos, checkout e integración con inventario, optimizadas para SEO desde el desarrollo.",
    canonical="https://efectowow.co/servicios/ecommerce.html",
    breadcrumb_name="E-commerce",
    service_name="Diseño y desarrollo de e-commerce",
    service_type="E-commerce, tiendas en línea",
    eyebrow="E-COMMERCE",
    h1="Tiendas en línea listas para vender, del catálogo al checkout",
    hero_sub="Diseñamos y desarrollamos tu tienda en línea con la pasarela de pagos, el catálogo y el inventario resueltos, y una experiencia de compra pensada para convertir.",
    faq_topic="e-commerce y tiendas en línea",
    faq_prefix="ecomFaq",
    faq_items=[
        ("¿Qué plataformas de e-commerce utilizan?",
         "Elegimos la plataforma según el proyecto y el volumen de catálogo del cliente, priorizando velocidad de carga, facilidad de administración y buenas prácticas de SEO técnico."),
        ("¿El e-commerce incluye pasarela de pagos?",
         "Sí, integramos la pasarela de pagos que mejor se ajuste a tu país y tu negocio, junto con el flujo completo de checkout."),
        ("¿Cuánto tiempo toma desarrollar una tienda en línea?",
         "Entre 6 y 10 semanas, dependiendo del tamaño del catálogo, las integraciones necesarias (inventario, envíos, facturación) y el alcance del diseño."),
        ("¿También trabajan el SEO y la pauta digital de la tienda una vez lanzada?",
         "Sí. Podemos acompañar la tienda después del lanzamiento con SEO, pauta digital y analítica para llevar tráfico calificado y medir las ventas."),
    ],
    body="""  <section class="svc-service-detail">
    <h2>Una tienda en línea pensada para vender, no solo para existir</h2>
    <p>Una tienda en línea necesita más que un catálogo bonito: necesita cargar rápido, guiar al comprador sin fricciones y estar lista para el volumen de tu negocio. Diseñamos y desarrollamos cada tienda con ese objetivo desde el primer boceto.</p>

    <h3>Qué incluye el proyecto</h3>
    <h4>Catálogo y experiencia de compra</h4>
    <p>Estructura de categorías y fichas de producto claras, con una navegación pensada para que el comprador encuentre lo que busca en pocos clics.</p>

    <h4>Checkout y pagos</h4>
    <p>Integración de la pasarela de pagos adecuada para tu país y tu negocio, con un checkout simple que reduce el abandono de carrito.</p>

    <h4>Inventario e integraciones</h4>
    <p>Conexión con tu inventario, facturación y logística cuando el negocio lo requiere, para que la operación no dependa de procesos manuales.</p>

    <h4>Base técnica para SEO</h4>
    <p>Velocidad de carga, metadatos por producto y categoría, y datos estructurados de producto desde el desarrollo, para que las fichas puedan posicionar en buscadores.</p>

    <h3>Después del lanzamiento</h3>
    <ul>
      <li>SEO de producto y categoría para atraer tráfico calificado.</li>
      <li>Pauta digital en Meta, Google y TikTok para acelerar las ventas.</li>
      <li>Analítica de e-commerce (conversión, ticket promedio, abandono de carrito) para decidir qué optimizar.</li>
    </ul>
  </section>""",
)

gen.write_page(
    "pauta-digital",
    title="Pauta Digital y SEM (Meta, Google, TikTok) | Workshop of Wonders",
    description="Campañas de pauta digital en Meta, Google y TikTok con estrategia de segmentación, mensajes coordinados y piezas gráficas propias para cada plataforma.",
    canonical="https://efectowow.co/servicios/pauta-digital.html",
    breadcrumb_name="Pauta digital",
    service_name="Pauta digital y SEM",
    service_type="SEM, pauta digital, publicidad en Meta, Google y TikTok",
    eyebrow="PAUTA DIGITAL Y SEM",
    h1="Pauta digital con estrategia detrás, no solo presupuesto",
    hero_sub="Campañas en Meta, Google y TikTok con la segmentación de audiencia correcta, mensajes coordinados y piezas gráficas propias para cada plataforma.",
    faq_topic="pauta digital y SEM",
    faq_prefix="pautaFaq",
    faq_items=[
        ("¿En qué plataformas de pauta trabajan?",
         "Meta Ads (Facebook e Instagram), Google Ads y TikTok Ads, eligiendo la combinación de plataformas según dónde esté tu audiencia."),
        ("¿Necesito un presupuesto mínimo de pauta para empezar?",
         "El presupuesto de pauta se define según tu objetivo y tu mercado; te ayudamos a definir un monto realista para obtener datos útiles desde las primeras semanas."),
        ("¿Incluyen el diseño de las piezas gráficas para las campañas?",
         "Sí, creamos los posts y piezas gráficas pensadas para detener el scroll y convertir en cada plataforma, coordinadas con el mensaje de la campaña."),
        ("¿Cómo miden el resultado de una campaña de pauta?",
         "Con la analítica y el tracking de conversiones configurado desde el inicio (GA4, píxeles y eventos), para saber qué campañas generan leads o ventas reales, no solo clics."),
    ],
    body="""  <section class="svc-service-detail">
    <h2>Pauta digital con una estrategia detrás</h2>
    <p>Pautar sin estrategia es gastar presupuesto a ciegas. Antes de lanzar una campaña definimos a quién le hablamos, qué le decimos y cómo vamos a medir si funcionó.</p>

    <h3>Qué incluye el servicio</h3>
    <h4>Estrategia y segmentación de audiencia</h4>
    <p>Definimos la audiencia correcta para cada campaña y el mensaje que le corresponde, en lugar de replicar el mismo anuncio para todo el mundo.</p>

    <h4>Configuración y gestión de campañas</h4>
    <p>Configuración de campañas en Meta Ads, Google Ads y TikTok Ads, con optimización continua según los resultados que va entregando cada plataforma.</p>

    <h4>Creación de piezas gráficas para pauta</h4>
    <p>Piezas gráficas pensadas para detener el scroll y convertir en cada plataforma, coordinadas con el mensaje y el momento de la campaña.</p>

    <h4>Medición y optimización</h4>
    <p>Seguimiento de métricas de conversión (no solo alcance o clics) para decidir qué campañas escalar y cuáles pausar.</p>

    <h3>Cuándo tiene sentido pautar</h3>
    <ul>
      <li>Para lanzamientos de producto o campaña que necesitan resultados en semanas, no meses.</li>
      <li>Como complemento del SEO, mientras el posicionamiento orgánico madura.</li>
      <li>Para remarketing a visitantes que ya conocieron tu sitio pero no convirtieron.</li>
    </ul>
  </section>""",
)

gen.write_page(
    "analitica-de-datos",
    title="Analítica de Datos, Reportería y Dashboards | Workshop of Wonders",
    description="Configuramos GA4, Tag Manager y eventos de conversión, y traducimos el comportamiento de tu audiencia en dashboards y decisiones claras.",
    canonical="https://efectowow.co/servicios/analitica-de-datos.html",
    breadcrumb_name="Analítica y datos",
    service_name="Analítica de datos, reportería y dashboards",
    service_type="Analítica web, configuración de tracking, reportería",
    eyebrow="ANALÍTICA Y DATOS",
    h1="Datos que se traducen en decisiones, no en hojas de cálculo",
    hero_sub="Configuramos GA4, Tag Manager y eventos de conversión, y construimos dashboards claros que te dicen qué está funcionando y qué cambiar.",
    faq_topic="analítica de datos",
    faq_prefix="analiticaFaq",
    faq_items=[
        ("¿Qué incluye la configuración de analítica y tracking?",
         "Configuración de Google Analytics 4, Google Tag Manager y los eventos de conversión específicos de tu sitio (formularios, compras, clics en WhatsApp, etc.), la base técnica sin la que no hay datos confiables que analizar."),
        ("¿Puedo tener un dashboard sin depender de hojas de cálculo?",
         "Sí, construimos dashboards que centralizan tus métricas clave en un solo lugar, actualizados automáticamente."),
        ("¿La analítica sirve solo para SEO y pauta digital?",
         "No, también sirve para entender comportamiento de usuario en el sitio, identificar puntos de fuga en el embudo de conversión y priorizar qué optimizar primero."),
        ("¿Ofrecen consultoría si ya tenemos datos pero no sabemos qué medir?",
         "Sí, te ayudamos a decidir qué medir y por qué, no solo a entregarte un dashboard más."),
    ],
    body="""  <section class="svc-service-detail">
    <h2>Los datos no mienten, pero hay que saber leerlos</h2>
    <p>Medimos, analizamos y traducimos el comportamiento de tu audiencia en decisiones claras. Sin la base técnica correcta, cualquier estrategia de SEO, pauta digital o diseño web se decide a ciegas.</p>

    <h3>Qué incluye el servicio</h3>
    <h4>Configuración de analítica y tracking</h4>
    <p>GA4, Google Tag Manager y eventos de conversión configurados para tu sitio específico — la base sin la que no hay datos que analizar.</p>

    <h4>Análisis de métricas del sitio</h4>
    <p>Analizamos el tráfico y el comportamiento en tu sitio para encontrar oportunidades de mejora: qué páginas retienen, cuáles pierden visitantes y por qué.</p>

    <h4>Reportería y dashboards</h4>
    <p>Dashboards claros que traducen tus datos en decisiones, sin depender de hojas de cálculo interminables ni de revisar varias plataformas por separado.</p>

    <h4>Consultoría de datos</h4>
    <p>Te ayudamos a decidir qué medir y por qué, alineando la analítica con los objetivos reales del negocio.</p>

    <h3>Por qué configurar bien la analítica desde el inicio</h3>
    <ul>
      <li>Sin tracking de conversión, es imposible saber qué canal (SEO, pauta, redes) realmente genera resultados.</li>
      <li>Los dashboards ahorran tiempo de reportería manual y facilitan decisiones rápidas.</li>
      <li>Una buena base de datos hace más efectivo cada peso invertido en SEO o pauta digital.</li>
    </ul>
  </section>""",
)

gen.write_page(
    "geo-posicionamiento-ia",
    title="GEO: Posicionamiento en Respuestas de IA (ChatGPT, Google AI) | Workshop of Wonders",
    description="Optimizamos tu marca y tu contenido para aparecer citados en las respuestas de ChatGPT, Perplexity, Google AI Overviews y otros buscadores con inteligencia artificial.",
    canonical="https://efectowow.co/servicios/geo-posicionamiento-ia.html",
    breadcrumb_name="GEO",
    service_name="GEO (Generative Engine Optimization)",
    service_type="GEO, posicionamiento en motores de IA generativa",
    eyebrow="GEO — POSICIONAMIENTO EN IA",
    h1="Que tu marca aparezca cuando la IA responde",
    hero_sub="Optimizamos tu marca y tu contenido para aparecer citados en las respuestas de ChatGPT, Perplexity, Google AI Overviews y otros buscadores con inteligencia artificial.",
    faq_topic="GEO y posicionamiento en IA",
    faq_prefix="geoFaq",
    faq_items=[
        ("¿Qué es el GEO (Generative Engine Optimization)?",
         "Es la optimización de contenido y presencia de marca para que los motores de IA generativa (ChatGPT, Perplexity, Google AI Overviews) usen tu sitio como fuente al responder preguntas de tus clientes potenciales."),
        ("¿El GEO reemplaza al SEO tradicional?",
         "No, lo complementa. El SEO sigue siendo la base técnica y de contenido; el GEO añade formato y señales adicionales (respuestas claras, datos estructurados, autoridad de marca) para que ese mismo contenido también sea citable por IA."),
        ("¿Cómo se mide si una marca está apareciendo en respuestas de IA?",
         "Con revisión manual periódica de las preguntas clave del negocio en distintas herramientas de IA, y con herramientas especializadas de monitoreo de menciones en IA cuando el proyecto lo justifica."),
        ("¿Qué tipo de contenido funciona mejor para GEO?",
         "Contenido en formato pregunta-respuesta directo, definiciones claras, listas y datos verificables — el mismo tipo de estructura que ya usamos en nuestras páginas de servicio y FAQ."),
    ],
    body="""  <section class="svc-service-detail">
    <h2>Las respuestas de IA son el nuevo resultado #1 de búsqueda</h2>
    <p>Cada vez más personas preguntan directamente a ChatGPT, Perplexity o al resumen de IA de Google en lugar de hacer clic en varios resultados. Si tu marca no aparece citada en esas respuestas, es invisible para esa parte creciente de tu audiencia.</p>

    <h3>Cómo trabajamos el GEO</h3>
    <h4>Contenido citable</h4>
    <p>Estructuramos el contenido en formato pregunta-respuesta, con definiciones claras, datos y listas — el formato que los motores de IA extraen con más facilidad para construir sus respuestas.</p>

    <h4>Datos estructurados</h4>
    <p>Implementamos <code>schema.org</code> (Organization, Service, FAQPage) para darle a los motores de IA señales explícitas sobre quién eres y qué ofreces.</p>

    <h4>Autoridad de marca (E-E-A-T)</h4>
    <p>Reforzamos las señales de experiencia y confianza que tanto Google como los modelos de IA usan para decidir qué fuentes citar: información de autor, consistencia de marca y presencia externa (Google Business Profile, directorios, redes).</p>

    <h4>llms.txt y accesibilidad para crawlers de IA</h4>
    <p>Mantenemos un archivo <code>llms.txt</code> actualizado que describe el sitio para los crawlers de motores de IA, complementando al <code>robots.txt</code> y al sitemap tradicional.</p>

    <h3>Qué gana tu marca con GEO</h3>
    <ul>
      <li>Visibilidad en respuestas de ChatGPT, Perplexity y Google AI Overviews para las preguntas que tu cliente potencial ya hace.</li>
      <li>Contenido reutilizable: lo que optimizamos para GEO también fortalece el SEO tradicional.</li>
      <li>Una ventaja temprana frente a competidores que todavía no optimizan para este canal.</li>
    </ul>
  </section>""",
)
