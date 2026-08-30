import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from importlib.util import spec_from_file_location, module_from_spec

spec = spec_from_file_location("gen", os.path.join(os.path.dirname(__file__), "gen-service-page.py"))
gen = module_from_spec(spec)
spec.loader.exec_module(gen)

gen.write_page(
    "uxui-design",
    title="UX/UI Design: Experiencias Digitales Claras | Workshop of Wonders",
    description="Diseño de interfaces (UI) y experiencia de usuario (UX) pensadas de principio a fin, para que cada visitante entienda qué hacer y llegue sin fricciones a convertir.",
    canonical="https://efectowow.co/servicios/uxui-design.html",
    breadcrumb_name="UX/UI Design",
    service_name="UX/UI Design",
    service_type="Diseño de experiencia de usuario e interfaces",
    eyebrow="UX/UI DESIGN",
    h1="Interfaces claras, experiencias sin fricción",
    hero_sub="Diseñamos la experiencia de usuario y la interfaz de tu producto digital de principio a fin, para que cada visitante entienda qué hacer y llegue sin fricciones a convertir.",
    faq_topic="UX/UI Design",
    faq_prefix="uxuiFaq",
    faq_items=[
        ("¿Qué diferencia hay entre UX y UI?",
         "El UX (experiencia de usuario) es la estructura y el flujo: cómo se mueve alguien por tu producto y si logra su objetivo sin fricciones. El UI (interfaz) es la capa visual: color, tipografía, componentes. Trabajamos ambos juntos."),
        ("¿El UX/UI Design es un servicio aparte o va incluido en el diseño web?",
         "El UX/UI es parte del proceso de diseño web y e-commerce, pero también lo ofrecemos como servicio independiente para productos digitales, apps o rediseños de interfaz sin tocar el desarrollo completo."),
        ("¿Hacen investigación de usuarios antes de diseñar?",
         "Sí, entendemos a tu audiencia y tus objetivos de negocio antes de proponer flujos y pantallas, para que el diseño resuelva un problema real, no solo se vea bien."),
        ("¿Entregan prototipos navegables?",
         "Sí, trabajamos con prototipos interactivos que puedes probar y validar antes de pasar a desarrollo."),
    ],
    body="""  <section class="svc-service-detail">
    <h2>Diseño que se piensa en función de quien lo usa</h2>
    <p>Una interfaz bonita que confunde al usuario no cumple su función. Diseñamos cada pantalla partiendo de lo que la persona necesita lograr, y solo después resolvemos cómo se ve.</p>

    <h3>Qué incluye el servicio</h3>
    <h4>Investigación y arquitectura de la información</h4>
    <p>Entendemos tu audiencia, tus objetivos de negocio y organizamos el contenido y los flujos antes de diseñar ninguna pantalla.</p>

    <h4>Wireframes y prototipos</h4>
    <p>Estructuras de baja fidelidad para validar el flujo, seguidas de prototipos navegables de alta fidelidad para probar la experiencia real.</p>

    <h4>Diseño de interfaz (UI)</h4>
    <p>Sistema visual coherente: tipografía, color, componentes reutilizables y estados de interacción, alineados a tu marca.</p>

    <h3>Dónde aplica el UX/UI Design</h3>
    <ul>
      <li>Sitios web y landing pages nuevas o rediseños.</li>
      <li>Tiendas en línea, optimizando el flujo de compra.</li>
      <li>Productos y apps digitales.</li>
    </ul>
  </section>""",
)

gen.write_page(
    "diseno-grafico",
    title="Diseño Gráfico Digital: Piezas para Redes y Marca | Workshop of Wonders",
    description="Piezas gráficas para redes, presentaciones y material digital, con la misma estética de tu sitio y tu marca en todos los canales.",
    canonical="https://efectowow.co/servicios/diseno-grafico.html",
    breadcrumb_name="Diseño gráfico",
    service_name="Diseño gráfico digital",
    service_type="Diseño gráfico, piezas para redes sociales y presentaciones",
    eyebrow="DISEÑO GRÁFICO",
    h1="Diseño gráfico que mantiene tu marca consistente en todos los canales",
    hero_sub="Piezas gráficas para redes, presentaciones y material digital, con la misma estética de tu sitio web para que tu marca se vea igual en cualquier lugar donde aparezca.",
    faq_topic="diseño gráfico",
    faq_prefix="dgFaq",
    faq_items=[
        ("¿Qué tipo de piezas gráficas diseñan?",
         "Posts y carruseles para redes sociales, presentaciones corporativas, material para pauta digital, y piezas de apoyo para campañas o lanzamientos."),
        ("¿El diseño gráfico mantiene coherencia con mi sitio web?",
         "Sí, es justamente el objetivo: que cada pieza (red social, presentación, anuncio) se sienta parte de la misma marca que ve tu sitio web."),
        ("¿Pueden diseñar solo piezas puntuales, sin un proyecto grande?",
         "Sí, trabajamos tanto paquetes recurrentes de contenido para redes como piezas puntuales para una campaña o lanzamiento específico."),
        ("¿Incluye la definición de identidad de marca (logo, colores, tipografía)?",
         "Si tu marca aún no tiene una identidad definida, podemos construirla como parte del proyecto; si ya la tienes, diseñamos sobre esa base."),
    ],
    body="""  <section class="svc-service-detail">
    <h2>Una marca que se ve igual en cualquier canal</h2>
    <p>El diseño gráfico es el punto de contacto más frecuente entre tu marca y tu audiencia: cada post, cada presentación, cada pieza de pauta comunica quién eres. Lo diseñamos con la misma estética de tu sitio para que nunca se sienta desconectado.</p>

    <h3>Qué incluye el servicio</h3>
    <h4>Piezas para redes sociales</h4>
    <p>Posts, carruseles e historias diseñados para tu calendario de contenido, manteniendo consistencia visual entre publicaciones.</p>

    <h4>Presentaciones corporativas</h4>
    <p>Plantillas y presentaciones para propuestas comerciales, informes o pitches, con la identidad de tu marca aplicada de forma profesional.</p>

    <h4>Piezas para pauta digital</h4>
    <p>Gráficas pensadas para detener el scroll y convertir en Meta, Google y TikTok, coordinadas con la estrategia de cada campaña.</p>

    <h3>Por qué la consistencia visual importa</h3>
    <ul>
      <li>Genera reconocimiento de marca cuando alguien te ve en distintos canales.</li>
      <li>Transmite profesionalismo y confianza frente a marcas con identidad inconsistente.</li>
      <li>Facilita que cualquier pieza nueva (post, anuncio, presentación) se produzca más rápido, sobre un sistema visual ya definido.</li>
    </ul>
  </section>""",
)

gen.write_page(
    "seo-local",
    title="SEO Local y Google Business Profile | Workshop of Wonders",
    description="Optimizamos tu perfil de Google Business y tu presencia local para que te encuentren cuando buscan tu servicio cerca, en el mapa y en resultados locales de Google.",
    canonical="https://efectowow.co/servicios/seo-local.html",
    breadcrumb_name="SEO local",
    service_name="SEO local y Google Business Profile",
    service_type="SEO local, optimización de Google Business Profile",
    eyebrow="SEO LOCAL",
    h1="Que te encuentren cuando buscan tu servicio cerca",
    hero_sub="Optimizamos tu perfil de Google Business y tu presencia local para que aparezcas en el mapa y en los resultados de búsqueda de tu zona.",
    faq_topic="SEO local y Google Business Profile",
    faq_prefix="seolocalFaq",
    faq_items=[
        ("¿Qué negocios necesitan SEO local?",
         "Cualquier negocio con ubicación física o zona de servicio definida: clínicas, restaurantes, tiendas, oficinas profesionales — todo negocio donde 'cerca de mí' es una búsqueda relevante."),
        ("¿Qué incluye la optimización de Google Business Profile?",
         "Configuración completa del perfil (categorías, horarios, fotos, descripción), gestión de reseñas y publicaciones periódicas para mantenerlo activo ante Google."),
        ("¿El SEO local reemplaza al SEO general del sitio?",
         "No, lo complementa. El SEO local se enfoca en búsquedas con intención geográfica; el SEO general sigue trabajando el resto de las búsquedas relevantes para tu negocio."),
        ("¿Cuánto tiempo toma ver resultados en el mapa de Google?",
         "Suele ser más rápido que el SEO orgánico general: las primeras mejoras en el paquete local (mapa) de Google pueden verse en semanas, dependiendo de la competencia local."),
    ],
    body="""  <section class="svc-service-detail">
    <h2>El mapa de Google es el primer resultado que ve tu cliente local</h2>
    <p>Cuando alguien busca tu servicio "cerca de mí", Google prioriza el paquete de resultados locales antes que el resto de la lista. Si tu perfil no está optimizado, ese cliente potencial nunca te ve.</p>

    <h3>Qué incluye el servicio</h3>
    <h4>Optimización de Google Business Profile</h4>
    <p>Configuramos categorías, horarios, descripción, fotos y todos los campos que Google usa para decidir a quién mostrar en búsquedas locales.</p>

    <h4>Gestión de reseñas</h4>
    <p>Estrategia para conseguir reseñas reales y responder a las existentes, una de las señales más fuertes de confianza tanto para Google como para el usuario.</p>

    <h4>Consistencia de NAP (nombre, dirección, teléfono)</h4>
    <p>Verificamos que tu información aparezca igual en tu sitio, tu perfil de Google y directorios relevantes — la inconsistencia es una de las causas más comunes de mal posicionamiento local.</p>

    <h3>Con qué se complementa</h3>
    <ul>
      <li>SEO general del sitio, para búsquedas sin intención geográfica.</li>
      <li>Contenido local en el sitio (páginas o secciones por ciudad/zona, si aplica).</li>
      <li>Presencia en directorios relevantes de tu industria.</li>
    </ul>
  </section>""",
)

gen.write_page(
    "cro-optimizacion-conversion",
    title="CRO: Optimización de la Tasa de Conversión | Workshop of Wonders",
    description="Maximizamos las conversiones de tu sitio con pruebas y optimización continua: más leads o ventas con el mismo tráfico, sin depender solo de traer más visitantes.",
    canonical="https://efectowow.co/servicios/cro-optimizacion-conversion.html",
    breadcrumb_name="CRO",
    service_name="CRO (Optimización de la Tasa de Conversión)",
    service_type="CRO, optimización de conversión",
    eyebrow="CRO",
    h1="Más resultados con el tráfico que ya tienes",
    hero_sub="Maximizamos las conversiones de tu sitio con pruebas y optimización continua, para que cada visitante tenga más probabilidades de convertirse en lead o en cliente.",
    faq_topic="CRO y optimización de conversión",
    faq_prefix="croFaq",
    faq_items=[
        ("¿Qué es el CRO?",
         "CRO (Conversion Rate Optimization) es el proceso de analizar y mejorar tu sitio para que un porcentaje mayor de visitantes complete la acción que buscas: un formulario, una compra, una llamada."),
        ("¿El CRO requiere tráfico mínimo para funcionar?",
         "Sí, para hacer pruebas con resultados confiables (A/B testing) se necesita un volumen mínimo de tráfico; con menos tráfico trabajamos igual con optimización basada en comportamiento y buenas prácticas, sin pruebas estadísticas formales."),
        ("¿En qué se diferencia el CRO del SEO?",
         "El SEO trae más tráfico a tu sitio; el CRO hace que ese mismo tráfico convierta más. Son complementarios: de nada sirve traer más visitantes si el sitio no los convierte."),
        ("¿Qué necesitan medir antes de optimizar?",
         "Necesitamos analítica y tracking de conversión configurados correctamente (parte de nuestro servicio de analítica de datos) para saber qué está fallando antes de proponer cambios."),
    ],
    body="""  <section class="svc-service-detail">
    <h2>Convertir más con el tráfico que ya tienes</h2>
    <p>Traer tráfico a tu sitio es solo la mitad del trabajo. El CRO se enfoca en la otra mitad: qué pasa después de que alguien llega, y cómo hacer que más de esas personas completen la acción que te importa.</p>

    <h3>Qué incluye el servicio</h3>
    <h4>Análisis de comportamiento y puntos de fuga</h4>
    <p>Identificamos en qué punto del embudo los visitantes abandonan, apoyados en analítica y, cuando aplica, en mapas de calor y grabaciones de sesión.</p>

    <h4>Hipótesis y pruebas</h4>
    <p>Proponemos cambios concretos (copy, formularios, llamados a la acción, estructura de página) y los probamos de forma controlada cuando el volumen de tráfico lo permite.</p>

    <h4>Optimización continua</h4>
    <p>El CRO no es un ajuste único: es un ciclo de medir, proponer, probar y volver a medir.</p>

    <h3>Dónde suele haber más oportunidad</h3>
    <ul>
      <li>Formularios de contacto largos o poco claros.</li>
      <li>Checkout de e-commerce con pasos innecesarios.</li>
      <li>Landing pages de campañas de pauta digital con mensaje desalineado al anuncio.</li>
    </ul>
  </section>""",
)

gen.write_page(
    "posts-graficos-pauta",
    title="Creación de Posts Gráficos para Pauta Digital | Workshop of Wonders",
    description="Piezas gráficas pensadas para detener el scroll y convertir en cada plataforma de pauta: Meta, Google y TikTok Ads.",
    canonical="https://efectowow.co/servicios/posts-graficos-pauta.html",
    breadcrumb_name="Posts para pauta",
    service_name="Creación de posts gráficos para pauta digital",
    service_type="Diseño de creatividades publicitarias",
    eyebrow="CREATIVIDADES PARA PAUTA",
    h1="Piezas gráficas que detienen el scroll y convierten",
    hero_sub="Diseñamos las creatividades de cada campaña de pauta digital — el formato, el mensaje y el estilo cambian según la plataforma, pero siempre coordinados con tu estrategia.",
    faq_topic="creatividades para pauta digital",
    faq_prefix="postsFaq",
    faq_items=[
        ("¿Este servicio incluye la gestión de la campaña de pauta?",
         "Este servicio es específicamente el diseño de las piezas; la gestión y configuración de campañas está en nuestro servicio de pauta digital y SEM, y normalmente se contratan juntos."),
        ("¿Diseñan piezas para todas las plataformas de pauta?",
         "Sí, adaptamos formato y estilo a Meta Ads (Facebook e Instagram), Google Ads (display) y TikTok Ads, respetando los requisitos de cada plataforma."),
        ("¿Cómo deciden qué diseño va a funcionar mejor?",
         "Partimos del objetivo de la campaña y la audiencia definida en la estrategia de pauta, y usamos variaciones para identificar qué creatividad convierte mejor."),
        ("¿Pueden trabajar solo el diseño si ya tengo quien gestione la pauta?",
         "Sí, podemos entregar únicamente las piezas gráficas si tu equipo o agencia de medios ya gestiona la pauta."),
    ],
    body="""  <section class="svc-service-detail">
    <h2>El diseño decide si alguien se detiene o sigue haciendo scroll</h2>
    <p>En pauta digital, la pieza gráfica es lo primero que ve tu audiencia, antes que cualquier copy o landing page. Diseñamos cada creatividad para detener el scroll y comunicar el mensaje en segundos.</p>

    <h3>Qué incluye el servicio</h3>
    <h4>Diseño por plataforma</h4>
    <p>Formatos y estilos adaptados a Meta Ads, Google Ads y TikTok Ads, respetando las proporciones y buenas prácticas de cada una.</p>

    <h4>Variaciones para pruebas</h4>
    <p>Múltiples versiones de una misma pieza para identificar, junto con el equipo de pauta, cuál convierte mejor.</p>

    <h4>Coordinación con la estrategia de campaña</h4>
    <p>Cada pieza se diseña alineada al objetivo y la audiencia de la campaña, no como un elemento gráfico aislado.</p>

    <h3>Se complementa con</h3>
    <ul>
      <li><a href="pauta-digital.html">Pauta digital y SEM</a>: estrategia, segmentación y gestión de campañas.</li>
      <li><a href="diseno-grafico.html">Diseño gráfico</a>: identidad visual consistente en todos los canales.</li>
    </ul>
  </section>""",
)

gen.write_page(
    "configuracion-analitica-tracking",
    title="Configuración de Analítica y Tracking (GA4, Tag Manager) | Workshop of Wonders",
    description="Configuramos GA4, Google Tag Manager y eventos de conversión: la base técnica sin la que no hay datos confiables que analizar.",
    canonical="https://efectowow.co/servicios/configuracion-analitica-tracking.html",
    breadcrumb_name="Configuración de analítica",
    service_name="Configuración de analítica y tracking",
    service_type="Configuración de GA4, Google Tag Manager y eventos de conversión",
    eyebrow="CONFIGURACIÓN DE ANALÍTICA",
    h1="La base técnica sin la que no hay datos confiables",
    hero_sub="Configuramos Google Analytics 4, Google Tag Manager y los eventos de conversión específicos de tu sitio, para que cualquier decisión futura se apoye en datos reales.",
    faq_topic="configuración de analítica y tracking",
    faq_prefix="configFaq",
    faq_items=[
        ("¿Por qué necesito configurar bien GA4 y Tag Manager desde el inicio?",
         "Sin una configuración correcta, los datos que ves (tráfico, conversiones, comportamiento) pueden estar incompletos o ser directamente incorrectos, lo que lleva a decisiones equivocadas de SEO, pauta o producto."),
        ("¿Qué eventos de conversión configuran?",
         "Los específicos de tu negocio: envíos de formulario, clics en WhatsApp o llamada, compras, agregar al carrito, descargas — cualquier acción que consideres una conversión."),
        ("¿Esto reemplaza el servicio de analítica de datos?",
         "No, es la base técnica sobre la que se apoya. Una vez configurado el tracking, el servicio de analítica y reportería usa esos datos para generar dashboards y recomendaciones."),
        ("¿También configuran el consentimiento de cookies?",
         "Sí, incluimos la configuración de consentimiento necesaria para operar el tracking de forma correcta."),
    ],
    body="""  <section class="svc-service-detail">
    <h2>Sin tracking correcto, no hay datos en los que confiar</h2>
    <p>Antes de optimizar SEO, pauta digital o el sitio mismo, hay que saber medir bien. Configuramos la infraestructura de analítica desde cero o corregimos la que ya existe si está incompleta.</p>

    <h3>Qué incluye el servicio</h3>
    <h4>Google Analytics 4</h4>
    <p>Configuración de la propiedad, flujos de datos y métricas clave para tu negocio específico.</p>

    <h4>Google Tag Manager</h4>
    <p>Implementación de contenedores y etiquetas sin depender de tocar el código del sitio cada vez que se necesita medir algo nuevo.</p>

    <h4>Eventos de conversión</h4>
    <p>Definición y configuración de los eventos que realmente importan para tu negocio: formularios, compras, clics en contacto, descargas.</p>

    <h3>Qué se apoya en esta base</h3>
    <ul>
      <li><a href="analitica-de-datos.html">Analítica de datos y dashboards</a>: reportería basada en datos confiables.</li>
      <li><a href="cro-optimizacion-conversion.html">CRO</a>: identificar puntos de fuga reales en el embudo.</li>
      <li><a href="pauta-digital.html">Pauta digital</a>: medir qué campañas realmente generan resultados.</li>
    </ul>
  </section>""",
)

gen.write_page(
    "consultoria-de-datos",
    title="Consultoría de Datos: Qué Medir y Por Qué | Workshop of Wonders",
    description="Te ayudamos a decidir qué medir y por qué, alineando la analítica con los objetivos reales de tu negocio, no solo entregando un dashboard más.",
    canonical="https://efectowow.co/servicios/consultoria-de-datos.html",
    breadcrumb_name="Consultoría de datos",
    service_name="Consultoría de datos",
    service_type="Consultoría de analítica y datos de negocio",
    eyebrow="CONSULTORÍA DE DATOS",
    h1="Antes de medir más, hay que saber qué medir",
    hero_sub="Te ayudamos a decidir qué métricas importan para tu negocio y por qué, para que la analítica sirva de verdad a la toma de decisiones, no solo llene un dashboard.",
    faq_topic="consultoría de datos",
    faq_prefix="consultoriaFaq",
    faq_items=[
        ("¿En qué se diferencia de la configuración de analítica o los dashboards?",
         "La configuración de tracking y los dashboards son la parte técnica; la consultoría de datos es la capa de criterio: qué métricas importan para tus objetivos de negocio y cómo interpretarlas."),
        ("¿Para qué tipo de negocios tiene sentido esta consultoría?",
         "Para negocios que ya tienen datos (de sitio, ventas o pauta) pero no tienen claro qué priorizar, o que quieren definir una estrategia de medición antes de invertir en más herramientas."),
        ("¿Es un servicio puntual o continuo?",
         "Puede ser ambos: una consultoría inicial para definir qué medir y cómo, o un acompañamiento periódico que revisa datos y ajusta prioridades con el tiempo."),
        ("¿Incluye recomendaciones accionables, no solo análisis?",
         "Sí, el objetivo es que cada hallazgo se traduzca en una decisión concreta: qué canal priorizar, qué página optimizar, qué dejar de medir porque no aporta."),
    ],
    body="""  <section class="svc-service-detail">
    <h2>Los datos no sirven si nadie sabe qué decisión tomar con ellos</h2>
    <p>Muchos negocios tienen acceso a más datos de los que realmente usan. La consultoría de datos parte de tus objetivos de negocio, no de las métricas disponibles, para definir qué vale la pena medir y qué hacer con esa información.</p>

    <h3>Qué incluye el servicio</h3>
    <h4>Diagnóstico de la medición actual</h4>
    <p>Revisamos qué estás midiendo hoy, qué falta y qué sobra, comparado con tus objetivos reales de negocio.</p>

    <h4>Definición de métricas prioritarias</h4>
    <p>Establecemos un set claro de métricas clave (KPIs) alineadas a tu etapa de negocio, en lugar de intentar medir todo al mismo tiempo.</p>

    <h4>Recomendaciones accionables</h4>
    <p>Cada análisis se traduce en decisiones concretas: qué canal priorizar, qué optimizar, qué dejar de medir porque no aporta valor.</p>

    <h3>Se complementa con</h3>
    <ul>
      <li><a href="configuracion-analitica-tracking.html">Configuración de analítica y tracking</a>: la base técnica para medir bien.</li>
      <li><a href="analitica-de-datos.html">Analítica de datos y dashboards</a>: reportería continua sobre esas métricas.</li>
    </ul>
  </section>""",
)

gen.write_page(
    "cursos-digitales",
    title="Cursos Digitales de SEO, Pauta y Analítica | Workshop of Wonders",
    description="Talleres y cursos para que tu equipo maneje SEO, pauta digital y analítica de datos por su cuenta, con criterio propio.",
    canonical="https://efectowow.co/servicios/cursos-digitales.html",
    breadcrumb_name="Cursos digitales",
    service_name="Cursos digitales",
    service_type="Formación y talleres en marketing digital",
    eyebrow="CURSOS DIGITALES",
    h1="Formamos a tu equipo para que gane criterio propio",
    hero_sub="Talleres y cursos para que tu equipo maneje SEO, pauta digital y analítica de datos por su cuenta, y se mantenga al día con tendencias y cambios de algoritmo.",
    faq_topic="cursos digitales",
    faq_prefix="cursosFaq",
    faq_items=[
        ("¿Qué temas cubren los cursos digitales?",
         "SEO, pauta digital (Meta, Google, TikTok Ads) y analítica de datos (GA4, dashboards), adaptados al nivel y las herramientas que ya usa tu equipo."),
        ("¿Los cursos son para principiantes o para equipos con experiencia?",
         "Ajustamos el contenido según el punto de partida del equipo: desde fundamentos para quien empieza, hasta profundización en herramientas específicas para equipos con experiencia."),
        ("¿Se dictan de forma presencial o virtual?",
         "Trabajamos 100% remoto, así que los talleres se dictan por videollamada, con materiales y ejercicios prácticos."),
        ("¿Puedo contratar un curso puntual o solo consultoría continua sin taller formal?",
         "Ambas opciones existen: un taller estructurado con temario definido, o acompañamiento más informal según lo que tu equipo necesite."),
    ],
    body="""  <section class="svc-service-detail">
    <h2>Que tu equipo no dependa siempre de una agencia externa</h2>
    <p>Mantenerte actualizado en tendencias y algoritmos es clave para llevar tu marca al siguiente nivel. Formamos a tu equipo para que maneje SEO, pauta digital y analítica con criterio propio, sea que trabajen contigo de forma puntual o continua.</p>

    <h3>Qué incluyen los cursos</h3>
    <h4>SEO</h4>
    <p>Fundamentos de investigación de palabras clave, optimización on-page y cómo interpretar el rendimiento orgánico del sitio.</p>

    <h4>Pauta digital</h4>
    <p>Cómo configurar y leer campañas en Meta Ads, Google Ads y TikTok Ads, y qué métricas importan realmente para optimizar presupuesto.</p>

    <h4>Analítica de datos</h4>
    <p>Uso de GA4 y dashboards para tomar decisiones basadas en datos, sin depender de reportes externos para cada pregunta.</p>

    <h3>Para quién es este servicio</h3>
    <ul>
      <li>Equipos de marketing que quieren ganar independencia en herramientas que hoy delegan por completo.</li>
      <li>Negocios que empiezan a construir un equipo interno de marketing digital.</li>
      <li>Marcas que ya trabajan con nosotros en otros servicios y quieren entender mejor lo que se está haciendo.</li>
    </ul>
  </section>""",
)
