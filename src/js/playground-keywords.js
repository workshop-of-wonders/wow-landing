/* Playground: keywords como candados y llaves. Cada keyword es un candado; las llaves (una por intención) abren su grupo.
   Plantillas en el navegador: no hay datos de volumen. La lista completa y el plan de contenido se desbloquean con el correo. */
(function () {
  var form = document.getElementById('kwForm');
  if (!form) return;
  var inS = document.getElementById('kwS'), inC = document.getElementById('kwC'), status = document.getElementById('kwStatus'), out = document.getElementById('kwOut');
  var YEAR = new Date().getFullYear();
  var unlocked = false;
  /* nombre, color, a qué página va, plantilla de título sugerida, generador */
  var GROUPS = [
    ['Compra', '#d6e85a', 'Tu página de servicio o producto', 'Servicio de {s}: precios, qué incluye y cómo contratar', function (s) { return ['comprar ' + s, s + ' precio', 'cotizar ' + s, 'contratar ' + s, s + ' barato', 'mejor ' + s, 'servicio de ' + s, 'empresa de ' + s, s + ' a domicilio', s + ' online', s + ' profesional', s + ' personalizado']; }],
    ['Preguntas', '#bfdbfe', 'Artículos de blog y preguntas frecuentes', 'Qué es {s}, cómo funciona y cuánto cuesta (guía completa)', function (s) { return ['qué es ' + s, 'cómo funciona ' + s, 'cuánto cuesta ' + s, 'cómo elegir ' + s, 'para qué sirve ' + s, s + ' paso a paso', 'errores comunes en ' + s, 'guía de ' + s, 'cuánto tarda ' + s, 'qué incluye ' + s]; }],
    ['Comparativas', '#fbcfe8', 'Páginas de comparación y casos de éxito', 'Mejor {s} {year}: cómo comparar opciones y no equivocarte', function (s) { return ['mejor ' + s + ' ' + YEAR, s + ' opiniones', s + ' reseñas', 'alternativas a ' + s, s + ' vs la competencia', s + ' recomendado', 'ventajas de ' + s, 'vale la pena ' + s]; }],
    ['Locales', '#fed7aa', 'Tu ficha de Google y una página por ciudad', '{s} en {c}: servicio local con atención cercana', function (s, c) { return c ? [s + ' ' + c, s + ' en ' + c, 'mejor ' + s + ' en ' + c, 'empresa de ' + s + ' en ' + c, s + ' ' + c + ' precios', 'cotizar ' + s + ' en ' + c, s + ' cerca de ' + c, 'quién hace ' + s + ' en ' + c] : [s + ' cerca de mí', 'mejor ' + s + ' cerca de mí', s + ' cerca']; }],
    ['Segmentos', '#ddd6fe', 'Páginas para cada tipo de cliente', '{s} para pequeñas empresas: opciones y precios', function (s) { return [s + ' para pequeñas empresas', s + ' para emprendedores', s + ' para empresas', s + ' para principiantes', s + ' urgente', s + ' garantizado', s + ' con financiación']; }]
  ];
  var LOCK = '<svg viewBox="0 0 48 56" aria-hidden="true"><g class="kl-shackle"><path d="M14 26V16a10 10 0 0 1 20 0v10" fill="none" stroke="#1a1320" stroke-width="5" stroke-linecap="round"/></g><rect x="6" y="24" width="36" height="28" rx="7" class="kl-body" stroke="#1a1320" stroke-width="3"/><circle cx="24" cy="36" r="3.6" fill="#1a1320"/><path d="M24 38v6" stroke="#1a1320" stroke-width="3" stroke-linecap="round"/></svg>';
  var KEY = '<svg viewBox="0 0 48 24" aria-hidden="true"><circle cx="12" cy="12" r="8" class="kl-kh" stroke="#1a1320" stroke-width="3"/><circle cx="12" cy="12" r="2.6" fill="#1a1320"/><path d="M20 12h24M36 12v7M42 12v5" stroke="#1a1320" stroke-width="3.4" stroke-linecap="round"/></svg>';
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function html(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.innerHTML = x; return e; }
  function clean(v) { return v.trim().replace(/\s+/g, ' ').toLowerCase(); }
  function csvCell(v) { return '"' + v.replace(/"/g, '""') + '"'; }
  function copy(text, btn) {
    var done = function () { var o = btn.textContent; btn.textContent = '¡Copiado!'; setTimeout(function () { btn.textContent = o; }, 1400); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () {});
  }
  function difficulty(k) { var w = k.split(' ').length; return w <= 2 ? ['Alta', 'Muy competida: es una palabra corta y general.'] : w <= 4 ? ['Media', 'Competencia media: combina intención y producto.'] : ['Baja', 'Más fácil de ganar: es específica y de cola larga.']; }

  function render(s, c) {
    out.textContent = '';
    var seen = {}, groups = [], all = [];
    GROUPS.forEach(function (g) {
      var list = g[4](s, c).map(clean).filter(function (k) { if (seen[k]) return false; seen[k] = 1; return true; });
      if (list.length) { groups.push({ g: g, list: list }); list.forEach(function (k) { all.push([g[0], k]); }); }
    });
    var openCount = 0;
    var bar = el('div', 'kl-bar'), counter = el('p', 'kl-count'); counter.setAttribute('aria-live', 'polite');
    function upd() { counter.textContent = openCount + ' de ' + all.length + ' candados abiertos'; }
    var keys = el('div', 'kl-keys'); keys.appendChild(el('span', 'kl-keys-t', 'Tu llavero: una llave abre todo su grupo'));
    bar.appendChild(keys); bar.appendChild(counter); out.appendChild(bar);

    groups.forEach(function (gr) {
      var g = gr.g, box = el('section', 'kw-group'), head = el('div', 'kw-head');
      head.appendChild(el('h3', null, g[0] + ' · ' + gr.list.length)); head.appendChild(el('p', null, 'Esta intención va a: ' + g[2] + '.'));
      box.appendChild(head);
      var grid = el('div', 'kl-grid'), locks = [];
      gr.list.forEach(function (k) {
        var b = html('button', 'kl-lock', '<span class="kl-art">' + LOCK + '</span><b></b><span class="kl-info"></span>'); b.type = 'button'; b.style.setProperty('--kc', g[1]);
        b.querySelector('b').textContent = k; b.setAttribute('aria-label', k + ' — candado cerrado, toca para abrir');
        b.querySelector('.kl-body').setAttribute('fill', g[1]);
        var d = difficulty(k); b.querySelector('.kl-info').textContent = 'Dificultad ' + d[0].toLowerCase() + '. ' + d[1];
        b._open = function () { if (b.classList.contains('is-open')) return false; b.classList.add('is-open'); b.setAttribute('aria-label', k + ' — abierto. Dificultad ' + d[0].toLowerCase()); openCount++; upd(); return true; };
        b.addEventListener('click', function () { if (b.classList.contains('is-open')) { copy(k, b.querySelector('b')); return; } b._open(); if (window.gtag) window.gtag('event', 'playground_lock_open', { kw: k }); });
        locks.push(b); grid.appendChild(b);
      });
      box.appendChild(grid); out.appendChild(box);
      var key = html('button', 'kl-key', KEY + '<span>' + g[0] + '</span>'); key.type = 'button'; key.style.setProperty('--kc', g[1]); key.querySelector('.kl-kh').setAttribute('fill', g[1]);
      key.setAttribute('aria-label', 'Abrir todos los candados de ' + g[0]);
      key.addEventListener('click', function () {
        key.classList.remove('is-turn'); void key.offsetWidth; key.classList.add('is-turn');
        locks.forEach(function (l, i) { setTimeout(function () { l._open(); }, i * 70); });
        box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        if (window.gtag) window.gtag('event', 'playground_key_use', { group: g[0] });
      });
      keys.appendChild(key);
    });
    upd();
    var allKey = el('button', 'kl-all', 'Abrir todo'); allKey.type = 'button';
    allKey.addEventListener('click', function () { keys.querySelectorAll('.kl-key').forEach(function (k, i) { setTimeout(function () { k.click(); }, i * 250); }); });
    bar.appendChild(allKey);

    /* correo: lista completa + plan de contenido */
    var gate = el('div', 'kw-gate'), lockBox = el('div', 'kw-lock');
    function full() {
      unlocked = true; lockBox.textContent = '';
      lockBox.appendChild(el('p', 'sd-steps-t', 'TU PLAN DE CONTENIDO'));
      groups.forEach(function (gr) {
        var g = gr.g, row = el('div', 'kw-plan'); row.style.setProperty('--kc', g[1]);
        row.appendChild(el('b', null, g[0] + ' → ' + g[2]));
        row.appendChild(el('p', null, 'Título sugerido: ' + g[3].replace(/\{s\}/g, s).replace(/\{year\}/g, YEAR).replace(/\{c\}/g, c || 'tu ciudad')));
        row.appendChild(el('p', 'kw-plan-k', gr.list.join(' · ')));
        lockBox.appendChild(row);
      });
      var dl = el('button', 'btn btn-primary btn-sm', 'Descargar lista completa en CSV (' + all.length + ')'); dl.type = 'button';
      dl.addEventListener('click', function () {
        var csv = '﻿intencion,keyword,dificultad_estimada\n' + all.map(function (r) { return csvCell(r[0]) + ',' + csvCell(r[1]) + ',' + csvCell(difficulty(r[1])[0]); }).join('\n');
        var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        a.download = 'keywords-' + s.replace(/[^a-z0-9]+/g, '-').slice(0, 40) + '.csv'; document.body.appendChild(a); a.click(); a.remove();
        if (window.gtag) window.gtag('event', 'playground_keywords_csv');
      });
      lockBox.appendChild(dl);
    }
    if (unlocked) { full(); gate.appendChild(lockBox); }
    else if (window.WOWLead) {
      lockBox.innerHTML = '<p class="qz-lock-note">Incluye: el plan de qué página crear para cada grupo, títulos sugeridos, la dificultad de cada palabra y el CSV completo.</p>';
      var lead = el('div'); gate.appendChild(lead); gate.appendChild(lockBox);
      window.WOWLead.mount(lead, { tool: 'Keywords: ' + s, pitch: 'Te mostramos al instante tu plan de contenido y la lista completa para descargar.', data: function () { return { producto: s, ciudad: c, keywords: all.length }; }, onUnlock: full });
    }
    out.appendChild(gate);
    out.hidden = false;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var s = clean(inS.value), c = inC.value.trim().replace(/\s+/g, ' ');
    if (s.length < 3) { status.textContent = 'Escribe lo que vendes, por ejemplo: diseño de interiores.'; inS.focus(); return; }
    status.textContent = '';
    render(s, c);
    if (window.gtag) window.gtag('event', 'playground_keywords_run', { has_city: c ? 1 : 0 });
  });
})();
