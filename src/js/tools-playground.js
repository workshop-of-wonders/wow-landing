/* Herramientas del home: las pills con logo caen, rebotan y se pueden arrastrar y lanzar,
   igual que los íconos de #contacto. Matter.js se carga bajo demanda (mismo CDN + SRI que
   falling-icons.js). Sin JS / sin Matter / con reduced-motion quedan como chips estáticos. */
(function () {
  var lists = Array.prototype.slice.call(document.querySelectorAll('.wm-pills'));
  if (!lists.length) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function setup(list) {
    var M = window.Matter;
    var items = Array.prototype.slice.call(list.children);
    var w = list.clientWidth;
    /* posiciones del layout original (chips en flujo) antes de pasarlos a absolute */
    var pos = items.map(function (el) { return { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight }; });
    var flowH = list.offsetHeight;
    var h = flowH + 80;
    list.classList.add('is-live');
    list.style.height = h + 'px';

    var engine = M.Engine.create({ enableSleeping: true });
    engine.gravity.y = 0.85;
    var World = M.World, Bodies = M.Bodies;
    var bodies = items.map(function (el, i) {
      var bw = pos[i].w, bh = pos[i].h;
      var b = Bodies.rectangle(pos[i].x + bw / 2, pos[i].y + bh / 2, bw, bh, { isSleeping: true, chamfer: { radius: bh / 2 }, restitution: 0.7, friction: 0.1, frictionAir: 0.01, density: 0.002 });
      b._w = bw; b._h = bh; b._el = el;
      el.style.transform = 'translate(' + pos[i].x + 'px,' + pos[i].y + 'px)';
      return b;
    });

    var walls = [];
    function buildWalls() {
      World.remove(engine.world, walls);
      var t = 80;
      walls = [
        Bodies.rectangle(w / 2, h + t / 2, w + t * 2, t, { isStatic: true }),
        Bodies.rectangle(-t / 2, h / 2, t, h * 4, { isStatic: true }),
        Bodies.rectangle(w + t / 2, h / 2, t, h * 4, { isStatic: true })
      ];
      World.add(engine.world, walls);
    }
    buildWalls();

    var mouse = M.Mouse.create(list);
    mouse.pixelRatio = 1;
    list.removeEventListener('wheel', mouse.mousewheel);
    list.removeEventListener('mousewheel', mouse.mousewheel);
    list.removeEventListener('DOMMouseScroll', mouse.mousewheel);
    var mc = M.MouseConstraint.create(engine, { mouse: mouse, constraint: { stiffness: 0.15, render: { visible: false } } });
    World.add(engine.world, mc);
    M.Events.on(mc, 'startdrag', function (e) { e.body._el && e.body._el.classList.add('is-drag'); });
    M.Events.on(mc, 'enddrag', function (e) { e.body._el && e.body._el.classList.remove('is-drag'); });
    function release() { mc.constraint.bodyB = null; mouse.button = -1; items.forEach(function (el) { el.classList.remove('is-drag'); }); }
    ['mouseup', 'touchend', 'touchcancel', 'pointerup'].forEach(function (ev) { document.addEventListener(ev, release, { passive: true }); });
    window.addEventListener('blur', release);

    /* evita que un lanzamiento rápido atraviese las paredes laterales */
    M.Events.on(engine, 'afterUpdate', function () {
      bodies.forEach(function (b) {
        var x = Math.min(Math.max(b.position.x, b._w / 2), w - b._w / 2);
        if (x !== b.position.x) { M.Body.setPosition(b, { x: x, y: b.position.y }); M.Body.setVelocity(b, { x: b.velocity.x * 0.4, y: b.velocity.y }); }
        if (b.position.y > h + 200) { M.Body.setPosition(b, { x: b.position.x, y: -60 }); M.Body.setVelocity(b, { x: 0, y: 0 }); }
      });
    });

    World.add(engine.world, bodies);

    var running = false, raf = 0, last = 0;
    function tick(now) {
      if (!running) return;
      var dt = Math.min(32, now - (last || now)); last = now;
      M.Engine.update(engine, dt || 16);
      bodies.forEach(function (b) {
        /* se inclinan al chocar o al lanzarlas, pero un resorte las vuelve a dejar derechas */
        if (!b.isSleeping) b._touched = true;
        if (b._touched) {
          var ang = Math.atan2(Math.sin(b.angle), Math.cos(b.angle));
          if (Math.abs(ang) > 0.004 || Math.abs(b.angularVelocity) > 0.004) {
            if (b.isSleeping) M.Sleeping.set(b, false);
            if (Math.hypot(b.velocity.x, b.velocity.y) < 3 && b !== (mc.body || null)) {
              /* casi quieta: se endereza sola, siempre queda derecha al caer */
              M.Body.setAngle(b, ang * 0.82); M.Body.setAngularVelocity(b, 0);
            } else {
              M.Body.setAngularVelocity(b, b.angularVelocity + (-ang * 0.02 - b.angularVelocity * 0.15));
            }
          } else if (ang !== 0) { M.Body.setAngle(b, 0); M.Body.setAngularVelocity(b, 0); }
        }
        b._el.style.transform = 'translate(' + (b.position.x - b._w / 2) + 'px,' + (b.position.y - b._h / 2) + 'px) rotate(' + b.angle + 'rad)';
      });
      raf = requestAnimationFrame(tick);
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) {
          if (!running) { running = true; last = 0; raf = requestAnimationFrame(tick); }
        } else { running = false; cancelAnimationFrame(raf); }
      }, { threshold: 0.3 }).observe(list);
    } else { running = true; raf = requestAnimationFrame(tick); }

    window.addEventListener('resize', function () {
      w = list.clientWidth;
      buildWalls();
    });
  }

  /* espera a que carguen los logos para medir bien cada pill */
  function init() {
    if (!window.Matter) return;
    var imgs = Array.prototype.slice.call(document.querySelectorAll('.wm-pills img'));
    Promise.all(imgs.map(function (im) { return im.complete ? 0 : new Promise(function (ok) { im.onload = im.onerror = ok; }); }))
      .then(function () { lists.forEach(setup); });
  }
  var loaded = false;
  function load() {
    if (loaded) return; loaded = true;
    if (window.Matter) return init();
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/matter-js@0.19.0/build/matter.min.js';
    s.integrity = 'sha384-OqQP3UcU7efkEYDRjGmQou2uEvzGFGRtwdYXTjnupeB9cWogSgQ4BOhyklFBYbBR';
    s.crossOrigin = 'anonymous';
    s.onload = init;
    document.body.appendChild(s);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { load(); io.disconnect(); }
    }, { rootMargin: '600px 0px' });
    lists.forEach(function (l) { io.observe(l); });
  } else { load(); }
})();
