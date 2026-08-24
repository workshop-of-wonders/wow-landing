// Catch-all: agrupa index.js + [key].js + publish.js (antes 3 funciones)
// en una, por el límite de 12 funciones serverless del plan Hobby. Mismas
// URLs de siempre -- ningún key de CONTENT_FIELDS es literalmente
// "publish", así que no hay ambigüedad entre /content/publish y
// /content/:key.
//   []           -> GET  /content
//   ['publish']  -> POST /content/publish
//   [key]        -> PUT  /content/:key

const { sql } = require('../_db');
const { requireAuth } = require('../_auth');
const { CONTENT_FIELDS, fieldByKey, publishContent } = require('../_content');

async function listContent(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }
  const rows = (await sql`SELECT key, value, label, page, updated_at FROM site_content`).rows;
  const byKey = new Map(rows.map(function (r) { return [r.key, r]; }));

  const fields = CONTENT_FIELDS.map(function (f) {
    const row = byKey.get(f.key);
    return {
      key: f.key,
      page: f.page,
      label: f.label,
      rawHtml: f.rawHtml,
      value: row ? row.value : null,
      updated_at: row ? row.updated_at : null,
    };
  });

  const grouped = {};
  fields.forEach(function (f) {
    if (!grouped[f.page]) grouped[f.page] = [];
    grouped[f.page].push(f);
  });

  return res.status(200).json({ success: true, fields, grouped });
}

async function publishContentRoute(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_OWNER = process.env.GITHUB_OWNER;
  const GITHUB_REPO = process.env.GITHUB_REPO;
  const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    console.error('content/[...path].js (publish): faltan GITHUB_TOKEN/GITHUB_OWNER/GITHUB_REPO');
    return res.status(500).json({ success: false, error: 'not_configured' });
  }

  try {
    // @octokit/rest@21+ es solo ESM -- import() dinámico en vez de require().
    const { Octokit } = await import('@octokit/rest');
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    const result = await publishContent(sql, octokit, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH);
    return res.status(200).json({ success: true, committed: result.committed });
  } catch (error) {
    console.error('content/[...path].js (publish):', error);
    return res.status(500).json({ success: false, error: 'publish_failed' });
  }
}

async function updateContentField(req, res, key) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT');
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }
  const field = fieldByKey(key);
  if (!field) return res.status(404).json({ success: false, error: 'unknown_key' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};
  const value = typeof body.value === 'string' ? body.value : '';

  await sql`
    INSERT INTO site_content (key, value, label, page, updated_at)
    VALUES (${key}, ${value}, ${field.label}, ${field.page}, now())
    ON CONFLICT (key) DO UPDATE SET value = ${value}, updated_at = now()
  `;

  const row = (await sql`SELECT key, value, label, page, updated_at FROM site_content WHERE key = ${key}`).rows[0];
  return res.status(200).json({ success: true, field: row });
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!requireAuth(req, res)) return;

  const segments = Array.isArray(req.query.path) ? req.query.path : [];

  if (segments.length === 1 && segments[0] === 'list') return listContent(req, res);
  if (segments.length === 1 && segments[0] === 'publish') return publishContentRoute(req, res);
  if (segments.length === 1) return updateContentField(req, res, segments[0]);

  return res.status(404).json({ success: false, error: 'not_found' });
};
