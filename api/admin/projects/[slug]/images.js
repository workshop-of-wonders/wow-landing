const { sql } = require('../../_db');
const { requireAuth } = require('../../_auth');

module.exports = async function handler(req, res) {
  if (!requireAuth(req, res)) return;
  const slug = req.query.slug;

  if (req.method === 'POST') {
    // Agrega una imagen ya subida a Blob (url) al final de la galería.
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    body = body || {};
    const url = typeof body.url === 'string' ? body.url.trim() : '';
    if (!url) return res.status(400).json({ success: false, error: 'missing_url' });

    const max = await sql`
      SELECT COALESCE(MAX(position), -1) AS max FROM project_images WHERE project_slug = ${slug}
    `;
    const nextPos = max.rows[0].max + 1;
    const inserted = await sql`
      INSERT INTO project_images (project_slug, url, position)
      VALUES (${slug}, ${url}, ${nextPos}) RETURNING id, url, position
    `;
    await sql`UPDATE projects SET published_at = NULL WHERE slug = ${slug}`;
    return res.status(200).json({ success: true, image: inserted.rows[0] });
  }

  if (req.method === 'PUT') {
    // Reordena: body = { order: [imageId, imageId, ...] } en el nuevo orden deseado.
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    body = body || {};
    const order = Array.isArray(body.order) ? body.order : [];
    if (!order.length) return res.status(400).json({ success: false, error: 'missing_order' });

    for (let i = 0; i < order.length; i++) {
      await sql`
        UPDATE project_images SET position = ${i + 1000}
        WHERE id = ${order[i]} AND project_slug = ${slug}
      `;
    }
    for (let i = 0; i < order.length; i++) {
      await sql`
        UPDATE project_images SET position = ${i}
        WHERE id = ${order[i]} AND project_slug = ${slug}
      `;
    }
    await sql`UPDATE projects SET published_at = NULL WHERE slug = ${slug}`;
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', 'POST, PUT');
  return res.status(405).json({ success: false, error: 'method_not_allowed' });
};
