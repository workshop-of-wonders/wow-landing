const { sql } = require('../../../_db');
const { requireAuth } = require('../../../_auth');

module.exports = async function handler(req, res) {
  if (!requireAuth(req, res)) return;
  const slug = req.query.slug;
  const id = req.query.id;

  if (req.method === 'DELETE') {
    await sql`DELETE FROM project_images WHERE id = ${id} AND project_slug = ${slug}`;
    await sql`UPDATE projects SET published_at = NULL WHERE slug = ${slug}`;
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', 'DELETE');
  return res.status(405).json({ success: false, error: 'method_not_allowed' });
};
