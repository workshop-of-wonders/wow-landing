// Migración única: lee los proyectos ya existentes como atributos data-*
// en portafolio.html (la página con las 21 tarjetas completas) y los
// inserta en la tabla `projects`/`project_images` de Postgres. También
// agrega data-slug="<slug>" a cada tarjeta en index.html y portafolio.html
// para que api/admin/_publish.js tenga un ancla estable al regenerar HTML.
//
// Uso:
//   POSTGRES_URL="postgres://..." node scripts/migrate-seed.mjs
//
// Correr primero contra una base de prueba/dev y revisar unas filas antes
// de apuntar a producción (ver plan en /root/.claude/plans si aplica).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sql } from '@vercel/postgres';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const BUTTON_RE = /<button type="button" class="([^"]*)"([^>]*)>/g;
const ATTR_RE = /(data-[a-z-]+)="((?:[^"\\]|\\.)*)"|(data-images)='((?:[^'\\]|\\.)*)'/g;

function decodeHtmlEntities(str) {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'");
}

function slugify(title) {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Mapea el sufijo de clase work-item-logo-<slug> (sin guiones) al slug real
// de carpeta en design-system/portfolio/, cuando existe.
const LOGO_CLASS_TO_SLUG = {
  clinicacerebro: 'clinica-del-cerebro',
  carlosravelo: 'carlos-ravelo',
  walkmate: 'walkmate',
  caminosdelavida: 'caminos-de-la-vida',
  lamarquessa: 'la-marquessa',
  serninos: 'ser-ninos',
};

function parseButtons(html) {
  const results = [];
  let match;
  BUTTON_RE.lastIndex = 0;
  while ((match = BUTTON_RE.exec(html))) {
    const classAttr = match[1];
    const attrsStr = match[2];
    if (!classAttr.startsWith('work-item')) continue;

    const attrs = {};
    let am;
    ATTR_RE.lastIndex = 0;
    while ((am = ATTR_RE.exec(attrsStr))) {
      if (am[1]) attrs[am[1]] = decodeHtmlEntities(am[2]);
      else if (am[3]) attrs[am[3]] = am[4]; // data-images: JSON, no decodificar comillas
    }

    const isLogo = classAttr.includes('work-item-logo');
    let slug = null;
    if (isLogo) {
      const logoClassMatch = classAttr.match(/work-item-logo-([a-z0-9]+)/);
      const key = logoClassMatch ? logoClassMatch[1] : null;
      slug = (key && LOGO_CLASS_TO_SLUG[key]) || (key ? slugify(key) : slugify(attrs['data-title'] || ''));
    } else {
      slug = slugify(attrs['data-title'] || '');
    }

    let images = [];
    if (attrs['data-images']) {
      try { images = JSON.parse(attrs['data-images']); } catch (e) { images = []; }
    }

    results.push({
      slug,
      variant: isLogo ? 'logo' : 'gallery',
      title: attrs['data-title'] || '',
      category: attrs['data-category'] || '',
      capabilities: attrs['data-capabilities'] || '',
      description: attrs['data-desc'] || '',
      tagline: attrs['data-tagline'] || null,
      work: attrs['data-work'] || '',
      coverImage: attrs['data-img'] || (images[0] || ''),
      images,
    });
  }
  return results;
}

async function main() {
  const portafolioPath = path.join(ROOT, 'portafolio.html');
  const indexPath = path.join(ROOT, 'index.html');
  const portafolioHtml = fs.readFileSync(portafolioPath, 'utf8');
  const indexHtml = fs.readFileSync(indexPath, 'utf8');

  const fromPortafolio = parseButtons(portafolioHtml);
  const fromIndex = parseButtons(indexHtml);
  const indexBySlug = new Map(fromIndex.map((p) => [p.slug, p]));

  console.log(`Encontrados ${fromPortafolio.length} proyectos en portafolio.html, ${fromIndex.length} en index.html.`);

  for (const project of fromPortafolio) {
    const onIndex = indexBySlug.get(project.slug);
    if (onIndex) {
      const fields = ['title', 'category', 'capabilities', 'description', 'tagline', 'work'];
      for (const f of fields) {
        if ((onIndex[f] || '') !== (project[f] || '')) {
          console.warn(`⚠️  ${project.slug}: campo "${f}" difiere entre index.html y portafolio.html`);
          console.warn(`    index.html:      ${JSON.stringify(onIndex[f])}`);
          console.warn(`    portafolio.html: ${JSON.stringify(project[f])}`);
        }
      }
    }

    await sql`
      INSERT INTO projects (slug, title, category, capabilities, description, tagline, work,
                             variant, cover_image, show_on_index, show_on_portafolio, sort_order)
      VALUES (${project.slug}, ${project.title}, ${project.category}, ${project.capabilities},
              ${project.description}, ${project.tagline}, ${project.work}, ${project.variant},
              ${project.coverImage}, ${!!onIndex}, true, ${fromPortafolio.indexOf(project)})
      ON CONFLICT (slug) DO NOTHING
    `;

    for (let i = 0; i < project.images.length; i++) {
      await sql`
        INSERT INTO project_images (project_slug, url, position)
        VALUES (${project.slug}, ${project.images[i]}, ${i})
        ON CONFLICT (project_slug, position) DO NOTHING
      `;
    }
    console.log(`✓ ${project.slug} (${project.images.length} imágenes, en index: ${!!onIndex})`);
  }

  // Agrega data-slug="<slug>" a cada <button data-lightbox ...> en ambos
  // archivos, usando data-title como referencia para emparejar.
  function addSlugAttrs(html, projects) {
    let out = html;
    for (const p of projects) {
      const re = new RegExp('(<button type="button" class="[^"]*work-item[^"]*" )(data-lightbox)([^>]*data-title="' +
        p.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '")');
      out = out.replace(re, `$1data-slug="${p.slug}" $2$3`);
    }
    return out;
  }

  const newPortafolioHtml = addSlugAttrs(portafolioHtml, fromPortafolio);
  const newIndexHtml = addSlugAttrs(indexHtml, fromIndex);
  fs.writeFileSync(portafolioPath, newPortafolioHtml, 'utf8');
  fs.writeFileSync(indexPath, newIndexHtml, 'utf8');

  console.log('\nListo. Revisa el diff de index.html/portafolio.html (solo deberían agregarse atributos data-slug) y haz commit.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
