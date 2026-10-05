document.getElementById('year').textContent = new Date().getFullYear();

/* createFocusTrap is defined in js/common.js, loaded before this file. */

/* Nav turns solid purple once the hero is scrolled past */
(function () {
  var nav = document.querySelector('.nav');
  if (!nav) return;
  function updateNav() {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
})();

/* Hero mosaic: the "taller" door as a custom cursor, active only while the mouse is over
   a project card. It's position:fixed + pointer-events:none, so it never sits in the
   card's layout and a click always falls straight through to that card's existing
   [data-lightbox] handler, unchanged. Skipped entirely on touch (no real cursor there).

   The cards scroll on their own (the mosaic's auto-scroll animation), so a card can slide
   out from under a perfectly still mouse — or a new one can slide in — without any
   mouseenter/mouseleave ever firing. Relying on those events alone left the door stuck
   visible over content it wasn't over anymore. Instead, every frame re-checks with
   elementFromPoint whether a card is actually under the cursor right now, so the door
   can never drift out of sync with what's actually moving underneath it. */
(function () {
  if (window.matchMedia('(hover: none)').matches) return;
  var zone = document.querySelector('.hero-media');
  if (!zone) return;

  var cursor = document.createElement('div');
  cursor.className = 'door-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  /* .door-cursor is JS-positioned (translate only, every frame); the -50%/-50% centering
     and the enter/exit scale+opacity animation live on this inner wrapper instead, so the
     two transforms never fight over the same inline style */
  cursor.innerHTML =
    '<div class="door-cursor-inner">' +
      '<span class="door-cursor-spark door-cursor-spark-1">✦</span>' +
      '<span class="door-cursor-spark door-cursor-spark-2">✧</span>' +
      '<span class="door-cursor-frame">' +
        '<span class="door-cursor-leaf">' +
          '<span class="door-cursor-handle"></span>' +
          '<span class="door-cursor-mark-ring"><img src="design-system/logo/wow-mark-purple.svg" alt=""></span>' +
          '<span class="door-cursor-label"><span>ABRIR<br>TALLER</span><span class="door-cursor-arrow">↗</span></span>' +
        '</span>' +
      '</span>' +
    '</div>';
  document.body.appendChild(cursor);

  var mouseX = -9999, mouseY = -9999, curX = 0, curY = 0, raf = null, visible = false, moved = false;

  function isOverCard(x, y) {
    var el = document.elementFromPoint(x, y);
    return !!(el && el.closest && el.closest('.media-card'));
  }
  function setVisible(v) {
    if (v === visible) return;
    visible = v;
    cursor.classList.toggle('is-visible', v);
  }

  function render() {
    curX += (mouseX - curX) * 0.35;
    curY += (mouseY - curY) * 0.35;
    cursor.style.transform = 'translate(' + curX + 'px,' + curY + 'px)';
    setVisible(moved && isOverCard(mouseX, mouseY));
    raf = requestAnimationFrame(render);
  }

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!moved) { moved = true; curX = mouseX; curY = mouseY; }
    if (!raf) raf = requestAnimationFrame(render);
  });
  document.addEventListener('mouseleave', function () { setVisible(false); });
})();

/* Labs accordion: on touch/mobile, tap a panel to expand it (only one open at a time) */
document.querySelectorAll('.labs-panel').forEach(function (panel) {
  panel.addEventListener('click', function (e) {
    if (e.target.closest('a')) return;   /* el enlace de la tarjeta navega por sí solo */
    if (window.innerWidth > 900) {   /* escritorio: un clic en cualquier parte de la tarjeta lleva al Lab */
      var go = panel.querySelector('.labs-panel-link');
      if (go) window.location.href = go.href;
      return;
    }
    var wasOpen = panel.classList.contains('is-open');
    document.querySelectorAll('.labs-panel').forEach(function (p) { p.classList.remove('is-open'); });
    if (!wasOpen) panel.classList.add('is-open');
  });
});

/* "Abrir el taller" door: reveals the rest of the Trabajo gallery from behind the door */
(function () {
  var doorBtn = document.getElementById('workDoorBtn');
  var hidden = document.getElementById('workHidden');
  if (!doorBtn || !hidden) return;
  doorBtn.addEventListener('click', function () {
    var isOpen = doorBtn.classList.toggle('is-open');
    doorBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    hidden.classList.toggle('is-open', isOpen);
  });

  /* The wiggle is a CSS infinite animation, but its timeline keeps running
     while the door is off-screen — so by the time it scrolls into view it
     could be anywhere in the cycle, sometimes looking static for a couple
     seconds. Restarting the animation the instant it becomes visible makes
     it wiggle right away, like it's asking to be opened. */
  var frame = doorBtn.querySelector('.work-door-frame');
  if (frame && 'IntersectionObserver' in window) {
    var seen = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !seen) {
          seen = true;
          frame.style.animation = 'none';
          void frame.offsetWidth;
          frame.style.animation = '';
        }
      });
    }, { threshold: 0.4 });
    io.observe(frame);
  }
})();

/* Figma-style collaborative cursor over the services diagram */
(function () {
  var section = document.getElementById('servicios');
  var cursor = document.getElementById('figmaCursor');
  if (!section || !cursor) return;
  var clickableSelector = 'a, button, [data-open-form], [onclick], [role="button"]';
  section.addEventListener('mousemove', function (e) {
    cursor.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
    cursor.classList.add('is-visible');
    cursor.classList.toggle('is-pointer', !!e.target.closest(clickableSelector));
  });
  section.addEventListener('mouseleave', function () {
    cursor.classList.remove('is-visible');
  });
})();

function setSwitch(btn, isOn) {
  btn.classList.toggle('is-on', isOn);
  btn.setAttribute('aria-pressed', isOn ? 'true' : 'false');
  btn.querySelector('.switch-label').textContent = isOn ? 'ON' : 'OFF';
  var item = btn.closest('.toggle-item');
  if (item) item.classList.toggle('text-hidden', !isOn);
}
document.querySelectorAll('.switch').forEach(function (btn) {
  btn.addEventListener('click', function () {
    btn.dataset.userSet = '1';
    setSwitch(btn, !btn.classList.contains('is-on'));
  });
});

/* Hub diagram: each pill is a link straight to its service page. */
var hubDiagramEl = document.getElementById('hubDiagram');
var hubPills = [].slice.call(document.querySelectorAll('.hub-pill'));

/* Conectores estilo "flujo de prototipo" de Figma: una curva desde el borde de cada pill hasta el costado del W central,
   con un punto en el pill y una flecha en el W, del color de su Lab. Se redibujan cada vez que cambia el layout. */
var HUB_LAB_COLORS = { 'hub-lab-brand': '#EC4899', 'hub-lab-insight': '#3B82F6' };
function hubPillColor(pill) {
  for (var cls in HUB_LAB_COLORS) if (pill.classList.contains(cls)) return HUB_LAB_COLORS[cls];
  return '#380757';
}
(function () {
  var svg = document.getElementById('hubArrows');
  var center = document.getElementById('hubCenter');
  if (!svg || !center) return;
  var svgNS = 'http://www.w3.org/2000/svg';

  function el(name, attrs) {
    var n = document.createElementNS(svgNS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function drawLines() {
    /* coordenadas relativas al padding box (el diagrama ahora tiene borde y relleno de "frame") */
    var dr = hubDiagramEl.getBoundingClientRect();
    var ox = dr.left + hubDiagramEl.clientLeft;
    var oy = dr.top + hubDiagramEl.clientTop;
    var w = hubDiagramEl.clientWidth;
    var h = hubDiagramEl.clientHeight;
    if (!w || !h) return;
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svg.innerHTML = '';
    var cr = center.getBoundingClientRect();
    var cMid = cr.left + cr.width / 2;
    var cy = cr.top - oy + cr.height / 2;
    var sides = { left: [], right: [] };
    hubPills.forEach(function (pill) {
      var r = pill.getBoundingClientRect();
      sides[(r.left + r.width / 2) < cMid ? 'left' : 'right'].push(pill);
    });
    ['left', 'right'].forEach(function (side) {
      var list = sides[side];
      list.forEach(function (pill, i) {
        var r = pill.getBoundingClientRect();
        var isLeft = side === 'left';
        var sx = (isLeft ? r.right : r.left) - ox;
        var sy = r.top - oy + r.height / 2;
        var ex = (isLeft ? cr.left : cr.right) - ox;
        /* las llegadas se abren en abanico sobre el costado del W para que no se amontonen en un punto */
        var ey = cy + (i - (list.length - 1) / 2) * Math.min(10, 64 / Math.max(1, list.length - 1));
        var dir = isLeft ? 1 : -1;
        var dx = Math.max(40, Math.abs(ex - sx) * 0.5) * dir;
        var color = hubPillColor(pill);
        svg.appendChild(el('path', {
          d: 'M' + sx + ' ' + sy + ' C ' + (sx + dx) + ' ' + sy + ', ' + (ex - dx) + ' ' + ey + ', ' + ex + ' ' + ey,
          fill: 'none', stroke: color, 'stroke-opacity': '0.5', 'stroke-width': '1.25', 'stroke-linecap': 'round'
        }));
        svg.appendChild(el('circle', { cx: sx, cy: sy, r: 3.5, fill: '#fff', stroke: color, 'stroke-opacity': '0.8', 'stroke-width': '1.25' }));
        svg.appendChild(el('path', {
          d: 'M' + (ex - 5 * dir) + ' ' + (ey - 3) + ' L' + ex + ' ' + ey + ' L' + (ex - 5 * dir) + ' ' + (ey + 3),
          fill: 'none', stroke: color, 'stroke-opacity': '0.7', 'stroke-width': '1.25', 'stroke-linecap': 'round', 'stroke-linejoin': 'round'
        }));
      });
    });
  }

  drawLines();
  window.addEventListener('resize', drawLines);
  window.addEventListener('load', drawLines);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawLines);
  setTimeout(drawLines, 300);
})();

/* Detalles estilo Figma (decorativos, solo escritorio): selección con manijas y medida al pasar por un pill,
   dos cursores de colaboradores que recorren los pills con su propia selección, y un comentario.
   El cursor "Tú" (#figmaCursor) es independiente y no se toca. */
(function () {
  var sel = document.getElementById('fgSel');
  var comment = document.getElementById('fgComment');
  var ghosts = [
    { el: document.getElementById('fgGhostBrand'), sel: document.getElementById('fgGselBrand') },
    { el: document.getElementById('fgGhostInsight'), sel: document.getElementById('fgGselInsight') }
  ];
  if (!hubDiagramEl || !sel || !ghosts[0].el) return;
  var desktop = window.matchMedia('(min-width: 901px)');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function origin() {
    var dr = hubDiagramEl.getBoundingClientRect();
    return { x: dr.left + hubDiagramEl.clientLeft, y: dr.top + hubDiagramEl.clientTop };
  }
  function rectIn(pill) {
    var o = origin(), r = pill.getBoundingClientRect();
    return { x: r.left - o.x, y: r.top - o.y, w: r.width, h: r.height };
  }

  /* selección propia */
  function showSel(pill) {
    if (!desktop.matches) return;
    var b = rectIn(pill);
    sel.style.left = (b.x - 1) + 'px';
    sel.style.top = (b.y - 1) + 'px';
    sel.style.width = (b.w + 2) + 'px';
    sel.style.height = (b.h + 2) + 'px';
    sel.querySelector('.fg-size').textContent = Math.round(b.w) + ' × ' + Math.round(b.h);
    sel.classList.add('is-on');
  }
  function hideSel() { sel.classList.remove('is-on'); }
  hubPills.forEach(function (pill) {
    pill.addEventListener('pointerenter', function () { showSel(pill); });
    pill.addEventListener('pointerleave', hideSel);
    pill.addEventListener('focus', function () { showSel(pill); });
    pill.addEventListener('blur', hideSel);
  });

  /* comentario pegado a un pill */
  function placeComment() {
    if (!comment) return;
    var pill = hubPills.filter(function (p) { return /Anal[ií]tica/.test(p.textContent); })[0];
    if (!pill) { comment.style.display = 'none'; return; }
    var b = rectIn(pill);
    comment.style.left = (b.x + b.w - 8) + 'px';
    comment.style.top = (b.y - 22) + 'px';
  }

  /* colaboradores: casi siempre deambulan libremente por el diagrama; solo a veces (PILL_CHANCE) van a un pill y lo
     seleccionan, para que no parezca que van a hacer clic en todos. */
  var PILL_CHANCE = 0.1;
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function tipFor(pill) {
    var b = rectIn(pill);
    return { x: b.x + b.w * rand(0.6, 0.85), y: b.y + b.h * rand(0.7, 0.95) };
  }
  function insidePill(x, y) {
    return hubPills.some(function (p) {
      var b = rectIn(p);
      return x > b.x - 6 && x < b.x + b.w + 6 && y > b.y - 6 && y < b.y + b.h + 6;
    });
  }
  /* Zona de movimiento: toda la sección #servicios (no solo el frame), menos el texto (eyebrow y título). */
  function textRect(sel, pad) {
    var e = document.querySelector(sel); if (!e) return null;
    var rg = document.createRange(); rg.selectNodeContents(e);
    var o = origin(), r = rg.getBoundingClientRect();
    /* el cursor lleva su etiqueta a la derecha (~120px) y debajo (~40px) de la punta: se amplía la zona hacia la izquierda y
       arriba para que ni la punta ni la etiqueta pisen el texto */
    return { x: r.left - o.x - pad - 120, y: r.top - o.y - pad - 40, w: r.width + 2 * pad + 120, h: r.height + 2 * pad + 40 };
  }
  function roamArea() {
    var o = origin(), sec = document.getElementById('servicios').getBoundingClientRect();
    return { x0: sec.left - o.x + 10, y0: sec.top - o.y + 10, x1: sec.right - o.x - 115, y1: sec.bottom - o.y - 42,
             blocked: [textRect('.services .eyebrow', 10), textRect('.services h2', 14)].filter(Boolean) };
  }
  function inRect(x, y, r) { return x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h; }
  /* punto libre, lejos de la posición actual y fuera de los pills y del texto (no debe parecer un clic). Casi siempre
     dentro del frame, pero a veces (OUT_CHANCE) en cualquier lugar libre de la sección, fuera del marco. */
  var OUT_CHANCE = 0.12;
  /* Movimientos cortos: cada colaborador solo se desplaza un poco desde donde está (MAX_STEP), para que las flechas
     no estén cruzando todo el diagrama y confundan. */
  var MIN_STEP = 50, MAX_STEP = 150;
  function freePoint(g, area) {
    var W = hubDiagramEl.clientWidth, H = hubDiagramEl.clientHeight, p;
    for (var i = 0; i < 30; i++) {
      var a = rand(0, Math.PI * 2), d = rand(MIN_STEP, MAX_STEP);
      p = { x: g.x + Math.cos(a) * d, y: g.y + Math.sin(a) * d };
      if (Math.random() < OUT_CHANCE) {   /* de vez en cuando se asoma fuera del marco, siempre cerca */
        p.x = Math.min(Math.max(p.x, area.x0), area.x1); p.y = Math.min(Math.max(p.y, area.y0), area.y1);
      } else {
        p.x = Math.min(Math.max(p.x, 24), W - 90); p.y = Math.min(Math.max(p.y, 14), H - 36);
      }
      var onText = area.blocked.some(function (r) { return inRect(p.x, p.y, r); });
      if (Math.hypot(p.x - g.x, p.y - g.y) > 40 && !onText && !insidePill(p.x, p.y)) return p;
    }
    return { x: g.x, y: g.y };
  }
  /* la trayectoria tampoco debe cruzar el texto */
  function pathClear(from, ctrl, to, area) {
    for (var i = 1; i < 16; i++) {
      var t = i / 16, u = 1 - t;
      var x = u * u * from.x + 2 * u * t * ctrl.x + t * t * to.x, y = u * u * from.y + 2 * u * t * ctrl.y + t * t * to.y;
      if (area.blocked.some(function (r) { return inRect(x, y, r); })) return false;
    }
    return true;
  }
  function setGhost(g, x, y) { g.el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)'; g.x = x; g.y = y; }
  function selectFor(g, pill) {
    if (!pill) { g.sel.classList.remove('is-on'); return; }
    var b = rectIn(pill);
    g.sel.style.left = (b.x - 2) + 'px'; g.sel.style.top = (b.y - 2) + 'px';
    g.sel.style.width = (b.w + 4) + 'px'; g.sel.style.height = (b.h + 4) + 'px';
    g.sel.classList.add('is-on');
  }
  function pickPill(g) {
    var other = ghosts[0] === g ? ghosts[1] : ghosts[0];
    var pool = hubPills.filter(function (p) {
      if (p === g.pill || p === other.pill) return false;
      var t = tipFor(p);
      return Math.hypot(t.x - g.x, t.y - g.y) < 280;   /* solo pills cercanos: nada de cruzar todo el diagrama */
    });
    return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
  }
  function startMove(g, now) {
    var area = roamArea(), t, ctrl, dx, dy, dist, bend, pill = null;
    for (var tries = 0; tries < 8; tries++) {
      pill = Math.random() < PILL_CHANCE ? pickPill(g) : null;   /* pickPill puede devolver null si no hay ninguno cerca */
      t = pill ? tipFor(pill) : freePoint(g, area);
      dx = t.x - g.x; dy = t.y - g.y; dist = Math.hypot(dx, dy) || 1;
      bend = rand(-0.2, 0.2) * dist;
      ctrl = {   /* el punto de control queda dentro de la zona de movimiento */
        x: Math.min(Math.max((g.x + t.x) / 2 - dy / dist * bend, area.x0), area.x1),
        y: Math.min(Math.max((g.y + t.y) / 2 + dx / dist * bend, area.y0), area.y1)
      };
      if (pathClear({ x: g.x, y: g.y }, ctrl, t, area)) break;
    }
    g.pill = pill;
    g.from = { x: g.x, y: g.y }; g.to = t; g.ctrl = ctrl;
    g.t0 = now; g.dur = 1800 + dist * 6 + rand(0, 900);
    g.state = 'move'; selectFor(g, null);
  }
  function tick(now) {
    ghosts.forEach(function (g) {
      if (g.state === 'move') {
        var t = Math.min(1, (now - g.t0) / g.dur), e = ease(t), u = 1 - e;
        setGhost(g, u * u * g.from.x + 2 * u * e * g.ctrl.x + e * e * g.to.x, u * u * g.from.y + 2 * u * e * g.ctrl.y + e * e * g.to.y);
        if (t >= 1) {
          g.state = 'dwell';
          if (g.pill) { g.until = now + rand(1200, 2200); selectFor(g, g.pill); }   /* se detiene a seleccionar el pill */
          else { g.until = now + rand(1500, 3800); }                                /* en el aire: se queda quieto un buen rato */
        }
      } else if (g.state === 'dwell' && now >= g.until) {
        startMove(g, now);
      }
    });
  }

  var raf = 0, visible = false;
  function loop(now) { tick(now); raf = requestAnimationFrame(loop); }
  function syncRunning() {
    var should = visible && !document.hidden && desktop.matches && !reduce.matches;
    if (should && !raf) raf = requestAnimationFrame(loop);
    if (!should && raf) { cancelAnimationFrame(raf); raf = 0; }
  }

  function layout() {
    placeComment();
    if (!desktop.matches) return;
    if (reduce.matches) {
      /* sin movimiento: cada colaborador queda quieto en un punto libre del frame, sin seleccionar nada */
      var W = hubDiagramEl.clientWidth, H = hubDiagramEl.clientHeight;
      var spots = [{ x: W * 0.42, y: H * 0.18 }, { x: W * 0.7, y: H * 0.72 }];
      ghosts.forEach(function (g, i) { g.pill = null; setGhost(g, spots[i].x, spots[i].y); selectFor(g, null); });
    } else {
      ghosts.forEach(function (g) { if (g.state === 'dwell' && g.pill) selectFor(g, g.pill); });
    }
  }

  ghosts.forEach(function (g, i) {
    g.pill = null; g.state = 'dwell'; g.until = performance.now() + 300 + i * 900;
    var W = hubDiagramEl.clientWidth || 800, H = hubDiagramEl.clientHeight || 200;
    setGhost(g, W * (i ? 0.7 : 0.35), H * (i ? 0.7 : 0.25));
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; syncRunning(); }).observe(hubDiagramEl);
  } else { visible = true; }
  document.addEventListener('visibilitychange', syncRunning);
  desktop.addEventListener && desktop.addEventListener('change', function () { layout(); syncRunning(); });
  reduce.addEventListener && reduce.addEventListener('change', function () { layout(); syncRunning(); });
  window.addEventListener('resize', layout);
  window.addEventListener('load', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  setTimeout(layout, 300);
  layout(); syncRunning();
})();
/* hub-pill and nav-dropdown-link are now real <a href> links straight to
   each service's own page, so no popup/description JS is needed here
   anymore — the browser's default navigation handles the click. */

/* Automatic Editorial Horizontal Collage System — generic, reusable, no
   per-project knowledge. Given any list of image URLs it measures each
   image's real aspect ratio, decides which ones deserve to span both rows
   (a "tall" module) vs. sit in a single row, computes each item's pixel
   width from --pc-row-h so the image is never cropped/stretched, then lets
   CSS grid's own dense packing (grid-auto-flow: column dense, defined in
   styles.css on .project-collage) fill the 2-row strip with no gaps. */
var ProjectCollage = (function () {
  // Real brand typefaces (from the client's brand board) that are also
  // freely available on Google Fonts — used for the kinetic type tile
  // instead of the site's own display font, so it shows each project's
  // actual typography: "Aa" in the brand's primary face, "123" in its
  // secondary one. Most brands only had one of their two real fonts
  // available on Google Fonts, so "secondary" just falls back to
  // "primary" for those — only Seed Capital and Orbit have a genuinely
  // distinct second face available.
  var TYPE_FONT_BY_SLUG = {
    'seed-capital': { primary: "'Open Sans', sans-serif", primaryWeight: 800, secondary: "'Montserrat', sans-serif", secondaryWeight: 600 },
    'arlo': { primary: "'Bree Serif', serif" },
    'indeleble': { primary: "'Bree Serif', serif" },
    'pretty-pets': { primary: "'Quicksand', sans-serif", primaryWeight: 700 },
    'clinica-del-cerebro': { primary: "'Poppins', sans-serif", primaryWeight: 600 },
    'lamparas-milan': { primary: "'Coustard', serif" },
    'tatas-photos': { primary: "'Poppins', sans-serif", primaryWeight: 600 },
    'am-studios': { primary: "'Poppins', sans-serif", primaryWeight: 600 },
    'aja-waffles': { primary: "'Fredoka', sans-serif", primaryWeight: 600 },
    'orbit': { primary: "'Teko', sans-serif", primaryWeight: 500, secondary: "'Teko', sans-serif", secondaryWeight: 700 },
    'prepapp': { primary: "'Fredoka', sans-serif", primaryWeight: 600 }
  };

  function loadImage(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = src;
    });
  }

  // The static "Aa123" type-specimen image is just two flat color halves —
  // sampled here so the kinetic tile below can reuse each brand's own two
  // colors instead of a generic palette.
  function sampleTwoColors(img) {
    try {
      var c = document.createElement('canvas');
      c.width = 20; c.height = 20;
      var ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, 20, 20);
      // Sample near the corners, not the center — the specimen's bold white
      // "Aa 123" glyphs sit in the middle of each half, so a center sample
      // picks up text pixels and washes the color out.
      var d1 = ctx.getImageData(2, 2, 1, 1).data;
      var d2 = ctx.getImageData(17, 2, 1, 1).data;
      return ['rgb(' + d1[0] + ',' + d1[1] + ',' + d1[2] + ')', 'rgb(' + d2[0] + ',' + d2[1] + ',' + d2[2] + ')'];
    } catch (e) {
      return ['#7c3aed', '#ec4899'];
    }
  }

  // A single flat card's own background color, sampled from its corner
  // pixel — used to color the card itself so it reads as a seamless
  // extension of the art rather than a mismatched default. Takes the most
  // common color across a whole grid of samples, not just one corner
  // pixel: several taglines repeat their text edge-to-edge (by design, so
  // a short phrase still fills the card), so any single fixed point can
  // land on a letterform instead of the actual background — the
  // background still covers most of the image, so the mode wins.
  function sampleCornerColor(img) {
    try {
      var size = 12;
      var c = document.createElement('canvas');
      c.width = size; c.height = size;
      var ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);
      var data = ctx.getImageData(0, 0, size, size).data;
      var counts = {};
      var best = null, bestCount = 0;
      for (var i = 0; i < data.length; i += 4) {
        // Quantize slightly so anti-aliased near-duplicates of the same
        // color still count as one bucket.
        var key = (data[i] >> 3) + ',' + (data[i + 1] >> 3) + ',' + (data[i + 2] >> 3);
        counts[key] = (counts[key] || 0) + 1;
        if (counts[key] > bestCount) { bestCount = counts[key]; best = [data[i], data[i + 1], data[i + 2]]; }
      }
      return best ? 'rgb(' + best[0] + ',' + best[1] + ',' + best[2] + ')' : null;
    } catch (e) {
      return null;
    }
  }

  // Standard CSS3 named colors, used only to label each swatch with a
  // real, recognizable color name (nearest match by RGB distance) instead
  // of a raw hex code — the swatch itself still uses the brand's exact hex.
  var CSS_NAMED_COLORS = [["#F0F8FF","alice blue"],["#FAEBD7","antique white"],["#00FFFF","aqua"],["#7FFFD4","aquamarine"],["#F0FFFF","azure"],["#F5F5DC","beige"],["#FFE4C4","bisque"],["#000000","black"],["#FFEBCD","blanched almond"],["#0000FF","blue"],["#8A2BE2","blue violet"],["#A52A2A","brown"],["#DEB887","burlywood"],["#5F9EA0","cadet blue"],["#7FFF00","chartreuse"],["#D2691E","chocolate"],["#FF7F50","coral"],["#6495ED","cornflower blue"],["#FFF8DC","cornsilk"],["#DC143C","crimson"],["#00008B","dark blue"],["#008B8B","dark cyan"],["#B8860B","dark goldenrod"],["#A9A9A9","dark gray"],["#006400","dark green"],["#BDB76B","dark khaki"],["#8B008B","dark magenta"],["#556B2F","dark olive green"],["#FF8C00","dark orange"],["#9932CC","dark orchid"],["#8B0000","dark red"],["#E9967A","dark salmon"],["#8FBC8F","dark sea green"],["#483D8B","dark slate blue"],["#2F4F4F","dark slate gray"],["#00CED1","dark turquoise"],["#9400D3","dark violet"],["#FF1493","deep pink"],["#00BFFF","deep sky blue"],["#696969","dim gray"],["#1E90FF","dodger blue"],["#B22222","firebrick"],["#FFFAF0","floral white"],["#228B22","forest green"],["#FF00FF","magenta"],["#DCDCDC","gainsboro"],["#F8F8FF","ghost white"],["#FFD700","gold"],["#DAA520","goldenrod"],["#808080","gray"],["#008000","green"],["#ADFF2F","green yellow"],["#F0FFF0","honeydew"],["#FF69B4","hot pink"],["#CD5C5C","indian red"],["#4B0082","indigo"],["#FFFFF0","ivory"],["#F0E68C","khaki"],["#E6E6FA","lavender"],["#FFF0F5","lavender blush"],["#7CFC00","lawn green"],["#FFFACD","lemon chiffon"],["#ADD8E6","light blue"],["#F08080","light coral"],["#E0FFFF","light cyan"],["#FAFAD2","light goldenrod yellow"],["#D3D3D3","light gray"],["#90EE90","light green"],["#FFB6C1","light pink"],["#FFA07A","light salmon"],["#20B2AA","light sea green"],["#87CEFA","light sky blue"],["#778899","light slate gray"],["#B0C4DE","light steel blue"],["#FFFFE0","light yellow"],["#00FF00","lime"],["#32CD32","lime green"],["#FAF0E6","linen"],["#800000","maroon"],["#66CDAA","medium aquamarine"],["#0000CD","medium blue"],["#BA55D3","medium orchid"],["#9370DB","medium purple"],["#3CB371","medium sea green"],["#7B68EE","medium slate blue"],["#00FA9A","medium spring green"],["#48D1CC","medium turquoise"],["#C71585","medium violet red"],["#191970","midnight blue"],["#F5FFFA","mint cream"],["#FFE4E1","misty rose"],["#FFE4B5","moccasin"],["#FFDEAD","navajo white"],["#000080","navy"],["#FDF5E6","old lace"],["#808000","olive"],["#6B8E23","olive drab"],["#FFA500","orange"],["#FF4500","orange red"],["#DA70D6","orchid"],["#EEE8AA","pale goldenrod"],["#98FB98","pale green"],["#AFEEEE","pale turquoise"],["#DB7093","pale violet red"],["#FFEFD5","papaya whip"],["#FFDAB9","peach puff"],["#CD853F","peru"],["#FFC0CB","pink"],["#DDA0DD","plum"],["#B0E0E6","powder blue"],["#800080","purple"],["#FF0000","red"],["#BC8F8F","rosy brown"],["#4169E1","royal blue"],["#8B4513","saddle brown"],["#FA8072","salmon"],["#F4A460","sandy brown"],["#2E8B57","sea green"],["#FFF5EE","seashell"],["#A0522D","sienna"],["#C0C0C0","silver"],["#87CEEB","sky blue"],["#6A5ACD","slate blue"],["#708090","slate gray"],["#FFFAFA","snow"],["#00FF7F","spring green"],["#4682B4","steel blue"],["#D2B48C","tan"],["#008080","teal"],["#D8BFD8","thistle"],["#FF6347","tomato"],["#40E0D0","turquoise"],["#EE82EE","violet"],["#F5DEB3","wheat"],["#FFFFFF","white"],["#F5F5F5","white smoke"],["#FFFF00","yellow"],["#9ACD32","yellow green"]];
  function nearestColorName(hex) {
    var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    var best = null, bestDist = Infinity;
    CSS_NAMED_COLORS.forEach(function (entry) {
      var nr = parseInt(entry[0].slice(1, 3), 16), ng = parseInt(entry[0].slice(3, 5), 16), nb = parseInt(entry[0].slice(5, 7), 16);
      var dist = (r - nr) * (r - nr) + (g - ng) * (g - ng) + (b - nb) * (b - nb);
      if (dist < bestDist) { bestDist = dist; best = entry[1]; }
    });
    return best.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  // Full brand palettes, sampled straight from the client's brand board PDF
  // (the same source as TYPE_FONT_BY_SLUG) — one swatch tile per real color.
  var COLORS_BY_SLUG = {
    'seed-capital': ['#FFBD58', '#00C2CB', '#61B333', '#F1F4F4', '#D0CD08', '#2D4672'],
    'tin-t': ['#20989D', '#D0085C', '#D0CD08', '#08D033', '#505858', '#DEE9EB'],
    'arlo': ['#FBA35C', '#528BBA', '#2A507D'],
    'indeleble': ['#833C85', '#4E1781'],
    'pretty-pets': ['#A778E7', '#FABE65', '#E3F78F', '#5CE1E6', '#2D4674', '#FFFFFF'],
    'clinica-del-cerebro': ['#030083', '#5CE1E6', '#004AAC', '#005281', '#FFBD58', '#FFFFFF'],
    'lamparas-milan': ['#52000D', '#C69538', '#505858', '#DEE9EB', '#E3D5CC'],
    'tatas-photos': ['#000000', '#FFFFFF'],
    'am-studios': ['#000000', '#212121', '#FFABD8', '#FFFFFF', '#86B0FF'],
    'aja-waffles': ['#01B6A6', '#FDD924', '#D95C00', '#FFEFDB'],
    'orbit': ['#000000', '#DEE9EB', '#505858', '#73616F'],
    'prepapp': ['#0C448E', '#F6A728', '#DD8B17'],
    'geco': ['#3F721D', '#74B053', '#80CC29', '#F58003', '#583B40', '#F1F7F6']
  };

  function normalize(images) {
    return images.map(function (item) {
      return typeof item === 'string' ? { src: item, priority: 1 } : { src: item.src, priority: item.priority || 1 };
    });
  }

  // Bumped on every render() call so a slow, still-in-flight render from a
  // previously-clicked project can detect it's stale (a newer one started)
  // and bail out without ever touching the DOM — otherwise, switching
  // quickly between two projects while the first is still loading its
  // images could let the first one "win" the race and overwrite the second's
  // freshly-rendered collage after the fact, making the whole thing look
  // stuck/out of sync.
  var renderToken = 0;

  async function render(container, images, opts) {
    opts = opts || {};
    var myToken = ++renderToken;
    var rowHVar = getComputedStyle(container).getPropertyValue('--pc-row-h') || '190px';
    var rowH = parseFloat(rowHVar) || 190;
    /* nº de filas de la tira (2 por defecto; renderFit sube a 3-4 cuando son tantas imágenes que no caben en 2) */
    var ROWS = parseInt(getComputedStyle(container).getPropertyValue('--pc-rows'), 10) || 2;
    var items = normalize(images);
    // Clear immediately (instead of only right before the final DOM build,
    // after every image has finished loading) and show a lightweight
    // loading state — otherwise the *previous* project's collage just sits
    // there frozen for however long this one's images take to fetch, which
    // reads as the UI being stuck rather than loading.
    container.innerHTML = '';
    container.classList.add('is-loading');
    if (!items.length) { container.classList.remove('is-loading'); return; }

    // Fetch the main image set and the tagline/pattern probes in parallel
    // (they used to run one after another, adding their fetch time on top
    // of the main set's instead of overlapping with it).
    var slugGuess = null;
    for (var gi = 0; gi < items.length; gi++) {
      var gm = items[gi].src.match(/portfolio\/([^/]+)\/type\.webp$/);
      if (gm) { slugGuess = gm[1]; break; }
    }
    var loadedPromise = Promise.all(items.map(function (it) { return loadImage(it.src); }));
    var taglinePromise = slugGuess ? loadImage('design-system/portfolio/' + slugGuess + '/tagline.webp') : Promise.resolve(null);
    var patternPromise = slugGuess ? loadImage('design-system/portfolio/' + slugGuess + '/pattern.webp') : Promise.resolve(null);
    var loaded = await loadedPromise;
    if (myToken !== renderToken) return; // a newer render started meanwhile — discard this one
    /* Nunca repetir imágenes: se descartan las que son idénticas (o casi) a otra ya incluida, aunque tengan otro nombre
       de archivo. Se compara una miniatura de 16x16 en grises. */
    (function () {
      function signature(img) {
        try {
          var c = document.createElement('canvas'); c.width = 16; c.height = 16;
          var ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0, 16, 16);
          var d = ctx.getImageData(0, 0, 16, 16).data, out = [];
          for (var k = 0; k < d.length; k += 4) out.push((d[k] + d[k + 1] + d[k + 2]) / 3);
          return out;
        } catch (e) { return null; }
      }
      function dist(a, b) { var t = 0; for (var k = 0; k < a.length; k++) t += Math.abs(a[k] - b[k]); return t / a.length / 255; }
      var sigs = [], keep = [];
      items.forEach(function (it, i) {
        var sig = loaded[i] ? signature(loaded[i]) : null;
        if (sig) {
          if (sigs.some(function (s) { return dist(s, sig) < 0.03; })) return;
          sigs.push(sig);
        }
        keep.push(i);
      });
      if (keep.length !== items.length) {
        items = keep.map(function (i) { return items[i]; });
        loaded = keep.map(function (i) { return loaded[i]; });
      }
    })();
    var pieces = items.map(function (it, i) {
      var img = loaded[i];
      var ratio = img ? (img.naturalWidth || 1) / (img.naturalHeight || 1) : 4 / 3;
      return { src: it.src, priority: it.priority, ratio: ratio, img: img };
    });

    // Append one square swatch tile per real brand color (from the brand
    // board PDF) — found via the same portfolio/<slug>/type.webp path
    // already in this project's image set, so no extra data is needed per
    // work-item.
    var slugForColors = null;
    var typePieceForPhrase = null;
    var slugForPhrase = null;
    for (var pi = 0; pi < pieces.length; pi++) {
      var m = pieces[pi].src.match(/portfolio\/([^/]+)\/type\.webp$/);
      if (m) {
        if (!typePieceForPhrase && pieces[pi].img) { typePieceForPhrase = pieces[pi]; slugForPhrase = m[1]; }
        if (!slugForColors && COLORS_BY_SLUG[m[1]]) slugForColors = m[1];
      }
    }
    if (slugForColors) {
      // All the brand's colors stacked in one tall card (like a paint-chip
      // strip) — one tile, not one tile per color.
      var paletteRatio = 1;
      pieces.push({ src: 'palette:' + slugForColors, priority: 1, ratio: paletteRatio, img: null, isPalette: true, colors: COLORS_BY_SLUG[slugForColors] });
    }
    // A tagline card — the project's own hand-designed tagline graphic
    // (design-system/portfolio/<slug>/tagline.webp, not every brand has
    // one), scrolling sideways as an endless marquee. Probed directly by
    // path, same "no extra data needed per item" approach as the pattern
    // and palette tiles.
    if (slugForPhrase) {
      var taglineImg = await taglinePromise;
      if (myToken !== renderToken) return;
      if (taglineImg) {
        var taglineRatio = (taglineImg.naturalWidth || 1) / (taglineImg.naturalHeight || 1);
        // Sample the graphic's own corner pixel as the card's background —
        // the art is a flat brand-color card itself, so the strip of card
        // showing through the gap between the two looping copies should
        // read as the same color, not a mismatched default.
        var taglineBg = sampleCornerColor(taglineImg);
        pieces.push({ src: 'tagline:' + slugForPhrase, priority: 1, ratio: taglineRatio, img: null, isTaglineImg: true, taglineSrc: taglineImg.src, taglineBg: taglineBg });
      }
    }
    // A spinning pattern card — the brand's own seamless print pattern
    // (from design-system/portfolio/<slug>/pattern.webp, not every brand
    // has one), tiled and rotating forever. Probed directly by path
    // instead of requiring it in each work-item's data-images — same
    // "no extra data needed per item" approach as the palette tile.
    if (slugForPhrase) {
      var patternImg = await patternPromise;
      if (myToken !== renderToken) return;
      if (patternImg) {
        pieces.push({ src: 'pattern:' + slugForPhrase, priority: 1, ratio: 1, img: null, isPattern: true, patternSrc: patternImg.src, colorImg: typePieceForPhrase.img });
      }
    }

    // Every piece is one row tall by default — no .pc-span2 — with two
    // exceptions: a single image (nothing to share the strip with, so it
    // gets the full 2-row height instead of sitting tiny up top) and
    // portrait/vertical images (ratio < 0.85 — naturally read better tall
    // than squeezed into one short row).
    var gap = parseFloat(getComputedStyle(container).getPropertyValue('--pc-gap')) || 3;
    var isSingle = pieces.length === 1;
    var colH = rowH * ROWS + gap * (ROWS - 1);   /* alto de una columna completa */
    // Logo/icon assets are flat marks on their own transparent canvas, not
    // photos — filling the tile edge-to-edge like a photo crops right up to
    // the mark with no breathing room. These get a padded card treatment
    // instead (see .pc-item-logo in styles.css).
    var isLogoAsset = /\/(?:portfolio\/[^/]+\/(?:logo|icon)|clients\/[^/]+)\.webp$/;
    // Icon marks specifically (not every brand has one, unlike logo) are
    // always square symbols, not wordmarks — force the tile to a true 1:1
    // instead of following the logo clamp range below (1:1–1:2.2), which
    // exists for wordmarks and would only ever narrow an icon down, never
    // widen it, but shouldn't apply to a mark meant to read as a square.
    var isIconAsset = /\/portfolio\/[^/]+\/icon\.webp$/;
    var isTypeAsset = /\/type\.webp$/;
    container.innerHTML = '';
    container.classList.remove('is-loading');
    var builtItems = [];
    pieces.forEach(function (piece) {
      var isLogo = isLogoAsset.test(piece.src);
      var isIcon = isIconAsset.test(piece.src);
      var isType = isTypeAsset.test(piece.src);
      var isTall = !isLogo && !isType && !piece.isPalette && !piece.isTaglineImg && !piece.isPattern && (isSingle || piece.ratio < 0.85);
      var height = isTall ? colH : rowH;
      // Wordmarks are often much wider than tall (e.g. a ~9:1 logo) — forcing
      // every logo tile to a 1:1 square shrinks those down to near-illegible.
      // Follow the real ratio like photos do, just clamped to a sane 1:1–1:2.2
      // range so a square icon doesn't go narrower than square either. Icon
      // marks specifically always get the true 1:1, ignoring their own
      // (possibly slightly off-square) file ratio.
      var width = isIcon ? height : (isLogo ? Math.round(height * Math.max(1, Math.min(2.2, piece.ratio))) : Math.round(height * piece.ratio));
      // Tagline card stays a 1:1 square like the other generated tiles
      // (palette/pattern) — the art itself scrolls 3 spaced-out copies
      // through that square window rather than the card growing to fit
      // all 3 at once.
      if (piece.isTaglineImg) {
        piece.taglineGapPx = Math.round(gap * 2.5);
        width = height;
      }
      var el = document.createElement('div');
      el.style.width = width + 'px';
      el.style.height = height + 'px';
      // Generated 1:1 tiles (palette/pattern/tagline) are deliberately always
      // square by design — excluded from the "promote a lone leftover item to
      // full height" pass below, which only applies to real photos/logos/type
      // specimens that just follow their own aspect ratio.
      var promotable = !piece.isPalette && !piece.isPattern && !piece.isTaglineImg;
      if (piece.isPalette) {
        // Several small vertical strips side by side in one card (same
        // multi-column marquee technique as the hero), each scrolling the
        // full color list at its own speed/direction for an organic feel,
        // instead of one single wide column.
        el.className = 'pc-item pc-item-palette';
        var COLS = 3;
        var durations = [16, 22, 19];
        for (var ci = 0; ci < COLS; ci++) {
          var col = document.createElement('div');
          col.className = 'pc-palette-col';
          var track = document.createElement('div');
          track.className = 'pc-palette-track';
          track.style.animationDuration = durations[ci % durations.length] + 's';
          track.style.animationDirection = (ci % 2 === 1) ? 'reverse' : 'normal';
          // Rotate the start point per column so the three columns aren't
          // showing the same colors in the same order side by side.
          var shift = (ci * Math.max(1, Math.floor(piece.colors.length / COLS))) % piece.colors.length;
          var colColors = piece.colors.slice(shift).concat(piece.colors.slice(0, shift));
          colColors.concat(colColors).forEach(function (hex) {
            var chip = document.createElement('div');
            // Middle column's label sits at the bottom (default); the two
            // flanking columns have it top-left, same as the middle's own
            // left-aligned start.
            chip.className = 'pc-palette-chip' + (ci === 1 ? '' : ' pc-palette-chip-top');
            chip.style.background = hex;
            var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
            var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            chip.style.color = luminance > 0.6 ? '#1a1a1a' : '#fff';
            // Left column is color-only, no label — too cramped to read at
            // that width and looked messy.
            if (ci !== 0) {
              var title = document.createElement('span'); title.className = 'pc-swatch-title'; title.textContent = nearestColorName(hex);
              var hexEl = document.createElement('span'); hexEl.className = 'pc-swatch-hex'; hexEl.textContent = hex;
              chip.appendChild(title);
              chip.appendChild(hexEl);
            }
            track.appendChild(chip);
          });
          col.appendChild(track);
          el.appendChild(col);
        }
        builtItems.push({ el: el, isTall: isTall, promotable: promotable, ratio: piece.ratio, isLogo: isLogo, isIcon: isIcon });
        return;
      }
      if (piece.isPattern) {
        // The brand's own seamless pattern, tiled and spinning forever.
        // Sized off rowH so the tile scale stays consistent regardless
        // of how big/small the card renders.
        el.className = 'pc-item pc-item-pattern';
        var patternColors = piece.colorImg ? sampleTwoColors(piece.colorImg) : ['#7c3aed', '#ec4899'];
        el.style.background = patternColors[0];
        var tileSize = Math.round(rowH * 1.4);
        var scroll = document.createElement('div'); scroll.className = 'pc-pattern-scroll';
        scroll.style.backgroundImage = 'url(' + piece.patternSrc + ')';
        scroll.style.backgroundSize = tileSize + 'px';
        // Animate by exactly one tile width so the loop has no visible
        // seam — a fixed % or rotation would either jump-cut or blur the
        // pattern into unrecognizable noise mid-spin.
        scroll.style.setProperty('--pattern-tile-w', tileSize + 'px');
        el.appendChild(scroll);
        builtItems.push({ el: el, isTall: isTall, promotable: promotable, ratio: piece.ratio, isLogo: isLogo, isIcon: isIcon });
        return;
      }
      if (piece.isTaglineImg) {
        // The project's own hand-designed tagline graphic: 3 copies
        // visible at once, spaced apart, looping sideways forever. Two
        // full groups of 3 sit back to back and the whole track shifts
        // by exactly one group's width (-50%) -- same duplicated-track
        // technique as the pattern/palette tiles, just with a group of 3
        // as the repeat unit instead of a single image.
        el.className = 'pc-item pc-item-tagline-img';
        if (piece.taglineBg) el.style.background = piece.taglineBg;
        var taglineTrack = document.createElement('div'); taglineTrack.className = 'pc-tagline-scroll';
        for (var tgi = 0; tgi < 6; tgi++) {
          var taglineEl = document.createElement('img');
          taglineEl.className = 'pc-tagline-scroll-img';
          taglineEl.src = piece.taglineSrc;
          taglineEl.alt = '';
          taglineEl.style.marginRight = piece.taglineGapPx + 'px';
          taglineTrack.appendChild(taglineEl);
        }
        el.appendChild(taglineTrack);
        builtItems.push({ el: el, isTall: isTall, promotable: promotable, ratio: piece.ratio, isLogo: isLogo, isIcon: isIcon });
        return;
      }
      if (isType && piece.img) {
        // Kinetic type specimen instead of the static "Aa123" image — same
        // two brand colors (sampled from the source image), animated, set
        // in the brand's own real typeface where that's on Google Fonts.
        el.className = 'pc-item pc-item-type';
        var colors = sampleTwoColors(piece.img);
        el.style.setProperty('--pc-c1', colors[0]);
        el.style.setProperty('--pc-c2', colors[1]);
        var slugMatch = piece.src.match(/portfolio\/([^/]+)\/type\.webp$/);
        var fonts = slugMatch && TYPE_FONT_BY_SLUG[slugMatch[1]];
        var l1 = document.createElement('span'); l1.className = 'pc-type-line'; l1.textContent = 'Aa';
        var l2 = document.createElement('span'); l2.className = 'pc-type-line'; l2.textContent = '123';
        if (fonts) {
          l1.style.fontFamily = fonts.primary;
          if (fonts.primaryWeight) l1.style.fontWeight = fonts.primaryWeight;
          l2.style.fontFamily = fonts.secondary || fonts.primary;
          if (fonts.secondaryWeight || fonts.primaryWeight) l2.style.fontWeight = fonts.secondaryWeight || fonts.primaryWeight;
        }
        el.appendChild(l1);
        el.appendChild(l2);
        builtItems.push({ el: el, isTall: isTall, promotable: promotable, ratio: piece.ratio, isLogo: isLogo, isIcon: isIcon });
        return;
      }
      el.className += 'pc-item' + (isTall ? ' pc-span2' : '') + (isLogo ? ' pc-item-logo' : '');
      var img = document.createElement('img');
      img.src = piece.src;
      img.alt = opts.alt || '';
      img.loading = 'lazy';
      el.appendChild(img);
      builtItems.push({ el: el, isTall: isTall, promotable: promotable, ratio: piece.ratio, isLogo: isLogo, isIcon: isIcon });
    });
    // Group items into column wrappers instead of relying on CSS Grid's
    // dense auto-placement: a grid column's track width is the MAX of
    // every item packed into it, so a narrow item sharing a column with a
    // wide one rendered inside a too-wide track, leaving a visible empty
    // gap next to it. A .pc-span2 item fills a column alone; two regular
    // items stack into one column together — each column is flex-sized to
    // only its own contents, so no cross-item width mismatch is possible.
    // A short item that ends up alone in a column (no partner to stack
    // with) instead of being promoted would render at half the height of
    // every other column — an oddly short, visually "incomplete" card. If
    // it's a real photo/logo/type tile (not one of the always-square
    // generated tiles), stretch it to the full 2-row height instead, so
    // every column is always a complete, full-height card.
    function promoteIfLone(item) {
      if (!item.promotable) return;
      var newHeight = colH;
      var newWidth = item.isIcon ? newHeight
        : (item.isLogo ? Math.round(newHeight * Math.max(1, Math.min(2.2, item.ratio))) : Math.round(newHeight * item.ratio));
      item.el.style.height = newHeight + 'px';
      item.el.style.width = newWidth + 'px';
    }
    /* Columnas: una imagen alta ocupa la columna entera; las demás se apilan de hasta ROWS en ROWS filas. */
    var pending = [];
    var columns = [];
    function flushPending() {
      if (!pending.length) return;
      if (pending.length === 1) promoteIfLone(pending[0]);
      columns.push(pending);
      pending = [];
    }
    builtItems.forEach(function (item) {
      if (item.isTall) { flushPending(); columns.push([item]); }
      else { pending.push(item); if (pending.length === ROWS) flushPending(); }
    });
    flushPending();
    /* Mismo ancho para las imágenes apiladas de una columna (y alturas que suman exactamente el alto de la columna): así
       no queda un hueco a la derecha de la más angosta y todos los espacios entre imágenes miden lo mismo (--pc-gap).
       Ancho común W tal que sum(W/ri) + huecos = alto de la columna; cada una conserva su proporción, sin recortes.
       Las tarjetas generadas (paleta, patrón, frase) siguen cuadradas y no se tocan. */
    columns.forEach(function (col) {
      if (col.length < 2 || !col.every(function (it) { return it.promotable; })) return;
      var ratios = col.map(function (it) { return parseFloat(it.el.style.width) / parseFloat(it.el.style.height); });
      if (!ratios.every(function (r) { return r > 0; })) return;
      var invSum = ratios.reduce(function (a, r) { return a + 1 / r; }, 0);
      var W = Math.round((colH - gap * (col.length - 1)) / invSum);
      var used = 0;
      col.forEach(function (it, k) {
        var h = k === col.length - 1 ? (colH - gap * (col.length - 1) - used) : Math.round(W / ratios[k]);
        used += h;
        it.el.style.width = W + 'px'; it.el.style.height = h + 'px';
      });
    });
    columns.forEach(function (col) {
      var colEl = document.createElement('div');
      colEl.className = 'pc-col';
      col.forEach(function (item) { colEl.appendChild(item.el); });
      container.appendChild(colEl);
    });
  }

  /* Que todas las imágenes quepan sin cortarse: render() arma la tira con el alto de fila de --pc-row-h; si la tira
     resulta más ancha que el popup, se achica ese alto (proporcional al sobrante) y se vuelve a armar, hasta 3 veces.
     El alto del contenedor sale del mismo --pc-row-h, así que el popup también se hace menos alto. Solo si ni así cabe
     (muchísimas imágenes) queda el desplazamiento horizontal de siempre. */
  /* Máximo 2 líneas: si la tira no cabe a lo ancho se achica el alto de las filas (hasta MIN_ROW_H) en vez de añadir más filas. */
  var MIN_ROW_H = 60;
  async function renderFit(container, images, opts) {
    container.style.removeProperty('--pc-row-h');
    var wrap = container.parentElement;
    await render(container, images, opts);
    var gapPx = parseFloat(getComputedStyle(container).getPropertyValue('--pc-gap')) || 16;
    for (var attempt = 0; attempt < 3; attempt++) {
      /* el contenedor crece con su contenido, así que el ancho disponible es el del marco que lo envuelve */
      var avail = (wrap ? wrap.clientWidth : container.clientWidth) - 2 * gapPx;
      var content = container.scrollWidth - 2 * gapPx;
      if (!avail || content <= avail + 1) return;
      var cur = parseFloat(getComputedStyle(container).getPropertyValue('--pc-row-h')) || 150;
      var next = Math.max(MIN_ROW_H, Math.floor(cur * avail / content) - 1);
      if (next >= cur) return;
      container.style.setProperty('--pc-row-h', next + 'px');
      await render(container, images, opts);
    }
  }
  return { render: renderFit };
})();

/* Case-study modal: click a work item or client logo for an editorial
   image collage (built by ProjectCollage above) + name, category, summary
   and tags */
(function () {
  var lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  var collageEl = document.getElementById('lightboxCollage');
  var title = document.getElementById('lightboxTitle');
  var category = document.getElementById('lightboxCategory');
  var desc = document.getElementById('lightboxDesc');
  var tagsBlock = document.getElementById('lightboxTagsBlock');
  /* Category-name → Lab mapping, mirrors servicios.html's sections */
  /* El nombre de un Lab nunca va en el lima genérico de las etiquetas: cada Lab es una submarca y su color es su identidad. */
  var LAB_LABEL_CLASS = { 'Brand & Experience Lab': 'lightbox-label-brand', 'Insight Lab': 'lightbox-label-insight' };
  var CATEGORY_TO_LAB = {
    'Experiencia digital': 'Brand & Experience Lab',
    'Crecimiento y marketing digital': 'Insight Lab'
  };
  var workEl = document.getElementById('lightboxWork');
  var workBlock = document.getElementById('lightboxWorkBlock');
  var caseBlock = document.getElementById('lightboxCase');
  var CASES = window.WOW_CASES || {};
  var CASE_FIELDS = ['reto', 'insight', 'construimos', 'resultado', 'aprendizaje'];
  /* Projects with a case study (js/cases.js, keyed by data-title) get a
     "Ver caso" badge on their card (.has-case in styles.css). */
  document.querySelectorAll('[data-lightbox]').forEach(function (el) {
    if (CASES[el.dataset.title]) el.classList.add('has-case');
  });
  var closeBtn = document.getElementById('lightboxClose');
  var lightboxFocusTrap = createFocusTrap(lightbox, function () { return lightbox.classList.contains('is-open'); });

  document.querySelectorAll('[data-lightbox]').forEach(function (el) {
    el.addEventListener('click', function () {
      var mainImg = el.dataset.img;
      var images;
      if (el.dataset.images) {
        // A project can list its own set of images as JSON, e.g.
        // data-images='["a.png","b.png",{"src":"c.png","priority":2}]'
        try { images = JSON.parse(el.dataset.images); } catch (e) { images = [mainImg]; }
      } else {
        // No per-project set: show only this project's own image instead of
        // padding the collage with unrelated projects' photos.
        images = [mainImg];
      }
      /* una card sin imágenes (aún) no muestra la tira del collage */
      images = (images || []).filter(Boolean);
      collageEl.parentNode.style.display = images.length ? '' : 'none';
      ProjectCollage.render(collageEl, images, { alt: el.dataset.title || '', phrase: el.dataset.tagline || el.dataset.desc || '' }).then(updatePcNav);

      title.textContent = el.dataset.title || '';
      category.textContent = (el.dataset.category || '').toUpperCase();
      desc.textContent = el.dataset.desc || '';
      if (el.dataset.work) {
        workEl.textContent = el.dataset.work;
        workBlock.style.display = '';
      } else {
        workBlock.style.display = 'none';
      }
      tagsBlock.innerHTML = '';
      var rawParts = (el.dataset.capabilities ? el.dataset.capabilities.split('·') : (el.dataset.desc || '').split(/,| y /i))
        .map(function (t) { return t.trim(); }).filter(Boolean);
      var labOrder = ['Brand & Experience Lab', 'Insight Lab'];
      var labMarkers = rawParts.filter(function (t) { return labOrder.indexOf(t) !== -1; });
      var categoryTags = rawParts.filter(function (t) { return labOrder.indexOf(t) === -1; });
      var groups = labMarkers.length
        ? labMarkers.slice().sort(function (a, b) { return labOrder.indexOf(a) - labOrder.indexOf(b); }).map(function (lab) {
            return { lab: lab, tags: categoryTags.filter(function (t) { return CATEGORY_TO_LAB[t] === lab; }) };
          })
        : [{ lab: null, tags: categoryTags }];
      // Per-brand capabilities from js/cases.js win over data-capabilities.
      var caseCaps = CASES[el.dataset.title] && CASES[el.dataset.title].capacidades;
      if (caseCaps) {
        groups = Object.keys(caseCaps).map(function (lab) { return { lab: lab, tags: caseCaps[lab] }; });
      }
      var caseTools = (CASES[el.dataset.title] && CASES[el.dataset.title].herramientas) ||
        (el.dataset.tools ? el.dataset.tools.split('·').map(function (t) { return t.trim(); }).filter(Boolean) : null);
      if (caseTools && caseTools.length) groups.push({ lab: 'Herramientas', tags: caseTools, isTools: true });
      groups.forEach(function (group) {
        if (group.lab === null && !group.tags.length) return;
        var groupEl = document.createElement('div');
        groupEl.className = 'lightbox-lab-group';
        if (group.isTools) groupEl.classList.add('lightbox-lab-group-tools');
        var label = document.createElement('p');
        label.className = 'lightbox-label';
        if (LAB_LABEL_CLASS[group.lab]) label.classList.add(LAB_LABEL_CLASS[group.lab]);
        label.textContent = group.lab || 'Capacidades';
        groupEl.appendChild(label);
        var tagsEl = document.createElement('div');
        tagsEl.className = 'lightbox-tags';
        group.tags.forEach(function (tag) {
          var pill = document.createElement('span');
          pill.className = 'lightbox-tag';
          pill.textContent = tag;
          tagsEl.appendChild(pill);
        });
        groupEl.appendChild(tagsEl);
        tagsBlock.appendChild(groupEl);
      });
      tagsBlock.style.display = tagsBlock.children.length ? '' : 'none';
      var cs = CASES[el.dataset.title];
      if (caseBlock) {
        caseBlock.style.display = cs ? '' : 'none';
        if (cs) {
          document.getElementById('lightboxCaseTitle').textContent = cs.titulo || '';
          CASE_FIELDS.forEach(function (f) {
            var dd = document.getElementById('lightboxCase-' + f);
            dd.textContent = cs[f] || '';
            dd.parentNode.style.display = cs[f] ? '' : 'none';
          });
        }
      }
      // The case already tells what was done — don't repeat it in "Trabajo realizado".
      if (cs) workBlock.style.display = 'none';
      lightbox.querySelector('.lightbox-inner').scrollTop = 0;
      lightbox.classList.add('is-open');
      lightboxFocusTrap.onOpen();
    });
  });
  function close() { lightbox.classList.remove('is-open'); lightboxFocusTrap.onClose(); }
  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  /* No visible scrollbar (see .project-collage in styles.css) — instead,
     getting the mouse near the collage's left/right edge auto-scrolls it in
     that direction for as long as it stays there, plus two round arrow
     buttons for an explicit click-driven option. Native touch/trackpad
     scrolling and keyboard arrows still work untouched underneath. */
  var navPrev = document.getElementById('pcNavPrev');
  var navNext = document.getElementById('pcNavNext');

  function updatePcNav() {
    var max = collageEl.scrollWidth - collageEl.clientWidth;
    navPrev.classList.toggle('is-hidden', max <= 1 || collageEl.scrollLeft <= 1);
    navNext.classList.toggle('is-hidden', max <= 1 || collageEl.scrollLeft >= max - 1);
  }
  collageEl.addEventListener('scroll', updatePcNav, { passive: true });
  window.addEventListener('resize', updatePcNav);

  navPrev.addEventListener('click', function () {
    collageEl.scrollBy({ left: -collageEl.clientWidth * 0.8, behavior: 'smooth' });
  });
  navNext.addEventListener('click', function () {
    collageEl.scrollBy({ left: collageEl.clientWidth * 0.8, behavior: 'smooth' });
  });

  var EDGE_ZONE = 90; // px from the left/right edge that counts as "near it"
  var MAX_SPEED = 16; // px/frame right at the very edge
  var edgeDir = 0; // -1 left, 0 none, 1 right
  var edgeSpeed = 0;
  var rafId = null;

  function edgeScrollTick() {
    if (edgeDir !== 0) {
      collageEl.scrollLeft += edgeDir * edgeSpeed;
      rafId = requestAnimationFrame(edgeScrollTick);
    } else {
      rafId = null;
    }
  }
  /* Bound to the wrapper (which also contains the two pc-nav buttons),
     not collageEl itself — the buttons sit visually on top of collageEl's
     edges, and binding to collageEl meant hovering a button fired collageEl's
     mouseleave (pointer now "over" the button, a sibling), stopping the
     auto-scroll right where the client most wanted it to keep going. */
  var collageWrap = collageEl.parentElement;
  collageWrap.addEventListener('mousemove', function (e) {
    var rect = collageEl.getBoundingClientRect();
    var distFromLeft = e.clientX - rect.left;
    var distFromRight = rect.right - e.clientX;
    var prevDir = edgeDir;
    if (distFromLeft < EDGE_ZONE) {
      edgeDir = -1;
      edgeSpeed = MAX_SPEED * (1 - Math.max(distFromLeft, 0) / EDGE_ZONE);
    } else if (distFromRight < EDGE_ZONE) {
      edgeDir = 1;
      edgeSpeed = MAX_SPEED * (1 - Math.max(distFromRight, 0) / EDGE_ZONE);
    } else {
      edgeDir = 0;
    }
    if (edgeDir !== 0 && prevDir === 0 && rafId === null) rafId = requestAnimationFrame(edgeScrollTick);
  });
  collageWrap.addEventListener('mouseleave', function () { edgeDir = 0; });
})();

/* Hub "W": types itself in on first view, hover reveals the full WoW logo, click opens the project form */
(function () {
  var hubCenter = document.getElementById('hubCenter');
  if (!hubCenter) return;
  var w = document.getElementById('hubW');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { w.classList.add('is-typed'); obs.disconnect(); }
      });
    }, { threshold: 0.4 });
    obs.observe(hubCenter);
  } else {
    w.classList.add('is-typed');
  }
  hubCenter.addEventListener('click', function () {
    window.openProjectForm();
  });
})();

/* Mobile nav burger is defined in js/common.js, loaded before this file. */

/* Project form modal: opens from any [data-open-form] trigger */
(function () {
  var modal = document.getElementById('projectModal');
  var closeBtn = document.getElementById('projectModalClose');
  var form = document.getElementById('projectForm');
  var thanks = document.getElementById('projectFormThanks');
  var submitBtn = document.getElementById('projectSubmitBtn');
  var formError = document.getElementById('projectFormError');
  if (!modal) return;
  var projectFormFocusTrap = createFocusTrap(modal, function () { return modal.classList.contains('is-open'); });

  // Time-trap: timestamp set when the modal opens. A submit that lands faster
  // than a human could plausibly fill the form (~2s) is treated as a bot.
  var openedAt = 0;
  var MIN_FILL_MS = 2000;

  window.openProjectForm = function (prefill) {
    form.style.display = '';
    thanks.classList.remove('is-visible');
    formError.classList.remove('is-visible');
    form.reset();
    clearFieldErrors();
    if (prefill) document.getElementById('pfDetails').value = prefill;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    projectFormFocusTrap.onOpen();
    openedAt = Date.now();
  };
  function close() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    projectFormFocusTrap.onClose();
  }
  document.querySelectorAll('[data-open-form]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      window.openProjectForm();
    });
  });
  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  function clearFieldErrors() {
    form.querySelectorAll('.project-field.has-error').forEach(function (f) { f.classList.remove('has-error'); });
  }
  function setFieldError(input) {
    var field = input.closest('.project-field');
    if (field) field.classList.add('has-error');
  }
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Real client-side validation beyond native :invalid (which renders
  // inconsistently across browsers) — trims whitespace and shows inline
  // messages next to each offending field.
  function validate() {
    clearFieldErrors();
    var ok = true;
    var emailVal = form.email.value.trim();
    form.email.value = emailVal;
    if (!emailVal || !EMAIL_RE.test(emailVal)) { setFieldError(form.email); ok = false; }
    var nameVal = form.name.value.trim();
    form.name.value = nameVal;
    if (!nameVal) { setFieldError(form.name); ok = false; }
    return ok;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    formError.classList.remove('is-visible');

    // Honeypot: a hidden field a real visitor never fills. If it has a
    // value, silently pretend success without processing anything, so a
    // bot never learns the trap tripped.
    var isBot = !!(form.website && form.website.value.trim());
    // Time-trap: submits faster than a human could reasonably fill the
    // form are treated the same way — a first-line filter only, not a
    // replacement for server-side validation once a real backend exists.
    if (openedAt && (Date.now() - openedAt) < MIN_FILL_MS) isBot = true;

    if (isBot) {
      form.style.display = 'none';
      thanks.classList.add('is-visible');
      return;
    }

    if (!validate()) return;

    // Structured payload, ready for a real submit integration once one is defined.
    var projectRequest = {
      email: form.email.value,
      name: form.name.value,
      company: form.company.value,
      need: form.need.value,
      budget: form.budget.value,
      country: form.country ? form.country.value : '',
      details: form.details.value,
      lang: document.documentElement.lang,
      page: location.pathname
    };

    // Submits to api/contact.js, which validates and saves the lead to the
    // `leads` table (reviewed from /admin — no email notification).
    var idleLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';
    fetch('/api/contact', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(projectRequest) })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.success) { form.style.display = 'none'; thanks.classList.add('is-visible'); }
        else { formError.classList.add('is-visible'); }
      })
      .catch(function () { formError.classList.add('is-visible'); })
      .finally(function () { submitBtn.disabled = false; submitBtn.textContent = idleLabel; });
  });
})();

/* Utility: how far scrolled through an element, 0 (just entering bottom) to 1 (just leaving top) */
function scrollProgress(el) {
  var rect = el.getBoundingClientRect();
  var vh = window.innerHeight;
  var total = rect.height + vh;
  var passed = vh - rect.top;
  return Math.max(0, Math.min(1, passed / total));
}

/* Utility: progress through a sticky-pinned section's pin duration specifically, 0 to 1 */
function pinProgress(outerEl) {
  var rect = outerEl.getBoundingClientRect();
  var vh = window.innerHeight;
  var pinDistance = rect.height - vh;
  if (pinDistance <= 0) return 1;
  return Math.max(0, Math.min(1, -rect.top / pinDistance));
}

/* Switches turn on progressively as you scroll through "cómo pensamos"; turning one off hides its text */
var togglePin = document.querySelector('.toggle-pin');
var toggleSection = document.querySelector('.toggle-section');
var toggleItems = toggleSection ? [].slice.call(toggleSection.querySelectorAll('.toggle-item')) : [];
toggleItems.forEach(function (item) {
  setSwitch(item.querySelector('.switch'), false);
});

var mobileTimelineQuery = window.matchMedia('(max-width: 1199px)');

function updateScrollScrubs() {
  /* re-read on every call (not cached at load) so rotating a phone or resizing across the breakpoint doesn't leave the scroll math out of sync with the CSS */
  var isMobileTimeline = mobileTimelineQuery.matches;
  if (toggleSection && toggleItems.length) {
    /* .toggle-section isn't sticky-pinned on mobile, so it can't eat extra scroll like the desktop pin does. Instead, tie progress to the section's own entry: 0 when it's just touching the bottom of the viewport, 1 once it's fully on screen (top and bottom both visible) — so the OFF→ON animation rides the same scroll that brings the section into view and is done by the time it has fully arrived, instead of requiring extra swipes once there. */
    /* la sección ya no se fija: el progreso va de 0 (su borde superior al 90 % de la altura de la pantalla) a 1 (al 30 %),
       así los switches se encienden uno tras otro mientras sube y no dependen de scroll extra */
    var toggleRect = toggleSection.getBoundingClientRect();
    var vh = window.innerHeight;
    var tProg = Math.max(0, Math.min(1, (vh * 0.9 - toggleRect.top) / (vh * 0.6)));
    var revealCount = Math.floor(tProg * (toggleItems.length + 1));
    /* the first switch is always on by default on mobile, just like the first process card */
    revealCount = Math.max(1, revealCount);
    toggleItems.forEach(function (item, i) {
      var shouldBeOn = i < revealCount;
      var btn = item.querySelector('.switch');
      /* auto-drive the switch both ways with scroll, until the user has manually touched it */
      if (!btn.dataset.userSet && shouldBeOn !== btn.classList.contains('is-on')) {
        setSwitch(btn, shouldBeOn);
      }
    });
  }
}

var scrubTicking = false;
window.addEventListener('scroll', function () {
  if (scrubTicking) return;
  scrubTicking = true;
  requestAnimationFrame(function () {
    updateScrollScrubs();
    scrubTicking = false;
  });
}, { passive: true });
window.addEventListener('resize', updateScrollScrubs);
updateScrollScrubs();


/* FAQ accordion is defined in js/common.js, loaded before this file. */


/* Resultados de Nosotros: las cifras suben desde 0 hasta su valor cuando la tarjeta entra en pantalla (una sola vez).
   Sin IntersectionObserver o con movimiento reducido se queda el valor final que ya trae el HTML. */
(function () {
  var nums = [].slice.call(document.querySelectorAll('.proof-num[data-count]'));
  if (!nums.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  nums.forEach(function (el) { el.textContent = '+0'; });
  function run(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var dur = 1500, t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = '+' + Math.round(target * e);
      if (k < 1) requestAnimationFrame(step); else el.textContent = '+' + target;
    }
    requestAnimationFrame(step);
  }
  var started = false;
  new IntersectionObserver(function (entries, obs) {
    if (started || !entries.some(function (e) { return e.isIntersecting; })) return;
    started = true;
    nums.forEach(function (el, i) { setTimeout(function () { run(el); }, i * 180); });
    obs.disconnect();
  }, { threshold: 0.4 }).observe(nums[0].closest('.nos-stats'));
})();
