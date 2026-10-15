/* Playground: ideas de keywords por intención. Plantillas en el navegador; no hay datos de volumen. */
(function () {
  var form = document.getElementById('kwForm');
  if (!form) return;
  var inS = document.getElementById('kwS'), inC = document.getElementById('kwC'), status = document.getElementById('kwStatus'), out = document.getElementById('kwOut');
  var YEAR = new Date().getFullYear();
  var GROUPS = [
    ['Compra', 'Quien busca esto quiere contratar o comprar. Van a tu página de servicio o producto.', function (s) { return ['comprar ' + s, s + ' precio', 'cotizar ' + s, 'contratar ' + s, s + ' barato', 'mejor ' + s, 'servicio de ' + s, 'empresa de ' + s, s + ' a domicilio', s + ' online', s + ' profesional', s + ' personalizado']; }],
    ['Preguntas', 'Quien busca esto está investigando. Van a artículos de blog y a tus preguntas frecuentes.', function (s) { return ['qué es ' + s, 'cómo funciona ' + s, 'cuánto cuesta ' + s, 'cómo elegir ' + s, 'para qué sirve ' + s, s + ' paso a paso', 'errores comunes en ' + s, 'guía de ' + s, 'cuánto tarda ' + s, 'qué incluye ' + s]; }],
    ['Comparativas', 'Quien busca esto está decidiendo entre opciones. Van a páginas de comparación y casos de éxito.', function (s) { return ['mejor ' + s + ' ' + YEAR, s + ' opiniones', s + ' reseñas', 'alternativas a ' + s, s + ' vs la competencia', s + ' recomendado', 'ventajas de ' + s, 'vale la pena ' + s]; }],
    ['Locales', 'Quien busca esto está cerca y listo para actuar. Van a tu ficha de Google y a una página por ciudad.', function (s, c) { return c ? [s + ' ' + c, s + ' en ' + c, 'mejor ' + s + ' en ' + c, 'empresa de ' + s + ' en ' + c, s + ' ' + c + ' precios', 'cotizar ' + s + ' en ' + c, s + ' cerca de ' + c, 'quién hace ' + s + ' en ' + c] : [s + ' cerca de mí', 'mejor ' + s + ' cerca de mí', s + ' cerca']; }],
    ['Segmentos', 'Búsquedas más específicas: menos tráfico, pero con más probabilidad de conversión.', function (s) { return [s + ' para pequeñas empresas', s + ' para emprendedores', s + ' para empresas', s + ' para principiantes', s + ' urgente', s + ' garantizado', s + ' con financiación']; }]
  ];
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function clean(v) { return v.trim().replace(/\s+/g, ' ').toLowerCase(); }
  function csvCell(v) { return '"' + v.replace(/"/g, '""') + '"'; }
  function copy(text, btn) {
    var done = function () { var o = btn.textContent; btn.textContent = '¡Copiado!'; setTimeout(function () { btn.textContent = o; }, 1400); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () {});
  }
  function render(s, c) {
    out.textContent = '';
    var seen = {}, all = [];
    GROUPS.forEach(function (g) {
      var list = g[2](s, c).map(clean).filter(function (k) { if (seen[k]) return false; seen[k] = 1; return true; });
      if (!list.length) return;
      var box = el('section', 'kw-group'), head = el('div', 'kw-head');
      head.appendChild(el('h3', null, g[0] + ' · ' + list.length)); head.appendChild(el('p', null, g[1]));
      box.appendChild(head);
      var ul = el('ul', 'kw-list');
      list.forEach(function (k) {
        all.push([g[0], k]);
        var li = el('li'), b = el('button', 'kw-chip', k); b.type = 'button'; b.title = 'Copiar';
        b.addEventListener('click', function () { copy(k, b); });
        li.appendChild(b); ul.appendChild(li);
      });
      box.appendChild(ul);
      var cb = el('button', 'btn btn-sm', 'Copiar este grupo'); cb.type = 'button';
      cb.addEventListener('click', function () { copy(list.join('\n'), cb); });
      box.appendChild(cb);
      out.appendChild(box);
    });
    var act = el('div', 'cl-actions');
    var dl = el('button', 'btn btn-primary btn-sm', 'Descargar CSV (' + all.length + ')'); dl.type = 'button';
    dl.addEventListener('click', function () {
      var csv = '﻿intencion,keyword\n' + all.map(function (r) { return csvCell(r[0]) + ',' + csvCell(r[1]); }).join('\n');
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      a.download = 'keywords-' + s.replace(/[^a-z0-9]+/g, '-').slice(0, 40) + '.csv'; document.body.appendChild(a); a.click(); a.remove();
      if (window.gtag) window.gtag('event', 'playground_keywords_csv');
    });
    act.appendChild(dl); out.appendChild(act);
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
