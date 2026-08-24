// Endpoint de diagnóstico temporal, sin auth -- borrar después de usar para
// entender qué forma tiene req.query.path en producción para esta misma
// convención de ruta catch-all que usan projects/leads/content/tokens/seo.
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    url: req.url,
    query: req.query,
    pathType: Array.isArray(req.query.path) ? 'array' : typeof req.query.path,
    method: req.method,
  });
};
