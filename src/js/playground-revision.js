/* Playground: Revisión express de una página.
   Envía la URL a /api/revisar y muestra el puntaje y qué pasa / qué no pasa en cada punto. Cómo arreglar cada punto llega por correo. */
(function () {
  var form = document.getElementById('rvForm');
  if (!form) return;
  var input = document.getElementById('rvUrl'), btn = document.getElementById('rvGo'), status = document.getElementById('rvStatus'), out = document.getElementById('rvOut');
  var machine = document.getElementById('rmMachine');
  var WAIT = 'Refresca esta página e intenta de nuevo en 3 minutos.';
  var ERR = {
    invalid_url: { msg: 'Mmm, el link no se ve bien.', todo: 'Escríbelo así: tusitio.com' },
    unreachable: { msg: 'No logramos entrar a la página.', todo: 'Revisa que el link esté bien escrito y que tu sitio esté en línea; luego intenta de nuevo.' },
    timeout: { msg: 'La página se está demorando mucho en responder.', todo: WAIT },
    too_large: { msg: 'La página es muy pesada para revisarla aquí.', todo: 'Prueba con otra página de tu sitio.' },
    not_html: { msg: 'El link lleva a un archivo (imagen, PDF…), no a una página.', todo: 'Prueba con la dirección de tu sitio.' },
    too_many_redirects: { msg: 'La página da muchas vueltas (redirecciones) antes de llegar.', todo: 'Prueba con la dirección final de tu página.' },
    http_401: { msg: 'La página pide usuario y clave para entrar, así que no podemos verla.', todo: 'Prueba con una página pública de tu sitio.' },
    http_403: { msg: 'La página no nos dejó entrar.', todo: 'Prueba con otra página del mismo sitio.' },
    http_404: { msg: 'No encontramos la página.', todo: 'Revisa que el link esté bien escrito.' },
    http_429: { msg: 'La página nos pidió ir más despacio.', todo: WAIT },
    rate_limited: { msg: 'Hiciste muchas revisiones seguidas.', todo: WAIT },
    default: { msg: 'Ups, algo falló de nuestro lado.', todo: WAIT }
  };
  function errInfo(code) {
    if (ERR[code]) return ERR[code];
    var h = /^http_(\d{3})$/.exec(code || '');
    if (h) return +h[1] >= 500 ? { msg: 'La página está teniendo un problema de su lado.', todo: WAIT } : { msg: 'La página respondió con un error y no pudimos leerla.', todo: 'Revisa el link e intenta con otra página de tu sitio.' };
    return ERR.default;
  }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function host(u) { try { return new URL(u).hostname; } catch (e) { return u; } }
  function wonder(file, w, h) { var i = el('img', 'wd wd--end'); i.src = '/design-system/wonders/Wonder_' + file + '.png'; i.alt = ''; i.width = w; i.height = h; i.loading = 'lazy'; return i; }

  function renderError(info) {
    out.textContent = '';
    var box = el('div', 'rv-card rv-card--err'); box.setAttribute('role', 'alert');
    box.appendChild(el('p', 'rv-err-t', info.msg));
    var td = el('p', 'rv-err-d'); td.appendChild(el('b', null, '¿Qué hacer? ')); td.appendChild(document.createTextNode(info.todo)); box.appendChild(td);
    out.appendChild(box); out.appendChild(wonder('Morado_Boca_Abajo', 472, 463));
    out.hidden = false; box.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  function tier(s) {
    return s >= 85 ? ['¡Vas muy bien!', 'Lo básico está casi todo en orden.'] : s >= 60 ? ['Vas por buen camino', 'Hay cosas importantes por arreglar.'] : ['Hay trabajo por hacer', 'Hay fallas básicas que te están costando visitas.'];
  }

  function render(r, url, runKey) {
    out.textContent = '';
    var bad = r.checks.filter(function (c) { return !c.ok; }), good = r.checks.filter(function (c) { return c.ok; });
    var card = el('div', 'rv-card'); card.setAttribute('role', 'region'); card.setAttribute('aria-label', 'Resultado de la revisión');
    var t = tier(r.score);
    var top = el('div', 'rv-top');
    var ring = el('div', 'rv-ring'); ring.style.setProperty('--p', r.score); ring.appendChild(el('b', null, String(r.score))); ring.appendChild(el('small', null, 'de 100'));
    var tx = el('div', 'rv-top-t'); tx.appendChild(el('p', 'rv-site', host(url)));
    tx.appendChild(el('h3', null, t[0])); tx.appendChild(el('p', null, t[1] + ' ' + (bad.length ? bad.length + (bad.length === 1 ? ' punto' : ' puntos') + ' por arreglar.' : '')));
    top.appendChild(ring); top.appendChild(tx); card.appendChild(top);

    function list(title, items, cls) {
      if (!items.length) return;
      card.appendChild(el('p', 'rv-h', title));
      var ul = el('ul', 'rv-list ' + cls);
      items.forEach(function (c) {
        var li = el('li', c.ok ? 'is-ok' : 'is-bad');
        li.appendChild(el('span', 'rv-mark', c.ok ? '✓' : '!'));
        var d = el('div'); d.appendChild(el('b', null, c.label)); d.appendChild(el('span', null, c.msg)); li.appendChild(d);
        ul.appendChild(li);
      });
      card.appendChild(ul);
    }
    list('Qué arreglar', bad, 'rv-bad');
    list('Lo que ya está bien', good, 'rv-good');

    if (bad.length && window.WOWLead) {
      var lead = el('div', 'rv-lead'); card.appendChild(lead);
      window.WOWLead.mount(lead, {
        fine: false, tool: 'Revisión express: ' + host(url), runKey: function () { return runKey || null; },
        pitch: 'Te enviamos cómo arreglar cada punto, paso a paso y en orden de prioridad. Escribe tu correo.',
        data: function () { return { url: url, puntaje: r.score, porArreglar: bad.map(function (c) { return c.code; }) }; },
        okText: function (email, d) {
          return d && (d.emailed === 'sent' || d.emailed === 'dry-run')
            ? '¡Listo! Te enviamos cómo arreglar cada punto a ' + email + '. Si no lo ves en unos minutos, revisa tu carpeta de spam.'
            : 'Recibimos tu correo. Te enviaremos cómo arreglar cada punto muy pronto.';
        }
      });
    }
    card.appendChild(el('p', 'rv-note', 'Esta revisión mira lo básico de tu página. Una auditoría completa incluye velocidad real, contenido, enlaces y competencia.'));
    out.appendChild(card);
    out.appendChild(r.score >= 85 ? wonder('Morado_Celebrando', 534, 525) : wonder('Morado_Con_Idea', 534, 595));
    out.hidden = false;
    card.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var url = input.value.trim();
    if (!url) { renderError(ERR.invalid_url); input.focus(); return; }
    btn.disabled = true; out.hidden = true; status.textContent = 'Revisando tu página…'; machine.classList.add('is-busy');
    if (window.gtag) window.gtag('event', 'playground_revision_run');
    fetch('/api/revisar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: url }) })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (d) {
        status.textContent = '';
        if (d.success) render(d.result, d.url, d.runKey); else renderError(errInfo(d.error));
      })
      .catch(function () { status.textContent = ''; renderError(ERR.default); })
      .then(function () { btn.disabled = false; machine.classList.remove('is-busy'); });
  });
})();
