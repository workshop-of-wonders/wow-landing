// Catch-all: agrupa index.js + [key].js + publish.js (antes 3 funciones)
// en una, por el límite de 12 funciones serverless del plan Hobby. Mismas
// URLs de siempre -- ningún key de TOKEN_FIELDS es literalmente "publish".
//   []           -> GET  /tokens
//   ['publish']  -> POST /tokens/publish
//   [key]        -> PUT  /tokens/:key

const { sql } = require('../_db');
const { requireAuth } = require('../_auth');
const { TOKEN_FIELDS, isValidHex, publishTokens } = require('../_tokens');

async function listTokens(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }
  const rows = (await sql`SELECT key, value, label, updated_at FROM site_tokens`).rows;
  const byKey = new Map(rows.map(function (r) { return [r.key, r]; }));

  const tokens = TOKEN_FIELDS.map(function (f) {
    const row = byKey.get(f.key);
    return {
      key: f.key,
      label: f.label,
      value: row ? row.value : null,
      updated_at: row ? row.updated_at : null,
    };
  });

  return res.status(200).json({ success: true, tokens });
}

async function publishTokensRoute(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_OWNER = process.env.GITHUB_OWNER;
  const GITHUB_REPO = process.env.GITHUB_REPO;
  const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    console.error('tokens/[...path].js (publish): faltan GITHUB_TOKEN/GITHUB_OWNER/GITHUB_REPO');
    return res.status(500).json({ success: false, error: 'not_configured' });
  }

  try {
    // @octokit/rest@21+ es solo ESM -- import() dinámico en vez de require().
    const { Octokit } = await import('@octokit/rest');
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    const result = await publishTokens(sql, octokit, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH);
    return res.status(200).json({ success: true, committed: result.committed, keys: result.keys || [] });
  } catch (error) {
    console.error('tokens/[...path].js (publish):', error);
    return res.status(500).json({ success: false, error: 'publish_failed' });
  }
}

async function updateToken(req, res, key) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT');
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }
  const field = TOKEN_FIELDS.find(function (f) { return f.key === key; });
  if (!field) return res.status(404).json({ success: false, error: 'unknown_key' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};
  const value = typeof body.value === 'string' ? body.value.trim() : '';
  if (!isValidHex(value)) return res.status(400).json({ success: false, error: 'invalid_color' });

  await sql`
    INSERT INTO site_tokens (key, value, label, updated_at)
    VALUES (${key}, ${value}, ${field.label}, now())
    ON CONFLICT (key) DO UPDATE SET value = ${value}, updated_at = now()
  `;

  const row = (await sql`SELECT key, value, label, updated_at FROM site_tokens WHERE key = ${key}`).rows[0];
  return res.status(200).json({ success: true, token: row });
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!requireAuth(req, res)) return;

  const rawPath = req.query.path;
  const segments = Array.isArray(rawPath) ? rawPath : (rawPath ? [rawPath] : []);

  if (segments.length === 1 && segments[0] === 'list') return listTokens(req, res);
  if (segments.length === 1 && segments[0] === 'publish') return publishTokensRoute(req, res);
  if (segments.length === 1) return updateToken(req, res, segments[0]);

  return res.status(404).json({ success: false, error: 'not_found' });
};
