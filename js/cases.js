/* Casos de estudio que aparecen dentro del popup de cada proyecto
   (home y portafolio). Se editan a mano aquí, no desde /admin.

   Para agregar un caso: copia un bloque, cambia la clave por el nombre
   EXACTO del proyecto (el mismo data-title de su card) y llena los campos.
   Un campo vacío ('') no se muestra. Las cards con caso muestran la
   etiqueta "Ver caso".

   capacidades: las etiquetas del popup, agrupadas por Lab (mismo formato
   para todas las marcas). Reemplazan a data-capabilities del HTML.

   OJO — BORRADOR (2026-09-25): titulo, reto, insight, construimos y
   aprendizaje son una redacción propuesta a partir de la descripción real
   de cada proyecto, a pedido de la dueña. Pueden incluir detalles que no
   pasaron así: revisarlos con lo que realmente se hizo ANTES de abrir el
   sitio al público. resultado queda vacío hasta tener datos reales —
   nunca cifras, resultados ni frases de clientes inventadas. */
window.WOW_CASES = {

  'Lámparas Milán': {
    titulo: 'Le cambiamos la luz, no la esencia.',
    reto: 'Lámparas Milán ya tenía clientes y una marca reconocida, pero su imagen necesitaba ponerse al día y su presencia digital tenía que empezar a trabajar para vender. El reto: modernizarla sin perder lo que la hacía reconocible.',
    insight: 'Sus clientes no compran solo una lámpara: compran cómo se va a ver su casa. La marca tenía que mostrar espacios, no solo productos.',
    construimos: 'Un refresh de marca que conserva su esencia con una imagen más actual; un sitio web donde los productos se ven en ambientes reales; y una estrategia de SEO y pauta digital para llegar a quienes están decorando o remodelando su hogar.',
    resultado: '',
    aprendizaje: 'Renovar no es empezar de cero: lo que la gente ya reconoce de una marca es un activo que hay que cuidar.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Rebranding', 'Diseño web', 'Desarrollo web'],
      'CRECE - Insight Lab': ['Estrategia de marketing digital', 'Pauta digital', 'SEO']
    }
  },

  'Ajá Waffles': {
    titulo: '¿Waffles de yuca? ¡Ajá, eso!',
    reto: 'Ajá Waffles es un emprendimiento gastronómico nuevo con un diferencial claro: waffles a base de yuca. Sin marca ni presencia digital todavía, competía por atención frente a cafeterías ya conocidas.',
    insight: 'Su público no buscaba una cafetería más: buscaba algo distinto a las cafeterías tradicionales.',
    construimos: 'Una estrategia de lanzamiento centrada en su diferencial —waffles de yuca con el sabor de la costa—: un mensaje que lo pone en primer plano desde el primer contacto y contenidos pensados para despertar curiosidad en quienes buscan algo distinto a la cafetería de siempre.',
    resultado: '',
    aprendizaje: 'Un producto diferente necesita un mensaje igual de distinto para encontrar a quien lo estaba buscando.',
    capacidades: {
      'CRECE - Insight Lab': ['Estrategia de marketing digital', 'Estrategia de lanzamiento']
    }
  },

  'Pretty Pets': {
    titulo: 'Visitas que mueven la cola.',
    reto: 'Pretty Pets tenía productos y canales de venta, pero necesitaba que llegaran a ellos personas realmente interesadas en comprar para sus mascotas.',
    insight: 'Quien compra para su mascota compra con el corazón, y lo hace en los canales donde ya confía.',
    construimos: 'Una estrategia digital que parte de las mascotas y sus dueños, no del catálogo, y campañas de pauta segmentadas por intereses que llevan directo a sus canales de venta.',
    resultado: '',
    aprendizaje: 'La pauta rinde más cuando lleva a la gente a donde ya compra, no a un canal nuevo.',
    capacidades: {
      'CRECE - Insight Lab': ['Estrategia digital', 'Pauta digital']
    }
  },

  'Geco.': {
    titulo: 'Verde de verdad, no de discurso.',
    reto: 'Geco. vende productos ecológicos en un mercado donde muchas marcas dicen ser "verdes". Necesitaba atraer a un público consciente y lograr que ese interés terminara en una compra.',
    insight: 'El público consciente desconfía de lo que es "verde" solo de palabra: necesita razones claras para elegir.',
    construimos: 'Una estrategia digital que explica con claridad por qué cada producto es una mejor elección, con un tono cercano y sin sermones, y un recorrido pensado para pasar del interés a la compra.',
    resultado: '',
    aprendizaje: 'En lo sostenible, la coherencia vende más que el discurso.',
    capacidades: {
      'CRECE - Insight Lab': ['Estrategia de marketing digital']
    }
  },

  'Epika Store': {
    titulo: 'Orlando, a un clic de distancia.',
    reto: 'Epika Store trae productos de Disney Parks y Universal Studios desde Orlando. Tenía un producto que enamora, pero necesitaba llegar a los fans y convertir ese entusiasmo en ventas.',
    insight: 'Sus clientes no buscan un producto: buscan un pedacito de la experiencia de los parques sin viajar a Orlando.',
    construimos: 'Una estrategia de marketing digital que vende la experiencia antes que el objeto: contenidos que evocan los parques y campañas dirigidas a fans de Disney y Universal.',
    resultado: '',
    aprendizaje: 'Cuando el producto es emoción, la comunicación tiene que vender la experiencia, no el objeto.',
    capacidades: {
      'CRECE - Insight Lab': ['Estrategia de marketing digital']
    }
  },

  'Centro del Sueño y Ronquido': {
    titulo: 'Despiertos cuando alguien busca por qué ronca.',
    reto: 'El Centro del Sueño y Ronquido es un centro especializado en Medellín. Necesitaba que las personas con problemas de sueño lo encontraran justo cuando empiezan a buscar respuestas.',
    insight: 'Quien ronca o duerme mal suele buscar respuestas en internet antes de pedir una cita.',
    construimos: 'Un sitio web claro, pensado para resolver dudas y agendar; un blog con artículos sobre ronquido, apnea y trastornos del sueño optimizados para SEO; y pauta digital para llegar a pacientes en Medellín.',
    resultado: '',
    aprendizaje: 'En salud, un sitio claro y confiable es el primer paso de la consulta.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Sitio web'],
      'CRECE - Insight Lab': ['Estrategia de marketing digital', 'Pauta digital', 'SEO', 'Blog y contenidos']
    }
  },

  'Clínica del Cerebro': {
    titulo: 'Claridad para decisiones que pesan.',
    reto: 'La Clínica del Cerebro atiende pacientes neurológicos en Medellín. Sus pacientes y sus familias llegan con dudas y preocupación, y la clínica necesitaba un canal digital que les diera confianza antes de la primera cita.',
    insight: 'Los pacientes y sus familias llegan con dudas y preocupación: necesitan información clara antes de agendar.',
    construimos: 'Un sitio web que explica sus servicios en lenguaje sencillo, contenido educativo para redes sociales sobre temas neurológicos y pauta digital para llegar a pacientes en Medellín.',
    resultado: '',
    aprendizaje: 'En salud, la confianza se construye con información útil, no con promesas.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Diseño web'],
      'CRECE - Insight Lab': ['Estrategia de marketing digital', 'Pauta digital', 'Contenido para redes']
    }
  },

  'Caminos de la Vida': {
    titulo: 'Tranquilidad para quien decide por amor.',
    reto: 'Caminos de la Vida es un hogar geriátrico. Elegir un hogar para un padre o una madre es una decisión difícil, y necesitaba que las familias lo encontraran y confiaran en él.',
    insight: 'Quien decide casi nunca es el adulto mayor, sino su familia, y lo que busca es tranquilidad.',
    construimos: 'Un sitio web que muestra el día a día del hogar y responde las preguntas de las familias, y una estrategia de marketing y pauta digital dirigida a hijos y familiares que están buscando opciones.',
    resultado: '',
    aprendizaje: 'Cuando la decisión es emocional, la comunicación tiene que hablarle a quien decide.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Desarrollo web'],
      'CRECE - Insight Lab': ['Estrategia de marketing digital', 'Pauta digital']
    }
  },

  'La Marquessa': {
    titulo: 'Primero la vitrina, después la fila.',
    reto: 'La Marquessa ya vendía accesorios en su tienda en línea y quería vender más. Invertir en pauta sin revisar el sitio era arriesgarse a pagar por visitas que no compran.',
    insight: 'Llevar más visitas a un sitio que no está listo para vender es pagar dos veces: primero había que ajustar el sitio.',
    construimos: 'Optimizamos el sitio para que comprar fuera más fácil —navegación, fichas de producto y proceso de compra— y después diseñamos una estrategia de pauta digital para llevar tráfico a una tienda lista para vender.',
    resultado: '',
    aprendizaje: 'Primero se optimiza la tienda, después se invierte en pauta.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Optimización del sitio web'],
      'CRECE - Insight Lab': ['Pauta digital']
    }
  },

  'Ser Niños': {
    titulo: 'Un solo juego: vender más.',
    reto: 'Ser Niños es una tienda de juguetes y educación consciente con sitio propio. Su objetivo era claro: vender más en línea.',
    insight: 'Las familias que buscan juguetes conscientes investigan antes de comprar: el sitio tenía que resolver sus dudas rápido.',
    construimos: 'Ajustes puntuales al sitio para que las familias encuentren rápido lo que buscan y entiendan el valor de cada juguete, y una estrategia de pauta digital medida contra un solo objetivo: las ventas.',
    resultado: '',
    aprendizaje: 'Un solo objetivo hace que cada ajuste y cada peso de pauta se midan contra lo mismo.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Ajustes al sitio web'],
      'CRECE - Insight Lab': ['Pauta digital']
    }
  },

  'Orbit': {
    titulo: 'De cero a órbita.',
    reto: 'Orbit quería entrar al mercado de ropa deportiva en Centroamérica sin nada construido —ni nombre, ni logo, ni colores— y competir con marcas ya conocidas.',
    insight: 'En ropa deportiva la gente compra identidad: quiere sentirse parte de algo cuando entrena.',
    construimos: 'Un nombre que habla de movimiento y constancia, un logo pensado para vivir en las prendas y un sistema de color con energía deportiva.',
    resultado: '',
    aprendizaje: 'Cuando se parte de cero, el nombre y el color son la primera promesa de la marca.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Naming', 'Logo', 'Sistema de color']
    }
  },

  'Arlo': {
    titulo: 'Abogados que hablan creativo.',
    reto: 'Arlo es una firma de abogados para creativos. Ya tenía logo y mascota, pero le faltaba una propuesta de valor clara y un sistema de marca que la hiciera coherente.',
    insight: 'Los creativos suelen ver lo legal como algo frío y lejano; la marca tenía que sentirse cercana a su mundo.',
    construimos: 'Definimos su propuesta de valor, organizamos su sistema de marca, seleccionamos la paleta de color y construimos un Brand Book para que la marca se use igual en todas partes.',
    resultado: '',
    aprendizaje: 'Ordenar un sistema de marca también es diseño: a veces el trabajo es darle estructura a lo que ya existe.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Propuesta de valor', 'Identidad visual', 'Sistema de marca', 'Brand Book']
    }
  },

  'Tin-T!': {
    titulo: 'Cafecito, Aguacatico y una marca con personalidad.',
    reto: 'Tin-T! es un emprendimiento colombiano de merchandising. En un mercado lleno de recuerdos parecidos, necesitaba una marca que se quedara en la memoria.',
    insight: 'Un recuerdo se compra por la historia que cuenta, no por el objeto.',
    construimos: 'Propuesta de valor, identidad visual y dos personajes —Cafecito y Aguacatico— inspirados en íconos colombianos, diseñados para vivir en productos y aplicaciones de la marca.',
    resultado: '',
    aprendizaje: 'Los personajes convierten un producto en un recuerdo.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Propuesta de valor', 'Identidad visual', 'Personajes', 'Merchandising']
    }
  },

  'Moosy': {
    titulo: 'Moda que no se viste igual.',
    reto: 'Moosy es una tienda de moda con personalidad propia, pero su imagen no lo estaba reflejando.',
    insight: 'En moda, la identidad visual es lo primero que el cliente "se prueba".',
    construimos: 'Una identidad visual con carácter, pensada para destacar en redes y en la tienda.',
    resultado: '',
    aprendizaje: 'Una tienda con personalidad propia necesita una identidad que no se parezca a las demás.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Identidad visual']
    }
  },

  'Indeleble': {
    titulo: 'Un nombre que deja huella, una marca que no se borra.',
    reto: 'Indeleble, una firma contable, ya tenía un nombre con fuerza, pero no una identidad visual que lo respaldara en un sector que suele verse igual.',
    insight: 'El nombre ya contaba una historia: una huella que no se borra.',
    construimos: 'Un sistema visual construido a partir del nombre: la idea de una huella que no se borra, traducida en logo, colores y aplicaciones.',
    resultado: '',
    aprendizaje: 'Cuando el nombre es fuerte, la identidad tiene que amplificarlo, no competir con él.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Identidad visual', 'Sistema visual']
    }
  },

  'Prepapp': {
    titulo: 'Estudiar para el examen, pero con amigos.',
    reto: 'Prepapp es una app enfocada en preparar estudiantes para exámenes de Estado. El reto no era solo la marca, sino construir un universo propio que la hiciera cercana a su público joven.',
    insight: 'Para un estudiante, prepararse para un examen es una obligación; la marca tenía que hacerlo sentir más cercano y menos pesado.',
    construimos: 'Naming, propuesta de valor, identidad visual, logo y colores, y un sistema de personajes que acompaña al estudiante y le da a la app personalidad más allá de la funcionalidad.',
    resultado: '',
    aprendizaje: 'Los personajes le dan a una app algo que la funcionalidad sola no da: cercanía.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Naming', 'Propuesta de valor', 'Identidad visual', 'Logo', 'Personajes']
    }
  },

  'Seed Capital': {
    titulo: 'Una semilla que se escucha.',
    reto: 'Seed Capital es un podcast de emprendimiento que necesitaba una marca con presencia propia frente a otros medios del sector.',
    insight: 'Entre muchos podcasts de emprendimiento, lo que el público recuerda es la marca, no solo el tema.',
    construimos: 'Naming, propuesta de valor y sistema de identidad visual (logo, colores y aplicaciones) pensados para funcionar tanto en el podcast como en sus redes y piezas de difusión.',
    resultado: '',
    aprendizaje: 'Una identidad pensada desde el inicio para redes y piezas de difusión trabaja en todos los canales.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Naming', 'Propuesta de valor', 'Identidad visual', 'Piezas para redes']
    }
  },

  'AM Studios': {
    titulo: 'Diseñar con datos, y que se note.',
    reto: 'AM Studios es una agencia de marketing digital con buenos resultados, pero su marca no lo transmitía: necesitaba verse tan sólida como su trabajo.',
    insight: 'Una agencia que vende resultados no puede tener una marca improvisada.',
    construimos: 'Desde el naming, construimos el logo, la paleta de color y una identidad visual con un lenguaje que une diseño y datos.',
    resultado: '',
    aprendizaje: 'La marca de una agencia es su primera muestra de trabajo.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Logo', 'Paleta de color', 'Identidad visual']
    }
  },

  "Tata's Photos": {
    titulo: 'Una marca tan detallista como su lente.',
    reto: 'Una fotógrafa que quería dejar de ser "una fotógrafa más" y tener una marca personal que la representara.',
    insight: 'En fotografía, la gente contrata a la persona, no solo el servicio.',
    construimos: 'Definimos su propuesta de valor y construimos el naming, los colores y una identidad inspirada en su forma de mirar: encontrar la belleza en las cosas pequeñas.',
    resultado: '',
    aprendizaje: 'Una marca personal funciona cuando se parece a quien la lleva.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Marca personal', 'Propuesta de valor', 'Naming', 'Identidad visual']
    }
  },

  'Carlos Ravelo': {
    titulo: 'Solidez que se ve antes de la primera reunión.',
    reto: 'Carlos Ravelo es consultor de estrategia de negocios. En consultoría la primera impresión pesa: su marca tenía que transmitir la misma solidez que su asesoría.',
    insight: 'Un consultor vende confianza antes de vender su asesoría.',
    construimos: 'Una identidad visual sobria y profesional, pensada para sus presentaciones, propuestas y redes.',
    resultado: '',
    aprendizaje: 'La marca personal tiene que transmitir lo mismo que la persona en una reunión.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Marca personal', 'Identidad visual']
    }
  },

  'Walkmate': {
    titulo: 'Amor a primer paseo.',
    reto: 'Walkmate es una empresa de paseo de perros en Australia. Quien la contrata le confía a su perro: la marca tenía que transmitir cariño y confianza desde el primer vistazo.',
    insight: 'Quien contrata un paseador deja a su perro en manos de otro: la marca tenía que transmitir confianza y cariño.',
    construimos: 'Una identidad de marca cercana y amigable, pensada para funcionar en todos sus puntos de contacto.',
    resultado: '',
    aprendizaje: 'En servicios de cuidado, la identidad tiene que inspirar confianza desde el primer vistazo.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Identidad de marca']
    }
  }
};
