// Clave temporal para todo el sitio (HTTP Basic Auth en Vercel Routing Middleware).
// Se activa solo si existe la variable de entorno SITE_PASSWORD en Vercel;
// para quitar la clave basta con borrar esa variable y redeployar.
// /api queda fuera: el panel usa sus propias cookies/JWT y el form de contacto
// no debe chocar con el header Authorization de Basic Auth.

export const config = {
  matcher: ['/((?!api/).*)'],
};

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export default function middleware(request) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return;

  const user = process.env.SITE_USER || 'wow';
  const header = request.headers.get('authorization') || '';
  if (header.startsWith('Basic ')) {
    try {
      const decoded = atob(header.slice(6));
      const sep = decoded.indexOf(':');
      if (sep !== -1 &&
          safeEqual(decoded.slice(0, sep), user) &&
          safeEqual(decoded.slice(sep + 1), password)) {
        return;
      }
    } catch (_) { /* header mal formado → pedir clave */ }
  }

  return new Response('Sitio en construcción — se requiere clave.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Workshop of Wonders", charset="UTF-8"',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}
