import { upload } from 'https://esm.sh/@vercel/blob@2.8.0/client';

const app = document.getElementById('app');
const state = { view: 'projects', projects: [], leads: [], leadFilter: '' };

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
  else renderLeads();
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
  const { project, images } = await api('/projects/' + encodeURIComponent(slug));

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
        await api('/projects/' + encodeURIComponent(slug) + '/images', { method: 'PUT', body: JSON.stringify({ order }) });
        toast('Orden guardado');
      } catch (err) { toast('No se pudo guardar el orden', 'err'); }
    });
  });

  grid.querySelectorAll('.del').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Eliminar esta foto del collage?')) return;
      try {
        await api('/projects/' + encodeURIComponent(slug) + '/images/' + btn.dataset.id, { method: 'DELETE' });
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
    await api('/projects/' + encodeURIComponent(slug) + '/images', { method: 'POST', body: JSON.stringify({ url: blob.url }) });
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
    await api('/projects/' + encodeURIComponent(slug), { method: 'PUT', body: JSON.stringify(body) });
    toast('Cambios guardados. Recuerda publicar para que se vean en el sitio.');
  } catch (e) { toast('No se pudo guardar', 'err'); }
}

async function publishProject(slug) {
  const msg = document.getElementById('editorMsg');
  msg.textContent = 'Publicando…';
  try {
    await api('/projects/' + encodeURIComponent(slug) + '/publish', { method: 'POST' });
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
      await api('/leads/' + id, {
        method: 'PATCH',
        body: JSON.stringify({ status: document.getElementById('statusSel').value, notes: document.getElementById('notesInput').value }),
      });
      toast('Lead actualizado');
      renderLeads();
    } catch (e) { toast('No se pudo guardar', 'err'); }
  });
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
