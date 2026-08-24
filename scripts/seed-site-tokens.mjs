// Migración única: lee el valor hex actual de los 4 tokens de color de
// marca (--purple, --magenta, --orange, --lima) en styles.css y los
// inserta como fila inicial en la tabla `site_tokens`.
//
// La lista de tokens debe coincidir exactamente con TOKEN_FIELDS en
// api/admin/_tokens.js.
//
// Uso:
//   POSTGRES_URL="postgres://..." node scripts/seed-site-tokens.mjs
//   (o DATABASE_URL, que es como lo nombra la integración Neon de Vercel)
//
// No se corrió en la sesión que escribió este script — no había base de
// datos disponible. Correr una sola vez, después de aplicar scripts/schema.sql.

if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL;
}

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sql } from '@vercel/postgres';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// Debe reflejar exactamente api/admin/_tokens.js -> TOKEN_FIELDS.
const TOKEN_FIELDS = [
  { key: 'purple', label: 'Color morado (marca / fondo oscuro)' },
  { key: 'magenta', label: 'Color magenta (acentos)' },
  { key: 'orange', label: 'Color naranja (acentos)' },
  { key: 'lima', label: 'Color lima (acentos, CTA principal)' },
];

async function main() {
  const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');

  let ok = 0;
  let missing = 0;

  for (const field of TOKEN_FIELDS) {
    const re = new RegExp('--' + field.key + ':\\s*([^;]+);');
    const m = css.match(re);
    if (!m) {
      console.warn(`⚠️  No se encontró --${field.key} en styles.css — se omite.`);
      missing++;
      continue;
    }
    const value = m[1].trim();
    await sql`
      INSERT INTO site_tokens (key, value, label)
      VALUES (${field.key}, ${value}, ${field.label})
      ON CONFLICT (key) DO NOTHING
    `;
    console.log(`✓ ${field.key}: ${value}`);
    ok++;
  }

  console.log(`\nListo. ${ok} tokens insertados/confirmados, ${missing} no encontrados en styles.css.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
