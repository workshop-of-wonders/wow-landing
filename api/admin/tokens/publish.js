const { Octokit } = require('@octokit/rest');
const { sql } = require('../_db');
const { requireAuth } = require('../_auth');
const { publishTokens } = require('../_tokens');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }
  if (!requireAuth(req, res)) return;

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_OWNER = process.env.GITHUB_OWNER;
  const GITHUB_REPO = process.env.GITHUB_REPO;
  const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    console.error('tokens/publish.js: faltan GITHUB_TOKEN/GITHUB_OWNER/GITHUB_REPO');
    return res.status(500).json({ success: false, error: 'not_configured' });
  }

  try {
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    const result = await publishTokens(sql, octokit, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH);
    return res.status(200).json({ success: true, committed: result.committed });
  } catch (error) {
    console.error('tokens/publish.js:', error);
    return res.status(500).json({ success: false, error: 'publish_failed' });
  }
};
