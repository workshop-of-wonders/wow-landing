const app = document.getElementById('app');
const state = { leads: [], leadFilter: '' };

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
          <button data-view="leads" class="active"><span class="dot"></span>Leads / CRM</button>
        </nav>
        <button class="logout" id="logoutBtn">Cerrar sesión</button>
      </div>
      <div class="main" id="main"></div>
    </div>`;
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    renderLogin();
  });
  renderLeads();
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
    leads.forEach((l) => { if (counts[l.status] != null) counts[l.status]++; });
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
      <p class="lead-meta">${lead.email} ${lead.company ? '· ' + lead.company : ''} · Necesidad: ${lead.need || '—'} · País: ${lead.country || '—'} · Presupuesto: ${lead.budget || '—'} · Página: ${lead.page || '—'}</p>
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

// ---------- Utils ----------

function esc(s) { return String(s || '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }

// ---------- Boot ----------

(async function boot() {
  try {
    await api('/leads');
    renderShell();
  } catch (e) {
    renderLogin();
  }
})();
