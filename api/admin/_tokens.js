// Tokens de color de marca editables en styles.css (:root). Mismo patrón
// de publicación que _content.js/_publish.js: DB -> valor nuevo -> encontrar
// la línea "--key: <valor-actual>;" en styles.css via Octokit -> reemplazar
// -> commit.
//
// Solo los 4 colores de marca están expuestos aquí a propósito (no todos
// los tokens de :root) — ver CHANGELOG 2026-08-23 para el razonamiento.

const TOKEN_FIELDS = [
  { key: 'purple', label: 'Color morado (marca / fondo oscuro)' },
  { key: 'magenta', label: 'Color magenta (acentos)' },
  { key: 'orange', label: 'Color naranja (acentos)' },
  { key: 'lima', label: 'Color lima (acentos, CTA principal)' },
];

const CSS_PATH = 'styles.css';

function isValidHex(value) {
  return /^#[0-9a-fA-F]{3,8}$/.test(String(value || '').trim());
}

// Reemplaza la línea "--key: <lo-que-sea>;" (con el whitespace que use el
// archivo) por "--key: <newValue>;". Devuelve null si el token no se
// encuentra (p.ej. alguien lo renombró en styles.css a mano).
function replaceTokenLine(css, key, newValue) {
  const re = new RegExp('(--' + key + ':\\s*)([^;]+)(;)');
  if (!re.test(css)) return null;
  return css.replace(re, function (_m, pre, _old, post) { return pre + newValue + post; });
}

async function publishTokens(sql, octokit, owner, repo, branch) {
  const rows = (await sql`SELECT key, value FROM site_tokens`).rows;
  const byKey = new Map(rows.map(function (r) { return [r.key, r.value]; }));

  const fileRes = await octokit.repos.getContent({ owner, repo, path: CSS_PATH, ref: branch });
  const sha = fileRes.data.sha;
  let content = Buffer.from(fileRes.data.content, 'base64').toString('utf8');
  let changed = false;
  const updatedKeys = [];

  for (const field of TOKEN_FIELDS) {
    const dbValue = byKey.get(field.key);
    if (dbValue == null || !isValidHex(dbValue)) continue;
    const updated = replaceTokenLine(content, field.key, dbValue);
    if (updated === null) continue;
    if (updated !== content) {
      content = updated;
      changed = true;
      updatedKeys.push(field.key);
    }
  }

  if (!changed) return { committed: [] };

  await octokit.repos.createOrUpdateFileContents({
    owner, repo, path: CSS_PATH, branch, sha,
    message: 'admin: publicar cambios de color (' + updatedKeys.join(', ') + ')',
    content: Buffer.from(content, 'utf8').toString('base64'),
  });

  return { committed: [CSS_PATH], keys: updatedKeys };
}

module.exports = { TOKEN_FIELDS, isValidHex, replaceTokenLine, publishTokens };
