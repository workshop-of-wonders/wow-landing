// Helper compartido: toda ruta /api/admin/* (excepto login) debe llamar
// requireAuth(req, res) primero. La seguridad real vive aquí, no en el SPA.

const jwt = require('jsonwebtoken');

const COOKIE_NAME = 'wow_admin_session';

function parseCookies(req) {
  const header = req.headers.cookie;
  const out = {};
  if (!header) return out;
  header.split(';').forEach(function (part) {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    out[key] = decodeURIComponent(val);
  });
  return out;
}

function signSession() {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) throw new Error('ADMIN_JWT_SECRET no configurado');
  return jwt.sign({ sub: 'admin' }, secret, { expiresIn: '7d' });
}

function cookieHeader(token, opts) {
  opts = opts || {};
  const maxAge = opts.clear ? 0 : 60 * 60 * 24 * 7;
  const parts = [
    COOKIE_NAME + '=' + (opts.clear ? '' : encodeURIComponent(token)),
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=' + maxAge,
  ];
  if (process.env.NODE_ENV !== 'development') parts.push('Secure');
  return parts.join('; ');
}

// Devuelve true si hay sesión válida (y ya escribió el 401 si no la hay).
function requireAuth(req, res) {
  const secret = process.env.ADMIN_JWT_SECRET;
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  if (!token || !secret) {
    res.status(401).json({ success: false, error: 'unauthorized' });
    return false;
  }
  try {
    jwt.verify(token, secret);
    return true;
  } catch (e) {
    res.status(401).json({ success: false, error: 'unauthorized' });
    return false;
  }
}

function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : 'unknown';
}

module.exports = { requireAuth, signSession, cookieHeader, getClientIp, COOKIE_NAME };
