/* Playground: pantonera de colores por sector. Abanico de cartas tipo Pantone sobre manchas de acuarela;
   los sliders de calidez e intensidad repintan todo en vivo. Se calcula en el navegador. */
(function () {
  var form = document.getElementById('clForm');
  if (!form) return;
  /* [id, nombre, matiz principal, saturación, matiz de acento, por qué funciona] */
  var SECTORS = [
    ['salud', 'Salud y clínicas', 195, 55, 20, 'Los azules verdosos comunican calma, limpieza y confianza. El acento cálido humaniza y guía hacia la cita.'],
    ['legal', 'Legal y finanzas', 220, 60, 42, 'El azul profundo transmite seriedad y estabilidad; un dorado discreto aporta prestigio sin verse ostentoso.'],
    ['tech', 'Tecnología y software', 250, 70, 165, 'Los índigos y violetas se leen innovadores. Un acento verde menta marca las acciones clave.'],
    ['comida', 'Restaurantes y comida', 10, 72, 45, 'Los rojos y naranjas abren el apetito y dan energía. El amarillo suma calidez.'],
    ['belleza', 'Belleza, estética y spa', 340, 45, 30, 'Los rosas suaves se sienten cuidados y cercanos; un acento cálido aporta sofisticación.'],
    ['moda', 'Moda y retail', 30, 14, 350, 'Una base casi neutra deja protagonistas a los productos; un solo acento fuerte da carácter.'],
    ['educacion', 'Educación y cursos', 210, 65, 45, 'El azul genera confianza para aprender; el amarillo despierta curiosidad y marca los llamados a la acción.'],
    ['inmobiliaria', 'Inmobiliaria y construcción', 215, 40, 38, 'Azules sobrios y tonos arena evocan solidez y hogar, y se ven premium en fotografía de espacios.'],
    ['turismo', 'Turismo y viajes', 185, 70, 22, 'El turquesa recuerda al mar y al descanso; el coral invita a reservar.'],
    ['fitness', 'Deporte y fitness', 95, 75, 15, 'Verdes lima y naranjas transmiten energía y movimiento, ideales para motivar.'],
    ['eco', 'Agro, ecológico y sostenible', 135, 45, 40, 'Los verdes naturales comunican frescura y cuidado del entorno; la tierra y el ocre dan autenticidad.'],
    ['ong', 'ONG y causas sociales', 265, 45, 25, 'Un morado empático con un acento cálido invita a participar sin sonar institucional.'],
    ['industrial', 'Industrial y B2B', 210, 28, 28, 'Grises azulados proyectan precisión y fiabilidad; el naranja, usado como señal, destaca los contactos y cotizaciones.'],
    ['mascotas', 'Mascotas y veterinarias', 28, 70, 190, 'Naranjas amigables y un azul contrastante se sienten juguetones y de confianza.'],
    ['creativo', 'Arte, eventos y creatividad', 285, 60, 330, 'Violetas y magentas expresan imaginación; los contrastes fuertes dan personalidad.']
  ];
  var MOODS = [['sobria', 'Sobria y confiable'], ['moderna', 'Moderna y oscura'], ['cercana', 'Cercana y cálida']];
  var ROLES = [['primario', 'Primario', 'Botones, enlaces y elementos principales'], ['secundario', 'Secundario', 'Fondos de tarjetas y secciones de apoyo'], ['acento', 'Acento', 'Llamados a la acción y detalles'], ['fondo', 'Fondo', 'Fondo general de la página'], ['texto', 'Texto', 'Títulos y párrafos']];
  var sel = document.getElementById('clSector'), moods = document.getElementById('clMoods'), out = document.getElementById('clOut');
  var mood = 'sobria', warm = 0, vivid = 100, picked = 0, unlocked = false;

  function hsl(h, s, l) {
    h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(100, s)) / 100; l = Math.max(0, Math.min(100, l)) / 100;
    var k = function (n) { return (n + h / 30) % 12; }, a = s * Math.min(l, 1 - l);
    var f = function (n) { var v = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return ('0' + Math.round(v * 255).toString(16)).slice(-2); };
    return '#' + f(0) + f(8) + f(4);
  }
  function toHsl(hex) {
    var r = parseInt(hex.substr(1, 2), 16) / 255, g = parseInt(hex.substr(3, 2), 16) / 255, b = parseInt(hex.substr(5, 2), 16) / 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn, h = 0, s = 0;
    if (d) { s = d / (1 - Math.abs(2 * l - 1)); h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360; }
    return [h, s * 100, l * 100];
  }
  function lum(hex) {
    var c = [1, 3, 5].map(function (i) { var v = parseInt(hex.substr(i, 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function grade(r) { return r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'Solo texto grande' : 'No cumple'; }
  function readable(bg) { return ratio(bg, '#ffffff') >= ratio(bg, '#111111') ? '#ffffff' : '#111111'; }
  function rgb(hex) { return parseInt(hex.substr(1, 2), 16) + ', ' + parseInt(hex.substr(3, 2), 16) + ', ' + parseInt(hex.substr(5, 2), 16); }
  /* nombre evocador estilo pantonera: matiz + luminosidad, y un código "WOW" */
  var HUES = [[15, 'Rojo'], [40, 'Naranja'], [65, 'Amarillo'], [95, 'Lima'], [160, 'Verde'], [195, 'Turquesa'], [225, 'Azul'], [255, 'Índigo'], [290, 'Violeta'], [335, 'Magenta'], [361, 'Rojo']];
  function colorName(hex) {
    var c = toHsl(hex), h = c[0], s = c[1], l = c[2];
    if (s < 10) return l > 85 ? 'Blanco hueso' : l < 22 ? 'Carbón' : 'Gris piedra';
    var base = HUES.filter(function (x) { return h < x[0]; })[0][1];
    return base + (l < 24 ? ' noche' : l < 40 ? ' profundo' : l < 62 ? '' : l < 82 ? ' suave' : ' bruma');
  }
  function code(hex) { var c = toHsl(hex); return 'WOW ' + ('0' + Math.round(c[0] / 3.6)).slice(-2) + '-' + ('0' + Math.round(c[2])).slice(-2) + (c[2] > 50 ? 'C' : 'U'); }

  function palette(sec, m, w, v) {
    var h = sec[2] + w * 0.5, s = Math.min(100, sec[3] * v / 100), a = sec[4] + w;
    if (m === 'moderna') return { fondo: hsl(h, 35 * v / 100, 9), texto: hsl(h, 20, 95), primario: hsl(h, s, 62), secundario: hsl(h, s * 0.6, 26), acento: hsl(a, Math.min(100, 85 * v / 100), 62) };
    if (m === 'cercana') return { fondo: hsl(a, 55, 96), texto: hsl(h, 30, 15), primario: hsl(h, s, 40), secundario: hsl(h, s * 0.7, 84), acento: hsl(a, Math.min(100, 80 * v / 100), 52) };
    return { fondo: hsl(h, 22, 97), texto: hsl(h, 35, 11), primario: hsl(h, s, 30), secundario: hsl(h, s * 0.6, 52), acento: hsl(a, Math.min(100, 80 * v / 100), 50) };
  }
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.innerHTML = x; return e; }
  function txt(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function copy(text, btn) {
    var done = function () { var o = btn.textContent; btn.textContent = '¡Copiado!'; setTimeout(function () { btn.textContent = o; }, 1400); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () {});
  }
  function cssOf(p) { return ':root {\n  --color-primario: ' + p.primario + ';\n  --color-secundario: ' + p.secundario + ';\n  --color-acento: ' + p.acento + ';\n  --color-fondo: ' + p.fondo + ';\n  --color-texto: ' + p.texto + ';\n}'; }
  function twOf(p) { return "// tailwind.config.js\ntheme: { extend: { colors: {\n  primario: '" + p.primario + "',\n  secundario: '" + p.secundario + "',\n  acento: '" + p.acento + "',\n  fondo: '" + p.fondo + "',\n  texto: '" + p.texto + "'\n} } }"; }

  /* manchas de acuarela detrás de la pantonera */
  function watercolor(p) {
    var cols = [p.primario, p.acento, p.secundario, p.primario, p.acento];
    var pos = [[120, 150, 150, 90], [330, 110, 170, 80], [520, 170, 160, 100], [700, 120, 140, 85], [430, 220, 190, 70]];
    var blobs = pos.map(function (b, i) { return '<ellipse cx="' + b[0] + '" cy="' + b[1] + '" rx="' + b[2] + '" ry="' + b[3] + '" fill="' + cols[i] + '" opacity=".55"/>'; }).join('');
    return '<svg class="pt-wc" viewBox="0 0 800 340" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><filter id="ptWc" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".014" numOctaves="3" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="58"/><feGaussianBlur stdDeviation="7"/></filter></defs><rect width="800" height="340" fill="' + p.fondo + '"/><g filter="url(#ptWc)" style="mix-blend-mode:multiply">' + blobs + '</g></svg>';
  }

  function render() {
    var sec = SECTORS[sel.selectedIndex], p = palette(sec, mood, warm, vivid);
    out.textContent = '';
    out.appendChild(txt('p', 'cl-why', sec[5]));

    /* pantonera */
    var stage = el('div', 'pt-stage'); stage.innerHTML = watercolor(p);
    var fan = el('div', 'pt-fan'); fan.setAttribute('role', 'group'); fan.setAttribute('aria-label', 'Pantonera con los cinco colores');
    var info = el('div', 'pt-info'); info.setAttribute('aria-live', 'polite');
    function showInfo() {
      var r = ROLES[picked], hex = p[r[0]];
      info.innerHTML = '<p class="pt-role">' + r[1].toUpperCase() + '</p><h3>' + colorName(hex) + '</h3><p>' + r[2] + '.</p><dl><div><dt>HEX</dt><dd>' + hex.toUpperCase() + '</dd></div><div><dt>RGB</dt><dd>' + rgb(hex) + '</dd></div><div><dt>Código</dt><dd>' + code(hex) + '</dd></div></dl>';
      var b = txt('button', 'btn btn-primary btn-sm', 'Copiar ' + hex.toUpperCase()); b.type = 'button'; b.addEventListener('click', function () { copy(hex.toUpperCase(), b); }); info.appendChild(b);
    }
    ROLES.forEach(function (r, i) {
      var hex = p[r[0]], card = el('button', 'pt-card' + (i === picked ? ' is-pulled' : '')); card.type = 'button';
      card.style.setProperty('--a', ((i - 2) * 13) + 'deg'); card.style.setProperty('--i', i);
      card.setAttribute('aria-label', r[1] + ': ' + colorName(hex) + ' ' + hex.toUpperCase());
      card.innerHTML = '<span class="pt-chip" style="background:' + hex + '"></span><span class="pt-lab"><b>' + colorName(hex) + '</b><small>' + code(hex) + '</small><em>' + hex.toUpperCase() + '</em></span>';
      card.addEventListener('click', function () { picked = i; fan.querySelectorAll('.pt-card').forEach(function (c, j) { c.classList.toggle('is-pulled', j === i); }); showInfo(); });
      fan.appendChild(card);
    });
    stage.appendChild(fan); stage.appendChild(info); out.appendChild(stage); showInfo();

    /* contraste */
    var btnText = readable(p.primario), accText = readable(p.acento);
    var checks = [['Texto sobre el fondo', ratio(p.texto, p.fondo)], ['Texto del botón principal', ratio(btnText, p.primario)], ['Texto del botón de acento', ratio(accText, p.acento)]];
    out.appendChild(txt('p', 'cl-how', 'Contraste calculado con la fórmula de WCAG 2.1: 4,5 a 1 es el mínimo (AA) para texto normal y 7 a 1 el nivel AAA.'));
    var ul = el('ul', 'cl-checks');
    checks.forEach(function (c) { var li = el('li', c[1] >= 4.5 ? 'ok' : 'bad'); li.appendChild(txt('span', null, c[0])); li.appendChild(txt('b', null, c[1].toFixed(1) + ' · ' + grade(c[1]))); ul.appendChild(li); });
    out.appendChild(ul);

    /* vista previa que se repinta en vivo */
    var prev = el('div', 'cl-prev'); prev.style.background = p.fondo; prev.style.color = p.texto;
    var nav = el('div', 'cl-pnav'); nav.style.background = p.secundario; nav.style.color = readable(p.secundario);
    nav.appendChild(txt('b', null, 'Tu marca')); nav.appendChild(txt('span', null, 'Servicios · Nosotros · Contacto'));
    prev.appendChild(nav);
    var hero = el('div', 'cl-phero');
    hero.appendChild(txt('h3', null, 'Lo que tu cliente necesita, en un solo lugar'));
    hero.appendChild(txt('p', null, 'Así se vería el texto, los botones y las tarjetas de tu sitio con esta paleta.'));
    var b1 = txt('span', 'cl-pbtn', 'Cotizar'); b1.style.background = p.primario; b1.style.color = btnText;
    var b2 = txt('span', 'cl-pbtn', 'Ver más'); b2.style.background = p.acento; b2.style.color = accText;
    hero.appendChild(b1); hero.appendChild(b2); prev.appendChild(hero);
    var cards = el('div', 'cl-pcards');
    for (var i = 0; i < 3; i++) { var c = el('div', 'cl-pcard'); c.style.background = p.secundario; c.style.color = readable(p.secundario); c.appendChild(txt('b', null, 'Servicio ' + (i + 1))); c.appendChild(txt('small', null, 'Descripción corta')); cards.appendChild(c); }
    prev.appendChild(cards); out.appendChild(prev);

    var cb = txt('button', 'btn btn-primary btn-sm', 'Copiar como variables CSS'); cb.type = 'button';
    cb.addEventListener('click', function () { copy(cssOf(p), cb); if (window.gtag) window.gtag('event', 'playground_colors_copy', { sector: sec[0], mood: mood }); });
    var wrap = el('div', 'cl-actions'); wrap.appendChild(cb); out.appendChild(wrap);

    /* correo: paleta completa */
    var gate = el('div', 'cl-gate'), lockBox = el('div', 'cl-lock');
    if (unlocked) fillFull(lockBox, sec, p);
    else if (window.WOWLead) {
      lockBox.innerHTML = '<p class="qz-lock-note">Incluye: variantes para las 3 personalidades, tokens para CSS y Tailwind, y combinaciones de texto aprobadas en accesibilidad.</p>';
      var lead = el('div'); gate.appendChild(lead); gate.appendChild(lockBox);
      window.WOWLead.mount(lead, { tool: 'Colores: ' + sec[1], pitch: 'Te mostramos al instante la paleta completa: variantes, tokens listos para copiar y combinaciones accesibles.', data: function () { return { sector: sec[0], personalidad: mood, calidez: warm, intensidad: vivid, paleta: p }; }, onUnlock: function () { unlocked = true; fillFull(lockBox, sec, p); } });
    }
    if (unlocked) gate.appendChild(lockBox);
    out.appendChild(gate);
  }

  function fillFull(box, sec, p) {
    box.textContent = '';
    box.appendChild(txt('p', 'sd-steps-t', 'TU PALETA COMPLETA'));
    MOODS.forEach(function (m) {
      var q = palette(sec, m[0], warm, vivid), row = el('div', 'cl-alt');
      row.appendChild(txt('b', null, m[1]));
      var sw = el('div', 'cl-alt-sw'); ROLES.forEach(function (r) { var s = txt('span', null, q[r[0]].toUpperCase()); s.style.background = q[r[0]]; s.style.color = readable(q[r[0]]); sw.appendChild(s); });
      row.appendChild(sw); box.appendChild(row);
    });
    [['Variables CSS', cssOf(p)], ['Tailwind', twOf(p)]].forEach(function (t) {
      var pre = el('div', 'cl-code'); pre.appendChild(txt('p', null, t[0]));
      var code = txt('pre', null, t[1]); pre.appendChild(code);
      var b = txt('button', 'btn btn-sm', 'Copiar'); b.type = 'button'; b.addEventListener('click', function () { copy(t[1], b); }); pre.appendChild(b); box.appendChild(pre);
    });
    var pairs = [[p.texto, p.fondo, 'Texto sobre fondo'], [readable(p.primario), p.primario, 'Texto sobre primario'], [readable(p.acento), p.acento, 'Texto sobre acento'], [readable(p.secundario), p.secundario, 'Texto sobre secundario']];
    var ul = el('ul', 'cl-checks'); pairs.forEach(function (x) { var r = ratio(x[0], x[1]), li = el('li', r >= 4.5 ? 'ok' : 'bad'); li.appendChild(txt('span', null, x[2] + ' (' + x[0].toUpperCase() + ' / ' + x[1].toUpperCase() + ')')); li.appendChild(txt('b', null, r.toFixed(1) + ' · ' + grade(r))); ul.appendChild(li); });
    box.appendChild(ul);
  }

  /* controles: sector, personalidad y sliders de calidez / intensidad */
  SECTORS.forEach(function (s) { var o = txt('option', null, s[1]); o.value = s[0]; sel.appendChild(o); });
  MOODS.forEach(function (m, i) {
    var l = el('label', 'cl-mood'), r = el('input'); r.type = 'radio'; r.name = 'mood'; r.value = m[0]; r.checked = i === 0;
    r.addEventListener('change', function () { mood = m[0]; render(); });
    l.appendChild(r); l.appendChild(txt('span', null, m[1])); moods.appendChild(l);
  });
  function slider(id, label, min, max, val, lo, hi, on) {
    var f = el('div', 'cl-field cl-slide'), lb = txt('label', null, label); lb.setAttribute('for', id);
    var r = el('input'); r.type = 'range'; r.id = id; r.min = min; r.max = max; r.step = 1; r.value = val; r.style.setProperty('--p', ((val - min) / (max - min) * 100) + '%');
    var ends = el('div', 'cl-ends'); ends.innerHTML = '<span>' + lo + '</span><span>' + hi + '</span>';
    r.addEventListener('input', function () { r.style.setProperty('--p', ((r.value - min) / (max - min) * 100) + '%'); on(+r.value); });
    f.appendChild(lb); f.appendChild(r); f.appendChild(ends); return f;
  }
  var sl = el('div', 'cl-sliders');
  sl.appendChild(slider('clWarm', 'Qué tan cálida', -40, 40, 0, 'Más fría', 'Más cálida', function (v) { warm = v; render(); }));
  sl.appendChild(slider('clVivid', 'Qué tan intensa', 40, 130, 100, 'Más suave', 'Más vibrante', function (v) { vivid = v; render(); }));
  form.appendChild(sl);
  sel.addEventListener('change', function () { render(); if (window.gtag) window.gtag('event', 'playground_colors_sector', { sector: sel.value }); });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  render();
})();
