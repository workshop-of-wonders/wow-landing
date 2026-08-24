// Textos editables del sitio (hero, encabezados de sección, intros).
// Mismo patrón que _publish.js: DB -> texto nuevo -> encontrar el elemento
// anclado por data-ck="<key>" en el HTML -> reemplazar -> commit via Octokit.
//
// A diferencia de los proyectos (un <button> completo por slug), acá el
// ancla es un atributo puesto directamente sobre el elemento que ya
// contiene el texto (h1, h2, p, a) y lo que se reemplaza es su contenido
// interior, no el elemento completo.
//
// CONTENT_FIELDS es la fuente de verdad de qué campos existen, en qué
// página/tag viven, y si su valor debe tratarse como HTML crudo (rawHtml)
// porque el texto original tiene marcado anidado (<em>, <br>) que el panel
// no intenta editar por separado — para esos campos el textarea del admin
// edita el HTML interior tal cual, sin escapar, así que quien edite ahí
// puede romper el marcado si no tiene cuidado. El resto de campos son texto
// plano: se escapan siempre al publicar.

const CONTENT_FIELDS = [
  // ---- index.html: Hero ----
  { key: 'hero.eyebrow', tag: 'p', page: 'index.html', label: 'Texto pequeño sobre el título (Hero)', rawHtml: false },
  { key: 'hero.h1', tag: 'h1', page: 'index.html', label: 'Título principal (Hero)', rawHtml: true },
  { key: 'hero.sub', tag: 'p', page: 'index.html', label: 'Subtítulo (Hero)', rawHtml: false },
  { key: 'hero.cta_primary', tag: 'a', page: 'index.html', label: 'Botón principal (Hero)', rawHtml: false },
  { key: 'hero.cta_secondary', tag: 'a', page: 'index.html', label: 'Botón secundario (Hero)', rawHtml: false },
  // ---- index.html: secciones ----
  { key: 'servicios.h2', tag: 'h2', page: 'index.html', label: 'Título (Servicios)', rawHtml: false },
  { key: 'labs.intro', tag: 'p', page: 'index.html', label: 'Texto introductorio (Labs)', rawHtml: false },
  { key: 'trabajo.h2', tag: 'h2', page: 'index.html', label: 'Título (Trabajo)', rawHtml: false },
  { key: 'filosofia.h2', tag: 'h2', page: 'index.html', label: 'Título (Nosotros)', rawHtml: false },
  { key: 'filosofia.intro', tag: 'p', page: 'index.html', label: 'Texto introductorio (Nosotros)', rawHtml: false },
  { key: 'metodologia.h2', tag: 'h2', page: 'index.html', label: 'Título (Proceso)', rawHtml: false },
  { key: 'metodologia.intro', tag: 'p', page: 'index.html', label: 'Texto introductorio (Proceso)', rawHtml: false },
  { key: 'faq.h2', tag: 'h2', page: 'index.html', label: 'Título (Preguntas frecuentes)', rawHtml: false },
  // ---- servicios.html ----
  { key: 'svc.hero_h1', tag: 'h1', page: 'servicios.html', label: 'Título principal (Hero servicios)', rawHtml: true },
  { key: 'svc.hero_sub', tag: 'p', page: 'servicios.html', label: 'Subtítulo (Hero servicios)', rawHtml: false },
  { key: 'svc.cat_digital_experience_h2', tag: 'h2', page: 'servicios.html', label: 'Categoría: Experiencia digital', rawHtml: false },
  { key: 'svc.cat_growth_marketing_h2', tag: 'h2', page: 'servicios.html', label: 'Categoría: Crecimiento y marketing digital', rawHtml: false },
  { key: 'svc.cat_marketing_intelligence_h2', tag: 'h2', page: 'servicios.html', label: 'Categoría: Analítica y datos', rawHtml: false },
  { key: 'svc.cat_cursos_h2', tag: 'h2', page: 'servicios.html', label: 'Categoría: Cursos digitales', rawHtml: false },
];

function esc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function fieldByKey(key) {
  return CONTENT_FIELDS.find(function (f) { return f.key === key; }) || null;
}

// Reemplaza el contenido interior del elemento <tag ... data-ck="key" ...>
// ...</tag> encontrado en html. rawHtml=true inserta newValue tal cual
// (se espera que ya sea HTML válido, p.ej. "Construyamos <em>maravillas</em>");
// rawHtml=false escapa newValue como texto plano.
function replaceContentField(html, field, newValue) {
  const re = new RegExp('(<' + field.tag + '(?:\\s[^>]*)?\\bdata-ck="' + field.key.replace(/[.]/g, '\\.') +
    '"[^>]*>)([\\s\\S]*?)(</' + field.tag + '>)');
  if (!re.test(html)) return null;
  const inner = field.rawHtml ? newValue : esc(newValue);
  return html.replace(re, function (_m, open, _oldInner, close) { return open + inner + close; });
}

// Publica todos los campos de site_content cuyo valor en DB difiera del
// valor actualmente en vivo en index.html/servicios.html. Un commit por
// archivo que tenga al menos un cambio real.
async function publishContent(sql, octokit, owner, repo, branch) {
  const rows = (await sql`SELECT key, value FROM site_content`).rows;
  const byKey = new Map(rows.map(function (r) { return [r.key, r.value]; }));

  const pages = ['index.html', 'servicios.html'];
  const committed = [];

  for (const path of pages) {
    const fieldsForPage = CONTENT_FIELDS.filter(function (f) { return f.page === path; });
    if (!fieldsForPage.length) continue;

    const fileRes = await octokit.repos.getContent({ owner, repo, path, ref: branch });
    const sha = fileRes.data.sha;
    let content = Buffer.from(fileRes.data.content, 'base64').toString('utf8');
    let changed = false;

    for (const field of fieldsForPage) {
      const dbValue = byKey.get(field.key);
      if (dbValue == null) continue; // sin fila en DB todavía (no debería pasar tras el seed)
      const updated = replaceContentField(content, field, dbValue);
      if (updated === null) continue; // ancla no encontrada en esta versión del HTML
      if (updated !== content) {
        content = updated;
        changed = true;
      }
    }

    if (!changed) continue;

    await octokit.repos.createOrUpdateFileContents({
      owner, repo, path, branch, sha,
      message: 'admin: publicar cambios de texto (' + path + ')',
      content: Buffer.from(content, 'utf8').toString('base64'),
    });
    committed.push(path);
  }

  return { committed };
}

module.exports = { CONTENT_FIELDS, fieldByKey, replaceContentField, publishContent, esc };
