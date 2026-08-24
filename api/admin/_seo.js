// SEO (título/meta description), favicon y slugs de URL editables. Mismo
// patrón de publicación que _content.js/_tokens.js: DB -> valor nuevo ->
// encontrar el ancla en el HTML (o en vercel.json) via Octokit -> reemplazar
// -> commit. Todo folded en una sola función de rutas (api/admin/seo/
// [[...path]].js) para no sumar otro archivo al límite de 12 funciones del
// plan Hobby de Vercel.

const SITE_ORIGIN = 'https://wow-landing-beta.vercel.app';

// ---------------------------------------------------------------------
// Título / meta description
// ---------------------------------------------------------------------

// NO incluye canonical ni Open Graph/Twitter a propósito — fuera de alcance
// para este editor (ver CHANGELOG 2026-08-23). El canonical solo se toca
// desde publishSlug (porque ahí sí debe reflejar la URL pública real).
const SEO_FIELDS = [
  { key: 'seo.index_title', kind: 'title', page: 'index.html', label: 'Título (Inicio)' },
  { key: 'seo.index_meta_description', kind: 'meta_description', page: 'index.html', label: 'Meta descripción (Inicio)' },
  { key: 'seo.servicios_title', kind: 'title', page: 'servicios.html', label: 'Título (Servicios)' },
  { key: 'seo.servicios_meta_description', kind: 'meta_description', page: 'servicios.html', label: 'Meta descripción (Servicios)' },
  { key: 'seo.portafolio_title', kind: 'title', page: 'portafolio.html', label: 'Título (Portafolio)' },
  { key: 'seo.portafolio_meta_description', kind: 'meta_description', page: 'portafolio.html', label: 'Meta descripción (Portafolio)' },
];

function seoFieldByKey(key) {
  return SEO_FIELDS.find(function (f) { return f.key === key; }) || null;
}

function escText(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escAttr(str) {
  return escText(str).replace(/"/g, '&quot;');
}

// Reemplaza el contenido interior de <title ... data-ck="key" ...>...</title>.
function replaceTitleField(html, key, newValue) {
  const re = new RegExp('(<title(?:\\s[^>]*)?\\bdata-ck="' + key.replace(/[.]/g, '\\.') +
    '"[^>]*>)([\\s\\S]*?)(</title>)');
  if (!re.test(html)) return null;
  return html.replace(re, function (_m, open, _old, close) { return open + escText(newValue) + close; });
}

// Reemplaza el atributo content="..." del <meta ... data-ck="key" ... content="...">
// que corresponde. A diferencia de replaceContentField (content.js), acá no
// hay texto interior — lo que cambia es el valor del atributo.
function replaceMetaDescriptionField(html, key, newValue) {
  const escKey = key.replace(/[.]/g, '\\.');
  // El atributo content puede venir antes o después de data-ck en el markup;
  // cubrimos ambos órdenes.
  const reContentAfter = new RegExp(
    '(<meta\\s+name="description"\\s+data-ck="' + escKey + '"\\s+content=")([^"]*)(")'
  );
  const reContentBefore = new RegExp(
    '(<meta\\s+name="description"\\s+content=")([^"]*)("\\s+data-ck="' + escKey + '")'
  );
  if (reContentAfter.test(html)) {
    return html.replace(reContentAfter, function (_m, pre, _old, post) { return pre + escAttr(newValue) + post; });
  }
  if (reContentBefore.test(html)) {
    return html.replace(reContentBefore, function (_m, pre, _old, post) { return pre + escAttr(newValue) + post; });
  }
  return null;
}

async function publishSeo(sql, octokit, owner, repo, branch) {
  const rows = (await sql`SELECT key, value FROM site_seo`).rows;
  const byKey = new Map(rows.map(function (r) { return [r.key, r.value]; }));

  const pages = ['index.html', 'servicios.html', 'portafolio.html'];
  const committed = [];

  for (const path of pages) {
    const fieldsForPage = SEO_FIELDS.filter(function (f) { return f.page === path; });
    if (!fieldsForPage.length) continue;

    const fileRes = await octokit.repos.getContent({ owner, repo, path, ref: branch });
    const sha = fileRes.data.sha;
    let content = Buffer.from(fileRes.data.content, 'base64').toString('utf8');
    let changed = false;

    for (const field of fieldsForPage) {
      const dbValue = byKey.get(field.key);
      if (dbValue == null) continue;
      const updated = field.kind === 'title'
        ? replaceTitleField(content, field.key, dbValue)
        : replaceMetaDescriptionField(content, field.key, dbValue);
      if (updated === null) continue;
      if (updated !== content) {
        content = updated;
        changed = true;
      }
    }

    if (!changed) continue;

    await octokit.repos.createOrUpdateFileContents({
      owner, repo, path, branch, sha,
      message: 'admin: publicar cambios de SEO (' + path + ')',
      content: Buffer.from(content, 'utf8').toString('base64'),
    });
    committed.push(path);
  }

  return { committed };
}

// ---------------------------------------------------------------------
// Favicon
// ---------------------------------------------------------------------

const FAVICON_PAGES = ['index.html', 'servicios.html', 'portafolio.html', '404.html'];

// Reemplaza el href del <link rel="icon" ...> (cualquiera que sea su valor
// actual — el sparkle data-URI original, o una URL de Blob de una
// publicación anterior). Genérico a propósito para que republicar funcione
// igual de bien la segunda vez que la primera.
function replaceFaviconHref(html, newUrl) {
  const re = /(<link\s+rel="icon"\s+href=")([^"]*)(")/;
  if (!re.test(html)) return null;
  return html.replace(re, function (_m, pre, _old, post) { return pre + newUrl + post; });
}

async function publishFavicon(sql, octokit, owner, repo, branch) {
  const row = (await sql`SELECT value FROM site_favicon WHERE id = 'main'`).rows[0];
  if (!row || !row.value) return { committed: [] };
  const newUrl = row.value;
  const committed = [];

  for (const path of FAVICON_PAGES) {
    const fileRes = await octokit.repos.getContent({ owner, repo, path, ref: branch });
    const sha = fileRes.data.sha;
    const content = Buffer.from(fileRes.data.content, 'base64').toString('utf8');
    const updated = replaceFaviconHref(content, newUrl);
    if (updated === null || updated === content) continue;

    await octokit.repos.createOrUpdateFileContents({
      owner, repo, path, branch, sha,
      message: 'admin: publicar nuevo favicon (' + path + ')',
      content: Buffer.from(updated, 'utf8').toString('base64'),
    });
    committed.push(path);
  }

  return { committed };
}

// ---------------------------------------------------------------------
// Slugs de URL (servicios.html / portafolio.html)
// ---------------------------------------------------------------------

const VERCEL_JSON_PATH = 'vercel.json';
const SITEMAP_PATH = 'sitemap.xml';
// Todos los archivos donde puede aparecer un link/URL absoluta hacia
// servicios.html o portafolio.html (ver auditoría de hrefs en CHANGELOG).
const SLUG_LINKED_PAGES = ['index.html', 'servicios.html', 'portafolio.html', '404.html'];

const RESERVED_SLUGS = new Set([
  'api', 'admin', 'index', '404', 'sitemap', 'robots', 'servicios', 'portafolio',
  'design-system', 'js', 'styles.css', 'favicon.ico',
]);

function isValidSlug(slug, filenameStem) {
  if (typeof slug !== 'string') return false;
  const s = slug.trim();
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s)) return false;
  if (s === filenameStem) return true; // volver al default siempre es válido
  if (RESERVED_SLUGS.has(s)) return false;
  return true;
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Reemplaza toda referencia (URL absoluta y href relativo/raíz) a `oldRef`
// por `newSlug` dentro de un documento HTML. Devuelve { html, changed }.
// oldRef puede ser un nombre de archivo ("servicios.html") o un slug bonito
// ya activo ("nuestros-servicios"), según cuál sea la referencia vigente.
function applySlugRename(html, oldRef, newSlug) {
  let out = html;
  let changed = false;
  const escOld = escapeRegExp(oldRef);

  const absRe = new RegExp('(' + escapeRegExp(SITE_ORIGIN + '/') + ')' + escOld + '(?=["\\s])', 'g');
  if (absRe.test(out)) {
    out = out.replace(absRe, '$1' + newSlug);
    changed = true;
  }

  const hrefRe = new RegExp('href="(/)?' + escOld + '"', 'g');
  if (hrefRe.test(out)) {
    out = out.replace(hrefRe, function (_m, slash) { return 'href="' + (slash || '') + newSlug + '"'; });
    changed = true;
  }

  return { html: out, changed };
}

function applySlugRenameToSitemap(xml, oldRef, newSlug) {
  const old = SITE_ORIGIN + '/' + oldRef;
  const next = SITE_ORIGIN + '/' + newSlug;
  if (!xml.includes(old)) return { xml, changed: false };
  return { xml: xml.split(old).join(next), changed: true };
}

// page: 'servicios' | 'portafolio'. newSlug: nuevo slug bonito deseado (sin
// barras, sin extensión).
async function publishSlug(sql, octokit, owner, repo, branch, page, newSlug) {
  const row = (await sql`SELECT page, filename, current_slug FROM site_slugs WHERE page = ${page}`).rows[0];
  if (!row) throw new Error('slug_page_not_found');

  const filenameStem = row.filename.replace(/\.html$/, '');
  const slug = String(newSlug || '').trim();
  if (!isValidSlug(slug, filenameStem)) throw new Error('invalid_slug');

  const wasCustom = row.current_slug !== filenameStem;
  const oldRef = wasCustom ? row.current_slug : row.filename;

  if (slug === row.current_slug) {
    // Nada que hacer, ya está publicado con este slug.
    return { committed: [], slug: row.current_slug };
  }

  // 1) vercel.json: actualizar rewrite (siempre) + redirect(s) (si ya había
  // un slug personalizado activo antes de este cambio).
  const vercelFileRes = await octokit.repos.getContent({ owner, repo, path: VERCEL_JSON_PATH, ref: branch });
  const vercelSha = vercelFileRes.data.sha;
  const vercelConfig = JSON.parse(Buffer.from(vercelFileRes.data.content, 'base64').toString('utf8'));
  if (!Array.isArray(vercelConfig.rewrites)) vercelConfig.rewrites = [];
  if (!Array.isArray(vercelConfig.redirects)) vercelConfig.redirects = [];

  // Quitar cualquier rewrite previo que apunte a este mismo archivo destino
  // (el rewrite anterior de esta página, si existía) y agregar el nuevo.
  vercelConfig.rewrites = vercelConfig.rewrites.filter(function (r) {
    return r.destination !== '/' + row.filename;
  });
  vercelConfig.rewrites.push({ source: '/' + slug, destination: '/' + row.filename });

  if (wasCustom) {
    // Aplanar la cadena: cualquier redirect existente que apuntaba al slug
    // viejo debe apuntar directo al nuevo, para que nunca quede un salto
    // intermedio a un slug ahora obsoleto.
    vercelConfig.redirects = vercelConfig.redirects.map(function (r) {
      if (r.destination === '/' + row.current_slug) {
        return Object.assign({}, r, { destination: '/' + slug });
      }
      return r;
    });
    // Agregar el redirect del slug viejo al nuevo (301 permanente).
    vercelConfig.redirects.push({ source: '/' + row.current_slug, destination: '/' + slug, permanent: true });
  }

  await octokit.repos.createOrUpdateFileContents({
    owner, repo, path: VERCEL_JSON_PATH, branch, sha: vercelSha,
    message: 'admin: actualizar rewrite/redirect de URL (' + page + ' -> /' + slug + ')',
    content: Buffer.from(JSON.stringify(vercelConfig, null, 2) + '\n', 'utf8').toString('base64'),
  });

  const committed = [VERCEL_JSON_PATH];

  // 2) HTML: canonical, og:url, JSON-LD urls y cualquier <a href> interno
  // que apunte a la referencia vieja, en todas las páginas relevantes.
  for (const path of SLUG_LINKED_PAGES) {
    const fileRes = await octokit.repos.getContent({ owner, repo, path, ref: branch });
    const sha = fileRes.data.sha;
    const content = Buffer.from(fileRes.data.content, 'base64').toString('utf8');
    const result = applySlugRename(content, oldRef, slug);
    if (!result.changed) continue;

    await octokit.repos.createOrUpdateFileContents({
      owner, repo, path, branch, sha,
      message: 'admin: actualizar enlaces internos tras renombrar URL (' + path + ')',
      content: Buffer.from(result.html, 'utf8').toString('base64'),
    });
    committed.push(path);
  }

  // 3) sitemap.xml
  const sitemapRes = await octokit.repos.getContent({ owner, repo, path: SITEMAP_PATH, ref: branch });
  const sitemapSha = sitemapRes.data.sha;
  const sitemapXml = Buffer.from(sitemapRes.data.content, 'base64').toString('utf8');
  const sitemapResult = applySlugRenameToSitemap(sitemapXml, oldRef, slug);
  if (sitemapResult.changed) {
    await octokit.repos.createOrUpdateFileContents({
      owner, repo, path: SITEMAP_PATH, branch, sha: sitemapSha,
      message: 'admin: actualizar sitemap.xml tras renombrar URL (' + page + ')',
      content: Buffer.from(sitemapResult.xml, 'utf8').toString('base64'),
    });
    committed.push(SITEMAP_PATH);
  }

  // 4) DB
  await sql`UPDATE site_slugs SET current_slug = ${slug}, updated_at = now() WHERE page = ${page}`;

  return { committed, slug };
}

module.exports = {
  SEO_FIELDS, seoFieldByKey, replaceTitleField, replaceMetaDescriptionField, publishSeo,
  replaceFaviconHref, publishFavicon,
  isValidSlug, applySlugRename, applySlugRenameToSitemap, publishSlug,
  SITE_ORIGIN,
};
