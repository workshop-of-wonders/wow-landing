// Sin rutas dinámicas de corchetes (ver projects.js para el porqué).
//   GET  /seo                                -> título/meta + favicon + slugs, todo junto
//   PUT  /seo?key=X                          -> guarda borrador de título/meta
//   POST /seo?publish=1                      -> publica título/meta
//   PUT  /seo?favicon=1                      -> guarda borrador de la URL del favicon subido
//   POST /seo?favicon=1&publish=1            -> publica el favicon
//   PUT  /seo?slugs=1&page=X                 -> cambia y publica la URL de una página (body: {slug})

const { sql } = require('./_db');
const { requireAuth } = require('./_auth');
const {
  SEO_FIELDS, seoFieldByKey, publishSeo,
  publishFavicon,
  publishSlug,
} = require('./_seo');

function getOctokitConfig() {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_OWNER = process.env.GITHUB_OWNER;
  const GITHUB_REPO = process.env.GITHUB_REPO;
  const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) return null;
  return { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH };
}

async function parseBody(req) {
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  return body || {};
}

async function listSeo(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }

  const [seoRows, faviconRow, slugRows] = await Promise.all([
    sql`SELECT key, value, label, page, kind, updated_at FROM site_seo`,
    sql`SELECT value, updated_at FROM site_favicon WHERE id = 'main'`,
    sql`SELECT page, filename, current_slug, updated_at FROM site_slugs`,
  ]);

  const byKey = new Map(seoRows.rows.map(function (r) { return [r.key, r]; }));
  const fields = SEO_FIELDS.map(function (f) {
    const row = byKey.get(f.key);
    return {
      key: f.key, page: f.page, kind: f.kind, label: f.label,
      value: row ? row.value : null,
      updated_at: row ? row.updated_at : null,
    };
  });
  const grouped = {};
  fields.forEach(function (f) {
    if (!grouped[f.page]) grouped[f.page] = [];
    grouped[f.page].push(f);
  });

  return res.status(200).json({
    success: true,
    fields,
    grouped,
    favicon: faviconRow.rows[0] || { value: null, updated_at: null },
    slugs: slugRows.rows,
  });
}

async function updateSeoField(req, res, key) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT');
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }
  const field = seoFieldByKey(key);
  if (!field) return res.status(404).json({ success: false, error: 'unknown_key' });

  const body = await parseBody(req);
  const value = typeof body.value === 'string' ? body.value : '';

  await sql`
    INSERT INTO site_seo (key, value, label, page, kind, updated_at)
    VALUES (${key}, ${value}, ${field.label}, ${field.page}, ${field.kind}, now())
    ON CONFLICT (key) DO UPDATE SET value = ${value}, updated_at = now()
  `;

  const row = (await sql`SELECT key, value, label, page, kind, updated_at FROM site_seo WHERE key = ${key}`).rows[0];
  return res.status(200).json({ success: true, field: row });
}

async function publishSeoRoute(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }
  const cfg = getOctokitConfig();
  if (!cfg) {
    console.error('seo.js (publish): faltan GITHUB_TOKEN/GITHUB_OWNER/GITHUB_REPO');
    return res.status(500).json({ success: false, error: 'not_configured' });
  }
  try {
    const { Octokit } = await import('@octokit/rest');
    const octokit = new Octokit({ auth: cfg.GITHUB_TOKEN });
    const result = await publishSeo(sql, octokit, cfg.GITHUB_OWNER, cfg.GITHUB_REPO, cfg.GITHUB_BRANCH);
    return res.status(200).json({ success: true, committed: result.committed });
  } catch (error) {
    console.error('seo.js (publish):', error);
    return res.status(500).json({ success: false, error: 'publish_failed' });
  }
}

async function updateFavicon(req, res) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT');
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }
  const body = await parseBody(req);
  const value = typeof body.value === 'string' ? body.value.trim() : '';
  if (!value || !/^https:\/\//.test(value)) {
    return res.status(400).json({ success: false, error: 'invalid_url' });
  }

  await sql`
    INSERT INTO site_favicon (id, value, updated_at)
    VALUES ('main', ${value}, now())
    ON CONFLICT (id) DO UPDATE SET value = ${value}, updated_at = now()
  `;

  const row = (await sql`SELECT value, updated_at FROM site_favicon WHERE id = 'main'`).rows[0];
  return res.status(200).json({ success: true, favicon: row });
}

async function publishFaviconRoute(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }
  const cfg = getOctokitConfig();
  if (!cfg) {
    console.error('seo.js (favicon publish): faltan GITHUB_TOKEN/GITHUB_OWNER/GITHUB_REPO');
    return res.status(500).json({ success: false, error: 'not_configured' });
  }
  try {
    const { Octokit } = await import('@octokit/rest');
    const octokit = new Octokit({ auth: cfg.GITHUB_TOKEN });
    const result = await publishFavicon(sql, octokit, cfg.GITHUB_OWNER, cfg.GITHUB_REPO, cfg.GITHUB_BRANCH);
    return res.status(200).json({ success: true, committed: result.committed });
  } catch (error) {
    console.error('seo.js (favicon publish):', error);
    return res.status(500).json({ success: false, error: 'publish_failed' });
  }
}

async function updateSlugDraft(req, res, page) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT');
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }
  if (page !== 'servicios' && page !== 'portafolio') {
    return res.status(404).json({ success: false, error: 'unknown_page' });
  }
  const body = await parseBody(req);
  const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : '';

  const cfg = getOctokitConfig();
  if (!cfg) {
    console.error('seo.js (slug): faltan GITHUB_TOKEN/GITHUB_OWNER/GITHUB_REPO');
    return res.status(500).json({ success: false, error: 'not_configured' });
  }
  try {
    const { Octokit } = await import('@octokit/rest');
    const octokit = new Octokit({ auth: cfg.GITHUB_TOKEN });
    const result = await publishSlug(sql, octokit, cfg.GITHUB_OWNER, cfg.GITHUB_REPO, cfg.GITHUB_BRANCH, page, slug);
    return res.status(200).json({ success: true, committed: result.committed, slug: result.slug });
  } catch (error) {
    if (error && error.message === 'invalid_slug') {
      return res.status(400).json({ success: false, error: 'invalid_slug' });
    }
    if (error && error.message === 'slug_page_not_found') {
      return res.status(404).json({ success: false, error: 'slug_page_not_found' });
    }
    console.error('seo.js (slug publish):', error);
    return res.status(500).json({ success: false, error: 'publish_failed' });
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!requireAuth(req, res)) return;

  if (req.query.slugs) {
    const page = typeof req.query.page === 'string' ? req.query.page : null;
    if (!page) return res.status(400).json({ success: false, error: 'missing_page' });
    return updateSlugDraft(req, res, page);
  }

  if (req.query.favicon) {
    if (req.query.publish) return publishFaviconRoute(req, res);
    return updateFavicon(req, res);
  }

  if (req.query.publish) return publishSeoRoute(req, res);

  const key = typeof req.query.key === 'string' ? req.query.key : null;
  if (key) return updateSeoField(req, res, key);

  return listSeo(req, res);
};
