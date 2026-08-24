// Migración única: lee el <title data-ck="..."> y el content="" del
// <meta name="description" data-ck="...""> actuales de index.html/
// servicios.html/portafolio.html y los inserta como filas iniciales en
// `site_seo`, para que la base arranque en sync con lo que ya está en vivo.
//
// La lista de campos debe coincidir exactamente con SEO_FIELDS en
// api/admin/_seo.js — si agregas/quitas un campo ahí, actualiza también
// esta lista.
//
// Uso:
//   POSTGRES_URL="postgres://..." node scripts/seed-site-seo.mjs
//   (o DATABASE_URL, que es como lo nombra la integración Neon de Vercel)
//
// No se corrió en la sesión que escribió este script — no había base de
// datos disponible. Correr una sola vez, después de aplicar
// scripts/schema.sql, y revisar la salida antes de asumir que quedó bien.

if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL;
}

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sql } from '@vercel/postgres';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// Debe reflejar exactamente api/admin/_seo.js -> SEO_FIELDS.
const SEO_FIELDS = [
  { key: 'seo.index_title', kind: 'title', page: 'index.html', label: 'Título (Inicio)' },
  { key: 'seo.index_meta_description', kind: 'meta_description', page: 'index.html', label: 'Meta descripción (Inicio)' },
  { key: 'seo.servicios_title', kind: 'title', page: 'servicios.html', label: 'Título (Servicios)' },
  { key: 'seo.servicios_meta_description', kind: 'meta_description', page: 'servicios.html', label: 'Meta descripción (Servicios)' },
  { key: 'seo.portafolio_title', kind: 'title', page: 'portafolio.html', label: 'Título (Portafolio)' },
  { key: 'seo.portafolio_meta_description', kind: 'meta_description', page: 'portafolio.html', label: 'Meta descripción (Portafolio)' },
];

function extractTitle(html, key) {
  const re = new RegExp('<title(?:\\s[^>]*)?\\bdata-ck="' + key.replace(/[.]/g, '\\.') +
    '"[^>]*>([\\s\\S]*?)</title>');
  const m = html.match(re);
  return m ? m[1] : null;
}

function extractMetaDescription(html, key) {
  const escKey = key.replace(/[.]/g, '\\.');
  const reAfter = new RegExp('<meta\\s+name="description"\\s+data-ck="' + escKey + '"\\s+content="([^"]*)"');
  const reBefore = new RegExp('<meta\\s+name="description"\\s+content="([^"]*)"\\s+data-ck="' + escKey + '"');
  const m = html.match(reAfter) || html.match(reBefore);
  return m ? m[1] : null;
}

async function main() {
  const htmlByPage = {
    'index.html': fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'),
    'servicios.html': fs.readFileSync(path.join(ROOT, 'servicios.html'), 'utf8'),
    'portafolio.html': fs.readFileSync(path.join(ROOT, 'portafolio.html'), 'utf8'),
  };

  let ok = 0;
  let missing = 0;

  for (const field of SEO_FIELDS) {
    const html = htmlByPage[field.page];
    const value = field.kind === 'title'
      ? extractTitle(html, field.key)
      : extractMetaDescription(html, field.key);
    if (value == null) {
      console.warn(`⚠️  No se encontró data-ck="${field.key}" en ${field.page} — se omite.`);
      missing++;
      continue;
    }
    await sql`
      INSERT INTO site_seo (key, value, label, page, kind)
      VALUES (${field.key}, ${value}, ${field.label}, ${field.page}, ${field.kind})
      ON CONFLICT (key) DO NOTHING
    `;
    console.log(`✓ ${field.key} (${field.page}): ${JSON.stringify(value.slice(0, 60))}${value.length > 60 ? '…' : ''}`);
    ok++;
  }

  console.log(`\nListo. ${ok} campos insertados/confirmados, ${missing} no encontrados en el HTML.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
