// Catch-all: agrupa index.js + [id].js (antes 2 funciones) en una, por el
// límite de 12 funciones serverless del plan Hobby. Mismas URLs de siempre.
//   []    -> GET  /leads (?status=... opcional)
//   [id]  -> PATCH /leads/:id

const { sql } = require('../_db');
const { requireAuth } = require('../_auth');

const VALID_STATUSES = ['new', 'contacted', 'won', 'lost'];

async function listLeads(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }
  const status = typeof req.query.status === 'string' ? req.query.status : null;
  const result = status
    ? await sql`SELECT * FROM leads WHERE status = ${status} ORDER BY created_at DESC`
    : await sql`SELECT * FROM leads ORDER BY created_at DESC`;
  return res.status(200).json({ success: true, leads: result.rows });
}

async function updateLead(req, res, id) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }
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

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!requireAuth(req, res)) return;

  const rawPath = req.query.path;
  const segments = Array.isArray(rawPath) ? rawPath : (rawPath ? [rawPath] : []);

  if (segments.length === 1 && segments[0] === 'list') return listLeads(req, res);
  if (segments.length === 1) return updateLead(req, res, segments[0]);

  return res.status(404).json({ success: false, error: 'not_found' });
};
