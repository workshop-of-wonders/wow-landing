const { sql } = require('../_db');
const { requireAuth } = require('../_auth');
const { fieldByKey } = require('../_content');

module.exports = async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  const key = req.query.key;
  const field = fieldByKey(key);
  if (!field) return res.status(404).json({ success: false, error: 'unknown_key' });

  if (req.method === 'PUT') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    body = body || {};
    const value = typeof body.value === 'string' ? body.value : '';

    // UPSERT: si el seed no se ha corrido todavía (o es un campo nuevo),
    // esto igual crea la fila en vez de fallar.
    await sql`
      INSERT INTO site_content (key, value, label, page, updated_at)
      VALUES (${key}, ${value}, ${field.label}, ${field.page}, now())
      ON CONFLICT (key) DO UPDATE SET value = ${value}, updated_at = now()
    `;

    const row = (await sql`SELECT key, value, label, page, updated_at FROM site_content WHERE key = ${key}`).rows[0];
    return res.status(200).json({ success: true, field: row });
  }

  res.setHeader('Allow', 'PUT');
  return res.status(405).json({ success: false, error: 'method_not_allowed' });
};
