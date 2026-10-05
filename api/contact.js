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
  var need = typeof body.need === 'string' ? body.need.trim() : '';
  var budget = typeof body.budget === 'string' ? body.budget.trim() : '';
  var country = typeof body.country === 'string' ? body.country.trim().slice(0, 80) : '';
  var details = typeof body.details === 'string' ? body.details.trim() : '';
  var lang = typeof body.lang === 'string' ? body.lang.trim() : '';
  var page = typeof body.page === 'string' ? body.page.trim() : '';
  // Honeypot field, if the frontend forwards it — never trust client-side
  // filtering alone; a bot that skips JS can still hit this endpoint directly.
  var website = typeof body.website === 'string' ? body.website.trim() : '';

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

  try {
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
    console.error('contact.js: no se pudo guardar el lead en la base de datos', dbErr);
    return res.status(500).json({ success: false, error: 'db_error' });
  }

  return res.status(200).json({ success: true });
};
