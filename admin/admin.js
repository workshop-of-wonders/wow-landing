import { upload } from 'https://esm.sh/@vercel/blob@2.8.0/client';

const app = document.getElementById('app');
const state = { view: 'projects', projects: [], leads: [], leadFilter: '', contentFields: [], tokens: [], seo: null };

function toast(msg, kind) {
  const el = document.createElement('div');
  el.className = 'toast ' + (kind || 'ok');
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

async function api(path, opts) {
  const res = await fetch('/api/admin' + path, Object.assign({
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
  }, opts));
  if (res.status === 401) {
    renderLogin();
    throw new Error('unauthorized');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) throw new Error(data.error || 'request_failed');
  return data;
}

// ---------- Login ----------

function renderLogin(errorMsg) {
  app.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'login-screen';
  wrap.innerHTML = `
    <div class="login-box">
      <div class="login-mark">✦</div>
      <h1>Workshop of Wonders</h1>
      <p class="sub">Panel de administración</p>
      <div class="field"><label>Usuario</label><input id="u" type="text" autocomplete="username"></div>
      <div class="field"><label>Contraseña</label><input id="p" type="password" autocomplete="current-password"></div>
      <button class="btn" id="loginBtn" style="width:100%">Entrar</button>
      <div class="error-msg" id="loginErr">${errorMsg || ''}</div>
    </div>`;
  app.appendChild(wrap);
  document.getElementById('loginBtn').addEventListener('click', doLogin);
  document.getElementById('p').addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
}

async function doLogin() {
  const username = document.getElementById('u').value.trim();
  const password = document.getElementById('p').value;
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!data.success) {
      renderLogin(data.error === 'too_many_attempts' ? 'Demasiados intentos, espera unos minutos.' : 'Usuario o contraseña incorrectos.');
      return;
    }
    renderShell();
  } catch (e) {
    renderLogin('Error de red, intenta de nuevo.');
  }
}

// ---------- Shell ----------

function renderShell() {
  app.innerHTML = `
    <div class="shell">
      <div class="sidebar">
        <div class="brand"><div class="mark">✦</div><span>WOW Admin</span></div>
        <nav>
          <button data-view="projects"><span class="dot"></span>Proyectos</button>
          <button data-view="leads"><span class="dot"></span>Leads / CRM</button>
          <button data-view="content"><span class="dot"></span>Textos</button>
          <button data-view="headings"><span class="dot"></span>Encabezados</button>
          <button data-view="tokens"><span class="dot"></span>Colores</button>
          <button data-view="seo"><span class="dot"></span>SEO</button>
        </nav>
        <button class="logout" id="logoutBtn">Cerrar sesión</button>
      </div>
      <div class="main" id="main"></div>
    </div>`;
  document.querySelectorAll('.sidebar nav button').forEach((b) => {
    b.addEventListener('click', () => { state.view = b.dataset.view; renderView(); });
  });
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    renderLogin();
  });
  renderView();
}

function renderView() {
  document.querySelectorAll('.sidebar nav button').forEach((b) => {
    b.classList.toggle('active', b.dataset.view === state.view);
  });
  if (state.view === 'projects') renderProjectsList();
  else if (state.view === 'leads') renderLeads();
  else if (state.view === 'content') renderContent();
  else if (state.view === 'headings') renderHeadings();
  else if (state.view === 'tokens') renderTokens();
  else if (state.view === 'seo') renderSeo();
}

// ---------- Proyectos ----------

async function renderProjectsList() {
  const main = document.getElementById('main');
  main.innerHTML = '<h1>Proyectos</h1><p>Cargando…</p>';
  try {
    const { projects } = await api('/projects');
    state.projects = projects;
    const published = projects.filter((p) => p.published_at).length;
    const rows = projects.map((p) => `
      <tr class="clickable" data-slug="${p.slug}">
        <td>${p.title}</td>
        <td>${p.category || ''}</td>
        <td>${p.variant === 'logo' ? 'Solo logo' : 'Galería'}</td>
        <td>${p.published_at ? '<span class="badge published">Publicado</span>' : '<span class="badge draft">Sin publicar</span>'}</td>
      </tr>`).join('');
    main.innerHTML = `
      <h1>Proyectos</h1>
      <p class="subtitle">Edita el portafolio y publica los cambios al sitio en vivo.</p>
      <div class="stat-row">
        <div class="stat-card accent-lima"><div class="n">${projects.length}</div><div class="l">Proyectos</div></div>
        <div class="stat-card accent-magenta"><div class="n">${published}</div><div class="l">Publicados</div></div>
        <div class="stat-card accent-orange"><div class="n">${projects.length - published}</div><div class="l">Sin publicar</div></div>
      </div>
      <div class="card-panel">
        <table>
          <thead><tr><th>Título</th><th>Categoría</th><th>Tipo</th><th>Estado</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="4" class="empty-state">Sin proyectos todavía.</td></tr>'}</tbody>
        </table>
      </div>`;
    main.querySelectorAll('tr.clickable').forEach((tr) => {
      tr.addEventListener('click', () => renderProjectEditor(tr.dataset.slug));
    });
  } catch (e) {
    if (e.message !== 'unauthorized') main.innerHTML = '<p class="error-msg">No se pudo cargar la lista de proyectos.</p>';
  }
}

async function renderProjectEditor(slug) {
  const main = document.getElementById('main');
  main.innerHTML = '<p>Cargando…</p>';
  const { project, images } = await api('/projects?slug=' + encodeURIComponent(slug));

  main.innerHTML = `
    <button class="back-link" id="back">← Volver a proyectos</button>
    <h1>${project.title} ${project.published_at ? '<span class="badge published">Publicado</span>' : '<span class="badge draft">Sin publicar</span>'}</h1>
    <p class="subtitle">${project.category || ''}</p>
    <div class="editor-grid">
      <div class="editor-card">
        <div class="field"><label>Título</label><input id="f-title" value="${escAttr(project.title)}"></div>
        <div class="field"><label>Categoría (separado por ·)</label><input id="f-category" value="${escAttr(project.category)}"></div>
        <div class="field"><label>Capacidades / servicios (separado por ·)</label><input id="f-capabilities" value="${escAttr(project.capabilities)}"></div>
        <div class="field"><label>Descripción corta</label><input id="f-description" value="${escAttr(project.description)}"></div>
        <div class="field"><label>Tagline (usa *palabra* para resaltar)</label><input id="f-tagline" value="${escAttr(project.tagline || '')}"></div>
        <div class="field"><label>Texto largo (case study)</label><textarea id="f-work" rows="6">${esc(project.work)}</textarea></div>
        <div class="toggle-row">
          <label><input type="checkbox" id="f-showindex" ${project.show_on_index ? 'checked' : ''}> Mostrar en index.html</label>
          <label><input type="checkbox" id="f-showport" ${project.show_on_portafolio ? 'checked' : ''}> Mostrar en portafolio.html</label>
        </div>
        <div class="editor-actions">
          <button class="btn" id="saveBtn">Guardar cambios</button>
          <button class="btn secondary" id="publishBtn">Publicar en el sitio</button>
          <span id="editorMsg" style="color: var(--muted); font-size: 13px;"></span>
        </div>
      </div>
      <div class="editor-card">
        <label style="font-size:13px; color: var(--muted);">Fotos del collage — arrastra para reordenar</label>
        <div class="image-grid" id="imgGrid"></div>
        <label class="upload-drop" for="fileInput">+ Agregar foto<input type="file" id="fileInput" accept="image/*"></label>
      </div>
    </div>`;

  document.getElementById('back').addEventListener('click', renderProjectsList);
  renderImageGrid(slug, images);

  document.getElementById('saveBtn').addEventListener('click', () => saveProject(slug));
  document.getElementById('publishBtn').addEventListener('click', () => publishProject(slug));
  document.getElementById('fileInput').addEventListener('change', (e) => uploadImage(slug, e.target.files[0]));
}

function renderImageGrid(slug, images) {
  const grid = document.getElementById('imgGrid');
  grid.innerHTML = images.map((img) => `
    <div class="image-tile" draggable="true" data-id="${img.id}">
      <img src="${img.url.startsWith('http') ? img.url : '/' + img.url}" loading="lazy">
      <button class="del" data-id="${img.id}" title="Eliminar">×</button>
    </div>`).join('');

  let dragged = null;
  grid.querySelectorAll('.image-tile').forEach((tile) => {
    tile.addEventListener('dragstart', () => { dragged = tile; tile.classList.add('dragging'); });
    tile.addEventListener('dragend', () => tile.classList.remove('dragging'));
    tile.addEventListener('dragover', (e) => e.preventDefault());
    tile.addEventListener('drop', async (e) => {
      e.preventDefault();
      if (!dragged || dragged === tile) return;
      const tiles = Array.from(grid.children);
      const from = tiles.indexOf(dragged);
      const to = tiles.indexOf(tile);
      if (from < to) tile.after(dragged); else tile.before(dragged);
      const order = Array.from(grid.querySelectorAll('.image-tile')).map((t) => Number(t.dataset.id));
      try {
        await api('/projects?slug=' + encodeURIComponent(slug) + '&images=1', { method: 'PUT', body: JSON.stringify({ order }) });
        toast('Orden guardado');
      } catch (err) { toast('No se pudo guardar el orden', 'err'); }
    });
  });

  grid.querySelectorAll('.del').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Eliminar esta foto del collage?')) return;
      try {
        await api('/projects?slug=' + encodeURIComponent(slug) + '&images=1&imageId=' + btn.dataset.id, { method: 'DELETE' });
        renderProjectEditor(slug);
      } catch (err) { toast('No se pudo eliminar', 'err'); }
    });
  });
}

async function uploadImage(slug, file) {
  if (!file) return;
  const msg = document.getElementById('editorMsg');
  msg.textContent = 'Subiendo foto…';
  try {
    const blob = await upload(slug + '/' + Date.now() + '-' + file.name, file, {
      access: 'public',
      handleUploadUrl: '/api/admin/upload',
    });
    await api('/projects?slug=' + encodeURIComponent(slug) + '&images=1', { method: 'POST', body: JSON.stringify({ url: blob.url }) });
    msg.textContent = '';
    renderProjectEditor(slug);
  } catch (e) {
    msg.textContent = '';
    toast('No se pudo subir la foto', 'err');
  }
}

async function saveProject(slug) {
  const body = {
    title: document.getElementById('f-title').value,
    category: document.getElementById('f-category').value,
    capabilities: document.getElementById('f-capabilities').value,
    description: document.getElementById('f-description').value,
    tagline: document.getElementById('f-tagline').value || null,
    work: document.getElementById('f-work').value,
    show_on_index: document.getElementById('f-showindex').checked,
    show_on_portafolio: document.getElementById('f-showport').checked,
  };
  try {
    await api('/projects?slug=' + encodeURIComponent(slug), { method: 'PUT', body: JSON.stringify(body) });
    toast('Cambios guardados. Recuerda publicar para que se vean en el sitio.');
  } catch (e) { toast('No se pudo guardar', 'err'); }
}

async function publishProject(slug) {
  const msg = document.getElementById('editorMsg');
  msg.textContent = 'Publicando…';
  try {
    await api('/projects?slug=' + encodeURIComponent(slug) + '&publish=1', { method: 'POST' });
    msg.textContent = '';
    toast('Publicado en el sitio');
    renderProjectEditor(slug);
  } catch (e) {
    msg.textContent = '';
    toast('No se pudo publicar. Guarda primero los cambios.', 'err');
  }
}

// ---------- Leads / CRM ----------

async function renderLeads() {
  const main = document.getElementById('main');
  main.innerHTML = '<h1>Leads</h1><p>Cargando…</p>';
  try {
    const q = state.leadFilter ? '?status=' + state.leadFilter : '';
    const { leads } = await api('/leads' + q);
    state.leads = leads;
    const statuses = ['', 'new', 'contacted', 'won', 'lost'];
    const labels = { '': 'Todos', new: 'Nuevo', contacted: 'Contactado', won: 'Ganado', lost: 'Perdido' };
    const filters = statuses.map((s) => `<button data-status="${s}" class="${state.leadFilter === s ? 'active' : ''}">${labels[s]}</button>`).join('');
    const rows = leads.map((l) => `
      <tr class="clickable" data-id="${l.id}">
        <td>${new Date(l.created_at).toLocaleDateString('es-CO')}</td>
        <td>${l.name}</td>
        <td>${l.email}</td>
        <td>${l.company || ''}</td>
        <td><span class="badge ${l.status}">${labels[l.status] || l.status}</span></td>
      </tr>`).join('');
    const counts = { new: 0, contacted: 0, won: 0, lost: 0 };
    (state.leadFilter ? leads : leads).forEach((l) => { if (counts[l.status] != null) counts[l.status]++; });
    main.innerHTML = `
      <h1>Leads</h1>
      <p class="subtitle">Cada envío del formulario de contacto llega aquí automáticamente.</p>
      <div class="stat-row">
        <div class="stat-card"><div class="n">${leads.length}</div><div class="l">${state.leadFilter ? labels[state.leadFilter] : 'Total'}</div></div>
        <div class="stat-card accent-magenta"><div class="n">${counts.won}</div><div class="l">Ganados</div></div>
        <div class="stat-card accent-orange"><div class="n">${counts.contacted}</div><div class="l">Contactados</div></div>
      </div>
      <div class="filters">${filters}</div>
      <div class="card-panel">
        <table>
          <thead><tr><th>Fecha</th><th>Nombre</th><th>Correo</th><th>Empresa</th><th>Estado</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="5" class="empty-state">Sin leads todavía.</td></tr>'}</tbody>
        </table>
      </div>
      <div id="leadDetail"></div>`;
    main.querySelectorAll('.filters button').forEach((b) => {
      b.addEventListener('click', () => { state.leadFilter = b.dataset.status; renderLeads(); });
    });
    main.querySelectorAll('tr.clickable').forEach((tr) => {
      tr.addEventListener('click', () => renderLeadDetail(Number(tr.dataset.id)));
    });
  } catch (e) {
    if (e.message !== 'unauthorized') main.innerHTML = '<p class="error-msg">No se pudo cargar los leads.</p>';
  }
}

function renderLeadDetail(id) {
  const lead = state.leads.find((l) => l.id === id);
  if (!lead) return;
  const box = document.getElementById('leadDetail');
  box.innerHTML = `
    <div class="lead-detail">
      <p class="lead-name">${lead.name} <span class="badge ${lead.status}">${lead.status}</span></p>
      <p class="lead-meta">${lead.email} ${lead.company ? '· ' + lead.company : ''} · Necesidad: ${lead.need || '—'} · Presupuesto: ${lead.budget || '—'} · Página: ${lead.page || '—'}</p>
      <p style="white-space: pre-wrap;">${lead.details || ''}</p>
      <div class="field">
        <label>Estado</label>
        <select id="statusSel">
          ${['new', 'contacted', 'won', 'lost'].map((s) => `<option value="${s}" ${s === lead.status ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="field notes-box">
        <label>Notas de seguimiento</label>
        <textarea id="notesInput">${esc(lead.notes || '')}</textarea>
      </div>
      <button class="btn" id="saveLead">Guardar</button>
    </div>`;
  document.getElementById('saveLead').addEventListener('click', async () => {
    try {
      await api('/leads?id=' + id, {
        method: 'PATCH',
        body: JSON.stringify({ status: document.getElementById('statusSel').value, notes: document.getElementById('notesInput').value }),
      });
      toast('Lead actualizado');
      renderLeads();
    } catch (e) { toast('No se pudo guardar', 'err'); }
  });
}

// ---------- Textos ----------

const PAGE_LABELS = { 'index.html': 'Página de inicio (index.html)', 'servicios.html': 'Página de servicios (servicios.html)', 'portafolio.html': 'Página de portafolio (portafolio.html)' };

async function renderContent() {
  const main = document.getElementById('main');
  main.innerHTML = '<h1>Textos</h1><p>Cargando…</p>';
  try {
    const { grouped } = await api('/content');
    state.contentFields = grouped;
    const pages = Object.keys(grouped);
    const sections = pages.map((page) => `
      <div class="card-panel" style="margin-bottom:20px;">
        <h2 style="margin-top:0;">${PAGE_LABELS[page] || page}</h2>
        ${grouped[page].map((f) => `
          <div class="field" data-key="${f.key}">
            <label>${f.label}${f.rawHtml ? ' <span style="color:var(--muted);font-weight:normal;">(admite etiquetas HTML como &lt;em&gt;/&lt;br&gt;, edítalo con cuidado)</span>' : ''}</label>
            <textarea rows="2" class="ck-input">${esc(f.value == null ? '' : f.value)}</textarea>
            <div style="margin-top:6px;">
              <button class="btn secondary ck-save" data-key="${f.key}">Guardar borrador</button>
              <span class="ck-msg" style="color: var(--muted); font-size: 12px; margin-left: 8px;"></span>
            </div>
          </div>`).join('')}
      </div>`).join('');

    main.innerHTML = `
      <h1>Textos</h1>
      <p class="subtitle">Edita los textos clave del sitio (hero, títulos de sección, botones). Guarda cada campo como borrador y luego publica todos los cambios pendientes al sitio en vivo.</p>
      <div class="editor-actions" style="margin-bottom:20px;">
        <button class="btn" id="publishContentBtn">Publicar cambios</button>
        <span id="contentPublishMsg" style="color: var(--muted); font-size: 13px; margin-left: 8px;"></span>
      </div>
      ${sections || '<p class="empty-state">Sin campos configurados.</p>'}`;

    main.querySelectorAll('.ck-save').forEach((btn) => {
      btn.addEventListener('click', () => saveContentField(btn.dataset.key));
    });
    document.getElementById('publishContentBtn').addEventListener('click', publishContentChanges);
  } catch (e) {
    if (e.message !== 'unauthorized') main.innerHTML = '<p class="error-msg">No se pudo cargar los textos.</p>';
  }
}

async function saveContentField(key) {
  const row = document.querySelector('.field[data-key="' + CSS.escape(key) + '"]');
  const textarea = row.querySelector('.ck-input');
  const msg = row.querySelector('.ck-msg');
  msg.textContent = 'Guardando…';
  try {
    await api('/content?key=' + encodeURIComponent(key), { method: 'PUT', body: JSON.stringify({ value: textarea.value }) });
    msg.textContent = 'Guardado ✓';
    setTimeout(() => { msg.textContent = ''; }, 2500);
  } catch (e) {
    msg.textContent = '';
    toast('No se pudo guardar', 'err');
  }
}

async function publishContentChanges() {
  const msg = document.getElementById('contentPublishMsg');
  msg.textContent = 'Publicando…';
  try {
    const { committed } = await api('/content?publish=1', { method: 'POST' });
    msg.textContent = '';
    toast(committed && committed.length ? 'Publicado: ' + committed.join(', ') : 'No había cambios pendientes por publicar');
  } catch (e) {
    msg.textContent = '';
    toast('No se pudo publicar. Revisa que los borradores estén guardados.', 'err');
  }
}

// ---------- Encabezados ----------

const HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5'];

async function renderHeadings() {
  const main = document.getElementById('main');
  main.innerHTML = '<h1>Encabezados</h1><p>Cargando…</p>';
  try {
    const { grouped } = await api('/content');
    const pages = Object.keys(grouped);

    const sections = pages.map((page) => {
      const headings = grouped[page].filter((f) => HEADING_TAGS.includes(f.tag));
      if (!headings.length) return '';
      const rows = headings.map((f) => `
        <div class="field" data-key="${f.key}">
          <label><span class="heading-tag">${f.tag.toUpperCase()}</span> ${f.label}</label>
          <textarea rows="2" class="ck-input">${esc(f.value == null ? '' : f.value)}</textarea>
          <div style="margin-top:6px;">
            <button class="btn secondary ck-save" data-key="${f.key}">Guardar borrador</button>
            <span class="ck-msg" style="color: var(--muted); font-size: 12px; margin-left: 8px;"></span>
          </div>
        </div>`).join('');
      return `
        <div class="card-panel" style="margin-bottom:20px;">
          <h2 style="margin-top:0;">${PAGE_LABELS[page] || page}</h2>
          ${rows}
        </div>`;
    }).join('');

    main.innerHTML = `
      <h1>Encabezados</h1>
      <p class="subtitle">Todos los h1–h5 del sitio, en el orden en que aparecen en cada página. Útil para revisar la jerarquía y las palabras clave de un vistazo. Edita el texto y guárdalo como borrador; luego publica desde aquí o desde "Textos" (comparten los mismos cambios pendientes).</p>
      <div class="editor-actions" style="margin-bottom:20px;">
        <button class="btn" id="publishHeadingsBtn">Publicar cambios</button>
        <span id="headingsPublishMsg" style="color: var(--muted); font-size: 13px; margin-left: 8px;"></span>
      </div>
      ${sections || '<p class="empty-state">Sin encabezados configurados.</p>'}
      <p class="subtitle" style="margin-top:8px;">Los títulos de proyectos individuales (portafolio) y los encabezados de ventanas emergentes se gestionan desde "Proyectos", porque se generan dinámicamente por proyecto.</p>`;

    main.querySelectorAll('.ck-save').forEach((btn) => {
      btn.addEventListener('click', () => saveContentField(btn.dataset.key));
    });
    document.getElementById('publishHeadingsBtn').addEventListener('click', async () => {
      const msg = document.getElementById('headingsPublishMsg');
      msg.textContent = 'Publicando…';
      try {
        const { committed } = await api('/content?publish=1', { method: 'POST' });
        msg.textContent = '';
        toast(committed && committed.length ? 'Publicado: ' + committed.join(', ') : 'No había cambios pendientes por publicar');
      } catch (e) {
        msg.textContent = '';
        toast('No se pudo publicar. Revisa que los borradores estén guardados.', 'err');
      }
    });
  } catch (e) {
    if (e.message !== 'unauthorized') main.innerHTML = '<p class="error-msg">No se pudo cargar los encabezados.</p>';
  }
}

// ---------- Colores ----------

async function renderTokens() {
  const main = document.getElementById('main');
  main.innerHTML = '<h1>Colores</h1><p>Cargando…</p>';
  try {
    const { tokens } = await api('/tokens');
    state.tokens = tokens;
    const rows = tokens.map((t) => `
      <div class="field" data-key="${t.key}" style="display:flex; align-items:center; gap:14px;">
        <input type="color" class="tk-input" value="${t.value || '#000000'}" style="width:52px; height:40px; padding:2px; border-radius:8px; border:1px solid var(--border); background:transparent;">
        <div style="flex:1;">
          <label style="margin-bottom:2px;">${t.label}</label>
          <div style="color:var(--muted); font-size:12px;">--${t.key} · <span class="tk-hex">${t.value || ''}</span></div>
        </div>
        <button class="btn secondary tk-save" data-key="${t.key}">Guardar borrador</button>
        <span class="tk-msg" style="color: var(--muted); font-size: 12px;"></span>
      </div>`).join('');

    main.innerHTML = `
      <h1>Colores</h1>
      <p class="subtitle">Edita los 4 colores de marca del sitio. Guarda cada uno como borrador y luego publica para actualizar el sitio en vivo.</p>
      <div class="editor-actions" style="margin-bottom:20px;">
        <button class="btn" id="publishTokensBtn">Publicar cambios</button>
        <span id="tokensPublishMsg" style="color: var(--muted); font-size: 13px; margin-left: 8px;"></span>
      </div>
      <div class="card-panel" style="display:flex; flex-direction:column; gap:16px;">
        ${rows || '<p class="empty-state">Sin colores configurados.</p>'}
      </div>`;

    main.querySelectorAll('.tk-input').forEach((input) => {
      input.addEventListener('input', () => {
        input.closest('.field').querySelector('.tk-hex').textContent = input.value;
      });
    });
    main.querySelectorAll('.tk-save').forEach((btn) => {
      btn.addEventListener('click', () => saveToken(btn.dataset.key));
    });
    document.getElementById('publishTokensBtn').addEventListener('click', publishTokenChanges);
  } catch (e) {
    if (e.message !== 'unauthorized') main.innerHTML = '<p class="error-msg">No se pudo cargar los colores.</p>';
  }
}

async function saveToken(key) {
  const row = document.querySelector('.field[data-key="' + CSS.escape(key) + '"]');
  const input = row.querySelector('.tk-input');
  const msg = row.querySelector('.tk-msg');
  msg.textContent = 'Guardando…';
  try {
    await api('/tokens?key=' + encodeURIComponent(key), { method: 'PUT', body: JSON.stringify({ value: input.value }) });
    msg.textContent = 'Guardado ✓';
    setTimeout(() => { msg.textContent = ''; }, 2500);
  } catch (e) {
    msg.textContent = '';
    toast('No se pudo guardar', 'err');
  }
}

async function publishTokenChanges() {
  const msg = document.getElementById('tokensPublishMsg');
  msg.textContent = 'Publicando…';
  try {
    const { committed } = await api('/tokens?publish=1', { method: 'POST' });
    msg.textContent = '';
    toast(committed && committed.length ? 'Publicado en styles.css' : 'No había cambios pendientes por publicar');
  } catch (e) {
    msg.textContent = '';
    toast('No se pudo publicar. Revisa que los borradores estén guardados.', 'err');
  }
}

// ---------- SEO ----------

const SEO_PAGE_LABELS = { 'index.html': 'Inicio (index.html)', 'servicios.html': 'Servicios (servicios.html)', 'portafolio.html': 'Portafolio (portafolio.html)' };
const SLUG_PAGE_LABELS = { servicios: 'Servicios (servicios.html)', portafolio: 'Portafolio (portafolio.html)' };

async function renderSeo() {
  const main = document.getElementById('main');
  main.innerHTML = '<h1>SEO</h1><p>Cargando…</p>';
  try {
    const data = await api('/seo');
    state.seo = data;
    const pages = Object.keys(data.grouped);

    const seoSections = pages.map((page) => `
      <div class="card-panel" style="margin-bottom:20px;">
        <h2 style="margin-top:0;">${SEO_PAGE_LABELS[page] || page}</h2>
        ${data.grouped[page].map((f) => `
          <div class="field" data-key="${f.key}">
            <label>${f.label}${f.kind === 'meta_description' ? ' <span style="color:var(--muted);font-weight:normal;">(sin HTML, solo texto)</span>' : ''}</label>
            <textarea rows="2" class="seo-input">${esc(f.value == null ? '' : f.value)}</textarea>
            <div style="margin-top:6px;">
              <button class="btn secondary seo-save" data-key="${f.key}">Guardar borrador</button>
              <span class="seo-msg" style="color: var(--muted); font-size: 12px; margin-left: 8px;"></span>
            </div>
          </div>`).join('')}
      </div>`).join('');

    const favicon = data.favicon || {};
    const faviconSection = `
      <div class="card-panel" style="margin-bottom:20px;">
        <h2 style="margin-top:0;">Favicon</h2>
        <p class="subtitle">El ícono que aparece en la pestaña del navegador. Se aplica a todas las páginas del sitio (inicio, servicios, portafolio y la página de error 404).</p>
        <div style="display:flex; align-items:center; gap:16px; margin-bottom:12px;">
          ${favicon.value ? `<img src="${escAttr(favicon.value)}" alt="Favicon actual" style="width:40px; height:40px; border-radius:8px; border:1px solid var(--border); object-fit:cover;">` : '<span style="color:var(--muted); font-size:13px;">Usando el ícono por defecto (✦)</span>'}
          <input type="file" id="faviconFile" accept="image/png,image/jpeg,image/webp,image/gif" style="display:none;">
          <button class="btn secondary" id="faviconPick">Elegir imagen…</button>
          <span id="faviconMsg" style="color: var(--muted); font-size: 12px;"></span>
        </div>
        <button class="btn" id="publishFaviconBtn">Publicar favicon</button>
        <span id="faviconPublishMsg" style="color: var(--muted); font-size: 13px; margin-left: 8px;"></span>
      </div>`;

    const slugRows = (data.slugs || []).map((s) => {
      const isDefault = s.current_slug === s.filename.replace(/\.html$/, '');
      return `
        <div class="field" data-page="${s.page}" style="margin-bottom:16px;">
          <label>${SLUG_PAGE_LABELS[s.page] || s.page}</label>
          <div style="color:var(--muted); font-size:12px; margin-bottom:6px;">
            URL actual: ${isDefault ? `<code>/${s.filename}</code> (sin URL personalizada todavía)` : `<code>/${esc(s.current_slug)}</code>`}
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <input type="text" class="slug-input" value="${escAttr(s.current_slug)}" placeholder="ej: nuestros-servicios" style="flex:1;">
            <button class="btn secondary slug-publish" data-page="${s.page}">Publicar</button>
          </div>
          <p style="color:var(--warn, #b45309); font-size:12px; margin-top:6px;">
            ⚠️ Cambiar esto actualiza todos los enlaces del sitio y crea una redirección automática desde la URL anterior.
          </p>
          <span class="slug-msg" style="color: var(--muted); font-size: 12px;"></span>
        </div>`;
    }).join('');

    const slugSection = `
      <div class="card-panel" style="margin-bottom:20px;">
        <h2 style="margin-top:0;">URLs de las páginas</h2>
        <p class="subtitle">Cambia la dirección web (URL) pública de Servicios o Portafolio. La página de Inicio siempre vive en la raíz del sitio y no se puede renombrar.</p>
        ${slugRows || '<p class="empty-state">Sin páginas configuradas.</p>'}
      </div>`;

    main.innerHTML = `
      <h1>SEO</h1>
      <p class="subtitle">Edita el título y la descripción que aparecen en Google para cada página. Guarda cada campo como borrador y luego publica.</p>
      <div class="editor-actions" style="margin-bottom:20px;">
        <button class="btn" id="publishSeoBtn">Publicar cambios de título/descripción</button>
        <span id="seoPublishMsg" style="color: var(--muted); font-size: 13px; margin-left: 8px;"></span>
      </div>
      ${seoSections || '<p class="empty-state">Sin campos configurados.</p>'}
      ${faviconSection}
      ${slugSection}
    `;

    main.querySelectorAll('.seo-save').forEach((btn) => {
      btn.addEventListener('click', () => saveSeoField(btn.dataset.key));
    });
    document.getElementById('publishSeoBtn').addEventListener('click', publishSeoChanges);

    let pendingFaviconFile = null;
    document.getElementById('faviconPick').addEventListener('click', () => document.getElementById('faviconFile').click());
    document.getElementById('faviconFile').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      pendingFaviconFile = file;
      await uploadFavicon(file);
    });
    document.getElementById('publishFaviconBtn').addEventListener('click', publishFaviconChanges);

    main.querySelectorAll('.slug-publish').forEach((btn) => {
      btn.addEventListener('click', () => publishSlugChange(btn.dataset.page));
    });
  } catch (e) {
    if (e.message !== 'unauthorized') main.innerHTML = '<p class="error-msg">No se pudo cargar SEO.</p>';
  }
}

async function saveSeoField(key) {
  const row = document.querySelector('.field[data-key="' + CSS.escape(key) + '"]');
  const textarea = row.querySelector('.seo-input');
  const msg = row.querySelector('.seo-msg');
  msg.textContent = 'Guardando…';
  try {
    await api('/seo?key=' + encodeURIComponent(key), { method: 'PUT', body: JSON.stringify({ value: textarea.value }) });
    msg.textContent = 'Guardado ✓';
    setTimeout(() => { msg.textContent = ''; }, 2500);
  } catch (e) {
    msg.textContent = '';
    toast('No se pudo guardar', 'err');
  }
}

async function publishSeoChanges() {
  const msg = document.getElementById('seoPublishMsg');
  msg.textContent = 'Publicando…';
  try {
    const { committed } = await api('/seo?publish=1', { method: 'POST' });
    msg.textContent = '';
    toast(committed && committed.length ? 'Publicado: ' + committed.join(', ') : 'No había cambios pendientes por publicar');
  } catch (e) {
    msg.textContent = '';
    toast('No se pudo publicar. Revisa que los borradores estén guardados.', 'err');
  }
}

async function uploadFavicon(file) {
  const msg = document.getElementById('faviconMsg');
  msg.textContent = 'Subiendo…';
  try {
    const blob = await upload('favicon/' + Date.now() + '-' + file.name, file, {
      access: 'public',
      handleUploadUrl: '/api/admin/upload',
    });
    await api('/seo?favicon=1', { method: 'PUT', body: JSON.stringify({ value: blob.url }) });
    msg.textContent = '';
    renderSeo();
  } catch (e) {
    msg.textContent = '';
    toast('No se pudo subir la imagen', 'err');
  }
}

async function publishFaviconChanges() {
  const msg = document.getElementById('faviconPublishMsg');
  msg.textContent = 'Publicando…';
  try {
    const { committed } = await api('/seo?favicon=1&publish=1', { method: 'POST' });
    msg.textContent = '';
    toast(committed && committed.length ? 'Favicon publicado en: ' + committed.join(', ') : 'No hay favicon subido para publicar');
  } catch (e) {
    msg.textContent = '';
    toast('No se pudo publicar el favicon', 'err');
  }
}

async function publishSlugChange(page) {
  const row = document.querySelector('.field[data-page="' + CSS.escape(page) + '"]');
  const input = row.querySelector('.slug-input');
  const msg = row.querySelector('.slug-msg');
  const slug = input.value.trim().toLowerCase();
  if (!slug) { toast('Escribe una URL válida', 'err'); return; }
  if (!confirm('¿Publicar la nueva URL "/' + slug + '" para esta página? Esto actualiza vercel.json, los enlaces internos y crea una redirección desde la URL anterior si ya tenía una personalizada.')) return;
  msg.textContent = 'Publicando…';
  try {
    const { committed, slug: newSlug } = await api('/seo?slugs=1&page=' + encodeURIComponent(page), { method: 'PUT', body: JSON.stringify({ slug }) });
    msg.textContent = '';
    toast('URL publicada: /' + newSlug + ' (' + (committed || []).length + ' archivo(s) actualizados)');
    renderSeo();
  } catch (e) {
    msg.textContent = '';
    toast(e.message === 'invalid_slug' ? 'URL inválida (usa solo minúsculas, números y guiones)' : 'No se pudo publicar la URL', 'err');
  }
}

// ---------- Utils ----------

function esc(s) { return String(s || '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }
function escAttr(s) { return esc(s).replace(/"/g, '&quot;'); }

// ---------- Boot ----------

(async function boot() {
  try {
    await api('/projects');
    renderShell();
  } catch (e) {
    renderLogin();
  }
})();
