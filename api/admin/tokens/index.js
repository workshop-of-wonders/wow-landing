const { sql } = require('../_db');
const { requireAuth } = require('../_auth');
const { TOKEN_FIELDS } = require('../_tokens');

module.exports = async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  if (req.method === 'GET') {
    const rows = (await sql`SELECT key, value, label, updated_at FROM site_tokens`).rows;
    const byKey = new Map(rows.map(function (r) { return [r.key, r]; }));

    const tokens = TOKEN_FIELDS.map(function (f) {
      const row = byKey.get(f.key);
      return {
        key: f.key,
        label: f.label,
        value: row ? row.value : null,
        updated_at: row ? row.updated_at : null,
      };
    });

    return res.status(200).json({ success: true, tokens });
  }

  res.setHeader('Allow', 'GET');
  return res.status(405).json({ success: false, error: 'method_not_allowed' });
};
