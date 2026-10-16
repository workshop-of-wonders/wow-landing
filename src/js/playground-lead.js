/* Captura de correo compartida por todas las herramientas del Playground.
   WOWLead.mount(contenedor, { tool, data, pitch, onUnlock }) pinta el bloque "Recibir diagnóstico completo gratis".
   Al enviar guarda el lead por /api/contact (kind: 'playground') y llama onUnlock() para mostrar el contenido completo. */
(function () {
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var KEY = 'wow_pg_email';
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function remembered() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
  function remember(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function mount(box, o) {
    var wrap = el('form', 'ld'); wrap.noValidate = true;
    wrap.appendChild(el('p', 'ld-eyebrow', 'DIAGNÓSTICO COMPLETO · GRATIS'));
    wrap.appendChild(el('p', 'ld-pitch', o.pitch || 'Desbloquea tu plan completo, ordenado por prioridad y listo para ponerlo en marcha.'));
    var row = el('div', 'ld-row');
    var lab = el('label', 'sr-only', 'Tu correo'); var id = 'ld' + Math.random().toString(36).slice(2, 8); lab.setAttribute('for', id);
    var inp = el('input'); inp.type = 'email'; inp.id = id; inp.placeholder = 'tucorreo@empresa.com'; inp.autocomplete = 'email'; inp.inputMode = 'email'; inp.required = true; inp.value = remembered();
    var hp = el('input', 'ld-hp'); hp.type = 'text'; hp.tabIndex = -1; hp.autocomplete = 'off'; hp.setAttribute('aria-hidden', 'true'); hp.name = 'website';
    var btn = el('button', 'btn btn-primary ld-btn'); btn.type = 'submit'; btn.innerHTML = 'Recibir diagnóstico completo gratis <i class="wic wic-r" aria-hidden="true"></i>';
    row.appendChild(lab); row.appendChild(inp); row.appendChild(hp); row.appendChild(btn);
    wrap.appendChild(row);
    var msg = el('p', 'ld-msg'); msg.setAttribute('role', 'status'); msg.setAttribute('aria-live', 'polite');
    wrap.appendChild(msg);
    if (o.fine !== false) wrap.appendChild(el('p', 'ld-fine', 'Usaremos tu correo solo para enviarte este diagnóstico y contactarte sobre él. Sin spam.')); // fine: false lo oculta
    box.appendChild(wrap);

    wrap.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = inp.value.trim();
      if (!EMAIL_RE.test(email)) { msg.textContent = 'Escribe un correo válido para recibir tu diagnóstico.'; msg.className = 'ld-msg is-err'; inp.focus(); return; }
      btn.disabled = true; msg.className = 'ld-msg'; msg.textContent = 'Preparando tu diagnóstico…';
      var data = typeof o.data === 'function' ? o.data() : (o.data || {});
      var details = 'Origen: Playground · ' + (o.tool || '') + '\n' + JSON.stringify(data);
      fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'playground', email: email, name: '', need: 'Playground: ' + (o.tool || ''), details: details, runKey: typeof o.runKey === 'function' ? o.runKey() : null, page: location.pathname + location.hash, lang: 'es', website: hp.value }) })
        .then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (d) {
          if (!d.success) throw new Error(d.error || 'error');
          remember(email);
          if (window.gtag) window.gtag('event', 'playground_lead', { tool: o.tool });
          var ok = el('div', 'ld ld--ok'); var wdi = el('img', 'wd'); wdi.src = '/design-system/wonders/Wonder_Morado_Celebrando.png'; wdi.alt = ''; wdi.width = 534; wdi.height = 525; ok.appendChild(wdi); ok.appendChild(el('p', 'ld-eyebrow', '¡LISTO!'));
          ok.appendChild(el('p', 'ld-pitch', o.okText ? (typeof o.okText === 'function' ? o.okText(email, d) : o.okText) : 'Aquí está tu diagnóstico completo. Si quieres que lo revisemos contigo, escríbenos.'));
          wrap.replaceWith(ok);
          if (o.onUnlock) o.onUnlock(d);
        })
        .catch(function () { btn.disabled = false; msg.className = 'ld-msg is-err'; msg.textContent = 'No pudimos guardarlo. Revisa tu conexión e inténtalo de nuevo.'; });
    });
  }
  window.WOWLead = { mount: mount };
})();
