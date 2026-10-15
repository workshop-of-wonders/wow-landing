"""Contenido de los artículos del blog (lo consume scripts/build-blog.py). Más reciente primero.

Cada post: slug, cat (una de CATS), title (<=60), desc (<=165), h1, lead, excerpt, read (min),
sections [(h2, [bloques html])], faqs [(pregunta, respuesta)], cta (html).
Sin cifras, precios ni resultados inventados.
"""
S = '../servicios/'

POSTS = [
    dict(
        slug='agencia-de-marketing-digital-para-medicos', cat='Marketing médico',
        title='Agencia de Marketing Digital para Médicos | WOW Blog',
        desc='Qué debe hacer una agencia de marketing digital para médicos y clínicas: sitio, SEO, contenido y pauta, qué evitar y cómo elegir bien.',
        h1='Agencia de marketing digital para médicos: qué debe hacer por ti',
        lead='Si eres médico o dueño de una clínica, tus pacientes te buscan en Google antes de llamarte. Esto es lo que una buena agencia debería resolver.',
        excerpt='Qué debe incluir el marketing digital para médicos y clínicas, qué evitar y qué preguntarle a una agencia antes de contratarla.',
        read=6,
        sections=[
            ('Por qué el marketing para médicos es distinto', [
                '<p>Un paciente no elige un especialista como elige un restaurante. Llega con dudas, a veces con miedo, y antes de agendar investiga: lee, compara, mira reseñas y busca información sobre su síntoma. Si tu consultorio no aparece en esa búsqueda, o si tu sitio no responde sus preguntas, la cita se pierde antes de empezar.</p>',
                '<p>Por eso una <strong>agencia de marketing digital para médicos</strong> no debería limitarse a publicar en redes. Tiene que entender cómo busca un paciente, qué necesita leer para confiar y qué se puede (y no se puede) decir en publicidad de salud.</p>']),
            ('Qué debe incluir el marketing digital para médicos', [
                '<ul><li><strong>Un sitio web claro:</strong> qué atiendes, quién eres, dónde y cómo agendar, en lenguaje sencillo. Mira cómo trabajamos el <a href="' + S + 'diseno-web.html">diseño web</a>.</li>'
                '<li><strong>SEO y contenido educativo:</strong> artículos que respondan las dudas reales de los pacientes y te posicionen en esas búsquedas. Más en <a href="' + S + 'seo.html">SEO</a>.</li>'
                '<li><strong>Google Business Profile:</strong> tu ficha en el mapa, con horarios, fotos y reseñas al día (<a href="' + S + 'seo-local.html">SEO local</a>).</li>'
                '<li><strong>Pauta digital responsable:</strong> campañas segmentadas por ciudad e interés, con mensajes informativos (<a href="' + S + 'pauta-digital.html">pauta digital</a>).</li>'
                '<li><strong>Medición:</strong> saber de dónde llegan los pacientes y qué canal genera más contactos.</li></ul>']),
            ('Lo que una agencia seria no debería hacer', [
                '<ul><li>Prometer curas, resultados clínicos o “antes y después” que las plataformas y la ética médica no permiten.</li>'
                '<li>Garantizar el primer lugar en Google: nadie controla el buscador.</li>'
                '<li>Usar información sensible de pacientes sin su consentimiento.</li>'
                '<li>Publicar contenido genérico que no está revisado por quien conoce la especialidad.</li></ul>']),
            ('Preguntas para hacerle a una agencia antes de contratarla', [
                '<ol><li>¿Han trabajado con clínicas o consultorios? ¿Puedo ver ejemplos?</li><li>¿Cómo cuidan el tono y las políticas de publicidad de salud?</li>'
                '<li>¿Qué me entregan cada mes y cómo mido el avance?</li><li>¿A nombre de quién quedan el sitio, el dominio y las cuentas?</li>'
                '<li>¿Quién revisa el contenido médico antes de publicarse?</li></ol>']),
            ('Cómo trabajamos en WOW con clínicas', [
                '<p>Hemos trabajado con la Clínica del Cerebro y el Centro del Sueño y Ronquido en Medellín: sitio web, contenido, SEO y pauta digital, con información clara antes que promesas. Puedes ver el detalle en nuestra página de <a href="' + S + 'marketing-medico-colombia.html">marketing médico</a>.</p>']),
        ],
        faqs=[
            ('¿Qué hace una agencia de marketing digital para médicos?', 'Construye o mejora el sitio web, posiciona al consultorio en Google, crea contenido educativo, gestiona la pauta y mide los resultados, cuidando el tono propio del sector salud.'),
            ('¿Es legal hacer publicidad médica en redes sociales?', 'Es posible, pero con límites: cada plataforma tiene políticas para salud y cada país normas sobre publicidad médica. Conviene evitar promesas de resultados y mensajes engañosos, y revisar la normativa aplicable a tu especialidad.'),
            ('¿Cuánto tarda en traer pacientes el marketing digital?', 'La pauta puede generar contactos desde las primeras semanas; el SEO suele mostrar sus primeros movimientos entre 1 y 3 meses. Depende de tu competencia y del estado de tu sitio.'),
        ],
        cta='¿Quieres atraer más pacientes con <em>información clara</em>? Cuéntanos tu consultorio.'),

    dict(
        slug='como-conseguir-pacientes-por-internet', cat='Marketing médico',
        title='Cómo Conseguir Pacientes por Internet | WOW Blog',
        desc='Pasos para que tu consultorio o clínica consiga pacientes por internet: Google, sitio web, reseñas, contenido y pauta, sin promesas milagrosas.',
        h1='Cómo conseguir pacientes por internet para tu consultorio',
        lead='No hay atajos, pero sí un orden que funciona: que te encuentren, que entiendan y que confíen. Estos son los pasos.',
        excerpt='Una ruta práctica para consultorios y clínicas: ficha de Google, sitio, contenido, reseñas y pauta, en el orden correcto.',
        read=6,
        sections=[
            ('1. Aparece en Google cuando te buscan cerca', [
                '<p>La mayoría de pacientes busca “especialista + ciudad” o “cerca de mí”. Tu primer paso es tener una ficha de <strong>Google Business Profile</strong> completa: categorías correctas, horarios, dirección, fotos y servicios. Es gratis y suele aportar más que cualquier anuncio al empezar. Lo trabajamos en nuestro servicio de <a href="' + S + 'seo-local.html">SEO local</a>.</p>']),
            ('2. Ten un sitio que resuelva dudas y facilite agendar', [
                '<p>Tu sitio debe decir en pocos segundos qué tratas, a quién, dónde y cómo agendar. Un botón de WhatsApp o un formulario visible en cada página reduce la fricción. Que cargue rápido en celular es indispensable: la mayoría de búsquedas de salud se hace desde el móvil. Más en <a href="' + S + 'diseno-web.html">diseño web</a>.</p>']),
            ('3. Publica contenido que responda lo que preguntan', [
                '<p>Haz una lista de las preguntas que más te hacen en consulta y conviértelas en artículos: síntomas, cuándo consultar, cómo se diagnostica, en qué consiste un tratamiento. Es la base del <a href="' + S + 'seo.html">SEO</a> en salud y construye confianza antes de la cita.</p>']),
            ('4. Cuida tus reseñas', [
                '<p>Las reseñas pesan mucho en la decisión. Pide a pacientes satisfechos que dejen la suya en tu ficha de Google y responde todas con respeto y sin revelar información clínica.</p>']),
            ('5. Usa pauta para acelerar, no para empezar', [
                '<p>La <a href="' + S + 'pauta-digital.html">pauta digital</a> en Meta o Google puede traer contactos rápido, pero rinde más cuando ya tienes sitio y ficha en orden. Segmenta por ciudad e interés y usa mensajes informativos.</p>']),
            ('6. Mide y ajusta', [
                '<p>Configura analítica para saber cuántos contactos llegan, por qué canal y cuáles se convierten en citas. Sin medición, es imposible mejorar.</p>']),
        ],
        faqs=[
            ('¿Cómo consigo pacientes sin gastar en publicidad?', 'Empieza por tu ficha de Google Business Profile, un sitio claro, contenido útil y reseñas. Son canales orgánicos que se construyen con constancia.'),
            ('¿Sirven las redes sociales para un consultorio?', 'Sí, sobre todo para educar y generar confianza con contenido útil. Funcionan mejor combinadas con Google y un sitio donde agendar.'),
            ('¿Cuánto tiempo tarda en verse resultado?', 'La pauta puede mostrar contactos en semanas; el posicionamiento orgánico suele tomar entre 1 y 3 meses para los primeros movimientos.'),
        ],
        cta='¿Quieres un plan para <em>conseguir más pacientes</em>? Escríbenos.'),

    dict(
        slug='que-es-pautar-en-redes-sociales', cat='Redes y pauta',
        title='Qué es Pautar en Redes Sociales y Cómo Hacerlo | WOW',
        desc='Qué significa pautar en redes sociales, cómo funciona la pauta en Instagram, Facebook y TikTok y cómo empezar una campaña sin gastar a ciegas.',
        h1='Qué es pautar en redes sociales y cómo hacerlo bien',
        lead='Pautar es pagar para que tu anuncio llegue a las personas correctas. Te explicamos cómo funciona y por dónde empezar.',
        excerpt='Qué es la pauta en redes sociales, qué objetivos puedes elegir, cuánto invertir para probar y los errores más comunes.',
        read=6,
        sections=[
            ('Qué significa pautar en redes sociales', [
                '<p><strong>Pautar</strong> es pagar a una plataforma (Meta, TikTok, Google) para que muestre tus anuncios a un público que tú defines. A diferencia de publicar de forma orgánica, controlas a quién llegas, cuánto inviertes y qué resultado buscas.</p>']),
            ('Cómo funciona una campaña', [
                '<ol><li><strong>Objetivo:</strong> mensajes, tráfico al sitio, leads o ventas.</li><li><strong>Audiencia:</strong> ubicación, edad, intereses o personas que ya te conocen.</li>'
                '<li><strong>Anuncio:</strong> imagen o video con un mensaje claro y una acción concreta.</li><li><strong>Presupuesto:</strong> diario o total, con una fase de prueba.</li>'
                '<li><strong>Medición:</strong> píxel, eventos y analítica para saber qué genera resultados.</li></ol>']),
            ('Errores comunes al pautar', [
                '<ul><li>Pautar sin un objetivo claro o sin tracking configurado.</li><li>Enviar el tráfico a una página que no convierte.</li>'
                '<li>Segmentar demasiado amplio, o demasiado estrecho.</li><li>Cambiar la campaña a los dos días, sin esperar a tener datos.</li>'
                '<li>Medir solo clics o “me gusta”, no contactos ni ventas.</li></ul>']),
            ('Cuánto invertir para empezar', [
                '<p>No hay una cifra universal. Lo razonable es empezar con un presupuesto de prueba suficiente para obtener datos útiles en las primeras semanas, y escalar lo que funcione. Define el monto según tu objetivo y tu mercado.</p>']),
            ('Pauta, orgánico y SEO: no son rivales', [
                '<p>La pauta trae tráfico rápido; el <a href="' + S + 'seo.html">SEO</a> construye visibilidad que dura; el contenido orgánico genera confianza. Funcionan mejor coordinados. Conoce cómo trabajamos la <a href="' + S + 'pauta-digital.html">pauta digital</a>.</p>']),
        ],
        faqs=[
            ('¿Qué es pautar en Instagram y Facebook?', 'Es crear anuncios en el administrador de anuncios de Meta para que se muestren a una audiencia específica en Instagram, Facebook o ambas.'),
            ('¿Es lo mismo promocionar una publicación que pautar?', 'No. Promocionar es una forma simple de pauta; el administrador de anuncios permite objetivos, audiencias y mediciones más precisos.'),
            ('¿Necesito un sitio web para pautar?', 'No siempre, pero ayuda mucho: un sitio o landing que convierta evita que pagues por visitas que no hacen nada.'),
        ],
        cta='¿Quieres pautar con <em>estrategia y medición</em>? Hablemos.'),

    dict(
        slug='como-elegir-agencia-de-marketing-digital-en-medellin', cat='Agencias y pymes',
        title='Cómo Elegir una Agencia de Marketing en Medellín | WOW',
        desc='Criterios para elegir una agencia de marketing digital en Medellín: servicios, casos reales, propuesta, medición y señales de alerta antes de firmar.',
        h1='Cómo elegir una agencia de marketing digital en Medellín',
        lead='En Medellín hay muchas agencias. Estos criterios te ayudan a comparar con cabeza fría y a evitar sorpresas.',
        excerpt='Checklist para comparar agencias de marketing digital en Medellín: qué pedir, qué preguntar y qué señales de alerta evitar.',
        read=6,
        sections=[
            ('1. Define primero qué necesitas', [
                '<p>No es lo mismo necesitar un sitio nuevo, aparecer en Google o lanzar campañas. Escribe tu objetivo (más contactos, más ventas, más reconocimiento) antes de pedir propuestas: así podrás compararlas con el mismo criterio.</p>']),
            ('2. Revisa casos reales, no solo promesas', [
                '<p>Pide ejemplos de clientes parecidos a ti y qué se hizo en cada uno. Desconfía de quien promete resultados exactos o el primer lugar en Google.</p>']),
            ('3. Compara alcances, no solo precios', [
                '<p>Dos propuestas con el mismo valor pueden incluir cosas muy distintas. Pregunta qué entregables hay, cuántas revisiones, qué plazo y qué pasa después del lanzamiento.</p>']),
            ('4. Exige medición', [
                '<p>Una agencia debe mostrarte qué funciona y qué no, con reportes claros. Pregunta qué indicadores seguirán y cada cuánto los verás.</p>']),
            ('5. Aclara la propiedad de lo que se crea', [
                '<p>El dominio, el sitio, las cuentas publicitarias y los accesos deben quedar a tu nombre.</p>']),
            ('6. Valora un equipo que conecte los servicios', [
                '<p>Si diseño web, SEO y pauta los hacen proveedores distintos, tú coordinas. Un solo equipo ahorra reprocesos. Así trabajamos en WOW: conoce nuestra página de <a href="' + S + 'agencia-marketing-digital-medellin.html">marketing digital en Medellín</a>.</p>']),
        ],
        faqs=[
            ('¿Cuánto cuesta una agencia de marketing digital en Medellín?', 'Depende del alcance: sitio, SEO, pauta o gestión continua. Pide propuestas con alcance y entregables claros para comparar.'),
            ('¿Es mejor una agencia grande o una boutique?', 'Depende de tu necesidad: una agencia boutique suele ofrecer trato más directo y flexibilidad; una grande, más estructura. Lo importante es que el equipo que te atiende tenga experiencia en tu tipo de negocio.'),
            ('¿Necesito una agencia en mi misma ciudad?', 'No necesariamente. Con videollamadas y herramientas colaborativas, el trabajo remoto funciona igual de bien.'),
        ],
        cta='¿Estás comparando agencias? <em>Cuéntanos tu proyecto</em> y te enviamos una propuesta.'),

    dict(
        slug='woocommerce-o-shopify-para-tu-tienda-en-colombia', cat='Diseño web y e-commerce',
        title='WooCommerce o Shopify para tu Tienda en Colombia | WOW',
        desc='Comparamos WooCommerce y Shopify para montar una tienda online en Colombia: costos recurrentes, pasarelas de pago, libertad y mantenimiento.',
        h1='WooCommerce o Shopify: cuál elegir para tu tienda en Colombia',
        lead='No hay una plataforma ganadora: hay la que mejor se ajusta a tu catálogo, tu equipo y tu presupuesto.',
        excerpt='Diferencias reales entre WooCommerce y Shopify para vender en Colombia: costos, pagos, flexibilidad y mantenimiento.',
        read=5,
        sections=[
            ('WooCommerce en resumen', [
                '<p>Es un plugin de WordPress que convierte tu sitio en tienda. Ofrece mucha libertad de diseño y funcionalidades, y la mayoría de pasarelas colombianas tienen su propio plugin. A cambio, tú (o tu agencia) te encargas de hosting, actualizaciones y seguridad.</p>']),
            ('Shopify en resumen', [
                '<p>Es una plataforma todo en uno: hosting, seguridad y herramientas de venta incluidos, con una cuota recurrente. Suele ser más rápida de lanzar y de mantener, con menos libertad en personalizaciones muy específicas. Valida antes qué pasarelas de pago están disponibles para tu caso.</p>']),
            ('Cómo decidir', [
                '<ul><li><strong>Catálogo grande o muy particular:</strong> WooCommerce ofrece más control.</li><li><strong>Quieres lanzar rápido y olvidarte del mantenimiento técnico:</strong> Shopify.</li>'
                '<li><strong>Costos recurrentes:</strong> compara cuotas de plataforma, apps o plugins, hosting y comisiones de pago.</li><li><strong>Equipo:</strong> ¿quién va a administrar la tienda día a día?</li>'
                '<li><strong>Pagos locales:</strong> revisa PSE, tarjetas y billeteras. Mira nuestra guía de <a href="' + S + 'pasarelas-de-pago-colombia.html">pasarelas de pago en Colombia</a>.</li></ul>']),
            ('Lo que importa más que la plataforma', [
                '<p>Una tienda vende por su experiencia: fotos y descripciones claras, checkout simple, velocidad y SEO. Conoce nuestro servicio de <a href="' + S + 'ecommerce.html">e-commerce</a>, donde trabajamos con Shopify y WordPress.</p>']),
        ],
        faqs=[
            ('¿Cuál es más barato, WooCommerce o Shopify?', 'Depende: WooCommerce evita la cuota de plataforma, pero tiene costos de hosting, plugins y mantenimiento; Shopify tiene cuota recurrente pero incluye infraestructura. Compara el costo total en 12 meses.'),
            ('¿Se puede cambiar de plataforma más adelante?', 'Sí, migrando catálogo, clientes y URLs con cuidado para no perder el SEO. Es más fácil decidir bien desde el inicio.'),
            ('¿Cuánto tarda en estar lista una tienda online?', 'Suele tomar entre 6 y 10 semanas, según el catálogo y las integraciones (inventario, envíos, facturación).'),
        ],
        cta='¿Vas a montar tu tienda? <em>Te ayudamos a elegir</em> y a lanzarla.'),

    dict(
        slug='agencia-de-marketing-digital-para-pymes', cat='Agencias y pymes',
        title='Marketing Digital para Pymes en Colombia: por Dónde Empezar',
        desc='Marketing digital para pymes en Colombia con presupuesto limitado: qué priorizar primero (sitio, Google, contenido, pauta) y qué dejar para después.',
        h1='Marketing digital para pymes: por dónde empezar con poco presupuesto',
        lead='Con recursos limitados, el orden importa más que el monto. Esto es lo que recomendamos priorizar.',
        excerpt='Qué priorizar si eres pyme y tienes presupuesto limitado: base web, Google, contenido y pauta, en ese orden.',
        read=5,
        sections=[
            ('Primero: una base sólida', [
                '<p>Antes de invertir en anuncios, asegúrate de tener un sitio claro que explique qué vendes y cómo contactarte, y una ficha de Google Business Profile completa. Sin esa base, cualquier inversión se diluye. Ver <a href="' + S + 'diseno-web.html">diseño web</a>.</p>']),
            ('Segundo: que te encuentren', [
                '<p>Trabaja las búsquedas que ya hacen tus clientes: páginas por servicio, contenido útil y SEO local si atiendes en una zona. Es una inversión que se acumula con el tiempo. Mira nuestro <a href="' + S + 'seo.html">servicio de SEO</a> y cuánto <a href="' + S + 'cuanto-cuesta-seo-colombia.html">cuesta el SEO</a>.</p>']),
            ('Tercero: pauta con objetivo y medición', [
                '<p>Cuando la base esté lista, usa <a href="' + S + 'pauta-digital.html">pauta digital</a> con un presupuesto de prueba y mide contactos reales, no solo clics.</p>']),
            ('Qué dejar para después', [
                '<ul><li>Presencia en muchas redes a la vez: elige la o las dos donde está tu cliente.</li><li>Herramientas complejas antes de tener tráfico.</li><li>Rediseños totales sin datos que los justifiquen.</li></ul>']),
            ('Contrata por resultados medibles', [
                '<p>Para una pyme, lo valioso es un equipo que conecte sitio, SEO, pauta y analítica y te muestre qué funciona. Antes de contratar, compara alcances y revisa <a href="' + S + 'cuanto-cuesta-pagina-web-colombia.html">cuánto cuesta una página web</a>.</p>']),
        ],
        faqs=[
            ('¿Cuánto debe invertir una pyme en marketing digital?', 'No hay un porcentaje universal. Lo recomendable es definir un objetivo, empezar con una fase de prueba y escalar lo que da resultados.'),
            ('¿Qué es lo primero que debe tener una pyme en digital?', 'Un sitio claro (o al menos una landing) y una ficha de Google Business Profile completa.'),
            ('¿Una pyme necesita una agencia?', 'Depende de tu tiempo y conocimiento. Una agencia ahorra tiempo y errores, sobre todo cuando varias áreas (web, SEO, pauta) deben coordinarse.'),
        ],
        cta='¿Eres pyme y quieres <em>empezar con orden</em>? Cuéntanos tu caso.'),
]
