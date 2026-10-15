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

function analyze(html) {
  var body = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi, '');
  var title = (body.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1];
  var metaTag = body.match(/<meta[^>]+name=["']description["'][^>]*>/i);
  var meta = metaTag && (metaTag[0].match(/content=["']([^"']*)["']/i) || [])[1];
  var headings = [], re = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, m;
  while ((m = re.exec(body)) && headings.length < 300) headings.push({ level: +m[1], text: clean(m[2]).slice(0, 200) });

  var issues = [], h1 = headings.filter(function (h) { return h.level === 1; });
  if (!h1.length) issues.push({ code: 'no_h1', type: 'error', msg: 'No tiene H1. Cada página debería tener uno que diga de qué trata.' });
  if (h1.length > 1) issues.push({ code: 'multi_h1', type: 'warn', msg: 'Tiene ' + h1.length + ' H1. Lo recomendable es uno solo por página.' });
  if (h1.length === 1 && h1[0].text.length > 70) issues.push({ code: 'long_h1', type: 'warn', msg: 'El H1 es muy largo (' + h1[0].text.length + ' caracteres). Intenta dejarlo por debajo de 70.' });
  if (headings.some(function (h) { return !h.text; })) issues.push({ code: 'empty', type: 'warn', msg: 'Hay encabezados vacíos o que solo contienen imágenes.' });
  for (var i = 1; i < headings.length; i++) {
    if (headings[i].level - headings[i - 1].level > 1) {
      issues.push({ code: 'skip', type: 'warn', msg: 'Salta de H' + headings[i - 1].level + ' a H' + headings[i].level + ' en «' + (headings[i].text || 'encabezado vacío').slice(0, 60) + '». No te saltes niveles.' });
      break;
    }
  }
  if (headings.length && headings[0].level !== 1) issues.push({ code: 'first_not_h1', type: 'warn', msg: 'El primer encabezado de la página es un H' + headings[0].level + ', no un H1.' });
  if (!meta) issues.push({ code: 'no_meta', type: 'warn', msg: 'No tiene meta description.' });
  return { title: title ? clean(title) : '', metaDescription: meta ? decode(meta).trim() : '', headings: headings, counts: [1, 2, 3, 4, 5, 6].map(function (l) { return headings.filter(function (h) { return h.level === l; }).length; }), issues: issues };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }
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
    return res.status(200).json({ success: true, url: u.toString(), result: analyze(result.html) });
  } catch (err) {
    var code = err && err.message === 'blocked_address' ? 'invalid_url' : err && err.message === 'too_large' ? 'too_large' : err && err.message === 'timeout' ? 'timeout' : 'unreachable';
    return res.status(code === 'invalid_url' ? 400 : 422).json({ success: false, error: code });
  }
};
module.exports.analyze = analyze;
