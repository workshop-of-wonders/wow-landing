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
    var h = Math.max(150, Math.min(210, Math.round(w * 0.32)));
    list.classList.add('is-live');
    list.style.height = h + 'px';

    var engine = M.Engine.create();
    engine.gravity.y = 0.85;
    var World = M.World, Bodies = M.Bodies;
    var bodies = items.map(function (el) {
      var bw = el.offsetWidth, bh = el.offsetHeight;
      var b = Bodies.rectangle(bw / 2, -100, bw, bh, { chamfer: { radius: bh / 2 }, restitution: 0.7, friction: 0.1, frictionAir: 0.01, density: 0.002 });
      b._w = bw; b._h = bh; b._el = el;
      el.style.transform = 'translate(-999px,-999px)';
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

    var dropped = false;
    function drop() {
      if (dropped) return; dropped = true;
      bodies.forEach(function (b, i) {
        M.Body.setPosition(b, { x: b._w / 2 + Math.random() * Math.max(1, w - b._w), y: -40 - Math.random() * 500 });
        M.Body.setAngle(b, (Math.random() - 0.5) * 1.2);
        M.Body.setVelocity(b, { x: (Math.random() - 0.5) * 3, y: 0 });
        setTimeout(function () { World.add(engine.world, b); }, i * 90);
      });
    }

    var running = false, raf = 0, last = 0;
    function tick(now) {
      if (!running) return;
      var dt = Math.min(32, now - (last || now)); last = now;
      M.Engine.update(engine, dt || 16);
      bodies.forEach(function (b) {
        b._el.style.transform = 'translate(' + (b.position.x - b._w / 2) + 'px,' + (b.position.y - b._h / 2) + 'px) rotate(' + b.angle + 'rad)';
      });
      raf = requestAnimationFrame(tick);
    }
    if ('IntersectionObserver' in window) {
      var seen = false;
      new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) {
          if (!seen) { seen = true; drop(); }
          if (!running) { running = true; last = 0; raf = requestAnimationFrame(tick); }
        } else { running = false; cancelAnimationFrame(raf); }
      }, { threshold: 0.3 }).observe(list);
    } else { drop(); running = true; raf = requestAnimationFrame(tick); }

    window.addEventListener('resize', function () {
      w = list.clientWidth;
      buildWalls();
    });
  }

  function init() { if (window.Matter) lists.forEach(setup); }
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
