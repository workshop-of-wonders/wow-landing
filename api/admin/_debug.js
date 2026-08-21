// Endpoint temporal de diagnóstico — NO expone valores secretos, solo si
// las variables de entorno existen y su longitud, para depurar el login.
// Borrar este archivo (y su commit) en cuanto el login funcione.

module.exports = async function handler(req, res) {
  const u = process.env.ADMIN_USERNAME || '';
  const h = process.env.ADMIN_PASSWORD_HASH || '';
  const j = process.env.ADMIN_JWT_SECRET || '';
  const db = process.env.POSTGRES_URL || process.env.DATABASE_URL || '';

  return res.status(200).json({
    ADMIN_USERNAME: { present: !!process.env.ADMIN_USERNAME, length: u.length, value_trimmed_equal: u === u.trim() },
    ADMIN_PASSWORD_HASH: { present: !!process.env.ADMIN_PASSWORD_HASH, length: h.length, looksLikeBcrypt: /^\$2[aby]\$\d{2}\$/.test(h.trim()), value_trimmed_equal: h === h.trim() },
    ADMIN_JWT_SECRET: { present: !!process.env.ADMIN_JWT_SECRET, length: j.length },
    DB_URL: { present: !!db, length: db.length },
  });
};
