// Regenera el bloque <button data-lightbox data-slug="..."> de un proyecto
// y lo commitea a index.html / portafolio.html via la API de GitHub, para
// que Vercel despliegue el cambio igual que cualquier push manual.
//
// El ancla para encontrar el bloque a reemplazar es data-slug="<slug>" —
// agregado a cada card existente durante la migración (scripts/migrate-seed.mjs)
// específicamente para que este regenerador nunca dependa de texto que puede
// cambiar (como el título).

function esc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function slugifyClass(slug) {
  return slug.replace(/-/g, '');
}

function renderBlock(project, images) {
  const imageList = images.length ? images.map(function (i) { return i.url; }) : [project.cover_image];
  const dataImages = "'" + JSON.stringify(imageList) + "'";
  const common = 'data-lightbox data-slug="' + esc(project.slug) + '" data-img="' + esc(project.cover_image) +
    '" data-images=' + dataImages +
    ' data-title="' + esc(project.title) + '" data-category="' + esc(project.category) +
    '" data-capabilities="' + esc(project.capabilities) + '" data-desc="' + esc(project.description) + '"' +
    (project.tagline ? ' data-tagline="' + esc(project.tagline) + '"' : '') +
    ' data-work="' + esc(project.work) + '"';

  if (project.variant === 'logo') {
    const cls = 'work-item work-item-logo work-item-' + slugifyClass(project.slug);
    return '<button type="button" class="' + cls + '" ' + common + '>' +
      '<span class="work-item-logo-badge"><img src="' + esc(project.cover_image) + '" alt="' + esc(project.title) +
      '" loading="lazy"></span>' +
      '<span class="work-item-name">' + esc(project.title) + '</span>' +
      '<span class="work-item-tag">' + esc(project.category) + '</span></button>';
  }

  return '<button type="button" class="work-item" ' + common + '>' +
    '<img src="' + esc(project.cover_image) + '" alt="' + esc(project.title) + '" loading="lazy"></button>';
}

// Reemplaza el bloque <button ... data-slug="X" ...>...</button> existente
// (buscado por el atributo data-slug) dentro del contenido HTML dado.
function replaceBlock(html, slug, newBlock) {
  const re = new RegExp('<button[^>]*data-slug="' + slug + '"[\\s\\S]*?</button>');
  if (!re.test(html)) return null; // el proyecto no existe en esta página
  return html.replace(re, newBlock);
}

async function publishProject(sql, octokit, owner, repo, branch, slug) {
  const projectRes = await sql`SELECT * FROM projects WHERE slug = ${slug}`;
  if (!projectRes.rows.length) throw new Error('project_not_found');
  const project = projectRes.rows[0];
  const imagesRes = await sql`
    SELECT url FROM project_images WHERE project_slug = ${slug} ORDER BY position ASC
  `;
  const block = renderBlock(project, imagesRes.rows);

  const targets = [];
  if (project.show_on_index) targets.push('index.html');
  if (project.show_on_portafolio) targets.push('portafolio.html');

  const committed = [];
  for (const path of targets) {
    const fileRes = await octokit.repos.getContent({ owner, repo, path, ref: branch });
    const sha = fileRes.data.sha;
    const content = Buffer.from(fileRes.data.content, 'base64').toString('utf8');
    const updated = replaceBlock(content, slug, block);
    if (updated === null) continue; // proyecto nuevo, aún no tiene bloque en esa página
    if (updated === content) continue; // sin cambios reales
    await octokit.repos.createOrUpdateFileContents({
      owner, repo, path, branch, sha,
      message: 'admin: publicar cambios de ' + slug,
      content: Buffer.from(updated, 'utf8').toString('base64'),
    });
    committed.push(path);
  }

  await sql`UPDATE projects SET published_at = now() WHERE slug = ${slug}`;
  return { committed };
}

module.exports = { renderBlock, replaceBlock, publishProject };
