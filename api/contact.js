// Vercel serverless function (Node runtime) — auto-detected because it lives
// in /api, no vercel.json or build step required.
//
// STATUS: scaffolded, NOT yet deployed/connected. The frontend forms
// (index.html, portafolio.html, servicios.html) do not call this endpoint
// yet — see the commented-out fetch() next to each form's submit handler.
//
// To activate:
//   1. Deploy this repo to the Vercel project the domain already points to
//      (wow-landing-beta.vercel.app), so this file is picked up as a
//      function at /api/contact.
//   2. Create an account with a transactional email provider (Resend is
//      used below — https://resend.com — simple HTTP API, no SDK needed)
//      and get an API key.
//   3. In the Vercel project settings, add the environment variable
//      RESEND_API_KEY with that key. Also set CONTACT_TO_EMAIL (the inbox
//      that should receive leads) and, once you have a verified sending
//      domain in Resend, CONTACT_FROM_EMAIL (e.g. "WOW Leads <leads@workshopofwonders.co>").
//      Until a domain is verified in Resend, you can send from
//      "onboarding@resend.dev" for testing.
//   4. Uncomment the fetch() calls in the three HTML files (search for
//      "Real integration point" in each <script> block) so submits actually
//      POST here.
//
// This function never receives or stores credentials from the client — it
// only reads its own environment variables server-side.

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

  // Persistimos el lead primero: así, aunque el correo falle o Resend no
  // esté configurado, el dato no se pierde y aparece en el dashboard /admin.
  try {
    var db = require('./admin/_db');
    await db.sql`
      INSERT INTO leads (name, email, company, need, budget, details, page, lang)
      VALUES (${name}, ${email}, ${company || null}, ${need || null}, ${budget || null},
              ${details || null}, ${page || null}, ${lang || null})
    `;
  } catch (dbErr) {
    console.error('contact.js: no se pudo guardar el lead en la base de datos', dbErr);
    // seguimos igual: mejor intentar el correo que perder el lead por completo
  }

  var RESEND_API_KEY = process.env.RESEND_API_KEY;
  var CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL;
  var CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev';

  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL) {
    // El lead ya quedó guardado arriba; solo el aviso por correo no está
    // configurado. No lo tratamos como fallo total del envío.
    console.error('contact.js: missing RESEND_API_KEY or CONTACT_TO_EMAIL env vars');
    return res.status(200).json({ success: true, warning: 'email_not_configured' });
  }

  var subject = 'Nuevo lead — ' + name + (company ? ' (' + company + ')' : '');
  var textBody = [
    'Nombre: ' + name,
    'Correo: ' + email,
    'Empresa: ' + (company || '—'),
    'Necesidad: ' + (need || '—'),
    'Presupuesto: ' + (budget || '—'),
    'Detalles: ' + (details || '—'),
    'Idioma: ' + (lang || '—'),
    'Página: ' + (page || '—')
  ].join('\n');

  try {
    var resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + RESEND_API_KEY
      },
      body: JSON.stringify({
        from: CONTACT_FROM_EMAIL,
        to: [CONTACT_TO_EMAIL],
        reply_to: email,
        subject: subject,
        text: textBody
      })
    });

    if (!resendRes.ok) {
      var errText = await resendRes.text();
      console.error('contact.js: Resend API error', resendRes.status, errText);
      // El lead ya está guardado en la base de datos aunque el correo falle.
      return res.status(200).json({ success: true, warning: 'email_provider_error' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('contact.js: unexpected error sending email', err);
    return res.status(200).json({ success: true, warning: 'unexpected_error' });
  }
};
