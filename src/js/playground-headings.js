/* Playground: identificador de H1–H6. Envía la URL a /api/headings y pinta la estructura. */
(function () {
  var form = document.getElementById('hdForm');
  if (!form) return;
  var input = document.getElementById('hdUrl'), btn = document.getElementById('hdGo'), status = document.getElementById('hdStatus'), out = document.getElementById('hdOut');
  var ERR = {
    invalid_url: 'Ese link no parece válido. Escribe una dirección pública, por ejemplo tusitio.com.',
    unreachable: 'No pudimos abrir ese sitio. Revisa que esté en línea y vuelve a intentar.',
    timeout: 'El sitio tardó demasiado en responder.',
    too_large: 'La página es demasiado pesada para analizarla aquí.',
    not_html: 'Ese link no es una página web (no devuelve HTML).',
    too_many_redirects: 'El link redirige demasiadas veces.',
    default: 'Algo salió mal. Intenta de nuevo en un momento.'
  };
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function render(r, url) {
    out.textContent = '';
    var sum = el('div', 'hd-sum');
    [1, 2, 3, 4, 5, 6].forEach(function (l, i) { var c = el('span', 'hd-count hd-l' + l); c.appendChild(el('b', null, 'H' + l)); c.appendChild(el('i', null, String(r.counts[i]))); sum.appendChild(c); });
    out.appendChild(sum);
    var meta = el('div', 'hd-meta');
    meta.appendChild(el('p', null, 'Página: ' + url));
    if (r.title) meta.appendChild(el('p', null, 'Título: ' + r.title));
    out.appendChild(meta);
    if (r.issues.length) {
      var ul = el('ul', 'hd-issues');
      r.issues.forEach(function (i) { ul.appendChild(el('li', 'hd-issue hd-' + i.type, i.msg)); });
      out.appendChild(ul);
    } else {
      out.appendChild(el('p', 'hd-ok', '✓ La estructura básica se ve bien: un H1 y niveles en orden.'));
    }
    var tree = el('ol', 'hd-tree');
    if (!r.headings.length) tree.appendChild(el('li', 'hd-empty', 'No encontramos encabezados en el HTML de esta página. Si tu sitio se arma con JavaScript, los buscadores podrían estar viendo lo mismo.'));
    r.headings.forEach(function (h) {
      var li = el('li', 'hd-row hd-l' + h.level);
      li.style.paddingLeft = (h.level - 1) * 18 + 'px';
      li.appendChild(el('span', 'hd-badge', 'H' + h.level));
      li.appendChild(el('span', 'hd-text', h.text || '(vacío)'));
      tree.appendChild(li);
    });
    out.appendChild(tree);
    out.hidden = false;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var url = input.value.trim();
    if (!url) { status.textContent = ERR.invalid_url; input.focus(); return; }
    btn.disabled = true; out.hidden = true; status.textContent = 'Leyendo el sitio…';
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
