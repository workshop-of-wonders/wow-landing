/* Playground: paleta de colores por sector. Todo se calcula en el navegador. */
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
  var sel = document.getElementById('clSector'), moods = document.getElementById('clMoods'), out = document.getElementById('clOut'), mood = 'sobria';

  function hsl(h, s, l) {
    h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(100, s)) / 100; l = Math.max(0, Math.min(100, l)) / 100;
    var k = function (n) { return (n + h / 30) % 12; }, a = s * Math.min(l, 1 - l);
    var f = function (n) { var v = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return ('0' + Math.round(v * 255).toString(16)).slice(-2); };
    return '#' + f(0) + f(8) + f(4);
  }
  function lum(hex) {
    var c = [1, 3, 5].map(function (i) { var v = parseInt(hex.substr(i, 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function grade(r) { return r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'Solo texto grande' : 'No cumple'; }
  function readable(bg) { return ratio(bg, '#ffffff') >= ratio(bg, '#111111') ? '#ffffff' : '#111111'; }

  function palette(sec, m) {
    var h = sec[2], s = sec[3], a = sec[4];
    if (m === 'moderna') return { fondo: hsl(h, 35, 9), texto: hsl(h, 20, 95), primario: hsl(h, s, 62), secundario: hsl(h, s * 0.6, 26), acento: hsl(a, 85, 62) };
    if (m === 'cercana') return { fondo: hsl(a, 55, 96), texto: hsl(h, 30, 15), primario: hsl(h, s, 40), secundario: hsl(h, s * 0.7, 84), acento: hsl(a, 80, 52) };
    return { fondo: hsl(h, 22, 97), texto: hsl(h, 35, 11), primario: hsl(h, s, 30), secundario: hsl(h, s * 0.6, 52), acento: hsl(a, 80, 50) };
  }
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function copy(text, btn) {
    var done = function () { var o = btn.textContent; btn.textContent = '¡Copiado!'; setTimeout(function () { btn.textContent = o; }, 1400); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () {});
  }
  var ROLES = [['primario', 'Primario', 'Botones, enlaces y elementos principales'], ['secundario', 'Secundario', 'Fondos de tarjetas y secciones de apoyo'], ['acento', 'Acento', 'Llamados a la acción y detalles'], ['fondo', 'Fondo', 'Fondo general de la página'], ['texto', 'Texto', 'Títulos y párrafos']];

  function render() {
    var sec = SECTORS[sel.selectedIndex], p = palette(sec, mood);
    out.textContent = '';
    out.appendChild(el('p', 'cl-why', sec[5]));
    var sw = el('div', 'cl-sw');
    ROLES.forEach(function (r) {
      var b = el('button', 'cl-chip'); b.type = 'button';
      b.style.background = p[r[0]]; b.style.color = readable(p[r[0]]);
      b.setAttribute('aria-label', 'Copiar ' + r[1] + ' ' + p[r[0]]);
      b.appendChild(el('b', null, r[1])); b.appendChild(el('span', null, p[r[0]].toUpperCase())); b.appendChild(el('small', null, r[2]));
      b.addEventListener('click', function () { copy(p[r[0]].toUpperCase(), b); });
      sw.appendChild(b);
    });
    out.appendChild(sw);

    var btnText = readable(p.primario), accText = readable(p.acento);
    var checks = [['Texto sobre el fondo', ratio(p.texto, p.fondo)], ['Texto del botón principal', ratio(btnText, p.primario)], ['Texto del botón de acento', ratio(accText, p.acento)]];
    var ul = el('ul', 'cl-checks');
    checks.forEach(function (c) { var li = el('li', c[1] >= 4.5 ? 'ok' : 'bad'); li.appendChild(el('span', null, c[0])); li.appendChild(el('b', null, c[1].toFixed(1) + ' · ' + grade(c[1]))); ul.appendChild(li); });
    out.appendChild(ul);

    var prev = el('div', 'cl-prev'); prev.style.background = p.fondo; prev.style.color = p.texto;
    var nav = el('div', 'cl-pnav'); nav.style.background = p.secundario; nav.style.color = readable(p.secundario);
    nav.appendChild(el('b', null, 'Tu marca')); nav.appendChild(el('span', null, 'Servicios · Nosotros · Contacto'));
    prev.appendChild(nav);
    var hero = el('div', 'cl-phero');
    hero.appendChild(el('h3', null, 'Lo que tu cliente necesita, en un solo lugar'));
    hero.appendChild(el('p', null, 'Así se vería el texto, los botones y las tarjetas de tu sitio con esta paleta.'));
    var b1 = el('span', 'cl-pbtn', 'Cotizar'); b1.style.background = p.primario; b1.style.color = btnText;
    var b2 = el('span', 'cl-pbtn', 'Ver más'); b2.style.background = p.acento; b2.style.color = accText;
    hero.appendChild(b1); hero.appendChild(b2); prev.appendChild(hero);
    var cards = el('div', 'cl-pcards');
    for (var i = 0; i < 3; i++) { var c = el('div', 'cl-pcard'); c.style.background = p.secundario; c.style.color = readable(p.secundario); c.appendChild(el('b', null, 'Servicio ' + (i + 1))); c.appendChild(el('small', null, 'Descripción corta')); cards.appendChild(c); }
    prev.appendChild(cards);
    out.appendChild(prev);

    var css = ':root {\n  --color-primario: ' + p.primario + ';\n  --color-secundario: ' + p.secundario + ';\n  --color-acento: ' + p.acento + ';\n  --color-fondo: ' + p.fondo + ';\n  --color-texto: ' + p.texto + ';\n}';
    var cb = el('button', 'btn btn-primary btn-sm', 'Copiar como variables CSS'); cb.type = 'button';
    cb.addEventListener('click', function () { copy(css, cb); if (window.gtag) window.gtag('event', 'playground_colors_copy', { sector: sec[0], mood: mood }); });
    var wrap = el('div', 'cl-actions'); wrap.appendChild(cb); out.appendChild(wrap);
  }

  SECTORS.forEach(function (s) { var o = el('option', null, s[1]); o.value = s[0]; sel.appendChild(o); });
  MOODS.forEach(function (m, i) {
    var l = el('label', 'cl-mood'), r = el('input'); r.type = 'radio'; r.name = 'mood'; r.value = m[0]; r.checked = i === 0;
    r.addEventListener('change', function () { mood = m[0]; render(); });
    l.appendChild(r); l.appendChild(el('span', null, m[1])); moods.appendChild(l);
  });
  sel.addEventListener('change', function () { render(); if (window.gtag) window.gtag('event', 'playground_colors_sector', { sector: sel.value }); });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  render();
})();
