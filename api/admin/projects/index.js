const { sql } = require('../_db');
const { requireAuth } = require('../_auth');

module.exports = async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  if (req.method === 'GET') {
    const projects = await sql`
      SELECT slug, title, category, capabilities, description, tagline, variant,
             cover_image, show_on_index, show_on_portafolio, sort_order,
             updated_at, published_at
      FROM projects ORDER BY sort_order ASC, title ASC
    `;
    return res.status(200).json({ success: true, projects: projects.rows });
  }

  res.setHeader('Allow', 'GET');
  return res.status(405).json({ success: false, error: 'method_not_allowed' });
};
