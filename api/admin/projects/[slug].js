const { sql } = require('../_db');
const { requireAuth } = require('../_auth');

module.exports = async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  const slug = req.query.slug;

  if (req.method === 'GET') {
    const project = await sql`SELECT * FROM projects WHERE slug = ${slug}`;
    if (!project.rows.length) return res.status(404).json({ success: false, error: 'not_found' });
    const images = await sql`
      SELECT id, url, position FROM project_images
      WHERE project_slug = ${slug} ORDER BY position ASC
    `;
    return res.status(200).json({ success: true, project: project.rows[0], images: images.rows });
  }

  if (req.method === 'PUT') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    body = body || {};

    const fields = ['title', 'category', 'capabilities', 'description', 'tagline', 'work',
      'variant', 'cover_image', 'show_on_index', 'show_on_portafolio', 'sort_order'];
    const existing = await sql`SELECT * FROM projects WHERE slug = ${slug}`;
    if (!existing.rows.length) return res.status(404).json({ success: false, error: 'not_found' });
    const current = existing.rows[0];

    const merged = {};
    fields.forEach(function (f) {
      merged[f] = Object.prototype.hasOwnProperty.call(body, f) ? body[f] : current[f];
    });

    await sql`
      UPDATE projects SET
        title = ${merged.title},
        category = ${merged.category},
        capabilities = ${merged.capabilities},
        description = ${merged.description},
        tagline = ${merged.tagline},
        work = ${merged.work},
        variant = ${merged.variant},
        cover_image = ${merged.cover_image},
        show_on_index = ${merged.show_on_index},
        show_on_portafolio = ${merged.show_on_portafolio},
        sort_order = ${merged.sort_order},
        updated_at = now(),
        published_at = NULL
      WHERE slug = ${slug}
    `;

    const project = await sql`SELECT * FROM projects WHERE slug = ${slug}`;
    return res.status(200).json({ success: true, project: project.rows[0] });
  }

  if (req.method === 'DELETE') {
    await sql`DELETE FROM projects WHERE slug = ${slug}`;
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', 'GET, PUT, DELETE');
  return res.status(405).json({ success: false, error: 'method_not_allowed' });
};
