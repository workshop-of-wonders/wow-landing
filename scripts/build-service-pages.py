import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from importlib.util import spec_from_file_location, module_from_spec

spec = spec_from_file_location("gen", os.path.join(os.path.dirname(__file__), "gen-service-page.py"))
gen = module_from_spec(spec)
spec.loader.exec_module(gen)

gen.write_page(
    "diseno-web",
    title="Diseño Web y Desarrollo de Sitios | Workshop of Wonders",
    description="Diseño y desarrollo de sitios web, landing pages y tiendas en línea con UX/UI pensado para cargar rápido, verse increíble y convertir. Un solo equipo, de la estrategia al lanzamiento.",
    canonical="https://efectowow.co/servicios/diseno-web.html",
    breadcrumb_name="Diseño web",
    service_name="Diseño web y desarrollo de sitios",
    service_type="Diseño web, desarrollo web y UX/UI",
    eyebrow="DISEÑO WEB Y DESARROLLO",
    h1="Diseño web que representa tu marca y convierte visitantes en clientes",
    hero_sub="Diseñamos y desarrollamos sitios web, landing pages y tiendas en línea pensados para cargar rápido, verse increíbles y convertir — con un solo equipo de principio a fin.",
    faq_topic="diseño web",
    faq_prefix="dwFaq",
    faq_items=[
        ("¿Qué incluye un proyecto de diseño web con Workshop of Wonders?",
         "Investigación y estrategia, arquitectura de la información, diseño UX/UI, desarrollo del sitio, optimización de velocidad y SEO técnico básico, y acompañamiento en el lanzamiento."),
        ("¿Cuánto tiempo toma diseñar y desarrollar un sitio web?",
         "Un sitio institucional suele tomar entre 3 y 6 semanas; una tienda en línea (e-commerce), entre 6 y 10 semanas, dependiendo del alcance y el catálogo de productos."),
        ("¿El sitio queda optimizado para SEO desde el diseño?",
         "Sí. Estructuramos encabezados, metadatos, velocidad de carga y datos estructurados desde el desarrollo, para que el trabajo de SEO posterior parta de una base técnica sólida."),
        ("¿Pueden rediseñar un sitio que ya existe?",
         "Sí, trabajamos tanto proyectos desde cero como rediseños de sitios existentes, migrando el contenido y cuidando el SEO ya ganado."),
    ],
    body="""  <section class="svc-service-detail">
    <h2>Un sitio web que funciona como tu mejor vendedor</h2>
    <p>Un sitio web no es solo una tarjeta de presentación digital: es el espacio donde tu marca convence, responde preguntas y convierte visitantes en clientes. Diseñamos cada página pensando en dos personas al mismo tiempo — la que la visita y el buscador que la indexa.</p>

    <h3>Qué hacemos</h3>
    <h4>Diseño web y landing pages</h4>
    <p>Sitios institucionales, landing pages de campaña y sitios multipágina con una estética que representa tu marca, construidos sobre una arquitectura de información clara.</p>

    <h4>UX/UI Design</h4>
    <p>Interfaces claras y experiencias de usuario pensadas de principio a fin: del primer clic al formulario de contacto o al checkout.</p>

    <h4>E-commerce</h4>
    <p>Tiendas en línea listas para vender, del catálogo al checkout, con la pasarela de pagos, el inventario y la experiencia de compra resueltos.</p>

    <h4>Diseño gráfico digital</h4>
    <p>Piezas gráficas para redes, presentaciones y material digital, con la misma estética del sitio para que la marca se vea consistente en todos los canales.</p>

    <h3>Cómo trabajamos un proyecto de diseño web</h3>
    <ul>
      <li><strong>Observamos y aprendemos:</strong> entendemos tu marca, tu audiencia y tus objetivos antes de diseñar nada.</li>
      <li><strong>Definimos qué construir primero:</strong> priorizamos las páginas y funcionalidades que más impacto tienen.</li>
      <li><strong>Lo construimos y lo lanzamos:</strong> diseño, desarrollo y control de calidad antes de salir a producción.</li>
      <li><strong>Medimos y volvemos a empezar:</strong> revisamos analítica real para decidir qué optimizar después del lanzamiento.</li>
    </ul>
  </section>""",
)

gen.write_page(
    "seo",
    title="SEO y Posicionamiento en Buscadores | Workshop of Wonders",
    description="Investigamos las palabras clave correctas y posicionamos tu sitio en Google para que te encuentren cuando te buscan. SEO técnico, de contenido, local y GEO para respuestas de IA.",
    canonical="https://efectowow.co/servicios/seo.html",
    breadcrumb_name="SEO",
    service_name="SEO y posicionamiento en buscadores",
    service_type="SEO, SEO local y GEO",
    eyebrow="SEO Y POSICIONAMIENTO",
    h1="SEO que te posiciona donde tu cliente ya está buscando",
    hero_sub="Investigamos las palabras clave correctas, optimizamos tu sitio y tu presencia local, y posicionamos tu marca tanto en Google como en las respuestas de buscadores con inteligencia artificial.",
    faq_topic="SEO y posicionamiento",
    faq_prefix="seoFaq",
    faq_items=[
        ("¿Qué diferencia hay entre SEO y GEO?",
         "El SEO posiciona tu sitio en los resultados tradicionales de buscadores como Google. El GEO (Generative Engine Optimization) optimiza tu contenido para que herramientas de IA como ChatGPT, Perplexity o Google AI Overviews lo usen como fuente en sus respuestas."),
        ("¿Cuánto tiempo toma ver resultados de SEO?",
         "El SEO es una estrategia de mediano plazo: los primeros movimientos suelen verse entre 1 y 3 meses, con resultados más consolidados a partir del cuarto o sexto mes, dependiendo de la competencia de tu sector."),
        ("¿Trabajan SEO local para negocios con ubicación física?",
         "Sí. Optimizamos tu perfil de Google Business y tu presencia local para que aparezcas en búsquedas de tu zona y en el mapa de Google."),
        ("¿El SEO incluye la creación de contenido?",
         "Sí, la estrategia de contenido (blog, páginas de servicio, landing pages por intención de búsqueda) es parte central de cómo trabajamos SEO — no solo ajustes técnicos."),
    ],
    body="""  <section class="svc-service-detail">
    <h2>Posicionamiento que se mide en clientes, no solo en clics</h2>
    <p>Investigamos qué busca realmente tu audiencia, optimizamos tu sitio para que Google lo entienda y lo posicione, y construimos contenido que responde esas búsquedas — para que te encuentren en el momento exacto en que te necesitan.</p>

    <h3>Qué hacemos</h3>
    <h4>SEO técnico y de contenido</h4>
    <p>Investigación de palabras clave, optimización de velocidad y estructura del sitio, jerarquía de encabezados, metadatos y datos estructurados, y creación de contenido orientado a intención de búsqueda.</p>

    <h4>SEO local y Google Business Profile</h4>
    <p>Optimizamos tu perfil de Google Business y tu presencia local para que te encuentren cerca cuando buscan tu servicio en tu ciudad o zona.</p>

    <h4>GEO — posicionamiento en respuestas de IA</h4>
    <p>Optimizamos tu marca y tu contenido para aparecer citados en las respuestas de ChatGPT, Perplexity, Google AI Overviews y otros buscadores con inteligencia artificial, con contenido estructurado y verificable.</p>

    <h4>CRO — optimización de la tasa de conversión</h4>
    <p>De nada sirve traer tráfico si no convierte: probamos y optimizamos continuamente las páginas que reciben ese tráfico para maximizar los resultados.</p>

    <h3>Cómo medimos el progreso</h3>
    <ul>
      <li>Posiciones en buscadores para las palabras clave prioritarias de tu negocio.</li>
      <li>Tráfico orgánico y comportamiento en el sitio (configurado con GA4 y Tag Manager).</li>
      <li>Conversiones atribuibles a búsqueda orgánica: leads, formularios, ventas.</li>
      <li>Presencia en respuestas de motores de IA para tus temas clave.</li>
    </ul>
  </section>""",
)
