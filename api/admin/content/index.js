const { sql } = require('../_db');
const { requireAuth } = require('../_auth');
const { CONTENT_FIELDS } = require('../_content');

module.exports = async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  if (req.method === 'GET') {
    const rows = (await sql`SELECT key, value, label, page, updated_at FROM site_content`).rows;
    const byKey = new Map(rows.map(function (r) { return [r.key, r]; }));

    // Combina la definición de campos (orden/labels/página fijos en código)
    // con los valores guardados en DB, para que la UI siempre muestre todos
    // los campos esperados aunque el seed aún no se haya corrido.
    const fields = CONTENT_FIELDS.map(function (f) {
      const row = byKey.get(f.key);
      return {
        key: f.key,
        page: f.page,
        label: f.label,
        rawHtml: f.rawHtml,
        value: row ? row.value : null,
        updated_at: row ? row.updated_at : null,
      };
    });

    const grouped = {};
    fields.forEach(function (f) {
      if (!grouped[f.page]) grouped[f.page] = [];
      grouped[f.page].push(f);
    });

    return res.status(200).json({ success: true, fields, grouped });
  }

  res.setHeader('Allow', 'GET');
  return res.status(405).json({ success: false, error: 'method_not_allowed' });
};
