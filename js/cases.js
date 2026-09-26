/* Casos de estudio que aparecen dentro del popup de cada proyecto
   (home y portafolio). Se editan a mano aquí, no desde /admin.

   Para agregar un caso: copia un bloque, cambia la clave por el nombre
   EXACTO del proyecto (el mismo data-title de su card) y llena los campos.
   Un campo vacío ('') no se muestra. Las cards con caso muestran la
   etiqueta "Ver caso".

   capacidades: las etiquetas del popup, agrupadas por Lab (mismo formato
   para todas las marcas). Reemplazan a data-capabilities del HTML.

   reto y construimos salen de la información real de cada proyecto (su
   descripción y el trabajo realizado). insight y aprendizaje son una
   redacción propuesta a partir de esa descripción (pedido de la dueña,
   2026-09-25): revisarlos y ajustarlos con lo que realmente pasó.
   resultado queda vacío hasta tener datos reales: nunca cifras inventadas. */
window.WOW_CASES = {

  /* ---------- Web + marketing digital ---------- */

  'Lámparas Milán': {
    titulo: 'Renovar una marca sin perder su esencia.',
    reto: 'Una empresa de iluminación y decoración para el hogar con una marca existente que necesitaba renovarse, manteniendo sus valores y su esencia.',
    insight: 'Sus clientes no compran solo una lámpara: compran cómo se va a ver su casa. La marca tenía que transmitir eso sin romper con lo que ya la hacía reconocible.',
    construimos: 'Refresh y rebranding de la marca, diseño y desarrollo del sitio web, estrategia de marketing digital, pauta digital y SEO.',
    resultado: '',
    aprendizaje: 'Renovar no es empezar de cero: lo que la gente ya reconoce de una marca es un activo que hay que cuidar.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Rebranding', 'Diseño web', 'Desarrollo web'],
      'CRECE - Insight Lab': ['Estrategia de marketing digital', 'Pauta digital', 'SEO']
    }
  },

  'Ajá Waffles': {
    titulo: 'Una marca nueva, un diferencial claro, un público por encontrar.',
    reto: 'Ajá Waffles es un emprendimiento gastronómico nuevo con un diferencial claro: waffles a base de yuca. Sin marca ni presencia digital todavía, competía por atención frente a cafeterías ya conocidas.',
    insight: 'Su público no buscaba una cafetería más: buscaba algo distinto a las cafeterías tradicionales.',
    construimos: 'Diseñamos la estrategia de marketing digital para su lanzamiento, pensada para conectar con ese público desde el primer contacto con la marca.',
    resultado: '',
    aprendizaje: 'Un producto diferente necesita un mensaje igual de distinto para encontrar a quien lo estaba buscando.',
    capacidades: {
      'CRECE - Insight Lab': ['Estrategia de marketing digital', 'Estrategia de lanzamiento']
    }
  },

  'Pretty Pets': {
    titulo: 'Llevar una tienda de mascotas a donde está su público.',
    reto: 'Una tienda de artículos para mascotas que necesitaba llevar su marca a sus canales de venta y atraer más tráfico calificado.',
    insight: 'Quien compra para su mascota compra con el corazón, y lo hace en los canales donde ya confía.',
    construimos: 'Estrategia y pauta digital enfocadas en llevar la marca a sus canales de venta y generar más tráfico calificado.',
    resultado: '',
    aprendizaje: 'La pauta rinde más cuando lleva a la gente a donde ya compra, no a un canal nuevo.',
    capacidades: {
      'CRECE - Insight Lab': ['Estrategia digital', 'Pauta digital']
    }
  },

  'Geco.': {
    titulo: 'Convertir el interés por lo ecológico en ventas.',
    reto: 'Una tienda de productos ecológicos que necesitaba atraer a un público consciente y convertir ese interés en ventas.',
    insight: 'El público consciente desconfía de lo que es "verde" solo de palabra: necesita razones claras para elegir.',
    construimos: 'Estrategia digital pensada para atraer a un público consciente y convertir ese interés en ventas.',
    resultado: '',
    aprendizaje: 'En lo sostenible, la coherencia vende más que el discurso.',
    capacidades: {
      'CRECE - Insight Lab': ['Estrategia de marketing digital']
    }
  },

  'Epika Store': {
    titulo: 'La magia de Orlando, al alcance de su público.',
    reto: 'Una tienda de productos traídos de Disney Parks y Universal Studios en Orlando que necesitaba atraer y convertir a su público.',
    insight: 'Sus clientes no buscan un producto: buscan un pedacito de la experiencia de los parques sin viajar a Orlando.',
    construimos: 'Desarrollo de la estrategia de marketing digital, enfocada en atraer y convertir a su público.',
    resultado: '',
    aprendizaje: 'Cuando el producto es emoción, la comunicación tiene que vender la experiencia, no el objeto.',
    capacidades: {
      'CRECE - Insight Lab': ['Estrategia de marketing digital']
    }
  },

  'Centro del Sueño y Ronquido': {
    titulo: 'Presencia digital para un centro especializado en sueño.',
    reto: 'Un centro especializado en sueño en Medellín que necesitaba sitio web, estrategia digital y pauta.',
    insight: 'Quien ronca o duerme mal suele buscar respuestas en internet antes de pedir una cita.',
    construimos: 'Sitio web, estrategia de marketing digital y pauta digital.',
    resultado: '',
    aprendizaje: 'En salud, un sitio claro y confiable es el primer paso de la consulta.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Sitio web'],
      'CRECE - Insight Lab': ['Estrategia de marketing digital', 'Pauta digital', 'SEO', 'Blog y contenidos']
    }
  },

  'Clínica del Cerebro': {
    titulo: 'Presencia digital para una clínica neurológica.',
    reto: 'Una clínica neurológica en Medellín que necesitaba sitio web, estrategia digital y pauta.',
    insight: 'Los pacientes y sus familias llegan con dudas y preocupación: necesitan información clara antes de agendar.',
    construimos: 'Diseño del sitio web, estrategia de marketing digital y pauta digital.',
    resultado: '',
    aprendizaje: 'En salud, la confianza se construye con información útil, no con promesas.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Diseño web'],
      'CRECE - Insight Lab': ['Estrategia de marketing digital', 'Pauta digital', 'Contenido para redes']
    }
  },

  'Caminos de la Vida': {
    titulo: 'Un hogar geriátrico, presente en digital.',
    reto: 'Un hogar geriátrico que necesitaba sitio web, estrategia digital y pauta.',
    insight: 'Quien decide casi nunca es el adulto mayor, sino su familia, y lo que busca es tranquilidad.',
    construimos: 'Estrategia de marketing digital, pauta digital y desarrollo del sitio web.',
    resultado: '',
    aprendizaje: 'Cuando la decisión es emocional, la comunicación tiene que hablarle a quien decide.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Desarrollo web'],
      'CRECE - Insight Lab': ['Estrategia de marketing digital', 'Pauta digital']
    }
  },

  'La Marquessa': {
    titulo: 'Un sitio optimizado para vender más.',
    reto: 'Una tienda de accesorios con sitio web propio que necesitaba impulsar sus ventas online.',
    insight: 'Llevar más visitas a un sitio que no está listo para vender es pagar dos veces: primero había que ajustar el sitio.',
    construimos: 'Optimizamos su sitio web y diseñamos la estrategia de pauta digital para impulsar sus ventas online.',
    resultado: '',
    aprendizaje: 'Primero se optimiza la tienda, después se invierte en pauta.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Optimización del sitio web'],
      'CRECE - Insight Lab': ['Pauta digital']
    }
  },

  'Ser Niños': {
    titulo: 'Un solo objetivo: vender más.',
    reto: 'Una tienda de juguetes y educación consciente que necesitaba vender más a través de su sitio web.',
    insight: 'Las familias que buscan juguetes conscientes investigan antes de comprar: el sitio tenía que resolver sus dudas rápido.',
    construimos: 'Ajustes al sitio web y una estrategia de pauta digital enfocada en un solo objetivo: que la tienda venda más.',
    resultado: '',
    aprendizaje: 'Un solo objetivo hace que cada ajuste y cada peso de pauta se midan contra lo mismo.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Ajustes al sitio web'],
      'CRECE - Insight Lab': ['Pauta digital']
    }
  },

  /* ---------- Marca e identidad (solo portafolio) ---------- */

  'Orbit': {
    titulo: 'Una marca deportiva construida desde cero.',
    reto: 'Una marca de ropa deportiva de Centroamérica que empezaba desde cero: sin nombre, logo ni sistema de color.',
    insight: 'En ropa deportiva la gente compra identidad: quiere sentirse parte de algo cuando entrena.',
    construimos: 'Naming, logo y sistema de color construidos desde cero para posicionar a Orbit como marca de ropa deportiva en Centroamérica.',
    resultado: '',
    aprendizaje: 'Cuando se parte de cero, el nombre y el color son la primera promesa de la marca.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Naming', 'Logo', 'Sistema de color']
    }
  },

  'Arlo': {
    titulo: 'Para lo legal, un poco de creatividad.',
    reto: 'Una firma de abogados especializada en servicios legales para creativos que necesitaba una propuesta de valor y una identidad visual. El logo y la mascota Arlo no hacían parte del proyecto.',
    insight: 'Los creativos suelen ver lo legal como algo frío y lejano; la marca tenía que sentirse cercana a su mundo.',
    construimos: 'Definición de la propuesta de valor y desarrollo de la identidad visual: organización del sistema de marca, selección de colores y construcción del Brand Book.',
    resultado: '',
    aprendizaje: 'Ordenar un sistema de marca también es diseño: a veces el trabajo es darle estructura a lo que ya existe.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Propuesta de valor', 'Identidad visual', 'Sistema de marca', 'Brand Book']
    }
  },

  'Tin-T!': {
    titulo: 'Una marca con personajes propios.',
    reto: 'Un emprendimiento colombiano de merchandising que necesitaba construir su marca.',
    insight: 'Un recuerdo se compra por la historia que cuenta, no por el objeto.',
    construimos: 'Desarrollo de la marca, con propuesta de valor e identidad visual, y creación de los personajes Cafecito y Aguacatico como parte del universo de la marca, pensados para merchandising y diferentes aplicaciones.',
    resultado: '',
    aprendizaje: 'Los personajes convierten un producto en un recuerdo.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Propuesta de valor', 'Identidad visual', 'Personajes', 'Merchandising']
    }
  },

  'Moosy': {
    titulo: 'Moda con carácter propio.',
    reto: 'Una tienda de moda con personalidad propia que necesitaba una identidad visual a su altura.',
    insight: 'En moda, la identidad visual es lo primero que el cliente "se prueba".',
    construimos: 'Desarrollo de la identidad visual de la tienda.',
    resultado: '',
    aprendizaje: 'Una tienda con personalidad propia necesita una identidad que no se parezca a las demás.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Identidad visual']
    }
  },

  'Indeleble': {
    titulo: 'Una identidad construida desde el nombre.',
    reto: 'Una firma contable que ya tenía nombre, pero no una identidad visual.',
    insight: 'El nombre ya contaba una historia: una huella que no se borra.',
    construimos: 'Un sistema visual construido a partir de su naming.',
    resultado: '',
    aprendizaje: 'Cuando el nombre es fuerte, la identidad tiene que amplificarlo, no competir con él.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Identidad visual', 'Sistema visual']
    }
  },

  'Prepapp': {
    titulo: 'Más que una app: un universo propio.',
    reto: 'Prepapp es una app enfocada en preparar estudiantes para exámenes de Estado. El reto no era solo la marca, sino construir un universo propio que la hiciera cercana a su público joven.',
    insight: 'Para un estudiante, prepararse para un examen es una obligación; la marca tenía que hacerlo sentir más cercano y menos pesado.',
    construimos: 'Naming, propuesta de valor, identidad visual, logo, colores y un sistema de personajes que le dieran personalidad a la app más allá de la funcionalidad.',
    resultado: '',
    aprendizaje: 'Los personajes le dan a una app algo que la funcionalidad sola no da: cercanía.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Naming', 'Propuesta de valor', 'Identidad visual', 'Logo', 'Personajes']
    }
  },

  'Seed Capital': {
    titulo: 'Una marca propia para un podcast de emprendimiento.',
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
    titulo: 'Verse tan sólida como sus resultados.',
    reto: 'Una agencia de marketing digital que necesitaba verse tan sólida como sus resultados.',
    insight: 'Una agencia que vende resultados no puede tener una marca improvisada.',
    construimos: 'Logo, paleta de color e identidad visual construidos desde el naming.',
    resultado: '',
    aprendizaje: 'La marca de una agencia es su primera muestra de trabajo.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Logo', 'Paleta de color', 'Identidad visual']
    }
  },

  "Tata's Photos": {
    titulo: 'Una marca personal para una fotógrafa.',
    reto: 'Una fotógrafa que necesitaba una marca personal que la representara.',
    insight: 'En fotografía, la gente contrata a la persona, no solo el servicio.',
    construimos: 'Definimos su propuesta de valor y construimos el naming, los colores y la identidad visual.',
    resultado: '',
    aprendizaje: 'Una marca personal funciona cuando se parece a quien la lleva.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Marca personal', 'Propuesta de valor', 'Naming', 'Identidad visual']
    }
  },

  'Carlos Ravelo': {
    titulo: 'Una marca personal tan sólida como su asesoría.',
    reto: 'Un consultor de estrategia de negocios que necesitaba una marca personal que transmitiera la misma solidez que su asesoría.',
    insight: 'Un consultor vende confianza antes de vender su asesoría.',
    construimos: 'Definimos su identidad visual para transmitir la misma solidez que su asesoría.',
    resultado: '',
    aprendizaje: 'La marca personal tiene que transmitir lo mismo que la persona en una reunión.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Marca personal', 'Identidad visual']
    }
  },

  'Walkmate': {
    titulo: 'Identidad para una empresa de paseo de perros.',
    reto: 'Una empresa de paseo de perros en Australia que necesitaba una identidad de marca.',
    insight: 'Quien contrata un paseador deja a su perro en manos de otro: la marca tenía que transmitir confianza y cariño.',
    construimos: 'Diseño de la identidad de marca.',
    resultado: '',
    aprendizaje: 'En servicios de cuidado, la identidad tiene que inspirar confianza desde el primer vistazo.',
    capacidades: {
      'CREA - Brand & Experience Lab': ['Identidad de marca']
    }
  }
};
