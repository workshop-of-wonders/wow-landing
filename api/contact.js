// Vercel serverless function (Node runtime) — auto-detected because it lives
// in /api, no vercel.json build step required.
//
// STATUS: deployed and connected — index.html, portafolio.html and
// servicios.html all POST here from their "Cuéntanos tu proyecto" form.
// Every valid submission is persisted to the `leads` Postgres table and
// shows up in the /admin dashboard. Intentionally no email notification —
// leads are meant to be reviewed from /admin, not by inbox.
//
// This function never receives or stores credentials from the client.

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }

  var body = req.body;
  // Vercel usually parses JSON bodies automatically, but guard against a
  // raw string body just in case (e.g. missing content-type header).
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  body = body || {};

  var email = typeof body.email === 'string' ? body.email.trim() : '';
  var name = typeof body.name === 'string' ? body.name.trim() : '';
  var company = typeof body.company === 'string' ? body.company.trim() : '';
  var need = typeof body.need === 'string' ? body.need.trim().slice(0, 200) : '';
  var budget = typeof body.budget === 'string' ? body.budget.trim() : '';
  var country = typeof body.country === 'string' ? body.country.trim().slice(0, 80) : '';
  var details = typeof body.details === 'string' ? body.details.trim().slice(0, 4000) : '';
  var lang = typeof body.lang === 'string' ? body.lang.trim() : '';
  var page = typeof body.page === 'string' ? body.page.trim() : '';
  // Honeypot field, if the frontend forwards it — never trust client-side
  // filtering alone; a bot that skips JS can still hit this endpoint directly.
  var website = typeof body.website === 'string' ? body.website.trim() : '';
  // Playground: el visitante solo deja el correo para recibir su diagnóstico, sin nombre.
  var isPlayground = body.kind === 'playground';
  if (isPlayground && !name) name = 'Playground';

  // Playground: si trae la clave de un uso del simulador, se anota el resultado en el lead y se entrega el detalle.
  var run = null;
  if (isPlayground && typeof body.runKey === 'string') {
    try {
      run = await require('./_runs').getRun(body.runKey);
      if (run) {
        var saved = JSON.parse(run.result);
        details = (details + '\nPuntaje: ' + (saved.score == null ? 'n/d' : saved.score) + ' · Alertas: ' + (saved.issues.map(function (i) { return i.code; }).join(', ') || 'ninguna')).slice(0, 4000);
      }
    } catch (runErr) { console.error('contact.js: no se pudo leer el uso del simulador', runErr); run = null; }
  }

  // Server-side validation — never trust the frontend alone.
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (website) {
    // Honeypot tripped: pretend success, do nothing further.
    return res.status(200).json({ success: true });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ success: false, error: 'invalid_email' });
  }
  if (!name) {
    return res.status(400).json({ success: false, error: 'invalid_name' });
  }

  // En desarrollo local sin base de datos el lead no se guarda (solo se avisa en la consola), para poder probar el flujo.
  var localNoDb = !process.env.VERCEL && !process.env.POSTGRES_URL && !process.env.DATABASE_URL;
  try {
    if (localNoDb) { console.log('[local] lead no guardado (sin base de datos):', email); throw { skipDb: true }; }
    var db = require('./admin/_db');
    // La columna `country` se agregó después de crear la tabla: se asegura aquí (idempotente) y, si por algún motivo
    // no se pudo crear, el lead se guarda igual sin país en vez de perderse.
    var hasCountry = true;
    try {
      await db.sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS country TEXT`;
    } catch (alterErr) {
      hasCountry = false;
      console.error('contact.js: no se pudo asegurar la columna country', alterErr);
    }
    if (hasCountry) {
      await db.sql`
        INSERT INTO leads (name, email, company, need, budget, details, page, lang, country)
        VALUES (${name}, ${email}, ${company || null}, ${need || null}, ${budget || null},
                ${details || null}, ${page || null}, ${lang || null}, ${country || null})
      `;
    } else {
      await db.sql`
        INSERT INTO leads (name, email, company, need, budget, details, page, lang)
        VALUES (${name}, ${email}, ${company || null}, ${need || null}, ${budget || null},
                ${details || null}, ${page || null}, ${lang || null})
      `;
    }
  } catch (dbErr) {
    if (!(dbErr && dbErr.skipDb)) {
      console.error('contact.js: no se pudo guardar el lead en la base de datos', dbErr);
      return res.status(500).json({ success: false, error: 'db_error' });
    }
  }

  // Playground: envía por correo el diagnóstico de la revisión (un correo por revisión). Si falla, el lead ya quedó guardado.
  var emailed = 'skipped';
  if (run) {
    try {
      var diag = require('./_diagnostico'), mail = diag.buildEmail(run);
      if (mail && await require('./_runs').claimEmail(run, email)) emailed = await diag.sendMail(email, mail);
    } catch (mailErr) {
      console.error('contact.js: no se pudo enviar el diagnóstico', mailErr);
      emailed = 'error';
    }
  }
  return res.status(200).json({ success: true, emailed: emailed });
};
