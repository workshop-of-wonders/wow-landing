/* Herramientas del home: las pills flotan y se pueden arrastrar y lanzar.
   Matter.js se carga bajo demanda (mismo CDN + SRI que falling-icons.js) cuando
   la sección se acerca al viewport. Sin JS / sin Matter / con reduced-motion
   quedan como chips estáticos (el <ul> original). */
(function () {
  var list = document.getElementById('toolsPills');
  if (!list) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function init() {
    var M = window.Matter;
    if (!M) return;
    var items = Array.prototype.slice.call(list.children);
    var hint = list.parentNode.querySelector('.wm-pills-hint');
    var w = list.clientWidth;
    var h = Math.max(280, Math.min(380, Math.round(w * 0.5)));
    list.classList.add('is-live');
    list.style.height = h + 'px';
    if (hint) hint.hidden = false;

    var engine = M.Engine.create();
    engine.gravity.x = 0; engine.gravity.y = 0;
    var World = M.World, Bodies = M.Bodies;

    var bodies = items.map(function (el, i) {
      el.style.position = 'absolute'; el.style.left = '0'; el.style.top = '0';
      var bw = el.offsetWidth, bh = el.offsetHeight;
      var b = Bodies.rectangle(
        bw / 2 + Math.random() * Math.max(1, w - bw),
        bh / 2 + Math.random() * Math.max(1, h - bh),
        bw, bh,
        { chamfer: { radius: bh / 2 }, restitution: 0.85, friction: 0.05, frictionAir: 0.02, density: 0.002 }
      );
      b._w = bw; b._h = bh; b._el = el;
      M.Body.setVelocity(b, { x: (Math.random() - 0.5) * 2.4, y: (Math.random() - 0.5) * 2.4 });
      M.Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.01);
      return b;
    });
    World.add(engine.world, bodies);

    var walls = [];
    function buildWalls() {
      World.remove(engine.world, walls);
      var t = 80;
      walls = [
        Bodies.rectangle(w / 2, -t / 2, w + t * 2, t, { isStatic: true }),
        Bodies.rectangle(w / 2, h + t / 2, w + t * 2, t, { isStatic: true }),
        Bodies.rectangle(-t / 2, h / 2, t, h * 3, { isStatic: true }),
        Bodies.rectangle(w + t / 2, h / 2, t, h * 3, { isStatic: true })
      ];
      World.add(engine.world, walls);
    }
    buildWalls();

    var mouse = M.Mouse.create(list);
    /* Matter engancha wheel en el mouse: lo soltamos para no bloquear el scroll de la página */
    list.removeEventListener('wheel', mouse.mousewheel);
    list.removeEventListener('mousewheel', mouse.mousewheel);
    list.removeEventListener('DOMMouseScroll', mouse.mousewheel);
    var mc = M.MouseConstraint.create(engine, { mouse: mouse, constraint: { stiffness: 0.12, render: { visible: false } } });
    World.add(engine.world, mc);
    M.Events.on(mc, 'startdrag', function (e) { e.body._el.classList.add('is-drag'); });
    M.Events.on(mc, 'enddrag', function (e) { e.body._el.classList.remove('is-drag'); });
    /* Touch: deja el scroll vertical salvo que el dedo esté sobre una pill */
    list.addEventListener('touchstart', function (e) {
      var t = e.target.closest && e.target.closest('li');
      if (!t) list.style.touchAction = 'pan-y';
    }, { passive: true });

    var running = false, raf = 0, last = 0;
    function tick(now) {
      if (!running) return;
      var dt = Math.min(32, now - (last || now)); last = now;
      /* deriva suave: si una pill se frena, le damos un empujoncito para que siga flotando */
      bodies.forEach(function (b) {
        var sp = Math.hypot(b.velocity.x, b.velocity.y);
        if (sp < 0.35 && b !== mc.body) {
          M.Body.applyForce(b, b.position, { x: (Math.random() - 0.5) * 0.0004, y: (Math.random() - 0.5) * 0.0004 });
        }
        b._el.style.transform = 'translate(' + (b.position.x - b._w / 2) + 'px,' + (b.position.y - b._h / 2) + 'px) rotate(' + b.angle + 'rad)';
      });
      M.Engine.update(engine, dt || 16);
      raf = requestAnimationFrame(tick);
    }
    function start() { if (!running) { running = true; last = 0; raf = requestAnimationFrame(tick); } }
    function stop() { running = false; cancelAnimationFrame(raf); }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { es[0].isIntersecting ? start() : stop(); }).observe(list);
    } else { start(); }

    window.addEventListener('resize', function () {
      w = list.clientWidth;
      buildWalls();
      bodies.forEach(function (b) {
        if (b.position.x > w - b._w / 2) M.Body.setPosition(b, { x: Math.max(b._w / 2, w - b._w / 2), y: b.position.y });
      });
    });
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
    io.observe(list);
  } else { load(); }
})();
