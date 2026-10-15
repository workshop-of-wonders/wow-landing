// Usos del Playground (calidad y saber quién usa los simuladores). Guarda el link sin parámetros y el resultado
// completo; no guarda la IP. Cada uso tiene una clave secreta ("id.token"): solo quien la tiene puede pedir el detalle
// del diagnóstico al dejar su correo (/api/contact), así no se puede adivinar el de otra persona.
// Sin base de datos configurada y fuera de Vercel (desarrollo local) usa memoria, para poder probar el flujo.
// Si la base falla en producción, el simulador sigue funcionando: saveRun devuelve null.

var crypto = require('crypto');
var mem = {}, memSeq = 0, ready = false;

function hasDb() { return !!(process.env.POSTGRES_URL || process.env.DATABASE_URL); }
function useMemory() { return !hasDb() && !process.env.VERCEL; }

async function ensure(db) {
  if (ready) return;
  await db.sql`CREATE TABLE IF NOT EXISTS playground_runs (
    id SERIAL PRIMARY KEY, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), tool TEXT NOT NULL,
    url TEXT, host TEXT, score INT, issues TEXT, counts TEXT, country TEXT)`;
  await db.sql`ALTER TABLE playground_runs ADD COLUMN IF NOT EXISTS result TEXT`;
  await db.sql`ALTER TABLE playground_runs ADD COLUMN IF NOT EXISTS token TEXT`;
  await db.sql`ALTER TABLE playground_runs ADD COLUMN IF NOT EXISTS emailed_to TEXT`;
  await db.sql`ALTER TABLE playground_runs ADD COLUMN IF NOT EXISTS emailed_at TIMESTAMPTZ`;
  ready = true;
}

// Devuelve la clave "id.token" del uso guardado, o null si no se pudo guardar.
async function saveRun(tool, u, analysis, country) {
  var clean = u.origin + u.pathname, token = crypto.randomBytes(12).toString('hex');
  var result = JSON.stringify({
    title: analysis.title, score: analysis.score, counts: analysis.counts, jsRendered: analysis.jsRendered,
    issues: analysis.issues.map(function (i) { return { code: i.code, type: i.type, msg: i.msg }; }), passed: analysis.passed
  });
  if (useMemory()) {
    var id = 'L' + (++memSeq);
    mem[id] = { id: id, created_at: new Date().toISOString(), tool: tool, url: clean, host: u.hostname, score: analysis.score, result: result, token: token };
    return id + '.' + token;
  }
  try {
    var db = require('./admin/_db');
    await ensure(db);
    var r = await db.sql`INSERT INTO playground_runs (tool, url, host, score, issues, counts, country, result, token)
      VALUES (${tool}, ${clean}, ${u.hostname}, ${analysis.score},
              ${analysis.issues.map(function (i) { return i.code; }).join(',')}, ${analysis.counts.join(',')}, ${country || null}, ${result}, ${token})
      RETURNING id`;
    return r.rows[0].id + '.' + token;
  } catch (e) {
    console.error('_runs.js: no se pudo guardar el uso', e);
    return null;
  }
}

// Busca un uso por su clave "id.token". Devuelve null si no existe o el token no coincide.
async function getRun(key) {
  var m = /^(L?\d+)\.([a-f0-9]{16,})$/.exec(String(key || ''));
  if (!m) return null;
  var run = null;
  if (useMemory()) run = mem[m[1]] || null;
  else {
    var n = parseInt(m[1], 10);
    if (!(n > 0)) return null;
    try {
      var db = require('./admin/_db');
      await ensure(db);
      var r = await db.sql`SELECT id, tool, url, host, score, result, token FROM playground_runs WHERE id = ${n}`;
      run = r.rows[0] || null;
    } catch (e) {
      console.error('_runs.js: no se pudo leer el uso', e);
      return null;
    }
  }
  if (!run || !run.token) return null;
  var a = Buffer.from(run.token), b = Buffer.from(m[2]);
  return a.length === b.length && crypto.timingSafeEqual(a, b) ? run : null;
}

// Reserva el envío del diagnóstico de este uso. Devuelve false si ya se envió (un correo por revisión) o si ese
// correo ya recibió 5 en la última hora.
async function claimEmail(run, email) {
  var addr = String(email).toLowerCase();
  if (useMemory()) {
    var m = mem[String(run.id)];
    if (!m || m.emailed_at) return false;
    var sent = Object.keys(mem).filter(function (k) { return mem[k].emailed_to === addr; }).length;
    if (sent >= 5) return false;
    m.emailed_at = new Date().toISOString(); m.emailed_to = addr;
    return true;
  }
  try {
    var db = require('./admin/_db');
    await ensure(db);
    var recent = await db.sql`SELECT COUNT(*)::int AS n FROM playground_runs WHERE emailed_to = ${addr} AND emailed_at > now() - interval '1 hour'`;
    if (recent.rows[0].n >= 5) return false;
    var r = await db.sql`UPDATE playground_runs SET emailed_to = ${addr}, emailed_at = now() WHERE id = ${parseInt(run.id, 10)} AND emailed_at IS NULL RETURNING id`;
    return r.rows.length > 0;
  } catch (e) {
    console.error('_runs.js: no se pudo reservar el envío', e);
    return false;
  }
}

// Lista de usos para el panel /admin (más recientes primero). Nunca devuelve el token. tool = simulador ('encabezados').
async function listRuns(tool, limit) {
  limit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 500);
  function shape(r) {
    var res = null; try { res = typeof r.result === 'string' ? JSON.parse(r.result) : r.result; } catch (e) {}
    return { id: r.id, created_at: r.created_at || null, tool: r.tool, url: r.url, host: r.host, score: r.score, country: r.country || null,
      emailed_to: r.emailed_to || null, emailed_at: r.emailed_at || null, result: res };
  }
  if (useMemory()) {
    return Object.keys(mem).map(function (k) { return mem[k]; }).filter(function (r) { return r.tool === tool; }).reverse().slice(0, limit).map(shape);
  }
  var db = require('./admin/_db');
  await ensure(db);
  var r = await db.sql`SELECT id, created_at, tool, url, host, score, country, result, emailed_to, emailed_at
    FROM playground_runs WHERE tool = ${tool} ORDER BY created_at DESC LIMIT ${limit}`;
  return r.rows.map(shape);
}

// Cantidad de usos por simulador, para los contadores de las pestañas.
async function countRuns() {
  var out = {};
  if (useMemory()) { Object.keys(mem).forEach(function (k) { out[mem[k].tool] = (out[mem[k].tool] || 0) + 1; }); return out; }
  var db = require('./admin/_db');
  await ensure(db);
  var r = await db.sql`SELECT tool, COUNT(*)::int AS n FROM playground_runs GROUP BY tool`;
  r.rows.forEach(function (x) { out[x.tool] = x.n; });
  return out;
}

module.exports = { saveRun: saveRun, getRun: getRun, claimEmail: claimEmail, listRuns: listRuns, countRuns: countRuns };
