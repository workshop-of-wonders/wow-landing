const { sql } = require('../_db');
const { requireAuth } = require('../_auth');
const { TOKEN_FIELDS, isValidHex } = require('../_tokens');

module.exports = async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  const key = req.query.key;
  const field = TOKEN_FIELDS.find(function (f) { return f.key === key; });
  if (!field) return res.status(404).json({ success: false, error: 'unknown_key' });

  if (req.method === 'PUT') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    body = body || {};
    const value = typeof body.value === 'string' ? body.value.trim() : '';
    if (!isValidHex(value)) return res.status(400).json({ success: false, error: 'invalid_color' });

    await sql`
      INSERT INTO site_tokens (key, value, label, updated_at)
      VALUES (${key}, ${value}, ${field.label}, now())
      ON CONFLICT (key) DO UPDATE SET value = ${value}, updated_at = now()
    `;

    const row = (await sql`SELECT key, value, label, updated_at FROM site_tokens WHERE key = ${key}`).rows[0];
    return res.status(200).json({ success: true, token: row });
  }

  res.setHeader('Allow', 'PUT');
  return res.status(405).json({ success: false, error: 'method_not_allowed' });
};
