// Migración única: crea las filas iniciales de `site_slugs` para
// servicios.html/portafolio.html. Ninguna de las dos páginas tiene todavía
// una URL bonita personalizada, así que current_slug arranca igual al
// nombre del archivo sin extensión ("servicios", "portafolio") — ver
// api/admin/_seo.js -> publishSlug para cómo se interpreta ese estado
// (current_slug === filename sin ".html" significa "sin URL bonita
// publicada todavía", solo /archivo.html responde).
//
// Uso:
//   POSTGRES_URL="postgres://..." node scripts/seed-site-slugs.mjs
//   (o DATABASE_URL, que es como lo nombra la integración Neon de Vercel)
//
// No se corrió en la sesión que escribió este script — no había base de
// datos disponible. Correr una sola vez, después de aplicar
// scripts/schema.sql.

if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL;
}

import { sql } from '@vercel/postgres';

const PAGES = [
  { page: 'servicios', filename: 'servicios.html' },
  { page: 'portafolio', filename: 'portafolio.html' },
];

async function main() {
  for (const { page, filename } of PAGES) {
    const defaultSlug = filename.replace(/\.html$/, '');
    await sql`
      INSERT INTO site_slugs (page, filename, current_slug)
      VALUES (${page}, ${filename}, ${defaultSlug})
      ON CONFLICT (page) DO NOTHING
    `;
    console.log(`✓ ${page} -> filename=${filename}, current_slug=${defaultSlug}`);
  }
  console.log('\nListo.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
