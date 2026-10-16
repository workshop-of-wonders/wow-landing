// Vercel serverless function — Playground "Revisión express": lee una página pública y devuelve un chequeo de lo básico
// que mira Google (HTTPS, title, meta description, H1, versión móvil, indexación, robots.txt, sitemap, datos estructurados…).
// Reutiliza la lectura segura de api/headings.js (protección SSRF, límites de tiempo y tamaño). El "cómo arreglarlo" de cada
// punto no viaja al navegador: llega por correo (api/_diagnostico.js, builder "revision") al dejar el correo.

var headings = require('./headings');
var L = headings.lib, runs = require('./_runs');

var MAX_SCORE = 95;

// Límite de uso: 12 revisiones cada 10 minutos por persona, en memoria (la definitiva es la regla del Firewall de Vercel).
var hits = {}, RATE_MAX = 12, RATE_WINDOW = 600000;
function rateLimited(req) {
  var ip = String((req.headers && req.headers['x-forwarded-for']) || (req.socket && req.socket.remoteAddress) || 'local').split(',')[0].trim();
  var now = Date.now(), list = (hits[ip] || []).filter(function (t) { return now - t < RATE_WINDOW; });
  list.push(now); hits[ip] = list;
  var keys = Object.keys(hits);
  if (keys.length > 5000) keys.forEach(function (k) { if (!hits[k].some(function (t) { return now - t < RATE_WINDOW; })) delete hits[k]; });
  return list.length > RATE_MAX;
}

// Lee la página siguiendo redirecciones a mano (cada salto se revalida).
async function load(u) {
  var result;
  for (var hop = 0; hop <= L.MAX_REDIRECTS; hop++) {
    result = await L.fetchOnce(u);
    if (!result.redirect) return { u: u, result: result };
    u = L.validate(new URL(result.redirect, u).toString());
    if (!u) return { bad: true };
  }
  return { tooMany: true };
}

// ¿Existe este archivo (robots.txt, sitemap.xml) en la raíz? Cualquier fallo cuenta como "no".
async function exists(origin, path) {
  try {
    var u = L.validate(origin + path);
    if (!u) return false;
    var got = await load(u);
    var r = got.result;
    return !!r && r.status >= 200 && r.status < 300;
  } catch (e) { return false; }
}

function attr(tag, name) {
  var m = tag.match(new RegExp('\\b' + name + '=(?:"([^"]*)"|\'([^\']*)\')', 'i'));
  return m ? (m[1] !== undefined ? m[1] : m[2]) : '';
}
function metaContent(html, key, val) {
  var re = /<meta\b[^>]*>/gi, m;
  while ((m = re.exec(html))) if (attr(m[0], key).toLowerCase() === val) return L.decode(attr(m[0], 'content')).trim();
  return '';
}

// Cada chequeo: code, pts (lo que resta si falla), ok, label (qué se revisó) y msg (qué encontramos).
function analyze(html, finalUrl, ms, hasRobots, hasSitemap) {
  var body = html.replace(/<!--[\s\S]*?-->/g, '');
  var head = (body.match(/<head\b[\s\S]*?<\/head>/i) || [body.slice(0, 20000)])[0];
  var visible = body.replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi, '');
  var title = L.clean(((visible.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]) || '');
  var desc = metaContent(head, 'name', 'description');
  var robots = metaContent(head, 'name', 'robots').toLowerCase();
  var viewport = metaContent(head, 'name', 'viewport');
  var canonical = /<link\b[^>]*\brel=["']canonical["'][^>]*>/i.test(head);
  var ogTitle = metaContent(head, 'property', 'og:title'), ogImage = metaContent(head, 'property', 'og:image');
  var h1s = [], hm, hre = /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi;
  while ((hm = hre.exec(visible))) if (L.clean(hm[1])) h1s.push(L.clean(hm[1]));
  var lang = /<html\b[^>]*\blang=["'][a-z]/i.test(body);
  var ld = /<script\b[^>]*type=["']application\/ld\+json["']/i.test(body);
  var imgs = visible.match(/<img\b[^>]*>/gi) || [], noAlt = imgs.filter(function (t) { return !/\balt=/i.test(t); }).length;
  var https = finalUrl.protocol === 'https:';
  var checks = [];
  function add(code, pts, ok, label, good, bad) { checks.push({ code: code, pts: pts, ok: !!ok, type: pts >= 10 ? 'error' : 'warn', label: label, msg: ok ? good : bad }); }

  add('https', 15, https, 'Candado de seguridad (HTTPS)', 'Tu sitio usa HTTPS.', 'Tu sitio no usa HTTPS: el navegador lo marca como "no seguro".');
  add('noindex', 20, !/noindex/.test(robots), 'Google puede guardar tu página', 'Nada le impide a Google guardar tu página.', 'Tu página le pide a Google que NO la guarde (noindex): no aparecerá en los resultados.');
  add('viewport', 12, !!viewport, 'Se ve bien en el celular', 'Tu página está preparada para el celular.', 'No encontramos la configuración para celular: la página puede verse diminuta en el teléfono.');
  add('no_title', 10, !!title, 'Título de la página', 'Tu página tiene título.', 'Tu página no tiene título (title): es lo que se ve en Google.');
  if (title) add('title_len', 3, title.length >= 30 && title.length <= 60, 'Largo del título', 'El título mide ' + title.length + ' caracteres, buen largo.', 'El título mide ' + title.length + ' caracteres. Lo ideal es entre 30 y 60.');
  add('no_h1', 10, h1s.length === 1, 'Un título principal (H1)', 'Tienes un solo título principal.', h1s.length ? 'Tienes ' + h1s.length + ' títulos principales (H1); lo ideal es uno.' : 'No encontramos un título principal (H1).');
  add('no_meta', 8, !!desc, 'Descripción para Google', 'Tu página tiene descripción.', 'Tu página no tiene descripción (meta description): Google inventa una por ti.');
  if (desc) add('meta_len', 3, desc.length >= 120 && desc.length <= 160, 'Largo de la descripción', 'La descripción mide ' + desc.length + ' caracteres, buen largo.', 'La descripción mide ' + desc.length + ' caracteres. Lo ideal es entre 120 y 160.');
  add('no_sitemap', 6, hasSitemap, 'Mapa del sitio (sitemap.xml)', 'Tu sitio tiene mapa para Google.', 'No encontramos el mapa del sitio (sitemap.xml) que ayuda a Google a recorrer tus páginas.');
  add('no_robots', 4, hasRobots, 'Archivo robots.txt', 'Tu sitio tiene robots.txt.', 'No encontramos el archivo robots.txt.');
  add('no_ld', 6, ld, 'Datos estructurados', 'Tu página tiene datos estructurados.', 'Tu página no tiene datos estructurados: Google y las IAs entienden menos quién eres y qué ofreces.');
  add('no_og', 4, !!(ogTitle && ogImage), 'Vista previa al compartir', 'Tu enlace se verá bien en WhatsApp y redes.', 'Tu enlace no tiene vista previa completa (imagen y título) al compartirlo en WhatsApp y redes.');
  if (imgs.length) add('alt', 6, noAlt / imgs.length <= 0.2, 'Descripción de imágenes (alt)', 'Casi todas tus imágenes tienen descripción.', noAlt + ' de ' + imgs.length + ' imágenes no tienen descripción (alt).');
  add('no_canonical', 4, canonical, 'Dirección principal (canonical)', 'Tu página indica cuál es su dirección principal.', 'Tu página no indica su dirección principal (canonical): Google puede confundirla con copias.');
  add('no_lang', 3, lang, 'Idioma de la página', 'Tu página declara su idioma.', 'Tu página no declara su idioma.');
  add('slow', 7, ms < 1500, 'Respuesta del servidor', 'Tu servidor respondió en ' + (ms / 1000).toFixed(1) + ' s.', 'Tu servidor tardó ' + (ms / 1000).toFixed(1) + ' s en responder. Lo ideal es menos de 1,5 s.');

  var penalty = checks.reduce(function (a, c) { return a + (c.ok ? 0 : c.pts); }, 0);
  var issues = checks.filter(function (c) { return !c.ok; });
  return {
    title: title, score: Math.max(0, Math.min(MAX_SCORE, 100 - penalty)), counts: [], jsRendered: false, ms: ms,
    checks: checks.map(function (c) { return { code: c.code, ok: c.ok, label: c.label, msg: c.msg, type: c.type }; }),
    issues: issues.map(function (c) { return { code: c.code, type: c.type, pts: c.pts, msg: c.msg }; }),
    passed: checks.filter(function (c) { return c.ok; }).map(function (c) { return c.msg; })
  };
}

// Señales que se pueden ver en el HTML y responden preguntas de los simuladores (Medición, IAs, Web lista, Visibilidad).
// Valor 1 = sí, 0.5 = en parte, 0 = no; si no se puede saber (p. ej. todo puede estar dentro de Tag Manager), la clave no aparece.
function signals(html, hasLlms) {
  var body = html.replace(/<!--[\s\S]*?-->/g, '');
  var head = (body.match(/<head[\s\S]*?<\/head>/i) || [body.slice(0, 20000)])[0];
  var visible = body.replace(/<(script|style|noscript|template)[\s\S]*?<\/>/gi, '');
  var text = L.clean(visible.replace(/<head[\s\S]*?<\/head>/i, ''));
  var spa = text.length < 500 && /id=["'](root|__next|__nuxt|app)["']/i.test(body);
  var out = {};
  function put(k, v) { if (v === undefined) return; if (spa && v < 1) return; out[k] = v; }
  var gtm = /googletagmanager\.com\/gtm\.js|GTM-[A-Z0-9]{4,}/.test(body);
  var ga4 = /googletagmanager\.com\/gtag\/js\?id=G-|["']G-[A-Z0-9]{8,}["']/.test(body);
  put('ga4', ga4 ? 1 : gtm ? undefined : 0);
  put('gtm', gtm ? 1 : 0);
  put('analytics', ga4 || gtm || /google-analytics\.com|plausible\.io|matomo|hotjar|clarity\.ms/i.test(body) ? 1 : 0);
  put('pixel', /connect\.facebook\.net\/[^"']*fbevents|fbq\(/.test(body) ? 1 : gtm ? undefined : 0);
  put('cookies', /cookiebot|onetrust|cookieyes|complianz|cookie-law|cookie-notice|iubenda|osano|termly|borlabs|cookie[-_]?(banner|consent|notice)|cc-window/i.test(body) ? 1 : gtm ? undefined : 0);
  if (metaContent(head, 'name', 'google-site-verification')) put('gsc', 1);
  var lds = body.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) || [], ldText = lds.join(' ');
  var types = {};
  (ldText.match(/"@type"\s*:\s*"[A-Za-z]+"/g) || []).forEach(function (t) { types[t.replace(/.*:\s*"/, '').replace('"', '')] = 1; });
  var hasOrg = types.Organization || types.LocalBusiness, hasRich = types.Service || types.FAQPage || types.Product;
  put('schema', hasOrg && hasRich ? 1 : lds.length ? 0.5 : 0);
  put('faq', types.FAQPage ? 1 : /preguntas frecuentes|faq/i.test(text) ? 0.5 : 0);
  put('llms', hasLlms ? 1 : 0);
  put('mobile', metaContent(head, 'name', 'viewport') ? 1 : 0);
  put('contact', /href=["'](tel:|mailto:|https?:\/\/(wa\.me|api\.whatsapp\.com|wa\.link))|<form/i.test(visible) ? 1 : 0);
  var title = /<title[^>]*>\s*\S/i.test(visible), desc = !!metaContent(head, 'name', 'description'), h1 = (visible.match(/<h1/gi) || []).length === 1;
  var n = (title ? 1 : 0) + (desc ? 1 : 0) + (h1 ? 1 : 0);
  put('seo', n === 3 ? 1 : n === 2 ? 0.5 : 0);
  return out;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ success: false, error: 'method_not_allowed' }); }
  if (rateLimited(req)) { res.setHeader('Retry-After', '180'); return res.status(429).json({ success: false, error: 'rate_limited' }); }
  var body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  var raw = body && typeof body.url === 'string' ? body.url.trim().slice(0, 2000) : '';
  var u = raw && L.validate(raw);
  if (!u) return res.status(400).json({ success: false, error: 'invalid_url' });

  try {
    var t0 = Date.now(), got = await load(u), ms = Date.now() - t0;
    if (got.bad) return res.status(400).json({ success: false, error: 'invalid_url' });
    if (got.tooMany) return res.status(422).json({ success: false, error: 'too_many_redirects' });
    var r = got.result; u = got.u;
    if (r.notHtml) return res.status(422).json({ success: false, error: 'not_html' });
    if (r.status >= 400) return res.status(422).json({ success: false, error: 'http_' + r.status });
    if (body.detect) {
      // Modo "autocompletar" de los simuladores: solo devuelve las señales; no guarda el uso.
      var llms = false;
      try { var lr = (await load(L.validate(u.origin + '/llms.txt'))).result; llms = !!lr && lr.status === 200 && lr.notHtml === true; } catch (e2) {}
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ success: true, url: u.toString(), signals: signals(r.html, llms) });
    }
    var found = await Promise.all([exists(u.origin, '/robots.txt'), exists(u.origin, '/sitemap.xml')]);
    var analysis = analyze(r.html, u, ms, found[0], found[1]);
    res.setHeader('Cache-Control', 'no-store');
    var runKey = await runs.saveRun('revision', u, analysis, req.headers && req.headers['x-vercel-ip-country']);
    // Solo viaja el resultado de cada punto (pasa / no pasa); el "cómo arreglarlo" llega por correo.
    var out = { title: analysis.title, score: analysis.score, ms: analysis.ms, issueCount: analysis.issues.length, checks: analysis.checks };
    return res.status(200).json({ success: true, url: u.toString(), runKey: runKey, result: out });
  } catch (err) {
    var code = err && err.message === 'blocked_address' ? 'invalid_url' : err && err.message === 'too_large' ? 'too_large' : err && err.message === 'timeout' ? 'timeout' : 'unreachable';
    return res.status(code === 'invalid_url' ? 400 : 422).json({ success: false, error: code });
  }
};
module.exports.analyze = analyze;
module.exports.signals = signals;
