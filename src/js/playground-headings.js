/* Playground: identificador de H1–H6 como recibo de caja registradora.
   Envía la URL a /api/headings y "imprime" la estructura. Cómo arreglar cada alerta se desbloquea con el correo. */
(function () {
  var form = document.getElementById('hdForm');
  if (!form) return;
  var input = document.getElementById('hdUrl'), btn = document.getElementById('hdGo'), status = document.getElementById('hdStatus'), out = document.getElementById('hdOut');
  var unlocked = false;
  var ERR = {
    invalid_url: 'Ese link no parece válido. Escribe una dirección pública, por ejemplo tusitio.com.',
    unreachable: 'No pudimos abrir ese sitio. Revisa que esté en línea y vuelve a intentar.',
    timeout: 'El sitio tardó demasiado en responder.',
    too_large: 'La página es demasiado pesada para analizarla aquí.',
    not_html: 'Ese link no es una página web (no devuelve HTML).',
    too_many_redirects: 'El link redirige demasiadas veces.',
    default: 'Algo salió mal. Intenta de nuevo en un momento.'
  };
  var FIX = {
    no_h1: 'Agrega un único H1 con la frase principal de la página: qué ofreces y para quién. Es lo primero que lee Google y la persona que llega.',
    multi_h1: 'Deja un solo H1 (el título de la página) y convierte los demás en H2. Si son parte del diseño, cámbialos por texto con estilo, no por encabezados.',
    long_h1: 'Resume el H1 a menos de 70 caracteres: servicio + ciudad o beneficio. Mueve el detalle a un párrafo o a un H2.',
    empty: 'Revisa los encabezados vacíos: suelen ser logos o íconos envueltos en un H. Quita la etiqueta de encabezado o ponles texto real.',
    skip: 'Ordena los niveles sin saltos: H1 → H2 → H3. Si necesitas un tamaño distinto, cámbialo con CSS, no con el nivel del encabezado.',
    first_not_h1: 'El H1 debería ser el primer encabezado de la página. Revisa si el menú o un banner usa un H2 o H3 antes del título.',
    no_meta: 'Escribe una meta description de 140 a 160 caracteres que resuma la página e invite a hacer clic.'
  };
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function pad(n) { return ('0' + n).slice(-2); }
  function trunc(s, n) { return s.length > n ? s.slice(0, n - 1) + '…' : s; }
  function host(u) { try { return new URL(u).hostname; } catch (e) { return u; } }

  function render(r, url) {
    out.textContent = '';
    var now = new Date(), when = pad(now.getDate()) + '/' + pad(now.getMonth() + 1) + '/' + now.getFullYear() + '  ' + pad(now.getHours()) + ':' + pad(now.getMinutes());
    var paper = el('div', 'rc'); paper.setAttribute('role', 'region'); paper.setAttribute('aria-label', 'Recibo con la estructura de encabezados');
    var n = 0;
    function line(cls, text, extra) { var l = el('div', 'rc-line ' + (cls || '')); l.style.setProperty('--d', (n++ * 70) + 'ms'); if (text != null) l.textContent = text; if (extra) l.appendChild(extra); paper.appendChild(l); return l; }
    function rule() { line('rc-rule', '- - - - - - - - - - - - - - - - - - - - -'); }
    line('rc-c rc-big', 'WOW SUPERMERCADO');
    line('rc-c', 'DE PÁGINAS WEB');
    rule();
    line('', 'CLIENTE: ' + trunc(host(url), 28));
    line('', 'FECHA:   ' + when);
    if (r.title) line('', 'TÍTULO:  ' + trunc(r.title, 28));
    rule();
    line('rc-h', 'NIVEL  ARTÍCULO');
    if (!r.headings.length) line('rc-note', 'No encontramos encabezados en el HTML. Si tu sitio se arma con JavaScript, los buscadores podrían ver lo mismo.');
    r.headings.forEach(function (h) {
      var l = line('rc-item rc-l' + h.level); l.appendChild(el('b', null, 'H' + h.level)); var t = el('span', null, h.text || '(vacío)'); t.style.paddingLeft = (h.level - 1) * 10 + 'px'; l.appendChild(t);
    });
    rule();
    var total = r.headings.length;
    line('rc-sum', null, (function () { var s = document.createDocumentFragment(); var a = el('span', null, 'ARTÍCULOS'), b = el('b', null, String(total)); s.appendChild(a); s.appendChild(b); return s; })());
    [1, 2, 3, 4, 5, 6].forEach(function (lv, i) { if (r.counts[i]) line('rc-sum', null, (function () { var s = document.createDocumentFragment(); s.appendChild(el('span', null, '  H' + lv + ' x' + r.counts[i])); s.appendChild(el('b', null, '')); return s; })()); });
    rule();
    line('rc-h', r.issues.length ? 'CARGOS (ALERTAS)' : 'DESCUENTOS');
    if (!r.issues.length) line('rc-ok', '✓ ESTRUCTURA BÁSICA EN ORDEN');
    r.issues.forEach(function (i) { line('rc-issue rc-' + i.type, (i.type === 'error' ? '✗ ' : '! ') + i.msg); });
    rule();
    line('rc-total', null, (function () { var s = document.createDocumentFragment(); s.appendChild(el('span', null, 'A MEJORAR')); s.appendChild(el('b', null, String(r.issues.length))); return s; })());
    line('rc-bar', null); line('rc-c', '*** GRACIAS POR SU VISITA ***');
    var wrap = el('div', 'rc-wrap'); wrap.appendChild(paper); out.appendChild(wrap);

    var gate = el('div', 'rc-gate'), lockBox = el('div', 'rc-lock');
    function full() {
      unlocked = true; lockBox.textContent = '';
      lockBox.appendChild(el('p', 'sd-steps-t', 'CÓMO ARREGLAR CADA ALERTA'));
      if (!r.issues.length) lockBox.appendChild(el('p', null, 'No hay alertas básicas. El siguiente paso es revisar que cada H2 responda una duda real de tu cliente y que los H3 desarrollen su H2.'));
      r.issues.forEach(function (i) { var d = el('div', 'rc-fix'); d.appendChild(el('b', null, i.msg)); d.appendChild(el('p', null, FIX[i.code] || 'Revisa este punto con tu equipo de contenido.')); lockBox.appendChild(d); });
      var o = el('div', 'rc-fix'); o.appendChild(el('b', null, 'Esquema recomendado'));
      var pre = el('pre', null, 'H1  Servicio + para quién (+ ciudad)\n  H2  Qué incluye\n    H3  Cada servicio o entregable\n  H2  Cómo trabajamos\n    H3  Paso 1, paso 2, paso 3\n  H2  Casos y resultados\n  H2  Preguntas frecuentes\n    H3  Cada pregunta real de tu cliente');
      o.appendChild(pre); lockBox.appendChild(o);
    }
    if (unlocked) { full(); gate.appendChild(lockBox); }
    else if (window.WOWLead) {
      lockBox.innerHTML = '<p class="qz-lock-note">Incluye: cómo arreglar cada alerta, paso a paso, y un esquema recomendado de H1, H2 y H3 para tu página.</p>';
      var lead = el('div'); gate.appendChild(lead); gate.appendChild(lockBox);
      window.WOWLead.mount(lead, { tool: 'Encabezados: ' + host(url), pitch: 'Te mostramos al instante cómo arreglar cada alerta y un esquema recomendado para tu página.', data: function () { return { url: url, encabezados: total, h1: r.counts[0], alertas: r.issues.map(function (i) { return i.code; }) }; }, onUnlock: full });
    }
    out.appendChild(gate);
    out.hidden = false;
    paper.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var url = input.value.trim();
    if (!url) { status.textContent = ERR.invalid_url; input.focus(); return; }
    btn.disabled = true; out.hidden = true; status.textContent = 'Imprimiendo tu recibo…';
    if (window.gtag) window.gtag('event', 'playground_headings_run');
    fetch('/api/headings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: url }) })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (d) {
        if (d.success) { status.textContent = ''; render(d.result, d.url); }
        else status.textContent = ERR[d.error] || ERR.default;
      })
      .catch(function () { status.textContent = ERR.default; })
      .then(function () { btn.disabled = false; });
  });
})();
