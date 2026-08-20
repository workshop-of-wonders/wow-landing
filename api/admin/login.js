const bcrypt = require('bcryptjs');
const { sql } = require('./_db');
const { signSession, cookieHeader, getClientIp } = require('./_auth');

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  body = body || {};

  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const ip = getClientIp(req);

  try {
    const recent = await sql`
      SELECT count(*)::int AS n FROM login_attempts
      WHERE ip = ${ip} AND success = false
        AND created_at > now() - (${WINDOW_MINUTES} || ' minutes')::interval
    `;
    if (recent.rows[0] && recent.rows[0].n >= MAX_ATTEMPTS) {
      return res.status(429).json({ success: false, error: 'too_many_attempts' });
    }
  } catch (e) {
    console.error('login: rate-limit check failed', e);
  }

  const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
  const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

  let ok = false;
  if (ADMIN_USERNAME && ADMIN_PASSWORD_HASH && username === ADMIN_USERNAME) {
    ok = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  }

  try {
    await sql`INSERT INTO login_attempts (ip, success) VALUES (${ip}, ${ok})`;
  } catch (e) {
    console.error('login: could not record attempt', e);
  }

  if (!ok) {
    return res.status(401).json({ success: false, error: 'invalid_credentials' });
  }

  const token = signSession();
  res.setHeader('Set-Cookie', cookieHeader(token));
  return res.status(200).json({ success: true });
};
