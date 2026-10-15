/* Playground: identificador de H1–H6 como recibo de caja registradora.
   Envía la URL a /api/headings y "imprime" la estructura. Cómo arreglar cada alerta se desbloquea con el correo. */
(function () {
  var form = document.getElementById('hdForm');
  if (!form) return;
  var input = document.getElementById('hdUrl'), btn = document.getElementById('hdGo'), status = document.getElementById('hdStatus'), out = document.getElementById('hdOut');
  var chromeBox = document.getElementById('hdChrome'), tools = document.getElementById('hdTools');
  var machine = document.getElementById('rmMachine'), view = 'receipt';
  // Cada error dice qué pasó (msg) y qué hacer (todo).
  var WAIT = 'Refresca esta página e intenta de nuevo en 3 minutos.';
  var ERR = {
    invalid_url: { msg: 'Mmm, el link no se ve bien.', todo: 'Escríbelo así: tusitio.com' },
    unreachable: { msg: 'No logramos entrar a la página solicitada.', todo: 'Revisa que el link esté bien escrito y que tu sitio esté en línea; luego intenta de nuevo.' },
    timeout: { msg: 'La página solicitada se está demorando mucho en responder.', todo: WAIT },
    too_large: { msg: 'La página solicitada es muy pesada para revisarla aquí.', todo: 'Prueba con otra página de tu sitio.' },
    not_html: { msg: 'El link lleva a un archivo (imagen, PDF…), no a una página.', todo: 'Prueba con la dirección de tu sitio.' },
    too_many_redirects: { msg: 'La página da muchas vueltas (redirecciones) antes de llegar.', todo: 'Prueba con la dirección final de tu página.' },
    http_401: { msg: 'La página solicitada pide usuario y clave para entrar, así que no podemos verla.', todo: 'Prueba con una página pública de tu sitio.' },
    http_403: { msg: 'La página solicitada no nos dejó entrar.', todo: 'Prueba con otra página del mismo sitio.' },
    http_404: { msg: 'No encontramos la página solicitada.', todo: 'Revisa que el link esté bien escrito.' },
    http_410: { msg: 'La página solicitada ya no existe.', todo: 'Prueba con otra página de tu sitio.' },
    http_429: { msg: 'La página solicitada nos pidió ir más despacio.', todo: WAIT },
    rate_limited: { msg: 'Hiciste muchas revisiones seguidas.', todo: WAIT },
    default: { msg: 'Ups, algo falló de nuestro lado.', todo: WAIT }
  };
  var JS_ERR = { msg: 'La página solicitada parece armarse con JavaScript y casi no vimos contenido. Google y las IA podrían verla casi vacía.', todo: 'Pide a quien desarrolla tu sitio que el contenido llegue ya escrito en el HTML (renderizado en servidor).' };
  function errInfo(code) {
    if (ERR[code]) return ERR[code];
    var h = /^http_(\d{3})$/.exec(code || '');
    if (h) return +h[1] >= 500 ? { msg: 'La página solicitada está teniendo un problema de su lado.', todo: WAIT } : { msg: 'La página solicitada respondió con un error y no pudimos leerla.', todo: 'Revisa el link e intenta con otra página de tu sitio.' };
    return ERR.default;
  }
  function issueCount(r) { return r.withheld ? r.issueCount : r.issues.length; }

  // Código que se muestra en el recibito de error (sirve para que la persona nos lo comparta). Los errores HTTP usan su número.
  var CODES = { invalid_url: 'E100', unreachable: 'E101', timeout: 'E102', too_large: 'E103', not_html: 'E104', too_many_redirects: 'E105', js: 'E200', rate_limited: 'E429', default: 'E999' };
  function errCode(code) {
    var h = /^http_(\d{3})$/.exec(code || '');
    return h ? h[1] : (CODES[code] || CODES.default);
  }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function pad(n) { return ('0' + n).slice(-2); }
    function host(u) { try { return new URL(u).hostname; } catch (e) { return u; } }

  var state = null, wrap = null, gateEl = null, gateHost = null;
  function mode() { var c = form.querySelector('input[name="hdMode"]:checked'); return c ? c.value : 'all'; }
  var MAX_LEVEL = 6; // se muestran todos los niveles, H1 a H6

  // Bloques que se muestran según el modo, el nivel y si se incluyen menú y pie.
  function visibleBlocks() {
    var r = state.r, m = mode(), max = MAX_LEVEL, showH = m !== 'p', showP = m !== 'h', withChrome = chromeBox.checked;
    var all = r.blocks || r.headings.map(function (h) { return { type: 'h', level: h.level, text: h.text }; });
    return all.filter(function (b) { return (b.chrome && !withChrome) ? false : b.type === 'p' ? showP : showH && b.level <= max; });
  }

  // Triángulo de advertencia con "!" (SVG propio: el glifo ⚠ cambia de forma según el dispositivo).
  function warnIcon() {
    var NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 48 44'); svg.setAttribute('width', '48'); svg.setAttribute('height', '44'); svg.setAttribute('aria-hidden', 'true');
    var tri = document.createElementNS(NS, 'path'); tri.setAttribute('d', 'M24 3 L46 41 H2 Z'); tri.setAttribute('fill', '#f59e0b'); tri.setAttribute('stroke', '#b45309'); tri.setAttribute('stroke-width', '3'); tri.setAttribute('stroke-linejoin', 'round');
    var bar = document.createElementNS(NS, 'rect'); bar.setAttribute('x', '22'); bar.setAttribute('y', '16'); bar.setAttribute('width', '4'); bar.setAttribute('height', '13'); bar.setAttribute('rx', '2'); bar.setAttribute('fill', '#1a1320');
    var dot = document.createElementNS(NS, 'circle'); dot.setAttribute('cx', '24'); dot.setAttribute('cy', '34'); dot.setAttribute('r', '2.6'); dot.setAttribute('fill', '#1a1320');
    svg.appendChild(tri); svg.appendChild(bar); svg.appendChild(dot);
    return svg;
  }

  // Bloque de error del recibo: la palabra ERROR, el triángulo de advertencia y la explicación.
  function errorBlock(add, info, code) {
    add('rc-c rc-errt', 'ERROR');
    var wb = el('div', 'rc-warnbox'); wb.appendChild(warnIcon()); wb.appendChild(el('p', null, info.msg));
    var td = el('p', 'rc-todo'); td.appendChild(el('b', null, '¿Qué hacer? ')); td.appendChild(document.createTextNode(info.todo)); wb.appendChild(td);
    add('', null, wb);
    add('rc-c rc-code', 'CÓDIGO DEL ERROR: ' + code);
  }

  // Recibito de error: cuando no se pudo leer el sitio (link inválido, 404, tiempo agotado…).
  function renderError(typed, info, code) {
    state = null; tools.hidden = true;
    out.textContent = '';
    wrap = el('div', 'rc-wrap is-printing'); out.appendChild(wrap);
    var now = new Date(), when = pad(now.getDate()) + '/' + pad(now.getMonth() + 1) + '/' + now.getFullYear() + '  ' + pad(now.getHours()) + ':' + pad(now.getMinutes());
    var paper = el('div', 'rc'); paper.setAttribute('role', 'alert'); var n = 0;
    function line(cls, text, extra) { var l = el('div', 'rc-line ' + (cls || '')); l.style.setProperty('--d', Math.min(n++ * 45, 1400) + 'ms'); if (text != null) l.textContent = text; if (extra) l.appendChild(extra); paper.appendChild(l); return l; }
    line('rc-c rc-big', 'WOW SUPERMERCADO'); line('rc-c', 'DE PÁGINAS WEB'); line('rc-rule');
    if (typed) line('', 'CLIENTE: ' + host(/^https?:\/\//i.test(typed) ? typed : 'https://' + typed));
    line('', 'FECHA: ' + when);
    line('rc-rule');
    errorBlock(line, info, code);
    line('rc-rule');
    line('rc-bar', null); farewell(line, true);
    wrap.appendChild(paper);
    out.hidden = false;
    wrap.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  // Cierre del recibo (debajo del código de barras). add(clase, texto, elementoExtra) agrega una línea.
  function farewell(add, isError) {
    add('rc-c rc-big', '*** GRACIAS POR SU VISITA ***');
    if (isError) return; // en los recibos de error no se despide con "vuelve pronto"
    add('rc-c rc-bye', '¡VUELVE PRONTO!');
    add('rc-c', 'TU SITIO SE LO MERECE');
  }

  // Dibuja el recibo según lo que se quiera revisar (títulos hasta cierto nivel, textos o todo).
  // Mientras no se deje el correo, el final (alertas y puntaje) se dibuja con texto de relleno borroso: no hay datos reales en el HTML.
  function buildReceipt() {
    var r = state.r, url = state.url, m = mode(), max = MAX_LEVEL, showH = m !== 'p', showP = m !== 'h';
    var now = new Date(), when = pad(now.getDate()) + '/' + pad(now.getMonth() + 1) + '/' + now.getFullYear() + '  ' + pad(now.getHours()) + ':' + pad(now.getMinutes());
    var blocks = visibleBlocks(), locked = true; // el detalle de las alertas nunca se muestra en la página: llega por correo
    var hiddenChrome = !chromeBox.checked && showH ? (r.blocks || []).filter(function (b) { return b.chrome && b.type === 'h' && b.level <= max; }).length : 0;
    var paper = el('div', 'rc'); paper.setAttribute('role', 'region'); paper.setAttribute('aria-label', 'Recibo con la estructura de la página');
    var n = 0, target = paper;
    function line(cls, text, extra) { var l = el('div', 'rc-line ' + (cls || '')); l.style.setProperty('--d', Math.min(n++ * 45, 1400) + 'ms'); if (text != null) l.textContent = text; if (extra) l.appendChild(extra); target.appendChild(l); return l; }
    function rule() { line('rc-rule'); }
    function sum(label, value) { var s = document.createDocumentFragment(); s.appendChild(el('span', null, label)); s.appendChild(el('b', null, String(value))); return line('rc-sum', null, s); }
    line('rc-c rc-big', 'WOW SUPERMERCADO');
    line('rc-c', 'DE PÁGINAS WEB');
    rule();
    line('', 'CLIENTE: ' + host(url));
    line('', 'FECHA: ' + when);
    if (r.title) line('', 'TÍTULO: ' + r.title);
    if (r.metaDescription) line('', 'META DESCRIPTION: ' + r.metaDescription);
    line('', 'REVISIÓN: ' + (m === 'h' ? 'títulos H1–H' + max : m === 'p' ? 'textos' : 'todo (H1–H' + max + ' y textos)'));
    if (r.jsRendered) { // sin contenido en el HTML: solo el aviso, sin alertas, puntaje ni formulario
      rule();
      errorBlock(line, JS_ERR, errCode('js'));
      rule();
      line('rc-bar', null); farewell(line, true);
      return paper;
    }
    if (showH) {
      var sc = r.score;
      sum('PUNTAJE', sc == null ? 'n/d' : sc + '/100').classList.add('rc-total');
      if (sc != null) { var full = Math.floor(sc / 10); line('rc-c rc-meter ' + (sc >= 80 ? 'rc-good' : sc >= 55 ? 'rc-mid' : 'rc-bad'), '[' + new Array(full + 1).join('█') + new Array(11 - full).join('░') + ']'); }
    }
    rule();
    line('rc-h', 'TIPO · CONTENIDO');
    if (!blocks.length) line('rc-note', r.jsRendered ? JS_ERR.msg : showH && !showP ? 'No encontramos títulos en ese rango en el HTML.' : 'No encontramos contenido para mostrar en el HTML de esta página.');
    var curLevel = 0; // los textos van más sangrados que el título al que pertenecen
    blocks.forEach(function (b) {
      if (b.type === 'h') curLevel = b.level;
      var isP = b.type === 'p', l = line('rc-item ' + (isP ? 'rc-p' : 'rc-l' + b.level) + (b.chrome ? ' rc-chrome' : ''));
      l.appendChild(el('b', null, isP ? 'P' : 'H' + b.level));
      var t = el('span', null, (b.chrome ? '(menú/pie) ' : '') + (b.text || '(vacío)')); l.style.marginLeft = (isP ? curLevel + 1 : b.level - 1) * 14 + 'px'; l.appendChild(t);
    });
    if (hiddenChrome) line('rc-note', 'Ocultamos ' + hiddenChrome + ' título' + (hiddenChrome > 1 ? 's' : '') + ' del menú y el pie de página.');
    rule();
    var hs = blocks.filter(function (b) { return b.type === 'h'; }), ps = blocks.length - hs.length;
    sum('TOTAL', blocks.length);
    if (showH) [1, 2, 3, 4, 5, 6].forEach(function (lv) { var c = hs.filter(function (b) { return b.level === lv; }).length; if (c) sum('H' + lv, 'x' + c); });
    if (showP) { sum('Textos', 'x' + ps); sum('Palabras', blocks.filter(function (b) { return b.type === 'p'; }).reduce(function (a, b) { return a + b.text.split(/\s+/).length; }, 0)); }
    if (showH || locked) {
      rule();
      var cnt = issueCount(r);
      if (locked) {
        line('rc-h', cnt ? 'ENCONTRAMOS ' + cnt + ' ALERTA' + (cnt > 1 ? 'S' : '') : 'REVISAMOS TU ESTRUCTURA');
        var lw = el('div', 'rc-lockwrap'), blur = el('div', 'rc-blur'), veil = el('div', 'rc-veil');
        blur.setAttribute('aria-hidden', 'true'); lw.appendChild(blur); lw.appendChild(veil); paper.appendChild(lw);
        target = blur;
        for (var k = 0; k < Math.max(3, Math.min(cnt, 6)); k++) line('rc-issue rc-warn', '! Aquí aparece cada alerta con lo que debes arreglar en tu sitio.');
      }
    }
    target = paper; // el código de barras y el cierre van debajo de la tarjeta, fuera de lo borroso
    line('rc-bar', null); farewell(line);
    return paper;
  }

  // Final borroso (alertas con relleno) + código de barras, para el mapa de títulos mientras no se deje el correo.
  function lockedTail(box) {
    var cnt = issueCount(state.r);
    function ln(cls, txt) { return el('div', 'rc-line ' + cls, txt); }
    box.appendChild(ln('rc-rule'));
    box.appendChild(ln('rc-h', cnt ? 'ENCONTRAMOS ' + cnt + ' ALERTA' + (cnt > 1 ? 'S' : '') : 'REVISAMOS TU ESTRUCTURA'));
    var lw = el('div', 'rc-lockwrap'), blur = el('div', 'rc-blur'), veil = el('div', 'rc-veil');
    blur.setAttribute('aria-hidden', 'true'); lw.appendChild(blur); lw.appendChild(veil);
    for (var k = 0; k < Math.max(3, Math.min(cnt, 6)); k++) blur.appendChild(ln('rc-issue rc-warn', '! Aquí aparece cada alerta con lo que debes arreglar en tu sitio.'));
    box.appendChild(lw); box.appendChild(ln('rc-bar')); farewell(function (c, t, x) { var l = ln(c, t); if (x) l.appendChild(x); box.appendChild(l); });
  }

  // Esquema: la misma estructura como árbol, marcando los niveles que faltan.
  function buildOutline() {
    var hs = visibleBlocks().filter(function (b) { return b.type === 'h'; });
    var box = el('div', 'rc ol'); box.setAttribute('role', 'region'); box.setAttribute('aria-label', 'Árbol de títulos');
    if (!hs.length) { box.appendChild(el('p', 'ol-empty', 'No hay títulos para mostrar en este rango.')); lockedTail(box); return box; }
    var prev = 0;
    hs.forEach(function (h) {
      if (prev && h.level - prev > 1) {
        var gap = el('div', 'ol-gap', '⚠ falta H' + (prev + 1) + (h.level - prev > 2 ? '–H' + (h.level - 1) : ''));
        gap.style.marginLeft = prev * 18 + 'px'; box.appendChild(gap);
      }
      var row = el('div', 'ol-row ol-l' + h.level + (h.chrome ? ' ol-chrome' : '')); row.style.marginLeft = (h.level - 1) * 18 + 'px';
      row.appendChild(el('b', null, 'H' + h.level));
      row.appendChild(el('span', null, (h.chrome ? '(menú/pie) ' : '') + (h.text || '(vacío)')));
      box.appendChild(row); prev = h.level;
    });
    lockedTail(box);
    return box;
  }

  function draw() {
    wrap.textContent = '';
    // Los botones de vista (resultado completo / mapa de títulos) solo existen con "Todo".
    var showTools = mode() === 'all' && !state.r.jsRendered;
    if (!showTools) view = 'receipt';
    tools.hidden = !showTools;
    var outline = view === 'outline', node = outline ? buildOutline() : buildReceipt();
    wrap.className = 'rc-wrap is-printing';
    wrap.appendChild(node);
    var veil = node.querySelector('.rc-veil');
    if (gateEl) (veil || gateHost).appendChild(gateEl);
    Array.prototype.forEach.call(tools.querySelectorAll('[data-view]'), function (t) { var on = t.getAttribute('data-view') === view; t.classList.toggle('is-on', on); t.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    return node;
  }

  function toolbar() {
    tools.textContent = ''; tools.setAttribute('role', 'toolbar'); tools.setAttribute('aria-label', 'Opciones del resultado');
    [['receipt', 'Resultado completo'], ['outline', 'Mapa de títulos']].forEach(function (d) {
      var b = el('button', 'hd-tool', d[1]); b.type = 'button'; b.setAttribute('data-view', d[0]); tools.appendChild(b);
    });
  }
  tools.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button[data-view]');
    if (!b || !state) return;
    view = b.getAttribute('data-view'); draw();
  });

  function render(r, url, runKey) {
    state = { r: r, url: url };
    out.textContent = '';
    wrap = el('div', 'rc-wrap is-printing'); out.appendChild(wrap);
    gateHost = el('div', 'rc-gate'); out.appendChild(gateHost);
    gateEl = el('div', 'rc-gate-in');
    var total = r.headings.length;
    if (window.WOWLead && !r.jsRendered) {
      var lead = el('div'); gateEl.appendChild(lead);
      window.WOWLead.mount(lead, {
        fine: false, tool: 'Encabezados: ' + host(url), runKey: function () { return runKey || null; },
        pitch: 'Tu auditoría completa está lista. Escribe tu correo y te la enviamos: cada alerta con cómo arreglarla, paso a paso.',
        data: function () { return { url: url, encabezados: total, h1: r.counts[0], puntaje: r.score }; },
        okText: function (email, d) {
          return d && (d.emailed === 'sent' || d.emailed === 'dry-run')
            ? '¡Listo! Te enviamos tu auditoría completa a ' + email + '. Si no la ves en unos minutos, revisa tu carpeta de spam.'
            : 'Recibimos tu correo. Te enviaremos tu auditoría completa muy pronto.';
        }
      });
    }
    toolbar(); tools.hidden = false;
    draw();
    out.hidden = false;
    wrap.scrollIntoView({ block: 'start', behavior: 'smooth' }); // el recibo empieza arriba de la pantalla
  }
  // Cambiar el modo, el nivel o menú/pie reimprime el mismo resultado, sin volver a consultar el sitio.
  form.addEventListener('change', function (e) {
    if (e.target === input) return;
    if (state) draw();
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var url = input.value.trim();
    if (!url) { status.textContent = ''; renderError('', ERR.invalid_url, errCode('invalid_url')); input.focus(); return; }
    btn.disabled = true; out.hidden = true; tools.hidden = true; status.textContent = 'Revisando tu sitio…'; state = null; machine.classList.add('is-busy');
    if (window.gtag) window.gtag('event', 'playground_headings_run');
    fetch('/api/headings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: url }) })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (d) {
        if (d.success) { status.textContent = ''; render(d.result, d.url, d.runKey); }
        else { status.textContent = ''; renderError(url, errInfo(d.error), errCode(d.error)); }
      })
      .catch(function () { status.textContent = ''; renderError(url, ERR.default, errCode('default')); })
      .then(function () { btn.disabled = false; machine.classList.remove('is-busy'); });
  });
})();
