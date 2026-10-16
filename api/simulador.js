// Vercel serverless function — Playground: simuladores de cuestionario (Visibilidad, IAs, Web lista, Medición…).
// Recibe SOLO el simulador y las respuestas (de 0 a 1: 1 = sí, 0.5 = en parte, 0 = no; los sliders mandan decimales), calcula el puntaje y el plan en el servidor con la
// configuración de api/_sims.json (se genera con scripts/build-sim-configs.py) y guarda el uso. Devuelve una clave (runKey) que
// el navegador envía a /api/contact al dejar el correo: el correo se arma con lo guardado aquí, nunca con texto que mande el
// navegador, así nadie puede usar este flujo para enviar mensajes a medida desde nuestro dominio.

var SIMS = require('./_sims.json');
var runs = require('./_runs');

var hits = {}, RATE_MAX = 30, RATE_WINDOW = 600000;
function rateLimited(req) {
  var ip = String((req.headers && req.headers['x-forwarded-for']) || (req.socket && req.socket.remoteAddress) || 'local').split(',')[0].trim();
  var now = Date.now(), list = (hits[ip] || []).filter(function (t) { return now - t < RATE_WINDOW; });
  list.push(now); hits[ip] = list;
  var keys = Object.keys(hits);
  if (keys.length > 5000) keys.forEach(function (k) { if (!hits[k].some(function (t) { return now - t < RATE_WINDOW; })) delete hits[k]; });
  return list.length > RATE_MAX;
}

// Mismo cálculo que el simulador del navegador (src/js/sim-modes.js): peso × respuesta, redondeado; niveles por cortes 30/60/85.
function evaluate(sim, answers) {
  var total = Math.round(sim.qs.reduce(function (t, q, k) { return t + q.w * (answers[k] == null ? 0 : answers[k]); }, 0));
  var cuts = [30, 60, 85, 101], i = cuts.findIndex(function (x) { return total < x; }), tier = sim.tiers[i < 0 ? 3 : i];
  var gaps = sim.qs.map(function (q, k) { return { k: k, step: q.s, lost: q.w * (1 - answers[k]), half: answers[k] === 0.5 }; })
    .filter(function (g) { return g.lost > 0.01; }).sort(function (a, b) { return b.lost - a.lost; });
  var strong = sim.qs.filter(function (q, k) { return answers[k] >= 0.99; }).map(function (q) { return q.q; });
  return { total: total, tier: tier, gaps: gaps, strong: strong };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ success: false, error: 'method_not_allowed' }); }
  if (rateLimited(req)) return res.status(429).json({ success: false, error: 'rate_limited' });
  var body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};
  var slug = typeof body.sim === 'string' ? body.sim : '';
  var sim = Object.prototype.hasOwnProperty.call(SIMS, slug) ? SIMS[slug] : null;
  var ans = Array.isArray(body.answers) ? body.answers : null;
  if (!sim || !ans || ans.length !== sim.qs.length) return res.status(400).json({ success: false, error: 'invalid' });
  var answers = ans.map(function (v) { return typeof v === 'number' && v >= 0 && v <= 1 ? v : null; });
  if (answers.some(function (v) { return v == null; })) return res.status(400).json({ success: false, error: 'invalid' });

  var r = evaluate(sim, answers);
  var analysis = {
    title: sim.title, score: r.total, counts: [], jsRendered: false,
    issues: r.gaps.map(function (g) { return { code: 'q' + g.k, type: g.lost >= 12 ? 'error' : 'warn', msg: g.step }; }),
    passed: r.strong,
    extra: { slug: slug, tier: r.tier, service: sim.service, none: sim.none, gaps: r.gaps.map(function (g) { return { step: g.step, pts: Math.round(g.lost), half: g.half }; }) }
  };
  try {
    var runKey = await runs.saveRun('sim:' + slug, new URL('https://www.efectowow.co/playground/' + slug + '.html'), analysis, req.headers && req.headers['x-vercel-ip-country']);
    return res.status(200).json({ success: true, runKey: runKey, score: r.total });
  } catch (e) {
    return res.status(200).json({ success: true, runKey: null, score: r.total });
  }
};
module.exports.evaluate = evaluate;
