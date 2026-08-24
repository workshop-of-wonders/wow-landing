// Migración única: lee el valor actual de cada campo anclado con
// data-ck="<key>" en index.html/servicios.html y lo inserta como fila
// inicial en la tabla `site_content`, para que la base arranque en sync
// con lo que ya está en vivo.
//
// La lista de campos (key/tag/página/label) debe coincidir exactamente con
// CONTENT_FIELDS en api/admin/_content.js — si agregas/quitas un campo ahí,
// actualiza también esta lista.
//
// Uso:
//   POSTGRES_URL="postgres://..." node scripts/seed-site-content.mjs
//   (o DATABASE_URL, que es como lo nombra la integración Neon de Vercel)
//
// No se corrió en la sesión que escribió este script — no había base de
// datos disponible. Correr una sola vez, después de aplicar scripts/schema.sql,
// y revisar la salida antes de asumir que quedó bien.

if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL;
}

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sql } from '@vercel/postgres';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// Debe reflejar exactamente api/admin/_content.js -> CONTENT_FIELDS.
const CONTENT_FIELDS = [
  { key: 'hero.eyebrow', tag: 'p', page: 'index.html', label: 'Texto pequeño sobre el título (Hero)' },
  { key: 'hero.h1', tag: 'h1', page: 'index.html', label: 'Título principal (Hero)' },
  { key: 'hero.sub', tag: 'p', page: 'index.html', label: 'Subtítulo (Hero)' },
  { key: 'hero.cta_primary', tag: 'a', page: 'index.html', label: 'Botón principal (Hero)' },
  { key: 'hero.cta_secondary', tag: 'a', page: 'index.html', label: 'Botón secundario (Hero)' },
  { key: 'servicios.h2', tag: 'h2', page: 'index.html', label: 'Título (Servicios)' },
  { key: 'labs.intro', tag: 'p', page: 'index.html', label: 'Texto introductorio (Labs)' },
  { key: 'trabajo.h2', tag: 'h2', page: 'index.html', label: 'Título (Trabajo)' },
  { key: 'filosofia.h2', tag: 'h2', page: 'index.html', label: 'Título (Nosotros)' },
  { key: 'filosofia.intro', tag: 'p', page: 'index.html', label: 'Texto introductorio (Nosotros)' },
  { key: 'metodologia.h2', tag: 'h2', page: 'index.html', label: 'Título (Proceso)' },
  { key: 'metodologia.intro', tag: 'p', page: 'index.html', label: 'Texto introductorio (Proceso)' },
  { key: 'faq.h2', tag: 'h2', page: 'index.html', label: 'Título (Preguntas frecuentes)' },
  { key: 'svc.hero_h1', tag: 'h1', page: 'servicios.html', label: 'Título principal (Hero servicios)' },
  { key: 'svc.hero_sub', tag: 'p', page: 'servicios.html', label: 'Subtítulo (Hero servicios)' },
  { key: 'svc.cat_digital_experience_h2', tag: 'h2', page: 'servicios.html', label: 'Categoría: Experiencia digital' },
  { key: 'svc.cat_growth_marketing_h2', tag: 'h2', page: 'servicios.html', label: 'Categoría: Crecimiento y marketing digital' },
  { key: 'svc.cat_marketing_intelligence_h2', tag: 'h2', page: 'servicios.html', label: 'Categoría: Analítica y datos' },
  { key: 'svc.cat_cursos_h2', tag: 'h2', page: 'servicios.html', label: 'Categoría: Cursos digitales' },
];

function extractInner(html, tag, key) {
  const re = new RegExp('<' + tag + '(?:\\s[^>]*)?\\bdata-ck="' + key.replace(/[.]/g, '\\.') +
    '"[^>]*>([\\s\\S]*?)</' + tag + '>');
  const m = html.match(re);
  return m ? m[1] : null;
}

async function main() {
  const htmlByPage = {
    'index.html': fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'),
    'servicios.html': fs.readFileSync(path.join(ROOT, 'servicios.html'), 'utf8'),
  };

  let ok = 0;
  let missing = 0;

  for (const field of CONTENT_FIELDS) {
    const html = htmlByPage[field.page];
    const value = extractInner(html, field.tag, field.key);
    if (value == null) {
      console.warn(`⚠️  No se encontró data-ck="${field.key}" (<${field.tag}>) en ${field.page} — se omite.`);
      missing++;
      continue;
    }
    await sql`
      INSERT INTO site_content (key, value, label, page)
      VALUES (${field.key}, ${value}, ${field.label}, ${field.page})
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
