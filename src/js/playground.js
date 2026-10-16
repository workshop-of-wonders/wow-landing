/* Playground: hub de herramientas.
   Base (sin JS / con "reducir movimiento" / sin Matter): cuadrícula de tarjetas filtrable por objetivo o servicio (?servicio=seo).
   Easter egg (solo con ?patio=1): la cuadrícula se convierte en un patio de juegos: cada herramienta es un juguete que cae, rebota, se arrastra y se lanza;
   un toque lo abre. Matter.js se carga bajo demanda (mismo CDN + SRI que tools-playground.js). */
(function () {
  var grid = document.getElementById('pgGrid');
  if (!grid) return;
  var NAMES = { 'diseno-web': 'Diseño web', 'ecommerce': 'Tiendas virtuales', 'diseno-grafico': 'Diseño gráfico', 'seo': 'SEO, GEO y AEO', 'seo-local': 'Google My Business', 'pauta-digital': 'Pauta digital', 'configuracion-analitica-tracking': 'Analítica y tracking', 'analitica-de-datos': 'Dashboards y datos' };
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.pg-card'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('.pg-chip'));
  var count = document.getElementById('pgCount');
  var svc = '';
  try { svc = new URLSearchParams(location.search).get('servicio') || ''; } catch (e) {}
  if (!NAMES[svc]) svc = '';
  if (svc) {
    document.getElementById('pgSvcName').textContent = 'Playground de ' + NAMES[svc] + '.';
    document.getElementById('pgSvc').hidden = false;
    document.getElementById('pgTitle').textContent = 'Juguetes de ' + NAMES[svc];
    document.querySelector('.pg-chips').hidden = true;
  }
  chips.forEach(function (b) {
    var n = b.querySelector('.pg-chip-n'), f = b.getAttribute('data-f');
    if (n) { var k = cards.filter(function (c) { return c.getAttribute('data-need') === f; }).length; n.textContent = k + (k === 1 ? ' herramienta' : ' herramientas'); }
  });
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function track(name, params) { if (window.gtag) window.gtag('event', name, params || {}); }

  var onFilter = null;                       /* lo reemplaza el patio cuando arranca */
  function setCount(n) { count.textContent = n + (n === 1 ? ' herramienta' : ' herramientas'); }
  function applyGrid(f) {
    var rec = document.getElementById('pgRec'); if (rec) rec.hidden = !!svc || f !== 'todos';
    var n = 0;
    cards.forEach(function (c) {
      var show = svc ? c.getAttribute('data-svc') === svc : (f === 'todos' || c.getAttribute('data-need') === f);
      c.hidden = !show;
      if (show) n++;
    });
    setCount(n);
  }
  function apply(f) {
    chips.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-f') === f ? 'true' : 'false'); });
    (onFilter || applyGrid)(f);
    track('playground_filter', { filter: svc || f });
  }
  chips.forEach(function (b) { b.addEventListener('click', function () { apply(b.getAttribute('data-f')); }); });
  apply('todos');
  grid.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (a) track('playground_tool_click', { tool: a.getAttribute('href') });
  });

  /* El patio con física ya no es la vista principal: queda como easter egg en playground.html?patio=1 */
  if (!/[?&]patio(=|&|$)/.test(location.search)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var ICON = {
    vender: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>',
    encontrar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/></svg>',
    datos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 20V11M12 20V5M19 20v-7"/></svg>',
    marca: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z"/></svg>'
  };

  function setup(M) {
    var sec = document.getElementById('herramientas');
    var items = cards.filter(function (c) { return !svc || c.getAttribute('data-svc') === svc; }).map(function (c) {
      return { href: c.querySelector('a.hb-go').getAttribute('href'), short: c.getAttribute('data-short') || c.querySelector('h3').textContent, title: c.querySelector('h3').textContent, desc: c.querySelector('p').textContent, tag: c.querySelector('.pg-tag').textContent, need: c.getAttribute('data-need') };
    });
    if (!items.length) return;

    var board = el('div', 'pg-board'); board.id = 'pgBoard'; board.setAttribute('role', 'group'); board.setAttribute('aria-label', 'Patio de herramientas');
    var tip = el('div', 'pg-tip'); tip.hidden = true;
    var tools = el('div', 'pg-tools');
    var hint = el('p', 'pg-hint', 'Agarra un juguete y lánzalo · tócalo para jugar');
    var bShake = el('button', 'pg-act', 'Sacude el patio'); bShake.type = 'button';
    var bSurp = el('button', 'pg-act', 'Sorpréndeme'); bSurp.type = 'button';
    tools.appendChild(bShake); tools.appendChild(bSurp); tools.appendChild(hint);
    grid.parentNode.insertBefore(tools, grid); grid.parentNode.insertBefore(board, grid);
    board.appendChild(tip);
    sec.classList.add('pg-on');

    var W = board.clientWidth, small = W < 600, k = small ? 0.8 : 1, fill = small ? 0.8 : 0.9;
    var specs = items.map(function (it) { var n = it.short.length, s = n <= 15 ? [150, 104] : n <= 21 ? [180, 112] : [214, 120]; return [Math.round(s[0] * k), Math.round(s[1] * k)]; });
    function boardH() { var a = specs.reduce(function (t, s) { return t + (s[0] + 16) * (s[1] + 16); }, 0); return Math.max(small ? 560 : 460, Math.ceil(a / (W * fill)) + 40); }
    var H = boardH();
    board.style.height = H + 'px';

    var engine = M.Engine.create({ enableSleeping: true });
    engine.gravity.y = 1;
    var World = M.World, Bodies = M.Bodies, walls = [];
    function buildWalls() {
      World.remove(engine.world, walls);
      var t = 120;
      walls = [
        Bodies.rectangle(W / 2, H + t / 2, W + t * 2, t, { isStatic: true }),
        Bodies.rectangle(W / 2, -900, W + t * 2, t, { isStatic: true }),
        Bodies.rectangle(-t / 2, H / 2 - 400, t, H * 2 + 1800, { isStatic: true }),
        Bodies.rectangle(W + t / 2, H / 2 - 400, t, H * 2 + 1800, { isStatic: true })
      ];
      World.add(engine.world, walls);
    }
    buildWalls();

    var toys = items.map(function (it, i) {
      var a = el('a', 'pg-toy pg-n-' + it.need + ' pg-r' + (i % 3));
      a.href = it.href; a.draggable = false; a.setAttribute('aria-label', it.title + ' (' + it.tag + ')');
      var ic = el('span', 'pg-ti'); ic.innerHTML = ICON[it.need] || ICON.marca; ic.setAttribute('aria-hidden', 'true');
      a.appendChild(ic); a.appendChild(el('b', null, it.short)); a.appendChild(el('small', null, it.tag));
      a.style.width = specs[i][0] + 'px'; a.style.height = specs[i][1] + 'px';
      board.appendChild(a);
      var b = Bodies.rectangle(-500, -500, specs[i][0], specs[i][1], { chamfer: { radius: 22 }, restitution: 0.55, friction: 0.25, frictionAir: 0.012, density: 0.002, slop: 0.05 });
      b._w = specs[i][0]; b._h = specs[i][1]; b._el = a; b._it = it; b._in = false; a._b = b;
      return b;
    });

    /* entrada: los juguetes caen uno tras otro desde arriba */
    toys.forEach(function (b, i) {
      setTimeout(function () {
        M.Body.setPosition(b, { x: 80 + Math.random() * Math.max(1, W - 160), y: -b._h - Math.random() * 60 });
        M.Body.setAngle(b, (Math.random() - 0.5) * 1.1);
        M.Body.setVelocity(b, { x: (Math.random() - 0.5) * 4, y: 2 });
        World.add(engine.world, b); b._in = true; b._el.classList.add('is-in');
      }, 160 + i * 120);
    });

    /* arrastre y lanzamiento (propio: el scroll del celular sigue funcionando fuera de los juguetes) */
    var drag = null;
    function local(e) { var r = board.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    board.addEventListener('pointerdown', function (e) {
      var a = e.target.closest && e.target.closest('.pg-toy');
      if (!a || !a._b || a.classList.contains('is-dim') || (e.pointerType === 'mouse' && e.button !== 0)) return;
      var b = a._b, p = local(e);
      M.Sleeping.set(b, false);
      var c = M.Constraint.create({ pointA: { x: p.x, y: p.y }, bodyB: b, pointB: { x: p.x - b.position.x, y: p.y - b.position.y }, stiffness: 0.14, damping: 0.08, length: 0 });
      World.add(engine.world, c);
      drag = { a: a, b: b, c: c, id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false };
      a.classList.add('is-drag'); hideTip();
      try { a.setPointerCapture(e.pointerId); } catch (err) {}
    });
    board.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var p = local(e); drag.c.pointA.x = p.x; drag.c.pointA.y = p.y;
      if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 6) drag.moved = true;
    });
    function endDrag(e) {
      if (!drag || e.pointerId !== drag.id) return;
      World.remove(engine.world, drag.c);
      drag.a.classList.remove('is-drag'); drag.a._wasDrag = drag.moved;
      if (drag.moved) track('playground_toy_throw', { tool: drag.b._it.href });
      drag = null;
    }
    board.addEventListener('pointerup', endDrag); board.addEventListener('pointercancel', endDrag);
    board.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('.pg-toy');
      if (a && a._wasDrag) { e.preventDefault(); e.stopPropagation(); a._wasDrag = false; }
    }, true);

    /* globo con la descripción al pasar el cursor o al enfocar con teclado */
    var tipFor = null;
    function showTip(a) {
      if (drag || !a._b) return;
      tipFor = a._b; tip.textContent = '';
      tip.appendChild(el('b', null, a._b._it.title)); tip.appendChild(document.createTextNode(a._b._it.desc));
      tip.hidden = false;
    }
    function hideTip() { tipFor = null; tip.hidden = true; }
    board.addEventListener('pointerover', function (e) { var a = e.target.closest && e.target.closest('.pg-toy'); if (a && e.pointerType === 'mouse') showTip(a); });
    board.addEventListener('pointerout', function (e) { var a = e.target.closest && e.target.closest('.pg-toy'); if (a && !a.contains(e.relatedTarget)) hideTip(); });
    board.addEventListener('focusin', function (e) { var a = e.target.closest && e.target.closest('.pg-toy'); if (a) showTip(a); });
    board.addEventListener('focusout', hideTip);

    /* filtro: los juguetes que no coinciden se apagan y dejan de estorbar; los que coinciden saltan */
    onFilter = function (f) {
      var n = 0;
      toys.forEach(function (b) {
        var on = f === 'todos' || b._it.need === f;
        b._el.classList.toggle('is-dim', !on); b.isSensor = !on;
        if (on) { n++; if (f !== 'todos' && b._in) { M.Sleeping.set(b, false); M.Body.setVelocity(b, { x: (Math.random() - 0.5) * 6, y: -9 - Math.random() * 5 }); M.Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.12); } }
        else M.Sleeping.set(b, false);
      });
      setCount(n);
    };
    onFilter(chips.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return b.getAttribute('data-f'); })[0] || 'todos');

    bShake.addEventListener('click', function () {
      toys.forEach(function (b) { if (!b._in) return; M.Sleeping.set(b, false); M.Body.setVelocity(b, { x: (Math.random() - 0.5) * 26, y: -(10 + Math.random() * 16) }); M.Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.3); });
      track('playground_shake');
    });
    bSurp.addEventListener('click', function () {
      var live = toys.filter(function (b) { return b._in && !b._el.classList.contains('is-dim'); });
      if (!live.length) return;
      var b = live[Math.floor(Math.random() * live.length)];
      M.Sleeping.set(b, false); M.Body.setVelocity(b, { x: 0, y: -18 }); b._el.classList.add('is-pick');
      track('playground_surprise', { tool: b._it.href });
      setTimeout(function () { location.href = b._it.href; }, 900);
    });

    function clampAndPaint() {
      toys.forEach(function (b) {
        if (!b._in) return;
        var hw = b._w / 2, hh = b._h / 2;
        var x = Math.min(Math.max(b.position.x, hw), W - hw), y = Math.min(b.position.y, H - hh);
        if (x !== b.position.x || y !== b.position.y) {
          var vx = b.velocity.x, vy = b.velocity.y;
          M.Body.setPosition(b, { x: x, y: y });
          M.Body.setVelocity(b, { x: x !== b.position.x ? -vx * 0.6 : vx, y: y !== b.position.y ? -vy * 0.5 : vy });
        }
        var sp = Math.hypot(b.velocity.x, b.velocity.y);
        if (sp > 38) M.Body.setVelocity(b, { x: b.velocity.x * 38 / sp, y: b.velocity.y * 38 / sp });
        var av = b.angularVelocity * 0.985; M.Body.setAngularVelocity(b, Math.max(-0.14, Math.min(0.14, av)));
        b._el.style.transform = 'translate(' + (b.position.x - hw) + 'px,' + (b.position.y - hh) + 'px) rotate(' + b.angle + 'rad)';
      });
      if (tipFor) {
        var tw = tip.offsetWidth, th = tip.offsetHeight;
        var tx = Math.min(Math.max(tipFor.position.x - tw / 2, 8), W - tw - 8), ty = tipFor.position.y - tipFor._h / 2 - th - 12;
        if (ty < 8) ty = Math.min(tipFor.position.y + tipFor._h / 2 + 12, H - th - 8);
        tip.style.transform = 'translate(' + tx + 'px,' + ty + 'px)';
      }
    }

    var running = false, raf = 0, last = 0;
    function tick(now) {
      if (!running) return;
      var dt = Math.min(32, now - (last || now)); last = now;
      M.Engine.update(engine, dt || 16);
      clampAndPaint();
      raf = requestAnimationFrame(tick);
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { if (!running) { running = true; last = 0; raf = requestAnimationFrame(tick); } }
        else { running = false; cancelAnimationFrame(raf); }
      }, { threshold: 0.1 }).observe(board);
    } else { running = true; raf = requestAnimationFrame(tick); }

    var rw = W;
    window.addEventListener('resize', function () {
      var nw = board.clientWidth;
      if (Math.abs(nw - rw) < 24) return;
      rw = nw; W = nw; small = W < 600; H = boardH(); board.style.height = H + 'px'; buildWalls();
      toys.forEach(function (b) { if (b._in) M.Sleeping.set(b, false); });
    });
  }

  var loaded = false;
  function load() {
    if (loaded) return; loaded = true;
    if (window.Matter) return setup(window.Matter);
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/matter-js@0.19.0/build/matter.min.js';
    s.integrity = 'sha384-OqQP3UcU7efkEYDRjGmQou2uEvzGFGRtwdYXTjnupeB9cWogSgQ4BOhyklFBYbBR';
    s.crossOrigin = 'anonymous';
    s.onload = function () { if (window.Matter) setup(window.Matter); };
    document.body.appendChild(s);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { load(); io.disconnect(); } }, { rootMargin: '500px 0px' });
    io.observe(grid);
  } else { load(); }
})();
