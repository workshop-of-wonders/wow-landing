const app = document.getElementById('app');
const state = { leads: [], leadFilter: '', sims: [], reload: null };

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
      <div class="login-mark"><i class="wsp" aria-hidden="true"></i></div>
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

async function renderShell() {
  app.innerHTML = `
    <div class="shell">
      <div class="sidebar">
        <div class="brand"><div class="mark"><i class="wsp" aria-hidden="true"></i></div><span>WOW Admin</span></div>
        <nav id="nav">
          <button data-view="leads" class="active"><span class="dot"></span>Leads / CRM</button>
          <div class="nav-label">Simuladores</div>
          <div id="simNav"></div>
        </nav>
        <button class="logout" id="logoutBtn">Cerrar sesión</button>
      </div>
      <div class="main" id="main"></div>
    </div>`;
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    renderLogin();
  });
  document.querySelector('#nav > button[data-view="leads"]').addEventListener('click', () => { setActive('leads'); renderLeads(); });
  try {
    const { sims } = await api('/playground?view=sims');
    state.sims = sims;
    document.getElementById('simNav').innerHTML = sims.map((s) =>
      `<button data-sim="${esc(s.slug)}"><span class="dot"></span><span class="nav-name">${esc(s.name)}</span><span class="nav-count">${s.leads || ''}</span></button>`).join('');
    document.querySelectorAll('#simNav button').forEach((b) => {
      b.addEventListener('click', () => { setActive(b.dataset.sim); renderSim(b.dataset.sim, 'leads'); });
    });
  } catch (e) { /* los simuladores son opcionales: el CRM sigue funcionando */ }
  renderLeads();
}

function setActive(key) {
  document.querySelectorAll('#nav button').forEach((b) => b.classList.toggle('active', (b.dataset.view || b.dataset.sim) === key));
}

// ---------- Leads / CRM ----------

async function renderLeads() {
  state.reload = renderLeads;
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
        <td>${esc(l.name)}</td>
        <td>${esc(l.email)}</td>
        <td>${esc(l.company)}</td>
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
          <tbody>${rows || '<tr><td colspan="5" class="empty-state"><img src="/design-system/wonders/Wonder_Azul_Analizando_Datos.png" alt="" width="84">Sin leads todavía.</td></tr>'}</tbody>
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
      <p class="lead-name">${esc(lead.name)} <span class="badge ${lead.status}">${lead.status}</span></p>
      <p class="lead-meta">${esc(lead.email)} ${lead.company ? '· ' + esc(lead.company) : ''} · Necesidad: ${esc(lead.need) || '—'} · País: ${esc(lead.country) || '—'} · Presupuesto: ${esc(lead.budget) || '—'} · Página: ${esc(lead.page) || '—'}</p>
      <p style="white-space: pre-wrap;">${esc(lead.details)}</p>
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
      if (state.reload) state.reload();
    } catch (e) { toast('No se pudo guardar', 'err'); }
  });
}

// ---------- Simuladores (una vista por simulador: leads · usos · plantilla) ----------

const STATUS_LABELS = { new: 'Nuevo', contacted: 'Contactado', won: 'Ganado', lost: 'Perdido' };

function fmtDate(d) { return d ? new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '—'; }

async function renderSim(slug, tab) {
  const main = document.getElementById('main');
  const sim = state.sims.find((x) => x.slug === slug);
  if (!sim) return;
  state.reload = () => renderSim(slug, tab);
  const tabs = [['leads', 'Leads', sim.leads], ['runs', 'Usos', sim.runs], ['template', 'Plantilla de correo', null]];
  main.innerHTML = `
    <h1>${esc(sim.name)}</h1>
    <p class="subtitle">${slug === 'otros' ? 'Simuladores incrustados en las páginas de servicio.' : 'playground/' + esc(slug) + '.html'}</p>
    <div class="filters">${tabs.map(([k, l, n]) => `<button data-tab="${k}" class="${k === tab ? 'active' : ''}">${l}${n ? ' (' + n + ')' : ''}</button>`).join('')}</div>
    <div id="simBody"><p>Cargando…</p></div>`;
  main.querySelectorAll('.filters button').forEach((b) => b.addEventListener('click', () => renderSim(slug, b.dataset.tab)));
  const body = document.getElementById('simBody');
  try {
    if (tab === 'leads') {
      const { leads } = await api('/playground?view=leads&sim=' + encodeURIComponent(slug));
      state.leads = leads;
      const rows = leads.map((l) => `
        <tr class="clickable" data-id="${l.id}">
          <td>${fmtDate(l.created_at)}</td><td>${esc(l.email)}</td><td>${esc(l.country) || '—'}</td>
          <td><span class="badge ${esc(l.status)}">${STATUS_LABELS[l.status] || esc(l.status)}</span></td>
        </tr>`).join('');
      body.innerHTML = `
        <div class="card-panel"><table>
          <thead><tr><th>Fecha</th><th>Correo</th><th>País</th><th>Estado</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="4" class="empty-state"><img src="/design-system/wonders/Wonder_Azul_Analizando_Datos.png" alt="" width="84">Sin leads de este simulador todavía.</td></tr>'}</tbody>
        </table></div><div id="leadDetail"></div>`;
      body.querySelectorAll('tr.clickable').forEach((tr) => tr.addEventListener('click', () => renderLeadDetail(Number(tr.dataset.id))));
    } else if (tab === 'runs') {
      if (!sim.tracksRuns) {
        body.innerHTML = '<div class="card-panel"><p class="empty-state"><img src="/design-system/wonders/Wonder_Morado_Sentado.png" alt="" width="84">Este simulador todavía no registra usos: corre en el navegador de la persona y solo llega aquí cuando deja su correo (pestaña Leads).</p></div>';
        return;
      }
      const { runs } = await api('/playground?view=runs&sim=' + encodeURIComponent(slug));
      const rows = runs.map((r, i) => {
        const res = r.result || {};
        const issues = (res.issues || []).map((x) => `<li><b>${esc(x.msg)}</b> <span class="muted">(${esc(x.code)})</span></li>`).join('');
        const passed = (res.passed || []).map((x) => `<li>${esc(x)}</li>`).join('');
        return `
        <tr class="clickable" data-run="${i}">
          <td>${fmtDate(r.created_at)}</td>
          <td class="url-cell">${esc(r.url)}</td>
          <td>${r.score == null ? 'n/d' : r.score}</td>
          <td>${(res.issues || []).length}</td>
          <td>${esc(r.country) || '—'}</td>
          <td>${r.emailed_to ? esc(r.emailed_to) : '<span class="muted">sin correo</span>'}</td>
        </tr>
        <tr class="run-detail" id="run-${i}" hidden><td colspan="6">
          <p class="lead-meta">Link usado: <a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.url)}</a>${res.title ? ' · Title: ' + esc(res.title) : ''}${r.emailed_at ? ' · Correo enviado ' + fmtDate(r.emailed_at) : ''}</p>
          ${issues ? '<p class="detail-h">Alertas</p><ul>' + issues + '</ul>' : '<p class="muted">Sin alertas.</p>'}
          ${passed ? '<p class="detail-h">Lo que estaba bien</p><ul>' + passed + '</ul>' : ''}
        </td></tr>`;
      }).join('');
      body.innerHTML = `
        <div class="card-panel"><table>
          <thead><tr><th>Fecha</th><th>Link usado</th><th>Puntaje</th><th>Alertas</th><th>País</th><th>Correo al que se envió</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="6" class="empty-state"><img src="/design-system/wonders/Wonder_Azul_Analizando_Datos.png" alt="" width="84">Sin usos registrados todavía.</td></tr>'}</tbody>
        </table></div>`;
      body.querySelectorAll('tr.clickable').forEach((tr) => tr.addEventListener('click', () => {
        const d = document.getElementById('run-' + tr.dataset.run); d.hidden = !d.hidden;
      }));
    } else {
      const { template } = await api('/playground?view=template&sim=' + encodeURIComponent(slug));
      if (!template) {
        body.innerHTML = '<div class="card-panel"><p class="empty-state"><img src="/design-system/wonders/Wonder_Morado_Sentado.png" alt="" width="84">Este simulador todavía no envía correo: la persona ve su resultado en pantalla y su lead queda en la pestaña Leads.</p></div>';
        return;
      }
      body.innerHTML = `
        <p class="subtitle">Así le llega el correo a quien deja su email (se envía con Resend). Vista con datos de ejemplo.</p>
        <div class="lead-detail"><p class="lead-meta">Asunto</p><p class="lead-name">${esc(template.subject)}</p></div>
        <div class="mail-preview"><iframe id="mailFrame" sandbox title="Vista previa del correo"></iframe></div>
        <details class="mail-text"><summary>Versión en texto plano</summary><pre>${esc(template.text)}</pre></details>`;
      document.getElementById('mailFrame').srcdoc = template.html;
    }
  } catch (e) {
    if (e.message !== 'unauthorized') body.innerHTML = '<p class="error-msg">No se pudo cargar esta pestaña.</p>';
  }
}

// ---------- Utils ----------

function esc(s) { return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

// ---------- Boot ----------

(async function boot() {
  try {
    await api('/leads');
    renderShell();
  } catch (e) {
    renderLogin();
  }
})();
