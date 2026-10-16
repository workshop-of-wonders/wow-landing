// Vercel serverless function — Playground: lee una URL pública y devuelve su estructura de
// encabezados (H1–H6) con alertas básicas de SEO.
//
// Seguridad: es un fetch del lado servidor a una URL que escribe el usuario, así que se protege
// contra SSRF: solo http/https, puertos 80/443, y cada conexión se hace sobre la IP ya validada
// (lookup propio) para que no se pueda re-resolver a una IP interna. Los redirects se siguen a
// mano revalidando cada salto. Límites de tiempo y de tamaño para no colgar la función.

var dns = require('dns');
var net = require('net');
var http = require('http');
var https = require('https');

var MAX_BYTES = 1500000;
var MAX_REDIRECTS = 3;
var TIMEOUT_MS = 8000;
var MAX_HEADING = 500;
var MAX_SCORE = 95;
var MAX_PARAGRAPH = 1500;

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    var p = ip.split('.').map(Number);
    return p[0] === 0 || p[0] === 10 || p[0] === 127 ||
      (p[0] === 100 && p[1] >= 64 && p[1] <= 127) ||
      (p[0] === 169 && p[1] === 254) ||
      (p[0] === 172 && p[1] >= 16 && p[1] <= 31) ||
      (p[0] === 192 && p[1] === 168) ||
      (p[0] === 192 && p[1] === 0 && p[2] === 0) ||
      (p[0] === 198 && (p[1] === 18 || p[1] === 19)) ||
      p[0] >= 224;
  }
  var v = ip.toLowerCase();
  if (v === '::1' || v === '::') return true;
  if (v.indexOf('::ffff:') === 0) return isPrivateIp(v.slice(7));
  return /^f[cd]/.test(v) || /^fe[89ab]/.test(v);
}

// Mismo contrato que dns.lookup, pero rechaza cualquier IP no pública.
function safeLookup(hostname, options, cb) {
  if (typeof options === 'function') { cb = options; options = {}; }
  dns.lookup(hostname, { all: true }, function (err, addrs) {
    if (err) return cb(err);
    var ok = addrs.filter(function (a) { return !isPrivateIp(a.address); });
    if (!ok.length || ok.length !== addrs.length) {
      var e = new Error('blocked_address'); e.code = 'EBLOCKED'; return cb(e);
    }
    if (options && options.all) return cb(null, ok);
    cb(null, ok[0].address, ok[0].family);
  });
}

function fetchOnce(u) {
  return new Promise(function (resolve, reject) {
    var lib = u.protocol === 'https:' ? https : http;
    var req = lib.request({
      protocol: u.protocol, hostname: u.hostname, port: u.port || undefined,
      path: u.pathname + u.search, method: 'GET', lookup: safeLookup, timeout: TIMEOUT_MS,
      headers: { 'User-Agent': 'WOW-Playground/1.0 (+https://www.efectowow.co/playground.html)', 'Accept': 'text/html,application/xhtml+xml', 'Accept-Encoding': 'identity' }
    }, function (res) {
      var status = res.statusCode || 0;
      if (status >= 300 && status < 400 && res.headers.location) { res.resume(); return resolve({ redirect: res.headers.location }); }
      var type = String(res.headers['content-type'] || '');
      if (!/html|xml/i.test(type)) { res.resume(); return resolve({ status: status, notHtml: true }); }
      var chunks = [], size = 0;
      res.on('data', function (c) {
        size += c.length;
        if (size > MAX_BYTES) { req.destroy(new Error('too_large')); return; }
        chunks.push(c);
      });
      res.on('end', function () { resolve({ status: status, html: Buffer.concat(chunks).toString('utf8') }); });
      res.on('error', reject);
    });
    req.on('timeout', function () { req.destroy(new Error('timeout')); });
    req.on('error', reject);
    req.end();
  });
}

function validate(raw) {
  var u;
  try { u = new URL(/^https?:\/\//i.test(raw) ? raw : 'https://' + raw); } catch (e) { return null; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  if (u.username || u.password) return null;
  if (u.port && u.port !== '80' && u.port !== '443') return null;
  if (net.isIP(u.hostname) && isPrivateIp(u.hostname)) return null;
  if (!net.isIP(u.hostname) && u.hostname.indexOf('.') === -1) return null;
  return u;
}

var ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, function (m, e) {
    if (e[0] === '#') {
      var n = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m;
    }
    return ENT[e.toLowerCase()] !== undefined ? ENT[e.toLowerCase()] : m;
  });
}
function clean(s) { return decode(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim(); }

function words(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/[^a-z0-9]+/).filter(function (w) { return w.length >= 3; });
}

// Menú, pie y barras laterales: sus encabezados no son el contenido de la página.
var CHROME_RE = /<(nav|footer|aside)\b[^>]*>[\s\S]*?<\/\1>|<(ul|ol|section|header)\b[^>]*\brole=["'](?:navigation|contentinfo|complementary)["'][^>]*>[\s\S]*?<\/\2>/gi;
var JS_MARKER = /id=["'](root|__next|__nuxt|app)["']|ng-version|data-reactroot|data-server-rendered|enable javascript|habilita(r)? javascript|activa(r)? javascript/i;

function analyze(html) {
  var body = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi, '');
  var title = (body.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1];
  var metaTag = (body.match(/<meta\b[^>]*\bname=["']description["'][^>]*>/i) || [])[0];
  var meta = metaTag && (metaTag.match(/\bcontent=(?:"([^"]*)"|'([^']*)')/i) || []);
  meta = meta && (meta[1] !== undefined ? meta[1] : meta[2]);

  var ranges = [], cm;
  CHROME_RE.lastIndex = 0;
  while ((cm = CHROME_RE.exec(body))) ranges.push([cm.index, cm.index + cm[0].length]);
  function inChrome(i) { for (var k = 0; k < ranges.length; k++) if (i >= ranges[k][0] && i < ranges[k][1]) return true; return false; }

  // Encabezados y párrafos en el orden en que aparecen en la página (blocks); headings es solo la parte H.
  var headings = [], blocks = [], re = /<(h[1-6]|p)\b[^>]*>([\s\S]*?)<\/\1>/gi, m;
  while ((m = re.exec(body)) && blocks.length < 600) {
    var chrome = inChrome(m.index);
    if (m[1].toLowerCase() === 'p') {
      var pt = clean(m[2]).slice(0, MAX_PARAGRAPH);
      if (pt) blocks.push({ type: 'p', text: pt, chrome: chrome });
    } else if (headings.length < 300) {
      var h = { level: +m[1].slice(1), text: clean(m[2]).slice(0, MAX_HEADING), chrome: chrome };
      headings.push(h); blocks.push({ type: 'h', level: h.level, text: h.text, chrome: chrome });
    }
  }
  var paragraphs = blocks.filter(function (b) { return b.type === 'p'; });

  // ¿Se arma con JavaScript? Si casi no hay contenido en el HTML pero hay señales de app de cliente.
  var visible = clean(body.replace(/<head\b[\s\S]*?<\/head>/i, '')).length;
  var scripts = (html.match(/<script\b/gi) || []).length;
  var jsRendered = (!headings.length && visible < 600 && (JS_MARKER.test(html) || (scripts > 0 && !paragraphs.length))) ||
    (headings.length <= 1 && paragraphs.length < 3 && JS_MARKER.test(html)) ||
    (headings.length <= 2 && paragraphs.length < 3 && visible < 1500 && scripts >= 6);

  // Las alertas miran el contenido; si todo está en menú/pie, se miran todos.
  var content = headings.filter(function (h) { return !h.chrome; });
  if (!content.length) content = headings;
  var issues = [];
  function add(code, type, pts, msg) { issues.push({ code: code, type: type, pts: pts, msg: msg }); }

  var titleText = title ? clean(title) : '', metaText = meta ? decode(meta).trim() : '';
  var h1 = content.filter(function (h) { return h.level === 1; });
  if (jsRendered) add('js_render', 'warn', 0, 'Parece un sitio que se arma con JavaScript: casi no hay encabezados en el HTML que recibe Google.');
  else {
    if (!h1.length) add('no_h1', 'error', 30, 'No tiene H1. Cada página debería tener uno que diga de qué trata.');
    if (h1.length > 1) add('multi_h1', 'warn', 10, 'Tiene ' + h1.length + ' H1. Lo recomendable es uno solo por página.');
    if (h1.length === 1 && h1[0].text.length > 70) add('long_h1', 'warn', 5, 'El H1 es muy largo (' + h1[0].text.length + ' caracteres). Intenta dejarlo por debajo de 70.');
    if (content.some(function (h) { return !h.text; })) add('empty', 'warn', 5, 'Hay encabezados vacíos o que solo contienen imágenes.');
    var skips = [];
    for (var i = 1; i < content.length; i++) {
      if (content[i].level - content[i - 1].level > 1) skips.push({ from: content[i - 1].level, to: content[i].level, text: content[i].text });
    }
    if (skips.length) add('skip', 'warn', 10, (skips.length === 1 ? 'Salta' : 'Salta ' + skips.length + ' veces; la primera,') + ' de H' + skips[0].from + ' a H' + skips[0].to + ' en «' + (skips[0].text || 'encabezado vacío').slice(0, 60) + '». No te saltes niveles.');
    if (content.length && content[0].level !== 1) add('first_not_h1', 'warn', 8, 'El primer encabezado de la página es un H' + content[0].level + ', no un H1.');
    var seen = {}, dups = [];
    content.forEach(function (h) { var k = h.text.toLowerCase(); if (k.length < 3) return; if (seen[k] === 1) dups.push(h.text); seen[k] = (seen[k] || 0) + 1; });
    if (dups.length) add('dup', 'warn', 5, 'Hay ' + dups.length + ' encabezado' + (dups.length > 1 ? 's repetidos' : ' repetido') + ', por ejemplo «' + dups[0].slice(0, 50) + '». Cada uno debería decir algo distinto.');
  }
  if (!titleText) add('no_title', 'error', 10, 'No tiene title. Es el título que aparece en Google.');
  else if (titleText.length < 30 || titleText.length > 60) add('title_len', 'warn', 4, 'El title mide ' + titleText.length + ' caracteres. Lo ideal es entre 30 y 60.');
  if (!metaText) add('no_meta', 'warn', 8, 'No tiene meta description.');
  else if (metaText.length < 120 || metaText.length > 160) add('meta_len', 'warn', 4, 'La meta description mide ' + metaText.length + ' caracteres. Lo ideal es entre 120 y 160.');
  if (!jsRendered && titleText && h1.length) {
    var tw = words(titleText), hw = words(h1[0].text);
    if (tw.length && hw.length && !hw.some(function (w) { return tw.indexOf(w) !== -1; })) add('h1_title_diff', 'warn', 4, 'El H1 y el title no comparten ninguna palabra. Deberían hablar de lo mismo.');
  }

  // Lo que está bien (para decirle a la persona qué mantener).
  var passed = [], has = function (c) { return issues.some(function (i) { return i.code === c; }); };
  if (!jsRendered) {
    if (h1.length === 1) passed.push('Tienes un solo H1.');
    if (h1.length === 1 && !has('long_h1')) passed.push('Tu H1 es corto y claro.');
    if (content.length > 1 && !has('skip')) passed.push('Tus títulos siguen un orden, sin saltarse niveles.');
    if (content.length > 1 && !has('dup')) passed.push('No repites títulos.');
  }
  if (titleText && !has('title_len')) passed.push('El title tiene un buen largo.');
  if (metaText && !has('meta_len')) passed.push('La meta description tiene un buen largo.');

  // Puntaje: 100 menos los puntos de cada alerta. Nunca pasa de MAX_SCORE: este simulador solo mira el HTML básico,
  // y una revisión completa (contenido, velocidad, enlaces, datos estructurados) siempre encuentra algo más que mejorar.
  var penalty = issues.reduce(function (a, i) { return a + i.pts; }, 0);
  return {
    title: titleText, metaDescription: metaText, headings: headings, blocks: blocks, paragraphs: paragraphs.length,
    chromeHeadings: headings.filter(function (h) { return h.chrome; }).length,
    counts: [1, 2, 3, 4, 5, 6].map(function (l) { return headings.filter(function (h) { return h.level === l; }).length; }),
    jsRendered: jsRendered, score: jsRendered ? null : Math.max(0, Math.min(MAX_SCORE, 100 - penalty)), passed: passed, issues: issues
  };
}

var runs = require('./_runs');

// Límite de uso: 15 revisiones cada 10 minutos por persona. La cuenta vive solo en memoria de la función (no se guarda ni
// la IP). En Vercel cada instancia cuenta aparte, así que es una primera barrera; la definitiva es la regla de límite
// de tasa del Firewall de Vercel sobre /api/headings.
var hits = {}, RATE_MAX = 15, RATE_WINDOW = 600000;
function rateLimited(req) {
  var ip = String((req.headers && req.headers['x-forwarded-for']) || (req.socket && req.socket.remoteAddress) || 'local').split(',')[0].trim();
  var now = Date.now(), list = (hits[ip] || []).filter(function (t) { return now - t < RATE_WINDOW; });
  list.push(now); hits[ip] = list;
  var keys = Object.keys(hits);
  if (keys.length > 5000) keys.forEach(function (k) { if (!hits[k].some(function (t) { return now - t < RATE_WINDOW; })) delete hits[k]; });
  return list.length > RATE_MAX;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }
  if (rateLimited(req)) { res.setHeader('Retry-After', '180'); return res.status(429).json({ success: false, error: 'rate_limited' }); }
  var body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  var raw = body && typeof body.url === 'string' ? body.url.trim().slice(0, 2000) : '';
  var u = raw && validate(raw);
  if (!u) return res.status(400).json({ success: false, error: 'invalid_url' });

  try {
    var result;
    for (var hop = 0; hop <= MAX_REDIRECTS; hop++) {
      result = await fetchOnce(u);
      if (!result.redirect) break;
      u = validate(new URL(result.redirect, u).toString());
      if (!u) return res.status(400).json({ success: false, error: 'invalid_url' });
      result = null;
    }
    if (!result) return res.status(422).json({ success: false, error: 'too_many_redirects' });
    if (result.notHtml) return res.status(422).json({ success: false, error: 'not_html' });
    if (result.status >= 400) return res.status(422).json({ success: false, error: 'http_' + result.status });
    res.setHeader('Cache-Control', 'no-store');
    var analysis = analyze(result.html);
    var runKey = await runs.saveRun('encabezados', u, analysis, req.headers && req.headers['x-vercel-ip-country']);
    // El detalle de las alertas nunca viaja al navegador: llega por correo (/api/contact, con la clave del uso).
    // Si la base falló y no hay clave, el lead se guarda igual y el equipo escribe a mano.
    var result = Object.assign({}, analysis, { withheld: true, issueCount: analysis.issues.length, issues: [], passed: [] });
    return res.status(200).json({ success: true, url: u.toString(), runKey: runKey, result: result });
  } catch (err) {
    var code = err && err.message === 'blocked_address' ? 'invalid_url' : err && err.message === 'too_large' ? 'too_large' : err && err.message === 'timeout' ? 'timeout' : 'unreachable';
    return res.status(code === 'invalid_url' ? 400 : 422).json({ success: false, error: code });
  }
};
module.exports.analyze = analyze;
// Para api/revisar.js: misma lectura de páginas (con la protección SSRF de arriba), sin duplicarla.
module.exports.lib = { validate: validate, fetchOnce: fetchOnce, MAX_REDIRECTS: MAX_REDIRECTS, decode: decode, clean: clean };
