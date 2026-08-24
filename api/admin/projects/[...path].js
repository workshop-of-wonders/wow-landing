// Ruta catch-all: agrupa lo que antes eran 5 funciones serverless separadas
// (index.js, [slug].js, [slug]/publish.js, [slug]/images.js,
// [slug]/images/[id].js) en una sola, para no exceder el límite de 12
// funciones del plan Hobby de Vercel. Las URLs públicas no cambian --
// admin.js sigue llamando exactamente las mismas rutas de siempre.
//
// req.query.path es el arreglo de segmentos después de /api/admin/projects/:
//   []                       -> GET  /projects
//   [slug]                   -> GET/PUT/DELETE /projects/:slug
//   [slug, 'publish']        -> POST /projects/:slug/publish
//   [slug, 'images']         -> POST/PUT /projects/:slug/images
//   [slug, 'images', id]     -> DELETE /projects/:slug/images/:id

const { sql } = require('../_db');
const { requireAuth } = require('../_auth');
const { publishProject } = require('../_publish');

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
    console.error('projects/[...path].js (publish): faltan GITHUB_TOKEN/GITHUB_OWNER/GITHUB_REPO');
    return res.status(500).json({ success: false, error: 'not_configured' });
  }

  try {
    // Import dinámico: @octokit/rest@21+ es solo ESM, require() falla con
    // ERR_REQUIRE_ESM en este archivo CommonJS. import() sí funciona desde
    // CJS sin importar la versión instalada -- no depender de bajar la
    // versión del paquete.
    const { Octokit } = await import('@octokit/rest');
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    const result = await publishProject(sql, octokit, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH, slug);
    return res.status(200).json({ success: true, committed: result.committed });
  } catch (error) {
    if (error.message === 'project_not_found') {
      return res.status(404).json({ success: false, error: 'not_found' });
    }
    console.error('projects/[...path].js (publish):', error);
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

  res.setHeader('Allow', 'POST, PUT');
  return res.status(405).json({ success: false, error: 'method_not_allowed' });
}

async function deleteProjectImage(req, res, slug, id) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE');
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }
  await sql`DELETE FROM project_images WHERE id = ${id} AND project_slug = ${slug}`;
  await sql`UPDATE projects SET published_at = NULL WHERE slug = ${slug}`;
  return res.status(200).json({ success: true });
}

module.exports = async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  const segments = Array.isArray(req.query.path) ? req.query.path : [];

  if (segments.length === 1 && segments[0] === 'list') return listProjects(req, res);
  if (segments.length === 1) return projectDetail(req, res, segments[0]);
  if (segments.length === 2 && segments[1] === 'publish') return publishProjectRoute(req, res, segments[0]);
  if (segments.length === 2 && segments[1] === 'images') return projectImages(req, res, segments[0]);
  if (segments.length === 3 && segments[1] === 'images') return deleteProjectImage(req, res, segments[0], segments[2]);

  return res.status(404).json({ success: false, error: 'not_found' });
};
