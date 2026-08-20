const { handleUpload } = require('@vercel/blob/client');
const { requireAuth } = require('./_auth');

// Flujo de "client upload" de Vercel Blob: el navegador sube el archivo
// directo a Blob (no pasa por el body de esta función, evita el límite de
// tamaño de las funciones serverless); este endpoint solo autoriza el token
// de subida y confirma cuando termina.
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }
  if (!requireAuth(req, res)) return;

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async function (pathname) {
        return {
          allowedContentTypes: ['image/webp', 'image/jpeg', 'image/png', 'image/gif'],
          addRandomSuffix: true,
          maximumSizeInBytes: 15 * 1024 * 1024,
        };
      },
      onUploadCompleted: async function () {
        // No hace falta persistir nada aquí: el cliente hace POST a
        // /api/admin/projects/[slug]/images con la URL final tras el upload.
      },
    });
    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('upload.js:', error);
    return res.status(400).json({ success: false, error: 'upload_failed' });
  }
};
