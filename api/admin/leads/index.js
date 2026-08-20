const { sql } = require('../_db');
const { requireAuth } = require('../_auth');

module.exports = async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  if (req.method === 'GET') {
    const status = typeof req.query.status === 'string' ? req.query.status : null;
    const result = status
      ? await sql`SELECT * FROM leads WHERE status = ${status} ORDER BY created_at DESC`
      : await sql`SELECT * FROM leads ORDER BY created_at DESC`;
    return res.status(200).json({ success: true, leads: result.rows });
  }

  res.setHeader('Allow', 'GET');
  return res.status(405).json({ success: false, error: 'method_not_allowed' });
};
