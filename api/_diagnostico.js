// Correo del diagnóstico del Playground: arma el mensaje desde el resultado guardado de la revisión y lo envía con Resend.
// Hoy solo está el simulador de encabezados; cada simulador nuevo agrega su función en BUILDERS (clave = run.tool).
//
// Variables de entorno (Vercel → Settings → Environment Variables):
//   RESEND_API_KEY   clave de Resend (empieza por "re_"). Sin ella no se envía nada: el lead se guarda igual.
//   MAIL_FROM        remitente con dominio verificado en Resend, p. ej. "Workshop of Wonders <hola@efectowow.co>"
//   MAIL_REPLY_TO    (opcional) a dónde llegan las respuestas; por defecto hola@efectowow.co
// En local, sin RESEND_API_KEY, el correo no sale: se imprime en la consola del servidor (modo de prueba).

// Cómo arreglar cada alerta del simulador de encabezados.
var FIX = {
  no_h1: 'Agrega un único H1 con la frase principal de la página: qué ofreces y para quién. Es lo primero que lee Google y la persona que llega.',
  multi_h1: 'Deja un solo H1 (el título de la página) y convierte los demás en H2. Si son parte del diseño, cámbialos por texto con estilo, no por encabezados.',
  long_h1: 'Resume el H1 a menos de 70 caracteres: servicio + ciudad o beneficio. Mueve el detalle a un párrafo o a un H2.',
  empty: 'Revisa los encabezados vacíos: suelen ser logos o íconos envueltos en un H. Quita la etiqueta de encabezado o ponles texto real.',
  skip: 'Ordena los niveles sin saltos: H1 → H2 → H3. Si necesitas un tamaño distinto, cámbialo con CSS, no con el nivel del encabezado.',
  first_not_h1: 'El H1 debería ser el primer encabezado de la página. Revisa si el menú o un banner usa un H2 o H3 antes del título.',
  dup: 'Haz que cada encabezado diga algo distinto. Si se repiten (por ejemplo "Ver más"), conviértelos en texto normal o dales un nombre propio.',
  no_title: 'Agrega un title de 30 a 60 caracteres con la frase principal de la página y tu marca al final.',
  title_len: 'Ajusta el title a 30–60 caracteres: si es más largo Google lo corta, si es muy corto desaprovechas espacio.',
  meta_len: 'Reescribe la meta description entre 120 y 160 caracteres: resume la página e invita a hacer clic.',
  h1_title_diff: 'El H1 y el title deberían hablar de lo mismo (pueden diferir un poco). Incluye en ambos la palabra clave principal.',
  js_render: 'Haz que el contenido principal llegue ya escrito en el HTML (renderizado en servidor o prerenderizado). Si no, Google y las IA ven una página casi vacía.',
  no_meta: 'Escribe una meta description de 140 a 160 caracteres que resuma la página e invite a hacer clic.'
};
var FALLBACK = 'Revisa este punto con tu equipo de contenido.';
var OUTLINE = ['H1  Servicio + para quién (+ ciudad)', '  H2  Qué incluye', '    H3  Cada servicio o entregable', '  H2  Cómo trabajamos', '    H3  Paso 1, paso 2, paso 3', '  H2  Casos y resultados', '  H2  Preguntas frecuentes', '    H3  Cada pregunta real de tu cliente'];
var NOTE = 'Con todo en orden llegas a 95 de 100: el resto sale de una revisión completa de tu sitio (contenido, velocidad, enlaces y datos estructurados).';

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function encabezados(run) {
  var r = typeof run.result === 'string' ? JSON.parse(run.result) : run.result;
  var site = run.host.replace(/^www\./, '');
  var score = r.score == null ? null : r.score;
  var subject = 'Tu auditoría de títulos: ' + site + (score == null ? '' : ' (' + score + '/100)');
  var issues = r.issues || [], passed = r.passed || [];

  var text = ['Hola,', '', 'Esta es la auditoría de los títulos de ' + run.url + '.', '',
    score == null ? 'Puntaje: no disponible (el sitio parece armarse con JavaScript).' : 'Puntaje: ' + score + ' de 100'];
  if (passed.length) { text.push('', 'LO QUE ESTÁ BIEN, MANTENLO'); passed.forEach(function (t) { text.push('✓ ' + t); }); }
  text.push('', issues.length ? 'QUÉ MEJORAR (' + issues.length + ')' : 'NO ENCONTRAMOS ALERTAS BÁSICAS');
  issues.forEach(function (i, n) { text.push((n + 1) + '. ' + i.msg, '   Cómo arreglarlo: ' + (FIX[i.code] || FALLBACK)); });
  text.push('', 'ESQUEMA RECOMENDADO'); OUTLINE.forEach(function (l) { text.push(l); });
  text.push('', NOTE, '', '¿Quieres que lo revisemos contigo? Responde este correo o escríbenos a hola@efectowow.co.', '', 'Workshop of Wonders · efectowow.co');

  var H = '<div style="font-family:Arial,Helvetica,sans-serif;color:#1a1320;max-width:600px;margin:0 auto;padding:24px;line-height:1.55">' +
    '<img src="https://www.efectowow.co/design-system/wonders/Wonder_Azul_Analizando_Datos.png" alt="" width="72" height="69" style="display:block;width:72px;height:auto;margin:0 0 6px;border:0">' +
    '<p style="margin:0 0 4px;font-size:12px;letter-spacing:.14em;font-weight:700;color:#380757">WORKSHOP OF WONDERS · PLAYGROUND</p>' +
    '<h1 style="margin:0 0 12px;font-size:24px;color:#380757">Tu auditoría de títulos</h1>' +
    '<p style="margin:0 0 16px">Estos son los resultados de <a href="' + esc(run.url) + '" style="color:#380757">' + esc(run.url) + '</a>.</p>' +
    '<div style="background:#dce157;border-radius:16px;padding:16px 20px;margin:0 0 20px"><b style="font-size:30px;color:#380757">' +
    (score == null ? 'n/d' : score + '/100') + '</b><span style="margin-left:10px;color:#380757">' + (score == null ? 'Parece un sitio armado con JavaScript' : 'puntaje de estructura') + '</span></div>';
  if (passed.length) {
    H += '<h2 style="font-size:16px;color:#15803d;margin:0 0 6px">Lo que está bien, mantenlo</h2><ul style="margin:0 0 20px;padding-left:20px">' +
      passed.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>';
  }
  H += '<h2 style="font-size:16px;color:#380757;margin:0 0 6px">' + (issues.length ? 'Qué mejorar' : 'No encontramos alertas básicas') + '</h2>';
  issues.forEach(function (i) {
    H += '<div style="border-left:4px solid ' + (i.type === 'error' ? '#be123c' : '#b45309') + ';background:#f6f1fa;border-radius:8px;padding:10px 14px;margin:0 0 10px">' +
      '<b>' + esc(i.msg) + '</b><br><span style="color:#4a3b57">' + esc(FIX[i.code] || FALLBACK) + '</span></div>';
  });
  H += '<h2 style="font-size:16px;color:#380757;margin:20px 0 6px">Esquema recomendado</h2>' +
    '<pre style="background:#f6f1fa;border-radius:8px;padding:12px 14px;font-size:13px;white-space:pre-wrap">' + esc(OUTLINE.join('\n')) + '</pre>' +
    '<p style="color:#4a3b57;font-size:14px">' + esc(NOTE) + '</p>' +
    '<p style="margin:20px 0 0">¿Quieres que lo revisemos contigo? Responde este correo o escríbenos a <a href="mailto:hola@efectowow.co" style="color:#380757">hola@efectowow.co</a>.</p>' +
    '<p style="margin:20px 0 0;font-size:12px;color:#7a6b88">Workshop of Wonders · efectowow.co</p></div>';
  return { subject: subject, text: text.join('\n'), html: H };
}

// Cómo arreglar cada punto de la Revisión express (api/revisar.js).
var FIX_R = {
  https: 'Instala un certificado SSL (casi todos los hostings lo dan gratis) y haz que http:// redirija siempre a https://.',
  noindex: 'Quita la etiqueta "noindex" de la página (en WordPress: Ajustes → Lectura → desmarca "Disuadir a los motores de búsqueda"; o en tu plugin de SEO). Es lo primero: sin esto no apareces en Google.',
  viewport: 'Agrega en el head: <meta name="viewport" content="width=device-width, initial-scale=1"> y revisa que el diseño se adapte al celular.',
  no_title: 'Escribe un title de 30 a 60 caracteres con lo que ofreces y tu marca al final. Ejemplo: "Diseño web en Medellín | Tu Marca".',
  title_len: 'Ajusta el title a 30–60 caracteres: más largo y Google lo corta, más corto y desaprovechas espacio.',
  no_h1: 'Deja un solo H1 por página con la frase principal: qué ofreces y para quién. Los demás títulos deben ser H2 o H3.',
  no_meta: 'Escribe una meta description de 120 a 160 caracteres que resuma la página e invite a hacer clic.',
  meta_len: 'Reescribe la meta description entre 120 y 160 caracteres.',
  no_sitemap: 'Genera un sitemap.xml (tu plugin de SEO o tu plataforma lo hacen) y envíalo en Google Search Console → Sitemaps.',
  no_robots: 'Crea un archivo robots.txt en la raíz del sitio que diga qué puede recorrer Google e indique dónde está tu sitemap.',
  no_ld: 'Agrega datos estructurados (JSON-LD) de tu organización o negocio local, y de preguntas frecuentes o productos si aplican. Ayudan a Google y a las IAs a entender quién eres.',
  no_og: 'Agrega las etiquetas og:title, og:description y og:image (1200×630 px) para que tu enlace se vea bien al compartirlo en WhatsApp, LinkedIn y redes.',
  alt: 'Describe cada imagen con un texto alt corto y real (qué muestra). Ayuda a las personas con lector de pantalla y a Google Imágenes.',
  no_canonical: 'Agrega <link rel="canonical" href="..."> con la dirección principal de cada página para evitar páginas duplicadas.',
  no_lang: 'Agrega lang="es" en la etiqueta <html> para indicar el idioma de la página.',
  slow: 'Un servidor lento se arregla con mejor hosting, caché y menos plugins o scripts pesados. Mide también la velocidad completa en PageSpeed Insights.'
};

function revision(run) {
  var r = typeof run.result === 'string' ? JSON.parse(run.result) : run.result;
  var site = run.host.replace(/^www\./, '');
  var score = r.score == null ? null : r.score;
  var subject = 'Tu revisión express: ' + site + (score == null ? '' : ' (' + score + '/100)');
  var issues = r.issues || [], passed = r.passed || [];
  var text = ['Hola,', '', 'Esta es la revisión express de ' + run.url + '.', '', 'Puntaje: ' + (score == null ? 'n/d' : score + ' de 100')];
  text.push('', issues.length ? 'QUÉ ARREGLAR, EN ORDEN (' + issues.length + ')' : 'NO ENCONTRAMOS ALERTAS BÁSICAS');
  issues.forEach(function (i, n) { text.push((n + 1) + '. ' + i.msg, '   Cómo arreglarlo: ' + (FIX_R[i.code] || FALLBACK)); });
  if (passed.length) { text.push('', 'LO QUE YA ESTÁ BIEN'); passed.forEach(function (t) { text.push('✓ ' + t); }); }
  text.push('', 'Esta revisión mira lo básico del HTML. Una auditoría completa incluye velocidad real, contenido, enlaces y competencia.', '', '¿Quieres que lo revisemos contigo? Responde este correo o escríbenos a hola@efectowow.co.', '', 'Workshop of Wonders · efectowow.co');
  var H = '<div style="font-family:Arial,Helvetica,sans-serif;color:#1a1320;max-width:600px;margin:0 auto;padding:24px;line-height:1.55">' +
    '<p style="margin:0 0 4px;font-size:12px;letter-spacing:.14em;font-weight:700;color:#380757">WORKSHOP OF WONDERS · PLAYGROUND</p>' +
    '<h1 style="margin:0 0 12px;font-size:24px;color:#380757">Tu revisión express</h1>' +
    '<p style="margin:0 0 16px">Estos son los resultados de <a href="' + esc(run.url) + '" style="color:#380757">' + esc(run.url) + '</a>.</p>' +
    '<div style="background:#dce157;border-radius:16px;padding:16px 20px;margin:0 0 20px"><b style="font-size:30px;color:#380757">' + (score == null ? 'n/d' : score + '/100') + '</b><span style="margin-left:10px;color:#380757">puntaje de lo básico</span></div>' +
    '<h2 style="font-size:16px;color:#380757;margin:0 0 6px">' + (issues.length ? 'Qué arreglar, en orden' : 'No encontramos alertas básicas') + '</h2>';
  issues.forEach(function (i) {
    H += '<div style="border-left:4px solid ' + (i.type === 'error' ? '#be123c' : '#b45309') + ';background:#f6f1fa;border-radius:8px;padding:10px 14px;margin:0 0 10px"><b>' + esc(i.msg) + '</b><br><span style="color:#4a3b57">' + esc(FIX_R[i.code] || FALLBACK) + '</span></div>';
  });
  if (passed.length) H += '<h2 style="font-size:16px;color:#15803d;margin:20px 0 6px">Lo que ya está bien</h2><ul style="margin:0 0 20px;padding-left:20px">' + passed.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>';
  H += '<p style="color:#4a3b57;font-size:14px">Esta revisión mira lo básico del HTML. Una auditoría completa incluye velocidad real, contenido, enlaces y competencia.</p>' +
    '<p style="margin:20px 0 0">¿Quieres que lo revisemos contigo? Responde este correo o escríbenos a <a href="mailto:hola@efectowow.co" style="color:#380757">hola@efectowow.co</a>.</p>' +
    '<p style="margin:20px 0 0;font-size:12px;color:#7a6b88">Workshop of Wonders · efectowow.co</p></div>';
  return { subject: subject, text: text.join('\n'), html: H };
}

// Plan de un simulador de cuestionario (api/simulador.js guarda el puntaje, el nivel y los pasos pendientes por prioridad).
function simulador(run) {
  var r = typeof run.result === 'string' ? JSON.parse(run.result) : run.result;
  var x = r.extra || {}, gaps = x.gaps || [], tier = x.tier || ['', ''], score = r.score == null ? 0 : r.score;
  var title = r.title || 'tu diagnóstico';
  var subject = 'Tu plan: ' + title + ' (' + score + '/100)';
  var ph1 = gaps.slice(0, 4), ph2 = gaps.slice(4, 7), ph3 = gaps.slice(7);
  var gain1 = ph1.reduce(function (t, g) { return t + g.pts; }, 0);
  var phases = [];
  if (ph1.length) phases.push(['Fase 1 · Primeros 30 días', ph1, 'Pasarías de ' + score + ' a ' + Math.min(100, score + gain1) + ' puntos']);
  if (ph2.length) phases.push(['Fase 2 · Meses 2 y 3', ph2, '']);
  if (ph3.length) phases.push(['Fase 3 · Después', ph3, '']);
  var link = x.service ? 'https://www.efectowow.co/servicios/' + x.service + '.html' : 'https://www.efectowow.co/servicios.html';
  var passed = r.passed || [];

  var text = ['Hola,', '', 'Este es tu plan de "' + title + '".', '', 'Puntaje: ' + score + ' de 100 · ' + tier[0], tier[1] || ''];
  phases.forEach(function (ph) {
    text.push('', ph[0].toUpperCase() + (ph[2] ? ' (' + ph[2] + ')' : ''));
    ph[1].forEach(function (g, n) { text.push((n + 1) + '. ' + g.step + (g.half ? ' (ya tienes una parte)' : '') + ' · +' + g.pts + ' pts'); });
  });
  if (!gaps.length) text.push('', x.none || 'Sigue midiendo y mejorando cada mes.');
  if (passed.length) { text.push('', 'LO QUE YA TIENES RESUELTO'); passed.forEach(function (t) { text.push('✓ ' + t); }); }
  text.push('', 'Si quieres que lo hagamos contigo: ' + link, 'O responde este correo / escríbenos a hola@efectowow.co.', '', 'Los resultados son una simulación de referencia: dependen de tu negocio y de tu mercado.', '', 'Workshop of Wonders · efectowow.co');

  var H = '<div style="font-family:Arial,Helvetica,sans-serif;color:#1a1320;max-width:600px;margin:0 auto;padding:24px;line-height:1.55">' +
    '<img src="https://www.efectowow.co/design-system/wonders/Wonder_Morado_Con_Idea.png" alt="" width="72" height="80" style="display:block;width:72px;height:auto;margin:0 0 6px;border:0">' +
    '<p style="margin:0 0 4px;font-size:12px;letter-spacing:.14em;font-weight:700;color:#380757">WORKSHOP OF WONDERS · PLAYGROUND</p>' +
    '<h1 style="margin:0 0 12px;font-size:24px;color:#380757">Tu plan: ' + esc(title) + '</h1>' +
    '<div style="background:#dce157;border-radius:16px;padding:16px 20px;margin:0 0 20px"><b style="font-size:30px;color:#380757">' + score + '/100</b>' +
    '<span style="margin-left:10px;color:#380757;font-weight:700">' + esc(tier[0]) + '</span><br><span style="color:#380757">' + esc(tier[1] || '') + '</span></div>';
  phases.forEach(function (ph) {
    H += '<h2 style="font-size:16px;color:#380757;margin:0 0 6px">' + esc(ph[0]) + (ph[2] ? ' <span style="font-weight:400;color:#4a3b57">· ' + esc(ph[2]) + '</span>' : '') + '</h2>';
    ph[1].forEach(function (g) {
      H += '<div style="border-left:4px solid #380757;background:#f6f1fa;border-radius:8px;padding:10px 14px;margin:0 0 8px"><b>' + esc(g.step) + '</b>' +
        (g.half ? ' <span style="color:#4a3b57">(ya tienes una parte)</span>' : '') + '<span style="float:right;color:#15803d;font-weight:700">+' + g.pts + ' pts</span></div>';
    });
    H += '<div style="height:12px"></div>';
  });
  if (!gaps.length) H += '<p>' + esc(x.none || 'Sigue midiendo y mejorando cada mes.') + '</p>';
  if (passed.length) H += '<h2 style="font-size:16px;color:#15803d;margin:8px 0 6px">Lo que ya tienes resuelto</h2><ul style="margin:0 0 20px;padding-left:20px">' + passed.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>';
  H += '<p style="margin:24px 0"><a href="' + esc(link) + '" style="display:inline-block;background:#380757;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px">Quiero que lo hagamos juntos</a></p>' +
    '<p style="color:#4a3b57;font-size:13px">Los resultados son una simulación de referencia: dependen de tu negocio y de tu mercado.</p>' +
    '<p style="margin:16px 0 0">¿Dudas? Responde este correo o escríbenos a <a href="mailto:hola@efectowow.co" style="color:#380757">hola@efectowow.co</a>.</p>' +
    '<p style="margin:20px 0 0;font-size:12px;color:#7a6b88">Workshop of Wonders · efectowow.co</p></div>';
  return { subject: subject, text: text.join('\n'), html: H };
}

// Confirmación al formulario "Cuéntanos tu proyecto": le dice a la persona que recibimos su mensaje y qué sigue.
// Contenido fijo (solo el nombre, escapado): no se puede usar para enviar mensajes a medida.
function contacto(lead) {
  var first = String(lead.name || '').trim().split(/\s+/)[0].slice(0, 40);
  var hi = first ? 'Hola ' + first + ',' : 'Hola,';
  var subject = 'Recibimos tu proyecto';
  var text = [hi, '', 'Gracias por escribirnos: recibimos tu mensaje.', '',
    'QUÉ SIGUE', '1. Leemos lo que nos cuentas y revisamos tu sitio o tu marca.', '2. Te escribimos con preguntas o con una propuesta de siguiente paso.', '3. Si te sirve, agendamos una llamada corta, sin compromiso.', '',
    'Mientras tanto, puedes jugar con las herramientas gratis del Playground: https://www.efectowow.co/playground.html', '',
    'Si quieres agregar algo, responde este correo.', '', 'Workshop of Wonders · efectowow.co'].join('\n');
  var step = function (n, t) { return '<tr><td style="vertical-align:top;padding:0 12px 10px 0"><span style="display:inline-block;width:26px;height:26px;line-height:26px;text-align:center;border-radius:50%;background:#dce157;color:#380757;font-weight:700">' + n + '</span></td><td style="padding:2px 0 10px">' + t + '</td></tr>'; };
  var html = '<div style="font-family:Arial,Helvetica,sans-serif;color:#1a1320;max-width:600px;margin:0 auto;padding:24px;line-height:1.55">' +
    '<img src="https://www.efectowow.co/design-system/wonders/Wonder_Morado_Celebrando.png" alt="" width="72" height="71" style="display:block;width:72px;height:auto;margin:0 0 6px;border:0">' +
    '<p style="margin:0 0 4px;font-size:12px;letter-spacing:.14em;font-weight:700;color:#380757">WORKSHOP OF WONDERS</p>' +
    '<h1 style="margin:0 0 12px;font-size:24px;color:#380757">Recibimos tu proyecto</h1>' +
    '<p style="margin:0 0 16px">' + esc(hi) + ' gracias por escribirnos: recibimos tu mensaje.</p>' +
    '<h2 style="font-size:16px;color:#380757;margin:0 0 8px">Qué sigue</h2><table role="presentation" style="border-collapse:collapse">' +
    step(1, 'Leemos lo que nos cuentas y revisamos tu sitio o tu marca.') + step(2, 'Te escribimos con preguntas o con una propuesta de siguiente paso.') + step(3, 'Si te sirve, agendamos una llamada corta, sin compromiso.') + '</table>' +
    '<p style="margin:16px 0">Mientras tanto, prueba las <a href="https://www.efectowow.co/playground.html" style="color:#380757;font-weight:700">herramientas gratis del Playground</a>.</p>' +
    '<p style="margin:0">¿Quieres agregar algo? Responde este correo.</p>' +
    '<p style="margin:20px 0 0;font-size:12px;color:#7a6b88">Workshop of Wonders · efectowow.co</p></div>';
  return { subject: subject, text: text, html: html };
}
function buildAck(lead) { return contacto(lead); }

var BUILDERS = { encabezados: encabezados, revision: revision };

// null si ese simulador aún no tiene correo.
function buildEmail(run) {
  if (String(run.tool).indexOf('sim:') === 0) return simulador(run);
  return BUILDERS[run.tool] ? BUILDERS[run.tool](run) : null;
}

// Devuelve 'sent' | 'dry-run' | 'not_configured' | 'error'.
async function sendMail(to, mail) {
  var key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.VERCEL) { console.error('_diagnostico.js: falta RESEND_API_KEY, no se envió el correo'); return 'not_configured'; }
    console.log('\n[correo de prueba] Para: ' + to + '\nAsunto: ' + mail.subject + '\n\n' + mail.text + '\n');
    return 'dry-run';
  }
  try {
    var res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.MAIL_FROM || 'Workshop of Wonders <hola@efectowow.co>',
        to: [to], reply_to: process.env.MAIL_REPLY_TO || 'hola@efectowow.co',
        subject: mail.subject, html: mail.html, text: mail.text
      })
    });
    if (!res.ok) { console.error('_diagnostico.js: Resend respondió ' + res.status, await res.text().catch(function () { return ''; })); return 'error'; }
    return 'sent';
  } catch (e) {
    console.error('_diagnostico.js: no se pudo enviar el correo', e);
    return 'error';
  }
}

// Para el panel /admin: el correo de un simulador armado con un resultado de ejemplo.
var SAMPLES = {
  encabezados: {
    tool: 'encabezados', url: 'https://tusitio.com/', host: 'www.tusitio.com',
    result: { score: 72, issues: [
      { code: 'multi_h1', type: 'error', msg: 'La página tiene 2 H1; debería tener uno solo.' },
      { code: 'skip', type: 'warning', msg: 'Hay un salto de H2 a H4.' },
      { code: 'meta_len', type: 'warning', msg: 'La meta description mide 98 caracteres (ideal 120–160).' }
    ], passed: ['El title existe y mide 54 caracteres', 'El primer encabezado es un H1'] }
  }
};
SAMPLES.revision = {
  tool: 'revision', url: 'https://tusitio.com/', host: 'www.tusitio.com',
  result: { score: 64, issues: [
    { code: 'noindex', type: 'error', msg: 'Tu página le pide a Google que NO la guarde (noindex): no aparecerá en los resultados.' },
    { code: 'no_meta', type: 'warn', msg: 'Tu página no tiene descripción (meta description): Google inventa una por ti.' },
    { code: 'no_sitemap', type: 'warn', msg: 'No encontramos el mapa del sitio (sitemap.xml).' }
  ], passed: ['Tu sitio usa HTTPS.', 'Tu página está preparada para el celular.'] }
};
SAMPLES['sim:ias-te-citan'] = {
  tool: 'sim:ias-te-citan', url: 'https://www.efectowow.co/playground/ias-te-citan.html', host: 'www.efectowow.co',
  result: { title: '¿Las IAs te recomiendan cuando alguien pregunta?', score: 38, passed: ['Tu web explica con claridad quién eres'],
    extra: { service: 'seo', tier: ['Te conocen a medias', 'Las IAs ya encuentran algo de ti, pero rara vez te eligen como fuente.'], none: '',
      gaps: [{ step: 'Crear contenido en formato pregunta-respuesta', pts: 14 }, { step: 'Ganar menciones en medios, directorios y reseñas', pts: 14 }, { step: 'Implementar schema en tus páginas clave', pts: 12, half: true }, { step: 'Publicar un llms.txt', pts: 8 }, { step: 'Monitorear menciones y citas', pts: 14 }] } }
};
function sampleEmail(tool) {
  if (!SAMPLES[tool] && String(tool).indexOf('sim:') === 0) {
    var cfg = require('./_sims.json')[tool.slice(4)], base = SAMPLES['sim:ias-te-citan'];
    if (cfg) SAMPLES[tool] = { tool: tool, url: base.url, host: base.host, result: Object.assign({}, base.result, { title: cfg.title, extra: Object.assign({}, base.result.extra, { service: cfg.service, tier: cfg.tiers[1] }) }) };
  }
  return SAMPLES[tool] ? buildEmail(SAMPLES[tool]) : null;
}

module.exports = { buildAck: buildAck, buildEmail: buildEmail, sendMail: sendMail, sampleEmail: sampleEmail };
