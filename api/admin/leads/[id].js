const { sql } = require('../_db');
const { requireAuth } = require('../_auth');

const VALID_STATUSES = ['new', 'contacted', 'won', 'lost'];

module.exports = async function handler(req, res) {
  if (!requireAuth(req, res)) return;
  const id = req.query.id;

  if (req.method === 'PATCH') {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    body = body || {};

    const existing = await sql`SELECT * FROM leads WHERE id = ${id}`;
    if (!existing.rows.length) return res.status(404).json({ success: false, error: 'not_found' });
    const current = existing.rows[0];

    const status = typeof body.status === 'string' && VALID_STATUSES.includes(body.status)
      ? body.status : current.status;
    const notes = Object.prototype.hasOwnProperty.call(body, 'notes') ? body.notes : current.notes;

    await sql`
      UPDATE leads SET status = ${status}, notes = ${notes}, updated_at = now()
      WHERE id = ${id}
    `;
    const updated = await sql`SELECT * FROM leads WHERE id = ${id}`;
    return res.status(200).json({ success: true, lead: updated.rows[0] });
  }

  res.setHeader('Allow', 'PATCH');
  return res.status(405).json({ success: false, error: 'method_not_allowed' });
};
