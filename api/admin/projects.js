// Un solo archivo plano, sin rutas dinámicas de corchetes -- esas resultaron
// no funcionar de forma confiable en este proyecto de Vercel más allá de un
// único segmento (ver CHANGELOG 2026-08-23 para el diagnóstico completo).
// En su lugar, todo se direcciona con query params explícitos:
//   GET    /projects                              -> lista
//   GET    /projects?slug=X                        -> detalle + imágenes
//   PUT    /projects?slug=X                        -> actualizar campos
//   DELETE /projects?slug=X                        -> borrar proyecto
//   POST   /projects?slug=X&publish=1               -> publicar (Octokit)
//   POST   /projects?slug=X&images=1                -> agregar imagen (body: {url})
//   PUT    /projects?slug=X&images=1                -> reordenar imágenes (body: {order})
//   DELETE /projects?slug=X&images=1&imageId=Y      -> borrar una imagen

const { sql } = require('./_db');
const { requireAuth } = require('./_auth');
const { publishProject } = require('./_publish');

function parseBody(req) {
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  return body || {};
}

async function listProjects(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }
  const projects = await sql`
    SELECT slug, title, category, capabilities, description, tagline, variant,
           cover_image, show_on_index, show_on_portafolio, sort_order,
           updated_at, published_at
    FROM projects ORDER BY sort_order ASC, title ASC
  `;
  return res.status(200).json({ success: true, projects: projects.rows });
}

async function projectDetail(req, res, slug) {
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
    const body = parseBody(req);
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
}

async function publishProjectRoute(req, res, slug) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_OWNER = process.env.GITHUB_OWNER;
  const GITHUB_REPO = process.env.GITHUB_REPO;
  const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    console.error('projects.js (publish): faltan GITHUB_TOKEN/GITHUB_OWNER/GITHUB_REPO');
    return res.status(500).json({ success: false, error: 'not_configured' });
  }

  try {
    // @octokit/rest@21+ es solo ESM -- import() dinámico en vez de require().
    const { Octokit } = await import('@octokit/rest');
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    const result = await publishProject(sql, octokit, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH, slug);
    return res.status(200).json({ success: true, committed: result.committed });
  } catch (error) {
    if (error.message === 'project_not_found') {
      return res.status(404).json({ success: false, error: 'not_found' });
    }
    console.error('projects.js (publish):', error);
    return res.status(500).json({ success: false, error: 'publish_failed' });
  }
}

async function projectImages(req, res, slug) {
  if (req.method === 'POST') {
    const body = parseBody(req);
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
    const body = parseBody(req);
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

  if (req.method === 'DELETE') {
    const imageId = req.query.imageId;
    await sql`DELETE FROM project_images WHERE id = ${imageId} AND project_slug = ${slug}`;
    await sql`UPDATE projects SET published_at = NULL WHERE slug = ${slug}`;
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', 'POST, PUT, DELETE');
  return res.status(405).json({ success: false, error: 'method_not_allowed' });
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!requireAuth(req, res)) return;

  const slug = typeof req.query.slug === 'string' ? req.query.slug : null;

  if (!slug) return listProjects(req, res);
  if (req.query.publish) return publishProjectRoute(req, res, slug);
  if (req.query.images) return projectImages(req, res, slug);
  return projectDetail(req, res, slug);
};
