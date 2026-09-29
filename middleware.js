// Clave temporal para todo el sitio (Vercel Routing Middleware).
// Se activa solo si existe la variable de entorno SITE_PASSWORD en Vercel;
// para abrir el sitio basta con borrar esa variable y redeployar.
//
// El formulario de /pronto/ hace POST a /__wow-unlock, que valida la clave
// y deja una cookie de sesión (sin Max-Age): el navegador la borra al
// cerrarse, pero mientras siga abierto todas las páginas cargan directo,
// sin volver a pedir la clave. CSS, JS e imágenes no piden pase, solo las
// páginas (documentos).
//
// Fuera del middleware: /api (el panel usa sus propias cookies/JWT y el form
// de contacto), /pronto (la página misma y sus assets) y /design-system
// (logo, íconos y fuente que usa la página "Muy pronto").

export const config = {
  matcher: ['/((?!api/|pronto/|design-system/).*)'],
};

const COOKIE = 'wow_gate';
const UNLOCK_PATH = '/__wow-unlock';

async function token(password) {
  const data = new TextEncoder().encode('wow-gate:' + password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('');
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function readCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return '';
}

// Solo las páginas piden clave; los assets (CSS, JS, imágenes) pasan directo
// para que la página ya desbloqueada cargue completa sin gastar el pase.
function isDocument(request, url) {
  const dest = request.headers.get('sec-fetch-dest');
  if (dest) return dest === 'document' || dest === 'iframe';
  const last = url.pathname.split('/').pop();
  return !last.includes('.') || last.endsWith('.html');
}

async function unlock(request, expected) {
  const url = new URL(request.url);
  const wantsJson = request.headers.get('x-wow-gate') === 'fetch';
  let given = '';
  let next = '/';
  if (request.method === 'POST') {
    try {
      const form = await request.formData();
      given = String(form.get('clave') || '');
      const n = String(form.get('next') || '/');
      if (n.startsWith('/') && !n.startsWith('//')) next = n;
    } catch (_) { /* cuerpo inválido → clave vacía */ }
  }

  const ok = given !== '' && safeEqual(await token(given), expected);
  const headers = new Headers({ 'Cache-Control': 'no-store' });
  if (ok) {
    // Sin Max-Age: cookie de sesión, se borra al cerrar el navegador.
    headers.append('Set-Cookie',
      `${COOKIE}=${expected}; Path=/; HttpOnly; Secure; SameSite=Lax`);
  }

  if (wantsJson) {
    headers.set('Content-Type', 'application/json');
    return new Response(JSON.stringify({ ok, next }), { status: ok ? 200 : 401, headers });
  }
  headers.set('Location', new URL(ok ? next : '/?clave=error', url).toString());
  return new Response(null, { status: 303, headers });
}

export default async function middleware(request) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return;

  const expected = await token(password);
  const url = new URL(request.url);

  if (url.pathname === UNLOCK_PATH) return unlock(request, expected);
  if (!isDocument(request, url)) return;

  if (safeEqual(readCookie(request, COOKIE), expected)) {
    // Cookie válida: deja ver esta y todas las páginas siguientes.
    return new Response(null, {
      headers: { 'x-middleware-next': '1' },
    });
  }

  // Mostrar "Muy pronto" en la misma URL (rewrite, no redirect).
  return new Response(null, {
    headers: { 'x-middleware-rewrite': new URL('/pronto/index.html', url).toString() },
  });
}
